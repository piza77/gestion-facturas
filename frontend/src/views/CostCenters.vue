<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Centros de Costo</h1>
        <p class="text-gray-600">Control de presupuestos y gastos</p>
      </div>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Centro
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl shadow-lg p-8 text-center">
      <div class="inline-block animate-spin">
        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Presupuesto</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Responsable</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cc in costCenters" :key="cc.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{{ cc.code }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ cc.name }}</div>
                <div class="text-sm text-gray-500">{{ cc.description || 'Sin descripción' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                ${{ formatMoney(cc.budget) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ cc.manager || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="cc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ cc.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(cc)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button @click="deleteCostCenter(cc.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
              </td>
            </tr>
            <tr v-if="costCenters.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No hay centros de costo registrados
              </td>
            </tr>
          </tbody>
        </table>
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
              <input v-model="form.code" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea v-model="form.description" rows="2" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Presupuesto *</label>
              <input v-model.number="form.budget" type="number" step="0.01" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Responsable</label>
              <input v-model="form.manager" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select v-model="form.isActive" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg">
              {{ editingCenter ? 'Actualizar' : 'Crear' }} Centro
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
import api from '../services/api'

const costCenters = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingCenter = ref(null)

const form = ref({
  code: '',
  name: '',
  description: '',
  budget: 0,
  manager: '',
  isActive: true
})

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    description: '',
    budget: 0,
    manager: '',
    isActive: true
  }
}

const loadCostCenters = async () => {
  loading.value = true
  try {
    const { data } = await api.getCostCenters({ limit: 100 })
    costCenters.value = data.centers || []
  } catch (error) {
    console.error('Error cargando centros de costo:', error)
    alert('Error al cargar centros de costo')
  } finally {
    loading.value = false
  }
}

const openModal = (center = null) => {
  resetForm()
  if (center) {
    editingCenter.value = center
    form.value = {
      code: center.code,
      name: center.name,
      description: center.description,
      budget: center.budget,
      manager: center.manager,
      isActive: center.is_active
    }
  } else {
    editingCenter.value = null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCenter.value = null
  resetForm()
}

const saveCostCenter = async () => {
  try {
    if (editingCenter.value) {
      await api.updateCostCenter(editingCenter.value.id, form.value)
      alert('Centro de costo actualizado correctamente')
    } else {
      await api.createCostCenter(form.value)
      alert('Centro de costo creado correctamente')
    }
    closeModal()
    loadCostCenters()
  } catch (error) {
    console.error('Error guardando centro de costo:', error)
    alert('Error al guardar: ' + error.response?.data?.error)
  }
}

const deleteCostCenter = async (id) => {
  if (!confirm('¿Está seguro de que desea eliminar este centro de costo?')) return
  
  try {
    await api.deleteCostCenter(id)
    alert('Centro de costo eliminado correctamente')
    loadCostCenters()
  } catch (error) {
    console.error('Error eliminando centro de costo:', error)
    alert('Error al eliminar: ' + error.response?.data?.error)
  }
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

onMounted(() => {
  loadCostCenters()
})
</script>