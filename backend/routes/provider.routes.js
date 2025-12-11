const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderInvoices,
  getProviderStats
} = require('../controllers/provider.controller');

// Listar proveedores
router.get('/', authenticate, getProviders);

// Obtener proveedor por ID
router.get('/:id', authenticate, getProviderById);

// Crear proveedor
router.post('/', authenticate, authorize('admin', 'user'), createProvider);

// Actualizar proveedor
router.put('/:id', authenticate, authorize('admin', 'user'), updateProvider);

// Eliminar proveedor
router.delete('/:id', authenticate, authorize('admin'), deleteProvider);

// Obtener facturas del proveedor
router.get('/:id/invoices', authenticate, getProviderInvoices);

// Estadísticas del proveedor
router.get('/:id/stats', authenticate, getProviderStats);

module.exports = router;