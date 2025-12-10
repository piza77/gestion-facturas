const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ProviderModel = require('../models/Provider');

// Listar proveedores
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      isActive: req.query.isActive,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0
    };

    const providers = await ProviderModel.findAll(filters);
    const total = await ProviderModel.count(filters);

    res.json({
      providers,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Obtener proveedor por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const provider = await ProviderModel.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json({ provider });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

// Crear proveedor
router.post('/', authenticate, authorize('admin', 'user'), async (req, res) => {
  try {
    const provider = await ProviderModel.create(req.body);
    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      provider
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar proveedor
router.put('/:id', authenticate, authorize('admin', 'user'), async (req, res) => {
  try {
    const provider = await ProviderModel.update(req.params.id, req.body);
    res.json({
      message: 'Proveedor actualizado exitosamente',
      provider
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar proveedor
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await ProviderModel.delete(req.params.id);
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener facturas del proveedor
router.get('/:id/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await ProviderModel.getInvoices(req.params.id, req.query.limit || 10);
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Estadísticas del proveedor
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const stats = await ProviderModel.getStats(req.params.id);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;