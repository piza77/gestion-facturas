#!/usr/bin/env node

require('dotenv').config();
const db = require('./config/database');
const migration = require('./migrations/add_budget_management');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración de presupuestos...\n');
    await migration.up();
    console.log('\n✅ ¡Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la migración:');
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
