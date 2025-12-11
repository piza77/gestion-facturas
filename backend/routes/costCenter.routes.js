const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCostCenters,
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getCostCenterEmployees,
  getCostCenterInvoices,
  getCostCenterStats
} = require('../controllers/costCenter.controller');

// Listar centros de costo
router.get('/', authenticate, getCostCenters);

// Obtener centro de costo por ID
router.get('/:id', authenticate, getCostCenterById);

// Crear centro de costo
router.post('/', authenticate, authorize('admin', 'user'), createCostCenter);

// Actualizar centro de costo
router.put('/:id', authenticate, authorize('admin', 'user'), updateCostCenter);

// Eliminar centro de costo
router.delete('/:id', authenticate, authorize('admin'), deleteCostCenter);

// Obtener empleados del centro de costo
router.get('/:id/employees', authenticate, getCostCenterEmployees);

// Obtener facturas del centro de costo
router.get('/:id/invoices', authenticate, getCostCenterInvoices);

// Estadísticas del centro de costo
router.get('/:id/stats', authenticate, getCostCenterStats);

module.exports = router;
