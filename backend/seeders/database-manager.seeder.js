'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Obtener usuario admin (por defecto id = 1)
      const adminUserId = 1;

      // Seed initial database schemas with documentation
      const schemas = [
        {
          version: 1,
          tableName: 'users',
          definition: {
            tableName: 'users',
            columns: [
              { name: 'id', type: 'INT', nullable: false, comment: 'ID único' },
              { name: 'email', type: 'VARCHAR(100)', nullable: false, comment: 'Email único' },
              { name: 'password', type: 'VARCHAR(255)', nullable: false }
            ]
          },
          description: 'Tabla de usuarios del sistema',
          createdBy: adminUserId,
          appliedAt: new Date(),
          appliedBy: adminUserId
        },
        {
          version: 1,
          tableName: 'invoices',
          definition: {
            tableName: 'invoices',
            columns: [
              { name: 'id', type: 'INT', nullable: false, comment: 'ID único' },
              { name: 'documentNumber', type: 'VARCHAR(50)', nullable: false },
              { name: 'totalAmount', type: 'DECIMAL(12,2)', nullable: false }
            ]
          },
          description: 'Tabla de facturas',
          createdBy: adminUserId,
          appliedAt: new Date(),
          appliedBy: adminUserId
        }
      ];

      await queryInterface.bulkInsert('database_schemas', schemas, { transaction });

      // Initial audit log entries
      const auditLogs = [
        {
          tableName: 'DATABASE_MANAGER',
          operation: 'CREATE',
          queryExecuted: 'CREATE TABLE database_schemas...',
          recordsAffected: 0,
          performedBy: adminUserId,
          status: 'SUCCESS',
          performedAt: new Date()
        },
        {
          tableName: 'DATABASE_MANAGER',
          operation: 'CREATE',
          queryExecuted: 'CREATE TABLE database_audits...',
          recordsAffected: 0,
          performedBy: adminUserId,
          status: 'SUCCESS',
          performedAt: new Date()
        }
      ];

      await queryInterface.bulkInsert('database_audits', auditLogs, { transaction });

      await transaction.commit();
      console.log('✓ Seeder: Database Manager initial data seeded successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error in seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('database_audits', {}, { transaction });
      await queryInterface.bulkDelete('database_schemas', {}, { transaction });

      await transaction.commit();
      console.log('✓ Seeder reversed: All seed data removed');

    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error reverting seeder:', error);
      throw error;
    }
  }
};
