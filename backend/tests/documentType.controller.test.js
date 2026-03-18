const request = require('supertest');
const express = require('express');
const documentTypeController = require('../controllers/documentType.controller');
const documentTypeService = require('../services/documentType.service');

// Mock del service
jest.mock('../services/documentType.service');

describe('DocumentType Controller', () => {
  let app;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockReq = {
      user: { id: 1, role: 'ADMIN' },
      params: {},
      query: {},
      body: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAllDocumentTypes', () => {
    it('debe retornar todos los tipos de documento activos', async () => {
      const mockTypes = [
        { id: 1, name: 'Factura', code: 'FAC', isActive: true },
        { id: 2, name: 'Nota Crédito', code: 'NOT_C', isActive: true },
      ];

      documentTypeService.getAllTypes.mockResolvedValue(mockTypes);

      await documentTypeController.getAllDocumentTypes(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockTypes);
      expect(documentTypeService.getAllTypes).toHaveBeenCalled();
    });

    it('debe manejar errores en getAllTypes', async () => {
      const error = new Error('Database error');
      documentTypeService.getAllTypes.mockRejectedValue(error);

      await documentTypeController.getAllDocumentTypes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getDocumentTypeById', () => {
    it('debe retornar un tipo de documento por ID', async () => {
      const mockType = { id: 1, name: 'Factura', code: 'FAC' };
      mockReq.params.id = 1;

      documentTypeService.getTypeById.mockResolvedValue(mockType);

      await documentTypeController.getDocumentTypeById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockType);
      expect(documentTypeService.getTypeById).toHaveBeenCalledWith(1);
    });

    it('debe retornar 404 si tipo no existe', async () => {
      mockReq.params.id = 999;
      const error = new Error('no encontrado');
      documentTypeService.getTypeById.mockRejectedValue(error);

      await documentTypeController.getDocumentTypeById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createDocumentType', () => {
    it('debe crear un nuevo tipo si usuario es ADMIN', async () => {
      const newType = { name: 'Nueva Factura', code: 'NEW_FAC' };
      mockReq.body = newType;
      mockReq.user.role = 'ADMIN';

      const createdType = { id: 5, ...newType };
      documentTypeService.createType.mockResolvedValue(createdType);

      await documentTypeController.createDocumentType(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdType);
    });

    it('debe rechazar creación si usuario no es ADMIN', async () => {
      mockReq.user.role = 'USER';
      mockReq.body = { name: 'Nueva Factura', code: 'NEW_FAC' };

      await documentTypeController.createDocumentType(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Solo administradores pueden crear tipos' });
    });

    it('debe manejar error si código ya existe', async () => {
      mockReq.user.role = 'ADMIN';
      mockReq.body = { name: 'Factura', code: 'FAC' };

      const error = new Error('Código FAC ya existe');
      documentTypeService.createType.mockRejectedValue(error);

      await documentTypeController.createDocumentType(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateDocumentType', () => {
    it('debe actualizar un tipo de documento si es ADMIN', async () => {
      mockReq.params.id = 1;
      mockReq.body = { name: 'Factura Actualizada' };
      mockReq.user.role = 'ADMIN';

      const updated = { id: 1, ...mockReq.body };
      documentTypeService.updateType.mockResolvedValue(updated);

      await documentTypeController.updateDocumentType(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('debe rechazar actualización si usuario no es ADMIN', async () => {
      mockReq.user.role = 'USER';
      mockReq.params.id = 1;

      await documentTypeController.updateDocumentType(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('deleteDocumentType', () => {
    it('debe eliminar un tipo de documento si es ADMIN', async () => {
      mockReq.params.id = 1;
      mockReq.user.role = 'ADMIN';

      documentTypeService.deleteType.mockResolvedValue({ message: 'Tipo desactivado' });

      await documentTypeController.deleteDocumentType(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tipo desactivado' });
    });

    it('debe rechazar eliminación si usuario no es ADMIN', async () => {
      mockReq.user.role = 'USER';
      mockReq.params.id = 1;

      await documentTypeController.deleteDocumentType(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getNextFolio', () => {
    it('debe generar un folio válido', async () => {
      mockReq.params.documentTypeId = 1;
      const folio = { folio: 'FAC-000001', sequence: 2 };

      documentTypeService.getNextFolio.mockResolvedValue(folio);

      await documentTypeController.getNextFolio(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(folio);
    });

    it('debe retornar 404 si tipo no existe', async () => {
      mockReq.params.documentTypeId = 999;
      const error = new Error('no encontrado');

      documentTypeService.getNextFolio.mockRejectedValue(error);

      await documentTypeController.getNextFolio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getTypeStatistics', () => {
    it('debe retornar estadísticas del tipo', async () => {
      mockReq.params.id = 1;
      const stats = {
        documentType: 'Factura',
        totalSequence: 42,
        totalFields: 5,
        documentsByStatus: [
          { status: 'ACTIVE', count: 35 },
          { status: 'DRAFT', count: 7 },
        ],
      };

      documentTypeService.getTypeStatistics.mockResolvedValue(stats);

      await documentTypeController.getTypeStatistics(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(stats);
    });
  });
});
