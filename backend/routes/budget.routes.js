const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth');

/**
 * RUTAS DE CATEGORÍAS DE PRESUPUESTO (RUBROS)
 */

// Crear categoría de presupuesto
router.post('/categories', authenticate, budgetController.createBudgetCategory);

// Obtener categorías de un centro de costo
router.get('/categories', authenticate, budgetController.getBudgetCategories);

// Obtener categoría específica con sus subcategorías
router.get('/categories/:id', authenticate, budgetController.getBudgetCategoryById);

// Actualizar categoría de presupuesto
router.put('/categories/:id', authenticate, budgetController.updateBudgetCategory);

// Eliminar categoría de presupuesto
router.delete('/categories/:id', authenticate, budgetController.deleteBudgetCategory);

/**
 * RUTAS DE SUBCATEGORÍAS DE PRESUPUESTO (SUBRUBROS)
 */

// Crear subcategoría de presupuesto
router.post('/subcategories', authenticate, budgetController.createBudgetSubcategory);

// Obtener subcategorías de una categoría
router.get('/subcategories', authenticate, budgetController.getBudgetSubcategories);

// Actualizar subcategoría de presupuesto
router.put('/subcategories/:id', authenticate, budgetController.updateBudgetSubcategory);

// Eliminar subcategoría de presupuesto
router.delete('/subcategories/:id', authenticate, budgetController.deleteBudgetSubcategory);

/**
 * RUTAS DE UTILIDADES Y REPORTES
 */

// Obtener plantilla de presupuesto por defecto
router.get('/template/default', authenticate, budgetController.getDefaultBudgetTemplate);

// Obtener resumen de presupuesto de un centro de costo
router.get('/summary', authenticate, budgetController.getBudgetSummary);

// Asignar presupuesto desde plantilla
router.post('/assign-template/:costCenterId', authenticate, budgetController.assignBudgetFromTemplate);

module.exports = router;
