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
      navigate("/");
    } catch (err) {
      console.error("Error saving customer", err);
      alert("Backend error occurred");
    }
  };

  return (
    <div>
      <h2>Add New Customer</h2>

      <form onSubmit={saveCustomer}>
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={customer.customerName}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={customer.address}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={customer.phone}
          onChange={handleChange}
        /><br/>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={customer.email}
          onChange={handleChange}
        /><br/>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default AddCustomer;
