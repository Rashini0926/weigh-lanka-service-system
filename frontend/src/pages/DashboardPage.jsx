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
        future.setDate(future.getDate() + 90);

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

        const topOverdue = overdue
          .sort((a, b) => b.daysOverdue - a.daysOverdue)
          .slice(0, 5);

        setUrgentReminders(topOverdue);

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

  // 🔹 Quick action handlers
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
      <style>{`
        .dashboard-page {
          min-height: calc(100vh - 60px);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: linear-gradient(180deg, #e0f2fe 0%, #f9fafb 40%, #f3f4f6 100%);
          padding: 18px 26px 32px;
          color: #0f172a;
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
          color: #0b2c5a;
        }

        .dash-badge-today {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
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
          background: #ffffff;
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 6px 16px rgba(15,23,42,0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid #e5e7eb;
        }

        .stat-card-customers {
          border-left: 4px solid #16a34a;
        }

        .stat-card-machines {
          border-left: 4px solid #2563eb;
        }

        .stat-card-services {
          border-left: 4px solid #7c3aed;
        }

        .stat-card-overdue {
          border-left: 4px solid #dc2626;
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

        .stat-icon.green {
          background: #ecfdf5;
          color: #16a34a;
        }

        .stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-icon.red {
          background: #fef2f2;
          color: #dc2626;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

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
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          padding: 14px 16px 16px;
          border: 1px solid #e5e7eb;
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
          color: #0b2c5a;
        }

        .muted {
          font-size: 13px;
          color: #6b7280;
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

        .recent-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          border-radius: 10px;
          overflow: hidden;
        }

        .recent-table th,
        .recent-table td {
          padding: 6px 8px;
          text-align: left;
        }

        .recent-table th {
          background: linear-gradient(90deg, #0b2c5a, #1d4ed8);
          font-size: 12px;
          color: #f9fafb;
        }

        .recent-table td {
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .recent-table tbody tr:nth-child(even) td {
          background: #f9fafb;
        }

        .recent-table tbody tr:hover td {
          background: #e0f2fe;
        }

        .urgent-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fef2f2;
          border: 1px solid #fecaca;
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
          color: #b91c1c;
        }

        .urgent-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #7f1d1d;
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
            {/* Top stats */}
            <div className="dash-stats-grid">
              <div className="stat-card stat-card-customers">
                <div className="stat-header">
                  <p className="stat-title">Customers</p>
                  <div className="stat-icon green">👥</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalCustomers}</p>
                </div>
              </div>

              <div className="stat-card stat-card-machines">
                <div className="stat-header">
                  <p className="stat-title">Machines</p>
                  <div className="stat-icon">⚙️</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalMachines}</p>
                </div>
              </div>

              <div className="stat-card stat-card-services">
                <div className="stat-header">
                  <p className="stat-title">Services</p>
                  <div className="stat-icon purple">📘</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{totalServiceRecords}</p>
                </div>
              </div>

              <div className="stat-card stat-card-overdue">
                <div className="stat-header">
                  <p className="stat-title">Overdue</p>
                  <div className="stat-icon red">⏰</div>
                </div>
                <div className="stat-value-row">
                  <p className="stat-value">{overdueCount}</p>
                </div>
                <p className="stat-title">
                  {upcomingCount} upcoming within 90 days
                </p>
              </div>
            </div>

            {/* Main row */}
            <div className="dash-main-grid">
              <div>
                {/* Quick Actions with Add New Service */}
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

                {/* Recent services */}
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

              {/* Overdue panel */}
              <div>
                <div className="card urgent-card">
                  <div className="urgent-header">
                    <div className="urgent-icon">⚠️</div>
                    <div>
                      <h3 className="urgent-title">Overdue Services</h3>
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
