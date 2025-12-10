const express = require('express');
const router = express.Router();

// Ruta temporal
router.get('/', (req, res) => {
  res.json({ message: 'Invoice Types endpoint OK' });
});

module.exports = router;
