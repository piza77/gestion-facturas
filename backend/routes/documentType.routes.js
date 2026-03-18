const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentType.controller');
const auth = require('../middleware/auth');
const validator = require('../middleware/documentType.validator');

// Proteger todas las rutas con autenticación
router.use(auth.verifyToken);

// GET: Obtener todos los tipos de documentos
router.get('/', documentTypeController.getAllDocumentTypes);

// GET: Obtener tipo por código
router.get('/code/:code', documentTypeController.getDocumentTypeByCode);

// GET: Obtener estadísticas de un tipo
router.get('/:id/statistics', documentTypeController.getTypeStatistics);

// GET: Obtener tipo por ID
router.get('/:id', documentTypeController.getDocumentTypeById);

// POST: Crear nuevo tipo de documento
router.post('/', validator.validateCreate, documentTypeController.createDocumentType);

// PUT: Actualizar tipo de documento
router.put('/:id', validator.validateUpdate, documentTypeController.updateDocumentType);

// DELETE: Eliminar (soft delete) tipo de documento
router.delete('/:id', documentTypeController.deleteDocumentType);

// POST: Generar próximo folio
router.post('/:documentTypeId/next-folio', documentTypeController.getNextFolio);

module.exports = router;
