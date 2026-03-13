import axios from 'axios'
import router from '../router'

// En Railway (producción, cualquier hostname que no sea localhost)
// En local (desarrollo, localhost o 127.0.0.1)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

let API_BASE_URL
if (isLocalhost) {
  API_BASE_URL = 'http://localhost:3000/api'
} else {
  // Siempre usar HTTPS para Railway
  API_BASE_URL = 'https://gestion-facturas-production.up.railway.app/api'
}

console.log('[API] Initialization:')
console.log('  Current hostname:', window.location.hostname)
console.log('  Is localhost:', isLocalhost)
console.log('  API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Employees
  getEmployees: (params) => api.get('/employees', { params }),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // Providers
  getProviders: (params) => api.get('/providers', { params }),
  getProvider: (id) => api.get(`/providers/${id}`),
  createProvider: (data) => api.post('/providers', data),
  updateProvider: (id, data) => api.put(`/providers/${id}`, data),
  deleteProvider: (id) => api.delete(`/providers/${id}`),
  getProviderInvoices: (id) => api.get(`/providers/${id}/invoices`),

  // Cost Centers
  getCostCenters: (params) => api.get('/cost-centers', { params }),
  getCostCenter: (id) => api.get(`/cost-centers/${id}`),
  createCostCenter: (data) => api.post('/cost-centers', data),
  updateCostCenter: (id, data) => api.put(`/cost-centers/${id}`, data),
  deleteCostCenter: (id) => api.delete(`/cost-centers/${id}`),
  getCostCenterStats: (id) => api.get(`/cost-centers/${id}/stats`),

  // Budget Management
  createBudgetCategory: (data) => api.post('/budget/categories', data),
  getBudgetCategories: (params) => api.get('/budget/categories', { params }),
  getBudgetCategory: (id) => api.get(`/budget/categories/${id}`),
  updateBudgetCategory: (id, data) => api.put(`/budget/categories/${id}`, data),
  deleteBudgetCategory: (id) => api.delete(`/budget/categories/${id}`),
  createBudgetSubcategory: (data) => api.post('/budget/subcategories', data),
  getBudgetSubcategories: (params) => api.get('/budget/subcategories', { params }),
  updateBudgetSubcategory: (id, data) => api.put(`/budget/subcategories/${id}`, data),
  deleteBudgetSubcategory: (id) => api.delete(`/budget/subcategories/${id}`),
  getDefaultBudgetTemplate: () => api.get('/budget/template/default'),
  getBudgetSummary: (params) => api.get('/budget/summary', { params }),
  assignBudgetFromTemplate: (costCenterId) => api.post(`/budget/assign-template/${costCenterId}`),

  // Budget Execution & Tracking
  addBudgetExpense: (categoryId, data) => api.post(`/budget/categories/${categoryId}/expenses`, data),
  getBudgetExecution: (costCenterId) => api.get(`/budget/execution/${costCenterId}`),
  getBudgetReport: (costCenterId) => api.get(`/budget/report/${costCenterId}`),
  sendBudgetNotification: (costCenterId, data) => api.post(`/budget/notification/${costCenterId}`, data),

  // Budget Items Management
  createBudgetItem: (data) => api.post('/budget/items', data),
  getBudgetItems: (categoryId) => api.get(`/budget/items/category/${categoryId}`),
  getBudgetItem: (itemId) => api.get(`/budget/items/${itemId}`),
  updateBudgetItem: (itemId, data) => api.put(`/budget/items/${itemId}`, data),
  deleteBudgetItem: (itemId) => api.delete(`/budget/items/${itemId}`),
  updateItemStatus: (itemId, status) => api.patch(`/budget/items/${itemId}/status`, { status }),
  approveItem: (itemId, comments) => api.post(`/budget/items/${itemId}/approve`, { comments }),
  getItemsSummary: (categoryId) => api.get(`/budget/items-summary/category/${categoryId}`),

  // Invoices
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (formData) => api.post('/invoices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateInvoice: (id, formData) => api.put(`/invoices/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateInvoiceStatus: (id, data) => api.patch(`/invoices/${id}/status`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  getPettyCashReport: (params) => api.get('/invoices/reports/petty-cash', { params }),

  // Invoice Types
  getInvoiceTypes: (params) => api.get('/invoice-types', { params }),

  // Dashboard
  getDashboardStats: (params) => api.get('/dashboard/stats', { params }),
  getMonthlyData: (year) => api.get(`/dashboard/monthly/${year}`),
  getTopProviders: (limit) => api.get('/dashboard/top-providers', { params: { limit } }),
  getCostCentersSummary: () => api.get('/dashboard/cost-centers')
}