module.exports = (sequelize, DataTypes) => {
  const DocumentType = sequelize.define('DocumentType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { 
        notEmpty: true,
        len: [3, 100],
      },
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { 
        notEmpty: true,
        len: [2, 20],
        isValidCode(value) {
          if (!/^[A-Z_]+$/.test(value)) {
            throw new Error('Código debe contener solo mayúsculas y guiones bajos');
          }
        },
      },
      comment: 'Código único (ej: FAC_VENTA)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prefix: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Prefijo para numeración (ej: FV-)',
    },
    nextSequence: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Próximo número secuencial',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fields: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array de definición de campos dinámicos',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'document_types',
    timestamps: true,
    paranoid: false,
    underscored: true,
  });

  DocumentType.associate = (models) => {
    DocumentType.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    DocumentType.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater',
    });
    DocumentType.hasMany(models.Document, {
      foreignKey: 'documentTypeId',
      as: 'documents',
      onDelete: 'RESTRICT',
    });
  };

  return DocumentType;
};
