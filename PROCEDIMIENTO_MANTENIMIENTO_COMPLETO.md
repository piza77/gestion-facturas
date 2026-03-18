# PROCEDIMIENTO GENERAL DE MANTENIMIENTO
## Sistema de Gestión de Facturas
### Documento Integral y Profesional

---

## **1. PROCEDIMIENTO GENERAL DE MANTENIMIENTO**

### 1.1 Definición y Alcance

El procedimiento general de mantenimiento es el conjunto de pasos estandarizados que se siguen para mantener la aplicación de Gestión de Facturas operativa, segura, actualizada y optimizada.

**Alcance:**
- Todos los componentes del sistema (Backend, Frontend, Base de datos, Infraestructura)
- Todas las funcionalidades críticas y no críticas
- Seguridad de datos, rendimiento y disponibilidad
- Actualización de dependencias y correcciones de bugs

### 1.2 Responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| **Administrador de Sistema** | Monitoreo 24/7, alertas, infraestructura |
| **Desarrollador Senior** | Análisis de solicitudes, planificación |
| **Desarrollador** | Desarrollo e implementación de cambios |
| **QA Engineer** | Testing, regresión, validación |
| **Product Manager** | Priorización, comunicación a usuarios |
| **DevOps** | Deployment, versioning, rollback |

### 1.3 Etapas del Procedimiento

```
SOLICITUD DE MANTENIMIENTO
        ↓
REGISTRO EN SISTEMA
        ↓
CLASIFICACIÓN DEL TIPO
        ↓
ANÁLISIS DE IMPACTO
        ↓
PLANIFICACIÓN
        ↓
DESARROLLO (Rama separada)
        ↓
PRUEBAS EN STAGING
        ↓
PRUEBAS DE REGRESIÓN
        ↓
APROBACIÓN
        ↓
DEPLOY A PRODUCCIÓN
        ↓
VALIDACIÓN EN VIVO
        ↓
DOCUMENTACIÓN Y CIERRE
```

---

## **2. GESTIÓN DE VERSIONES**

### 2.1 Estrategia de Versionado

Se utiliza **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

**Formato:** `1.2.3`
- **MAJOR** (1): Cambios incompatibles, nuevas características grandes
- **MINOR** (2): Nuevas características, cambios compatibles
- **PATCH** (3): Correcciones de bugs, optimizaciones menores

### 2.2 Historial de Versiones de Aplicación

```
v1.0.0 - Lanzamiento inicial (Enero 2025)
├── Gestión de facturas
├── Autenticación JWT
├── Base de datos MySQL

v1.1.0 - Presupuestos (Febrero 2025)
├── Módulo de presupuestos
├── Categorización
├── Reportes básicos

v1.2.0 - Mejoras de rendimiento (Marzo 2025)
├── Caching Redis
├── Índices optimizados
├── Dashboard mejorado

v1.2.1 - Parches de seguridad (Marzo 2025)
├── Actualizar jsonwebtoken
├── Fix de validación

v1.3.0 - Seguimiento de gastos (Abril 2025)
├── Detalle de gastos
├── Análisis presupuestario
├── Alertas de presupuesto
```

### 2.3 Control de Versiones con Git

**Ramas de trabajo:**

```
main (producción)
  ↓ (merge desde release)
release/v1.2.0 (preparar release)
  ↓ (merge desde develop)
develop (staging)
  ↓ (merge de feature branches)
├── feature/nueva-caracteristica
├── hotfix/emergencia
├── bugfix/problema-reportado
└── maintenance/optimizacion
```

**Reglas de branching:**

```bash
# Crear rama para nueva tarea
git checkout -b feature/descripcion-corta
git checkout -b bugfix/descripcion-corta
git checkout -b hotfix/descripcion-corta

# Ej:
git checkout -b feature/multi-empresa
git checkout -b bugfix/excel-export-error
git checkout -b hotfix/sql-injection-critical

# Después de completar
git commit -m "feat: descripción clara"
git push origin feature/multi-empresa

# Pull Request → Review → Merge → Deploy
```

**Mensaje de commit debe ser descriptivo:**

```
feat(invoices): agregar filtro por fecha en reportes
fix(auth): corregir token expirado antes de tiempo
docs: actualizar README con ejemplos
perf(dashboard): optimizar carga de datos
security: actualizar dependencias vulnerables
```

### 2.4 Etiquetas (Tags) de Release

```
$ git tag -a v1.2.1 -m "Version 1.2.1 - Parches de seguridad"
$ git push origin v1.2.1

// En producción, siempre:
git checkout v1.2.1
```

### 2.5 Archivo de Versiones

**backend/package.json:**
```json
{
  "name": "gestion-facturas-backend",
  "version": "1.2.1",
  "description": "Sistema de Gestión de Facturas - Backend",
  ...
}
```

**frontend/package.json:**
```json
{
  "name": "gestion-facturas-frontend",
  "version": "1.2.1",
  ...
}
```

---

## **3. PLAN DE COPIAS DE SEGURIDAD**

### 3.1 Estrategia de Backup

**Frecuencia:**
- **Base de datos**: Diaria (automática a las 2:00 AM)
- **Archivos estáticos**: Cada hora (automática)
- **Código fuente**: Continuo (GitHub automático)

### 3.2 Tipos de Backup

| Tipo | Frecuencia | Retención | Almacenamiento |
|------|-----------|-----------|----------------|
| **Completo** | Semanal | 12 semanas | Cloud (AWS S3) |
| **Incremental** | Diario | 30 días | Cloud (AWS S3) |
| **Transacional** | Cada hora | 7 días | Local + Cloud |
| **Código** | Continuo | Indefinido | GitHub |

### 3.3 Procedimiento de Backup Automático

**Script de backup diario:**

```bash
#!/bin/bash
# backup-database.sh
# Ejecuta: 2:00 AM todos los días

DATE=$(date +%Y-%m-%d_%H:%M:%S)
BACKUP_DIR="/backups/mysql"

# Backup de BD
mysqldump -u root -p${DB_PASSWORD} gestion_facturas \
  > $BACKUP_DIR/gestion_facturas_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/gestion_facturas_$DATE.sql

# Subir a S3
aws s3 cp $BACKUP_DIR/gestion_facturas_$DATE.sql.gz \
  s3://backups-gestion-facturas/db/

# Limpiar backups locales de más de 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Log
echo "Backup completado: $DATE" >> /logs/backup.log
```

### 3.4 Verificación de Backups

**Cada viernes:**
```bash
# Probar que el backup se puede restaurar
1. Descargar último backup de S3
2. Restaurar en BD de prueba
3. Ejecutar queries de validación
4. Si falla: ALERTA CRÍTICA
5. Si pasa: Confirmar integridad ✓
```

### 3.5 Plan de Recuperación (RTO/RPO)

```
Escenario: BD se corrompe completamente

RTO (Recovery Time Objective): 30 minutos
RPO (Recovery Point Objective): 1 hora (pérdida máxima de datos)

Pasos:
1. Detectar problema (0-2 min)
2. Declarar estado de desastre (2-5 min)
3. Detener aplicación (5-10 min)
4. Descargar último backup de S3 (10-15 min)
5. Restaurar en BD nueva (15-25 min)
6. Validar integridad (25-28 min)
7. Reanudar aplicación (28-30 min)
8. Usuarios pueden trabajar nuevamente

Máximo downtime: 30 minutos
Máximo datos perdidos: 1 hora (último backup)
```

### 3.6 Almacenamiento de Backups

```
Local (servidor):
- Acceso rápido
- Capacidad limitada
- Retención: 7 días

Cloud (AWS S3):
- Redundancia geográfica
- Acceso desde cualquier lugar
- Retención: 12 semanas
- Costo bajo (~$20/mes)

Criptografía:
- Backups encriptados en tránsito
- Encriptados en reposo (S3 encryption)
- Acceso solo con credenciales seguras
```

---

## **4. PRUEBAS DE MANTENIMIENTO**

### 4.1 Tipos de Pruebas

