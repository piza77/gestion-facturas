# 📄 MÓDULO TIPOS DE DOCUMENTO
## Sistema de Gestión de Facturas v1.4 (Planeado)

**Propósito:** Permitir administradores crear y configurar tipos de documentos dinámicos con campos personalizables

**Estado:** 🔵 ESPECIFICACIÓN COMPLETA  
**Complejidad:** 🟢 BAJA (40-60 horas)  
**Fecha Creación:** 18 de Marzo de 2026

---

## 1. MODELO DE DATOS

### 1.1 Tabla: `document_types`

```sql
CREATE TABLE document_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  prefix VARCHAR(10),
  nextSequence INT DEFAULT 1,
  isActive BOOLEAN DEFAULT true,
  
  -- Campos dinámicos (almacenados como JSON)
  fields JSON,
  
  -- Auditoría
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedBy INT,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL,
  
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (updatedBy) REFERENCES users(id),
  INDEX (code),
  INDEX (isActive)
);
```

### 1.2 Estructura JSON de campos

```json
{
  "fields": [
    {
      "id": "field_001",
      "name": "numeroFactura",
      "label": "Número de Factura",
      "type": "number",
      "isRequired": true,
      "isReadOnly": false,
      "order": 1
    },
    {
      "id": "field_002",
      "name": "moneda",
      "label": "Moneda",
      "type": "select",
      "isRequired": true,
      "options": ["MXN", "USD", "EUR"],
      "order": 2
    },
    {
      "id": "field_003",
      "name": "observaciones",
      "label": "Observaciones",
      "type": "textarea",
      "isRequired": false,
      "order": 3
    }
  ]
}
```

### 1.3 Tabla: `documents` (nueva)

```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  documentTypeId INT NOT NULL,
  folio VARCHAR(50) UNIQUE NOT NULL,
  
  -- Datos dinámicos según tipo
  data JSON NOT NULL,
  
  -- Facturas relación
  invoiceId INT,
  
  -- Estados
  status ENUM('DRAFT', 'ACTIVE', 'VOIDED') DEFAULT 'DRAFT',
  
  -- Auditoría
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedBy INT,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (documentTypeId) REFERENCES document_types(id),
  FOREIGN KEY (invoiceId) REFERENCES invoices(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  INDEX (documentTypeId),
  INDEX (status),
  INDEX (folio)
);
```

---

## 2. BACKEND

### 2.1 Sequelize Model: `DocumentType.js`

```javascript
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
      validate: { notEmpty: true },
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
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
    });
  };

  return DocumentType;
};
```

### 2.2 Sequelize Model: `Document.js`

```javascript
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
  };

  return Document;
};
```

### 2.3 Controller: `documentType.controller.js`

