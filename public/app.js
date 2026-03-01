const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const notesInput = document.getElementById("task-notes");

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
    <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
      <input type="checkbox" ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id}, this.checked)" aria-label="Mark complete">
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ""}
      </div>
      <button class="task-delete" onclick="deleteTask(${task.id})" aria-label="Delete task">&times;</button>
    </li>
  `
    )
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  const notes = notesInput.value.trim();

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, notes }),
  });

  titleInput.value = "";
  notesInput.value = "";
  titleInput.focus();
  fetchTasks();
});

async function toggleTask(id, completed) {
  await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

fetchTasks();
