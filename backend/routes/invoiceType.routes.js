const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const InvoiceTypeController = require('../controllers/invoiceType.controller');

// ✅ GET: Obtener todos los tipos (público, requiere auth)
router.get('/', authenticate, InvoiceTypeController.getAll);

// ✅ GET: Obtener un tipo por ID
router.get('/:id', authenticate, InvoiceTypeController.getById);

// 🆕 GET: Obtener campos requeridos por tipo
router.get('/:code/fields', authenticate, InvoiceTypeController.getFieldsByType);

// 🆕 POST: Crear nuevo tipo (solo admin)
router.post('/', authenticate, authorize('admin'), InvoiceTypeController.create);

// 🆕 PUT: Actualizar tipo (solo admin)
router.put('/:id', authenticate, authorize('admin'), InvoiceTypeController.update);

// 🆕 DELETE: Eliminar/desactivar tipo (solo admin)
router.delete('/:id', authenticate, authorize('admin'), InvoiceTypeController.delete);

module.exports = router;
