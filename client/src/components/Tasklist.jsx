import { useState } from "react";
import axios from "axios";
import "./Tasklist.css";

axios.defaults.withCredentials = true;

function TaskList({ tasks, fetchTasks, onOpenCreate }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");
  const [editDueDate, setEditDueDate] = useState("");

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      window.alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
  };

  const updateTask = async () => {
    if (!editTitle.trim()) {
      window.alert("Task title cannot be empty");
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${editingId}`, {
        title: editTitle.trim(),
        description: editDescription,
        status: editStatus,
        dueDate: editDueDate || null,
      });
      setEditingId(null);
      fetchTasks();
    } catch (error) {
      window.alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const markAsCompleted = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/tasks/${id}/complete`);
      fetchTasks();
    } catch (error) {
      window.alert(error.response?.data?.message || "Failed to complete task");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":   return "badge-completed";
      case "In Progress": return "badge-progress";
      case "Pending":     return "badge-pending";
      default:            return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  // Due dates are stored at midnight, so comparing them directly against `now`
  // marked tasks due *today* as overdue. Compare against the end of the day.
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "Completed") return false;
    const endOfDueDay = new Date(dueDate);
    endOfDueDay.setHours(23, 59, 59, 999);
    return endOfDueDay < new Date();
  };

  return (
    <div className="tasklist-wrapper">
      <div className="tasklist-heading">
        <div>
          <h1 className="tasklist-title">All Tasks</h1>
          <p className="tasklist-subtitle">
            Manage and monitor your intelligent workflow progress.
          </p>
        </div>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`task-card ${task.status === "Completed" ? "task-card--completed" : ""}`}
          >
            {editingId === task._id ? (
              <div className="card-edit">
                <input
                  className="card-edit-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <input
                  className="card-edit-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                <div className="card-edit-row">
                  <select
                    className="card-edit-input card-edit-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <input
                    type="date"
                    className="card-edit-input"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>
                <div className="card-edit-actions">
                  <button className="card-btn card-btn--save" onClick={updateTask}>Save</button>
                  <button className="card-btn card-btn--cancel" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="card-top">
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <h3 className={`card-title ${task.status === "Completed" ? "card-title--done" : ""}`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className="card-description">{task.description}</p>
                )}

                {task.dueDate && (
                  <div className={`card-due ${isOverdue(task.dueDate, task.status) ? "card-due--overdue" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(task.dueDate)}
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="overdue-tag">Overdue</span>
                    )}
                  </div>
                )}

                <div className="card-actions">
                  <button className="card-btn card-btn--edit" onClick={() => startEdit(task)}>Edit</button>
                  <button className="card-btn card-btn--delete" onClick={() => deleteTask(task._id)}>Delete</button>
                  {task.status !== "Completed" && (
                    <button className="card-btn card-btn--complete" onClick={() => markAsCompleted(task._id)}>
                      ✓ Complete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Create new task card - always last */}
        <button className="task-card task-card--create" onClick={onOpenCreate}>
          <div className="create-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="create-card-label">CREATE NEW TASK</span>
        </button>
      </div>

      {/* Empty state below grid when no tasks */}
      {tasks.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p>No tasks yet. Create your first task!</p>
        </div>
      )}
    </div>
  );
}

export default TaskList;
