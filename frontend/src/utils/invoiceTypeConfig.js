/**
 * Configuración de campos dinámicos por tipo de documento
 * Define qué campos mostrar, cuáles son obligatorios, y secciones visibles
 */

export const invoiceTypeConfig = {
  'FC': {
    label: 'Factura Comercial',
    icon: '📄',
    description: 'Factura estándar de venta',
    color: 'blue',
    fields: {
      required: [
        'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
        'subtotal', 'total'
      ],
      optional: [
        'employeeId', 'orderNumber', 'dueDate', 'tax', 'discount',
        'description', 'notes', 'isReimbursable'
      ]
    },
    sections: {
      basic: true,
      amounts: true,
      authorizations: true,
      accounting: true,
      analysis: true,
      payment: true
    },
    specificFields: {
      showTax: true,
      showDiscount: true,
      showEmployee: true,
      showOrderNumber: true,
      showDueDate: true,
      showReimbursable: true,
      customReason: false
    }
  },

  'CC': {
    label: 'Nota Crédito',
    icon: '↩️',
    description: 'Devoluciones y ajustes negativos',
    color: 'orange',
    fields: {
      required: [
        'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
        'subtotal', 'reason', 'total'
      ],
      optional: [
        'employeeId', 'tax', 'discount', 'description', 'notes'
      ]
    },
    sections: {
      basic: true,
      amounts: true,
      authorizations: true,
      accounting: true,
      analysis: true,
      payment: false
    },
    specificFields: {
      showTax: true,
      showDiscount: true,
      showEmployee: true,
      showOrderNumber: false,
      showDueDate: false,
      showReimbursable: false,
      customReason: true,
      reasonLabel: 'Motivo de la Devolución'
    }
  },

  'ND': {
    label: 'Nota Débito',
    icon: '🔼',
    description: 'Ajustes positivos sobre facturas',
    color: 'red',
    fields: {
      required: [
        'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
        'subtotal', 'reason', 'total'
      ],
      optional: [
        'employeeId', 'tax', 'description', 'notes'
      ]
    },
    sections: {
      basic: true,
      amounts: true,
      authorizations: true,
      accounting: true,
      analysis: true,
      payment: false
    },
    specificFields: {
      showTax: true,
      showDiscount: false,
      showEmployee: true,
      showOrderNumber: false,
      showDueDate: false,
      showReimbursable: false,
      customReason: true,
      reasonLabel: 'Motivo del Ajuste'
    }
  },

  'SP': {
    label: 'Soporte',
    icon: '🛠️',
    description: 'Servicios diversos y comprobantes',
    color: 'green',
    fields: {
      required: [
        'invoiceNumber', 'providerId', 'costCenterId', 'issueDate',
        'serviceDescription', 'subtotal', 'total'
      ],
      optional: [
        'employeeId', 'tax', 'discount', 'notes'
      ]
    },
    sections: {
      basic: true,
      amounts: true,
      authorizations: true,
      accounting: false,
      analysis: false,
      payment: true
    },
    specificFields: {
      showTax: true,
      showDiscount: true,
      showEmployee: true,
      showOrderNumber: false,
      showDueDate: false,
      showReimbursable: false,
      customReason: false,
      serviceDescription: true
    }
  }
}

/**
 * Obtener validaciones específicas por tipo
 */
export const getRequiredFields = (typeCode) => {
  const config = invoiceTypeConfig[typeCode]
  return config ? config.fields.required : []
}

/**
 * Verificar si un campo debe mostrarse para este tipo
 */
export const shouldShowField = (typeCode, fieldName) => {
  const config = invoiceTypeConfig[typeCode]
  if (!config) return true

  const allFields = [
    ...config.fields.required,
    ...config.fields.optional
  ]

  return allFields.includes(fieldName)
}

/**
 * Obtener configuración visual de secciones
 */
export const getVisibleSections = (typeCode) => {
  const config = invoiceTypeConfig[typeCode]
  return config ? config.sections : {}
}

/**
 * Obtener configuración específica de campos
 */
export const getFieldConfig = (typeCode, fieldName) => {
  const config = invoiceTypeConfig[typeCode]
  if (!config) return {}

  return {
    isRequired: config.fields.required.includes(fieldName),
    isOptional: config.fields.optional.includes(fieldName),
    specific: config.specificFields
  }
}

/**
 * Validar todos los campos requeridos
 */
export const validateRequiredFields = (typeCode, formData) => {
  const required = getRequiredFields(typeCode)
  const missing = []

  for (const field of required) {
    if (!formData[field]) {
      missing.push(field)
    }
  }

  return {
    isValid: missing.length === 0,
    missing
  }
}
