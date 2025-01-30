// Elemento della barra di ricerca
const searchBar = document.querySelector(".search-bar1");

// Funzione per cercare chat
searchBar.addEventListener("input", () => {
  const searchQuery = searchBar.value.toLowerCase();
  const chatItems = chatList.getElementsByClassName("chat-item");

  Array.from(chatItems).forEach(item => {
    const chatName = item.querySelector("span").textContent.toLowerCase();
    const artistName = item.querySelector(".artist-name") ? item.querySelector(".artist-name").textContent.toLowerCase() : "";
    if (chatName.includes(searchQuery) || artistName.includes(searchQuery)) {
      item.style.display = ""; // Mostra l'elemento
    } else {
      item.style.display = "none"; // Nascondi l'elemento
    }
  });
});