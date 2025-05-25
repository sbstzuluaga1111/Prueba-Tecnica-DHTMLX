const express = require('express');
const path = require('path');
const { db, initDB } = require('./data/db.js');
const routers = require('./routes/routers.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
initDB();

// Usar prefijo API para tus rutas
app.use('/api', routers);

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
