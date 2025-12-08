import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:9090/api";

function DashboardPage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalMachines, setTotalMachines] = useState(0);
  const [totalServiceRecords, setTotalServiceRecords] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  const [urgentReminders, setUrgentReminders] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [customersRes, machinesRes, recordsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/machines`),
          axios.get(`${API_BASE_URL}/service-records`),
        ]);

        const customers = customersRes.data || [];
        const machines = machinesRes.data || [];
        const records = recordsRes.data || [];

        setTotalCustomers(customers.length);
        setTotalMachines(machines.length);
        setTotalServiceRecords(records.length);

        // maps for display
        const customerMap = {};
        customers.forEach((c) => {
          customerMap[c.id] = c.customerName || "Unknown";
        });

        const machineMap = {};
        machines.forEach((m) => {
          machineMap[m.id] = m.model || m.serialNumber || "Machine";
        });

        const today = new Date(todayStr);
        const future = new Date(todayStr);
        future.setDate(future.getDate() + 90); // next 90 days

        const upcoming = [];
        const overdue = [];

        records.forEach((r) => {
          if (!r.nextServiceDate) return;

          const nextDate = new Date(r.nextServiceDate);
          const diffDays = Math.floor(
            (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          const base = {
            ...r,
            customerName: customerMap[r.customerId] || r.customerId,
            machineLabel: machineMap[r.machineId] || r.machineId,
            daysDiff: diffDays,
          };

          if (diffDays >= 0 && nextDate <= future) {
            upcoming.push(base);
          } else if (diffDays < 0) {
            overdue.push({ ...base, daysOverdue: Math.abs(diffDays) });
          }
        });

        setUpcomingCount(upcoming.length);
        setOverdueCount(overdue.length);

        // top 5 overdue sorted by most overdue
        const topOverdue = overdue
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5);

        setUrgentReminders(topOverdue);

        // recent 5 service records (latest first) with names
        const recent = [...records]
          .sort((a, b) => {
            const da = a.serviceDate ? new Date(a.serviceDate) : 0;
            const db = b.serviceDate ? new Date(b.serviceDate) : 0;
            return db - da;
          })
          .slice(0, 5)
          .map((r) => ({
            id: r.id,
            serviceDate: r.serviceDate ? r.serviceDate.substring(0, 10) : "",
            customerName: customerMap[r.customerId] || r.customerId,
            machineLabel: machineMap[r.machineId] || r.machineId,
            technicianName: r.technicianName || "",
            invoiceNo: r.invoiceNo || "",
          }));

        setRecentRecords(recent);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [todayStr]);

  const handleAddService = () => {
    navigate("/service-entry");
  };

  const handleViewAllReminders = () => {
    navigate("/reminders");
  };

  const handleGoCustomers = () => {
    navigate("/customers");
  };

  const handleGoReport = () => {
    navigate("/report");
  };

  return (
    <div className="dashboard-page">
      {/* Inline CSS specific to dashboard */}
      <style>{`
        .dashboard-page {
          min-height: calc(100vh - 60px);
          font-family: Arial, sans-serif;
          background: radial-gradient(circle at top left, #e0f2ff 0, #f5f5f5 45%, #f9fafb 100%);
          padding: 18px 26px 32px;
        }

        .dash-shell {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dash-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .dash-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dash-title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #0f172a;
        }

        .dash-subtitle {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .dash-badge-today {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(15,118,110,0.08);
          color: #0f766e;
          border: 1px solid rgba(45,212,191,0.3);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .dash-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #22c55e;
        }

        /* Stats row */
        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        @media (max-width: 1024px) {
          .dash-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .dash-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px);
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(148,163,184,0.22);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.10);
          border-color: rgba(59,130,246,0.4);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-title {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .stat-icon {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 14px;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #15803d;
        }

        .stat-icon.red {
          background: #fef2f2;
          color: #b91c1c;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .stat-value.accent {
          color: #dc2626;
        }

        .stat-footer {
          font-size: 11px;
          color: #9ca3af;
        }

        /* Main layout */
        .dash-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.25fr);
          gap: 18px;
        }

        @media (max-width: 900px) {
          .dash-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
          padding: 14px 16px 16px;
          border: 1px solid rgba(226,232,240,0.9);
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .section-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }

        .muted {
          font-size: 13px;
          color: #6b7280;
        }

        /* Buttons */
        .btn {
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn:active {
          transform: translateY(1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0f172a, #1d4ed8);
          color: #ffffff;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #020617, #1d4ed8);
        }

        .btn-outline {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(148,163,184,0.9);
        }

        .btn-outline:hover {
          background: #f9fafb;
          border-color: #1d4ed8;
          color: #1d4ed8;
        }

        .quick-actions-card {
          margin-bottom: 14px;
        }

        .quick-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .quick-actions-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        /* Recent activity table */
        .recent-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .recent-table th,
        .recent-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
        }

        .recent-table th {
          background: #f3f4f6;
          font-size: 12px;
          color: #4b5563;
        }

        .recent-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .recent-table tbody tr:hover {
          background: #e0f2fe;
        }

        /* Urgent reminders panel */
        .urgent-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: radial-gradient(circle at top, #fef2f2 0, #ffffff 50%);
        }

        .urgent-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .urgent-icon {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 10px rgba(248,113,113,0.45);
        }

        .urgent-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #7f1d1d;
        }

        .urgent-subtitle {
          margin: 0;
          font-size: 12px;
          color: #9f1239;
        }

        .urgent-list {
          list-style: none;
          padding: 0;
          margin: 8px 0 10px;
          max-height: 260px;
          overflow-y: auto;
        }

        .urgent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #fee2e2;
          gap: 10px;
        }

        .urgent-item:last-child {
          border-bottom: none;
        }

        .urgent-text {
          font-size: 12px;
        }

        .urgent-main {
          font-size: 13px;
          font-weight: 500;
          color: #7f1d1d;
        }

        .urgent-sub {
          font-size: 11px;
          color: #9f1239;
        }

        .urgent-badge {
          background: #b91c1c;
          color: #fee2e2;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(185,28,28,0.45);
        }

        .urgent-footer-link {
          border: none;
          background: transparent;
          color: #1d4ed8;
          font-size: 12px;
          cursor: pointer;
          align-self: flex-end;
          padding: 0;
          margin-top: auto;
        }

        .urgent-footer-link:hover {
          text-decoration: underline;
        }

        .error {
          color: #b91c1c;
          font-size: 13px;
          margin-top: 4px;
        }

        .loading-text {
          font-size: 13px;
          color: #4b5563;
        }
      `}</style>

      <div className="dash-shell">
        <div className="dash-header-top">
          <div className="dash-title-wrap">
            <h2 className="dash-title">Dashboard</h2>
            <p className="dash-subtitle">Overview of services and reminders.</p>
          </div>
          <span className="dash-badge-today">
            <span className="dash-badge-dot" />
            {todayStr}
          </span>
        </div>

        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Top stats row */}
            <div className="dash-stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <p className="stat-title">Customers</p>
                  <div className="stat-icon green">👥</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalCustomers}</p>
                </div>
                <p className="stat-footer">Registered clients.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <p className="stat-title">Machines</p>
                  <div className="stat-icon">⚙️</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalMachines}</p>
                </div>
                <p className="stat-footer">Scales in system.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <p className="stat-title">Service Records</p>
                  <div className="stat-icon orange">📘</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalServiceRecords}</p>
                </div>
                <p className="stat-footer">Jobs completed.</p>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <p className="stat-title">Overdue</p>
                  <div className="stat-icon red">⏰</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value accent">{overdueCount}</p>
                </div>
                <p className="stat-footer">
                  {upcomingCount} upcoming (90 days).
                </p>
              </div>
            </div>

            {/* Main content row */}
            <div className="dash-main-grid">
              {/* LEFT: Quick actions + recent activity */}
              <div>
                <div className="card quick-actions-card">
                  <div className="quick-actions-header">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions-buttons">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddService}
                      >
                        ➕ New Service
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleGoCustomers}
                      >
                        👥 Customers
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleGoReport}
                      >
                        📄 Daily Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent service activity */}
                <div className="card">
                  <div className="section-title-row">
                    <h3 className="section-title">Recent Services</h3>
                  </div>

                  {recentRecords.length === 0 ? (
                    <p className="muted">No service records yet.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="recent-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Machine</th>
                            <th>Technician</th>
                            <th>Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRecords.map((r) => (
                            <tr key={r.id}>
                              <td>{r.serviceDate}</td>
                              <td>{r.customerName}</td>
                              <td>{r.machineLabel}</td>
                              <td>{r.technicianName}</td>
                              <td>{r.invoiceNo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Urgent reminders */}
              <div>
                <div className="card urgent-card">
                  <div className="urgent-header">
                    <div className="urgent-icon">⚠️</div>
                    <div>
                      <h3 className="urgent-title">Overdue Services</h3>
                      <p className="urgent-subtitle">
                        Next service date already passed.
                      </p>
                    </div>
                  </div>

                  {urgentReminders.length === 0 ? (
                    <p className="muted">No overdue services. 🎉</p>
                  ) : (
                    <ul className="urgent-list">
                      {urgentReminders.map((r) => (
                        <li key={r.id} className="urgent-item">
                          <div className="urgent-text">
                            <div className="urgent-main">
                              INV: {r.invoiceNo || "N/A"} · {r.customerName}
                            </div>
                            <div className="urgent-sub">
                              {r.machineLabel} · Next:{" "}
                              {r.nextServiceDate
                                ? r.nextServiceDate.substring(0, 10)
                                : "N/A"}
                            </div>
                          </div>
                          <div className="urgent-badge">
                            {r.daysOverdue} days late
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    className="urgent-footer-link"
                    onClick={handleViewAllReminders}
                  >
                    View all reminders →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
