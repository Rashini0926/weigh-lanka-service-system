import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCustomer() {
  const [customer, setCustomer] = useState({
    customerName: "",
    address: "",
    phone: "",
    email: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:9090/api/customers", customer);
      navigate("/customers");  // Redirect to customers page
    } catch (err) {
      console.error("Error saving customer", err);
      alert("Backend error occurred");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Add New Customer</h2>

      <form onSubmit={saveCustomer} style={styles.form}>
        <label>Name</label>
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={customer.customerName}
          onChange={handleChange}
          required
        />

        <label>Address</label>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={customer.address}
          onChange={handleChange}
          required
        />

        <label>Phone</label>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={customer.phone}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={customer.email}
          onChange={handleChange}
          required
        />

        <button type="submit" style={styles.btnSave}>Save Customer</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    paddingLeft: "270px",   // FIX: prevent hiding behind sidebar
    paddingTop: "20px",
  },
  form: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  btnSave: {
    padding: "10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default AddCustomer;
