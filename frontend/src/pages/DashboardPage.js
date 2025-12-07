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

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">
          Snapshot of all scales, services, and reminders.
        </p>
      </div>

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Top row: 3 cards + urgent reminders */}
          <div className="dash-top-row">
            {/* Left cards */}
            <div className="dash-top-left">
              <div className="dash-summary-grid">
                <div className="dash-card">
                  <p className="dash-card-title">Total Scales in System</p>
                  <p className="dash-card-value">{totalMachines}</p>
                  <p className="dash-card-subtitle">
                    Registered machines in database
                  </p>
                </div>

                <div className="dash-card">
                  <p className="dash-card-title">
                    Upcoming Services Next 90 Days
                  </p>
                  <p className="dash-card-value">{upcomingCount}</p>
                  <p className="dash-card-subtitle">
                    Based on next service dates
                  </p>
                </div>

                <div className="dash-card">
                  <p className="dash-card-title">Overdue Services</p>
                  <p className="dash-card-value accent">{overdueCount}</p>
                  <p className="dash-card-subtitle">
                    Next service date already passed
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card quick-actions-card">
                <div className="quick-actions-header">
                  <h3 className="section-title">Quick Actions</h3>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddService}
                  >
                    ➕ Add New Service
                  </button>
                </div>
                <p className="muted">
                  Use the &quot;Add New Service&quot; button to register a
                  recently completed service and set the next reminder date.
                </p>
              </div>
            </div>

            {/* Right urgent reminders panel */}
            <div className="dash-top-right">
              <div className="card urgent-card">
                <div className="urgent-header">
                  <span className="urgent-icon">⚠️</span>
                  <div>
                    <h3 className="urgent-title">Urgent Reminders (Top 5)</h3>
                    <p className="urgent-subtitle">
                      Overdue based on next service date
                    </p>
                  </div>
                </div>

                {urgentReminders.length === 0 ? (
                  <p className="muted">No overdue services. Good job! 🎉</p>
                ) : (
                  <ul className="urgent-list">
                    {urgentReminders.map((r) => (
                      <li key={r.id} className="urgent-item">
                        <div className="urgent-text">
                          <div className="urgent-main">
                            <strong>
                              INV NO: {r.invoiceNo || "N/A"}
                            </strong>{" "}
                            – {r.customerName}
                          </div>
                          <div className="urgent-sub">
                            {r.machineLabel} | Next service date:{" "}
                            {r.nextServiceDate
                              ? r.nextServiceDate.substring(0, 10)
                              : "N/A"}
                          </div>
                        </div>
                        <div className="urgent-badge">
                          OVERDUE ({r.daysOverdue} days)
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
                  View All Reminders →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
