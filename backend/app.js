const express = require('express');
const path = require('path');
const cors = require('cors');  // <-- importa cors
const { db, initDB } = require('./data/db.js');
const routers = require('./routes/routers.js');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3000',
  'https://prueba-tecnica-dhtmlx.onrender.com'
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'El CORS policy no permite este origen: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
initDB();

app.use('/api', routers);

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
