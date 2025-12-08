import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_BASE_URL = "http://localhost:9090/api";

function ServiceReportPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editable Header Fields
  const [headerTel, setHeaderTel] = useState("011-xxxxxxx");
  const [headerEmail, setHeaderEmail] = useState("info@weighlanka.lk");

  // Editable Footer Fields
  const [preparedBy, setPreparedBy] = useState("");
  const [preparedDate, setPreparedDate] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [signature, setSignature] = useState("");

  const reportRef = useRef(null);

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
      setError("Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport(date);
  };

  // ---------------- CSV DOWNLOAD ----------------
  const handleDownloadCsv = () => {
    if (!rows || rows.length === 0) {
      alert("No data to export for this date.");
      return;
    }

    const headers = [
      "Date",
      "No",
      "Invoice No",
      "Name and Address",
      "Location",
      "Tel",
      "Model",
      "Serial No",
      "Capacity",
      "Reg No",
      "ID No",
      "Serviced By",
      "Prepared By",
      "Prepared Date",
      "Checked By",
      "Signature",
      "Header Tel",
      "Header Email",
    ];

    const escapeCell = (value) => {
      const str = value == null ? "" : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvRows = [];
    csvRows.push(headers.map(escapeCell).join(","));

    rows.forEach((row) => {
      const dataRow = [
        row.date,
        row.no,
        row.invoiceNo,
        row.nameAndAddress,
        row.location,
        row.tel,
        row.model,
        row.serialNo,
        row.cap,
        row.regNo,
        row.idNo,
        row.servicedBy,
        preparedBy,
        preparedDate,
        checkedBy,
        signature,
        headerTel,
        headerEmail,
      ];
      csvRows.push(dataRow.map(escapeCell).join(","));
    });

    const blob = new Blob([csvRows.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `daily-service-report-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ---------------- PDF DOWNLOAD (SHARP) ----------------
  const handleDownloadPdf = async () => {
    if (!rows || rows.length === 0) {
      alert("No data to export for this date.");
      return;
    }

    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 8;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      pdf.save(`daily-service-report-${date}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          padding: 16px 24px 32px;
          background: #f5f5f5;
          min-height: calc(100vh - 60px);
          font-family: Arial, sans-serif;
        }

        .page-header {
          margin-bottom: 14px;
        }

        .page-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .page-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
          padding: 14px 16px;
        }

        .report-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 12px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .field-label {
          font-size: 13px;
          color: #111827;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .field-input {
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 13px;
        }

        .btn {
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: #003366;
          color: #ffffff;
          border-color: #003366;
        }

        .btn-primary:hover {
          background: #002244;
        }

        .btn-outline {
          background: #ffffff;
          color: #003366;
          border-color: #cbd5e1;
        }

        .btn-outline:hover {
          background: #f1f5f9;
        }

        .btn-secondary {
          background: #16a34a;
          color: #ffffff;
          border-color: #15803d;
        }

        .btn-secondary:hover {
          background: #15803d;
        }

        .error {
          color: #b91c1c;
          font-size: 13px;
        }

        .muted {
          font-size: 13px;
          color: #6b7280;
        }

        .report-card {
          margin-top: 8px;
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .report-logo {
          width: 70px;
          height: auto;
        }

        .report-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .report-subtitle {
          margin: 2px 0;
          font-size: 12px;
          color: #4b5563;
        }

        .badge-date {
          font-weight: 600;
        }

        .inline-input {
          border: none;
          border-bottom: 1px solid #d1d5db;
          font-size: 12px;
          padding: 2px 4px;
          margin-left: 4px;
        }

        .inline-input:focus {
          outline: none;
          border-bottom-color: #2563eb;
        }

        .email-input {
          min-width: 170px;
        }

        .report-divider {
          margin: 8px 0 10px;
          border: none;
          border-top: 1px solid #e5e7eb;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .report-table th,
        .report-table td {
          border: 1px solid #e5e7eb;
          padding: 4px 6px;
          text-align: left;
          vertical-align: top;
        }

        .report-table th {
          background: #f3f4f6;
          text-transform: uppercase;
          font-size: 10px;
        }

        .signature-block {
          margin-top: 10px;
          font-size: 12px;
          color: #111827;
        }

        .signature-input {
          border: none;
          border-bottom: 1px solid #d1d5db;
          margin-left: 4px;
          padding: 2px 4px;
          font-size: 12px;
        }

        .signature-input.short {
          max-width: 120px;
        }

        .signature-input:focus {
          outline: none;
          border-bottom-color: #2563eb;
        }
      `}</style>

      <div className="page-header">
        <h2 className="page-title">Daily Service Report</h2>
        <p className="page-subtitle">View and export service details for a date.</p>
      </div>

      {/* ---------------- Toolbar ---------------- */}
      <form onSubmit={handleSubmit} className="report-toolbar card">
        <div className="toolbar-left">
          <label className="field-label">
            Date
            <input
              type="date"
              className="field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        <div className="toolbar-right">
          <button className="btn btn-primary">Load Report</button>

          {rows.length > 0 && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDownloadCsv}
              >
                Download CSV
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
            </>
          )}
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && !error && (
        <p className="muted">No records found for this date.</p>
      )}

      {/* ---------------- REPORT BLOCK (PDF CAPTURE AREA) ---------------- */}
      {rows.length > 0 && (
        <div ref={reportRef} className="card report-card">
          {/* Header */}
          <div className="report-header">
            <img
              src="/weigh-lanka-logo.png"
              className="report-logo"
              alt="logo"
            />

            <div>
              <h2 className="report-title">WEIGH LANKA SERVICE REPORT</h2>

              <p className="report-subtitle">
                Daily Service Report | Date:&nbsp;
                <span className="badge-date">{date}</span>
              </p>

              <p className="report-subtitle">
                Tel:
                <input
                  value={headerTel}
                  onChange={(e) => setHeaderTel(e.target.value)}
                  className="inline-input"
                />
                &nbsp; | Email:
                <input
                  value={headerEmail}
                  onChange={(e) => setHeaderEmail(e.target.value)}
                  className="inline-input email-input"
                />
              </p>
            </div>
          </div>

          <hr className="report-divider" />

          {/* Table */}
          <div className="table-wrapper">
            <table className="report-table pretty-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>No</th>
                  <th>Inv No</th>
                  <th>Name & Address</th>
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

          {/* ---------------- Signature Block ---------------- */}
          <div className="signature-block">
            <p>
              Prepared by:
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="signature-input"
                placeholder="Enter name"
              />
              &nbsp;&nbsp; Date:
              <input
                type="date"
                value={preparedDate}
                onChange={(e) => setPreparedDate(e.target.value)}
                className="signature-input short"
              />
            </p>

            <p>
              Checked by:
              <input
                type="text"
                value={checkedBy}
                onChange={(e) => setCheckedBy(e.target.value)}
                className="signature-input"
                placeholder="Enter name"
              />
              &nbsp;&nbsp; Signature:
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="signature-input short"
                placeholder="Sign"
              />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceReportPage;
