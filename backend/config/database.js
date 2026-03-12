const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse DATABASE_URL if available (Railway), otherwise use individual variables
let poolConfig;

if (process.env.MYSQL_PUBLIC_URL) {
  // Parse URL: mysql://user:password@host:port/database
  const url = new URL(process.env.MYSQL_PUBLIC_URL);
  poolConfig = {
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading /
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z'
  };
} else {
  // Fallback to individual environment variables (local development)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'facturas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z'
  };
}

const pool = mysql.createPool(poolConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Verifica que MySQL esté corriendo');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Usuario o contraseña incorrectos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 La base de datos no existe. Créala con el script SQL');
    }
    return false;
  }
}

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
}

async function closePool() {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando pool:', error.message);
  }
}

module.exports = { pool, query, testConnection, closePool };