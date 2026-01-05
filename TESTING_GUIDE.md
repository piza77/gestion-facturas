# 🧪 GUÍA COMPLETA DE TESTING
**Proyecto:** Gestión de Facturas  
**Versión:** 1.0  
**Fecha:** Diciembre 22, 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Setup de Testing](#setup-de-testing)
2. [Testing Backend](#testing-backend)
3. [Testing Frontend](#testing-frontend)
4. [Integración CI/CD](#integración-cicd)
5. [Mejores Prácticas](#mejores-prácticas)

---

# Setup de Testing

## 🔧 Dependencias a Instalar

### Backend (Node.js/Express)

**Elegir stack:**
```bash
# Opción 1: Jest (Recomendado - más moderno)
npm install --save-dev jest supertest @types/jest

# Opción 2: Mocha + Chai (Alternativa más tradicional)
npm install --save-dev mocha chai supertest sinon
```

**Recomendación: Jest** (más fácil, mejor output, menos config)

### Frontend (Vue 3)

```bash
npm install --save-dev vitest @vitest/ui @vue/test-utils jsdom happy-dom
npm install --save-dev @testing-library/vue @testing-library/jest-dom
```

---

## 📁 Estructura de Carpetas Testing

### Backend
```
backend/
├── tests/                    # Raíz de tests
│   ├── unit/                 # Tests unitarios
│   │   ├── models.test.js
│   │   ├── controllers.test.js
│   │   └── middleware.test.js
│   ├── integration/          # Tests de integración
│   │   ├── auth.test.js
│   │   ├── invoices.test.js
│   │   └── employees.test.js
│   ├── e2e/                  # Tests end-to-end
│   │   └── workflow.test.js
│   └── fixtures/             # Datos de prueba
│       └── mock-data.js
├── jest.config.js            # Configuración Jest
└── package.json              # Scripts de test
```

### Frontend
```
frontend/src/
├── components/
│   └── __tests__/           # Tests junto a componentes
│       ├── Navbar.test.js
│       └── BaseIcon.test.js
├── views/
│   └── __tests__/
│       ├── Dashboard.test.js
│       └── Invoices.test.js
├── services/
│   └── __tests__/
│       └── api.test.js
└── vitest.config.js         # Configuración Vitest
```

---

# Testing Backend

## Paso 1: Configurar Jest

### archivo: `backend/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'models/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  bail: 1,
  verbose: true
};
```

### archivo: `backend/tests/setup.js`

```javascript
// Variables de ambiente de test
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'gestion_facturas_test'; // BD separada para tests
process.env.JWT_SECRET = 'test-secret-key';

// Timeout para tests
jest.setTimeout(10000);

// Setup de logs
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### Actualizar `backend/package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "seed": "node seeders/seed.js"
  }
}
```

---

## Paso 2: Tests Unitarios Backend

### Ejemplo 1: Test del Modelo de Usuarios

**Archivo: `backend/tests/unit/models.test.js`**

```javascript
const UserModel = require('../../models/User');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un usuario correctamente', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'secure123',
        role: 'user'
      };

      db.query.mockResolvedValueOnce([]); // No existe email
      db.query.mockResolvedValueOnce({ insertId: 1 }); // Insert exitoso

      const result = await UserModel.create(userData);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM users WHERE email'),
        ['juan@test.com']
      );
    });

    it('debe rechazar email duplicado', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'existing@test.com',
        password: 'secure123',
        role: 'user'
      };

      // Simular que email existe
      db.query.mockResolvedValueOnce([{ id: 1 }]);

      await expect(UserModel.create(userData)).rejects.toThrow(
        'Ya existe un usuario con ese email'
      );
    });

    it('debe fallar sin email', async () => {
      const userData = {
        name: 'Juan Pérez',
        password: 'secure123',
        role: 'user'
      };

      await expect(UserModel.create(userData)).rejects.toThrow(
        'El email es requerido'
      );
    });
  });

  describe('findById', () => {
    it('debe encontrar usuario por ID', async () => {
      const mockUser = {
        id: '123-456',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@test.com',
        role: 'user'
      };

      db.query.mockResolvedValueOnce([mockUser]);

      const result = await UserModel.findById('123-456');

      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['123-456']
      );
    });

    it('debe retornar null si usuario no existe', async () => {
      db.query.mockResolvedValueOnce([]);

      const result = await UserModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar usuario sin contraseña', async () => {
      const updateData = {
        firstName: 'Juan',
        lastName: 'García',
        role: 'admin'
      };

      db.query.mockResolvedValueOnce({}); // UPDATE success
      db.query.mockResolvedValueOnce([{ id: '123' }]); // SELECT after update

      const result = await UserModel.update('123', updateData);

      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Ejemplo 2: Test del Modelo de Facturas

**Archivo: `backend/tests/unit/invoice-model.test.js`**

```javascript
const InvoiceModel = require('../../models/Invoice');
const db = require('../../config/database');

jest.mock('../../config/database');

describe('InvoiceModel', () => {
  describe('updateStatus', () => {
    it('debe cambiar estado de PENDING a FILED', async () => {
      const invoiceId = 'inv-123';
      const userId = 'user-456';

      db.query.mockResolvedValueOnce([{ id: invoiceId, status: 'pending' }]);
      db.query.mockResolvedValueOnce({}); // UPDATE success
      db.query.mockResolvedValueOnce([{ id: invoiceId, status: 'filed' }]);

      const result = await InvoiceModel.updateStatus(
        invoiceId,
        'filed',
        userId,
        'Factura radicada'
      );

      expect(result.status).toBe('filed');
      expect(db.query).toHaveBeenCalled();
    });

    it('debe rechazar transición inválida', async () => {
      const invoiceId = 'inv-123';

      db.query.mockResolvedValueOnce([{ id: invoiceId, status: 'paid' }]);

      await expect(
        InvoiceModel.updateStatus(invoiceId, 'filed', 'user-456')
      ).rejects.toThrow('Transición de estado no permitida');
    });

    it('debe registrar timestamp y usuario', async () => {
      const invoiceId = 'inv-123';
      const userId = 'user-456';

      db.query.mockResolvedValueOnce([{ id: invoiceId, status: 'pending' }]);
      db.query.mockResolvedValueOnce({}); // UPDATE
      db.query.mockResolvedValueOnce([{
        id: invoiceId,
        filed_at: expect.any(String),
        filed_by: userId
      }]);

      const result = await InvoiceModel.updateStatus(
        invoiceId,
        'filed',
        userId
      );

      expect(result.filed_by).toBe(userId);
    });
  });
});
```

---

## Paso 3: Tests de Integración Backend

### Ejemplo 1: Test de Autenticación

**Archivo: `backend/tests/integration/auth.test.js`**

```javascript
const request = require('supertest');
const app = require('../../server');
const db = require('../../config/database');

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar usuario nuevo', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('newuser@test.com');
    });

    it('debe rechazar email duplicado', async () => {
      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User'
        });

      // Segundo intento
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'OtherPass123!',
          firstName: 'Test2',
          lastName: 'User2'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Ya existe');
    });

    it('debe validar contraseña fuerte', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'weak@test.com',
          password: '123', // Muy débil
          firstName: 'Test',
          lastName: 'User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('contraseña');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'TestPass123!',
          firstName: 'Login',
          lastName: 'Test'
        });
    });

    it('debe hacer login correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'TestPass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toContain('Credenciales');
    });
  });
});
```

### Ejemplo 2: Test de Facturas

**Archivo: `backend/tests/integration/invoices.test.js`**

```javascript
const request = require('supertest');
const app = require('../../server');

let authToken;
let invoiceId;

describe('Invoice Endpoints', () => {
  beforeAll(async () => {
    // Hacer login para obtener token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@empresa.com',
        password: 'admin123'
      });

    authToken = res.body.token;
  });

  describe('GET /api/invoices', () => {
    it('debe obtener lista de facturas', async () => {
      const res = await request(app)
        .get('/api/invoices?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('invoices');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.invoices)).toBe(true);
    });

    it('debe filtrar por estado', async () => {
      const res = await request(app)
        .get('/api/invoices?status=paid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      res.body.invoices.forEach(inv => {
        expect(inv.status).toBe('paid');
      });
    });
  });

  describe('POST /api/invoices', () => {
    it('debe crear factura nueva', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'TEST-2025-001',
          providerId: 'prov-123',
          costCenterId: 'cc-123',
          issueDate: '2025-01-15',
          dueDate: '2025-02-15',
          subtotal: 1000,
          tax: 190,
          total: 1190,
          description: 'Test invoice',
          invoiceTypeId: 'type-123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.invoice).toHaveProperty('id');
      expect(res.body.invoice.status).toBe('pending');

      invoiceId = res.body.invoice.id;
    });

    it('debe rechazar sin campos requeridos', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'TEST-2025-002'
          // Faltan otros campos
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/invoices/:id/status', () => {
    it('debe cambiar estado de factura', async () => {
      const res = await request(app)
        .patch(`/api/invoices/${invoiceId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'filed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.status).toBe('filed');
    });

    it('debe rechazar transición inválida', async () => {
      // Primero cambiar a FILED
      await request(app)
        .patch(`/api/invoices/${invoiceId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'filed' });

      // Intentar volver a PENDING
      const res = await request(app)
        .patch(`/api/invoices/${invoiceId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pending' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('no permitida');
    });
  });
});
```

---

## Paso 4: Tests E2E Backend

**Archivo: `backend/tests/e2e/workflow.test.js`**

```javascript
const request = require('supertest');
const app = require('../../server');

