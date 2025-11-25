import React, { useState } from "react";
import { addServiceRecord } from "../../services/serviceRecordService";
import { useNavigate } from "react-router-dom";

function AddServiceRecord() {
  const nav = useNavigate();

  const [record, setRecord] = useState({
    customerId: "",
    machineId: "",
    serviceDate: "",
    nextServiceDate: "",
    technicianName: "",
    remarks: "",
    serviceCost: "",
  });

  const handleChange = (e) =>
    setRecord({ ...record, [e.target.name]: e.target.value });

  const saveRecord = async (e) => {
    e.preventDefault();
    try {
      await addServiceRecord(record);
      alert("Service record added successfully!");
      nav("/service-records");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save record");
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <h2>Add Service Record</h2>

      <form
        onSubmit={saveRecord}
        style={{
          background: "white",
          padding: "20px",
          width: "600px",
          borderRadius: "8px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
          marginTop: "20px",
        }}
      >
        {/* Customer ID */}
        <label style={label}>Customer ID</label>
        <input
          name="customerId"
          placeholder="Enter Customer ID"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Machine ID */}
        <label style={label}>Machine ID</label>
        <input
          name="machineId"
          placeholder="Enter Machine ID"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Service Date */}
        <label style={label}>Service Date</label>
        <input
          type="date"
          name="serviceDate"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Next Service Date */}
        <label style={label}>Next Service Date</label>
        <input
          type="date"
          name="nextServiceDate"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Technician Name */}
        <label style={label}>Technician Name</label>
        <input
          name="technicianName"
          placeholder="Technician Name"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Service Cost */}
        <label style={label}>Service Cost</label>
        <input
          name="serviceCost"
          type="number"
          placeholder="Enter Cost"
          onChange={handleChange}
          style={input}
          required
        />

        {/* Remarks */}
        <label style={label}>Remarks</label>
        <textarea
          name="remarks"
          placeholder="Enter remarks"
          onChange={handleChange}
          style={textarea}
        ></textarea>

        <button type="submit" style={btn}>
          Save Record
        </button>
      </form>
    </div>
  );
}

/* ----------- Styles ----------- */

const label = {
  display: "block",
  marginBottom: "6px",
  marginTop: "15px",
  fontWeight: "600",
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const textarea = {
  width: "100%",
  height: "90px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const btn = {
  padding: "12px 18px",
  background: "#2e7d32",
  color: "white",
  border: "none",
  marginTop: "20px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "16px",
};

export default AddServiceRecord;
