const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado a SQLite');
  }
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDB() {
  const sql = `
    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      start_date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      progress REAL DEFAULT 0,
      parent INTEGER DEFAULT 0
    )
  `;
  await runAsync(sql);
  console.log('Tabla tareas creada o ya existía');
}

module.exports = {
  db,
  initDB,
  runAsync,
  allAsync
};
