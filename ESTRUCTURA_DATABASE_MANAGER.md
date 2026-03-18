# 🗄️ MÓDULO GESTOR DE BASE DE DATOS
## Sistema de Gestión de Facturas v1.5 (Planeado)

**Propósito:** Panel de administración completo para gestionar tablas, esquemas, datos y backups de la base de datos

**Estado:** 🔵 ESPECIFICACIÓN COMPLETA  
**Complejidad:** 🟠 ALTA (80-120 horas)  
**Fecha Creación:** 18 de Marzo de 2026  
**Acceso:** Solo usuarios ADMIN

---

## 1. DESCRIPCIÓN GENERAL

### Características Principales

- ✅ **Operaciones de Tablas:** Ver, crear, modificar, eliminar
- ✅ **Gestor Visual:** Editor visual de esquema con arrastrador
- ✅ **Editor SQL:** Ejecutar consultas SQL directas
- ✅ **Visor de Datos:** Con paginación, búsqueda y filtros
- ✅ **Gestión de Índices:** Crear, listar, eliminar índices
- ✅ **Relaciones:** Ver y gestionar foreign keys
- ✅ **Backups:** Crear, restaurar, descargar snapshots
- ✅ **Import/Export:** CSV, JSON, SQL
- ✅ **Versionado:** Historial de cambios en esquema
- ✅ **Auditoría:** Log completo de todas las operaciones
- ✅ **Migrations:** Generar migrations automáticas
- ✅ **Testeo:** Simular cambios antes de aplicar

---

## 2. MODELO DE DATOS

### 2.1 Tabla: `database_schemas`

```sql
CREATE TABLE database_schemas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  version INT NOT NULL,
  tableName VARCHAR(100) NOT NULL,
  definition JSON NOT NULL,
  
  -- Metadatos
  description TEXT,
  indexes JSON,
  foreignKeys JSON,
  
  -- Control
  isActive BOOLEAN DEFAULT true,
  isDraft BOOLEAN DEFAULT false,
  
  -- Auditoría
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  appliedAt TIMESTAMP NULL,
  appliedBy INT NULL,
  
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (appliedBy) REFERENCES users(id),
  INDEX (tableName),
  INDEX (version),
  UNIQUE KEY unique_version (tableName, version)
);
```

### 2.2 Tabla: `database_audits`

```sql
CREATE TABLE database_audits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tableName VARCHAR(100) NOT NULL,
  
  -- Tipo de operación
  operation ENUM('CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'DELETE', 'BACKUP', 'RESTORE') NOT NULL,
  
  -- Detalles
  queryExecuted LONGTEXT,
  recordsAffected INT,
  executionTime DECIMAL(10,3),
  errorMessage TEXT NULL,
  
  -- Cambios
  oldDefinition JSON NULL,
  newDefinition JSON NULL,
  
  -- Usuario
  performedBy INT NOT NULL,
  performedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Estado
  status ENUM('SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK') DEFAULT 'SUCCESS',
  
  FOREIGN KEY (performedBy) REFERENCES users(id),
  INDEX (tableName),
  INDEX (operation),
  INDEX (performedAt),
  INDEX (status)
);
```

### 2.3 Tabla: `database_backups`

```sql
CREATE TABLE database_backups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backupName VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Tipo
  backupType ENUM('FULL', 'INCREMENTAL', 'SCHEMA_ONLY', 'DATA_ONLY') NOT NULL,
  
  -- Contenido
  tablesIncluded JSON,
  backupSize BIGINT,
  fileLocation VARCHAR(255),
  compressedFilePath VARCHAR(255),
  
  -- Metadatos
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL,
  
  -- Control
  isEncrypted BOOLEAN DEFAULT true,
  isVerified BOOLEAN DEFAULT false,
  verifiedAt TIMESTAMP NULL,
  
  FOREIGN KEY (createdBy) REFERENCES users(id),
  INDEX (createdAt),
  INDEX (backupType)
);
```

### 2.4 Tabla: `database_migrations`

