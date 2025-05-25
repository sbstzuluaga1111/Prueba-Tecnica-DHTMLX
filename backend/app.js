const express = require('express');
const path = require('path');
const { db, initDB } = require('./data/db');
const routers = require('./routes/routers');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

initDB();

app.use('/', routers);

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
