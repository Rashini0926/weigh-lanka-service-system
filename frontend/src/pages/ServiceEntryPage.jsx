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
        .se-page {
          padding: 16px 24px 32px;
          background: #f5f5f5;
          min-height: calc(100vh - 60px);
          font-family: Arial, sans-serif;
        }

        .se-header {
          margin-bottom: 14px;
        }

        .se-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .se-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .se-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
          gap: 16px;
        }

        @media (max-width: 950px) {
          .se-layout {
            grid-template-columns: 1fr;
          }
        }

        .se-card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
          padding: 14px 16px;
        }

        .se-section-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .se-muted {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        .se-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
          margin-top: 10px;
        }

        @media (max-width: 700px) {
          .se-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .se-form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: #111827;
        }

        .se-form-field input,
        .se-form-field select,
        .se-form-field textarea {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
        }

        .se-form-field textarea {
          min-height: 60px;
          resize: vertical;
        }

        .se-form-full {
          grid-column: 1 / -1;
        }

        .se-actions {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .se-btn-main {
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: #003366;
          color: #ffffff;
        }

        .se-btn-main:hover {
          background: #002244;
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
          margin-bottom: 6px;
        }

        .se-table-caption {
          font-size: 12px;
          color: #6b7280;
        }

        .se-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .se-table th,
        .se-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }

        .se-table th {
          background: #f3f4f6;
          font-size: 12px;
        }

        .se-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .se-footer-note {
          margin-top: 12px;
          font-size: 13px;
          color: #4b5563;
        }
      `}</style>

      <div className="se-header">
        <h2 className="se-title">Daily Service Entry</h2>
        <p className="se-subtitle">
          Record services for the selected date. Next service auto-fills +1 year.
        </p>
      </div>

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
