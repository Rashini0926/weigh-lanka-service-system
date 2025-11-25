import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <h2>Weigh Lanka</h2>

      <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">Dashboard</Link>
      <Link className={isActive("/customers") ? "active" : ""} to="/customers">Customers</Link>
      <Link className={isActive("/machines") ? "active" : ""} to="/machines">Machines</Link>
      <Link className={isActive("/service-records") ? "active" : ""} to="/service-records">Service Logs</Link>
      <Link className={isActive("/reminders") ? "active" : ""} to="/reminders">Reminders</Link>
      <Link className={isActive("/settings") ? "active" : ""} to="/settings">Settings</Link>
    </div>
  );
}

export default Sidebar;