#### A) Pruebas Unitarias
```javascript
// backend/tests/unit/invoice.test.js
describe('Invoice Model', () => {
  test('Crear factura con datos válidos', async () => {
    const invoice = await Invoice.create({
      number: 'INV-001',
      amount: 1000,
      providerId: 1
    });
    
    expect(invoice.id).toBeDefined();
    expect(invoice.number).toBe('INV-001');
  });

  test('Rechazar factura sin proveedor', async () => {
    expect(() => Invoice.create({
      number: 'INV-001',
      amount: 1000
      // Falta providerId
    })).toThrow();
  });
});

// Ejecutar: npm test:unit
// Cobertura esperada: > 80%
```

#### B) Pruebas de Integración
```javascript
// backend/tests/integration/invoice-api.test.js
describe('Invoice API', () => {
  test('GET /api/invoices - obtener todas', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/invoices - crear nueva con validación', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        number: 'INV-001',
        amount: 1000,
        providerId: 1,
        date: new Date()
      });
    
    expect(response.status).toBe(201);
    expect(response.body.invoice).toHaveProperty('id');
  });
});

// Ejecutar: npm test:integration
```

#### C) Pruebas E2E (End-to-End)
```javascript
// frontend/cypress/e2e/invoice-workflow.cy.js
describe('Workflow completo de factura', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password');
    cy.visit('/dashboard');
  });

  it('Crear, editar y descargar factura', () => {
    // Crear
    cy.get('[data-test=btn-new-invoice]').click();
    cy.get('[data-test=input-number]').type('INV-001');
    cy.get('[data-test=input-amount]').type('1000');
    cy.get('[data-test=select-provider]').click();
    cy.contains('Proveedor ABC').click();
    cy.get('[data-test=btn-save]').click();
    cy.contains('Factura creada exitosamente').should('be.visible');
    
    // Editar
    cy.contains('INV-001').click();
    cy.get('[data-test=btn-edit]').click();
    cy.get('[data-test=input-amount]').clear().type('1100');
    cy.get('[data-test=btn-save]').click();
    
    // Descargar
    cy.get('[data-test=btn-download-excel]').click();
    cy.readFile('cypress/downloads/INV-001.xlsx').should('exist');
  });
});

// Ejecutar: npm run cypress:run
```

### 4.2 Checklist de Pruebas Pre-Deploy

```
PRUEBAS FUNCIONALES:
☐ Crear factura y validar campos requeridos
☐ Editar factura existente
☐ Eliminar factura (debe ser reversible o no permitir)
☐ Buscar facturas por fecha/proveedor
☐ Generar reporte mensual
☐ Exportar a Excel
☐ Exportar a PDF

PRUEBAS DE SEGURIDAD:
☐ Usuario A no ve datos de Usuario B
☐ Token JWT no expirado permite acceso
☐ Token expirado rechaza operación
☐ Contraseña débil no se acepta
☐ SQL injection es bloqueado

PRUEBAS DE RENDIMIENTO:
☐ Dashboard carga en < 2 segundos
☐ Reporte con 10,000 facturas en < 30 segundos
☐ Búsqueda responde en < 1 segundo

PRUEBAS DE COMPATIBILIDAD:
☐ Funciona en Chrome
☐ Funciona en Firefox
☐ Funciona en Safari
☐ Funciona en dispositivos móviles
```

---

## **5. SEGURIDAD EN MANTENIMIENTO**

### 5.1 Controles de Seguridad

#### A) Autenticación y Autorización

```javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({error: 'Token no proporcionado'});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no está expirado
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({error: 'Token expirado'});
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({error: 'Authorization inválida'});
  }
};

// Aplicar a todas las rutas sensibles:
app.get('/api/invoices', authMiddleware, invoiceController.getAll);
```

#### B) Validación de Entrada

```javascript
// En controladores: expresión-validator
const { body, validationResult } = require('express-validator');

const validateCreateInvoice = [
  body('number')
    .isString()
    .trim()
    .notEmpty()
    .matches(/^INV-\d+$/)  // Solo formato especifico
    .escape(),  // Prevenir XSS
    
  body('amount')
    .isFloat({ min: 0, max: 999999 })
    .toFloat(),
    
  body('providerId')
    .isInt({ min: 1 })
    .toInt(),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    next();
  }
];

app.post('/api/invoices', authMiddleware, validateCreateInvoice, controller);
```

#### C) Encriptación

```javascript
// Contraseñas con bcrypt
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Almacenamiento seguro en BD:
user.password = await hashPassword('user-password');
await user.save();
```

#### D) Variables de Entorno

```bash
# .env (NUNCA en Git)
DATABASE_URL=mysql://user:password@localhost/gestion_facturas
JWT_SECRET=tu-secret-muy-largo-y-aleatorio
API_KEY=api-key-segura
BCRYPT_ROUNDS=10
NODE_ENV=production
```

### 5.2 Auditoría de Cambios

```javascript
// Cada cambio sensible se registra
const logAudit = async (action, userId, details) => {
  await AuditLog.create({
    action,        // 'INVOICE_CREATED', 'USER_DELETED', etc
    userId,        // Quién hizo el cambio
    timestamp: new Date(),
    details,       // Qué datos fueron modificados
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
};

// Ejemplo de uso:
app.post('/api/invoices', async (req, res) => {
  const invoice = await Invoice.create(req.body);
  await logAudit('INVOICE_CREATED', req.user.id, {
    invoiceId: invoice.id,
    amount: invoice.amount
  });
  res.json(invoice);
});

// Visualizar auditoría:
// GET /api/audit-logs?userId=5&action=INVOICE_DELETED
```

### 5.3 Vulnerabilidades Comunes Controladas

| Vulnerabilidad | Cómo se previene |
|----------------|-----------------|
| **SQL Injection** | Parameterized queries, ORM (Sequelize) |
| **XSS (Cross-Site Scripting)** | Validación entrada, escape de salida |
| **CSRF** | CSRF tokens en formularios |
| **Broken Auth** | JWT con expiración, password hashing |
| **Weak Passwords** | Validación: min 8 caracteres, mayús, números |
| **Exposed Secrets** | Variables de entorno, no en código |

---

## **6. MONITOREO**

### 6.1 Métricas Monitoreadas

#### A) Disponibilidad
```
- Uptime: % del tiempo que la aplicación está disponible
- Target: > 99.5% (máximo 3.6 horas downtime/mes)
- Herramienta: Datadog, New Relic

Ejemplo:
- Marzo: 99.8% uptime
- Downtime: 1.4 horas (1 incident de 1 hora + 20 min mantenimiento)
- SLA cumplido: ✓
```

#### B) Rendimiento
```
- Tiempo de respuesta promedio (backend): < 200ms
- Tiempo de carga página (frontend): < 2 segundos
- Query time máximo: < 1 segundo

Herramienta: Lighthouse, APM (Application Performance Monitoring)

Ejemplo de métrica:
Dashboard:
- Before: 3.2 segundos (malo)
- After: 1.5 segundos (bueno)
- Mejora: 53% más rápido ✓
```

#### C) Errores
```
- Error rate: < 0.5% (máximo 5 errores por 1000 requests)
- Critical errors: 0 (no se permite)
- Stack traces capturados: 100% con Sentry

Ejemplo:
- Total requests: 100,000
- Errores: 200 (0.2%, dentro del límite)
- Críticos: 0 ✓
- Warnings: 15 (revisar)
```

#### D) Base de Datos
```
- Conectiones activas: < 80% del máximo
- Slow queries: < 1 por minuto
- Disk space: < 80% capacidad

Ejemplo:
- Max conexiones: 100
- Actual: 42 (42%)
- Health: ✓ (verde)

- Queries > 1 segundo: 0
- Health: ✓ (verde)
```

### 6.2 Alertas Configuradas

