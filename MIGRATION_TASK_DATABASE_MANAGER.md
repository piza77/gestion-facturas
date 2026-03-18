# 🚀 DATABASE MANAGER - TAREA DE MIGRACIÓN

**Fecha:** 18 de marzo de 2026  
**Versión:** 1.0  
**Estado:** ✅ LISTA PARA DESPLEGAR

---

## 📋 RESUMEN

Este documento describe los pasos para desplegar el módulo **Database Manager v1.0** en cualquier ambiente (desarrollo, staging, producción). 

**Tiempo estimado:** 5-10 minutos  
**Requisitos:** Node.js 16+, MySQL 8.0+, npm  
**Riesgo:** BAJO - No modifica datos existentes, solo agrega nuevas tablas  

---

## 🔍 VERIFICACIÓN PRE-MIGRACIÓN

Antes de ejecutar la migración, verificar:

### 1. Base de datos existente
```bash
# Conectar a MySQL
mysql -h <host> -u <user> -p <database>

# Listar tablas actuales
SHOW TABLES;

# Verificar que users table existe
DESCRIBE users;
```

**Resultado esperado:** Debe existir la tabla `users` con columna `id` de tipo `CHAR(36)`

### 2. Conexión a la base de datos
```bash
# En backend/
npm test test-status.js
```

**Resultado esperado:** Conexión exitosa ✓

### 3. Dependencias instaladas
```bash
# Verificar mysql2 instalado
npm list mysql2

# Resultado: mysql2@^3.6.5 o superior
```

---

## 🔧 INSTALACIÓN - PASO 1: EJECUTAR MIGRACIONES

### En Desarrollo (Local)

```bash
# 1. Ir al directorio backend
cd backend

# 2. Ejecutar la migración
npm run migrate:database-manager

# 3. Esperado: 4 tablas creadas
# ✓ database_schemas
# ✓ database_audits  
# ✓ database_backups
# ✓ database_migrations
```

**Verificación:**
```bash
mysql -h localhost -u root -e "USE facturas; SHOW TABLES;" | grep database
```

---

## 🔧 INSTALACIÓN - PASO 2: INSTALAR RUTAS

### Método Automático (Recomendado)

```bash
# En backend/
npm run install:database-manager

# Resultado esperado:
# ✓ Require agregado
# ✓ Archivo server.js actualizado
# ✓ Directorio de backups creado
```

### Método Manual (Si automatizado falla)

**1. Abrir `backend/server.js`**

**2. Agregar require (cerca de otros requires):**
```javascript
const databaseRoutes = require('./routes/database.routes');
```

**3. Agregar uso de rutas (en app.use section):**
```javascript
app.use('/api/database', databaseRoutes);
```

**4. Crear directorio de backups:**
```bash
mkdir -p backend/backups
```

---

## ✅ PASO 3: VERIFICACIÓN

### 1. Iniciar servidor
```bash
npm run dev
```

**Salida esperada:**
```
✓ Conexión a MySQL exitosa
✓ Servidor escuchando en puerto 3001
```

### 2. Probar un endpoint
```bash
# En otra terminal:
curl -X GET http://localhost:3001/api/database/tables \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "tables": ["invoices", "users", "..."]
}
```

### 3. Verificar tablas en BD
```bash
mysql -h localhost -u root -e "
USE facturas;
DESCRIBE database_schemas;
DESCRIBE database_audits;
DESCRIBE database_backups;
DESCRIBE database_migrations;
"
```

---

## 🌐 INTEGRACIÓN EN PRODUCCIÓN

### Opción 1: Desplegar en Railway

```bash
# 1. Hacer commit (ya hecho)
git add .
git commit -m "feat: Database Manager v1.0"

# 2. Push a GitHub (ya hecho)
git push origin main

# 3. Railway detectará cambios automáticamente
# 4. Ejecutar en la consola de Railway:
npm run setup:database-manager

# 5. Reiniciar servidor
```

### Opción 2: Desplegar manual

```bash
# 1. Conectar a servidor
ssh user@production-server

# 2. Actualizar código
cd gestion-facturas
git pull origin main

# 3. Instalar dependencias (si cambió package.json)
cd backend
npm install

# 4. Ejecutar migración
npm run migrate:database-manager

# 5. Instalar rutas
npm run install:database-manager

# 6. Reiniciar con PM2
pm2 restart "gestion-facturas-backend"
```

---

## 📦 ROLLBACK (Si algo falla)

### Revertir cambios en código

```bash
# Revert el último commit
git revert HEAD

# O restablecer archivos específicos
git checkout HEAD~1 backend/server.js
```

### Eliminar tablas (Destructivo)

```bash
mysql -h <host> -u <user> -p <database> << EOF
DROP TABLE IF EXISTS database_migrations;
DROP TABLE IF EXISTS database_backups;
DROP TABLE IF EXISTS database_audits;
DROP TABLE IF EXISTS database_schemas;
EOF
```

---

## 📊 ARCHIVOS MODIFICADOS/CREADOS

### Nuevos Archivos (25)

