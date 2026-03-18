const documentTypeService = require('../services/documentType.service');
const { DocumentType, Document } = require('../models');

// Mock Sequelize models
jest.mock('../models', () => ({
  DocumentType: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Document: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
}));

describe('DocumentType Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTypes', () => {
    it('debe retornar todos los tipos activos', async () => {
      const mockTypes = [
        { id: 1, name: 'Factura', code: 'FAC', isActive: true },
        { id: 2, name: 'Nota Crédito', code: 'NOT_C', isActive: true },
      ];

      DocumentType.findAll.mockResolvedValue(mockTypes);

      const result = await documentTypeService.getAllTypes();

      expect(result).toEqual(mockTypes);
      expect(DocumentType.findAll).toHaveBeenCalled();
    });

    it('debe filtrar por búsqueda', async () => {
      const mockTypes = [{ id: 1, name: 'Factura', code: 'FAC' }];

      DocumentType.findAll.mockResolvedValue(mockTypes);

      const result = await documentTypeService.getAllTypes({ search: 'Factura' });

      expect(result).toEqual(mockTypes);
    });
  });

  describe('getTypeById', () => {
    it('debe retornar un tipo por ID', async () => {
      const mockType = { id: 1, name: 'Factura', code: 'FAC' };
      DocumentType.findByPk.mockResolvedValue(mockType);

      const result = await documentTypeService.getTypeById(1);

      expect(result).toEqual(mockType);
      expect(DocumentType.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('debe lanzar error si tipo no existe', async () => {
      DocumentType.findByPk.mockResolvedValue(null);

      expect(documentTypeService.getTypeById(999)).rejects.toThrow('no encontrado');
    });
  });

  describe('getTypeByCode', () => {
    it('debe retornar un tipo por código', async () => {
      const mockType = { id: 1, code: 'FAC', name: 'Factura' };
      DocumentType.findOne.mockResolvedValue(mockType);

      const result = await documentTypeService.getTypeByCode('FAC');

      expect(result).toEqual(mockType);
      expect(DocumentType.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { code: 'FAC' } })
      );
    });
  });

  describe('createType', () => {
    it('debe crear un nuevo tipo de documento', async () => {
      const data = {
        name: 'Nueva Factura',
        code: 'NEW_FAC',
        description: 'Descripción',
        fields: [{ name: 'campo1', label: 'Campo 1', type: 'text' }],
      };

      DocumentType.findOne
        .mockResolvedValueOnce(null) // Verifica código único
        .mockResolvedValueOnce(null); // Verifica nombre único

      const createdType = { id: 1, ...data };
      DocumentType.findByPk.mockResolvedValue(createdType);

      const result = await documentTypeService.createType(data, 1);

      expect(result).toEqual(createdType);
      expect(DocumentType.create).toHaveBeenCalled();
    });

    it('debe rechazar si código ya existe', async () => {
      const data = { name: 'Factura', code: 'FAC' };
      DocumentType.findOne.mockResolvedValue({ id: 1, code: 'FAC' });

      expect(documentTypeService.createType(data, 1)).rejects.toThrow('ya existe');
    });

    it('debe validar estructura de campos', async () => {
      const data = {
        name: 'Nueva Factura',
        code: 'NEW_FAC',
        fields: [{ name: 'campo1' }], // Falta label y type
      };

      expect(documentTypeService.createType(data, 1)).rejects.toThrow('incompleto');
    });
  });

  describe('updateType', () => {
    it('debe actualizar un tipo de documento', async () => {
      const mockType = {
        id: 1,
        name: 'Factura',
        description: 'Original',
        update: jest.fn(),
      };

      DocumentType.findByPk.mockResolvedValue(mockType);
      mockType.update.mockResolvedValue({
        ...mockType,
        description: 'Actualizada',
      });

      DocumentType.findByPk.mockResolvedValueOnce({
        ...mockType,
        description: 'Actualizada',
      });

      await documentTypeService.updateType(1, { description: 'Actualizada' }, 1);

      expect(mockType.update).toHaveBeenCalled();
    });

    it('debe lanzar error si tipo no existe', async () => {
      DocumentType.findByPk.mockResolvedValue(null);

      expect(documentTypeService.updateType(999, {}, 1)).rejects.toThrow('no encontrado');
    });
  });

  describe('deleteType', () => {
    it('debe desactivar un tipo de documento', async () => {
      const mockType = { id: 1, isActive: true, update: jest.fn() };

      DocumentType.findByPk.mockResolvedValue(mockType);
      Document.count.mockResolvedValue(0);

      await documentTypeService.deleteType(1, 1);

      expect(mockType.update).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });

    it('debe rechazar si hay documentos activos', async () => {
      const mockType = { id: 1 };

      DocumentType.findByPk.mockResolvedValue(mockType);
      Document.count.mockResolvedValue(5);

      expect(documentTypeService.deleteType(1, 1)).rejects.toThrow('No se puede eliminar');
    });
  });

  describe('getNextFolio', () => {
    it('debe generar un folio válido', async () => {
      const mockType = {
        id: 1,
        prefix: 'FAC-',
        nextSequence: 42,
        update: jest.fn(),
      };

      DocumentType.findByPk.mockResolvedValue(mockType);
      mockType.update.mockResolvedValue({ ...mockType, nextSequence: 43 });

      const result = await documentTypeService.getNextFolio(1);

      expect(result.folio).toBe('FAC-000042');
      expect(mockType.update).toHaveBeenCalled();
    });

    it('debe padear con ceros a la izquierda', async () => {
      const mockType = {
        id: 1,
        prefix: 'DOC-',
        nextSequence: 5,
        update: jest.fn(),
      };

      DocumentType.findByPk.mockResolvedValue(mockType);
      mockType.update.mockResolvedValue({ ...mockType, nextSequence: 6 });

      const result = await documentTypeService.getNextFolio(1);

      expect(result.folio).toBe('DOC-000005');
    });
  });

  describe('getTypeStatistics', () => {
    it('debe retornar estadísticas del tipo', async () => {
      const mockType = {
        id: 1,
        name: 'Factura',
        nextSequence: 43,
        fields: [{}, {}, {}, {}, {}],
      };

      DocumentType.findByPk.mockResolvedValue(mockType);

      const mockStats = [
        { status: 'ACTIVE', count: 35 },
        { status: 'DRAFT', count: 7 },
      ];

      Document.findAll.mockResolvedValue(mockStats);

      const result = await documentTypeService.getTypeStatistics(1);

      expect(result.documentType).toBe('Factura');
      expect(result.totalSequence).toBe(42);
      expect(result.totalFields).toBe(5);
    });
  });
});