```
CRÍTICA (Responder en < 5 minutos):
- Aplicación completamente caída
- BD inaccesible
- Vulnerabilidad crítica de seguridad
- Error rate > 5%

ALTA (Responder en < 30 minutos):
- Tiempo respuesta > 2 segundos promedio
- Error rate > 1%
- Espacio BD > 90%
- Memory > 90%

MEDIA (Responder en < 4 horas):
- Queries lentas detectadas
- Deploy falló
- Warnings en logs

BAJA (Revisar en jornada laboral):
- Logs informativos
- Performance warnings menores
```

### 6.3 Dashboard de Monitoreo

```
VISTA EN TIEMPO REAL:

┌─────────────────────────────────────┐
│ SISTEMA DE GESTIÓN DE FACTURAS     │
│ 14 de marzo de 2026, 10:30 AM      │
├─────────────────────────────────────┤
│ STATUS GENERAL: ✓ SALUDABLE        │
├─────────────────────────────────────┤
│ Uptime:          99.8% (este mes)   │
│ Requests/min:    15,230             │
│ Error rate:      0.15%              │
│ Resp. time:      145ms              │
├─────────────────────────────────────┤
│ BACKEND                             │
│ ├─ CPU: 28%                         │
│ ├─ Memory: 1.2 GB / 4 GB (30%)     │
│ ├─ Requests: 15,230/min             │
│ └─ Errors: 23 (0.15%)               │
├─────────────────────────────────────┤
│ BASE DE DATOS                       │
│ ├─ Conectiones: 42/100 (42%)       │
│ ├─ Queries/seg: 245                 │
│ ├─ Slow queries: 0                  │
│ └─ Disk: 3.2 GB / 5 GB (64%)       │
├─────────────────────────────────────┤
│ FRONTEND                            │
│ ├─ Load time: 1.8 segundos          │
│ ├─ Users activos: 34                │
│ └─ Sessions: 127                    │
├─────────────────────────────────────┤
│ ÚLTIMOS EVENTOS                     │
│ ├─ 10:28 - Deploy v1.2.1 exitoso   │
│ ├─ 10:15 - Query lenta detectada   │
│ └─ 09:42 - User login fallido      │
└─────────────────────────────────────┘
```

---

## **7. INDICADORES DE MANTENIMIENTO (KPIs)**

### 7.1 Métricas Clave

| Indicador | Meta | Actual | Estado |
|-----------|------|--------|--------|
| **Uptime** | > 99.5% | 99.8% | ✓ Cumplido |
| **Tiempo Respuesta Promedio** | < 200ms | 145ms | ✓ Cumplido |
| **Error Rate** | < 0.5% | 0.15% | ✓ Cumplido |
| **Coverage de Tests** | > 80% | 84% | ✓ Cumplido |
| **Vulnerabilities Críticas** | 0 | 0 | ✓ Cumplido |
| **MTTR (Tiempo reparación)** | < 1 hora | 35 min | ✓ Cumplido |
| **MTTF (Tiempo sin fallas)** | > 720 horas | 2,400 horas | ✓ Cumplido |
| **Deuda Técnica** | < 5% | 3.2% | ✓ Cumplido |

### 7.2 MTTR y MTTF

```
MTTR (Mean Time To Repair - Tiempo Medio De Reparación):
- Error ocurre a las 10:00 AM
- Equipo notificado a las 10:01 AM
- Causa identificada a las 10:15 AM
- Parche desarrollado a las 10:25 AM
- Deploy a producción a las 10:30 AM
- Error resuelto a las 10:35 AM
MTTR = 35 minutos

MTTF (Mean Time To Failure - Tiempo Medio Entre Fallos):
- Última falla crítica: 8 de febrero
- Falla actual: 14 de marzo
- Días sin fallas = 34 días × 24 horas = 816 horas
MTTF = 816 horas (objetico: > 720 horas ✓)
```

### 7.3 Deuda Técnica

```
Deuda técnica = % de codebase que requiere refactorización

Medida con SonarQube:
- Complejidad ciclomática alta: 120 (debería ser < 100)
- Funciones > 50 líneas: 12 (debería ser < 5)
- Tests faltantes: 23 funciones (debería ser 0)
- Code duplicado: 3.2% (debería ser < 2%)

Acción: Asignar 1 semana de refactorización por mes
```

### 7.4 Reporte Mensual de KPIs

```
REPORTE DE MANTENIMIENTO - MARZO 2026
====================================

DISPONIBILIDAD:
- Uptime: 99.8% (META: 99.5%) ✓ CUMPLIDO
- Downtime total: 1 hora 24 minutos (planeado)
- Incidents críticos: 0
- Incidents altos: 1 (resuelto en 35 min)

RENDIMIENTO:
- Response time promedio: 145ms (META: 200ms) ✓ CUMPLIDO
- P95 (95% de requests): 280ms
- Queries lentas identificadas: 2 (indexadas)
- Dashboard load time: 1.8s (fue 3.2s) ✓ MEJORA

SEGURIDAD:
- Vulnerabilidades críticas: 0
- Vulnerabilidades altas: 0
- Audalso intentos de ataque: 3 (bloqueados)
- Updates de seguridad aplicadas: 5

TESTING:
- Test coverage: 84% (META: >80%) ✓ CUMPLIDO
- Tests fallidos: 0
- E2E tests: 35/35 pasando
- Defects encontrados en testing: 0 en producción (prevención)

CAMBIOS REALIZADOS:
- Nuevas features: 2 (multi-empresa, retención SAT)
- Bug fixes: 8
- Optimizaciones: 5
- Updates de dependencias: 23

DOCUMENTACIÓN:
- Documentación actualizada: ✓
- Changelog actualizado: ✓
- Usuarios notificados: ✓

GENERAL:
Este mes ha sido muy exitoso. Logramos mejorar rendimiento 50% 
en dashboard y agregar 2 nuevas features sin comprometer estabilidad.

PRÓXIMOS PASOS (Abril):
- Integración con sistema contable
- Mejorar filtros de búsqueda
- Optimizar reportes anuales
```

---

## **8. PERIODICIDAD DE REVISIÓN DEL PLAN**

### 8.1 Calendario de Revisión

```
DIARIO (cada mañana a las 9:00 AM):
☐ Revisar alertas críticas
☐ Ver performance dashboard
☐ Buscar nuevos errors en Sentry
☐ Revisar logs del día anterior

SEMANAL (cada lunes a las 10:00 AM):
☐ Reunión de planning de la semana
☐ Priorizar mantenimiento correctivo pendiente
☐ Revisar KPIs
☐ Validar cobertura de tests
☐ Actualizar backlog de mantenimiento

MENSUAL (primer martes del mes):
☐ Reunión de review del mes
☐ Generar reporte KPIs
☐ Tomar decisiones de mantenimiento adaptativo
☐ Revisar deuda técnica
☐ Planificar mejoras para próximo mes
☐ Seguridad: revisar vulnerabilidades

TRIMESTRAL (15 de mes X, 3X, 6X, 9X, 12X):
☐ Revisión estratégica del plan
☐ ¿Sigue siendo adecuado el plan?
☐ Cambios en tecnología
☐ Cambios en requisitos de negocio
☐ Actualizar versiones mayores si es necesario

ANUAL (primera semana de enero):
☐ Revisión completa del plan
☐ Auditoría de seguridad completa
☐ Planificación de cambios tecnológicos mayores
☐ Capacitación del equipo
☐ Establecer objetivos del año
☐ Análisis ROI de mantenimiento
```

### 8.2 Trigger de Revisión No Programada

```
El plan se revisa inmediatamente si:

1. SECURITY:
   - Vulnerabilidad crítica descubierta
   - Breach de seguridad
   - Cambio regulatorio

2. PERFORMANCE:
   - Uptime cae por debajo de 99%
   - Error rate sube a > 1%
   - Respuesta > 1 segundo promedio

3. ESCALABILIDAD:
   - Usuarios activos crecen 50% en un mes
   - Base de datos crece > 50% en un mes
   - Servidor alcanza 100% de capacidad

4. TECNOLOGÍA:
   - Fin de soporte de versión de Node.js
   - Nueva versión mayor de Framework
   - Cambio en infraestructura (migración cloud)

5. NEGOCIO:
   - Nuevo cliente importante con requisitos especiales
   - Fusión/adquisición
   - Cambio en modelo de negocio
```

