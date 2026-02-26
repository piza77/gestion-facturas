const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Modelo para Categorías de Presupuesto (Rubros principales)
 * Rubros estándar: Recursos Humanos, Logística, Reembolsables, Contratos, Imprevistos, etc.
 */
class BudgetCategoryModel {
  
  static async create(data) {
    const costCenterId = data.costCenterId || data.cost_center_id;
    const name = data.name;
    const amount = parseFloat(data.amount) || 0;
    const description = data.description || null;
    const percentage = parseFloat(data.percentage) || 0;
    const order = data.order || 1;

    if (!costCenterId || !name) {
      throw new Error('El centro de costo y nombre de categoría son requeridos');
    }

    // Verificar que el centro de costo existe
    const center = await db.query(
      'SELECT id FROM cost_centers WHERE id = ?',
      [costCenterId]
    );
    if (center.length === 0) {
      throw new Error('El centro de costo no existe');
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO budget_categories 
       (id, cost_center_id, name, amount, percentage, description, display_order, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, costCenterId, name, amount, percentage, description, order]
    );

    return this.findById(id);
  }

  static async findById(id) {
    const categories = await db.query(
      'SELECT * FROM budget_categories WHERE id = ?',
      [id]
    );
    return categories[0] || null;
  }

  // Nuevo método para agregar gasto ejecutado
  static async addExpense(categoryId, expenseAmount, description = null) {
    const category = await this.findById(categoryId);
    if (!category) {
      throw new Error('Categoría de presupuesto no encontrada');
    }

    const newExecutedAmount = (category.executed_amount || 0) + parseFloat(expenseAmount);
    
    await db.query(
      `UPDATE budget_categories 
       SET executed_amount = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newExecutedAmount, categoryId]
    );

    // Registrar el movimiento en un log de gastos
    await db.query(
      `INSERT INTO budget_expenses 
       (id, category_id, amount, description, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), categoryId, expenseAmount, description]
    );

    return this.findById(categoryId);
  }

  // Obtener estadísticas de ejecución
  static async getExecutionStats(costCenterId) {
    const stats = await db.query(
      `SELECT 
         SUM(amount) as total_budget,
         SUM(executed_amount) as total_executed,
         SUM(amount - executed_amount) as total_remaining,
         COUNT(*) as categories_count
       FROM budget_categories 
       WHERE cost_center_id = ?`,
      [costCenterId]
    );

    const categories = await this.findByCostCenter(costCenterId);
    
    return {
      summary: stats[0] || {},
      categories: categories.map(cat => ({
        ...cat,
        remaining_amount: (cat.amount || 0) - (cat.executed_amount || 0),
        execution_percentage: cat.amount > 0 ? ((cat.executed_amount || 0) / cat.amount * 100) : 0
      }))
    };
  }

  static async findByCostCenter(costCenterId) {
    return await db.query(
      `SELECT * FROM budget_categories 
       WHERE cost_center_id = ? 
       ORDER BY display_order ASC, created_at ASC`,
      [costCenterId]
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
    if (data.percentage !== undefined) {
      fields.push('percentage = ?');
      values.push(parseFloat(data.percentage));
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
      `UPDATE budget_categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Verificar que no tenga subcategorías
    const subcategories = await db.query(
      'SELECT COUNT(*) as count FROM budget_subcategories WHERE budget_category_id = ?',
      [id]
    );

    if (subcategories[0].count > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene subcategorías asociadas');
    }

    await db.query('DELETE FROM budget_categories WHERE id = ?', [id]);
    return true;
  }

  static async getTotalByCostCenter(costCenterId) {
    const result = await db.query(
      'SELECT SUM(amount) as total FROM budget_categories WHERE cost_center_id = ?',
      [costCenterId]
    );
    return result[0]?.total || 0;
  }

  static async getWithSubcategories(id) {
    const category = await this.findById(id);
    if (!category) return null;

    const subcategories = await db.query(
      `SELECT * FROM budget_subcategories 
       WHERE budget_category_id = ? 
       ORDER BY display_order ASC`,
      [id]
    );

    return {
      ...category,
      subcategories
    };
  }

  // Método para agregar monto ejecutado (para items)
  static async addExecutedAmount(categoryId, amount) {
    await db.query(
      `UPDATE budget_categories 
       SET executed_amount = executed_amount + ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [amount, categoryId]
    );
  }

  // Presupuestos predeterminados del sistema
  static getDefaultCategories() {
    return [
      { name: 'Recursos Humanos', icon: 'users', color: '#3b82f6' },
      { name: 'Logística', icon: 'truck', color: '#8b5cf6' },
      { name: 'Reembolsables', icon: 'receipt', color: '#ec4899' },
      { name: 'Contratos', icon: 'file-text', color: '#f59e0b' },
      { name: 'Imprevistos', icon: 'alert-circle', color: '#ef4444' },
      { name: 'Otros', icon: 'more-horizontal', color: '#6b7280' }
    ];
  }
}

module.exports = BudgetCategoryModel;
