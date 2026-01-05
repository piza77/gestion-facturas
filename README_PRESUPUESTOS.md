# 📊 MÓDULO DE PRESUPUESTOS Y RUBROS

## ✅ Implementación Completada

**Fecha:** 5 de Enero de 2026  
**Estado:** ✅ Listo para Producción  
**Versión:** 1.0.0

---

## 🎯 Objetivo

Permitir la gestión completa de presupuestos en centros de costos, distribuidos en rubros específicos y subrubros detallados, con información de cliente.

---

## 📋 Lo Que Se Implementó

### ✅ Funcionalidades Principales

1. **Gestión de Presupuestos**
   - Asignar presupuesto total a cada centro de costo
   - Distribuir presupuesto en 6 rubros predefinidos
   - Crear subrubros especializados dentro de cada rubro
   - Rastrear gasto vs presupuesto

2. **Información de Cliente**
   - ID del Cliente
   - Número de Contrato
   - Cédula/NIT del Cliente o Empresa

3. **Rubros Disponibles**
   - 🧑‍💼 Recursos Humanos (50%)
   - 🚚 Logística (20%)
   - 💰 Reembolsables (10%)
   - 📄 Contratos (10%)
   - ⚠️ Imprevistos (8%)
   - 📦 Otros (2%)

4. **Reportes y Análisis**
   - Resumen de presupuesto por centro de costo
   - Análisis de utilización presupuestaria
   - Distribución de rubros y subrubros
   - Presupuesto disponible vs gastado

---

## 📁 Estructura de Archivos

### Modelos (Backend)
```
backend/models/
├── BudgetCategory.js          ← Gestiona rubros/categorías
├── BudgetSubcategory.js       ← Gestiona subrubros/subcategorías
└── CostCenter.js              ← Actualizado con nuevos campos
```

### Controladores
```
backend/controllers/
└── budget.controller.js       ← Lógica de presupuestos
```

### Rutas
```
backend/routes/
└── budget.routes.js           ← Endpoints de presupuesto
```

### Migraciones
```
backend/migrations/
├── add_budget_management.js   ← Crea tablas en BD
└── run-migration.js           ← Script ejecutable
```

### Documentación
```
.
├── BUDGET_MANAGEMENT_DOCS.md        ← Documentación completa (API)
├── BUDGET_IMPLEMENTATION_SUMMARY.md ← Resumen de implementación
├── BUDGET_QUICK_REFERENCE.md        ← Guía rápida
├── BUDGET_TEST_EXAMPLES.md          ← Ejemplos de pruebas
└── README_PRESUPUESTOS.md           ← Este archivo
```

---

## 🗄️ Base de Datos

### Nuevas Tablas

#### `budget_categories`
```sql
Almacena los rubros (Recursos Humanos, Logística, etc.)

Campos:
- id (UUID)
- cost_center_id (FK)
- name (VARCHAR)
- amount (DECIMAL)
- percentage (DECIMAL)
- description (TEXT)
- display_order (INT)
- created_at, updated_at (TIMESTAMP)
```

#### `budget_subcategories`
```sql
Almacena los subrubros (Salarios, Transporte, etc.)

Campos:
- id (UUID)
- budget_category_id (FK)
- name (VARCHAR)
- amount (DECIMAL)
- description (TEXT)
- display_order (INT)
- created_at, updated_at (TIMESTAMP)
```

### Columnas Agregadas

#### `cost_centers`
```sql
- client_id (VARCHAR) → ID del cliente
- contract_number (VARCHAR) → Número del contrato
- client_nit (VARCHAR) → Cédula/NIT
```

---

## 🔌 Endpoints API

### Base URL
```
/api/budget
```

### Categorías (Rubros)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/categories` | Crear rubro |
| GET | `/categories` | Obtener rubros |
| GET | `/categories/:id` | Obtener rubro específico |
| PUT | `/categories/:id` | Actualizar rubro |
| DELETE | `/categories/:id` | Eliminar rubro |

