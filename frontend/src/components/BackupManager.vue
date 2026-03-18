<template>
  <div class="backup-manager">
    <!-- Header with Create Button -->
    <div class="manager-header">
      <h3>💾 Gestor de Backups</h3>
      <button class="btn btn-primary" @click="showCreateModal = true">
        ➕ Nuevo Backup
      </button>
    </div>

    <!-- Backups List -->
    <div class="backups-grid">
      <div v-for="backup in store.backups" :key="backup.id" class="backup-card">
        <div class="card-header">
          <h4>{{ backup.backupName }}</h4>
          <span class="badge" :class="backup.backupType.toLowerCase()">
            {{ backup.backupType }}
          </span>
        </div>
        <div class="card-body">
          <p><strong>Tamaño:</strong> {{ formatBytes(backup.backupSize) }}</p>
          <p><strong>Tablas:</strong> {{ backup.tablesIncluded?.length || 0 }}</p>
          <p><strong>Creado:</strong> {{ formatDate(backup.createdAt) }}</p>
          <p v-if="backup.completedAt">
            <strong>Completado:</strong> {{ formatDate(backup.completedAt) }}
          </p>
          <div class="status-row">
            <span class="status" :class="{ verified: backup.isVerified, failed: !backup.isVerified }">
              {{ backup.isVerified ? '✓ Verificado' : '✗ Sin verificar' }}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-action" @click="restoreBackup(backup.id)" title="Restaurar">
            ↩️ Restaurar
          </button>
          <button class="btn-action danger" @click="confirmDelete(backup.id)" title="Eliminar">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <div v-if="store.backups.length === 0" class="empty-backups">
        <p>No hay backups creados</p>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Crear Nuevo Backup</h3>
          <button class="close-btn" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitBackup">
            <div class="form-group">
              <label class="form-label">Nombre del Backup</label>
              <input 
                v-model="newBackupName"
                type="text"
                placeholder="ej: backup-2024-01-15"
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Tipo</label>
              <select v-model="newBackupType" class="form-select">
                <option value="FULL">Completo (Esquema + Datos)</option>
                <option value="SCHEMA_ONLY">Solo Esquema</option>
                <option value="DATA_ONLY">Solo Datos</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tablas a respaldar</label>
              <div class="tables-selector">
                <label v-for="table in store.tables" :key="table" class="checkbox">
                  <input 
                    :value="table" 
                    v-model="selectedTables"
                    type="checkbox"
                  >
                  <span>{{ table }}</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Crear Backup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';
import { useDatabaseStore } from '../stores/database.store';

const store = useDatabaseStore();

const showCreateModal = ref(false);
const newBackupName = ref('');
const newBackupType = ref('FULL');
const selectedTables = ref([]);

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('es-ES');
}

async function submitBackup() {
  try {
    const tables = selectedTables.value.length > 0 ? selectedTables.value : null;
    await store.createBackup(newBackupName.value, newBackupType.value, tables);
    
    newBackupName.value = '';
    newBackupType.value = 'FULL';
    selectedTables.value = [];
    showCreateModal.value = false;
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

async function restoreBackup(backupId) {
  if (confirm('¿Restaurar este backup? Esto puede tomar tiempo.')) {
    try {
      await store.restoreBackup(backupId);
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
  }
}

function confirmDelete(backupId) {
  if (confirm('¿Eliminar este backup? No se puede deshacer.')) {
    store.deleteBackup(backupId);
  }
}

onMounted(() => {
  store.fetchBackups();
});
</script>

<style scoped>
.backup-manager {
  background: white;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.manager-header {
  padding: 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manager-header h3 {
  margin: 0;
}

.backups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.backup-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.6rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.backup-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 1rem;
}

.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255,255,255,0.3);
}

.badge.full {
  background: #4CAF50;
}

.badge.schema_only {
  background: #2196F3;
}

.badge.data_only {
  background: #ff9800;
}

.card-body {
  padding: 1rem;
}

.card-body p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.status-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.status {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
}

.status.verified {
  background: #c8e6c9;
  color: #2e7d32;
}

.status.failed {
  background: #ffcdd2;
  color: #c62828;
}

.card-actions {
  padding: 1rem;
  background: #f9f9f9;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-action {
  flex: 1;
  padding: 0.6rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f5f5f5;
}

.btn-action.danger:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.empty-backups {
  text-align: center;
  padding: 2rem;
  color: #999;
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
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.tables-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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
</style>
