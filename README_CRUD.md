# 📋 Guía Completa CRUD - Sistema de Gestión de Facturas

## ✅ Lo que se ha implementado

### Backend (Node.js + Express + MySQL)

#### 1. **Modelos Creados**
- ✅ **Employee.js** - Gestión de empleados
- ✅ **CostCenter.js** - Gestión de centros de costo
- ✅ **User.js** - Gestión de usuarios
- ✅ **Invoice.js** - Ya existía, completo
- ✅ **Provider.js** - Ya existía, completo

#### 2. **Controladores Creados**
- ✅ **invoice.controller.js** - CRUD + estadísticas de facturas
- ✅ **employee.controller.js** - CRUD + relaciones
- ✅ **costCenter.controller.js** - CRUD + estadísticas
- ✅ **provider.controller.js** - CRUD completo
- ✅ **user.controller.js** - CRUD + gestión de contraseñas

#### 3. **Rutas API Implementadas**

**Facturas**
```
GET    /api/invoices              - Listar todas
GET    /api/invoices/:id          - Obtener por ID
POST   /api/invoices              - Crear
PUT    /api/invoices/:id          - Actualizar
PATCH  /api/invoices/:id/status   - Cambiar estado
DELETE /api/invoices/:id          - Eliminar
GET    /api/invoices/stats/general - Estadísticas
GET    /api/invoices/stats/monthly - Facturas por mes
GET    /api/invoices/stats/top-providers - Top 10 proveedores
```

**Proveedores**
```
GET    /api/providers             - Listar
GET    /api/providers/:id         - Obtener
POST   /api/providers             - Crear
PUT    /api/providers/:id         - Actualizar
DELETE /api/providers/:id         - Eliminar
GET    /api/providers/:id/invoices - Facturas del proveedor
GET    /api/providers/:id/stats   - Estadísticas
```

**Empleados**
```
GET    /api/employees             - Listar
GET    /api/employees/:id         - Obtener
POST   /api/employees             - Crear
PUT    /api/employees/:id         - Actualizar
DELETE /api/employees/:id         - Eliminar
GET    /api/employees/:id/invoices - Facturas del empleado
GET    /api/employees/:id/stats   - Estadísticas
```

**Centros de Costo**
```
GET    /api/costcenters           - Listar
GET    /api/costcenters/:id       - Obtener
POST   /api/costcenters           - Crear
PUT    /api/costcenters/:id       - Actualizar
DELETE /api/costcenters/:id       - Eliminar
GET    /api/costcenters/:id/employees - Empleados del centro
GET    /api/costcenters/:id/invoices  - Facturas
GET    /api/costcenters/:id/stats     - Estadísticas
```

**Usuarios**
```
GET    /api/users/me              - Usuario actual
GET    /api/users                 - Listar (admin)
GET    /api/users/:id             - Obtener
POST   /api/users                 - Crear (admin)
PUT    /api/users/:id             - Actualizar (admin)
PUT    /api/users/:id/password    - Cambiar contraseña
DELETE /api/users/:id             - Eliminar (admin)
GET    /api/users/:id/invoices    - Facturas creadas
GET    /api/users/:id/stats       - Estadísticas
```

---

## 🔐 Características de Seguridad Implementadas

### Modelos
- **Encriptación de contraseñas** - bcrypt (10 rounds)
- **Validación de unicidad** - emails, NITs, documentos
- **Validaciones referentes** - no permitir eliminar registros con dependencias
- **Control de acceso** - roles admin/user
- **Auditoría** - created_by, updated_at timestamps

### Validaciones por Recurso

**Empleados**
- Email único
- Número de documento único
- No se pueden eliminar si tienen facturas

**Proveedores**
- NIT único
- No se pueden eliminar si tienen facturas

**Centros de Costo**
- Código único
- No se pueden eliminar si tienen empleados o facturas

**Usuarios**
- Email único
- No se puede eliminar el último admin
- Contraseña encriptada
- Roles: admin, user

