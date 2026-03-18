<template>
  <div v-if="isAdmin" class="space-y-6">
    <!-- Admin Section Header -->
    <div class="bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl shadow-lg p-6 text-white">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold mb-2">⚙️ Administración</h2>
          <p class="text-purple-100">Gestión de parámetros del sistema</p>
        </div>
        <svg class="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'types'"
          :class="activeTab === 'types' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'"
          class="flex-1 px-6 py-4 font-semibold transition-colors"
        >
          📄 Tipos de Documentos
        </button>
        <button
          @click="activeTab = 'config'"
          :class="activeTab === 'config' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'"
          class="flex-1 px-6 py-4 font-semibold transition-colors"
        >
          ⚙️ Configuración
        </button>
      </div>

      <!-- TIPOS DE DOCUMENTOS TAB -->
      <div v-if="activeTab === 'types'" class="p-6 space-y-6">
        <!-- Create Form -->
        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 class="text-xl font-bold text-blue-900 mb-4">➕ Crear Nuevo Tipo</h3>
          <form @submit.prevent="addType" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
              <input
                v-model="newType.code"
                type="text"
                placeholder="ej: FA, NC, ND"
                maxlength="10"
                class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input
                v-model="newType.name"
                type="text"
                placeholder="ej: Factura"
                class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <input
                v-model="newType.description"
                type="text"
                placeholder="Opcional"
                class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="flex items-end">
              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span v-if="!loading">➕ Crear</span>
                <span v-else>⏳ Guardando...</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Types Table -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Código</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Nombre</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Descripción</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Estado</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="type in invoiceTypes" :key="type.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-bold text-gray-900">{{ type.code }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">{{ type.name }}</td>
                <td class="px-6 py-4 text-gray-600 text-sm">{{ type.description || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <span
                    :class="type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ type.is_active ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2 flex gap-2 justify-end">
                  <button
                    @click="editType(type)"
                    class="text-blue-600 hover:text-blue-900 font-semibold text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    @click="deleteType(type.id)"
                    :disabled="!canDelete(type)"
                    :class="!canDelete(type) ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-900'"
                    class="text-red-600 font-semibold text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONFIGURACIÓN TAB -->
      <div v-if="activeTab === 'config'" class="p-6">
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg">Más opciones de configuración próximamente...</p>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingType" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">✏️ Editar Tipo</h3>
        <form @submit.prevent="updateType" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Código (no editable)</label>
            <input
              :value="editingType.code"
              type="text"
              disabled
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <input
              v-model="editingType.name"
              type="text"
              class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <input
              v-model="editingType.description"
              type="text"
              class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
            <input v-model="editingType.is_active" type="checkbox" class="w-5 h-5" />
            <span class="font-semibold text-gray-700">Activo</span>
          </label>
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              💾 Guardar
            </button>
            <button
              type="button"
              @click="editingType = null"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-xl font-semibold"
            >
              ✖️ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userRole === 'admin')

const activeTab = ref('types')
const invoiceTypes = ref([])
const loading = ref(false)
const editingType = ref(null)
const newType = ref({
  code: '',
  name: '',
  description: ''
})

// Cargar tipos
const loadTypes = async () => {
  try {
    const res = await api.getInvoiceTypes()
    invoiceTypes.value = res.data.invoiceTypes
  } catch (error) {
    console.error('Error cargando tipos:', error)
  }
}

// Crear nuevo tipo
const addType = async () => {
  if (!newType.value.code || !newType.value.name) {
    alert('Completa código y nombre')
    return
  }

  loading.value = true
  try {
    await api.post('/invoice-types', {
      code: newType.value.code.toUpperCase(),
      name: newType.value.name,
      description: newType.value.description
    })
    
    await loadTypes()
    newType.value = { code: '', name: '', description: '' }
    alert('✅ Tipo creado exitosamente')
  } catch (error) {
    alert(`❌ Error: ${error.response?.data?.error || error.message}`)
  } finally {
    loading.value = false
  }
}

// Editar tipo
const editType = (type) => {
  editingType.value = { ...type }
}

// Actualizar tipo
const updateType = async () => {
  loading.value = true
  try {
    await api.put(`/invoice-types/${editingType.value.id}`, {
      name: editingType.value.name,
      description: editingType.value.description,
      isActive: editingType.value.is_active
    })
    
    await loadTypes()
    editingType.value = null
    alert('✅ Tipo actualizado exitosamente')
  } catch (error) {
    alert(`❌ Error: ${error.response?.data?.error}`)
  } finally {
    loading.value = false
  }
}

// Eliminar tipo
const deleteType = async (id) => {
  if (!confirm('¿Estás seguro de que quieres desactivar este tipo?')) return
  
  try {
    await api.delete(`/invoice-types/${id}`)
    await loadTypes()
    alert('✅ Tipo desactivado exitosamente')
  } catch (error) {
    alert(`❌ Error: ${error.response?.data?.error}`)
  }
}

// Verificar si se puede eliminar
const canDelete = (type) => {
  return type.code !== 'FC' && type.code !== 'CC' // No eliminar FC y CC por defecto
}

onMounted(() => {
  loadTypes()
})
</script>
