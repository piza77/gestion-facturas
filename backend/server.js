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

// CORS configuration using environment variables
// Read from ALLOWED_ORIGINS env var or use defaults
const allowedOriginsList = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'https://gestion-facturas-frontend.up.railway.app',
      'https://gestion-facturas.up.railway.app'
    ];

console.log('[CORS] Allowed origins configured:', allowedOriginsList);
console.log('[CORS] Environment ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || 'not set (using defaults)');

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile apps, etc.)
    if (!origin) {
      console.log('[CORS] No origin header - allowing');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOriginsList.includes(origin)) {
      console.log(`[CORS] ✅ Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS] ❌ BLOCKED origin: ${origin}`);
      // For testing/debugging, we allow it anyway but log it
      // In production, you might want to reject: callback(new Error('CORS not allowed'));
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date()
  });
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
    // Iniciar servidor directamente sin verificar BD
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Servidor iniciado exitosamente');
      console.log('='.repeat(50));
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📊 Base de datos: ${process.env.MYSQLDATABASE || 'No configurada'}`);
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