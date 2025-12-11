const CostCenterModel = require('../models/CostCenter');

exports.getCostCenters = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      isActive: req.query.isActive,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const centers = await CostCenterModel.findAll(filters);
    const total = await CostCenterModel.count(filters);

    res.json({
      centers,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener centros de costo' });
  }
};

exports.getCostCenterById = async (req, res) => {
  try {
    const center = await CostCenterModel.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    res.json({ center });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener centro de costo' });
  }
};

exports.createCostCenter = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      data[key] = value === undefined || value === '' ? null : value;
    });

    const center = await CostCenterModel.create(data);
    res.status(201).json({
      message: 'Centro de costo creado exitosamente',
      center
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateCostCenter = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      data[key] = value === undefined || value === '' ? null : value;
    });

    const center = await CostCenterModel.update(req.params.id, data);
    res.json({
      message: 'Centro de costo actualizado exitosamente',
      center
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCostCenter = async (req, res) => {
  try {
    await CostCenterModel.delete(req.params.id);
    res.json({ message: 'Centro de costo eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCostCenterEmployees = async (req, res) => {
  try {
    const employees = await CostCenterModel.getEmployees(
      req.params.id,
      req.query.limit || 50
    );
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

exports.getCostCenterInvoices = async (req, res) => {
  try {
    const invoices = await CostCenterModel.getInvoices(
      req.params.id,
      req.query.limit || 20
    );
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getCostCenterStats = async (req, res) => {
  try {
    const stats = await CostCenterModel.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
