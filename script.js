/* INIT ---------------------------------------------------------------------------------------------------------------------------- */

// Elementi della pagina
const homePage = document.getElementById("home-page");
const chatPage = document.getElementById("chat-page");
const chatList = document.getElementById("chat-list");
const noteContainer = document.getElementById("note-container");
const addChatButton = document.getElementById("add-chat");
const backButton = document.getElementById("back-button");
const chatTitle = document.getElementById("chat-title");


// Variabile globale per tracciare la chat corrente
let currentChatName = "";

// Configurazione IndexedDB
const dbName = "musicNotesApp";
let db;

const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
  console.log("Errore nell'aprire il database IndexedDB:", event);
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadChats(); // Carica le chat appena il database è pronto
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("chats")) {
    db.createObjectStore("chats", { keyPath: "name" });
  }
};

/* HOME PAGE & CHAT PAGE ---------------------------------------------------------------------------------------------------------- */

// Funzione per far partire l'app dalla home page
document.addEventListener("DOMContentLoaded", () => {
  homePage.style.display = "block";
  chatPage.style.display = "none";
});

// Funzione per aprire una chat
function openChat(name) {
  currentChatName = name; // Aggiorna la chat corrente
  homePage.style.display = "none";
  chatPage.style.display = "block";
  chatTitle.innerText = name;
  noteContainer.innerHTML = ""; // Pulire il contenitore delle note
  loadNotes(); // Caricare le note specifiche per questa chat
}

// Tornare alla homepage
backButton.addEventListener("click", () => {
  currentChatName = ""; // Resetta la chat corrente
  chatPage.style.display = "none";
  homePage.style.display = "block";
});
















// Aggiungere una nuova chat
addChatButton.addEventListener("click", () => {
  const chatName = prompt("Inserisci il nome della chat:");
  if (!chatName) {
    return; // Interrompe l'esecuzione se il nome della chat non è stato inserito
  }

  const artistName = prompt("Di chi è la canzone:");
  if (!artistName) {
    return; // Interrompe l'esecuzione se il nome dell'artista non è stato inserito
  }

  // Creazione dell'elemento chat solo se entrambi i campi sono compilati

  const opt = document.createElement("div");
  opt.classList.add("opt");
  opt.innerHTML = ` 
      <button class="opt" data-title="Nome della Canzone" onclick="apriMenu()"><i class="fa-solid fa-ellipsis"></i></button>
  `;

  // Impedire la propagazione dell'evento di click
  opt.querySelector(".opt").addEventListener("click", (event) => {
    event.stopPropagation(); // Fermiamo l'evento, così non si propagherà
    /*  openHomeMenu(); */
  });

  const foto = document.createElement("div");
  foto.classList.add("foto");
  foto.innerHTML = ` 
<input type="file" id="file-input" class="foto" accept="image/*" onchange="previewImage(event)" />
  `;

  // Impedire la propagazione dell'evento di click
  foto.querySelector(".foto").addEventListener("click", (event) => {
    event.stopPropagation(); // Fermiamo l'evento, così non si propagherà
    /*  openHomeMenu(); */
  });

  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-item");
  chatItem.innerHTML = ` 
  <div style="display: flex; flex-direction: column;">
      <span>${chatName}</span>
      <span>${artistName}</span>
    </div>

  `;

  // Aggiungiamo l'evento per aprire la chat quando viene cliccata
  chatItem.addEventListener("click", () => openChat(chatName));
  chatList.appendChild(chatItem); // Aggiungiamo la chat alla lista delle chat

  // Crea la chat vuota e salva
  const newChat = {
    name: chatName,
    artist: artistName, // Salviamo anche l'artista
    notes: [{ title: "Titolo iniziale", text: "Testo iniziale" }]
  };

  saveChat(newChat);
  openChat(chatName)
    ;
});





















