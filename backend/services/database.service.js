const { sequelize } = require('../config/database');
const db = require('../models');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

class DatabaseService {
  
  // ==================== TABLAS ====================
  
  /**
   * Obtener todas las tablas de la BD
   */
  async getAllTables() {
    try {
      const tables = await sequelize.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`
      );
      return tables[0].map(t => t.TABLE_NAME);
    } catch (error) {
      throw new Error(`Error al obtener tablas: ${error.message}`);
    }
  }

  /**
   * Obtener esquema detallado de una tabla
   */
  async getTableSchema(tableName) {
    try {
      // Validar nombre de tabla
      this.validateTableName(tableName);

      const [columns] = await sequelize.query(`
        SELECT 
          COLUMN_NAME as name,
          COLUMN_TYPE as type,
          IS_NULLABLE as nullable,
          COLUMN_DEFAULT as defaultValue,
          EXTRA as extra,
          COLUMN_COMMENT as comment
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, { replacements: [tableName] });

      const [indexes] = await sequelize.query(`
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      `, { replacements: [tableName] });

      const [foreignKeys] = await sequelize.query(`
        SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, { replacements: [tableName] });

      return {
        tableName,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable === 'YES',
          defaultValue: col.defaultValue,
          extra: col.extra,
          comment: col.comment
        })),
        indexes: this.groupIndexes(indexes),
        foreignKeys: foreignKeys
      };
    } catch (error) {
      throw new Error(`Error al obtener esquema de ${tableName}: ${error.message}`);
    }
  }

  /**
   * Crear tabla
   */
  async createTable(tableName, columns, indexes = [], foreignKeys = [], userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      // Construir query CREATE TABLE
      let createTableSQL = `CREATE TABLE ${tableName} (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (col.autoIncrement) def += ' AUTO_INCREMENT';
        if (!col.nullable) def += ' NOT NULL';
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (col.unique) def += ' UNIQUE';
        if (col.comment) def += ` COMMENT '${col.comment}'`;
        return def;
      });
      
      createTableSQL += columnDefs.join(',\n');

      // Agregar foreign keys
      if (foreignKeys.length > 0) {
        foreignKeys.forEach(fk => {
          createTableSQL += `,\n  FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencedTable}(${fk.referencedColumn})`;
          if (fk.onDelete) createTableSQL += ` ON DELETE ${fk.onDelete}`;
          if (fk.onUpdate) createTableSQL += ` ON UPDATE ${fk.onUpdate}`;
        });
      }

      createTableSQL += '\n)';

      // Ejecutar
      await sequelize.query(createTableSQL, { transaction });

      // Crear índices
      if (indexes.length > 0) {
        for (const idx of indexes) {
          const columns = Array.isArray(idx.columns) ? idx.columns.join(', ') : idx.columns;
          const indexSQL = `CREATE ${idx.unique ? 'UNIQUE' : ''} INDEX ${idx.name} ON ${tableName}(${columns})`;
          await sequelize.query(indexSQL, { transaction });
        }
      }

      // Registrar en auditoría
      const schema = await this.getTableSchema(tableName);
      await db.DatabaseSchema.create({
        tableName,
        version: 1,
        definition: schema,
        description: `Tabla creada`,
        createdBy: userId,
        appliedAt: new Date(),
        appliedBy: userId
      }, { transaction });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'CREATE',
        queryExecuted: createTableSQL,
        recordsAffected: 0,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, tableName, schema };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Modificar tabla (agregar/eliminar/modificar columnas)
   */
  async alterTable(tableName, changes, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);

      // Obtener esquema anterior
      const oldSchema = await this.getTableSchema(tableName);

      let alterSQL = `ALTER TABLE ${tableName}`;
      const alterClauses = [];

      // Procesar cambios
      if (changes.addColumns) {
        for (const col of changes.addColumns) {
          let clause = `ADD COLUMN ${col.name} ${col.type}`;
          if (!col.nullable) clause += ' NOT NULL';
          if (col.defaultValue) clause += ` DEFAULT ${col.defaultValue}`;
          alterClauses.push(clause);
        }
      }