### 8.3 Responsable de Revisión

```
DIARIA: Administrador de Sistema
SEMANAL: Desarrollador Senior + Product Manager
MENSUAL: Todo el equipo de desarrollo
TRIMESTRAL: Liderazgo técnico + Management
ANUAL: CEO/VP Producto + CTO + Equipo completo
```

---

## **9. EJEMPLO 1: CORRECCIÓN URGENTE (HOTFIX)**

### Escenario
**Problema:** Usuarios reportan que no pueden descargar facturas en Excel. El error ocurre a las 10:15 AM.

---

### Fase 1: RECEPCIÓN DE SOLICITUD

**10:15 AM - Usuario reporta problema**

```
Canal: Chat de soporte
Usuario: "No puedo descargar factura en Excel, dice error"
Impacto: Todos los usuarios afectados

Ticket creado automáticamente:
- ID: TICKET-2026-0314-001
- Título: Excel export error
- Prioridad: CRÍTICA
- Asignado a: OnCall Developer
```

---

### Fase 2: REGISTRO EN SISTEMA

```
Sistema de Tickets (Jira/GitHub Issues):

TICKET-2026-0314-001
====================================
Tipo: Bug - Crítico
Título: Excel export fallando para todas las facturas
Fecha Reporte: 14-03-2026 10:15 AM
Reportado por: user@empresa.com
Prioridad: CRÍTICA
Status: OPEN

Descripción:
"Cuando intento descargar una factura en Excel, 
la página muestra error y el archivo no se descarga."

Steps para reproducir:
1. Ir a factura existente
2. Click botón "Descargar Excel"
3. Observar error en pantalla

Error message:
"Error 500: Internal Server Error"

Ambiente: PRODUCCIÓN
Usuarios afectados: ~200 usuarios
Ingresos perdidos/hora: ~$500
```

---

### Fase 3: CLASIFICACIÓN

```
CLASIFICACIÓN:
✓ Criticidad: CRÍTICA (afecta > 50 usuarios)
✓ Tipo: Mantenimiento CORRECTIVO
✓ Categoría: Bug en funcionalidad vital
✓ SLA: Resolver en < 2 horas

Impacto:
- Negocio: ALTO (usuarios no pueden trabajar)
- Seguridad: BAJO (no es problema de seguridad)
- Performance: MEDIO (puede ser timeout)
- Usuarios: TODOS
```

---

### Fase 4: ANÁLISIS DE IMPACTO

**10:20 AM - Análisis inicial**

```
ANÁLISIS RÁPIDO:

1. ¿Cuándo comenzó?
   - Checks de log: Error comienza a 10:14 AM
   - Coincide con último deploy (10:10 AM)
   - → CAUSA PROBABLE: Cambio reciente

2. Revisar último deploy:
   Git log:
   - v1.2.1 deployed a las 10:10 AM
   - Cambios en: invoice.controller.js
   - Cambios en: exceljs setup

3. Ver logs de error en Sentry:
   Error: "Cannot find module 'exceljs'"
   Stack trace:
   at Object.<anonymous> (/app/services/excel-export.js:5:12)
   
4. Raíz del problema identificada:
   ✓ En el deploy de v1.2.1
   ✓ package.json no incluye exceljs
   ✓ Node no puede cargar módulo

SEVERIDAD CONFIRMADA: CRÍTICA
```

---

### Fase 5: PLANIFICACIÓN

**10:25 AM - Plan de acción inmediato**

```
OPCIÓN 1: Rollback (más rápido)
- Deploy versión anterior (v1.2.0)
- Tiempo: 3-5 minutos
- Riesgo: Bajo (volvemos a versión estable)
- Decisión: ✓ HACER ESTO PRIMERO

OPCIÓN 2: Hotfix (después de rollback)
- Corregir issue en rama hotfix
- Testing rápido
- Deploy nueva versión

PLAN:
1. Inmediato (10:25-10:30): Rollback a v1.2.0
2. Usuarios pueden trabajar nuevamente
3. Después (10:30-11:00): Analizar qué falló en deploy
4. Implementar hotfix
5. Testing exhaustivo
6. Re-deploy de v1.2.1 corregido
```

---

### Fase 6: DESARROLLO (Hotfix Branch)

**10:30 AM - Rollback completado, usuarios funcionando**

```
Acción de rollback:
$ git checkout v1.2.0
$ npm install
$ npm test
$ npm run build
$ docker build -t app:v1.2.0 .
$ docker run -d -p 3000:3000 app:v1.2.0

Result: ✓ Aplicación volvió a funcionar
Usuarios afectados: 0
Downtime total: 15 minutos

Notificación a usuarios (10:32 AM):
"Identificamos y resolvimos un problema de descarga Excel.
El servicio está completamente restaurado. 
Disculpen la interrupción."
```

**10:35 AM - Crear hotfix**

```bash
# Crear rama hotfix desde main
$ git checkout -b hotfix/excel-export-fix

# Revisar qué faltó en v1.2.1
$ git diff v1.2.0 v1.2.1

# Cambios en archivo invoice.controller.js:
- Actualización de lógica de Excel
- Pero package.json no fue actualizado

# Fix: restaurar package.json correcto
$ git checkout v1.2.0 -- package.json
$ npm install  # Reinstalar exceljs

# Ahora tenemos:
- v1.2.0 con los cambios de v1.2.1 en funcionalidad
- Pero package.json correcto

# Validar que exceljs está en dependencies
$ npm list exceljs
exceljs@4.4.0

# Commit
$ git add .
$ git commit -m "fix: agregar exceljs a dependencies - hotfix"
```

---

### Fase 7: PRUEBAS EN STAGING

**10:45 AM - Testing en ambiente de staging**

```javascript
// Prueba manual de funcionalidad

// 1. Crear ambiente de staging con el hotfix
$ git checkout hotfix/excel-export-fix
$ npm install
$ npm run build
$ npm start:staging

// 2. Ejecutar suite de tests relacionados
$ npm test -- invoice  // Resultados:
  ✓ Create invoice
  ✓ Export to Excel
  ✓ Download Excel file is valid
  ✓ 3 tests passed

// 3. Manual testing:
Abrir navegador → staging.app.com
Crear factura de prueba
Click "Descargar Excel"
✓ Descarga funciona
✓ Archivo contiene datos correctos
✓ Archivo se abre sin errores

// 4. Performance check
Response time: 245ms (normal)
File size: 48 KB (normal)
```

---

### Fase 8: PRUEBAS DE REGRESIÓN

**10:55 AM - Validar que no se rompió nada más**

```
Checklist de regresión:

FUNCIONALIDADES CRÍTICAS:
☐ Login funciona
☐ Ver facturas
☐ Crear factura
☐ Editar factura
☐ ✓ Descargar Excel (FIXED)
☐ Descargar PDF
☐ Búsqueda de facturas
☐ Reportes

SEGURIDAD:
☐ JWT validation
☐ User permissions
☐ No SQL injection

PERFORMANCE:
☐ Dashboard < 2 segundos
☐ Búsqueda < 1 segundo
☐ Excel download < 1 segundo

BASES DE DATOS:
☐ No data lost
☐ Transacciones ok
☐ No deadlocks

RESULTADO: ✓ Todo pasa

Especialmente:
$ npm test -- excel.test.js
✓ Excel export generates valid file
✓ All columns present
✓ Data is correct
✓ 3 tests passed in 2.3s
```

---

### Fase 9: APROBACIÓN

**11:05 AM - Revisión y aprobación**

```
APPROVAL BOARD:

☐ Code Review: 
   - Desarrollador Senior revisa cambios
   - "Looks good, simple fix"
   - Aprobado: ✓

☐ QA Approval:
   - QA Engineer valida tests
   - "All test pass, regresion clean"
   - Aprobado: ✓

☐ Business Approval:
   - Product Manager confirma
   - "Users are waiting, approve immediately"
   - Aprobado: ✓

OVERALL APPROVAL: ✓ GO FOR DEPLOY
```

