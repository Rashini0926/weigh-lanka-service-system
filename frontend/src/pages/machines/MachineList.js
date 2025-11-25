import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MachineList = () => {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/machines");
      setMachines(res.data);
    } catch (error) {
      console.error("Error loading machines:", error);
      alert("Failed to load machine list");
    }
  };

  const deleteMachine = async (id) => {
    if (!window.confirm("Do you want to delete this machine?")) return;

    try {
      await axios.delete(`http://localhost:9090/api/machines/${id}`);
      loadMachines();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Machine deletion failed");
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      
      {/* HEADER WITH ADD MACHINE BUTTON */}
      <div style={styles.header}>
        <h2>Machines List</h2>

        <Link to="/add-machine">
          <button style={styles.addBtn}>+ Add Machine</button>
        </Link>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Machine Name</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {machines.map((m, index) => (
            <tr key={m.id}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{m.machineName}</td>
              <td style={tdStyle}>{m.location}</td>
              <td style={tdStyle}>{m.status}</td>
              <td style={tdStyle}>{m.type}</td>

              <td style={tdStyle}>
                <Link to={`/edit-machine/${m.id}`}>
                  <button style={btnEdit}>Edit</button>
                </Link>

                <button onClick={() => deleteMachine(m.id)} style={btnDelete}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
  marginRight: "10px",
};

const btnDelete = {
  padding: "5px 10px",
  background: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default MachineList;