```javascript
const { DocumentType, User } = require('../models');

class DocumentTypeController {
  // GET todas los tipos de documentos
  async getAllDocumentTypes(req, res) {
    try {
      const types = await DocumentType.findAll({
        where: { isActive: true },
        include: ['creator', 'updater'],
        order: [['name', 'ASC']],
      });
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET un tipo de documento por ID
  async getDocumentTypeById(req, res) {
    try {
      const { id } = req.params;
      const type = await DocumentType.findByPk(id, {
        include: ['creator', 'updater', 'documents'],
      });
      if (!type) return res.status(404).json({ error: 'Tipo no encontrado' });
      res.json(type);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST crear nuevo tipo de documento
  async createDocumentType(req, res) {
    try {
      const { name, code, description, prefix, fields } = req.body;
      const userId = req.user.id;

      // Validar que solo ADMIN puede crear
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores' });
      }

      // Validaciones
      if (!name || !code) {
        return res.status(400).json({ error: 'Nombre y código requeridos' });
      }

      // Verificar que code sea único
      const existing = await DocumentType.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Código ya existe' });
      }

      const newType = await DocumentType.create({
        name,
        code,
        description,
        prefix: prefix || code.substring(0, 3).toUpperCase(),
        fields: fields || [],
        createdBy: userId,
      });

      res.status(201).json(newType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT actualizar tipo de documento
  async updateDocumentType(req, res) {
    try {
      const { id } = req.params;
      const { name, description, prefix, fields, isActive } = req.body;

      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores' });
      }

      const type = await DocumentType.findByPk(id);
      if (!type) return res.status(404).json({ error: 'Tipo no encontrado' });

      await type.update({
        name: name || type.name,
        description: description || type.description,
        prefix: prefix || type.prefix,
        fields: fields || type.fields,
        isActive: isActive !== undefined ? isActive : type.isActive,
        updatedBy: req.user.id,
      });

      res.json(type);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE (soft delete)
  async deleteDocumentType(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores' });
      }

      const type = await DocumentType.findByPk(id);
      if (!type) return res.status(404).json({ error: 'Tipo no encontrado' });

      await type.update({ isActive: false });

      res.json({ message: 'Tipo desactivado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST Generar próximo folio
  async getNextFolio(req, res) {
    try {
      const { documentTypeId } = req.params;
      const type = await DocumentType.findByPk(documentTypeId);

      if (!type) return res.status(404).json({ error: 'Tipo no encontrado' });

      const folio = `${type.prefix}${String(type.nextSequence).padStart(6, '0')}`;
      
      await type.update({
        nextSequence: type.nextSequence + 1,
        updatedBy: req.user.id,
      });

      res.json({ folio });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DocumentTypeController();
```

### 2.4 Routes: `documentType.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const documentTypeController = require('../controllers/documentType.controller');
const auth = require('../middleware/auth');
const validator = require('../middleware/documentType.validator');

// Proteger todas las rutas con autenticación
router.use(auth.verifyToken);

// CRUD
router.get('/', documentTypeController.getAllDocumentTypes);
router.get('/:id', documentTypeController.getDocumentTypeById);
router.post('/', validator.validateCreate, documentTypeController.createDocumentType);
router.put('/:id', validator.validateUpdate, documentTypeController.updateDocumentType);
router.delete('/:id', documentTypeController.deleteDocumentType);

// Generar próximo folio
router.post('/:documentTypeId/next-folio', documentTypeController.getNextFolio);

module.exports = router;
```

### 2.5 Validator: `documentType.validator.js`

```javascript
const { body, validationResult } = require('express-validator');

