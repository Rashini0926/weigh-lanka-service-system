import React, { useEffect, useState } from "react";
import {
  getServiceRecordById,
  updateServiceRecord,
} from "../../services/serviceRecordService";
import { useNavigate, useParams } from "react-router-dom";

function EditServiceRecord() {
  const { id } = useParams();
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

  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    try {
      const res = await getServiceRecordById(id);

      // Convert backend dates to yyyy-mm-dd (IMPORTANT)
      const data = res.data;
      data.serviceDate = data.serviceDate ? data.serviceDate.substring(0, 10) : "";
      data.nextServiceDate = data.nextServiceDate ? data.nextServiceDate.substring(0, 10) : "";

      setRecord(data);
    } catch (err) {
      console.error("Failed to load record", err);
      alert("Error loading service record");
    }
  };

  const handleChange = (e) => {
    setRecord({ ...record, [e.target.name]: e.target.value });
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    try {
      await updateServiceRecord(id, record);
      alert("Record updated successfully!");
      nav("/service-records");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update record");
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <h2>Edit Service Record</h2>

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
          value={record.customerId}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Machine ID */}
        <label style={label}>Machine ID</label>
        <input
          name="machineId"
          value={record.machineId}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Service Date */}
        <label style={label}>Service Date</label>
        <input
          type="date"
          name="serviceDate"
          value={record.serviceDate}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Next Service Date */}
        <label style={label}>Next Service Date</label>
        <input
          type="date"
          name="nextServiceDate"
          value={record.nextServiceDate}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Technician Name */}
        <label style={label}>Technician Name</label>
        <input
          name="technicianName"
          value={record.technicianName}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Service Cost */}
        <label style={label}>Service Cost</label>
        <input
          type="number"
          name="serviceCost"
          value={record.serviceCost}
          onChange={handleChange}
          style={input}
          required
        />

        {/* Remarks */}
        <label style={label}>Remarks</label>
        <textarea
          name="remarks"
          value={record.remarks}
          onChange={handleChange}
          style={textarea}
        />

        <button type="submit" style={btn}>
          Update Record
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
  background: "#1976d2",
  color: "white",
  border: "none",
  marginTop: "20px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "16px",
};

export default EditServiceRecord;
