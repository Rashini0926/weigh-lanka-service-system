import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    address: "",
    phone: "",
    email: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        // UPDATE
        await axios.put(`${API_BASE_URL}/customers/${editingId}`, form);
        setMessage("Customer updated.");
      } else {
        // CREATE
        await axios.post(`${API_BASE_URL}/customers`, form);
        setMessage("Customer saved.");
      }

      setForm({
        customerName: "",
        address: "",
        phone: "",
        email: "",
        location: "",
      });
      setEditingId(null);
      loadCustomers();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save customer.");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      customerName: customer.customerName || "",
      address: customer.address || "",
      phone: customer.phone || "",
      email: customer.email || "",
      location: customer.location || "",
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/customers/${id}`);
      setMessage("Customer deleted.");
      if (editingId === id) {
        setEditingId(null);
        setForm({
          customerName: "",
          address: "",
          phone: "",
          email: "",
          location: "",
        });
      }
      loadCustomers();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete customer.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      customerName: "",
      address: "",
      phone: "",
      email: "",
      location: "",
    });
    setMessage("");
  };

  // simple search filter
  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.customerName || "").toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  // UI helpers for avatar
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

  return (
    <div className="customers-page">
      {/* Inline CSS for this page (modernized) */}
      <style>{`
        :root{
          --bg-start: #f8fafc;
          --bg-end: #eef2ff;
          --card-bg: rgba(255,255,255,0.9);
          --accent-1: #7c3aed; /* purple */
          --accent-2: #06b6d4; /* teal */
          --muted: #6b7280;
          --text: #071235;
        }

        .customers-page {
          padding: 20px 28px 28px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: linear-gradient(180deg,var(--bg-start),var(--bg-end));
          min-height: calc(100vh - 60px);
          color: var(--text);
        }

        .customers-header { margin-bottom: 18px; }

        .customers-title { margin: 0; font-size: 24px; font-weight: 700; color: var(--text); }
        .customers-subtitle { margin: 6px 0 0; font-size: 13px; color: var(--muted); }

        .customers-layout { display:grid; grid-template-columns: 1fr 1.5fr; gap: 18px; }
        @media (max-width: 900px){ .customers-layout { grid-template-columns: 1fr; } }

        .customers-form-card, .customers-list-card {
          background: var(--card-bg);
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(11,20,50,0.06);
          border: 1px solid rgba(14,20,50,0.04);
          backdrop-filter: blur(4px);
        }

        .customers-form-title { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: var(--text); }
        .customers-form-grid { display:grid; grid-template-columns: 1fr; gap:10px; }
        @media (min-width:900px){ .customers-form-grid { grid-template-columns: 1fr 1fr; } }

        .customers-form-field label { font-size: 13px; color: #0f172a; display:flex; flex-direction:column; gap:6px; }
        .customers-form-field input, .customers-form-field textarea {
          padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(14,20,50,0.06); font-size: 13px; box-shadow: 0 1px 2px rgba(16,24,40,0.03);
        }
        .customers-form-field input:focus, .customers-form-field textarea:focus { outline:none; box-shadow: 0 6px 18px rgba(99,102,241,0.12); border-color: var(--accent-1); }
        .customers-form-field textarea{ min-height:70px; }

        .customers-actions { display:flex; gap:10px; margin-top:12px; }
        .btn-main { background: linear-gradient(135deg,var(--accent-1),var(--accent-2)); color: #fff; border:none; padding:9px 18px; border-radius:999px; font-weight:700; cursor:pointer; box-shadow: 0 8px 20px rgba(124,58,237,0.18); }
        .btn-main:hover{ transform: translateY(-1px); filter:brightness(.98); }
        .btn-secondary { background: transparent; border: 1px solid rgba(14,20,50,0.06); padding:8px 14px; border-radius:999px; color:var(--text); }

        .customers-message { margin-top:10px; color: #059669; font-weight:600; }

        /* List header */
        .customers-list-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
        .customers-list-title { margin:0; font-size:16px; font-weight:700; color:var(--text); }
        .customers-count { font-size:13px; color:var(--muted); }

        .customers-search { display:flex; align-items:center; gap:8px; background: linear-gradient(180deg,#ffffff,#f8fafc); border-radius:999px; padding:8px 10px; border:1px solid rgba(14,20,50,0.04); box-shadow: 0 4px 12px rgba(11,20,50,0.04); }
        .customers-search svg { display:block; width:16px; height:16px; color:var(--muted); }
        .customers-search input { border:none; background:transparent; font-size:13px; width:220px; color:var(--text); }
        .customers-search input:focus { outline:none; }

        .customers-table { width:100%; border-collapse:collapse; font-size:13px; }
        .customers-table th, .customers-table td { padding:10px 12px; text-align:left; vertical-align:middle; border-bottom:1px solid rgba(14,20,50,0.04); }
        .customers-table thead th { background:transparent; color:var(--muted); font-weight:600; font-size:12px; }
        .customers-table tbody tr { transition: background .12s ease, transform .08s ease; }
        .customers-table tbody tr:hover { background: rgba(6,182,212,0.04); transform: translateY(-1px); }

        .customers-tags { font-size:12px; color:var(--muted); }
        .customers-actions-cell { display:flex; gap:8px; }

        .btn-small { border-radius:999px; padding:6px 12px; font-size:13px; cursor:pointer; border:none; }
        .btn-edit { background: linear-gradient(90deg,#e0f2fe,#bae6fd); color:#024f6a; }
        .btn-delete { background: linear-gradient(90deg,#fff1f2,#fee2e2); color:#991b1b; }

        /* Avatar */
        .avatar { width:36px; height:36px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:13px; box-shadow: 0 4px 10px rgba(2,6,23,0.08); }

        /* Responsive tweaks */
        @media (max-width:700px){ .customers-search input{ width:120px; } .customers-form-grid{ grid-template-columns:1fr; } }
      `}</style> 

      <div className="customers-header">
        <h2 className="customers-title">Customers</h2>
        <p className="customers-subtitle">Add and update customer details.</p>
      </div>

      <div className="customers-layout">
        {/* LEFT: FORM */}
        <div className="customers-form-card">
          <h3 className="customers-form-title">
            {editingId ? "Edit Customer" : "New Customer"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="customers-form-grid">
              <div className="customers-form-field">
                <label>
                  Customer Name
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Priyangani Edirisinghe / Fruit Shop"
                  />
                </label>
              </div>

              <div className="customers-form-field">
                <label>
                  Location / Town
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Embilipitiya"
                  />
                </label>
              </div>

              <div className="customers-form-field">
                <label>
                  Phone Number
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 0771234567"
                  />
                </label>
              </div>

              <div className="customers-form-field">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. customer@example.com"
                  />
                </label>
              </div>

              <div className="customers-form-field">
                <label>
                  Full Address
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="e.g. No.453/C, New Town, Embilipitiya"
                  />
                </label>
              </div>
            </div>

            <div className="customers-actions">
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

            {message && <p className="customers-message">{message}</p>}
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="customers-list-card">
          <div className="customers-list-header">
            <div className="customers-list-title-wrap">
              <h3 className="customers-list-title">Customer List</h3>
              <span className="customers-count">
                {filteredCustomers.length} of {customers.length}
              </span>
            </div>

            <div className="customers-search" role="search" aria-label="Search customers">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="search"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search customers"
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Phone / Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div className="avatar" style={{background: avatarColor(c.customerName)}}>
                          {getInitials(c.customerName)}
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:600, color:'#071235', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.customerName}</div>
                          <div className="customers-tags" style={{marginTop:4}}>{c.email || c.location}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.location}</td>
                    <td>
                      {c.phone}
                      {c.email && (
                        <>
                          <br />
                          <span className="customers-tags">{c.email}</span>
                        </>
                      )}
                    </td>
                    <td>{c.address}</td>
                    <td>
                      <div className="customers-actions-cell">
                        <button
                          type="button"
                          className="btn-small btn-edit"
                          onClick={() => handleEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-small btn-delete"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No customers found.
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

export default CustomersPage;
