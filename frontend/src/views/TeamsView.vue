<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const showError = inject('showError')
const setLoading = inject('setLoading')

const teams = ref([])
const searchQuery = ref('')

const searchTeams = async (showLoader = true) => {
  if (showLoader) setLoading(true)
  try {
    // We get all tournaments first because backend search is restricted to tournament names only
    // and we need to search specifically for Teams here.
    const tournaments = await request(`/tournaments`)
    
    // Extract teams from tournaments
    // We also want to filter teams if search query is present
    const allTeams = []
    
    tournaments.forEach(tournament => {
      if (tournament.teams && tournament.teams.length > 0) {
        tournament.teams.forEach(team => {
            let matches = true
            if (searchQuery.value) {
                const queryLower = searchQuery.value.toLowerCase()
                // Requirement: Teams must be found ONLY by team name
                if (!team.name.toLowerCase().includes(queryLower)) {
                    matches = false
                }
            }

            if (matches) {
                // Deduplicate by team name
                const existing = allTeams.find(t => t.name === team.name)
                const participation = `${tournament.name} (${tournament.sport})`
                
                if (existing) {
                    // Add participation if not already present
                    if (!existing.participations.includes(participation)) {
                        existing.participations.push(participation)
                    }
                } else {
                    allTeams.push({
                        ...team,
                        _id: team._id || Math.random(), // Ensure ID
                        participations: [participation]
                    })
                }
            }
        })
      }
    })
    
    teams.value = allTeams

  } catch (e) {
    showError(e.message)
  }
  if (showLoader) setLoading(false)
}

onMounted(() => {
  searchTeams(true)
})
</script>

<template>
  <div>
    <h2 class="mb-4"><i class="bi bi-people-fill text-warning"></i> Teams</h2>
    <input v-model="searchQuery" @input="() => searchTeams(false)" type="text" class="form-control bg-dark text-light border-secondary mb-4" placeholder="Search teams...">
    <div class="row g-3">
      <div v-for="team in teams" :key="team._id" class="col-md-6 col-lg-4">
        <div class="card h-100 custom-card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
                <div class="bg-secondary rounded-circle icon-circle me-3">
                    <i class="bi bi-shield-shaded fs-4 text-white"></i>
                </div>
                <div>
                    <h5 class="card-title mb-0">{{ team.name }}</h5>
                    <div class="text-muted small mt-1">
                      <div v-for="p in team.participations" :key="p">{{ p }}</div>
                    </div>
                </div>
            </div>
            
            <h6 class="border-bottom pb-2 mb-2 text-white-50">Players ({{ team.players.length }})</h6>
            <ul class="list-unstyled small mb-0">
                <li v-for="player in team.players" :key="player._id" class="text-light">
                    <i class="bi bi-person me-2"></i> {{ player.name }} {{ player.surname }} <span v-if="player.number" class="text-muted">#{{ player.number }}</span>
                </li>
            </ul>
             <div v-if="team.players.length === 0" class="text-muted fst-italic">
                No players registered
            </div>
          </div>
        </div>
      </div>
       <div v-if="teams.length === 0 && !searchQuery" class="col-12 text-muted">
        No teams found.
      </div>
       <div v-if="teams.length === 0 && searchQuery" class="col-12 text-muted">
        No teams matching "{{ searchQuery }}" found.
      </div>
    </div>
  </div>
</template>
