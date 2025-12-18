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

function ServiceEntryPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
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
  const [message, setMessage] = useState("");
  const [todayRows, setTodayRows] = useState([]);

  const loadTodayReport = async (dateStr) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/service-records/report`,
        { params: { date: dateStr } }
      );
      setTodayRows(res.data);
    } catch (err) {
      console.error("Failed to load today report", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, machRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/machines`),
        ]);
        setCustomers(custRes.data);
        setMachines(machRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
    loadTodayReport(todayStr);
  }, [todayStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceDate") {
      setForm((prev) => ({
        ...prev,
        serviceDate: value,
        nextServiceDate: addOneYear(value),
      }));
      // refresh table for new date
      loadTodayReport(value);
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

    // Ensure machine knows correct customer
    const machine = machines.find((m) => m.id === form.machineId);
    const customerId = machine ? machine.customerId : form.customerId;

    const payload = {
      customerId: customerId,
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
      await axios.post(`${API_BASE_URL}/service-records`, payload);
      setMessage("Service record saved.");

      // Clear only some fields
      setForm((prev) => ({
        ...prev,
        technicianName: "",
        remarks: "",
        serviceCost: "",
        visitNo: "",
        invoiceNo: "",
      }));

      // reload today's rows for table
      loadTodayReport(form.serviceDate);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save service record.");
    }
  };

  const filteredMachines = form.customerId
    ? machines.filter((m) => m.customerId === form.customerId)
    : machines;

  return (
    <div className="se-page">
      {/* Page-specific styling */}
      <style>{`
        :root{
          --bg-1: #f3f6ff;
          --bg-2: #ffffff;
          --accent: #4f46e5;
          --muted: #6b7280;
          --card: rgba(255,255,255,0.86);
        }

        .se-page {
          padding: 28px 20px;
          background: radial-gradient(800px 300px at 10% 0%, rgba(79,70,229,0.06), transparent 12%), linear-gradient(180deg, var(--bg-1), var(--bg-2));
          min-height: calc(100vh - 60px);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          position: relative;
          overflow: hidden;
        }

        .decor-blob{
          position: absolute;
          right: -80px;
          top: -80px;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle at 30% 30%, rgba(79,70,229,0.16), transparent 28%), radial-gradient(circle at 70% 70%, rgba(59,130,246,0.06), transparent 30%);
          filter: blur(36px);
          transform: rotate(8deg);
          z-index: 1;
          pointer-events: none;
        }

        .se-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom: 18px;
          position:relative;
          z-index:2;
        }

        .se-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
        }

        .se-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--muted);
        }

        .se-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
          gap: 18px;
          position:relative;
          z-index:2;
        }

        @media (max-width: 950px) {
          .se-layout {
            grid-template-columns: 1fr;
          }
        }

        .se-card {
          background: var(--card);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.06);
          padding: 18px;
          border: 1px solid rgba(15,23,42,0.04);
        }

        .se-section-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .se-muted {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
        }

        .se-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 14px;
          margin-top: 12px;
        }

        @media (max-width: 700px) {
          .se-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .se-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: #111827;
        }

        .se-form-field label{ font-size:13px; font-weight:600; color:#0f172a; }

        .se-form-field input,
        .se-form-field select,
        .se-form-field textarea {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.06);
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,250,250,0.6));
          font-size: 14px;
          outline: none;
          transition: box-shadow .12s ease, border-color .12s ease, transform .06s ease;
        }

        .se-form-field input:focus,
        .se-form-field select:focus,
        .se-form-field textarea:focus{
          border-color: var(--accent);
          box-shadow: 0 6px 20px rgba(79,70,229,0.08);
          transform: translateY(-1px);
        }

        .se-form-field textarea {
          min-height: 80px;
          resize: vertical;
        }

        .se-form-full {
          grid-column: 1 / -1;
        }

        .se-actions {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .se-btn-main {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(90deg, var(--accent), #2563eb);
          color: #ffffff;
          box-shadow: 0 8px 30px rgba(37,99,235,0.12);
        }

        .se-btn-main:hover {
          filter: brightness(.98);
          transform: translateY(-1px);
        }

        .se-info {
          margin-top: 8px;
          font-size: 13px;
          color: green;
        }

        .se-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .se-table-caption {
          font-size: 12px;
          color: var(--muted);
        }

        .table-wrapper{ overflow:auto; border-radius:8px; }

        .se-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
          min-width: 900px;
          background: transparent;
        }

        .se-table th,
        .se-table td {
          padding: 10px 12px;
          text-align: left;
          vertical-align: middle;
        }

        .se-table thead th{
          background: rgba(247,250,255,0.8);
          position: sticky;
          top:0;
          z-index:3;
          font-size:12px;
          text-transform:uppercase;
          color:var(--muted);
          border-bottom:1px solid rgba(15,23,42,0.04);
        }

        .se-table tbody tr{ background: #fff; border-bottom: 1px solid rgba(15,23,42,0.03); }
        .se-table tbody tr:hover{ background: rgba(37,99,235,0.02); }

        .se-footer-note {
          margin-top: 12px;
          font-size: 13px;
          color: var(--muted);
          position:relative;
          z-index:2;
        }

        .empty-row{ text-align:center; padding:18px; color:var(--muted); }
      `}</style>

      <div className="se-header">
        <h2 className="se-title">Daily Service Entry</h2>
        <p className="se-subtitle">
          Record services for the selected date. Next service auto-fills +1 year.
        </p>
      </div>

      <div className="decor-blob" aria-hidden="true" />

      <div className="se-layout">
        {/* LEFT: FORM */}
        <div className="se-card">
          <h3 className="se-section-title">New Service Record</h3>

          <form onSubmit={handleSubmit}>
            <div className="se-form-grid">
              <div className="se-form-field se-form-full">
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

              <div className="se-form-field se-form-full">
                <label>
                  Machine
                  <select
                    name="machineId"
                    value={form.machineId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Machine --</option>
                    {filteredMachines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.model} / {m.serialNumber}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="se-form-field">
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

              <div className="se-form-field">
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

              <div className="se-form-field">
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

              <div className="se-form-field">
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

              <div className="se-form-field">
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

              <div className="se-form-field">
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

              <div className="se-form-field se-form-full">
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

            <div className="se-actions">
              <button type="submit" className="se-btn-main">
                Save Record
              </button>
            </div>

            {message && <p className="se-info">{message}</p>}
          </form>
        </div>

        {/* RIGHT: TODAY TABLE */}
        <div className="se-card">
          <div className="se-table-header">
            <div>
              <h3 className="se-section-title">
                Entries for {form.serviceDate}
              </h3>
              <p className="se-muted">
                Generated report-style view from the backend.
              </p>
            </div>
            <span className="se-table-caption">
              {todayRows.length} record(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table className="se-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>No</th>
                  <th>Inv No</th>
                  <th>Name &amp; Address</th>
                  <th>Location</th>
                  <th>Tel</th>
                  <th>Model</th>
                  <th>Serial No</th>
                  <th>Cap</th>
                  <th>Reg No</th>
                  <th>ID No</th>
                  <th>Serviced By</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td>{row.no}</td>
                    <td>{row.invoiceNo}</td>
                    <td>{row.nameAndAddress}</td>
                    <td>{row.location}</td>
                    <td>{row.tel}</td>
                    <td>{row.model}</td>
                    <td>{row.serialNo}</td>
                    <td>{row.cap}</td>
                    <td>{row.regNo}</td>
                    <td>{row.idNo}</td>
                    <td>{row.servicedBy}</td>
                  </tr>
                ))}
                {todayRows.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center" }}>
                      No records for this date yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="se-footer-note">
        ⚠️ Reminder emails are sent on <strong>Next Service Date</strong> by the
        backend. Keep this date accurate for yearly reminders.
      </p>
    </div>
  );
}

export default ServiceEntryPage;
