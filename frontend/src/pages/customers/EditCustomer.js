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
      navigate("/");
    } catch (err) {
      console.error("Error updating", err);
    }
  };

  return (
    <div>
      <h2>Edit Customer</h2>

      <form onSubmit={updateCustomer}>
        <input
          type="text"
          name="customerName"
          value={customer.customerName}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="address"
          value={customer.address}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="phone"
          value={customer.phone}
          onChange={handleChange}
        /><br/>

        <input
          type="email"
          name="email"
          value={customer.email}
          onChange={handleChange}
        /><br/>

        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default EditCustomer;
