import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ServiceReportPage from "./pages/ServiceReportPage";
import CustomersPage from "./pages/CustomersPage";
import MachinesPage from "./pages/MachinesPage";
import ServiceEntryPage from "./pages/ServiceEntryPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Weigh Lanka Service System</h1>
          <nav>
            <Link to="/service-entry">Daily Service Entry</Link>
            <Link to="/report">Daily Report</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/machines">Machines</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/service-entry" element={<ServiceEntryPage />} />
            <Route path="/report" element={<ServiceReportPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/machines" element={<MachinesPage />} />
            {/* default page */}
            <Route path="*" element={<ServiceEntryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
