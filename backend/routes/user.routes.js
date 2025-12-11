const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  getUserInvoices,
  getUserStats,
  getCurrentUser
} = require('../controllers/user.controller');

// Obtener usuario actual
router.get('/me', authenticate, getCurrentUser);

// Listar usuarios
router.get('/', authenticate, authorize('admin'), getUsers);

// Obtener usuario por ID
router.get('/:id', authenticate, getUserById);

// Crear usuario
router.post('/', authenticate, authorize('admin'), createUser);

// Actualizar usuario
router.put('/:id', authenticate, authorize('admin'), updateUser);

// Cambiar contraseña
router.put('/:id/password', authenticate, updatePassword);

// Eliminar usuario
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Obtener facturas del usuario
router.get('/:id/invoices', authenticate, getUserInvoices);

// Estadísticas del usuario
router.get('/:id/stats', authenticate, getUserStats);

module.exports = router;
