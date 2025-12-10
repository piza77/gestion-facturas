<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
        <p class="text-gray-600">Administración de accesos y roles</p>
      </div>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Usuario
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usuario</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rol</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Último Login</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                </div>
                <div class="font-medium text-gray-900">{{ user.first_name }} {{ user.last_name }}</div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span :class="getRoleClass(user.role)" class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ user.last_login ? new Date(user.last_login).toLocaleDateString('es-CO') : 'Nunca' }}
            </td>
            <td class="px-6 py-4 text-right space-x-3">
              <button @click="openModal(user)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
              <button @click="toggleStatus(user)" class="text-yellow-600 hover:text-yellow-900 font-semibold">
                {{ user.is_active ? 'Desactivar' : 'Activar' }}
              </button>
              <button v-if="user.id !== authStore.user.id" @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
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
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombres *</label>
              <input v-model="form.firstName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
              <input v-model="form.lastName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input v-model="form.email" type="email" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div class="col-span-2" v-if="!editingUser">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
              <input v-model="form.password" type="password" :required="!editingUser" minlength="6" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
              <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
              <select v-model="form.role" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="loading" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
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
const users = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingUser = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user'
})

const loadUsers = async () => {
  try {
    const response = await api.getUsers({ limit: 100 })
    users.value = response.data.users
  } catch (error) {
    console.error('Error:', error)
  }
}

const openModal = (user = null) => {
  editingUser.value = user
  if (user) {
    form.value = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      password: '',
      role: user.role
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user'
  }
}

const saveUser = async () => {
  loading.value = true
  try {
    if (editingUser.value) {
      await api.updateUser(editingUser.value.id, form.value)
      alert('Usuario actualizado')
    } else {
      await api.createUser(form.value)
      alert('Usuario creado')
    }
    closeModal()
    loadUsers()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (user) => {
  if (!confirm(`¿${user.is_active ? 'Desactivar' : 'Activar'} este usuario?`)) return
  try {
    await api.updateUser(user.id, { isActive: !user.is_active })
    alert('Estado actualizado')
    loadUsers()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

const deleteUser = async (id) => {
  if (!confirm('¿Eliminar este usuario?')) return
  try {
    await api.deleteUser(id)
    alert('Usuario eliminado')
    loadUsers()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  }
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    user: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  return classes[role] || classes.user
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    user: 'Usuario',
    viewer: 'Visualizador'
  }
  return labels[role] || role
}

onMounted(() => {
  loadUsers()
})
</script>