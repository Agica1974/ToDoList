// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

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

// --- DOM Elemente ---
const todoList = document.getElementById("todoList");
const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");

// --- To-Do laden ---
function loadTodos() {
  const todosRef = ref(db, 'todos');
  onValue(todosRef, snapshot => {
    console.log("Firebase Snapshot:", snapshot.val()); // Debug
    todoList.innerHTML = "";
    if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
        const todo = childSnapshot.val();
        const li = createTodoElement(todo.text, childSnapshot.key, todo.done);
        todoList.appendChild(li);
      });
    }
  });
}

// --- To-Do Element erstellen ---
function createTodoElement(text, key, done = false) {
  const li = document.createElement("li");
  li.textContent = text;
  if (done) li.classList.add("done");

  // Klick = erledigt / nicht erledigt
  li.addEventListener("click", () => {
    li.classList.toggle("done");
    const todoRef = ref(db, 'todos/' + key);
    update(todoRef, { done: li.classList.contains("done") });
  });

  // Löschen
  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete";
  delBtn.addEventListener("click", e => {
    e.stopPropagation(); // verhindert Toggle "done"
    remove(ref(db, 'todos/' + key));
  });

  li.appendChild(delBtn);
  return li;
}

// --- To-Do hinzufügen ---
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  console.log("Neue Aufgabe:", text); // Debug
  const newTodoRef = push(ref(db, 'todos'));
  set(newTodoRef, { text: text, done: false });

  input.value = "";
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});


// --- Event Listener ---
addBtn.addEventListener("click", addTodo);

// --- Beim Start laden ---
loadTodos();
