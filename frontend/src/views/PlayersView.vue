<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const showError = inject('showError')
const setLoading = inject('setLoading')

const players = ref([])
const searchQuery = ref('')

const searchPlayers = async (showLoader = true) => {
  if (showLoader) setLoading(true)
  try {
    // Fetch all tournaments to find players within teams
    // Backend search is now restricted to tournament name, so we must fetch all and filter locally for players
    const tournaments = await request(`/tournaments`)
    
    const allPlayers = []
    
    tournaments.forEach(tournament => {
      if (tournament.teams) {
        tournament.teams.forEach(team => {
          if (team.players) {
            team.players.forEach(player => {
              // Client-side filtering
              let matches = true
              if (searchQuery.value) {
                const queryLower = searchQuery.value.toLowerCase()
                
                // Requirement: Players must be found ONLY by name and surname
                const fullName = `${player.name} ${player.surname}`.toLowerCase()
                const playerMatches = fullName.includes(queryLower)
                
                if (!playerMatches) {
                    matches = false
                }
              }

              if (matches) {
                allPlayers.push({
                  ...player,
                  teamName: team.name,
                  tournamentName: tournament.name,
                  sport: tournament.sport,
                  // Unique key combination since player IDs might not be globally unique or missing in some schemas/seeds
                  uniqueKey: `${tournament._id}-${team._id}-${player._id}`
                })
              }
            })
          }
        })
      }
    })
    
    players.value = allPlayers

  } catch (e) {
    showError(e.message)
  }
  if (showLoader) setLoading(false)
}

onMounted(() => {
  searchPlayers(true)
})
</script>

<template>
  <div>
    <h2 class="mb-4"><i class="bi bi-person-lines-fill text-success"></i> Players</h2>
    <input v-model="searchQuery" @input="() => searchPlayers(false)" type="text" class="form-control bg-dark text-light border-secondary mb-4" placeholder="Search players...">
    <div class="row g-3">
      <div v-for="player in players" :key="player.uniqueKey" class="col-md-6 col-lg-4">
        <div class="card h-100 custom-card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
                <div class="bg-secondary rounded-circle icon-circle me-3">
                    <i class="bi bi-person-fill fs-4 text-white"></i>
                </div>
                <div>
                    <h5 class="card-title mb-0">{{ player.name }} {{ player.surname }}</h5>
                    <div class="text-info small" v-if="player.number">#{{ player.number }}</div>
                </div>
            </div>
            
            <div class="border-top pt-2 mt-2">
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-white-50 small">Team:</span>
                    <span class="text-light small">{{ player.teamName }}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span class="text-white-50 small">Tournament:</span>
                    <span class="text-light small">{{ player.tournamentName }} ({{ player.sport }})</span>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="players.length === 0 && !searchQuery" class="col-12 text-muted">
        No players found in tournaments.
      </div>
       <div v-if="players.length === 0 && searchQuery" class="col-12 text-muted">
        No players matching "{{ searchQuery }}" found.
      </div>
    </div>
  </div>
</template>
