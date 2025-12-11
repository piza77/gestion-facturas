const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../config/database');

class UserModel {
  
  static async create(data) {
    // Limpiar datos undefined
    const cleanData = {};
    Object.keys(data).forEach(key => {
      cleanData[key] = data[key] !== undefined ? data[key] : null;
    });

    const {
      name, email, password, role, isActive, notes
    } = cleanData;

    // Si viene 'name', dividirlo en firstName y lastName
    let firstName = '';
    let lastName = '';
    
    if (name) {
      const nameParts = String(name).trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Verificar email único
    const existing = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    const id = uuidv4();
    const isActiveValue = isActive !== false ? 1 : 0;
    const notesValue = notes === null ? null : (notes ? String(notes) : null);

    await db.query(
      `INSERT INTO users 
       (id, first_name, last_name, email, password, role, is_active, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, firstName, lastName, email, hashedPassword, 
       role || 'user', isActiveValue, notesValue]
    );

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT id, first_name, last_name, 
             CONCAT(first_name, ' ', last_name) as name,
             email, role, 
             is_active, created_at, updated_at, last_login
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    sql += ' ORDER BY first_name ASC, last_name ASC';

    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await db.query(sql, params);
  }

  static async findById(id) {
    const users = await db.query(
      `SELECT id, first_name, last_name,
              CONCAT(first_name, ' ', last_name) as name,
              email, role, 
              is_active, created_at, updated_at, last_login
       FROM users 
       WHERE id = ?`,
      [id]
    );
    return users[0] || null;
  }

  static async findByEmail(email) {
    const users = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    // Procesar campos especiales
    if (data.name) {
      const nameParts = data.name.trim().split(' ');
      fields.push('first_name = ?');
      values.push(nameParts[0] || '');
      fields.push('last_name = ?');
      values.push(nameParts.slice(1).join(' ') || '');
    }

    // No permitir actualizar password directamente desde aquí
    Object.keys(data).forEach(key => {
      if (key === 'password' || key === 'name') return;
      
      // Validar que el valor no sea undefined
      if (data[key] === undefined) {
        data[key] = null;
      }
      
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = ?`);
      values.push(data[key]);
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    // Verificar que no sea el último admin
    const user = await this.findById(id);
    if (user.role === 'admin') {
      const adminCount = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );
      if (adminCount[0].count <= 1) {
        throw new Error('No se puede eliminar el último administrador');
      }
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    const result = await db.query(sql, params);
    return result[0].count;
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async getInvoices(id, limit = 20) {
    return await db.query(
      `SELECT i.* FROM invoices i
       WHERE i.created_by = ?
       ORDER BY i.created_at DESC
       LIMIT ?`,
      [id, limit]
    );
  }

  static async getStats(id) {
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_invoices,
         SUM(i.total) as total_amount,
         AVG(i.total) as average_amount
       FROM invoices i
       WHERE i.created_by = ?`,
      [id]
    );
    return stats[0] || {};
  }
}

module.exports = UserModel;