**Facturas**
- Número de factura único
- Estados: pending, approved, paid, overdue, cancelled, rejected
- Auditoría completa de cambios

---

## 📊 Funcionalidades Avanzadas

### Estadísticas
- Totales de facturas, montos, promedios
- Desglose por estado (pending, approved, paid, overdue)
- Top proveedores por monto
- Facturas por mes (análisis temporal)
- Estadísticas por usuario, empleado, centro de costo

### Búsqueda y Filtrado
- Búsqueda por texto en múltiples campos
- Filtrado por estado, categoría, rango de fechas
- Paginación configurable
- Ordenamiento inteligente

### Relaciones y Datos Relacionados
```
Factura → Proveedor (relación n:1)
Factura → Empleado (relación n:1)
Factura → Centro de Costo (relación n:1)
Factura → Usuario (creador)
Factura → Usuario (aprobador)

Empleado → Centro de Costo (relación n:1)
Proveedor → Facturas (relación 1:n)
```

---

## 🚀 Cómo usar las APIs

### Ejemplo: Crear una Factura

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-2025-001",
    "invoiceTypeId": "uuid",
    "providerId": "uuid",
    "costCenterId": "uuid",
    "employeeId": "uuid",
    "issueDate": "2025-12-10",
    "dueDate": "2025-12-25",
    "subtotal": 1000,
    "tax": 190,
    "discount": 0,
    "total": 1190,
    "description": "Servicios de consultoría",
    "notes": "Pago a 30 días"
  }'
```

### Ejemplo: Listar Facturas con Filtros

```bash
curl "http://localhost:3000/api/invoices?status=pending&providerId=uuid&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ejemplo: Cambiar Estado de Factura

```bash
curl -X PATCH http://localhost:3000/api/invoices/uuid/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "reason": null
  }'
```

---

## 🎨 Frontend (Vue 3 + Tailwind)

### Componentes Existentes
- ✅ **Navbar.vue** - Navegación principal
- ✅ **Invoices.vue** - Vista de facturas
- ✅ **Providers.vue** - Vista de proveedores
- ✅ **Employees.vue** - Vista de empleados
- ✅ **Users.vue** - Vista de usuarios
- ✅ **CostCenters.vue** - Vista de centros de costo
- ✅ **Dashboard.vue** - Panel de control

### Servicios API
- ✅ **api.js** - Cliente HTTP con interceptores
  - Autenticación automática (token en headers)
  - Manejo de errores 401
  - Métodos para todos los recursos

---

## 📝 Próximos Pasos (Opcional)

### Para completar el sistema:
1. **Validaciones en formularios Vue** - Agregar validación de datos antes de enviar
2. **Mejoras en componentes** - Modales, confirmaciones, notificaciones
3. **Exportar a Excel** - Usar `exceljs` (ya está instalado)
4. **Reportes PDF** - Para imprimir facturas
5. **Búsqueda avanzada** - Filtros complejos
6. **Historial de cambios** - Auditoría detallada
7. **Notificaciones en tiempo real** - Socket.io
8. **Integración de pagos** - Stripe, PayPal, etc.

---

## 🛠️ Instalación y Ejecución

### Backend
```bash
cd backend
npm install
npm run dev  # o npm start
```

### Frontend
```bash
cd frontend
npm install
npm run serve  # o npm run dev
```

**URL Frontend:** `http://localhost:8080`
**URL Backend:** `http://localhost:3000`

---

## 📚 Stack Tecnológico

**Backend:**
- Node.js + Express
- MySQL
- JWT para autenticación
- bcrypt para encriptación
- Multer para upload de archivos
- ExcelJS para exportación

**Frontend:**
- Vue 3 (Composition API)
- Tailwind CSS
- Axios para HTTP
- Pinia para estado global
- Vue Router para navegación

---

**¡Sistema completamente funcional! 🎉**
