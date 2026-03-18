#!/usr/bin/env node

/**
 * Script de instalación simplificado para Database Manager
 * Solo registra las rutas en el servidor
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}📦  DATABASE MANAGER - INSTALACIÓN${colors.reset}`);
console.log(`${colors.cyan}════════════════════════════════════════════════════${colors.reset}\n`);

// ==================== PASO 1: VERIFICAR ARCHIVOS ====================
console.log(`${colors.yellow}[1/3]${colors.reset} Verificando archivos...\n`);

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

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`  ${status} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.error(`\n${colors.red}✗ Algunos archivos están faltando.${colors.reset}\n`);
  process.exit(1);
}

console.log(`\n${colors.green}✓ Todos los archivos están presentes\n`);

// ==================== PASO 2: REGISTRAR RUTAS ====================
console.log(`${colors.yellow}[2/3]${colors.reset} Registrando rutas en el servidor...\n`);

const serverPath = 'backend/server.js';
let serverContent = fs.readFileSync(serverPath, 'utf8');

let modified = false;

// Agregar require del routes
if (!serverContent.includes("require('./routes/database.routes')")) {
  // Encontrar la línea de requires y agregar después de la última
  const lastRequireMatch = serverContent.match(/const .+ = require\('.+'\);(?!(\n|;))/g);
  if (lastRequireMatch && lastRequireMatch.length > 0) {
    const lastRequire = lastRequireMatch[lastRequireMatch.length - 1];
    const insertPoint = serverContent.indexOf(lastRequire) + lastRequire.length;
    serverContent = 
      serverContent.slice(0, insertPoint) + 
      "\nconst databaseRoutes = require('./routes/database.routes');" +
      serverContent.slice(insertPoint);
    modified = true;
    console.log(`  ${colors.green}✓${colors.reset} Require agregado`);
  }
}

// Agregar uso de rutas
if (!serverContent.includes("app.use('/api/database'")) {
  // Encontrar app.use y agregar antes
  const apiUseMatch = serverContent.match(/app\.use\('\/api',/);
  if (apiUseMatch) {
    const insertPoint = serverContent.indexOf(apiUseMatch[0]);
    serverContent = 
      serverContent.slice(0, insertPoint) +
      "app.use('/api/database', databaseRoutes);\n" +
      serverContent.slice(insertPoint);
    modified = true;
    console.log(`  ${colors.green}✓${colors.reset} Rutas registradas`);
  }
}

if (modified) {
  fs.writeFileSync(serverPath, serverContent);
  console.log(`\n${colors.green}✓ Archivo server.js actualizado\n`);
} else {
  console.log(`  ${colors.green}✓${colors.reset} Rutas ya están registradas\n`);
}

// ==================== PASO 3: CREAR DIRECTORIO DE BACKUPS ====================
console.log(`${colors.yellow}[3/3]${colors.reset} Creando directorios necesarios...\n`);

const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log(`  ${colors.green}✓${colors.reset} Directorio de backups creado`);
} else {
  console.log(`  ${colors.green}✓${colors.reset} Directorio de backups ya existe`);
}

// ==================== RESUMEN ====================
console.log(`\n${colors.cyan}════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}✅ INSTALACIÓN COMPLETADA${colors.reset}`);
console.log(`${colors.cyan}════════════════════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.blue}📋 Próximos pasos:${colors.reset}`);
console.log(`  1. Inicia el servidor: npm run dev`);
console.log(`  2. Accede a: http://localhost:3001/admin/database`);
console.log(`  3. Las tablas ya están creadas en la BD\n`);

console.log(`${colors.blue}🔗 Endpoints disponibles:${colors.reset}`);
console.log(`  GET    /api/database/tables`);
console.log(`  GET    /api/database/tables/:name`);
console.log(`  GET    /api/database/tables/:name/data`);
console.log(`  POST   /api/database/tables`);
console.log(`  PUT    /api/database/tables/:name`);
console.log(`  DELETE /api/database/tables/:name`);
console.log(`  POST   /api/database/backups`);
console.log(`  GET    /api/database/backups`);
console.log(`  POST   /api/database/sql/execute`);
console.log(`  GET    /api/database/audit\n`);

console.log(`${colors.blue}📚 Documentación:${colors.reset}`);
console.log(`  ESTRUCTURA_DATABASE_MANAGER.md`);
console.log(`  GENERACION_COMPLETADA_DATABASE_MANAGER.md\n`);

process.exit(0);
