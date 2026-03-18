#!/usr/bin/env node

/**
 * Script de instalación para el módulo Database Manager
 * Ejecutar: node backend/install-database.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}📦 DATABASE MANAGER - SCRIPT DE INSTALACIÓN${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

const steps = [];

// ==================== VERIFICACIÓN ====================

console.log(`${colors.yellow}[1/5]${colors.reset} Verificando estructura de archivos...\n`);

const requiredFiles = [
  'backend/models/DatabaseSchema.js',
  'backend/models/DatabaseAudit.js',
  'backend/models/DatabaseBackup.js',
  'backend/models/DatabaseMigration.js',
  'backend/services/database.service.js',
  'backend/controllers/database.controller.js',
  'backend/middleware/database.validator.js',
  'backend/routes/database.routes.js'
];

let filesOk = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`  ${status} ${file}`);
  if (!exists) filesOk = false;
});

if (!filesOk) {
  console.error(`\n${colors.red}✗ Algunos archivos están faltando. Abortando instalación.${colors.reset}\n`);
  process.exit(1);
}

steps.push('✓ Estructura de archivos verificada');

// ==================== CREAR DIRECTORIO DE BACKUPS ====================

console.log(`\n${colors.yellow}[2/5]${colors.reset} Creando directorios necesarios...\n`);

const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log(`  ${colors.green}✓${colors.reset} Directorio de backups creado: ${backupsDir}`);
} else {
  console.log(`  ${colors.green}✓${colors.reset} Directorio de backups ya existe`);
}

steps.push('✓ Directorios creados');

// ==================== ACTUALIZAR MODELS INDEX ====================

console.log(`\n${colors.yellow}[3/5]${colors.reset} Actualizando índice de modelos...\n`);

const modelsIndexPath = 'backend/models/index.js';
let modelsContent = fs.readFileSync(modelsIndexPath, 'utf8');

const modelExports = [
  'DatabaseSchema',
  'DatabaseAudit',
  'DatabaseBackup',
  'DatabaseMigration'
];

let updated = false;
modelExports.forEach(model => {
  const pattern = `db.${model}`;
  if (!modelsContent.includes(pattern)) {
    updated = true;
  }
});

if (updated) {
  // Insertar antes del export final
  const insertCode = `
db.DatabaseSchema = require('./DatabaseSchema')(sequelize);
db.DatabaseAudit = require('./DatabaseAudit')(sequelize);
db.DatabaseBackup = require('./DatabaseBackup')(sequelize);
db.DatabaseMigration = require('./DatabaseMigration')(sequelize);
`;

  if (!modelsContent.includes('db.DatabaseSchema')) {
    modelsContent = modelsContent.replace(
      'module.exports = db;',
      `${insertCode}\nmodule.exports = db;`
    );
    fs.writeFileSync(modelsIndexPath, modelsContent);
    console.log(`  ${colors.green}✓${colors.reset} Modelos agregados al índice`);
  }
} else {
  console.log(`  ${colors.green}✓${colors.reset} Modelos ya están en el índice`);
}

steps.push('✓ Índice de modelos actualizado');

// ==================== ACTUALIZAR SERVER ====================

console.log(`\n${colors.yellow}[4/5]${colors.reset} Actualizando archivo principal del servidor...\n`);

const serverPath = 'backend/server.js';
let serverContent = fs.readFileSync(serverPath, 'utf8');

if (!serverContent.includes('database.routes')) {
  // Agregar require
  const requireLine = `const databaseRoutes = require('./routes/database.routes');\n`;
  serverContent = serverContent.replace(
    /const .+ = require\('./,
    requireLine + 'const '
  );

  // Agregar uso de rutas
  const useLine = `app.use('/api/database', databaseRoutes);\n`;
  if (!serverContent.includes(useLine)) {
    serverContent = serverContent.replace(
      /app.use\('\/api',/,
      `${useLine}\napp.use('/api',`
    );
  }

  fs.writeFileSync(serverPath, serverContent);
  console.log(`  ${colors.green}✓${colors.reset} Rutas de Database Manager registradas`);
} else {
  console.log(`  ${colors.green}✓${colors.reset} Rutas ya están registradas`);
}

steps.push('✓ Servidor actualizado');

// ==================== RESUMEN ====================

console.log(`\n${colors.yellow}[5/5]${colors.reset} Verificación final...\n`);

console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}✓ INSTALACIÓN COMPLETADA${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.blue}📋 Pasos realizados:${colors.reset}`);
steps.forEach((step, i) => {
  console.log(`  ${i + 1}. ${step}`);
});

console.log(`\n${colors.blue}🚀 Próximos pasos:${colors.reset}`);
console.log(`
  1. Ejecutar migrations:
     ${colors.cyan}npm run migrate${colors.reset}

  2. Iniciar el servidor:
     ${colors.cyan}npm start${colors.reset}

  3. Acceder al Dashboard de BD:
     ${colors.cyan}http://localhost:3000/admin/database${colors.reset}

  4. Usar solo con usuario ADMIN
`);

console.log(`${colors.blue}📚 Endpoints disponibles:${colors.reset}`);
console.log(`
  GET    /api/database/tables                  # Listar tablas
  GET    /api/database/tables/:name            # Esquema tabla
  GET    /api/database/tables/:name/data       # Datos con paginación
  POST   /api/database/tables                  # Crear tabla
  PUT    /api/database/tables/:name            # Modificar tabla
  DELETE /api/database/tables/:name            # Eliminar tabla
  
  GET    /api/database/backups                 # Listar backups
  POST   /api/database/backups                 # Crear backup
  POST   /api/database/backups/:id/restore     # Restaurar
  
  GET    /api/database/audit                   # Ver auditoría
  GET    /api/database/tables/:name/versions   # Ver versiones
`);

console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

process.exit(0);
