import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import CustomerList from "./pages/customers/CustomerList";
import AddCustomer from "./pages/customers/AddCustomer";
import EditCustomer from "./pages/customers/EditCustomer";

function App() {
  return (
    <Router>
      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Weigh Lanka System</h2>

        <Link to="/" style={styles.link}>Customers</Link>
        <Link to="/add-customer" style={styles.link}>Add Customer</Link>
      </div>

      {/* Page Content */}
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  navbar: {
    background: "#222",
    padding: "15px",
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  logo: { color: "#61dafb", marginRight: "20px" },
  link: { color: "white", textDecoration: "none", fontSize: "18px" },
  container: { padding: "20px" }
};

export default App;
