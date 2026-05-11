import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/Tasklist.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { useState, useEffect } from "react";
import "./App.css";
import AIChatBox from "./components/AIChatBox";
import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.withCredentials = true;

function App() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [isUserInsideApp, setIsUserInsideApp] = useState(!!Cookies.get("token"));
  const [showLoginPage, setShowLoginPage] = useState(true);
  const [activePage, setActivePage] = useState("ai");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // persists across tab switches

  const userEmail = Cookies.get("userEmail") || "";
  const userName = Cookies.get("userName") || userEmail.split("@")[0] || "User";
  const userInitial = userName ? userName[0].toUpperCase() : "U";

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status !== "all") params.append("status", filters.status);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks?${params.toString()}`);
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        Cookies.remove("token");
        setIsUserInsideApp(false);
      }
    }
  };

  useEffect(() => {
    if (isUserInsideApp) fetchTasks();
  }, [isUserInsideApp]);

  useEffect(() => {
    if (isUserInsideApp) fetchTasks();
  }, [filters]);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/logout`);
    } catch (_) {}
    Cookies.remove("token");
    Cookies.remove("userEmail");
    Cookies.remove("userName");
    setChatMessages([]); // clear chat on logout
    setIsUserInsideApp(false);
  };

  // Auth screens
  if (!isUserInsideApp) {
    if (showLoginPage) {
      return <Login setIsUserInsideApp={setIsUserInsideApp} setShowLoginPage={setShowLoginPage} />;
    }
    return <Register setShowLoginPage={setShowLoginPage} />;
  }

  return (
    <div className="app-shell">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="brand-name">TaskAI</span>
            <span className="brand-sub">Intelligent Workflow</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === "ai" ? "active" : ""}`}
            onClick={() => { setActivePage("ai"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round" />
              <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
            </svg>
            AI Assistant
          </button>

          <button
            className={`nav-item ${activePage === "tasks" ? "active" : ""}`}
            onClick={() => { setActivePage("tasks"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            All Tasks
          </button>
        </nav>
      </aside>

      {/* Main area */}
      <div className="main-area">
        {/* Header */}
        <header className="app-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks, priorities, or AI tags..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="header-actions">
            {/* <button className="header-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button> */}

            {/* <button className="header-icon-btn" aria-label="History">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="12 8 12 12 14 14" />
                <path d="M3.05 11a9 9 0 1 0 .5-4" />
                <polyline points="3 3 3 7 7 7" />
              </svg>
            </button> */}

            <div className="header-divider" />

            <div className="header-user">
              <div className="header-user-info">
                <span className="header-user-name">{userName}</span>
                <span className="header-user-role">Member</span>
              </div>
              <div className="header-avatar">{userInitial}</div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {activePage === "tasks" && (
            <>
              <TaskFilters filters={filters} setFilters={setFilters} />
              <TaskList
                tasks={tasks}
                fetchTasks={fetchTasks}
                onOpenCreate={() => setShowTaskForm(true)}
              />
            </>
          )}

          {activePage === "ai" && (
            <AIChatBox
              tasks={tasks}
              fetchTasks={fetchTasks}
              userEmail={userEmail}
              userName={userName}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
            />
          )}
        </main>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          fetchTasks={fetchTasks}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {/* Floating + button */}
      {activePage === "tasks" && (
        <button className="fab" onClick={() => setShowTaskForm(true)} aria-label="Create new task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
