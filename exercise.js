// --------- Variabili globali ---------
// UI Elements
const backButton = document.getElementById('back-button');
const workoutTitle = document.getElementById('workout-title');
const addExerciseButton = document.getElementById('add-exercise-button');
const exerciseContainer = document.getElementById('exercise-container');
const completeWorkoutButton = document.getElementById('complete-workout-button');

// Modal di aggiunta esercizio
const addExerciseModal = document.getElementById('add-exercise-modal');
const exerciseCancelButton = document.getElementById('exercise-cancel-button');
const exerciseCreateButton = document.getElementById('exercise-create-button');
const exerciseNameInput = document.getElementById('exercise-name');
const exerciseSetsInput = document.getElementById('exercise-sets');
const exerciseRepsInput = document.getElementById('exercise-reps');
const exerciseRestInput = document.getElementById('exercise-rest');

// Pulsanti incremento/decremento
const decreaseSets = document.getElementById('decrease-sets');
const increaseSets = document.getElementById('increase-sets');
const decreaseReps = document.getElementById('decrease-reps');
const increaseReps = document.getElementById('increase-reps');
const decreaseRest = document.getElementById('decrease-rest');
const increaseRest = document.getElementById('increase-rest');

// Modal di modifica esercizio
const editExerciseModal = document.getElementById('edit-exercise-modal');
const editExerciseCancelButton = document.getElementById('edit-exercise-cancel-button');
const editExerciseSaveButton = document.getElementById('edit-exercise-save-button');
const editExerciseNameInput = document.getElementById('edit-exercise-name');
const editExerciseIdInput = document.getElementById('edit-exercise-id');
const editExerciseSetsInput = document.getElementById('edit-exercise-sets');
const editExerciseRepsInput = document.getElementById('edit-exercise-reps');
const editExerciseRestInput = document.getElementById('edit-exercise-rest');

// Pulsanti incremento/decremento per modifica
const editDecreaseSets = document.getElementById('edit-decrease-sets');
const editIncreaseSets = document.getElementById('edit-increase-sets');
const editDecreaseReps = document.getElementById('edit-decrease-reps');
const editIncreaseReps = document.getElementById('edit-increase-reps');
const editDecreaseRest = document.getElementById('edit-decrease-rest');
const editIncreaseRest = document.getElementById('edit-increase-rest');

// Dialog di conferma eliminazione
const confirmExerciseDialog = document.getElementById('confirm-exercise-dialog');
const confirmExerciseCancel = document.getElementById('confirm-exercise-cancel');
const confirmExerciseDelete = document.getElementById('confirm-exercise-delete');
const deleteExerciseIdInput = document.getElementById('delete-exercise-id');

// --------- Dati URL e Stato ---------
// Ottieni l'ID del workout dalla URL
const urlParams = new URLSearchParams(window.location.search);
const workoutId = urlParams.get('id');
const workoutName = urlParams.get('name') || 'Allenamento';
let currentExercises = [];
let exerciseHistory = [];

// --------- Local Storage Keys ---------
const EXERCISES_KEY = `gymbro_exercises_${workoutId}`;
const HISTORY_KEY = `gymbro_history_${workoutId}`;

