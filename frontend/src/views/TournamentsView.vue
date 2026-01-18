<script setup>
import { ref, onMounted, inject } from 'vue'
import { request } from '../api'

const props = defineProps(['currentUser'])
const showError = inject('showError')
const setLoading = inject('setLoading')

const tournaments = ref([])
const searchQuery = ref('')
const selectedTournament = ref(null)
const standings = ref([])
const isCreating = ref(false)
const isEditing = ref(false)
const tournamentForm = ref({ name: '', sport: 'football', maxTeams: 4, startDate: '' })
const editForm = ref({ name: '', maxTeams: 0, startDate: '' })
const newTeamName = ref('')
const expandedTeam = ref(null)
const editingMatchId = ref(null)
const matchResultForm = ref({ team1Score: 0, team2Score: 0 })
const newPlayer = ref({ name: '', surname: '', number: '' })

const searchTournaments = async (showLoader = true) => {
  if (showLoader) setLoading(true)
  try {
    const q = searchQuery.value ? `?q=${searchQuery.value}` : ''
    tournaments.value = await request(`/tournaments${q}`)
  } catch (e) {
    showError(e.message)
  }
  if (showLoader) setLoading(false)
}

const createTournament = async () => {
  try {
    await request('/tournaments', 'POST', tournamentForm.value)
    isCreating.value = false
    searchTournaments()
  } catch (e) {
    showError(e.message)
  }
}

const selectTournament = async (t) => {
  setLoading(true)
  try {
    selectedTournament.value = await request(`/tournaments/${t._id}`)
    standings.value = await request(`/tournaments/${t._id}/standings`)
    isEditing.value = false
  } catch (e) {
    showError(e.message)
  }
  setLoading(false)
}

const openEditMode = () => {
  if (!selectedTournament.value) return
  editForm.value = {
    name: selectedTournament.value.name,
    maxTeams: selectedTournament.value.maxTeams,
    startDate: selectedTournament.value.startDate
  }
  isEditing.value = true
}

const updateTournament = async () => {
  try {
    const updated = await request(`/tournaments/${selectedTournament.value._id}`, 'PUT', editForm.value)
    selectedTournament.value = { ...selectedTournament.value, ...updated }
    isEditing.value = false
  } catch (e) {
    showError(e.message)
  }
}

const isCreator = (t) => {
  return props.currentUser && t.creator && (t.creator._id === props.currentUser._id || t.creator === props.currentUser._id)
}

const deleteTournament = async (id) => {
  if (!confirm('Delete tournament?')) return
  try {
    await request(`/tournaments/${id}`, 'DELETE')
    selectedTournament.value = null
    searchTournaments()
  } catch (e) {
    alert(e.message)
  }
}

const addTeam = async () => {
  try {
    const teams = [...selectedTournament.value.teams, { name: newTeamName.value, players: [] }]
    await request(`/tournaments/${selectedTournament.value._id}`, 'PUT', { teams })
    newTeamName.value = ''
    selectTournament(selectedTournament.value) // Reload
  } catch (e) {
    alert(e.message)
  }
}

const toggleTeam = (index) => {
  if (expandedTeam.value === index) {
    expandedTeam.value = null
  } else {
    expandedTeam.value = index
    newPlayer.value = { name: '', surname: '', number: '' }
  }
}

const addPlayer = async (teamIndex) => {
  if (!newPlayer.value.name || !newPlayer.value.surname) return alert('Name and Surname required')
  
  // Deep clone to avoid reactivity issues and modify safely
  const teams = JSON.parse(JSON.stringify(selectedTournament.value.teams))
  
  if (!teams[teamIndex].players) teams[teamIndex].players = []
  
  const playerToAdd = {
    name: newPlayer.value.name,
    surname: newPlayer.value.surname,
    number: newPlayer.value.number ? parseInt(newPlayer.value.number) : undefined
  }
  
  teams[teamIndex].players.push(playerToAdd)
  
  try {
    await request(`/tournaments/${selectedTournament.value._id}`, 'PUT', { teams })
    newPlayer.value = { name: '', surname: '', number: '' } // Reset form
    selectTournament(selectedTournament.value) // Reload
  } catch (e) {
    showError(e.message)
  }
}

const generateMatches = async (id) => {
  try {
    await request(`/tournaments/${id}/matches/generate`, 'POST')
    selectTournament(selectedTournament.value) // Reload
  } catch (e) {
    alert(e.message)
  }
}

const startEditMatch = (match) => {
  editingMatchId.value = match._id
  matchResultForm.value = { 
    team1Score: match.result && match.result.team1Score != null ? match.result.team1Score : 0, 
    team2Score: match.result && match.result.team2Score != null ? match.result.team2Score : 0 
  }
}

