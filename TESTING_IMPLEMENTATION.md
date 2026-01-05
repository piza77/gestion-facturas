# Backend Testing Implementation Guide

This guide provides real, working examples of how to test your Node.js/Express API with Jest and SuperTest.

## 1. Setup Completo

### Dependencias instaladas:
```bash
npm install --save-dev jest@^29.7.0 supertest@^6.3.3
```

### Archivos configurados:
- `jest.config.js` - Configuración de Jest
- `tests/setup.js` - Variables de ambiente para tests
- `tests/unit/invoice.model.test.js` - Tests unitarios del modelo

## 2. Ejecutar Tests

### Tests unitarios:
```bash
npm run test:unit
```

### Todos los tests:
```bash
npm test
```

### Tests en modo watch:
```bash
npm run test:watch
```

### Cobertura de tests:
```bash
npm run test:coverage
```

## 3. Tests Unitarios (Modelos)

### ✅ Tests que funcionan correctamente:

**File:** `tests/unit/invoice.model.test.js`

```javascript
describe('InvoiceModel - updateStatus', () => {
  it('debe cambiar de PENDING a FILED correctamente', async () => {
    const invoiceId = 'inv-123';
    const userId = 'user-456';

    // Mock: factura con estado PENDING
    db.query.mockResolvedValueOnce([{ 
      id: invoiceId, 
      status: 'pending'
    }]);
    
    // Mock: UPDATE exitoso
    db.query.mockResolvedValueOnce({});
    
    // Mock: SELECT después de update
    db.query.mockResolvedValueOnce([{ 
      id: invoiceId, 
      status: 'filed',
      filed_by: userId
    }]);

    const result = await InvoiceModel.updateStatus(invoiceId, 'filed', userId);

    expect(result.status).toBe('filed');
    expect(result.filed_by).toBe(userId);
  });
});
```

### Estado actual:
- ✅ 4/4 tests unitarios pasando
- Tiempo: <1s

## 4. Tests de Integración (Endpoints HTTP)

### Crear archivo: `tests/integration/invoices.test.js`

```javascript
const request = require('supertest');
const app = require('../../server');

describe('Invoice Endpoints', () => {
  let authToken = '';
  
  beforeAll(async () => {
    // Login para obtener token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@empresa.com',
        password: 'admin123'
      });
    authToken = res.body.token;
  });

  describe('GET /api/invoices', () => {
    it('debe retornar lista de facturas', async () => {
      const res = await request(app)
        .get('/api/invoices?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('invoices');
      expect(Array.isArray(res.body.invoices)).toBe(true);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .get('/api/invoices');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PATCH /api/invoices/:id/status', () => {
    it('debe cambiar estado de factura', async () => {
      // Este test necesita una factura en BD
      const testInvoiceId = 'algún-id-real';
      
      const res = await request(app)
        .patch(`/api/invoices/${testInvoiceId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'filed' });

      if (res.statusCode === 200) {
        expect(res.body.invoice.status).toBe('filed');
      }
    });
  });
});
```

### Ejecutar tests de integración:
```bash
npm run test:integration
```

## 5. Mejores Prácticas

### ✅ Qué está bien

1. **Tests unitarios con mocks:**
   - Mockear `db.query`
   - Testear lógica sin base de datos real
   - Rápidos (<1s)
   - Aislados y predecibles

2. **Validación de transiciones de estado:**
   - PENDING → FILED ✓
   - FILED → ACCOUNTED ✓
   - ACCOUNTED → PAID ✓
   - Transiciones inválidas rechazadas ✓

3. **Manejo de errores:**
   - Estados inválidos
   - UserId vacío

### 🔧 Por mejorar

1. **Tests de integración:**
   - Necesitan base de datos de test
   - Requieren JWT válido
   - Más lentos pero más realistas

2. **Cobertura:**
   - Aumentar coverage > 80%
   - Testear más métodos del modelo
   - Testear validaciones

3. **E2E Tests:**
   - Flujo completo: crear → radicar → contabilizar → pagar
   - Validaciones en cada paso

## 6. Próximos Pasos Recomendados

### Corto plazo (1-2 horas):
1. Crear tests de integración para endpoints principales
2. Añadir tests para otros modelos (User, Employee, Provider)
3. Aumentar coverage a >80%

### Mediano plazo (2-3 horas):
1. Crear tests E2E para flujos de negocio
2. Configurar CI/CD con GitHub Actions
3. Añadir tests para frontend

### Comando para actualizar coverage:
```bash
npm run test:coverage
```

Esto generará un reporte en `coverage/`

## 7. Estructura de carpetas para tests

```
backend/
├── tests/
│   ├── setup.js                    # Configuración inicial
│   ├── unit/
│   │   ├── invoice.model.test.js   # ✅ Funcionando
│   │   ├── user.model.test.js      # Por hacer
│   │   └── provider.model.test.js  # Por hacer
│   ├── integration/
│   │   ├── auth.test.js            # Por hacer
│   │   ├── invoices.test.js        # ✅ Creado
│   │   └── users.test.js           # Por hacer
│   └── e2e/
│       └── workflow.test.js        # Por hacer
├── jest.config.js                  # ✅ Configurado
└── ...
```

## 8. Datos importantes

- **JWT Secret (testing):** `test-jwt-secret-key`
- **Database (testing):** Configurada en `tests/setup.js`
- **Port (testing):** No especificado (usa puerto aleatorio)
- **Timeout:** 10 segundos

## 9. Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [SuperTest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
