let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChatIndex = null;

function saveChats() {
    console.log("Salvataggio delle chat:", chats);
    localStorage.setItem("chats", JSON.stringify(chats));
}

function createNewChat() {
    const chatName = prompt("Inserisci il nome della chat:");
    if (chatName && chatName.trim() !== "") {
        chats.push({ name: chatName.trim(), messages: [] });
        saveChats();
        renderChats();
    }
}

function renderChats() {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    const searchQuery = document.getElementById("search-input").value.toLowerCase();

    chats.filter(chat => chat.name.toLowerCase().includes(searchQuery)).forEach((chat, index) => {
        const contactItem = document.createElement("div");
        contactItem.classList.add("contact");
        contactItem.innerHTML = `
            <div class="contact-info">
                <h3>${chat.name}</h3>
                <p>${chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "Nessun messaggio"}</p>
            </div>
            <div class="contact-delete" onclick="deleteChat(${index})">✖</div>
        `;

        contactItem.addEventListener("click", () => openChat(index));
        contactList.appendChild(contactItem);
    });
}

function openChat(index) {
    currentChatIndex = index;
    const chat = chats[index];
    document.getElementById("chat-user").innerText = chat.name;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    chat.messages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", message.type);
        messageDiv.innerHTML = `<div class="msg">${message.text}</div>`;
        chatBox.appendChild(messageDiv);
    });
    document.getElementById("chat-page").style.display = "flex";
    document.getElementById("home-page").style.display = "none";
}

function sendMessage() {
    const input = document.getElementById("message");
    if (input.value.trim() !== "" && currentChatIndex !== null) {
        chats[currentChatIndex].messages.push({ type: "user", text: input.value.trim() });
        saveChats();
        input.value = "";
        openChat(currentChatIndex);
    }
}

function sendAudio() {
    if (currentChatIndex !== null) {
        chats[currentChatIndex].messages.push({ type: "audio", text: "Audio inviato." });
        saveChats();
        openChat(currentChatIndex);
    }
}

function deleteChat(index) {
    if (confirm("Sei sicuro di voler eliminare questa chat?")) {
        chats.splice(index, 1);
        saveChats();
        renderChats();
    }
}

function downloadBackup() {
    const blob = new Blob([JSON.stringify(chats)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "backup_chats.json";
    link.click();
    URL.revokeObjectURL(url);
}

function uploadBackup(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const uploadedChats = JSON.parse(reader.result);
                chats = uploadedChats;
                saveChats();
                renderChats();
                alert("Backup caricato con successo!");
            } catch (error) {
                alert("Errore nel caricamento del backup.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Seleziona un file JSON valido.");
    }
}

function deleteAllChats() {
    if (confirm("Sei sicuro di voler cancellare tutte le chat?")) {
        chats = [];
        saveChats();
        renderChats();
        alert("Tutte le chat sono state cancellate.");
    }
}

document.getElementById("backup-download").addEventListener("click", downloadBackup);
document.getElementById("backup-upload").addEventListener("change", uploadBackup);
document.getElementById("backup-delete").addEventListener("click", deleteAllChats);
document.getElementById("create-chat-btn").addEventListener("click", createNewChat);
document.getElementById("search-input").addEventListener("input", renderChats);

renderChats();
