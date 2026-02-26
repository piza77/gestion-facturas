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
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente / NIT</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distribución</th>
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
              <td class="px-6 py-4 text-sm text-gray-900">
                <div v-if="cc.client_id || cc.client_nit" class="space-y-1">
                  <div v-if="cc.client_id" class="text-xs text-gray-500">{{ cc.client_id }}</div>
                  <div v-if="cc.client_nit" class="font-medium">{{ cc.client_nit }}</div>
                  <div v-if="cc.contract_number" class="text-xs text-gray-500">Contrato: {{ cc.contract_number }}</div>
                </div>
                <div v-else class="text-gray-400 italic">-</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="cc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-3 py-1 text-xs font-semibold rounded-full">
                  {{ cc.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button @click="openBudgetModal(cc)" 
                          class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                    📊 Distribuir
                  </button>
                  <button @click="openTrackingModal(cc)" 
                          class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                    📈 Seguimiento
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button @click="openModal(cc)" class="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                <button @click="deleteCostCenter(cc.id)" class="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
              </td>
            </tr>
            <tr v-if="costCenters.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
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
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-500 font-semibold">$</span>
                <input v-model="budgetFormatted" @input="updateBudgetValue" type="text" required 
                       class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                       placeholder="0" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">NIT del Cliente</label>
              <input v-model="form.clientNit" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="NIT" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Cliente ID</label>
              <input v-model="form.clientId" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="ID del cliente" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Contrato</label>
              <input v-model="form.contractNumber" type="text" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Contrato" />
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

    <!-- Modal de Distribución de Presupuesto -->
    <div v-if="showBudgetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Distribución de Presupuesto</h2>
              <p class="opacity-90">{{ selectedCenter?.name }} - ${{ formatMoney(selectedCenter?.budget) }}</p>
            </div>
            <button @click="closeBudgetModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Resumen -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 font-medium">Total Distribuido:</span>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">${{ formatMoney(totalDistributed) }}</div>
                <div class="text-sm" :class="totalPercentage === 100 ? 'text-green-600' : 'text-red-600'">
                  {{ totalPercentage.toFixed(1) }}% del presupuesto
                </div>
              </div>
            </div>
            <div v-if="totalPercentage !== 100" class="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 text-sm">
              ⚠️ La distribución debe sumar exactamente 100%
            </div>
          </div>

          <!-- Categorías de Distribución -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Distribución por Categorías</h3>
            
            <div v-for="category in budgetCategories" :key="category.id" 
                 class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">{{ category.icon }}</span>
                    <h4 class="font-semibold text-gray-900">{{ category.name }}</h4>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ category.description }}</p>
                </div>
                
                <div class="flex items-center gap-4">
                  <!-- Porcentaje -->
                  <div class="text-right">
                    <input v-model.number="category.percentage" @input="updateCategoryAmount(category)" 
                           type="number" min="0" max="100" step="0.1"
                           class="w-20 text-center font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm" />
                    <div class="text-xs text-gray-500">%</div>
                  </div>
                  
                  <!-- Monto -->
                  <div class="text-right min-w-[120px]">
                    <div class="font-bold text-lg">${{ formatMoney(category.amount) }}</div>
                    <div class="text-xs text-gray-500">Asignado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex gap-3 pt-4 border-t">
            <button @click="autoDistribute" 
                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm">
              ⚡ Auto-Distribuir
            </button>
            <div class="flex-1"></div>
            <button @click="saveBudgetDistribution" :disabled="totalPercentage !== 100"
                    :class="totalPercentage === 100 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                    class="px-6 py-2 rounded-lg font-semibold">
              💾 Guardar Distribución
            </button>
            <button @click="closeBudgetModal" 
                    class="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Seguimiento de Gastos -->
    <div v-if="showTrackingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Seguimiento de Gastos</h2>
              <p class="opacity-90">{{ selectedCenter?.name }} - {{ selectedCenter?.code }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="sendEmailReport" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                📧 Enviar Reporte
              </button>
              <button @click="closeTrackingModal" class="text-white hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Resumen General -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-blue-700">${{ formatMoney(executionStats.summary?.total_budget || 0) }}</div>
              <div class="text-sm text-blue-600 font-medium">Presupuesto Total</div>
            </div>
            <div class="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-green-700">${{ formatMoney(executionStats.summary?.total_executed || 0) }}</div>
              <div class="text-sm text-green-600 font-medium">Ejecutado</div>
            </div>
            <div class="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-orange-700">${{ formatMoney(executionStats.summary?.total_remaining || 0) }}</div>
              <div class="text-sm text-orange-600 font-medium">Disponible</div>
            </div>
          </div>

          <!-- Progreso General -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-gray-700">Ejecución General</span>
              <span class="text-lg font-bold text-gray-900">{{ generalExecutionPercentage.toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all" 
                   :style="{ width: generalExecutionPercentage + '%' }"></div>
            </div>
          </div>

          <!-- Categorías con Progreso -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Ejecución por Categorías</h3>
              <button @click="openCreateCategoryModal" 
                      class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                ➕ Nueva Categoría
              </button>
            </div>
            
            <div v-for="category in executionStats.categories" :key="category.id" 
                 class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ getCategoryIcon(category.name) }}</span>
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ category.name }}</h4>
                    <p class="text-sm text-gray-600">{{ category.description || 'Sin descripción' }}</p>
                  </div>
                </div>
                <div class="flex gap-2 flex-wrap justify-end items-center">
                  <button @click="openItemsModal(category)" 
                          class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                    📋 Items
                  </button>
                  <button @click="openExpenseModal(category)" 
                          class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                    💰 Gasto
                  </button>
                </div>
              </div>
              
              <!-- Barra de Progreso -->
              <div class="mb-3">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Ejecutado: ${{ formatMoney(category.executed_amount || 0) }}</span>
                  <span class="text-gray-600">Presupuesto: ${{ formatMoney(category.amount) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div :class="getProgressBarColor(category.execution_percentage)" 
                       class="h-2.5 rounded-full transition-all" 
                       :style="{ width: Math.min(category.execution_percentage, 100) + '%' }"></div>
                </div>
                <div class="text-right mt-1">
                  <span :class="getProgressTextColor(category.execution_percentage)" class="text-sm font-semibold">
                    {{ category.execution_percentage.toFixed(1) }}%
                  </span>
                </div>
              </div>
              
              <!-- Información adicional -->
              <div class="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>Disponible: ${{ formatMoney(category.remaining_amount) }}</div>
                <div>Porcentaje: {{ category.percentage }}%</div>
                <div :class="category.execution_percentage > 100 ? 'text-red-600 font-semibold' : ''">
                  {{ category.execution_percentage > 100 ? '⚠️ Sobregiro!' : '✓ En rango' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Agregar Gasto -->
    <div v-if="showExpenseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold">Registrar Gasto</h2>
              <p class="opacity-90">{{ selectedCategory?.name }}</p>
            </div>
            <button @click="closeExpenseModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveExpense" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Monto del Gasto *</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-500 font-semibold">$</span>
              <input v-model="expenseFormatted" @input="updateExpenseValue" type="text" required 
                     class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                     placeholder="150.000" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea v-model="expenseForm.description" rows="3" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="Descripción del gasto..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold">
              💾 Registrar Gasto
            </button>
            <button type="button" @click="closeExpenseModal" class="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Items de Categoría -->
    <div v-if="showItemsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl sticky top-0">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Items de Presupuesto</h2>
              <p class="opacity-90">{{ selectedCategory?.name }} - ${{ formatMoney(selectedCategory?.amount || 0) }}</p>
            </div>
            <button @click="closeItemsModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Resumen de Items -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-blue-700">{{ itemsSummary.total_items }}</div>
              <div class="text-xs text-blue-600 font-medium">Total Items</div>
            </div>
            <div class="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-green-700">${{ formatMoney(itemsSummary.total_amount || 0) }}</div>
              <div class="text-xs text-green-600 font-medium">Monto Total</div>
            </div>
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-yellow-700">{{ itemsSummary.by_status?.ejecutado || 0 }}</div>
              <div class="text-xs text-yellow-600 font-medium">Ejecutados</div>
            </div>
          </div>

          <!-- Botón para agregar nuevo item -->
          <div>
            <button @click="openCreateItemModal" 
                    class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Item
            </button>
          </div>

          <!-- Lista de Items -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900">Items Registrados</h3>
            
            <div v-if="categoryItems.length === 0" class="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
              <p>No hay items registrados para esta categoría</p>
            </div>

            <div v-for="item in categoryItems" :key="item.id" 
                 class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
                    <span :class="getStatusBadgeClass(item.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ item.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ item.description || 'Sin descripción' }}</p>
                  <div class="text-sm text-gray-500">
                    <span>Tipo: {{ item.item_type }}</span> • 
                    <span>Creado: {{ new Date(item.created_at).toLocaleDateString('es-CO') }}</span>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <div class="text-xl font-bold text-gray-900">${{ formatMoney(item.amount) }}</div>
                  <div class="flex gap-2 mt-2">
                    <button @click="editItem(item)" 
                            class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      ✏️ Editar
                    </button>
                    <button @click="deleteItem(item.id)" 
                            class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar Item -->
    <div v-if="showCreateItemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">{{ editingItem ? 'Editar Item' : 'Nuevo Item' }}</h2>
            <button @click="closeCreateItemModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre del Item *</label>
            <input v-model="itemForm.name" type="text" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                   placeholder="Ej: Compra de herramientas" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Item *</label>
            <select v-model="itemForm.itemType" required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Selecciona un tipo</option>
              <option value="contratacion">Contratación</option>
              <option value="compra">Compra</option>
              <option value="servicio">Servicio</option>
              <option value="viaje">Viaje</option>
              <option value="capacitacion">Capacitación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Monto *</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-500 font-semibold">$</span>
              <input v-model="itemFormatted" @input="updateItemValue" type="text" required 
                     class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                     placeholder="250.000" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea v-model="itemForm.description" rows="3" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Detalles del item..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold">
              💾 {{ editingItem ? 'Actualizar' : 'Guardar' }}
            </button>
            <button type="button" @click="closeCreateItemModal" class="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Crear Categoría -->
    <div v-if="showCreateCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Nueva Categoría</h2>
            <button @click="closeCreateCategoryModal" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveCategory" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Categoría *</label>
            <input v-model="categoryForm.name" type="text" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="Ej: Tecnología, Capacitación, etc." />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Monto Asignado *</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-500 font-semibold">$</span>
              <input v-model="categoryFormatted" @input="updateCategoryValue" type="text" required 
                     class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                     placeholder="500.000" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Porcentaje del Presupuesto *</label>
            <div class="relative">
              <input v-model="categoryForm.percentage" type="number" step="0.01" min="0" max="100" required 
                     class="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                     placeholder="25.5" />
              <span class="absolute right-3 top-3 text-gray-500 font-semibold">%</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea v-model="categoryForm.description" rows="3" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      placeholder="Descripción de la categoría..."></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold">
              💾 Crear Categoría
            </button>
            <button type="button" @click="closeCreateCategoryModal" class="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const costCenters = ref([])
const showModal = ref(false)
const showBudgetModal = ref(false)
const showTrackingModal = ref(false)
const showExpenseModal = ref(false)
const showItemsModal = ref(false)
const showCreateItemModal = ref(false)
const showCreateCategoryModal = ref(false)
const loading = ref(false)
const editingCenter = ref(null)
const selectedCenter = ref(null)
const selectedCategory = ref(null)
const budgetFormatted = ref('')
const executionStats = ref({ summary: {}, categories: [] })
const categoryItems = ref([])
const itemsSummary = ref({ total_items: 0, total_amount: 0, by_status: {} })
const editingItem = ref(null)

const form = ref({
  code: '',
  name: '',
  description: '',
  budget: 0,
  clientId: '',
  clientNit: '',
  contractNumber: '',
  isActive: true
})

const expenseForm = ref({
  amount: 0,
  description: ''
})

const expenseFormatted = ref('')

const itemForm = ref({
  name: '',
  description: '',
  amount: 0,
  itemType: ''
})

const itemFormatted = ref('')

const categoryForm = ref({
  name: '',
  description: '',
  amount: 0,
  percentage: 0
})

const categoryFormatted = ref('')

// Categorías predeterminadas para distribución del presupuesto
const budgetCategories = ref([
  { id: 'rh', name: 'Recursos Humanos', icon: '👥', percentage: 50, amount: 0, description: 'Salarios, beneficios y contrataciones' },
  { id: 'logistica', name: 'Logística', icon: '🚛', percentage: 20, amount: 0, description: 'Transporte, almacenamiento y envíos' },
  { id: 'reembolsables', name: 'Reembolsables', icon: '💰', percentage: 10, amount: 0, description: 'Gastos a reembolsar a empleados' },
  { id: 'contratos', name: 'Contratos', icon: '📄', percentage: 10, amount: 0, description: 'Servicios contratados externos' },
  { id: 'imprevistos', name: 'Imprevistos', icon: '⚡', percentage: 8, amount: 0, description: 'Contingencias y emergencias' },
  { id: 'otros', name: 'Otros', icon: '📦', percentage: 2, amount: 0, description: 'Gastos varios no categorizados' }
])

// Computed properties
const totalPercentage = computed(() => {
  return budgetCategories.value.reduce((sum, cat) => sum + (cat.percentage || 0), 0)
})

const totalDistributed = computed(() => {
  return budgetCategories.value.reduce((sum, cat) => sum + (cat.amount || 0), 0)
})

const generalExecutionPercentage = computed(() => {
  const totalBudget = executionStats.value?.summary?.total_budget || 0
  const totalExecuted = executionStats.value?.summary?.total_executed || 0
  return totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0
})

// Formateo de moneda
const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatCurrency = (value) => {
  const num = parseFloat(value.toString().replace(/[^\d]/g, '')) || 0
  return new Intl.NumberFormat('es-CO').format(num)
}

const updateBudgetValue = (event) => {
  const value = event.target.value.replace(/[^\d]/g, '')
  const numValue = parseInt(value) || 0
  form.value.budget = numValue
  budgetFormatted.value = formatCurrency(numValue)
  
  // Actualizar montos de categorías si está abierto el modal de distribución
  if (showBudgetModal.value) {
    budgetCategories.value.forEach(cat => updateCategoryAmount(cat))
  }
}

const updateCategoryAmount = (category) => {
  const budget = selectedCenter.value?.budget || 0
  category.amount = Math.round((budget * (category.percentage || 0)) / 100)
}

const autoDistribute = () => {
  // Distribución automática con porcentajes predeterminados
  const defaultDistribution = [50, 20, 10, 10, 8, 2]
  budgetCategories.value.forEach((cat, index) => {
    cat.percentage = defaultDistribution[index]
    updateCategoryAmount(cat)
  })
}

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    description: '',
    budget: 0,
    clientId: '',
    clientNit: '',
    contractNumber: '',
    isActive: true
  }
  budgetFormatted.value = '0'
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
      clientId: center.client_id || '',
      clientNit: center.client_nit || '',
      contractNumber: center.contract_number || '',
      isActive: center.is_active
    }
    budgetFormatted.value = formatCurrency(center.budget)
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

const openBudgetModal = async (center) => {
  selectedCenter.value = center
  
  try {
    // Cargar categorías existentes de la BD
    const response = await api.getBudgetExecution(center.id)
    const existingCategories = response.data?.categories || []
    
    if (existingCategories.length > 0) {
      // Si ya tiene categorías, usarlas
      budgetCategories.value = existingCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.name),
        percentage: parseFloat(cat.percentage),
        amount: parseFloat(cat.amount),
        description: cat.description || '',
        existing: true // Marcar como existente
      }))
    } else {
      // Si no tiene categorías, usar las predeterminadas
      budgetCategories.value = [
        { id: 'rh', name: 'Recursos Humanos', icon: '👥', percentage: 50, amount: 0, description: 'Salarios, beneficios y contrataciones' },
        { id: 'logistica', name: 'Logística', icon: '🚛', percentage: 20, amount: 0, description: 'Transporte, almacenamiento y envíos' },
        { id: 'reembolsables', name: 'Reembolsables', icon: '💰', percentage: 10, amount: 0, description: 'Gastos a reembolsar a empleados' },
        { id: 'contratos', name: 'Contratos', icon: '📄', percentage: 10, amount: 0, description: 'Servicios contratados externos' },
        { id: 'imprevistos', name: 'Imprevistos', icon: '⚡', percentage: 8, amount: 0, description: 'Contingencias y emergencias' },
        { id: 'otros', name: 'Otros', icon: '📦', percentage: 2, amount: 0, description: 'Gastos varios no categorizados' }
      ]
      
      // Calcular montos iniciales
      budgetCategories.value.forEach(cat => updateCategoryAmount(cat))
    }
    
    showBudgetModal.value = true
  } catch (error) {
    console.error('Error cargando categorías:', error)
    // Si hay error, usar categorías predeterminadas
    budgetCategories.value.forEach(cat => updateCategoryAmount(cat))
    showBudgetModal.value = true
  }
}

