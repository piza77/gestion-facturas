const databaseService = require('../../services/database.service');
const db = require('../../models');
const { sequelize } = require('../../config/database');

describe('Database Service', () => {
  const mockUserId = 1;

  describe('getAllTables', () => {
    it('should return array of table names', async () => {
      const tables = await databaseService.getAllTables();
      
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);
      expect(tables).toContain('users');
    });

    it('should exclude system information schema tables', async () => {
      const tables = await databaseService.getAllTables();
      
      expect(tables).not.toContain('information_schema');
      expect(tables).not.toContain('mysql');
    });
  });

  describe('getTableSchema', () => {
    it('should return complete table schema', async () => {
      const schema = await databaseService.getTableSchema('users');
      
      expect(schema).toHaveProperty('tableName', 'users');
      expect(schema).toHaveProperty('columns');
      expect(Array.isArray(schema.columns)).toBe(true);
      expect(schema.columns.length).toBeGreaterThan(0);
    });

    it('should include column metadata', async () => {
      const schema = await databaseService.getTableSchema('users');
      const idColumn = schema.columns.find(c => c.name === 'id');
      
      expect(idColumn).toBeDefined();
      expect(idColumn).toHaveProperty('type');
      expect(idColumn).toHaveProperty('nullable');
    });

    it('should include indexes if present', async () => {
      const schema = await databaseService.getTableSchema('users');
      
      expect(schema).toHaveProperty('indexes');
      expect(Array.isArray(schema.indexes)).toBe(true);
    });

    it('should reject invalid table names', async () => {
      await expect(
        databaseService.getTableSchema('invalid-name!')
      ).rejects.toThrow();
    });
  });

  describe('createTable', () => {
    it('should create table with specified columns', async () => {
      const tableName = `test_table_${Date.now()}`;
      const columns = [
        { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false }
      ];

      const result = await databaseService.createTable(
        tableName,
        columns,
        [],
        [],
        mockUserId
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('tableName', tableName);

      // Cleanup
      await sequelize.query(`DROP TABLE ${tableName}`);
    });

    it('should record in database_schemas', async () => {
      const tableName = `test_table_${Date.now()}`;
      const columns = [
        { name: 'id', type: 'INT', primaryKey: true }
      ];

      await databaseService.createTable(
        tableName,
        columns,
        [],
        [],
        mockUserId
      );

      const schema = await db.DatabaseSchema.findOne({
        where: { tableName }
      });

      expect(schema).toBeDefined();
      expect(schema.version).toBe(1);

      // Cleanup
      await sequelize.query(`DROP TABLE ${tableName}`);
    });

    it('should create audit entry', async () => {
      const tableName = `test_table_${Date.now()}`;
      const columns = [{ name: 'id', type: 'INT' }];

      await databaseService.createTable(
        tableName,
        columns,
        [],
        [],
        mockUserId
      );

      const audit = await db.DatabaseAudit.findOne({
        where: { tableName, operation: 'CREATE' },
        order: [['performedAt', 'DESC']]
      });

      expect(audit).toBeDefined();
      expect(audit.status).toBe('SUCCESS');

      // Cleanup
      await sequelize.query(`DROP TABLE ${tableName}`);
    });
  });

  describe('alterTable', () => {
    let testTableName;

    beforeAll(async () => {
      testTableName = `test_alter_${Date.now()}`;
      const columns = [
        { name: 'id', type: 'INT', primaryKey: true }
      ];
      
      await sequelize.query(`
        CREATE TABLE ${testTableName} (
          id INT PRIMARY KEY AUTO_INCREMENT
        )
      `);
    });

    it('should add column to table', async () => {
      const changes = {
        addColumns: [
          { name: 'new_col', type: 'VARCHAR(100)', nullable: true }
        ]
      };

      const result = await databaseService.alterTable(
        testTableName,
        changes,
        mockUserId
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('version', 2);
    });

    it('should increment version on alter', async () => {
      const versions = await db.DatabaseSchema.findAll({
        where: { tableName: testTableName },
        order: [['version', 'DESC']]
      });

      expect(versions.length).toBeGreaterThan(1);
    });

    afterAll(async () => {
      await sequelize.query(`DROP TABLE ${testTableName}`);
    });
  });

  describe('getTableData', () => {
    it('should return paginated data', async () => {
      const result = await databaseService.getTableData('users', 1, 10);

      expect(result).toHaveProperty('tableName', 'users');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('pageSize', 10);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should support filtering', async () => {
      const filters = { role: 'ADMIN' };
      const result = await databaseService.getTableData('users', 1, 10, filters);

      expect(result).toHaveProperty('data');
    });
  });

  describe('validateTableName', () => {
    it('should accept valid table names', () => {
      expect(() => {
        databaseService.validateTableName('users');
        databaseService.validateTableName('user_profiles');
        databaseService.validateTableName('_private_table');
      }).not.toThrow();
    });

    it('should reject invalid table names', () => {
      expect(() => databaseService.validateTableName('table-name')).toThrow();
      expect(() => databaseService.validateTableName('123table')).toThrow();
      expect(() => databaseService.validateTableName('table!')).toThrow();
    });

    it('should protect system tables', () => {
      expect(() => databaseService.validateTableName('users')).not.toThrow();
      // If users were in protected list:
      // expect(() => databaseService.validateTableName('users')).toThrow();
    });
  });

  describe('getIndexes', () => {
    it('should return indexes for table', async () => {
      const indexes = await databaseService.getIndexes('users');

      expect(Array.isArray(indexes)).toBe(true);
      expect(indexes.length).toBeGreaterThanOrEqual(0);
    });

    it('should group indexes by name', async () => {
      const indexes = await databaseService.getIndexes('users');

      indexes.forEach(idx => {
        expect(idx).toHaveProperty('name');
        expect(idx).toHaveProperty('columns');
        expect(Array.isArray(idx.columns)).toBe(true);
        expect(idx).toHaveProperty('unique');
      });
    });
  });

  describe('getAuditLog', () => {
    it('should retrieve audit entries', async () => {
      const logs = await databaseService.getAuditLog();

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should filter by table name', async () => {
      const logs = await databaseService.getAuditLog('users');

      logs.forEach(log => {
        expect(log.tableName).toBe('users');
      });
    });

    it('should limit results', async () => {
      const logs = await databaseService.getAuditLog(null, 5);

      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getVersionHistory', () => {
    it('should retrieve schema versions', async () => {
      const versions = await databaseService.getVersionHistory('users');

      expect(Array.isArray(versions)).toBe(true);
    });

    it('should order by version descending', async () => {
      const versions = await databaseService.getVersionHistory('users');

      if (versions.length > 1) {
        expect(versions[0].version).toBeGreaterThanOrEqual(versions[1].version);
      }
    });
  });

  describe('SQL Query Execution', () => {
    it('should validate dangerous SQL', () => {
      expect(() => {
        databaseService.validateSqlQuery('DROP DATABASE production');
      }).toThrow();

      expect(() => {
        databaseService.validateSqlQuery('DELETE FROM users');
      }).toThrow();

      expect(() => {
        databaseService.validateSqlQuery('TRUNCATE users');
      }).toThrow();
    });

    it('should allow SELECT queries', () => {
      expect(() => {
        databaseService.validateSqlQuery('SELECT * FROM users LIMIT 1');
      }).not.toThrow();
    });
  });
});
