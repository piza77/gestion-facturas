'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Crear tabla database_schemas
      await queryInterface.createTable(
        'database_schemas',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          version: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
          },
          tableName: {
            type: Sequelize.STRING(100),
            allowNull: false
          },
          definition: {
            type: Sequelize.JSON,
            allowNull: false,
            comment: 'Definición completa del esquema de la tabla'
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          indexes: {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: []
          },
          foreignKeys: {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: []
          },
          isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          isDraft: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          appliedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          appliedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
      );

      // Crear índices para database_schemas
      await queryInterface.addIndex(
        'database_schemas',
        ['tableName'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_schemas',
        ['version'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_schemas',
        ['tableName', 'version'],
        { unique: true, transaction }
      );

      // 2. Crear tabla database_audits
      await queryInterface.createTable(
        'database_audits',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          tableName: {
            type: Sequelize.STRING(100),
            allowNull: false
          },
          operation: {
            type: Sequelize.ENUM('CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'DELETE', 'BACKUP', 'RESTORE', 'EXECUTE_MIGRATION'),
            allowNull: false
          },
          queryExecuted: {
            type: Sequelize.LONGTEXT,
            allowNull: true
          },
          recordsAffected: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
          },
          executionTime: {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
            comment: 'Tiempo en milisegundos'
          },
          errorMessage: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          oldDefinition: {
            type: Sequelize.JSON,
            allowNull: true
          },
          newDefinition: {
            type: Sequelize.JSON,
            allowNull: true
          },
          performedBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          status: {
            type: Sequelize.ENUM('SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK'),
            defaultValue: 'SUCCESS'
          },
          performedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
      );

      // Crear índices para database_audits
      await queryInterface.addIndex(
        'database_audits',
        ['tableName'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_audits',
        ['operation'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_audits',
        ['performedAt'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_audits',
        ['status'],
        { transaction }
      );

      // 3. Crear tabla database_backups
      await queryInterface.createTable(
        'database_backups',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          backupName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          backupType: {
            type: Sequelize.ENUM('FULL', 'INCREMENTAL', 'SCHEMA_ONLY', 'DATA_ONLY'),
            allowNull: false,
            defaultValue: 'FULL'
          },
          tablesIncluded: {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: []
          },
          backupSize: {
            type: Sequelize.BIGINT,
            allowNull: true,
            comment: 'Tamaño en bytes'
          },
          fileLocation: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          compressedFilePath: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          },
          completedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          isEncrypted: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          encryptionKey: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Hash de la clave de encriptación'
          },
          isVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          verifiedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          verificationResult: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Detalles de la verificación'
          }
        },
        { transaction }
      );

      // Crear índices para database_backups
      await queryInterface.addIndex(
        'database_backups',
        ['createdAt'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_backups',
        ['backupType'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_backups',
        ['createdBy'],
        { transaction }
      );

      // 4. Crear tabla database_migrations
      await queryInterface.createTable(
        'database_migrations',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          migrationName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
          },
          migrationContent: {
            type: Sequelize.LONGTEXT,
            allowNull: false,
            comment: 'Código de la migración Sequelize'
          },
          status: {
            type: Sequelize.ENUM('PENDING', 'EXECUTED', 'ROLLED_BACK', 'FAILED'),
            defaultValue: 'PENDING'
          },
          executedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          rollbackAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          executedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          errorMessage: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          executionTime: {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
            comment: 'Tiempo en milisegundos'
          },
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
      );

      // Crear índices para database_migrations
      await queryInterface.addIndex(
        'database_migrations',
        ['status'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_migrations',
        ['migrationName'],
        { transaction }
      );
      await queryInterface.addIndex(
        'database_migrations',
        ['createdBy'],
        { transaction }
      );

      await transaction.commit();
      console.log('✓ Migration: Database Manager tables created successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('database_migrations', { transaction });
      await queryInterface.dropTable('database_backups', { transaction });
      await queryInterface.dropTable('database_audits', { transaction });
      await queryInterface.dropTable('database_schemas', { transaction });

      await transaction.commit();
      console.log('✓ Migration reversed: All Database Manager tables dropped');

    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error reverting migration:', error);
      throw error;
    }
  }
};
