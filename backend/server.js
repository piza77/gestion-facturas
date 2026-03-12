require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');
const providerRoutes = require('./routes/provider.routes');
const costCenterRoutes = require('./routes/costCenter.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const invoiceTypeRoutes = require('./routes/invoiceType.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const budgetRoutes = require('./routes/budget.routes');

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/cost-centers', costCenterRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoice-types', invoiceTypeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await db.testConnection();
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: 'error',
      error: error.message
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Sistema de Gestión de Facturas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      employees: '/api/employees',
      providers: '/api/providers',
      costCenters: '/api/cost-centers',
      invoices: '/api/invoices',
      invoiceTypes: '/api/invoice-types',
      dashboard: '/api/dashboard',
      budget: '/api/budget'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a BD (sin bloquear el startup si falla)
    const connected = await db.testConnection();
    if (!connected) {
      console.warn('⚠️ Servidor iniciando sin conexión a BD. La BD se conectará cuando esté disponible.');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Servidor iniciado exitosamente');
      console.log('='.repeat(50));
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📊 Base de datos: ${process.env.DB_NAME || 'No configurada'}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  await db.closePool();
  process.exit(0);
});

startServer();

module.exports = app;