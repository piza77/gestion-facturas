const InvoiceModel = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      providerId: req.query.providerId,
      costCenterId: req.query.costCenterId,
      invoiceTypeId: req.query.invoiceTypeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const invoices = await InvoiceModel.findAll(filters);
    const total = await InvoiceModel.count(filters);

    res.json({
      invoices,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const cleanBody = {};
    const dateFields = ['issue_date', 'due_date'];
    const numericFields = ['subtotal', 'tax', 'discount', 'total'];
    
    Object.keys(req.body).forEach(key => {
      let value = req.body[key];
      
      // Para campos de fecha, incluirlos aunque sean strings
      if (dateFields.includes(key)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanBody[key] = value;
        }
      }
      // Para campos numéricos, convertir
      else if (numericFields.includes(key)) {
        cleanBody[key] = value === '' || value === null ? 0 : parseFloat(value) || 0;
      }
      // Para otros campos, filtrar vacíos
      else if (value !== undefined && value !== null && value !== '') {
        // Intentar convertir a número si parece serlo
        if (!isNaN(value) && typeof value === 'string' && value.trim() !== '') {
          value = parseFloat(value);
        }
        cleanBody[key] = value;
      }
    });

    const data = {
      ...cleanBody,
      createdBy: req.user.id,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null
    };

    const invoice = await InvoiceModel.create(data);
    res.status(201).json({
      message: 'Factura creada exitosamente',
      invoice
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    // Filtrar undefined y convertir a valores válidos
    const data = {};
    const dateFields = ['issue_date', 'due_date'];
    const numericFields = ['subtotal', 'tax', 'discount', 'total'];
    const booleanFields = ['is_reimbursable'];
    const textFields = ['description', 'notes', 'order_number', 'invoice_number'];
    
    Object.keys(req.body).forEach(key => {
      let value = req.body[key];
      
      // Para campos de fecha, incluirlos
      if (dateFields.includes(key)) {
        if (value !== undefined && value !== null && value !== '') {
          data[key] = value;
        }
      }
      // Para campos numéricos, convertir
      else if (numericFields.includes(key)) {
        if (value !== undefined) {
          data[key] = value === '' || value === null ? 0 : parseFloat(value) || 0;
        }
      }
      // Para campos booleanos/binarios
      else if (booleanFields.includes(key)) {
        if (value !== undefined) {
          // Convertir a 0 o 1
          data[key] = (value == true || value == 1 || value == '1') ? 1 : 0;
        }
      }
      // Para campos de texto
      else if (textFields.includes(key)) {
        if (value !== undefined) {
          // Permitir null para campos opcionales, pero convertir strings vacíos a null
          data[key] = value === '' ? null : value;
        }
      }
      // Para otros campos
      else if (value !== undefined && value !== null) {
        // Convertir strings numéricos
        if (!isNaN(value) && typeof value === 'string' && value.trim() !== '') {
          value = parseFloat(value);
        }
        // Convertir strings vacíos a null
        if (value === '') {
          value = null;
        }
        data[key] = value;
      }
    });

    if (req.file) {
      data.filePath = req.file.path;
      data.fileName = req.file.originalname;
    }

    const invoice = await InvoiceModel.update(req.params.id, data, req.user.id);
    res.json({
      message: 'Factura actualizada exitosamente',
      invoice
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    // Validar que se proporcionó un estado
    if (!status) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }
    
    // Validar que se proporcionó un ID
    if (!req.params.id) {
      return res.status(400).json({ error: 'ID de factura es requerido' });
    }
    
    const invoice = await InvoiceModel.updateStatus(
      req.params.id,
      status,
      req.user.id,
      reason
    );
    res.json({
      message: 'Estado actualizado exitosamente',
      invoice
    });
  } catch (error) {
    console.error('Error en updateInvoiceStatus:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await InvoiceModel.delete(req.params.id);
    res.json({ message: 'Factura eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getInvoiceStats = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const stats = await InvoiceModel.getStats(filters);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

exports.getInvoicesByMonth = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const data = await InvoiceModel.getByMonth(year);
    res.json({ year, data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos por mes' });
  }
};

exports.getTopProviders = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const providers = await InvoiceModel.getTopProviders(limit);
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores principales' });
  }
};
