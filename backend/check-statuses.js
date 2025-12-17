const db = require('./config/database');

async function checkStatuses() {
  try {
    const result = await db.query('SELECT DISTINCT status FROM invoices');
    console.log('Estados encontrados en la tabla:');
    result.forEach(row => {
      console.log(`  - ${row.status}`);
    });
    
    const count = await db.query('SELECT status, COUNT(*) as count FROM invoices GROUP BY status');
    console.log('\nContar por estado:');
    count.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkStatuses();
