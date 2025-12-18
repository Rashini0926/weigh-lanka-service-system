import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

// ---------- DATE UTILITIES ----------
function toDateOnly(value) {
  if (!value) return "";
  if (typeof value === "string") return value.substring(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function csvFromRows(rows) {
  const headers = ["Invoice", "Customer", "Phone", "Next Due", "Status"];
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    lines.push(
      [r.invoiceNo, r.customerName, r.phone, r.nextServiceDate, r.label].join(",")
    );
  });
  return lines.join("\n");
}

function ReminderPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | overdue | urgent | dueSoon

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cRes, mRes, rRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/machines`),
          axios.get(`${API_BASE_URL}/service-records`),
        ]);

        setCustomers(cRes.data || []);
        setMachines(mRes.data || []);
        setRecords(rRes.data || []);
      } catch (err) {
        console.error("Error loading reminders:", err);
        setError("Failed to load reminders.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------- COMBINE DATA ----------
  const rows = useMemo(() => {
    return (
      records
        .map((r) => {
          const cust = customers.find((c) => c.id === r.customerId);
          const mach = machines.find((m) => m.id === r.machineId);

          const nextDate = toDateOnly(r.nextServiceDate);

          return {
            id: r.id,
            invoiceNo: r.invoiceNo || "N/A",
            capacity: mach?.capacity || "",
            customerName: cust?.customerName || "Unknown",
            phone: cust?.phone || "",
            nextServiceDate: nextDate,
          };
        })
        .map((row) => {
          if (!row.nextServiceDate) return null;

          const diff = daysBetween(todayStr, row.nextServiceDate);
          if (diff === null) return null;

          let status = null;
          let label = "";
          const days = Math.abs(diff);

          if (diff < 0) {
            status = "overdue";
            label = `OVERDUE (${days} days)`;
          } else if (diff >= 0 && diff <= 30) {
            status = "urgent";
            label = `URGENT (${days} days)`;
          } else if (diff >= 31 && diff <= 90) {
            status = "dueSoon";
            label = `DUE SOON (${days} days)`;
          } else {
            return null; // beyond 90 days, ignore
          }

          return { ...row, status, label, daysDiff: diff };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const weight = (s) => (s === "overdue" ? 0 : s === "urgent" ? 1 : 2);
          const wA = weight(a.status);
          const wB = weight(b.status);
          if (wA !== wB) return wA - wB;
          return Math.abs(a.daysDiff) - Math.abs(b.daysDiff);
        }) || []
    );
  }, [records, customers, machines, todayStr]);

  // ---------- WHATSAPP CONTACT ----------
  const handleContact = (row) => {
    if (!row.phone) {
      alert("No phone number for this customer.");
      return;
    }

    const phone = row.phone.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hello ${row.customerName},\n\nThis is a reminder from Weigh Lanka.\nYour scale service is due on ${row.nextServiceDate}.\n\nPlease contact us to arrange the service.\n\nThank you.`
    );

    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const counts = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { overdue: 0, urgent: 0, dueSoon: 0 }
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.invoiceNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, filter]);

  const handleExport = () => {
    const csv = csvFromRows(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reminders_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reminders-wrapper">
      <style>{`
        :root{
          --bg-1: #eaf2ff;
          --bg-2: #f8fbff;
          --card: rgba(255,255,255,0.86);
          --muted: #6b7280;
          --accent: #0f172a;
          --glass: rgba(255,255,255,0.6);
          --accent-glow: rgba(99,102,241,0.12);
        }
        .reminders-wrapper {
          padding: 28px 20px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: radial-gradient(1200px 420px at 10% 10%, rgba(99,102,241,0.06), transparent 8%), linear-gradient(180deg, var(--bg-1), var(--bg-2));
          background-attachment: fixed;
          min-height: calc(100vh - 60px);
          position: relative;
          overflow: hidden;
        }
        .rem-container{
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .decor-blob{
          position: absolute;
          right: -120px;
          top: -60px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 30%), radial-gradient(circle at 70% 70%, rgba(34,197,94,0.06), transparent 40%);
          filter: blur(40px);
          transform: rotate(8deg);
          z-index: 1;
          pointer-events: none;
        }
        .rem-card {
          background: var(--card);
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.04);
          backdrop-filter: blur(6px) saturate(120%);
          -webkit-backdrop-filter: blur(6px) saturate(120%);
        }
        .rem-header{
          display:flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
          margin-bottom: 16px;
        }
        .rem-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 6px;
          color: var(--accent);
        }
        .rem-sub {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }

        /* Controls */
        .controls{
          display:flex;
          gap:8px;
          align-items:center;
          flex-wrap:wrap;
        }
        .search {
          display:flex;
          align-items:center;
          gap:8px;
          background:#f3f4f6;
          padding:8px 10px;
          border-radius:10px;
          min-width:220px;
        }
        .search input{
          border:0;
          background:transparent;
          outline:none;
          font-size:14px;
        }
        .pill-group{ display:flex; gap:8px; align-items:center; }
        .pill{
          padding:7px 12px;
          border-radius:999px;
          background:transparent;
          border:1px solid transparent;
          font-weight:600;
          font-size:13px;
          color:var(--muted);
          cursor:pointer;
        }
        .pill.active{ background:#eef2ff; color:#3730a3; border-color: rgba(99,102,241,0.12); }
        .actions{ display:flex; gap:8px; align-items:center; }
        .btn{
          background:#111827; color:white; padding:8px 12px; border-radius:8px; font-weight:600; border:0; cursor:pointer; font-size:13px;
        }
        .btn.ghost{ background:transparent; color:var(--muted); border:1px solid rgba(15,23,42,0.04); }

        /* List / Table responsive */
        .list{
          display:grid; grid-template-columns: 1fr; gap:10px;
        }
        @media(min-width:800px){
          .list{ display:block; }
        }

        .row-card{
          display:flex; justify-content:space-between; gap:12px; align-items:center;
          background:#fff; padding:12px; border-radius:10px; border:1px solid rgba(15,23,42,0.03);
          transition:transform .12s ease, box-shadow .12s ease;
        }
        .row-card:hover{ transform:translateY(-4px); box-shadow: 0 8px 30px rgba(2,6,23,0.06); }
        .row-left{ display:flex; gap:12px; align-items:center; min-width:0; }
        .inv{ font-weight:700; color: #0f172a; min-width:120px; }
        .customer{ color:var(--accent); font-weight:600; }
        .meta{ color:var(--muted); font-size:13px; }

        .status-badge { padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; }
        .status-overdue{ background:#fecaca; color:#7f1d1d; }
        .status-urgent{ background:#fee2b8; color:#7c2d12; }
        .status-duesoon{ background:#fffbeb; color:#92400e; }

        .contact-btn{ background:#25d366; color:#fff; border:0; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:700; }

        .empty{ text-align:center; padding:40px 20px; color:var(--muted); }

        /* loader */
        .loader{ width:36px; height:36px; border-radius:50%; border:4px solid rgba(15,23,42,0.08); border-top-color:#0f172a; animation:spin 1s linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }
      `}</style>

      <div className="rem-container">
        <div className="decor-blob" aria-hidden="true" />
        <div className="rem-card">
          <div className="rem-header">
            <div>
              <h2 className="rem-title">Reminders & Alerts</h2>
              <p className="rem-sub">Today: <strong>{todayStr}</strong></p>
            </div>

            <div className="controls">
              <div className="search" role="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input placeholder="Search invoice, customer or phone" value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>

              <div className="pill-group" role="toolbar" aria-label="filters">
                <button className={`pill ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All</button>
                <button className={`pill ${filter==='overdue'?'active':''}`} onClick={()=>setFilter('overdue')}>Overdue <span style={{opacity:0.8, marginLeft:6}}>({counts.overdue})</span></button>
                <button className={`pill ${filter==='urgent'?'active':''}`} onClick={()=>setFilter('urgent')}>Urgent <span style={{opacity:0.8, marginLeft:6}}>({counts.urgent})</span></button>
                <button className={`pill ${filter==='dueSoon'?'active':''}`} onClick={()=>setFilter('dueSoon')}>Due soon <span style={{opacity:0.8, marginLeft:6}}>({counts.dueSoon})</span></button>
              </div>

              <div className="actions">
                <button className="btn ghost" onClick={()=>{ setQuery(''); setFilter('all'); }}>Reset</button>
                <button className="btn" onClick={handleExport}>Export</button>
              </div>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', padding:40}}><div className="loader"/></div>
          ) : error ? (
            <div style={{padding:20, color:'#b91c1c'}}>{error}</div>
          ) : filteredRows.length === 0 ? (
            <div className="empty">
              <div style={{fontSize:40}}>🎉</div>
              <div style={{fontSize:18, fontWeight:700, marginTop:8}}>No reminders right now</div>
              <div style={{marginTop:6}}>All caught up — check back later.</div>
            </div>
          ) : (
            <div>
              <div style={{marginBottom:10, color:'var(--muted)'}}>{filteredRows.length} reminder(s)</div>

              <div className="list">
                {/* Desktop table for wide screens */}
                <div style={{display:'none'}} className="desktop-table">
                  {/* Keep original table for accessibility/printing */}
                </div>

                {/* Card list */}
                {filteredRows.map((row) => (
                  <div key={row.id} className="row-card">
                    <div className="row-left">
                      <div className="inv">{row.invoiceNo}{row.capacity?` (${row.capacity})`:''}</div>
                      <div style={{minWidth:0}}>
                        <div className="customer">{row.customerName}</div>
                        <div className="meta">{row.phone} • Next: {row.nextServiceDate}</div>
                      </div>
                    </div>

                    <div style={{display:'flex', gap:12, alignItems:'center'}}>
                      <div>
                        <span className={`status-badge ${row.status==='overdue'? 'status-overdue' : row.status==='urgent' ? 'status-urgent' : 'status-duesoon'}`}>
                          {row.label}
                        </span>
                      </div>
                      <div>
                        <button className="contact-btn" onClick={()=>handleContact(row)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight:6}}><path d="M21 16.5a4.5 4.5 0 0 1-4.5 4.5h-11L3 21l1.5-2.5V6A4.5 4.5 0 0 1 9 1.5h6A4.5 4.5 0 0 1 19.5 6v10.5z" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReminderPage;