const validateCreate = [
  body('name')
    .notEmpty().withMessage('Nombre requerido')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre entre 3-100 caracteres'),
  body('code')
    .notEmpty().withMessage('Código requerido')
    .isLength({ min: 2, max: 20 }).withMessage('Código entre 2-20 caracteres')
    .matches(/^[A-Z_]+$/).withMessage('Código: mayúsculas y guiones bajos'),
  body('fields')
    .isArray().withMessage('Campos debe ser un array'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdate = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('Nombre entre 3-100 caracteres'),
  body('fields')
    .optional()
    .isArray().withMessage('Campos debe ser un array'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateCreate, validateUpdate };
```

---

## 3. FRONTEND

### 3.1 Vue Component: `DocumentTypeAdmin.vue`

```vue
<template>
  <div class="document-type-admin">
    <!-- Header -->
    <div class="header">
      <h2>Configurar Tipos de Documento</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + Nuevo Tipo
      </button>
    </div>

    <!-- Listado de tipos -->
    <div class="types-list">
      <div v-if="types.length === 0" class="empty-state">
        No hay tipos de documento. Crea uno nuevo.
      </div>

      <div v-for="type in types" :key="type.id" class="type-card">
        <div class="type-header">
          <h3>{{ type.name }}</h3>
          <span class="code-badge">{{ type.code }}</span>
        </div>
        
        <div class="type-info">
          <p><strong>Descripción:</strong> {{ type.description }}</p>
          <p><strong>Prefijo:</strong> {{ type.prefix }}</p>
          <p><strong>Próximo Seq:</strong> {{ type.nextSequence }}</p>
          <p><strong>Campos:</strong> {{ type.fields?.length || 0 }}</p>
        </div>

        <div class="actions">
          <button @click="editType(type)" class="btn btn-sm btn-secondary">
            ✏️ Editar
          </button>
          <button @click="deleteType(type.id)" class="btn btn-sm btn-danger">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <h3>{{ editingType ? 'Editar' : 'Nuevo' }} Tipo de Documento</h3>

        <form @submit.prevent="saveType">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.name" type="text" required>
          </div>

          <div class="form-group">
            <label>Código *</label>
            <input v-model="form.code" type="text" placeholder="FAC_VENTA" required>
            <small>Mayúsculas, sin espacios: FAC_VENTA, NOT_CREDITO, etc</small>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Prefijo</label>
            <input v-model="form.prefix" type="text" placeholder="FV-">
          </div>

          <!-- Campos dinámicos -->
          <div class="fields-section">
            <h4>Campos del Documento</h4>
            <div v-for="(field, idx) in form.fields" :key="idx" class="field-item">
              <input v-model="field.name" type="text" placeholder="Nombre campo">
              <input v-model="field.label" type="text" placeholder="Etiqueta">
              <select v-model="field.type">
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Fecha</option>
                <option value="select">Selección</option>
                <option value="textarea">Área de texto</option>
              </select>
              <input v-model="field.isRequired" type="checkbox"> Requerido
              <button @click="removeField(idx)" type="button" class="btn-remove">×</button>
            </div>
            <button @click="addField" type="button" class="btn btn-sm btn-secondary">
              + Agregar Campo
            </button>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button @click="closeForm" type="button" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { documentTypeService } from '@/services/documentType.service';

const types = ref([]);
const showForm = ref(false);
const editingType = ref(null);
const form = ref({
  name: '',
  code: '',
  description: '',
  prefix: '',
  fields: [],
});

onMounted(async () => {
  await loadTypes();
});

const loadTypes = async () => {
  try {
    types.value = await documentTypeService.getAllTypes();
  } catch (error) {
    console.error('Error cargando tipos:', error);
  }
};

const editType = (type) => {
  editingType.value = type;
  form.value = { ...type };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingType.value = null;
  form.value = {
    name: '',
    code: '',
    description: '',
    prefix: '',
    fields: [],
  };
};

const addField = () => {
  form.value.fields.push({
    name: '',
    label: '',
    type: 'text',
    isRequired: false,
    order: form.value.fields.length + 1,
  });
};

const removeField = (idx) => {
  form.value.fields.splice(idx, 1);
};

const saveType = async () => {
  try {
    if (editingType.value) {
      await documentTypeService.updateType(editingType.value.id, form.value);
    } else {
      await documentTypeService.createType(form.value);
    }
    await loadTypes();
    closeForm();
  } catch (error) {
    console.error('Error guardando tipo:', error);
  }
};

const deleteType = async (id) => {
  if (confirm('¿Eliminar este tipo de documento?')) {
    try {
      await documentTypeService.deleteType(id);
      await loadTypes();
    } catch (error) {
      console.error('Error eliminando tipo:', error);
    }
  }
};
</script>

<style scoped>
.document-type-admin {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.types-list {
  display: grid;
  gap: 1.5rem;
}

.type-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f9f9f9;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.code-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.type-info p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.fields-section {
  border: 1px solid #e0e0e0;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.field-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.field-item input,
.field-item select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-remove {
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
</style>
```

### 3.2 Service: `documentType.service.js`

```javascript
import axios from 'axios';

const API_BASE = '/api/document-types';

export const documentTypeService = {
  getAllTypes() {
    return axios.get(API_BASE).then(res => res.data);
  },

  getTypeById(id) {
    return axios.get(`${API_BASE}/${id}`).then(res => res.data);
  },

  createType(data) {
    return axios.post(API_BASE, data).then(res => res.data);
  },

  updateType(id, data) {
    return axios.put(`${API_BASE}/${id}`, data).then(res => res.data);
  },

  deleteType(id) {
    return axios.delete(`${API_BASE}/${id}`).then(res => res.data);
  },

  getNextFolio(documentTypeId) {
    return axios.post(`${API_BASE}/${documentTypeId}/next-folio`)
      .then(res => res.data);
  },
};
```

### 3.3 Form Dinámico: `DynamicDocumentForm.vue`

```vue
<template>
  <div class="dynamic-form">
    <div class="form-header">
      <label for="docType">Tipo de Documento *</label>
      <select v-model="selectedTypeId" @change="onTypeChange" required>
        <option value="">-- Seleccionar --</option>
        <option v-for="type in documentTypes" :key="type.id" :value="type.id">
          {{ type.name }}
        </option>
      </select>
    </div>

    <!-- Renderizar campos dinámicos -->
    <div v-if="selectedTypeId && selectedType" class="dynamic-fields">
      <h4>{{ selectedType.name }}</h4>
      
      <div v-for="field in selectedType.fields" :key="field.id" class="form-group">
        <label :for="`field_${field.id}`">
          {{ field.label }}
          <span v-if="field.isRequired" class="required">*</span>
        </label>

        <!-- Text Input -->
        <input
          v-if="field.type === 'text'"
          :id="`field_${field.id}`"
          v-model="formData[field.name]"
          type="text"
          :required="field.isRequired"
          :readonly="field.isReadOnly"
        >

        <!-- Number Input -->
        <input
          v-else-if="field.type === 'number'"
          :id="`field_${field.id}`"
          v-model.number="formData[field.name]"
          type="number"
          :required="field.isRequired"
        >

        <!-- Date Input -->
        <input
          v-else-if="field.type === 'date'"
          :id="`field_${field.id}`"
          v-model="formData[field.name]"
          type="date"
          :required="field.isRequired"
        >

        <!-- Select -->
        <select
          v-else-if="field.type === 'select'"
          :id="`field_${field.id}`"
          v-model="formData[field.name]"
          :required="field.isRequired"
        >
          <option value="">-- Seleccionar --</option>
          <option v-for="opt in field.options" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>

        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="`field_${field.id}`"
          v-model="formData[field.name]"
          rows="3"
          :required="field.isRequired"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { documentTypeService } from '@/services/documentType.service';

const emit = defineEmits(['update:modelValue', 'typeSelected']);

const props = defineProps({
  modelValue: Object,
});

const documentTypes = ref([]);
const selectedTypeId = ref(null);
const formData = ref({});

onMounted(async () => {
  documentTypes.value = await documentTypeService.getAllTypes();
});

const selectedType = computed(() => {
  return documentTypes.value.find(t => t.id === parseInt(selectedTypeId.value));
});

const onTypeChange = () => {
  formData.value = {};
  emit('typeSelected', selectedType.value);
};

// Watch formData changes
const updateFormData = (newData) => {
  emit('update:modelValue', {
    documentTypeId: selectedTypeId.value,
    data: newData,
  });
};
</script>

<style scoped>
.dynamic-form {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-header select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dynamic-fields {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95rem;
}

.required {
  color: #d32f2f;
  margin-left: 2px;
}
</style>
```

---

## 4. INTEGRACIÓN CON MÓDULO FACTURAS

### 4.1 Actualizar `InvoiceForm.vue`

```vue
<!-- Agregar al inicio del formulario de facturas -->
<DynamicDocumentForm
  v-model="invoice.documentData"
  @typeSelected="onDocumentTypeSelected"
/>
```

### 4.2 Script de Migración

```sql
-- Migration: add_document_types_tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla document_types
    await queryInterface.createTable('document_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      description: Sequelize.TEXT,
      prefix: Sequelize.STRING(10),
      nextSequence: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      fields: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updatedBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // Crear tabla documents
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      documentTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'document_types',
          key: 'id',
        },
      },
      folio: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      invoiceId: Sequelize.INTEGER,
      status: {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'VOIDED'),
        defaultValue: 'DRAFT',
      },
      createdBy: Sequelize.INTEGER,
      updatedBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // Crear índices
    await queryInterface.addIndex('document_types', ['code']);
    await queryInterface.addIndex('document_types', ['isActive']);
    await queryInterface.addIndex('documents', ['documentTypeId']);
    await queryInterface.addIndex('documents', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');
    await queryInterface.dropTable('document_types');
  },
};
```

---

## 5. EJEMPLOS PREDEFINIDOS

### 5.1 Seeder de Tipos de Documento

```javascript
// seeders/document-types.seeder.js
module.exports = {
  async up(queryInterface, Sequelize) {
    const types = [
      {
        name: 'Factura de Venta',
        code: 'FAC_VENTA',
        description: 'Factura emitida por venta de bienes o servicios',
        prefix: 'FV-',
        nextSequence: 1,
        isActive: true,
        fields: JSON.stringify([
          {
            id: 'fv_001',
            name: 'numeroFactura',
            label: 'Número de Factura',
            type: 'text',
            isRequired: true,
            order: 1,
          },
          {
            id: 'fv_002',
            name: 'series',
            label: 'Serie',
            type: 'select',
            isRequired: true,
            options: ['A', 'B', 'C'],
            order: 2,
          },
          {
            id: 'fv_003',
            name: 'moneda',
            label: 'Moneda',
            type: 'select',
            isRequired: true,
            options: ['MXN', 'USD'],
            order: 3,
          },
        ]),
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Nota de Crédito',
        code: 'NOT_CREDITO',
        description: 'Documento que reduce obligación de pago',
        prefix: 'NC-',
        nextSequence: 1,
        isActive: true,
        fields: JSON.stringify([
          {
            id: 'nc_001',
            name: 'facturaOriginal',
            label: 'Factura Original',
            type: 'text',
            isRequired: true,
            order: 1,
          },
          {
            id: 'nc_002',
            name: 'razon',
            label: 'Razón de Crédito',
            type: 'select',
            isRequired: true,
            options: ['Devolución', 'Descuento', 'Error'],
            order: 2,
          },
        ]),
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Recibo de Pago',
        code: 'REC_PAGO',
        description: 'Constancia de recepción de pago',
        prefix: 'RP-',
        nextSequence: 1,
        isActive: true,
        fields: JSON.stringify([
          {
            id: 'rp_001',
            name: 'montoRecibido',
            label: 'Monto Recibido',
            type: 'number',
            isRequired: true,
            order: 1,
          },
          {
            id: 'rp_002',
            name: 'metodoPago',
            label: 'Método de Pago',
            type: 'select',
            isRequired: true,
            options: ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta'],
            order: 2,
          },
          {
            id: 'rp_003',
            name: 'referencia',
            label: 'Referencia de Pago',
            type: 'text',
            isRequired: false,
            order: 3,
          },
        ]),
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('document_types', types);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('document_types', null, {});
  },
};
```

---

## 6. CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear modelos Sequelize (DocumentType, Document)
- [ ] Crear migraciones BD
- [ ] Crear controller y routes backend
- [ ] Crear validator middleware
- [ ] Crear service Vue.js
- [ ] Crear componentes Vue (Admin, Form dinámico)
- [ ] Integrar en módulo Facturas
- [ ] Agregar rutas en router
- [ ] Tests unitarios backend
- [ ] Tests E2E con Cypress
- [ ] Documentación de uso
- [ ] Capacitación usuario admin

---

## 7. ESTIMACIÓN DE ESFUERZO

| Tarea | Horas | Dev |
|---|:---:|---|
| Backend (modelos + API) | 8 | Senior BE |
| Frontend (componentes) | 10 | Sr FE |
| Tests | 6 | QA |
| Integración | 4 | Fullstack |
| Documentación | 3 | Tech Lead |
| **TOTAL** | **~35h** | **1 dev** |

**Timeline:** 1 semana (fulltime) o 2 semanas (part-time)

---

Toda la estructura está lista. ¿Quieres que creo los archivos directamente o tienes preguntas? 🚀

