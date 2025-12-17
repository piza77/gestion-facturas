const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class InvoiceModel {
  
  static async create(data) {
    // Limpiar los datos - convertir undefined a null
    const {
      invoice_number, invoice_type_id, provider_id, cost_center_id, employee_id, order_number,
      issue_date, due_date, subtotal, tax, discount, total, is_reimbursable,
      description, notes, createdBy, filePath, fileName,
      // Autorizaciones
      admin_director_approved, upstream_director_approved, hr_director_approved,
      finance_director_approved, general_director_approved,
      // Registro Contable
      accounting_municipality, accounting_registration_date, accounting_document_type,
      accounting_document_number, accounting_dian_number, accounting_observations,
      accounting_registered_by,
      // Análisis Contable
      analyst_good_seal_approved, analyst_review_date, analyst_xml_file_path,
      analyst_xml_file_name, analyst_observations, analyst_reviewed_by,
      // Control de Pago
      payment_date, payment_receipt_file_path, payment_receipt_file_name,
      payment_amount, payment_observations, payment_processed_by
    } = data;

    // Validar que los campos requeridos no sean null/undefined
    if (!invoice_number || !invoice_type_id || !provider_id || !cost_center_id || !issue_date) {
      throw new Error('Faltan campos requeridos');
    }

    const existing = await db.query(
      'SELECT id FROM invoices WHERE invoice_number = ?',
      [invoice_number]
    );
    if (existing.length > 0) {
      throw new Error('Ya existe una factura con ese número');
    }

    const id = uuidv4();
    
    // Preparar valores seguros para la query
    const values = [
      id,
      invoice_number || null,
      invoice_type_id || null,
      provider_id || null,
      cost_center_id || null,
      employee_id || null,
      order_number || null,
      issue_date || null,
      due_date || null,
      (subtotal !== undefined && subtotal !== null && subtotal !== '') ? parseFloat(subtotal) : 0,
      (tax !== undefined && tax !== null && tax !== '') ? parseFloat(tax) : 0,
      (discount !== undefined && discount !== null && discount !== '') ? parseFloat(discount) : 0,
      (total !== undefined && total !== null && total !== '') ? parseFloat(total) : 0,
      is_reimbursable ? 1 : 0,
      description || null,
      notes || null,
      createdBy || null,
      filePath || null,
      fileName || null,
      // Autorizaciones
      admin_director_approved ? 1 : 0,
      upstream_director_approved ? 1 : 0,
      hr_director_approved ? 1 : 0,
      finance_director_approved ? 1 : 0,
      general_director_approved ? 1 : 0,
      // Registro Contable
      accounting_municipality || null,
      accounting_registration_date || null,
      accounting_document_type || null,
      accounting_document_number || null,
      accounting_dian_number || null,
      accounting_observations || null,
      accounting_registered_by || null,
      // Análisis Contable
      analyst_good_seal_approved ? 1 : 0,
      analyst_review_date || null,
      analyst_xml_file_path || null,
      analyst_xml_file_name || null,
      analyst_observations || null,
      analyst_reviewed_by || null,
      // Control de Pago
      payment_date || null,
      payment_receipt_file_path || null,
      payment_receipt_file_name || null,
      (payment_amount !== undefined && payment_amount !== null && payment_amount !== '') ? parseFloat(payment_amount) : 0,
      payment_observations || null,
      payment_processed_by || null
    ];

    await db.query(
      `INSERT INTO invoices 
       (id, invoice_number, invoice_type_id, provider_id, cost_center_id, 
        employee_id, order_number, issue_date, due_date, subtotal, tax, discount, total,
        is_reimbursable, description, notes, created_by, file_path, file_name,
        admin_director_approved, upstream_director_approved, hr_director_approved,
        finance_director_approved, general_director_approved,
        accounting_municipality, accounting_registration_date, accounting_document_type,
        accounting_document_number, accounting_dian_number, accounting_observations,
        accounting_registered_by,
        analyst_good_seal_approved, analyst_review_date, analyst_xml_file_path,
        analyst_xml_file_name, analyst_observations, analyst_reviewed_by,
        payment_date, payment_receipt_file_path, payment_receipt_file_name,
        payment_amount, payment_observations, payment_processed_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      values
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
      // Si la clave ya está en snake_case, usarla tal cual
      // Si está en camelCase, convertir a snake_case
      let snakeKey = key;
      if (key.includes('_')) {
        snakeKey = key;
      } else {
        snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      }
      
      let value = data[key];
      
      // Convertir string "null" a null
      if (value === 'null' || value === '') {
        value = null;
      }
      
      // Convertir strings numéricos a números
      if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
        value = parseFloat(value);
      }
      
      fields.push(`${snakeKey} = ?`);
      values.push(value);
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
    // Validar transiciones de estado permitidas
    const validStatuses = {
      'pending': 'Pendiente',
      'filed': 'Radicado',
      'accounted': 'Contabilizado',
      'paid': 'Pagado',
      'cancelled': 'Cancelado'
    };

    if (!validStatuses[status]) {
      throw new Error(`Estado no válido: ${status}`);
    }

    const invoice = await this.findById(id);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Validar transiciones permitidas
    const allowedTransitions = {
      'pending': ['filed', 'cancelled'],
      'filed': ['accounted', 'cancelled'],
      'accounted': ['paid', 'cancelled'],
      'paid': []  // El estado pagado es final
    };

    // Validar que el estado actual tenga la transición permitida
    const currentStatus = invoice.status;
    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(status)) {
      throw new Error(`No se puede cambiar de ${currentStatus} a ${status}`);
    }

    const updates = {
      status,
      updated_at: new Date()
    };

    // Registrar la transición de estado
    if (status === 'filed') {
      updates.filed_at = new Date();
      updates.filed_by = userId;
    } else if (status === 'accounted') {
      updates.accounted_at = new Date();
      updates.accounted_by = userId;
    } else if (status === 'paid') {
      updates.paid_at = new Date();
      updates.paid_by = userId;
    }

    if (reason) {
      updates.rejection_reason = reason;
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