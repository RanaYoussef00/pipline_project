import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTodos(); }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setTodos(data);
    } catch {
      setError("تعذّر الاتصال بالسيرفر. تأكد أن الـ backend شغّال.");
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setInput("");
    } catch {
      setError("فشل إضافة المهمة.");
    }
  }

  async function toggleTodo(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: "PATCH" });
      const updated = await res.json();
      setTodos(todos.map(t => t._id === id ? updated : t));
    } catch {
      setError("فشل تحديث المهمة.");
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setTodos(todos.filter(t => t._id !== id));
    } catch {
      setError("فشل حذف المهمة.");
    }
  }

  const filtered = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.completed : !t.completed
  );

  const doneCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>قائمة المهام</h1>
            <p style={styles.subtitle}>
              {doneCount} من {totalCount} مكتملة
            </p>
          </div>
          <div style={styles.progressRing}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#f0f0f0" strokeWidth="5" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke="#6C63FF" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease", transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <span style={styles.progressText}>{progress}%</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
            <button onClick={() => setError(null)} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={addTodo} style={styles.form}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="أضف مهمة جديدة..."
            style={styles.input}
            dir="auto"
          />
          <button type="submit" style={styles.addBtn} disabled={!input.trim()}>
            +
          </button>
        </form>

        {/* Filter tabs */}
        <div style={styles.tabs}>
          {[["all", "الكل"], ["pending", "قيد التنفيذ"], ["done", "مكتملة"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{ ...styles.tab, ...(filter === val ? styles.tabActive : {}) }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={styles.list}>
          {loading ? (
            <div style={styles.emptyState}>⏳ جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {filter === "done" ? "لا توجد مهام مكتملة بعد 🎯" :
               filter === "pending" ? "رائع! كل المهام مكتملة ✅" :
               "لا توجد مهام. أضف مهمة جديدة! 📝"}
            </div>
          ) : (
            filtered.map(todo => (
              <div key={todo._id} style={{ ...styles.todoItem, ...(todo.completed ? styles.todoItemDone : {}) }}>
                <button
                  onClick={() => toggleTodo(todo._id)}
                  style={{ ...styles.checkbox, ...(todo.completed ? styles.checkboxDone : {}) }}
                  aria-label="تبديل الحالة"
                >
                  {todo.completed && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                </button>
                <span style={{ ...styles.todoText, ...(todo.completed ? styles.todoTextDone : {}) }} dir="auto">
                  {todo.text}
                </span>
                <span style={styles.date}>
                  {new Date(todo.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  style={styles.deleteBtn}
                  aria-label="حذف"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && doneCount > 0 && (
          <button
            onClick={async () => {
              const doneTodos = todos.filter(t => t.completed);
              await Promise.all(doneTodos.map(t => fetch(`${API}/${t._id}`, { method: "DELETE" })));
              setTodos(todos.filter(t => !t.completed));
            }}
            style={styles.clearBtn}
          >
            حذف المكتملة ({doneCount})
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', 'Cairo', sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    direction: "rtl",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    margin: "4px 0 0",
  },
  progressRing: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    position: "absolute",
    fontSize: 11,
    fontWeight: 700,
    color: "#6C63FF",
  },
  errorBox: {
    background: "#fff3f3",
    border: "1px solid #ffcccc",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#cc0000",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#cc0000",
    fontWeight: 700,
  },
  form: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1.5px solid #e0e0e0",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
    color: "#333",
    fontFamily: "'Cairo', sans-serif",
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#6C63FF",
    color: "#fff",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    borderRadius: 10,
    border: "1.5px solid #e0e0e0",
    background: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#777",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#6C63FF",
    border: "1.5px solid #6C63FF",
    color: "#fff",
    fontWeight: 600,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 80,
  },
  emptyState: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    padding: "32px 0",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #f0f0f0",
    background: "#fafafa",
    transition: "all 0.2s",
  },
  todoItemDone: {
    background: "#f6f4ff",
    border: "1.5px solid #e8e4ff",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    border: "2px solid #d0d0d0",
    background: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  checkboxDone: {
    background: "#6C63FF",
    border: "2px solid #6C63FF",
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 1.4,
  },
  todoTextDone: {
    textDecoration: "line-through",
    color: "#aaa",
  },
  date: {
    fontSize: 11,
    color: "#bbb",
    flexShrink: 0,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ddd",
    cursor: "pointer",
    fontSize: 13,
    padding: 4,
    borderRadius: 6,
    transition: "color 0.2s",
    flexShrink: 0,
  },
  clearBtn: {
    width: "100%",
    marginTop: 16,
    padding: "10px 0",
    borderRadius: 12,
    border: "1.5px solid #ffcccc",
    background: "none",
    color: "#cc4444",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Cairo', sans-serif",
    transition: "background 0.2s",
  },
};
