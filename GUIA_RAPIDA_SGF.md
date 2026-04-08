# 🚀 GUÍA RÁPIDA - ESTRUCTURA SGF

## ⚡ ACCESOS DIRECTOS

### 🔧 Necesito modificar...

**Facturas y sus 5 fases de aprobación?**
```
backend/controllers/invoice.controller.js (LÓGICA)
backend/routes/invoice.routes.js (RUTAS)
backend/models/Invoice.model.js (ESTRUCTURA)
frontend/views/Invoices.vue (INTERFAZ)
```

**Presupuestos y categorías?**
```
backend/controllers/budget.controller.js
backend/routes/budget.routes.js
frontend/views/ (crear si necesario)
BD: budget_categories, budget_subcategories, budget_items, budget_expenses
```

**Proveedores?**
```
backend/controllers/provider.controller.js
backend/models/Provider.model.js
frontend/views/Providers.vue
BD: providers table
```

**Empleados?**
```
backend/controllers/employee.controller.js
backend/models/Employee.model.js
frontend/views/Employees.vue
BD: employees table
```

**Usuarios y roles?**
```
backend/middleware/auth.js (autenticación)
backend/controllers/user.controller.js
backend/models/User.model.js
frontend/stores/auth.js (estado)
BD: users table
Roles: admin, manager, analyst, user, viewer
```

**Reportes y estadísticas?**
```
backend/controllers/dashboard.controller.js
frontend/views/Dashboard.vue
frontend/stores/dashboard.store.js
```

**Tipos de documentos dinámicos?**
```
backend/controllers/documentType.controller.js
frontend/components/DocumentTypeAdmin.vue
frontend/components/DynamicDocumentForm.vue
BD: document_types, documents
```

**Base de datos (schema, backups)?**
```
backend/controllers/database.controller.js
backend/routes/database.routes.js
frontend/views/DatabaseAdmin.vue
```

---

## 📍 UBICACIÓN DE ARCHIVOS CLAVE

```
backend/
├─ routes/
│  ├─ auth.routes.js              → POST /api/auth/login
│  ├─ invoice.routes.js           → GET/POST/PUT /api/invoices
│  ├─ budget.routes.js            → Presupuestos
│  ├─ provider.routes.js          → Proveedores
│  ├─ employee.routes.js          → Empleados
│  ├─ user.routes.js              → Usuarios
│  ├─ costCenter.routes.js        → Centros de costo
│  ├─ documentType.routes.js      → Tipos dinámicos
│  ├─ dashboard.routes.js         → Reportes
│  ├─ invoiceType.routes.js       → Tipos de factura
│  └─ database.routes.js          → Admin BD

├─ controllers/
│  ├─ auth.controller.js          → Login/Registro
│  ├─ invoice.controller.js       → ⭐ PRINCIPAL (5 fases)
│  ├─ budget.controller.js        → Presupuestos
│  ├─ provider.controller.js      → Proveedores
│  ├─ employee.controller.js      → Empleados
│  ├─ user.controller.js          → Usuarios
│  ├─ costCenter.controller.js    → Centros
│  ├─ documentType.controller.js  → Tipos
│  ├─ dashboard.controller.js     → Estadísticas
│  └─ database.controller.js      → Admin BD

├─ models/
│  ├─ User.model.js               → users table
│  ├─ Invoice.model.js            → invoices table (⭐ 35+ campos)
│  ├─ Provider.model.js           → providers table
│  ├─ Employee.model.js           → employees table
│  ├─ BudgetCategory.model.js     → budget_categories
│  ├─ BudgetItem.model.js         → budget_items
│  ├─ DocumentType.model.js       → document_types
│  └─ CostCenter.model.js         → cost_centers

├─ middleware/
│  ├─ auth.js                     → JWT validation
│  ├─ upload.js                   → Multer files
│  └─ validators/
│     ├─ invoice.validator.js     → Validaciones
│     └─ documentType.validator.js

└─ services/
   ├─ database.service.js         → BD queries
   └─ documentType.service.js     → Lógica dinámicos

frontend/
├─ views/
│  ├─ Login.vue                   → /login
│  ├─ Register.vue                → /register
│  ├─ Dashboard.vue               → /dashboard
│  ├─ Invoices.vue                → /invoices (⭐ PRINCIPAL)
│  ├─ Providers.vue               → /providers
│  ├─ Employees.vue               → /employees
│  ├─ Users.vue                   → /users (admin)
│  ├─ CostCenters.vue             → /cost-centers
│  ├─ PettyCash.vue               → /petty-cash
│  └─ DatabaseAdmin.vue           → /database-admin

├─ components/
│  ├─ Navbar.vue                  → Navegación
│  ├─ RecordForm.vue              → Formulario genérico
│  ├─ TableDataViewer.vue         → Tablas con datos
│  ├─ AdminInvoiceTypes.vue       → Tipos de factura
│  ├─ DocumentTypeAdmin.vue       → Crear tipos dinámicos
│  ├─ DynamicDocumentForm.vue     → Formularios dinámicos
│  ├─ BackupManager.vue           → Backups
│  └─ DatabaseManagerPanel.vue    → Admin BD

├─ stores/
│  ├─ auth.js                     → Estado autenticación
│  ├─ dashboard.store.js          → Estado reportes
│  └─ (otros stores)

├─ services/
│  ├─ invoiceService.js           → API /invoices
│  ├─ authService.js              → API /auth
│  ├─ providerService.js          → API /providers
│  ├─ budgetService.js            → API /budget
│  └─ (otros services)

├─ router/
│  └─ index.js                    → Rutas y guards

└─ assets/
   └─ styles.css                  → Estilos

BD (MySQL):
├─ Autenticación: users
├─ Maestros: employees, providers, cost_centers, invoice_types
├─ ⭐ Transacciones: invoices (con 5 fases + análisis contable)
├─ Presupuestos: budget_categories, budget_subcategories, budget_items, budget_expenses
├─ Tipos: document_types, documents
└─ Sistema: database_audits, database_backups, database_migrations
```

