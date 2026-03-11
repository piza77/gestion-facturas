const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoiceStats,
  getInvoicesByMonth,
  getTopProviders,
  getPettyCashReport
} = require('../controllers/invoice.controller');

// Listar facturas
router.get('/', authenticate, getInvoices);

// Obtener reporte de Caja Menor (Petty Cash)
router.get('/reports/petty-cash', authenticate, authorize('admin', 'manager', 'analyst'), getPettyCashReport);

// Obtener factura por ID
router.get('/:id', authenticate, getInvoiceById);

// Crear factura
router.post('/', authenticate, authorize('admin', 'user'), upload.single('file'), createInvoice);

// Actualizar factura
router.put('/:id', authenticate, authorize('admin', 'user'), upload.single('file'), updateInvoice);

// Cambiar estado de factura
router.patch('/:id/status', authenticate, updateInvoiceStatus);

// Eliminar factura
router.delete('/:id', authenticate, authorize('admin'), deleteInvoice);

// Estadísticas
router.get('/stats/general', authenticate, getInvoiceStats);

// Facturas por mes
router.get('/stats/monthly', authenticate, getInvoicesByMonth);

// Proveedores principales
router.get('/stats/top-providers', authenticate, getTopProviders);

module.exports = router;