---

### Fase 10: DESPLIEGUE EN PRODUCCIÓN

**11:10 AM - Deploy**

```bash
# Merge a main
$ git checkout main
$ git merge hotfix/excel-export-fix
$ git tag -a v1.2.1-hotfix-1 -m "Excel export fix"
$ git push origin main --tags

# Build y push a registro
$ docker build -t gestion-facturas:v1.2.1-h1 .
$ docker push registry/gestion-facturas:v1.2.1-h1

# Deploy a Railway (CD automático)
$ git push origin main  # Automáticamente redirige a deploy

# Validar deploy
$ curl https://app.gestion-facturas.com/health
{
  "status": "healthy",
  "version": "v1.2.1-hotfix-1",
  "uptime": "2 hours"
}

DEPLOYMENT TIME: 5 minutos
Total downtime: 15 minutos (primera vez, incluye rollback)
Second deployment: 5 minutos
```

---

### Fase 11: VALIDACIÓN EN VIVO

**11:15 AM - Verificación en producción**

```
SMOKE TESTS (pruebas rápidas en PRODUCCIÓN):

Test 1: Excel Export
→ Crear factura de prueba
→ Descargar Excel
→ Abrir archivo
✓ FUNCIONA

Test 2: Dashboard
→ Cargar dashboard
→ Datos presentes
→ Performance: 1.8s
✓ FUNCIONA

Test 3: Usuarios reportando
→ "Excel funciona de nuevo!"
→ "Muchas gracias!"
✓ CONFIRMADO

Test 4: Monitoring
→ Sentry: 0 errores nuevos
→ Error rate: 0.12% (normal)
→ Response time: 156ms (normal)
✓ NORMAL

CONCLUSION: ✓ DEPLOY EXITOSO
```

---

### Fase 12: DOCUMENTACIÓN Y CIERRE

**11:30 AM - Documentar y cerrar**

```
CHANGELOG (ACTUALIZADO):

v1.2.1-hotfix-1 (14-03-2026, 11:10 AM)
======================================
### Fixed
- Excel export failing due to missing exceljs dependency
- Issue #TICKET-2026-0314-001

### Timeline
- 10:15 AM: Problem reported
- 10:30 AM: Rolled back to v1.2.0 (users restored)
- 10:35 AM: Created hotfix
- 10:55 AM: Regression testing passed
- 11:10 AM: Deployed to production
- 11:15 AM: Validated and confirmed working
- 11:30 AM: Issue closed

### Details
- Root cause: package.json missing exceljs in dependencies
- Fix: Restored exceljs to dependencies
- Impact: None (issue isolated to Excel export)
- Users affected: ~200
- SLA: Met (resolved in < 2 hours)
```

**Ticket actualizado:**

```
TICKET-2026-0314-001
====================================
Status: CLOSED ✓
Closed by: Developer (john@company.com)
Time to fix: 1 hour 15 minutes
Resolution: 
  - Root cause: Missing exceljs dependency in package.json
  - Action: Restored dependency and redeployed
  - Verification: All regression tests pass
  
Impact Assessment:
- Downtime: 15 minutes (including rollback)
- Users affected: 200
- Data lost: 0
- SLA: MET ✓

Post-Mortem scheduled: 14-03-2026 2:00 PM
Assigned to: Dev Lead
Duration: 30 minutes
Topics:
- ¿Por qué se olvidó dependency?
- ¿Cómo evitar en futuro?
- ¿Mejorar process?
```

**Comunicación a usuarios:**

```
Enviar email a todos los usuarios:

Asunto: Problema de Descarga Excel - RESUELTO

Estimados usuarios,

Queremos informarles que experimentaron un problema en la 
función de descarga de facturas en Excel entre las 10:15 AM 
y 11:30 AM.

Problema: No se podían descargar facturas en Excel
Causa: Problema técnico en actualización de sistema
Duración: 75 minutos
Estado Actual: ✓ RESUELTO

Pueden descargar facturas normalmente. Disculpen la molestia.

Para preguntas, contacten a soporte@empresa.com

Atentamente,
Equipo de Desarrollo
```

---

### Resumen de Hotfix

```
MÉTRICAS DEL INCIDENTE:

Time to Detect (TTD): 1 minuto
Time to Respond (TTR): 5 minutos
Time to Mitigate (TTM): 15 minutos (rollback)
Time to Fix (TTF): 1 hora 15 minutos
Time to Resolve (TTR): 1 hora 15 minutos

MTTR alcanzado: 35 minutos (meta: < 60 min) ✓

Usuarios impactados: 200
Data lost: 0
Severity: CRITICAL
Root cause: Dependency missing
Prevention: Better pre-deploy checks
```

---

---

## **10. EJEMPLO 2: MANTENIMIENTO ADAPTATIVO**

### Escenario
**Requisito:** El gobierno cambia la normativa de IVA de 16% a 18%. Debe estar vigente el próximo mes (15 de abril de 2026). Actualmente estamos a 14 de marzo.

Tenemos **32 días** para desarrollar e implementar.

---

### Fase 1: RECEPCIÓN DE SOLICITUD

**12 de marzo - Notificación del cambio**

```
Canal: Reunión con cliente / Regulador
Requerimiento: "A partir del 15 de abril, deben facturar con 18% IVA"
Actual: 16% está hardcodeado en código
Impacto: Todas las facturas de 15-04 en adelante
Deadline: 14 de abril (1 día antes para testing)

Solicitud creada:
- ID: TASK-2026-0312-001
- Título: Implementar cambio IVA 16% → 18%
- Tipo: Mantenimiento ADAPTATIVO
- Prioridad: ALTA
- Deadline: 14 de abril
```

---

### Fase 2: REGISTRO EN SISTEMA

```
TASK-2026-0312-001
====================================
Proyecto: Gestion de Facturas
Tipo: Mantenimiento Adaptativo
Categoría: Cambio Legal/Regulatorio
Título: Implementar aumento IVA 16% → 18%
Fecha Reporte: 12-03-2026
Deadline: 14-04-2026
Duración: 32 días

Descripción:
"A partir del 15 de abril de 2026, el IVA aumenta de 16% a 18%.
Sistema debe generar facturas con tasa correcta según fecha.

Requisitos:
1. Facturas antes 15-04: usar 16%
2. Facturas desde 15-04: usar 18%
3. No puede ser hardcodeado (será obsoleto)
4. Reportes correctos (separar por tasa)
5. Backward compatible (older invoices stay 16%)"

Estimación: 1 semana desarrollo + 1 semana testing
```

---

### Fase 3: CLASIFICACIÓN

```
CLASIFICACIÓN:

Tipo: Mantenimiento ADAPTATIVO (cambio regulatorio)
Criticidad: ALTA (obligatorio)
Complejidad: MEDIA (afecta múltiples áreas)
Riesgo: MEDIO (cambio importante, requiere testing)
Categoría: Funcionalidad -> Configuración -> Core

Impacto:
- Legal: CRÍTICO (requisito regulatorio)
- Negocio: ALTO (afecta todas las facturas futuras)
- Técnico: MEDIO (cambio importante pero controlado)
- Usuarios: ALTO (cambio visible en cada factura)
```

---

### Fase 4: ANÁLISIS DE IMPACTO

**13 de marzo - Análisis detallado**

