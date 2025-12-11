import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
  
  // Invoices
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (formData) => api.post('/invoices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateInvoice: (id, formData) => api.put(`/invoices/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateInvoiceStatus: (id, data) => api.put(`/invoices/${id}/status`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  
  // Invoice Types
  getInvoiceTypes: (params) => api.get('/invoice-types', { params }),
  
  // Dashboard
  getDashboardStats: (params) => api.get('/dashboard/stats', { params }),
  getMonthlyData: (year) => api.get(`/dashboard/monthly/${year}`),
  getTopProviders: (limit) => api.get('/dashboard/top-providers', { params: { limit } }),
  getCostCentersSummary: () => api.get('/dashboard/cost-centers')
}