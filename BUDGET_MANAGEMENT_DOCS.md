# 📊 Módulo de Presupuestos y Rubros - Documentación

## Descripción General

El módulo de presupuestos permite gestionar presupuestos por centro de costos, asignando y distribuyendo el presupuesto total en diferentes rubros (categorías) y subrubros (subcategorías).

### Características Principales

✅ **Gestión de Presupuestos Completos**
- Asignar presupuesto total a cada centro de costo
- Distribuir presupuesto en rubros específicos
- Crear subrubros dentro de cada rubro
- Rastrear gasto vs presupuesto

✅ **Información de Cliente**
- ID de Cliente
- Número de Contrato
- Cédula/NIT del Cliente/Empresa

✅ **Rubros Predefinidos**
- Recursos Humanos
- Logística
- Reembolsables
- Contratos
- Imprevistos
- Otros

---

## Estructura de Datos

### Tablas de Base de Datos

#### 1. cost_centers (Actualizada)

```sql
ALTER TABLE cost_centers ADD COLUMN client_id VARCHAR(100) NULL;
ALTER TABLE cost_centers ADD COLUMN contract_number VARCHAR(100) NULL;
ALTER TABLE cost_centers ADD COLUMN client_nit VARCHAR(50) NULL;
```

**Nuevos Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `client_id` | VARCHAR(100) | ID o código del cliente |
| `contract_number` | VARCHAR(100) | Número del contrato |
| `client_nit` | VARCHAR(50) | Cédula o NIT del cliente |

#### 2. budget_categories (Nueva)

