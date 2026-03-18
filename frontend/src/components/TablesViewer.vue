<template>
  <div class="tables-viewer">
    <div class="viewer-header">
      <h3>📊 Tablas Base de Datos</h3>
      <div class="search-bar">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Buscar tabla..."
          class="search-input"
        >
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando tablas...</div>

    <div v-else-if="filteredTables.length > 0" class="tables-list">
      <div 
        v-for="table in filteredTables"
        :key="table"
        class="table-item"
        @click="$emit('select-table', table)"
      >
        <div class="table-info">
          <span class="table-name">{{ table }}</span>
          <span class="table-icon">📊</span>
        </div>
        <button class="btn-select">Seleccionar →</button>
      </div>
    </div>

    <div v-else class="empty">
      No hay tablas disponibles
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed } from 'vue';

defineProps({
  tables: Array,
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select-table']);

const searchQuery = ref('');

const filteredTables = computed(() => {
  if (!this.tables) return [];
  return this.tables.filter(t =>
    t.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<style scoped>
.tables-viewer {
  background: white;
  border-radius: 0.4rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.viewer-header {
  padding: 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.viewer-header h3 {
  margin: 0 0 1rem 0;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
}

.tables-list {
  display: flex;
  flex-direction: column;
}

.table-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.table-item:hover {
  background: #f9f9f9;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-name {
  font-weight: 600;
}

.btn-select {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  color: #999;
}
</style>
