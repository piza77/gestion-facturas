const db = require('./config/database');

async function checkTable() {
  try {
    const result = await db.query('DESCRIBE invoices');
    console.log('Columnas de la tabla invoices:');
    result.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkTable();
