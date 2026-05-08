import { useState } from "react";
import axios from "axios";
import "./Login.css";
import Cookies from "js-cookie";

axios.defaults.withCredentials = true;

function Login({ setIsUserInsideApp, setShowLoginPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const res = await axios.post("http://localhost:5000/login", { email, password });
      Cookies.set("userEmail", email, { expires: 7 });
      Cookies.set("userName", res.data.name, { expires: 7 });
      setIsUserInsideApp(true);
    } catch (err) {
      Cookies.remove("token");
      setError(err.response?.data?.message || "Login failed. Please try again.");
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <span onClick={() => setShowLoginPage(false)}>Create one</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
