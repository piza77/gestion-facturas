const mysql = require('mysql2/promise');
require('dotenv').config();

// Use Railway's auto-generated variables or fallback to individual ones
const poolConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'facturas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
};

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