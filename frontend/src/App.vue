<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    <Navbar v-if="authStore.isAuthenticated" />
    <main :class="authStore.isAuthenticated ? 'ml-72 p-8' : ''">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Navbar from './components/Navbar.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
  if (authStore.isAuthenticated) {
    authStore.getCurrentUser()
  }
})
</script>