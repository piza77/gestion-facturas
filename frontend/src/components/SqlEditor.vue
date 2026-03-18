<template>
  <div class="sql-editor">
    <div class="editor-header">
      <h3>🔤 Editor SQL</h3>
      <div class="header-controls">
        <label class="checkbox">
          <input v-model="isDraft" type="checkbox">
          <span>Modo prueba (Revisar sin guardar)</span>
        </label>
      </div>
    </div>

    <div class="editor-workspace">
      <textarea 
        v-model="queryInput"
        placeholder="Escribe tu query SQL aquí..."
        class="sql-input"
        @keydown.ctrl.enter="executeQuery"
      ></textarea>

      <div class="editor-actions">
        <button class="btn btn-primary" @click="executeQuery">
          ▶️ Ejecutar
        </button>
        <button class="btn btn-secondary" @click="clearQuery">
          🗑️ Limpiar
        </button>
        <button class="btn btn-info" @click="formatQuery">
          📋 Formatear
        </button>
      </div>

      <div v-if="queryResult" class="results-panel">
        <h4>Resultados</h4>
        <div v-if="queryResult.isDraft" class="draft-badge">
          ℹ️ Ejecución de prueba (reversada)
        </div>
        <table class="results-table" v-if="queryResult.result && queryResult.result.length">
          <thead>
            <tr>
              <th v-for="key in Object.keys(queryResult.result[0] || {})" :key="key">
                {{ key }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in queryResult.result.slice(0, 100)" :key="idx">
              <td v-for="key in Object.keys(queryResult.result[0] || {})" :key="key">
                {{ formatValue(row[key]) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-results">
          Sin resultados
        </div>
      </div>

      <div v-if="error" class="error-panel">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref } from 'vue';
import DatabaseService from '../services/database.service';

const queryInput = ref('');
const isDraft = ref(false);
const queryResult = ref(null);
const error = ref(null);

async function executeQuery() {
  try {
    error.value = null;
    queryResult.value = null;

    if (!queryInput.value.trim()) {
      error.value = 'Por favor escribe una query';
      return;
    }

    const response = await DatabaseService.executeSqlQuery(queryInput.value, isDraft.value);
    queryResult.value = response.data.data;
  } catch (err) {
    error.value = err.response?.data?.error || err.message;
  }
}

function clearQuery() {
  queryInput.value = '';
  queryResult.value = null;
  error.value = null;
}

function formatQuery() {
  // Básico formateo
  let formatted = queryInput.value
    .replace(/SELECT/gi, '\nSELECT')
    .replace(/FROM/gi, '\nFROM')
    .replace(/WHERE/gi, '\nWHERE')
    .replace(/JOIN/gi, '\nJOIN')
    .replace(/GROUP BY/gi, '\nGROUP BY')
    .replace(/ORDER BY/gi, '\nORDER BY');
  
  queryInput.value = formatted.trim();
}

function formatValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>

<style scoped>
.sql-editor {
  background: white;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h3 {
  margin: 0;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.editor-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sql-input {
  flex: 1;
  padding: 1rem;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: none;
  background: #fafafa;
}

.editor-actions {
  padding: 1rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-info {
  background: #2196F3;
  color: white;
}

.results-panel {
  padding: 1rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  max-height: 300px;
  overflow-y: auto;
}

.draft-badge {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 0.5rem;
  border-radius: 0.3rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.results-table th {
  background: #e0e0e0;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
}

.results-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.error-panel {
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-top: 1px solid #e0e0e0;
}

.empty-results {
  color: #999;
  padding: 1rem;
  text-align: center;
}
</style>
