import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './DashboardPage.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


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
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        if (!cancelled) setLoading(true);

        const [customersRes, machinesRes, recordsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/machines`),
          axios.get(`${API_BASE_URL}/service-records`),
        ]);

        if (cancelled) return;

        const customers = customersRes.data || [];
        const machines = machinesRes.data || [];
        const records = recordsRes.data || [];

        if (!cancelled) {
          setTotalCustomers(customers.length);
          setTotalMachines(machines.length);
          setTotalServiceRecords(records.length);
        }

        const customerMap = {};
        customers.forEach((c) => (customerMap[c.id] = c.customerName || "Unknown"));

        const machineMap = {};
        machines.forEach(
          (m) => (machineMap[m.id] = m.model || m.serialNumber || "Unknown")
        );

        const today = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 90);

        const overdue = [];
        let upcoming = 0;

        records.forEach((r) => {
          if (!r.nextServiceDate) return;
          const nextDate = new Date(r.nextServiceDate);
          const diff = Math.floor((nextDate - today) / 86400000);

          if (diff < 0) {
            overdue.push({
              ...r,
              customerName: customerMap[r.customerId],
              machineLabel: machineMap[r.machineId],
              daysOverdue: Math.abs(diff),
            });
          } else if (diff <= 90) {
            upcoming++;
          }
        });

        if (!cancelled) {
          setOverdueCount(overdue.length);
          setUrgentReminders(overdue.slice(0, 5));
          setUpcomingCount(upcoming);

          const sorted = records.slice().sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));

          setRecentRecords(
            sorted
              .slice(0, 6)
              .map((r) => ({
                id: r.id,
                serviceDate: r.serviceDate?.substring(0, 10),
                customerName: customerMap[r.customerId],
                machineLabel: machineMap[r.machineId],
                technicianName: r.technicianName,
                invoiceNo: r.invoiceNo,
              }))
          );
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecent = recentRecords.filter((r) =>
    r.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const monthlyData = useMemo(() => {
    const counts = Array(6).fill(0);
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString(undefined, { month: "short" }));
    }

    recentRecords.forEach((r) => {
      if (!r.serviceDate) return;
      const d = new Date(r.serviceDate);
      const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 6) {
        counts[5 - monthsDiff] += 1;
      }
    });

    return { labels, counts };
  }, [recentRecords]);

  const chartData = useMemo(() => ({
    labels: monthlyData.labels,
    datasets: [
      {
        data: monthlyData.counts,
        backgroundColor: 'rgba(74,112,169,0.95)',
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  }), [monthlyData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#cfe2f6' } },
      y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1, color: '#cfe2f6' } },
    },
  }), [monthlyData]);


  return (


      <div className="dashboard-page">
        <div className="dash-shell">
        <div className="dash-header">
          <div>
            <h2 className="dash-title">Welcome back — Dashboard</h2>
            
          </div>

          <div className="dash-header-right">
            <div className="date-badge">{todayStr}</div>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="decor-blob" aria-hidden></div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn btn-primary" onClick={() => navigate("/service-entry")}>
            ➕ New Service
          </button>
          <button className="btn btn-soft" onClick={() => navigate("/customers")}>
            👥 Customers
          </button>
          <button className="btn btn-soft" onClick={() => navigate("/report")}>
            📄 Daily Report
          </button>

          <div className="quick-actions-meta">
            <div className="pill">Services: <strong>{totalServiceRecords}</strong></div>
            <div className="pill">Overdue: <strong className="overdue-count">{overdueCount}</strong></div>
          </div>        </div>

        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-top">
              <div className="stat-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                  <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6v1H6v-1z" />
                </svg>
              </div>
              <div className="stat-title">Customers</div>
            </div>
            <div className="stat-value">{totalCustomers}</div>
          </div>

          <div className="stat-card stat-teal">
            <div className="stat-top">
              <div className="stat-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M21 6.5l-2.5-2.5a1 1 0 00-1.4 0l-1.2 1.2 3.9 3.9 1.2-1.2a1 1 0 000-1.4z" />
                  <path d="M3 17.5l3.5 3.5 7.2-7.2-3.5-3.5L3 17.5z" />
                </svg>
              </div>
              <div className="stat-title">Machines</div>
            </div>
            <div className="stat-value">{totalMachines}</div>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-top">
              <div className="stat-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M3 11l9-9 9 9-9 9L3 11z" />
                </svg>
              </div>
              <div className="stat-title">Services</div>
            </div>
            <div className="stat-value">{totalServiceRecords}</div>
          </div>

          <div className="stat-card stat-yellow">
            <div className="stat-top">
              <div className="stat-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-title">Upcoming</div>
            </div>
            <div className="stat-value">{upcomingCount}</div>
          </div>

          <div className="stat-card stat-red">
            <div className="stat-top">
              <div className="stat-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-title">Overdue</div>
            </div>
            <div className="stat-value">{overdueCount}</div>
          </div>
        </div>

        <div className="grid-main">
          {/* Left: recent and chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Services</h3>
              <div className="card-meta">{filteredRecent.length} shown</div>
            </div>

            <div className="search-box">
              <input
                placeholder="Search customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="recent-grid">
              <div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Machine</th>
                      <th>Tech</th>
                      <th>Inv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecent.map((r) => (
                      <tr key={r.id}>
                        <td>{r.serviceDate}</td>
                        <td className="cell-strong">{r.customerName}</td>
                        <td>{r.machineLabel}</td>
                        <td>{r.technicianName}</td>
                        <td>{r.invoiceNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            
              
            </div>

          </div>

          {/* Right: Overdue & Activity */}
          <div className="right-column">
            <div className="card urgent">
              <h3 className="card-title">Overdue Services</h3>
              {urgentReminders.length === 0 && <div className="card-empty">No overdue services 🎉</div>}
              {urgentReminders.map((r) => (
                <div key={r.id} className="urgent-item">
                  <div className="urgent-main">
                    <div className="urgent-title">{r.customerName}</div>
                    <div className="urgent-sub">{r.machineLabel || 'Machine'}</div>
                  </div>
                  <div className="urgent-meta">
                    <div className="urgent-badge">{r.daysOverdue}d</div>
                    <div className="urgent-invoice">{r.invoiceNo || ''}</div>
                  </div>
                </div>
              ))}
              <div className="view-link">
                <button onClick={() => navigate("/reminders") }>
                  View all reminders →
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Recent Activity</h3>
              <div className="activity-list">
                {recentRecords.slice(0,6).map((r) => (
                  <div key={r.id} className="activity-row">
                    <div className="avatar">{(r.customerName||'')[0]||'U'}</div>
                    <div className="activity-main">
                      <div className="activity-title">{r.customerName}</div>
                      <div className="activity-sub">{r.serviceDate} • {r.technicianName}</div>
                    </div>
                    <div className="activity-meta">{r.invoiceNo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
