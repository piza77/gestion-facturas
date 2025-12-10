<template>
  <svg 
    :class="computedClasses"
    :width="size" 
    :height="size" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    v-bind="$attrs"
  >
    <slot />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [String, Number],
    default: '64' // tamaño por defecto (px)
  },
  color: {
    type: String,
    default: 'text-blue-600' // color por defecto (Tailwind)
  },
  extraClasses: {
    type: String,
    default: ''
  }
})

const computedClasses = computed(() => `${props.color} ${props.extraClasses}`)
</script>
<style scoped></style>