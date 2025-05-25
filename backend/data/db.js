const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');

    // Activar claves foráneas para que ON DELETE CASCADE funcione
    db.run("PRAGMA foreign_keys = ON;", (err) => {
      if (err) {
        console.error('Error activando foreign keys:', err.message);
      } else {
        console.log('Foreign keys activadas');
      }
    });
  }
});

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      due_date TEXT,
      status TEXT DEFAULT 'pendiente',
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES tareas(id)
    )`, (err) => {
      if (err) {
        console.error('Error creando tabla tareas:', err.message);
      } else {
        console.log('Tabla tareas creada');
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS subTareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(task_id) REFERENCES tareas(id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creando tabla subTareas:', err.message);
      } else {
        console.log('Tabla subTareas creada');
      }
    });
  });
}

module.exports = {
  db,
  initDB
};
