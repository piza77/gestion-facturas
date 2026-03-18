module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    folio: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Folio único del documento',
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: 'Datos dinámicos según el tipo de documento',
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'VOIDED'),
      defaultValue: 'DRAFT',
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
    tableName: 'documents',
    timestamps: true,
    paranoid: false,
    underscored: true,
  });

  Document.associate = (models) => {
    Document.belongsTo(models.DocumentType, {
      foreignKey: 'documentTypeId',
      as: 'type',
    });
    Document.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'invoice',
    });
    Document.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    Document.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater',
    });
  };

  return Document;
};