// Aggiungere un nuovo blocco di note
function addNoteBlock(title = "Titolo...", text = "Testo...") {
  const noteBlock = document.createElement("div"); // Creiamo un nuovo blocco di nota
  noteBlock.classList.add("note-block"); // Aggiungiamo la classe per il blocco di nota

  const noteTitle = document.createElement("div"); // Creiamo il titolo della nota
  noteTitle.classList.add("note-title"); // Aggiungiamo la classe per il titolo
  noteTitle.contentEditable = true; // Impostiamo il titolo come modificabile
  noteTitle.textContent = title; // Impostiamo il titolo iniziale

  const noteText = document.createElement("div");
  noteText.classList.add("note-text");
  noteText.contentEditable = true;
  noteText.textContent = text;

  // Crea il pulsante di trascinamento per spostare il blocco
  const dragHandle = document.createElement("div");
  dragHandle.classList.add("drag-handle");
  dragHandle.innerHTML = ` 
<div class="contai"><i class="fa-solid fa-grip-lines"></i></div> 
`;

  // Aggiungiamo il pulsante di trascinamento al blocco
  noteBlock.appendChild(dragHandle);

  // Disabilitiamo il drag nativo del blocco
  noteBlock.setAttribute("draggable", false);

  // Aggiungiamo il supporto touch per il drag handle
  dragHandle.addEventListener("touchstart", (event) => {
    event.preventDefault();

    const touch = event.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const blockRect = noteBlock.getBoundingClientRect();
    const offsetX = startX - blockRect.left;
    const offsetY = startY - blockRect.top;

    // Aggiungiamo uno stile temporaneo al blocco durante il trascinamento
    noteBlock.classList.add("dragging");

    const containerRect = noteContainer.getBoundingClientRect();

    const moveHandler = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const newX = moveTouch.clientX - offsetX;
      const newY = moveTouch.clientY - offsetY;

      // Mantieni il blocco entro i limiti del contenitore
      const boundedX = Math.max(containerRect.left, Math.min(newX, containerRect.right - blockRect.width));
      const boundedY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - blockRect.height));

      // Aggiorna posizione visiva del blocco
      noteBlock.style.left = `${boundedX - containerRect.left}px`;
      noteBlock.style.top = `${boundedY - containerRect.top}px`;

      // Calcola la posizione e inserisce dinamicamente il blocco
      const afterElement = getDragAfterElement(noteContainer, moveTouch.clientY);
      if (afterElement == null) {
        noteContainer.appendChild(noteBlock); // Se nessun elemento trovato, aggiungi alla fine
      } else {
        noteContainer.insertBefore(noteBlock, afterElement); // Inserisci prima del blocco target
      }
    };

    const endHandler = () => {
      // Ripristina stile iniziale
      noteBlock.classList.remove("dragging");
      noteBlock.style.position = "static";
      noteBlock.style.zIndex = "";

      // Rimuovi gli eventi di trascinamento
      document.removeEventListener("touchmove", moveHandler);
      document.removeEventListener("touchend", endHandler);

      // Salva la nuova disposizione (funzione da implementare)
      saveNotes();
    };

    // Aggiungi eventi per movimento e rilascio
    document.addEventListener("touchmove", moveHandler, { passive: false });
    document.addEventListener("touchend", endHandler);
  }, { passive: false });

  // Funzione per trovare l'elemento dopo il quale inserire il blocco
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".note-block:not(.dragging)")];

    console.log(draggableElements); // Debug: vedi gli altri blocchi di note

    let closest = null;
    let closestOffset = Number.POSITIVE_INFINITY;

    draggableElements.forEach((child) => {
      const box = child.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);

      if (offset < 0 && Math.abs(offset) < closestOffset) {
        closestOffset = Math.abs(offset);
        closest = child;
      }
    });

    console.log(closest); // Debug: vedi quale blocco è più vicino
    return closest;
  }

  /* ----------------------------------------------------------------------------------------------------------------------------- */

  const rec = document.createElement("div");
  rec.classList.add("rec");

  rec.innerHTML = `
<div class="contai2"></div>
`;
  noteBlock.appendChild(rec);

  let isRecording = false;
  let isTriangle = false;
  let recorder;
  let audioContext;

  // Gestione eventi per desktop e mobile
  const startEvent = "ontouchstart" in window ? "touchstart" : "click";

  rec.addEventListener(startEvent, () => {
    if (!isTriangle) {
      if (!isRecording) {
        checkMicrophonePermission().then((hasPermission) => {
          if (hasPermission) {
            startRecording();
          } else {
            alert("Devi consentire l'accesso al microfono per registrare.");
          }
        });
      } else {
        stopRecording();
      }
    }
  });

  rec.addEventListener("mousedown", () => {
    if (isTriangle) {
      setTimeout(() => {
        if (rec.matches(":active")) {
          const confirmDelete = confirm("Vuoi cancellare la registrazione?");
          if (confirmDelete) {
            resetButton();
          }
        }
      }, 1000);
    }
  });

  function checkMicrophonePermission() {
    return navigator.permissions.query({ name: "microphone" }).then((permissionStatus) => {
      console.log("Permesso microfono:", permissionStatus.state);
      return permissionStatus.state === "granted" || permissionStatus.state === "prompt";
    }).catch((err) => {
      console.error("Errore durante il controllo dei permessi:", err);
      return false;
    });
  }

  function startRecording() {
    console.log("Tentativo di accesso al microfono...");
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("Accesso al microfono riuscito.");
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const input = audioContext.createMediaStreamSource(stream);

        recorder = new Recorder(input); // Assicurati di avere il file "recorder.js"
        recorder.record();

        isRecording = true;
        console.log("Registrazione avviata.");
      })
      .catch((err) => {
        console.error("Errore nell'accesso al microfono:", err);
        alert(`Errore: ${err.name} - ${err.message}`);
      });
  }

  function stopRecording() {
    if (recorder) {
      recorder.stop();
      isRecording = false;
      isTriangle = true;
      rec.classList.add("triangle");
      rec.textContent = "";

      recorder.exportWAV((blob) => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
        console.log("Registrazione completata e riprodotta.");
      });

      console.log("Registrazione interrotta.");
    }
  }

  function resetButton() {
    isRecording = false;
    isTriangle = false;
    rec.classList.remove("triangle");
    rec.textContent = "rec";
    console.log("Registrazione cancellata.");
  }

  /* ----------------------------------------------------------------------------------------------------------------------------- */

  // Aggiungere il pulsante di cancellazione (X)
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.innerHTML = '<i class="fas fa-times"></i>'; // Icona "X" di Font Awesome
  /*   deleteButton.innerHTML = "&#10006;"; */
  deleteButton.addEventListener("click", () => {
    const allNoteBlocks = document.querySelectorAll(".note-block");

    if (allNoteBlocks.length > 1) {
      if (confirm("Sei sicuro di voler eliminare questo paragrafo?")) {
        noteBlock.remove();
        saveNotes();
      }
    } else {
      if (confirm("Non puoi eliminare l'unica nota. Vuoi svuotarla e ripristinare i placeholder?")) {
        const noteTitle = noteBlock.querySelector(".note-title");
        const noteText = noteBlock.querySelector(".note-text");
        noteTitle.textContent = "Titolo...";
        noteText.textContent = "Testo...";
        saveNotes();
      }
    }
  });

  // Posiziona la X all'estremità destra del titolo
  const titleWrapper = document.createElement("div");
  titleWrapper.classList.add("note-title-wrapper");
  titleWrapper.appendChild(noteTitle);
  titleWrapper.appendChild(deleteButton);

  // Appendi il titolo, X e testo
  noteBlock.appendChild(titleWrapper);
  noteBlock.appendChild(noteText);
  noteContainer.appendChild(noteBlock);
  noteBlock.appendChild(dragHandle);

  // Salvare le modifiche sui cambiamenti
  const saveOnChange = () => saveNotes();
  noteTitle.addEventListener("input", saveOnChange);
  noteText.addEventListener("input", saveOnChange);

  // Funzionalità 1: il titolo può avere solo una riga
  noteTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      noteText.focus(); // Passa al testo
    }
  });

  // Funzionalità 2: gestione di invio multiplo nella nota
  let enterCount = 0;

  noteText.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enterCount++;
      if (enterCount === 3) {
        // Cancella gli ultimi due invii e aggiunge un nuovo blocco
        noteText.textContent = noteText.textContent.replace(/\n{2}$/, "");
        const newNoteBlock = addNoteBlock();
        saveNotes();
        enterCount = 0;

        // Passa al titolo del nuovo blocco
        newNoteBlock.querySelector(".note-title").focus();
      } else {
        document.execCommand("insertLineBreak");
      }
    } else {
      enterCount = 0;
    }
  });

  // Gestire il placeholder per noteTitle
  noteTitle.addEventListener("focus", () => {
    if (noteTitle.textContent === "Titolo...") {
      noteTitle.textContent = "";
    }
  });

  // Gestire il placeholder per noteText
  noteText.addEventListener("focus", () => {
    if (noteText.textContent === "Testo...") {
      noteText.textContent = "";
    }
  });

  noteText.addEventListener("blur", () => {
    if (noteText.textContent.trim() === "") {
      noteText.textContent = "Testo...";
    }
  });

  // Gestione del placeholder per il paragrafo di default
  if (noteTitle.textContent === "Titolo iniziale") {
    noteTitle.addEventListener("focus", () => {
      if (noteTitle.textContent === "Titolo iniziale") {
        noteTitle.textContent = "";
      }
    });
    noteTitle.addEventListener("blur", () => {
      if (noteTitle.textContent.trim() === "") {
        noteTitle.textContent = "Titolo iniziale";
      }
    });
  }

  if (noteText.textContent === "Testo iniziale") {
    noteText.addEventListener("focus", () => {
      if (noteText.textContent === "Testo iniziale") {
        noteText.textContent = "";
      }
    });
    noteText.addEventListener("blur", () => {
      if (noteText.textContent.trim() === "") {
        noteText.textContent = "Testo iniziale";
      }
    });
  }

  // Funzionalità per modificare la nota con un solo click
  noteTitle.addEventListener("click", () => {
    noteTitle.contentEditable = true; // Permette di modificare il titolo
    noteTitle.focus();
  });

  noteText.addEventListener("click", () => {
    noteText.contentEditable = true; // Permette di modificare il testo
    noteText.focus();
  });

  return noteBlock;
}

