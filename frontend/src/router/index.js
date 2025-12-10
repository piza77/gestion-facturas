import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('../views/Employees.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/providers',
    name: 'Providers',
    component: () => import('../views/Providers.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cost-centers',
    name: 'CostCenters',
    component: () => import('../views/CostCenters.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('../views/Invoices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: { requiresAuth: true, admin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.admin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router