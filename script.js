const timerDisplay = document.getElementById('timer');
const timerDesc = document.getElementById('timerDesc');
const startSeqBtn = document.getElementById('startSeqBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const changeList = document.getElementById('changeList');
const changeForm = document.getElementById('changeForm');
const outPlayerInput = document.getElementById('outPlayer');
const inPlayerInput = document.getElementById('inPlayer');
const minutesCountdownInput = document.getElementById('minutesCountdown');

let changes = [];
let currentIndex = null;
let timeLeft = 0;
let timer = null;
let running = false;
let searchTerm = "";

// LocalStorage helpers
function saveState() {
  localStorage.setItem('calcetto_changes', JSON.stringify(changes));
  localStorage.setItem('calcetto_currentIndex', currentIndex);
  localStorage.setItem('calcetto_timeLeft', timeLeft);
  localStorage.setItem('calcetto_running', running);
}
function loadState() {
  changes = JSON.parse(localStorage.getItem('calcetto_changes') || '[]');
  currentIndex = localStorage.getItem('calcetto_currentIndex');
  currentIndex = currentIndex !== null && currentIndex !== "null" ? Number(currentIndex) : null;
  timeLeft = Number(localStorage.getItem('calcetto_timeLeft')) || 0;
  running = localStorage.getItem('calcetto_running') === "true";

  // --- TIMER RESUME LOGIC ---
  const timerStart = localStorage.getItem('calcetto_timerStart');
  const timerDuration = localStorage.getItem('calcetto_timerDuration');
  const timerIndex = localStorage.getItem('calcetto_timerIndex');
  if (timerStart && timerDuration && timerIndex !== null) {
    const elapsed = Math.floor((Date.now() - Number(timerStart)) / 1000);
    const remaining = Number(timerDuration) - elapsed;
    if (remaining > 0 && changes[Number(timerIndex)]) {
      currentIndex = Number(timerIndex);
      timeLeft = remaining;
      running = true;
    } else {
      // Timer scaduto mentre l'app era chiusa
      if (changes[Number(timerIndex)]) changes[Number(timerIndex)].done = true;
      currentIndex = null;
      timeLeft = 0;
      running = false;
      localStorage.removeItem('calcetto_timerStart');
      localStorage.removeItem('calcetto_timerDuration');
      localStorage.removeItem('calcetto_timerIndex');
    }
  }
  // --- FINE TIMER RESUME LOGIC ---

  renderChanges();
  updateTimerDisplay();
  updateTimerDesc();
  updateButtons();
  if(running) startTimer();
}
window.addEventListener('load', loadState);

// UI rendering
// ...existing code...

function renderChanges(){
  changeList.innerHTML = '';
  changes.forEach((c, i) => {
    // Mostra tutti i nomi separati da virgola
    const outNames = Array.isArray(c.out) ? c.out.join(', ') : c.out;
    const inNames = Array.isArray(c.in) ? c.in.join(', ') : c.in;
    const li = document.createElement('li');
    li.textContent = `Esce ${outNames} - Entra ${inNames} - ${c.time}m`;
    if(c.done) li.classList.add('done');
    if(i === currentIndex) li.classList.add('active');
const delBtn = document.createElement('button');
delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
delBtn.className = 'delete-btn';
delBtn.setAttribute('aria-label', `Elimina cambio ${outNames} → ${inNames}`);

    delBtn.onclick = e => {
      e.stopPropagation();
      if(running && i === currentIndex){
        alert('Non puoi cancellare il cambio in corso!');
        return;
      }
      changes.splice(i,1);
      if(currentIndex !== null && i < currentIndex){
        currentIndex--;
      } else if(i === currentIndex){
        currentIndex = null;
        stopTimer();
        resetTimer();
      }
      renderChanges();
      saveState();
      updateButtons();
    };
    li.appendChild(delBtn);
    changeList.appendChild(li);
  });
}
function updateTimerDisplay(){
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}
function updateTimerDesc(){
  if(currentIndex === null || !changes[currentIndex]){
    timerDesc.textContent = 'Nessun cambio attivo';
    return;
  }
  if(changes[currentIndex].done){
    timerDesc.textContent = `Cambio fatto: ${changes[currentIndex].out} → ${changes[currentIndex].in}`;
  } else {
    timerDesc.textContent = `Esce ${changes[currentIndex].out} - Entra ${changes[currentIndex].in}`;
  }
}

// Timer logic
function startTimer(){
  if(currentIndex === null || timeLeft <= 0) return;
  // Salva il timestamp di inizio solo se non esiste già
  if (!localStorage.getItem('calcetto_timerStart')) {
    localStorage.setItem('calcetto_timerStart', Date.now());
    localStorage.setItem('calcetto_timerDuration', timeLeft);
    localStorage.setItem('calcetto_timerIndex', currentIndex);
  }
  running = true;
  updateButtons();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if(timeLeft <= 0){
      clearInterval(timer);
      localStorage.removeItem('calcetto_timerStart');
      localStorage.removeItem('calcetto_timerDuration');
      localStorage.removeItem('calcetto_timerIndex');
      changes[currentIndex].done = true;
      saveState();



      // SUONA ALLARME
alarmAudio.play().catch(e => {
  console.warn('Audio non può essere riprodotto automaticamente:', e);
});

      

      currentIndex++;
      if(currentIndex >= changes.length){
        currentIndex = null;
        running = false;
        updateButtons();
        updateTimerDesc();
        renderChanges(); // aggiorna la lista visivamente
      } else {
        timeLeft = changes[currentIndex].time * 60;
        updateTimerDesc();
        updateTimerDisplay();
        saveState();
        renderChanges(); // aggiorna la lista visivamente
        running = false;
        startTimer();
      }

    }
  }, 1000);
}
function stopTimer(){
  if(!running) return;
  clearInterval(timer);
  running = false;
  updateButtons();
  localStorage.removeItem('calcetto_timerStart');
  localStorage.removeItem('calcetto_timerDuration');
  localStorage.removeItem('calcetto_timerIndex');
}
function resetTimer(){
  stopTimer();
  changes.forEach(c => c.done = false);
  currentIndex = null;
  timeLeft = 0;
  updateTimerDisplay();
  updateTimerDesc();
  renderChanges();
  saveState();
  updateButtons();
}
function startSequence(){
  if(running) return;
  // Se la sequenza è già iniziata e stoppata, riprendi da dove eri
  if(currentIndex !== null && timeLeft > 0) {
    startTimer();
    return;
  }
  // Altrimenti parti dal prossimo cambio non fatto
  const nextIndex = changes.findIndex(c => !c.done);
  if(nextIndex === -1){
    alert('Tutti i cambi sono già stati completati. Resetta la sequenza per ricominciare.');
    return;
  }
  currentIndex = nextIndex;
  timeLeft = changes[currentIndex].time * 60;
  updateTimerDesc();
  updateTimerDisplay();
  renderChanges();
  saveState();
  startTimer();
}

