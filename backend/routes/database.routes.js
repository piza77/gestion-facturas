const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/database.controller');
const auth = require('../middleware/auth');
const {
  validateTableName,
  validateTableNameParam,
  validateTableDefinition,
  validateTableChanges,
  validateRowData,
  validateIndex,
  validateBackup,
  validateSqlQuery,
  validatePagination,
  validateAuditLimit
} = require('../middleware/database.validator');

/**
 * Middleware ADMIN-ONLY
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Solo administradores pueden acceder al gestor de base de datos'
    });
  }
  next();
};

// ==================== RUTAS PÚBLICAS PROTEGIDAS ====================

/**
 * Tablas
 */
router.get('/tables', 
  auth.verifyToken, 
  requireAdmin, 
  databaseController.getAllTables
);

router.get('/tables/:name', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getTableSchema
);

router.get('/tables/:name/data', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  validatePagination,
  databaseController.getTableData
);

router.post('/tables', 
  auth.verifyToken, 
  requireAdmin,
  validateTableName(),
  validateTableDefinition,
  databaseController.createTable
);

router.put('/tables/:name', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  validateTableChanges,
  databaseController.alterTable
);

router.delete('/tables/:name', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.dropTable
);

router.post('/tables/:name/truncate', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.truncateTable
);

// ==================== OPERACIONES EN DATOS ====================

router.post('/tables/:name/rows', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  validateRowData,
  databaseController.insertRow
);

router.put('/tables/:name/rows/:id', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  validateRowData,
  databaseController.updateRow
);

router.delete('/tables/:name/rows/:id', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.deleteRow
);

// ==================== ÍNDICES ====================

router.get('/tables/:name/indexes', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getIndexes
);

router.post('/tables/:name/indexes', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  validateIndex,
  databaseController.createIndex
);

router.delete('/tables/:name/indexes/:indexName', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.dropIndex
);

// ==================== BACKUPS ====================

router.post('/backups', 
  auth.verifyToken, 
  requireAdmin,
  validateBackup,
  databaseController.createBackup
);

router.get('/backups', 
  auth.verifyToken, 
  requireAdmin,
  databaseController.listBackups
);

router.post('/backups/:id/restore', 
  auth.verifyToken, 
  requireAdmin,
  databaseController.restoreBackup
);

router.delete('/backups/:id', 
  auth.verifyToken, 
  requireAdmin,
  databaseController.deleteBackup
);

// ==================== SQL EDITOR ====================

router.post('/sql/execute', 
  auth.verifyToken, 
  requireAdmin,
  validateSqlQuery,
  databaseController.executeSqlQuery
);

// ==================== AUDITORÍA ====================

router.get('/audit', 
  auth.verifyToken, 
  requireAdmin,
  validateAuditLimit,
  databaseController.getAuditLog
);

// ==================== VERSIONADO ====================

router.get('/tables/:name/versions', 
  auth.verifyToken, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getVersionHistory
);

module.exports = router;
