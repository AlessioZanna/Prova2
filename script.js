// Funzione per aprire e chiudere il menu a discesa del backup
function toggleBackupMenu() {
    const menu = document.getElementById("backup-menu");
    if (menu.style.display === "block") {
        menu.style.display = "none"; // Nasconde il menu
    } else {
        menu.style.display = "block"; // Mostra il menu
    }
}

// Funzioni di backup
function downloadBackup() {
    alert("Funzione di download backup ancora da implementare.");
}

function uploadBackup() {
    alert("Funzione di upload backup ancora da implementare.");
}

function deleteData() {
    alert("Funzione di cancellazione dei dati ancora da implementare.");
}

// Funzione per creare una nuova chat
function createNewChat() {
    alert("Funzione di creazione chat ancora da implementare.");
}

// Funzione per tornare alla home page
function goBack() {
    document.getElementById("home-page").style.display = "block";
    document.getElementById("chat-page").style.display = "none";
}

// Funzione per inviare un messaggio di testo
function sendMessage() {
    const messageInput = document.getElementById("message");
    const messageText = messageInput.value;
    if (messageText) {
        const chatBox = document.getElementById("chat-box");
        const message = document.createElement("div");
        message.className = "message user";
        message.innerHTML = `<div class="msg">${messageText}</div>`;
        chatBox.appendChild(message);
        messageInput.value = ""; // Pulisce il campo di input
    }
}

// Funzione per inviare un messaggio vocale
function sendAudio() {
    alert("Funzione di invio audio ancora da implementare.");
}