// Button states
function updateButtons(){
  startSeqBtn.disabled = running || changes.length === 0 || changes.every(c => c.done);
  stopBtn.disabled = !running;
  resetBtn.disabled = false;
}

changeForm.addEventListener('submit', e => {
  e.preventDefault();
  const outP = Array.from(outPlayerInput.selectedOptions).map(opt => opt.value);
  const inP = Array.from(inPlayerInput.selectedOptions).map(opt => opt.value);
  const mins = parseInt(minutesCountdownInput.value, 10);

  if(outP.length === 0 || inP.length === 0 || isNaN(mins) || mins < 1){
    alert('Seleziona almeno un giocatore in uscita, uno in entrata e i minuti.');
    return;
  }
  if(outP.some(name => inP.includes(name))){
    alert('Un giocatore non può entrare e uscire nello stesso cambio!');
    return;
  }
  changes.push({out: outP, in: inP, time: mins, done: false});
  renderChanges();
  saveState();
  changeForm.reset();
  updateButtons();
});

let alarmAudio = new Audio('alarm.mp3');

startSeqBtn.addEventListener('click', () => {
  // Sblocca audio al primo click
  alarmAudio.play().then(() => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }).catch(() => {
    // Ignora l'errore: l'audio verrà comunque provato alla fine del timer
  });

  startSequence();
});

stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', () => {
  if(confirm('Sei sicuro di voler cancellare tutti i cambi e resettare il timer?')){
    changes = [];
    currentIndex = null;
    timeLeft = 0;
    running = false;
    renderChanges();
    updateTimerDisplay();
    updateTimerDesc();
    updateButtons();
    localStorage.removeItem('calcetto_changes');
    localStorage.removeItem('calcetto_currentIndex');
    localStorage.removeItem('calcetto_timeLeft');
    localStorage.removeItem('calcetto_running');
    localStorage.removeItem('calcetto_timerStart');
    localStorage.removeItem('calcetto_timerDuration');
    localStorage.removeItem('calcetto_timerIndex');
  }
});
clearAllBtn.addEventListener('click', () => {
  if(confirm('Sei sicuro di voler cancellare tutti i cambi e resettare il timer?')){
    changes = [];
    currentIndex = null;
    timeLeft = 0;
    running = false;
    renderChanges();
    updateTimerDisplay();
    updateTimerDesc();
    updateButtons();
    saveState();
  }
});

// iOS Standalone workaround
function isIosStandalone() {
  return (
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );
}
if(isIosStandalone()) {
  modal.addEventListener('touchstart', function(){});
}

