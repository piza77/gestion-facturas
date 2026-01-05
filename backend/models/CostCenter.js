const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class CostCenterModel {
  
  static async create(data) {
    // Aceptar tanto camelCase como snake_case
    const name = data.name;
    const code = data.code;
    const description = data.description || null;
    const responsibleId = data.responsibleId || data.responsible_id || null;
    const budget = data.budget || 0;
    const isActive = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : 1);
    const clientId = data.clientId || data.client_id || null;
    const contractNumber = data.contractNumber || data.contract_number || null;
    const clientNit = data.clientNit || data.client_nit || null;

    // Validar campos requeridos
    if (!name || !code) {
      throw new Error('El nombre y código del centro de costo son requeridos');
    }

    // Verificar código único
    const existing = await db.query(
      'SELECT id FROM cost_centers WHERE code = ?',
      [code]
    );
    if (existing.length > 0) {
      throw new Error('Ya existe un centro de costo con ese código');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO cost_centers 
       (id, code, name, description, responsible_id, budget, is_active, client_id, contract_number, client_nit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, code, name, description, responsibleId, budget, isActive ? 1 : 0, clientId, contractNumber, clientNit]
    );

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM cost_centers WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (name LIKE ? OR code LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    sql += ' ORDER BY code ASC';


    return await db.query(sql, params);
  }

  static async findById(id) {
    const centers = await db.query(
      'SELECT * FROM cost_centers WHERE id = ?',
      [id]
    );
    return centers[0] || null;
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
      `UPDATE cost_centers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Verificar que no tenga empleados asociados
    const employees = await db.query(
      'SELECT COUNT(*) as count FROM employees WHERE cost_center_id = ?',
      [id]
    );

    if (employees[0].count > 0) {
      throw new Error('No se puede eliminar el centro de costo porque tiene empleados asociados');
    }

    // Verificar que no tenga facturas
    const invoices = await db.query(
      'SELECT COUNT(*) as count FROM invoices WHERE cost_center_id = ?',
      [id]
    );

    if (invoices[0].count > 0) {
      throw new Error('No se puede eliminar el centro de costo porque tiene facturas asociadas');
    }

    await db.query('DELETE FROM cost_centers WHERE id = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM cost_centers WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (name LIKE ? OR code LIKE ? OR manager LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    const result = await db.query(sql, params);
    return result[0].count;
  }

  static async getEmployees(id, limit = 50) {
    return await db.query(
      `SELECT e.* FROM employees e
       WHERE e.cost_center_id = ?
       ORDER BY e.first_name ASC, e.last_name ASC
       LIMIT ?`,
      [id, limit]
    );
  }

  static async getInvoices(id, limit = 20) {
    return await db.query(
      `SELECT i.* FROM invoices i
       WHERE i.cost_center_id = ?
       ORDER BY i.issue_date DESC
       LIMIT ?`,
      [id, limit]
    );
  }

  static async getStats(id) {
    const stats = await db.query(
      `SELECT 
         COUNT(DISTINCT e.id) as employee_count,
         COUNT(DISTINCT i.id) as invoice_count,
         SUM(i.total) as total_amount,
         AVG(i.total) as average_amount
       FROM cost_centers cc
       LEFT JOIN employees e ON cc.id = e.cost_center_id
       LEFT JOIN invoices i ON cc.id = i.cost_center_id
       WHERE cc.id = ?`,
      [id]
    );
    return stats[0] || {};
  }

  static async getSummary() {
    return await db.query(
      `SELECT 
         cc.id,
         cc.name,
         cc.code,
         cc.budget,
         COALESCE(cc.spent, 0) as total_spent,
         CAST(ROUND((COALESCE(cc.spent, 0) / cc.budget * 100), 2) AS DECIMAL(10, 2)) as budget_used_percentage
       FROM cost_centers cc
       WHERE cc.is_active = 1
       ORDER BY cc.name ASC`
    );
  }
}

module.exports = CostCenterModel;
