<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const showError = inject('showError')
const setLoading = inject('setLoading')

const bookings = ref([])

const fetchBookings = async () => {
  setLoading(true)
  try {
    bookings.value = await request('/users/me/bookings')
  } catch (e) {
    showError(e.message)
  }
  setLoading(false)
}

const cancelBooking = async (booking) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return

  setLoading(true)
  try {
    // The delete route is in fields.js: router.delete('/:id/bookings/:bookingId', ...)
    // So we need the field ID and the booking ID.
    await request(`/fields/${booking.field._id}/bookings/${booking._id}`, 'DELETE')
    // Refresh the list
    await fetchBookings()
  } catch (e) {
    showError(e.message)
  }
  setLoading(false)
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div>
    <h2 class="mb-4"><i class="bi bi-calendar-check-fill text-info"></i> My Bookings</h2>
    
    <div v-if="bookings.length === 0" class="alert alert-info">
      You have no bookings yet.
    </div>

    <div class="row g-3">
    <!-- Divisione standard in 12 colonne, 6 lo rende diviso in 2, 4 in 3 -->
      <div v-for="booking in bookings" :key="booking._id" class="col-md-6 col-lg-4">
        <div class="card h-100 custom-card">
          <div class="card-body">
            <!-- mb per lo spazio sotto il titolo -->
            <h5 class="card-title mb-3">
              <!--icona blu con margine a destra-->
              <i class="bi bi-geo-alt-fill text-primary me-2"></i>
              {{ booking.field.name }}
            </h5>
            <p class="card-text">
              <strong>Date:</strong> {{ booking.date }}<br>
              <strong>Time:</strong> {{ booking.slot }}<br>
              <strong>Address:</strong> {{ booking.field.address }}
            </p>
            <button @click="cancelBooking(booking)" class="btn btn-danger btn-sm w-100">
              <i class="bi bi-x-circle me-1"></i> Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
