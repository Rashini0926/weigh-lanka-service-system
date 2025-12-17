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

  const [headerTel, setHeaderTel] = useState("011-xxxxxxx");
  const [headerEmail, setHeaderEmail] = useState("info@weighlanka.lk");

  const [preparedBy, setPreparedBy] = useState("");
  const [preparedDate, setPreparedDate] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [signature, setSignature] = useState("");

  const reportRef = useRef(null);

  const fetchReport = async (d) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${API_BASE_URL}/service-records/report`,
        { params: { date: d } }
      );
      setRows(res.data || []);
    } catch {
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(date);
  }, []);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
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
    pdf.save(`service-report-${date}.pdf`);
  };

  return (
    <div className="sr-page">
      <style>{`
        .sr-page {
          padding: 28px;
          background: linear-gradient(180deg,#f8fafc,#eef2f7);
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont;
        }

        .sr-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        }

        .sr-title {
          font-size:26px;
          font-weight:700;
          color:#0f172a;
        }

        .sr-date-badge {
          background:#e0f2fe;
          color:#0369a1;
          padding:6px 14px;
          border-radius:999px;
          font-size:13px;
          font-weight:600;
        }

        .sr-toolbar {
          background:white;
          border-radius:14px;
          padding:14px 16px;
          display:flex;
          justify-content:space-between;
          align-items:end;
          box-shadow:0 10px 25px rgba(0,0,0,0.08);
          margin-bottom:18px;
        }

        .sr-input {
          padding:7px 10px;
          border-radius:8px;
          border:1px solid #cbd5e1;
          font-size:14px;
        }

        .sr-btn {
          padding:8px 18px;
          border-radius:999px;
          border:none;
          font-weight:600;
          cursor:pointer;
        }

        .sr-btn-primary {
          background:linear-gradient(135deg,#2563eb,#4f46e5);
          color:white;
          box-shadow:0 10px 22px rgba(37,99,235,.45);
        }

        .sr-btn-secondary {
          background:#16a34a;
          color:white;
        }

        .sr-report {
          background:white;
          border-radius:18px;
          padding:22px;
          box-shadow:0 18px 40px rgba(15,23,42,.15);
        }

        .sr-report-header {
          display:flex;
          align-items:center;
          gap:16px;
          margin-bottom:14px;
        }

        .sr-logo {
          width:70px;
        }

        .sr-report-title {
          font-size:20px;
          font-weight:700;
        }

        .sr-table {
          width:100%;
          border-collapse:collapse;
          font-size:13px;
          margin-top:12px;
        }

        .sr-table th {
          background:#0f172a;
          color:white;
          padding:8px;
          font-size:12px;
        }

        .sr-table td {
          padding:7px;
          border-bottom:1px solid #e5e7eb;
        }

        .sr-table tr:nth-child(even) {
          background:#f8fafc;
        }

        .sr-sign {
          margin-top:16px;
          font-size:13px;
        }

        .sr-sign input {
          border:none;
          border-bottom:1px solid #94a3b8;
          margin-left:6px;
          padding:2px 4px;
        }
      `}</style>

      <div className="sr-header">
        <div className="sr-title">Daily Service Report</div>
        <div className="sr-date-badge">{date}</div>
      </div>

      <div className="sr-toolbar">
        <div>
          <input
            type="date"
            className="sr-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <button
            className="sr-btn sr-btn-primary"
            onClick={() => fetchReport(date)}
          >
            Load
          </button>
          &nbsp;
          {rows.length > 0 && (
            <button
              className="sr-btn sr-btn-secondary"
              onClick={handleDownloadPdf}
            >
              Export PDF
            </button>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <div ref={reportRef} className="sr-report">
          <div className="sr-report-header">
            <img src="/weigh-lanka-logo.png" alt="logo" className="sr-logo" />
            <div>
              <div className="sr-report-title">
                WEIGH LANKA – SERVICE REPORT
              </div>
              <div style={{ fontSize: 13 }}>
                Tel: {headerTel} | Email: {headerEmail}
              </div>
            </div>
          </div>

          <table className="sr-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>No</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Model</th>
                <th>Serial</th>
                <th>Cap</th>
                <th>Serviced By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.no}</td>
                  <td>{r.invoiceNo}</td>
                  <td>{r.nameAndAddress}</td>
                  <td>{r.location}</td>
                  <td>{r.model}</td>
                  <td>{r.serialNo}</td>
                  <td>{r.cap}</td>
                  <td>{r.servicedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sr-sign">
            Prepared by <input value={preparedBy} onChange={e=>setPreparedBy(e.target.value)} />
            &nbsp; Date <input type="date" value={preparedDate} onChange={e=>setPreparedDate(e.target.value)} />
            <br/><br/>
            Checked by <input value={checkedBy} onChange={e=>setCheckedBy(e.target.value)} />
            &nbsp; Signature <input value={signature} onChange={e=>setSignature(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceReportPage;