```
ANÁLISIS DE IMPACTO TÉCNICO:

1. Dónde está hardcodeado el 16%?
   
   Búsqueda en código:
   backend/models/Invoice.js: const TAX_RATE = 0.16
   backend/controllers/invoice.controller.js: 0.16
   frontend/src/components/InvoiceForm.vue: 16% text
   
   Encontrado: 5 lugares con 16% hardcodeado

2. Dependencias afectadas:
   
   ✓ Invoice.js (modelo)
   ✓ invoice.controller.js (controlador)
   ✓ invoice.test.js (tests)
   ✓ Dashboard.vue (mostrar total con IVA)
   ✓ Excel export (incluir IVA)
   ✓ Reportes (totales por mes)
   ✓ BD (histórico con tasas viejas)

3. Datos a considerar:
   
   - Facturas creadas antes 15-04: 5,230
   - Facturas creadas 15-04+: 0 (future)
   - Reportes que usan IVA: 8
   - Usuarios que crean facturas: 45

4. Solución propuesta:
   
   ✗ NO: Cambiar contante a 0.18
     Razón: Facturas creadas antes de 15-04 usarían tasa equivocada
   
   ✓ SÍ: Crear tabla de configuración
     Razón: Permite tasas dinámicas según fecha
     Ventaja: Reutilizable para futuras tasas

SOLUCIÓN RECOMENDADA:
- Crear tabla: tax_configuration
- Migración de BD: Agregar fecha de efectividad
- Lógica: Consultar tasa según fecha
- Testing: Validar con fechas antes/después
```

---

### Fase 5: PLANIFICACIÓN

**13 de marzo - Plan de acción (32 días)**

```
TIMELINE:

SEMANA 1 (13-17 de marzo):
Lunes: Diseño de BD + Arquitectura
  - Crear diagrama de tabla tax_configuration
  - Definir API de cambios de tasas
  
Martes-Miércoles: Implementación backend
  - Crear tabla en BD
  - Crear migration
  - Actualizar models
  - Crear servicio de tasas dinámicas
  
Jueves-Viernes: Implementación frontend
  - Agregar componente admin de tasas
  - Actualizar vista de factura
  - Mostrar tasa dinámica

SEMANA 2 (20-24 de marzo):
- Testing unitario
- Testing de integración
- Testing E2E
- Validar histórico

SEMANA 3 (27-31 de marzo):
- User acceptance testing (con cliente)
- Bugfixes menores
- Performance testing
- Staging deployment

SEMANA 4 (1-7 de abril):
- Final validation
- Documentación
- Training de usuarios
- Plan de contingencia

Deployment: 14 de abril (véspera de cambio)
```

---

### Fase 6: DESARROLLO

**13 de marzo - Inicio de desarrollo**

```
PASO 1: Crear rama feature

$ git checkout -b feature/dynamic-tax-rates
$ git push origin feature/dynamic-tax-rates

PASO 2: Base de datos - Crear tabla de configuración

// migration/add_tax_configuration.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tax_configurations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tax_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: false
      },
      effective_to: {
        type: Sequelize.DATE,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Insertar tasas existentes
    await queryInterface.bulkInsert('tax_configurations', [
      {
        tax_name: 'IVA Estándar',
        tax_rate: 0.16,
        effective_from: '2024-01-01',
        effective_to: '2026-04-14'
      },
      {
        tax_name: 'IVA Estándar',
        tax_rate: 0.18,
        effective_from: '2026-04-15',
        effective_to: null
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tax_configurations');
  }
};

// Ejecutar migration
$ npm run migrate
```

**PASO 3: Crear modelo**

```javascript
// backend/models/TaxConfiguration.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaxConfiguration = sequelize.define('TaxConfiguration', {
  tax_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  effective_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  effective_to: {
    type: DataTypes.DATE
  },
  description: DataTypes.TEXT
}, {
  tableName: 'tax_configurations',
  timestamps: true
});

module.exports = TaxConfiguration;
```

**PASO 4: Crear servicio de tasas**

```javascript
// backend/services/tax.service.js

const TaxConfiguration = require('../models/TaxConfiguration');

const getTaxRateForDate = async (date) => {
  const taxConfig = await TaxConfiguration.findOne({
    where: {
      effective_from: { [Op.lte]: date },
      [Op.or]: [
        { effective_to: { [Op.gte]: date } },
        { effective_to: null }
      ]
    }
  });

  if (!taxConfig) {
    throw new Error(`No tax configuration found for date: ${date}`);
  }

  return parseFloat(taxConfig.tax_rate);
};

const calculateTax = async (amount, invoiceDate) => {
  const taxRate = await getTaxRateForDate(invoiceDate);
  return parseFloat((amount * taxRate).toFixed(2));
};

const calculateTotal = async (amount, taxAmount) => {
  return parseFloat((amount + taxAmount).toFixed(2));
};

module.exports = {
  getTaxRateForDate,
  calculateTax,
  calculateTotal
};
```

**PASO 5: Actualizar controlador**

```javascript
// backend/controllers/invoice.controller.js
const taxService = require('../services/tax.service');

exports.createInvoice = async (req, res) => {
  try {
    const { amount, date, ...rest } = req.body;

    // Obtener tasa dinámicamente
    const taxRate = await taxService.getTaxRateForDate(date || new Date());
    const tax = await taxService.calculateTax(amount, date || new Date());
    const total = await taxService.calculateTotal(amount, tax);

    const invoice = await Invoice.create({
      ...rest,
      amount,
      tax,
      total,
      tax_rate: taxRate,  // Guardar tasa usada
      date: date || new Date()
    });

    // Log auditoría
    await logAudit('INVOICE_CREATED', req.user.id, {
      invoiceId: invoice.id,
      tax_rate: taxRate
    });

    res.status(201).json({
      success: true,
      invoice,
      message: `Invoice created with ${(taxRate * 100).toFixed(0)}% IVA`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**PASO 6: Actualizar frontend**

```vue
<!-- frontend/src/components/InvoiceForm.vue -->

<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label>Amount:</label>
      <input v-model="form.amount" type="number" required />
    </div>

    <div class="form-group">
      <label>Date:</label>
      <input v-model="form.date" type="date" required />
    </div>

    <!-- Mostrar tasa dinámica -->
    <div class="tax-info">
      <p>Tax Rate: <strong>{{ currentTaxRate }}%</strong></p>
      <p>Tax Amount: <strong>${{ calculatedTax }}</strong></p>
      <p>Total: <strong>${{ calculatedTotal }}</strong></p>
    </div>

    <button type="submit">Create Invoice</button>
  </form>
</template>

<script>
import taxService from '@/services/tax.service';

export default {
  data() {
    return {
      form: {
        amount: '',
        date: new Date().toISOString().split('T')[0]
      },
      currentTaxRate: 16,
      calculatedTax: 0,
      calculatedTotal: 0
    };
  },
  watch: {
    'form.date': 'updateTaxRate',
    'form.amount': 'updateTaxRate'
  },
  methods: {
    async updateTaxRate() {
      if (!this.form.date || !this.form.amount) return;

      try {
        const response = await this.$http.post('/api/tax/calculate', {
          amount: this.form.amount,
          date: this.form.date
        });

        this.currentTaxRate = response.data.taxRate * 100;
        this.calculatedTax = response.data.tax;
        this.calculatedTotal = response.data.total;
      } catch (error) {
        console.error('Error calculating tax:', error);
      }
    },
    async submitForm() {
      // Crear factura con tasa correcta
      const response = await this.$http.post('/api/invoices', this.form);
      this.$emit('success', response.data.invoice);
    }
  }
};
</script>
```

---

### Fase 7: PRUEBAS EN STAGING

**20 de marzo - Testing exhaustivo**

```javascript
// Tests unitarios
// backend/tests/unit/tax.service.test.js

describe('Tax Service', () => {
  test('Tax rate for date before 15-04 should be 16%', async () => {
    const rate = await taxService.getTaxRateForDate(new Date('2026-04-14'));
    expect(rate).toBe(0.16);
  });

  test('Tax rate for date on 15-04 should be 18%', async () => {
    const rate = await taxService.getTaxRateForDate(new Date('2026-04-15'));
    expect(rate).toBe(0.18);
  });

  test('Tax rate for date after 15-04 should be 18%', async () => {
    const rate = await taxService.getTaxRateForDate(new Date('2026-05-01'));
    expect(rate).toBe(0.18);
  });

  test('Calculate tax correctly with date before 15-04', async () => {
    const tax = await taxService.calculateTax(100, new Date('2026-04-14'));
    expect(tax).toBe(16);  // 100 * 0.16
  });

  test('Calculate tax correctly with date after 15-04', async () => {
    const tax = await taxService.calculateTax(100, new Date('2026-04-15'));
    expect(tax).toBe(18);  // 100 * 0.18
  });

  test('Invoices created before 15-04 keep 16%', async () => {
    const invoice = await Invoice.create({
      date: new Date('2026-04-14'),
      amount: 1000,
      tax_rate: 0.16
    });
    expect(invoice.tax_rate).toBe(0.16);
  });

  test('Invoices created after 15-04 have 18%', async () => {
    const invoice = await Invoice.create({
      date: new Date('2026-04-15'),
      amount: 1000,
      tax_rate: 0.18
    });
    expect(invoice.tax_rate).toBe(0.18);
  });
});