describe('Workflow Completo de Factura', () => {
  let authToken;
  let invoiceId;
  let providerId;

  beforeAll(async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@empresa.com',
        password: 'admin123'
      });

    authToken = loginRes.body.token;

    // Obtener proveedor
    const provRes = await request(app)
      .get('/api/providers?limit=1')
      .set('Authorization', `Bearer ${authToken}`);

    providerId = provRes.body.providers[0].id;
  });

  it('debe completar flujo: crear → radicar → contabilizar → pagar', async () => {
    // 1. CREAR factura
    const createRes = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        invoiceNumber: `E2E-TEST-${Date.now()}`,
        providerId,
        costCenterId: 'cc-123',
        issueDate: '2025-01-15',
        dueDate: '2025-02-15',
        subtotal: 5000,
        tax: 950,
        total: 5950,
        description: 'E2E Test'
      });

    invoiceId = createRes.body.invoice.id;
    expect(createRes.status).toBe(201);
    expect(createRes.body.invoice.status).toBe('pending');

    // 2. RADICAR
    let updateRes = await request(app)
      .patch(`/api/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'filed' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.invoice.status).toBe('filed');
    expect(updateRes.body.invoice.filed_at).toBeDefined();

    // 3. CONTABILIZAR
    updateRes = await request(app)
      .patch(`/api/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'accounted' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.invoice.status).toBe('accounted');
    expect(updateRes.body.invoice.accounted_at).toBeDefined();

    // 4. PAGAR
    updateRes = await request(app)
      .patch(`/api/invoices/${invoiceId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'paid' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.invoice.status).toBe('paid');
    expect(updateRes.body.invoice.paid_at).toBeDefined();

    // 5. VERIFICAR en GET
    const getRes = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.body.invoice.status).toBe('paid');
    expect(getRes.body.invoice.filed_at).toBeDefined();
    expect(getRes.body.invoice.accounted_at).toBeDefined();
    expect(getRes.body.invoice.paid_at).toBeDefined();
  });
});
```

---

# Testing Frontend

## Paso 1: Configurar Vitest

### archivo: `frontend/vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
      ]
    },
    setupFiles: ['./tests/setup.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### archivo: `frontend/tests/setup.js`

```javascript
import { vi } from 'vitest';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Actualizar `frontend/package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^latest",
    "@vitest/ui": "^latest",
    "@vue/test-utils": "^latest",
    "@testing-library/vue": "^latest",
    "jsdom": "^latest"
  }
}
```

---

## Paso 2: Tests de Componentes Vue

### Ejemplo 1: Test de Navbar

**Archivo: `frontend/src/components/__tests__/Navbar.test.js`**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';

describe('Navbar.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Mock localStorage
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'user') {
        return JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          role: 'admin'
        });
      }
      if (key === 'token') {
        return 'mock-token';
      }
      return null;
    });

    wrapper = mount(Navbar, {
      global: {
        stubs: {
          RouterLink: true,
          RouterView: true
        }
      }
    });
  });

  it('debe renderizar correctamente', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('debe mostrar nombre del usuario logueado', () => {
    expect(wrapper.text()).toContain('Test');
  });

  it('debe mostrar rol del usuario', () => {
    expect(wrapper.text()).toContain('admin');
  });

  it('debe tener botón de logout', () => {
    const logoutBtn = wrapper.find('button[title="Logout"]');
    expect(logoutBtn.exists()).toBe(true);
  });

  it('debe hacer logout al click', async () => {
    const logoutBtn = wrapper.find('button[title="Logout"]');
    await logoutBtn.trigger('click');

    expect(global.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
```

