# 🎯 Guía Rápida - Módulo de Presupuestos

## Base URL
```
http://localhost:8080/api/budget
```

## Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1️⃣ CREAR CENTRO DE COSTO CON CLIENTE

```bash
POST /api/cost-centers
```

```json
{
  "code": "CC-001",
  "name": "Centro Principal",
  "budget": 100000,
  "clientId": "CLI-001",
  "contractNumber": "CONT-2026-001",
  "clientNit": "123456789"
}
```

**Respuesta:**
```json
{
  "message": "Centro de costo creado exitosamente",
  "center": {
    "id": "uuid-123",
    "code": "CC-001",
    "name": "Centro Principal",
    "budget": 100000,
    "client_id": "CLI-001",
    "contract_number": "CONT-2026-001",
    "client_nit": "123456789",
    ...
  }
}
```

---

## 2️⃣ ASIGNAR PRESUPUESTO DESDE PLANTILLA

```bash
POST /api/budget/assign-template/{costCenterId}
```

```json
{
  "budgetAmount": 100000
}
```

**Respuesta:**
```json
{
  "message": "Presupuesto asignado desde plantilla exitosamente",
  "categories": [
    {
      "id": "uuid",
      "cost_center_id": "{costCenterId}",
      "name": "Recursos Humanos",
      "amount": 50000,
      "percentage": 50
    },
    {
      "id": "uuid",
      "cost_center_id": "{costCenterId}",
      "name": "Logística",
      "amount": 20000,
      "percentage": 20
    },
    ...
  ],
  "total": 100000
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

## 3️⃣ OBTENER CATEGORÍAS DE UN CENTRO

```bash
GET /api/budget/categories?costCenterId={costCenterId}
```

**Respuesta:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "cost_center_id": "{costCenterId}",
      "name": "Recursos Humanos",
      "amount": 50000,
      "percentage": 50,
      "subtotal": 45000,
      "subcategories": [
        {
          "id": "uuid",
          "name": "Salarios",
          "amount": 30000
        },
        {
          "id": "uuid",
          "name": "Prestaciones",
          "amount": 15000
        }
      ]
    }
  ],
  "total": 100000,
  "count": 6
}
```

---

## 4️⃣ CREAR SUBCATEGORÍA (SUBRUBRO)

```bash
POST /api/budget/subcategories
```

```json
{
  "budgetCategoryId": "uuid-categoria",
  "name": "Salarios Base",
  "amount": 35000,
  "description": "Nómina mensual"
}
```

**Respuesta:**
```json
{
  "message": "Subcategoría de presupuesto creada exitosamente",
  "subcategory": {
    "id": "uuid",
    "budget_category_id": "uuid-categoria",
    "name": "Salarios Base",
    "amount": 35000,
    "description": "Nómina mensual",
    "created_at": "2026-01-05T10:00:00Z"
  }
}
```

---

## 5️⃣ OBTENER RESUMEN COMPLETO

```bash
GET /api/budget/summary?costCenterId={costCenterId}
```

**Respuesta:**
```json
{
  "costCenter": {
    "id": "uuid",
    "code": "CC-001",
    "name": "Centro Principal",
    "clientId": "CLI-001",
    "contractNumber": "CONT-2026-001",
    "clientNit": "123456789"
  },
  "budget": {
    "total": 100000,
    "allocated": 95000,
    "remaining": 5000,
    "utilisationPercentage": "95.00"
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Recursos Humanos",
      "allocated": 50000,
      "spent": 45000,
      "remaining": 5000,
      "percentage": "90.00",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Salarios",
          "amount": 30000
        },
        {
          "id": "uuid",
          "name": "Prestaciones",
          "amount": 15000
        }
      ]
    }
  ],
  "summary": {
    "totalCategories": 6,
    "totalSubcategories": 15
  }
}
```

---

## 6️⃣ ACTUALIZAR CATEGORÍA

```bash
PUT /api/budget/categories/{categoryId}
```

```json
{
  "amount": 55000,
  "percentage": 55,
  "description": "Presupuesto actualizado"
}
```

---

## 7️⃣ ACTUALIZAR SUBCATEGORÍA

```bash
PUT /api/budget/subcategories/{subcategoryId}
```

```json
{
  "amount": 32000,
  "name": "Salarios Actualizado"
}
```

---

## 8️⃣ OBTENER PLANTILLA POR DEFECTO

```bash
GET /api/budget/template/default
```

**Respuesta:**
```json
{
  "message": "Plantilla de presupuesto por defecto",
  "template": [
    {
      "name": "Recursos Humanos",
      "icon": "users",
      "color": "#3b82f6",
      "subcategories": [
        "Salarios",
        "Prestaciones",
        "Bonificaciones",
        "Capacitación",
        "Otros"
      ]
    },
    {
      "name": "Logística",
      "icon": "truck",
      "color": "#8b5cf6",
      "subcategories": [
        "Transporte",
        "Almacenamiento",
        "Empaques",
        "Distribución",
        "Otros"
      ]
    }
  ]
}
```

---

## 9️⃣ ELIMINAR CATEGORÍA

```bash
DELETE /api/budget/categories/{categoryId}
```

**Nota:** Solo si no tiene subcategorías asociadas

---

## 🔟 ELIMINAR SUBCATEGORÍA

```bash
DELETE /api/budget/subcategories/{subcategoryId}
```

---

## 📋 CÓDIGOS DE ESTADO

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error en servidor |

---

## ⚠️ ERRORES COMUNES

### Error: Centro de costo no existe
```json
{
  "error": "El centro de costo no existe"
}
```

### Error: Categoría tiene subcategorías
```json
{
  "error": "No se puede eliminar la categoría porque tiene subcategorías asociadas"
}
```

### Error: Campos requeridos faltantes
```json
{
  "error": "El centro de costo y nombre de categoría son requeridos"
}
```

---

## 💡 FLUJO TÍPICO COMPLETO

### Paso 1: Crear centro de costo
```bash
POST /api/cost-centers
```

### Paso 2: Asignar presupuesto
```bash
POST /api/budget/assign-template/{costCenterId}
```

### Paso 3: Ver distribución
```bash
GET /api/budget/categories?costCenterId={costCenterId}
```

### Paso 4: Crear subrubros específicos
```bash
POST /api/budget/subcategories
```

### Paso 5: Ver resumen final
```bash
GET /api/budget/summary?costCenterId={costCenterId}
```

---

## 🔗 Variables Dinámicas

| Variable | Descripción |
|----------|-------------|
| `{costCenterId}` | UUID del centro de costo |
| `{categoryId}` | UUID de la categoría/rubro |
| `{subcategoryId}` | UUID de la subcategoría/subrubro |

---

**Versión:** 1.0.0  
**Última actualización:** 2026-01-05
