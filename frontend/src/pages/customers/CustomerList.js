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
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <div style={styles.header}>
        <h2>Customer List</h2>

        {/* Add Customer Button */}
        <Link to="/add-customer">
          <button style={styles.addBtn}>+ Add Customer</button>
        </Link>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.customerName}</td>
              <td style={tdStyle}>{c.address}</td>
              <td style={tdStyle}>{c.phone}</td>
              <td style={tdStyle}>{c.email}</td>
              <td style={tdStyle}>
                <Link to={`/edit-customer/${c.id}`}>
                  <button style={btnEdit}>Edit</button>
                </Link>

                <button onClick={() => deleteCustomer(c.id)} style={btnDelete}>
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

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  addBtn: {
    background: "#2e7d32",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

const btnEdit = {
  padding: "5px 10px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const btnDelete = {
  padding: "5px 10px",
  marginLeft: "10px",
  background: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default CustomerList;
