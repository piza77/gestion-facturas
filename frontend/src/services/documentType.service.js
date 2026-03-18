import axios from 'axios';

const API_BASE = '/api/document-types';

class DocumentTypeService {
  /**
   * Obtener todos los tipos de documento
   */
  getAllTypes(params = {}) {
    return axios.get(API_BASE, { params }).then(res => res.data);
  }

  /**
   * Obtener tipo por ID
   */
  getTypeById(id) {
    return axios.get(`${API_BASE}/${id}`).then(res => res.data);
  }

  /**
   * Obtener tipo por código
   */
  getTypeByCode(code) {
    return axios.get(`${API_BASE}/code/${code}`).then(res => res.data);
  }

  /**
   * Crear nuevo tipo de documento
   */
  createType(data) {
    return axios.post(API_BASE, data).then(res => res.data);
  }

  /**
   * Actualizar tipo de documento
   */
  updateType(id, data) {
    return axios.put(`${API_BASE}/${id}`, data).then(res => res.data);
  }

  /**
   * Eliminar tipo de documento (soft delete)
   */
  deleteType(id) {
    return axios.delete(`${API_BASE}/${id}`).then(res => res.data);
  }

  /**
   * Generar próximo folio
   */
  getNextFolio(documentTypeId) {
    return axios.post(`${API_BASE}/${documentTypeId}/next-folio`)
      .then(res => res.data);
  }

  /**
   * Obtener estadísticas de un tipo
   */
  getTypeStatistics(id) {
    return axios.get(`${API_BASE}/${id}/statistics`).then(res => res.data);
  }

  /**
   * Buscar tipos de documento
   */
  searchTypes(query) {
    return axios.get(API_BASE, { params: { search: query } })
      .then(res => res.data);
  }
}

export default new DocumentTypeService();
