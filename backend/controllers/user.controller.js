const UserModel = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      role: req.query.role,
      isActive: req.query.isActive,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const users = await UserModel.findAll(filters);
    const total = await UserModel.count(filters);

    res.json({
      users,
      pagination: {
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: parseInt(filters.limit),
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.createUser = async (req, res) => {
  try {
    // Validar campos requeridos
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Los campos nombre, email y contraseña son requeridos' 
      });
    }

    // Validar que no haya campos undefined y convertir a tipos correctos
    const data = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      role: role || 'user',
      isActive: req.body.isActive !== false,
      notes: req.body.notes ? String(req.body.notes) : null
    };

    console.log('📝 Datos validados para crear usuario:', data);
    
    const user = await UserModel.create(data);
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user
    });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Validar que no haya campos undefined
    const data = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    });
    
    const user = await UserModel.update(req.params.id, data);
    res.json({
      message: 'Usuario actualizado exitosamente',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await UserModel.delete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el usuario sea quien lo solicita o sea admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tiene permiso para cambiar esta contraseña' });
    }

    if (req.user.id === req.params.id) {
      // Si es cambio propio, verificar contraseña actual
      const dbUser = await UserModel.findByEmail(user.email);
      const passwordValid = await UserModel.verifyPassword(currentPassword, dbUser.password);
      if (!passwordValid) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }
    }

    const updatedUser = await UserModel.updatePassword(req.params.id, newPassword);
    res.json({
      message: 'Contraseña actualizada exitosamente',
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const invoices = await UserModel.getInvoices(
      req.params.id,
      req.query.limit || 20
    );
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await UserModel.getStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario actual' });
  }
};