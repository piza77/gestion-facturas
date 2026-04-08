<template>
  <form @submit.prevent="submitForm" style="display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <label style="font-weight: 600; color: #374151;">Nombre de Tabla</label>
      <input 
        v-model="tableName"
        type="text"
        placeholder="nombre_tabla"
        required
        style="padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;"
      />
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <h4 style="margin: 0; font-weight: 600;">Columnas</h4>
      
      <div v-for="(col, idx) in columns" :key="idx" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 1rem; display: grid; gap: 0.5rem; grid-template-columns: 1fr 1fr auto;">
        <div>
          <label style="font-size: 0.75rem; font-weight: 600;">Nombre</label>
          <input v-model="col.name" type="text" placeholder="nombre_columna" style="width: 100%; padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.75rem;" />
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 600;">Tipo</label>
          <select v-model="col.type" style="width: 100%; padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.75rem;">
            <option>VARCHAR(255)</option>
            <option>INT</option>
            <option>FLOAT</option>
            <option>BOOLEAN</option>
            <option>DATE</option>
            <option>DATETIME</option>
            <option>TEXT</option>
          </select>
        </div>
        <button type="button" @click="removeColumn(idx)" style="padding: 0.375rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; align-self: flex-end;">
          🗑️
        </button>
      </div>

      <button type="button" @click="addColumn" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
        ➕ Agregar Columna
      </button>
    </div>

    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
      <button type="button" @click="$emit('cancel')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 0.25rem; cursor: pointer;">
        Cancelar
      </button>
      <button type="submit" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
        ✅ Crear Tabla
      </button>
    </div>
  </form>
</template>

<script>
import DatabaseService from '../services/database.service';

export default {
  name: 'CreateTableForm',
  data() {
    return {
      tableName: '',
      columns: [
        { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true }
      ]
    };
  },
  methods: {
    addColumn() {
      this.columns.push({ name: '', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false });
    },
    removeColumn(idx) {
      this.columns.splice(idx, 1);
    },
    async submitForm() {
      try {
        if (!this.tableName.trim()) {
          alert('Por favor ingresa el nombre de la tabla');
          return;
        }
        if (this.columns.length === 0) {
          alert('Por favor agrega al menos una columna');
          return;
        }
        
        // Enviar al backend
        console.log('Crear tabla:', this.tableName, this.columns);
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
