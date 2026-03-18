'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Crear tabla document_types
      await queryInterface.createTable('document_types', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        code: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        prefix: {
          type: Sequelize.STRING(10),
          allowNull: true,
          defaultValue: 'DOC',
        },
        nextSequence: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        fields: {
          type: Sequelize.JSON,
          defaultValue: [],
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        updatedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      }, { transaction });

      // Crear tabla documents
      await queryInterface.createTable('documents', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        documentTypeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'document_types',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        folio: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        data: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {},
        },
        invoiceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'invoices',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        status: {
          type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'VOIDED'),
          defaultValue: 'DRAFT',
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        updatedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      }, { transaction });

      // Crear índices para optimización
      await queryInterface.addIndex('document_types', ['code'], { transaction });
      await queryInterface.addIndex('document_types', ['isActive'], { transaction });
      await queryInterface.addIndex('documents', ['documentTypeId'], { transaction });
      await queryInterface.addIndex('documents', ['status'], { transaction });
      await queryInterface.addIndex('documents', ['folio'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Eliminar índices
      await queryInterface.removeIndex('documents', 'documents_folio', { transaction });
      await queryInterface.removeIndex('documents', 'documents_status', { transaction });
      await queryInterface.removeIndex('documents', 'documents_documentTypeId', { transaction });
      await queryInterface.removeIndex('document_types', 'document_types_isActive', { transaction });
      await queryInterface.removeIndex('document_types', 'document_types_code', { transaction });

      // Eliminar tablas
      await queryInterface.dropTable('documents', { transaction });
      await queryInterface.dropTable('document_types', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
