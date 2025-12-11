// src/pages/AdminLoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:9090/api";

function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, form);
      const token = res.data.token;
      if (onLogin) onLogin(token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-circle">WL</div>
          <div>
            <div className="login-brand-title">Weigh Lanka</div>
            <div className="login-brand-sub">Service Management System</div>
          </div>
        </div>

        <h1 className="login-hero-title">
          Welcome back, <span>Admin</span>
        </h1>
        <p className="login-hero-text">
          Sign in to manage customers, machines, service records and daily
          reports in one place.
        </p>

        <ul className="login-bullets">
          <li>📊 Daily service reports</li>
          <li>🔔 Automatic service reminders</li>
          <li>👥 Customer & machine master data</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">
            Use your admin credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="login-form-modern">
            <div className="login-field-modern">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div className="login-field-modern">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="login-row-between">
              <span className="login-hint">Default: admin / 1234</span>
              <button
                type="button"
                className="login-link-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              className="login-btn-primary"
              disabled={loading}
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {message && <p className="login-error">{message}</p>}
          </form>

          <p className="login-footer-small">
            © {new Date().getFullYear()} Weigh Lanka Services
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