const closeBudgetModal = () => {
  showBudgetModal.value = false
  selectedCenter.value = null
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

const saveBudgetDistribution = async () => {
  try {
    // Guardar o actualizar categorías de presupuesto
    for (const category of budgetCategories.value) {
      if (category.percentage > 0) {
        const categoryData = {
          costCenterId: selectedCenter.value.id,
          name: category.name,
          amount: category.amount,
          percentage: category.percentage,
          description: category.description,
          order: budgetCategories.value.indexOf(category) + 1
        }
        
        if (category.existing && category.id) {
          // Actualizar categoría existente
          await api.updateBudgetCategory(category.id, categoryData)
        } else {
          // Crear nueva categoría
          await api.createBudgetCategory(categoryData)
        }
      }
    }
    
    alert('Distribución de presupuesto guardada correctamente')
    closeBudgetModal()
  } catch (error) {
    console.error('Error guardando distribución:', error)
    alert('Error al guardar distribución: ' + (error.response?.data?.error || error.message))
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

// Funciones para seguimiento de gastos
const openTrackingModal = async (costCenter) => {
  selectedCenter.value = costCenter
  showTrackingModal.value = true
  await loadExecutionStats(costCenter.id)
}

const closeTrackingModal = () => {
  showTrackingModal.value = false
  selectedCenter.value = null
  executionStats.value = { summary: {}, categories: [] }
}

const openExpenseModal = (category) => {
  selectedCategory.value = category
  expenseForm.value = { amount: 0, description: '' }
  expenseFormatted.value = ''
  showExpenseModal.value = true
}

const closeExpenseModal = () => {
  showExpenseModal.value = false
  selectedCategory.value = null
  expenseForm.value = { amount: 0, description: '' }
  expenseFormatted.value = ''
}

const loadExecutionStats = async (costCenterId) => {
  try {
    const response = await api.getBudgetExecution(costCenterId)
    executionStats.value = response.data  // Usar response.data en lugar de response
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
    alert('No se pudo cargar el seguimiento de gastos')
  }
}

const updateExpenseValue = () => {
  // Limpiar todo excepto dígitos
  let value = expenseFormatted.value.replace(/[^\d]/g, '')
  
  // Convertir a número
  const numericValue = parseFloat(value) || 0
  expenseForm.value.amount = numericValue
  
  // Formatear con separadores de miles y signo peso
  if (numericValue > 0) {
    expenseFormatted.value = numericValue.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  } else {
    expenseFormatted.value = ''
  }
}

const saveExpense = async () => {
  try {
    console.log('💰 Guardando gasto:', expenseForm.value) // DEBUG
    console.log('📤 Categoría seleccionada:', selectedCategory.value) // DEBUG
    
    const response = await api.addBudgetExpense(selectedCategory.value.id, expenseForm.value)
    console.log('✅ Gasto registrado:', response) // DEBUG
    
    alert('Gasto registrado correctamente')
    closeExpenseModal()
    await loadExecutionStats(selectedCenter.value.id)
  } catch (error) {
    console.error('❌ Error registrando gasto:', error) // DEBUG
    console.error('❌ Error response:', error.response) // DEBUG
    alert('Error al registrar el gasto: ' + (error.response?.data?.error || error.message || 'Error desconocido'))
  }
}

const sendEmailReport = async () => {
  try {
    await api.sendBudgetNotification(selectedCenter.value.id)
    alert('Reporte de presupuesto enviado por correo')
  } catch (error) {
    console.error('Error enviando email:', error)
    alert('Error al enviar email: ' + (error.response?.data?.error || 'Error desconocido'))
  }
}

const getCategoryIcon = (name) => {
  const iconMap = {
    'Personal': '👥',
    'Tecnología': '💻',
    'Marketing': '📢',
    'Infraestructura': '🏢',
    'Operaciones': '⚙️',
    'Ventas': '💰',
    'Capacitación': '📚',
    'Viajes': '✈️'
  }
  return iconMap[name] || '📊'
}

const getProgressBarColor = (percentage) => {
  if (percentage <= 50) return 'bg-gradient-to-r from-green-500 to-emerald-500'
  if (percentage <= 80) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  if (percentage <= 100) return 'bg-gradient-to-r from-orange-500 to-red-500'
  return 'bg-gradient-to-r from-red-600 to-red-700'
}

const getProgressTextColor = (percentage) => {
  if (percentage <= 50) return 'text-green-700'
  if (percentage <= 80) return 'text-orange-700'
  if (percentage <= 100) return 'text-red-700'
  return 'text-red-800'
}

// Funciones para Items de Categorías
const openItemsModal = async (category) => {
  selectedCategory.value = category
  showItemsModal.value = true
  await loadCategoryItems(category.id)
}

const closeItemsModal = () => {
  showItemsModal.value = false
  selectedCategory.value = null
  categoryItems.value = []
  itemsSummary.value = { total_items: 0, total_amount: 0, by_status: {} }
}

const loadCategoryItems = async (categoryId) => {
  try {
    console.log('🔄 Cargando items para categoría:', categoryId) // DEBUG
    const response = await api.getBudgetItems(categoryId)
    console.log('📦 Respuesta items:', response) // DEBUG
    
    // Manejar estructura de respuesta de Axios
    const data = response.data || response
    categoryItems.value = data.items || data || []
    itemsSummary.value = data.summary || { total_items: 0, total_amount: 0, by_status: {} }
    
    console.log('✅ Items cargados:', categoryItems.value.length) // DEBUG
  } catch (error) {
    console.error('❌ Error cargando items:', error) // DEBUG
    console.error('❌ Error response:', error.response) // DEBUG
    
    // No mostrar alert si es 404 (no hay items todavía)
    if (error.response?.status !== 404) {
      alert('No se pudieron cargar los items')
    } else {
      console.log('ℹ️ No hay items para esta categoría') // DEBUG
      categoryItems.value = []
      itemsSummary.value = { total_items: 0, total_amount: 0, by_status: {} }
    }
  }
}

const openCreateItemModal = () => {
  editingItem.value = null
  itemForm.value = { name: '', description: '', amount: 0, itemType: '' }
  itemFormatted.value = ''
  showCreateItemModal.value = true
}

const closeCreateItemModal = () => {
  showCreateItemModal.value = false
  editingItem.value = null
  itemForm.value = { name: '', description: '', amount: 0, itemType: '' }
  itemFormatted.value = ''
}

const editItem = (item) => {
  editingItem.value = item
  itemForm.value = {
    name: item.name,
    description: item.description,
    amount: item.amount,
    itemType: item.item_type
  }
  // Formatear el valor con separadores de miles
  itemFormatted.value = parseFloat(item.amount).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  showCreateItemModal.value = true
}

const updateItemValue = () => {
  // Limpiar todo excepto dígitos y punto decimal
  let value = itemFormatted.value.replace(/[^\d]/g, '')
  
  // Convertir a número
  const numericValue = parseFloat(value) || 0
  itemForm.value.amount = numericValue
  
  // Formatear con separadores de miles y signo peso
  if (numericValue > 0) {
    itemFormatted.value = numericValue.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  } else {
    itemFormatted.value = ''
  }
}

const saveItem = async () => {
  try {
    console.log('📝 Guardando item:', itemForm.value) // DEBUG
    
    if (!itemForm.value.name || !itemForm.value.itemType || itemForm.value.amount <= 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (editingItem.value) {
      const response = await api.updateBudgetItem(editingItem.value.id, itemForm.value)
      console.log('✅ Item actualizado:', response) // DEBUG
      alert('Item actualizado correctamente')
    } else {
      const payload = {
        categoryId: selectedCategory.value.id,
        ...itemForm.value
      }
      console.log('📤 Enviando payload:', payload) // DEBUG
      const response = await api.createBudgetItem(payload)
      console.log('✅ Item creado:', response) // DEBUG
      alert('Item creado correctamente')
    }

    closeCreateItemModal()
    await loadCategoryItems(selectedCategory.value.id)
  } catch (error) {
    console.error('❌ Error completo:', error) // DEBUG
    console.error('❌ Error response:', error.response) // DEBUG
    alert('Error al guardar el item: ' + (error.response?.data?.error || error.message || 'Error desconocido'))
  }
}

const deleteItem = async (itemId) => {
  if (!confirm('¿Está seguro de que desea eliminar este item?')) return

  try {
    await api.deleteBudgetItem(itemId)
    alert('Item eliminado correctamente')
    await loadCategoryItems(selectedCategory.value.id)
  } catch (error) {
    console.error('Error eliminando item:', error)
    alert('Error al eliminar el item')
  }
}

const getStatusBadgeClass = (status) => {
  const statusMap = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'aprobado': 'bg-blue-100 text-blue-800',
    'ejecutado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800'
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800'
}

// Funciones para manejar categorías
const openCreateCategoryModal = () => {
  categoryForm.value = { name: '', description: '', amount: 0, percentage: 0 }
  categoryFormatted.value = ''
  showCreateCategoryModal.value = true
}

const closeCreateCategoryModal = () => {
  showCreateCategoryModal.value = false
  categoryForm.value = { name: '', description: '', amount: 0, percentage: 0 }
  categoryFormatted.value = ''
}

const updateCategoryValue = () => {
  // Limpiar todo excepto dígitos
  let value = categoryFormatted.value.replace(/[^\d]/g, '')
  
  // Convertir a número
  const numericValue = parseFloat(value) || 0
  categoryForm.value.amount = numericValue
  
  // Formatear con separadores de miles
  if (numericValue > 0) {
    categoryFormatted.value = numericValue.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  } else {
    categoryFormatted.value = ''
  }
  
  // Calcular porcentaje automáticamente si hay presupuesto del centro
  if (selectedCenter.value?.budget && numericValue > 0) {
    const percentage = (numericValue / selectedCenter.value.budget * 100).toFixed(2)
    categoryForm.value.percentage = parseFloat(percentage)
  }
}

const saveCategory = async () => {
  try {
    console.log('📝 Guardando categoría:', categoryForm.value) // DEBUG
    
    if (!categoryForm.value.name || categoryForm.value.amount <= 0 || categoryForm.value.percentage <= 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const payload = {
      costCenterId: selectedCenter.value.id,
      name: categoryForm.value.name,
      description: categoryForm.value.description,
      amount: categoryForm.value.amount,
      percentage: categoryForm.value.percentage
    }
    
    console.log('📤 Enviando payload categoría:', payload) // DEBUG
    const response = await api.createBudgetCategory(payload)
    console.log('✅ Categoría creada:', response) // DEBUG
    
    alert('Categoría creada correctamente')
    closeCreateCategoryModal()
    
    // Recargar estadísticas de ejecución para mostrar la nueva categoría
    await loadExecutionStats(selectedCenter.value.id)
  } catch (error) {
    console.error('❌ Error completo:', error) // DEBUG
    console.error('❌ Error response:', error.response) // DEBUG
    alert('Error al crear la categoría: ' + (error.response?.data?.error || error.message || 'Error desconocido'))
  }
}

onMounted(() => {
  loadCostCenters()
})
</script>