// Ejecutar tests
$ npm test -- tax.service.test.js

Result:
✓ 8 tests passed

Test coverage:
✓ Tax service: 100%
✓ Invoice controller: 95%
✓ All critical paths: COVERED
```

```javascript
// Pruebas de integración
// backend/tests/integration/invoice-tax.integration.test.js

describe('Invoice Tax Integration', () => {
  test('Create invoice before 15-04 should have 16% tax', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        number: 'INV-001',
        amount: 1000,
        date: '2026-04-14'
      });

    expect(response.status).toBe(201);
    expect(response.body.invoice.tax_rate).toBe(0.16);
    expect(response.body.invoice.tax).toBe(160);
    expect(response.body.invoice.total).toBe(1160);
  });

  test('Create invoice after 15-04 should have 18% tax', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        number: 'INV-002',
        amount: 1000,
        date: '2026-04-15'
      });

    expect(response.status).toBe(201);
    expect(response.body.invoice.tax_rate).toBe(0.18);
    expect(response.body.invoice.tax).toBe(180);
    expect(response.body.invoice.total).toBe(1180);
  });

  test('Report should separate by tax rate', async () => {
    const response = await request(app)
      .get('/api/reports/invoices-by-tax?month=4&year=2026')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.summary).toHaveProperty('tax_16_percent');
    expect(response.body.summary).toHaveProperty('tax_18_percent');
  });

  test('Excel export should show correct tax rate', async () => {
    const response = await request(app)
      .post('/api/invoices/export-excel')
      .set('Authorization', `Bearer ${token}`)
      .send({ invoiceIds: [1, 2] });

    expect(response.status).toBe(200);
    // Validar archivo generado contiene tasas correctas
  });
});

// Ejecutar
$ npm test -- invoice-tax.integration.test.js

Result:
✓ 4 integration tests passed
```

---

### Fase 8: PRUEBAS DE REGRESIÓN

**24 de marzo - Validar histórico y funcionalidades previas**

```
CHECKLIST DE REGRESIÓN:

✓ Facturas antiguas no cambian:
  - Factura creada el 10-03-2026: mantiene 16%
  - Factura creada el 01-02-2026: mantiene 16%
  - Sistema no recalcula retroactivamente

✓ Reportes correctos:
  - Reporte de marzo: solo 16%
  - Reporte de abril: 16% (hasta 14) + 18% (desde 15)
  - Totales concuerdan con facturas individuales

✓ Búsqueda funciona:
  - Buscar facturas por fecha: correcto
  - Filtros: siguen funcionando
  - Totales: calculan correcto

✓ Exportaciones:
  - Excel: muestra tasas correctas
  - PDF: muestra tasas correctas
  - CSV: muestra datos correctos

✓ Funcionalidades no afectadas:
  - Crear usuario: OK
  - Autenticación: OK
  - Dashboard: OK (actualizado con tasas)
  - Presupuestos: OK (no usan IVA)

✓ Performance:
  - Queries siguen rápidas
  - No hay slowdowns nuevos
  - Dashboard aún carga en 1.8s

✓ Seguridad:
  - No hay SQL injection
  - Authorization sigue validándo
  - Audit logs correctos

RESULTADO: ✓ TODOS LOS TESTS PASAN
Cobertura de regresión: 100%
```

---

### Fase 9: APROBACIÓN

**27 de marzo - Aprobación formal**

```
APPROVAL BOARD MEETING:

Asistentes:
- Senior Developer (Lead)
- QA Manager
- Product Manager
- Cliente representante

PRESENTACIÓN:
"Hemos implementado el cambio de IVA dinámico.
Sistema puede soportar múltiples tasas según fecha.
32 tests pass, 0 failures.
Histórico intacto, 5,230 facturas antiguas mantienen 16%."

REVISIÓN TÉCNICA:
☐ Code review: Código limpio, sigue estándares
☐ Tests: 100% coverage de paths críticos
☐ Regresión: Todas las funcionalidades intactas
☐ Performance: Sin degradación
☐ Security: Validaciones intactas

REVISIÓN FUNCIONAL:
☐ Requirements: Todos cumplidos
☐ User story: Implementado según especificación
☐ Edge cases: Manejados (24hs antes del cambio, etc)
☐ Training: Plan de usuario completado

APROBACIÓN FINAL:
✓ TECHNICAL: APPROVED
✓ FUNCTIONAL: APPROVED
✓ BUSINESS: APPROVED

DECISION: PROCEDER AL DEPLOY
Fecha objetivo: 14 de abril
Ventana de deploy: 2:00 AM - 6:00 AM (bajo tráfico)
```

---

### Fase 10: DESPLIEGUE EN PRODUCCIÓN

**14 de abril - Deploy día anterior al cambio**

```bash
# PLAN DE DEPLOY:
Ventana: 2:00 AM - 6:00 AM (12 usuarios típicos)
Rollback: Disponible (rama anterior v1.2.0)
Validación: 30 minutos post-deploy

# PASOS:

1. Crear etiqueta de release (1:50 AM)
$ git tag -a v1.3.0 -m "Dynamic IVA tax rates"
$ git push origin v1.3.0

2. Aplicar migration (1:55 AM)
$ npm run migrate:latest
✓ tax_configurations table creada
✓ Data poblada (16% y 18%)

3. Compilar y pushear imagen Docker (2:00 AM)
$ docker build -t gestion-facturas:v1.3.0 .
$ docker push registry/gestion-facturas:v1.3.0
Build time: 3 minutos

4. Deploy a Railway (2:05 AM)
$ git push origin main
→ Webhook dispara deployment automático
→ Container inicia
→ Health tests validan

5. Smoke Tests (2:15 AM)
$ npm test:smoke

✓ Dashboard carga
✓ Crear factura con 18%
✓ Ver factura antigua con 16%
✓ Exportar a Excel
✓ Reportes funcionan

6. Validar BD (2:25 AM)
SELECT COUNT(*) FROM invoices WHERE date < '2026-04-15'
→ 5,230 sin cambios, todos con tax_rate = 0.16

SELECT COUNT(*) FROM invoices WHERE date >= '2026-04-15'
→ 0 (aún no hay)

7. Monitoreo intenso (hasta 6:00 AM)
$ tail -f logs
$ watch Sentry dashboard
$ watch performance metrics

Resultsado:
✓ 0 errors
✓ Performance normal
✓ All validations pass

DEPLOY COMPLETADO: 2:35 AM
Total downtime: 0 minutos (zero-downtime deployment)
Status: ✓ EXITOSO
```

---

### Fase 11: VALIDACIÓN EN VIVO

**15 de abril - Primer día con nueva tasa**

```
VALIDACIÓN EN VIVO:

Test 1: Crear factura con 18%
→ Fecha: 15-04-2026
→ Monto: $1000
→ Esperado: IVA = $180, Total = $1180
✓ CORRECTO

Test 2: Ver factura antigua con 16%
→ Fecha: 14-04-2026
→ Monto: $1000
→ Factura histórica: IVA = $160, Total = $1160
✓ CORRECTO (sin cambios retroactivos)

Test 3: Reporte de abril muestra ambas tasas
→ Abril 1-14: $50,000 base, $8,000 IVA (16%)
→ Abril 15-30: $30,000 base, $5,400 IVA (18%)
→ Total mes: $80,000 base, $13,400 IVA
✓ CORRECTO

