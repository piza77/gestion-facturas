const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const InvoiceModel = require('../models/Invoice');

// Listar facturas
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      providerId: req.query.providerId,
      costCenterId: req.query.costCenterId,
      invoiceTypeId: req.query.invoiceTypeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit || 20,
      offset: req.query.offset || 0
    };

    const invoices = await InvoiceModel.findAll(filters);
    const total = await InvoiceModel.count(filters);

    res.json({
      invoices,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Obtener factura por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// Crear factura
router.post('/', authenticate, authorize('admin', 'user'), upload.single('file'), async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null
    };

    const invoice = await InvoiceModel.create(data);
    res.status(201).json({
      message: 'Factura creada exitosamente',
      invoice
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar factura
router.put('/:id', authenticate, authorize('admin', 'user'), upload.single('file'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.filePath = req.file.path;
      data.fileName = req.file.originalname;
    }

    const invoice = await InvoiceModel.update(req.params.id, data, req.user.id);
    res.json({
      message: 'Factura actualizada exitosamente',
      invoice
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cambiar estado
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const invoice = await InvoiceModel.updateStatus(req.params.id, status, req.user.id, reason);
    res.json({
      message: 'Estado actualizado exitosamente',
      invoice
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar factura
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await InvoiceModel.delete(req.params.id);
    res.json({ message: 'Factura eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;