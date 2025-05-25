const { db } = require('../data/db.js');

// Formatea fecha a "yyyy-mm-dd HH:MM"
function formatDateForGantt(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d)) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// Valida que el parent exista (cualquier tarea puede ser parent ahora)
function checkParentExists(parentId) {
  return new Promise((resolve, reject) => {
    if (!parentId || parentId === 0) return resolve(false);
    db.get('SELECT id FROM tareas WHERE id = ?', [parentId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

// OBTENER SUBTAREAS (hijos) DE CUALQUIER TAREA
exports.getSubTasksByParent = (req, res) => {
  const parentId = parseInt(req.params.parentId, 10);
  if (isNaN(parentId)) return res.status(400).json({ error: 'parentId inválido' });

  db.all('SELECT * FROM tareas WHERE parent = ?', [parentId], (err, rows) => {
    if (err) {
      console.error('Error leyendo subtareas:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const ganttSubTasks = rows.map(t => ({
      id: t.id,
      text: t.title,
      start_date: formatDateForGantt(t.start_date) || formatDateForGantt(new Date()),
      duration: t.duration || 1,
      progress: t.progress || 0,
      parent: t.parent,
      type: t.type || 'task'
    }));

    res.json({ data: ganttSubTasks });
  });
};

// CREAR TAREA (principal o subtarea anidada)
exports.createSubTask = async (req, res) => {
  let { text, start_date, duration, progress, parent, type } = req.body;

  if (!text || !start_date || !duration) {
    return res.status(400).json({ error: 'Faltan campos requeridos (text, start_date, duration)' });
  }

  const formattedStartDate = formatDateForGantt(start_date);
  if (!formattedStartDate) {
    return res.status(400).json({ error: 'start_date inválida' });
  }

  try {
    // Si parent está definido, verificar que exista
    if (parent !== null && parent !== 0 && typeof parent !== 'undefined') {
      if (typeof parent !== 'number') {
        return res.status(400).json({ error: 'parent debe ser un número' });
      }

      const parentExists = await checkParentExists(parent);
      if (!parentExists) {
        return res.status(400).json({ error: 'El parent indicado no existe' });
      }
    }

    type = type || 'task';

    db.run(
      `INSERT INTO tareas (title, start_date, duration, progress, parent, type) VALUES (?, ?, ?, ?, ?, ?)`,
      [text, formattedStartDate, duration, progress || 0, parent || 0, type],
      function (err) {
        if (err) {
          console.error('Error creando tarea:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          id: this.lastID,
          text,
          start_date: formattedStartDate,
          duration,
          progress: progress || 0,
          parent: parent || 0,
          type
        });
      }
    );
  } catch (err) {
    console.error('Error validando parent:', err.message);
    res.status(500).json({ error: 'Error validando parent' });
  }
};

// ACTUALIZAR TAREA
exports.updateSubTask = async (req, res) => {
  const { id } = req.params;
  let { text, start_date, duration, progress, type, parent } = req.body;

  if (!text || !start_date || !duration || typeof parent === 'undefined') {
    return res.status(400).json({ error: 'Faltan campos requeridos (text, start_date, duration, parent)' });
  }

  const formattedStartDate = formatDateForGantt(start_date);
  if (!formattedStartDate) {
    return res.status(400).json({ error: 'start_date inválida' });
  }

  if (parent !== null && parent !== 0) {
    if (typeof parent !== 'number') {
      return res.status(400).json({ error: 'parent debe ser un número' });
    }

    const parentExists = await checkParentExists(parent);
    if (!parentExists) {
      return res.status(400).json({ error: 'El parent indicado no existe' });
    }
  }

  db.run(
    `UPDATE tareas SET title = ?, start_date = ?, duration = ?, progress = ?, type = ?, parent = ? WHERE id = ?`,
    [text, formattedStartDate, duration, progress || 0, type || 'task', parent || 0, id],
    function (err) {
      if (err) {
        console.error('Error actualizando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ message: 'Tarea actualizada' });
    }
  );
};

// ELIMINAR TAREA (subtarea o principal)
exports.deleteSubTask = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM tareas WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Error eliminando tarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  });
};
