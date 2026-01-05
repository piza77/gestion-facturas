const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Modelo para Subcategorías de Presupuesto (Subrubros específicos)
 * Permite detallar cada rubro principal en aspectos más específicos
 */
class BudgetSubcategoryModel {
  
  static async create(data) {
    const budgetCategoryId = data.budgetCategoryId || data.budget_category_id;
    const name = data.name;
    const amount = parseFloat(data.amount) || 0;
    const description = data.description || null;
    const order = data.order || 1;

    if (!budgetCategoryId || !name) {
      throw new Error('La categoría de presupuesto y nombre de subcategoría son requeridos');
    }

    // Verificar que la categoría existe
    const category = await db.query(
      'SELECT id FROM budget_categories WHERE id = ?',
      [budgetCategoryId]
    );
    if (category.length === 0) {
      throw new Error('La categoría de presupuesto no existe');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO budget_subcategories 
       (id, budget_category_id, name, amount, description, display_order, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, budgetCategoryId, name, amount, description, order]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const subcategories = await db.query(
      'SELECT * FROM budget_subcategories WHERE id = ?',
      [id]
    );
    return subcategories[0] || null;
  }

  static async findByCategory(budgetCategoryId) {
    return await db.query(
      `SELECT * FROM budget_subcategories 
       WHERE budget_category_id = ? 
       ORDER BY display_order ASC, created_at ASC`,
      [budgetCategoryId]
    );
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(parseFloat(data.amount));
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.order);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    await db.query(
      `UPDATE budget_subcategories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM budget_subcategories WHERE id = ?', [id]);
    return true;
  }

  static async getTotalByCategory(budgetCategoryId) {
    const result = await db.query(
      'SELECT SUM(amount) as total FROM budget_subcategories WHERE budget_category_id = ?',
      [budgetCategoryId]
    );
    return result[0]?.total || 0;
  }

  // Sugerencias de subcategorías por tipo de rubro
  static getDefaultSubcategoriesByType(categoryName) {
    const defaults = {
      'Recursos Humanos': [
        'Salarios',
        'Prestaciones',
        'Bonificaciones',
        'Capacitación',
        'Otros'
      ],
      'Logística': [
        'Transporte',
        'Almacenamiento',
        'Empaques',
        'Distribución',
        'Otros'
      ],
      'Reembolsables': [
        'Viáticos',
        'Gastos de representación',
        'Combustible',
        'Hospedaje',
        'Otros'
      ],
      'Contratos': [
        'Servicios profesionales',
        'Consultorías',
        'Mantenimiento',
        'Licencias',
        'Otros'
      ],
      'Imprevistos': [
        'Emergencias',
        'Reparaciones',
        'Contingencias',
        'Otros'
      ]
    };

    return defaults[categoryName] || ['Otros'];
  }
}

module.exports = BudgetSubcategoryModel;
