// --------- Variabili globali ---------
// UI Elements
const backButton = document.getElementById('back-button');
const historyList = document.getElementById('history-list');
const workoutFilter = document.getElementById('workout-filter');

// Modal di dettaglio
const sessionDetailModal = document.getElementById('session-detail-modal');
const sessionDate = document.getElementById('session-date');
const sessionDetails = document.getElementById('session-details');
const closeDetailButton = document.getElementById('close-detail-button');

// Variabili per lo stato
let workouts = [];
let allHistory = [];
let filteredHistory = [];

// --------- Funzioni per lavorare con i dati ---------
// Carica tutti i workout
function loadAllWorkouts() {
    const workoutsData = localStorage.getItem('gymbro_workouts');
    workouts = workoutsData ? JSON.parse(workoutsData) : [];
    
    // Aggiungi le opzioni al filtro
    workouts.forEach(workout => {
        const option = document.createElement('option');
        option.value = workout.id;
        option.textContent = workout.name;
        workoutFilter.appendChild(option);
    });
}

// Event Listeners
backButton.addEventListener('click', function() {
    window.location.href = 'index.html';
});

closeDetailButton.addEventListener('click', function() {
    sessionDetailModal.style.display = 'none';
});

workoutFilter.addEventListener('change', function() {
    const selectedWorkoutId = this.value;
    filterHistory(selectedWorkoutId);
});

// Chiudi il modal se si clicca al di fuori di esso
window.addEventListener('click', function(event) {
    if (event.target === sessionDetailModal) {
        sessionDetailModal.style.display = 'none';
    }
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    loadAllWorkouts();
    loadAllHistory();
});

// Carica tutto lo storico per tutti gli allenamenti
function loadAllHistory() {
    allHistory = [];
    
    // Per ogni workout, carica il suo storico
    workouts.forEach(workout => {
        const historyKey = `gymbro_history_${workout.id}`;
        const workoutHistory = localStorage.getItem(historyKey);
        
        if (workoutHistory) {
            const parsedHistory = JSON.parse(workoutHistory);
            // Aggiungi l'ID e il nome del workout a ogni sessione
            parsedHistory.forEach(session => {
                session.workoutId = workout.id;
                session.workoutName = workout.name;
            });
            allHistory = [...allHistory, ...parsedHistory];
        }
    });
    
    // Ordina lo storico per data (più recente prima)
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Inizialmente, mostra tutto lo storico
    filteredHistory = [...allHistory];
    
    // Renderizza lo storico
    renderHistory();
}

// Filtra lo storico in base all'allenamento selezionato
function filterHistory(workoutId) {
    if (workoutId) {
        filteredHistory = allHistory.filter(session => session.workoutId === workoutId);
    } else {
        filteredHistory = [...allHistory];
    }
    
    renderHistory();
}

// Formatta una data in formato leggibile
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('it-IT', options);
}

// Renderizza lo storico filtrato
function renderHistory() {
    historyList.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Nessuna sessione di allenamento trovata.';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    // Raggruppa le sessioni per data (solo il giorno, non l'ora)
    const groupedByDate = {};
    
    filteredHistory.forEach(session => {
        const date = new Date(session.date);
        const dateKey = date.toISOString().split('T')[0]; // Solo YYYY-MM-DD
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        
        groupedByDate[dateKey].push(session);
    });
    
    // Crea una sezione per ogni data
    Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)).forEach(dateKey => {
        const dateSection = document.createElement('div');
        dateSection.className = 'history-date-section';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'history-date-header';
        
        // Formatta la data
        const dateParts = dateKey.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        dateHeader.textContent = formattedDate;
        dateSection.appendChild(dateHeader);
        
        // Aggiungi le sessioni di quel giorno
        groupedByDate[dateKey].forEach(session => {
            const sessionItem = createSessionItem(session);
            dateSection.appendChild(sessionItem);
        });
        
        historyList.appendChild(dateSection);
    });
}