// Caricare le note della chat corrente
function loadNotes() {
  const transaction = db.transaction(["chats"], "readonly");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.get(currentChatName);

  request.onsuccess = function (event) {
    const chatData = event.target.result;

    if (chatData) {
      chatData.notes.forEach(note => addNoteBlock(note.title, note.text));
    } else {
      addNoteBlock("Titolo iniziale", "Testo iniziale");
      saveNotes();
    }
  };

  request.onerror = function (event) {
    console.log("Errore nel caricamento delle note:", event);
  };
}






/* -------------------------------------------------------------------------------------------------------------------------------- carica le chat nella lista */

function loadChats() {


  const transaction = db.transaction(["chats"], "readonly");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.getAll();

  request.onsuccess = function (event) {
    const chats = event.target.result;

    chatList.innerHTML = ""; // Pulisci la lista esistente

    chats.forEach(chat => {
      const opt = document.createElement("div");
      opt.classList.add("opt");
      opt.innerHTML = ` 
      <button class="opt" data-title="Nome della Canzone" onclick="apriMenu()"><i class="fa-solid fa-ellipsis"></i></button>
      `;

      // Impedire la propagazione dell'evento di click
      opt.querySelector(".opt").addEventListener("click", (event) => {
        event.stopPropagation(); // Fermiamo l'evento, così non si propagherà
        /* openHomeMenu(); */
      });

      const foto = document.createElement("div");
      foto.classList.add("foto");
      foto.innerHTML = ` 
<input type="file" id="file-input" class="foto" accept="image/*" onchange="previewImage(event)" />
      `;

      // Impedire la propagazione dell'evento di click
      foto.querySelector(".foto").addEventListener("click", (event) => {
        event.stopPropagation(); // Fermiamo l'evento, così non si propagherà
        /* openHomeMenu(); */
      });

      const chatItem = document.createElement("div");
      chatItem.classList.add("chat-item");

      // Aggiungi l'HTML con il quadrato e i dettagli
      chatItem.innerHTML = `


        <div style="display: flex; flex-direction: column; left: 85px; position: absolute;">
          <span>${chat.name}</span>
          <div class="artist-name">${chat.artist}</div> <!-- Mostra l'artista -->
        </div>
      `;


      // Associa il file input all'elemento chatItem
      chatItem.appendChild(opt);
      chatItem.appendChild(foto);
      chatItem.addEventListener("click", () => openChat(chat.name));
      chatList.appendChild(chatItem);
    });
  };

  request.onerror = function (event) {
    console.log("Errore nel caricamento delle chat:", event);
  };
}





















