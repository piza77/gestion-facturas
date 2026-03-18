const request = require('supertest');
const express = require('express');
const databaseController = require('../../controllers/database.controller');
const db = require('../../models');

// Mock data
const mockUser = { id: 1, role: 'ADMIN', email: 'admin@test.com' };

describe('Database Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    // Register routes
    app.get('/api/tables', databaseController.getAllTables);
    app.get('/api/tables/:name', databaseController.getTableSchema);
    app.get('/api/tables/:name/data', databaseController.getTableData);
    app.post('/api/tables', databaseController.createTable);
    app.put('/api/tables/:name', databaseController.alterTable);
    app.delete('/api/tables/:name', databaseController.dropTable);
  });

  describe('GET /api/tables', () => {
    it('should return list of tables', async () => {
      const response = await request(app)
        .get('/api/tables')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/tables/:name', () => {
    it('should return table schema', async () => {
      const response = await request(app)
        .get('/api/tables/users')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('tableName', 'users');
      expect(Array.isArray(response.body.data.columns)).toBe(true);
    });

    it('should handle invalid table names', async () => {
      const response = await request(app)
        .get('/api/tables/invalid-name!')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/tables/:name/data', () => {
    it('should return paginated table data', async () => {
      const response = await request(app)
        .get('/api/tables/users')
        .query({ page: 1, pageSize: 25 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
    });

    it('should filter by search query', async () => {
      const response = await request(app)
        .get('/api/tables/users')
        .query({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/tables', () => {
    it('should create new table', async () => {
      const tableData = {
        tableName: 'test_table',
        columns: [
          { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true },
          { name: 'name', type: 'VARCHAR(255)', nullable: false }
        ]
      };

      // Skip if API not available
      const response = await request(app)
        .post('/api/tables')
        .send(tableData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({ columns: [] })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/tables/:name', () => {
    it('should delete table with confirmation', async () => {
      const response = await request(app)
        .delete('/api/tables/test_table')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
    });

    it('should prevent deleting system tables', async () => {
      const response = await request(app)
        .delete('/api/tables/users')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Database Backups Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    app.post('/api/backups', databaseController.createBackup);
    app.get('/api/backups', databaseController.listBackups);
    app.post('/api/backups/:id/restore', databaseController.restoreBackup);
  });

  describe('POST /api/backups', () => {
    it('should create backup', async () => {
      const backupData = {
        backupName: 'backup-test-001',
        backupType: 'FULL',
        tables: ['users', 'invoices']
      };

      const response = await request(app)
        .post('/api/backups')
        .send(backupData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('backupId');
    });
  });

  describe('GET /api/backups', () => {
    it('should list backups', async () => {
      const response = await request(app)
        .get('/api/backups')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

describe('SQL Editor Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    app.post('/api/sql/execute', databaseController.executeSqlQuery);
  });

  describe('POST /api/sql/execute', () => {
    it('should execute SELECT query', async () => {
      const response = await request(app)
        .post('/api/sql/execute')
        .send({ query: 'SELECT * FROM users LIMIT 1' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject dangerous queries', async () => {
      const response = await request(app)
        .post('/api/sql/execute')
        .send({ query: 'DROP DATABASE production' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should support draft mode', async () => {
      const response = await request(app)
        .post('/api/sql/execute')
        .send({ 
          query: 'SELECT * FROM users', 
          isDraft: true 
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('isDraft', true);
    });
  });
});

describe('Audit Log Controller', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    app.get('/api/audit', databaseController.getAuditLog);
  });

  describe('GET /api/audit', () => {
    it('should retrieve audit logs', async () => {
      const response = await request(app)
        .get('/api/audit')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by table name', async () => {
      const response = await request(app)
        .get('/api/audit')
        .query({ tableName: 'users' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/audit')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });
});
