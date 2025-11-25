import React, { useEffect, useState } from "react";
import { getServiceRecords, deleteServiceRecord } from "../../services/serviceRecordService";
import { Link } from "react-router-dom";

function ServiceRecordList() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const res = await getServiceRecords();
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load service records", err);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteServiceRecord(id);
      loadRecords();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div style={{ paddingLeft: "270px", paddingTop: "20px" }}>
      <h2>Service Records</h2>

      <Link to="/add-service-record" style={addBtn}>
        + Add Service Record
      </Link>

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
            <th style={thStyle}>Customer ID</th>
            <th style={thStyle}>Machine ID</th>
            <th style={thStyle}>Service Date</th>
            <th style={thStyle}>Next Service Date</th>
            <th style={thStyle}>Technician</th>
            <th style={thStyle}>Cost</th>
            <th style={thStyle}>Remarks</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td style={tdStyle}>{r.customerId}</td>
              <td style={tdStyle}>{r.machineId}</td>
              <td style={tdStyle}>{r.serviceDate}</td>
              <td style={tdStyle}>{r.nextServiceDate}</td>
              <td style={tdStyle}>{r.technicianName}</td>
              <td style={tdStyle}>Rs. {r.serviceCost}</td>
              <td style={tdStyle}>{r.remarks}</td>

              <td style={tdStyle}>
                <Link to={`/edit-service-record/${r.id}`}>
                  <button style={editBtn}>Edit</button>
                </Link>

                <button
                  onClick={() => deleteRecord(r.id)}
                  style={delBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Styles ---------- */
const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

const addBtn = {
  padding: "10px 15px",
  background: "#2e7d32",
  color: "white",
  textDecoration: "none",
  borderRadius: "5px",
  fontWeight: "bold",
};

const editBtn = {
  padding: "5px 10px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "10px",
};

const delBtn = {
  padding: "5px 10px",
  background: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default ServiceRecordList;
