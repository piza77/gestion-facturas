const db = require('../config/database');

async function migrateInvoiceControls() {
  try {
    console.log('🔄 Iniciando migración para campos de control en invoices...\n');

    // AUTORIZACIONES (Directores)
    console.log('➕ Agregando campos de autorizaciones...');
    const authorizationFields = [
      { name: 'admin_director_approved', description: 'Director Administrativo' },
      { name: 'admin_director_approved_at', description: 'Fecha de aprobación Director Administrativo' },
      { name: 'upstream_director_approved', description: 'Directora de Upstream' },
      { name: 'upstream_director_approved_at', description: 'Fecha de aprobación Directora Upstream' },
      { name: 'hr_director_approved', description: 'Director de Recursos Humanos' },
      { name: 'hr_director_approved_at', description: 'Fecha de aprobación Director RRHH' },
      { name: 'finance_director_approved', description: 'Director Financiero' },
      { name: 'finance_director_approved_at', description: 'Fecha de aprobación Director Financiero' },
      { name: 'general_director_approved', description: 'Director General' },
      { name: 'general_director_approved_at', description: 'Fecha de aprobación Director General' }
    ];

    for (const field of authorizationFields) {
      try {
        const columnType = field.name.includes('_at') ? 'DATETIME' : 'BOOLEAN DEFAULT false';
        await db.query(`
          ALTER TABLE invoices 
          ADD COLUMN ${field.name} ${columnType} NULL
        `);
        console.log(`  ✅ ${field.description}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`  ℹ️  ${field.description} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // REGISTRO CONTABLE (Auxiliar)
    console.log('\n➕ Agregando campos de Registro Contable...');
    const accountingFields = [
      { name: 'accounting_municipality', type: 'VARCHAR(100)', description: 'Municipio' },
      { name: 'accounting_registration_date', type: 'DATE', description: 'Fecha de registro' },
      { name: 'accounting_document_type', type: 'VARCHAR(50)', description: 'Tipo de documento' },
      { name: 'accounting_document_number', type: 'VARCHAR(50)', description: 'Número de documento' },
      { name: 'accounting_dian_number', type: 'VARCHAR(50)', description: 'Número de radicación DIAN' },
      { name: 'accounting_observations', type: 'TEXT', description: 'Observaciones' },
      { name: 'accounting_registered_by', type: 'CHAR(36)', description: 'Registrado por (user_id)' }
    ];

    for (const field of accountingFields) {
      try {
        await db.query(`
          ALTER TABLE invoices 
          ADD COLUMN ${field.name} ${field.type} NULL
        `);
        console.log(`  ✅ ${field.description}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`  ℹ️  ${field.description} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // ANÁLISIS CONTABLE (Analista)
    console.log('\n➕ Agregando campos de Análisis Contable...');
    const analysisFields = [
      { name: 'analyst_good_seal_approved', type: 'BOOLEAN DEFAULT false', description: 'Visto bueno aprobado' },
      { name: 'analyst_review_date', type: 'DATE', description: 'Fecha de revisión' },
      { name: 'analyst_xml_file_path', type: 'VARCHAR(255)', description: 'Ruta archivo XML' },
      { name: 'analyst_xml_file_name', type: 'VARCHAR(255)', description: 'Nombre archivo XML' },
      { name: 'analyst_observations', type: 'TEXT', description: 'Observaciones' },
      { name: 'analyst_reviewed_by', type: 'CHAR(36)', description: 'Revisado por (user_id)' }
    ];

    for (const field of analysisFields) {
      try {
        await db.query(`
          ALTER TABLE invoices 
          ADD COLUMN ${field.name} ${field.type} NULL
        `);
        console.log(`  ✅ ${field.description}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`  ℹ️  ${field.description} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // CONTROL DE PAGO
    console.log('\n➕ Agregando campos de Control de Pago...');
    const paymentFields = [
      { name: 'payment_date', type: 'DATE', description: 'Fecha de pago' },
      { name: 'payment_receipt_file_path', type: 'VARCHAR(255)', description: 'Ruta comprobante de egreso' },
      { name: 'payment_receipt_file_name', type: 'VARCHAR(255)', description: 'Nombre comprobante de egreso' },
      { name: 'payment_amount', type: 'DECIMAL(15, 2)', description: 'Valor pagado' },
      { name: 'payment_observations', type: 'TEXT', description: 'Observaciones' },
      { name: 'payment_processed_by', type: 'CHAR(36)', description: 'Procesado por (user_id)' }
    ];

    for (const field of paymentFields) {
      try {
        await db.query(`
          ALTER TABLE invoices 
          ADD COLUMN ${field.name} ${field.type} NULL
        `);
        console.log(`  ✅ ${field.description}`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`  ℹ️  ${field.description} ya existe`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

migrateInvoiceControls();
