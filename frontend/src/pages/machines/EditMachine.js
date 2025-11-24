import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditMachine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState({
    machineName: "",
    location: "",
    status: "",
    type: "",
  });

  useEffect(() => {
    loadMachine();
  }, []);

  const loadMachine = async () => {
    try {
      const res = await axios.get(`http://localhost:9090/api/machines/${id}`);
      setMachine(res.data);
    } catch (error) {
      console.error("Error loading machine:", error);
      alert("Failed to load machine data");
    }
  };

  const handleChange = (e) => {
    setMachine({ ...machine, [e.target.name]: e.target.value });
  };

  const updateMachine = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:9090/api/machines/${id}`, machine);
      alert("Machine updated successfully!");
      navigate("/machines");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update machine");
    }
  };

  return (
    <div>
      <h2>Edit Machine</h2>

      <form onSubmit={updateMachine}>
        <div>
          <label>Machine Name:</label><br />
          <input
            type="text"
            name="machineName"
            value={machine.machineName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Location:</label><br />
          <input
            type="text"
            name="location"
            value={machine.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Status:</label><br />
          <select
            name="status"
            value={machine.status}
            onChange={handleChange}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        <div>
          <label>Type:</label><br />
          <input
            type="text"
            name="type"
            value={machine.type}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>Update Machine</button>
      </form>
    </div>
  );
};

export default EditMachine;
