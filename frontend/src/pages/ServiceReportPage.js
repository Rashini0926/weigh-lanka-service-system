import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

function ServiceReportPage() {
  const [date, setDate] = useState("2025-05-27"); // default test date
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async (reportDate) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE_URL}/service-records/report`,
        {
          params: { date: reportDate },
        }
      );
      setRows(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load report. Check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // load once on first render
  useEffect(() => {
    fetchReport(date);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport(date);
  };

  return (
    <div>
      <h2>Daily Service Report</h2>

      <form onSubmit={handleSubmit} className="report-form">
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button type="submit">Load Report</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && rows.length === 0 && !error && (
        <p>No records found for this date.</p>
      )}

      {rows.length > 0 && (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>No</th>
                <th>Inv No</th>
                <th>Name &amp; Address</th>
                <th>Location</th>
                <th>Tel</th>
                <th>Model</th>
                <th>Serial No</th>
                <th>Cap</th>
                <th>Reg No</th>
                <th>ID No</th>
                <th>Serviced By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.no}</td>
                  <td>{row.invoiceNo}</td>
                  <td>{row.nameAndAddress}</td>
                  <td>{row.location}</td>
                  <td>{row.tel}</td>
                  <td>{row.model}</td>
                  <td>{row.serialNo}</td>
                  <td>{row.cap}</td>
                  <td>{row.regNo}</td>
                  <td>{row.idNo}</td>
                  <td>{row.servicedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ServiceReportPage;
