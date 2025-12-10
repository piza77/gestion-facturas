<template>
  <div class="p-6">

    <!-- ENCABEZADO -->
    <div class="flex items-center mb-8">
      <div class="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-xl">
        <slot name="icon">
          <!-- Ícono por defecto -->
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293L18.707 8.707A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
        </slot>
      </div>

      <div class="ml-4">
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
          {{ title }}
        </h1>
        <p class="text-gray-500">Gestión de {{ (title || "FACTURAS").toLowerCase() }}</p>
      </div>

      <button 
        class="ml-auto px-6 py-2 rounded-xl text-white font-semibold shadow-md
               bg-gradient-to-r from-blue-600 to-blue-400 hover:scale-105 transition"
        @click="$emit('create')"
      >
        + Crear
      </button>
    </div>

    <!-- BUSCADOR -->
    <div class="mb-6 flex justify-between items-center">
      <input 
        v-model="search"
        type="text" 
        placeholder="Buscar..."
        class="w-72 px-4 py-2 rounded-xl border-gray-300 shadow-sm focus:ring-blue-400"
      />
    </div>

    <!-- TABLA PREMIUM -->
    <div class="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-gray-200">
      <table class="min-w-full text-left">
        <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th v-for="h in headers" :key="h" class="px-6 py-3">{{ h }}</th>
            <th class="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody class="text-gray-700">
          <tr 
            v-for="item in filteredData" 
            :key="item.id" 
            class="hover:bg-gray-50 transition"
          >
            <td v-for="h in headers" :key="h" class="px-6 py-3">{{ item[h] }}</td>
            <td class="px-6 py-3 text-center">
              <button 
                class="px-4 py-1 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-400 shadow hover:scale-105 transition mr-2"
                @click="$emit('edit', item)"
              >
                Editar
              </button>

              <button 
                class="px-4 py-1 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-400 shadow hover:scale-105 transition"
                @click="$emit('delete', item)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  headers: { type: Array, required: true },
  rows: { type: Array, required: true }
})

const search = ref("")

const filteredData = computed(() => {
  if (!search.value) return props.rows
  return props.rows.filter(row =>
    JSON.stringify(row).toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
<style scoped></style>