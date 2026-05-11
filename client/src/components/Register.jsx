import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Register({ setShowLoginPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
  name,
  email,
  password
});
      alert("Account created! Please sign in.");
      setShowLoginPage(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <div className="auth-logo-text">
            <span className="auth-brand">TaskAI</span>
            <span className="auth-brand-sub">INTELLIGENT WORKFLOW</span>
          </div>
        </div>

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Start managing your tasks intelligently</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoComplete="new-password"
            />
          </div>

          <button className="auth-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => setShowLoginPage(true)}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
