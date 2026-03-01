const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "tasks.db");

// Ensure data directory exists
const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Initialize database
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// List all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
  res.json(tasks);
});

// Create task
app.post("/api/tasks", (req, res) => {
  const { title, notes } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  const result = db.prepare("INSERT INTO tasks (title, notes) VALUES (?, ?)").run(
    title.trim(),
    (notes || "").trim()
  );
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(task);
});

// Update task
app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const fields = [];
  const values = [];

  if (req.body.title !== undefined) {
    if (!req.body.title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    fields.push("title = ?");
    values.push(req.body.title.trim());
  }
  if (req.body.notes !== undefined) {
    fields.push("notes = ?");
    values.push(req.body.notes.trim());
  }
  if (req.body.completed !== undefined) {
    fields.push("completed = ?");
    values.push(req.body.completed ? 1 : 0);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.json(updated);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Tasks app running on http://localhost:${PORT}`);
});
