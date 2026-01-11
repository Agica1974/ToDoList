// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } 
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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- DOM Elemente ---
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const todoList = document.getElementById("todoList");
const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");

let currentUserId = null;

// --- Login Button ---
loginBtn.addEventListener("click", async () => {
  try {
    // Versuch mit Popup
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.warn("Popup blockiert oder Fehler, versuche Redirect...", err);
    // Fallback auf Redirect
    signInWithRedirect(auth, provider);
  }
});

// --- Logout Button ---
logoutBtn.addEventListener("click", () => signOut(auth));

// --- Auth State Listener ---
onAuthStateChanged(auth, (user) => {
  todoList.innerHTML = "";

  if (user) {
    currentUserId = user.uid;
    userInfo.textContent = `Angemeldet als: ${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";

    // Listener für To-Dos
    const todoRef = ref(db, `todos/${currentUserId}`);
    onValue(todoRef, snapshot => {
      todoList.innerHTML = "";
      snapshot.forEach(childSnap => {
        const todo = childSnap.val();
        todoList.appendChild(createTodoElement(todo.text, childSnap.key, todo.done));
      });
    });

  } else {
    currentUserId = null;
    userInfo.textContent = "";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
});

// --- Check Redirect Result (wichtig nach signInWithRedirect) ---
getRedirectResult(auth).catch(err => console.warn("Redirect Result Fehler:", err));

// --- To-Do Element erstellen ---
function createTodoElement(text, key, done = false) {
  const li = document.createElement("li");
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  textSpan.className = "todo-text";
  if (done) li.classList.add("done");

  // Toggle erledigt
  li.addEventListener("click", () => {
    li.classList.toggle("done");
    if (!currentUserId) return;
    update(ref(db, `todos/${currentUserId}/${key}`), { done: li.classList.contains("done") });
  });

  // Buttons
  const actions = document.createElement("div");
  actions.className = "actions";

  // Edit
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.className = "edit";
  editBtn.addEventListener("click", e => {
    e.stopPropagation();
    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.value = textSpan.textContent;
    inputEdit.className = "edit-input";
    li.replaceChild(inputEdit, textSpan);
    inputEdit.focus();
    const saveEdit = () => {
      const newText = inputEdit.value.trim();
      if (!newText) return;
      update(ref(db, `todos/${currentUserId}/${key}`), { text: newText });
      textSpan.textContent = newText;
      li.replaceChild(textSpan, inputEdit);
    };
    inputEdit.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); saveEdit(); } });
    inputEdit.addEventListener("blur", saveEdit);
  });

  // Delete
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.className = "delete";
  delBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (!currentUserId) return;
    remove(ref(db, `todos/${currentUserId}/${key}`));
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  li.appendChild(textSpan);
  li.appendChild(actions);

  return li;
}


// --- Neues To-Do hinzufügen ---
function addTodo() {
  if (!currentUserId) return;
  const text = input.value.trim();
  if (!text) return;

  const newTodoRef = push(ref(db, `todos/${currentUserId}`));
  set(newTodoRef, { text, done: false }).catch(err => console.error(err));

  input.value = "";
}

// --- Event Listener ---
addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });

delBtn.addEventListener("click", e => {
  e.stopPropagation();
  li.style.animation = "fadeOut 0.5s forwards";
  setTimeout(() => {
    remove(ref(db, `todos/${currentUserId}/${key}`));
  }, 500);
});

