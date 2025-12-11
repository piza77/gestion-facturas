import { defineStore } from 'pinia'
import api from '../services/api'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
    isViewer: (state) => state.user?.role === 'viewer',
    canEdit: (state) => ['admin', 'user'].includes(state.user?.role),
    canDelete: (state) => state.user?.role === 'admin',
    userName: (state) => {
      if (!state.user) return ''
      const firstName = state.user.firstName || state.user.first_name || ''
      const lastName = state.user.lastName || state.user.last_name || ''
      return `${firstName} ${lastName}`.trim()
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.login(credentials)
        const { token, user } = response.data
        
        this.token = token
        this.user = user
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        router.push('/dashboard')
        return true
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al iniciar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.register(userData)
        const { token, user } = response.data
        
        this.token = token
        this.user = user
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        router.push('/dashboard')
        return true
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al registrarse'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getCurrentUser() {
      try {
        const response = await api.getCurrentUser()
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }
})