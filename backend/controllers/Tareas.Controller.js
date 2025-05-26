const { db } = require('../data/db.js');

// FORMATO DE FECHA
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

// Valida existencia de parent (o si es null/0)
function checkParentExists(parentId) {
  return new Promise((resolve, reject) => {
    if (!parentId || parentId === 0) return resolve(true);
    db.get('SELECT id FROM tareas WHERE id = ?', [parentId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

// OBTENER TODAS LAS TAREAS PRINCIPALES (parent = 0 o null)
exports.getAllTasks = (req, res) => {
  db.all('SELECT * FROM tareas WHERE parent = 0 OR parent IS NULL', [], (err, rows) => {
    if (err) {
      console.error('Error leyendo tareas:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const ganttTasks = rows.map(t => ({
      id: t.id,
      text: t.title,
      start_date: formatDateForGantt(t.start_date) || formatDateForGantt(new Date()),
      duration: t.duration || 1,
      progress: t.progress || 0,
      parent: 0,
      type: t.type || 'task'
    }));

    res.json({ data: ganttTasks });
  });
};

// CREAR NUEVA TAREA PRINCIPAL
exports.createTask = async (req, res) => {
  let { text, start_date, duration, progress, parent, type } = req.body;

  if (!text || !start_date || !duration) {
    return res.status(400).json({ error: 'Faltan campos requeridos (text, start_date, duration)' });
  }

  const formattedStartDate = formatDateForGantt(start_date);
  if (!formattedStartDate) {
    return res.status(400).json({ error: 'start_date inválida' });
  }

  try {
    // Para tareas principales parent siempre es 0 o null
    parent = null;
    type = type || 'task';

    db.run(
      `INSERT INTO tareas (title, start_date, duration, progress, parent, type) VALUES (?, ?, ?, ?, ?, ?)`,
      [text, formattedStartDate, duration, progress || 0, parent, type],
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
          parent: 0,
          type
        });
      }
    );
  } catch (err) {
    console.error('Error validando parent:', err.message);
    res.status(500).json({ error: 'Error validando parent' });
  }
};

// ACTUALIZAR TAREA PRINCIPAL
exports.updateTask = (req, res) => {
  const { id } = req.params;
  let { text, start_date, duration, progress, type } = req.body;

  if (!text || !start_date || !duration) {
    return res.status(400).json({ error: 'Faltan campos requeridos (text, start_date, duration)' });
  }

  const formattedStartDate = formatDateForGantt(start_date);
  if (!formattedStartDate) {
    return res.status(400).json({ error: 'start_date inválida' });
  }

  db.run(
    `UPDATE tareas SET title = ?, start_date = ?, duration = ?, progress = ?, type = ? WHERE id = ? AND (parent = 0 OR parent IS NULL)`,
    [text, formattedStartDate, duration, progress || 0, type || 'task', id],
    function (err) {
      if (err) {
        console.error('Error actualizando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada o no es tarea principal' });
      }
      res.json({ message: 'Tarea actualizada' });
    }
  );
};

// ELIMINAR TAREA PRINCIPAL (y subtareas con ON DELETE CASCADE)
exports.deleteTask = (req, res) => {
  const { id } = req.params;
  db.run(
    `DELETE FROM tareas WHERE id = ? AND (parent = 0 OR parent IS NULL)`,
    [id],
    function (err) {
      if (err) {
        console.error('Error eliminando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada o no es tarea principal' });
      }
      res.json({ message: 'Tarea eliminada' });
    }
  );
};
