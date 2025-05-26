const { db } = require('../data/db');

// MOSTRAR ENLACES
exports.getAllLinks = (req, res) => {
  db.all('SELECT * FROM links', [], (err, rows) => {
    if (err) {
      console.error('Error leyendo links:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
};

// CREAR ENLACES
exports.createLink = (req, res) => {
  const { source, target, type } = req.body;

  if (!source || !target || !type) {
    return res.status(400).json({ error: 'source, target y type son requeridos' });
  }

  db.run(
    'INSERT INTO links (source, target, type) VALUES (?, ?, ?)',
    [source, target, type],
    function (err) {
      if (err) {
        console.error('Error creando link:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        source,
        target,
        type
      });
    }
  );
};

// ACTUALIZAR ENLACES
exports.updateLink = (req, res) => {
  const { id } = req.params;
  const { source, target, type } = req.body;

  if (!source || !target || !type) {
    return res.status(400).json({ error: 'source, target y type son requeridos' });
  }

  db.run(
    'UPDATE links SET source = ?, target = ?, type = ? WHERE id = ?',
    [source, target, type, id],
    function (err) {
      if (err) {
        console.error('Error actualizando link:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }
      res.json({ message: 'Link actualizado' });
    }
  );
};

// ELIMINAR ENLACES
exports.deleteLink = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM links WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error eliminando link:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Link no encontrado' });
    }
    res.json({ message: 'Link eliminado' });
  });
};