### Subcategorías (Subrubros)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/subcategories` | Crear subrubro |
| GET | `/subcategories` | Obtener subrubros |
| PUT | `/subcategories/:id` | Actualizar subrubro |
| DELETE | `/subcategories/:id` | Eliminar subrubro |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/template/default` | Plantilla predefinida |
| GET | `/summary` | Resumen de presupuesto |
| POST | `/assign-template/:id` | Asignar desde plantilla |

---

## 🚀 Uso Rápido

### 1. Crear Centro de Costo
```bash
POST /api/cost-centers
{
  "code": "CC-001",
  "name": "Centro Principal",
  "budget": 100000,
  "clientId": "CLI-001",
  "contractNumber": "CONT-2026-001",
  "clientNit": "123456789"
}
```

### 2. Asignar Presupuesto
```bash
POST /api/budget/assign-template/{costCenterId}
{
  "budgetAmount": 100000
}
```

### 3. Ver Distribución
```bash
GET /api/budget/categories?costCenterId={costCenterId}
```

### 4. Crear Subrubro
```bash
POST /api/budget/subcategories
{
  "budgetCategoryId": "{categoryId}",
  "name": "Salarios",
  "amount": 30000
}
```

### 5. Ver Resumen
```bash
GET /api/budget/summary?costCenterId={costCenterId}
```

---

## 📖 Documentación Disponible

### Para Desarrolladores
- **BUDGET_MANAGEMENT_DOCS.md** - Documentación técnica completa de la API
- **BUDGET_TEST_EXAMPLES.md** - Ejemplos en cURL, JavaScript y Vue.js

### Para Usuarios/Analistas
- **BUDGET_QUICK_REFERENCE.md** - Guía rápida de endpoints
- **BUDGET_IMPLEMENTATION_SUMMARY.md** - Resumen general de implementación

---

## 🔧 Instalación

### 1. Ejecutar Migración
```bash
cd backend
node run-migration.js
```

**Salida esperada:**
```
✓ Columna client_id agregada
✓ Columna contract_number agregada
✓ Columna client_nit agregada
✓ Tabla budget_categories creada
✓ Tabla budget_subcategories creada
✅ ¡Migración completada exitosamente!
```

### 2. Reiniciar Servidor
```bash
npm start
```

### 3. Verificar Instalación
```bash
curl http://localhost:8080/health
```

---

## 💾 Distribución Presupuestaria Automática

Cuando usas `/assign-template`, se distribuye automáticamente así:

```
Presupuesto Total: $100,000
├── Recursos Humanos: $50,000 (50%)
├── Logística: $20,000 (20%)
├── Reembolsables: $10,000 (10%)
├── Contratos: $10,000 (10%)
├── Imprevistos: $8,000 (8%)
└── Otros: $2,000 (2%)
```

---

## 📊 Flujo de Uso Típico

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREAR CENTRO DE COSTO                                    │
│    POST /api/cost-centers                                   │
│    - Incluir: clientId, contractNumber, clientNit           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ASIGNAR PRESUPUESTO DESDE PLANTILLA                      │
│    POST /api/budget/assign-template/{costCenterId}          │
│    - Se crean 6 rubros automáticamente                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. OBTENER DISTRIBUCIÓN                                     │
│    GET /api/budget/categories?costCenterId={id}             │
│    - Ver rubros con subcategorías                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CREAR SUBRUBROS ESPECÍFICOS (OPCIONAL)                   │
│    POST /api/budget/subcategories                           │
│    - Detallar cada rubro en aspectos específicos            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MONITOREAR PRESUPUESTO                                   │
│    GET /api/budget/summary?costCenterId={id}                │
│    - Ver utilización vs disponible                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticación

Todos los endpoints requieren:
```
Authorization: Bearer <token-jwt>
```

---

## ✨ Características Especiales

### ✅ Validaciones
- Verificación de centro de costo existente
- Prevención de duplicados
- Validación de montos
- Relaciones en cascada

### ✅ Cálculos Automáticos
- Porcentaje de utilización
- Presupuesto disponible
- Suma de subrubros
- Total por categoría

### ✅ Auditoría
- Timestamps de creación/actualización
- Rastreo de cambios
- Historial implícito

---

## 🐛 Solución de Problemas

### Tabla no existe
```
Solución: Ejecutar migración
node backend/run-migration.js
```

### 403 Unauthorized
```
Solución: Verificar token JWT
Asegurar que token esté vigente y correcto
```

### Centro de costo no encontrado
```
Solución: Verificar costCenterId
El ID debe ser UUID válido del centro de costo
```

### No se puede eliminar categoría
```
Solución: Tiene subcategorías asociadas
Primero eliminar subcategorías, luego la categoría
```

---

## 📈 Próximas Mejoras

- [ ] Integración con facturas
- [ ] Alertas de presupuesto
- [ ] Exportar a PDF/Excel
- [ ] Gráficos de distribución
- [ ] Histórico de versiones
- [ ] Revisiones periódicas

---

## 📞 Soporte

Para más información:
1. Lee **BUDGET_MANAGEMENT_DOCS.md** para detalles técnicos
2. Consulta **BUDGET_QUICK_REFERENCE.md** para referencia rápida
3. Ve **BUDGET_TEST_EXAMPLES.md** para ejemplos de código

---

## ✅ Checklist de Verificación

- [x] Modelos creados y funcionando
- [x] Controlador con CRUD completo
- [x] Rutas API implementadas
- [x] Migración ejecutada
- [x] Tablas creadas en BD
- [x] Campos agregados a cost_centers
- [x] Documentación completa
- [x] Ejemplos de código incluidos
- [x] Validaciones implementadas
- [x] Tests pasando

---

**Módulo de Presupuestos v1.0.0**  
**Implementado:** 5 de Enero de 2026  
**Estado:** ✅ Listo para Producción
