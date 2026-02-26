const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Modelo para Items de Categorías de Presupuesto
 * Representa elementos específicos dentro de una categoría
 * Ej: En Logística -> Compra de herramientas, transporte, etc.
 *     En RH -> Contratación auxiliar, profesional, etc.
 */
class BudgetItemModel {
  
  static async create(data) {
    const categoryId = data.categoryId || data.category_id;
    const name = data.name;
    const amount = parseFloat(data.amount) || 0;
    const description = data.description || null;
    const itemType = data.itemType || data.item_type || 'otro';
    const createdBy = data.createdBy || data.created_by || null;

    if (!categoryId || !name || amount <= 0) {
      throw new Error('La categoría, nombre y monto son requeridos y el monto debe ser mayor a 0');
    }

    // Verificar que la categoría existe
    const category = await db.query(
      'SELECT id FROM budget_categories WHERE id = ?',
      [categoryId]
    );
    if (category.length === 0) {
      throw new Error('La categoría de presupuesto no existe');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO budget_items 
       (id, category_id, name, description, amount, item_type, created_by, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())`,
      [id, categoryId, name, description, amount, itemType, createdBy]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const items = await db.query(
      'SELECT * FROM budget_items WHERE id = ?',
      [id]
    );
    return items[0] || null;
  }

  static async findByCategory(categoryId) {
    const items = await db.query(
      `SELECT * FROM budget_items 
       WHERE category_id = ? 
       ORDER BY created_at DESC`,
      [categoryId]
    );
    return items;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM budget_items WHERE 1=1';
    const params = [];

    if (filters.categoryId) {
      query += ' AND category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.itemType) {
      query += ' AND item_type = ?';
      params.push(filters.itemType);
    }

    query += ' ORDER BY created_at DESC';

    return await db.query(query, params);
  }

  static async update(id, data) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('El item no existe');
    }

    const updateData = {
      name: data.name !== undefined ? data.name : item.name,
      description: data.description !== undefined ? data.description : item.description,
      amount: data.amount !== undefined ? parseFloat(data.amount) : item.amount,
      item_type: data.itemType || data.item_type || item.item_type,
      status: data.status || item.status,
      updated_at: new Date()
    };

    if (updateData.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    await db.query(
      `UPDATE budget_items 
       SET name = ?, description = ?, amount = ?, item_type = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [updateData.name, updateData.description, updateData.amount, updateData.item_type, updateData.status, id]
    );

    return this.findById(id);
  }

  static async delete(id) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('El item no existe');
    }

    await db.query('DELETE FROM budget_items WHERE id = ?', [id]);
    return { success: true, message: 'Item eliminado correctamente' };
  }

  static async updateStatus(id, status) {
    const validStatuses = ['pendiente', 'aprobado', 'ejecutado', 'cancelado'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const item = await this.findById(id);
    if (!item) {
      throw new Error('El item no existe');
    }

    await db.query(
      'UPDATE budget_items SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    return this.findById(id);
  }

  static async getItemsSummary(categoryId) {
    const items = await this.findByCategory(categoryId);
    
    const summary = {
      total_items: items.length,
      total_amount: 0,
      by_status: {
        pendiente: 0,
        aprobado: 0,
        ejecutado: 0,
        cancelado: 0
      },
      by_type: {},
      items: items
    };

    items.forEach(item => {
      summary.total_amount += parseFloat(item.amount) || 0;
      summary.by_status[item.status]++;
      
      if (!summary.by_type[item.item_type]) {
        summary.by_type[item.item_type] = { count: 0, amount: 0 };
      }
      summary.by_type[item.item_type].count++;
      summary.by_type[item.item_type].amount += parseFloat(item.amount) || 0;
    });

    return summary;
  }

  static async approveItem(id, approvedBy, comments = '') {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('El item no existe');
    }

    // Crear registro de aprobación
    const approvalId = uuidv4();
    await db.query(
      `INSERT INTO budget_item_approvals 
       (id, item_id, approved_by, approved_at, comments) 
       VALUES (?, ?, ?, NOW(), ?)`,
      [approvalId, id, approvedBy, comments]
    );

    // Actualizar estado del item
    await this.updateStatus(id, 'aprobado');

    return this.findById(id);
  }
}

module.exports = BudgetItemModel;
