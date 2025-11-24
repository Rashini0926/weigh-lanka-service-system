import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error loading customers", err);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    await axios.delete(`http://localhost:9090/api/customers/${id}`);
    loadCustomers();
  };

  return (
    <div>
      <h2>Customer List</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.customerName}</td>
              <td>{c.address}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>
                <Link to={`/edit-customer/${c.id}`}>
                  <button>Edit</button>
                </Link>

                <button onClick={() => deleteCustomer(c.id)} style={{ marginLeft: 10 }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default CustomerList;
