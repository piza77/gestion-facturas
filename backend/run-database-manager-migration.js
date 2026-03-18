#!/usr/bin/env node

/**
 * Script de migración para Database Manager
 * Ejecutar: node backend/run-database-manager-migration.js
 * 
 * Crea 4 tablas necesarias para el módulo Database Manager:
 * - database_schemas: Versionado de esquemas de tablas
 * - database_audits: Auditoria de operaciones
 * - database_backups: Gestión de backups
 * - database_migrations: Tracking de migraciones
 */

const { pool } = require('./config/database');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function runMigration() {
  try {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}🗄️  MIGRACIÓN DATABASE MANAGER${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    const connection = await pool.getConnection();

    // ==================== TABLA: database_schemas ====================
    console.log(`${colors.yellow}[1/4]${colors.reset} Creando tabla database_schemas...\n`);
    
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS database_schemas (
          id INT PRIMARY KEY AUTO_INCREMENT,
          version INT NOT NULL DEFAULT 1,
          tableName VARCHAR(100) NOT NULL,
          definition JSON NOT NULL COMMENT 'Definición completa del esquema',
          description TEXT,
          indexes JSON COMMENT 'Índices de la tabla',
          foreignKeys JSON COMMENT 'Claves externas',
          isActive BOOLEAN DEFAULT TRUE,
          isDraft BOOLEAN DEFAULT FALSE,
          createdBy CHAR(36),
          appliedAt TIMESTAMP,
          appliedBy CHAR(36),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_tableName (tableName),
          INDEX idx_version (version),
          UNIQUE KEY unique_table_version (tableName, version),
          
          FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (appliedBy) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log(`  ${colors.green}✓${colors.reset} Tabla database_schemas creada\n`);
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ${colors.yellow}ℹ️  ${colors.reset}Tabla database_schemas ya existe\n`);
      } else {
        throw error;
      }
    }

    // ==================== TABLA: database_audits ====================
    console.log(`${colors.yellow}[2/4]${colors.reset} Creando tabla database_audits...\n`);
    
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS database_audits (
          id INT PRIMARY KEY AUTO_INCREMENT,
          tableName VARCHAR(100) NOT NULL,
          operation ENUM('CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'DELETE', 'BACKUP', 'RESTORE', 'EXECUTE_MIGRATION') NOT NULL,
          queryExecuted LONGTEXT,
          recordsAffected INT DEFAULT 0,
          executionTime DECIMAL(10, 3),
          errorMessage TEXT,
          oldDefinition JSON,
          newDefinition JSON,
          performedBy CHAR(36),
          status ENUM('SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK') DEFAULT 'PENDING',
          performedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_tableName (tableName),
          INDEX idx_operation (operation),
          INDEX idx_performedAt (performedAt),
          INDEX idx_status (status),
          
          FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log(`  ${colors.green}✓${colors.reset} Tabla database_audits creada\n`);
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ${colors.yellow}ℹ️  ${colors.reset}Tabla database_audits ya existe\n`);
      } else {
        throw error;
      }
    }

    // ==================== TABLA: database_backups ====================
    console.log(`${colors.yellow}[3/4]${colors.reset} Creando tabla database_backups...\n`);
    
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS database_backups (
          id INT PRIMARY KEY AUTO_INCREMENT,
          backupName VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          backupType ENUM('FULL', 'INCREMENTAL', 'SCHEMA_ONLY', 'DATA_ONLY') DEFAULT 'FULL',
          tablesIncluded JSON COMMENT 'Lista de tablas incluidas',
          backupSize BIGINT COMMENT 'Tamaño en bytes',
          fileLocation VARCHAR(255),
          compressedFilePath VARCHAR(255),
          createdBy CHAR(36),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completedAt TIMESTAMP,
          isEncrypted BOOLEAN DEFAULT FALSE,
          encryptionKey VARCHAR(255),
          isVerified BOOLEAN DEFAULT FALSE,
          verifiedAt TIMESTAMP,
          verificationResult JSON,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_createdAt (createdAt),
          INDEX idx_backupType (backupType),
          INDEX idx_createdBy (createdBy),
          
          FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log(`  ${colors.green}✓${colors.reset} Tabla database_backups creada\n`);
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ${colors.yellow}ℹ️  ${colors.reset}Tabla database_backups ya existe\n`);
      } else {
        throw error;
      }
    }

    // ==================== TABLA: database_migrations ====================
    console.log(`${colors.yellow}[4/4]${colors.reset} Creando tabla database_migrations...\n`);
    
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS database_migrations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          migrationName VARCHAR(100) NOT NULL UNIQUE,
          migrationContent LONGTEXT,
          status ENUM('PENDING', 'EXECUTED', 'FAILED', 'ROLLED_BACK') DEFAULT 'PENDING',
          executedAt TIMESTAMP,
          rollbackAt TIMESTAMP,
          createdBy CHAR(36),
          executedBy CHAR(36),
          errorMessage TEXT,
          executionTime DECIMAL(10, 3),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_status (status),
          INDEX idx_migrationName (migrationName),
          INDEX idx_createdBy (createdBy),
          
          FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (executedBy) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log(`  ${colors.green}✓${colors.reset} Tabla database_migrations creada\n`);
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  ${colors.yellow}ℹ️  ${colors.reset}Tabla database_migrations ya existe\n`);
      } else {
        throw error;
      }
    }

    connection.release();

    // ==================== RESUMEN ====================
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ MIGRACIÓN COMPLETADA EXITOSAMENTE${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.blue}📋 Tablas creadas:${colors.reset}`);
    console.log(`  ✓ database_schemas`);
    console.log(`  ✓ database_audits`);
    console.log(`  ✓ database_backups`);
    console.log(`  ✓ database_migrations\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Error en la migración:${colors.reset}\n`, error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
