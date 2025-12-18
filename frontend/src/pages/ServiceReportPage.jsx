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

  // Load/save header contact details to localStorage so edits persist per browser
  useEffect(() => {
    try {
      const t = localStorage.getItem("sr_headerTel");
      const e = localStorage.getItem("sr_headerEmail");
      if (t) setHeaderTel(t);
      if (e) setHeaderEmail(e);
    } catch (err) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sr_headerTel", headerTel);
    } catch (err) {}
  }, [headerTel]);

  useEffect(() => {
    try {
      localStorage.setItem("sr_headerEmail", headerEmail);
    } catch (err) {}
  }, [headerEmail]);

  // Approved signature image (data URL) and helpers
  const [approvedImage, setApprovedImage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const img = localStorage.getItem("sr_approvedImage");
      if (img) setApprovedImage(img);
    } catch (err) {}
  }, []);

  useEffect(() => {
    try {
      if (approvedImage) localStorage.setItem("sr_approvedImage", approvedImage);
      else localStorage.removeItem("sr_approvedImage");
    } catch (err) {}
  }, [approvedImage]);

  const handlePickApprovedImage = () => {
    try {
      fileInputRef.current && fileInputRef.current.click();
    } catch (err) {}
  };

  const handleApprovedImageChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setApprovedImage(reader.result);
    reader.readAsDataURL(f);
  };

  const handleRemoveApprovedImage = () => {
    // Clear in-memory state
    setApprovedImage("");

    // Clear file input so the same file can be uploaded again
    try {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {}

    // Remove from localStorage immediately
    try {
      localStorage.removeItem("sr_approvedImage");
    } catch (err) {}
  };

  const [preparedBy, setPreparedBy] = useState("");
  const [preparedDate, setPreparedDate] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [signature, setSignature] = useState("");
  // When compactView=true the signature area displays only entered data (read-only)
  const [compactView, setCompactView] = useState(false);

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

  // helper to wait until images inside element are loaded
  function waitForImagesToLoad(el) {
    const imgs = Array.from(el.querySelectorAll("img"));
    const promises = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = img.onerror = () => resolve();
      });
    });
    return Promise.all(promises);
  }

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setLoading(true);
      // Clone the report node so we can render a clean copy (avoids layout clipping)
      const node = reportRef.current;
      const clone = node.cloneNode(true);
      // apply a consistent width and remove visual effects
      clone.style.width = "1200px";
      clone.style.boxShadow = "none";
      clone.style.maxWidth = "none";
      clone.style.position = "relative";
      clone.style.margin = "0";

      // place clone off-screen but visible to the browser so html2canvas can render it
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-10000px";
      wrapper.style.top = "0";
      wrapper.style.background = "#ffffff";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // wait for all images inside the clone to load
      await waitForImagesToLoad(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      // cleanup wrapper
      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;

      // canvas.width maps to imgWidth; compute pixel height per page
      const pxPerMm = canvas.width / imgWidth;
      const sliceHeightPx = Math.floor(pageHeight * pxPerMm);

      let y = 0;
      let page = 0;
      while (y < canvas.height) {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = Math.min(sliceHeightPx, canvas.height - y);
        const ctx = tmpCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        ctx.drawImage(canvas, 0, y, tmpCanvas.width, tmpCanvas.height, 0, 0, tmpCanvas.width, tmpCanvas.height);

        const tmpImg = tmpCanvas.toDataURL("image/png");
        const tmpImgHeightMm = (tmpCanvas.height * imgWidth) / tmpCanvas.width;

        if (page > 0) pdf.addPage();
        pdf.addImage(tmpImg, "PNG", margin, margin, imgWidth, tmpImgHeightMm);

        y += tmpCanvas.height;
        page++;
      }

      pdf.save(`service-report-${date}.pdf`);
    } catch (err) {
      console.error("Export PDF failed", err);
      setError("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };


  function csvFromRows(rows) {
    const headers = ["Date","No","Invoice","Customer","Location","Model","Serial","Cap","ServicedBy"];
    const lines = [headers.join(",")];
    (rows || []).forEach((r) => {
      const safe = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
      lines.push([
        r.date,
        r.no,
        safe(r.invoiceNo),
        safe(r.nameAndAddress),
        safe(r.location),
        safe(r.model),
        safe(r.serialNo),
        safe(r.cap),
        safe(r.servicedBy),
      ].join(","));
    });
    return lines.join("\n");
  }

  const handleExportCsv = () => {
    try {
      const csv = csvFromRows(rows || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `service-report-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed", err);
      setError("Failed to export CSV");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sr-page">
      <style>{`
        :root{ --bg-1:#f6f8ff; --bg-2:#ffffff; --accent:#4f46e5; --muted:#6b7280; }

        .sr-page {
          padding: 28px 20px;
          background: radial-gradient(1000px 320px at 12% 8%, rgba(79,70,229,0.06), transparent 9%), linear-gradient(180deg,var(--bg-1),var(--bg-2));
          min-height: 100vh;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
          position: relative;
          overflow: hidden;
        }

        .decor-blob{ position:absolute; left:-100px; top:-80px; width:380px; height:380px; background: radial-gradient(circle at 30% 30%, rgba(79,70,229,0.16), transparent 28%), radial-gradient(circle at 70% 70%, rgba(16,185,129,0.06), transparent 36%); filter: blur(36px); transform:rotate(12deg); pointer-events:none; z-index:1; }

        .sr-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; position:relative; z-index:2; }
        .sr-title{ font-size:26px; font-weight:800; color:#0f172a; margin:0; }
        .sr-date-badge{ background:linear-gradient(90deg,#e6f2ff,#f0f9ff); color:#0369a1; padding:7px 16px; border-radius:999px; font-size:13px; font-weight:700; }

        .sr-toolbar{ background:linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.86)); border-radius:14px; padding:12px 14px; display:flex; gap:12px; align-items:center; justify-content:space-between; box-shadow:0 12px 34px rgba(15,23,42,0.06); margin-bottom:18px; position:relative; z-index:2; }

        .sr-left{ display:flex; gap:10px; align-items:center; }
        .sr-input{ padding:8px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:14px; background:transparent; }

        .sr-meta-input{ padding:8px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); font-size:13px; min-width:170px; background:transparent; color:var(--muted); }
        .sr-meta-input:focus{ outline:none; border-color:var(--accent); box-shadow:0 8px 24px rgba(79,70,229,0.06); color:#0f172a; }

        @media (max-width:760px){ .sr-meta-input{ display:none; } }

        .sr-actions{ display:flex; gap:8px; align-items:center; }
        .sr-btn{ padding:8px 14px; border-radius:999px; border:none; font-weight:700; cursor:pointer; font-size:13px; }
        .sr-btn-primary{ background:linear-gradient(90deg,var(--accent),#2563eb); color:#fff; box-shadow:0 10px 30px rgba(37,99,235,0.12); }
        .sr-btn-ghost{ background:transparent; border:1px solid rgba(15,23,42,0.04); color:var(--muted); }
        .sr-btn-ghost.active{ background: rgba(15,23,42,0.04); color:var(--accent); border-color: rgba(79,70,229,0.12); }
        .sr-btn-secondary{ background:#10b981; color:#fff; }
        .sr-btn:disabled{ opacity:0.6; cursor:not-allowed; }

        .spinner{ width:18px; height:18px; border-radius:50%; border:3px solid rgba(15,23,42,0.12); border-top-color:var(--accent); animation:spin .9s linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        .sr-report{ background:linear-gradient(180deg,#ffffff,#fbfdff); border-radius:16px; padding:20px; box-shadow:0 20px 60px rgba(15,23,42,0.06); border:1px solid rgba(15,23,42,0.04); position:relative; z-index:2; }
        .sr-report-header{ display:flex; gap:14px; align-items:center; margin-bottom:12px; }
        .sr-logo{ width:78px; height:auto; border-radius:6px; object-fit:contain; }
        .sr-report-title{ font-size:18px; font-weight:800; color:#0f172a; }
        .sr-report-sub{ color:var(--muted); font-size:13px; }

        .sr-table{ width:100%; border-collapse:separate; border-spacing:0; margin-top:12px; font-size:13px; min-width:900px; }
        .sr-table thead th{ background: rgba(15,23,42,0.95); color:#fff; padding:10px 12px; font-size:12px; position:sticky; top:0; z-index:3; text-transform:uppercase; }
        .sr-table td{ padding:10px 12px; border-bottom:1px solid rgba(15,23,42,0.04); }
        .sr-table tbody tr:nth-child(even){ background: rgba(15,23,42,0.02); }
        .sr-table tbody tr:hover{ background: rgba(79,70,229,0.03); }

        .sr-sign{
          margin-top:18px;
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap:14px;
          align-items:start;
        }
        .sr-sign .sr-sign-col{ display:flex; flex-direction:column; gap:8px; }
        .sr-sign label{ font-size:12px; font-weight:700; color:#0f172a; }
        .sr-sign .sr-input-small{ padding:8px 10px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); background:transparent; font-size:14px; }
        .sr-sign .sr-input-small[type="date"]{ padding:8px 10px; }
        .sr-sign .sr-signature-box{ min-height:48px; border:1px dashed rgba(15,23,42,0.12); border-radius:8px; padding:8px; display:flex; align-items:center; color:var(--muted); background:linear-gradient(180deg, rgba(255,255,255,0.6), rgba(250,250,250,0.6)); }
        .sr-sign .sr-signature-box input{ border:none; outline:none; background:transparent; font-size:14px; width:100%; }
        .sr-sign .sr-approval-box{ min-height:64px; border-radius:8px; border:1px solid rgba(15,23,42,0.05); background:linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2)); display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; font-weight:600; position:relative; overflow:hidden; }
        .sr-approval-img{ max-width:100%; max-height:84px; object-fit:contain; display:block; margin:6px auto; }
        .sr-approval-btn{ position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:#fff; border:none; width:28px; height:28px; border-radius:999px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; }
        @media print{ .sr-sign .sr-signature-box input{ border-bottom:0; } }

        @media print{
          body *{ visibility: hidden; }
          .sr-report, .sr-report *{ visibility: visible; }
          .sr-report{ position:absolute; left:0; top:0; width:100%; box-shadow:none; border-radius:0; }
        }
      `}</style> 

      <div className="sr-header">
        <div className="sr-title">Daily Service Report</div>
        <div className="sr-date-badge">{date}</div>
      </div>

      <div className="decor-blob" aria-hidden="true" />

      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleApprovedImageChange} />

      <div className="sr-toolbar">
        <div className="sr-left">
          <input
            type="date"
            className="sr-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="text"
            className="sr-meta-input"
            placeholder="Tel (header)"
            value={headerTel}
            onChange={(e) => setHeaderTel(e.target.value)}
            aria-label="Header telephone"
          />

          <input
            type="email"
            className="sr-meta-input"
            placeholder="Email (header)"
            value={headerEmail}
            onChange={(e) => setHeaderEmail(e.target.value)}
            aria-label="Header email"
          />
        </div>

        <div className="sr-actions">
          <button
            className="sr-btn sr-btn-primary"
            onClick={() => fetchReport(date)}
          >
            Load
          </button>

          {rows.length > 0 && (
            <>
              <button
                className="sr-btn sr-btn-secondary"
                onClick={handleDownloadPdf}
              >
                Export PDF
              </button>

              <button
                className="sr-btn sr-btn-ghost"
                onClick={handleExportCsv}
              >
                Export CSV
              </button>

              <button
                className="sr-btn sr-btn-ghost"
                onClick={handlePrint}
              >
                Print
              </button>

              {/* Approved image controls moved to toolbar so the report DOM doesn't show upload UI */}
              <button
                type="button"
                className="sr-btn sr-btn-ghost"
                onClick={handlePickApprovedImage}
              >
                Upload Approved
              </button>

              <button
                type="button"
                className="sr-btn sr-btn-ghost"
                onClick={handleRemoveApprovedImage}
                disabled={!approvedImage}
                title={approvedImage? 'Remove approved image' : 'No approved image to remove'}
              >
                Remove Approved
              </button>

              <button
                type="button"
                className={`sr-btn sr-btn-ghost ${compactView? 'active' : ''}`}
                onClick={() => setCompactView((v) => !v)}
                title="Toggle compact view: show only entered details"
              >
                {compactView ? 'Compact: On' : 'Compact: Off'}
              </button>
            </>
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
            {/* If compactView is enabled, show only non-empty entries in a read-only style */}
            {compactView ? (
              <>
                { (preparedBy || preparedDate) && (
                  <div className="sr-sign-col">
                    <label>Prepared by</label>
                    <div>{preparedBy || <em style={{color:'var(--muted)'}}>—</em>}</div>
                    <label>Date</label>
                    <div>{preparedDate || <em style={{color:'var(--muted)'}}>—</em>}</div>
                  </div>
                )}

                { (checkedBy || signature) && (
                  <div className="sr-sign-col">
                    <label>Checked by</label>
                    <div>{checkedBy || <em style={{color:'var(--muted)'}}>—</em>}</div>
                    <label>Signature</label>
                    <div className="sr-signature-box" style={{borderStyle:'solid', padding:8}}>
                      {signature ? <div style={{fontWeight:700}}>{signature}</div> : <em style={{color:'var(--muted)'}}>—</em>}
                    </div>
                  </div>
                )}

                { approvedImage && (
                  <div className="sr-sign-col">
                    <label>Approved</label>
                    <div className="sr-approval-box">
                      <img src={approvedImage} alt="Approved signature" className="sr-approval-img" />
                    </div>
                  </div>
                )}

                {/* If nothing present, show small hint */}
                { !(preparedBy || preparedDate || checkedBy || signature || approvedImage) && (
                  <div style={{color:'var(--muted)'}}>No signature details entered.</div>
                )}
              </>
            ) : (
              /* full-edit mode */
              <>
                <div className="sr-sign-col">
                  <label>Prepared by</label>
                  <input className="sr-input-small" value={preparedBy} onChange={e=>setPreparedBy(e.target.value)} placeholder="Name" />
                  <label>Date</label>
                  <input className="sr-input-small" type="date" value={preparedDate} onChange={e=>setPreparedDate(e.target.value)} />
                </div>

                <div className="sr-sign-col">
                  <label>Checked by</label>
                  <input className="sr-input-small" value={checkedBy} onChange={e=>setCheckedBy(e.target.value)} placeholder="Name" />
                  <label>Signature</label>
                  <div className="sr-signature-box">
                    <input value={signature} onChange={e=>setSignature(e.target.value)} placeholder="Type signature (name) or leave blank" />
                  </div>
                </div>

                { approvedImage && (
                  <div className="sr-sign-col">
                    <label>Approved</label>
                    <div className="sr-approval-box">
                      <div style={{position:'relative', width:'100%'}}>
                        <img src={approvedImage} alt="Approved signature" className="sr-approval-img" />
                        <button type="button" className="sr-approval-btn" onClick={handleRemoveApprovedImage} title="Remove">✕</button>
                      </div>
                    </div>
                    <small style={{color:'var(--muted)'}}>Digital signature acceptable — upload PNG/JPG</small>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceReportPage;
