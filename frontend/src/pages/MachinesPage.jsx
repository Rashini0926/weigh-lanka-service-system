import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

// helper to keep only YYYY-MM-DD for date inputs / display
function toDateOnly(value) {
  if (!value) return "";
  if (typeof value === "string") return value.substring(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

// add 1 year to a yyyy-mm-dd string
function addOneYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    model: "",
    serialNumber: "",
    installedDate: "",
    warranty: "",
    lastServiceDate: "",
    nextServiceDate: "",
    capacity: "",
    regNo: "",
    idNo: "",
  });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null); // id of row with details open

  const loadMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/machines`);
      setMachines(res.data);
    } catch (err) {
      console.error("Error loading machines:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  useEffect(() => {
    loadMachines();
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // when Last Service Date changes, auto-fill Next Service Date = +1 year
    if (name === "lastServiceDate") {
      setForm((prev) => ({
        ...prev,
        lastServiceDate: value,
        nextServiceDate: value ? addOneYear(value) : prev.nextServiceDate,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // search/filter the machines list
  const filteredMachines = machines.filter((m) => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return true;
    const cust = customers.find((c) => c.id === m.customerId);
    return (
      (m.model || "").toLowerCase().includes(q) ||
      (m.serialNumber || "").toLowerCase().includes(q) ||
      (m.regNo || "").toLowerCase().includes(q) ||
      (cust?.customerName || "").toLowerCase().includes(q)
    );
  });

  // UI helpers
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const avatarColor = (name) => {
    const colors = ["#60a5fa","#7c3aed","#06b6d4","#f97316","#ef4444","#10b981"];
    if (!name) return colors[0];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
    return colors[Math.abs(h) % colors.length];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      installedDate: form.installedDate || null,
      lastServiceDate: form.lastServiceDate || null,
      nextServiceDate: form.nextServiceDate || null,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/machines/${editingId}`, payload);
        setMessage("Machine updated.");
      } else {
        await axios.post(`${API_BASE_URL}/machines`, payload);
        setMessage("Machine saved.");
      }

      setForm({
        customerId: "",
        model: "",
        serialNumber: "",
        installedDate: "",
        warranty: "",
        lastServiceDate: "",
        nextServiceDate: "",
        capacity: "",
        regNo: "",
        idNo: "",
      });
      setEditingId(null);
      loadMachines();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save machine.");
    }
  };

  const handleEdit = (machine) => {
    setEditingId(machine.id);
    setForm({
      customerId: machine.customerId || "",
      model: machine.model || "",
      serialNumber: machine.serialNumber || "",
      installedDate: toDateOnly(machine.installedDate),
      warranty: machine.warranty || "",
      lastServiceDate: toDateOnly(machine.lastServiceDate),
      nextServiceDate: toDateOnly(machine.nextServiceDate),
      capacity: machine.capacity || "",
      regNo: machine.regNo || "",
      idNo: machine.idNo || "",
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this machine?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/machines/${id}`);
      setMessage("Machine deleted.");
      if (editingId === id) {
        setEditingId(null);
        setForm({
          customerId: "",
          model: "",
          serialNumber: "",
          installedDate: "",
          warranty: "",
          lastServiceDate: "",
          nextServiceDate: "",
          capacity: "",
          regNo: "",
          idNo: "",
        });
      }
      // close details if the deleted row was expanded
      if (expandedId === id) setExpandedId(null);

      loadMachines();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete machine.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      customerId: "",
      model: "",
      serialNumber: "",
      installedDate: "",
      warranty: "",
      lastServiceDate: "",
      nextServiceDate: "",
      capacity: "",
      regNo: "",
      idNo: "",
    });
    setMessage("");
  };

  return (
    <div className="machines-page">
      {/* Inline CSS modernized to match Customers page */}
      <style>{`
        :root{
          --bg-start:#f8fafc; --bg-end:#eef2ff; --card-bg: rgba(255,255,255,0.94);
          --accent-1:#7c3aed; --accent-2:#06b6d4; --muted:#6b7280; --text:#071235;
        }

        .machines-page { padding:20px 28px 28px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg,var(--bg-start),var(--bg-end)); min-height: calc(100vh - 60px); color:var(--text); }

        .machines-header { margin-bottom: 18px; }
        .machines-title { margin:0; font-size:24px; font-weight:700; }
        .machines-subtitle { margin:6px 0 0; color:var(--muted); }

        .machines-layout { display:grid; grid-template-columns: 1fr 1.4fr; gap:18px; }
        @media(max-width:900px){ .machines-layout{ grid-template-columns:1fr; } }

        .machines-form-card { background:var(--card-bg); border-radius:14px; padding:18px; box-shadow:0 10px 30px rgba(11,20,50,0.06); border:1px solid rgba(14,20,50,0.04); }
        .machines-form-title { margin:0 0 8px; font-size:16px; font-weight:700; }
        .machines-form-helper { color:var(--muted); margin:0 0 12px; }

        .machines-form-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:12px; }
        @media(max-width:700px){ .machines-form-grid{ grid-template-columns:1fr; } }
        .machines-full-row { grid-column:1/-1; }

        .machines-field label { display:flex; flex-direction:column; gap:6px; font-size:13px; color:#0f172a; }
        .machines-field input, .machines-field select { padding:10px 12px; border-radius:10px; border:1px solid rgba(14,20,50,0.06); font-size:13px; box-shadow: 0 1px 2px rgba(16,24,40,0.03); }
        .machines-field input:focus, .machines-field select:focus { outline:none; box-shadow:0 6px 18px rgba(124,58,237,0.12); border-color:var(--accent-1); }

        .machines-actions { display:flex; gap:10px; margin-top:12px; }
        .btn-main { background: linear-gradient(135deg,var(--accent-1),var(--accent-2)); color:#fff; border:none; padding:9px 18px; border-radius:999px; font-weight:700; cursor:pointer; box-shadow:0 8px 20px rgba(124,58,237,0.18); }
        .btn-main:hover{ transform: translateY(-1px); filter:brightness(.98); }
        .btn-secondary{ background:transparent; border:1px solid rgba(14,20,50,0.04); padding:8px 14px; border-radius:999px; color:var(--text); }

        .machines-message{ margin-top:10px; color:#059669; font-weight:600; }

        .machines-list-card{ background:var(--card-bg); border-radius:14px; padding:18px; box-shadow:0 10px 30px rgba(11,20,50,0.06); border:1px solid rgba(14,20,50,0.04); }

        .machines-list-header{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
        .machines-list-title{ margin:0; font-size:16px; font-weight:700; }
        .machines-count{ font-size:13px; color:var(--muted); }

        .machines-search{ display:flex; align-items:center; gap:8px; background: linear-gradient(180deg,#fff,#f8fafc); border-radius:999px; padding:8px 10px; border:1px solid rgba(14,20,50,0.04); box-shadow:0 4px 12px rgba(11,20,50,0.04); }
        .machines-search svg{ width:16px; height:16px; color:var(--muted); }
        .machines-search input{ border:none; background:transparent; font-size:13px; width:220px; color:var(--text); }
        .machines-search input:focus{ outline:none; }

        /* Make table responsive: allow horizontal scroll on very small screens, but let customer column wrap on larger sizes */
        .table-wrapper { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .machines-table{ width:100%; border-collapse:collapse; font-size:13px; table-layout:auto; }
        .machines-table th, .machines-table td{ padding:10px 12px; text-align:left; vertical-align:middle; border-bottom:1px solid rgba(14,20,50,0.04); }
        .machines-table thead th{ color:var(--muted); font-weight:600; font-size:12px; }
        .machines-table tbody tr{ transition: background .12s ease, transform .08s ease; }
        .machines-table tbody tr:hover{ background: rgba(6,182,212,0.03); transform: translateY(-1px); }

        /* Customer column: allow wrapping / break long names without forcing horizontal scroll */
        .machines-table th:first-child, .machines-table td:first-child { min-width:220px; max-width:320px; white-space:normal; word-break:break-word; }

        .machines-actions-cell{ display:flex; gap:8px; }
        .btn-small{ border-radius:999px; padding:6px 12px; font-size:13px; cursor:pointer; border:none; }
        .btn-edit{ background: linear-gradient(90deg,#e0f2fe,#bae6fd); color:#024f6a; }
        .btn-delete{ background: linear-gradient(90deg,#fff1f2,#fee2e2); color:#991b1b; }
        .btn-details{ background: linear-gradient(90deg,#f3f4f6,#e6eefc); color:#0f172a; }

        /* details row */
        .details-row td { background: rgba(2,6,23,0.02); padding:14px 12px; }
        .details-grid { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:10px; align-items:start; }
        .details-item { font-size:13px; color:#0f172a; }
        .details-item strong { display:block; color:var(--muted); font-weight:600; font-size:12px; margin-bottom:6px; }
        @media(max-width:700px){ .details-grid{ grid-template-columns: 1fr; } }

        .avatar{ width:36px; height:36px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:13px; box-shadow: 0 4px 10px rgba(2,6,23,0.08); }

        /* Hide less important columns on narrow screens to reduce horizontal scrolling */
        @media(max-width:1000px){
          .machines-table th:nth-child(5), .machines-table td:nth-child(5), /* Reg No */
          .machines-table th:nth-child(6), .machines-table td:nth-child(6), /* ID No */
          .machines-table th:nth-child(4), .machines-table td:nth-child(4)  /* Cap */
          { display:none; }
        }

        @media(max-width:700px){ .machines-search input{ width:120px; } .machines-form-grid{ grid-template-columns:1fr; } }
      `}</style> 

      <div className="machines-header">
        <h2 className="machines-title">Machines</h2>
        <p className="machines-subtitle">Link scales to customers and service dates.</p>
      </div>

      <div className="machines-layout">
        {/* LEFT: FORM */}
        <div className="machines-form-card">
          <h3 className="machines-form-title">
            {editingId ? "Edit Machine" : "New Machine"}
          </h3>
          <p className="machines-form-helper">
            Next service auto-fills one year after the last service date.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="machines-form-grid">
              <div className="machines-field machines-full-row">
                <label>
                  Customer
                  <select
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.location})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Model
                  <input
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Apex ACS-A"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Serial Number
                  <input
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 29637"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Capacity
                  <input
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 15kg"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Reg No
                  <input
                    name="regNo"
                    value={form.regNo}
                    onChange={handleChange}
                    placeholder="e.g. REG1234"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  ID No
                  <input
                    name="idNo"
                    value={form.idNo}
                    onChange={handleChange}
                    placeholder="e.g. ID1234"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Installed Date
                  <input
                    type="date"
                    name="installedDate"
                    value={form.installedDate}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Warranty
                  <input
                    name="warranty"
                    value={form.warranty}
                    onChange={handleChange}
                    placeholder="e.g. 1 Year"
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Last Service Date
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={form.lastServiceDate}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="machines-field">
                <label>
                  Next Service Date
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={form.nextServiceDate}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            <div className="machines-actions">
              <button type="submit" className="btn-main">
                {editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>

            {message && <p className="machines-message">{message}</p>}
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="machines-list-card">
          <div className="machines-list-header">
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <h3 className="machines-list-title">Machine List</h3>
              <span className="machines-count">Total: {machines.length}</span>
            </div>

            <div style={{display:'flex', gap:10, alignItems:'center'}}>
              <div className="machines-search" role="search" aria-label="Search machines">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="search" placeholder="Search model, serial, customer..." value={search} onChange={(e)=> setSearch(e.target.value)} aria-label="Search machines" />
              </div>
            </div>
          </div> 

          <div className="table-wrapper">
            <table className="machines-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Model</th>
                  <th>Serial</th>
                  <th>Cap</th>
                  <th>Reg No</th>
                  <th>ID No</th>
                  <th>Installed</th>
                  <th>Warranty</th>
                  <th>Last Service</th>
                  <th>Next Service</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((m) => {
                  const customer = customers.find((c) => c.id === m.customerId);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div className="avatar" style={{background: avatarColor(customer?.customerName)}}>{getInitials(customer?.customerName)}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontWeight:600, color:'#071235', overflowWrap:'anywhere', maxWidth:300}}>{customer ? customer.customerName : m.customerId}</div>
                            <div className="customers-tags" style={{marginTop:4}}>{customer?.location || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{m.model}</td>
                      <td>{m.serialNumber}</td>
                      <td>{m.capacity}</td>
                      <td>{m.regNo}</td>
                      <td>{m.idNo}</td>
                      <td>{toDateOnly(m.installedDate)}</td>
                      <td>{m.warranty}</td>
                      <td>{toDateOnly(m.lastServiceDate)}</td>
                      <td>{toDateOnly(m.nextServiceDate)}</td>
                      <td>
                        <div className="machines-actions-cell">
                          <button
                            type="button"
                            className="btn-small btn-edit"
                            onClick={() => handleEdit(m)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-small btn-delete"
                            onClick={() => handleDelete(m.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {machines.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center" }}>
                      No machines yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MachinesPage;
