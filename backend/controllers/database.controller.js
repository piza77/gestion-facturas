const databaseService = require('../services/database.service');
const db = require('../models');

class DatabaseController {

  /**
   * GET /api/database/tables
   * Listar todas las tablas
   */
  async getAllTables(req, res) {
    try {
      const tables = await databaseService.getAllTables();
      res.json({
        success: true,
        count: tables.length,
        data: tables
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/tables/:name
   * Obtener esquema de tabla
   */
  async getTableSchema(req, res) {
    try {
      const { name } = req.params;
      const schema = await databaseService.getTableSchema(name);
      res.json({
        success: true,
        data: schema
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/tables/:name/data
   * Obtener datos con paginación
   */
  async getTableData(req, res) {
    try {
      const { name } = req.params;
      const { page = 1, pageSize = 25, ...filters } = req.query;
      
      const data = await databaseService.getTableData(
        name,
        parseInt(page),
        parseInt(pageSize),
        filters
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/tables
   * Crear tabla
   */
  async createTable(req, res) {
    try {
      const { tableName, columns, indexes, foreignKeys } = req.body;
      const userId = req.user.id;

      const result = await databaseService.createTable(
        tableName,
        columns,
        indexes,
        foreignKeys,
        userId
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/database/tables/:name
   * Modificar tabla
   */
  async alterTable(req, res) {
    try {
      const { name } = req.params;
      const { changes } = req.body;
      const userId = req.user.id;

      const result = await databaseService.alterTable(name, changes, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/database/tables/:name
   * Eliminar tabla
   */
  async dropTable(req, res) {
    try {
      const { name } = req.params;
      const userId = req.user.id;

      const result = await databaseService.dropTable(name, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/tables/:name/truncate
   * Vaciar tabla
   */
  async truncateTable(req, res) {
    try {
      const { name } = req.params;
      const userId = req.user.id;

      const result = await databaseService.truncateTable(name, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/tables/:name/rows
   * Insertar fila
   */
  async insertRow(req, res) {
    try {
      const { name } = req.params;
      const { data } = req.body;
      const userId = req.user.id;

      const result = await databaseService.insertRow(name, data, userId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/database/tables/:name/rows/:id
   * Actualizar fila
   */
  async updateRow(req, res) {
    try {
      const { name, id } = req.params;
      const { data } = req.body;
      const userId = req.user.id;

      const result = await databaseService.updateRow(name, id, data, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/database/tables/:name/rows/:id
   * Eliminar fila
   */
  async deleteRow(req, res) {
    try {
      const { name, id } = req.params;
      const userId = req.user.id;

      const result = await databaseService.deleteRow(name, id, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/tables/:name/indexes
   * Listar índices
   */
  async getIndexes(req, res) {
    try {
      const { name } = req.params;
      const indexes = await databaseService.getIndexes(name);
      res.json({ success: true, data: indexes });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/tables/:name/indexes
   * Crear índice
   */
  async createIndex(req, res) {
    try {
      const { name } = req.params;
      const { indexName, columns, isUnique } = req.body;
      const userId = req.user.id;

      const result = await databaseService.createIndex(
        name,
        indexName,
        columns,
        isUnique,
        userId
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/database/tables/:name/indexes/:indexName
   * Eliminar índice
   */
  async dropIndex(req, res) {
    try {
      const { name, indexName } = req.params;
      const userId = req.user.id;

      const result = await databaseService.dropIndex(name, indexName, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/backups
   * Crear backup
   */
  async createBackup(req, res) {
    try {
      const { backupName, backupType = 'FULL', tables } = req.body;
      const userId = req.user.id;

      const result = await databaseService.createBackup(
        backupName,
        backupType,
        tables,
        userId
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/backups
   * Listar backups
   */
  async listBackups(req, res) {
    try {
      const { limit = 50 } = req.query;
      const backups = await databaseService.listBackups(parseInt(limit));
      res.json({
        success: true,
        count: backups.length,
        data: backups
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/backups/:id/restore
   * Restaurar backup
   */
  async restoreBackup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await databaseService.restoreBackup(id, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/database/backups/:id
   * Eliminar backup
   */
  async deleteBackup(req, res) {
    try {
      const { id } = req.params;

      const result = await databaseService.deleteBackup(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/database/sql/execute
   * Ejecutar SQL
   */
  async executeSqlQuery(req, res) {
    try {
      const { query, isDraft = false } = req.body;
      
      const result = await databaseService.executeSqlQuery(query, isDraft);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/audit
   * Obtener auditoría
   */
  async getAuditLog(req, res) {
    try {
      const { tableName, limit = 100 } = req.query;

      const logs = await databaseService.getAuditLog(tableName, parseInt(limit));

      res.json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/database/tables/:name/versions
   * Obtener historial de versiones
   */
  async getVersionHistory(req, res) {
    try {
      const { name } = req.params;

      const versions = await databaseService.getVersionHistory(name);

      res.json({
        success: true,
        count: versions.length,
        data: versions
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DatabaseController();
