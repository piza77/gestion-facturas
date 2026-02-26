const migration = require('./migrations/add_budget_expenses.js');

async function runMigration() {
  try {
    await migration.up();
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();