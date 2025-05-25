import React, { useEffect, useRef } from 'react';
import gantt from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001/api'
  : 'https://prueba-tecnica-dhtmlx.onrender.com/api';

const GanttTareas = () => {
  const ganttContainer = useRef(null);
  const eventIds = useRef([]);

  useEffect(() => {
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    gantt.init(ganttContainer.current);
    cargarTareas();
    configurarEventos();

    const currentEventIds = eventIds.current;
    return () => {
      gantt.clearAll();
      currentEventIds.forEach(id => gantt.detachEvent(id));
    };
  }, []);

  const cargarTareas = async () => {
    try {
      const resTareas = await fetch(`${API_URL}/tareas`);
      const tareas = await resTareas.json();
      const todasLasTareas = [...tareas.data];

      // Función recursiva para obtener subtareas de cualquier nivel
      const cargarSubtareasRecursivas = async (tareasPadre) => {
        for (const tarea of tareasPadre) {
          const resSub = await fetch(`${API_URL}/tareas/${tarea.id}/subtareas`);
          const dataSub = await resSub.json();
          if (dataSub.data && dataSub.data.length > 0) {
            todasLasTareas.push(...dataSub.data);
            await cargarSubtareasRecursivas(dataSub.data);
          }
        }
      };

      await cargarSubtareasRecursivas(tareas.data);

      gantt.parse({ data: todasLasTareas });
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
    }
  };

  const configurarEventos = () => {
    const onAddId = gantt.attachEvent('onAfterTaskAdd', async (id, task) => {
      try {
        const isSubtask = task.parent && task.parent !== 0;

        const url = isSubtask
          ? `${API_URL}/tareas/${task.parent}/subtareas`
          : `${API_URL}/tareas`;

        const body = {
          text: task.text || task.title,
          start_date: task.start_date,
          duration: task.duration,
          progress: task.progress,
          type: task.type || (isSubtask ? 'subtask' : 'task')
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (data && data.id) {
          gantt.changeTaskId(id, data.id);
        } else {
          task.skipBackendDelete = true;
          gantt.deleteTask(id);
          console.error('No se recibió ID al crear tarea:', data);
        }
      } catch (err) {
        task.skipBackendDelete = true;
        gantt.deleteTask(id);
        console.error('Error al crear tarea:', err);
      }
    });
    eventIds.current.push(onAddId);

    const onUpdateId = gantt.attachEvent('onAfterTaskUpdate', async (id, task) => {
      try {
        const isSubtask = task.parent && task.parent !== 0;

        const url = isSubtask
          ? `${API_URL}/subtareas/${id}`
          : `${API_URL}/tareas/${id}`;

        const body = {
          text: task.text || task.title,
          start_date: task.start_date,
          duration: task.duration,
          progress: task.progress,
          parent: isSubtask ? task.parent : 0,
          type: task.type || (isSubtask ? 'subtask' : 'task')
        };

        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.error('Error al actualizar tarea:', error);
      }
    });
    eventIds.current.push(onUpdateId);

    const onDeleteId = gantt.attachEvent('onAfterTaskDelete', async (id, task) => {
      try {
        if (task.skipBackendDelete) return;

        const isSubtask = task && task.parent && task.parent !== 0;

        const url = isSubtask
          ? `${API_URL}/subtareas/${id}`
          : `${API_URL}/tareas/${id}`;

        await fetch(url, { method: 'DELETE' });
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    });
    eventIds.current.push(onDeleteId);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Gantt de Tareas</h2>
      <div ref={ganttContainer} style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default GanttTareas;
