const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DatabaseBackup = sequelize.define('DatabaseBackup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    backupName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    backupType: {
      type: DataTypes.ENUM('FULL', 'INCREMENTAL', 'SCHEMA_ONLY', 'DATA_ONLY'),
      allowNull: false,
      defaultValue: 'FULL'
    },
    tablesIncluded: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    backupSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Tamaño en bytes'
    },
    fileLocation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    compressedFilePath: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    encryptionKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Hash de la clave de encriptación (no guardar en claro)'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationResult: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detalles de la verificación'
    }
  }, {
    tableName: 'database_backups',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['createdAt'] },
      { fields: ['backupType'] },
      { fields: ['createdBy'] }
    ]
  });

  DatabaseBackup.associate = (models) => {
    DatabaseBackup.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return DatabaseBackup;
};
