import axios from 'axios';

const API_BASE = '/api/database';

class DatabaseService {
  /**
   * Tablas
   */
  static async getAllTables() {
    return axios.get(`${API_BASE}/tables`);
  }

  static async getTableSchema(tableName) {
    return axios.get(`${API_BASE}/tables/${tableName}`);
  }

  static async getTableData(tableName, page = 1, pageSize = 25, filters = {}) {
    return axios.get(`${API_BASE}/tables/${tableName}/data`, {
      params: { page, pageSize, ...filters }
    });
  }

  static async createTable(tableName, columns, indexes = [], foreignKeys = []) {
    return axios.post(`${API_BASE}/tables`, {
      tableName,
      columns,
      indexes,
      foreignKeys
    });
  }

  static async alterTable(tableName, changes) {
    return axios.put(`${API_BASE}/tables/${tableName}`, { changes });
  }

  static async dropTable(tableName) {
    return axios.delete(`${API_BASE}/tables/${tableName}`);
  }

  static async truncateTable(tableName) {
    return axios.post(`${API_BASE}/tables/${tableName}/truncate`);
  }

  /**
   * Datos
   */
  static async insertRow(tableName, data) {
    return axios.post(`${API_BASE}/tables/${tableName}/rows`, { data });
  }

  static async updateRow(tableName, id, data) {
    return axios.put(`${API_BASE}/tables/${tableName}/rows/${id}`, { data });
  }

  static async deleteRow(tableName, id) {
    return axios.delete(`${API_BASE}/tables/${tableName}/rows/${id}`);
  }

  /**
   * Índices
   */
  static async getIndexes(tableName) {
    return axios.get(`${API_BASE}/tables/${tableName}/indexes`);
  }

  static async createIndex(tableName, indexName, columns, isUnique = false) {
    return axios.post(`${API_BASE}/tables/${tableName}/indexes`, {
      indexName,
      columns,
      isUnique
    });
  }

  static async dropIndex(tableName, indexName) {
    return axios.delete(`${API_BASE}/tables/${tableName}/indexes/${indexName}`);
  }

  /**
   * Backups
   */
  static async createBackup(backupName, backupType = 'FULL', tables = null) {
    return axios.post(`${API_BASE}/backups`, {
      backupName,
      backupType,
      tables
    });
  }

  static async listBackups(limit = 50) {
    return axios.get(`${API_BASE}/backups`, { params: { limit } });
  }

  static async restoreBackup(backupId) {
    return axios.post(`${API_BASE}/backups/${backupId}/restore`);
  }

  static async deleteBackup(backupId) {
    return axios.delete(`${API_BASE}/backups/${backupId}`);
  }

  /**
   * SQL
   */
  static async executeSqlQuery(query, isDraft = false) {
    return axios.post(`${API_BASE}/sql/execute`, {
      query,
      isDraft
    });
  }

  /**
   * Auditoría
   */
  static async getAuditLog(tableName = null, limit = 100) {
    return axios.get(`${API_BASE}/audit`, {
      params: { ...(tableName && { tableName }), limit }
    });
  }

  /**
   * Versionado
   */
  static async getVersionHistory(tableName) {
    return axios.get(`${API_BASE}/tables/${tableName}/versions`);
  }
}

export default DatabaseService;
