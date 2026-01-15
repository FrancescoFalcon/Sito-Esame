# 🏆 Piattaforma Gestione Tornei Sportivi
## 🛠 Scelte Tecniche e Architetturali

Il progetto adotta un'architettura a servizi separati (Backend API e Frontend SPA), orchestrati tramite Docker.

### 1. Backend: Node.js & Express
*   **Perché Node.js:** L'architettura *event-driven* e non bloccante di Node.js lo rende ideale per gestire numerose richieste I/O concorrenti (come prenotazioni e aggiornamenti risultati in tempo reale) mantenendo basse latenze.
*   **Express:** Framework minimalista che permette di strutturare le API REST in modo pulito tramite middleware.
*   **Autenticazione Stateless (JWT):** L'uso di JSON Web Tokens permette di scalare orizzontalmente senza dover gestire sessioni lato server. Il token contiene già le informazioni necessarie (`_id`, ruoli) per autorizzare le richieste.

### 2. Database: MongoDB (NoSQL)
*   **Flessibilità dello Schema:** La natura non relazionale di MongoDB permette di evolvere i modelli dati (come `Match` o `Tournament`) senza costose migrazioni di schema SQL, adattandosi alla natura dinamica dei dati sportivi.
*   **Mongoose ODM:** Utilizzato per garantire una validazione dei dati a livello applicativo e gestire le relazioni tra documenti (es. riferimenti tra `User` e `Booking`).

### 3. Frontend: Vue.js 3 + Vite
*   **Vue 3 (Composition API):** Offre una reattività eccellente e un codice più organizzato e riutilizzabile.
*   **Vite:** Scelto come build tool per la sua velocità in fase di sviluppo , migliorando la DX.
*   **Single Page Application (SPA):** Garantisce un'esperienza utente fluida simile a un'app nativa, caricando le risorse una sola volta e navigando tramite Client-side routing.

### 4. DevOps: Docker & Docker Compose
*   **Isolamento:** Ogni servizio (Frontend, Backend) gira nel proprio container con le dipendenze esatte specificate nei `Dockerfile`.
*   **Riproducibilità:** Elimina il problema "sul mio computer funziona". L'ambiente di esecuzione è identico in sviluppo e produzione.

---

## 🚀 Guida all'Avvio

### Prerequisiti
*   **Metodo consigliato:** [Docker Desktop](https://www.docker.com/products/docker-desktop) installato.
*   **Metodo manuale:** [Node.js](https://nodejs.org/) (v18+) e [MongoDB](https://www.mongodb.com/) installati localmente.

### ⚙️ Configurazione Iniziale
Prima di avviare il progetto (con qualsiasi metodo), è necessario configurare le variabili d'ambiente.

1.  Vai nella cartella `backend`.
2.  Incolla il file .env

---

### 🐳 Metodo 1: Avvio con Docker (Consigliato)

Questo metodo avvia contemporaneamente Backend, Frontend e configura la rete automaticamente.

1.  Posizionati nella root del progetto (dove si trova `docker-compose.yml`).
2.  Esegui il comando di build e avvio:
    ```bash
    docker-compose up --build
    ```
3.  Attendi che i container siano attivi.
4.  Accedi ai servizi:
    *   **Frontend:** [http://localhost:5173](http://localhost:5173)
    *   **Backend API:** [http://localhost:3000](http://localhost:3000)

---

### 🛠 Metodo 2: Avvio Manuale (Senza Docker)

Se preferisci eseguire i servizi singolarmente sulla tua macchina "host".

#### 1. Avviare il Database
Assicurati di avere un'istanza di MongoDB attiva sulla porta `27017`.

#### 2. Avviare il Backend
Apri un terminale nella cartella `backend`:
```bash
cd backend
npm install
npm run seed # (Opzionale)
node app.js
```
Il server partirà su `http://localhost:3000`.

#### 3. Avviare il Frontend
Apri un **nuovo** terminale nella cartella `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Il sito sarà accessibile su `http://localhost:5173`.

---

## 📂 Struttura del Progetto

```
.
├── docker-compose.yml   # Orchestrazione servizi
├── backend/             # Server Node.js/Express
│   ├── models/          # Schemi Mongoose (DB)
│   ├── routes/          # Endpoint API
│   ├── middleware/      # Logica auth e controlli
│   └── Dockerfile       # Istruzioni build Backend
└── frontend/            # Client Vue.js
    ├── src/
    │   ├── views/       # Pagine principali (Router)
    │   ├── components/  # Componenti riutilizzabili
    │   └── api.js       # Configurazione Axios
    └── Dockerfile       # Istruzioni build Frontend
```
