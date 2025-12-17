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

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page {
          padding: 24px;
          min-height: calc(100vh - 60px);
          background: linear-gradient(180deg,#eef6ff,#e2e8f0);
          font-family: system-ui;
          color:#0f172a;
        }

        .dash-shell { max-width:1200px; margin:auto; }

        .dash-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:18px;
        }

        .dash-title { font-size:28px; font-weight:700; color:#071235; }

        .date-badge {
          background:#dbeafe;
          color:#1e3a8a;
          padding:6px 14px;
          border-radius:999px;
          font-size:13px;
          font-weight:600;
        }

        /* Quick Actions */
        .quick-actions {
          display:flex;
          gap:10px;
          margin-bottom:20px;
          flex-wrap:wrap;
        }

        .btn {
          border-radius:999px;
          padding:7px 16px;
          font-size:13px;
          font-weight:600;
          cursor:pointer;
          border:none;
        }

        .btn-primary {
          background:linear-gradient(135deg,#1e40af,#2563eb);
          color:white;
          box-shadow:0 10px 24px rgba(14,42,100,.45);
          transition: transform .12s ease, filter .12s ease;
        }

        .btn-soft {
          background:#e0f2fe;
          color:#0369a1;
          border:1px solid #bae6fd;
        }

        .btn-primary:hover {
          filter:brightness(.95);
          transform: translateY(-1px);
        }

        /* Stats */
        .stats-grid {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:16px;
          margin-bottom:22px;
        }

        .stat-card {
          background:#f8fafc;
          border-radius:14px;
          padding:14px 16px;
          box-shadow:0 6px 18px rgba(15,23,42,.10);
          border-left:4px solid #1e40af;
        }

        .stat-title { font-size:13px; color:#475569; }
        .stat-value { font-size:26px; font-weight:700; }

        /* Layout */
        .grid-main {
          display:grid;
          grid-template-columns:2fr 1fr;
          gap:18px;
        }

        @media(max-width:900px){
          .grid-main{grid-template-columns:1fr;}
        }

        .card {
          background:#f9fafb;
          border-radius:14px;
          padding:16px;
          box-shadow:0 8px 24px rgba(15,23,42,.10);
        }

        /* Search */
        .search-box {
          margin-bottom:10px;
        }

        .search-box input {
          width:100%;
          padding:8px 12px;
          border-radius:999px;
          border:1px solid #cbd5e1;
          font-size:13px;
          background: white;
          outline: none;
        }

        .search-box input:focus {
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          border-color: #93c5fd;
        }

        /* Table */
        table {
          width:100%;
          border-collapse:collapse;
          font-size:13px;
        }

        th {
          background:#2563eb;
          color:white;
          padding:8px;
        }

        td {
          padding:8px;
          border-top:1px solid #e5e7eb;
        }

        tr:nth-child(even) td { background:#f1f5f9; }

        /* Overdue */
        .urgent {
          background:#fff7ed;
          border:1px solid #fed7aa;
        }

        .urgent-item {
          display:flex;
          justify-content:space-between;
          padding:8px 0;
          border-bottom:1px solid #fed7aa;
          font-size:13px;
        }

        .urgent-badge {
          background:#c2410c;
          color:white;
          padding:4px 10px;
          border-radius:999px;
          font-size:11px;
        }

        .view-link {
          margin-top:10px;
          text-align:right;
        }

        .view-link button {
          background:none;
          border:none;
          color:#2563eb;
          cursor:pointer;
          font-size:13px;
          font-weight:600;
        }

        /* Chart */
        .chart {
          height:120px;
          display:flex;
          align-items:flex-end;
          gap:10px;
          margin-top:10px;
        }

        .bar {
          flex:1;
          background:#60a5fa;
          border-radius:6px 6px 0 0;
        }
      `}</style>

      <div className="dash-shell">
        <div className="dash-header">
          <h2 className="dash-title">Dashboard</h2>
          <span className="date-badge">{todayStr}</span>
        </div>

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
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-title">Customers</div><div className="stat-value">{totalCustomers}</div></div>
          <div className="stat-card"><div className="stat-title">Machines</div><div className="stat-value">{totalMachines}</div></div>
          <div className="stat-card"><div className="stat-title">Services</div><div className="stat-value">{totalServiceRecords}</div></div>
          <div className="stat-card"><div className="stat-title">Upcoming</div><div className="stat-value">{upcomingCount}</div></div>
          <div className="stat-card"><div className="stat-title">Overdue</div><div className="stat-value">{overdueCount}</div></div>
        </div>

        <div className="grid-main">
          {/* Recent */}
          <div className="card">
            <div className="search-box">
              <input
                placeholder="Search customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && <div style={{padding:'8px 0', color:'#0f172a'}}>Loading...</div>}
            {error && <div style={{padding:'8px 0', color:'#b91c1c', fontWeight:600}}>{error}</div>}

            <table>
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
                {filteredRecent.map((r) => (
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

            {/* Simple Chart */}
            
          </div>

          {/* Overdue */}
          <div className="card urgent">
            <h3>Overdue Services</h3>
            {urgentReminders.map((r) => (
              <div key={r.id} className="urgent-item">
                <span>{r.customerName}</span>
                <span className="urgent-badge">{r.daysOverdue} days</span>
              </div>
            ))}
            <div className="view-link">
              <button onClick={() => navigate("/reminders")}>
                View all reminders →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
