import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import ServiceReportPage from "./pages/ServiceReportPage";
import CustomersPage from "./pages/CustomersPage";
import MachinesPage from "./pages/MachinesPage";
import ServiceEntryPage from "./pages/ServiceEntryPage";
import ReminderPage from "./pages/ReminderPage";
import ServiceRecordsPage from "./pages/ServiceRecordsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import "./App.css";

function AppLayout({ onLogout }) {
  return (
    <div className="app">
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand-title">WEIGH LANKA</div>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/service-records"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">📋</span>
              <span>Service Log</span>
            </NavLink>

            <NavLink
              to="/reminders"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">🔔</span>
              <span>Reminders</span>
            </NavLink>

            <NavLink
              to="/service-entry"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">➕</span>
              <span>Add Service</span>
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">📊</span>
              <span>Reports</span>
            </NavLink>

            <div className="nav-section-label">Master Data</div>

            <NavLink
              to="/customers"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">👥</span>
              <span>Customers</span>
            </NavLink>

            <NavLink
              to="/machines"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon">⚙️</span>
              <span>Machines</span>
            </NavLink>
          </nav>

          {/* Logout at bottom */}
          <div className="logout-container">
            <button className="logout-btn" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="main-area">
          <main className="app-main">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/service-entry" element={<ServiceEntryPage />} />
              <Route path="/report" element={<ServiceReportPage />} />
              <Route path="/reminders" element={<ReminderPage />} />
              <Route path="/service-records" element={<ServiceRecordsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/machines" element={<MachinesPage />} />
              {/* default fallback */}
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("adminToken")
  );

  const handleLoginSuccess = (token) => {
    localStorage.setItem("adminToken", token || "WEIGHLANKA_ADMIN_TOKEN");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <AppLayout onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route
            path="/login"
            element={<AdminLoginPage onLogin={handleLoginSuccess} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