---

## 🎯 TABLA RÁPIDA DE CAMPOS IMPORTANTES

### Invoice (⭐ TABLA PRINCIPAL)

```javascript
{
  // Identificación
  id: UUID,
  invoice_number: String (único),
  invoice_type_id: FK → invoice_types,
  
  // Origen
  provider_id: FK → providers,
  employee_id: FK → employees,
  cost_center_id: FK → cost_centers,
  order_number: String,
  
  // Fechas
  issue_date: Date,
  due_date: Date,
  
  // Montos
  subtotal: Decimal,
  tax: Decimal,
  discount: Decimal,
  total: Decimal, // = subtotal + tax - discount
  
  // ✅ FASE 1: Aprobación Administrativa
  admin_director_approved: Boolean,
  admin_director_approved_at: DateTime,
  
  // ✅ FASE 2: Análisis Contable
  analyst_good_seal_approved: Boolean,
  analyst_xml_file_path: String,
  analyst_review_date: DateTime,
  analyst_observations: Text,
  analyst_reviewed_by: FK → users,
  
  // ✅ FASE 3: Registro Contable
  accounting_municipality: String,
  accounting_registration_date: DateTime,
  accounting_document_type: String,
  accounting_document_number: String,
  accounting_dian_number: String,
  accounting_observations: Text,
  
  // ✅ FASE 4: Control de Pago
  payment_date: DateTime,
  payment_receipt_file_path: String,
  payment_amount: Decimal,
  finance_director_approved: Boolean,
  payment_observations: Text,
  
  // ✅ FASE 5: Seguimiento
  general_director_approved: Boolean,
  follow_up_date: DateTime,
  follow_up_observations: Text,
  
  // Otros
  is_reimbursable: Boolean,
  description: Text,
  notes: Text,
  filePath: String (PDF/Excel),
  fileName: String,
  status: ENUM(pending|analyzing|approved|rejected|paid),
  created_at: DateTime,
  updated_at: DateTime,
  deleted_at: DateTime (soft delete)
}
```

### BudgetCategory (Presupuestos)

```javascript
{
  id: UUID,
  cost_center_id: FK,          // ¿A qué centro pertenece?
  name: String,                // "Recursos Humanos", "Logística"
  amount: Decimal,             // Presupuesto asignado
  percentage: Decimal,         // % del presupuesto total
  executed_amount: Decimal,    // Cuánto se gastó
  description: Text,
  display_order: Int,
  created_at: DateTime,
  updated_at: DateTime
}
```

### DocumentType (Tipos Dinámicos)

