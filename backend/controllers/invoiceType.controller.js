const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class InvoiceTypeController {
  
  // ✅ GET: Obtener todos los tipos (público, requiere auth)
  static async getAll(req, res) {
    try {
      const types = await db.query(
        'SELECT id, code, name, description, is_active, created_at FROM invoice_types ORDER BY name ASC'
      );
      res.json({ invoiceTypes: types });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener tipos de factura' });
    }
  }

  // ✅ GET: Obtener un tipo por ID (público, requiere auth)
  static async getById(req, res) {
    try {
      const types = await db.query(
        'SELECT * FROM invoice_types WHERE id = ?',
        [req.params.id]
      );
      
      if (types.length === 0) {
        return res.status(404).json({ error: 'Tipo de factura no encontrado' });
      }
      
      res.json({ invoiceType: types[0] });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tipo de factura' });
    }
  }

  // 🆕 POST: Crear nuevo tipo (solo admin)
  static async create(req, res) {
    try {
      const { code, name, description, isActive } = req.body;

      // Validaciones
      if (!code || !name) {
        return res.status(422).json({ 
          error: 'Faltan campos requeridos: code, name' 
        });
      }

      // Verificar que código sea único
      const existing = await db.query(
        'SELECT id FROM invoice_types WHERE code = ?',
        [code.toUpperCase()]
      );

      if (existing.length > 0) {
        return res.status(409).json({ 
          error: `Ya existe un tipo con código "${code}"` 
        });
      }

      // Crear tipo
      await db.query(
        `INSERT INTO invoice_types (code, name, description, is_active, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [code.toUpperCase(), name, description || null, isActive !== false ? 1 : 0, req.user.id]
      );

      // Obtener el tipo creado
      const created = await db.query(
        'SELECT * FROM invoice_types WHERE code = ?',
        [code.toUpperCase()]
      );

      res.status(201).json({ 
        message: 'Tipo de factura creado exitosamente',
        invoiceType: created[0]
      });

    } catch (error) {
      console.error('Error creando tipo:', error);
      res.status(500).json({ error: 'Error al crear tipo de factura' });
    }
  }

  // 🆕 PUT: Actualizar tipo (solo admin)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      // Verificar que existe
      const existing = await db.query(
        'SELECT * FROM invoice_types WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Tipo de factura no encontrado' });
      }

      // No permitir cambiar código
      await db.query(
        `UPDATE invoice_types 
         SET name = ?, description = ?, is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [name || existing[0].name, description || null, isActive !== undefined ? isActive : existing[0].is_active, id]
      );

      // Obtener actualizado
      const updated = await db.query(
        'SELECT * FROM invoice_types WHERE id = ?',
        [id]
      );

      res.json({ 
        message: 'Tipo de factura actualizado exitosamente',
        invoiceType: updated[0]
      });

    } catch (error) {
      console.error('Error actualizando tipo:', error);
      res.status(500).json({ error: 'Error al actualizar tipo de factura' });
    }
  }

  // 🆕 DELETE: Eliminar tipo (solo admin - soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe y no está en uso
      const type = await db.query(
        'SELECT * FROM invoice_types WHERE id = ?',
        [id]
      );

      if (type.length === 0) {
        return res.status(404).json({ error: 'Tipo de factura no encontrado' });
      }

      // Verificar si hay facturas con este tipo
      const invoices = await db.query(
        'SELECT COUNT(*) as count FROM invoices WHERE invoice_type_id = ?',
        [id]
      );

      if (invoices[0].count > 0) {
        return res.status(409).json({ 
          error: `No se puede eliminar. Hay ${invoices[0].count} factura(s) usando este tipo` 
        });
      }

      // Soft delete - marcar como inactivo
      await db.query(
        'UPDATE invoice_types SET is_active = false, updated_at = NOW() WHERE id = ?',
        [id]
      );

      res.json({ 
        message: 'Tipo de factura desactivado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando tipo:', error);
      res.status(500).json({ error: 'Error al eliminar tipo de factura' });
    }
  }

  // 🆕 GET: Obtener campos requeridos por tipo
  static async getFieldsByType(req, res) {
    try {
      const { code } = req.params;

      // Mapeo de campos por tipo
      const fieldMap = {
        'FC': {
          name: 'Factura Comercial',
          requiredFields: [
            'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
            'subtotal', 'total'
          ],
          optionalFields: [
            'employeeId', 'orderNumber', 'dueDate', 'tax', 'discount',
            'description', 'notes', 'isReimbursable'
          ],
          advancedSections: [
            'authorizations', 'accounting', 'analysis', 'payment'
          ]
        },
        'CC': {
          name: 'Nota Crédito',
          requiredFields: [
            'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
            'subtotal', 'reason', 'total'
          ],
          optionalFields: [
            'employeeId', 'dueDate', 'tax', 'discount',
            'description', 'notes'
          ],
          advancedSections: [
            'authorizations', 'accounting', 'analysis'
          ]
        },
        'ND': {
          name: 'Nota Débito',
          requiredFields: [
            'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
            'subtotal', 'reason', 'total'
          ],
          optionalFields: [
            'employeeId', 'dueDate', 'tax',
            'description', 'notes'
          ],
          advancedSections: [
            'authorizations', 'accounting', 'analysis'
          ]
        },
        'SP': {
          name: 'Soporte',
          requiredFields: [
            'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
            'serviceDescription', 'subtotal', 'total'
          ],
          optionalFields: [
            'employeeId', 'dueDate', 'tax', 'discount',
            'notes'
          ],
          advancedSections: [
            'authorizations', 'payment'
          ]
        }
      };

      const fields = fieldMap[code.toUpperCase()];
      
      if (!fields) {
        return res.status(404).json({ error: 'Tipo de documento desconocido' });
      }

      res.json(fields);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener campos del tipo' });
    }
  }

}

module.exports = InvoiceTypeController;
