const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");


// Funzione per aprire e chiudere il menu a discesa del backup
function toggleBackupMenu() {
    const menu = document.getElementById("backup-menu");
    if (menu.style.display === "block") {
        menu.style.display = "none"; // Nasconde il menu
    } else {
        menu.style.display = "block"; // Mostra il menu
    }
}

// Funzione per scaricare il backup (serializza e salva i dati in un file)
function downloadBackup() {
    const chats = getChats(); // Ottiene tutte le chat
    const dataStr = JSON.stringify(chats); // Converte i dati in formato JSON

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json"; // Nome del file di backup
    document.body.appendChild(a);
    a.click(); // Avvia il download
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funzione per caricare un backup (legge il file JSON e ripristina i dati)
function uploadBackup() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Filtra solo i file JSON
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = JSON.parse(e.target.result); // Parsea il contenuto del file JSON
            setChats(data); // Funzione che aggiorna le chat nell'app
            alert("Backup caricato con successo!");
            renderChats(); // Rende visibile la lista aggiornata delle chat
        };

        reader.onerror = function () {
            alert("Errore durante il caricamento del file.");
        };

        reader.readAsText(file); // Leggi il file come testo
    };

    input.click(); // Clicca per aprire il selettore di file
}

// Funzione per cancellare i dati (rimuove tutte le chat)
function deleteData() {
    if (confirm("Sei sicuro di voler cancellare tutti i dati?")) {
        localStorage.removeItem("chats"); // Rimuovi le chat dal localStorage
        alert("Dati cancellati con successo.");
        renderChats(); // Rende visibile la lista vuota delle chat
    }
}

// Funzione per ottenere le chat dal localStorage
function getChats() {
    const chatsData = localStorage.getItem("chats");
    return chatsData ? JSON.parse(chatsData) : [];
}

// Funzione per salvare le chat nel localStorage
function setChats(chats) {
    localStorage.setItem("chats", JSON.stringify(chats));
}

// Funzione per creare una nuova chat
function createNewChat() {
    const chatName = prompt("Inserisci il nome della nuova chat:");
    if (chatName) {
        const newChat = {
            name: chatName,
            messages: []
        };
        const chats = getChats();
        chats.push(newChat);
        setChats(chats);
        renderChats(); // Rende visibile la lista aggiornata delle chat
    }
}

// Funzione per renderizzare le chat nella home page
function renderChats() {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = ""; // Pulisce la lista delle chat esistenti
    const chats = getChats();
    
    chats.forEach((chat, index) => {
        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        chatItem.textContent = chat.name;
        chatItem.onclick = function() {
            openChat(index); // Apre la chat selezionata
        };
        chatList.appendChild(chatItem);
    });
}

// Funzione per aprire una chat specifica
function openChat(index) {
    const chats = getChats();
    const selectedChat = chats[index];

    // Mostra la pagina della chat e nasconde la home
    document.getElementById("home-page").style.display = "none";
    document.getElementById("chat-page").style.display = "block";
    document.getElementById("chat-name").textContent = selectedChat.name;

    // Carica i messaggi nella chat
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = ""; // Pulisce i messaggi esistenti

    selectedChat.messages.forEach(msg => {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.textContent = msg;
        chatBox.appendChild(messageDiv);
    });

    // Funzione di invio messaggio
    document.getElementById("send-message").onclick = function() {
        sendMessage(index);
    };
}

// Funzione per tornare alla home page
function goBack() {
    document.getElementById("home-page").style.display = "block";
    document.getElementById("chat-page").style.display = "none";
}

// Funzione per inviare un messaggio di testo
function sendMessage(chatIndex) {
    const messageInput = document.getElementById("message");
    const messageText = messageInput.value;

    if (messageText) {
        const chats = getChats();
        chats[chatIndex].messages.push(messageText); // Aggiungi il messaggio alla chat
        setChats(chats); // Salva i dati delle chat

        // Aggiungi il messaggio nella visualizzazione
        const chatBox = document.getElementById("chat-box");
        const messageDiv = document.createElement("div");
        messageDiv.className = "message user";
        messageDiv.textContent = messageText;
        chatBox.appendChild(messageDiv);

        messageInput.value = ""; // Pulisce il campo di input
    }
}

// Funzione per cercare una chat
function searchChat() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const chats = getChats();
    const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchInput));
    
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = ""; // Pulisce la lista delle chat

    filteredChats.forEach((chat, index) => {
        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        chatItem.textContent = chat.name;
        chatItem.onclick = function() {
            openChat(index); // Apre la chat selezionata
        };
        chatList.appendChild(chatItem);
    });
}

// Inizializzazione della home page con le chat salvate
document.addEventListener("DOMContentLoaded", function() {
    renderChats(); // Carica le chat all'avvio
});




let isPlaying = false;
let progressInterval = null;

function loadAudio(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith("audio/")) {
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            audioPlayer.load();
            document.querySelector(".progress-bar-container").style.display = "block";
            document.querySelector(".beat-title").textContent = file.name;
            resetPlayer();
        } else {
            alert("Per favore seleziona un file audio valido!");
        }
    } else {
        alert("Nessun file selezionato.");
    }
}

function resetPlayer() {
    isPlaying = false;
    updateProgressBar(0);
    currentTimeDisplay.textContent = formatTime(0);
    if (progressInterval) clearInterval(progressInterval);
}

function togglePlayPause() {
    if (audioPlayer.src === "") {
        alert("Per favore seleziona un beat prima di riprodurre!");
        return;
    }

    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    isPlaying = true;
    audioPlayer.play();
    progressInterval = setInterval(updateProgress, 500);
}

function pause() {
    isPlaying = false;
    audioPlayer.pause();
    clearInterval(progressInterval);
}

function rewind() {
    if (audioPlayer.currentTime >= 15) {
        audioPlayer.currentTime -= 15;
    } else {
        audioPlayer.currentTime = 0;
    }
    updateProgress();
}

function forward() {
    if (audioPlayer.currentTime + 15 <= audioPlayer.duration) {
        audioPlayer.currentTime += 15;
    } else {
        audioPlayer.currentTime = audioPlayer.duration;
    }
    updateProgress();
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    updateProgressBar(progress);
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
}

function updateProgressBar(progress) {
    progressBar.style.width = ${progress}%;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return ${minutes}:${secs < 10 ? "0" : ""}${secs};
}
