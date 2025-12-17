const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_facturas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔄 Iniciando migración para rastreo de estados...\n');

    const connection = await pool.getConnection();

    // Campos que rastrean las transiciones de estado
    const fields = [
      { name: 'filed_at', description: 'Fecha cuando se cambió a Radicado' },
      { name: 'filed_by', description: 'Usuario que radicó el documento' },
      { name: 'accounted_at', description: 'Fecha cuando se cambió a Contabilizado' },
      { name: 'accounted_by', description: 'Usuario que contabilizó el documento' },
      { name: 'paid_at', description: 'Fecha cuando se cambió a Pagado' },
      { name: 'paid_by', description: 'Usuario que procesó el pago' }
    ];

    console.log('➕ Agregando campos de rastreo de estados...');
    
    for (const field of fields) {
      try {
        let query = '';
        if (field.name.endsWith('_at')) {
          // Es un campo de fecha
          query = `ALTER TABLE invoices ADD COLUMN ${field.name} DATETIME NULL DEFAULT NULL COMMENT '${field.description}'`;
        } else {
          // Es un campo de usuario
          query = `ALTER TABLE invoices ADD COLUMN ${field.name} CHAR(36) NULL DEFAULT NULL COMMENT '${field.description}'`;
        }
        
        await connection.query(query);
        console.log(`  ✅ ${field.description}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ℹ️  ${field.description} ya existe`);
        } else {
          console.error(`  ❌ Error en ${field.name}:`, error.message);
        }
      }
    }

    connection.release();

    console.log('\n✅ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();
