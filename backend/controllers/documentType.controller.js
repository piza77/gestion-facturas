const documentTypeService = require('../services/documentType.service');

class DocumentTypeController {
  async getAllDocumentTypes(req, res) {
    try {
      const { search } = req.query;
      const types = await documentTypeService.getAllTypes({ search });
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDocumentTypeById(req, res) {
    try {
      const { id } = req.params;
      const type = await documentTypeService.getTypeById(id);
      res.json(type);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getDocumentTypeByCode(req, res) {
    try {
      const { code } = req.params;
      const type = await documentTypeService.getTypeByCode(code);
      if (!type) {
        return res.status(404).json({ error: 'Tipo no encontrado' });
      }
      res.json(type);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createDocumentType(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden crear tipos' });
      }

      const newType = await documentTypeService.createType(req.body, req.user.id);
      res.status(201).json(newType);
    } catch (error) {
      if (error.message.includes('ya existe') || error.message.includes('incompleto')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateDocumentType(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden actualizar' });
      }

      const { id } = req.params;
      const type = await documentTypeService.updateType(id, req.body, req.user.id);
      res.json(type);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('ya existe') || error.message.includes('incompleto')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDocumentType(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden eliminar' });
      }

      const { id } = req.params;
      const result = await documentTypeService.deleteType(id, req.user.id);
      res.json(result);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('No se puede eliminar')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getNextFolio(req, res) {
    try {
      const { documentTypeId } = req.params;
      const result = await documentTypeService.getNextFolio(documentTypeId);
      res.json(result);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getTypeStatistics(req, res) {
    try {
      const { id } = req.params;
      const stats = await documentTypeService.getTypeStatistics(id);
      res.json(stats);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DocumentTypeController();
