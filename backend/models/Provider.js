const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class ProviderModel {
  
  static async create(data) {
    const {
      businessName, nit, contactName, phone, email,
      address, city, country, category, paymentTerms, notes
    } = data;

    // Verificar NIT único
    const existing = await db.query('SELECT id FROM providers WHERE nit = ?', [nit]);
    if (existing.length > 0) {
      throw new Error('Ya existe un proveedor con ese NIT');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO providers 
       (id, business_name, nit, contact_name, phone, email, address, 
        city, country, category, payment_terms, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, businessName, nit, contactName, phone, email, address, 
       city, country || 'Colombia', category, paymentTerms || 30, notes]
    );

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM providers WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (business_name LIKE ? OR nit LIKE ? OR contact_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    sql += ' ORDER BY business_name ASC';

    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await db.query(sql, params);
  }

  static async findById(id) {
    const providers = await db.query('SELECT * FROM providers WHERE id = ?', [id]);
    return providers[0] || null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = ?`);
      values.push(data[key]);
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.query(
      `UPDATE providers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Verificar que no tenga facturas
    const invoices = await db.query(
      'SELECT COUNT(*) as count FROM invoices WHERE provider_id = ?',
      [id]
    );

    if (invoices[0].count > 0) {
      throw new Error('No se puede eliminar el proveedor porque tiene facturas asociadas');
    }

    await db.query('DELETE FROM providers WHERE id = ?', [id]);
    return true;
  }

  static async getInvoices(providerId, limit = 10) {
    return await db.query(
      `SELECT i.*, it.name as invoice_type_name 
       FROM invoices i
       LEFT JOIN invoice_types it ON i.invoice_type_id = it.id
       WHERE i.provider_id = ?
       ORDER BY i.issue_date DESC
       LIMIT ?`,
      [providerId, limit]
    );
  }

  static async getStats(providerId) {
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_invoices,
         SUM(total) as total_amount,
         SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as paid_amount,
         SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END) as pending_amount
       FROM invoices
       WHERE provider_id = ?`,
      [providerId]
    );
    return stats[0];
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM providers WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (business_name LIKE ? OR nit LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    const result = await db.query(sql, params);
    return result[0].total;
  }
}

module.exports = ProviderModel;