// Funzione per salvare una chat nel database
function saveChat(chat) {
  const transaction = db.transaction(["chats"], "readwrite");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.put(chat);

  request.onsuccess = function () {
    console.log("Chat salvata con successo");
  };

  request.onerror = function (event) {
    console.log("Errore nel salvataggio della chat:", event);
  };
}

// Funzione per salvare le note della chat corrente
function saveNotes() {
  const notes = [];
  const noteBlocks = noteContainer.getElementsByClassName("note-block");

  Array.from(noteBlocks).forEach(block => {
    const noteTitle = block.querySelector(".note-title").textContent.trim();
    const noteText = block.querySelector(".note-text").textContent.trim();

    if (noteTitle || noteText) {
      notes.push({ title: noteTitle, text: noteText });
    }
  });

  // Aggiornare le note nella chat corrente
  const transaction = db.transaction(["chats"], "readwrite");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.get(currentChatName);

  request.onsuccess = function (event) {
    const chatData = event.target.result;
    chatData.notes = notes;
    objectStore.put(chatData);
  };

  request.onerror = function (event) {
    console.log("Errore nel salvataggio delle note:", event);
  };
}

/* ------------------------------------------------------------------------------------------------------------------------- */


function apriMenu(titoloCanzone) {
  document.getElementById("songTitle").innerText = titoloCanzone; // Imposta il titolo della canzone
  document.getElementById("songMenu").classList.add("show"); // Mostra il menu
  document.getElementById("home-overlay").style.display = "block"; // Mostra l'overlay
  document.getElementById("home-page").classList.add("blur"); // Applica la classe di opacità
}

