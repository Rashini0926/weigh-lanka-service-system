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

  // UI helpers: search query and CSV export
  const [query, setQuery] = useState("");

  function csvFromRecords(rows) {
    const headers = ["Service Date","Next Service","Customer","Machine","Invoice","Visit","Technician","Cost","Remarks"];
    const lines = [headers.join(",")];
    (rows || []).forEach((r) => {
      const cust = customers.find((c)=>c.id===r.customerId);
      const mach = machines.find((m)=>m.id===r.machineId);
      const safe = (v) => `"${String(v||"").replace(/"/g,'""')}"`;
      lines.push([
        r.serviceDate,
        r.nextServiceDate,
        safe(cust?cust.customerName:r.customerId),
        safe(mach?`${mach.model} / ${mach.serialNumber}`:r.machineId),
        safe(r.invoiceNo),
        r.visitNo,
        safe(r.technicianName),
        r.serviceCost,
        safe(r.remarks),
      ].join(","));
    });
    return lines.join("\n");
  }

  const handleExportCsv = () => {
    try {
      const csv = csvFromRecords(filteredRecords);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `service-records-${todayStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed", err);
    }
  }; 

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

    // search query: invoice, customer name, technician, location
    const q = (query || "").trim().toLowerCase();
    if (q) {
      const cust = customers.find((c) => c.id === r.customerId);
      const mach = machines.find((m) => m.id === r.machineId);
      const fields = [
        String(r.invoiceNo || ""),
        String(cust ? cust.customerName : ""),
        String(r.technicianName || ""),
        String(cust ? cust.location : ""),
      ].join(" ").toLowerCase();
      if (!fields.includes(q)) return false;
    }

    return true;
  }); 

  return (
    <div className="service-records-page">
      {/* Page-specific styling (modern) */}
      <style>{`
        :root{ --bg-1:#c7d2fe; --bg-2:#f8fafc; --muted:#374151; --accent:#1e40af; }

        .service-records-page{ padding:28px 20px; background: radial-gradient(900px 300px at 6% 6%, rgba(37,99,235,0.32), transparent 18%), linear-gradient(180deg,var(--bg-1),var(--bg-2)); min-height:100vh; font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto; }

        .sr-header{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        .sr-title{ margin:0; font-size:22px; font-weight:800; color:#0b1325; }
        .sr-subtitle{ margin:0; color:var(--muted); }

        .sr-layout{ display:grid; grid-template-columns: minmax(0,1.25fr) minmax(0,1.85fr); gap:18px; }
        @media(max-width:980px){ .sr-layout{ grid-template-columns:1fr; } }

        .sr-card{ background: rgba(255,255,255,0.96); border-radius:12px; padding:16px; box-shadow:0 28px 80px rgba(15,23,42,0.12); border:1px solid rgba(15,23,42,0.06); }
        .sr-section-title{ margin:0 0 6px; font-size:16px; font-weight:700; color:#0b1325; }
        .sr-muted{ color:var(--muted); font-size:13px; margin-bottom:6px; }

        .sr-filter-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:10px; margin-top:10px; }
        .sr-filter-field label{ font-size:13px; color:#0b1325; display:flex; flex-direction:column; gap:6px; }
        .sr-filter-field select, .sr-filter-field input{ padding:8px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.08); background:linear-gradient(180deg,rgba(255,255,255,0.7), rgba(250,250,250,0.7)); }

        .sr-form-grid{ display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:12px; margin-top:12px; }
        @media(max-width:700px){ .sr-form-grid{ grid-template-columns:1fr; } }
        .sr-form-field label{ font-size:13px; color:#0b1325; display:flex; gap:6px; flex-direction:column; }
        .sr-form-field input, .sr-form-field select, .sr-form-field textarea{ padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.08); background:linear-gradient(180deg,rgba(255,255,255,0.7), rgba(250,250,250,0.7)); }
        .sr-form-field textarea{ min-height:90px; }

        .sr-actions-row{ margin-top:12px; display:flex; gap:10px; align-items:center; }
        .btn-main{ border-radius:10px; padding:10px 14px; background:linear-gradient(90deg,var(--accent),#2563eb); color:#fff; border:none; font-weight:800; box-shadow:0 14px 36px rgba(30,64,175,0.14); }
        .btn-secondary{ border-radius:10px; padding:8px 12px; background:transparent; border:1px solid rgba(15,23,42,0.08); color:var(--muted); }

        /* table area */
        .sr-table-card{ display:flex; flex-direction:column; }
        .sr-table-header{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px; }
        .sr-table-caption{ color:var(--muted); }

        .sr-table-controls{ display:flex; gap:10px; align-items:center; }
        .sr-search{ display:flex; align-items:center; gap:8px; background:#eef2ff; padding:8px 10px; border-radius:10px; min-width:220px; }
        .sr-search input{ border:0; background:transparent; outline:none; font-size:14px; }

        .sr-table{ width:100%; border-collapse:separate; border-spacing:0; font-size:13px; min-width:900px; }
        .sr-table thead th{ background: rgba(15,23,42,0.95); color:#fff; padding:12px; font-size:12px; position:sticky; top:0; z-index:3; text-transform:uppercase; }
        .sr-table td{ padding:12px; border-bottom:1px solid rgba(15,23,42,0.06); }
        .sr-table tbody tr:nth-child(even){ background: rgba(15,23,42,0.03); }
        .sr-table tbody tr:hover{ background: rgba(79,70,229,0.04); }

        .sr-table-actions{ display:flex; gap:8px; }
        .btn-edit{ background:#eef2ff; color:#3730a3; border-radius:8px; padding:6px 10px; }
        .btn-delete{ background:#fff1f2; color:#8b1d1d; border-radius:8px; padding:6px 10px; }

        .empty{ text-align:center; padding:30px; color:var(--muted); }

        @media(max-width:900px){ .sr-table{ min-width:700px; } }
        @media print{ .sr-card{ box-shadow:none; border:none; } }
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
            <div>
              <h3 className="sr-section-title">All Service Records</h3>
              <div className="sr-table-caption">Showing {filteredRecords.length} record(s)</div>
            </div>

            <div className="sr-table-controls">
              <div className="sr-search" role="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input placeholder="Search invoice, customer, technician" value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>

              <button type="button" className="btn-secondary" onClick={handleExportCsv}>Export CSV</button>
            </div>
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
