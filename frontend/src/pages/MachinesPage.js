import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

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

  const loadMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/machines`);
      setMachines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMachines();
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
      await axios.post(`${API_BASE_URL}/machines`, form);
      setMessage("Machine saved.");
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
      loadMachines();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save machine.");
    }
  };

  return (
    <div>
      <h2>Machines</h2>

      <form onSubmit={handleSubmit} className="card form-card">
        <h3>Add Machine</h3>

        <label>
          Customer:
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

        <label>
          Model:
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Serial Number:
          <input
            name="serialNumber"
            value={form.serialNumber}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Capacity (e.g. 15kg):
          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
          />
        </label>

        <label>
          Reg No:
          <input name="regNo" value={form.regNo} onChange={handleChange} />
        </label>

        <label>
          ID No:
          <input name="idNo" value={form.idNo} onChange={handleChange} />
        </label>

        <label>
          Installed Date:
          <input
            type="date"
            name="installedDate"
            value={form.installedDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Warranty:
          <input
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
          />
        </label>

        <label>
          Last Service Date:
          <input
            type="date"
            name="lastServiceDate"
            value={form.lastServiceDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Next Service Date:
          <input
            type="date"
            name="nextServiceDate"
            value={form.nextServiceDate}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Save Machine</button>
        {message && <p className="info">{message}</p>}
      </form>

      <h3>Machine List</h3>
      <div className="table-wrapper">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Model</th>
              <th>Serial</th>
              <th>Cap</th>
              <th>Reg No</th>
              <th>ID No</th>
              <th>Last Service</th>
              <th>Next Service</th>
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
                  <td>{m.lastServiceDate}</td>
                  <td>{m.nextServiceDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MachinesPage;
