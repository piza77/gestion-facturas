const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validar nombres de tabla
 */
const validateTableName = (fieldName = 'tableName') => [
  body(fieldName)
    .trim()
    .notEmpty().withMessage('Nombre de tabla requerido')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Nombre de tabla inválido')
    .isLength({ max: 64 }).withMessage('Nombre de tabla muy largo'),
  handleValidationErrors
];

const validateTableNameParam = (paramName = 'name') => [
  param(paramName)
    .trim()
    .notEmpty().withMessage('Nombre de tabla requerido')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Nombre de tabla inválido'),
  handleValidationErrors
];

/**
 * Validar definición de tabla
 */
const validateTableDefinition = [
  body('columns')
    .isArray().withMessage('Columns debe ser un array')
    .notEmpty().withMessage('Al menos una columna es requerida'),
  body('columns.*.name')
    .trim()
    .notEmpty().withMessage('Nombre de columna requerido')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Nombre de columna inválido'),
  body('columns.*.type')
    .notEmpty().withMessage('Tipo de dato requerido')
    .isIn(['INT', 'VARCHAR', 'TEXT', 'DECIMAL', 'DATE', 'TIMESTAMP', 'BOOLEAN', 'JSON', 'ENUM', 'BIGINT', 'FLOAT', 'DOUBLE'])
    .withMessage('Tipo de dato no válido'),
  body('columns.*.nullable')
    .optional()
    .isBoolean().withMessage('nullable debe ser booleano'),
  body('columns.*.primaryKey')
    .optional()
    .isBoolean().withMessage('primaryKey debe ser booleano'),
  body('columns.*.unique')
    .optional()
    .isBoolean().withMessage('unique debe ser booleano'),
  body('indexes')
    .optional()
    .isArray().withMessage('indexes debe ser un array'),
  body('indexes.*.name')
    .optional()
    .isLength({ min: 1 }).withMessage('Nombre de índice requerido'),
  body('indexes.*.columns')
    .optional()
    .isArray().withMessage('columns debe ser un array'),
  body('foreignKeys')
    .optional()
    .isArray().withMessage('foreignKeys debe ser un array'),
  handleValidationErrors
];

/**
 * Validar cambios de tabla
 */
const validateTableChanges = [
  body('changes').notEmpty().withMessage('Cambios requeridos'),
  body('changes.addColumns')
    .optional()
    .isArray().withMessage('addColumns debe ser un array'),
  body('changes.addColumns.*.name')
    .optional()
    .notEmpty().withMessage('Nombre de columna requerido'),
  body('changes.dropColumns')
    .optional()
    .isArray().withMessage('dropColumns debe ser un array'),
  body('changes.modifyColumns')
    .optional()
    .isArray().withMessage('modifyColumns debe ser un array'),
  handleValidationErrors
];

/**
 * Validar inserción de datos
 */
const validateRowData = [
  body('data').notEmpty().withMessage('Datos requeridos'),
  handleValidationErrors
];

/**
 * Validar índice
 */
const validateIndex = [
  body('indexName')
    .trim()
    .notEmpty().withMessage('Nombre de índice requerido')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/).withMessage('Nombre de índice inválido'),
  body('columns')
    .notEmpty().withMessage('Al menos una columna es requerida'),
  body('isUnique')
    .optional()
    .isBoolean().withMessage('isUnique debe ser booleano'),
  handleValidationErrors
];

/**
 * Validar backup
 */
const validateBackup = [
  body('backupName')
    .trim()
    .notEmpty().withMessage('Nombre de backup requerido')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre de backup debe tener entre 3 y 100 caracteres'),
  body('backupType')
    .optional()
    .isIn(['FULL', 'INCREMENTAL', 'SCHEMA_ONLY', 'DATA_ONLY'])
    .withMessage('Tipo de backup inválido'),
  body('tables')
    .optional()
    .isArray().withMessage('Tables debe ser un array'),
  handleValidationErrors
];

/**
 * Validar SQL query
 */
const validateSqlQuery = [
  body('query')
    .trim()
    .notEmpty().withMessage('Query requerida')
    .isLength({ min: 10 }).withMessage('Query muy corta'),
  body('isDraft')
    .optional()
    .isBoolean().withMessage('isDraft debe ser booleano'),
  handleValidationErrors
];

/**
 * Validar paginación
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page debe ser mayor a 0'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('PageSize debe estar entre 1 y 100'),
  handleValidationErrors
];

/**
 * Validar límite de auditoría
 */
const validateAuditLimit = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit debe estar entre 1 y 1000'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateTableName,
  validateTableNameParam,
  validateTableDefinition,
  validateTableChanges,
  validateRowData,
  validateIndex,
  validateBackup,
  validateSqlQuery,
  validatePagination,
  validateAuditLimit
};
