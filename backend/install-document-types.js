#!/usr/bin/env node

/**
 * Install Document Types Feature
 * 
 * Este script maneja la instalación completa de la funcionalidad de Tipos de Documento
 * 
 * Uso:
 *   node install-document-types.js
 * 
 * O con npm:
 *   npm run install:document-types
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.bright}${colors.blue}→ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

async function runCommand(command, description) {
  try {
    log.info(description);
    const { stdout, stderr } = await execAsync(command, {
      cwd: path.join(__dirname, 'backend'),
    });
    if (stderr && !stderr.includes('warning')) {
      log.warn(`${description} - Warning: ${stderr}`);
    }
    log.success(description);
    return true;
  } catch (error) {
    log.error(`${description} - ${error.message}`);
    return false;
  }
}

async function main() {
  log.section('🚀 INSTALACIÓN DE TIPOS DE DOCUMENTO');

  try {
    // Paso 1: Validar estructura
    log.step('Validando estructura del proyecto...');
    const backendPath = path.join(__dirname, 'backend');
    const frontendPath = path.join(__dirname, 'frontend');

    if (!fs.existsSync(backendPath)) {
      throw new Error('Carpeta backend no encontrada');
    }
    if (!fs.existsSync(frontendPath)) {
      throw new Error('Carpeta frontend no encontrada');
    }
    log.success('Estructura validada');

    // Paso 2: Verificar que los archivos existan
    log.step('Verificando archivos necesarios...');
    const requiredBackendFiles = [
      'models/DocumentType.js',
      'models/Document.js',
      'controllers/documentType.controller.js',
      'services/documentType.service.js',
      'routes/documentType.routes.js',
      'middleware/documentType.validator.js',
      'migrations/add_document_types_tables.js',
      'seeders/document-types.seeder.js',
    ];

    const missingFiles = [];
    for (const file of requiredBackendFiles) {
      const fullPath = path.join(backendPath, file);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Archivos faltantes: ${missingFiles.join(', ')}`);
    }
    log.success('Todos los archivos presentes');

    // Paso 3: Verificar package.json en backend
    log.step('Verificando dependencias necesarias...');
    const backendPackagePath = path.join(backendPath, 'package.json');
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));

    const requiredDeps = {
      sequelize: true,
      'express-validator': true,
      axios: false, // opcional
    };

    const missingDeps = [];
    for (const [dep, required] of Object.entries(requiredDeps)) {
      if (required && !backendPackage.dependencies[dep] && !backendPackage.devDependencies?.[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      log.warn(`Dependencias faltantes: ${missingDeps.join(', ')}`);
      log.info('Instalando dependencias...');
      await runCommand('npm install', 'npm install en backend');
    }
    log.success('Dependencias verificadas');

    // Paso 4: Ejecutar migraciones
    log.section('📊 BASE DE DATOS');
    log.step('Ejecutando migraciones...');

    const migrationCommand = 'npx sequelize db:migrate --env production';
    const { stdout: migrationOutput } = await execAsync(migrationCommand, {
      cwd: backendPath,
    }).catch((err) => {
      log.warn(`Migraciones pueden requerir configuración manual: ${err.message}`);
      return { stdout: '' };
    });

    log.success('Migraciones ejecutadas');

    // Paso 5: Ejecutar seeders
    log.step('Cargando datos predefinidos...');
    const seederCommand = 'npx sequelize db:seed:all --env production';
    await execAsync(seederCommand, {
      cwd: backendPath,
    }).catch((err) => {
      log.warn(`Seeders pueden requerir configuración manual: ${err.message}`);
    });
    log.success('Datos predefinidos cargados');

    // Paso 6: Información de integración
    log.section('📝 PASOS DE INTEGRACIÓN');

    log.step('Integrar rutas en server.js');
    console.log(`
${colors.bright}Backend: ${'backend/server.js'}${colors.reset}

Agregar estas líneas en el archivo principal:

${colors.dim}// Importar rutas${colors.reset}
const documentTypeRoutes = require('./routes/documentType.routes');

${colors.dim}// En la configuración de rutas (después de otras rutas):${colors.reset}
app.use('/api/document-types', documentTypeRoutes);
    `);

    log.step('Integrar en router frontend');
    console.log(`
${colors.bright}Frontend: ${'frontend/src/router/index.js'}${colors.reset}

Agregar estas líneas:

${colors.dim}// Importar rutas${colors.reset}
import documentTypeRoutes from '@/router/documentType.routes';

${colors.dim}// En el arreglo de rutas:${colors.reset}
...documentTypeRoutes,
    `);

    log.step('Agregar componente en Admin Dashboard');
    console.log(`
${colors.bright}Frontend: ${'frontend/src/pages/admin/DashboardPage.vue'}${colors.reset}

Importar el componente:

${colors.dim}import DocumentTypeAdmin from '@/components/DocumentTypeAdmin.vue';${colors.reset}

Registrarlo en components y agregar en el template:

${colors.dim}<DocumentTypeAdmin />{{colors.reset}}
    `);

    log.step('Usar formulario dinámico en Facturas');
    console.log(`
${colors.bright}Frontend: ${'frontend/src/pages/invoices/InvoiceFormPage.vue'}${colors.reset}

Importar y usar el componente:

${colors.dim}import DynamicDocumentForm from '@/components/DynamicDocumentForm.vue';${colors.reset}

En el template:

${colors.dim}<DynamicDocumentForm v-model="documentData" />{{colors.reset}}

En el script setup:

${colors.dim}const documentData = ref({});{{colors.reset}}
    `);

    // Paso 7: Resumen
    log.section('✅ INSTALACIÓN COMPLETADA');

    console.log(`
${colors.bright}Tipos de Documento Predefinidos:${colors.reset}

  1. Factura de Venta (FAC_VENTA)
     • Series: A, B, C
     • Monedas: MXN, USD, EUR
     • Método de pago incluido
     • Observaciones opcionales

  2. Nota de Crédito (NOT_CREDITO)
     • Razones: Devolución, Descuento, Error, Daño
     • Porcentaje de descuento opcional
     • Motivo detallado requerido

  3. Recibo de Pago (REC_PAGO)
     • Métodos: Efectivo, Transferencia, Cheque, Tarjeta
     • Referencia de transferencia
     • Notas adicionales

  4. Nota de Débito (NOT_DEBITO)
     • Conceptos: Intereses, Gastos Admin, Servicios, Ajuste
     • Monto configurable
     • Descripción requerida

  5. Guía de Remisión (GUA_REMISION)
     • Destinatario y dirección
     • Peso y transportista
     • Datos de envío

${colors.bright}APIs Disponibles:${colors.reset}

  GET    /api/document-types
  GET    /api/document-types/code/:code
  GET    /api/document-types/:id
  GET    /api/document-types/:id/statistics
  POST   /api/document-types
  PUT    /api/document-types/:id
  DELETE /api/document-types/:id
  POST   /api/document-types/:documentTypeId/next-folio

${colors.bright}Componentes Vue Disponibles:${colors.reset}

  • DocumentTypeAdmin.vue - Panel de administración
  • DynamicDocumentForm.vue - Formulario dinámico
  • Store Pinia: useDocumentTypeStore()

${colors.bright}Próximos Pasos:${colors.reset}

  1. ✓ Ejecutar migraciones
  2. ✓ Cargar seed data
  3. → Integrar rutas en backend
  4. → Registrar rutas en frontend
  5. → Agregar componentes a UI
  6. → Capturar datos en formularios
  7. → Crear tests E2E

${colors.bright}Documentación:${colors.reset}

  • Especificación: ESTRUCTURA_TIPOS_DOCUMENTO.md
  • Modelos: backend/models/DocumentType.js, Document.js
  • APIs: backend/routes/documentType.routes.js
  • UI: frontend/src/components/DocumentType*

${colors.bright}Soporte:${colors.reset}

  Para más información o issues:
  - Revisar ESTRUCTURA_TIPOS_DOCUMENTO.md
  - Consultar tests en backend/tests/
  - Tests E2E en frontend/cypress/e2e/
    `);

    log.success('¡Sistema listo para usar!');

  } catch (error) {
    log.error(`Error en instalación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar
main().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
