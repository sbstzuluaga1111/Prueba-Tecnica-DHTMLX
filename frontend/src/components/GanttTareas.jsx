import React, { useEffect, useRef } from 'react';
import "../App.css"
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
    cargarDatosGantt();
    configurarEventos();

    const eventos = eventIds.current;
    return () => {
      gantt.clearAll();
      eventos.forEach(id => gantt.detachEvent(id));
    };
  }, []);

  const cargarDatosGantt = async () => {
    try {
      const resTareas = await fetch(`${API_URL}/tareas`);
      const tareas = await resTareas.json();
      const todasLasTareas = [...tareas.data];

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

      const resLinks = await fetch(`${API_URL}/links`);
      const linksData = await resLinks.json();
      const links = linksData.data || [];

      gantt.parse({
        data: todasLasTareas,
        links: links
      });
    } catch (error) {
      console.error('Error al cargar las tareas o links:', error);
    }
  };

  const configurarEventos = () => {
    // Crear tarea
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

    // Actualizar tarea
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

    // Eliminar tarea
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

    // Crear link
    const onLinkAddId = gantt.attachEvent('onAfterLinkAdd', async (id, link) => {
      try {
        const body = {
          source: link.source,
          target: link.target,
          type: link.type,
        };
        const res = await fetch(`${API_URL}/links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (data && data.id) {
          gantt.changeLinkId(id, data.id);
        } else {
          gantt.deleteLink(id);
          console.error('No se recibió ID al crear link:', data);
        }
      } catch (error) {
        gantt.deleteLink(id);
        console.error('Error al crear link:', error);
      }
    });
    eventIds.current.push(onLinkAddId);

    // Actualizar link
    const onLinkUpdateId = gantt.attachEvent('onAfterLinkUpdate', async (id, link) => {
      try {
        const body = {
          source: link.source,
          target: link.target,
          type: link.type,
        };
        await fetch(`${API_URL}/links/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.error('Error al actualizar link:', error);
      }
    });
    eventIds.current.push(onLinkUpdateId);

    // Eliminar link
    const onLinkDeleteId = gantt.attachEvent('onAfterLinkDelete', async (id) => {
      try {
        await fetch(`${API_URL}/links/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error al eliminar link:', error);
      }
    });
    eventIds.current.push(onLinkDeleteId);
  };

  return (
    <div>
      <h2 className='Text' style={{ marginBottom: '1rem' }}>Gantt de Tareas</h2>
      <div ref={ganttContainer} style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default GanttTareas;