const cancelMatchEdit = () => {
    editingMatchId.value = null
    matchResultForm.value = { team1Score: 0, team2Score: 0 }
}

const saveMatchResult = async (matchId) => {
  const { team1Score, team2Score } = matchResultForm.value
  
  if (team1Score === '' || team2Score === '' || isNaN(team1Score) || isNaN(team2Score) || team1Score < 0 || team2Score < 0) {
    return alert('Please enter valid non-negative numbers for scores.')
  }

  try {
    await request(`/matches/${matchId}/result`, 'PUT', {
      team1Score: parseInt(team1Score),
      team2Score: parseInt(team2Score)
    })
    editingMatchId.value = null
    selectTournament(selectedTournament.value) // Reload
  } catch (e) {
    alert(e.message)
  }
}

onMounted(() => {
  searchTournaments()
})
</script>

<template>
  <div>
    <div v-if="isCreating" class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow border-0">
          <div class="card-body p-5">
            <h3 class="mb-4">Create New Tournament</h3>
            <form @submit.prevent="createTournament">
              <div class="mb-3">
                <label class="form-label">Tournament Name</label>
                <input v-model="tournamentForm.name" type="text" class="form-control" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sport</label>
                  <select v-model="tournamentForm.sport" class="form-select">
                    <option value="football">Football</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Max Teams</label>
                  <input v-model="tournamentForm.maxTeams" type="number" class="form-control" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Start Date</label>
                <input v-model="tournamentForm.startDate" type="date" class="form-control" required>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-secondary" @click="isCreating = false">Cancel</button>
                <button class="btn btn-primary">Create Tournament</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTournament">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <button class="btn btn-outline-secondary btn-sm mb-2" @click="selectedTournament = null">Back</button>
          <h2 class="mb-0">{{ selectedTournament.name }}</h2>
          <div class="mt-2">
            <span class="badge bg-primary me-2">{{ selectedTournament.sport }}</span>
            <span class="badge" :class="{'bg-success': selectedTournament.status === 'active', 'bg-secondary': selectedTournament.status === 'open', 'bg-danger': selectedTournament.status === 'completed'}">{{ selectedTournament.status }}</span>
          </div>
        </div>
        <div v-if="isCreator(selectedTournament)">
          <button v-if="selectedTournament.status === 'open'" class="btn btn-warning me-2" @click="openEditMode"><i class="bi bi-pencil-fill"></i></button>
          <button v-if="selectedTournament.status === 'open'" class="btn btn-info me-2" @click="generateMatches(selectedTournament._id)">Generate Schedule</button>
          <button class="btn btn-danger" @click="deleteTournament(selectedTournament._id)"><i class="bi bi-trash"></i></button>
        </div>
      </div>

      <div v-if="isEditing" class="card shadow border-0 mb-4">
        <div class="card-body">
            <h3>Edit Tournament</h3>
            <form @submit.prevent="updateTournament">
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input v-model="editForm.name" class="form-control" required />
                </div>
                 <div class="mb-3">
                    <label class="form-label">Max Teams</label>
                    <input v-model="editForm.maxTeams" type="number" class="form-control" required />
                </div>
                 <div class="mb-3">
                    <label class="form-label">Start Date</label>
                    <input v-model="editForm.startDate" type="date" class="form-control" required />
                </div>
                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" @click="isEditing = false">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
      </div>

      <div v-else class="row g-4">
        <div class="col-md-4">
          <div class="card shadow-sm border-0 mb-3">
            <div class="card-header bg-dark text-white">Teams ({{ selectedTournament.teams.length }}/{{ selectedTournament.maxTeams }})</div>
            <ul class="list-group list-group-flush">
              <li v-for="(team, index) in selectedTournament.teams" :key="team._id || index" class="list-group-item bg-transparent text-light">
                <div class="d-flex justify-content-between align-items-center" style="cursor: pointer" @click="toggleTeam(index)">
                  <span class="fw-bold">{{ team.name }}</span>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-secondary rounded-pill">{{ team.players ? team.players.length : 0 }} <i class="bi bi-people-fill"></i></span>
                    <i class="bi" :class="expandedTeam === index ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </div>
                </div>

                <!-- Players List (Accordion) -->
                <div v-if="expandedTeam === index" class="mt-3 ps-3 border-start border-secondary">
                  <div v-if="team.players && team.players.length > 0">
                    <div v-for="(player, pIndex) in team.players" :key="pIndex" class="mb-1 small text-muted d-flex align-items-center gap-2">
                      <i class="bi bi-person"></i> 
                      <span>{{ player.name }} {{ player.surname }}</span>
                      <span v-if="player.number" class="badge bg-dark border border-secondary">#{{ player.number }}</span>
                    </div>
                  </div>
                  <div v-else class="text-muted small fst-italic mb-2">No players yet.</div>

                  <!-- Add Player Form -->
                  <div v-if="isCreator(selectedTournament) && selectedTournament.status === 'open'" class="mt-3 pt-2 border-top border-secondary">
                    <h6 class="small text-info mb-2">Add Player</h6>
                    <div class="row g-2">
                      <div class="col-4">
                        <input v-model="newPlayer.name" type="text" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Name">
                      </div>
                      <div class="col-4">
                        <input v-model="newPlayer.surname" type="text" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Surname">
                      </div>
                      <div class="col-2">
                        <input v-model="newPlayer.number" type="number" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="#">
                      </div>
                      <div class="col-2">
                        <button class="btn btn-sm btn-success w-100" @click="addPlayer(index)"><i class="bi bi-plus"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li v-if="isCreator(selectedTournament) && selectedTournament.status === 'open' && selectedTournament.teams.length < selectedTournament.maxTeams" class="list-group-item bg-transparent">
                <form @submit.prevent="addTeam" class="d-flex">
                  <input v-model="newTeamName" type="text" class="form-control form-control-sm me-2 bg-dark text-light border-secondary" placeholder="New Team Name" required>
                  <button class="btn btn-sm btn-primary"><i class="bi bi-plus"></i> Add Team</button>
                </form>
              </li>
              <li v-else-if="isCreator(selectedTournament) && selectedTournament.status === 'open'" class="list-group-item bg-transparent text-center text-muted fst-italic">
                Max teams reached
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-dark text-white">Standings</div>
            <div class="table-responsive">
              <table class="table table-dark table-hover mb-0">
                <thead><tr><th>#</th><th>Team</th><th>P</th><th>Pl</th><th>Diff</th></tr></thead>
                <tbody>
                  <tr v-for="(s, index) in standings" :key="s.team">
                    <td>{{ index + 1 }}</td>
                    <td class="fw-bold">{{ s.team }}</td>
                    <td>{{ s.points }}</td>
                    <td>{{ s.played }}</td>
                    <td>{{ s.diff }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card shadow-sm border-0">
            <div class="card-header bg-dark text-white">Matches</div>
            <div class="list-group list-group-flush">
              <div v-for="match in selectedTournament.matches" :key="match._id" class="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center">
                <div v-if="editingMatchId === match._id" class="d-flex align-items-center gap-2 w-100">
                    <span class="fw-bold">{{ match.team1 }}</span>
                    <input v-model.number="matchResultForm.team1Score" type="number" min="0" class="form-control form-control-sm" style="width: 60px">
                    <span>-</span>
                    <input v-model.number="matchResultForm.team2Score" type="number" min="0" class="form-control form-control-sm" style="width: 60px">
                    <span class="fw-bold">{{ match.team2 }}</span>
                    <div class="ms-auto">
                        <button class="btn btn-sm btn-success me-1" @click="saveMatchResult(match._id)"><i class="bi bi-check"></i></button>
                        <button class="btn btn-sm btn-secondary" @click="cancelMatchEdit"><i class="bi bi-x"></i></button>
                    </div>
                </div>
                <div v-else class="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <span class="fw-bold">{{ match.team1 }}</span> vs <span class="fw-bold">{{ match.team2 }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span v-if="match.status === 'played'" class="badge bg-warning text-dark fs-6">{{ match.result.team1Score }} - {{ match.result.team2Score }}</span>
                      <span v-else class="badge bg-secondary">{{ match.date ? String(match.date).substring(0, 10) : 'Scheduled' }}</span>
                      
                      <button v-if="isCreator(selectedTournament)" class="btn btn-sm btn-warning" @click="startEditMatch(match)">
                        <i class="bi bi-pencil-fill text-dark"></i>
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <h2 class="mb-4"><i class="bi bi-trophy text-warning"></i> Tournaments</h2>
      <div class="d-flex gap-3 mb-4">
          <input v-model="searchQuery" @input="() => searchTournaments(false)" type="text" class="form-control bg-dark text-light border-secondary" placeholder="Search tournaments...">
          <button v-if="currentUser" class="btn btn-success text-nowrap" @click="isCreating = true">
            <i class="bi bi-plus-lg"></i> Create
          </button>
      </div>

      <div class="list-group shadow-sm">
        <a v-for="t in tournaments" :key="t._id" href="#" class="list-group-item list-group-item-action bg-dark text-light border-secondary p-3" @click.prevent="selectTournament(t)">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1 fw-bold">{{ t.name }}</h5>
            <small :class="{'text-success': t.status === 'active', 'text-muted': t.status !== 'active'}">{{ t.status }}</small>
          </div>
          <p class="mb-1 text-muted">{{ t.sport }} <i class="bi bi-dot"></i> Created by {{ t.creator.username }}</p>
        </a>
      </div>
    </div>
  </div>
</template>
