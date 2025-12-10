<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Centros de Costo</h1>
        <p class="text-gray-600">Control de presupuestos y gastos</p>
      </div>
      <button
        v-if="authStore.canEdit"
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Centro
      </button>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="cc in costCenters" :key="cc.id" class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="text-sm font-semibold text-purple-600 mb-1">{{ cc.code }}</div>
            <h3 class="text-xl font-bold text-gray-900">{{ cc.name }}</h3>
          </div>
          <div class="flex gap-2">
            <button @click="openModal(cc)" class="text-blue-600 hover:text-blue-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button v-if="authStore.canDelete" @click="deleteCostCenter(cc.id)" class="text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Presupuesto:</span>
            <span class="font-bold text-gray-900">${{ formatMoney(cc.budget) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Gastado:</span>
            <span class="font-bold" :class="getSpentColor(cc.spent, cc.budget)">${{ formatMoney(cc.spent) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Disponible:</span>
            <span class="font-bold text-green-600">${{ formatMoney(cc.budget - cc.spent) }}</span>
          </div>

          <div class="pt-2">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Ejecución</span>
              <span>{{ getPercentage(cc.spent, cc.budget) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all"
                :class="getProgressColor(cc.spent, cc.budget)"
                :style="{ width: Math.min(getPercentage(cc.spent, cc.budget), 100) + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="cc.description" class="pt-2 text-sm text-gray-600 border-t">
            {{ cc.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">{{ editingCenter ? 'Editar Centro' : 'Nuevo Centro' }}</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveCostCenter" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
              <input v-model="form.code" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea v-model="form.description" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Presupuesto *</label>
              <input v-model.number="form.budget" type="number" step="0.01" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Responsable</label>
              <select v-model="form.responsibleId" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                <option value="">Ninguno</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.first_name }} {{ emp.last_name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="loading" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" @click="closeModal" class="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()
const costCenters = ref([])
const employees = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingCenter = ref(null)

const form = ref({
  code: '',
  name: '',
  description: '',
  budget: 0,
  responsibleId: ''
})

const loadCostCenters = async () => {
  try {
    const response = await api.getCostCenters({ limit: 100 })
    costCenters.value = response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

const loadEmployees = async () => {
  try {
    const response = await api.getEmployees({ limit: 100 })
    employees.value = response.data.employees || response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

const openModal = (center = null) => {
  editingCenter.value = center
  if (center) {
    form.value = {
      code: center.code,
      name: center.name,
      description: center.description,
      budget: center.budget,
      responsibleId: center.responsible_id
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCenter.value = null
  form.value = {
    code: '',
    name: '',
    description: '',
    budget: 0,
    responsibleId: ''
  }
}

const saveCostCenter = async () => {
  loading.value = true
  try {
    if (editingCenter.value) {
      await api.updateCostCenter(editingCenter.value.id, form.value)
      alert('Centro actualizado')
    } else {
      await api.createCostCenter(form.value)
      alert('Centro creado')
    }
    closeModal()
    loadCostCenters()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

const deleteCostCenter = async (id) => {
  if (!confirm('¿Eliminar este centro de costo?')) return
  try {
    await api.deleteCostCenter(id)
    alert('Centro eliminado')
    loadCostCenters()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  }
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const getPercentage = (spent, budget) => {
  return budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0
}

const getProgressColor = (spent, budget) => {
  const percentage = (spent / budget) * 100
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getSpentColor = (spent, budget) => {
  const percentage = (spent / budget) * 100
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 75) return 'text-yellow-600'
  return 'text-blue-600'
}

onMounted(() => {
  loadCostCenters()
  loadEmployees()
})
</script>