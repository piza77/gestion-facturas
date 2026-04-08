# 📊 ESTRUCTURA COMPLETA - SISTEMA DE GESTIÓN DE FACTURAS Y PRESUPUESTOS

**Fecha:** 8 de abril de 2026  
**Última actualización:** Estructura completa documentada  
**Propósito:** Referencia única para entender dónde está cada elemento, dato y código

---

## 🎯 ÍNDICE DE CONTENIDOS

1. [Visión General](#-visión-general-de-la-aplicación)
2. [Arquitectura General](#-arquitectura-general)
3. [Backend - Rutas y Controladores](#-backend--rutas-y-controladores)
4. [Backend - Base de Datos](#-backend--estructura-de-base-de-datos)
5. [Backend - Servicios y Middleware](#-backend--servicios-y-middleware)
6. [Frontend - Estructura](#-frontend--estructura)
7. [Frontend - Componentes](#-frontend--componentes)
8. [Flujos Principales](#-flujos-principales-de-datos)
9. [Matriz de Cambios](#-matriz-para-proponer-cambios)

---

## 🌐 VISIÓN GENERAL DE LA APLICACIÓN

### Propósito
Sistema integral para la **gestión, aprobación y seguimiento de facturas y presupuestos** con soporte para múltiples fases de aprobación, análisis contable automático y reportes estadísticos.

### Stack Tecnológico
```
└─ Frontend:
   ├─ Vue 3 (framework)
   ├─ Pinia (state management)
   ├─ Axios (cliente HTTP)
   └─ CSS personalizado

└─ Backend:
   ├─ Node.js (runtime)
   ├─ Express (framework)
   ├─ MySQL 8.0+ (base de datos)
   ├─ JWT (autenticación)
   ├─ Multer (archivos)
   └─ Express-validator (validaciones)

└─ Roles de Usuarios:
   ├─ admin (acceso total)
   ├─ manager (gestión operativa)
   ├─ analyst (análisis contable)
   ├─ user (usuario estándar)
   └─ viewer (solo lectura)
```

### Usuarios Principales del Sistema
1. **Director General** - Aprobación final (fase 5)
2. **Director Financiero** - Control de pago (fase 4)  
3. **Municipio** - Registro contable (fase 3)
4. **Analista Contable** - Análisis DIAN/XML (fase 2)
5. **Director Administrativo** - Aprobación inicial (fase 1)
6. **Administrador del Sistema** - Configuración

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB                        │
│                                                           │
│  Frontend (Vue 3 + Pinia)                                │
│  ├─ Vistas/Páginas                                       │
│  ├─ Componentes                                          │
│  ├─ State Management                                     │
│  └─ Servicios API                                        │
└─────────────────────────────────────────────────────────┘
                          ↓↑ (HTTP/HTTPS)
                    API REST (Express)
┌─────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                    │
│                                                           │
│  ├─ Rutas (11 módulos principales)                       │
│  ├─ Controladores (lógica de negocio)                    │
│  ├─ Middleware (autenticación, validación)               │
│  ├─ Servicios (database, documentType)                   │
│  └─ Modelos (17+ modelos de datos)                       │
└─────────────────────────────────────────────────────────┘
                          ↓↑ (Conexión)
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (MySQL 8.0+)                  │
│                                                           │
│  ├─ Tablas de autenticación (users)                      │
│  ├─ Maestros (employees, providers, cost_centers)        │
│  ├─ Transacciones (invoices, documents)                  │
│  ├─ Presupuestos (budget_*)                              │
│  └─ Auditoría (database_audits, backups)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 BACKEND - RUTAS Y CONTROLADORES

### Resumen de Rutas Disponibles

| Base | Archivo | Funcionalidad |
|------|---------|---------------|
| `POST /api/auth/login` | [auth.routes.js](backend/routes/auth.routes.js) | Autenticación |
| `POST /api/auth/register` | [auth.routes.js](backend/routes/auth.routes.js) | Registro |
| `GET /api/users` | [user.routes.js](backend/routes/user.routes.js) | Listar usuarios |
| `GET /api/invoices` | [invoice.routes.js](backend/routes/invoice.routes.js) | Listar facturas |
| `POST /api/invoices` | [invoice.routes.js](backend/routes/invoice.routes.js) | Crear factura |
| `PATCH /api/invoices/:id/status` | [invoice.routes.js](backend/routes/invoice.routes.js) | Cambiar estado |
| `GET /api/budget` | [budget.routes.js](backend/routes/budget.routes.js) | Presupuestos |
| `GET /api/database/schema` | [database.routes.js](backend/routes/database.routes.js) | BD Schema |

### Controladores Detallados

#### 1️⃣ **auth.controller.js** - AUTENTICACIÓN Y AUTORIZACIÓN

**Ubicación:** `backend/controllers/auth.controller.js`

**Funciones Principales:**

```javascript
// Login: Validar credenciales y generar token JWT
POST /api/auth/login
├─ Input: { email, password }
├─ Validar usuario existe y contraseña correcta
├─ Generar JWT con expiración (24h)
└─ Return: { token, user: { id, email, role, name } }

// Registro: Crear nuevo usuario
POST /api/auth/register
├─ Input: { first_name, last_name, email, password }
├─ Validar email único
├─ Encriptar contraseña con bcrypt
├─ Crear usuario con role por defecto
└─ Return: { user, token }

// Obtener usuario actual
GET /api/auth/me
├─ Middleware: requireAuth
├─ Obtiene datos del usuario del token JWT
└─ Return: Usuario completo

// Cambiar contraseña
POST /api/auth/change-password
├─ Input: { oldPassword, newPassword }
├─ Validar contraseña actual
├─ Encriptar nueva contraseña
└─ Return: { success: true }
```

**Roles Soportados:**
- `admin` - Acceso a todo
- `manager` - Gestión operativa
- `analyst` - Análisis contable
- `user` - Usuario estándar
- `viewer` - Solo lectura

---

#### 2️⃣ **invoice.controller.js** - GESTIÓN PRINCIPAL DE FACTURAS

**Ubicación:** `backend/controllers/invoice.controller.js`

**Funciones Principales:**

```javascript
// 📋 LISTADO CON FILTROS
GET /api/invoices?search=&status=&from_date=&to_date=&provider_id=
├─ Filtros:
│  ├─ search: Busca en invoice_number, provider_name
│  ├─ status: pending|analyzing|approved|rejected|paid
│  ├─ from_date / to_date: Rango de fechas
│  ├─ provider_id: Filtrar por proveedor
│  └─ cost_center_id: Filtrar por centro
├─ Output: Paginado con total
└─ Cada factura incluye:
   ├─ invoice_number, issue_date, due_date
   ├─ provider (nombre, nit)
   ├─ subtotal, tax, discount, total
   ├─ status (visual con color)
   ├─ 5 fases de aprobación
   └─ análisis contable

// 🔍 DETALLE DE UNA FACTURA
GET /api/invoices/:id
├─ Retorna objeto completo incluyendo:
│  ├─ Datos básicos
│  ├─ Estado actual
│  ├─ Todas las aprobaciones
│  ├─ Ruta del archivo PDF/Excel
│  ├─ Observaciones de cada fase
│  └─ Auditoría de cambios

// ➕ CREAR NUEVA FACTURA
POST /api/invoices
├─ Input:
│  ├─ invoice_number (único)
│  ├─ invoice_type_id (FV, NC, ND, etc)
│  ├─ provider_id (de tabla providers)
│  ├─ employee_id (quien reporta)
│  ├─ cost_center_id
│  ├─ issue_date, due_date
│  ├─ subtotal, tax, discount, total
│  ├─ is_reimbursable (si es reembolso)
│  ├─ description, notes
│  ├─ order_number (opcional)
│  ├─ File: Documento PDF/Excel
│  └─ Orden de compra (s.o.)
├─ Validaciones:
│  ├─ invoice_number único
│  ├─ Sumar correctamente: total = (subtotal + tax - discount)
│  ├─ Proveedor debe existir
│  ├─ Empleado debe existir
│  └─ Centro de costo debe existir
├─ Crear registro en "invoices" con estado: "pending"
├─ Guardar archivo en /uploads/invoices/
└─ Return: Factura creada con ID

// ✏️ ACTUALIZAR FACTURA
PUT /api/invoices/:id
├─ Permisos: Solo si status = "pending"
├─ Actualizar campos
├─ Registrar auditoría
└─ Return: Factura actualizada

// 🔄 5 FASES DE APROBACIÓN (PATCH /api/invoices/:id/status)

Phase 1: APROBACIÓN ADMINISTRATIVA
├─ Ejecuta: Director Administrativo
├─ Campo: admin_director_approved (boolean)
├─ Acción: Revisa integridad de datos
├─ Siguiente: Análisis Contable
├─ Endpoint: PATCH /invoices/:id/approve/admin
└─ Transición de estado: pending → analyzing

Phase 2: ANÁLISIS CONTABLE
├─ Ejecuta: Analista Contable
├─ Campos:
│  ├─ analyst_good_seal_approved (sello digital DIAN)
│  ├─ analyst_xml_file_path (archivo XML)
│  ├─ analyst_review_date (fecha análisis)
│  └─ analyst_observations (notas)
├─ Validaciones:
│  ├─ Descargar XML desde DIAN
│  ├─ Validar sello digital
│  ├─ Verificar valores en BD
│  └─ Revisar observaciones tributarias
├─ Siguiente: Registro Contable (municipio)
├─ Endpoint: PATCH /invoices/:id/analyze
└─ Transición: analyzing → approved (si bien sella)

Phase 3: REGISTRO CONTABLE (MUNICIPIO)
├─ Ejecuta: Municipio
├─ Campos:
│  ├─ accounting_municipality (nombre con fecha)
│  ├─ accounting_registration_date (fecha)
│  ├─ accounting_document_type (tipo doc)
│  ├─ accounting_document_number (número único)
│  ├─ accounting_dian_number (DIAN)
│  └─ accounting_observations (notas)
├─ Siguiente: Control de Pago
├─ Endpoint: PATCH /invoices/:id/register-accounting
└─ Transición: approved → approved (confirmación)

Phase 4: CONTROL DE PAGO (DIRECTOR FINANCIERO)
├─ Ejecuta: Director Financiero
├─ Campos:
│  ├─ payment_date (cuando se pagó)
│  ├─ payment_amount (monto desembolsado)
│  ├─ payment_receipt_file_path (recibo)
│  ├─ finance_director_approved
│  └─ payment_observations
├─ Validar: payment_amount <= total
├─ Siguiente: Seguimiento
├─ Endpoint: PATCH /invoices/:id/pay
└─ Transición: approved → paid

Phase 5: SEGUIMIENTO (DIRECTOR GENERAL)
├─ Ejecuta: Director General
├─ Campos:
│  ├─ general_director_approved (cierre)
│  ├─ follow_up_observations
│  └─ follow_up_date
├─ Acción: Revisión final y archivo
├─ Endpoint: PATCH /invoices/:id/follow-up
└─ Transición: paid → paid (con cierre)

// 📊 ESTADÍSTICAS
GET /api/invoices/stats/general
├─ Total de facturas
├─ Total acumulado
├─ Promedio por factura
├─ Número de proveedores
└─ Distribución por estado

GET /api/invoices/stats/monthly
├─ Array de últimos 12 meses
├─ Cada mes: { month, count, total }
└─ Para gráficos de tendencia

GET /api/invoices/stats/top-providers
├─ Top 10 proveedores
├─ Ordenado por volumen de facturas
├─ Incluye { provider, amount, invoiceCount }

// 💰 REPORTE CAJA MENOR
GET /api/invoices/reports/petty-cash?from=&to=&employee_id=
├─ Filtra: is_reimbursable = true
├─ Agrupa por: empleado, employee_id
├─ Muestra: concepto, monto, fecha
├─ Total: Sumo de reembolsos
└─ Formato para reporte imprimible

// 🗑️ ELIMINAR FACTURA
DELETE /api/invoices/:id
├─ Solo si status = "pending"
├─ Suavemente (soft delete)
├─ No elimina auditoría
└─ Return: { success: true }
```

---

#### 3️⃣ **budget.controller.js** - PRESUPUESTOS Y CONTROL DE GASTOS

**Ubicación:** `backend/controllers/budget.controller.js`

**Estructura Jerárquica:**
```
Centro de Costo
    └── Categoría de Presupuesto (Rubro)
            ├── Subcategoría (Subrubro)
            │   └── Item (Elemento específico)
            └── Gastos Ejecutados
```

**Funciones Principales:**

```javascript
// 📊 CREAR CATEGORÍA DE PRESUPUESTO
POST /api/budget/categories
├─ Input:
│  ├─ cost_center_id (obligatorio)
│  ├─ name (ej: "Recursos Humanos")
│  ├─ amount (presupuesto asignado)
│  ├─ percentage (% de presupuesto total)
│  └─ description
├─ Default Categories si no existen:
│  ├─ RH (Recursos Humanos)
│  ├─ Logística
│  ├─ Reembolsos
│  ├─ Contratos
│  └─ Imprevistos
└─ Return: Categoría creada

// 📝 CREAR SUBCATEGORÍA
POST /api/budget/categories/:categoryId/subcategories
├─ Input:
│  ├─ name (ej: "Salarios", "Transporte")
│  ├─ amount (monto asignado)
│  └─ percentage (% category)
└─ Return: Subcategoría creada

// 📌 CREAR ITEM DE CATEGORÍA
POST /api/budget/categories/:categoryId/items
├─ Input:
│  ├─ name (ej: "Laptop Dell", "Viaje Cliente")
│  ├─ amount (monto item)
│  ├─ item_type (fixed|variable|contingency)
│  └─ description
├─ Logic:
│  ├─ Descontar de budget_category.amount
│  ├─ Validar no exceda presupuesto
│  └─ Registrar como pendiente
└─ Return: Item creado

// 💸 REGISTRAR GASTO EJECUTADO
POST /api/budget/expenses
├─ Input:
│  ├─ category_id (qué categoría)
│  ├─ amount (cuánto)
│  ├─ description (por qué)
│  ├─ invoice_id (opcional, relación)
│  └─ expense_date
├─ Logic:
│  ├─ Restar de budget_category.executed_amount
│  ├─ Calcular % ejecución
│  ├─ Notificar si supera presupuesto
│  └─ Registrar auditoría
└─ Return: Gasto registrado

// 📈 OBTENER ESTADO DE PRESUPUESTO
GET /api/budget/cost-centers/:costCenterId
├─ Para cada categoría muestra:
│  ├─ name: "RH"
│  ├─ assigned: 5,000,000
│  ├─ executed: 3,200,000
│  ├─ percentage: 64%
│  ├─ available: 1,800,000
│  ├─ status: "on-track" | "high-alert"
│  └─ subcategories: [...]
└─ Total general del centro

// 🎯 PROYECCIONES Y ALERTAS
GET /api/budget/alerts
├─ Muestra categorías con:
│  ├─ % ejecución > 80%
│  ├─ Proyección de sobrepasar
│  └─ Recomendaciones
└─ Para revisión de director

// 📋 REPORTE DE GASTOS
GET /api/budget/reports?from=&to=&cost_center_id=
├─ Agrupa por: categoría, subcategoría
├─ Período: mes especificado
├─ Muestra: presupuesto, ejecutado, varianza
└─ Formato: JSON o CSV exportable
```

---

#### 4️⃣ **provider.controller.js** - GESTIÓN DE PROVEEDORES

**Ubicación:** `backend/controllers/provider.controller.js`

```javascript
// ➕ CREAR PROVEEDOR
POST /api/providers
├─ Input:
│  ├─ business_name (razón social, obligatorio)
│  ├─ nit (único, obligatorio)
│  ├─ contact_name (persona contacto)
│  ├─ phone, email
│  ├─ address, city, country
│  ├─ category (categoría contable)
│  ├─ payment_terms (días para pago)
│  └─ notes
├─ Validaciones:
│  ├─ NIT único en la base
│  ├─ Email válido (si se proporciona)
│  └─ Teléfono válido
└─ Return: Proveedor creado

// 📋 LISTAR PROVEEDORES
GET /api/providers?search=&category=&is_active=
├─ Filtros:
│  ├─ search: busca en business_name, nit, contact
│  ├─ category: filtrar por categoría
│  └─ is_active: true|false|all
├─ Order: por business_name
└─ Incluye: total de facturas, monto acumulado

// 🔍 DETALLE PROVEEDOR
GET /api/providers/:id
├─ Datos básicos
├─ Últimas 10 facturas
├─ Total acumulado
├─ Promedio de factura
├─ Términos de pago
└─ Observaciones

// ✏️ ACTUALIZAR PROVEEDOR
PUT /api/providers/:id
├─ Actualizar cualquier campo
├─ Registrar cambios en auditoría
└─ Return: Proveedor actualizado

// 🗑️ ELIMINAR PROVEEDOR
DELETE /api/providers/:id
├─ Validar: no tiene facturas "active"
├─ Soft delete (marcar como inactivo)
└─ Return: { success: true }
```

---

#### 5️⃣ **employee.controller.js** - GESTIÓN DE EMPLEADOS

**Ubicación:** `backend/controllers/employee.controller.js`

```javascript
// ➕ CREAR EMPLEADO
POST /api/employees
├─ Input:
│  ├─ first_name, last_name (obligatorio)
│  ├─ email (único)
│  ├─ phone, identification_type (CC/Pasaporte)
│  ├─ identification_number (único)
│  ├─ position (cargo)
│  ├─ department (departamento)
│  ├─ hire_date
│  └─ user_id (link a usuario del sistema, opcional)
├─ Validaciones:
│  ├─ Email único
│  ├─ identification_number único
│  └─ hire_date válida
└─ Return: Empleado creado

// 📋 LISTAR EMPLEADOS
GET /api/employees?search=&department=&is_active=
├─ Filtros y búsqueda
├─ Incluye si tiene usuario del sistema
└─ Muestra facturas reportadas

// 💵 REEMBOLSOS POR EMPLEADO
GET /api/employees/:id/reimbursements
├─ Filtra facturas con:
│  ├─ employee_id = id
│  ├─ is_reimbursable = true
│  ├─ status = "paid"
├─ Agrupa por: estado, período
└─ Total: monto reembolsado
```

---

#### 6️⃣ **user.controller.js** - USUARIOS DEL SISTEMA

**Ubicación:** `backend/controllers/user.controller.js`

```javascript
// 📋 LISTAR USUARIOS
GET /api/users
├─ Solo para admin
├─ Muestra: id, email, name, role, is_active, last_login
└─ Order: por last_login DESC

// 🔍 DETALLE USUARIO
GET /api/users/:id
├─ Datos personales, rol, estadísticas
├─ Últimas actividades
└─ Permisos específicos

// ✏️ ACTUALIZAR USUARIO
PUT /api/users/:id
├─ Cambiar: email, name, role
├─ Solo admin puede cambiar role
└─ Return: Usuario actualizado

// 🚫 CAMBIAR ESTADO
PATCH /api/users/:id/toggle-active
├─ Admin solo
├─ Inactivar usuario sin borrar
└─ Previene login

// 📊 ESTADÍSTICAS DE USUARIO
GET /api/users/:id/stats
├─ Facturas creadas
├─ Aprobaciones realizadas
├─ Total procesado
└─ Última actividad
```

---

#### 7️⃣ **documentType.controller.js** - TIPOS DE DOCUMENTOS DINÁMICOS

**Ubicación:** `backend/controllers/documentType.controller.js`

```javascript
// ➕ CREAR TIPO DE DOCUMENTO PERSONALIZADO
POST /api/document-types
├─ Input:
│  ├─ name (ej: "Nota de Acompañamiento", único)
│  ├─ code (ej: "NOA", único)
│  ├─ prefix (ej: "NA" para numeración)
│  ├─ description
│  ├─ fields: [
│  │    {
│  │      fieldName: "monto_reembolso",
│  │      fieldType: "number", // text|number|date|select|textarea|file
│  │      label: "Monto a Reembolsar",
│  │      required: true,
│  │      validation: "min:1000|max:10000000",
│  │      placeholder: "Ej: 50000"
│  │    },
│  │    {
│  │      fieldName: "justificacion",
│  │      fieldType: "textarea",
│  │      label: "Justificación del Gasto",
│  │      required: true,
│  │      validation: "min:20"
│  │    }
│  │  ]
│  └─ isActive: true
├─ Logic:
│  ├─ Validar campos JSON
│  ├─ Iniciar secuencia en 1
│  └─ Crear tabla dinámica si aplica
└─ Return: DocumentType creado

// 📋 LISTAR TIPOS
GET /api/document-types?isActive=
├─ Filtrar activos/inactivos
├─ Incluye próximo número de folio
└─ Order: por creación DESC

// 🔍 OBTENER TIPO
GET /api/document-types/:id
├─ Incluye estructura de campos
├─ Próximo número de folio
└─ Historial de documentos creados

// ➕ CREAR DOCUMENTO CON TIPO PERSONALIZADO
POST /api/documents
├─ Input:
│  ├─ document_type_id (qué tipo)
│  ├─ data: { campo1: valor1, campo2: valor2 } (JSON flexible)
│  └─ created_by: user_id
├─ Logic:
│  ├─ Validar campos según documentType
│  ├─ Incrementar nextSequence
│  ├─ Asignar folio: `${prefix}${nextSequence}`
│  └─ Generar número único
├─ Almacenar:
│  ├─ En tabla "documents"
│  ├─ En tabla específica si aplica
│  └─ En auditoría
└─ Return: Documento creado con folio

// 📊 DOCUMENTOS POR TIPO
GET /api/document-types/:id/documents
├─ Listar todos los documentos de este tipo
├─ Con paginación
└─ Order: por folio DESC
```

---

#### 8️⃣ **costCenter.controller.js** - CENTROS DE COSTO

**Ubicación:** `backend/controllers/costCenter.controller.js`

```javascript
// ➕ CREAR CENTRO DE COSTO
POST /api/cost-centers
├─ Input:
│  ├─ code (código único, ej: "CC001")
│  ├─ name (ej: "Operaciones Bogotá")
│  ├─ budget (presupuesto anual)
│  ├─ responsible_id (empleado responsable)
│  ├─ client_id (si es para cliente específico)
│  ├─ contract_number (número contrato)
│  ├─ client_nit
│  └─ description
├─ Validaciones:
│  ├─ Code único
│  ├─ Responsable debe existir
│  └─ Budget > 0
└─ Return: Centro creado

// 📋 LISTAR CENTROS
GET /api/cost-centers?search=&is_active=
├─ Filtros y búsqueda
├─ Incluye:
│  ├─ Presupuesto asignado
│  ├─ Ejecutado actual
│  ├─ % de ejecución
│  └─ Responsable nombre
└─ Order: por código

// 🔍 DETALLE CENTRO
GET /api/cost-centers/:id
├─ Datos básicos
├─ Presupuesto desglosado por categoría
├─ Últimas facturas
├─ Responsable
└─ Cliente (si aplica)

// 📊 PRESUPUESTO POR CENTRO
GET /api/cost-centers/:id/budget
├─ Desglose por categoría
├─ Subcategorías
├─ Items
├─ Ejecutado vs asignado
└─ Proyección de cierre
```

---

#### 9️⃣ **dashboard.controller.js** - REPORTES Y ESTADÍSTICAS

**Ubicación:** `backend/controllers/dashboard.controller.js`

```javascript
// 📊 DASHBOARD GENERAL
GET /api/dashboard/stats
├─ KPI Principales:
│  ├─ totalInvoices: Número total de facturas
│  ├─ totalAmount: Suma de todos los totales
│  ├─ pendingApprovals: Facturas esperando aprobación
│  ├─ avgInvoiceAmount: Promedio
│  ├─ totalProviders: Cantidad de proveedores
│  ├─ activeEmployees: Empleados activos
│  └─ budgetExecutionPercentage: % presupuesto gastado
├─ Distribución por estado:
│  ├─ pending, analyzing, approved, rejected, paid (con %)
│  └─ Charts compatible JSON
└─ Últimos 30 días: tendencia

// 📈 ESTADÍSTICAS POR MES
GET /api/dashboard/monthly-stats?months=12
├─ Array de últimos N meses
├─ Cada mes:
│  ├─ month: "Abril 2026"
│  ├─ invoiceCount: cantidad
│  ├─ totalAmount: suma
│  ├─ approvedCount: aprobadas
│  └─ rejectedCount: rechazadas
└─ Para gráficos de línea/columna

// 👥 TOP PROVEEDORES
GET /api/dashboard/top-providers?limit=10
├─ Top N por volumen
├─ Cada uno:
│  ├─ provider: nombre
│  ├─ invoiceCount: cantidad
│  ├─ totalAmount: suma
│  └─ avgAmount: promedio
└─ Para gráfico de barras

// 📍 POR CENTRO DE COSTO
GET /api/dashboard/by-cost-center
├─ Cada centro:
│  ├─ code, name
│  ├─ totalInvoices: cantidad
│  ├─ totalAmount: suma
│  ├─ budgetExecuted: % usado
│  └─ status: on-track | alert
```

---

#### 🔟 **database.controller.js** - ADMINISTRACIÓN DE BASE DE DATOS

**Ubicación:** `backend/controllers/database.controller.js`

```javascript
// 📋 OBTENER SCHEMA ACTUAL
GET /api/database/schema
├─ Retorna estructura de:
│  ├─ Todas las tablas
│  ├─ Columnas y tipos de datos
│  ├─ Claves primarias
│  ├─ Foreign keys
│  ├─ Índices
│  └─ Restricciones
└─ Útil para depuración

// 💾 CREAR BACKUP
POST /api/database/backup
├─ Action: mysqldump en archivo
├─ Guardar en: backups/
├─ Formato: backup_YYYY-MM-DD_HHmmss.sql
├─ Registrar en tabla backups
└─ Return: { filename, size, timestamp }

// 🔄 RESTAURAR BACKUP
POST /api/database/restore
├─ Input: backup_id
├─ Validar: admin solo
├─ Restaurar desde archivo .sql
├─ Registrar en auditoría
└─ Return: { success, restoredAt }

// 📝 CREAR/EJECUTAR MIGRACIÓN
POST /api/database/migrations
├─ Input: nombre y SQL
├─ Ejecutar SQL en transacción
├─ Registrar en tabla migrations
├─ Registrar en auditoría
└─ Return: { success, executedAt }

// 🔍 OBTENER AUDITORÍA
GET /api/database/audits?from=&to=&table=
├─ Log de cambios:
│  ├─ Qué cambió (tabla, columna)
│  ├─ Quién lo cambió (user)
│  ├─ Cuándo (timestamp)
│  ├─ Valores antes y después
│  └─ Tipo de acción
└─ Verificar integridad

// ⚙️ CONFIGURACIÓN GENERAL
GET /api/database/config
├─ Connection pool info
├─ Version de MySQL
├─ Charset, timezone
├─ Size de BD actual
└─ Últimos backups
```

---

## 🗄️ BACKEND - ESTRUCTURA DE BASE DE DATOS

### Diagrama Relacional Simplificado

```
┌─────────────────────────────────────────────────────────┐
│            AUTENTICACIÓN                                │
├─────────────────────────────────────────────────────────┤
│ users (id, email*, password, role, is_active)           │
└─────────────────────────────────────────────────────────┘
                         ↕
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ employees│      │ cost_    │      │ invoice_     │
│          │      │ centers  │      │ types        │
│ (id,     │      │          │      │              │
│  email*, │      │ (id,     │      │ (id, name*,  │
│  ...)    │      │  code*)  │      │  code*)      │
└──────────┘      └──────────┘      └──────────────┘
        ↕              ↕                    ↕
        └──────────────┼────────────────────┘
                       ↕
    ┌──────────────────────────────────────┐
    │          INVOICES (Transacciones)     │
    │ id, invoice_number*, invoice_type_id  │
    │ provider_id, employee_id,             │
    │ cost_center_id, *, status             │
    │ [5 fases de aprobación]               │
    │ [análisis contable]                   │
    │ [info de pago]                        │
    └──────────────────────────────────────┘
                    ↕
    ┌──────────────────────────────────────┐
    │            PRESUPUESTOS               │
    │ budget_categories (cat por centro)    │
    │ budget_subcategories (subcat)         │
    │ budget_items (items específicos)      │
    │ budget_expenses (gastos ejecutados)   │
    └──────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │         TIPOS DINÁMICOS               │
    │ document_types (tipos personalizados) │
    │ documents (instancias de documentos)  │
    └──────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │         AUDITORÍA/SISTEMA             │
    │ database_schemas                      │
    │ database_audits (log cambios)         │
    │ database_backups                      │
    │ database_migrations                   │
    └──────────────────────────────────────┘
```

### Tablas Principales (20+)

| Tabla | Propósito | Campos Clave |
|-------|-----------|--------------|
| **users** | Usuarios del sistema | id, email (único), password, role, is_active |
| **employees** | Empleados | id, email (único), identification_number (único), position |
| **providers** | Proveedores | id, nit (único), business_name, contact_name |
| **cost_centers** | Centros de costo | id, code (único), name, budget, responsible_id |
| **invoice_types** | Tipos de factura | id, name (único), code (único) |
| **invoices** | ⭐ Tablas principal de facturas | id, invoice_number (único), 5 aprobaciones, análisis |
| **budget_categories** | Rubros presupuestarios | category_id, cost_center_id, name, amount, executed |
| **budget_subcategories** | Subrubros | id, category_id, name, amount |
| **budget_items** | Items de presupuesto | id, category_id, name, amount, status |
| **budget_expenses** | Gastos ejecutados | id, category_id, amount, expense_date, invoice_id |
| **document_types** | Tipos dinámicos | id, name (único), code (único), prefix, fields (JSON) |
| **documents** | Documentos generados | id, document_type_id, data (JSON), created_by |
| **database_schemas** | Inspección BD | tabla, columnas, tipos |
| **database_audits** | Auditoría cambios | table_name, action, old_values, new_values, user_id |
| **database_backups** | Backups | filename, size, created_at, restored_at |
| **database_migrations** | Migraciones | name, status, executed_at |

---

## 🔧 BACKEND - SERVICIOS Y MIDDLEWARE

### Servicios Disponibles

#### **database.service.js**
- Connectionpool management
- Query builders
- Transaction handling
- Schema inspection

#### **documentType.service.js**
- Validación de tipos dinámicos
- Generación de folios
- Manejo de campos personalizados

### Middleware Disponibles

#### **auth.middleware.js** - Autenticación JWT
```javascript
/**
 * Valida JWT token en Authorization header
 * Decodifica y obtiene usuario de la BD
 * Adjunta a req.user para siguientes handlers
 */
authenticate(req, res, next) {
  // Valida token
  // Obtiene usuario
  // Continúa si válido
}

authorize(...roles)(req, res, next) {
  // Verifica req.user.role está en roles permitidos
}
```

#### **upload.middleware.js** - Multer
```javascript
uploadInvoiceFile(req, res, next) {
  // Valida tipo: PDF, Excel, Imagen
  // Almacena en uploads/invoices/
  // Adjunta info en req.file
}
```

#### **Validators**
- `documentType.validator.js`
- `database.validator.js`

---

## 🎨 FRONTEND - ESTRUCTURA

### Carpeta Principal: `/frontend/src/`

```
frontend/src/
├─ components/        (Componentes reutilizables)
├─ views/            (Páginas/Vistas)
├─ router/           (Configuración de rutas)
├─ stores/           (State management Pinia)
├─ services/         (Servicios de API)
├─ assets/           (Estilos, imágenes)
├─ utils/            (Helpers)
├─ App.vue           (Componente raíz)
└─ main.js           (Entrada)
```

---

## 🧩 FRONTEND - COMPONENTES PRINCIPALES

### Componentes Infraestructura

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| **Navbar.vue** | `components/` | Barra de navegación global |
| **RecordForm.vue** | `components/` | Formulario genérico CRUD |
| **TableDataViewer.vue** | `components/` | Tabla con datos y paginación |

### Componentes Específicos del Negocio

| Componente | Ubicación | Modifica |
|-----------|-----------|---------|
| **AdminInvoiceTypes.vue** | `components/` | Tabla `invoice_types` |
| **DocumentTypeAdmin.vue** | `components/` | Tabla `document_types` |
| **DynamicDocumentForm.vue** | `components/` | Datos dinámicos por tipo |
| **BackupManager.vue** | `components/` | Backups de BD |
| **DatabaseManager** | `components/` | Panel admin BD |

### Vistas (Páginas Principales)

| Vista | Ruta | Propósito | Protección |
|-------|------|----------|-----------|
| **Login.vue** | `/login` | Autenticación | Guests |
| **Register.vue** | `/register` | Registro nuevos usuarios | Guests |
| **Dashboard.vue** | `/dashboard` | KPIs y estadísticas | Auth |
| **Invoices.vue** | `/invoices` | CRUD facturas + aprobaciones | Auth |
| **Providers.vue** | `/providers` | CRUD proveedores | Auth |
| **Employees.vue** | `/employees` | CRUD empleados | Auth |
| **Users.vue** | `/users` | Gestión usuarios | Admin |
| **CostCenters.vue** | `/cost-centers` | Centros de costo | Auth |
| **PettyCash.vue** | `/petty-cash` | Reporte caja menor | Auth |
| **DatabaseAdmin.vue** | `/database-admin` | Panel BD admin | Admin |

---

## 🔄 FLUJOS PRINCIPALES DE DATOS

### 1️⃣ Flujo de Autenticación

```
┌─────────────┐
│ Usuario     │
└──────┬──────┘
       │ 1. Introduce credenciales
       ↓
┌──────────────────────────────┐
│ Login.vue (Frontend)          │
└──────┬───────────────────────┘
       │ 2. POST /api/auth/login
       ↓
┌──────────────────────────────┐
│ auth.controller.js (Backend) │
│ - Busca usuario en BD        │
│ - Valida contraseña          │
│ - Genera JWT                 │
└──────┬───────────────────────┘
       │ 3. Return { token, user }
       ↓
┌──────────────────────────────┐
│ auth.store.js (Pinia)        │
│ - Guarda token en estado     │
│ - Guarda login en localStorage │
└──────┬───────────────────────┘
       │ 4. Disponible para próximas requests
       ↓
┌──────────────────────────────┐
│ Dashboard Carga              │
│ Header con token en requests │
└──────────────────────────────┘
```

### 2️⃣ Flujo de Creación de Factura

```
┌─────────────────┐
│ Usuario Admin   │
└────────┬────────┘
         │ 1. Clic "Nueva Factura"
         ↓
┌──────────────────────────────┐
│ Invoices.vue - Modal Create  │
│ Formulario con campos:       │
│ - invoice_number             │
│ - provider_id (select)       │
│ - amount, date, etc          │
│ - File upload                │
└────────┬─────────────────────┘
         │ 2. Submit + POST /invoices
         ↓
┌──────────────────────────────┐
│ invoiceService.createInvoice()│
│ - Valida cliente             │
│ - Envía archivo              │
└────────┬─────────────────────┘
         │ 3. HTTP POST + file
         ↓
┌──────────────────────────────┐
│ invoice.controller.js        │
│ - Express-validator valida   │
│ - upload.middleware procesa  │
│ - Crea en BD                 │
│ - Estado = "pending"         │
└────────┬─────────────────────┘
         │ 4. Return factura creada
         ↓
┌──────────────────────────────┐
│ Invoices.vue                 │
│ - Cerrar modal               │
│ - Recarga lista              │
│ - Toast: "Creada exitosamente"
└──────────────────────────────┘
```

### 3️⃣ Flujo de 5 Fases de Aprobación

```
                    ┌─────────────────────────┐
                    │ Estado: "pending"       │
                    │ Creada en el sistema    │
                    └────────────┬────────────┘
                                 │
                    Phase 1: ADMIN REVIEW
                                 ↓
                    ┌─────────────────────────┐
                    │ Admin Director revisa   │
                    │ - Integridad de datos   │
                    │ - Documentos adjuntos   │
                    └────────────┬────────────┘
                                 │
                   ┌─────────────┴──────────────┐
                   │ ✅ APROBADA              │ ❌ RECHAZADA
                   │ Fase: analyzing          │ Estado: rejected
                   ↓                          └─────────────────┘
    ┌──────────────────────────────┐
    │ Phase 2: ANÁLISIS CONTABLE   │
    │ Analista descarga XML DIAN   │
    │ - Valida sello digital       │
    │ - Revisa valores             │
    └──────────────┬───────────────┘
                   │
                   ├─ ✅ SELLO OK: approved
                   └─ ❌ SELLO FAIL: rejected
                       (revisa observaciones)
                   │
                   ↓ (si aprobada)
    ┌──────────────────────────────┐
    │ Phase 3: REGISTRO CONTABLE   │
    │ Municipio registra en sus    │
    │ sistemas                     │
    └──────────────┬───────────────┘
                   │
                   ├─ ✅ Registrada: approved
                   └─ ❌ Error: rejected
                   │
                   ↓ (si aprobada)
    ┌──────────────────────────────┐
    │ Phase 4: CONTROL DE PAGO     │
    │ Director Financiero:         │
    │ - Aprueba pago               │
    │ - Registra monto pagado      │
    │ - Adjunta recibo             │
    └──────────────┬───────────────┘
                   │
                   ├─ ✅ Pago OK: paid
                   └─ ❌ Falta dinero: alert
                   │
                   ↓ (si pagada)
    ┌──────────────────────────────┐
    │ Phase 5: SEGUIMIENTO         │
    │ Director General:            │
    │ - Revisión final             │
    │ - Archiva                    │
    └──────────────┬───────────────┘
                   │
                   ✅ CERRADA - Ciclo completo

```

### 4️⃣ Flujo de Presupuestos

```
┌──────────────────┐
│ Centro de Costo  │
│ CC001            │
│ Budget: $100M    │
└────────┬─────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
    ┌────▼─────────┐              ┌───────────▼────┐
    │ Categoría: RH│              │ Categoría: TI  │
    │ Budget: $40M │              │ Budget: $30M   │
    └────┬─────────┘              └────────┬───────┘
         │                               │
    ┌────▼──────────┐           ┌────────▼──────────┐
    │ Subcat:Salary │           │ Subcat: Licencias │
    │ $25M          │           │ $20M              │
    └────┬──────────┘           └────────┬──────────┘
         │                               │
    ┌────▼────────────┐        ┌─────────▼────────────┐
    │ Item: Salario   │        │ Item: Office 365    │
    │ Amount: $25M    │        │ Amount: $5M         │
    │ Executed: $18M  │        │ Executed: $5M       │
    │ Balance: $7M    │        │ Balance: $0M (ALERT)│
    └─────────────────┘        └─────────────────────┘

Cuando se crea una Invoice con cost_center_id + category_id:
├─ Cantidad se suma a budget_category.executed_amount
├─ Se calcula % ejecución
├─ Si supera 80% → ALERTA
└─ Registrar en budget_expenses tabla
```

---

## 📊 MATRIZ PARA PROPONER CAMBIOS

Usa esta matriz para identificar exactamente dónde necesita cambios tu cliente:

### Cambios en Flujos de Aprobación

**Si quieres:** Modificar las 5 fases de aprobación

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `invoice.model.js` | Campos de aprobación |
| Backend | `invoice.controller.js` | Endpoint PATCH `/invoices/:id/status` |
| Backend | `invoice.routes.js` | Rutas de aprobación |
| Frontend | `Invoices.vue` | Interfaz de aprobación |
| BD | `invoices` table | Columnas de fases |

---

### Cambios en Categorías de Presupuesto

**Si quieres:** Agregar nuevas rubros/categorías o cambiar estructura presupuestaria

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `budget.controller.js` | POST/PUT categories |
| Backend | `BudgetCategory.model.js` | Estructura modelo |
| Backend | `budget.routes.js` | Rutas presupuesto |
| Frontend | `Presupuestos.vue` | Vista (crear si no existe) |
| Frontend | `budget.store.js` | Estado Pinia |
| BD | `budget_categories` | Tabla estructura |

---

### Cambios en Tipos de Documentos Dinámicos

**Si quieres:** Agregar tipos de documentos personalizados

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `documentType.controller.js` | POST `/document-types` |
| Backend | `DocumentType.model.js` | Estructura |
| Frontend | `DocumentTypeAdmin.vue` | UI para crear tipos |
| Frontend | `DynamicDocumentForm.vue` | Renderizar dinámicamente |
| BD | `document_types` | Tabla + campos JSON |

---

### Cambios en Reportes

**Si quieres:** Agregar nuevos reportes o modificar existentes

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `dashboard.controller.js` | GET endpoints nuevos |
| Backend | `dashboard.routes.js` | Rutas nuevas |
| Frontend | `Dashboard.vue` | Componentes gráficos |
| Frontend | `dashboard.store.js` | Datos del estado |

---

### Cambios en Validaciones

**Si quieres:** Cambiar reglas de validación (montos mínimos, formatos, etc)

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | Validators en `middleware/` | `invoice.validator.js`, etc |
| Backend | Controllers `.js` | Lógica de validación |
| Frontend | `services/invoiceService.js` | Validaciones cliente |
| Frontend | Componentes `.vue` | Validaciones en formularios |

---

### Cambios en Permisos/Roles

**Si quieres:** Modificar qué puede ver/hacer cada rol

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `auth.middleware.js` | Función `authorize()` |
| Backend | Cada controller | Validaciones de rol |
| Frontend | `router/index.js` | Guardias de ruta `meta.requiredRole` |
| Frontend | `auth.store.js` | Getters como `isAdmin`, `canEdit` |
| Frontend | Cada componente `.vue` | `v-if="authStore.canDelete"` |

---

### Cambios en Base de Datos

**Si quieres:** Agregar tablas, columnas, índices

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | Crear archivo en `migrations/` | SQL de migración |
| Backend | Crear modelo en `models/` | Estructura del modelo |
| Backend | `database.routes.js` | Endpoints si expose |
| BD | Ejecutar migración | `run-migration.js` |

---

### Cambios en Cálculos (Montos, Totales, Impuestos)

**Si quieres:** Cambiar cómo se calculan subtotales, impuestos, descuentos

| Ubicación | Archivos | Qué cambiar |
|-----------|----------|-----------|
| Backend | `invoice.controller.js` | Lógica en `.js` |
| Backend | Fórmula | `total = (subtotal + tax - discount)` |
| Frontend | Componente `Invoices.vue` | Cálculo en formulario |
| Frontend | Services | `invoiceService.calculateTotal()` |

---

## 🎓 EJEMPLO: Proponer un Cambio

### Caso: "Quiero agregar un campo 'Referencia Interna' a las facturas"

**Paso 1: Identificar qué necesita cambiar**

```
❓ ¿Quién lo ve? → Creador de factura + Administrador
❓ ¿Dónde se almacena? → Tabla invoices
❓ ¿Afecta cálculos? → No
❓ ¿Requiere validación? → Sí, máximo 50 caracteres
```

**Paso 2: Lista de cambios exactos**

```
1. Backend (BD):
   └─ ALTER TABLE invoices ADD COLUMN internal_reference VARCHAR(50);

2. Backend (Modelo):
   └─ Actualizar Invoice.model.js incluir internal_reference

3. Backend (Controlador):
   └─ En invoice.controller.js:
      ├─ POST /invoices: recibir internal_reference
      ├─ PUT /invoices/:id: permitir actualizar
      └─ GET /invoices/:id: retornar el valor

4. Backend (Validador):
   └─ En invoice.validator.js:
      └─ Agregar validación: maxLength(50)

5. Backend (Rutas):
   └─ Ya están configuradas, solo usa controller

6. Frontend (Componente):
   └─ En Invoices.vue template:
      └─ Agregar input text para internal_reference

7. Frontend (Form):
   └─ En Invoices.vue script:
      └─ Enviar internal_reference en POST/PUT

8. Frontend (Lista):
   └─ En Invoices.vue tabla:
      └─ Nueva columna mostrando internal_reference
```

**Paso 3: Código exacto a cambiar**

```sql
-- BD
ALTER TABLE invoices ADD COLUMN internal_reference VARCHAR(50) NULL;
```

```javascript
// Backend - invoice.controller.js - POST
const newInvoice = {
  invoice_number: req.body.invoice_number,
  // ... otros campos ...
  internal_reference: req.body.internal_reference, // ← NUEVO
};
```

```vue
<!-- Frontend - Invoices.vue - Formula -->
<input 
  v-model="formData.internal_reference" 
  placeholder="Referencia interna (máx 50 caracteres)"
  maxlength="50"
/>
```

---

## ✅ CHECKLIST DE ACCESO

Usa este checklist para verificar que tienes acceso a toda la información:

```
BACKEND:
☐ Entiendes la estructura de rutas en backend/routes/
☐ Entiendes cómo funcionan los controladores
☐ Sabes dónde está la lógica de negocio (5 fases de aprobación)
☐ Conoces estructura de BD (invoice, budget_categories, etc)
☐ Sabes cómo agregar validaciones
☐ Entiende el middleware de autenticación

FRONTEND:
☐ Entiendes structure de vistas en views/
☐ Entiendes cómo funcionan componentes .vue
☐ Sabes dónde está Pinia state management
☐ Conoces cómo se conecta con backend (services)
☐ Entiende protecciones de ruta (requireAuth, roles)

DATOS:
☐ Conoces tablas principales en BD
☐ Entiende relaciones entre tablas
☐ Sabe cómo datos fluyen desde frontend → backend → BD
☐ Conoce los campos de invoice (20+ campos importantes)
```

---

## 📞 PRÓXIMOS PASOS

1. **Revisa este documento** y marca todas las secciones que entiendes
2. **Identifica el cambio exacto** que tu cliente necesita
3. **Consulta la matriz** o el índice para saber dónde cambiar
4. **Propón cambios específicos** con rutas de archivo y números de línea
5. **Yo implemento** con precision exacta

---

**Este documento es tu mapa. Úsalo para navegar el proyecto con confianza.** ✅
