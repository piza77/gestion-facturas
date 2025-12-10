<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Empleados</h1>
        <p class="text-gray-600">Gestión de empleados de la empresa</p>
      </div>
      <button
        v-if="authStore.canEdit"
        @click="openModal()"
        class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Empleado
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl shadow-md p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="search"
          @input="loadEmployees"
          type="text"
          placeholder="🔍 Buscar por nombre o cédula..."
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select v-model="filters.status" @change="loadEmployees" class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="vacation">Vacaciones</option>
        </select>
        <input
          v-model="filters.department"
          @input="loadEmployees"
          type="text"
          placeholder="Filtrar por departamento..."
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Empleado</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Identificación</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cargo</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Departamento</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contacto</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {{ employee.first_name?.[0] }}{{ employee.last_name?.[0] }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ employee.first_name }} {{ employee.last_name }}</div>
                    <div class="text-sm text-gray-500">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ employee.identification_type }}: {{ employee.identification_number }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.department }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ employee.phone || '-' }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(employee.status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(employee.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button @click="openModal(employee)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button v-if="authStore.canDelete" @click="deleteEmployee(employee.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">{{ editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado' }}</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveEmployee" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombres *</label>
              <input v-model="form.firstName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
              <input v-model="form.lastName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo ID *</label>
              <select v-model="form.identificationType" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Número ID *</label>
              <input v-model="form.identificationNumber" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Cargo *</label>
              <input v-model="form.position" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Departamento *</label>
              <input v-model="form.department" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input v-model="form.email" type="email" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input v-model="form.phone" type="tel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Contratación *</label>
              <input v-model="form.hireDate" type="date" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select v-model="form.status" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="vacation">Vacaciones</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="loading" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
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
const employees = ref([])
const showModal = ref(false)
const loading = ref(false)
const editingEmployee = ref(null)
const search = ref('')
const filters = ref({ status: '', department: '' })

const form = ref({
  firstName: '',
  lastName: '',
  identificationType: 'CC',
  identificationNumber: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active',
  notes: ''
})

const loadEmployees = async () => {
  try {
    const response = await api.getEmployees({ 
      search: search.value, 
      ...filters.value,
      limit: 100 
    })
    employees.value = response.data.employees || response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

const openModal = (employee = null) => {
  editingEmployee.value = employee
  if (employee) {
    form.value = {
      firstName: employee.first_name,
      lastName: employee.last_name,
      identificationType: employee.identification_type,
      identificationNumber: employee.identification_number,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      hireDate: employee.hire_date,
      status: employee.status,
      notes: employee.notes
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEmployee.value = null
  form.value = {
    firstName: '',
    lastName: '',
    identificationType: 'CC',
    identificationNumber: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: ''
  }
}

const saveEmployee = async () => {
  loading.value = true
  try {
    if (editingEmployee.value) {
      await api.updateEmployee(editingEmployee.value.id, form.value)
      alert('Empleado actualizado')
    } else {
      await api.createEmployee(form.value)
      alert('Empleado creado')
    }
    closeModal()
    loadEmployees()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

const deleteEmployee = async (id) => {
  if (!confirm('¿Eliminar este empleado?')) return
  try {
    await api.deleteEmployee(id)
    alert('Empleado eliminado')
    loadEmployees()
  } catch (error) {
    alert('Error: ' + (error.response?.data?.error || error.message))
  }
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    vacation: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.active
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'Vacaciones',
    suspended: 'Suspendido'
  }
  return labels[status] || status
}

onMounted(() => {
  loadEmployees()
})
</script>