import axios from 'axios'

// Obtener el token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Configurar la URL base del API
const getApiBaseUrl = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return isLocalhost ? 'http://localhost:3000/api' : 'https://gestion-facturas-production.up.railway.app/api'
}

const API_BASE_URL = getApiBaseUrl()
const API_BASE = '/database';

class DatabaseService {
  /**
   * Tablas
   */
  static async getAllTables() {
    // DEBUG: Usar endpoint sin autenticación temporalmente
    return axios.get(`${API_BASE_URL}${API_BASE}/tables-debug`);
  }

  static async getTableSchema(tableName) {
    return axios.get(`${API_BASE_URL}${API_BASE}/tables/${tableName}`, {
      headers: getAuthHeaders()
    });
  }

  static async getTableData(tableName, page = 1, pageSize = 25, filters = {}) {
    // DEBUG: Usar endpoint sin autenticación temporalmente
    return axios.get(`${API_BASE_URL}${API_BASE}/tables/${tableName}/data-debug`, {
      params: { page, pageSize, ...filters }
    });
  }

  static async createTable(tableName, columns, indexes = [], foreignKeys = []) {
    return axios.post(`${API_BASE_URL}${API_BASE}/tables`, {
      tableName,
      columns,
      indexes,
      foreignKeys
    }, { headers: getAuthHeaders() });
  }

  static async alterTable(tableName, changes) {
    return axios.put(`${API_BASE_URL}${API_BASE}/tables/${tableName}`, { changes }, {
      headers: getAuthHeaders()
    });
  }

  static async dropTable(tableName) {
    return axios.delete(`${API_BASE_URL}${API_BASE}/tables/${tableName}`, {
      headers: getAuthHeaders()
    });
  }

  static async truncateTable(tableName) {
    return axios.post(`${API_BASE_URL}${API_BASE}/tables/${tableName}/truncate`, {}, {
      headers: getAuthHeaders()
    });
  }

  /**
   * Datos
   */
  static async insertRow(tableName, data) {
    return axios.post(`${API_BASE_URL}${API_BASE}/tables/${tableName}/rows`, { data }, {
      headers: getAuthHeaders()
    });
  }

  static async updateRow(tableName, id, data) {
    return axios.put(`${API_BASE_URL}${API_BASE}/tables/${tableName}/rows/${id}`, { data }, {
      headers: getAuthHeaders()
    });
  }

  static async deleteRow(tableName, id) {
    return axios.delete(`${API_BASE_URL}${API_BASE}/tables/${tableName}/rows/${id}`, {
      headers: getAuthHeaders()
    });
  }

  /**
   * Índices
   */
  static async getIndexes(tableName) {
    return axios.get(`${API_BASE_URL}${API_BASE}/tables/${tableName}/indexes`, {
      headers: getAuthHeaders()
    });
  }

  static async createIndex(tableName, indexName, columns, isUnique = false) {
    return axios.post(`${API_BASE_URL}${API_BASE}/tables/${tableName}/indexes`, {
      indexName,
      columns,
      isUnique
    }, { headers: getAuthHeaders() });
  }

  static async dropIndex(tableName, indexName) {
    return axios.delete(`${API_BASE_URL}${API_BASE}/tables/${tableName}/indexes/${indexName}`, {
      headers: getAuthHeaders()
    });
  }

  /**
   * Backups
   */
  static async createBackup(backupName, backupType = 'FULL', tables = null) {
    return axios.post(`${API_BASE_URL}${API_BASE}/backups`, {
      backupName,
      backupType,
      tables
    }, { headers: getAuthHeaders() });
  }

  static async listBackups(limit = 50) {
    return axios.get(`${API_BASE_URL}${API_BASE}/backups`, {
      params: { limit },
      headers: getAuthHeaders()
    });
  }

  static async restoreBackup(backupId) {
    return axios.post(`${API_BASE_URL}${API_BASE}/backups/${backupId}/restore`, {}, {
      headers: getAuthHeaders()
    });
  }

  static async deleteBackup(backupId) {
    return axios.delete(`${API_BASE_URL}${API_BASE}/backups/${backupId}`, {
      headers: getAuthHeaders()
    });
  }

  /**
   * SQL
   */
  static async executeSqlQuery(query, isDraft = false) {
    return axios.post(`${API_BASE_URL}${API_BASE}/sql/execute`, {
      query,
      isDraft
    }, { headers: getAuthHeaders() });
  }

  /**
   * Auditoría
   */
  static async getAuditLog(tableName = null, limit = 100) {
    return axios.get(`${API_BASE_URL}${API_BASE}/audit`, {
      params: { ...(tableName && { tableName }), limit },
      headers: getAuthHeaders()
    });
  }

  /**
   * Versionado
   */
  static async getVersionHistory(tableName) {
    return axios.get(`${API_BASE_URL}${API_BASE}/tables/${tableName}/versions`, {
      headers: getAuthHeaders()
    });
  }
}

export default DatabaseService;
