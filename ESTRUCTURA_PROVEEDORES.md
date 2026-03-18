# ESTRUCTURA DE DIRECTORIOS - MÓDULO PROVEEDORES
## Sistema de Gestión de Facturas v1.3.0

---

## **TABLA DE CONTENIDOS**

1. [Visión General](#visión-general)
2. [Estructura Backend](#estructura-backend)
3. [Estructura Frontend](#estructura-frontend)
4. [Estructura Base de Datos](#estructura-base-de-datos)
5. [Archivos de Configuración](#archivos-de-configuración)
6. [Estructura de Tests](#estructura-de-tests)
7. [Dependencias del Módulo](#dependencias-del-módulo)
8. [Flujo de Datos](#flujo-de-datos)

---

## **VISIÓN GENERAL**

### Propósito del Módulo Proveedores

El módulo Proveedores gestiona toda la información de fabricantes, distribuidores y prestadores de servicios con quienes la empresa realiza transacciones.

```
RESPONSABILIDADES:
├─ Crear/editar/eliminar proveedores
├─ Gestionar información de contacto
├─ Registrar métodos de pago
├─ Administrar términos comerciales
├─ Mantener historial de transacciones
├─ Evaluar desempeño de proveedores
└─ Generar reportes de proveedores
```

### Características

```
✓ CRUD completo (Create, Read, Update, Delete)
✓ Búsqueda y filtrado avanzado
✓ Validación de RFC/NIT
✓ Historial de cambios (auditoría)
✓ Datos de contacto (email, teléfono, dirección)
✓ Métodos de pago por proveedor
✓ Términos comerciales (días de pago, descuentos)
✓ Productos/servicios que ofrece
✓ Evaluación y rating
✓ Estado activo/inactivo
```

---

## **ESTRUCTURA BACKEND**

### Árbol de Directorios Completo

```
backend/
│
├── controllers/
│   └── provider.controller.js          [Lógica de requisiciones HTTP]
│
├── models/
│   └── Provider.js                     [Modelo Sequelize]
│
├── routes/
│   └── provider.routes.js              [Definición de endpoints]
│
├── services/
│   └── provider.service.js             [Lógica de negocio]
│
├── middleware/
│   └── provider.validator.js           [Validaciones específicas]
│
├── migrations/
│   └── create_providers_table.js       [Esquema inicial]
│   └── add_payment_methods.js          [Actualización campos]
│   └── add_provider_rating.js          [Nueva funcionalidad]
│
├── seeders/
│   └── seed-providers.js               [Datos de prueba]
│
├── tests/
│   ├── unit/
│   │   └── provider.service.test.js
│   ├── integration/
│   │   └── provider.routes.test.js
│   └── e2e/
│       └── provider.e2e.test.js
│
└── uploads/
    └── providers/                      [Documentos, logos]
        ├── logos/
        ├── documents/
        └── certificates/
```

### 1. Provider Model (`backend/models/Provider.js`)

```javascript
// backend/models/Provider.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Provider = sequelize.define('Provider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [3, 255],
        notEmpty: true
      }
    },
    rfc: {
      type: DataTypes.STRING(13),
      unique: true,
      validate: {
        isAlphanumeric: true,
        len: [12, 13]
      }
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      validate: {
        isNumeric: true
      }
    },
    cellphone: DataTypes.STRING(20),
    
    // Dirección
    address: DataTypes.TEXT,
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(100),
    postalCode: DataTypes.STRING(10),
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'México'
    },
    
    // Información comercial
    paymentMethod: {
      type: DataTypes.ENUM('TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'TARJETA'),
      defaultValue: 'TRANSFERENCIA'
    },
    paymentDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      validate: {
        min: 0,
        max: 180
      }
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    
    // Contactos
    primaryContact: DataTypes.STRING(255),
    secondaryContact: DataTypes.STRING(255),
    
    // Clasificación
    category: {
      type: DataTypes.ENUM('SERVICIOS', 'PRODUCTOS', 'MIXTO'),
      defaultValue: 'MIXTO'
    },
    
    // Evaluación
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    
    // Estado
    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO'),
      defaultValue: 'ACTIVO'
    },
    
    // Auditoría
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedBy: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE,
    
  }, {
    tableName: 'providers',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      { fields: ['name'] },
      { fields: ['rfc'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['createdAt'] }
    ]
  });

  Provider.associate = (models) => {
    // Un proveedor tiene muchas facturas
    Provider.hasMany(models.Invoice, {
      foreignKey: 'provider_id',
      as: 'invoices'
    });
    
    // Un proveedor tiene muchos productos
    Provider.hasMany(models.ProviderProduct, {
      foreignKey: 'provider_id',
      as: 'products'
    });
    
    // Un proveedor tiene muchas evaluaciones
    Provider.hasMany(models.ProviderReview, {
      foreignKey: 'provider_id',
      as: 'reviews'
    });
    
    // Quién creó
    Provider.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    });
  };

  return Provider;
};
```

### 2. Provider Routes (`backend/routes/provider.routes.js`)

```javascript
// backend/routes/provider.routes.js
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/provider.controller');
const auth = require('../middleware/auth');
const providerValidator = require('../middleware/provider.validator');

// Middleware de autenticación en todas las rutas
router.use(auth.verifyToken);

// ==================== CRUD BÁSICO ====================

// GET /api/providers - Listar todos los proveedores
router.get('/', providerController.getAllProviders);

// GET /api/providers/:id - Obtener un proveedor específico
router.get('/:id', providerController.getProviderById);

// POST /api/providers - Crear nuevo proveedor
router.post('/',
  providerValidator.validateCreate,
  providerController.createProvider
);

// PUT /api/providers/:id - Actualizar proveedor
router.put('/:id',
  providerValidator.validateUpdate,
  providerController.updateProvider
);

// DELETE /api/providers/:id - Eliminar (soft delete)
router.delete('/:id', providerController.deleteProvider);

// ==================== BÚSQUEDA Y FILTRADO ====================

// GET /api/providers/search/name?query=texto
router.get('/search/name', providerController.searchByName);

// GET /api/providers/filter?status=ACTIVO&category=SERVICIOS
router.get('/filter/advanced', providerController.filterProviders);

// ==================== PRODUCTOS/SERVICIOS ====================

// GET /api/providers/:id/products - Productos de un proveedor
router.get('/:id/products', providerController.getProviderProducts);

// POST /api/providers/:id/products - Agregar producto
router.post('/:id/products',
  providerValidator.validateProduct,
  providerController.addProduct
);

// ==================== EVALUACIÓN Y CALIFICACIÓN ====================

// GET /api/providers/:id/reviews - Evaluaciones
router.get('/:id/reviews', providerController.getProviderReviews);

// POST /api/providers/:id/reviews - Agregar evaluación
router.post('/:id/reviews',
  providerValidator.validateReview,
  providerController.addReview
);

// PUT /api/providers/:id/rating - Actualizar calificación
router.put('/:id/rating',
  providerValidator.validateRating,
  providerController.updateRating
);

// ==================== REPORTES ====================

// GET /api/providers/report/performance - Desempeño
router.get('/report/performance', providerController.getPerformanceReport);

// GET /api/providers/report/spending - Gastos por proveedor
router.get('/report/spending', providerController.getSpendingReport);

// ==================== AUDITORÍA ====================

// GET /api/providers/:id/history - Historial de cambios
router.get('/:id/history', providerController.getAuditHistory);

// ==================== EXPORTACIÓN ====================

// GET /api/providers/export/excel - Exportar a Excel
router.get('/export/excel', providerController.exportToExcel);

// GET /api/providers/export/csv - Exportar a CSV
router.get('/export/csv', providerController.exportToCSV);

module.exports = router;
```

### 3. Provider Controller (`backend/controllers/provider.controller.js`)

```javascript
// backend/controllers/provider.controller.js
const { Provider, Invoice, User } = require('../models');
const providerService = require('../services/provider.service');
const logger = require('../utils/logger');

class ProviderController {
  
  // ==================== CRUD ====================
  
  async getAllProviders(req, res) {
    try {
      const { page = 1, limit = 10, status, category } = req.query;
      
      const providers = await providerService.getAllProviders({
        page,
        limit,
        status,
        category
      });
      
      res.json({
        success: true,
        data: providers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: providers.count
        }
      });
    } catch (error) {
      logger.error('Error getting providers', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener proveedores'
      });
    }
  }

  async getProviderById(req, res) {
    try {
      const { id } = req.params;
      
      const provider = await providerService.getProviderById(id);
      
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Proveedor no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: provider
      });
    } catch (error) {
      logger.error('Error getting provider', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener proveedor'
      });
    }
  }

  async createProvider(req, res) {
    try {
      const { name, rfc, email, phone, address, paymentDays } = req.body;
      
      // Verificar RFC único
      const existing = await Provider.findOne({ where: { rfc } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'RFC ya existe'
        });
      }
      
      const provider = await providerService.createProvider({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Registro en auditoría
      logger.info('Provider created', {
        providerId: provider.id,
        userId: req.user.id,
        name: provider.name
      });
      
      res.status(201).json({
        success: true,
        data: provider,
        message: 'Proveedor creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creating provider', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear proveedor'
      });
    }
  }

  async updateProvider(req, res) {
    try {
      const { id } = req.params;
      
      const provider = await providerService.updateProvider(id, {
        ...req.body,
        updatedBy: req.user.id
      });
      
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Proveedor no encontrado'
        });
      }
      
      logger.info('Provider updated', {
        providerId: id,
        userId: req.user.id
      });
      
      res.json({
        success: true,
        data: provider,
        message: 'Proveedor actualizado'
      });
    } catch (error) {
      logger.error('Error updating provider', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar proveedor'
      });
    }
  }

  async deleteProvider(req, res) {
    try {
      const { id } = req.params;
      
      await providerService.deleteProvider(id);
      
      logger.info('Provider deleted', {
        providerId: id,
        userId: req.user.id
      });
      
      res.json({
        success: true,
        message: 'Proveedor eliminado'
      });
    } catch (error) {
      logger.error('Error deleting provider', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar proveedor'
      });
    }
  }

  // ==================== BÚSQUEDA ====================
  
  async searchByName(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Query debe tener al menos 2 caracteres'
        });
      }
      
      const providers = await providerService.searchByName(query);
      
      res.json({
        success: true,
        data: providers
      });
    } catch (error) {
      logger.error('Error searching providers', error);
      res.status(500).json({
        success: false,
        error: 'Error en búsqueda'
      });
    }
  }

  async filterProviders(req, res) {
    try {
      const filters = req.query;
      
      const providers = await providerService.filterProviders(filters);
      
      res.json({
        success: true,
        data: providers,
        filters: filters
      });
    } catch (error) {
      logger.error('Error filtering providers', error);
      res.status(500).json({
        success: false,
        error: 'Error al filtrar'
      });
    }
  }

  // ==================== REPORTES ====================
  
  async getPerformanceReport(req, res) {
    try {
      const report = await providerService.getPerformanceReport();
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error generating report', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar reporte'
      });
    }
  }

  // ... métodos adicionales para otros endpoints
}

module.exports = new ProviderController();
```

### 4. Provider Service (`backend/services/provider.service.js`)

```javascript
// backend/services/provider.service.js
const { Provider, Invoice, ProviderProduct, ProviderReview } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ProviderService {
  
  /**
   * Obtener todos los proveedores con paginación
   */
  async getAllProviders({ page = 1, limit = 10, status, category }) {
    try {
      const offset = (page - 1) * limit;
      const where = {};
      
      if (status) where.status = status;
      if (category) where.category = category;
      
      const { count, rows } = await Provider.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { association: 'invoices', attributes: ['id', 'number', 'amount'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return { count, rows };
    } catch (error) {
      logger.error('Error in getAllProviders', error);
      throw error;
    }
  }

  /**
   * Obtener proveedor por ID
   */
  async getProviderById(id) {
    try {
      return await Provider.findByPk(id, {
        include: [
          {
            association: 'invoices',
            attributes: ['id', 'number', 'amount', 'date']
          },
          {
            association: 'products',
            attributes: ['id', 'name', 'description']
          },
          {
            association: 'reviews',
            attributes: ['id', 'rating', 'comment', 'createdAt']
          }
        ]
      });
    } catch (error) {
      logger.error('Error in getProviderById', error);
      throw error;
    }
  }

  /**
   * Crear nuevo proveedor
   */
  async createProvider(data) {
    try {
      // Validar RFC único
      const existing = await Provider.findOne({
        where: { rfc: data.rfc }
      });
      
      if (existing) {
        throw new Error('RFC ya existe en el sistema');
      }
      
      return await Provider.create(data);
    } catch (error) {
      logger.error('Error in createProvider', error);
      throw error;
    }
  }

  /**
   * Actualizar proveedor
   */
  async updateProvider(id, data) {
    try {
      const provider = await Provider.findByPk(id);
      
      if (!provider) {
        throw new Error('Proveedor no encontrado');
      }
      
      return await provider.update(data);
    } catch (error) {
      logger.error('Error in updateProvider', error);
      throw error;
    }
  }

  /**
   * Eliminar (soft delete)
   */
  async deleteProvider(id) {
    try {
      const provider = await Provider.findByPk(id);
      
      if (!provider) {
        throw new Error('Proveedor no encontrado');
      }
      
      return await provider.destroy();
    } catch (error) {
      logger.error('Error in deleteProvider', error);
      throw error;
    }
  }

  /**
   * Buscar por nombre
   */
  async searchByName(query) {
    try {
      return await Provider.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { businessName: { [Op.like]: `%${query}%` } },
            { rfc: { [Op.like]: `%${query}%` } }
          ],
          status: 'ACTIVO'
        },
        limit: 10
      });
    } catch (error) {
      logger.error('Error in searchByName', error);
      throw error;
    }
  }

  /**
   * Filtrar con criterios avanzados
   */
  async filterProviders(filters) {
    try {
      const where = {};
      
      if (filters.status) where.status = filters.status;
      if (filters.category) where.category = filters.category;
      if (filters.minRating) {
        where.rating = { [Op.gte]: filters.minRating };
      }
      
      return await Provider.findAll({
        where,
        order: [['rating', 'DESC']],
        limit: 50
      });
    } catch (error) {
      logger.error('Error in filterProviders', error);
      throw error;
    }
  }

  /**
   * Obtener historial de facturas de un proveedor
   */
  async getProviderInvoices(providerId, { startDate, endDate }) {
    try {
      const where = { provider_id: providerId };
      
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      return await Invoice.findAll({
        where,
        order: [['date', 'DESC']]
      });
    } catch (error) {
      logger.error('Error in getProviderInvoices', error);
      throw error;
    }
  }

  /**
   * Reporte de desempeño de proveedores
   */
  async getPerformanceReport() {
    try {
      const providers = await Provider.findAll({
        where: { status: 'ACTIVO' },
        attributes: ['id', 'name', 'rating', 'ratingCount'],
        order: [['rating', 'DESC']]
      });
      
      // Calcular gasto total por proveedor
      const report = await Promise.all(
        providers.map(async (provider) => {
          const invoices = await Invoice.findAll({
            where: { provider_id: provider.id },
            attributes: ['amount'],
            raw: true
          });
          
          const totalSpent = invoices.reduce((sum, inv) => sum + inv.amount, 0);
          
          return {
            id: provider.id,
            name: provider.name,
            rating: provider.rating,
            ratingCount: provider.ratingCount,
            invoiceCount: invoices.length,
            totalSpent: totalSpent,
            avgInvoiceAmount: invoices.length > 0 ? totalSpent / invoices.length : 0
          };
        })
      );
      
      return report;
    } catch (error) {
      logger.error('Error in getPerformanceReport', error);
      throw error;
    }
  }
}

module.exports = new ProviderService();
```

### 5. Provider Validator (`backend/middleware/provider.validator.js`)

```javascript
// backend/middleware/provider.validator.js
const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCreate: [
    body('name')
      .notEmpty().withMessage('Nombre requerido')
      .isLength({ min: 3 }).withMessage('Nombre debe tener al menos 3 caracteres'),
    body('rfc')
      .notEmpty().withMessage('RFC requerido')
      .matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/).withMessage('RFC inválido'),
    body('email')
      .optional()
      .isEmail().withMessage('Email inválido'),
    body('phone')
      .optional()
      .matches(/^\d{10}$/).withMessage('Teléfono debe tener 10 dígitos'),
    body('paymentDays')
      .optional()
      .isInt({ min: 0, max: 180 }).withMessage('Días de pago entre 0 y 180'),
    handleValidationErrors
  ],

  validateUpdate: [
    param('id').isInt().withMessage('ID inválido'),
    body('name')
      .optional()
      .isLength({ min: 3 }).withMessage('Nombre mínimo 3 caracteres'),
    body('email')
      .optional()
      .isEmail().withMessage('Email inválido'),
    handleValidationErrors
  ],

  validateProduct: [
    param('id').isInt().withMessage('ID de proveedor inválido'),
    body('name').notEmpty().withMessage('Nombre del producto requerido'),
    body('price').isDecimal().withMessage('Precio debe ser numérico'),
    handleValidationErrors
  ],

  validateReview: [
    param('id').isInt().withMessage('ID de proveedor inválido'),
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating debe estar entre 1 y 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 }).withMessage('Comentario máximo 500 caracteres'),
    handleValidationErrors
  ],

  validateRating: [
    param('id').isInt().withMessage('ID inválido'),
    body('rating')
      .isDecimal({ min: 0, max: 5 }).withMessage('Rating debe estar entre 0 y 5'),
    handleValidationErrors
  ]
};
```

### 6. Provider Migration

```javascript
// backend/migrations/create_providers_table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('providers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rfc: {
        type: Sequelize.STRING(13),
        unique: true,
        allowNull: false
      },
      businessName: {
        type: Sequelize.STRING(255)
      },
      email: Sequelize.STRING(255),
      phone: Sequelize.STRING(20),
      cellphone: Sequelize.STRING(20),
      address: Sequelize.TEXT,
      city: Sequelize.STRING(100),
      state: Sequelize.STRING(100),
      postalCode: Sequelize.STRING(10),
      country: {
        type: Sequelize.STRING(100),
        defaultValue: 'México'
      },
      paymentMethod: {
        type: Sequelize.ENUM('TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'TARJETA'),
        defaultValue: 'TRANSFERENCIA'
      },
      paymentDays: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      discountPercent: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      primaryContact: Sequelize.STRING(255),
      secondaryContact: Sequelize.STRING(255),
      category: {
        type: Sequelize.ENUM('SERVICIOS', 'PRODUCTOS', 'MIXTO'),
        defaultValue: 'MIXTO'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      ratingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO'),
        defaultValue: 'ACTIVO'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: Sequelize.INTEGER,
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: Sequelize.DATE
    });

    // Crear índices
    await queryInterface.addIndex('providers', ['name']);
    await queryInterface.addIndex('providers', ['rfc']);
    await queryInterface.addIndex('providers', ['status']);
    await queryInterface.addIndex('providers', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('providers');
  }
};
```

---

## **ESTRUCTURA FRONTEND**

### Árbol de Directorios

```
frontend/src/
│
├── components/
│   ├── providers/
│   │   ├── ProviderForm.vue           [Formulario crear/editar]
│   │   ├── ProviderList.vue           [Tabla de proveedores]
│   │   ├── ProviderDetail.vue         [Detalle de proveedor]
│   │   ├── ProviderCard.vue           [Tarjeta individual]
│   │   ├── ProviderSearch.vue         [Búsqueda y filtros]
│   │   ├── ProviderRating.vue         [Sistema de calificación]
│   │   ├── ProviderProductList.vue    [Productos del proveedor]
│   │   └── ProviderHistory.vue        [Historial de facturas]
│   │
│   └── shared/
│       └── [otros componentes reutilizables]
│
├── views/
│   └── providers/
│       ├── ProvidersPage.vue          [Página principal]
│       ├── ProviderCreatePage.vue     [Crear nuevo]
│       ├── ProviderEditPage.vue       [Editar existente]
│       ├── ProviderDetailPage.vue     [Detalle completo]
│       └── ProviderReportPage.vue     [Reportes]
│
├── stores/
│   └── provider.store.js              [Pinia store]
│
├── services/
│   ├── api.service.js                 [Cliente HTTP base]
│   └── provider.service.js            [Llamadas a API]
│
├── utils/
│   ├── validators.js                  [Validaciones]
│   ├── formatters.js                  [Formateo datos]
│   └── constants.js                   [Constantes]
│
└── router/
    └── index.js                       [Rutas configuradas]
```

### 1. Provider Vue Component (`frontend/src/components/providers/ProviderForm.vue`)

```vue
<template>
  <div class="provider-form">
    <form @submit.prevent="handleSubmit">
      
      <!-- Sección: Información Básica -->
      <div class="form-section">
        <h3>Información Básica</h3>
        
        <div class="form-group">
          <label for="name">Nombre del Proveedor *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Ej: Servicios ABC"
            required
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="rfc">RFC *</label>
          <input
            id="rfc"
            v-model="form.rfc"
            type="text"
            placeholder="Ej: ABC123456XYZ"
            maxlength="13"
            required
          />
          <small>13 caracteres</small>
        </div>

        <div class="form-group">
          <label for="businessName">Razón Social</label>
          <input
            id="businessName"
            v-model="form.businessName"
            type="text"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Categoría *</label>
            <select v-model="form.category" id="category" required>
              <option value="SERVICIOS">Servicios</option>
              <option value="PRODUCTOS">Productos</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">Estado</label>
            <select v-model="form.status" id="status">
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sección: Contacto -->
      <div class="form-section">
        <h3>Información de Contacto</h3>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
            />
          </div>

          <div class="form-group">
            <label for="cellphone">Celular</label>
            <input
              id="cellphone"
              v-model="form.cellphone"
              type="tel"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="address">Dirección</label>
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">Ciudad</label>
            <input id="city" v-model="form.city" type="text" />
          </div>

          <div class="form-group">
            <label for="state">Estado</label>
            <input id="state" v-model="form.state" type="text" />
          </div>

          <div class="form-group">
            <label for="postalCode">Código Postal</label>
            <input id="postalCode" v-model="form.postalCode" type="text" />
          </div>
        </div>
      </div>

      <!-- Sección: Términos Comerciales -->
      <div class="form-section">
        <h3>Términos Comerciales</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="paymentMethod">Método de Pago *</label>
            <select v-model="form.paymentMethod" id="paymentMethod" required>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>

          <div class="form-group">
            <label for="paymentDays">Días de Pago</label>
            <input
              id="paymentDays"
              v-model.number="form.paymentDays"
              type="number"
              min="0"
              max="180"
            />
          </div>

          <div class="form-group">
            <label for="discountPercent">Descuento (%)</label>
            <input
              id="discountPercent"
              v-model.number="form.discountPercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ isEdit ? 'Actualizar' : 'Crear Proveedor' }}
        </button>
        <button type="button" class="btn-secondary" @click="handleCancel">
          Cancelar
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProviderStore } from '@/stores/provider.store';
import providerService from '@/services/provider.service';

const props = defineProps({
  providerId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['saved', 'cancelled']);
const router = useRouter();
const providerStore = useProviderStore();
const loading = ref(false);
const errors = ref({});

const isEdit = props.providerId !== null;

const form = ref({
  name: '',
  rfc: '',
  businessName: '',
  email: '',
  phone: '',
  cellphone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  category: 'MIXTO',
  status: 'ACTIVO',
  paymentMethod: 'TRANSFERENCIA',
  paymentDays: 30,
  discountPercent: 0
});

onMounted(async () => {
  if (isEdit) {
    try {
      const provider = await providerService.getProvider(props.providerId);
      Object.assign(form.value, provider);
    } catch (error) {
      console.error('Error loading provider:', error);
    }
  }
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    if (isEdit) {
      await providerStore.updateProvider(props.providerId, form.value);
    } else {
      await providerStore.createProvider(form.value);
    }
    emit('saved');
  } catch (error) {
    errors.value = error.response?.data?.errors || {};
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('cancelled');
};

const validateForm = () => {
  errors.value = {};
  
  if (!form.value.name) {
    errors.value.name = 'Nombre requerido';
  }
  if (!form.value.rfc) {
    errors.value.rfc = 'RFC requerido';
  }
  
  return Object.keys(errors.value).length === 0;
};
</script>

<style scoped>
.provider-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

small {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
```

### 2. Provider Store (`frontend/src/stores/provider.store.js`)

```javascript
// frontend/src/stores/provider.store.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import providerService from '@/services/provider.service';

export const useProviderStore = defineStore('provider', () => {
  // State
  const providers = ref([]);
  const currentProvider = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    status: 'ACTIVO',
    category: null,
    searchQuery: ''
  });

  // Getters
  const filteredProviders = computed(() => {
    return providers.value.filter(p => {
      let match = true;
      if (filters.value.status) {
        match = match && p.status === filters.value.status;
      }
      if (filters.value.category) {
        match = match && p.category === filters.value.category;
      }
      if (filters.value.searchQuery) {
        match = match && (
          p.name.toLowerCase().includes(filters.value.searchQuery.toLowerCase()) ||
          p.rfc?.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
        );
      }
      return match;
    });
  });

  const providerCount = computed(() => providers.value.length);

  // Actions
  const fetchProviders = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      providers.value = await providerService.getAllProviders(params);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getProvider = async (id) => {
    loading.value = true;
    try {
      currentProvider.value = await providerService.getProvider(id);
      return currentProvider.value;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createProvider = async (data) => {
    loading.value = true;
    try {
      const newProvider = await providerService.createProvider(data);
      providers.value.push(newProvider);
      return newProvider;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProvider = async (id, data) => {
    loading.value = true;
    try {
      const updated = await providerService.updateProvider(id, data);
      const index = providers.value.findIndex(p => p.id === id);
      if (index !== -1) {
        providers.value[index] = updated;
      }
      currentProvider.value = updated;
      return updated;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProvider = async (id) => {
    loading.value = true;
    try {
      await providerService.deleteProvider(id);
      providers.value = providers.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchProviders = async (query) => {
    loading.value = true;
    try {
      return await providerService.searchProviders(query);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  return {
    // State
    providers,
    currentProvider,
    loading,
    error,
    filters,
    
    // Getters
    filteredProviders,
    providerCount,
    
    // Actions
    fetchProviders,
    getProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    searchProviders,
    setFilters
  };
});
```

### 3. Provider Service (`frontend/src/services/provider.service.js`)

```javascript
// frontend/src/services/provider.service.js
import apiService from './api.service';

const API_URL = '/api/providers';

export default {
  /**
   * Obtener todos los proveedores
   */
  getAllProviders(params = {}) {
    return apiService.get(API_URL, { params });
  },

  /**
   * Obtener un proveedor por ID
   */
  getProvider(id) {
    return apiService.get(`${API_URL}/${id}`);
  },

  /**
   * Crear nuevo proveedor
   */
  createProvider(data) {
    return apiService.post(API_URL, data);
  },

  /**
   * Actualizar proveedor
   */
  updateProvider(id, data) {
    return apiService.put(`${API_URL}/${id}`, data);
  },

  /**
   * Eliminar proveedor
   */
  deleteProvider(id) {
    return apiService.delete(`${API_URL}/${id}`);
  },

  /**
   * Buscar por nombre
   */
  searchProviders(query) {
    return apiService.get(`${API_URL}/search/name`, {
      params: { query }
    });
  },

  /**
   * Filtrar proveedores
   */
  filterProviders(filters) {
    return apiService.get(`${API_URL}/filter/advanced`, {
      params: filters
    });
  },

  /**
   * Obtener productos de un proveedor
   */
  getProviderProducts(providerId) {
    return apiService.get(`${API_URL}/${providerId}/products`);
  },

  /**
   * Obtener evaluaciones de un proveedor
   */
  getProviderReviews(providerId) {
    return apiService.get(`${API_URL}/${providerId}/reviews`);
  },

  /**
   * Agregar evaluación
   */
  addReview(providerId, data) {
    return apiService.post(`${API_URL}/${providerId}/reviews`, data);
  },

  /**
   * Obtener reporte de desempeño
   */
  getPerformanceReport() {
    return apiService.get(`${API_URL}/report/performance`);
  },

  /**
   * Obtener reporte de gastos
   */
  getSpendingReport() {
    return apiService.get(`${API_URL}/report/spending`);
  },

  /**
   * Exportar a Excel
   */
  exportToExcel() {
    return apiService.get(`${API_URL}/export/excel`, {
      responseType: 'blob'
    });
  },

  /**
   * Exportar a CSV
   */
  exportToCSV() {
    return apiService.get(`${API_URL}/export/csv`, {
      responseType: 'blob'
    });
  }
};
```

### 4. Provider Routes (`frontend/src/router/index.js`)

```javascript
// Rutas de Proveedores
const providerRoutes = [
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('@/views/providers/ProvidersPage.vue'),
    meta: {
      title: 'Proveedores',
      requiresAuth: true
    }
  },
  {
    path: '/providers/new',
    name: 'CreateProvider',
    component: () => import('@/views/providers/ProviderCreatePage.vue'),
    meta: {
      title: 'Crear Proveedor',
      requiresAuth: true
    }
  },
  {
    path: '/providers/:id',
    name: 'ProviderDetail',
    component: () => import('@/views/providers/ProviderDetailPage.vue'),
    meta: {
      title: 'Detalles del Proveedor',
      requiresAuth: true
    }
  },
  {
    path: '/providers/:id/edit',
    name: 'EditProvider',
    component: () => import('@/views/providers/ProviderEditPage.vue'),
    meta: {
      title: 'Editar Proveedor',
      requiresAuth: true
    }
  },
  {
    path: '/providers/reports',
    name: 'ProviderReports',
    component: () => import('@/views/providers/ProviderReportPage.vue'),
    meta: {
      title: 'Reportes de Proveedores',
      requiresAuth: true
    }
  }
];

export default [
  // ... otras rutas
  ...providerRoutes
];
```

---

## **ESTRUCTURA BASE DE DATOS**

### Schema Principal

```
┌─────────────────────────┐
│      PROVIDERS          │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ rfc (UNIQUE)            │
│ businessName            │
│ email                   │
│ phone                   │
│ cellphone               │
│ address                 │
│ city                    │
│ state                   │
│ postalCode              │
│ country                 │
│ paymentMethod           │
│ paymentDays             │
│ discountPercent         │
│ primaryContact          │
│ secondaryContact        │
│ category                │
│ rating                  │
│ ratingCount             │
│ status                  │
│ createdBy (FK: Users)   │
│ updatedBy               │
│ createdAt               │
│ updatedAt               │
│ deletedAt (Soft Delete) │
└─────────────────────────┘
       ▲
       │ 1:N
       │
┌──────┴──────────────────┐
│      INVOICES           │
│                         │
│ provider_id (FK)        │
│ number                  │
│ amount                  │
│ date                    │
│ status                  │
└─────────────────────────┘

┌─────────────────────────┐
│ PROVIDER_PRODUCTS       │
│                         │
│ provider_id (FK)        │
│ name                    │
│ description             │
│ price                   │
└─────────────────────────┘

┌─────────────────────────┐
│ PROVIDER_REVIEWS        │
│                         │
│ provider_id (FK)        │
│ rating                  │
│ comment                 │
│ createdAt               │
└─────────────────────────┘
```

---

## **ESTRUCTURA DE TESTS**

### Tests Unitarios

```
backend/tests/unit/
│
├── provider.service.test.js
│   ├── getAllProviders()
│   ├── getProviderById()
│   ├── createProvider()
│   ├── updateProvider()
│   ├── deleteProvider()
│   ├── searchByName()
│   └── getPerformanceReport()
│
└── provider.validator.test.js
    ├── validateCreate()
    ├── validateUpdate()
    └── validateRFC()
```

### Tests de Integración

```
backend/tests/integration/
│
└── provider.routes.test.js
    ├── GET /api/providers
    ├── GET /api/providers/:id
    ├── POST /api/providers
    ├── PUT /api/providers/:id
    ├── DELETE /api/providers/:id
    ├── GET /api/providers/search/name
    └── GET /api/providers/report/performance
```

### Tests E2E

```
frontend/cypress/e2e/
│
└── providers.cy.js
    ├── Crear nuevo proveedor
    ├── Editar proveedor existente
    ├── Buscar proveedores
    ├── Filtrar por categoría
    ├── Ver detalles proveedor
    ├── Eliminar proveedor
    └── Generar reporte
```

---

## **DEPENDENCIAS DEL MÓDULO**

### Backend

```javascript
// package.json - Dependencias usadas en Proveedores
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.28.0",
    "mysql2": "^3.6.5",
    "express-validator": "^7.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "exceljs": "^4.3.0",
    "pinia": "^2.1.6"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.3"
  }
}
```

### Frontend

```javascript
// package.json - Dependencias usadas en Proveedores
{
  "dependencies": {
    "vue": "^3.3.4",
    "pinia": "^2.1.6",
    "axios": "^1.5.0",
    "vue-router": "^4.2.4"
  },
  "devDependencies": {
    "cypress": "^13.6.0",
    "jest": "^29.0.0"
  }
}
```

---

## **REGISTRO DE ENDPOINTS**

### Endpoints Disponibles

```
GET    /api/providers                      - Listar con paginación
GET    /api/providers/:id                  - Obtener uno
POST   /api/providers                      - Crear nuevo
PUT    /api/providers/:id                  - Actualizar
DELETE /api/providers/:id                  - Eliminar

GET    /api/providers/search/name          - Buscar por nombre
GET    /api/providers/filter/advanced      - Filtrar avanzado

GET    /api/providers/:id/products         - Obtener productos
POST   /api/providers/:id/products         - Agregar producto

GET    /api/providers/:id/reviews          - Obtener reviews
POST   /api/providers/:id/reviews          - Agregar review
PUT    /api/providers/:id/rating           - Actualizar rating

GET    /api/providers/report/performance   - Reporte desempeño
GET    /api/providers/report/spending      - Reporte gastos

GET    /api/providers/:id/history          - Auditoría
GET    /api/providers/export/excel         - Exportar Excel
GET    /api/providers/export/csv           - Exportar CSV
```

---

**Estructura completa lista para implementación.** 🚀

