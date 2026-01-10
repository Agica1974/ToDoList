// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


// --- Firebase Konfiguration ---
const firebaseConfig = {
  apiKey: "AIzaSyAhhWqBTZXZQLXE9pnD3rY-9r0R99Ar_YQ",
  authDomain: "todolist-b568b.firebaseapp.com",
  databaseURL: "https://todolist-b568b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todolist-b568b",
  storageBucket: "todolist-b568b.firebasestorage.app",
  messagingSenderId: "746567927906",
  appId: "1:746567927906:web:63e3a755eae1de350fa93b"
};

// --- Firebase initialisieren ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Firebase Auth initialisieren (hier einfügen!) ---
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");

loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});


let currentUserId = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUserId = user.uid;
    userInfo.textContent = `Angemeldet als: ${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";

    loadTodos(); // 🔥 jetzt erst laden
  } else {
    currentUserId = null;
    userInfo.textContent = "";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    todoList.innerHTML = "";
  }
});


// --- DOM Elemente ---
const todoList = document.getElementById("todoList");
const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");

// --- To-Do laden ---
function loadTodos() {
  if (!currentUserId) return;

  const todosRef = ref(db, `todos/${currentUserId}`);
  onValue(todosRef, snapshot => {
    todoList.innerHTML = "";
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const todo = child.val();
        const li = createTodoElement(todo.text, child.key, todo.done);
        todoList.appendChild(li);
      });
    }
  });
}


// --- To-Do Element erstellen ---

function createTodoElement(text, key, done = false) {
  const li = document.createElement("li");
  li.textContent = text;

  // Status übernehmen
  if (done) li.classList.add("done");

  // Klick = erledigt / nicht erledigt
  li.addEventListener("click", () => {
    li.classList.toggle("done");

    // 🔹 Prüfe, dass currentUserId gesetzt ist
    if (!currentUserId) {
      console.error("Kein eingeloggter User – Status wird nicht gespeichert");
      return;
    }

    // 🔹 Pfad zum To-Do
    const todoRef = ref(db, `todos/${currentUserId}/${key}`);

    // 🔹 Status in DB speichern
    update(todoRef, { done: li.classList.contains("done") })
      .then(() => console.log(`To-Do "${text}" Status aktualisiert`))
      .catch(err => console.error("Fehler beim Aktualisieren des Status:", err));
  });

  // Löschen
  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete";
  delBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (!currentUserId) return;
    remove(ref(db, `todos/${currentUserId}/${key}`));
  });

  li.appendChild(delBtn);
  return li;

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.className = "edit";
  editBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  const input = document.createElement("input");
  input.type = "text";
  input.value = text;
  input.className = "edit-input";

  li.firstChild.replaceWith(input);
  input.focus();

  const saveEdit = () => {
    const newText = input.value.trim();
    if (!newText) return;

    update(ref(db, `todos/${currentUserId}/${key}`), {
      text: newText
    });
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  });

  input.addEventListener("blur", saveEdit);
  });

  li.appendChild(editBtn);



}



// --- To-Do hinzufügen ---

function addTodo() {
  if (!currentUserId) return;

  const text = input.value.trim();
  if (!text) return;

  const newTodoRef = push(ref(db, `todos/${currentUserId}`));
  set(newTodoRef, { text, done: false }) // 🔹 Status standardmäßig false
    .then(() => console.log(`Neues To-Do "${text}" gespeichert`))
    .catch(err => console.error("Fehler beim Speichern:", err));

  input.value = "";
}



// --- Event Listener ---
addBtn.addEventListener("click", addTodo);

// --- Beim Start laden ---
loadTodos();
