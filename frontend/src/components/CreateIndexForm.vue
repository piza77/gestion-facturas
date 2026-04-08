<template>
  <form @submit.prevent="submitForm" style="display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <label style="font-weight: 600; color: #374151;">Nombre del Índice</label>
      <input 
        v-model="indexName"
        type="text"
        placeholder="idx_columna"
        required
        style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
      />
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <label style="font-weight: 600; color: #374151;">Tipo de Índice</label>
      <select v-model="indexType" style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;">
        <option value="NORMAL">Normal</option>
        <option value="UNIQUE">Único</option>
        <option value="FULLTEXT">Full Text</option>
      </select>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <label style="font-weight: 600; color: #374151;">Columnas</label>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label v-for="col in columns" :key="col.name" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input 
            type="checkbox"
            :value="col.name"
            v-model="selectedColumns"
          />
          <span>{{ col.name }}</span>
        </label>
      </div>
    </div>

    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
      <button type="button" @click="$emit('cancel')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 0.25rem; cursor: pointer;">
        Cancelar
      </button>
      <button type="submit" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
        ✅ Crear Índice
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'CreateIndexForm',
  props: {
    tableName: {
      type: String,
      required: true
    },
    columns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      indexName: '',
      indexType: 'NORMAL',
      selectedColumns: []
    };
  },
  methods: {
    async submitForm() {
      try {
        if (!this.indexName.trim()) {
          alert('Por favor ingresa el nombre del índice');
          return;
        }
        if (this.selectedColumns.length === 0) {
          alert('Por favor selecciona al menos una columna');
          return;
        }
        
        console.log('Crear índice:', {
          name: this.indexName,
          type: this.indexType,
          columns: this.selectedColumns
        });
        this.$emit('created');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
/* Inline styles used */
</style>
