const ProviderModel = require('../../models/Provider');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('ProviderModel - CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear proveedor nuevo con datos válidos', async () => {
      const providerData = {
        businessName: 'Acme Corp',
        nit: '900123456-7',
        contactName: 'Juan García',
        phone: '3015551234',
        email: 'contact@acme.com',
        address: 'Calle 123 #45',
        city: 'Bogotá',
        country: 'Colombia',
        category: 'supplies',
        paymentTerms: 30,
        notes: 'Proveedor importante'
      };

      // Mock: verificar que NIT no existe
      db.query.mockResolvedValueOnce([]);
      
      // Mock: INSERT proveedor
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      
      // Mock: SELECT proveedor creado
      db.query.mockResolvedValueOnce([{
        id: 'prov-123',
        business_name: 'Acme Corp',
        nit: '900123456-7',
        contact_name: 'Juan García',
        phone: '3015551234',
        email: 'contact@acme.com',
        address: 'Calle 123 #45',
        city: 'Bogotá',
        country: 'Colombia',
        category: 'supplies',
        payment_terms: 30
      }]);

      const result = await ProviderModel.create(providerData);

      expect(result.business_name).toBe('Acme Corp');
      expect(result.nit).toBe('900123456-7');
      expect(result.category).toBe('supplies');
    });

    it('debe rechazar NIT duplicado', async () => {
      const providerData = {
        businessName: 'Other Corp',
        nit: '900000000-0',
        contactName: 'Test',
        email: 'test@test.com'
      };

      // Mock: NIT ya existe
      db.query.mockResolvedValueOnce([{ id: 'prov-999' }]);

      await expect(
        ProviderModel.create(providerData)
      ).rejects.toThrow('Ya existe un proveedor con ese NIT');
    });

    it('debe asignar país "Colombia" por defecto', async () => {
      const providerData = {
        businessName: 'Local Company',
        nit: '800555666-5',
        contactName: 'Contact',
        email: 'local@company.com',
        position: 'manager'
        // No especifica country
      };

      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'prov-456',
        country: 'Colombia'
      }]);

      const result = await ProviderModel.create(providerData);
      expect(result.country).toBe('Colombia');
    });

    it('debe asignar términos de pago 30 días por defecto', async () => {
      const providerData = {
        businessName: 'Default Terms Co',
        nit: '700888999-1',
        contactName: 'Contact',
        email: 'default@terms.com',
        position: 'manager'
        // No especifica paymentTerms
      };

      db.query.mockResolvedValueOnce([]);
      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: 'prov-789',
        payment_terms: 30
      }]);

      const result = await ProviderModel.create(providerData);
      expect(result.payment_terms).toBe(30);
    });
  });

  describe('findById', () => {
    it('debe obtener proveedor por ID', async () => {
      const providerId = 'prov-123';

      db.query.mockResolvedValueOnce([{
        id: providerId,
        business_name: 'Acme Corp',
        nit: '900123456-7'
      }]);

      const result = await ProviderModel.findById(providerId);

      expect(result.id).toBe(providerId);
      expect(result.business_name).toBe('Acme Corp');
    });

    it('debe retornar null si no existe proveedor', async () => {
      db.query.mockResolvedValueOnce([]);

      const result = await ProviderModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar datos del proveedor', async () => {
      const providerId = 'prov-123';
      const updateData = {
        businessName: 'Updated Acme',
        phone: '3019999999'
      };

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: providerId,
        business_name: 'Updated Acme',
        phone: '3019999999'
      }]);

      const result = await ProviderModel.update(providerId, updateData);

      expect(result.business_name).toBe('Updated Acme');
      expect(result.phone).toBe('3019999999');
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de proveedores', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', business_name: 'Acme' },
        { id: '2', business_name: 'Beta Co' }
      ]);

      const result = await ProviderModel.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('debe filtrar por categoría', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', business_name: 'Acme', category: 'supplies' }
      ]);

      const result = await ProviderModel.findAll({ category: 'supplies' });

      expect(result.length).toBe(1);
      expect(result[0].category).toBe('supplies');
    });

    it('debe filtrar por búsqueda de nombre o NIT', async () => {
      db.query.mockResolvedValueOnce([
        { id: '1', business_name: 'Acme Corp', nit: '900123456-7' }
      ]);

      const result = await ProviderModel.findAll({ search: 'Acme' });

      expect(result.length).toBe(1);
    });
  });

  describe('delete', () => {
    it('debe rechazar eliminación si hay facturas asociadas', async () => {
      const providerId = 'prov-123';

      // Mock: verificar si tiene facturas
      db.query.mockResolvedValueOnce([{ count: 5 }]);

      await expect(
        ProviderModel.delete(providerId)
      ).rejects.toThrow('No se puede eliminar el proveedor porque tiene facturas');
    });

    it('debe eliminar proveedor sin facturas', async () => {
      const providerId = 'prov-123';

      // Mock: sin facturas
      db.query.mockResolvedValueOnce([{ count: 0 }]);
      
      // Mock: DELETE
      db.query.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await ProviderModel.delete(providerId);

      expect(result).toBe(true);
    });
  });

  describe('Conversión de campos', () => {
    it('debe convertir camelCase a snake_case en update', async () => {
      const providerId = 'prov-123';

      db.query.mockResolvedValueOnce({ affectedRows: 1 });
      db.query.mockResolvedValueOnce([{
        id: providerId,
        business_name: 'Updated',
        payment_terms: 45
      }]);

      await ProviderModel.update(providerId, {
        businessName: 'Updated',
        paymentTerms: 45
      });

      expect(db.query).toHaveBeenCalled();
    });
  });
});
