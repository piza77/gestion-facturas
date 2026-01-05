const BudgetCategoryModel = require('../models/BudgetCategory');
const BudgetSubcategoryModel = require('../models/BudgetSubcategory');
const CostCenterModel = require('../models/CostCenter');

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