```sql
CREATE TABLE database_migrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  migrationName VARCHAR(100) NOT NULL UNIQUE,
  migrationContent LONGTEXT NOT NULL,
  
  -- Estado
  status ENUM('PENDING', 'EXECUTED', 'ROLLED_BACK', 'FAILED') DEFAULT 'PENDING',
  
  -- Ejecución
  executedAt TIMESTAMP NULL,
  rollbackAt TIMESTAMP NULL,
  
  -- Usuario
  createdBy INT NOT NULL,
  executedBy INT NULL,
  
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (executedBy) REFERENCES users(id),
  INDEX (status),
  INDEX (migrationName)
);
```

### 2.5 Tabla: `database_query_logs`

```sql
CREATE TABLE database_query_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  query LONGTEXT NOT NULL,
  executionTimeMs DECIMAL(10,3),
  rowsReturned INT,
  
  -- Tipo
  queryType ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALTER', 'CREATE', 'DROP') NOT NULL,
  
  -- Usuario
  executedBy INT NOT NULL,
  executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Estado
  status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
  errorMessage TEXT NULL,
  
  FOREIGN KEY (executedBy) REFERENCES users(id),
  INDEX (queryType),
  INDEX (executedAt)
);
```

---

## 3. BACKEND

### 3.1 Service: `database.service.js`

**Métodos principales:**

```javascript
// Tablas
getAllTables()
getTableSchema(tableName)
createTable(definition)
alterTable(tableName, changes)
dropTable(tableName)
truncateTable(tableName)

// Datos
getTableData(tableName, page, limit, filters)
insertRow(tableName, data)
updateRow(tableName, id, data)
deleteRow(tableName, id)
searchTable(tableName, query)
exportTable(tableName, format) // CSV, JSON, SQL

// Índices
getIndexes(tableName)
createIndex(tableName, indexDef)
dropIndex(tableName, indexName)

// Foreign Keys
getForeignKeys(tableName)
addForeignKey(tableName, fkDef)
dropForeignKey(tableName, fkName)

// Backups
createBackup(config)
restoreBackup(backupId)
listBackups()
deleteBackup(backupId)
downloadBackup(backupId)
verifyBackup(backupId)

// Migrations
generateMigration(tableName, changes)
executeMigration(migrationId)
rollbackMigration(migrationId)
listMigrations()

// Auditoría
getAuditLog(filters)
getQueryLog()

// Versionado
getVersionHistory(tableName)
compareVersions(tableName, v1, v2)
rollbackToVersion(tableName, version)

// SQL
executeSqlQuery(query, isDraft)
validateSqlSyntax(query)
explainQuery(query)
```

### 3.2 Controller: `database.controller.js`

- 30+ endpoints
- Validaciones ADMIN-only
- Error handling completo
- Logging de auditoría

### 3.3 Middleware: `database.validator.js`

- Validación de nombres de tablas
- Validación de tipo de datos
- Validación de queries SQL
- Prevención de inyección SQL

### 3.4 Routes: `database.routes.js`

```
GET    /api/database/tables                  # Listar tablas
GET    /api/database/tables/:name            # Esquema tabla
GET    /api/database/tables/:name/data       # Datos con paginación
POST   /api/database/tables                  # Crear tabla
PUT    /api/database/tables/:name            # Modificar tabla
DELETE /api/database/tables/:name            # Eliminar tabla
POST   /api/database/tables/:name/truncate   # Vaciar tabla

# Operaciones CRUD en datos
POST   /api/database/tables/:name/rows       # Insertar fila
PUT    /api/database/tables/:name/rows/:id   # Actualizar fila
DELETE /api/database/tables/:name/rows/:id   # Eliminar fila

# Índices
GET    /api/database/tables/:name/indexes    # Listar índices
POST   /api/database/tables/:name/indexes    # Crear índice
DELETE /api/database/tables/:name/indexes/:indexName

# Foreign Keys
GET    /api/database/tables/:name/foreign-keys
POST   /api/database/tables/:name/foreign-keys
DELETE /api/database/tables/:name/foreign-keys/:fkName

# Backups
GET    /api/database/backups                 # Listar
POST   /api/database/backups                 # Crear
GET    /api/database/backups/:id             # Descargar
POST   /api/database/backups/:id/restore     # Restaurar
DELETE /api/database/backups/:id             # Eliminar

# Migrations
GET    /api/database/migrations              # Listar
POST   /api/database/migrations              # Generar
POST   /api/database/migrations/:id/execute  # Ejecutar
POST   /api/database/migrations/:id/rollback # Revertir

# SQL
POST   /api/database/sql/execute             # Ejecutar
POST   /api/database/sql/validate            # Validar
POST   /api/database/sql/explain             # Analizar

# Auditoría
GET    /api/database/audit                   # Log auditoría
GET    /api/database/query-logs              # Log queries

# Versionado
GET    /api/database/tables/:name/versions   # Historial
GET    /api/database/tables/:name/versions/:v1/compare/:v2
POST   /api/database/tables/:name/versions/:version/restore
```

