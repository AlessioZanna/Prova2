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
    const contacts = getContacts(); // Funzione che raccoglie i contatti da salvare (definita separatamente)
    const dataStr = JSON.stringify(contacts); // Converti i dati in formato JSON

    const blob = new Blob([dataStr], { type: "application/json" }); // Crea un oggetto Blob per il file
    const url = URL.createObjectURL(blob); // Crea un URL per il file

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json"; // Nome del file di backup
    document.body.appendChild(a);
    a.click(); // Avvia il download
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Rimuovi l'oggetto URL
}

// Funzione per caricare un backup (leggi il file JSON e ripristina i dati)
function uploadBackup() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Filtra solo i file JSON
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result); // Parsea il contenuto del file JSON
            setContacts(data); // Funzione che aggiorna i contatti nell'app (definita separatamente)
            alert("Backup caricato con successo!");
        };

        reader.onerror = function () {
            alert("Errore durante il caricamento del file.");
        };

        reader.readAsText(file); // Leggi il file come testo
    };

    input.click(); // Clicca per aprire il selettore di file
}

// Funzione per cancellare i dati (rimuove tutti i contatti)
function deleteData() {
    if (confirm("Sei sicuro di voler cancellare tutti i dati?")) {
        localStorage.removeItem("contacts"); // Rimuovi i contatti dal localStorage
        alert("Dati cancellati con successo.");
    }
}

// Funzione per ottenere i contatti dal localStorage (se esistono)
function getContacts() {
    const contactsData = localStorage.getItem("contacts");
    return contactsData ? JSON.parse(contactsData) : [];
}

// Funzione per salvare i contatti nel localStorage
function setContacts(contacts) {
    localStorage.setItem("contacts", JSON.stringify(contacts));
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
