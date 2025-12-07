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
    setForm((prev) => ({ ...prev, [name]: value }));
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
        // UPDATE
        await axios.put(`${API_BASE_URL}/machines/${editingId}`, payload);
        setMessage("Machine updated.");
      } else {
        // CREATE
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
      installedDate: machine.installedDate || "",
      warranty: machine.warranty || "",
      lastServiceDate: machine.lastServiceDate || "",
      nextServiceDate: machine.nextServiceDate || "",
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
    <div>
      <h2>Machines</h2>

      <form onSubmit={handleSubmit} className="card form-card">
        <h3>{editingId ? "Edit Machine" : "Add Machine"}</h3>

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

        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button type="submit">
            {editingId ? "Update Machine" : "Save Machine"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>

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
                  <td>{m.lastServiceDate}</td>
                  <td>{m.nextServiceDate}</td>
                  <td>
                    <button onClick={() => handleEdit(m)}>Edit</button>
                    <button onClick={() => handleDelete(m.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {machines.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  No machines yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MachinesPage;
