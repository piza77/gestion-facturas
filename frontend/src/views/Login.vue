<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Logo with Animation -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-block p-5 bg-white rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
          <svg class="w-20 h-20 text-gradient" fill="none" stroke="url(#gradient)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h2 class="text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Sistema de Facturas
          </span>
        </h2>
        <p class="text-blue-100 text-lg font-light">Gestión inteligente de documentos</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Message -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!authStore.loading">Iniciar Sesión</span>
            <span v-else>Ingresando...</span>
          </button>

          <!-- Register Link -->
          <div class="text-center">
            <router-link to="/register" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ¿No tienes cuenta? Regístrate
            </router-link>
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs font-semibold text-blue-900 mb-2">🔐 Credenciales de prueba:</p>
          <div class="text-xs text-blue-700 space-y-1">
            <p><strong>Admin:</strong> admin@empresa.com / admin123</p>
            <p><strong>Usuario:</strong> maria@empresa.com / admin123</p>
            <p><strong>Viewer:</strong> juan@empresa.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.login(form.value)
  } catch (error) {
    console.error('Error en login:', error)
  }
}
</script>