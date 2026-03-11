<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Reporte de Caja Menor</h1>
        <p class="text-gray-600">Documentos marcados como reembolsables/caja menor</p>
      </div>
      <button
        @click="exportReport"
        class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Exportar CSV
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Centro de Costo</label>
          <select v-model="filters.costCenterId" @change="loadReport" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer bg-white">
            <option value="">Todos</option>
            <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">{{ cc.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
          <input type="date" v-model="filters.startDate" @change="loadReport" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
          <input type="date" v-model="filters.endDate" @change="loadReport" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-transparent transition-colors">
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center">
        <div class="p-4 bg-blue-100 rounded-full mr-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Total de Documentos</p>
          <p class="text-2xl font-bold text-gray-900">{{ reportData.total_invoices || 0 }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center">
        <div class="p-4 bg-teal-100 rounded-full mr-4">
          <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Monto Total Caja Menor</p>
          <p class="text-2xl font-bold text-teal-600">${{ formatMoney(reportData.total_amount || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fecha</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Documento</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Proveedor</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Centro Costo</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Empleado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Monto Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="inv in reportData.invoices" :key="inv.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('es-CO') : '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 border border-gray-200 inline-block px-2 py-1 rounded bg-gray-50">{{ inv.invoice_number }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ inv.provider_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ inv.cost_center_name || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ inv.employee_name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                ${{ formatMoney(inv.total) }}
              </td>
            </tr>
            <tr v-if="!reportData.invoices || reportData.invoices.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No hay documentos de caja menor para los filtros seleccionados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const costCenters = ref([])
const loading = ref(false)
const reportData = ref({
  total_invoices: 0,
  total_amount: 0,
  invoices: []
})

const filters = ref({
  costCenterId: '',
  startDate: '',
  endDate: ''
})

const loadDependencies = async () => {
  try {
    const ccRes = await api.getCostCenters({ limit: 100 })
    costCenters.value = ccRes.data.centers || []
  } catch (error) {
    console.error('Error cargando centros de costo', error)
  }
}

const loadReport = async () => {
  loading.value = true
  try {
    const response = await api.getPettyCashReport(filters.value)
    reportData.value = response.data
  } catch (error) {
    console.error('Error cargando reporte', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = { costCenterId: '', startDate: '', endDate: '' }
  loadReport()
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const exportReport = () => {
  if (!reportData.value.invoices || reportData.value.invoices.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const headers = ['Fecha', 'Numero Factura', 'Proveedor', 'Centro de Costo', 'Empleado', 'Monto Total']
  const csvContent = [
    headers.join(','),
    ...reportData.value.invoices.map(inv => [
      inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('es-CO') : '',
      inv.invoice_number || '',
      `"${inv.provider_name || ''}"`,
      `"${inv.cost_center_name || ''}"`,
      `"${inv.employee_name || ''}"`,
      inv.total || 0
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'reporte_caja_menor.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await loadDependencies()
  await loadReport()
})
</script>
