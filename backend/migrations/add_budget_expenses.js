const db = require('../config/database');

/**
 * Migración para agregar seguimiento de gastos de presupuesto
 * Agrega campo executed_amount y tabla budget_expenses
 */

async function up() {
  console.log('🔧 Iniciando migración: add_budget_expenses...');
  
  try {
    // 1. Agregar campo executed_amount a budget_categories si no existe
    try {
      await db.query(`
        ALTER TABLE budget_categories 
        ADD COLUMN executed_amount DECIMAL(15,2) DEFAULT 0.00 AFTER amount
      `);
      console.log('✅ Campo executed_amount agregado a budget_categories');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo executed_amount ya existe');
      } else {
        throw error;
      }
    }

    // 2. Crear tabla para log de gastos
    await db.query(`
      CREATE TABLE IF NOT EXISTS budget_expenses (
        id VARCHAR(36) PRIMARY KEY,
        category_id VARCHAR(36) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        expense_date DATE DEFAULT (CURRENT_DATE()),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
        INDEX idx_category_expenses (category_id),
        INDEX idx_expense_date (expense_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla budget_expenses creada');

    // 3. Crear tabla para log de emails de notificación
    await db.query(`
      CREATE TABLE IF NOT EXISTS budget_notifications (
        id VARCHAR(36) PRIMARY KEY,
        cost_center_id VARCHAR(36) NOT NULL,
        notification_type ENUM('budget_alert', 'monthly_report', 'threshold_exceeded') NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        error_message TEXT,
        FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE CASCADE,
        INDEX idx_cost_center_notifications (cost_center_id),
        INDEX idx_notification_date (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla budget_notifications creada');

    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

async function down() {
  console.log('🔄 Revirtiendo migración: add_budget_expenses...');
  
  try {
    await db.query('DROP TABLE IF EXISTS budget_notifications');
    await db.query('DROP TABLE IF EXISTS budget_expenses');
    await db.query('ALTER TABLE budget_categories DROP COLUMN IF EXISTS executed_amount');
    console.log('✅ Migración revertida');
  } catch (error) {
    console.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
}

module.exports = { up, down };