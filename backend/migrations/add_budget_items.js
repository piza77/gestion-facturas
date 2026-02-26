const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🔄 Iniciando migración: agregar tabla de items de presupuesto...\n');

    // Crear tabla budget_items
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS budget_items (
        id VARCHAR(36) PRIMARY KEY,
        category_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(15, 2) NOT NULL,
        item_type VARCHAR(100),
        status ENUM('pendiente', 'aprobado', 'ejecutado', 'cancelado') DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
        INDEX idx_category (category_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      );
    `;

    await db.query(createTableSQL);
    console.log('✅ Tabla budget_items creada');

    // Crear tabla budget_item_approvals (para auditoría de aprobaciones)
    const createApprovalsTableSQL = `
      CREATE TABLE IF NOT EXISTS budget_item_approvals (
        id VARCHAR(36) PRIMARY KEY,
        item_id VARCHAR(36) NOT NULL,
        approved_by VARCHAR(36),
        approved_at TIMESTAMP,
        comments TEXT,
        FOREIGN KEY (item_id) REFERENCES budget_items(id) ON DELETE CASCADE,
        INDEX idx_item (item_id)
      );
    `;

    await db.query(createApprovalsTableSQL);
    console.log('✅ Tabla budget_item_approvals creada');

    console.log('\n🎉 Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  }
};

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