// Crea un elemento per una sessione di allenamento
function createSessionItem(session) {
    const sessionItem = document.createElement('div');
    sessionItem.className = 'history-session-item';
    sessionItem.setAttribute('data-session-index', filteredHistory.indexOf(session));
    
    // Estrai l'ora dalla data
    const date = new Date(session.date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    // Calcola il numero di esercizi
    const exerciseCount = session.exercises ? session.exercises.length : 0;
    
    sessionItem.innerHTML = `
        <div class="session-time">${timeStr}</div>
        <div class="session-workout">${session.workoutName}</div>
        <div class="session-count">${exerciseCount} esercizi</div>
        <div class="session-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8fff46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </div>
    `;
    
    // Aggiungi il click handler per vedere i dettagli
    sessionItem.addEventListener('click', function() {
        showSessionDetails(session);
    });
    
    return sessionItem;
}

// Mostra i dettagli di una sessione
function showSessionDetails(session) {
    // Formatta la data
    sessionDate.textContent = formatDate(session.date);
    
    // Pulisci i dettagli precedenti
    sessionDetails.innerHTML = '';
    
    // Verifica se ci sono esercizi
    if (!session.exercises || session.exercises.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Nessun dettaglio disponibile per questa sessione.';
        sessionDetails.appendChild(emptyMessage);
    } else {
        // Crea una lista di esercizi
        session.exercises.forEach(exercise => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'detail-exercise-item';
            
            // Header con nome esercizio
            const exerciseHeader = document.createElement('div');
            exerciseHeader.className = 'detail-exercise-header';
            exerciseHeader.textContent = exercise.name;
            exerciseItem.appendChild(exerciseHeader);
            
            // Riepilogo serie/reps/recupero
            const exerciseSummary = document.createElement('div');
            exerciseSummary.className = 'detail-exercise-summary';
            exerciseSummary.innerHTML = `
                <div class="detail-info-item">
                    <span class="detail-info-label">Serie:</span>
                    <span class="detail-info-value">${exercise.sets}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-info-label">Reps:</span>
                    <span class="detail-info-value">${exercise.reps}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-info-label">Recupero:</span>
                    <span class="detail-info-value">${exercise.rest}s</span>
                </div>
            `;
            exerciseItem.appendChild(exerciseSummary);
            
            // Dettaglio delle serie
            if (exercise.setValues && exercise.setValues.length > 0) {
                const setsContainer = document.createElement('div');
                setsContainer.className = 'detail-sets-container';
                
                // Header
                const setsHeader = document.createElement('div');
                setsHeader.className = 'detail-sets-header';
                setsHeader.innerHTML = `
                    <div class="detail-set-number">Serie</div>
                    <div class="detail-set-weight">Peso</div>
                    <div class="detail-set-reps">Reps</div>
                `;
                setsContainer.appendChild(setsHeader);
                
                // Righe delle serie
                exercise.setValues.forEach((setValue, index) => {
                    if (setValue.weight || setValue.reps) {
                        const setRow = document.createElement('div');
                        setRow.className = 'detail-set-row';
                        setRow.innerHTML = `
                            <div class="detail-set-number">${index + 1}</div>
                            <div class="detail-set-weight">${setValue.weight || '-'}</div>
                            <div class="detail-set-reps">${setValue.reps || '-'}</div>
                        `;
                        setsContainer.appendChild(setRow);
                    }
                });
                
                exerciseItem.appendChild(setsContainer);
            }
            
            // Note
            if (exercise.notes && exercise.notes.trim() !== '') {
                const notesContainer = document.createElement('div');
                notesContainer.className = 'detail-notes';
                
                const notesHeader = document.createElement('div');
                notesHeader.className = 'detail-notes-header';
                notesHeader.textContent = 'Note:';
                notesContainer.appendChild(notesHeader);
                
                const notesContent = document.createElement('div');
                notesContent.className = 'detail-notes-content';
                notesContent.textContent = exercise.notes;
                notesContainer.appendChild(notesContent);
                
                exerciseItem.appendChild(notesContainer);
            }
            
            sessionDetails.appendChild(exerciseItem);
        });
    }
    
    // Mostra il modal
    sessionDetailModal.style.display = 'flex';
}