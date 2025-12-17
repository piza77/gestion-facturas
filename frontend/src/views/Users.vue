<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
        <p class="text-gray-600">Gestiona los usuarios y sus permisos</p>
      </div>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Usuario
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
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Usuario</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Último Acceso</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {{ getInitials(user.name) }}
                  </div>
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'bg-red-100 text-red-800': user.role === 'admin',
                  'bg-blue-100 text-blue-800': user.role === 'user',
                  'bg-green-100 text-green-800': user.role === 'viewer'
                }" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ user.role === 'admin' ? 'Administrador' : user.role === 'viewer' ? 'Visualizador' : 'Usuario' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.last_login ? new Date(user.last_login).toLocaleDateString('es-CO') : 'Nunca' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(user)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button v-if="user.id !== currentUserId" @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
                <button v-else class="text-gray-400 cursor-not-allowed">Eliminar</button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No hay usuarios registrados
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
            <h2 class="text-2xl font-bold">{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input v-model="form.firstName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
              <input v-model="form.lastName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input v-model="form.email" type="email" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div v-if="!editingUser" class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
              <input v-model="form.password" type="password" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
              <select v-model="form.role" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="user">Usuario</option>
                <option value="viewer">Visualizador</option>
                <option value="admin">Administrador</option>
              </select>
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
              {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
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

const users = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingUser = ref(null)
const currentUserId = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
  isActive: true
})

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.getUsers({ limit: 100 })
    users.value = data.users || []
    
    // Get current user ID
    const userResponse = await api.getCurrentUser()
    currentUserId.value = userResponse.data.id
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    alert('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const openModal = async (user = null) => {
  resetForm()
  if (user) {
    editingUser.value = user
    // Cargar datos completos del usuario desde el backend
    try {
      const { data } = await api.getUser(user.id)
      const userData = data.user || data
      form.value = {
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        password: '',
        role: userData.role || 'user',
        isActive: userData.is_active ? true : false
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error)
      // Fallback: usar datos de la tabla con parseo manual
      const nameParts = (user.name || '').split(' ')
      form.value = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        isActive: user.is_active ? true : false
      }
    }
  } else {
    editingUser.value = null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  resetForm()
}

const saveUser = async () => {
  try {
    if (editingUser.value) {
      // On edit, don't send password if empty
      const payload = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        role: form.value.role,
        isActive: form.value.isActive
      }
      if (form.value.password) {
        payload.password = form.value.password
      }
      await api.updateUser(editingUser.value.id, payload)
      alert('Usuario actualizado correctamente')
    } else {
      // Para creación, necesita nombre combinado o los nombres separados
      const payload = {
        name: form.value.firstName + ' ' + form.value.lastName,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        isActive: form.value.isActive
      }
      await api.createUser(payload)
      alert('Usuario creado correctamente')
    }
    closeModal()
    loadUsers()
  } catch (error) {
    console.error('Error guardando usuario:', error)
    alert('Error al guardar: ' + error.response?.data?.error)
  }
}

const deleteUser = async (id) => {
  if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return
  
  try {
    await api.deleteUser(id)
    alert('Usuario eliminado correctamente')
    loadUsers()
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    alert('Error al eliminar: ' + error.response?.data?.error)
  }
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

onMounted(() => {
  loadUsers()
})
</script>