---

## 4. FRONTEND

### 4.1 Componentes Vue3 (8 componentes)

1. **DatabaseManagerPanel.vue** (Principal)
   - Menú lateral con navegación
   - Área principal de contenido
   - Header con opciones

2. **TablesViewer.vue** (Listado)
   - Grid de todas las tablas
   - búsqueda y filtros
   - Acciones rápidas

3. **TableSchemaEditor.vue** (Editor Visual)
   - Árbol de columnas
   - Tipo de datos con dropdown
   - Constraints (NOT NULL, DEFAULT, etc)
   - Arrastrador para reordenar

4. **TableDataViewer.vue** (Visualizador de Datos)
   - Tabla paginada
   - Búsqueda y filtros por columna
   - Sorting
   - Acciones (editar, eliminar)

5. **SqlEditor.vue** (Editor SQL)
   - Syntax highlighting
   - Auto-complete
   - Ejecución de queries
   - Resultados en tabla

6. **BackupManager.vue** (Gestión de Backups)
   - Listar backups
   - Crear backup
   - Restaurar
   - Descargar
   - Predicción de tamaño

7. **MigrationGenerator.vue** (Generador de Migrations)
   - Comparar versiones
   - Generar migration
   - Preview de cambios
   - Historia de migrations

8. **AuditLog.vue** (Auditoría)
   - Timeline de cambios
   - Filtros por usuario/tabla/operación
   - Detalles de cada cambio
   - Rollback a versión anterior

### 4.2 Pinia Store: `database.store.js`

**State:**
- `tables` - Listado de tablas
- `selectedTable` - Tabla actual
- `tableData` - Datos paginados
- `schemas` - Definiciones
- `backups` - Backups disponibles
- `logs` - Auditoría

**Actions:** 30+

### 4.3 Service: `database.service.js`

Métodos correspondientes a endpoints backend

---

## 5. CARACTERÍSTICAS DETALLADAS

### 5.1 Operaciones de Tablas

- ✅ Crear tabla con columnas configurables
- ✅ Tipos soportados: INT, VARCHAR, TEXT, DECIMAL, DATE, TIMESTAMP, BOOLEAN, JSON, ENUM
- ✅ Constraints: PRIMARY KEY, UNIQUE, NOT NULL, DEFAULT, CHECK
- ✅ Modificar estructura (agregar/eliminar/renombrar columnas)
- ✅ Eliminar tabla con confirmación

### 5.2 Gestor de Datos

- ✅ Visualización paginada (10/25/50/100 registros)
- ✅ Búsqueda full-text en columnas seleccionadas
- ✅ Filtros avanzados (rango, opciones, null/not null)
- ✅ Ordenamiento por columna
- ✅ Insert/Update/Delete de filas
- ✅ Validación de tipos antes de guardar

### 5.3 Índices y Relaciones

- ✅ Crear índices simples y compuestos
- ✅ Tipos: NORMAL, UNIQUE, FULLTEXT, SPATIAL
- ✅ Gestionar foreign keys
- ✅ Visualización de relaciones (diagrama)
- ✅ Cascade/Restrict options

### 5.4 Backup & Recovery

- ✅ Backup completo: estructura + datos
- ✅ Backup schema-only
- ✅ Backup data-only
- ✅ Seleccionar tablas específicas
- ✅ Compresión (GZIP)
- ✅ Encriptación (AES-256)
- ✅ Verificación de integridad
- ✅ Historial con timestamps
- ✅ Descarga en SQL, CSV, JSON

