<template>
  <div class="document-type-admin">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <h1>📋 Tipos de Documento</h1>
        <p class="subtitle">Administra los tipos de documento disponibles en el sistema</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary btn-lg">
        <span class="icon">➕</span> Nuevo Tipo
      </button>
    </div>

    <!-- Estado de carga y errores -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tipos de documento...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">⚠️ {{ error }}</p>
      <button @click="loadTypes" class="btn btn-secondary">Reintentar</button>
    </div>

    <!-- Listado de tipos -->
    <div v-else class="types-container">
      <div v-if="types.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No hay tipos de documento</h3>
        <p>Crea tu primer tipo de documento para comenzar</p>
        <button @click="openCreateModal" class="btn btn-primary">Crear Ahora</button>
      </div>

      <div v-else class="types-grid">
        <div v-for="type in types" :key="type.id" class="type-card">
          <!-- Card Header -->
          <div class="card-header">
            <div class="header-left">
              <h3>{{ type.name }}</h3>
              <span class="badge badge-code">{{ type.code }}</span>
            </div>
            <div class="header-right">
              <span v-if="type.isActive" class="badge badge-active">✓ Activo</span>
              <span v-else class="badge badge-inactive">✗ Inactivo</span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <div v-if="type.description" class="info-row">
              <span class="label">Descripción:</span>
              <span class="value">{{ type.description }}</span>
            </div>
            <div class="info-row">
              <span class="label">Prefijo:</span>
              <span class="value code">{{ type.prefix }}</span>
            </div>
            <div class="info-row">
              <span class="label">Próximo #:</span>
              <span class="value">{{ type.nextSequence }}</span>
            </div>
            <div class="info-row">
              <span class="label">Campos:</span>
              <span class="value badge">{{ type.fields?.length || 0 }} campos</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <button @click="openEditModal(type)" class="btn btn-sm btn-secondary">
              ✏️ Editar
            </button>
            <button @click="openDetailModal(type)" class="btn btn-sm btn-info">
              👁️ Detalles
            </button>
            <button @click="confirmDelete(type)" class="btn btn-sm btn-danger">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeFormModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? '✏️ Editar' : '➕ Nuevo' }} Tipo de Documento</h2>
          <button @click="closeFormModal" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="saveType" class="form">
          <!-- Nombre -->
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input 
              id="name"
              v-model="form.name" 
              type="text" 
              placeholder="ej: Factura de Venta"
              required
            >
          </div>

          <!-- Código -->
          <div class="form-group">
            <label for="code">Código *</label>
            <input 
              id="code"
              v-model="form.code" 
              type="text" 
              placeholder="ej: FAC_VENTA"
              :disabled="isEditing"
              required
            >
            <small>Mayúsculas y guiones bajos. No se puede cambiar después.</small>
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              v-model="form.description" 
              rows="3"
              placeholder="Describe el propósito de este tipo de documento"
            ></textarea>
          </div>

          <!-- Prefijo -->
          <div class="form-group">
            <label for="prefix">Prefijo</label>
            <input 
              id="prefix"
              v-model="form.prefix" 
              type="text" 
              placeholder="ej: FV-"
              maxlength="10"
            >
            <small>Se antepone al número secuencial (ej: FV-000001)</small>
          </div>

          <!-- Campos dinámicos -->
          <div class="fields-section">
            <div class="section-header">
              <h4>Campos del Documento</h4>
              <span class="count">{{ form.fields?.length || 0 }} campos</span>
            </div>

            <div v-if="form.fields.length === 0" class="no-fields">
              <p>Sin campos. Agrega campos para definir la estructura.</p>
            </div>

            <div v-else class="fields-list">
              <div 
                v-for="(field, idx) in form.fields" 
                :key="idx" 
                class="field-item"
              >
                <div class="field-grid">
                  <input 
                    v-model="field.name" 
                    type="text" 
                    placeholder="Nombre (ej: numeroFactura)"
                    class="field-name"
                  >
                  <input 
                    v-model="field.label" 
                    type="text" 
                    placeholder="Etiqueta (ej: Número de Factura)"
                    class="field-label"
                  >
                  <select v-model="field.type" class="field-type">
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="select">Selección</option>
                    <option value="textarea">Área texto</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <label class="field-required">
                    <input v-model="field.isRequired" type="checkbox">
                    Requerido
                  </label>
                  <button 
                    @click="removeField(idx)" 
                    type="button" 
                    class="btn-remove"
                  >
                    ✕
                  </button>
                </div>

                <!-- Opciones para select -->
                <div v-if="field.type === 'select'" class="field-options">
                  <label>Opciones (separadas por coma)</label>
                  <input 
                    v-model="field.optionsText" 
                    type="text" 
                    placeholder="Opción 1, Opción 2, Opción 3"
                  >
                </div>
              </div>
            </div>

            <button 
              @click="addField" 
              type="button" 
              class="btn btn-sm btn-secondary add-field-btn"
            >
              + Agregar Campo
            </button>
          </div>

          <!-- Acciones -->
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
            <button @click="closeFormModal" type="button" class="btn btn-secondary btn-lg">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalles -->
    <div v-if="showDetailModal && detailType" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h2>📋 Detalles: {{ detailType.name }}</h2>
          <button @click="closeDetailModal" class="close-btn">✕</button>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h4>Información General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Nombre:</span>
                <span class="value">{{ detailType.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Código:</span>
                <span class="value code">{{ detailType.code }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Prefijo:</span>
                <span class="value code">{{ detailType.prefix }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Estado:</span>
                <span class="value">
                  <span v-if="detailType.isActive" class="badge badge-active">Activo</span>
                  <span v-else class="badge badge-inactive">Inactivo</span>
                </span>
              </div>
            </div>
          </div>

          <div v-if="detailType.description" class="detail-section">
            <h4>Descripción</h4>
            <p>{{ detailType.description }}</p>
          </div>

          <div class="detail-section">
            <h4>Campos Definidos ({{ detailType.fields?.length || 0 }})</h4>
            <table v-if="detailType.fields?.length" class="fields-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Etiqueta</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Requerido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(field, idx) in detailType.fields" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ field.label }}</td>
                  <td><code>{{ field.name }}</code></td>
                  <td><span class="badge">{{ field.type }}</span></td>
                  <td>
                    <span v-if="field.isRequired" class="badge badge-active">✓ Sí</span>
                    <span v-else class="badge">No</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="no-fields">Sin campos definidos</p>
          </div>

          <div class="detail-section">
            <h4>Auditoría</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Creado por:</span>
                <span class="value">{{ detailType.creator?.name }} ({{ detailType.creator?.email }})</span>
              </div>
              <div class="detail-item">
                <span class="label">Creado:</span>
                <span class="value">{{ formatDate(detailType.createdAt) }}</span>
              </div>
              <div v-if="detailType.updater" class="detail-item">
                <span class="label">Actualizado por:</span>
                <span class="value">{{ detailType.updater?.name }}</span>
              </div>
              <div v-if="detailType.updatedAt !== detailType.createdAt" class="detail-item">
                <span class="label">Actualizado:</span>
                <span class="value">{{ formatDate(detailType.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Eliminar -->
    <div v-if="showConfirmDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-header">
          <h2>⚠️ Confirmar Eliminación</h2>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar el tipo de documento?</p>
          <p class="emphasis">{{ typeToDelete?.name }}</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button @click="performDelete" class="btn btn-danger btn-lg">
            Eliminar
          </button>
          <button @click="cancelDelete" class="btn btn-secondary btn-lg">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDocumentTypeStore } from '@/stores/documentType.store';

const store = useDocumentTypeStore();

const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const showFormModal = ref(false);
const showDetailModal = ref(false);
const showConfirmDelete = ref(false);
const isEditing = ref(false);
const detailType = ref(null);
const typeToDelete = ref(null);

const types = computed(() => store.activeTypes);

const form = ref({
  name: '',
  code: '',
  description: '',
  prefix: '',
  fields: [],
});

onMounted(() => {
  loadTypes();
});

const loadTypes = async () => {
  loading.value = true;
  try {
    await store.fetchAllTypes();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    name: '',
    code: '',
    description: '',
    prefix: '',
    fields: [],
  };
  showFormModal.value = true;
};

const openEditModal = (type) => {
  isEditing.value = true;
  form.value = {
    name: type.name,
    code: type.code,
    description: type.description,
    prefix: type.prefix,
    fields: type.fields?.map(f => ({
      ...f,
      optionsText: f.options?.join(', ') || '',
    })) || [],
  };
  showFormModal.value = true;
};

const openDetailModal = async (type) => {
  detailType.value = await store.fetchTypeById(type.id);
  showDetailModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  detailType.value = null;
};

const addField = () => {
  form.value.fields.push({
    name: '',
    label: '',
    type: 'text',
    isRequired: false,
    options: [],
    optionsText: '',
  });
};

const removeField = (idx) => {
  form.value.fields.splice(idx, 1);
};

const saveType = async () => {
  saving.value = true;
  try {
    // Procesar campos con opciones
    const fields = form.value.fields.map(f => {
      const field = {
        name: f.name,
        label: f.label,
        type: f.type,
        isRequired: f.isRequired,
      };
      
      if (f.type === 'select' && f.optionsText) {
        field.options = f.optionsText.split(',').map(o => o.trim());
      }
      
      return field;
    });

    const data = {
      name: form.value.name,
      code: form.value.code,
      description: form.value.description,
      prefix: form.value.prefix,
      fields,
    };

    if (isEditing.value) {
      await store.updateType(detailType.value?.id || form.value.code, data);
    } else {
      await store.createType(data);
    }

    showFormModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.error || err.message;
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (type) => {
  typeToDelete.value = type;
  showConfirmDelete.value = true;
};

const performDelete = async () => {
  try {
    await store.deleteType(typeToDelete.value.id);
    showConfirmDelete.value = false;
    typeToDelete.value = null;
  } catch (err) {
    error.value = err.message;
  }
};

const cancelDelete = () => {
  showConfirmDelete.value = false;
  typeToDelete.value = null;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.document-type-admin {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

/* Loading/Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-weight: bold;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #999;
  margin: 0;
}

.empty-state p {
  color: #bbb;
  margin: 0.5rem 0 1.5rem;
}

/* Grid de tipos */
.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Tarjeta tipo */
.type-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.type-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 2px solid #f5f5f5;
}

.header-left h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.info-row .label {
  color: #666;
  font-weight: 500;
}

.info-row .value {
  color: #333;
  font-weight: 600;
}

.info-row .value.code {
  font-family: monospace;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f5f5f5;
}

.card-footer .btn {
  flex: 1;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  background: #e3f2fd;
  color: #1976d2;
}

.badge-code {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-inactive {
  background: #ffebee;
  color: #c62828;
}

.badge-info {
  background: #e0f2f1;
  color: #00695c;
}

/* Modal */
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.modal-lg {
  max-width: 800px;
}

.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #666;
}

.modal-body .emphasis {
  color: #333;
  font-weight: bold;
  font-size: 1.1rem;
}

.modal-body .warning {
  color: #d32f2f;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  text-align: right;
  border-top: 1px solid #e0e0e0;
}

/* Formulario */
.form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: #999;
  font-size: 0.85rem;
}

/* Sección de campos */
.fields-section {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #fafafa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h4 {
  margin: 0;
  color: #333;
}

.count {
  background: #1976d2;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.no-fields {
  text-align: center;
  color: #999;
  padding: 1rem;
  margin: 0;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field-item {
  background: white;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1.2fr auto;
  gap: 0.5rem;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.field-name,
.field-label,
.field-type {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 0.85rem;
}

.field-required {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  cursor: pointer;
  font-size: 0.85rem;
}

.field-required input {
  margin: 0;
  width: auto;
}

.btn-remove {
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 3px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #b71c1c;
}

.field-options {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 3px;
}

.field-options label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.field-options input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 0.85rem;
}

.add-field-btn {
  width: 100%;
}

/* Acciones Modal */
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

/* Detalles */
.detail-content {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #1976d2;
  font-size: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.detail-item code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-family: monospace;
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.fields-table thead {
  background: #f5f5f5;
}

.fields-table th {
  padding: 0.75rem;
  text-align: left;
  color: #666;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #ddd;
}

.fields-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.fields-table code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-family: monospace;
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.btn-danger:hover {
  background: #c62828;
}

.btn-info {
  background: #00897b;
  color: white;
}

.btn-info:hover {
  background: #00695c;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-lg {
  padding: 0.9rem 2rem;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
  }

  .types-grid {
    grid-template-columns: 1fr;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-content {
    max-width: 95%;
  }
}
</style>
