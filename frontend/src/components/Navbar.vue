<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps(['currentUser'])
defineEmits(['logout'])
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">
        <i class="bi bi-trophy-fill me-2"></i>SportsApp
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" active-class="active">
              <i class="bi bi-grid-3x3-gap me-1"></i> Fields
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/tournaments" active-class="active">
              <i class="bi bi-diagram-3 me-1"></i> Tournaments
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/users" active-class="active">
              <i class="bi bi-people me-1"></i> Users
            </router-link>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li v-if="currentUser" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i class="bi bi-person-circle me-1"></i> {{ currentUser.username }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/my-bookings">
                  <i class="bi bi-calendar-check me-2"></i>My Bookings
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="$emit('logout')">Logout</a></li>
            </ul>
          </li>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link btn btn-outline-light ms-2" to="/signup">Signup</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