      if (changes.dropColumns) {
        for (const colName of changes.dropColumns) {
          alterClauses.push(`DROP COLUMN ${colName}`);
        }
      }

      if (changes.modifyColumns) {
        for (const col of changes.modifyColumns) {
          let clause = `MODIFY COLUMN ${col.name} ${col.type}`;
          if (!col.nullable) clause += ' NOT NULL';
          if (col.defaultValue) clause += ` DEFAULT ${col.defaultValue}`;
          alterClauses.push(clause);
        }
      }

      if (alterClauses.length === 0) {
        throw new Error('No hay cambios para aplicar');
      }

      alterSQL += ' ' + alterClauses.join(', ');
      await sequelize.query(alterSQL, { transaction });

      // Obtener nuevo esquema
      const newSchema = await this.getTableSchema(tableName);

      // Actualizar versión en database_schemas
      const latestVersion = await db.DatabaseSchema.findOne({
        where: { tableName },
        order: [['version', 'DESC']]
      }, { transaction });

      const newVersion = (latestVersion?.version || 0) + 1;
      
      await db.DatabaseSchema.create({
        tableName,
        version: newVersion,
        definition: newSchema,
        description: `Tabla modificada`,
        createdBy: userId,
        appliedAt: new Date(),
        appliedBy: userId
      }, { transaction });

      // Registrar auditoría
      await db.DatabaseAudit.create({
        tableName,
        operation: 'ALTER',
        queryExecuted: alterSQL,
        oldDefinition: oldSchema,
        newDefinition: newSchema,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, tableName, version: newVersion, newSchema };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar tabla
   */
  async dropTable(tableName, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      const query = `DROP TABLE ${tableName}`;
      await sequelize.query(query, { transaction });

      // Marcar como inactivo en database_schemas
      await db.DatabaseSchema.update(
        { isActive: false },
        { where: { tableName }, transaction }
      );

      await db.DatabaseAudit.create({
        tableName,
        operation: 'DROP',
        queryExecuted: query,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, message: `Tabla ${tableName} eliminada` };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Truncar tabla (vaciar datos)
   */
  async truncateTable(tableName, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      const query = `TRUNCATE TABLE ${tableName}`;
      await sequelize.query(query, { transaction });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'TRUNCATE',
        queryExecuted: query,
        performedBy: userId,
        status: 'SUCCESS',
        recordsAffected: 0
      }, { transaction });

      await transaction.commit();
      return { success: true, message: `Tabla ${tableName} vaciada` };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ==================== DATOS ====================

  /**
   * Obtener datos de tabla con paginación
   */
  async getTableData(tableName, page = 1, pageSize = 25, filters = {}) {
    try {
      this.validateTableName(tableName);

      const offset = (page - 1) * pageSize;
      let query = `SELECT * FROM ${tableName}`;
      const replacements = [];

      // Construir WHERE si hay filtros
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        for (const [key, value] of Object.entries(filters)) {
          whereConditions.push(`${key} LIKE ?`);
          replacements.push(`%${value}%`);
        }
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      query += ` LIMIT ? OFFSET ?`;
      replacements.push(pageSize, offset);

      const [rows] = await sequelize.query(query, { replacements });

      // Obtener total
      let countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        const countReplacements = [];
        for (const [key, value] of Object.entries(filters)) {
          whereConditions.push(`${key} LIKE ?`);
          countReplacements.push(`%${value}%`);
        }
        countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
        const [countResult] = await sequelize.query(countQuery, { replacements: countReplacements });
        return {
          tableName,
          page,
          pageSize,
          total: countResult[0].count,
          totalPages: Math.ceil(countResult[0].count / pageSize),
          data: rows
        };
      }

      const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      return {
        tableName,
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
        data: rows
      };
    } catch (error) {
      throw new Error(`Error al obtener datos: ${error.message}`);
    }
  }

  /**
   * Insertar fila
   */
  async insertRow(tableName, data, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      await sequelize.query(query, {
        replacements: values,
        transaction
      });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'INSERT',
        recordsAffected: 1,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, message: 'Fila insertada' };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar fila
   */
  async updateRow(tableName, id, data, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];
      
      const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;
      const result = await sequelize.query(query, {
        replacements: values,
        transaction
      });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'UPDATE',
        recordsAffected: result[1],
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, recordsAffected: result[1] };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar fila
   */
  async deleteRow(tableName, id, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);
      
