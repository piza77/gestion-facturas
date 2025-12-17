const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class EmployeeModel {
  
  static async create(data) {
    // Aceptar tanto camelCase como snake_case
    const firstName = data.firstName || data.first_name;
    const lastName = data.lastName || data.last_name;
    const email = data.email;
    const phone = data.phone || null;
    const identificationType = data.identificationType || data.identification_type;
    const identificationNumber = data.identificationNumber || data.identification_number;
    const position = data.position;
    const department = data.department;
    let hireDate = data.hireDate || data.hire_date;
    const notes = data.notes || null;
    const userId = data.userId || data.user_id || null;

    // Validar campos requeridos
    if (!firstName || !lastName || !email || !identificationType || !identificationNumber || !position || !department || !hireDate) {
      throw new Error('Faltan campos requeridos');
    }

    // Formatear fecha ISO a YYYY-MM-DD
    if (hireDate && typeof hireDate === 'string' && hireDate.includes('T')) {
      hireDate = hireDate.split('T')[0];
    }

    // Verificar email único
    const existingEmail = await db.query(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      throw new Error('Ya existe un empleado con ese email');
    }

    // Verificar documento único
    const existingDoc = await db.query(
      'SELECT id FROM employees WHERE identification_number = ?',
      [identificationNumber]
    );
    if (existingDoc.length > 0) {
      throw new Error('Ya existe un empleado con ese número de documento');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO employees 
       (id, first_name, last_name, email, phone, identification_type, identification_number,
        position, department, hire_date, notes, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, firstName, lastName, email, phone, identificationType, identificationNumber,
       position, department, hireDate, notes, userId]
    );

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let sql = `SELECT * FROM employees WHERE 1=1`;
    const params = [];

    if (filters.search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? 
               OR email LIKE ? OR identification_number LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.department) {
      sql += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY first_name ASC, last_name ASC';

    return await db.query(sql, params);
  }

  static async findById(id) {
    const employees = await db.query(
      `SELECT * FROM employees WHERE id = ?`,
      [id]
    );
    return employees[0] || null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      let value = data[key];
      
      // Formatear fechas ISO a YYYY-MM-DD
      if ((key === 'hireDate' || key === 'hire_date') && value && typeof value === 'string') {
        if (value.includes('T')) {
          value = value.split('T')[0];
        }
      }
      
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = ?`);
      values.push(value);
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Verificar que no tenga facturas asociadas
    const invoices = await db.query(
      'SELECT COUNT(*) as count FROM invoices WHERE employee_id = ?',
      [id]
    );

    if (invoices[0].count > 0) {
      throw new Error('No se puede eliminar el empleado porque tiene facturas asociadas');
    }

    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM employees WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? 
               OR email LIKE ? OR identification_number LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.department) {
      sql += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters.costCenterId) {
      sql += ' AND cost_center_id = ?';
      params.push(filters.costCenterId);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    const result = await db.query(sql, params);
    return result[0].count;
  }

  static async getInvoices(id, limit = 10) {
    return await db.query(
      `SELECT i.* FROM invoices i
       WHERE i.employee_id = ?
       ORDER BY i.issue_date DESC
       LIMIT ?`,
      [id, limit]
    );
  }

  static async getStats(id) {
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_invoices,
         SUM(i.total) as total_amount,
         AVG(i.total) as average_amount,
         COUNT(DISTINCT i.provider_id) as provider_count
       FROM invoices i
       WHERE i.employee_id = ?`,
      [id]
    );
    return stats[0] || {};
  }
}

module.exports = EmployeeModel;
