<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Facturas</h1>
        <p class="text-gray-600">Gestión de facturas y documentos</p>
      </div>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nueva Factura
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-md p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="search"
          @input="loadInvoices"
          type="text"
          placeholder="🔍 Buscar por número o descripción..."
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <select
          v-model="filters.status"
          @change="loadInvoices"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="paid">Pagada</option>
          <option value="overdue">Vencida</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <select
          v-model="filters.providerId"
          @change="loadInvoices"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los proveedores</option>
          <option v-for="provider in providers" :key="provider.id" :value="provider.id">
            {{ provider.business_name }}
          </option>
        </select>

        <input
          type="date"
          v-model="filters.startDate"
          @change="loadInvoices"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl shadow-lg p-8 text-center">
      <div class="inline-block animate-spin">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
      <p class="text-gray-600 mt-2">Cargando facturas...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Número</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Proveedor</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Monto</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ invoice.invoice_number }}</div>
                <div class="text-sm text-gray-500">{{ invoice.description }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ invoice.provider_name || 'N/A' }}
                <div class="text-xs text-gray-500">{{ invoice.provider_nit }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ${{ formatCurrency(invoice.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.issue_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(invoice.status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(invoice)" class="text-blue-600 hover:text-blue-900 font-semibold">
                  Ver
                </button>
                <button @click="deleteInvoice(invoice.id)" class="text-red-600 hover:text-red-900 font-semibold">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No hay facturas registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && pagination.totalPages > 1" class="flex justify-center items-center gap-2">
      <button
        @click="previousPage"
        :disabled="pagination.page === 1"
        class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Anterior
      </button>
      <span class="text-gray-600">
        Página {{ pagination.page }} de {{ pagination.totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="pagination.page === pagination.totalPages"
        class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">
              {{ editingInvoice ? 'Ver/Editar Factura' : 'Nueva Factura' }}
            </h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveInvoice" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Factura *</label>
              <input v-model="form.invoiceNumber" type="text" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Factura *</label>
              <select v-model="form.invoiceTypeId" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Seleccionar tipo</option>
                <option v-for="type in invoiceTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
              <select v-model="form.providerId" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Seleccionar proveedor</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.business_name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Centro de Costo *</label>
              <select v-model="form.costCenterId" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Seleccionar centro</option>
                <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">{{ cc.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Empleado</label>
              <select v-model="form.employeeId" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Seleccionar empleado</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.first_name }} {{ emp.last_name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Sección de Fechas y Montos -->
          <div class="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Emisión *</label>
                <input v-model="form.issueDate" type="date" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Vencimiento</label>
                <input v-model="form.dueDate" type="date" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Subtotal *</label>
                <input :value="form.subtotal" @input="form.subtotal = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" required class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-semibold" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Impuesto</label>
                <input :value="form.tax" @input="form.tax = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" class="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-right font-semibold" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Descuento</label>
                <input :value="form.discount" @input="form.discount = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" class="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right font-semibold" />
              </div>
            </div>

            <div class="mt-4 pt-4 border-t-2 border-gray-300">
              <div class="text-center">
                <label class="block text-sm font-semibold text-gray-700 mb-2">TOTAL</label>
                <div class="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white font-extrabold text-4xl">
                  {{ formatMoney(form.total) }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea v-model="form.description" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
              <textarea v-model="form.notes" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Archivo</label>
            <input @change="handleFileUpload" type="file" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
              {{ editingInvoice ? 'Actualizar' : 'Crear' }} Factura
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
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'

const invoices = ref([])
const providers = ref([])
const employees = ref([])
const costCenters = ref([])
const invoiceTypes = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingInvoice = ref(null)
const search = ref('')
const file = ref(null)

const filters = ref({
  status: '',
  providerId: '',
  startDate: ''
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const form = ref({
  invoiceNumber: '',
  invoiceTypeId: '',
  providerId: '',
  costCenterId: '',
  employeeId: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  description: '',
  notes: ''
})

const resetForm = () => {
  form.value = {
    invoiceNumber: '',
    invoiceTypeId: '',
    providerId: '',
    costCenterId: '',
    employeeId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    description: '',
    notes: ''
  }
  file.value = null
}

const loadInvoices = async () => {
  loading.value = true
  try {
    const { data } = await api.getInvoices({
      search: search.value,
      ...filters.value,
      limit: pagination.value.limit,
      offset: (pagination.value.page - 1) * pagination.value.limit
    })
    invoices.value = data.invoices || []
    pagination.value = {
      ...pagination.value,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages
    }
  } catch (error) {
    console.error('Error cargando facturas:', error)
    alert('Error al cargar facturas')
  } finally {
    loading.value = false
  }
}

const loadProviders = async () => {
  try {
    const { data } = await api.getProviders({ limit: 100 })
    providers.value = data.providers || []
  } catch (error) {
    console.error('Error cargando proveedores:', error)
  }
}

const loadEmployees = async () => {
  try {
    const { data } = await api.getEmployees({ limit: 100 })
    employees.value = data.employees || []
  } catch (error) {
    console.error('Error cargando empleados:', error)
  }
}

const loadCostCenters = async () => {
  try {
    const { data } = await api.getCostCenters({ limit: 100 })
    costCenters.value = data.centers || []
  } catch (error) {
    console.error('Error cargando centros de costo:', error)
  }
}

const loadInvoiceTypes = async () => {
  try {
    const { data } = await api.getInvoiceTypes({ limit: 100 })
    invoiceTypes.value = data.invoiceTypes || []
  } catch (error) {
    console.error('Error cargando tipos de factura:', error)
  }
}

const openModal = (invoice = null) => {
  resetForm()
  if (invoice) {
    editingInvoice.value = invoice
    // Llenar todos los campos de la factura
    form.value = {
      invoiceNumber: invoice.invoice_number || '',
      invoiceTypeId: invoice.invoice_type_id || '',
      providerId: invoice.provider_id || '',
      costCenterId: invoice.cost_center_id || '',
      employeeId: invoice.employee_id || '',
      issueDate: invoice.issue_date || '',
      dueDate: invoice.due_date || '',
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      total: invoice.total || 0,
      description: invoice.description || '',
      notes: invoice.notes || ''
    }
    // Calcular el total después de llenar los datos
    calculateTotal()
  } else {
    editingInvoice.value = null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingInvoice.value = null
  resetForm()
}

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
}

const saveInvoice = async () => {
  try {
    const formData = new FormData()
    
    // Mapear camelCase a snake_case para el backend
    const fieldMapping = {
      invoiceNumber: 'invoice_number',
      invoiceTypeId: 'invoice_type_id',
      providerId: 'provider_id',
      costCenterId: 'cost_center_id',
      employeeId: 'employee_id',
      issueDate: 'issue_date',
      dueDate: 'due_date',
      subtotal: 'subtotal',
      tax: 'tax',
      discount: 'discount',
      total: 'total',
      description: 'description',
      notes: 'notes'
    }

    Object.keys(fieldMapping).forEach(camelKey => {
      const snakeKey = fieldMapping[camelKey]
      const value = form.value[camelKey]
      if (value !== undefined && value !== null && value !== '') {
        formData.append(snakeKey, value)
      }
    })

    if (file.value) {
      formData.append('file', file.value)
    }

    if (editingInvoice.value) {
      await api.updateInvoice(editingInvoice.value.id, formData)
      alert('Factura actualizada correctamente')
    } else {
      await api.createInvoice(formData)
      alert('Factura creada correctamente')
    }
    closeModal()
    loadInvoices()
  } catch (error) {
    console.error('Error guardando factura:', error)
    alert('Error al guardar factura: ' + error.response?.data?.error)
  }
}

const deleteInvoice = async (id) => {
  if (confirm('¿Está seguro de que desea eliminar esta factura?')) {
    try {
      await api.deleteInvoice(id)
      alert('Factura eliminada correctamente')
      loadInvoices()
    } catch (error) {
      console.error('Error eliminando factura:', error)
      alert('Error al eliminar factura')
    }
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO')
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    paid: 'Pagada',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadInvoices()
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    loadInvoices()
  }
}

onMounted(() => {
  loadInvoices()
  loadProviders()
  loadEmployees()
  loadCostCenters()
  loadInvoiceTypes()
})

// Función para calcular el total
const calculateTotal = () => {
  form.value.total = (form.value.subtotal || 0) + (form.value.tax || 0) - (form.value.discount || 0)
}

// Watch para auto-calcular el total
watch(() => [form.value.subtotal, form.value.tax, form.value.discount], () => {
  calculateTotal()
}, { deep: true })
</script>

<style scoped></style>