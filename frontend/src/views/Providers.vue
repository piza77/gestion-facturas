<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Proveedores</h1>
        <p class="text-gray-600">Gestión de proveedores y empresas</p>
      </div>
      <button
        v-if="authStore.canEdit"
        @click="openModal()"
        class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Proveedor
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl shadow-md p-4">
      <input
        v-model="search"
        @input="loadProviders"
        type="text"
        placeholder="🔍 Buscar por razón social, NIT o contacto..."
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Razón Social</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">NIT</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contacto</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="provider in providers" :key="provider.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ provider.business_name }}</div>
                <div class="text-sm text-gray-500">{{ provider.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ provider.nit }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ provider.contact_name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ provider.phone || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ provider.category || 'Sin categoría' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ provider.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(provider)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button v-if="authStore.canDelete" @click="deleteProvider(provider.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">{{ editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveProvider" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
              <input v-model="form.businessName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">NIT *</label>
              <input v-model="form.nit" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de Contacto</label>
              <input v-model="form.contactName" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input v-model="form.phone" type="tel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input v-model="form.email" type="email" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
              <input v-model="form.address" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
              <input v-model="form.city" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select v-model="form.category" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Seleccionar...</option>
                <option value="Servicios">Servicios</option>
                <option value="Productos">Productos</option>
                <option value="Construcción">Construcción</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Consultoría">Consultoría</option>
                <option value="Transporte">Transporte</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Plazo de Pago (días)</label>
              <input v-model.number="form.paymentTerms" type="number" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="loading" class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
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
const providers = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingProvider = ref(null)
const search = ref('')

const form = ref({
  businessName: '',
  nit: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  category: '',
  paymentTerms: 30,
  notes: ''
})

const loadProviders = async () => {
  try {
    const response = await api.getProviders({ search: search.value, limit: 100 })
    providers.value = response.data.providers
  } catch (error) {
    console.error('Error:', error)
  }
}

const openModal = (provider = null) => {
  editingProvider.value = provider
  if (provider) {
    form.value = {
      businessName: provider.business_name,
      nit: provider.nit,
      contactName: provider.contact_name,
      phone: provider.phone,
      email: provider.email,
      address: provider.address,
      city: provider.city,
      category: provider.category,
      paymentTerms: provider.payment_terms,
      notes: provider.notes
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProvider.value = null
  form.value = {
    businessName: '',
    nit: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    category: '',
    paymentTerms: 30,
    notes: ''
  }
}

const saveProvider = async () => {
  loading.value = true
  try {
    if (editingProvider.value) {
      await api.updateProvider(editingProvider.value.id, form.value)
      alert('Proveedor actualizado exitosamente')
    } else {
      await api.createProvider(form.value)
      alert('Proveedor creado exitosamente')
    }
    closeModal()
    loadProviders()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

const deleteProvider = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este proveedor?')) return
  
  try {
    await api.deleteProvider(id)
    alert('Proveedor eliminado')
    loadProviders()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  }
}

onMounted(() => {
  loadProviders()
})
</script>