```sql
CREATE TABLE budget_categories (
  id VARCHAR(36) PRIMARY KEY,
  cost_center_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  description TEXT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE CASCADE
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | VARCHAR(36) | UUID único |
| `cost_center_id` | VARCHAR(36) | Referencia al centro de costo |
| `name` | VARCHAR(150) | Nombre del rubro |
| `amount` | DECIMAL(15, 2) | Monto asignado al rubro |
| `percentage` | DECIMAL(5, 2) | Porcentaje del presupuesto total |
| `description` | TEXT | Descripción del rubro |
| `display_order` | INT | Orden de visualización |

#### 3. budget_subcategories (Nueva)

```sql
CREATE TABLE budget_subcategories (
  id VARCHAR(36) PRIMARY KEY,
  budget_category_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  description TEXT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | VARCHAR(36) | UUID único |
| `budget_category_id` | VARCHAR(36) | Referencia a la categoría |
| `name` | VARCHAR(150) | Nombre del subrubro |
| `amount` | DECIMAL(15, 2) | Monto asignado al subrubro |
| `description` | TEXT | Descripción del subrubro |
| `display_order` | INT | Orden de visualización |

---

## Endpoints API

### Base URL
```
/api/budget
```

### Autenticación
Todos los endpoints requieren autenticación (token JWT)

---

## 1. Categorías de Presupuesto (Rubros)

### Crear Categoría de Presupuesto
```http
POST /api/budget/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "costCenterId": "uuid-del-centro",
  "name": "Recursos Humanos",
  "amount": 50000.00,
  "percentage": 50,
  "description": "Presupuesto para nómina y personal",
  "order": 1
}
```

**Respuesta:** (201 Created)
```json
{
  "message": "Categoría de presupuesto creada exitosamente",
  "category": {
    "id": "uuid",
    "cost_center_id": "uuid",
    "name": "Recursos Humanos",
    "amount": 50000.00,
    "percentage": 50,
    "description": "Presupuesto para nómina y personal",
    "display_order": 1,
    "created_at": "2026-01-05T10:00:00.000Z",
    "updated_at": "2026-01-05T10:00:00.000Z"
  }
}
```

---

### Obtener Categorías de un Centro de Costo
```http
GET /api/budget/categories?costCenterId=uuid-del-centro
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "categories": [
    {
      "id": "uuid",
      "cost_center_id": "uuid",
      "name": "Recursos Humanos",
      "amount": 50000.00,
      "percentage": 50,
      "description": "Presupuesto para nómina y personal",
      "display_order": 1,
      "subtotal": 50000.00,
      "subcategories": [
        {
          "id": "uuid",
          "budget_category_id": "uuid",
          "name": "Salarios",
          "amount": 30000.00,
          "description": "Nómina mensual",
          "display_order": 1
        }
      ],
      "created_at": "2026-01-05T10:00:00.000Z",
      "updated_at": "2026-01-05T10:00:00.000Z"
    }
  ],
  "total": 100000.00,
  "count": 1
}
```

---

### Obtener Categoría por ID (con Subcategorías)
```http
GET /api/budget/categories/:id
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "category": {
    "id": "uuid",
    "cost_center_id": "uuid",
    "name": "Recursos Humanos",
    "amount": 50000.00,
    "percentage": 50,
    "description": "Presupuesto para nómina y personal",
    "display_order": 1,
    "subcategories": [
      {
        "id": "uuid",
        "budget_category_id": "uuid",
        "name": "Salarios",
        "amount": 30000.00
      }
    ]
  }
}
```

---

### Actualizar Categoría de Presupuesto
```http
PUT /api/budget/categories/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Recursos Humanos Actualizado",
  "amount": 55000.00,
  "percentage": 55,
  "description": "Presupuesto actualizado"
}
```

**Respuesta:** (200 OK)
```json
{
  "message": "Categoría de presupuesto actualizada exitosamente",
  "category": { /* datos actualizados */ }
}
```

---

### Eliminar Categoría de Presupuesto
```http
DELETE /api/budget/categories/:id
Authorization: Bearer <token>
```

**Nota:** No se puede eliminar si tiene subcategorías asociadas.

**Respuesta:** (200 OK)
```json
{
  "message": "Categoría de presupuesto eliminada exitosamente"
}
```

---

## 2. Subcategorías de Presupuesto (Subrubros)

### Crear Subcategoría de Presupuesto
```http
POST /api/budget/subcategories
Content-Type: application/json
Authorization: Bearer <token>

{
  "budgetCategoryId": "uuid-de-categoria",
  "name": "Salarios",
  "amount": 30000.00,
  "description": "Nómina mensual del equipo",
  "order": 1
}
```

**Respuesta:** (201 Created)
```json
{
  "message": "Subcategoría de presupuesto creada exitosamente",
  "subcategory": {
    "id": "uuid",
    "budget_category_id": "uuid",
    "name": "Salarios",
    "amount": 30000.00,
    "description": "Nómina mensual del equipo",
    "display_order": 1,
    "created_at": "2026-01-05T10:00:00.000Z"
  }
}
```

---

### Obtener Subcategorías de una Categoría
```http
GET /api/budget/subcategories?budgetCategoryId=uuid-de-categoria
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "subcategories": [
    {
      "id": "uuid",
      "budget_category_id": "uuid",
      "name": "Salarios",
      "amount": 30000.00,
      "description": "Nómina mensual del equipo",
      "display_order": 1,
      "created_at": "2026-01-05T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "budget_category_id": "uuid",
      "name": "Prestaciones",
      "amount": 15000.00,
      "description": "Beneficios del personal",
      "display_order": 2,
      "created_at": "2026-01-05T10:00:00.000Z"
    }
  ],
  "total": 45000.00,
  "count": 2
}
```

---

### Actualizar Subcategoría de Presupuesto
```http
PUT /api/budget/subcategories/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Salarios Base",
  "amount": 32000.00,
  "description": "Nómina actualizada"
}
```

**Respuesta:** (200 OK)
```json
{
  "message": "Subcategoría de presupuesto actualizada exitosamente",
  "subcategory": { /* datos actualizados */ }
}
```

---

### Eliminar Subcategoría de Presupuesto
```http
DELETE /api/budget/subcategories/:id
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "message": "Subcategoría de presupuesto eliminada exitosamente"
}
```

---

## 3. Utilidades y Reportes

### Obtener Plantilla de Presupuesto por Defecto
```http
GET /api/budget/template/default
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "message": "Plantilla de presupuesto por defecto",
  "template": [
    {
      "name": "Recursos Humanos",
      "icon": "users",
      "color": "#3b82f6",
      "order": 1,
      "subcategories": [
        { "name": "Salarios", "order": 1 },
        { "name": "Prestaciones", "order": 2 },
        { "name": "Bonificaciones", "order": 3 },
        { "name": "Capacitación", "order": 4 },
        { "name": "Otros", "order": 5 }
      ]
    },
    {
      "name": "Logística",
      "icon": "truck",
      "color": "#8b5cf6",
      "order": 2,
      "subcategories": [
        { "name": "Transporte", "order": 1 },
        { "name": "Almacenamiento", "order": 2 },
        { "name": "Empaques", "order": 3 },
        { "name": "Distribución", "order": 4 },
        { "name": "Otros", "order": 5 }
      ]
    }
    // ... más categorías
  ]
}
```

---

### Obtener Resumen de Presupuesto
```http
GET /api/budget/summary?costCenterId=uuid-del-centro
Authorization: Bearer <token>
```

**Respuesta:** (200 OK)
```json
{
  "costCenter": {
    "id": "uuid",
    "code": "CC-001",
    "name": "Centro de Costos Principal",
    "clientId": "CLI-001",
    "contractNumber": "CONT-2026-001",
    "clientNit": "123456789"
  },
  "budget": {
    "total": 100000.00,
    "allocated": 95000.00,
    "remaining": 5000.00,
    "utilisationPercentage": "95.00"
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Recursos Humanos",
      "allocated": 50000.00,
      "spent": 50000.00,
      "remaining": 0.00,
      "percentage": "100.00",
      "subcategories": [
        { "id": "uuid", "name": "Salarios", "amount": 30000.00 },
        { "id": "uuid", "name": "Prestaciones", "amount": 15000.00 }
      ]
    },
    {
      "id": "uuid",
      "name": "Logística",
      "allocated": 20000.00,
      "spent": 18000.00,
      "remaining": 2000.00,
      "percentage": "90.00",
      "subcategories": [
        { "id": "uuid", "name": "Transporte", "amount": 10000.00 },
        { "id": "uuid", "name": "Almacenamiento", "amount": 8000.00 }
      ]
    }
  ],
  "summary": {
    "totalCategories": 2,
    "totalSubcategories": 4
  }
}
```

---

### Asignar Presupuesto desde Plantilla
```http
POST /api/budget/assign-template/:costCenterId
Content-Type: application/json
Authorization: Bearer <token>

{
  "budgetAmount": 100000.00
}
```

**Respuesta:** (201 Created)
```json
{
  "message": "Presupuesto asignado desde plantilla exitosamente",
  "categories": [
    {
      "id": "uuid",
      "cost_center_id": "uuid",
      "name": "Recursos Humanos",
      "amount": 50000.00,
      "percentage": 50,
      "description": "Asignación automática: Recursos Humanos",
      "display_order": 1,
      "created_at": "2026-01-05T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "cost_center_id": "uuid",
      "name": "Logística",
      "amount": 20000.00,
      "percentage": 20,
      "description": "Asignación automática: Logística",
      "display_order": 2,
      "created_at": "2026-01-05T10:00:00.000Z"
    }
    // ... más categorías
  ],
  "total": 100000.00
}
```

**Distribución automática:**
- Recursos Humanos: 50%
- Logística: 20%
- Reembolsables: 10%
- Contratos: 10%
- Imprevistos: 8%
- Otros: 2%

---

## Flujo de Uso Completo

### 1. Crear Centro de Costo con Información del Cliente
```http
POST /api/cost-centers
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "CC-001",
  "name": "Centro Principal",
  "budget": 100000.00,
  "clientId": "CLI-001",
  "contractNumber": "CONT-2026-001",
  "clientNit": "123456789"
}
```

### 2. Asignar Presupuesto desde Plantilla
```http
POST /api/budget/assign-template/{costCenterId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "budgetAmount": 100000.00
}
```

### 3. Personalizar Rubros (Opcional)
```http
PUT /api/budget/categories/{categoryId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 55000.00,
  "percentage": 55
}
```

### 4. Crear Subrubros Específicos
```http
POST /api/budget/subcategories
Content-Type: application/json
Authorization: Bearer <token>

{
  "budgetCategoryId": "{categoryId}",
  "name": "Salarios Base",
  "amount": 35000.00
}
```

### 5. Consultar Resumen
```http
GET /api/budget/summary?costCenterId={costCenterId}
Authorization: Bearer <token>
```

---

## Notas Importantes

⚠️ **Validaciones:**
- El total de subrubros no puede exceder el monto de la categoría
- Los porcentajes son informativos, se calculan automáticamente
- No se puede eliminar una categoría que tenga subrubros

⚠️ **Restricciones:**
- Campos `client_id`, `contract_number`, `client_nit` son opcionales
- El presupuesto debe ser mayor a 0 para crear categorías
- Los UUID se generan automáticamente

📊 **Reportes:**
- El resumen de presupuesto muestra útilización vs asignado
- Porcentajes se calculan en tiempo real
- Se incluye información de cliente en el resumen

---

## Migración

Para ejecutar la migración y crear las nuevas tablas:

```bash
cd backend
node migrations/add_budget_management.js
```

---

## Ejemplo de Implementación Frontend (Vue.js)

```javascript
// Crear categoría de presupuesto
async function createBudgetCategory() {
  const response = await fetch('/api/budget/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      costCenterId: centroId,
      name: 'Recursos Humanos',
      amount: 50000,
      percentage: 50
    })
  });
  return await response.json();
}

// Obtener resumen de presupuesto
async function getBudgetSummary(costCenterId) {
  const response = await fetch(
    `/api/budget/summary?costCenterId=${costCenterId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}
```

---

**Versión:** 1.0.0  
**Última actualización:** 2026-01-05
