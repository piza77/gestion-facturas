const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class InvoiceModel {
  
  static async create(data) {
    const {
      invoiceNumber, invoiceTypeId, providerId, costCenterId, employeeId,
      issueDate, dueDate, subtotal, tax, discount, total,
      description, notes, createdBy, filePath, fileName
    } = data;

    const existing = await db.query(
      'SELECT id FROM invoices WHERE invoice_number = ?',
      [invoiceNumber]
    );
    if (existing.length > 0) {
      throw new Error('Ya existe una factura con ese número');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO invoices 
       (id, invoice_number, invoice_type_id, provider_id, cost_center_id, 
        employee_id, issue_date, due_date, subtotal, tax, discount, total,
        description, notes, created_by, file_path, file_name, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, invoiceNumber, invoiceTypeId, providerId, costCenterId, employeeId,
       issueDate, dueDate, subtotal, tax || 0, discount || 0, total,
       description, notes, createdBy, filePath, fileName]
    );

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT i.*,
             it.name as invoice_type_name,
             p.business_name as provider_name,
             p.nit as provider_nit,
             cc.name as cost_center_name,
             cc.code as cost_center_code,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM invoices i
      LEFT JOIN invoice_types it ON i.invoice_type_id = it.id
      LEFT JOIN providers p ON i.provider_id = p.id
      LEFT JOIN cost_centers cc ON i.cost_center_id = cc.id
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      sql += ` AND (i.invoice_number LIKE ? OR i.description LIKE ? 
               OR p.business_name LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.status) {
      sql += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.providerId) {
      sql += ' AND i.provider_id = ?';
      params.push(filters.providerId);
    }

    if (filters.costCenterId) {
      sql += ' AND i.cost_center_id = ?';
      params.push(filters.costCenterId);
    }

    if (filters.invoiceTypeId) {
      sql += ' AND i.invoice_type_id = ?';
      params.push(filters.invoiceTypeId);
    }

    if (filters.startDate) {
      sql += ' AND i.issue_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND i.issue_date <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY i.issue_date DESC, i.created_at DESC';


    return await db.query(sql, params);
  }

  static async findById(id) {
    const invoices = await db.query(
      `SELECT i.*,
              it.name as invoice_type_name,
              p.business_name as provider_name,
              p.nit as provider_nit,
              p.contact_name as provider_contact,
              p.phone as provider_phone,
              cc.name as cost_center_name,
              cc.code as cost_center_code,
              CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
              CONCAT(a.first_name, ' ', a.last_name) as approved_by_name
       FROM invoices i
       LEFT JOIN invoice_types it ON i.invoice_type_id = it.id
       LEFT JOIN providers p ON i.provider_id = p.id
       LEFT JOIN cost_centers cc ON i.cost_center_id = cc.id
       LEFT JOIN employees e ON i.employee_id = e.id
       LEFT JOIN users u ON i.created_by = u.id
       LEFT JOIN users a ON i.approved_by = a.id
       WHERE i.id = ?`,
      [id]
    );
    return invoices[0] || null;
  }

  static async update(id, data, userId) {
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
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async updateStatus(id, status, userId, reason = null) {
    const updates = {
      status,
      approved_by: userId,
      approved_at: new Date()
    };

    if (reason) {
      updates.rejection_reason = reason;
    }

    if (status === 'paid') {
      updates.payment_date = new Date();
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`);
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM invoices WHERE id = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM invoices i WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (i.invoice_number LIKE ? OR i.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.status) {
      sql += ' AND i.status = ?';
      params.push(filters.status);
    }

    const result = await db.query(sql, params);
    return result[0].total;
  }

  static async getStats(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total) as total_amount,
        SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'approved' THEN total ELSE 0 END) as approved_amount,
        SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END) as overdue_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices
      WHERE 1=1
    `;
    const params = [];

    if (filters.startDate) {
      sql += ' AND issue_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND issue_date <= ?';
      params.push(filters.endDate);
    }

    const result = await db.query(sql, params);
    return result[0];
  }

  static async getByMonth(year) {
    return await db.query(
      `SELECT 
         MONTH(issue_date) as month,
         COUNT(*) as invoice_count,
         SUM(total) as total_amount
       FROM invoices
       WHERE YEAR(issue_date) = ? AND status != 'cancelled'
       GROUP BY MONTH(issue_date)
       ORDER BY month`,
      [year]
    );
  }

  static async getTopProviders(limit = 10) {
    return await db.query(
      `SELECT 
         p.id,
         p.business_name,
         COUNT(i.id) as invoice_count,
         SUM(i.total) as total_amount
       FROM providers p
       JOIN invoices i ON p.id = i.provider_id
       WHERE i.status != 'cancelled'
       GROUP BY p.id, p.business_name
       ORDER BY total_amount DESC
       LIMIT ?`,
      [limit]
    );
  }
}

module.exports = InvoiceModel;