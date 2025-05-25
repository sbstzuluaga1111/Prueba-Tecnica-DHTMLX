const { db } = require('../data/db');

exports.getAllTasks = (req, res) => {
  db.all('SELECT * FROM tareas', [], (err, rows) => {
    if (err) {
      console.error('Error leyendo tareas:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
};

exports.createTask = (req, res) => {
  const { title, description, due_date, status, parent_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  db.run(
    `INSERT INTO tareas (title, description, due_date, status, parent_id) VALUES (?, ?, ?, ?, ?)`,
    [title, description || '', due_date || null, status || 'pendiente', parent_id || null],
    function (err) {
      if (err) {
        console.error('Error creando tarea:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description,
        created_at: new Date().toISOString(),
        due_date,
        status: status || 'pendiente',
        parent_id
      });
    }
  );
};
