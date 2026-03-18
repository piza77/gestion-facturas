const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DatabaseAudit = sequelize.define('DatabaseAudit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tableName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    operation: {
      type: DataTypes.ENUM('CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'DELETE', 'BACKUP', 'RESTORE', 'EXECUTE_MIGRATION'),
      allowNull: false
    },
    queryExecuted: {
      type: DataTypes.LONGTEXT,
      allowNull: true
    },
    recordsAffected: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    executionTime: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Tiempo en milisegundos'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    oldDefinition: {
      type: DataTypes.JSON,
      allowNull: true
    },
    newDefinition: {
      type: DataTypes.JSON,
      allowNull: true
    },
    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING', 'ROLLED_BACK'),
      defaultValue: 'SUCCESS'
    },
    performedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'database_audits',
    timestamps: false,
    indexes: [
      { fields: ['tableName'] },
      { fields: ['operation'] },
      { fields: ['performedAt'] },
      { fields: ['status'] }
    ]
  });

  DatabaseAudit.associate = (models) => {
    DatabaseAudit.belongsTo(models.User, {
      foreignKey: 'performedBy',
      as: 'performer'
    });
  };

  return DatabaseAudit;
};
