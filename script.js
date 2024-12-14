let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChatIndex = null;
let startX = 0;
let currentSwipedChat = null;

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}

function goBack() {
    document.getElementById("chat-page").style.display = "none";
    document.getElementById("home-page").style.display = "flex";
    currentChatIndex = null;
}

function createNewChat() {
    const chatName = prompt("Inserisci il nome della chat:");
    if (chats.some(chat => chat.name.toLowerCase() === chatName.trim().toLowerCase())) {
        alert("Una chat con questo nome esiste già.");
        return;
    }
    
    if (chatName && chatName.trim() !== "") {
        chats.push({ name: chatName.trim(), messages: [] });
        saveChats();
        renderChats();
    }
}


function renderChats() {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = ""; // Resetta la lista
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

        // Abilita drag-and-drop
        enableDragAndDrop(contactItem, index);

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
        goBack(); // Torna alla home page dopo l'eliminazione
        renderChats();
    }
}


// Funzione per aprire il menu e applicare l'overlay
function openHomeMenu() {
    document.getElementById("right-page").style.transform = "translateX(0)";
    document.getElementById("right-page").style.display = "block";
    document.getElementById("home-overlay").style.display = "block"; // Mostra l'overlay
    document.getElementById("home-page").classList.add("blur"); // Applica la classe di opacità
    document.querySelector(".menu-icon").classList.add("hidden"); // Nascondi l'icona del menu
}

// Funzione per chiudere il menu e rimuovere l'overlay
function closeHomeMenu() {
    document.getElementById("right-page").style.transform = "translateX(100%)";
    document.getElementById("home-overlay").style.display = "none"; // Nascondi l'overlay
    document.getElementById("home-page").classList.remove("blur"); // Rimuovi la classe di opacità
    document.querySelector(".menu-icon").classList.remove("hidden"); // Mostra l'icona del menu
}










function openChatMenu() {
    document.getElementById("chat-page").style.display = "none";
    document.getElementById("settings-page").style.display = "flex";
}


function goBackFromSettings() {
    document.getElementById("settings-page").style.display = "none";
    document.getElementById("chat-page").style.display = "flex";
}





function toggleMenu() {
    const menu = document.getElementById("menu");
    const menuIcon = document.getElementById("menu-icon");

    if (menu.style.transform === "translateX(0%)") {
        menu.style.transform = "translateX(100%)"; // Chiudi il menu
        menuIcon.style.display = "block"; // Rendi visibile l'icona del menu
    } else {
        menu.style.transform = "translateX(0%)"; // Apre il menu
        menuIcon.style.display = "none"; // Nascondi l'icona del menu
    }
}

function closeMenu() {
    const menu = document.getElementById("menu");
    const menuIcon = document.getElementById("menu-icon");
    menu.style.transform = "translateX(100%)"; // Chiudi il menu
    menuIcon.style.display = "block"; // Rendi visibile l'icona del menu
}

// Renderizza le chat salvate al caricamento della pagina
window.onload = function() {
    renderChats(); // Mostra le chat salvate al caricamento
    document.getElementById("search-input").addEventListener("input", renderChats); // Rende reattiva la ricerca
};





let draggedChatIndex = null;

function enableDragAndDrop(contactItem, index) {
    contactItem.setAttribute("draggable", "true");

    // Evento che parte quando inizi a trascinare
    contactItem.addEventListener("dragstart", () => {
        draggedChatIndex = index;
        contactItem.classList.add("dragging");
    });

    // Evento che parte quando finisci di trascinare
    contactItem.addEventListener("dragend", () => {
        draggedChatIndex = null;
        contactItem.classList.remove("dragging");
    });

    // Quando trascini sopra un'altra chat
    contactItem.addEventListener("dragover", (event) => {
        event.preventDefault(); // Abilita il drop
        const contactList = document.getElementById("contact-list");
        const draggingElement = document.querySelector(".dragging");
        const children = Array.from(contactList.children);
        const overIndex = children.indexOf(contactItem); // Posizione su cui stai passando

        // Cambia l'ordine visivo delle chat
        if (draggingElement && draggedChatIndex !== overIndex) {
            const targetElement = overIndex > draggedChatIndex ? contactItem.nextSibling : contactItem;
            contactList.insertBefore(draggingElement, targetElement);
        }
    });

    // Quando lasci cadere l'elemento
    contactItem.addEventListener("drop", () => {
        const contactList = document.getElementById("contact-list");
        const children = Array.from(contactList.children);
        const newIndex = children.indexOf(contactItem);

        // Sposta la chat nell'array
        const [draggedChat] = chats.splice(draggedChatIndex, 1);
        chats.splice(newIndex, 0, draggedChat);

        // Salva e ricarica le chat
        saveChats();
        renderChats();
    });
}
