// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:9090/api";

function ForgotPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/admin/reset-password`, {
        password: newPassword,
      });

      setMessage("Password updated successfully.");
      setNewPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1300);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      
      {/* LEFT SIDE (same layout as login page) */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-circle">WL</div>
          <div>
            <div className="login-brand-title">Weigh Lanka</div>
            <div className="login-brand-sub">Service Management System</div>
          </div>
        </div>

        <h1 className="login-hero-title">
          Reset <span>Password</span>
        </h1>
        <p className="login-hero-text">
          Choose a strong new password to keep your admin account secure.
        </p>

        <ul className="login-bullets">
          <li>🔐 Secure encryption with bcrypt</li>
          <li>💾 Saved safely in database</li>
          <li>🔄 Can be changed anytime</li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Reset Password</h2>
          <p className="login-subtitle">Enter your new admin password.</p>

          <form onSubmit={handleSubmit} className="login-form-modern">

            {/* Password field with icon */}
            <div className="login-field-modern">
              <label>New Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <button className="login-btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>

            {message && <p className="login-error">{message}</p>}

            <button
              type="button"
              className="login-link-btn"
              style={{ marginTop: "10px" }}
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </button>
          </form>

          <p className="login-footer-small">
            © {new Date().getFullYear()} Weigh Lanka Services
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
