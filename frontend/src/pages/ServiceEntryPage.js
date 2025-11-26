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
  }, []); // run once

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When serviceDate changes, auto compute nextServiceDate = +1 year
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

    // Ensure machine knows the correct customer
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
    <div>
      <h2>Daily Service Entry</h2>

      <form onSubmit={handleSubmit} className="card form-card">
        <h3>New Service Record</h3>

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
            {filteredMachines.map((m) => (
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
          Next Service Date (1 year later, can edit):
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

        <button type="submit">Save Record</button>

        {message && <p className="info">{message}</p>}
      </form>

      <h3>Entries for {form.serviceDate}</h3>
      <div className="table-wrapper">
        <table className="report-table">
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
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "10px", fontSize: "13px" }}>
        ⚠️ Reminder emails are sent automatically on{" "}
        <strong>Next Service Date</strong> by the backend scheduler. As long as
        this date is correct, yearly reminders will work.
      </p>
    </div>
  );
}

export default ServiceEntryPage;
