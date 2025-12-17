const EmployeeModel = require('../models/Employee');

exports.getEmployees = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      department: req.query.department,
      costCenterId: req.query.costCenterId,
      isActive: req.query.isActive,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const employees = await EmployeeModel.findAll(filters);
    const total = await EmployeeModel.count(filters);

    res.json({
      employees,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    // Filtrar undefined, '', y null - mantener valores reales incluido 0
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      // Solo incluir si tiene un valor válido (no undefined, no '', no null)
      if (value !== undefined && value !== '' && value !== null) {
        data[key] = value;
      }
    });

    const employee = await EmployeeModel.create(data);
    res.status(201).json({
      message: 'Empleado creado exitosamente',
      employee
    });
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    // Filtrar undefined, '', y null - solo enviar campos que tengan valores reales
    const data = {};
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      // Solo incluir si tiene un valor válido (no undefined, no '', no null)
      if (value !== undefined && value !== '' && value !== null) {
        data[key] = value;
      }
    });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const employee = await EmployeeModel.update(req.params.id, data);
    res.json({
      message: 'Empleado actualizado exitosamente',
      employee
    });
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await EmployeeModel.delete(req.params.id);
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getEmployeeInvoices = async (req, res) => {
  try {
    const invoices = await EmployeeModel.getInvoices(
      req.params.id,
      req.query.limit || 10
    );
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const stats = await EmployeeModel.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
