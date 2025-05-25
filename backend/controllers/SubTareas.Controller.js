const db = require('../data/db.js');

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

exports.createSubtask = (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  if (!taskId || !title) {
    return res.status(400).json({ error: 'taskId y title son obligatorios' });
  }

  const sql = `INSERT INTO subTareas (task_id, title, description) VALUES (?, ?, ?)`;
  db.run(sql, [taskId, title, description], function (err) {
    if (err) {
      console.error('Error creando subTarea:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, task_id: taskId, title, description, completed: 0 });
  });
};