      const query = `DELETE FROM ${tableName} WHERE id = ?`;
      const result = await sequelize.query(query, {
        replacements: [id],
        transaction
      });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'DELETE',
        recordsAffected: result[1],
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, recordsAffected: result[1] };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ==================== ÍNDICES ====================

  /**
   * Listar índices de tabla
   */
  async getIndexes(tableName) {
    try {
      this.validateTableName(tableName);

      const [indexes] = await sequelize.query(`
        SELECT 
          INDEX_NAME,
          COLUMN_NAME,
          SEQ_IN_INDEX,
          NON_UNIQUE
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `, { replacements: [tableName] });

      return this.groupIndexes(indexes);
    } catch (error) {
      throw new Error(`Error al obtener índices: ${error.message}`);
    }
  }

  /**
   * Crear índice
   */
  async createIndex(tableName, indexName, columns, isUnique = false, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);

      const columnsStr = Array.isArray(columns) ? columns.join(', ') : columns;
      const uniqueStr = isUnique ? 'UNIQUE' : '';
      const query = `CREATE ${uniqueStr} INDEX ${indexName} ON ${tableName}(${columnsStr})`;

      await sequelize.query(query, { transaction });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'ALTER',
        queryExecuted: query,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, indexName };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar índice
   */
  async dropIndex(tableName, indexName, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateTableName(tableName);

      const query = `DROP INDEX ${indexName} ON ${tableName}`;
      await sequelize.query(query, { transaction });

      await db.DatabaseAudit.create({
        tableName,
        operation: 'ALTER',
        queryExecuted: query,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();
      return { success: true, message: `Índice ${indexName} eliminado` };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ==================== BACKUPS ====================

  /**
   * Crear backup
   */
  async createBackup(backupName, backupType = 'FULL', tables = null, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const startTime = Date.now();
      let backupSQL = '';

      // Obtener tablas a respaldar
      const getTables = tables || await this.getAllTables();

      if (backupType === 'FULL' || backupType === 'SCHEMA_ONLY') {
        for (const table of getTables) {
          const [createTableResult] = await sequelize.query(`SHOW CREATE TABLE ${table}`);
          backupSQL += `${createTableResult[0]['Create Table']};\n\n`;
        }
      }

      if (backupType === 'FULL' || backupType === 'DATA_ONLY') {
        for (const table of getTables) {
          const [data] = await sequelize.query(`SELECT * FROM ${table}`);
          if (data.length > 0) {
            backupSQL += `-- Data for table ${table}\n`;
            backupSQL += `INSERT INTO ${table} VALUES \n`;
            backupSQL += data.map(row => `(${Object.values(row).map(v => `'${v}'`).join(', ')})`).join(',\n');
            backupSQL += ';\n\n';
          }
        }
      }

      // Comprimir
      const compressed = zlib.gzipSync(backupSQL);
      const backupFileName = `${backupName}_${Date.now()}.sql.gz`;
      const backupPath = path.join(__dirname, '../backups', backupFileName);

      // Asegurar directorio
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, compressed);

      // Encriptar nombre de archivo
      const encryptedName = crypto.createHash('sha256').update(backupFileName).digest('hex');

      // Guardar en BD
      const backup = await db.DatabaseBackup.create({
        backupName,
        backupType,
        tablesIncluded: getTables,
        backupSize: backupSQL.length,
        fileLocation: backupPath,
        compressedFilePath: backupFileName,
        createdBy: userId,
        completedAt: new Date(),
        isEncrypted: true
      }, { transaction });

      const executionTime = Date.now() - startTime;

      await db.DatabaseAudit.create({
        tableName: 'DATABASE',
        operation: 'BACKUP',
        queryExecuted: `Backup: ${backupName}`,
        recordsAffected: getTables.length,
        executionTime: executionTime,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        backupId: backup.id,
        backupName,
        size: backupSQL.length,
        executionTime
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Listar backups
   */
  async listBackups(limit = 50) {
    try {
      const backups = await db.DatabaseBackup.findAll({
        include: [{ model: db.User, as: 'creator', attributes: ['id', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit
      });
      return backups;
    } catch (error) {
      throw new Error(`Error al listar backups: ${error.message}`);
    }
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(backupId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const backup = await db.DatabaseBackup.findByPk(backupId);
      if (!backup) throw new Error('Backup no encontrado');

      // Leer archivo comprimido
      const backupPath = backup.fileLocation;
      const compressed = await fs.readFile(backupPath);
      const decompressed = zlib.gunzipSync(compressed).toString();

      // Ejecutar SQL
      const statements = decompressed.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await sequelize.query(statement, { transaction });
        }
      }

      await db.DatabaseAudit.create({
        tableName: 'DATABASE',
        operation: 'RESTORE',
        recordsAffected: backup.tablesIncluded.length,
        performedBy: userId,
        status: 'SUCCESS'
      }, { transaction });

      await transaction.commit();

      return { success: true, message: `Backup ${backup.backupName} restaurado` };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar backup
   */
  async deleteBackup(backupId) {
    try {
      const backup = await db.DatabaseBackup.findByPk(backupId);
      if (!backup) throw new Error('Backup no encontrado');

      // Eliminar archivo
      if (backup.fileLocation) {
        try {
          await fs.unlink(backup.fileLocation);
        } catch (e) {
          // Archivo puede no existir
        }
      }

      await backup.destroy();
      return { success: true };

    } catch (error) {
      throw error;
    }
  }

  // ==================== SQL EDITOR ====================

  /**
   * Ejecutar SQL query
   */
  async executeSqlQuery(query, isDraft = false) {
    try {
      this.validateSqlQuery(query);

      if (isDraft) {
        const transaction = await sequelize.transaction();
        try {
          const result = await sequelize.query(query, { transaction });
          await transaction.rollback();
          return { success: true, result: result[0], isDraft: true, message: 'Ejecución de prueba (reversada)' };
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      } else {
        const result = await sequelize.query(query);
        return { success: true, result: result[0] };
      }
    } catch (error) {
      throw new Error(`Error en query: ${error.message}`);
    }
  }

  /**
   * Validar sintaxis SQL
   */
  validateSqlQuery(query) {
    // Prevenir operaciones peligrosas
    const dangerousKeywords = ['DROP DATABASE', 'DELETE FROM', 'TRUNCATE'];
    const upperQuery = query.toUpperCase();

    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        throw new Error(`Operación no permitida: ${keyword}`);
      }
    }
  }

  /**
   * Validar nombre de tabla
   */
  validateTableName(tableName) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      throw new Error('Nombre de tabla inválido');
    }
    
    // Tablas del sistema que no se deben modificar
    const systemTables = ['users', 'database_audits', 'database_schemas', 'database_backups'];
    if (systemTables.includes(tableName.toLowerCase())) {
      throw new Error('No se pueden modificar tablas del sistema');
    }
  }

  /**
   * Obtener auditoría
   */
  async getAuditLog(tableName = null, limit = 100) {
    try {
      const where = tableName ? { tableName } : {};
      const logs = await db.DatabaseAudit.findAll({
        where,
        include: [{ model: db.User, as: 'performer', attributes: ['id', 'email'] }],
        order: [['performedAt', 'DESC']],
        limit
      });
      return logs;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de versiones
   */
  async getVersionHistory(tableName) {
    try {
      const versions = await db.DatabaseSchema.findAll({
        where: { tableName },
        order: [['version', 'DESC']],
        include: [
          { model: db.User, as: 'creator', attributes: ['id', 'email'] }
        ]
      });
      return versions;
    } catch (error) {
      throw error;
    }
  }

  // ==================== HELPERS ====================

  groupIndexes(indexes) {
    const grouped = {};
    indexes.forEach(idx => {
      if (!grouped[idx.INDEX_NAME]) {
        grouped[idx.INDEX_NAME] = {
          name: idx.INDEX_NAME,
          columns: [],
          unique: !idx.NON_UNIQUE
        };
      }
      grouped[idx.INDEX_NAME].columns.push(idx.COLUMN_NAME);
    });
    return Object.values(grouped);
  }
}

module.exports = new DatabaseService();
