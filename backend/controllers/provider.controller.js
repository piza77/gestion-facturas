const ProviderModel = require('../models/Provider');

exports.getProviders = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      isActive: req.query.isActive,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const providers = await ProviderModel.findAll(filters);
    const total = await ProviderModel.count(filters);

    res.json({
      providers,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await ProviderModel.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json({ provider });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

exports.createProvider = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      data[key] = value === undefined || value === '' ? null : value;
    });

    const provider = await ProviderModel.create(data);
    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      provider
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      data[key] = value === undefined || value === '' ? null : value;
    });

    const provider = await ProviderModel.update(req.params.id, data);
    res.json({
      message: 'Proveedor actualizado exitosamente',
      provider
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    await ProviderModel.delete(req.params.id);
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProviderInvoices = async (req, res) => {
  try {
    const invoices = await ProviderModel.getInvoices(
      req.params.id,
      req.query.limit || 10
    );
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getProviderStats = async (req, res) => {
  try {
    const stats = await ProviderModel.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
