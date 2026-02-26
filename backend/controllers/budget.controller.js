const BudgetCategoryModel = require('../models/BudgetCategory');
const BudgetSubcategoryModel = require('../models/BudgetSubcategory');
const CostCenterModel = require('../models/CostCenter');
const BudgetItemModel = require('../models/BudgetItem');

/**
 * CATEGORÍAS DE PRESUPUESTO (RUBROS)
 */

exports.createBudgetCategory = async (req, res) => {
  try {
    const { costCenterId, name, amount, percentage, description, order } = req.body;

    if (!costCenterId || !name) {
      return res.status(400).json({ 
        error: 'El centro de costo y nombre de categoría son requeridos' 
      });
    }

    const category = await BudgetCategoryModel.create({
      costCenterId,
      name,
      amount: parseFloat(amount) || 0,
      percentage: parseFloat(percentage) || 0,
      description,
      order: parseInt(order) || 1
    });

    res.status(201).json({
      message: 'Categoría de presupuesto creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getBudgetCategories = async (req, res) => {
  try {
    const { costCenterId } = req.query;

    if (!costCenterId) {
      return res.status(400).json({ 
        error: 'El ID del centro de costo es requerido' 
      });
    }

    const categories = await BudgetCategoryModel.findByCostCenter(costCenterId);
    const total = await BudgetCategoryModel.getTotalByCostCenter(costCenterId);

    // Obtener subcategorías para cada categoría
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await BudgetSubcategoryModel.findByCategory(category.id);
        const subtotal = await BudgetSubcategoryModel.getTotalByCategory(category.id);
        return {
          ...category,
          subtotal,
          subcategories
        };
      })
    );

    res.json({
      categories: categoriesWithSubcategories,
      total,
      count: categories.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener categorías de presupuesto' });
  }
};
/**
 * SEGUIMIENTO DE GASTOS Y EJECUCIÓN
 */

exports.addExpense = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'El monto del gasto debe ser mayor a 0' 
      });
    }

    const category = await BudgetCategoryModel.addExpense(categoryId, amount, description);
    
    res.json({
      message: 'Gasto registrado exitosamente',
      category
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getExecutionStats = async (req, res) => {
  try {
    const { costCenterId } = req.params;

    const stats = await BudgetCategoryModel.getExecutionStats(costCenterId);
    
    res.json({
      costCenterId,
      ...stats,
      message: 'Estadísticas de ejecución obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de ejecución' });
  }
};

exports.getBudgetReport = async (req, res) => {
  try {
    const { costCenterId } = req.params;

    // Obtener información del centro de costo
    const centerResult = await require('../config/database').query(
      'SELECT * FROM cost_centers WHERE id = ?',
      [costCenterId]
    );
    
    if (centerResult.length === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    const center = centerResult[0];
    const stats = await BudgetCategoryModel.getExecutionStats(costCenterId);
    
    // Crear reporte completo
    const report = {
      center: {
        id: center.id,
        name: center.name,
        code: center.code,
        budget: center.budget,
        client_id: center.client_id,
        contract_number: center.contract_number
      },
      summary: stats.summary,
      categories: stats.categories,
      generated_at: new Date(),
      period: 'Acumulado'
    };
    
    res.json({
      message: 'Reporte generado exitosamente',
      report
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

exports.sendBudgetNotification = async (req, res) => {
  try {
    const { costCenterId } = req.params;
    const { recipientEmail, notificationType = 'monthly_report' } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ 
        error: 'El email del destinatario es requerido' 
      });
    }

    // Obtener reporte
    const { report } = await new Promise((resolve, reject) => {
      req.params.costCenterId = costCenterId;
      exports.getBudgetReport(req, { 
        json: (data) => resolve(data)
      });
    });

    // Simular envío de email (aquí integrarías con un servicio real como SendGrid, Nodemailer, etc.)
    const emailSubject = `Reporte de Presupuesto - ${report.center.name}`;
    const totalBudget = report.summary.total_budget || 0;
    const totalExecuted = report.summary.total_executed || 0;
    const totalRemaining = report.summary.total_remaining || 0;
    const executionPercentage = totalBudget > 0 ? (totalExecuted / totalBudget * 100).toFixed(1) : 0;

    // Crear contenido del email
    const emailContent = `
      📊 REPORTE DE PRESUPUESTO
      
      Centro de Costo: ${report.center.name} (${report.center.code})
      Cliente: ${report.center.client_id || 'No especificado'}
      Contrato: ${report.center.contract_number || 'No especificado'}
      
      💰 RESUMEN FINANCIERO:
      • Presupuesto Total: $${new Intl.NumberFormat('es-CO').format(totalBudget)}
      • Ejecutado: $${new Intl.NumberFormat('es-CO').format(totalExecuted)} (${executionPercentage}%)
      • Disponible: $${new Intl.NumberFormat('es-CO').format(totalRemaining)}
      
      📋 DESGLOSE POR CATEGORÍAS:
      ${report.categories.map(cat => 
        `• ${cat.name}: $${new Intl.NumberFormat('es-CO').format(cat.executed_amount || 0)} / $${new Intl.NumberFormat('es-CO').format(cat.amount)} (${cat.execution_percentage.toFixed(1)}%)`
      ).join('\n      ')}
      
      📅 Generado: ${new Date().toLocaleString('es-CO')}
    `;

    // Registrar la notificación en la base de datos
    await require('../config/database').query(
      `INSERT INTO budget_notifications 
       (id, cost_center_id, notification_type, recipient_email, subject, status) 
       VALUES (?, ?, ?, ?, ?, 'sent')`,
      [require('uuid').v4(), costCenterId, notificationType, recipientEmail, emailSubject]
    );

    res.json({
      message: 'Notificación enviada exitosamente',
      recipient: recipientEmail,
      subject: emailSubject,
      content: emailContent,
      report
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
};
exports.getBudgetCategoryById = async (req, res) => {
  try {
    const category = await BudgetCategoryModel.getWithSubcategories(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría de presupuesto no encontrada' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría de presupuesto' });
  }
};

exports.updateBudgetCategory = async (req, res) => {
  try {
    const { name, amount, percentage, description, order } = req.body;

    const category = await BudgetCategoryModel.update(req.params.id, {
      name,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      percentage: percentage !== undefined ? parseFloat(percentage) : undefined,
      description,
      order: order !== undefined ? parseInt(order) : undefined
    });

    res.json({
      message: 'Categoría de presupuesto actualizada exitosamente',
      category
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBudgetCategory = async (req, res) => {
  try {
    await BudgetCategoryModel.delete(req.params.id);

    res.json({
      message: 'Categoría de presupuesto eliminada exitosamente'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * SUBCATEGORÍAS DE PRESUPUESTO (SUBRUBROS)
 */

exports.createBudgetSubcategory = async (req, res) => {
  try {
    const { budgetCategoryId, name, amount, description, order } = req.body;

    if (!budgetCategoryId || !name) {
      return res.status(400).json({ 
        error: 'La categoría de presupuesto y nombre de subcategoría son requeridos' 
      });
    }

    const subcategory = await BudgetSubcategoryModel.create({
      budgetCategoryId,
      name,
      amount: parseFloat(amount) || 0,
      description,
      order: parseInt(order) || 1
    });

    res.status(201).json({
      message: 'Subcategoría de presupuesto creada exitosamente',
      subcategory
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getBudgetSubcategories = async (req, res) => {
  try {
    const { budgetCategoryId } = req.query;

    if (!budgetCategoryId) {
      return res.status(400).json({ 
        error: 'El ID de categoría de presupuesto es requerido' 
      });
    }

    const subcategories = await BudgetSubcategoryModel.findByCategory(budgetCategoryId);
    const total = await BudgetSubcategoryModel.getTotalByCategory(budgetCategoryId);

    res.json({
      subcategories,
      total,
      count: subcategories.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener subcategorías de presupuesto' });
  }
};

exports.updateBudgetSubcategory = async (req, res) => {
  try {
    const { name, amount, description, order } = req.body;

    const subcategory = await BudgetSubcategoryModel.update(req.params.id, {
      name,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      description,
      order: order !== undefined ? parseInt(order) : undefined
    });

    res.json({
      message: 'Subcategoría de presupuesto actualizada exitosamente',
      subcategory
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBudgetSubcategory = async (req, res) => {
  try {
    await BudgetSubcategoryModel.delete(req.params.id);

    res.json({
      message: 'Subcategoría de presupuesto eliminada exitosamente'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * UTILIDADES Y REPORTES
 */

exports.getDefaultBudgetTemplate = async (req, res) => {
  try {
    const defaultCategories = BudgetCategoryModel.getDefaultCategories();

    const template = defaultCategories.map((category, index) => {
      const subcategories = BudgetSubcategoryModel.getDefaultSubcategoriesByType(category.name)
        .map((name, subIndex) => ({
          name,
          order: subIndex + 1
        }));

      return {
        ...category,
        order: index + 1,
        subcategories
      };
    });

    res.json({
      message: 'Plantilla de presupuesto por defecto',
      template
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plantilla de presupuesto' });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const { costCenterId } = req.query;

    if (!costCenterId) {
      return res.status(400).json({ 
        error: 'El ID del centro de costo es requerido' 
      });
    }

    // Obtener información del centro de costo
    const costCenter = await CostCenterModel.findById(costCenterId);
    if (!costCenter) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    // Obtener categorías
    const categories = await BudgetCategoryModel.findByCostCenter(costCenterId);
    
    let totalAllocated = 0;
    let categoryDetails = [];

    for (const category of categories) {
      const subcategories = await BudgetSubcategoryModel.findByCategory(category.id);
      const subtotal = subcategories.reduce((sum, sc) => sum + parseFloat(sc.amount || 0), 0);
      totalAllocated += subtotal;

      categoryDetails.push({
        id: category.id,
        name: category.name,
        allocated: parseFloat(category.amount),
        spent: subtotal,
        remaining: parseFloat(category.amount) - subtotal,
        percentage: ((subtotal / parseFloat(category.amount)) * 100).toFixed(2),
        subcategories: subcategories.map(sc => ({
          id: sc.id,
          name: sc.name,
          amount: parseFloat(sc.amount)
        }))
      });
    }

    const budgetTotal = parseFloat(costCenter.budget);
    const remaining = budgetTotal - totalAllocated;

    res.json({
      costCenter: {
        id: costCenter.id,
        code: costCenter.code,
        name: costCenter.name,
        clientId: costCenter.client_id,
        contractNumber: costCenter.contract_number,
        clientNit: costCenter.client_nit
      },
      budget: {
        total: budgetTotal,
        allocated: totalAllocated,
        remaining,
        utilisationPercentage: ((totalAllocated / budgetTotal) * 100).toFixed(2)
      },
      categories: categoryDetails,
      summary: {
        totalCategories: categories.length,
        totalSubcategories: categoryDetails.reduce((sum, c) => sum + c.subcategories.length, 0)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener resumen de presupuesto' });
  }
};

exports.assignBudgetFromTemplate = async (req, res) => {
  try {
    const { costCenterId } = req.params;
    const { budgetAmount } = req.body;

    if (!costCenterId || !budgetAmount) {
      return res.status(400).json({ 
        error: 'El centro de costo y monto de presupuesto son requeridos' 
      });
    }

    // Obtener plantilla por defecto
    const defaultCategories = BudgetCategoryModel.getDefaultCategories();
    const defaultPercentages = {
      'Recursos Humanos': 50,
      'Logística': 20,
      'Reembolsables': 10,
      'Contratos': 10,
      'Imprevistos': 8,
      'Otros': 2
    };

    const totalBudget = parseFloat(budgetAmount);
    const createdCategories = [];

    for (const category of defaultCategories) {
      const percentage = defaultPercentages[category.name] || 0;
      const amount = (totalBudget * percentage) / 100;

      const newCategory = await BudgetCategoryModel.create({
        costCenterId,
        name: category.name,
        amount,
        percentage,
        description: `Asignación automática: ${category.name}`
      });

      createdCategories.push(newCategory);
    }

    res.status(201).json({
      message: 'Presupuesto asignado desde plantilla exitosamente',
      categories: createdCategories,
      total: totalBudget
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * ITEMS DE CATEGORÍAS DE PRESUPUESTO
 * Elementos específicos dentro de cada categoría
 */

exports.createBudgetItem = async (req, res) => {
  try {
    const { categoryId, name, amount, description, itemType } = req.body;
    const userId = req.user?.id;

    if (!categoryId || !name || !amount) {
      return res.status(400).json({ 
        error: 'La categoría, nombre y monto son requeridos' 
      });
    }

    // Crear el item
    const item = await BudgetItemModel.create({
      categoryId,
      name,
      amount: parseFloat(amount),
      description,
      itemType,
      createdBy: userId
    });

    // Actualizar executed_amount en la categoría
    await BudgetCategoryModel.addExecutedAmount(categoryId, parseFloat(amount));

    res.status(201).json({
      message: 'Item de presupuesto creado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getBudgetItems = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ 
        error: 'El ID de la categoría es requerido' 
      });
    }

    const items = await BudgetItemModel.findByCategory(categoryId);
    const summary = await BudgetItemModel.getItemsSummary(categoryId);

    res.json({
      items,
      summary
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await BudgetItemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateBudgetItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, amount, description, itemType, status } = req.body;

    const item = await BudgetItemModel.update(itemId, {
      name,
      amount,
      description,
      itemType,
      status
    });

    res.json({
      message: 'Item actualizado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBudgetItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await BudgetItemModel.delete(itemId);

    res.json({
      message: 'Item eliminado exitosamente',
      result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        error: 'El estado es requerido' 
      });
    }

    const item = await BudgetItemModel.updateStatus(itemId, status);

    res.json({
      message: 'Estado del item actualizado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.approveItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { comments } = req.body;
    const userId = req.user?.id;

    const item = await BudgetItemModel.approveItem(itemId, userId, comments);

    res.json({
      message: 'Item aprobado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getItemsSummaryByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const summary = await BudgetItemModel.getItemsSummary(categoryId);

    res.json(summary);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};
