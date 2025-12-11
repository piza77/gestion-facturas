const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Obtener todos los tipos de factura
router.get('/', authenticate, async (req, res) => {
  try {
    const invoiceTypes = await db.query('SELECT id, code, name, description FROM invoice_types ORDER BY name ASC');
    res.json({ invoiceTypes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener tipos de factura' });
  }
});

// Obtener un tipo de factura por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoiceTypes = await db.query('SELECT * FROM invoice_types WHERE id = ?', [req.params.id]);
    if (invoiceTypes.length === 0) {
      return res.status(404).json({ error: 'Tipo de factura no encontrado' });
    }
    res.json({ invoiceType: invoiceTypes[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipo de factura' });
  }
});

module.exports = router;
