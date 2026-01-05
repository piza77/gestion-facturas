const UserModel = require('../../models/User');
const db = require('../../config/database');
const bcrypt = require('bcrypt');

jest.mock('../../config/database');
jest.mock('bcrypt');

describe('UserModel - Create and Update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear nuevo usuario con nombre válido', async () => {
      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@empresa.com',
        password: 'password123',
        role: 'admin'
      };

      // Mock: verificar que email no existe
      db.query.mockResolvedValueOnce([]); // No existe email
      
      // Mock: hash de contraseña
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      
      // Mock: INSERT usuario
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      
      // Mock: SELECT usuario creado
      db.query.mockResolvedValueOnce([{
        id: 'user-123',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@empresa.com',
        role: 'admin',
        is_active: 1
      }]);

      const result = await UserModel.create(userData);

      expect(result.first_name).toBe('Juan');
      expect(result.last_name).toBe('Pérez');
      expect(result.email).toBe('juan@empresa.com');
      expect(result.role).toBe('admin');
    });

    it('debe rechazar email duplicado', async () => {
      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'existing@empresa.com',
        password: 'password123'
      };

      // Mock: email ya existe
      db.query.mockResolvedValueOnce([{ id: 'user-999' }]);

      await expect(
        UserModel.create(userData)
      ).rejects.toThrow('Ya existe');
    });
  });

  describe('update', () => {
    it('debe actualizar datos de usuario', async () => {
      const userId = 'user-123';
      const updateData = {
        firstName: 'Carlos'
      };

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: userId,
        first_name: 'Carlos',
        last_name: 'González',
        email: 'user@empresa.com'
      }]);

      const result = await UserModel.update(userId, updateData);

      expect(result.first_name).toBe('Carlos');
    });
  });

  describe('Roles de usuario', () => {
    it('debe permitir rol "admin"', async () => {
      const userData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@empresa.com',
        password: 'pass123',
        role: 'admin'
      };

      db.query.mockResolvedValueOnce([]);
      bcrypt.hash.mockResolvedValueOnce('hashed');
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'user-123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        email: userData.email
      }]);

      const result = await UserModel.create(userData);
      expect(result.role).toBe('admin');
    });

    it('debe permitir rol "viewer"', async () => {
      const userData = {
        firstName: 'Viewer',
        lastName: 'User',
        email: 'viewer@empresa.com',
        password: 'pass123',
        role: 'viewer'
      };

      db.query.mockResolvedValueOnce([]);
      bcrypt.hash.mockResolvedValueOnce('hashed');
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'user-456',
        first_name: 'Viewer',
        last_name: 'User',
        role: 'viewer',
        email: userData.email
      }]);

      const result = await UserModel.create(userData);
      expect(result.role).toBe('viewer');
    });
  });
});
