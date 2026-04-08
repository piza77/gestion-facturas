const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/database.controller');
const databaseService = require('../services/database.service');
const { authenticate, authorize } = require('../middleware/auth');
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

// ==================== ENDPOINT DE TESTING (SIN AUTENTICACIÓN) ====================
/**
 * GET /api/database/health
 * Health check del servicio de database (SIN AUTENTICACIÓN)
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'database',
    timestamp: new Date()
  });
});

/**
 * GET /api/database/tables-debug
 * Debug: obtener tablas sin autenticación (SOLO DESARROLLO)
 */
router.get('/tables-debug', async (req, res) => {
  try {
    const tables = await databaseService.getAllTables();
    console.log('[database.routes] Tables debug:', tables);
    res.json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('[database.routes] Error getting tables:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/database/tables/:name/data-debug
 * Debug: obtener datos de tabla sin autenticación (SOLO DESARROLLO)
 */
router.get('/tables/:name/data-debug', async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, pageSize = 25, ...filters } = req.query;

    const data = await databaseService.getTableData(
      name,
      parseInt(page),
      parseInt(pageSize),
      filters
    );
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('[database.routes] Error getting table data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RUTAS PÚBLICAS PROTEGIDAS ====================

/**
 * Tablas
 */
router.get('/tables', 
  authenticate, 
  requireAdmin, 
  databaseController.getAllTables
);

router.get('/tables/:name', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getTableSchema
);

router.get('/tables/:name/data', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  validatePagination,
  databaseController.getTableData
);

router.post('/tables', 
  authenticate, 
  requireAdmin,
  validateTableName(),
  validateTableDefinition,
  databaseController.createTable
);

router.put('/tables/:name', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  validateTableChanges,
  databaseController.alterTable
);

router.delete('/tables/:name', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.dropTable
);

router.post('/tables/:name/truncate', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.truncateTable
);

// ==================== OPERACIONES EN DATOS ====================

router.post('/tables/:name/rows', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  validateRowData,
  databaseController.insertRow
);

router.put('/tables/:name/rows/:id', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  validateRowData,
  databaseController.updateRow
);

router.delete('/tables/:name/rows/:id', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.deleteRow
);

// ==================== ÍNDICES ====================

router.get('/tables/:name/indexes', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getIndexes
);

router.post('/tables/:name/indexes', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  validateIndex,
  databaseController.createIndex
);

router.delete('/tables/:name/indexes/:indexName', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.dropIndex
);

// ==================== BACKUPS ====================

router.post('/backups', 
  authenticate, 
  requireAdmin,
  validateBackup,
  databaseController.createBackup
);

router.get('/backups', 
  authenticate, 
  requireAdmin,
  databaseController.listBackups
);

router.post('/backups/:id/restore', 
  authenticate, 
  requireAdmin,
  databaseController.restoreBackup
);

router.delete('/backups/:id', 
  authenticate, 
  requireAdmin,
  databaseController.deleteBackup
);

// ==================== SQL EDITOR ====================

router.post('/sql/execute', 
  authenticate, 
  requireAdmin,
  validateSqlQuery,
  databaseController.executeSqlQuery
);

// ==================== AUDITORÍA ====================

router.get('/audit', 
  authenticate, 
  requireAdmin,
  validateAuditLimit,
  databaseController.getAuditLog
);

// ==================== VERSIONADO ====================

router.get('/tables/:name/versions', 
  authenticate, 
  requireAdmin,
  validateTableNameParam(),
  databaseController.getVersionHistory
);

module.exports = router;
