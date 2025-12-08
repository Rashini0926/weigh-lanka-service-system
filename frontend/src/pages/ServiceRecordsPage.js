import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

function addOneYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function ServiceRecordsPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    customerId: "",
    machineId: "",
    serviceDate: todayStr,
    nextServiceDate: addOneYear(todayStr),
    technicianName: "",
    remarks: "",
    serviceCost: "",
    visitNo: "",
    invoiceNo: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // 🔍 FILTER STATE
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterMachineId, setFilterMachineId] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const loadAll = async () => {
    try {
      const [custRes, machRes, recRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/customers`),
        axios.get(`${API_BASE_URL}/machines`),
        axios.get(`${API_BASE_URL}/service-records`),
      ]);
      setCustomers(custRes.data);
      setMachines(machRes.data);
      setRecords(recRes.data);
    } catch (err) {
      console.error("Error loading service records:", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceDate") {
      setForm((prev) => ({
        ...prev,
        serviceDate: value,
        nextServiceDate: addOneYear(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomerChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      customerId: value,
      machineId: "", // reset machine
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      customerId: form.customerId,
      machineId: form.machineId,
      serviceDate: form.serviceDate,
      nextServiceDate: form.nextServiceDate,
      technicianName: form.technicianName,
      remarks: form.remarks,
      serviceCost: parseFloat(form.serviceCost || 0),
      visitNo: parseInt(form.visitNo || "0", 10),
      invoiceNo: form.invoiceNo,
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/service-records/${editingId}`,
          payload
        );
        setMessage("Service record updated.");
      } else {
        await axios.post(`${API_BASE_URL}/service-records`, payload);
        setMessage("Service record saved.");
      }

      setForm((prev) => ({
        ...prev,
        technicianName: "",
        remarks: "",
        serviceCost: "",
        visitNo: "",
        invoiceNo: "",
      }));
      setEditingId(null);
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save service record.");
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      customerId: record.customerId || "",
      machineId: record.machineId || "",
      serviceDate: record.serviceDate || todayStr,
      nextServiceDate: record.nextServiceDate || addOneYear(record.serviceDate),
      technicianName: record.technicianName || "",
      remarks: record.remarks || "",
      serviceCost: record.serviceCost != null ? record.serviceCost : "",
      visitNo: record.visitNo != null ? record.visitNo : "",
      invoiceNo: record.invoiceNo || "",
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/service-records/${id}`);
      setMessage("Service record deleted.");
      if (editingId === id) {
        handleCancelEdit();
      }
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete service record.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      customerId: "",
      machineId: "",
      serviceDate: todayStr,
      nextServiceDate: addOneYear(todayStr),
      technicianName: "",
      remarks: "",
      serviceCost: "",
      visitNo: "",
      invoiceNo: "",
    });
    setMessage("");
  };

  const filteredMachinesForm = form.customerId
    ? machines.filter((m) => m.customerId === form.customerId)
    : machines;

  // machines for FILTER (based on filterCustomerId)
  const filteredMachinesFilter = filterCustomerId
    ? machines.filter((m) => m.customerId === filterCustomerId)
    : machines;

  const resolveCustomer = (customerId) =>
    customers.find((c) => c.id === customerId);

  const resolveMachine = (machineId) =>
    machines.find((m) => m.id === machineId);

  // 🔍 APPLY FILTERS to records
  const filteredRecords = records.filter((r) => {
    // customer filter
    if (filterCustomerId && r.customerId !== filterCustomerId) return false;

    // machine filter
    if (filterMachineId && r.machineId !== filterMachineId) return false;

    // date range filter (by serviceDate)
    if (filterFromDate && (!r.serviceDate || r.serviceDate < filterFromDate)) {
      return false;
    }
    if (filterToDate && (!r.serviceDate || r.serviceDate > filterToDate)) {
      return false;
    }

    return true;
  });

  return (
    <div className="service-records-page">
      {/* Inline CSS just for this page */}
      <style>{`
        .service-records-page {
          padding: 16px 24px 32px;
          background: #f5f5f5;
          min-height: calc(100vh - 60px);
          font-family: Arial, sans-serif;
        }

        .sr-header {
          margin-bottom: 14px;
        }

        .sr-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .sr-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .sr-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr);
          gap: 16px;
        }

        @media (max-width: 950px) {
          .sr-layout {
            grid-template-columns: 1fr;
          }
        }

        .sr-card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
          padding: 14px 16px;
        }

        .sr-section-title {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .sr-muted {
          font-size: 13px;
          color: #6b7280;
        }

        .sr-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px 10px;
          margin-top: 8px;
        }

        .sr-filter-field label {
          font-size: 13px;
          color: #111827;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sr-filter-field select,
        .sr-filter-field input {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
        }

        .sr-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
          margin-top: 10px;
        }

        @media (max-width: 700px) {
          .sr-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .sr-form-field label {
          font-size: 13px;
          color: #111827;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sr-form-field input,
        .sr-form-field select,
        .sr-form-field textarea {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
        }

        .sr-form-field textarea {
          min-height: 70px;
          resize: vertical;
        }

        .sr-full-row {
          grid-column: 1 / -1;
        }

        .sr-actions-row {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
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

        .sr-message {
          margin-top: 8px;
          font-size: 13px;
          color: green;
        }

        .sr-table-card {
          display: flex;
          flex-direction: column;
        }

        .sr-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .sr-table-caption {
          font-size: 12px;
          color: #6b7280;
        }

        .sr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .sr-table th,
        .sr-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }

        .sr-table th {
          background: #f3f4f6;
          font-size: 12px;
        }

        .sr-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .sr-table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="sr-header">
        <h2 className="sr-title">Service Records</h2>
        <p className="sr-subtitle">
          View and update past services. Filter by customer, machine or date.
        </p>
      </div>

      {/* FILTER + FORM + TABLE LAYOUT */}
      <div className="sr-layout">
        {/* LEFT COLUMN: Filters + Form */}
        <div>
          {/* FILTERS CARD */}
          <div className="sr-card" style={{ marginBottom: "12px" }}>
            <h3 className="sr-section-title">Filters</h3>
            <p className="sr-muted">Refine records by customer, machine or date.</p>
            <div className="sr-filter-grid">
              <div className="sr-filter-field">
                <label>
                  Customer
                  <select
                    value={filterCustomerId}
                    onChange={(e) => {
                      setFilterCustomerId(e.target.value);
                      setFilterMachineId("");
                    }}
                  >
                    <option value="">All Customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="sr-filter-field">
                <label>
                  Machine
                  <select
                    value={filterMachineId}
                    onChange={(e) => setFilterMachineId(e.target.value)}
                  >
                    <option value="">All Machines</option>
                    {filteredMachinesFilter.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.model} / {m.serialNumber}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="sr-filter-field">
                <label>
                  From
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                  />
                </label>
              </div>

              <div className="sr-filter-field">
                <label>
                  To
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFilterCustomerId("");
                  setFilterMachineId("");
                  setFilterFromDate("");
                  setFilterToDate("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="sr-card">
            <h3 className="sr-section-title">
              {editingId ? "Edit Service Record" : "New Service Record"}
            </h3>
            <p className="sr-muted">
              Next service auto-fills one year after the service date.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="sr-form-grid">
                <div className="sr-form-field sr-full-row">
                  <label>
                    Customer
                    <select
                      name="customerId"
                      value={form.customerId}
                      onChange={handleCustomerChange}
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

                <div className="sr-form-field sr-full-row">
                  <label>
                    Machine
                    <select
                      name="machineId"
                      value={form.machineId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Machine --</option>
                      {filteredMachinesForm.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.model} / {m.serialNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Service Date
                    <input
                      type="date"
                      name="serviceDate"
                      value={form.serviceDate}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Next Service Date
                    <input
                      type="date"
                      name="nextServiceDate"
                      value={form.nextServiceDate}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Invoice No
                    <input
                      name="invoiceNo"
                      value={form.invoiceNo}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 15853-2"
                    />
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Visit No
                    <input
                      type="number"
                      name="visitNo"
                      value={form.visitNo}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Technician
                    <input
                      name="technicianName"
                      value={form.technicianName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Tharindu"
                    />
                  </label>
                </div>

                <div className="sr-form-field">
                  <label>
                    Service Cost
                    <input
                      type="number"
                      name="serviceCost"
                      value={form.serviceCost}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                    />
                  </label>
                </div>

                <div className="sr-form-field sr-full-row">
                  <label>
                    Remarks
                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Notes about this service..."
                    />
                  </label>
                </div>
              </div>

              <div className="sr-actions-row">
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

              {message && <p className="sr-message">{message}</p>}
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: TABLE */}
        <div className="sr-card sr-table-card">
          <div className="sr-table-header">
            <h3 className="sr-section-title">All Service Records</h3>
            <span className="sr-table-caption">
              {filteredRecords.length} record(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Service Date</th>
                  <th>Next Service</th>
                  <th>Customer</th>
                  <th>Machine</th>
                  <th>Invoice</th>
                  <th>Visit</th>
                  <th>Technician</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => {
                  const c = resolveCustomer(r.customerId);
                  const m = resolveMachine(r.machineId);
                  return (
                    <tr key={r.id}>
                      <td>{r.serviceDate}</td>
                      <td>{r.nextServiceDate}</td>
                      <td>{c ? c.customerName : r.customerId}</td>
                      <td>{m ? `${m.model} / ${m.serialNumber}` : r.machineId}</td>
                      <td>{r.invoiceNo}</td>
                      <td>{r.visitNo}</td>
                      <td>{r.technicianName}</td>
                      <td>{r.serviceCost}</td>
                      <td>
                        <div className="sr-table-actions">
                          <button
                            type="button"
                            className="btn-small btn-edit"
                            onClick={() => handleEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-small btn-delete"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center" }}>
                      No service records found.
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

export default ServiceRecordsPage;
