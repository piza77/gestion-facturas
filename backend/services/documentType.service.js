const { DocumentType, Document, User } = require('../models');

class DocumentTypeService {
  async getAllTypes(filters = {}) {
    const where = { isActive: true };
    
    if (filters.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { code: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    return DocumentType.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['name', 'ASC']],
    });
  }

  async getTypeById(id) {
    const type = await DocumentType.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'name', 'email'] },
        { model: Document, as: 'documents' },
      ],
    });

    if (!type) {
      throw new Error(`Tipo de documento con ID ${id} no encontrado`);
    }

    return type;
  }

  async getTypeByCode(code) {
    return DocumentType.findOne({
      where: { code, isActive: true },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });
  }

  async createType(data, userId) {
    const { name, code, description, prefix, fields } = data;

    // Validar código único
    const existingCode = await DocumentType.findOne({ where: { code } });
    if (existingCode) {
      throw new Error(`Código ${code} ya existe`);
    }

    // Validar nombre único
    const existingName = await DocumentType.findOne({ where: { name } });
    if (existingName) {
      throw new Error(`Nombre ${name} ya existe`);
    }

    // Validar estructura de campos
    if (fields && Array.isArray(fields)) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!field.name || !field.label || !field.type) {
          throw new Error(`Campo ${i} incompleto: requiere name, label, type`);
        }
      }
    }

    const newType = await DocumentType.create({
      name,
      code,
      description,
      prefix: prefix || code.substring(0, 3).toUpperCase(),
      fields: fields || [],
      createdBy: userId,
    });

    return this.getTypeById(newType.id);
  }

  async updateType(id, data, userId) {
    const type = await DocumentType.findByPk(id);
    if (!type) {
      throw new Error(`Tipo de documento con ID ${id} no encontrado`);
    }

    const { name, description, prefix, fields, isActive } = data;

    // Si se actualiza nombre, validar unicidad
    if (name && name !== type.name) {
      const existing = await DocumentType.findOne({ where: { name } });
      if (existing) {
        throw new Error(`Nombre ${name} ya existe`);
      }
    }

    // Validar nueva estructura de campos
    if (fields && Array.isArray(fields)) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!field.name || !field.label || !field.type) {
          throw new Error(`Campo ${i} incompleto: requiere name, label, type`);
        }
      }
    }

    await type.update({
      name: name || type.name,
      description: description !== undefined ? description : type.description,
      prefix: prefix || type.prefix,
      fields: fields !== undefined ? fields : type.fields,
      isActive: isActive !== undefined ? isActive : type.isActive,
      updatedBy: userId,
    });

    return this.getTypeById(id);
  }

  async deleteType(id, userId) {
    const type = await DocumentType.findByPk(id);
    if (!type) {
      throw new Error(`Tipo de documento con ID ${id} no encontrado`);
    }

    // Verificar si tiene documentos activos
    const activeDocuments = await Document.count({
      where: { documentTypeId: id, status: 'ACTIVE' },
    });

    if (activeDocuments > 0) {
      throw new Error(`No se puede eliminar: tiene ${activeDocuments} documento(s) activo(s)`);
    }

    await type.update({
      isActive: false,
      updatedBy: userId,
    });

    return { message: 'Tipo de documento desactivado' };
  }

  async getNextFolio(documentTypeId) {
    const type = await DocumentType.findByPk(documentTypeId);
    if (!type) {
      throw new Error(`Tipo de documento con ID ${documentTypeId} no encontrado`);
    }

    const folio = `${type.prefix}${String(type.nextSequence).padStart(6, '0')}`;

    await type.update({
      nextSequence: type.nextSequence + 1,
    });

    return { folio, sequence: type.nextSequence };
  }

  async getTypeStatistics(id) {
    const type = await DocumentType.findByPk(id);
    if (!type) {
      throw new Error(`Tipo de documento con ID ${id} no encontrado`);
    }

    const stats = await Document.findAll({
      where: { documentTypeId: id },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    return {
      documentType: type.name,
      totalSequence: type.nextSequence - 1,
      totalFields: type.fields.length,
      documentsByStatus: stats,
    };
  }
}

module.exports = new DocumentTypeService();