```javascript
{
  id: UUID,
  name: String (único),        // "Nota de Acompañamiento"
  code: String (único),        // "NOA"
  prefix: String,              // Para numeración "NA"
  nextSequence: Int,           // Próximo folio
  description: Text,
  fields: JSON({               // Estructura flexible
    fieldName: String,
    fieldType: String,         // text|number|date|select|file
    label: String,
    required: Boolean,
    validation: String,
    placeholder: String
  }),
  isActive: Boolean,
  createdBy: FK → users,
  updatedBy: FK → users,
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## 🔐 ROLES Y PERMISOS

```
admin
├─ Ver: TODO
├─ Crear: TODO
├─ Editar: TODO
├─ Eliminar: TODO
└─ Acceso: /database-admin, /users

manager
├─ Ver: Facturas, Proveedores, Empleados, Presupuestos
├─ Crear: Facturas, Proveedores, Empleados
├─ Editar: Sus registros
└─ Eliminar: NO

analyst
├─ Ver: Facturas (para análisis)
├─ Crear: Análisis de facturas
├─ Aprobación: PATCH /invoices/:id/analyze
└─ Acceso: Panel de análisis

user
├─ Ver: Sus registros
├─ Crear: Facturas
├─ Editar: Sus facturas (si pending)
└─ Eliminar: Sus facturas (si pending)

viewer
└─ Ver: Solo lectura
```

---

## 🌊 CICLO DE VIDA DE UNA FACTURA

```
1. Creado (pending)
   └─ Usuario crea, archivo en /uploads/invoices/

2. En análisis (analyzing)
   └─ Director Administrativo revisa "pending"

3. Aprobado (approved)
   └─ Analista revisa XML DIAN ✅

4. Registrado (approved)
   └─ Municipio registra

5. Pagado (paid)
   └─ Director Financiero paga y adjunta recibo

6. Cerrado (paid)
   └─ Director General cierra ciclo

Estados posibles: pending | analyzing | approved | rejected | paid
```

---

## 📡 ENDPOINTS PRINCIPALES

```javascript
// AUTENTICACIÓN
POST   /api/auth/login              → { email, password } → { token, user }
POST   /api/auth/register           → { first_name, last_name, email, password }
GET    /api/auth/me                 → Retorna usuario actual (JWT)

// FACTURAS (⭐ PRINCIPAL)
GET    /api/invoices?filters        → Listar con búsqueda y filtros
GET    /api/invoices/:id            → Detalle de factura
POST   /api/invoices                → Crear factura + archivo
PUT    /api/invoices/:id            → Actualizar si pending
PATCH  /api/invoices/:id/status     → 5 fases de aprobación
DELETE /api/invoices/:id            → Eliminar si pending
GET    /api/invoices/stats/general  → KPIs
GET    /api/invoices/stats/monthly  → Tendencia mensual
GET    /api/invoices/reports/petty-cash → Reporte caja menor

// PRESUPUESTOS
POST   /api/budget/categories       → Crear rubro
POST   /api/budget/categories/:id/items → Crear item
POST   /api/budget/expenses         → Registrar gasto
GET    /api/budget/cost-centers/:id → Estado presupuesto

// OTROS
GET    /api/providers               → Listar proveedores
GET    /api/employees               → Listar empleados
GET    /api/cost-centers            → Centros de costo
GET    /api/dashboard/stats         → Estadísticas generales
GET    /api/document-types          → Tipos dinámicos
POST   /api/documents               → Crear documento dinámico
GET    /api/database/schema         → Schema BD
```

---

## 🎓 ¿CÓMO PROPONER UN CAMBIO?

**1. Define qué quieres cambiar**
```
Ejemplo: "Agregar campo 'Referencia Interna' a facturas"
```

**2. Usa la matriz para saber dónde**
```
├─ invoice.model.js       (estructura)
├─ invoice.controller.js  (lógica)
├─ invoice.routes.js      (rutas, solo si aplica)
├─ Invoices.vue           (interfaz)
└─ invoices TABLE (BD)    (persistencia)
```

**3. Propón exactamente qué agregar**
```
"Agregar campo internal_reference VARCHAR(50) a tabla invoices.
Mostrar en formulario como input text.
Retornar en GET /api/invoices endpoints."
```

**4. Yo implemento con precisión** ✅

---

**Documentación Completa:** Abre `ESTRUCTURA_APLICACION_COMPLETA.md`  
**Esta Guía:** Para accesos rápidos  
**¿Duda?** Consulta el índice o propón un cambio específico
