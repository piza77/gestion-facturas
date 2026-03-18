const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DatabaseMigration = sequelize.define('DatabaseMigration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    migrationName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    migrationContent: {
      type: DataTypes.LONGTEXT,
      allowNull: false,
      comment: 'Código de la migración Sequelize'
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'EXECUTED', 'ROLLED_BACK', 'FAILED'),
      defaultValue: 'PENDING'
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rollbackAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    executedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    executionTime: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Tiempo en milisegundos'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'database_migrations',
    timestamps: false,
    updatedAt: false,
    indexes: [
      { fields: ['status'] },
      { fields: ['migrationName'] },
      { fields: ['createdBy'] }
    ]
  });

  DatabaseMigration.associate = (models) => {
    DatabaseMigration.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    DatabaseMigration.belongsTo(models.User, {
      foreignKey: 'executedBy',
      as: 'executor'
    });
  };

  return DatabaseMigration;
};