### Ejemplo 2: Test de Componente Dashboard

**Archivo: `frontend/src/views/__tests__/Dashboard.test.js`**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../Dashboard.vue';

vi.mock('../../services/api', () => ({
  default: {
    getDashboardStats: vi.fn(() =>
      Promise.resolve({
        data: {
          totalInvoices: 150,
          totalAmount: 500000,
          invoicesByStatus: {
            pending: 10,
            filed: 25,
            accounted: 50,
            paid: 65
          },
          topProviders: [
            { name: 'Proveedor 1', amount: 100000 },
            { name: 'Proveedor 2', amount: 80000 }
          ]
        }
      })
    )
  }
}));

describe('Dashboard.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Dashboard, {
      global: {
        stubs: {
          Chart: true,
          'VueApexCharts': true
        }
      }
    });
  });

  it('debe cargar datos de dashboard', async () => {
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('150'); // totalInvoices
  });

  it('debe mostrar KPIs principales', async () => {
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="total-invoices"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="total-amount"]').exists()).toBe(true);
  });

  it('debe mostrar estados de facturas', async () => {
    await wrapper.vm.$nextTick();

    const pendingCard = wrapper.find('[data-testid="status-pending"]');
    expect(pendingCard.text()).toContain('10');
  });
});
```

### Ejemplo 3: Test de Servicio API

**Archivo: `frontend/src/services/__tests__/api.test.js`**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  };
  return { default: mockAxios };
});

describe('API Service', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'token') {
        return 'mock-token-123';
      }
      return null;
    });
  });

  it('debe tener método getInvoices', () => {
    expect(api.getInvoices).toBeDefined();
    expect(typeof api.getInvoices).toBe('function');
  });

  it('debe tener método getEmployees', () => {
    expect(api.getEmployees).toBeDefined();
  });

  it('debe tener método updateEmployee', () => {
    expect(api.updateEmployee).toBeDefined();
  });

  it('debe tener método updateInvoiceStatus', () => {
    expect(api.updateInvoiceStatus).toBeDefined();
  });

  it('debe agregar token a headers', () => {
    // Test que el interceptor agrega el token
    const token = global.localStorage.getItem('token');
    expect(token).toBe('mock-token-123');
  });
});
```

