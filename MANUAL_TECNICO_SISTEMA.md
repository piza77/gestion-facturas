# MANUAL TÉCNICO
## Sistema de Gestión de Facturas v1.3.0

---

## **TABLA DE CONTENIDOS**

1. [Introducción](#introducción)
2. [Alcance de la Aplicación](#alcance-de-la-aplicación)
3. [Prerequisitos de Instalación](#prerequisitos-de-instalación)
4. [Frameworks y Estándares](#frameworks-y-estándares)
5. [Diagrama de Casos de Uso](#diagrama-de-casos-de-uso)
6. [Diccionario de Datos](#diccionario-de-datos)
7. [Scripts de Instalación](#scripts-de-instalación)
8. [Diagrama de Componentes](#diagrama-de-componentes)
9. [Arquitectura del Sistema](#arquitectura-del-sistema)
10. [Guía de Configuración](#guía-de-configuración)
11. [Troubleshooting Técnico](#troubleshooting-técnico)

---

## **INTRODUCCIÓN**

### Visión General

El Sistema de Gestión de Facturas es una aplicación empresarial modular y escalable diseñada para:
- Gestionar facturación electrónica
- Controlar presupuestos y gastos
- Generar reportes analíticos
- Mantener auditoría completa
- Asegurar cumplimiento normativo

### Tecnología Core

```
STACK TECNOLÓGICO:

Frontend: Vue.js 3 + Tailwind CSS + Chart.js
Backend: Node.js + Express.js
BD: MySQL 8.0+
Cache: Redis (opcional)
Infraestructura: Docker + Railway Cloud
Testing: Jest + Cypress
```

### Información del Proyecto

```
Nombre: Sistema de Gestión de Facturas
Versión: 1.3.0
Código: SGF-2025-001
Fecha Release: 14 de marzo de 2026
Estado: PRODUCCIÓN
Soporte: 12 meses post-entrega
```

---

## **ALCANCE DE LA APLICACIÓN**

### 1. Módulos Funcionales Incluidos

#### Módulo 1: Gestión de Facturas
```
CAPACIDADES:
├─ Registrar facturas (crear, editar, eliminar)
├─ Número automático o manual
├─ Asociar a proveedores (existentes o nuevos)
├─ Fotografía/escaneo de documento original
├─ Estados: BORRADOR → PENDIENTE → APROBADA → PAGADA
├─ Búsqueda y filtrado avanzado
├─ Historial de cambios completo (auditoría)
└─ Exportación: Excel, PDF, CSV

LÍMITES:
├─ Máximo 1,000 facturas por mes sin degradación
├─ Tamaño máximo de archivo adjunto: 50 MB
├─ Antigüedad máxima registrable: 365 días
├─ No soporta facturas de crédito (futuro)
└─ No genera factura electrónica SAT (futuro)

PERMISOS REQUERIDOS:
├─ Crear: Contador, Supervisor, Admin
├─ Editar: Creador, Supervisor, Admin
├─ Aprobar: Contador, Supervisor, Admin
├─ Eliminar: Contador, Admin
└─ Ver auditoria: Contador, Admin

VOLUMEN SOPORTADO:
├─ Facturas activas: 50,000+
├─ Transacciones simultáneas: 50+
├─ Consultas concurrentes: 100+
└─ Crecimiento estimado: 20% anual
```

#### Módulo 2: Presupuestos y Control de Gastos
```
CAPACIDADES:
├─ Crear presupuestos: Mensual, trimestral, anual
├─ Asignar montos por centros de costo
├─ Crear ítems con subcategorías
├─ Monitoreo en tiempo real
├─ Alertas automáticas (80%, 100%, 120%)
├─ Bloqueo automático al alcanzar límite
├─ Historial de variaciones
└─ Proyecciones de consumo

LÍMITES:
├─ Máximo 100 presupuestos simultáneos
├─ Máximo 500 ítems por presupuesto
├─ Precisión: 2 decimales
├─ No soporta presupuestos negativos
└─ No permite períodos retroactivos

ALERTAS Y BLOQUEOS:
├─ 80% de consumo: Notificación (no bloquea)
├─ 90% de consumo: Email a supervisores
├─ 100% de consumo: Bloquea nuevas facturas
├─ Excepciones: Requieren aprobación admin
└─ Autorización temporal: Máximo 7 días

VOLUMEN SOPORTADO:
├─ Presupuestos: 1,000+
├─ Ítems totales: 50,000+
├─ Consumos registrados: 500,000+ históricos
└─ Recálculos en tiempo real: < 500ms
```

#### Módulo 3: Reportes y Análisis
```
CAPACIDADES:
├─ Reportes predefinidos: 12 tipos
├─ Reportes personalizados: Ilimitados
├─ Filtros dinámicos: 20+ campos
├─ Gráficos interactivos: 8 tipos (línea, barra, pie, etc)
├─ Series temporales: Hasta 3 años atrás
├─ Comparativas: Año a año, mes a mes
├─ Exportación: Excel con fórmulas, PDF profesional
├─ Programación automática: Reportes por email
└─ Análisis de tendencias

RAPORTES INCLUIDOS:
├─ 1. Resumen mensual general
├─ 2. Detallado por proveedor
├─ 3. Detallado por centro de costo
├─ 4. Análisis de IVA
├─ 5. Comparativo año anterior
├─ 6. Estado de presupuestos
├─ 7. Previsión de gastos
├─ 8. Auditoría de cambios
├─ 9. Documentos pendientes
├─ 10. Análisis de proveedores
├─ 11. Proyección presupuestaria
└─ 12. Dashboard ejecutivo

LÍMITES:
├─ Máximo 5,000 registros por reporte
├─ Tiempo máximo ejecución: 60 segundos
├─ Histórico disponible: 7 años
├─ No incluye: Integración ERP (futuro)
└─ No incluye: Análisis predictivo IA (futuro)
```

#### Módulo 4: Administración de Usuarios
```
CAPACIDADES:
├─ Crear/editar/desactivar usuarios
├─ Asignar roles: Admin, Contador, Supervisor, Usuario
├─ Permisos granulares por módulo
├─ Restricción por centro de costo
├─ Cambio de contraseña forzado
├─ Historial de logins
├─ Desactivación temporal
└─ Recuperación de contraseña

ROLES DEFINIDOS:
├─ Admin: Acceso total, configuración sistema
├─ Contador: Todo menos eliminar usuarios
├─ Supervisor: Crear/editar/aprobar facturas de su área
├─ Usuario: Crear facturas, ver su información
└─ Viewer (sin crear): Solo lectura

SEGURIDAD:
├─ Autenticación: JWT con expiración 4 horas
├─ MFA (Multi-Factor): No implementado (futuro)
├─ Contraseñas: Hasheadas bcrypt 10 rounds
├─ Loginillos fallidos: Bloqueo tras 5 intentos
├─ Auditoría: Registro de todo acceso
└─ Sesión: Timeout 30 min inactividad

CAPACIDAD:
├─ Usuarios máximo: 500
├─ Roles máximo: 10 personalizados
├─ Permisos únicos: 100+
└─ Centros costo por usuario: Múltiples
```

#### Módulo 5: Auditoría y Cumplimiento
```
CAPACIDADES:
├─ Log de todas las acciones
├─ Quién, Qué, Cuándo, Dónde
├─ Valores antes/después de cambios
├─ IP y agente de usuario
├─ Reportes de cambios
├─ Consultas por usuario
├─ Búsqueda temporal
└─ Exportación de auditoría

DATA CAPTURADA:
├─ Crear factura: Usuario, monto, proveedor, fecha
├─ Editar factura: Campos antiguos y nuevos
├─ Aprobar: Usuario, hora, justificación
├─ Login: Usuario, hora, IP, navegador
├─ Cambios config: Admin, antes/después
└─ Acceso a reportes: Usuario, tipo, parámetros

RETENCIÓN:
├─ Período: 7 años mínimo
├─ Backup: Diario a AWS S3
├─ Compresión: gzip automática
├─ Encriptación: AES-256
└─ Recuperación: 30 días desde borrado lógico

CUMPLIMIENTO:
├─ SAT: Retención 7 años, cálculos correctos
├─ GDPR: Derecho al olvido, consentimiento
├─ ISO 27001: Controles de acceso, encriptación
└─ LGPD (Brasil): Localización datos Brasil
```

### 2. Funcionalidades No Incluidas (Futuro)

```
VERSIÓN 2.0 (Estimado: Q3 2026)
├─ Facturación electrónica SAT
├─ Integración contable (módulo QBooks)
├─ Pagos electrónicos directos
├─ Integración portales proveedores
├─ Análisis predictivo (IA)
├─ Aprobaciones automáticas
├─ MFA (Multi-Factor Authentication)
└─ Mobile app nativa

V3.0 (Estimado: Q1 2027)
├─ Consolidación multi-empresa
├─ Consolidación multi-moneda
├─ Presupuestos dinámicos (machine learning)
├─ Detección de fraude
├─ Análisis de cumplimiento SAT automático
└─ API pública para integradores
```

### 3. Limites Técnicos y Restricciones

```
RENDIMIENTO:
┌─────────────────────────────────────────────┐
│ MÉTRICA              │ LÍMITE    │ ESTADO  │
├─────────────────────────────────────────────┤
│ Respuesta API        │ < 500ms   │ ✓ OK   │
│ Carga Dashboard      │ < 2 seg   │ ✓ OK   │
│ Generación Reporte   │ < 60 seg  │ ✓ OK   │
│ Usuarios simultáneos │ 100+      │ ✓ OK   │
│ Operaciones/segundo  │ 500+      │ ✓ OK   │
│ Uptime               │ 99.5%     │ ✓ OK   │
└─────────────────────────────────────────────┘

ALMACENAMIENTO:
├─ Facturas: 50 mil máximo (después archiva)
├─ Presupuestos: 1,000 máximo (después archiva)
├─ Usuarios: 500 máximo
├─ Espacio BD: 100 GB máximo (después backup)
├─ Archivos adjuntos: 50 MB máximo por archivo
└─ Logs: Rotación automática cada 30 días

CUOTA DE USUARIO:
├─ Facturas por mes: 1,000 máximo
├─ Reportes por día: 100 máximo
├─ Descargas por hora: 20 máximo
├─ Sesiones simultáneas: 1 máximo
└─ API calls/minuto: 100 máximo

NAVEGADORES SOPORTADOS:
├─ Chrome: 90+ (recomendado)
├─ Firefox: 88+
├─ Safari: 14+
├─ Edge: 90+
├─ Opera: 76+
└─ NO soportado: Internet Explorer 11

DISPOSITIVOS:
├─ Desktop: Windows, Mac, Linux ✓
├─ Tablet: iPad, Android ✓ (limitado)
├─ Móvil: iPhone, Android ✓ (versión lite)
└─ TV/Kiosk: No soportado ✗
```

### 4. Matriz RACI (Responsabilidades)

```
TAREA                    │ ADMIN │ CONTADOR │ SUPER │ USER
─────────────────────────┼───────┼──────────┼──────┼─────
Crear factura            │   R   │    R     │  R   │  R
Aprobar factura          │   A   │    R     │  R   │  C
Editar factura aprobada  │   R   │    A     │  -   │  -
Eliminar factura         │   R   │    A     │  -   │  -
Crear presupuesto        │   A   │    R     │  R   │  -
Modificar presupuesto    │   R   │    A     │  C   │  -
Cambiar config sistema   │   R   │    -     │  -   │  -
Crear usuario            │   R   │    -     │  -   │  -
Generar reportes         │   C   │    R     │  R   │  R
Ver auditoría            │   A   │    R     │  C   │  -

LEYENDA:
R = Responsable (hace el trabajo)
A = Aprobador (autoriza)
C = Consultado (da información)
- = No participa
```

### 5. Matriz de Volumen por Empresa (Escalabilidad)

```
TAMAÑO EMPRESA    │ USUARIOS │ FACTURAS/MES │ CENTROS │ NIVEL
──────────────────┼──────────┼──────────────┼─────────┼──────────
Pequeña (<50)     │    5-10  │    50-200    │   2-3   │ Básico
Mediana (50-200)  │   10-50  │   200-1000   │   5-10  │ Pro
Grande (200-500)  │   50-200 │  1000-5000   │  10-30  │ Enterprise
Megacorp (500+)   │  200-500 │   5000+      │   30+   │ Custom

CADA NIVEL SOPORTA:
Básico:
├─ 1 instancia compartida
├─ Respaldos básicos
├─ Hasta 100 GB almacenamiento
└─ $500/mes

Pro:
├─ Instancia dedicada
├─ Respaldos automáticos
├─ Hasta 500 GB
├─ Soporte 24/5
└─ $2,000/mes

Enterprise:
├─ Cluster de 3 servidores
├─ Replicación automática
├─ Hasta 2 TB
├─ Soporte 24/7
└─ $8,000/mes

Custom:
├─ Infraestructura personalizada
├─ SLA 99.99%
├─ Almacenamiento ilimitado
├─ Soporte dedicado
└─ Según necesidad
```

---

## **PREREQUISITOS DE INSTALACIÓN**

### 1. Hardware Mínimo (Local Development)

```
REQUISITOS HARDWARE:

PROCESADOR:
├─ Mínimo: Intel Core i5 (2.5 GHz) o equivalente
├─ Recomendado: Intel Core i7 o superior
└─ Cloud: Auto-escalable (Railway)

MEMORIA RAM:
├─ Desarrollo: 8 GB (mínimo)
├─ Producción: 16 GB
├─ Cloud: Auto-asignado (2-8 GB)

ALMACENAMIENTO:
├─ Desarrollo: 50 GB libres (+ BD)
├─ Producción: 100 GB + respaldos
├─ Base de Datos: 10 GB iniciales (escalable)

CONEXIÓN:
├─ Ancho de banda: 10 Mbps (mínimo)
├─ Latencia: < 100ms
└─ Estabilidad: >99.5% uptime
```

### 2. Sistema Operativo

```
SISTEMAS SOPORTADOS:

SERVIDOR:
├─ Linux: Ubuntu 20.04 LTS o superior
├─ CentOS: 8.0+
├─ Debian: 10+
├─ Windows Server: 2019 o superior
└─ macOS: 11.0+ (desarrollo solamente)

CLIENTE/DESARROLLADOR:
├─ Windows 10/11 (con WSL2)
├─ macOS 11.0+
├─ Ubuntu 20.04+
└─ Cualquier OS con Docker
```

### 3. Software Requerido

```
DEPENDENCIAS DE SISTEMA:

Node.js:
├─ Versión: 16.13.0 o superior (recomendado 18.0+)
├─ Instalador: https://nodejs.org/
├─ Verificación: node --version
└─ npm: viene incluido con Node

MySQL:
├─ Versión: 8.0.0 o superior
├─ Instalador: https://dev.mysql.com/downloads/mysql/
├─ Alternativa: Docker image mysql:8.0
├─ Verificación: mysql --version
└─ Puertos: 3306 (por defecto)

Git:
├─ Versión: 2.30+
├─ Instalador: https://git-scm.com/
├─ Verificación: git --version
└─ Necesario para: clonar repositorio

Docker (Recomendado):
├─ Versión: 20.10+ con Docker Compose
├─ Instalador: https://docs.docker.com/get-docker/
├─ Verificación: docker --version
└─ Uso: Contenerizar aplicación

NPM Packages:
├─ Se instalan automáticamente con npm install
├─ Ver: package.json para detalles
└─ Gestión: npm audit (seguridad)
```

### 4. Verificación de Prerequisites

```bash
# Script para verificar todos los prerequisites
#!/bin/bash

echo "=== VERIFICACIÓN DE PREREQUISITES ==="

# Node.js
echo -n "Node.js: "
node --version || echo "NO INSTALADO"

# npm
echo -n "npm: "
npm --version || echo "NO INSTALADO"

# MySQL
echo -n "MySQL: "
mysql --version || echo "NO INSTALADO"

# Git
echo -n "Git: "
git --version || echo "NO INSTALADO"

# Docker
echo -n "Docker: "
docker --version || echo "NO INSTALADO"

# Node modules (si existen)
echo -n "Node Modules: "
if [ -d "backend/node_modules" ]; then echo "OK"; else echo "NO INSTALADOS"; fi

echo "=== FIN VERIFICACIÓN ==="
```

### 5. Configuración de Puertos

```
PUERTOS UTILIZADOS:

DESARROLLO LOCAL:
├─ Backend: http://localhost:3000
├─ Frontend: http://localhost:8080
├─ MySQL: localhost:3306
├─ Redis: localhost:6379 (opcional)
└─ Webpack Dev Server: 8080

STAGING (Railway):
├─ Backend: https://staging.api.gestion-facturas.com
├─ Frontend: https://staging.gestion-facturas.com
└─ DB: Privada (no acceso directo)

PRODUCCIÓN (Railway):
├─ Backend: https://api.gestion-facturas.com
├─ Frontend: https://gestion-facturas.com
└─ DB: Privada (no acceso directo)

FIREWALL RULES:
├─ Puerto 3000: Solo desde localhost (dev)
├─ Puerto 8080: Solo desde localhost (dev)
├─ Puerto 3306: Solo conexiones internas
├─ Puerto 443: HTTPS abierto al público
└─ Puerto 80: Redirige a 443
```

---

## **FRAMEWORKS Y ESTÁNDARES**

### 1. Arquitectura General

```
PATRÓN ARQUITECTÓNICO: MVC (Model-View-Controller)

┌────────────────────────────────────────────────────┐
│                    CLIENTE (FRONTEND)              │
│  Vue.js 3 + Tailwind CSS + Chart.js + Axios      │
└────────────────────────────────────────────────────┘
                          ↓
                    API REST (HTTP)
                          ↓
┌────────────────────────────────────────────────────┐
│                 SERVIDOR (BACKEND)                 │
│  Node.js + Express.js + Middleware Personalizado  │
└────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────┐
│                   DATA LAYER                       │
│  MySQL + Sequelize ORM + Redis (opcional)        │
└────────────────────────────────────────────────────┘
```

### 2. Frameworks Backend

```
EXPRESS.JS v4.18.2:
├─ Web framework minimalista
├─ Routing avanzado
├─ Middleware pattern
├─ Performance optimizado
├─ Protocolo: HTTP/HTTPS
└─ Documentación: https://expressjs.com

SEQUELIZE v6.28.0:
├─ ORM para Node.js
├─ Soporte para MySQL
├─ Migrations automáticas
├─ Validaciones de modelo
├─ Relaciones (1:1, 1:N, N:N)
└─ Query builder

JSONWEBTOKEN v9.0.2:
├─ Autenticación stateless
├─ Tokens con expiración
├─ Secreto configurado en .env
├─ Claims: userId, rol, empresa
└─ Algoritmo: HS256

BCRYPT v5.1.1:
├─ Hashing de contraseñas
├─ Salt rounds: 10
├─ Comparación segura
└─ Función: password.bcrypt()
```

### 3. Frameworks Frontend

```
VUE.JS 3.3.4:
├─ Framework reactivo
├─ Composition API
├─ Single File Components
├─ Router integrado
├─ Pinia para state management
└─ Documentación: https://vuejs.org

TAILWIND CSS 3.3.3:
├─ CSS utility-first
├─ Responsive design
├─ Dark mode included
├─ Tema customizable
└─ PostCSS integrado

CHART.JS 4.4.0:
├─ Gráficos interactivos
├─ 8 tipos básicos
├─ Animaciones incluidas
├─ Responsive por defecto
└─ Vue integration: vue-chartjs

AXIOS 1.5.0:
├─ HTTP client
├─ Interceptores
├─ Timeouts configurables
├─ Soporte JWT automático
└─ Promise-based API
```

### 4. Estándares de Código

```
NAMING CONVENTIONS:

Variables/Funciones:
├─ camelCase: const usuario = {} ✓
├─ EVITAR: const Usuario = {} ✗
├─ EVITAR: const usuario_data = {} ✗
└─ Descriptivo: const usuarioActivo = {}

Constantes:
├─ UPPER_SNAKE_CASE: const MAX_ITEMS = 100 ✓
├─ EVITAR: const maxItems = 100 ✗
└─ Ubicación: inicio del archivo

Archivos:
├─ kebab-case para archivos: user-service.js ✓
├─ PascalCase para componentes: UserForm.vue ✓
├─ EVITAR: UserService.js ✗
└─ Estructura: src/ > services/ > models/ > utils/

Componentes Vue:
├─ PascalCase: <InvoiceForm /> ✓
├─ Nombre de archivo: InvoiceForm.vue ✓
├─ EVITAR: <invoiceForm /> ✗
└─ Props: camelCase

Clases/Modelos:
├─ PascalCase: class UserService {} ✓
├─ EVITAR: class user_service {} ✗
└─ Métodos: camelCase

Endpoint API:
├─ kebab-case: /api/invoices/export-excel ✓
├─ Verbo correcto: GET, POST, PUT, DELETE
├─ Resource: sustantivos plurales
└─ EVITAR: /api/getInvoices ✗
```

### 5. Estructura de Proyecto

```
ESTRUCTURA BACKEND:
├── server.js (entrada principal)
├── package.json (dependencias)
├── .env (variables de entorno)
├── config/
│   └── database.js (conexión MySQL)
├── controllers/
│   ├── invoice.controller.js
│   ├── budget.controller.js
│   ├── auth.controller.js
│   └── ... (8 controllers)
├── models/
│   ├── Invoice.js
│   ├── Budget.js
│   ├── User.js
│   └── ... (8 models)
├── middleware/
│   ├── auth.js (JWT validation)
│   ├── errorHandler.js
│   └── upload.js
├── routes/
│   ├── invoice.routes.js
│   ├── budget.routes.js
│   └── ... (todas las rutas)
├── migrations/
│   ├── add_invoice_fields.js
│   └── ... (todas las migrations)
├── seeders/
│   └── seed.js (datos iniciales)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── uploads/ (archivos subidos)

ESTRUCTURA FRONTEND:
├── src/
│   ├── main.js (entrada Vue)
│   ├── App.vue (componente raíz)
│   ├── components/
│   │   ├── InvoiceList.vue
│   │   ├── InvoiceForm.vue
│   │   └── ... (20+ componentes)
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── Invoices.vue
│   │   └── ... (10+ vistas)
│   ├── stores/
│   │   ├── invoice.store.js (Pinia)
│   │   ├── budget.store.js
│   │   └── ... (stores)
│   ├── services/
│   │   ├── api.service.js
│   │   ├── invoice.service.js
│   │   └── ... (servicios HTTP)
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── ... (utilidades)
│   ├── assets/
│   │   ├── images/
│   │   ├── styles/
│   │   └── fonts/
│   ├── router/
│   │   └── index.js (Vue Router)
│   ├── cypress/
│   │   ├── e2e/
│   │   └── fixtures/
│   └── tests/
│       ├── unit/
│       └── integration/
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
├── vue.config.js
├── jest.config.js
└── tailwind.config.js
```

### 6. Estándares REST API

```
CONVENCIONES API:

Endpoints:
GET    /api/invoices              (listar)
GET    /api/invoices/:id          (obtener uno)
POST   /api/invoices              (crear)
PUT    /api/invoices/:id          (actualizar)
DELETE /api/invoices/:id          (eliminar)

Query Parameters:
├─ /api/invoices?page=1&limit=10  (paginación)
├─ /api/invoices?status=APROB     (filtrado)
├─ /api/invoices?sort=date DESC   (ordenamiento)
└─ Separar con &

Body Request (JSON):
{
  "number": "INV-001",
  "amount": 1000,
  "providerId": 5,
  "date": "2026-03-14"
}

Response Success (200):
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación exitosa"
}

Response Error (400-500):
{
  "success": false,
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": { /* más info */ }
}

Status Codes:
├─ 200: OK (GET exitoso)
├─ 201: Created (POST exitoso)
├─ 204: No Content (DELETE exitoso)
├─ 400: Bad Request (datos inválidos)
├─ 401: Unauthorized (sin autenticación)
├─ 403: Forbidden (sin permiso)
├─ 404: Not Found (recurso no existe)
├─ 409: Conflict (duplicado, etc)
├─ 500: Internal Server Error
└─ 503: Service Unavailable
```

### 7. Estándares de Seguridad

```
IMPLEMENTACIONES DE SEGURIDAD:

Autenticación:
├─ JWT para APIs
├─ Tokens con expiración (4 horas)
├─ Refresh tokens para renovación
└─ Header: Authorization: Bearer <token>

Encriptación:
├─ Contraseñas: bcrypt (10 rounds)
├─ Datos sensibles: AES-256 (opcional)
├─ Tránsito: TLS 1.3 (HTTPS)
└─ Almacenamiento: Encrypted DB fields

Validación:
├─ Input sanitization
├─ Whitelist de caracteres permitidos
├─ Longitud máxima por campo
├─ SQL injection prevention
└─ XSS prevention

CORS:
├─ Whitelist de dominios
├─ Métodos permitidos: GET, POST, PUT, DELETE
├─ Headers personalizados autorizados
└─ Credentials: incluida en CORS

Rate Limiting:
├─ 100 requests/minuto por IP
├─ Endpoints críticos: 10 req/minuto
├─ Login: 5 intentos/15 minutos
└─ Implementación: express-rate-limit

HTTPS/TLS:
├─ Certificado: Let's Encrypt
├─ Renovación: Automática
├─ Cipher suites: Modernas
└─ HSTS: Habilitado
```

### 8. Estándares de Logging

```
NIVELES DE LOG:

ERROR:
├─ Excepciones no manejadas
├─ Fallos de base de datos
├─ Fallas de autenticación críticas
└─ Ejemplo: "Database connection failed"

WARN:
├─ Consumo de recursos alto
├─ Deprecations
├─ Query lenta detectada
└─ Ejemplo: "Query took 2.5 seconds"

INFO:
├─ Inicio/cierre de servidor
├─ Cambios de datos importantes
├─ Login exitoso
└─ Ejemplo: "Server started on port 3000"

DEBUG:
├─ Valores de variables
├─ Flujo de ejecución
├─ Detalles de request
└─ Ejemplo: "Processing invoice creation"

Formato Winston:
{
  "timestamp": "2026-03-14T10:30:45.123Z",
  "level": "info",
  "message": "Invoice created",
  "userId": "user123",
  "invoiceId": "inv456",
  "ipAddress": "192.168.1.1",
  "duration": "245ms"
}

Rotación de Logs:
├─ Diablo: Nuevo archivo cada día
├─ Retención: 60 días
├─ Compresión: gzip automática
├─ Ubicación: /logs/app-YYYY-MM-DD.log
```

---

## **DIAGRAMA DE CASOS DE USO**

### Sistema de Actores

```
ACTORES DEL SISTEMA:

┌─────────────────────────────────────────────────────┐
│           ACTORES PRINCIPALES                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 Usuario Final                                  │
│  ├─ Contador                                       │
│  ├─ Asistente administrativo                       │
│  ├─ Supervisor de compras                          │
│  └─ Analista financiero                            │
│                                                     │
│  🔐 Administrador                                  │
│  ├─ Admin de sistema                               │
│  ├─ DBA                                            │
│  └─ Admin de seguridad                             │
│                                                     │
│  🛠️  Soporte Técnico                               │
│  ├─ Técnico L1                                     │
│  ├─ Técnico L2                                     │
│  └─ Ingeniero de infraestructura                   │
│                                                     │
│  ⚙️  Sistema Externo                               │
│  ├─ Proveedor de cuenta                            │
│  ├─ Sistema contable (futuro)                      │
│  └─ SAT/Regulador                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Diagrama UML de Casos de Uso

```
CASOS DE USO PRINCIPALES:

GESTIÓN DE FACTURAS:
┌──────────────────────────────────────────────┐
│  Sistema de Gestión de Facturas             │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Crear Factura                          │
│  ├─ Editar Factura                         │
│  ├─ Eliminar Factura                       │
│  ├─ Buscar Factura                         │
│  ├─ Exportar a Excel                       │
│  ├─ Exportar a PDF                         │
│  ├─ Generar Reporte                        │
│  └─ Ver Historial Cambios                  │
│                                              │
└──────────────────────────────────────────────┘

GESTIÓN DE PRESUPUESTOS:
┌──────────────────────────────────────────────┐
│  Presupuestos y Control de Gastos           │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Crear Presupuesto                      │
│  ├─ Modificar Presupuesto                  │
│  ├─ Asignar a Ítems                        │
│  ├─ Ver Consumo Real                       │
│  ├─ Alertas de Sobregiro                   │
│  ├─ Análisis Presupuestario                │
│  └─ Proyecciones                           │
│                                              │
└──────────────────────────────────────────────┘

REPORTES Y ANÁLISIS:
┌──────────────────────────────────────────────┐
│  Reportes y Visualización                   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Generar Reporte Mensual                │
│  ├─ Generar Reporte Anual                  │
│  ├─ Análisis por Proveedor                 │
│  ├─ Análisis por Centro Costo              │
│  ├─ Gráficos de Tendencias                 │
│  ├─ Comparativas YoY                       │
│  └─ Exportación Automática                 │
│                                              │
└──────────────────────────────────────────────┘

ADMINISTRACIÓN:
┌──────────────────────────────────────────────┐
│  Administración del Sistema                 │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Crear Usuario                          │
│  ├─ Asignar Roles/Permisos                 │
│  ├─ Configurar Tasas Impositivas           │
│  ├─ Gestionar Respaldos                    │
│  ├─ Ver Logs de Auditoría                  │
│  ├─ Monitorear Performance                 │
│  └─ Configurar Parámetros del Sistema      │
│                                              │
└──────────────────────────────────────────────┘

SEGURIDAD Y ACCESO:
┌──────────────────────────────────────────────┐
│  Autenticación y Autorización               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Login al Sistema                       │
│  ├─ Cambiar Contraseña                     │
│  ├─ Validar Permisos (por módulo)          │
│  ├─ Recuperar Contraseña                   │
│  ├─ Logout Seguro                          │
│  └─ Validar JWT Token                      │
│                                              │
└──────────────────────────────────────────────┘
```

### Flujos de Casos de Uso Críticos

```
CASO DE USO: "Crear Factura"
═════════════════════════════════════════════════

Actor Primario: Contador
Precondición: Usuario autenticado, logueado
Flujo Principal:

1. Usuario selecciona "Nueva Factura"
   → Sistema muestra formulario vacío

2. Usuario ingresa:
   - Número de factura
   - Monto
   - Proveedor (búsqueda + autocompletado)
   - Fecha
   - Descripción (opcional)

3. Sistema valida:
   ✓ Campo number es único
   ✓ amount es positivo y < 999,999
   ✓ providerId existe
   ✓ date es válida

4. Sistema calcula automáticamente:
   → tax_rate según fecha (16% o 18%)
   → tax = amount * tax_rate
   → total = amount + tax

5. Usuario click en "Guardar"

6. Sistema:
   → Inserta en BD
   → Registra auditoría (user, timestamp, IP)
   → Retorna factura creada
   → Muestra confirmación

7. Usuario ve:
   → "Factura creada exitosamente"
   → Número de factura generado
   → Botones: Editar, Descargar, Ver Reporte

Postcondición: Factura en estado "BORRADOR"

Flujos Alternativos:

ALT-1: Datos inválidos
  → Sistema muestra errores por campo
  → Usuario puede corregir
  → Reintenta

ALT-2: Proveedor no existe
  → Sistema ofrece crear uno nuevo
  → Si confirma: crea y asigna
  → Si cancela: vuelve al formulario

ALT-3: Sesión expirada
  → Sistema redirige a login
  → Pierde datos del formulario
  → Usuario debe reintentar


CASO DE USO: "Generar Reporte Mensual"
═════════════════════════════════════════════════

Actor Primario: Analista Financiero
Precondición: Usuario autenticado
Flujo Principal:

1. Usuario va a Reportes → Reporte Mensual

2. Sistema muestra filtros:
   - Mes (dropdown)
   - Año (dropdown)
   - Proveedor (multi-select)
   - Centro de Costo (multi-select)

3. Usuario selecciona parámetros (mes actual default)

4. Usuario click "Generar"

5. Sistema:
   → Valida filtros
   → Query BD: SELECT facturas WHERE month=? AND...
   → Calcula totales y subtotales
   → Agrupa por proveedor/centro costo
   → Genera gráficos Chart.js
   → Calcula impuestos separados (16% y 18%)
   → Estima tiempo generación

6. Sistema muestra:
   → Datos en tabla
   → Gráficos interactivos
   → Totales resumidos
   → Tiempo generación: 18 segundos

7. Usuario selecciona "Exportar"

8. Sistema ofrece:
   - Excel con formato profesional
   - PDF con logo empresa
   - CSV para análisis

9. Usuario elige Excel

10. Sistema:
    → Genera archivo ExcelJS
    → Incluye fórmulas de cálculo
    → Aplica estilos profesionales
    → Descarga al navegador

Postcondición: Usuario tiene reporte exportado

Validaciones:
  • Mes/Año válidos
  • No hay datos vacíos → mostrar advertencia
  • Permisos: usuario solo ve centros asignados
  • Performance: timeout después de 60 segundos
```

---

## **DICCIONARIO DE DATOS**

### Tabla: INVOICES (Facturas)

```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  number VARCHAR(50) UNIQUE NOT NULL 
    COMMENT 'Número de factura (INV-XXXXX)',
  provider_id INT NOT NULL 
    COMMENT 'FK a providers',
  employee_id INT 
    COMMENT 'Empleado que registra la factura',
  amount DECIMAL(12,2) NOT NULL 
    COMMENT 'Monto sin impuesto',
  tax_rate DECIMAL(5,2) NOT NULL 
    COMMENT 'Tasa de IVA aplicada (16 o 18)',
  tax DECIMAL(12,2) NOT NULL 
    COMMENT 'Monto de impuesto calculado',
  total DECIMAL(12,2) NOT NULL 
    COMMENT 'Total = amount + tax',
  description TEXT 
    COMMENT 'Descripción de la factura',
  status ENUM('BORRADOR','PENDIENTE','APROBADA','CANCELADA')
    DEFAULT 'BORRADOR'
    COMMENT 'Estado actual',
  date DATE NOT NULL 
    COMMENT 'Fecha de la factura',
  due_date DATE 
    COMMENT 'Fecha de vencimiento',
  center_id INT 
    COMMENT 'Centro de costo',
  budget_item_id INT 
    COMMENT 'Ítem de presupuesto asociado',
  created_by INT NOT NULL 
    COMMENT 'User ID que creó',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  
  INDEX idx_provider (provider_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (center_id) REFERENCES cost_centers(id),
  FOREIGN KEY (budget_item_id) REFERENCES budget_items(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Tabla: BUDGETS (Presupuestos)

```sql
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL 
    COMMENT 'Nombre del presupuesto',
  amount DECIMAL(12,2) NOT NULL 
    COMMENT 'Monto presupuestado',
  used_amount DECIMAL(12,2) DEFAULT 0 
    COMMENT 'Cantidad gastada',
  category_id INT 
    COMMENT 'Categoría del presupuesto',
  center_id INT 
    COMMENT 'Centro de costo',
  status ENUM('ACTIVO','VENCIDO','PAUSADO')
    DEFAULT 'ACTIVO',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold INT DEFAULT 80 
    COMMENT 'Porcentaje para alerta',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_center (center_id),
  INDEX idx_status (status),
  
  FOREIGN KEY (category_id) REFERENCES budget_categories(id),
  FOREIGN KEY (center_id) REFERENCES cost_centers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Tabla: BUDGET_ITEMS (Ítems de Presupuesto)

```sql
CREATE TABLE budget_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL,
  subcategory_id INT,
  name VARCHAR(255) NOT NULL,
  budgeted_amount DECIMAL(12,2) NOT NULL 
    COMMENT 'Monto para este ítem',
  spent_amount DECIMAL(12,2) DEFAULT 0 
    COMMENT 'Gasto actual',
  description TEXT,
  
  FOREIGN KEY (budget_id) REFERENCES budgets(id),
  FOREIGN KEY (subcategory_id) REFERENCES budget_subcategories(id)
);
```

### Tabla: USERS (Usuarios)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL 
    COMMENT 'Contraseña hasheada con bcrypt',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('ADMIN','SUPERVISOR','USUARIO')
    DEFAULT 'USUARIO',
  status ENUM('ACTIVO','INACTIVO','SUSPENDIDO')
    DEFAULT 'ACTIVO',
  last_login TIMESTAMP NULL,
  failed_login_attempts INT DEFAULT 0 
    COMMENT 'Para contra-ataque de fuerza bruta',
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  
  CONSTRAINT ck_email_format 
    CHECK (email LIKE '%@%.%')
);
```

### Tabla: PROVIDERS (Proveedores)

```sql
CREATE TABLE providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  rfc VARCHAR(13) UNIQUE COMMENT 'Registro Federal de Contribuyentes',
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'México',
  payment_method ENUM('TRANSFERENCIA','CHEQUE','EFECTIVO','TARJETA'),
  payment_days INT DEFAULT 30 COMMENT 'Días de plazo estándar',
  status ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_status (status),
  
  CONSTRAINT ck_rfc_format 
    CHECK (rfc LIKE '____________%')
);
```

### Tabla: TAX_CONFIGURATION (Configuración de Impuestos)

```sql
CREATE TABLE tax_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tax_name VARCHAR(100) NOT NULL 
    COMMENT 'Ej: IVA Estándar',
  tax_rate DECIMAL(5,2) NOT NULL 
    COMMENT 'Tasa: 16, 18, 7, etc',
  effective_from DATE NOT NULL 
    COMMENT 'Desde cuándo aplica',
  effective_to DATE NULL 
    COMMENT 'Hasta cuándo (NULL = vigente)',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_effective (effective_from, effective_to),
  
  CONSTRAINT ck_tax_rate_positive 
    CHECK (tax_rate >= 0 AND tax_rate <= 100)
);
```

### Tabla: AUDIT_LOGS (Auditoría)

```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(100) NOT NULL 
    COMMENT 'INVOICE_CREATED, USER_LOGIN, etc',
  user_id INT,
  target_id INT COMMENT 'ID del objeto modificado',
  target_type VARCHAR(50) COMMENT 'INVOICE, USER, BUDGET',
  old_values JSON COMMENT 'Valores antes del cambio',
  new_values JSON COMMENT 'Valores después del cambio',
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action),
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Diccionario de Tipos de Datos

| Tipo | Uso | Rango | Ejemplo |
|------|-----|-------|---------|
| INT | IDs, conteos | -2.1B a 2.1B | id = 123 |
| VARCHAR(n) | Texto corto | Hasta n caracteres | email = "user@mail.com" |
| TEXT | Texto largo | Hasta 64KB | description |
| DECIMAL(12,2) | Dinero | Precisión exacta | amount = 1000.50 |
| DATE | Fechas | YYYY-MM-DD | date = '2026-03-14' |
| TIMESTAMP | Fecha+hora | Incluye zona | created_at |
| ENUM | Opciones limitadas | Predefinidas | status = 'ACTIVE' |
| JSON | Datos complejos | Documentos JSON | old_values |
| BOOLEAN | Sí/No | true/false | is_active |

---

## **SCRIPTS DE INSTALACIÓN**

### 1. Script de Setup Inicial (Linux/Mac)

```bash
#!/bin/bash
# setup.sh - Script de instalación completa

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║ Sistema Gestión de Facturas - Setup   ║"
echo "║ v1.3.0                                ║"
echo "╚════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════
# PASO 1: Validar Prerequisites
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[1/6] Validando prerequisites...${NC}"

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}ERROR: $1 no está instalado${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ $1${NC}"
}

check_command node
check_command npm
check_command git
check_command mysql

# ═══════════════════════════════════════════
# PASO 2: Clonar Repositorio
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[2/6] Clonando repositorio...${NC}"

if [ ! -d "gestion-facturas" ]; then
  git clone https://github.com/tu-usuario/gestion-facturas.git
  echo -e "${GREEN}✓ Repositorio clonado${NC}"
else
  echo -e "${GREEN}✓ Repositorio ya existe${NC}"
fi

cd gestion-facturas

# ═══════════════════════════════════════════
# PASO 3: Instalar Dependencias
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[3/6] Instalando dependencias...${NC}"

cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies instaladas${NC}"

cd ../frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies instaladas${NC}"

cd ..

# ═══════════════════════════════════════════
# PASO 4: Configurar Variables de Entorno
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[4/6] Configurando ambiente...${NC}"

# Backend .env
cat > backend/.env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://root:root@localhost:3306/gestion_facturas
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=4h
BCRYPT_ROUNDS=10
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
EOF

echo -e "${GREEN}✓ Backend .env creado${NC}"

# Frontend .env
cat > frontend/.env.local << EOF
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Gestión de Facturas
VITE_ENVIRONMENT=development
EOF

echo -e "${GREEN}✓ Frontend .env creado${NC}"

# ═══════════════════════════════════════════
# PASO 5: Configurar Base de Datos
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[5/6] Configurando base de datos...${NC}"

# Crear BD
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS gestion_facturas;"
echo -e "${GREEN}✓ Base de datos creada${NC}"

# Ejecutar migrations
cd backend
npm run migrate
echo -e "${GREEN}✓ Migrations ejecutadas${NC}"

# Seeding opcional
read -p "¿Desea hacer seeding de datos de prueba? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run seed
  echo -e "${GREEN}✓ Database seeded${NC}"
fi

cd ..

# ═══════════════════════════════════════════
# PASO 6: Verificación Final
# ═══════════════════════════════════════════

echo -e "\n${BLUE}[6/6] Verificación final...${NC}"

# Test backend build
cd backend
npm run build && npm test
cd ..

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ✓ Setup completado exitosamente!      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"

echo -e "\nPróximos pasos:"
echo -e "1. Backend:  cd backend && npm start"
echo -e "2. Frontend: cd frontend && npm run dev"
echo -e "3. URL: http://localhost:8080"
echo -e "4. Credenciales por defecto: admin@empresa.com / password123"
```

### 2. Script de Instalación con Docker

```bash
#!/bin/bash
# docker-setup.sh - Setup con Docker Compose

echo "Iniciando setup con Docker..."

# Crear archivo docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: sgf-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: gestion_facturas
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sgf-backend
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql://root:root@mysql:3306/gestion_facturas
      NODE_ENV: development
      PORT: 3000
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm start

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sgf-frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:3000
      NODE_ENV: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  mysql_data:

networks:
  default:
    name: sgf-network
EOF

echo "✓ Docker Compose creado"

# Iniciar servicios
echo "Iniciando servicios..."
docker-compose up -d

echo "✓ Servicios iniciados"
echo ""
echo "URL de acceso:"
echo "  Frontend:  http://localhost:8080"
echo "  Backend:   http://localhost:3000"
echo "  MySQL:     localhost:3306"
echo ""
echo "Para ver logs: docker-compose logs -f"
```

### 3. Script de Deployment a Production

```bash
#!/bin/bash
# deploy.sh - Deploy a Railway/Producción

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  VERSION=$(date +%Y%m%d_%H%M%S)
fi

echo "Iniciando deployment v$VERSION..."

# 1. Build
echo "[1/5] Building..."
docker build -t gestion-facturas:$VERSION .

# 2. Tag
echo "[2/5] Tagging..."
docker tag gestion-facturas:$VERSION gestion-facturas:latest

# 3. Push a registro
echo "[3/5] Pushing to registry..."
docker push gestion-facturas:$VERSION
docker push gestion-facturas:latest

# 4. Deploy a Railway
echo "[4/5] Deploying to Railway..."
railway deploy --name gestion-facturas

# 5. Healthcheck
echo "[5/5] Verificando deployment..."
sleep 30
HEALTH=$(curl -s https://api.gestion-facturas.com/health | jq .status)

if [ "$HEALTH" == "healthy" ]; then
  echo "✓ Deployment exitoso!"
else
  echo "✗ Health check falló"
  exit 1
fi

echo "Deployment completado: v$VERSION"
```

### 4. Script de Backup

```bash
#!/bin/bash
# backup.sh - Backup automático

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y-%m-%d_%H:%M:%S)
BACKUP_FILE="$BACKUP_DIR/gestion_facturas_$DATE.sql"

echo "Iniciando backup..."

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Hacer dump
mysqldump -u root -proot gestion_facturas > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Subir a cloud (AWS S3)
aws s3 cp "${BACKUP_FILE}.gz" s3://backups-gestion-facturas/db/

# Limpiar backups locales old
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✓ Backup completado: ${BACKUP_FILE}.gz"
```

### 5. Script de Restauración

```bash
#!/bin/bash
# restore.sh - Restaurar desde backup

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: ./restore.sh <ruta-backup>"
  exit 1
fi

echo "Restaurando desde: $BACKUP_FILE"

# Descomprimir si es necesario
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE | mysql -u root -proot
else
  mysql -u root -proot < $BACKUP_FILE
fi

echo "✓ Restauración completada"
```

---

## **DIAGRAMA DE COMPONENTES**

### Arquitectura General en C4

```
NIVEL 1: Sistema Global

┌─────────────────────────────────────────────────────────┐
│                 Usuarios Finales                        │
│         (Contadores, Supervisores, Analistas)          │
└───────────────┬─────────────────────────────────────────┘
                │
         ┌──────▼──────┐
         │  NAVEGADOR   │
         │ (Chrome, FF) │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    │                       │
┌───▼────────────────┐      │
│ SISTEMA GESTIÓN    │      │
│ FACTURAS v1.3.0    │      │
│                    │      │
│ ┌────────────────┐ │      │
│ │ Frontend Vue3  │ │      │
│ │ + Tailwind CSS │ │      │
│ │ + Chart.js     │ │      │
│ └────────────────┘ │      │
│         │          │      │
│    API REST        │      │
│    (HTTPS)         │      │
│         │          │      │
│ ┌────────────────┐ │      │
│ │ Backend        │ │      │
│ │ Node.js +      │ │      │
│ │ Express.js     │ │      │
│ └────────────────┘ │      │
│         │          │      │
│ ┌────────────────┐ │      │
│ │  Data Layer    │ │      │
│ │ MySQL +        │ │      │
│ │ Sequelize ORM  │ │      │
│ └────────────────┘ │      │
└────────────────────┘      │
                             │
      ┌──────────────────────┘
      │
      └──→ Email Service
      │
      └──→ PDF Export
      │
      └──→ Excel Export
      │
      └──→ Logging (Sentry)
      │
      └──→ Monitoring (Datadog)
```

### Diagrama de Componentes Detalado

```
┌────────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                          │
│                         (FRONTEND)                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Vue.js Router                                                │ │
│  │ ├─ Dashboard Route                                           │ │
│  │ ├─ Invoices Route                                            │ │
│  │ ├─ Budgets Route                                             │ │
│  │ ├─ Reports Route                                             │ │
│  │ ├─ Admin Route                                               │ │
│  │ └─ Settings Route                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Componentes Vue                                              │ │
│  │ ├─ Dashboard.vue                                             │ │
│  │ ├─ InvoiceForm.vue                                           │ │
│  │ ├─ InvoiceList.vue                                           │ │
│  │ ├─ BudgetChart.vue                                           │ │
│  │ ├─ ReportGenerator.vue                                       │ │
│  │ ├─ UserManagement.vue                                        │ │
│  │ └─ Settings.vue                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ State Management (Pinia)                                     │ │
│  │ ├─ invoiceStore                                              │ │
│  │ ├─ budgetStore                                               │ │
│  │ ├─ userStore                                                 │ │
│  │ └─ authStore                                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ HTTP Client (Axios)                                          │ │
│  │ ├─ Interceptores JWT                                         │ │
│  │ ├─ Error handling global                                     │ │
│  │ └─ Request timeout 30s                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Utilidades y Librerías                                       │ │
│  │ ├─ Chart.js para gráficos                                    │ │
│  │ ├─ Tailwind CSS para estilos                                 │ │
│  │ ├─ Formatters (fecha, moneda)                                │ │
│  │ └─ Validators                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                   HTTPS Requests/Responses
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                      CAPA DE NEGOCIO                               │
│                        (BACKEND)                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Express.js Server (Port 3000)                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Middleware Layer                                             │ │
│  │ ├─ auth.js (JWT validation)                                  │ │
│  │ ├─ errorHandler.js                                           │ │
│  │ ├─ upload.js (file handling)                                 │ │
│  │ ├─ cors.js                                                   │ │
│  │ ├─ helmet.js (security headers)                              │ │
│  │ └─ morgan.js (logging)                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Routes Handler                                               │ │
│  │ ├─ /api/auth (login, refresh)                                │ │
│  │ ├─ /api/invoices (CRUD + búsqueda + reportes)                │ │
│  │ ├─ /api/budgets (gestión presupuestaria)                     │ │
│  │ ├─ /api/reports (reportes y análisis)                        │ │
│  │ ├─ /api/admin (administración)                               │ │
│  │ └─ /api/health (healthcheck)                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Controllers (Lógica de Negocio)                             │ │
│  │ ├─ auth.controller.js                                        │ │
│  │ ├─ invoice.controller.js                                     │ │
│  │ ├─ budget.controller.js                                      │ │
│  │ ├─ report.controller.js                                      │ │
│  │ ├─ user.controller.js                                        │ │
│  │ └─ ...otros controllers                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Services (Servicios de Negocio)                             │ │
│  │ ├─ invoiceService                                            │ │
│  │   ├─ createInvoice()                                         │ │
│  │   ├─ calculateTax()                                          │ │
│  │   ├─ exportToExcel()                                         │ │
│  │   └─ generateReport()                                        │ │
│  │ ├─ budgetService                                             │ │
│  │   ├─ checkBudgetStatus()                                     │ │
│  │   └─ generateAlertas()                                       │ │
│  │ ├─ authService                                               │ │
│  │ ├─ emailService                                              │ │
│  │ └─ pdfService                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Models (Sequelize ORM)                                       │ │
│  │ ├─ Invoice.js                                                │ │
│  │ ├─ Budget.js                                                 │ │
│  │ ├─ BudgetItem.js                                             │ │
│  │ ├─ User.js                                                   │ │
│  │ ├─ Provider.js                                               │ │
│  │ ├─ TaxConfiguration.js                                       │ │
│  │ ├─ AuditLog.js                                               │ │
│  │ └─ Relations con Associations                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Utilities y Helpers                                          │ │
│  │ ├─ validators.js                                             │ │
│  │ ├─ formatters.js                                             │ │
│  │ ├─ constants.js                                              │ │
│  │ ├─ errorHandler.js                                           │ │
│  │ └─ logger.js (Winston)                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                     SQL Queries / Results
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                      CAPA DE DATOS                                 │
│                        (DATABASE)                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ MySQL Database (Cloud)                                       │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ Core Tables                                            │ │ │
│  │  ├─ invoices (5,000+ registros)                           │ │ │
│  │  ├─ budgets (200+ registros)                              │ │ │
│  │  ├─ budget_items (1,000+ registros)                       │ │ │
│  │  ├─ users (45 usuarios)                                   │ │ │
│  │  ├─ providers (150+ proveedores)                          │ │ │
│  │  ├─ employees (50+ empleados)                             │ │ │
│  │  ├─ cost_centers (12 centros)                             │ │ │
│  │  └─ tax_configurations (10+ registros)                    │ │ │
│  │  └─ audit_logs (100,000+ registros)                       │ │ │
│  │                                                              │ │ │
│  │  ├─ Índices     │ │ │
│  │  ├─ Foreign Keys│ │ │
│  │  ├─ Constraints│ │ │
│  │  └─ Triggers   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ Almacenamiento & Performance                          │ │ │
│  │  │ ├─ Tamaño BD: 10 GB                                   │ │ │
│  │  │ ├─ Backups: Diarios, Cloud (S3)                       │ │ │
│  │  │ ├─ Conexión pool: 25 conexiones                       │ │ │
│  │  │ ├─ Query cache: Habilitado                            │ │ │
│  │  │ └─ Replicación: Master-Slave                          │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Cache Layer (Redis - Opcional)                              │ │
│  │ ├─ Caché de sesiones                                         │ │
│  │ ├─ Caché de queries frecuentes                               │ │
│  │ ├─ Rate limiting                                             │ │
│  │ └─ TTL: 1 hora por defecto                                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│         SERVICIOS EXTERNOS E INTEGRACIONES                         │
├────────────────────────────────────────────────────────────────────┤
│  ├─ Email Service (SMTP)                                          │
│  ├─ PDF Generator (node-pdf-lib)                                  │
│  ├─ Excel Generator (ExcelJS)                                     │
│  ├─ File Storage (AWS S3)                                         │
│  ├─ Error Tracking (Sentry)                                       │
│  ├─ Application Monitoring (Datadog)                              │
│  ├─ Log Aggregation (ELK Stack)                                   │
│  └─ Authentication (JWT Local)                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Diagrama de Flujo de Datos

```
CREAR FACTURA - Flujo Completo
════════════════════════════════════════════════════════════════════

Usuario                Frontend            Backend             Database
   │                     │                    │                   │
   │─ Click Nueva        │                    │                   │
   │  Factura            │                    │                   │
   │                     │◄─ Mostrar form     │                   │
   │                     │   (componente)     │                   │
   │─ Completa form      │                    │                   │
   │  (número, monto,    │                    │                   │
   │   fecha, proveedor) │                    │                   │
   │                     │                    │                   │
   │─ Click Guardar      │                    │                   │
   │                     │─ POST /api/        │                   │
   │                     │   invoices         │                   │
   │                     │   + validación     │                   │
   │                     │   + JWT token      │────────────────────│
   │                     │                    │ 1. Validar datos   │
   │                     │                    │ 2. Verificar       │
   │                     │                    │    proveedor       │
   │                     │                    │ 3. Calcular tasa   │
   │                     │                    │    según fecha    │
   │                     │                    │ 4. Calcular tasa + │
   │                     │                    │    total           │
   │                     │                    │ 5. INSERT factura  │
   │                     │                    │ 6. INSERT auditoría│
   │                     │                    │ 7. COMMIT          │
   │                     │                    │─────────────────► │
   │                     │◄── JSON response   │                   │
   │                     │    (factura        │                   │
   │                     │     creada)        │                   │
   │                     │─ Update estado     │                   │
   │◄─── Confirmación    │  + actualizar      │                   │
   │     "Exitoso!       │    lista           │                   │
   │     INV-001"        │                    │                   │
   │                     │                    │                   │

TIEMPO TOTAL DE RESPUESTA: 245ms

Desglose:
  - Validación Frontend: 50ms
  - HTTP Request: 25ms
  - Validación Backend: 40ms
  - Cálculos: 20ms
  - BD Insert: 80ms
  - BD Commit: 20ms
  - HTTP Response: 10ms
```

---

Tu manual técnico está listo. 📚 

¿Necesitas que agregue o modifique algo específico del manual?
