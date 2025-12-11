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

  return (
    <div className="customers-page">
      {/* Inline CSS for this page */}
      <style>{`
        .customers-page {
          padding: 16px 24px 24px;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          min-height: calc(100vh - 60px);
        }

        .customers-header {
          margin-bottom: 14px;
        }

        .customers-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
        }

        .customers-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .customers-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.7fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .customers-layout {
            grid-template-columns: 1fr;
          }
        }

        .customers-form-card,
        .customers-list-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 20px rgba(15,23,42,0.06);
          padding: 16px 18px;
          border: 1px solid rgba(226,232,240,0.9);
        }

        .customers-form-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }

        .customers-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .customers-form-field label {
          font-size: 13px;
          color: #111827;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customers-form-field input,
        .customers-form-field textarea {
          padding: 7px 9px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          transition: border-color 0.12s ease, box-shadow 0.12s ease;
        }

        .customers-form-field input:focus,
        .customers-form-field textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37,99,235,0.25);
        }

        .customers-form-field textarea {
          min-height: 60px;
          resize: vertical;
        }

        .customers-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .btn-main {
          border: none;
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #0f172a, #1d4ed8);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s ease, transform 0.1s ease;
        }

        .btn-main:hover {
          background: linear-gradient(135deg, #020617, #1d4ed8);
        }

        .btn-main:active {
          transform: translateY(1px);
        }

        .btn-secondary {
          border: 1px solid #d1d5db;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: #ffffff;
          color: #374151;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .customers-message {
          margin-top: 8px;
          font-size: 13px;
          color: green;
        }

        /* List / table side */
        .customers-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          gap: 10px;
        }

        .customers-list-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .customers-list-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }

        .customers-count {
          font-size: 12px;
          color: #6b7280;
        }

        .customers-search {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f9fafb;
          border-radius: 999px;
          padding: 4px 10px;
          border: 1px solid #e5e7eb;
        }

        .customers-search span {
          font-size: 12px;
          color: #6b7280;
        }

        .customers-search input {
          border: none;
          background: transparent;
          font-size: 12px;
          width: 150px;
        }

        .customers-search input:focus {
          outline: none;
        }

        .customers-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .customers-table th,
        .customers-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }

        .customers-table th {
          background: #f3f4f6;
          font-size: 12px;
          color: #4b5563;
        }

        .customers-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .customers-table tbody tr:hover {
          background: #e0f2fe;
        }

        .customers-tags {
          font-size: 11px;
          color: #6b7280;
        }

        .customers-actions-cell {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn-small {
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          border: none;
          cursor: pointer;
          transition: background 0.12s ease, transform 0.1s ease;
        }

        .btn-small:active {
          transform: translateY(1px);
        }

        .btn-edit {
          background: #e0f2fe;
          color: #0369a1;
        }

        .btn-edit:hover {
          background: #bae6fd;
        }

        .btn-delete {
          background: #fee2e2;
          color: #b91c1c;
        }

        .btn-delete:hover {
          background: #fecaca;
        }
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

            <div className="customers-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search name, town, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    <td>{c.customerName}</td>
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
