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
      setCustomers(res.data || []);
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

  // filter by search text
  const filteredCustomers = customers.filter((c) => {
    const text = (
      (c.customerName || "") +
      " " +
      (c.location || "") +
      " " +
      (c.phone || "") +
      " " +
      (c.email || "")
    ).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="customers-page">
      {/* INLINE CSS FOR THIS PAGE */}
      <style>{`
        .customers-page {
          padding: 16px 0 32px;
          font-family: Arial, sans-serif;
        }
        .customers-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;
        }
        .customers-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }
        .customers-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }
        .customers-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 2fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .customers-layout {
            grid-template-columns: 1fr;
          }
        }
        .customers-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 16px 18px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        /* form styles */
        .customers-form-title {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 600;
        }
        .customers-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .customers-label {
          display: flex;
          flex-direction: column;
          font-size: 13px;
        }
        .customers-label span {
          margin-bottom: 2px;
        }
        .customers-input,
        .customers-textarea {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          font-size: 13px;
        }
        .customers-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .customers-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .btn-main {
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: #003366;
          color: #ffffff;
        }
        .btn-main:hover {
          background: #002244;
        }
        .btn-secondary {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: #ffffff;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #f3f4f6;
        }
        .customers-message {
          margin-top: 8px;
          font-size: 13px;
          color: green;
        }

        /* right side: search + table */
        .customers-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          gap: 8px;
          flex-wrap: wrap;
        }
        .customers-list-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .customers-search {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .customers-search input {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          font-size: 13px;
          min-width: 180px;
        }

        .customers-table-actions button {
          border-radius: 4px;
          border: 1px solid #d1d5db;
          padding: 4px 8px;
          font-size: 12px;
          margin-right: 4px;
          cursor: pointer;
        }
        .customers-table-actions button:first-child {
          background: #e0f2fe;
          border-color: #60a5fa;
        }
        .customers-table-actions button:last-child {
          background: #fee2e2;
          border-color: #f87171;
        }
      `}</style>

      {/* HEADER */}
      <div className="customers-header">
        <div>
          <h2 className="customers-title">Customers</h2>
          <p className="customers-subtitle">
            Manage customer details used for service reports and reminders.
          </p>
        </div>
      </div>

      <div className="customers-layout">
        {/* LEFT: FORM */}
        <div className="customers-card">
          <h3 className="customers-form-title">
            {editingId ? "Edit Customer" : "Add New Customer"}
          </h3>

          <form onSubmit={handleSubmit} className="customers-form-grid">
            <label className="customers-label">
              <span>Name</span>
              <input
                name="customerName"
                className="customers-input"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="customers-label">
              <span>Location</span>
              <input
                name="location"
                className="customers-input"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <label className="customers-label">
              <span>Phone</span>
              <input
                name="phone"
                className="customers-input"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label className="customers-label">
              <span>Email</span>
              <input
                type="email"
                name="email"
                className="customers-input"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="customers-label">
              <span>Address</span>
              <textarea
                name="address"
                className="customers-textarea"
                value={form.address}
                onChange={handleChange}
                required
              />
            </label>

            <div className="customers-actions">
              <button type="submit" className="btn-main">
                {editingId ? "Update Customer" : "Save Customer"}
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

            {message && (
              <p className="customers-message">{message}</p>
            )}
          </form>
        </div>

        {/* RIGHT: LIST + SEARCH */}
        <div className="customers-card">
          <div className="customers-list-header">
            <h3 className="customers-list-title">Customer List</h3>
            <div className="customers-search">
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Search
              </span>
              <input
                type="text"
                placeholder="Name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.customerName}</td>
                    <td>{c.location}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{c.address}</td>
                    <td className="customers-table-actions">
                      <button onClick={() => handleEdit(c)}>Edit</button>
                      <button onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
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
