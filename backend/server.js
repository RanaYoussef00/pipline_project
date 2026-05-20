const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
 
const app = express();
app.use(cors());
app.use(express.json());
 
// ── Connect to MongoDB ──────────────────────────────────────────────────────
mongoose.connect("mongodb://127.0.0.1:27017/todoDB")
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
 
// ── Todo Schema ─────────────────────────────────────────────────────────────
const todoSchema = new mongoose.Schema({
  text:      { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
 
const Todo = mongoose.model('Todo', todoSchema);
 
// ── Routes ───────────────────────────────────────────────────────────────────
 
// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// POST create todo
app.post('/api/todos', async (req, res) => {
  try {
    const todo = new Todo({ text: req.body.text });
    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// PATCH toggle completed
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    todo.completed = !todo.completed;
    const updated = await todo.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));