<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { request } from './api'

const router = useRouter()
const currentUser = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchWhoAmI = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      currentUser.value = await request('/whoami')
    } catch {
      logout()
    }
  }
}

const logout = () => {
  localStorage.removeItem('token')
  currentUser.value = null
  router.push('/login')
}

const handleLoginSuccess = (user) => {
  currentUser.value = user
  router.push('/')
}

// Provide global state/methods to children if needed, 
// but props/events are often enough or using a store like Pinia.
// For simplicity, we pass props to Navbar and handle events.

onMounted(() => {
  fetchWhoAmI()
})

// Global error handler provided to components
const showError = (msg) => {
  error.value = msg
}
provide('showError', showError)
provide('setLoading', (val) => loading.value = val)
provide('currentUser', currentUser)
provide('loginSuccess', handleLoginSuccess)

</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar :currentUser="currentUser" @logout="logout" />

    <div class="container mt-4 flex-grow-1">
      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
        <button type="button" class="btn-close" @click="error = null"></button>
      </div>

      <router-view 
        v-show="!loading"
        :currentUser="currentUser"
        @login-success="handleLoginSuccess"
      ></router-view>
    </div>

    <footer class="bg-dark text-center py-3 mt-auto border-top border-secondary">
      <small class="text-muted">&copy; 2026 SportsApp - Exam Project</small>
    </footer>
  </div>
</template>
