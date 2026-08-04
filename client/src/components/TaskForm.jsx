import { useState } from "react";
import axios from "axios";
import "./Taskform.css";

axios.defaults.withCredentials = true;

function TaskForm({ fetchTasks, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      window.alert("Please enter a task title");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        status,
      });
      fetchTasks();
      onClose();
    } catch (error) {
      window.alert(error.response?.data?.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">Create New Task</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Task Title <span className="required">*</span></label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter task title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              className="modal-input modal-textarea"
              placeholder="Add a description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <select className="modal-input modal-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Due Date</label>
              <input type="date" className="modal-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              {loading ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
