<template>
  <nav class="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-50 border-r border-slate-700/50">
    <!-- Logo with Glow Effect -->
    <div class="p-6 border-b border-slate-700/50 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/50">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Facturas</h1>
          <p class="text-xs text-slate-400">Sistema de Gestión</p>
        </div>
      </div>
    </div>

    <!-- User Info with Avatar -->
    <div class="p-5 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur border-b border-slate-700/50">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
            {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate text-white">{{ authStore.userName }}</p>
          <p class="text-xs px-2 py-0.5 bg-indigo-500/30 rounded-full inline-block mt-1 capitalize border border-indigo-400/30">
            {{ authStore.user?.role }}
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation Links -->
    <div class="p-4 space-y-2">
      <router-link
        to="/dashboard"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        Dashboard
      </router-link>

      <router-link
        to="/invoices"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Facturas
      </router-link>

      <router-link
        to="/providers"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        Proveedores
      </router-link>

      <router-link
        to="/employees"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        Empleados
      </router-link>

      <router-link
        to="/cost-centers"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Centros de Costo
      </router-link>

      <router-link
        v-if="authStore.isAdmin"
        to="/users"
        class="nav-link"
        active-class="bg-blue-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        Usuarios
      </router-link>
    </div>

    <!-- Logout Button -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        Cerrar Sesión
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authStore.logout()
  }
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors;
}
</style>