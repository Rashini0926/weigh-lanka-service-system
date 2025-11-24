import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddMachine = () => {
  const navigate = useNavigate();

  const [machine, setMachine] = useState({
    machineName: "",
    location: "",
    status: "",
    type: "",
  });

  const handleChange = (e) => {
    setMachine({ ...machine, [e.target.name]: e.target.value });
  };

  const saveMachine = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:9090/api/machines", machine);
      alert("Machine added successfully!");
      navigate("/machines");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving machine");
    }
  };

  return (
    <div>
      <h2>Add Machine</h2>

      <form onSubmit={saveMachine}>
        <div>
          <label>Machine Name:</label><br />
          <input type="text" name="machineName" required onChange={handleChange} />
        </div>

        <div>
          <label>Location:</label><br />
          <input type="text" name="location" required onChange={handleChange} />
        </div>

        <div>
          <label>Status:</label><br />
          <select name="status" required onChange={handleChange}>
            <option value="">Select</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        <div>
          <label>Type:</label><br />
          <input type="text" name="type" required onChange={handleChange} />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>Save Machine</button>
      </form>
    </div>
  );
};

export default AddMachine;
