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
    <div>
      <h2>Service Records (CRUD + Filter)</h2>

      {/* ------- FILTERS AT TOP ------- */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3>Filter Records</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "8px",
          }}
        >
          <div>
            <label style={{ fontSize: "13px" }}>
              Customer:
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

          <div>
            <label style={{ fontSize: "13px" }}>
              Machine:
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

          <div>
            <label style={{ fontSize: "13px" }}>
              From (Service Date):
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label style={{ fontSize: "13px" }}>
              To (Service Date):
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </label>
          </div>
        </div>
        <button
          type="button"
          style={{ marginTop: "8px" }}
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

      {/* ------- FORM ------- */}
      <form onSubmit={handleSubmit} className="card form-card">
        <h3>{editingId ? "Edit Service Record" : "Add Service Record"}</h3>

        <label>
          Customer:
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

        <label>
          Machine:
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

        <label>
          Service Date:
          <input
            type="date"
            name="serviceDate"
            value={form.serviceDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Next Service Date:
          <input
            type="date"
            name="nextServiceDate"
            value={form.nextServiceDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Invoice No:
          <input
            name="invoiceNo"
            value={form.invoiceNo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Visit No:
          <input
            type="number"
            name="visitNo"
            value={form.visitNo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Technician:
          <input
            name="technicianName"
            value={form.technicianName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Service Cost:
          <input
            type="number"
            name="serviceCost"
            value={form.serviceCost}
            onChange={handleChange}
          />
        </label>

        <label>
          Remarks:
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
          />
        </label>

        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button type="submit">
            {editingId ? "Update Record" : "Save Record"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>

        {message && <p className="info">{message}</p>}
      </form>

      {/* ------- TABLE ------- */}
      <h3>All Service Records</h3>
      <div className="table-wrapper">
        <table className="simple-table">
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
                    <button onClick={() => handleEdit(r)}>Edit</button>
                    <button onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  No service records found with current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServiceRecordsPage;
