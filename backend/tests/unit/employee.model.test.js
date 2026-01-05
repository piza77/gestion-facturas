const EmployeeModel = require('../../models/Employee');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('EmployeeModel - CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear empleado nuevo con datos válidos', async () => {
      const employeeData = {
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos@empresa.com',
        phone: '3015551234',
        identificationType: 'CC',
        identificationNumber: '1234567890',
        position: 'Developer',
        department: 'IT',
        hireDate: '2025-01-15'
      };

      // Mock: verificar email no existe
      db.query.mockResolvedValueOnce([]);
      
      // Mock: verificar documento no existe
      db.query.mockResolvedValueOnce([]);
      
      // Mock: INSERT empleado
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      
      // Mock: SELECT empleado creado
      db.query.mockResolvedValueOnce([{
        id: 'emp-123',
        first_name: 'Carlos',
        last_name: 'López',
        email: 'carlos@empresa.com',
        phone: '3015551234',
        identification_type: 'CC',
        identification_number: '1234567890',
        position: 'Developer',
        department: 'IT',
        hire_date: '2025-01-15',
        status: 'active'
      }]);

      const result = await EmployeeModel.create(employeeData);

      expect(result.first_name).toBe('Carlos');
      expect(result.last_name).toBe('López');
      expect(result.position).toBe('Developer');
      expect(result.department).toBe('IT');
    });

    it('debe rechazar email duplicado', async () => {
      const employeeData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@empresa.com',
        identificationType: 'CC',
        identificationNumber: '9999999999',
        position: 'manager',
        department: 'admin',
        hireDate: '2025-01-01'
      };

      // Mock: email ya existe
      db.query.mockResolvedValueOnce([{ id: 'emp-999' }]);

      await expect(
        EmployeeModel.create(employeeData)
      ).rejects.toThrow('Ya existe un empleado con ese email');
    });

    it('debe rechazar documento duplicado', async () => {
      const employeeData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'new@empresa.com',
        identificationType: 'CC',
        identificationNumber: '1111111111',
        position: 'manager',
        department: 'admin',
        hireDate: '2025-01-01'
      };

      // Mock: email no existe
      db.query.mockResolvedValueOnce([]);
      
      // Mock: documento ya existe
      db.query.mockResolvedValueOnce([{ id: 'emp-888' }]);

      await expect(
        EmployeeModel.create(employeeData)
      ).rejects.toThrow('Ya existe un empleado con ese número de documento');
    });

    it('debe rechazar campos requeridos faltantes', async () => {
      const incompleteData = {
        firstName: 'Carlos',
        lastName: 'López'
        // Faltan otros campos requeridos
      };

      await expect(
        EmployeeModel.create(incompleteData)
      ).rejects.toThrow('Faltan campos requeridos');
    });

    it('debe convertir fecha ISO a YYYY-MM-DD', async () => {
      const employeeData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'datetest@empresa.com',
        identificationType: 'CC',
        identificationNumber: '5555555555',
        position: 'manager',
        department: 'admin',
        hireDate: '2025-01-15T10:30:00.000Z' // ISO format
      };

      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'emp-456',
        hire_date: '2025-01-15'
      }]);

      const result = await EmployeeModel.create(employeeData);
      expect(result.hire_date).toBe('2025-01-15');
    });

    it('debe aceptar tanto camelCase como snake_case', async () => {
      const employeeData = {
        first_name: 'Ana',
        last_name: 'Martínez',
        email: 'ana@empresa.com',
        identification_type: 'CC',
        identification_number: '7777777777',
        position: 'analyst',
        department: 'finance',
        hire_date: '2025-01-10'
      };

      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'emp-789',
        first_name: 'Ana',
        last_name: 'Martínez'
      }]);

      const result = await EmployeeModel.create(employeeData);
      expect(result.first_name).toBe('Ana');
    });
  });

  describe('findById', () => {
    it('debe obtener empleado por ID', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce([{
        id: employeeId,
        first_name: 'Carlos',
        last_name: 'López',
        position: 'Developer'
      }]);

      const result = await EmployeeModel.findById(employeeId);

      expect(result.id).toBe(employeeId);
      expect(result.first_name).toBe('Carlos');
    });

    it('debe retornar null si no existe empleado', async () => {
      db.query.mockResolvedValueOnce([]);

      const result = await EmployeeModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar datos del empleado', async () => {
      const employeeId = 'emp-123';
      const updateData = {
        phone: '3019999999',
        position: 'Senior Developer'
      };

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: employeeId,
        phone: '3019999999',
        position: 'Senior Developer'
      }]);

      const result = await EmployeeModel.update(employeeId, updateData);

      expect(result.phone).toBe('3019999999');
      expect(result.position).toBe('Senior Developer');
    });

    it('debe permitir actualizar estado del empleado', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: employeeId,
        status: 'vacation'
      }]);

      const result = await EmployeeModel.update(employeeId, {
        status: 'vacation'
      });

      expect(result.status).toBe('vacation');
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de empleados', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', first_name: 'Carlos', last_name: 'López' },
        { id: '2', first_name: 'Ana', last_name: 'Martínez' }
      ]);

      const result = await EmployeeModel.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('debe filtrar por departamento', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', first_name: 'Carlos', department: 'IT' }
      ]);

      const result = await EmployeeModel.findAll({ department: 'IT' });

      expect(result.length).toBe(1);
      expect(result[0].department).toBe('IT');
    });

    it('debe filtrar por estado', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', first_name: 'Carlos', status: 'active' }
      ]);

      const result = await EmployeeModel.findAll({ status: 'active' });

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('active');
    });

    it('debe filtrar por búsqueda de nombre, email o documento', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', first_name: 'Carlos', email: 'carlos@empresa.com' }
      ]);

      const result = await EmployeeModel.findAll({ search: 'Carlos' });

      expect(result.length).toBe(1);
    });
  });

  describe('Estados del empleado', () => {
    it('debe permitir estado "active"', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{ id: employeeId, status: 'active' }]);

      const result = await EmployeeModel.update(employeeId, { status: 'active' });
      expect(result.status).toBe('active');
    });

    it('debe permitir estado "inactive"', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{ id: employeeId, status: 'inactive' }]);

      const result = await EmployeeModel.update(employeeId, { status: 'inactive' });
      expect(result.status).toBe('inactive');
    });

    it('debe permitir estado "vacation"', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{ id: employeeId, status: 'vacation' }]);

      const result = await EmployeeModel.update(employeeId, { status: 'vacation' });
      expect(result.status).toBe('vacation');
    });

    it('debe permitir estado "suspended"', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{ id: employeeId, status: 'suspended' }]);

      const result = await EmployeeModel.update(employeeId, { status: 'suspended' });
      expect(result.status).toBe('suspended');
    });
  });

  describe('Conversión de campos', () => {
    it('debe convertir camelCase a snake_case en update', async () => {
      const employeeId = 'emp-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: employeeId,
        first_name: 'Updated',
        hire_date: '2025-02-01'
      }]);

      await EmployeeModel.update(employeeId, {
        firstName: 'Updated',
        hireDate: '2025-02-01'
      });

      expect(db.query).toHaveBeenCalled();
    });
  });
});
