<script setup>
import { ref, inject } from 'vue'
import { request } from '../api'

const emit = defineEmits(['login-success'])
const showError = inject('showError')

const username = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await request('/auth/signin', 'POST', { username: username.value, password: password.value })
    localStorage.setItem('token', res.token)
    emit('login-success', res.user)
    username.value = ''
    password.value = ''
  } catch (e) {
    showError(e.message)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-lg border-0 rounded-3 mt-5">
        <div class="card-body p-5">
          <h2 class="text-center mb-4">Welcome Back</h2>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input v-model="username" type="text" class="form-control form-control-lg" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="password" type="password" class="form-control form-control-lg" required>
            </div>
            <button class="btn btn-primary w-100 btn-lg mt-3">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
