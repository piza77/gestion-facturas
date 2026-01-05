const InvoiceModel = require('../../models/Invoice');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('InvoiceModel - updateStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validaciones de transición de estado', () => {
    it('debe cambiar de PENDING a FILED correctamente', async () => {
      const invoiceId = 'inv-123';
      const userId = 'user-456';

      // Mock: factura existe con estado PENDING
      db.query.mockResolvedValueOnce([{ 
        id: invoiceId, 
        status: 'pending',
        total: 1000
      }]);
      
      // Mock: UPDATE exitoso
      db.query.mockResolvedValueOnce({});
      
      // Mock: SELECT después de update
      db.query.mockResolvedValueOnce([{ 
        id: invoiceId, 
        status: 'filed',
        filed_at: new Date().toISOString(),
        filed_by: userId
      }]);

      const result = await InvoiceModel.updateStatus(
        invoiceId,
        'filed',
        userId,
        'Factura radicada correctamente'
      );

      expect(result.status).toBe('filed');
      expect(result.filed_by).toBe(userId);
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('debe rechazar cambio de PAID a FILED (transición atrás)', async () => {
      const invoiceId = 'inv-123';

      db.query.mockResolvedValueOnce([{ 
        id: invoiceId, 
        status: 'paid'
      }]);

      await expect(
        InvoiceModel.updateStatus(invoiceId, 'filed', 'user-456')
      ).rejects.toThrow('No se puede cambiar');
    });

    it('debe rechazar cambio a estado inválido', async () => {
      const invoiceId = 'inv-123';

      db.query.mockResolvedValueOnce([{ 
        id: invoiceId, 
        status: 'pending'
      }]);

      await expect(
        InvoiceModel.updateStatus(invoiceId, 'invalid_status', 'user-456')
      ).rejects.toThrow('Estado no válido');
    });
  });

  describe('Manejo de errores', () => {
    it('debe rechazar userId vacío', async () => {
      const invoiceId = 'inv-123';

      db.query.mockResolvedValueOnce([{ id: invoiceId, status: 'pending' }]);

      await expect(
        InvoiceModel.updateStatus(invoiceId, 'filed', '')
      ).rejects.toThrow();
    });
  });
});
