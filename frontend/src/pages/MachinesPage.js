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
      {/* Inline CSS specific to this page */}
      <style>{`
        .machines-page {
          padding: 16px 24px 24px;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          min-height: calc(100vh - 60px);
        }

        .machines-header {
          margin-bottom: 10px;
        }

        .machines-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .machines-subtitle {
          margin: 2px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .machines-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 2fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .machines-layout {
            grid-template-columns: 1fr;
          }
        }

        /* form card */
        .machines-form-card {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
          padding: 16px 18px;
        }

        .machines-form-title {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .machines-form-helper {
          margin: 0 0 10px;
          font-size: 12px;
          color: #6b7280;
        }

        .machines-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }

        @media (max-width: 700px) {
          .machines-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .machines-full-row {
          grid-column: 1 / -1;
        }

        .machines-field label {
          font-size: 13px;
          color: #111827;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .machines-field input,
        .machines-field select {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
        }

        .machines-actions {
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

        .machines-message {
          margin-top: 8px;
          font-size: 13px;
          color: green;
        }

        /* list card */
        .machines-list-card {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
          padding: 14px 16px;
        }

        .machines-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .machines-list-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .machines-count {
          font-size: 12px;
          color: #6b7280;
        }

        .machines-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .machines-table th,
        .machines-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }

        .machines-table th {
          background: #f3f4f6;
        }

        .machines-actions-cell {
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
            <h3 className="machines-list-title">Machine List</h3>
            <span className="machines-count">Total: {machines.length}</span>
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
                {machines.map((m) => {
                  const customer = customers.find((c) => c.id === m.customerId);
                  return (
                    <tr key={m.id}>
                      <td>{customer ? customer.customerName : m.customerId}</td>
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
