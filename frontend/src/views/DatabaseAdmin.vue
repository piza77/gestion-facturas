<template>
  <div style="background-color: #f3f4f6; min-height: 100vh; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div>
        <h1 style="margin: 0; font-size: 28px;">🗄️ Administrador de Base de Datos</h1>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Gestión de tablas y registros</p>
      </div>
      <button @click="refreshAll" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
        🔄 Actualizar
      </button>
    </div>

    <!-- Error message -->
    <div v-if="databaseStore.error" style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 16px; color: #991b1b; font-size: 14px;">
      <strong>⚠️ Error:</strong> {{ databaseStore.error }}
    </div>

    <!-- Loading state -->
    <div v-if="databaseStore.loading" style="background-color: #dbeafe; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-bottom: 16px; color: #1e40af; font-size: 14px;">
      ⏳ Cargando tablas...
    </div>

    <!-- Main content -->
    <div v-if="!databaseStore.loading" style="display: grid; grid-template-columns: 280px 1fr; gap: 20px;">
      <!-- Sidebar -->
      <aside style="background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-height: 600px; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; font-weight: 600; font-size: 16px;">Tablas</h3>
          <button @click="showCreateTableModal = true" style="width: 32px; height: 32px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; padding: 0;">➕</button>
        </div>

        <input 
          v-model="searchTables"
          type="text"
          placeholder="Buscar..."
          style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 12px; font-size: 13px; box-sizing: border-box;"
        />

        <div>
          <div v-if="filteredTables.length === 0" style="text-align: center; padding: 16px; color: #999; font-size: 13px;">
            Sin tablas
          </div>
          <div 
            v-for="table in filteredTables"
            :key="table"
            @click="selectTable(table)"
            style="padding: 10px 12px; margin-bottom: 6px; background-color: #f9fafb; border-left: 3px solid transparent; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;"
            :style="getTableItemStyle(table)"
          >
            <span>📊</span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ table }}</span>
          </div>
        </div>
      </aside>

      <!-- Main area -->
      <main style="background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; min-height: 600px;">
        <!-- Empty state -->
        <div v-if="!databaseStore.selectedTable" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; color: #999; flex: 1;">
          <div style="font-size: 80px; margin-bottom: 16px; opacity: 0.5;">🗄️</div>
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #666;">Selecciona una tabla</h2>
          <p style="margin: 0; font-size: 14px;">Elige una tabla de la izquierda para ver su contenido</p>
        </div>

        <!-- Table content -->
        <div v-else style="display: flex; flex-direction: column; height: 100%;">
          <!-- Tabs -->
          <div style="display: flex; gap: 8px; padding: 16px; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; flex-shrink: 0;">
            <button 
              v-for="tab in tabs"
              :key="tab"
              @click="activeTab = tab"
              style="padding: 10px 16px; background-color: white; border: 2px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;"
              :style="getTabStyle(tab)"
            >
              {{ getTabLabel(tab) }}
            </button>
          </div>

          <!-- Tab content -->
          <div style="flex: 1; overflow-y: auto; padding: 20px; min-height: 0;">
            <!-- Schema Tab -->
            <div v-if="activeTab === 'schema'">
              <h3 style="margin: 0 0 16px; font-size: 18px;">{{ databaseStore.selectedTable }}</h3>
              <p v-if="!databaseStore.currentSchema" style="color: #999; font-size: 13px;">Cargando esquema...</p>
              <table v-else style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Nombre</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Tipo</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; width: 80px;">Nulo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="col in databaseStore.currentSchema?.columns || []" :key="col.name" style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-family: monospace;">{{ col.name }}</td>
                    <td style="padding: 12px; font-family: monospace; color: #7c3aed;">{{ col.type }}</td>
                    <td style="padding: 12px;">{{ col.allowNull ? '✓' : '✗' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Data Tab -->
            <div v-else-if="activeTab === 'data'">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 18px;">Datos ({{ databaseStore.currentData?.length || 0 }} registros)</h3>
                <button @click="showAddRecordModal = true" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">➕ Nuevo Registro</button>
              </div>
              
              <div v-if="databaseStore.currentData && databaseStore.currentData.length > 0" style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 600; min-width: 80px;">Acciones</th>
                      <th v-for="col in databaseStore.currentSchema?.columns || []" :key="col.name" style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 600; min-width: 100px;">
                        {{ col.name }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in databaseStore.currentData" :key="idx" style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; display: flex; gap: 6px;">
                        <button @click="editRecord(row)" style="padding: 4px 8px; background-color: #f59e0b; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">✎</button>
                        <button @click="deleteRecord(row)" style="padding: 4px 8px; background-color: #ef4444; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">🗑</button>
                      </td>
                      <td v-for="col in databaseStore.currentSchema?.columns || []" :key="col.name" style="padding: 10px; font-family: monospace; font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                        {{ formatValue(row[col.name]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else style="text-align: center; padding: 40px; color: #999;">
                <p>No hay registros en esta tabla</p>
              </div>
            </div>

            <!-- Info Tab -->
            <div v-else-if="activeTab === 'info'">
              <h3 style="margin: 0 0 16px; font-size: 18px;">Información</h3>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-size: 13px;">
                <p style="margin: 0 0 12px;"><strong>Tabla:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px;">{{ databaseStore.selectedTable }}</code></p>
                <p style="margin: 0 0 12px;"><strong>Columnas:</strong> {{ databaseStore.currentSchema?.columns?.length || 0 }}</p>
                <p style="margin: 0;"><strong>Registros:</strong> {{ databaseStore.currentData?.length || 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Table Modal -->
    <div v-if="showCreateTableModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" @click.self="showCreateTableModal = false">
      <div style="background: white; border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 18px;">Crear Tabla</h3>
          <button @click="showCreateTableModal = false" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">✕</button>
        </div>
        <div style="padding: 20px;">
          <p style="color: #666; font-size: 13px;">Funcionalidad en desarrollo...</p>
        </div>
      </div>
    </div>

    <!-- Add Record Modal -->
    <div v-if="showAddRecordModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" @click.self="showAddRecordModal = false">
      <div style="background: white; border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 18px;">Nuevo Registro en {{ databaseStore.selectedTable }}</h3>
          <button @click="showAddRecordModal = false" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">✕</button>
        </div>
        <div style="padding: 20px;">
          <div style="display: grid; gap: 16px;">
            <div v-for="col in databaseStore.currentSchema?.columns || []" :key="col.name" style="display: flex; flex-direction: column;">
              <label style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">{{ col.name }}</label>
              <input 
                v-model="newRecord[col.name]"
                type="text"
                :placeholder="col.type"
                style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;"
              />
              <small style="color: #999; font-size: 11px; margin-top: 4px;">{{ col.type }} {{ col.nullable ? '(opcional)' : '(requerido)' }}</small>
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
            <button @click="showAddRecordModal = false" style="padding: 8px 16px; background-color: #e5e7eb; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Cancelar</button>
            <button @click="saveNewRecord" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDatabaseStore } from '../stores/database.store';

export default {
  name: 'DatabaseAdmin',
  setup() {
    const databaseStore = useDatabaseStore();
    return { databaseStore };
  },
  data() {
    return {
      activeTab: 'schema',
      tabs: ['schema', 'data', 'info'],
      searchTables: '',
      showAddRecordModal: false,
      showCreateTableModal: false,
      newRecord: {}
    };
  },
  computed: {
    filteredTables() {
      if (!this.searchTables) return this.databaseStore.tables;
      return this.databaseStore.tables.filter(t =>
        t.toLowerCase().includes(this.searchTables.toLowerCase())
      );
    }
  },
  methods: {
    getTableItemStyle(table) {
      if (this.databaseStore.selectedTable === table) {
        return {
          backgroundColor: '#dbeafe',
          borderLeftColor: '#3b82f6',
          fontWeight: '600',
          color: '#1e40af'
        };
      }
      return { color: '#555' };
    },
    getTabStyle(tab) {
      if (this.activeTab === tab) {
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          borderColor: '#3b82f6'
        };
      }
      return { color: '#555' };
    },
    async selectTable(tableName) {
      console.log('[selectTable]', tableName);
      await this.databaseStore.selectTable(tableName);
      // Cargar datos después de cargar el esquema
      await this.databaseStore.fetchTableData();
      this.activeTab = 'schema';
    },
    async loadTableData() {
      try {
        await this.databaseStore.fetchTableData();
        console.log('[loadTableData] Data loaded:', this.databaseStore.currentData);
      } catch (error) {
        console.error('[loadTableData] Error:', error);
      }
    },
    async refreshAll() {
      console.log('[refreshAll]');
      await this.databaseStore.fetchTables();
    },
    getTabLabel(tab) {
      const labels = {
        schema: '📋 Esquema',
        data: '📊 Datos',
        info: 'ℹ️ Info'
      };
      return labels[tab] || tab;
    },
    formatValue(value) {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
      return String(value).substring(0, 100);
    },
    editRecord(row) {
      console.log('[editRecord]', row);
      // TODO: Implementar edición
      alert('Edición en desarrollo');
    },
    async deleteRecord(row) {
      if (!confirm('¿Eliminar este registro?')) return;
      console.log('[deleteRecord]', row);
      // TODO: Implementar eliminación
      alert('Eliminación en desarrollo');
    },
    async saveNewRecord() {
      console.log('[saveNewRecord]', this.newRecord);
      try {
        // TODO: Llamar al API para guardar
        alert('Guardado en desarrollo');
        this.showAddRecordModal = false;
        this.newRecord = {};
      } catch (error) {
        console.error('[saveNewRecord] Error:', error);
        alert('Error al guardar: ' + error.message);
      }
    }
  },
  async mounted() {
    console.log('[DatabaseAdmin] mounted');
    try {
      await this.databaseStore.fetchTables();
      console.log('[DatabaseAdmin] Tables loaded:', this.databaseStore.tables);
    } catch (error) {
      console.error('[DatabaseAdmin] Error loading tables:', error);
    }
  }
};
</script>

<style scoped>
button:hover {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