function chiudiMenu() {
  document.getElementById("songMenu").classList.remove("show"); // Nasconde il menu
  document.getElementById("home-overlay").style.display = "none"; // Nascondi l'overlay
  document.getElementById("home-page").classList.remove("blur"); // Rimuovi la classe di opacità
}

// Funzioni di esempio per i pulsanti
function azione1() {
  alert("Azione 1 eseguita!");
}

function azione2() {
  alert("Azione 2 eseguita!");
}

// Aggiungere event listener ai 3 puntini di ogni chat
document.querySelectorAll(".menu-button").forEach(button => {
  button.addEventListener("click", function () {
    const titolo = this.getAttribute("data-title"); // Recupera il titolo della canzone
    apriMenu(titolo);
  });
});

// Chiude il menu se si clicca fuori dal contenuto del menu
document.addEventListener("click", function (event) {
  const menu = document.getElementById("songMenu");
  const menuContent = document.querySelector(".menuSotto-content");

  // Se il menu è aperto e il click non è dentro il menu-content, chiudi il menu
  if (menu.classList.contains("show") && !menuContent.contains(event.target)) {
    chiudiMenu();
  }
});



function openFileSelector() {
  // Apre il selettore di file
  document.getElementById('file-input').click();
}

document.getElementById('file-input').addEventListener('change', function (event) {
  const file = event.target.files[0]; // Prende il file selezionato
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Imposta l'immagine all'interno del quadrato
      const imgElement = document.getElementById('image');
      imgElement.src = e.target.result;
    }

    reader.readAsDataURL(file); // Legge il file come URL
  }
});

function previewImage(event) {
  const file = event.target.files[0]; // Prende il file selezionato
  const input = event.target;
  
  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      // Imposta l'immagine selezionata come sfondo dell'input
      input.style.backgroundImage = `url(${e.target.result})`;
      input.style.backgroundColor = 'transparent'; // Rimuove il colore di sfondo predefinito
    }

    reader.readAsDataURL(file); // Legge il file come URL
  }
}
