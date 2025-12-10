const express = require('express');
const router = express.Router();

// Ruta de prueba temporal
router.get('/', (req, res) => {
  res.json({ message: 'Cost Centers OK' });
});

module.exports = router;
