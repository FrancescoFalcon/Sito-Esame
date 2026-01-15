<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '../api'

const router = useRouter()
const showError = inject('showError')

const form = ref({ username: '', password: '', name: '', surname: '' })

const signup = async () => {
  try {
    await request('/auth/signup', 'POST', form.value)
    alert('Registered! Please login.')
    router.push('/login')
    form.value = { username: '', password: '', name: '', surname: '' }
  } catch (e) {
    showError(e.message)
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow-lg border-0 rounded-3 mt-5">
        <div class="card-body p-5">
          <h2 class="text-center mb-4">Create Account</h2>
          <form @submit.prevent="signup">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input v-model="form.name" type="text" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Surname</label>
                <input v-model="form.surname" type="text" class="form-control" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input v-model="form.username" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" required>
            </div>
            <button class="btn btn-primary w-100 btn-lg mt-3">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
