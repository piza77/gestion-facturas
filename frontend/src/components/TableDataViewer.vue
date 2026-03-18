<template>
  <div class="data-viewer">
    <!-- Toolbar -->
    <div class="viewer-toolbar">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar en los datos..."
          class="search-input"
        >
      </div>
      <button class="btn btn-primary" @click="showInsertModal = true">
        ➕ Nueva Fila
      </button>
      <select v-model="pageSize" @change="store.setPageSize(pageSize)" class="select">
        <option value="10">10 filas</option>
        <option value="25">25 filas</option>
        <option value="50">50 filas</option>
        <option value="100">100 filas</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <div v-if="store.hasData" class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="action-column">Acciones</th>
              <th v-for="col in columns" :key="col" class="data-column">
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in store.currentData" :key="idx" class="data-row">
              <td class="action-column">
                <button 
                  class="btn-icon-small edit"
                  @click="editRow(row)"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  class="btn-icon-small delete"
                  @click="deleteRow(row.id)"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
              <td v-for="col in columns" :key="col" class="data-column">
                <span class="cell-value">{{ formatValue(row[col]) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-data">
        <p>No hay datos en esta tabla</p>
        <button class="btn btn-primary" @click="showInsertModal = true">
          ➕ Insertar primer registro
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="store.totalPages > 1" class="pagination">
      <button 
        :disabled="store.currentPage === 1"
        @click="store.setPage(store.currentPage - 1)"
        class="btn-paginate"
      >
        Anterior
      </button>
      <span class="page-info">
        Página {{ store.currentPage }} de {{ store.totalPages }}
      </span>
      <button 
        :disabled="store.currentPage === store.totalPages"
        @click="store.setPage(store.currentPage + 1)"
        class="btn-paginate"
      >
        Siguiente
      </button>
    </div>

    <!-- Insert/Edit Modal -->
    <div v-if="showInsertModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Editar Fila' : 'Nueva Fila' }}</h3>
          <button class="close-btn" @click="closeModals">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div v-for="(value, key) in formData" :key="key" class="form-group">
              <label :for="`field-${key}`" class="form-label">{{ key }}</label>
              <input 
                :id="`field-${key}`"
                v-model="formData[key]"
                type="text"
                class="form-input"
              >
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ showEditModal ? 'Guardar Cambios' : 'Insertar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../stores/database.store';
import DatabaseService from '../services/database.service';

const props = defineProps({
  tableName: String
});

const emit = defineEmits(['row-inserted', 'row-updated', 'row-deleted']);

const store = useDatabaseStore();
const searchQuery = ref('');
const pageSize = ref(25);
const showInsertModal = ref(false);
const showEditModal = ref(false);
const formData = ref({});
const editingRowId = ref(null);

const columns = computed(() => {
  if (store.currentSchema?.columns) {
    return store.currentSchema.columns.map(c => c.name);
  }
  return [];
});

function formatValue(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

async function editRow(row) {
  editingRowId.value = row.id;
  formData.value = { ...row };
  showEditModal.value = true;
}

function deleteRow(rowId) {
  if (confirm('¿Eliminar esta fila?')) {
    store.deleteRow(props.tableName, rowId).then(() => {
      emit('row-deleted');
    });
  }
}

function closeModals() {
  showInsertModal.value = false;
  showEditModal.value = false;
  formData.value = {};
  editingRowId.value = null;
}

async function submitForm() {
  try {
    if (showEditModal.value) {
      await store.updateRow(props.tableName, editingRowId.value, formData.value);
      emit('row-updated');
    } else {
      await store.insertRow(props.tableName, formData.value);
      emit('row-inserted');
    }
    closeModals();
  } catch (error) {
    console.error('Error:', error);
  }
}

onMounted(() => {
  // Initialize form with empty fields from schema
  if (store.currentSchema?.columns) {
    const empty = {};
    store.currentSchema.columns.forEach(col => {
      empty[col.name] = '';
    });
    formData.value = empty;
  }
});
</script>

<style scoped>
.data-viewer {
  background: white;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.viewer-toolbar {
  padding: 1.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.9rem;
}

.select {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.9rem;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 60vh;
}

.table-responsive {
  min-width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f5f5f5;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
}

.data-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.data-row:hover {
  background: #fafafa;
}

.action-column {
  width: 100px;
  text-align: center;
}

.btn-icon-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem 0.4rem;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  transform: scale(1.2);
}

.btn-icon-small.delete:hover {
  color: #f44336;
}

.empty-data {
  padding: 3rem;
  text-align: center;
  color: #999;
}

.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.btn-paginate {
  padding: 0.6rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-paginate:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-paginate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  color: #666;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.6rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.cell-value {
  word-break: break-word;
  max-width: 300px;
  display: inline-block;
}
</style>
