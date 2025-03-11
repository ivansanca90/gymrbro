// --------- Variabili globali ---------
// UI Elements
const addButton = document.getElementById('add-button');
const addModal = document.getElementById('add-modal');
const cancelButton = document.getElementById('cancel-button');
const createButton = document.getElementById('create-button');
const workoutNameInput = document.getElementById('workout-name');
const workoutContainer = document.getElementById('workout-container');

// Modal di modifica
const editModal = document.getElementById('edit-modal');
const editCancelButton = document.getElementById('edit-cancel-button');
const saveButton = document.getElementById('save-button');
const editWorkoutNameInput = document.getElementById('edit-workout-name');
const editCardIdInput = document.getElementById('edit-card-id');

// Dialog di conferma eliminazione
const confirmDialog = document.getElementById('confirm-dialog');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmDelete = document.getElementById('confirm-delete');
const deleteCardIdInput = document.getElementById('delete-card-id');

// Overlay per chiudere i menu
const clickOverlay = document.getElementById('click-overlay');

// --------- Gestione localStorage per persistenza dati ---------
const STORAGE_KEY = 'gymbro_workouts';

function saveAllWorkouts(workouts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function getAllWorkouts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveWorkout(workout) {
    const workouts = getAllWorkouts();
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index !== -1) {
        workouts[index] = workout;
    } else {
        workouts.push(workout);
    }
    
    saveAllWorkouts(workouts);
}

function deleteWorkout(id) {
    const workouts = getAllWorkouts();
    const filtered = workouts.filter(workout => workout.id !== id);
    saveAllWorkouts(filtered);
}

