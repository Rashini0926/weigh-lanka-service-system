import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    customerName: "",
    address: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const res = await axios.get(`http://localhost:9090/api/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error("Error loading customer", err);
    }
  };

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:9090/api/customers/${id}`, customer);
      navigate("/customers");
    } catch (err) {
      console.error("Error updating", err);
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <h2>Edit Customer</h2>

      <form onSubmit={updateCustomer} style={formStyle}>
        <label>Name:</label>
        <input
          type="text"
          name="customerName"
          value={customer.customerName}
          onChange={handleChange}
        />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={customer.address}
          onChange={handleChange}
        />

        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={customer.phone}
          onChange={handleChange}
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={customer.email}
          onChange={handleChange}
        />

        <button type="submit" style={btn}>Update</button>
      </form>
    </div>
  );
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  width: "400px",
  gap: "12px",
  background: "white",
  padding: "20px",
  borderRadius: "6px"
};

const btn = {
  padding: "10px 15px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

export default EditCustomer;