**Backend (9):**
- `backend/models/DatabaseSchema.js` - Modelo de esquemas
- `backend/models/DatabaseAudit.js` - Modelo de auditoría
- `backend/models/DatabaseBackup.js` - Modelo de backups
- `backend/models/DatabaseMigration.js` - Modelo de migraciones
- `backend/services/database.service.js` - Lógica de negocio
- `backend/controllers/database.controller.js` - Endpoints HTTP
- `backend/middleware/database.validator.js` - Validadores
- `backend/routes/database.routes.js` - Definición de rutas
- `backend/run-database-manager-migration.js` - Script de migración

**Frontend (8):**
- `frontend/src/services/database.service.js` - Cliente HTTP
- `frontend/src/stores/database.store.js` - Pinia store
- `frontend/src/components/DatabaseManagerPanel.vue` - Dashboard
- `frontend/src/components/TableDataViewer.vue` - Visor de datos
- `frontend/src/components/SqlEditor.vue` - Editor SQL
- `frontend/src/components/BackupManager.vue` - Gestor de backups
- `frontend/src/components/TablesViewer.vue` - Listado de tablas
- `frontend/src/router/database.routes.js` - Rutas frontend

**Tests (4):**
- `backend/tests/database.controller.test.js` - Tests controlador
- `backend/tests/database.service.test.js` - Tests servicio
- `frontend/tests/DatabaseManagerPanel.spec.js` - Tests componente
- `frontend/cypress/e2e/database-manager.spec.js` - Tests E2E

**Documentación (3):**
- `ESTRUCTURA_DATABASE_MANAGER.md` - Especificación técnica
- `GENERACION_COMPLETADA_DATABASE_MANAGER.md` - Resumen
- `MIGRATION_TASK_DATABASE_MANAGER.md` - Esta tarea

### Archivos Modificados (2)

- `backend/package.json` - Agregados scripts de migración
- `backend/server.js` - Agregadas rutas de Database Manager

---

## 🛡️ SEGURIDAD

✅ **Verificaciones de seguridad implementadas:**

1. **RBAC (Role-Based Access Control)**
   - Solo usuarios con rol `admin` pueden acceder
   - Middleware `requireAdmin` en todas las rutas

2. **SQL Injection Prevention**
   - Whitelist de keywords peligrosos
   - Validación de nombres de tablas
   - Control de queries en draft mode

3. **Auditoría**
   - Todas las operaciones registradas en `database_audits`
   - Tracking de quién hizo qué y cuándo
   - Almacenamiento de definiciones anteriores

4. **Rate Limiting**
   - Implementado en rutas públicas
   - Backups comprimidos (GZIP)
   - Validación de entrada en todos los endpoints

---

## 📈 MONITOREO POST-MIGRACIÓN

### Métricas a seguir

```sql
-- 1. Número de operaciones auditadas
SELECT COUNT(*) as total_operations FROM database_audits;

-- 2. Backups creados
SELECT COUNT(*) as total_backups FROM database_backups;

-- 3. Versiones registradas
SELECT COUNT(DISTINCT tableName) as tables_tracked FROM database_schemas;

-- 4. Errores en migraciones
SELECT COUNT(*) as failed_migrations 
FROM database_migrations 
WHERE status = 'FAILED';
```

### Logs

```bash
# Ver logs del servidor
tail -f backend/logs/server.log

# Ver logs de migraciones
grep "DATABASE MANAGER" backend/logs/server.log
```

---

## 🎯 LISTA DE VERIFICACIÓN FINAL

Antes de considerar la migración completada:

- [ ] Migraciones ejecutadas sin errores
- [ ] 4 tablas creadas en la BD
- [ ] Rutas registradas en server.js
- [ ] Servidor inicia sin errores
- [ ] Endpoint `/api/database/tables` responde
- [ ] Solo usuarios admin pueden acceder
- [ ] Frontend accede a `/admin/database`
- [ ] Tests pasan (opcional)
- [ ] Documentación leída
- [ ] Backup de BD realizado

---

## 💬 SOPORTE & TROUBLESHOOTING

### Error: "Table already exists"
```bash
# OK - Las tablas ya estaban creadas
# Continuar con paso siguiente
```

### Error: "Foreign key constraint failed"
```bash
# Verificar que tabla users existe con id CHAR(36)
DESCRIBE users;

# Si es INT:
# 1. Usar conversión de datos
# 2. Ver documentación completa en ESTRUCTURA_DATABASE_MANAGER.md
```

### Error: "Permission denied"
```bash
# Usuario MySQL no tiene permisos
# Usar usuario con permisos SUPER
mysql -u root -p
```

### Routes no se registraron
```bash
# Ejecutar script manual de instalación
cd backend
node install-database-simple.js
```

---

## 📞 SIGUIENTES PASOS

1. ✅ Migración realizada
2. ✅ Tablas creadas
3. ✅ Rutas registradas
4. 📋 Verificar funcionamiento (ver sección Verificación)
5. 🚀 Desplegar a producción (ver sección Integración)
6. 📊 Monitorear (ver sección Monitoreo)

---

## 📚 REFERENCIAS

- **Especificación Técnica:** `ESTRUCTURA_DATABASE_MANAGER.md`
- **Guía de Uso:** `GENERACION_COMPLETADA_DATABASE_MANAGER.md`
- **API Endpoints:** `/api/database/*`
- **Modelos:** `backend/models/Database*.js`
- **Tests:** `backend/tests/database.*.test.js`

---

**Estado:** ✅ LISTA PARA PRODUCCIÓN  
**Última actualización:** 18 de marzo de 2026  
**Responsable:** Backend Team  

