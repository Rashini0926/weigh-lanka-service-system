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
    <div>
      <h2>Machines List</h2>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Machine Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {machines.map((m, index) => (
            <tr key={m.id}>
              <td>{index + 1}</td>
              <td>{m.machineName}</td>
              <td>{m.location}</td>
              <td>{m.status}</td>
              <td>{m.type}</td>

              <td>
                <Link to={`/edit-machine/${m.id}`}>
                  <button style={{ marginRight: "10px" }}>Edit</button>
                </Link>

                <button onClick={() => deleteMachine(m.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MachineList;
