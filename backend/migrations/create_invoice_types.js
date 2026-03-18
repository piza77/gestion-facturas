const db = require('../config/database');

async function createInvoiceTypes() {
  try {
    console.log('📋 Creando tabla invoice_types...\n');

    // Crear tabla si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoice_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(10) UNIQUE NOT NULL COMMENT 'Código del tipo (FC, CC, SP, etc)',
        name VARCHAR(100) NOT NULL COMMENT 'Nombre del tipo',
        description VARCHAR(255) NULL COMMENT 'Descripción del tipo',
        is_active BOOLEAN DEFAULT true COMMENT 'Activo o inactivo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36) NULL COMMENT 'Usuario que creó',
        UNIQUE KEY uk_code (code)
      )
    `);
    
    console.log('✅ Tabla invoice_types creada/verificada');

    // Insertar tipos por defecto si no existen
    const existing = await db.query('SELECT COUNT(*) as count FROM invoice_types');
    
    if (existing[0].count === 0) {
      console.log('\n➕ Insertando tipos de documento por defecto...');
      
      const types = [
        ['FC', 'Factura Comercial', 'Factura estándar de venta', true],
        ['CC', 'Nota Crédito', 'Devoluciones y ajustes negativos', true],
        ['SP', 'Soporte', 'Servicios diversos y comprobantes', true],
        ['ND', 'Nota Débito', 'Ajustes positivos sobre facturas', true]
      ];

      for (const [code, name, desc, active] of types) {
        await db.query(
          'INSERT INTO invoice_types (code, name, description, is_active) VALUES (?, ?, ?, ?)',
          [code, name, desc, active ? 1 : 0]
        );
        console.log(`  ✅ ${code} - ${name}`);
      }
    } else {
      console.log(`\n✅ Tabla invoice_types ya tiene ${existing[0].count} registros`);
    }

    console.log('\n✅ Migración completada exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

createInvoiceTypes();
