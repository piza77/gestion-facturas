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
          <option value="filed">Radicado</option>
          <option value="accounted">Contabilizado</option>
          <option value="paid">Pagado</option>
          <option value="cancelled">Cancelado</option>
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 max-w-xs overflow-hidden text-ellipsis" style="min-width: 120px;">
                ${{ formatCurrency(invoice.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.issue_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span :class="getStatusClass(invoice.status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                  <button 
                    v-if="getNextStatus(invoice.status)"
                    @click="changeStatus(invoice.id, getNextStatus(invoice.status))"
                    class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-semibold"
                    :title="`Cambiar a ${getStatusLabel(getNextStatus(invoice.status))}`"
                  >
                    →
                  </button>
                </div>
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

    <!-- Modal con Secciones Colapsables -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">{{ editingInvoice ? 'Ver/Editar Factura' : 'Nueva Factura' }}</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveInvoice" class="p-6 space-y-3">
          <!-- SECCIÓN 1: INFORMACIÓN BÁSICA -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.basic = !expandedSections.basic" class="w-full bg-blue-50 hover:bg-blue-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-blue-900">📋 Información Básica</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.basic}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.basic" class="p-6 space-y-4 bg-white">
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
                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.first_name }} {{ emp.last_name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Orden</label>
                  <input v-model="form.orderNumber" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div class="col-span-2 flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.isReimbursable" type="checkbox" class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <span class="text-sm font-semibold text-gray-700">¿Es Reembolsable?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: HISTORIAL DE ESTADOS -->
          <div v-if="editingInvoice" class="border-2 border-orange-200 rounded-xl overflow-hidden bg-orange-50">
            <div class="px-6 py-4 bg-orange-100 border-b-2 border-orange-200">
              <h3 class="text-lg font-bold text-orange-900">📅 Historial de Estados y Transiciones</h3>
            </div>
            <div class="p-6 space-y-4">
              <!-- Timeline de estados -->
              <div class="space-y-3">
                <!-- Pendiente -->
                <div class="flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full" :class="editingInvoice.status === 'pending' || ['filed', 'accounted', 'paid'].includes(editingInvoice.status) ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <div v-if="!['paid'].includes(editingInvoice.status)" class="w-0.5 h-12 bg-gray-300"></div>
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="font-semibold text-gray-900">Pendiente</p>
                    <p class="text-sm text-gray-600">Estado inicial de la factura</p>
                  </div>
                </div>

                <!-- Radicado -->
                <div class="flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full" :class="editingInvoice.filed_at ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <div v-if="!['paid'].includes(editingInvoice.status)" class="w-0.5 h-12 bg-gray-300"></div>
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="font-semibold text-gray-900">Radicado</p>
                    <p v-if="editingInvoice.filed_at" class="text-sm text-green-600">
                      ✅ {{ formatDate(editingInvoice.filed_at) }}
                    </p>
                    <p v-else class="text-sm text-gray-600">Pendiente de radicar</p>
                  </div>
                </div>

                <!-- Contabilizado -->
                <div class="flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full" :class="editingInvoice.accounted_at ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <div v-if="!['paid'].includes(editingInvoice.status)" class="w-0.5 h-12 bg-gray-300"></div>
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="font-semibold text-gray-900">Contabilizado</p>
                    <p v-if="editingInvoice.accounted_at" class="text-sm text-green-600">
                      ✅ {{ formatDate(editingInvoice.accounted_at) }}
                    </p>
                    <p v-else class="text-sm text-gray-600">Pendiente de contabilizar</p>
                  </div>
                </div>

                <!-- Pagado -->
                <div class="flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full" :class="editingInvoice.paid_at ? 'bg-green-500' : 'bg-gray-300'"></div>
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="font-semibold text-gray-900">Pagado</p>
                    <p v-if="editingInvoice.paid_at" class="text-sm text-green-600">
                      ✅ {{ formatDate(editingInvoice.paid_at) }}
                    </p>
                    <p v-else class="text-sm text-gray-600">Pendiente de pagar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: MONTOS Y FECHAS -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.amounts = !expandedSections.amounts" class="w-full bg-green-50 hover:bg-green-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-green-900">💰 Montos y Fechas</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.amounts}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.amounts" class="p-6 space-y-4 bg-white">
              <div class="grid grid-cols-2 gap-4">
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
                  <input :value="form.subtotal" @input="form.subtotal = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" required class="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-semibold text-sm sm:text-base overflow-hidden" style="font-size: clamp(0.875rem, 2vw, 1rem);" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Impuesto</label>
                  <input :value="form.tax" @input="form.tax = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" class="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-right font-semibold text-sm sm:text-base overflow-hidden" style="font-size: clamp(0.875rem, 2vw, 1rem);" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Descuento</label>
                  <input :value="form.discount" @input="form.discount = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" class="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right font-semibold text-sm sm:text-base overflow-hidden" style="font-size: clamp(0.875rem, 2vw, 1rem);" />
                </div>
              </div>
              <div class="text-center bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-xl border-2 border-purple-300">
                <label class="block text-sm font-semibold text-purple-700 mb-2">TOTAL</label>
                <div class="font-extrabold text-purple-900 overflow-hidden" style="font-size: clamp(1.5rem, 5vw, 2.25rem);">{{ formatMoney(form.total) }}</div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                  <textarea v-model="form.description" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                  <textarea v-model="form.notes" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: AUTORIZACIONES -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.authorizations = !expandedSections.authorizations" class="w-full bg-red-50 hover:bg-red-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-red-900">✅ Autorizaciones de Directores</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.authorizations}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.authorizations" class="p-6 space-y-4 bg-white">
              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 cursor-pointer">
                  <input v-model="form.adminDirectorApproved" type="checkbox" class="w-5 h-5 text-red-600 rounded" />
                  <span class="font-semibold text-gray-700">Director Administrativo</span>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 cursor-pointer">
                  <input v-model="form.upstreamDirectorApproved" type="checkbox" class="w-5 h-5 text-red-600 rounded" />
                  <span class="font-semibold text-gray-700">Directora de Upstream</span>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 cursor-pointer">
                  <input v-model="form.hrDirectorApproved" type="checkbox" class="w-5 h-5 text-red-600 rounded" />
                  <span class="font-semibold text-gray-700">Director RRHH</span>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 cursor-pointer">
                  <input v-model="form.financeDirectorApproved" type="checkbox" class="w-5 h-5 text-red-600 rounded" />
                  <span class="font-semibold text-gray-700">Director Financiero</span>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 cursor-pointer col-span-2">
                  <input v-model="form.generalDirectorApproved" type="checkbox" class="w-5 h-5 text-red-600 rounded" />
                  <span class="font-semibold text-gray-700">Director General</span>
                </label>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 4: REGISTRO CONTABLE -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.accounting = !expandedSections.accounting" class="w-full bg-yellow-50 hover:bg-yellow-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-yellow-900">📝 Registro Contable (Auxiliar)</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.accounting}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.accounting" class="p-6 space-y-4 bg-white">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Municipio</label>
                  <input v-model="form.accountingMunicipality" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Registro</label>
                  <input v-model="form.accountingRegistrationDate" type="date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
                  <input v-model="form.accountingDocumentType" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Documento</label>
                  <input v-model="form.accountingDocumentNumber" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Radicación DIAN</label>
                  <input v-model="form.accountingDianNumber" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                  <textarea v-model="form.accountingObservations" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent" rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 5: ANÁLISIS CONTABLE -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.analysis = !expandedSections.analysis" class="w-full bg-indigo-50 hover:bg-indigo-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-indigo-900">🔍 Análisis Contable (Analista)</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.analysis}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.analysis" class="p-6 space-y-4 bg-white">
              <label class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-indigo-50 cursor-pointer">
                <input v-model="form.analystGoodSealApproved" type="checkbox" class="w-5 h-5 text-indigo-600 rounded" />
                <span class="font-semibold text-gray-700">Visto Bueno Aprobado</span>
              </label>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Revisión</label>
                <input v-model="form.analystReviewDate" type="date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Archivo XML/PSF</label>
                <input type="file" accept=".xml,.psf" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                <textarea v-model="form.analystObservations" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 6: CONTROL DE PAGO -->
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button type="button" @click="expandedSections.payment = !expandedSections.payment" class="w-full bg-emerald-50 hover:bg-emerald-100 px-6 py-4 flex justify-between items-center">
              <h3 class="text-lg font-bold text-emerald-900">💵 Control de Pago</h3>
              <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': expandedSections.payment}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
            <div v-if="expandedSections.payment" class="p-6 space-y-4 bg-white">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de Pago</label>
                  <input v-model="form.paymentDate" type="date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Valor Pagado</label>
                  <input v-model="form.paymentAmount" @input="form.paymentAmount = parseFloat(($event.target.value || '0').replace(',', '.')) || 0" type="text" placeholder="0" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right font-semibold text-sm sm:text-base overflow-hidden" style="font-size: clamp(0.875rem, 2vw, 1rem);" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Comprobante de Egreso</label>
                <input type="file" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                <textarea v-model="form.paymentObservations" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="space-y-4">
            <!-- Mostrar estado actual y transición disponible -->
            <div v-if="editingInvoice" class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-blue-700 font-semibold">Estado Actual: <span class="text-lg text-blue-900">{{ getStatusLabel(editingInvoice.status) }}</span></p>
                </div>
                <button 
                  v-if="getNextStatus(editingInvoice.status)"
                  type="button"
                  @click="changeStatus(editingInvoice.id, getNextStatus(editingInvoice.status))"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cambiar a {{ getStatusLabel(getNextStatus(editingInvoice.status)) }} →
                </button>
                <div v-else class="text-green-700 font-semibold">
                  ✅ Documento finalizado
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-6 border-t-2 border-gray-200">
              <button type="submit" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
                {{ editingInvoice ? 'Actualizar' : 'Crear' }} Factura
              </button>
              <button type="button" @click="closeModal" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition">
                Cancelar
              </button>
            </div>
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
const expandedSections = ref({
  basic: true,
  amounts: true,
  authorizations: false,
  accounting: false,
  analysis: false,
  payment: false
})
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
    orderNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    isReimbursable: false,
    description: '',
    notes: '',
    // Autorizaciones
    adminDirectorApproved: false,
    upstreamDirectorApproved: false,
    hrDirectorApproved: false,
    financeDirectorApproved: false,
    generalDirectorApproved: false,
    // Registro Contable
    accountingMunicipality: '',
    accountingRegistrationDate: '',
    accountingDocumentType: '',
    accountingDocumentNumber: '',
    accountingDianNumber: '',
    accountingObservations: '',
    // Análisis Contable
    analystGoodSealApproved: false,
    analystReviewDate: '',
    analystObservations: '',
    // Control de Pago
    paymentDate: '',
    paymentAmount: 0,
    paymentObservations: ''
  }
  file.value = null
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  // Si es un ISO string con T, extraer solo la fecha
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  return dateString
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
    // Normalizar fechas en las facturas cargadas
    invoices.value = (data.invoices || []).map(invoice => ({
      ...invoice,
      issue_date: formatDateForInput(invoice.issue_date),
      due_date: formatDateForInput(invoice.due_date)
    }))
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
    
    // Helper para convertir fechas a formato yyyy-MM-dd
    const formatDateInput = (dateString) => {
      if (!dateString) return ''
      // Si es un ISO string con T, extraer solo la fecha
      if (dateString.includes('T')) {
        return dateString.split('T')[0]
      }
      return dateString
    }
    
    // Llenar todos los campos de la factura
    form.value = {
      invoiceNumber: invoice.invoice_number || '',
      invoiceTypeId: invoice.invoice_type_id || '',
      providerId: invoice.provider_id || '',
      costCenterId: invoice.cost_center_id || '',
      employeeId: invoice.employee_id || '',
      orderNumber: invoice.order_number || '',
      issueDate: formatDateInput(invoice.issue_date),
      dueDate: formatDateInput(invoice.due_date),
      subtotal: parseFloat(invoice.subtotal) || 0,
      tax: parseFloat(invoice.tax) || 0,
      discount: parseFloat(invoice.discount) || 0,
      total: parseFloat(invoice.total) || 0,
      isReimbursable: invoice.is_reimbursable || false,
      description: invoice.description || '',
      notes: invoice.notes || '',
      // Autorizaciones
      adminDirectorApproved: invoice.admin_director_approved || false,
      upstreamDirectorApproved: invoice.upstream_director_approved || false,
      hrDirectorApproved: invoice.hr_director_approved || false,
      financeDirectorApproved: invoice.finance_director_approved || false,
      generalDirectorApproved: invoice.general_director_approved || false,
      // Registro Contable
      accountingMunicipality: invoice.accounting_municipality || '',
      accountingRegistrationDate: formatDateInput(invoice.accounting_registration_date),
      accountingDocumentType: invoice.accounting_document_type || '',
      accountingDocumentNumber: invoice.accounting_document_number || '',
      accountingDianNumber: invoice.accounting_dian_number || '',
      accountingObservations: invoice.accounting_observations || '',
      // Análisis Contable
      analystGoodSealApproved: invoice.analyst_good_seal_approved || false,
      analystReviewDate: formatDateInput(invoice.analyst_review_date),
      analystObservations: invoice.analyst_observations || '',
      // Control de Pago
      paymentDate: formatDateInput(invoice.payment_date),
      paymentAmount: parseFloat(invoice.payment_amount) || 0,
      paymentObservations: invoice.payment_observations || ''
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
      orderNumber: 'order_number',
      issueDate: 'issue_date',
      dueDate: 'due_date',
      subtotal: 'subtotal',
      tax: 'tax',
      discount: 'discount',
      total: 'total',
      isReimbursable: 'is_reimbursable',
      description: 'description',
      notes: 'notes',
      // Autorizaciones
      adminDirectorApproved: 'admin_director_approved',
      upstreamDirectorApproved: 'upstream_director_approved',
      hrDirectorApproved: 'hr_director_approved',
      financeDirectorApproved: 'finance_director_approved',
      generalDirectorApproved: 'general_director_approved',
      // Registro Contable
      accountingMunicipality: 'accounting_municipality',
      accountingRegistrationDate: 'accounting_registration_date',
      accountingDocumentType: 'accounting_document_type',
      accountingDocumentNumber: 'accounting_document_number',
      accountingDianNumber: 'accounting_dian_number',
      accountingObservations: 'accounting_observations',
      // Análisis Contable
      analystGoodSealApproved: 'analyst_good_seal_approved',
      analystReviewDate: 'analyst_review_date',
      analystObservations: 'analyst_observations',
      // Control de Pago
      paymentDate: 'payment_date',
      paymentAmount: 'payment_amount',
      paymentObservations: 'payment_observations'
    }

    Object.keys(fieldMapping).forEach(camelKey => {
      const snakeKey = fieldMapping[camelKey]
      let value = form.value[camelKey]
      
      // Convertir valores vacíos a null para el backend
      if (value === undefined || value === '') {
        value = null
      }
      
      // Convertir fechas a formato yyyy-MM-dd
      if ((snakeKey.includes('date') || snakeKey.includes('_date')) && value) {
        // Si es un string con formato ISO, extraer solo la fecha
        if (typeof value === 'string' && value.includes('T')) {
          value = value.split('T')[0]
        }
      }
      
      // Convertir booleano a 0/1 para MySQL
      if (typeof value === 'boolean') {
        value = value ? 1 : 0
      }
      
      // Agregar todos los campos mapeados (incluso si son null o 0)
      // Solo no agregar si es undefined
      formData.append(snakeKey, value !== null ? value : '')
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
    filed: 'Radicado',
    accounted: 'Contabilizado',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    overdue: 'Vencida',
    approved: 'Aprobada',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    filed: 'bg-blue-100 text-blue-800',
    accounted: 'bg-purple-100 text-purple-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    overdue: 'bg-red-100 text-red-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getNextStatus = (currentStatus) => {
  const transitions = {
    'pending': 'filed',
    'filed': 'accounted',
    'accounted': 'paid',
    'paid': null
  }
  return transitions[currentStatus] || null
}

const changeStatus = async (invoiceId, newStatus) => {
  try {
    await api.updateInvoiceStatus(invoiceId, { status: newStatus })
    alert('Estado actualizado correctamente')
    loadInvoices()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    alert('Error al cambiar estado: ' + error.response?.data?.error)
  }
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