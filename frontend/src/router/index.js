import { createRouter, createWebHistory } from 'vue-router'
import FieldsView from '../views/FieldsView.vue'
import TournamentsView from '../views/TournamentsView.vue'
import UsersView from '../views/UsersView.vue'
import PlayersView from '../views/PlayersView.vue'
import TeamsView from '../views/TeamsView.vue'
import MyBookingsView from '../views/MyBookingsView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'fields',
      component: FieldsView
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      component: TournamentsView
    },
    {
      path: '/teams',
      name: 'teams',
      component: TeamsView
    },
    {
      path: '/players',
      name: 'players',
      component: PlayersView
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/my-bookings',
      name: 'my-bookings',
      component: MyBookingsView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    }
  ]
})

export default router
