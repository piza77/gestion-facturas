<template>
  <div class="dynamic-form-wrapper">
    <!-- Selector de Tipo de Documento -->
    <div class="type-selector-group">
      <label for="documentType">Tipo de Documento *</label>
      <div class="selector-container">
        <select 
          id="documentType"
          v-model="selectedTypeId" 
          @change="onTypeChange"
          :disabled="disabled || loading"
          required
        >
          <option value="">-- Seleccionar Tipo --</option>
          <option v-for="type in documentTypes" :key="type.id" :value="type.id">
            {{ type.name }} ({{ type.code }})
          </option>
        </select>
        <div v-if="selectedType" class="type-info">
          <span class="type-code">{{ selectedType.code }}</span>
          <span v-if="selectedType.description" class="type-desc">
            {{ selectedType.description }}
          </span>
        </div>
      </div>
    </div>

    <!-- Campos Dinámicos -->
    <div v-if="selectedTypeId && selectedType && selectedType.fields?.length" class="dynamic-fields">
      <div class="document-header">
        <h4>{{ selectedType.name }}</h4>
        <span v-if="generatedFolio" class="folio-badge">Folio: {{ generatedFolio }}</span>
      </div>

      <div class="fields-container">
        <div v-for="field in selectedType.fields" :key="field.id" class="field-group">
          <!-- Etiqueta del campo -->
          <label :for="`field_${field.id}`" class="field-label">
            {{ field.label }}
            <span v-if="field.isRequired" class="required">*</span>
          </label>

          <!-- Input de Texto -->
          <input
            v-if="field.type === 'text'"
            :id="`field_${field.id}`"
            v-model="formData[field.name]"
            type="text"
            :placeholder="`Ingresa ${field.label.toLowerCase()}`"
            :required="field.isRequired"
            :disabled="field.isReadOnly || disabled"
            class="field-input"
            @input="emitUpdate"
          >

          <!-- Input de Número -->
          <input
            v-else-if="field.type === 'number'"
            :id="`field_${field.id}`"
            v-model.number="formData[field.name]"
            type="number"
            :placeholder="`Ingresa ${field.label.toLowerCase()}`"
            :required="field.isRequired"
            :disabled="field.isReadOnly || disabled"
            class="field-input"
            @input="emitUpdate"
          >

          <!-- Input de Fecha -->
          <input
            v-else-if="field.type === 'date'"
            :id="`field_${field.id}`"
            v-model="formData[field.name]"
            type="date"
            :required="field.isRequired"
            :disabled="field.isReadOnly || disabled"
            class="field-input"
            @input="emitUpdate"
          >

          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="`field_${field.id}`"
            v-model="formData[field.name]"
            :required="field.isRequired"
            :disabled="field.isReadOnly || disabled"
            class="field-input"
            @change="emitUpdate"
          >
            <option value="">-- Seleccionar --</option>
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="`field_${field.id}`"
            v-model="formData[field.name]"
            :placeholder="`Ingresa ${field.label.toLowerCase()}`"
            rows="3"
            :required="field.isRequired"
            :disabled="field.isReadOnly || disabled"
            class="field-input"
            @input="emitUpdate"
          ></textarea>

          <!-- Checkbox -->
          <label
            v-else-if="field.type === 'checkbox'"
            class="checkbox-label"
          >
            <input
              :id="`field_${field.id}`"
              v-model="formData[field.name]"
              type="checkbox"
              :required="field.isRequired"
              :disabled="field.isReadOnly || disabled"
              class="field-checkbox"
              @change="emitUpdate"
            >
            <span>{{ field.label }}</span>
          </label>

          <!-- Fallback -->
          <div v-else class="field-unsupported">
            Tipo de campo no reconocido: {{ field.type }}
          </div>
        </div>
      </div>
    </div>

    <!-- Estado sin campos -->
    <div v-else-if="selectedTypeId && selectedType && !selectedType.fields?.length" class="no-fields-message">
      <p>Este tipo de documento no tiene campos definidos.</p>
    </div>

    <!-- Estado inicial -->
    <div v-else-if="!selectedTypeId" class="initial-state">
      <p>👆 Selecciona un tipo de documento para mostrar sus campos</p>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDocumentTypeStore } from '@/stores/documentType.store';
import documentTypeService from '@/services/documentType.service';

const emit = defineEmits(['update:modelValue', 'typeChanged', 'folioGenerated']);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autoGenerateFolio: {
    type: Boolean,
    default: true,
  },
});

const store = useDocumentTypeStore();
const loading = ref(false);
const selectedTypeId = ref(null);
const formData = ref({});
const generatedFolio = ref(null);

const documentTypes = computed(() => store.activeTypes);

const selectedType = computed(() => {
  if (!selectedTypeId.value) return null;
  return store.getTypeById(parseInt(selectedTypeId.value));
});

onMounted(async () => {
  loading.value = true;
  try {
    await store.fetchAllTypes();
  } catch (error) {
    console.error('Error loading document types:', error);
  } finally {
    loading.value = false;
  }
});

const onTypeChange = async () => {
  formData.value = {};
  generatedFolio.value = null;

  if (selectedTypeId.value && props.autoGenerateFolio) {
    try {
      const result = await documentTypeService.getNextFolio(selectedTypeId.value);
      generatedFolio.value = result.folio;
      emit('folioGenerated', result);
    } catch (error) {
      console.error('Error generating folio:', error);
    }
  }

  emit('typeChanged', selectedType.value);
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:modelValue', {
    documentTypeId: parseInt(selectedTypeId.value),
    folio: generatedFolio.value,
    data: { ...formData.value },
  });
};

// Watch para cambios desde afuera
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal?.documentTypeId && !selectedTypeId.value) {
      selectedTypeId.value = newVal.documentTypeId;
    }
  }
);
</script>

<style scoped>
.dynamic-form-wrapper {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  position: relative;
}

/* Type Selector */
.type-selector-group {
  margin-bottom: 2rem;
}

.type-selector-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.selector-container {
  position: relative;
}

.selector-container select {
  width: 100%;
  padding: 0.9rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5rem;
  padding-right: 2.5rem;
}

.selector-container select:hover {
  border-color: #1976d2;
}

.selector-container select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.selector-container select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f0f7ff;
  border-radius: 4px;
}

.type-code {
  background: #1976d2;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.85rem;
}

.type-desc {
  color: #666;
  font-size: 0.9rem;
  flex: 1;
}

/* Dynamic Fields */
.dynamic-fields {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.document-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.folio-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  font-family: monospace;
}

.fields-container {
  display: grid;
  gap: 1.5rem;
}

/* Field Group */
.field-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #d32f2f;
  margin-left: 4px;
}

/* Inputs */
.field-input,
.field-checkbox {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.field-input:hover:not(:disabled) {
  border-color: #bbb;
}

.field-input:focus:not(:disabled) {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.field-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

/* Textarea */
textarea.field-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  margin-bottom: 0;
}

.field-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
  flex-shrink: 0;
}

.field-checkbox:disabled {
  cursor: not-allowed;
}

/* Estados */
.initial-state,
.no-fields-message {
  text-align: center;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 4px;
  color: #999;
  border: 2px dashed #ddd;
}

.initial-state p,
.no-fields-message p {
  margin: 0;
  font-size: 0.95rem;
}

.field-unsupported {
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9rem;
}

/* Loading */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  z-index: 10;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dynamic-form-wrapper {
    padding: 1rem;
  }

  .type-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
