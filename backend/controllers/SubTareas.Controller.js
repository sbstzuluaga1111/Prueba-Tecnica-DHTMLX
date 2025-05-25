const { db } = require('../data/db.js');

// OBTENER TODAS LAS SUBTAREAS ASOCIADAS A UNA TAREA
exports.getSubtasksByTaskId = (req, res) => {
  const { taskId } = req.params;

  const sql = `SELECT * FROM subTareas WHERE task_id = ?`;
  db.all(sql, [taskId], (err, rows) => {
    if (err) {
      console.error('Error obteniendo subTareas:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// OBTENER TODAS LAS SUBTAREAS SIN TAREA ASIGNADA (HUÉRFANAS)
exports.getUnassignedSubtasks = (req, res) => {
  const sql = `SELECT * FROM subTareas WHERE task_id IS NULL`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo subtareas sin asignar:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// CREAR SUBTAREA ASOCIADA A UNA TAREA
exports.createSubtask = (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  db.get('SELECT id FROM tareas WHERE id = ?', [taskId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar tarea padre' });
    }

    if (!row) {
      return res.status(400).json({ error: `La tarea con ID ${taskId} no existe` });
    }

    db.run(`
      INSERT INTO subTareas (task_id, title, description)
      VALUES (?, ?, ?)
    `, [taskId, title, description], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear subtarea' });
      }

      res.status(201).json({ message: 'Subtarea creada', subTareaId: this.lastID });
    });
  });
};

// ACTUALIZAR SUBTAREA
exports.updateSubtask = (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const sql = `UPDATE subTareas SET title = ?, description = ?, completed = ? WHERE id = ?`;
  db.run(sql, [title, description, completed ? 1 : 0, id], function (err) {
    if (err) {
      console.error('Error actualizando subTarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }
    res.json({ message: 'Subtarea actualizada correctamente' });
  });
};

// ELIMINAR SUBTAREA
exports.deleteSubtask = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM subTareas WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Error eliminando subTarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }
    res.json({ message: 'Subtarea eliminada correctamente' });
  });
};

// REASIGNAR SUBTAREA A OTRA TAREA
exports.reassignSubtask = (req, res) => {
  const { id } = req.params;
  const { newTaskId } = req.body;

  const sql = `UPDATE subTareas SET task_id = ? WHERE id = ?`;
  db.run(sql, [newTaskId, id], function (err) {
    if (err) {
      console.error('Error reasignando subtarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }
    res.json({ message: 'Subtarea reasignada correctamente' });
  });
};

// CONVERTIR SUBTAREA EN TAREA PRINCIPAL
exports.convertSubtaskToTask = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM subTareas WHERE id = ?', [id], (err, subtask) => {
    if (err) {
      console.error('Error leyendo subTarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!subtask) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }

    const insertSql = `INSERT INTO tareas (title, description, status) VALUES (?, ?, ?)`;
    db.run(insertSql, [subtask.title, subtask.description, 'pendiente'], function (err) {
      if (err) {
        console.error('Error creando tarea desde subTarea:', err.message);
        return res.status(500).json({ error: err.message });
      }

      db.run('DELETE FROM subTareas WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('Error eliminando subTarea original:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: 'Subtarea convertida en tarea correctamente',
          newTaskId: this.lastID
        });
      });
    });
  });
};