// --------- Funzioni UI ---------
function createWorkoutCard(workoutData) {
    const { id, name, exercises = [] } = workoutData;
    
    const card = document.createElement('div');
    card.className = 'workout-card';
    card.id = id;
    card.setAttribute('data-name', name);
    
    card.innerHTML = `
        <div class="card-header">
            <div class="workout-label">Allenamento</div>
            <div class="kebab-menu" data-card-id="${id}">
                <div class="kebab-icon">
                    <div class="kebab-dot"></div>
                    <div class="kebab-dot"></div>
                    <div class="kebab-dot"></div>
                </div>
                <div class="action-menu" id="menu-${id}">
                    <div class="action-item edit-action" data-card-id="${id}">
                        Modifica
                    </div>
                    <div class="action-item duplicate-action" data-card-id="${id}">
                        Duplica
                    </div>
                    <div class="action-item delete-action" data-card-id="${id}">
                        Elimina
                    </div>
                </div>
            </div>
        </div>
        <div class="workout-divider"></div>
        <div class="workout-type">${name}</div>
        <div class="exercise-list" id="exercise-list-${id}">
            ${exercises.map(exercise => `
                <div class="exercise-item" data-exercise-id="${exercise.id}">
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-details">
                        <span>${exercise.sets} serie</span>
                        <span>${exercise.reps} reps</span>
                        <span>${exercise.rest} sec recupero</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="arrow-container">
            <svg class="arrow" viewBox="0 0 7.5 12.9">
                <path d="M 0 0 L 7.5 6.9 L 0 12.9" fill="none" stroke="#8fff46" stroke-width="2" stroke-miterlimit="4" stroke-linecap="butt"></path>
            </svg>
        </div>
    `;
    
    workoutContainer.appendChild(card);
    
    // Aggiungi il click handler alla card intera
    card.addEventListener('click', function(event) {
        // Verifica se il click è stato sul menu o sul suo discendente
        if (!event.target.closest('.kebab-menu') && !event.target.closest('.action-menu')) {
            const cardId = this.id;
            const cardName = this.getAttribute('data-name');
            
            // Naviga alla pagina degli esercizi con l'ID e il nome dell'allenamento
            window.location.href = `exercise.html?id=${cardId}&name=${encodeURIComponent(cardName)}`;
        }
    });

    // Aggiungi gli event listener per le azioni del menu kebab
    const kebabMenu = card.querySelector('.kebab-menu');
    kebabMenu.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const cardId = kebabMenu.getAttribute('data-card-id');
        const menu = document.getElementById('menu-' + cardId);
        
        // Chiudi tutti i menu aperti
        document.querySelectorAll('.action-menu.active').forEach(activeMenu => {
            activeMenu.classList.remove('active');
        });
        
        // Mostra il menu corrente
        menu.classList.toggle('active');
        clickOverlay.style.display = 'block';
    });

    const editAction = card.querySelector('.edit-action');
    editAction.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const cardId = editAction.getAttribute('data-card-id');
        const card = document.getElementById(cardId);
        const cardName = card.getAttribute('data-name');
        
        editWorkoutNameInput.value = cardName;
        editCardIdInput.value = cardId;
        editModal.style.display = 'flex';
        
        // Chiudi il menu e l'overlay
        document.getElementById('menu-' + cardId).classList.remove('active');
        clickOverlay.style.display = 'none';
    });

    const duplicateAction = card.querySelector('.duplicate-action');
    duplicateAction.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const cardId = duplicateAction.getAttribute('data-card-id');
        const card = document.getElementById(cardId);
        const cardName = card.getAttribute('data-name');
        const exercises = getExercisesForWorkout(cardId) || [];
        
        const newCardId = generateUniqueId();
        const newCardData = { id: newCardId, name: cardName + ' (Copia)', exercises: exercises.map(exercise => ({ ...exercise, id: generateUniqueId() })) };
        
        createWorkoutCard(newCardData);
        saveWorkout(newCardData);
        
        // Chiudi il menu e l'overlay
        document.getElementById('menu-' + cardId).classList.remove('active');
        clickOverlay.style.display = 'none';
    });

    const deleteAction = card.querySelector('.delete-action');
    deleteAction.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const cardId = deleteAction.getAttribute('data-card-id');
        deleteCardIdInput.value = cardId;
        confirmDialog.style.display = 'flex';
        
        // Chiudi il menu e l'overlay
        document.getElementById('menu-' + cardId).classList.remove('active');
        clickOverlay.style.display = 'none';
    });
}

// Funzione per ottenere gli esercizi per un allenamento
function getExercisesForWorkout(workoutId) {
    const workouts = getAllWorkouts();
    const workout = workouts.find(w => w.id === workoutId);
    return workout ? workout.exercises : [];
}

// Funzione per generare un ID unico
function generateUniqueId() {
    return 'workout-card-' + Math.random().toString(36).substr(2, 9);
}

// Funzione per aggiornare lo stato vuoto
function updateEmptyState() {
    const workouts = getAllWorkouts();
    if (workouts.length === 0) {
        workoutContainer.innerHTML = '<div class="empty-message">Nessun allenamento disponibile</div>';
    } else {
        workoutContainer.innerHTML = '';
        workouts.forEach(createWorkoutCard);
    }
}

// Funzione per caricare gli allenamenti
function loadWorkouts() {
    updateEmptyState();
}

// --------- Event Listeners Globali ---------
// Overlay per chiudere i menu
clickOverlay.addEventListener('click', function() {
    document.querySelectorAll('.action-menu.active').forEach(activeMenu => {
        activeMenu.classList.remove('active');
    });
    clickOverlay.style.display = 'none';
});

// Apri il modal quando si clicca sul pulsante +
addButton.addEventListener('click', function() {
    addModal.style.display = 'flex';
});

// Chiudi il modal quando si clicca su Annulla
cancelButton.addEventListener('click', function() {
    addModal.style.display = 'none';
});

// Crea una nuova card quando si clicca su Crea
createButton.addEventListener('click', function() {
    const workoutName = workoutNameInput.value.trim();
    if (workoutName) {
        const newCardId = generateUniqueId();
        const newCardData = { id: newCardId, name: workoutName, exercises: [] };
        
        createWorkoutCard(newCardData);
        saveWorkout(newCardData);
        
        addModal.style.display = 'none';
        workoutNameInput.value = '';
    }
});

// Chiudi il modal di modifica quando si clicca su Annulla
editCancelButton.addEventListener('click', function() {
    editModal.style.display = 'none';
});

// Salva le modifiche quando si clicca su Salva
saveButton.addEventListener('click', function() {
    const workoutName = editWorkoutNameInput.value.trim();
    const cardId = editCardIdInput.value;
    
    if (workoutName && cardId) {
        const card = document.getElementById(cardId);
        card.setAttribute('data-name', workoutName);
        card.querySelector('.workout-type').textContent = workoutName;
        
        const workoutData = { id: cardId, name: workoutName, exercises: getExercisesForWorkout(cardId) };
        saveWorkout(workoutData);
        
        editModal.style.display = 'none';
    }
});

// Gestione della conferma di eliminazione
confirmCancel.addEventListener('click', function() {
    confirmDialog.style.display = 'none';
});

confirmDelete.addEventListener('click', function() {
    const cardId = deleteCardIdInput.value;
    const card = document.getElementById(cardId);
    
    if (card) {
        card.remove();
        deleteWorkout(cardId);
        confirmDialog.style.display = 'none';
        updateEmptyState();
    }
});

// Permetti di premere Enter per creare un nuovo allenamento
workoutNameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        createButton.click();
    }
});

// Permetti di premere Enter per salvare le modifiche
editWorkoutNameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        saveButton.click();
    }
});

// Chiudi i modal se si clicca al di fuori di essi
window.addEventListener('click', function(event) {
    if (event.target === addModal) {
        addModal.style.display = 'none';
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
    if (event.target === confirmDialog) {
        confirmDialog.style.display = 'none';
    }
});

// --------- Inizializzazione dell'app ---------
// Funzione di inizializzazione
function initApp() {
    loadWorkouts();
}

// Avvia l'app quando il DOM è caricato
document.addEventListener('DOMContentLoaded', initApp);