Test 4: Usuario recibe notificación
→ "El sistema ahora usa 18% IVA desde 15 de abril"
✓ Notificado

Test 5: Performance
→ Dashboard: 1.8s (igual)
→ Response time: 155ms (igual)
→ Error rate: 0.12% (normal)
✓ PERFORMANCE NORMAL

USUARIOS FEEDBACK:
"Facturas muestran 18%, se ve correctamente"
"Reportes separados por tasa, muy claro"
"Sin problemas de funcionalidad"
✓ USER SATISFACTION

MONITORING:
→ Sentry: 0 errores
→ Datadog: Métricas normales
→ Logs: Sin warnings críticos
✓ SISTEMA SALUDABLE
```

---

### Fase 12: DOCUMENTACIÓN Y CIERRE

**16-20 de abril - Documentar y cerrar**

```
ACTUALIZAR DOCUMENTACIÓN:

1. CHANGELOG
v1.3.0 (14-04-2026)
==================
### Features
- Add dynamic tax rate configuration
- Support for multiple IVA rates based on invoice date
- New tax_configurations table

### Technical
- Created TaxConfiguration model
- Added tax.service.js with calculation logic
- Invoice model updated to store tax_rate
- Tax calculation moved to service pattern

### Migration
- Migration file: add_tax_configuration.js
- Pre-populated with 16% (until 15-04) and 18% (from 15-04)

### Testing
- Added 8 unit tests for tax service
- Added 4 integration tests for tax functionality
- 100% code coverage for critical paths

### Breaking Changes
None - fully backward compatible

Upgrading:
1. Pull latest code
2. Run: npm run migrate:latest
3. Restart application
4. No user action required
```

2. API DOCUMENTATION

```markdown
# Tax Configuration API

## GET /api/tax/config
Get all tax configurations

Response:
{
  "configurations": [
    {
      "id": 1,
      "tax_name": "IVA Estándar",
      "tax_rate": 0.16,
      "effective_from": "2024-01-01",
      "effective_to": "2026-04-14"
    },
    {
      "id": 2,
      "tax_name": "IVA Estándar",
      "tax_rate": 0.18,
      "effective_from": "2026-04-15",
      "effective_to": null
    }
  ]
}

## POST /api/tax/calculate
Calculate tax for given amount and date

Body:
{
  "amount": 1000,
  "date": "2026-04-15"
}

Response:
{
  "amount": 1000,
  "tax_rate": 0.18,
  "tax": 180,
  "total": 1180
}

## Admin: Add new tax rate
POST /api/admin/tax-config (requires admin role)

Body:
{
  "tax_name": "IVA Reducido",
  "tax_rate": 0.07,
  "effective_from": "2026-06-01",
  "effective_to": null
}
```

3. USER GUIDE

```
Como Usuario: No hay cambios en cómo usar la app

Como Admin: Opción nueva en Configuración
- Ir a: Settings → Tax Configuration
- Ver historial de tasas
- Agregar nueva tasa (si es necesario en futuro)
- Editable solo por admin

La aplicación automáticamente usa la tasa correcta 
según la fecha de la factura. No necesita hacer nada.

Ejemplo:
- Crear factura 14-04: Automáticamente 16%
- Crear factura 15-04: Automáticamente 18%
```

4. POST-MORTEM (Análisis de la implementación)

```
POST-MORTEM: Implementación de IVA Dinámico
===========================================

Fecha: 16 de abril
Conducido por: Tech Lead

ANÁLISIS:

¿Qué salió bien?
✓ Implementación completada a tiempo (32 días)
✓ Zero downtime deployment
✓ Cero data loss
✓ Retrocompatibilidad perfecta
✓ 100% test coverage
✓ Usuario feedback positivo
✓ Perf metrics sin degradación

¿Qué fue difícil?
- Decidir entre hardcode vs dinámico (acertamos dinámico)
- Testing de casos edge (fechas límites)
- Coordinación con regulatory requirement

¿Lecciones aprendidas?
- Cambios regulatorios requieren planificación anticipada
- Dynamic configurations > hardcoded values
- Testing es crítico para datos financieros
- Comunicación temprana con users evita sorpresas

¿Si lo hacemos de nuevo?
- Mismo proceso (probado)
- Más tiempo de staging (pero innecesario)
- Mejor documentación pre-launch (minor)

RECOMENDACIONES FUTURAS:
- Crear genérico "tax-configuration" system para otros impuestos
- Prepararse para cambios anuales (calendario)
- Alertas cuando tasa vence (30 días antes)
```

5. CIERRE DE TASK

```
TASK-2026-0312-001
====================================
Status: CLOSED ✓
Closed date: 16-04-2026
Closed by: Tech Lead (john@company.com)

Summary:
"Successfully implemented dynamic IVA tax rate system.
Supports 16% until 14-04-2026 and 18% from 15-04-2026.
Fully backward compatible with existing invoices.
Zero downtime deployment on 14-04-2026."

Results:
- Requirement: COMPLETE ✓
- Deadline: MET (14-04, deployed) ✓
- Quality: HIGH (100% test coverage) ✓
- Users: SATISFIED (positive feedback) ✓
- Performance: UNAFFECTED (same metrics) ✓

Effort:
- Estimated: 1 week dev + 1 week test
- Actual: 6 days dev + 4 days test
- Under budget: YES
- On time: YES

Artifacts:
- Code: feature/dynamic-tax-rates merged to main
- Tests: 12 tests added (8 unit, 4 integration)
- Docs: API docs + User guide + Post-mortem
- Deployment: v1.3.0 released, no issues

LESSON LEARNED:
Proactive approach to regulatory changes beats reactive.
This prepared us for future changes.
```

6. COMUNICACIÓN FINAL A USUARIOS

```
Email a todos los usuarios:

Asunto: Sistema Actualizado - Cambio IVA a 18% (Efectivo 15-04)

Estimados usuarios,

Para cumplir con los nuevos requisitos regulatorios, 
nuestro sistema ahora soporta IVA dinámico.

QUÉ CAMBIÓ:
✓ Facturas creadas desde el 15 de abril: 18% IVA
✓ Facturas anteriores: Mantienen sus tasas originales (16%)
✓ Todo es automático - No necesita hacer nada

LA BUENA NOTICIA:
- No hay cambios en cómo usa la aplicación
- Sistema maneja todo automáticamente
- Reportes separados por tasa para claridad
- Facturación sigue exacto

PREGUNTAS?
Contacte soporte@empresa.com

Atentamente,
Sistema de Gestión de Facturas
```

---

### Resumen de Adaptativo

```
MÉTRICAS DE IMPLEMENTACIÓN:

Planning: 32 días
Development: 6 días
Testing: 4 días
Buffer: 16 días
Dead: 6 días (testing staging)

Test Coverage: 100% (critical paths)
Code Review: Approved
UAT: Successful
Deployment: Zero downtime

Defects encontrados:
- En testing: 2 (ambos fixed antes de deploy)
- En producción: 0

Users impacted: 45 (positivamente)
Data integrity: 100%
Regulatory compliance: ✓ MET

Conclusion: ÉXITO TOTAL
Sistema preparado para futuros cambios tributarios.
```

---

## **CONCLUSIONES**

Este documento proporciona un framework completo para mantenimiento de la aplicación Gestion de Facturas:

✓ **Procedimientos claros** desde recepción hasta cierre
✓ **Responsabilidades definidas** por rol
✓ **Ejemplos reales** de hotfix y adaptativo
✓ **Métricas y KPIs** para evaluar éxito
✓ **Periodicidad establecida** para revisiones
✓ **Plan de backup** con RTO/RPO definibles
✓ **Seguridad** como prioridad transversal
✓ **Testing** exhaustivo en todas las fases

La aplicación está lista para mantenimiento profesional a escala empresarial.

---

**Documento preparado:** 14 de marzo de 2026  
**Versión:** 1.0  
**Válido por:** 1 año (hasta 14 de marzo de 2027)  
**Revisar:** Mensualmente en reunión de planning