### 5.5 Import/Export

**Formatos soportados:**
- SQL dump
- CSV (con opciones de delimitador)
- JSON (array o objetos)
- Excel (via csv)

**Validaciones:**
- Detección de duplicados
- Validación de tipos
- Prevención de constraint violations

### 5.6 Versionado de Schema

- ✅ Histórico de versiones automático
- ✅ Comparación visual entre versiones
- ✅ Timeline de cambios
- ✅ Detalles: quién, cuándo, qué cambió
- ✅ Rollback a cualquier versión anterior

### 5.7 Auditoría Completa

**Registro de:**
- Toda operación DDL (CREATE, ALTER, DROP)
- Toda operación DML (INSERT, UPDATE, DELETE)
- Queries ejecutadas en SQL editor
- Backups/restores
- Migrations aplicadas
- Quién ejecutó, cuándo, query exacta
- Tiempo de ejecución
- Estado (success/failed)
- Error messages

### 5.8 Migrations Automáticas

- ✅ Detectar cambios en schema
- ✅ Generar archivo migration automático
- ✅ Formato Sequelize
- ✅ Up/down scripts
- ✅ Validación antes de ejecutar
- ✅ Rollback disponible

### 5.9 SQL Editor

- ✅ Syntax highlighting
- ✅ Auto-complete (tablas, columnas)
- ✅ Validación de sintaxis
- ✅ Preview de resultados
- ✅ EXPLAIN PLAN
- ✅ Historial de queries
- ✅ Modo draft para testing

### 5.10 Testing de Cambios

- ✅ Modo draft: ejecutar en transacción
- ✅ Rollback automático
- ✅ Preview de cambios
- ✅ Validación de impacto
- ✅ Estimación de downtime

---

## 6. SEGURIDAD Y RESTRICCIONES

### Permisos
- ✅ Solo usuarios con role ADMIN
- ✅ Auditoría obligatoria de todas las operaciones
- ✅ Confirmación en operaciones críticas (DROP, truncate)

### Validaciones
- ✅ Prevención de inyección SQL
- ✅ Nombres de tabla/columna sanitizados
- ✅ Tipo de datos validados
- ✅ Constraints validados
- ✅ Queries validadas

### Restricciones
- ✅ No permitir cambios en tablas del sistema (users, audit)
- ✅ Backups encriptados
- ✅ Limit de queries por minuto
- ✅ Timeout en queries largas (30s)
- ✅ Máximo de registros en viewer (100k)

---

## 7. TESTS

### Backend (12 suites)
- getAllTables
- getTableSchema
- createTable
- alterTable
- Operaciones de datos
- Backups
- Migrations
- Auditoría

### Frontend (10 suites)
- Rendering componentes
- Crear tabla
- Editar datos
- Backup/restore
- Migration generation
- Error handling

### E2E (25 casos)
- Flujo completo CRUD
- Validaciones
- Backups y restauración
- Migrations
- Permisos y seguridad
- Performance

---

## 8. ESTIMACIÓN DE ESFUERZO

| Tarea | Horas | Dev |
|---|:---:|---|
| Backend (services, controllers, routes) | 20 | Senior BE |
| Frontend (8 componentes + store) | 30 | Sr FE |
| BD (migrations, seeders) | 5 | DBA |
| Tests | 15 | QA |
| Documentación | 5 | Tech Lead |
| **TOTAL** | **75h** | **1-2 devs** |

**Timeline:** 2 semanas (fulltime) o 4 semanas (part-time)

---

## 9. ROADMAP FUTURO

**v1.5.1:**
- Replicación de BD
- Connection pooling
- Query optimization suggestions

**v1.5.2:**
- Multi-BD support
- Stored procedures
- Triggers management

**v1.6:**
- Dashboard de performance
- Slow query analyzer
- Auto-vaccum scheduler

---

Especificación completa lista. ¿Procedo a generar los 4 en orden? 🚀

- 1️⃣ Archivos backend
- 2️⃣ Archivos frontend
- 3️⃣ Migrations + seeders
- 4️⃣ Tests

