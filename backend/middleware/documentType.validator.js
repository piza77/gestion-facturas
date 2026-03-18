const { body, validationResult } = require('express-validator');

const validateCreate = [
  body('name')
    .notEmpty().withMessage('Nombre requerido')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre entre 3-100 caracteres'),
  body('code')
    .notEmpty().withMessage('Código requerido')
    .isLength({ min: 2, max: 20 }).withMessage('Código entre 2-20 caracteres')
    .matches(/^[A-Z_]+$/).withMessage('Código: solo mayúsculas y guiones bajos'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('prefix')
    .optional()
    .isLength({ max: 10 }).withMessage('Prefijo máximo 10 caracteres'),
  body('fields')
    .optional()
    .isArray().withMessage('Campos debe ser un array')
    .custom((fields) => {
      if (Array.isArray(fields)) {
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (!field.name || !field.label || !field.type) {
            throw new Error(`Campo ${i}: requiere name, label y type`);
          }
          const validTypes = ['text', 'number', 'date', 'select', 'textarea', 'checkbox'];
          if (!validTypes.includes(field.type)) {
            throw new Error(`Campo ${i}: type inválido. Debe ser: ${validTypes.join(', ')}`);
          }
          if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
            throw new Error(`Campo ${i}: tipo 'select' requiere array 'options'`);
          }
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validación fallida',
        details: errors.array() 
      });
    }
    next();
  },
];

const validateUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('Nombre entre 3-100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('prefix')
    .optional()
    .isLength({ max: 10 }).withMessage('Prefijo máximo 10 caracteres'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser booleano'),
  body('fields')
    .optional()
    .isArray().withMessage('Campos debe ser un array')
    .custom((fields) => {
      if (Array.isArray(fields)) {
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (!field.name || !field.label || !field.type) {
            throw new Error(`Campo ${i}: requiere name, label y type`);
          }
          const validTypes = ['text', 'number', 'date', 'select', 'textarea', 'checkbox'];
          if (!validTypes.includes(field.type)) {
            throw new Error(`Campo ${i}: type inválido. Debe ser: ${validTypes.join(', ')}`);
          }
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validación fallida',
        details: errors.array() 
      });
    }
    next();
  },
];

module.exports = { validateCreate, validateUpdate };
