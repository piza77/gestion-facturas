// Exportar todos los modelos
module.exports = {
  User: require('./User'),
  Invoice: require('./Invoice'),
  Provider: require('./Provider'),
  Employee: require('./Employee'),
  Document: require('./Document'),
  DocumentType: require('./DocumentType'),
  InvoiceType: require('./InvoiceType'),
  CostCenter: require('./CostCenter'),
  BudgetCategory: require('./BudgetCategory'),
  BudgetSubcategory: require('./BudgetSubcategory'),
  BudgetItem: require('./BudgetItem'),
  DatabaseMigration: require('./DatabaseMigration'),
  DatabaseBackup: require('./DatabaseBackup'),
  DatabaseAudit: require('./DatabaseAudit'),
  DatabaseSchema: require('./DatabaseSchema'),
};
