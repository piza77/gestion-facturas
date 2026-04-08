import { defineStore } from 'pinia';
import DatabaseService from '../services/database.service';

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    // Tablas
    tables: [],
    selectedTable: null,
    selectedTableSchema: null,
    
    // Datos
    tableData: null,
    currentPage: 1,
    pageSize: 25,
    totalRecords: 0,
    
    // Backups
    backups: [],
    selectedBackup: null,
    
    // Auditoría
    auditLogs: [],
    
    // Versiones
    versions: [],
    
    // Estado
    loading: false,
    error: null,
    successMessage: null
  }),

  getters: {
    /**
     * Obtener todas las tablas filtradas
     */
    tablesList: (state) => state.tables,

    /**
     * Obtener tabla seleccionada
     */
    currentTable: (state) => state.selectedTable,

    /**
     * Obtener esquema de la tabla seleccionada
     */
    currentSchema: (state) => state.selectedTableSchema,

    /**
     * Obtener datos de la tabla
     */
    currentData: (state) => state.tableData?.data || [],

    /**
     * Obtener total de páginas
     */
    totalPages: (state) => state.tableData ? state.tableData.totalPages : 0,

    /**
     * Verificar si hay datos
     */
    hasData: (state) => state.tableData && state.tableData.data.length > 0,

    /**
     * Obtener backups activos
     */
    activeBackups: (state) => state.backups.filter(b => b.isVerified),

    /**
     * Total de backups
     */
    backupCount: (state) => state.backups.length
  },

  actions: {
    /**
     * Obtener todas las tablas
     */
    async fetchTables() {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.getAllTables();
        this.tables = response.data.data;
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Seleccionar tabla y obtener su esquema
     */
    async selectTable(tableName) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.getTableSchema(tableName);
        this.selectedTable = tableName;
        this.selectedTableSchema = response.data.data;
        this.currentPage = 1;
        
        // Obtener datos de la tabla
        await this.fetchTableData();
        
        // Obtener auditoría de esta tabla
        await this.fetchAuditLog(tableName);
        
        // Obtener historial de versiones
        await this.fetchVersionHistory(tableName);
        
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener datos de la tabla seleccionada
     */
    async fetchTableData(filters = {}) {
      if (!this.selectedTable) return;
      
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.getTableData(
          this.selectedTable,
          this.currentPage,
          this.pageSize,
          filters
        );
        this.tableData = response.data.data;
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear tabla
     */
    async createTable(tableName, columns, indexes = [], foreignKeys = []) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.createTable(
          tableName,
          columns,
          indexes,
          foreignKeys
        );
        
        this.successMessage = `Tabla ${tableName} creada exitosamente`;
        
        // Refrescar lista de tablas
        await this.fetchTables();
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Modificar tabla
     */
    async alterTable(tableName, changes) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.alterTable(tableName, changes);
        
        this.successMessage = `Tabla ${tableName} modificada exitosamente`;
        
        // Actualizar esquema
        if (this.selectedTable === tableName) {
          await this.selectTable(tableName);
        }
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar tabla
     */
    async dropTable(tableName) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.dropTable(tableName);
        
        this.successMessage = response.data.data.message;
        
        // Refrescar lista de tablas
        this.selectedTable = null;
        this.selectedTableSchema = null;
        await this.fetchTables();
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Vaciar tabla
     */
    async truncateTable(tableName) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.truncateTable(tableName);
        
        this.successMessage = 'Tabla vaciada exitosamente';
        
        // Refrescar datos si es la tabla seleccionada
        if (this.selectedTable === tableName) {
          await this.fetchTableData();
        }
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Insertar fila
     */
    async insertRow(tableName, data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.insertRow(tableName, data);
        
        this.successMessage = 'Fila insertada exitosamente';
        
        // Refrescar datos si es la tabla seleccionada
        if (this.selectedTable === tableName) {
          await this.fetchTableData();
        }
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar fila
     */
    async updateRow(tableName, id, data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.updateRow(tableName, id, data);
        
        this.successMessage = 'Fila actualizada exitosamente';
        
        // Refrescar datos
        if (this.selectedTable === tableName) {
          await this.fetchTableData();
        }
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar fila
     */
    async deleteRow(tableName, id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.deleteRow(tableName, id);
        
        this.successMessage = 'Fila eliminada exitosamente';
        
        // Refrescar datos
        if (this.selectedTable === tableName) {
          await this.fetchTableData();
        }
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear backup
     */
    async createBackup(backupName, backupType = 'FULL', tables = null) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.createBackup(
          backupName,
          backupType,
          tables
        );
        
        this.successMessage = `Backup ${backupName} creado exitosamente`;
        
        // Refrescar lista de backups
        await this.fetchBackups();
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener lista de backups
     */
    async fetchBackups(limit = 50) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.listBackups(limit);
        this.backups = response.data.data;
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Restaurar backup
     */
    async restoreBackup(backupId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.restoreBackup(backupId);
        
        this.successMessage = response.data.data.message;
        
        // Refrescar todo
        await this.fetchTables();
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener auditoría
     */
    async fetchAuditLog(tableName = null, limit = 100) {
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.getAuditLog(tableName, limit);
        this.auditLogs = response.data.data;
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener historial de versiones
     */
    async fetchVersionHistory(tableName) {
      if (!tableName) return;
      
      this.loading = true;
      this.error = null;
      try {
        const response = await DatabaseService.getVersionHistory(tableName);
        this.versions = response.data.data;
        this.clearSuccess();
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cambiar página
     */
    setPage(page) {
      this.currentPage = page;
      this.fetchTableData();
    },

    /**
     * Cambiar tamaño de página
     */
    setPageSize(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.fetchTableData();
    },

    /**
     * Limpiar error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Limpiar éxito
     */
    clearSuccess() {
      this.successMessage = null;
    }
  }
});
