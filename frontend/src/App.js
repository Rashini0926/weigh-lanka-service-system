import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";

import CustomerList from "./pages/customers/CustomerList";
import AddCustomer from "./pages/customers/AddCustomer";
import EditCustomer from "./pages/customers/EditCustomer";

import MachineList from "./pages/machines/MachineList";
import AddMachine from "./pages/machines/AddMachine";
import EditMachine from "./pages/machines/EditMachine";

import ServiceRecordList from "./pages/serviceRecords/ServiceRecordList";
import AddServiceRecord from "./pages/serviceRecords/AddServiceRecord";
import EditServiceRecord from "./pages/serviceRecords/EditServiceRecord";

// ⭐ NEW ⭐ Reminder Page
import ReminderPage from "./pages/reminders/ReminderPage";
import ReminderDashboard from "./pages/reminders/ReminderDashboard";


function App() {
  return (
    <Router>
      <Routes>

        {/* ALL PAGES INSIDE MAINLAYOUT */}
        <Route path="/" element={<MainLayout />}>

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Customers */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="edit-customer/:id" element={<EditCustomer />} />

          {/* Machines */}
          <Route path="machines" element={<MachineList />} />
          <Route path="add-machine" element={<AddMachine />} />
          <Route path="edit-machine/:id" element={<EditMachine />} />

          {/* Service Records */}
          <Route path="service-records" element={<ServiceRecordList />} />
          <Route path="add-service-record" element={<AddServiceRecord />} />
          <Route path="edit-service-record/:id" element={<EditServiceRecord />} />

          {/* ⭐ Reminders */}
          <Route path="reminders" element={<ReminderDashboard />} />




        </Route>

      </Routes>
    </Router>
  );
}

export default App;
