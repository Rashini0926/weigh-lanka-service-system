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

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
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
      await axios.post(`${API_BASE_URL}/customers`, form);
      setMessage("Customer saved.");
      setForm({
        customerName: "",
        address: "",
        phone: "",
        email: "",
        location: "",
      });
      loadCustomers();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save customer.");
    }
  };

  return (
    <div>
      <h2>Customers</h2>

      <form onSubmit={handleSubmit} className="card form-card">
        <h3>Add Customer</h3>

        <label>
          Name:
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address:
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location:
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone:
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Save Customer</button>

        {message && <p className="info">{message}</p>}
      </form>

      <h3>Customer List</h3>
      <div className="table-wrapper">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.customerName}</td>
                <td>{c.location}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomersPage;
