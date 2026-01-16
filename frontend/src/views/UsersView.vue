<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const showError = inject('showError')
const setLoading = inject('setLoading')

const users = ref([])
const searchQuery = ref('')

const searchUsers = async (showLoader = true) => {
  if (showLoader) setLoading(true)
  try {
    const q = searchQuery.value ? `?q=${searchQuery.value}` : ''
    users.value = await request(`/users${q}`)
  } catch (e) {
    showError(e.message)
  }
  if (showLoader) setLoading(false)
}

onMounted(() => {
  searchUsers(true)
})
</script>

<template>
  <div>
    <h2 class="mb-4"><i class="bi bi-people-fill text-info"></i> Users</h2>
    <input v-model="searchQuery" @input="() => searchUsers(false)" type="text" class="form-control bg-dark text-light border-secondary mb-4" placeholder="Search users...">
    <div class="row g-3">
      <div v-for="user in users" :key="user._id" class="col-md-6 col-lg-4">
        <div class="card h-100 custom-card">
          <div class="card-body d-flex flex-column align-items-center text-center p-4">
            <div class="bg-secondary rounded-circle icon-circle mb-3">
              <i class="bi bi-person-fill fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="card-title mb-1">{{ user.username }}</h5>
              <div class="text-muted small mb-3">{{ user.name }} {{ user.surname }}</div>
              <span class="badge bg-info text-dark rounded-pill">{{ user.tournaments.length }} Tournaments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
