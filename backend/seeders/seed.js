require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

async function seed() {
  try {
    console.log('🌱 Iniciando seeding...\n');

    // Limpiar tablas (CUIDADO: Esto borra todo)
    console.log('🗑️  Limpiando tablas...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE audit_logs');
    await db.query('TRUNCATE TABLE invoices');
    await db.query('TRUNCATE TABLE cost_centers');
    await db.query('TRUNCATE TABLE providers');
    await db.query('TRUNCATE TABLE employees');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. USUARIOS
    console.log('👥 Creando usuarios...');
    const adminId = uuidv4();
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.query(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, 'admin@empresa.com', hashedPassword, 'Admin', 'Sistema', 'admin']
    );

    await db.query(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [user1Id, 'maria@empresa.com', hashedPassword, 'María', 'García', 'user']
    );

    await db.query(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [user2Id, 'juan@empresa.com', hashedPassword, 'Juan', 'Pérez', 'viewer']
    );

    // 2. EMPLEADOS
    console.log('👷 Creando empleados...');
    const emp1Id = uuidv4();
    const emp2Id = uuidv4();
    const emp3Id = uuidv4();

    await db.query(
      `INSERT INTO employees (id, user_id, identification_number, identification_type, 
       first_name, last_name, position, department, phone, email, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp1Id, user1Id, '1234567890', 'CC', 'María', 'García', 
       'Contadora', 'Finanzas', '+57 300 1234567', 'maria@empresa.com', '2020-01-15']
    );

    await db.query(
      `INSERT INTO employees (id, identification_number, identification_type, 
       first_name, last_name, position, department, phone, email, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp2Id, '9876543210', 'CC', 'Carlos', 'López', 
       'Asistente Administrativo', 'Administración', '+57 310 9876543', 'carlos@empresa.com', '2021-03-10']
    );

    await db.query(
      `INSERT INTO employees (id, identification_number, identification_type, 
       first_name, last_name, position, department, phone, email, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp3Id, '5555555555', 'CC', 'Ana', 'Martínez', 
       'Gerente de Compras', 'Compras', '+57 320 5555555', 'ana@empresa.com', '2019-06-20']
    );

    // 3. PROVEEDORES
    console.log('🏢 Creando proveedores...');
    const prov1Id = uuidv4();
    const prov2Id = uuidv4();
    const prov3Id = uuidv4();
    const prov4Id = uuidv4();
    const prov5Id = uuidv4();

    const providers = [
      [prov1Id, 'Papelería Ltda', '900123456-1', 'Pedro Gómez', '+57 300 1111111', 
       'ventas@papeleria.com', 'Calle 123 #45-67', 'Bogotá', 'Colombia', 'Oficina', 4.5, 30],
      [prov2Id, 'Servicios Generales S.A.S', '900234567-2', 'Laura Ruiz', '+57 310 2222222',
       'contacto@servicios.com', 'Carrera 45 #12-34', 'Medellín', 'Colombia', 'Servicios', 4.2, 45],
      [prov3Id, 'Tecnología y Más', '900345678-3', 'Roberto Silva', '+57 320 3333333',
       'info@tecnologia.com', 'Avenida 7 #89-12', 'Cali', 'Colombia', 'Tecnología', 4.8, 30],
      [prov4Id, 'Construcción Total', '900456789-4', 'Carmen Díaz', '+57 315 4444444',
       'ventas@construccion.com', 'Calle 50 #23-45', 'Barranquilla', 'Colombia', 'Construcción', 4.0, 60],
      [prov5Id, 'Transportes Express', '900567890-5', 'Andrés Torres', '+57 318 5555555',
       'transporte@express.com', 'Carrera 80 #12-34', 'Bogotá', 'Colombia', 'Transporte', 4.3, 15]
    ];

    for (const provider of providers) {
      await db.query(
        `INSERT INTO providers (id, business_name, nit, contact_name, phone, email, 
         address, city, country, category, rating, payment_terms) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        provider
      );
    }

    // 4. CENTROS DE COSTO
    console.log('💼 Creando centros de costo...');
    const cc1Id = uuidv4();
    const cc2Id = uuidv4();
    const cc3Id = uuidv4();
    const cc4Id = uuidv4();

    const costCenters = [
      [cc1Id, 'CC-ADM', 'Administración', 'Gastos administrativos generales', emp2Id, 50000000],
      [cc2Id, 'CC-TEC', 'Tecnología', 'Infraestructura y desarrollo', null, 75000000],
      [cc3Id, 'CC-MKT', 'Marketing', 'Publicidad y marketing', null, 30000000],
      [cc4Id, 'CC-OPE', 'Operaciones', 'Gastos operacionales', emp3Id, 100000000]
    ];

    for (const cc of costCenters) {
      await db.query(
        `INSERT INTO cost_centers (id, code, name, description, responsible_id, budget) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        cc
      );
    }

    // 5. FACTURAS
    console.log('📄 Creando facturas...');
    
    // Obtener tipos de factura
    const invoiceTypes = await db.query('SELECT id, code FROM invoice_types');
    const fcType = invoiceTypes.find(t => t.code === 'FC');
    const ccType = invoiceTypes.find(t => t.code === 'CC');
    const spType = invoiceTypes.find(t => t.code === 'SP');

    const invoices = [
      {
        invoiceNumber: 'FC-2025-001',
        invoiceTypeId: fcType.id,
        providerId: prov1Id,
        costCenterId: cc1Id,
        employeeId: emp1Id,
        issueDate: '2025-01-05',
        dueDate: '2025-02-04',
        subtotal: 500000,
        tax: 95000,
        total: 595000,
        status: 'paid',
        description: 'Compra de papelería y útiles de oficina',
        createdBy: user1Id,
        approvedBy: adminId,
        paymentDate: '2025-01-25'
      },
      {
        invoiceNumber: 'FC-2025-002',
        invoiceTypeId: fcType.id,
        providerId: prov2Id,
        costCenterId: cc4Id,
        employeeId: emp3Id,
        issueDate: '2025-01-10',
        dueDate: '2025-02-24',
        subtotal: 1500000,
        tax: 285000,
        total: 1785000,
        status: 'approved',
        description: 'Servicios de mantenimiento enero',
        createdBy: user1Id,
        approvedBy: adminId
      },
      {
        invoiceNumber: 'FC-2025-003',
        invoiceTypeId: fcType.id,
        providerId: prov3Id,
        costCenterId: cc2Id,
        employeeId: emp1Id,
        issueDate: '2025-01-15',
        dueDate: '2025-02-14',
        subtotal: 3000000,
        tax: 570000,
        total: 3570000,
        status: 'pending',
        description: 'Equipos de cómputo y licencias',
        createdBy: user1Id
      },
      {
        invoiceNumber: 'CC-2025-001',
        invoiceTypeId: ccType.id,
        providerId: prov4Id,
        costCenterId: cc4Id,
        employeeId: emp3Id,
        issueDate: '2025-01-20',
        dueDate: '2025-03-20',
        subtotal: 5000000,
        tax: 950000,
        total: 5950000,
        status: 'pending',
        description: 'Remodelación oficinas',
        createdBy: user1Id
      },
      {
        invoiceNumber: 'SP-2025-001',
        invoiceTypeId: spType.id,
        providerId: prov5Id,
        costCenterId: cc1Id,
        employeeId: emp2Id,
        issueDate: '2025-01-25',
        dueDate: '2025-02-09',
        subtotal: 200000,
        tax: 38000,
        total: 238000,
        status: 'paid',
        description: 'Servicio de energía enero',
        createdBy: user1Id,
        approvedBy: adminId,
        paymentDate: '2025-02-01'
      }
    ];

    for (const invoice of invoices) {
      const id = uuidv4();
      await db.query(
        `INSERT INTO invoices 
         (id, invoice_number, invoice_type_id, provider_id, cost_center_id, employee_id,
          issue_date, due_date, subtotal, tax, discount, total, status, description, 
          order_number, is_reimbursable, created_by, approved_by, payment_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, invoice.invoiceNumber, invoice.invoiceTypeId, invoice.providerId, 
         invoice.costCenterId, invoice.employeeId, invoice.issueDate, invoice.dueDate,
         invoice.subtotal, invoice.tax, invoice.discount || 0, invoice.total, invoice.status, invoice.description,
         null, 0, invoice.createdBy, invoice.approvedBy || null, invoice.paymentDate || null]
      );
    }

    console.log('\n✅ Seeding completado exitosamente!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DATOS DE ACCESO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👤 ADMIN:');
    console.log('   Email: admin@empresa.com');
    console.log('   Password: admin123');
    console.log('\n👤 USUARIO:');
    console.log('   Email: maria@empresa.com');
    console.log('   Password: admin123');
    console.log('\n👁️  VIEWER:');
    console.log('   Email: juan@empresa.com');
    console.log('   Password: admin123');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 DATOS CREADOS:');
    console.log('   • 3 usuarios');
    console.log('   • 3 empleados');
    console.log('   • 5 proveedores');
    console.log('   • 4 centros de costo');
    console.log('   • 5 facturas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeding:', error);
    process.exit(1);
  }
}

seed();