<template>
  <div class="database-manager-container">
    <!-- Header -->
    <div class="db-header">
      <div class="header-content">
        <h1>🗄️ Gestor de Base de Datos</h1>
        <p class="subtitle">Panel de administración completo para gestionar tablas, esquemas y backups</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateTableModal = true">
          <span class="icon">➕</span> Nueva Tabla
        </button>
        <button class="btn btn-info" @click="showBackupModal = true">
          <span class="icon">💾</span> Backup
        </button>
        <button class="btn btn-secondary" @click="showRefresh">
          <span class="icon">🔄</span> Actualizar
        </button>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="db-main">
      <!-- Sidebar -->
      <aside class="db-sidebar">
        <div class="sidebar-section">
          <h3>Tablas de Base de Datos</h3>
          <div class="search-box">
            <input 
              v-model="tableSearchFilter" 
              type="text" 
              placeholder="Buscar tabla..."
              class="search-input"
            >
          </div>
          <div class="tables-list">
            <div 
              v-for="table in filteredTables" 
              :key="table"
              class="table-item"
              :class="{ active: store.selectedTable === table }"
              @click="store.selectTable(table)"
            >
              <span class="icon">📊</span>
              <span class="name">{{ table }}</span>
            </div>
            <div v-if="filteredTables.length === 0" class="empty-message">
              No hay tablas
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Herramientas</h3>
          <button class="tool-btn" @click="showSqlEditor = true">
            <span>🔤</span> Editor SQL
          </button>
          <button class="tool-btn" @click="showAuditLog = true">
            <span>📝</span> Auditoría
          </button>
          <button class="tool-btn" @click="store.fetchVersionHistory(store.selectedTable)">
            <span>📅</span> Versiones
          </button>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="db-content">
        <!-- Empty State -->
        <div v-if="!store.selectedTable" class="empty-state">
          <div class="empty-icon">🗄️</div>
          <h2>Selecciona una tabla</h2>
          <p>Haz clic en una tabla en el panel de la izquierda para ver sus detalles</p>
        </div>

        <!-- Table Details -->
        <template v-else>
          <div class="table-header">
            <h2>{{ store.selectedTable }}</h2>
            <div class="table-actions">
              <button class="btn-icon" title="Editar estructura" @click="showEditSchemaModal = true">
                ✏️ Editar
              </button>
              <button class="btn-icon btn-danger" title="Eliminar tabla" @click="confirmDropTable">
                🗑️ Eliminar
              </button>
              <button class="btn-icon btn-warning" title="Vaciar tabla" @click="confirmTruncate">
                🧹 Vaciar
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button 
              v-for="tab in tabs"
              :key="tab"
              :class="['tab', { active: activeTab === tab }]"
              @click="activeTab = tab"
            >
              {{ getTabLabel(tab) }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Schema Tab -->
            <div v-if="activeTab === 'schema'" class="schema-view">
              <div v-if="store.currentSchema" class="schema-details">
                <div class="section">
                  <h3>Columnas</h3>
                  <table class="schema-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Nulable</th>
                        <th>Default</th>
                        <th>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="col in store.currentSchema.columns" :key="col.name">
                        <td><strong>{{ col.name }}</strong></td>
                        <td><code>{{ col.type }}</code></td>
                        <td>{{ col.nullable ? '✓' : '✗' }}</td>
                        <td><code v-if="col.defaultValue">{{ col.defaultValue }}</code></td>
                        <td>{{ col.comment }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="store.currentSchema.indexes && store.currentSchema.indexes.length" class="section">
                  <h3>Índices</h3>
                  <div class="indexes-list">
                    <div v-for="idx in store.currentSchema.indexes" :key="idx.name" class="index-item">
                      <strong>{{ idx.name }}</strong> {{ idx.unique ? '(UNIQUE)' : '' }}
                      <span class="columns">{{ idx.columns.join(', ') }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="store.currentSchema.foreignKeys && store.currentSchema.foreignKeys.length" class="section">
                  <h3>Relaciones</h3>
                  <div class="fk-list">
                    <div v-for="fk in store.currentSchema.foreignKeys" :key="fk.CONSTRAINT_NAME" class="fk-item">
                      <strong>{{ fk.COLUMN_NAME }}</strong> → 
                      {{ fk.REFERENCED_TABLE_NAME }}({{ fk.REFERENCED_COLUMN_NAME }})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Tab -->
            <div v-else-if="activeTab === 'data'" class="data-view">
              <table-data-viewer 
                v-if="store.selectedTable"
                :table-name="store.selectedTable"
                @row-inserted="store.fetchTableData"
                @row-updated="store.fetchTableData"
                @row-deleted="store.fetchTableData"
              />
            </div>

            <!-- Indexes Tab -->
            <div v-else-if="activeTab === 'indexes'" class="indexes-view">
              <table-indexes-manager 
                v-if="store.selectedTable"
                :table-name="store.selectedTable"
              />
            </div>

            <!-- Indexes Tab -->
            <div v-else-if="activeTab === 'indexes'" class="indexes-view">
              <div class="action-group">
                <button class="btn btn-primary" @click="showCreateIndexModal = true">
                  ➕ Nuevo Índice
                </button>
              </div>
              <div v-if="store.currentSchema.indexes && store.currentSchema.indexes.length" class="indexes-grid">
                <div v-for="idx in store.currentSchema.indexes" :key="idx.name" class="index-card">
                  <div class="card-header">
                    <span class="badge">{{ idx.unique ? 'UNIQUE' : 'NORMAL' }}</span>
                    <span class="name">{{ idx.name }}</span>
                  </div>
                  <div class="card-body">
                    <p>Columnas: {{ idx.columns.join(', ') }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="empty-indexes">
                No hay índices en esta tabla
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Alerts -->
    <div v-if="store.successMessage" class="alert alert-success">
      ✓ {{ store.successMessage }}
    </div>
    <div v-if="store.error" class="alert alert-error">
      ✗ {{ store.error }}
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Modals will go here (simplified for brevity) -->
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../stores/database.store';
import TableDataViewer from './TableDataViewer.vue';

const store = useDatabaseStore();
const tableSearchFilter = ref('');
const activeTab = ref('schema');

const tabs = ['schema', 'data', 'indexes'];

const showCreateTableModal = ref(false);
const showBackupModal = ref(false);
const showSqlEditor = ref(false);
const showAuditLog = ref(false);
const showEditSchemaModal = ref(false);
const showCreateIndexModal = ref(false);

const filteredTables = computed(() => {
  return store.tables.filter(t => 
    t.toLowerCase().includes(tableSearchFilter.value.toLowerCase())
  );
});

function getTabLabel(tab) {
  const labels = {
    schema: '📋 Esquema',
    data: '📊 Datos',
    indexes: '🔍 Índices'
  };
  return labels[tab] || tab;
}

function showRefresh() {
  store.fetchTables();
}

function confirmDropTable() {
  if (confirm(`¿Eliminar la tabla "${store.selectedTable}"? Esta acción no se puede deshacer.`)) {
    store.dropTable(store.selectedTable);
  }
}

function confirmTruncate() {
  if (confirm(`¿Vaciar la tabla "${store.selectedTable}"? Se borrarán todos los datos.`)) {
    store.truncateTable(store.selectedTable);
  }
}

onMounted(() => {
  store.fetchTables();
});
</script>

<style scoped>
.database-manager-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.db-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-info {
  background: #2196F3;
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
}

.db-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.db-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
}

.sidebar-section {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-section h3 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.9rem;
}

.tables-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-item {
  padding: 0.7rem;
  background: #f9f9f9;
  border-radius: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.table-item:hover {
  background: #f0f0f0;
}

.table-item.active {
  background: #667eea;
  color: white;
}

.tool-btn {
  width: 100%;
  padding: 0.7rem;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.tool-btn:hover {
  background: #e8e8e8;
}

.db-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.table-header h2 {
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f5f5f5;
}

.btn-danger {
  color: #f44336;
}

.btn-warning {
  color: #ff9800;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
}

.tab {
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
}

.tab.active {
  border-bottom-color: #667eea;
  color: #667eea;
}

.schema-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.schema-table th {
  background: #f5f5f5;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.schema-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.alert {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.4rem;
  z-index: 1000;
  animation: slideUp 0.3s;
}

.alert-success {
  background: #4CAF50;
  color: white;
}

.alert-error {
  background: #f44336;
  color: white;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 1rem;
}

code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
