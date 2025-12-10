<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <Navbar v-if="authStore.isAuthenticated" />
    <main :class="authStore.isAuthenticated ? 'ml-72 p-8' : ''">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.getCurrentUser()
  }
})
</script>