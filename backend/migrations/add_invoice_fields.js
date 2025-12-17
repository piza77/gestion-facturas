const db = require('../config/database');

async function migrateInvoices() {
  try {
    console.log('🔄 Iniciando migración para tabla invoices...\n');

    // Agregar columna order_number si no existe
    try {
      await db.query(`
        ALTER TABLE invoices 
        ADD COLUMN order_number VARCHAR(50) NULL 
        AFTER employee_id
      `);
      console.log('✅ Columna order_number agregada');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  Columna order_number ya existe');
      } else {
        throw error;
      }
    }

    // Agregar columna is_reimbursable si no existe
    try {
      await db.query(`
        ALTER TABLE invoices 
        ADD COLUMN is_reimbursable BOOLEAN DEFAULT false 
        AFTER total
      `);
      console.log('✅ Columna is_reimbursable agregada');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  Columna is_reimbursable ya existe');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migración completada exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

migrateInvoices();
