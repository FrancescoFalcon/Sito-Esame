<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const props = defineProps(['currentUser'])
const showError = inject('showError')
const setLoading = inject('setLoading')

const fields = ref([])
const searchQuery = ref('')
const selectedField = ref(null)
const bookingDate = ref('')
const availableSlots = ref([])

const searchFields = async (showLoader = true) => {
  if (showLoader) setLoading(true)
  try {
    const q = searchQuery.value ? `?q=${searchQuery.value}` : ''
    fields.value = await request(`/fields${q}`)
  } catch (e) {
    showError(e.message)
  }
  if (showLoader) setLoading(false)
}

const selectField = (field) => {
  selectedField.value = field
  bookingDate.value = ''
  availableSlots.value = []
}

const loadSlots = async () => {
  if (!bookingDate.value) return
  try {
    availableSlots.value = await request(`/fields/${selectedField.value._id}/slots?date=${bookingDate.value}`)
  } catch (e) {
    showError(e.message)
  }
}

const bookSlot = async (slot) => {
  if (!props.currentUser) return alert('Please login to book')
  if (!confirm(`Book ${slot} on ${bookingDate.value}?`)) return
  try {
    await request(`/fields/${selectedField.value._id}/bookings`, 'POST', { date: bookingDate.value, slot })
    alert('Booked!')
    loadSlots()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(() => {
  searchFields()
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-geo-alt-fill text-primary"></i> Sports Fields</h2>
      <div class="input-group" style="width: auto; min-width: 120px;">
        <span class="input-group-text bg-dark border-secondary"><i class="bi bi-search"></i></span>
        <input v-model="searchQuery" @input="() => searchFields(false)" type="text" class="form-control bg-dark text-light border-secondary" placeholder="Src">
      </div>
    </div>
    
    <div v-if="selectedField" class="card shadow border-0">
      <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between">
        <h3>{{ selectedField.name }}</h3>
        <button class="btn btn-outline-secondary" @click="selectedField = null">Back</button>
      </div>
      <div class="card-body px-4 pb-4">
        <p class="lead text-muted">{{ selectedField.sport }} <i class="bi bi-dot"></i> {{ selectedField.address }}</p>
        <hr>
        <h4>Book a Slot</h4>
        <div class="row mt-3">
          <div class="col-md-4">
            <label class="form-label">Select Date</label>
            <input type="date" v-model="bookingDate" class="form-control" @change="loadSlots">
          </div>
          <div class="col-md-8">
            <label class="form-label">Available Slots</label>
            <div v-if="bookingDate" class="d-flex flex-wrap gap-2">
              <button v-for="slot in availableSlots" :key="slot" class="btn btn-outline-success" @click="bookSlot(slot)">
                {{ slot }}
              </button>
              <span v-if="availableSlots.length === 0" class="text-muted fst-italic mt-2">No slots available for this date.</span>
            </div>
            <div v-else class="text-muted mt-2">Please select a date first.</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="row g-4">
      <div v-for="field in fields" :key="field._id" class="col-md-4">
        <div class="card h-100 custom-card" @click="selectField(field)">
          <div class="card-body text-center p-4">
            <div class="display-4 mb-3 text-primary">
              <i v-if="field.sport === 'football'" class="bi bi-circle"></i>
              <i v-else-if="field.sport === 'basketball'" class="bi bi-basket"></i>
              <i v-else-if="field.sport === 'volleyball'" class="bi bi-circle-half"></i>
              <i v-else class="bi bi-geo-alt"></i>
            </div>
            <h5 class="card-title fw-bold">{{ field.name }}</h5>
            <p class="card-text text-muted">{{ field.address }}</p>
            <span class="badge bg-dark text-uppercase">{{ field.sport }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
