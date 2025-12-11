const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeInvoices,
  getEmployeeStats
} = require('../controllers/employee.controller');

// Listar empleados
router.get('/', authenticate, getEmployees);

// Obtener empleado por ID
router.get('/:id', authenticate, getEmployeeById);

// Crear empleado
router.post('/', authenticate, authorize('admin', 'user'), createEmployee);

// Actualizar empleado
router.put('/:id', authenticate, authorize('admin', 'user'), updateEmployee);

// Eliminar empleado
router.delete('/:id', authenticate, authorize('admin'), deleteEmployee);

// Obtener facturas del empleado
router.get('/:id/invoices', authenticate, getEmployeeInvoices);

// Estadísticas del empleado
router.get('/:id/stats', authenticate, getEmployeeStats);

module.exports = router;