---

## Paso 3: Tests de Vistas Complejas

**Archivo: `frontend/src/views/__tests__/Invoices.test.js`**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Invoices from '../Invoices.vue';

const mockApi = {
  getInvoices: vi.fn(() =>
    Promise.resolve({
      data: {
        invoices: [
          {
            id: 'inv-1',
            invoice_number: 'FC-2025-001',
            provider_name: 'Proveedor A',
            total: 5000,
            status: 'pending',
            issue_date: '2025-01-15'
          }
        ],
        pagination: { total: 1, page: 1 }
      }
    })
  ),
  updateInvoiceStatus: vi.fn(() =>
    Promise.resolve({ data: { invoice: { status: 'filed' } } })
  ),
  getInvoice: vi.fn((id) =>
    Promise.resolve({
      data: {
        invoice: {
          id,
          invoice_number: 'FC-2025-001',
          status: 'pending'
        }
      }
    })
  )
};

describe('Invoices.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Invoices, {
      global: {
        mocks: {
          $api: mockApi
        },
        stubs: {
          Modal: true
        }
      }
    });
  });

  it('debe cargar facturas al montar', async () => {
    await wrapper.vm.$nextTick();
    
    expect(mockApi.getInvoices).toHaveBeenCalled();
  });

  it('debe mostrar tabla de facturas', async () => {
    await wrapper.vm.loadInvoices();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('table').exists()).toBe(true);
  });

  it('debe permitir buscar facturas', async () => {
    const searchInput = wrapper.find('input[placeholder*="Buscar"]');
    await searchInput.setValue('FC-2025');
    await searchInput.trigger('input');

    await wrapper.vm.$nextTick();

    expect(mockApi.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'FC-2025'
      })
    );
  });

  it('debe abrir modal para editar', async () => {
    const invoice = {
      id: 'inv-1',
      invoice_number: 'FC-2025-001'
    };

    await wrapper.vm.openModal(invoice);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showModal).toBe(true);
    expect(wrapper.vm.editingInvoice).toEqual(invoice);
  });

  it('debe cambiar estado de factura', async () => {
    await wrapper.vm.changeStatus('inv-1', 'filed');

    expect(mockApi.updateInvoiceStatus).toHaveBeenCalledWith(
      'inv-1',
      { status: 'filed' }
    );
  });
});
```

---

# Integración CI/CD

## GitHub Actions (Automático)

### archivo: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: gestion_facturas_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
    
    - name: Run unit tests
      working-directory: ./backend
      run: npm run test:unit
    
    - name: Run integration tests
      working-directory: ./backend
      run: npm run test:integration
      env:
        DB_HOST: localhost
        DB_USER: root
        DB_PASSWORD: root
        DB_NAME: gestion_facturas_test
    
    - name: Generate coverage report
      working-directory: ./backend
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        directory: ./backend/coverage

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Run tests
      working-directory: ./frontend
      run: npm test
    
    - name: Generate coverage report
      working-directory: ./frontend
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        directory: ./frontend/coverage
```

