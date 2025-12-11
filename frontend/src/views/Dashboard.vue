<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Resumen general del sistema</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">Bienvenido,</p>
        <p class="text-lg font-semibold text-gray-900">{{ authStore.userName }}</p>
      </div>
    </div>

    <!-- Stats Cards with Gradient and Animation -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 backdrop-blur rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <p class="text-sm font-medium text-blue-100 mb-1">Total Facturas</p>
          <p class="text-4xl font-extrabold">{{ stats.total_invoices }}</p>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 backdrop-blur rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <p class="text-sm font-medium text-green-100 mb-1">Pagadas</p>
          <p class="text-4xl font-extrabold">${{ formatMoney(stats.paid_amount) }}</p>
          <p class="text-xs text-green-100/80 mt-1">{{ stats.paid_count }} facturas</p>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 backdrop-blur rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <p class="text-sm font-medium text-yellow-100 mb-1">Pendientes</p>
          <p class="text-4xl font-extrabold">${{ formatMoney(stats.pending_amount) }}</p>
          <p class="text-xs text-yellow-100/80 mt-1">{{ stats.pending_count}} facturas</p>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-white/20 backdrop-blur rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <p class="text-sm font-medium text-red-100 mb-1">Vencidas</p>
          <p class="text-4xl font-extrabold">${{ formatMoney(stats.overdue_amount) }}</p>
          <p class="text-xs text-red-100/80 mt-1">{{ stats.overdue_count }} facturas</p>
        </div>
      </div>
    </div>

    <!-- Top Providers & Cost Centers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Providers -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Top Proveedores</h2>
        <div v-if="topProviders.length" class="space-y-3">
          <div v-for="provider in topProviders" :key="provider.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ provider.business_name }}</p>
              <p class="text-sm text-gray-500">{{ provider.invoice_count }} facturas</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-600">${{ formatMoney(provider.total_amount) }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No hay datos disponibles</p>
      </div>

      <!-- Cost Centers Summary -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Centros de Costo</h2>
        <div v-if="costCenters.length" class="space-y-3">
          <div v-for="cc in costCenters" :key="cc.id" class="p-3 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <p class="font-medium text-gray-900">{{ cc.name }}</p>
              <p class="text-sm font-semibold text-gray-700">{{ Number(cc.budget_used_percentage).toFixed(1) }}%</p>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all"
                :class="getProgressColor(Number(cc.budget_used_percentage))"
                :style="{ width: Math.min(Number(cc.budget_used_percentage), 100) + '%' }"
              ></div>
            </div>
            <div class="flex justify-between mt-1 text-xs text-gray-500">
              <span>${{ formatMoney(cc.total_spent) }} gastado</span>
              <span>${{ formatMoney(cc.budget) }} presupuesto</span>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No hay datos disponibles</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/invoices" class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <h3 class="text-xl font-bold mb-1">Nueva Factura</h3>
        <p class="text-blue-100 text-sm">Registrar factura o documento</p>
      </router-link>

      <router-link to="/providers" class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <h3 class="text-xl font-bold mb-1">Proveedores</h3>
        <p class="text-green-100 text-sm">Gestionar proveedores</p>
      </router-link>

      <router-link to="/cost-centers" class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <h3 class="text-xl font-bold mb-1">Reportes</h3>
        <p class="text-purple-100 text-sm">Ver estadísticas y reportes</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()
const stats = ref(null)
const topProviders = ref([])
const costCenters = ref([])

const loadData = async () => {
  try {
    const [statsRes, providersRes, ccRes] = await Promise.all([
      api.getDashboardStats(),
      api.getTopProviders(5),
      api.getCostCentersSummary()
    ])
    
    stats.value = statsRes.data.stats
    topProviders.value = providersRes.data.providers
    costCenters.value = ccRes.data.summary
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

onMounted(() => {
  loadData()
})
</script>