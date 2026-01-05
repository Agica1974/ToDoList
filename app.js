 function addTodo() {
        const input = document.getElementById("todoInput");
        const text = input.value.trim();

        if (text === "") return;

        const li = document.createElement("li");
        li.textContent = text;

        li.addEventListener("click", () => {
            li.classList.toggle("done");
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.className = "delete";
        delBtn.onclick = () => li.remove();

        li.appendChild(delBtn);
        document.getElementById("todoList").appendChild(li);

        input.value = "";
    }