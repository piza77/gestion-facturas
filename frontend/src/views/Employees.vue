<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Empleados</h1>
        <p class="text-gray-600">Gestión de empleados y personal</p>
      </div>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nuevo Empleado
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl shadow-md p-4">
      <input
        v-model="search"
        @input="loadEmployees"
        type="text"
        placeholder="🔍 Buscar por nombre, email o documento..."
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
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
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Posición</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Departamento</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ employee.first_name }} {{ employee.last_name }}</div>
                <div class="text-sm text-gray-500">{{ employee.identification_number }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.phone || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.department || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'bg-green-100 text-green-800': employee.status === 'active',
                  'bg-red-100 text-red-800': employee.status === 'inactive',
                  'bg-yellow-100 text-yellow-800': employee.status === 'vacation',
                  'bg-gray-100 text-gray-800': employee.status === 'suspended'
                }" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ employee.status === 'active' ? 'Activo' : employee.status === 'inactive' ? 'Inactivo' : employee.status === 'vacation' ? 'Vacaciones' : 'Suspendido' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(employee)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button @click="deleteEmployee(employee.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
              </td>
            </tr>
            <tr v-if="employees.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                No hay empleados registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-400 text-white p-6 rounded-t-2xl">
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
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input v-model="form.firstName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
              <input v-model="form.lastName" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input v-model="form.email" type="email" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input v-model="form.phone" type="tel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento *</label>
              <select v-model="form.identificationType" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Seleccionar</option>
                <option value="CC">Cédula</option>
                <option value="CE">Cédula Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Documento *</label>
              <input v-model="form.identificationNumber" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Posición *</label>
              <input v-model="form.position" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Departamento</label>
              <input v-model="form.department" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Contratación</label>
              <input v-model="form.hireDate" type="date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select v-model="form.status" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="vacation">Vacaciones</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
              <textarea v-model="form.notes" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
              {{ editingEmployee ? 'Actualizar' : 'Crear' }} Empleado
            </button>
            <button type="button" @click="closeModal" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition">
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

const employees = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingEmployee = ref(null)
const search = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identificationType: '',
  identificationNumber: '',
  position: '',
  department: '',
  hireDate: '',
  status: 'active',
  notes: ''
})

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identificationType: '',
    identificationNumber: '',
    position: '',
    department: '',
    hireDate: '',
    status: 'active',
    notes: ''
  }
}

const loadEmployees = async () => {
  loading.value = true
  try {
    const { data } = await api.getEmployees({
      search: search.value,
      limit: 50
    })
    employees.value = data.employees || []
  } catch (error) {
    console.error('Error cargando empleados:', error)
    alert('Error al cargar empleados')
  } finally {
    loading.value = false
  }
}

const convertSnakeToCamel = (obj) => {
  // Mapeo explícito de campos snake_case a camelCase
  const fieldMap = {
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    phone: 'phone',
    identification_type: 'identificationType',
    identification_number: 'identificationNumber',
    position: 'position',
    department: 'department',
    hire_date: 'hireDate',
    status: 'status',
    notes: 'notes'
  }
  
  const camelObj = {}
  Object.keys(fieldMap).forEach(snakeKey => {
    const camelKey = fieldMap[snakeKey]
    if (obj[snakeKey] !== undefined) {
      camelObj[camelKey] = obj[snakeKey]
    }
  })
  return camelObj
}

const openModal = async (employee = null) => {
  resetForm()
  if (employee) {
    editingEmployee.value = employee
    // Cargar los datos completos del empleado desde el backend
    try {
      const { data } = await api.getEmployee(employee.id)
      // Convertir snake_case a camelCase para el formulario
      form.value = convertSnakeToCamel(data.employee)
    } catch (error) {
      console.error('Error cargando datos del empleado:', error)
      // Si falla, usa los datos de la tabla (con conversión)
      form.value = convertSnakeToCamel(employee)
    }
  } else {
    editingEmployee.value = null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEmployee.value = null
  resetForm()
}

const formatDateForDB = (dateValue) => {
  if (!dateValue) return null
  // Si es una fecha ISO, convertir a YYYY-MM-DD
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0]
  }
  return dateValue
}

const saveEmployee = async () => {
  try {
    // Preparar datos con fechas formateadas
    const dataToSave = {
      ...form.value,
      hireDate: formatDateForDB(form.value.hireDate)
    }

    if (editingEmployee.value) {
      await api.updateEmployee(editingEmployee.value.id, dataToSave)
      alert('Empleado actualizado correctamente')
    } else {
      await api.createEmployee(dataToSave)
      alert('Empleado creado correctamente')
    }
    closeModal()
    loadEmployees()
  } catch (error) {
    console.error('Error guardando empleado:', error)
    alert('Error al guardar empleado: ' + error.response?.data?.error)
  }
}

const deleteEmployee = async (id) => {
  if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
    try {
      await api.deleteEmployee(id)
      alert('Empleado eliminado correctamente')
      loadEmployees()
    } catch (error) {
      console.error('Error eliminando empleado:', error)
      alert('Error al eliminar empleado: ' + error.response?.data?.error)
    }
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped></style>