const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const InvoiceModel = require('../models/Invoice');
const CostCenterModel = require('../models/CostCenter');

// Estadísticas generales
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await InvoiceModel.getStats({
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Facturas por mes
router.get('/monthly/:year', authenticate, async (req, res) => {
  try {
    const data = await InvoiceModel.getByMonth(req.params.year);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos mensuales' });
  }
});

// Top proveedores
router.get('/top-providers', authenticate, async (req, res) => {
  try {
    const providers = await InvoiceModel.getTopProviders(req.query.limit || 10);
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Resumen centros de costo
router.get('/cost-centers', authenticate, async (req, res) => {
  try {
    const summary = await CostCenterModel.getSummary();
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

module.exports = router;