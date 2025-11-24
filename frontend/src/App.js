import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// CUSTOMER PAGES
import CustomerList from "./pages/customers/CustomerList";
import AddCustomer from "./pages/customers/AddCustomer";
import EditCustomer from "./pages/customers/EditCustomer";

// MACHINE PAGES
import MachineList from "./pages/machines/MachineList";
import AddMachine from "./pages/machines/AddMachine";
import EditMachine from "./pages/machines/EditMachine";

function App() {
  return (
    <Router>
      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Weigh Lanka System</h2>

        {/* Customer Links */}
        <Link to="/" style={styles.link}>Customers</Link>
        <Link to="/add-customer" style={styles.link}>Add Customer</Link>

        {/* Machine Links */}
        <Link to="/machines" style={styles.link}>Machines</Link>
        <Link to="/add-machine" style={styles.link}>Add Machine</Link>
      </div>

      {/* Page Content */}
      <div style={styles.container}>
        <Routes>

          {/* Customer Routes */}
          <Route path="/" element={<CustomerList />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />

          {/* Machine Routes */}
          <Route path="/machines" element={<MachineList />} />
          <Route path="/add-machine" element={<AddMachine />} />
          <Route path="/edit-machine/:id" element={<EditMachine />} />
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
  logo: { color: "#61dafb", marginRight: "40px" },
  link: { color: "white", textDecoration: "none", fontSize: "18px" },
  container: { padding: "20px" }
};

export default App;
