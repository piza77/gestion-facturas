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
    console.log('🔄 Iniciando migración para actualizar estados...\n');

    const connection = await pool.getConnection();

    // Primero: cambiar la columna a VARCHAR para poder tener valores mixtos
    console.log('📋 Paso 1: Convertir status a VARCHAR temporalmente...');
    try {
      await connection.query(
        `ALTER TABLE invoices MODIFY status VARCHAR(50) DEFAULT 'pending'`
      );
      console.log('  ✅ Columna convertida a VARCHAR');
    } catch (error) {
      console.error('  ❌ Error:', error.message);
    }

    // Segundo: actualizar los valores
    console.log('\n🔄 Paso 2: Convirtiendo estados existentes...');
    try {
      // 'approved' → 'filed'
      const approved = await connection.query('UPDATE invoices SET status = "filed" WHERE status = "approved"');
      console.log(`  ✅ approved → filed (${approved[0].changedRows} registros)`);
      
      // 'rejected' → 'pending'
      const rejected = await connection.query('UPDATE invoices SET status = "pending" WHERE status = "rejected"');
      console.log(`  ✅ rejected → pending (${rejected[0].changedRows} registros)`);
      
      // 'overdue' → 'pending'
      const overdue = await connection.query('UPDATE invoices SET status = "pending" WHERE status = "overdue"');
      console.log(`  ✅ overdue → pending (${overdue[0].changedRows} registros)`);
    } catch (error) {
      console.error('  Error en conversión:', error.message);
    }

    // Tercero: cambiar el tipo de columna a ENUM con los nuevos valores
    console.log('\n⚙️  Paso 3: Actualizando ENUM de estados...');
    try {
      await connection.query(
        `ALTER TABLE invoices MODIFY status ENUM('pending', 'filed', 'accounted', 'paid', 'cancelled') DEFAULT 'pending'`
      );
      console.log('  ✅ Estados actualizados: pending, filed, accounted, paid, cancelled');
    } catch (error) {
      console.error('  ❌ Error:', error.message);
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

runMigration();
