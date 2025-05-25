const { db } = require('../data/db.js');

// OBTENER TODAS LAS TAREAS
exports.getAllTasks = (req, res) => {
  db.all('SELECT * FROM tareas', [], (err, rows) => {
    if (err) {
      console.error('Error leyendo tareas:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// CREAR NUEVA TAREA
exports.createTask = (req, res) => {
  const { title, description, due_date, status, parent_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  // Aquí podrías validar status si quieres:
  const validStatuses = ['pendiente', 'completada', 'en progreso'];
  const taskStatus = validStatuses.includes(status) ? status : 'pendiente';

  db.run(
    `INSERT INTO tareas (title, description, due_date, status, parent_id) VALUES (?, ?, ?, ?, ?)`,
    [title, description || '', due_date || null, taskStatus, parent_id || null],
    function (err) {
      if (err) {
        console.error('Error creando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description: description || '',
        due_date: due_date || null,
        status: taskStatus,
        parent_id: parent_id || null,
      });
    }
  );
};

// BUSCAR TAREA POR ID
exports.getTaskById = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM tareas WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error buscando tarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(row);
  });
};

// EDITAR TAREA
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status, parent_id } = req.body;

  db.run(
    `UPDATE tareas SET title = ?, description = ?, due_date = ?, status = ?, parent_id = ? WHERE id = ?`,
    [title, description, due_date, status, parent_id, id],
    function (err) {
      if (err) {
        console.error('Error actualizando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ message: 'Tarea actualizada correctamente' });
    }
  );
};

// ELIMINAR TAREA 
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tareas WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error eliminando tarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada correctamente' });
  });
};