// --------- Funzioni per gestire i dati ---------
// Salva tutti gli esercizi nel localStorage
function saveAllExercises(exercises) {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

// Ottieni tutti gli esercizi dal localStorage
function getAllExercises() {
    const data = localStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
}

// Salva un singolo esercizio
function saveExercise(exercise) {
    currentExercises = getAllExercises();
    const index = currentExercises.findIndex(e => e.id === exercise.id);
    
    if (index !== -1) {
        // Aggiorna esercizio esistente
        currentExercises[index] = exercise;
    } else {
        // Aggiungi nuovo esercizio
        currentExercises.push(exercise);
    }
    
    saveAllExercises(currentExercises);
}

// Elimina un esercizio
function deleteExercise(id) {
    currentExercises = getAllExercises();
    const filtered = currentExercises.filter(exercise => exercise.id !== id);
    saveAllExercises(filtered);
    currentExercises = filtered;
}

// Salva lo storico degli allenamenti
function saveHistory(historyData) {
    const currentHistory = getHistory();
    
    // Aggiungi la nuova sessione alla storia
    currentHistory.push({
        date: new Date().toISOString(),
        exercises: historyData
    });
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
}

// Ottieni lo storico degli allenamenti
function getHistory() {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

// --------- Funzioni UI ---------
// Crea un elemento esercizio
function createExerciseElement(exerciseData) {
    const { id, name, sets, reps, rest, workout } = exerciseData;
    
    const exerciseEl = document.createElement('div');
    exerciseEl.className = 'exercise-card';
    exerciseEl.id = id;
    
    exerciseEl.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-name">${name}</div>
            <div class="exercise-actions">
                <div class="action-icon edit-exercise" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8fff46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </div>
                <div class="action-icon delete-exercise" data-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <div class="exercise-info">
            <div class="info-box">
                <div class="info-value">${sets}</div>
                <div class="info-label">Serie</div>
            </div>
            <div class="info-box">
                <div class="info-value">${reps}</div>
                <div class="info-label">Reps</div>
            </div>
            <div class="info-box">
                <div class="info-value">${rest}s</div>
                <div class="info-label">Recupero</div>
            </div>
        </div>
        
        <div class="sets-container">
            <div class="sets-header">
                <div class="set-number">Serie</div>
                <div class="set-weight">Peso</div>
                <div class="set-reps">Reps</div>
            </div>
            <div class="sets-list" id="sets-list-${id}">
                ${generateSetInputs(sets, id)}
            </div>
        </div>
        
        <div class="exercise-notes">
            <button class="notes-toggle" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="21" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
                Note
            </button>
            <div class="notes-container" id="notes-${id}" style="display: none;">
                <textarea class="notes-textarea" id="notes-textarea-${id}" placeholder="Aggiungi note per questo esercizio...">${exerciseData.notes || ''}</textarea>
            </div>
        </div>
    `;
    
    exerciseContainer.appendChild(exerciseEl);
    
    // Aggiungi event listener per la funzione delle note
    const notesToggle = exerciseEl.querySelector(`.notes-toggle[data-id="${id}"]`);
    const notesContainer = document.getElementById(`notes-${id}`);
    const notesTextarea = document.getElementById(`notes-textarea-${id}`);
    
    notesToggle.addEventListener('click', function() {
        if (notesContainer.style.display === 'none') {
            notesContainer.style.display = 'block';
            notesTextarea.focus();
        } else {
            notesContainer.style.display = 'none';
            // Salva le note quando vengono chiuse
            const updatedExercise = currentExercises.find(e => e.id === id);
            if (updatedExercise) {
                updatedExercise.notes = notesTextarea.value;
                saveExercise(updatedExercise);
            }
        }
    });
    
    // Aggiungi event listener per salvare i valori di peso e ripetizioni
    const weightInputs = exerciseEl.querySelectorAll('.weight-input');
    const repsInputs = exerciseEl.querySelectorAll('.reps-input');
    
    weightInputs.forEach(input => {
        input.addEventListener('change', function() {
            saveSetValues(id);
        });
    });
    
    repsInputs.forEach(input => {
        input.addEventListener('change', function() {
            saveSetValues(id);
        });
    });
}

// Genera gli input per le serie
function generateSetInputs(setsCount, exerciseId) {
    let html = '';
    const exercise = currentExercises.find(e => e.id === exerciseId);
    const setValues = exercise && exercise.setValues ? exercise.setValues : [];
    
    for (let i = 0; i < setsCount; i++) {
        const setValue = setValues[i] || { weight: '', reps: '' };
        html += `
            <div class="set-row" data-set="${i+1}">
                <div class="set-number">${i+1}</div>
                <div class="set-weight">
                    <input type="text" inputmode="decimal" class="weight-input" data-set="${i+1}" value="${setValue.weight}" placeholder="KG">
                </div>
                <div class="set-reps">
                    <input type="text" inputmode="numeric" class="reps-input" data-set="${i+1}" value="${setValue.reps}" placeholder="Reps">
                </div>
            </div>
        `;
    }
    return html;
}

// Salva i valori inseriti nelle serie
function saveSetValues(exerciseId) {
    const exercise = currentExercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    const setValues = [];
    const weightInputs = document.querySelectorAll(`#sets-list-${exerciseId} .weight-input`);
    const repsInputs = document.querySelectorAll(`#sets-list-${exerciseId} .reps-input`);
    
    for (let i = 0; i < weightInputs.length; i++) {
        setValues.push({
            weight: weightInputs[i].value,
            reps: repsInputs[i].value
        });
    }
    
    exercise.setValues = setValues;
    saveExercise(exercise);
}

// Aggiorna la UI quando non ci sono esercizi
function updateEmptyState() {
    if (currentExercises.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.id = 'empty-exercises-message';
        emptyMessage.textContent = 'Nessun esercizio. Clicca + per aggiungerne uno.';
        exerciseContainer.appendChild(emptyMessage);
    } else {
        const emptyMessage = document.getElementById('empty-exercises-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
}

// Genera un ID unico per gli esercizi
function generateUniqueId() {
    return 'exercise-' + Date.now();
}

// Carica tutti gli esercizi dal localStorage
function loadExercises() {
    try {
        currentExercises = getAllExercises();
        
        // Rimuovi prima tutti gli esercizi esistenti
        exerciseContainer.innerHTML = '';
        
        // Se ci sono esercizi, mostrali
        if (currentExercises.length > 0) {
            currentExercises.forEach(exercise => {
                createExerciseElement(exercise);
            });
        }
        
        // Aggiorna lo stato vuoto se necessario
        updateEmptyState();
        
    } catch (error) {
        console.error('Errore durante il caricamento degli esercizi:', error);
        alert('Impossibile caricare gli esercizi. Riprova.');
    }
}

// Completa il workout e salva i dati nella storia
function completeWorkout() {
    try {
        // Salva i dati correnti nella storia
        saveHistory(currentExercises);
        
        // Resetta solo i valori delle serie ma mantieni gli esercizi
        currentExercises.forEach(exercise => {
            if (exercise.setValues) {
                const resetValues = Array(exercise.sets).fill().map(() => ({ weight: '', reps: '' }));
                exercise.setValues = resetValues;
            }
        });
        
        // Salva gli esercizi con i valori resettati
        saveAllExercises(currentExercises);
        
        // Ricarica la pagina per mostrare i campi puliti
        loadExercises();
        
        // Notifica l'utente
        alert('Allenamento completato e salvato con successo!');
        
    } catch (error) {
        console.error('Errore durante il completamento dell\'allenamento:', error);
        alert('Errore durante il completamento dell\'allenamento. Riprova.');
    }
}

// --------- Event Listeners ---------
// Torna alla pagina iniziale
backButton.addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Imposta il titolo dell'allenamento
workoutTitle.textContent = workoutName;

// Mostra il modal per aggiungere un esercizio
addExerciseButton.addEventListener('click', function() {
    // Resetta i campi
    exerciseNameInput.value = '';
    exerciseSetsInput.value = '3';
    exerciseRepsInput.value = '12';
    exerciseRestInput.value = '60';
    
    // Mostra il modal
    addExerciseModal.style.display = 'flex';
    exerciseNameInput.focus();
});

// Gestisci i pulsanti di incremento/decremento
decreaseSets.addEventListener('click', function() {
    if (exerciseSetsInput.value > 0) exerciseSetsInput.value = parseInt(exerciseSetsInput.value) - 1;
});

increaseSets.addEventListener('click', function() {
    exerciseSetsInput.value = parseInt(exerciseSetsInput.value) + 1;
});

decreaseReps.addEventListener('click', function() {
    if (exerciseRepsInput.value > 0) exerciseRepsInput.value = parseInt(exerciseRepsInput.value) - 1;
});

increaseReps.addEventListener('click', function() {
    exerciseRepsInput.value = parseInt(exerciseRepsInput.value) + 1;
});

decreaseRest.addEventListener('click', function() {
    if (exerciseRestInput.value > 0) exerciseRestInput.value = parseInt(exerciseRestInput.value) - 5;
});

increaseRest.addEventListener('click', function() {
    exerciseRestInput.value = parseInt(exerciseRestInput.value) + 5;
});

// Ripeti per i pulsanti di modifica
editDecreaseSets.addEventListener('click', function() {
    if (editExerciseSetsInput.value > 0) editExerciseSetsInput.value = parseInt(editExerciseSetsInput.value) - 1;
});

editIncreaseSets.addEventListener('click', function() {
    editExerciseSetsInput.value = parseInt(editExerciseSetsInput.value) + 1;
});

editDecreaseReps.addEventListener('click', function() {
    if (editExerciseRepsInput.value > 0) editExerciseRepsInput.value = parseInt(editExerciseRepsInput.value) - 1;
});

editIncreaseReps.addEventListener('click', function() {
    editExerciseRepsInput.value = parseInt(editExerciseRepsInput.value) + 1;
});

editDecreaseRest.addEventListener('click', function() {
    if (editExerciseRestInput.value > 0) editExerciseRestInput.value = parseInt(editExerciseRestInput.value) - 5;
});

editIncreaseRest.addEventListener('click', function() {
    editExerciseRestInput.value = parseInt(editExerciseRestInput.value) + 5;
});

// Chiudi il modal quando si clicca su Annulla
exerciseCancelButton.addEventListener('click', function() {
    addExerciseModal.style.display = 'none';
});

// Crea un nuovo esercizio quando si clicca su Salva
exerciseCreateButton.addEventListener('click', function() {
    const name = exerciseNameInput.value.trim();
    const sets = parseInt(exerciseSetsInput.value);
    const reps = parseInt(exerciseRepsInput.value);
    const rest = parseInt(exerciseRestInput.value);
    
    if (name && sets > 0 && reps > 0) {
        const newExercise = {
            id: generateUniqueId(),
            workoutId: workoutId,
            name: name,
            sets: sets,
            reps: reps,
            rest: rest,
            notes: '',
            setValues: Array(sets).fill().map(() => ({ weight: '', reps: '' }))
        };
        
        // Salva l'esercizio
        saveExercise(newExercise);
        
        // Crea l'elemento UI
        createExerciseElement(newExercise);
        
        // Chiudi il modal
        addExerciseModal.style.display = 'none';
        
        // Aggiorna lo stato vuoto
        updateEmptyState();
    } else {
        alert('Compila correttamente tutti i campi per creare un esercizio.');
    }
});

// Event listeners per modificare ed eliminare gli esercizi (usando la delegazione degli eventi)
document.addEventListener('click', function(event) {
    // Modifica esercizio
    const editButton = event.target.closest('.edit-exercise');
    if (editButton) {
        const exerciseId = editButton.getAttribute('data-id');
        const exercise = currentExercises.find(e => e.id === exerciseId);
        
        if (exercise) {
            // Compila i campi del modal con i dati dell'esercizio
            editExerciseNameInput.value = exercise.name;
            editExerciseSetsInput.value = exercise.sets;
            editExerciseRepsInput.value = exercise.reps;
            editExerciseRestInput.value = exercise.rest;
            editExerciseIdInput.value = exerciseId;
            
            // Mostra il modal
            editExerciseModal.style.display = 'flex';
        }
    }
    
    // Elimina esercizio
    const deleteButton = event.target.closest('.delete-exercise');
    if (deleteButton) {
        const exerciseId = deleteButton.getAttribute('data-id');
        deleteExerciseIdInput.value = exerciseId;
        confirmExerciseDialog.style.display = 'flex';
    }
});

// Chiudi il modal di modifica quando si clicca su Annulla
editExerciseCancelButton.addEventListener('click', function() {
    editExerciseModal.style.display = 'none';
});

// Salva le modifiche all'esercizio
editExerciseSaveButton.addEventListener('click', function() {
    const name = editExerciseNameInput.value.trim();
    const sets = parseInt(editExerciseSetsInput.value);
    const reps = parseInt(editExerciseRepsInput.value);
    const rest = parseInt(editExerciseRestInput.value);
    const exerciseId = editExerciseIdInput.value;
    
    if (name && sets > 0 && reps > 0) {
        // Trova l'esercizio esistente
        const exercise = currentExercises.find(e => e.id === exerciseId);
        
        if (exercise) {
            // Mantieni i setValues esistenti se il numero di serie è lo stesso
            let setValues = [];
            if (exercise.setValues && exercise.sets === sets) {
                setValues = exercise.setValues;
            } else {
                // Altrimenti crea nuovi setValues vuoti
                setValues = Array(sets).fill().map(() => ({ weight: '', reps: '' }));
            }
            
            // Aggiorna l'esercizio
            exercise.name = name;
            exercise.sets = sets;
            exercise.reps = reps;
            exercise.rest = rest;
            exercise.setValues = setValues;
            
            // Salva l'esercizio
            saveExercise(exercise);
            
            // Rimuovi l'elemento esistente
            const existingElement = document.getElementById(exerciseId);
            if (existingElement) {
                existingElement.remove();
            }
            
            // Crea un nuovo elemento
            createExerciseElement(exercise);
            
            // Chiudi il modal
            editExerciseModal.style.display = 'none';
        }
    } else {
        alert('Compila correttamente tutti i campi per modificare l\'esercizio.');
    }
});

// Gestione della conferma di eliminazione
confirmExerciseCancel.addEventListener('click', function() {
    confirmExerciseDialog.style.display = 'none';
});

confirmExerciseDelete.addEventListener('click', function() {
    const exerciseId = deleteExerciseIdInput.value;
    
    // Elimina l'esercizio dal localStorage
    deleteExercise(exerciseId);
    
    // Rimuovi l'elemento dalla UI
    const element = document.getElementById(exerciseId);
    if (element) {
        element.remove();
    }
    
    // Aggiorna lo stato vuoto
    updateEmptyState();
    
    // Chiudi il dialog
    confirmExerciseDialog.style.display = 'none';
});

// Completa l'allenamento
completeWorkoutButton.addEventListener('click', function() {
    if (currentExercises.length === 0) {
        alert('Aggiungi almeno un esercizio prima di completare l\'allenamento.');
        return;
    }
    
    // Chiedi conferma all'utente
    if (confirm('Sei sicuro di voler completare questo allenamento? I dati saranno salvati nella cronologia.')) {
        completeWorkout();
    }
});

// Chiudi i modal se si clicca al di fuori di essi
window.addEventListener('click', function(event) {
    if (event.target === addExerciseModal) {
        addExerciseModal.style.display = 'none';
    }
    
    if (event.target === editExerciseModal) {
        editExerciseModal.style.display = 'none';
    }
    
    if (event.target === confirmExerciseDialog) {
        confirmExerciseDialog.style.display = 'none';
    }
});

// --------- Inizializzazione ---------
// Funzione di inizializzazione della pagina
function initExercisePage() {
    // Mostra il titolo dell'allenamento
    workoutTitle.textContent = workoutName;
    
    // Carica gli esercizi
    loadExercises();
}

// Avvia l'app quando il DOM è caricato
document.addEventListener('DOMContentLoaded', initExercisePage);