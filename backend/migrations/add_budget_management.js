const db = require('../config/database');

/**
 * Migración: Agregar soporte para presupuestos y rubros en centros de costo
 * - Agregar campos a cost_centers: client_id, contract_number, client_nit
 * - Crear tabla budget_categories (rubros)
 * - Crear tabla budget_subcategories (subrubros)
 */

async function up() {
  try {
    console.log('Ejecutando migración: add_budget_management...');

    // 1. Alterar tabla cost_centers para agregar nuevos campos
    console.log('Agregando campos a cost_centers...');
    
    // Verificar si las columnas ya existen
    const columns = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'cost_centers' AND COLUMN_NAME IN ('client_id', 'contract_number', 'client_nit')`
    );

    const existingColumns = columns.map(c => c.COLUMN_NAME);

    if (!existingColumns.includes('client_id')) {
      await db.query(
        `ALTER TABLE cost_centers ADD COLUMN client_id VARCHAR(100) NULL COMMENT 'ID o Código del cliente'`
      );
      console.log('✓ Columna client_id agregada');
    }

    if (!existingColumns.includes('contract_number')) {
      await db.query(
        `ALTER TABLE cost_centers ADD COLUMN contract_number VARCHAR(100) NULL COMMENT 'Número del contrato'`
      );
      console.log('✓ Columna contract_number agregada');
    }

    if (!existingColumns.includes('client_nit')) {
      await db.query(
        `ALTER TABLE cost_centers ADD COLUMN client_nit VARCHAR(50) NULL COMMENT 'Cédula o NIT del cliente'`
      );
      console.log('✓ Columna client_nit agregada');
    }

    // 2. Crear tabla budget_categories (Rubros)
    console.log('Creando tabla budget_categories...');
    const categoryTableExists = await tableExists('budget_categories');
    
    if (!categoryTableExists) {
      await db.query(`
        CREATE TABLE budget_categories (
          id VARCHAR(36) PRIMARY KEY COMMENT 'UUID único',
          cost_center_id VARCHAR(36) NOT NULL COMMENT 'Referencia al centro de costo',
          name VARCHAR(150) NOT NULL COMMENT 'Nombre del rubro',
          amount DECIMAL(15, 2) NOT NULL DEFAULT 0 COMMENT 'Monto asignado al rubro',
          percentage DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Porcentaje del presupuesto total',
          description TEXT NULL COMMENT 'Descripción del rubro',
          display_order INT NOT NULL DEFAULT 1 COMMENT 'Orden de visualización',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE CASCADE,
          INDEX idx_cost_center_id (cost_center_id),
          INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('✓ Tabla budget_categories creada');
    }

    // 3. Crear tabla budget_subcategories (Subrubros)
    console.log('Creando tabla budget_subcategories...');
    const subcategoryTableExists = await tableExists('budget_subcategories');
    
    if (!subcategoryTableExists) {
      await db.query(`
        CREATE TABLE budget_subcategories (
          id VARCHAR(36) PRIMARY KEY COMMENT 'UUID único',
          budget_category_id VARCHAR(36) NOT NULL COMMENT 'Referencia a la categoría de presupuesto',
          name VARCHAR(150) NOT NULL COMMENT 'Nombre del subrubro',
          amount DECIMAL(15, 2) NOT NULL DEFAULT 0 COMMENT 'Monto asignado al subrubro',
          description TEXT NULL COMMENT 'Descripción del subrubro',
          display_order INT NOT NULL DEFAULT 1 COMMENT 'Orden de visualización',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
          INDEX idx_budget_category_id (budget_category_id),
          INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('✓ Tabla budget_subcategories creada');
    }

    console.log('✅ Migración completada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  }
}

async function down() {
  try {
    console.log('Revirtiendo migración...');
    
    // Eliminar tablas
    await db.query('DROP TABLE IF EXISTS budget_subcategories');
    await db.query('DROP TABLE IF EXISTS budget_categories');
    
    // Eliminar columnas de cost_centers
    const columns = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'cost_centers' AND COLUMN_NAME IN ('client_id', 'contract_number', 'client_nit')`
    );

    const existingColumns = columns.map(c => c.COLUMN_NAME);
    
    if (existingColumns.includes('client_id')) {
      await db.query('ALTER TABLE cost_centers DROP COLUMN client_id');
    }
    if (existingColumns.includes('contract_number')) {
      await db.query('ALTER TABLE cost_centers DROP COLUMN contract_number');
    }
    if (existingColumns.includes('client_nit')) {
      await db.query('ALTER TABLE cost_centers DROP COLUMN client_nit');
    }

    console.log('✅ Migración revertida');
    return true;

  } catch (error) {
    console.error('❌ Error al revertir migración:', error.message);
    throw error;
  }
}

async function tableExists(tableName) {
  try {
    const result = await db.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );
    return result.length > 0;
  } catch (error) {
    return false;
  }
}

module.exports = { up, down };
