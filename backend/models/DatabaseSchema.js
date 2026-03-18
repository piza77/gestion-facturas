const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DatabaseSchema = sequelize.define('DatabaseSchema', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    tableName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    definition: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Definición completa del esquema de la tabla'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    indexes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    foreignKeys: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    appliedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'database_schemas',
    timestamps: true,
    indexes: [
      { fields: ['tableName'] },
      { fields: ['version'] },
      { fields: ['tableName', 'version'], unique: true }
    ]
  });

  DatabaseSchema.associate = (models) => {
    DatabaseSchema.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    DatabaseSchema.belongsTo(models.User, {
      foreignKey: 'appliedBy',
      as: 'applier'
    });
  };

  return DatabaseSchema;
};
