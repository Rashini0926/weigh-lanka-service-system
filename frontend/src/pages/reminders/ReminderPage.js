import React, { useEffect, useState } from "react";
import axios from "axios";

function ReminderPage() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/service-records");
      setReminders(res.data);
    } catch (error) {
      console.error("Reminder load error", error);
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <h2>Upcoming Service Reminders</h2>

      <table style={{ width: "100%", background: "white" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Customer ID</th>
            <th>Machine ID</th>
            <th>Next Service</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {reminders.map((r) => (
            <tr key={r.id}>
              <td>{r.customerId}</td>
              <td>{r.machineId}</td>
              <td>{r.nextServiceDate}</td>
              <td style={{ color: "green" }}>Scheduled</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReminderPage;