---

# Mejores Prácticas

## ✅ Testing Pyramid

```
          △
         △ △  E2E Tests (10%)
        △ △ △ Integration (30%)
       △ △ △ △ Unit Tests (60%)
```

**Distribución recomendada:**
- 60% Tests Unitarios (rápidos, aislados)
- 30% Tests de Integración (múltiples capas)
- 10% Tests E2E (flujos completos)

## ✅ Nomenclatura de Tests

```javascript
// ✅ BUENO
describe('UserModel', () => {
  it('debe crear usuario con email único', () => {});
  it('debe rechazar email duplicado', () => {});
});

// ❌ MALO
describe('Users', () => {
  it('test 1', () => {});
  it('funciona', () => {});
});
```

## ✅ Estructura AAA (Arrange-Act-Assert)

```javascript
// ✅ BUENO
it('debe sumar dos números', () => {
  // Arrange (preparar)
  const a = 2;
  const b = 3;
  
  // Act (ejecutar)
  const result = add(a, b);
  
  // Assert (verificar)
  expect(result).toBe(5);
});

// ❌ MALO
it('suma', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(1, 1)).toBe(2);
  expect(add(0, 0)).toBe(0);
});
```

## ✅ Cobertura de Código

**Objetivo mínimo:** 80% de cobertura

```bash
# Ver reporte de cobertura
npm run test:coverage

# Verificar archivos sin cobertura
npm run test:coverage -- --check-coverage --lines 80
```

## ✅ Tests Asincrónicos

```javascript
// ✅ CORRECTO
it('debe cargar datos', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// También válido
it('debe cargar datos con done', (done) => {
  fetchData().then(data => {
    expect(data).toBeDefined();
    done();
  });
});
```

## ✅ Mocking de Dependencias

```javascript
// ✅ BUENO - Aislar lo que se prueba
jest.mock('../../config/database');
const db = require('../../config/database');
db.query.mockResolvedValue([]);

// ❌ MALO - Usar BD real en tests
const db = require('../../config/database');
await db.query('SELECT * FROM users'); // Lentoooo
```

---

# 📊 Comandos Rápidos

## Backend

```bash
# Instalar dependencias de test
cd backend
npm install --save-dev jest supertest

# Correr todos los tests
npm test

# Correr tests en modo watch
npm run test:watch

# Correr solo unitarios
npm run test:unit

# Correr solo integración
npm run test:integration

# Ver cobertura
npm run test:coverage

# Correr test específico
npm test -- models.test.js

# Correr tests que coincidan con patrón
npm test -- --testNamePattern="crear usuario"
```

## Frontend

```bash
# Instalar dependencias
cd frontend
npm install --save-dev vitest @vue/test-utils

# Correr tests
npm test

# Modo watch
npm run test:watch

# Con UI
npm run test:ui

# Cobertura
npm run test:coverage

# Test específico
npm test -- Dashboard.test.js
```

---

# 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [SuperTest](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/)

---

**Versión:** 1.0  
**Última actualización:** Diciembre 22, 2025  
**Mantenedor:** Equipo de desarrollo
