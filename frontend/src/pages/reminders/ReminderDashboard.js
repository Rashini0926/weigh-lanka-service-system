import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReminderDashboard.css";

function ReminderDashboard() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/service-records");
      setReminders(res.data);
    } catch (err) {
      console.error("Reminder Load Error", err);
    }
  };

  // FILTER GROUPS
  const today = new Date().toISOString().split("T")[0];

  const todayReminders = reminders.filter(r => r.nextServiceDate === today);
  const upcoming = reminders.filter(r => r.nextServiceDate > today);
  const overdue = reminders.filter(r => r.nextServiceDate < today);

  return (
    <div className="reminder-container">

      <h2 className="title">Service Reminder Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div className="card-grid">
        <div className="card blue">
          <h3>Upcoming</h3>
          <p>{upcoming.length}</p>
        </div>

        <div className="card green">
          <h3>Today</h3>
          <p>{todayReminders.length}</p>
        </div>

        <div className="card red">
          <h3>Overdue</h3>
          <p>{overdue.length}</p>
        </div>
      </div>

      {/* UPCOMING */}
      <section>
        <h3 className="section-title">📅 Upcoming Service Reminders</h3>
        <ReminderTable data={upcoming} color="blue" />
      </section>

      {/* TODAY */}
      <section>
        <h3 className="section-title">🔔 Service Due Today</h3>
        <ReminderTable data={todayReminders} color="green" />
      </section>

      {/* OVERDUE */}
      <section>
        <h3 className="section-title">⚠️ Overdue Services</h3>
        <ReminderTable data={overdue} color="red" />
      </section>

    </div>
  );
}

const ReminderTable = ({ data, color }) => {
  if (data.length === 0) return <p className="empty">No records found</p>;

  return (
    <table className="reminder-table">
      <thead>
        <tr>
          <th>Customer ID</th>
          <th>Machine ID</th>
          <th>Next Service</th>
          <th>Status</th>
          <th>Send Email</th>
          <th>Send SMS</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r) => (
          <tr key={r.id}>
            <td>{r.customerId}</td>
            <td>{r.machineId}</td>
            <td>{r.nextServiceDate}</td>
            <td className={color}>
              {color === "green"
                ? "Due Today"
                : color === "red"
                ? "Overdue"
                : "Upcoming"}
            </td>

            <td>
              <button className="email-btn">Send Email</button>
            </td>

            <td>
              <button className="sms-btn">Send SMS</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReminderDashboard;
