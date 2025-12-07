import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api";

// ---------- DATE UTILITIES ----------
function toDateOnly(value) {
  if (!value) return "";
  if (typeof value === "string") return value.substring(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function ReminderPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [customers, setCustomers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cRes, mRes, rRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/machines`),
          axios.get(`${API_BASE_URL}/service-records`),
        ]);

        setCustomers(cRes.data || []);
        setMachines(mRes.data || []);
        setRecords(rRes.data || []);
      } catch (err) {
        console.error("Error loading reminders:", err);
        setError("Failed to load reminders. Check backend.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------- COMBINE DATA ----------
  const rows = records
    .map((r) => {
      const cust = customers.find((c) => c.id === r.customerId);
      const mach = machines.find((m) => m.id === r.machineId);

      const nextDate = toDateOnly(r.nextServiceDate);

      return {
        id: r.id,
        invoiceNo: r.invoiceNo || "N/A",
        capacity: mach?.capacity || "",
        customerName: cust?.customerName || "Unknown",
        phone: cust?.phone || "",
        nextServiceDate: nextDate,
      };
    })
    .map((row) => {
      if (!row.nextServiceDate) return null;

      const diff = daysBetween(todayStr, row.nextServiceDate);
      if (diff === null) return null;

      let status = null;
      let label = "";
      const days = Math.abs(diff);

      if (diff < 0) {
        status = "overdue";
        label = `OVERDUE (${days} days)`;
      } else if (diff >= 0 && diff <= 30) {
        status = "urgent";
        label = `URGENT (${days} days)`;
      } else if (diff >= 31 && diff <= 90) {
        status = "dueSoon";
        label = `DUE SOON (${days} days)`;
      } else {
        return null; // beyond 90 days, ignore
      }

      return { ...row, status, label, daysDiff: diff };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const weight = (s) =>
        s === "overdue" ? 0 : s === "urgent" ? 1 : 2;
      const wA = weight(a.status);
      const wB = weight(b.status);
      if (wA !== wB) return wA - wB;
      return Math.abs(a.daysDiff) - Math.abs(b.daysDiff);
    });

  // ---------- WHATSAPP CONTACT ----------
  const handleContact = (row) => {
    if (!row.phone) {
      alert("No phone number available for this customer.");
      return;
    }

    // remove spaces, dashes etc.
    const phone = row.phone.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hello ${row.customerName},\n\nThis is a reminder from Weigh Lanka.\nYour scale service is due on ${row.nextServiceDate}.\n\nPlease contact us to arrange the service.\n\nThank you.`
    );

    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="reminders-wrapper">
      {/* INLINE CSS */}
      <style>{`
        .reminders-wrapper {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .rem-card {
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 8px;
          max-width: 1100px;
          margin: 0 auto;
          box-shadow: 0 2px 6px rgba(15,23,42,0.08);
        }
        .rem-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .rem-sub {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px;
        }
        .rem-info {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 16px;
        }

        .rem-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .rem-table thead th {
          background: #f3f4f6;
          text-align: left;
          padding: 10px;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.03em;
        }
        .rem-table tbody td {
          padding: 10px;
          border-top: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        .rem-phone {
          font-size: 12px;
          color: #6b7280;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
        }
        .status-overdue {
          background: #dc2626;
        }
        .status-urgent {
          background: #ea580c;
        }
        .status-duesoon {
          background: #f59e0b;
          color: #111827;
        }

        .contact-btn {
          background: #25d366; /* WhatsApp green */
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .contact-btn:hover {
          background: #1da851;
        }
      `}</style>

      <div className="rem-card">
        <h2 className="rem-title">Reminders &amp; Alerts</h2>
        <p className="rem-sub">
          Today: <strong>{todayStr}</strong>
        </p>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            <p className="rem-info">
              This page lists all scales that are <strong>Overdue</strong>,{" "}
              <strong>Urgent (0–30 days)</strong>, or{" "}
              <strong>Due Soon (31–90 days)</strong>.
            </p>

            {rows.length === 0 ? (
              <p>No reminders at the moment. 🎉</p>
            ) : (
              <table className="rem-table">
                <thead>
                  <tr>
                    <th>INV NO</th>
                    <th>CUSTOMER / TEL</th>
                    <th>NEXT DUE DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.invoiceNo}
                        {row.capacity ? ` (${row.capacity})` : ""}
                      </td>
                      <td>
                        {row.customerName}
                        <br />
                        <span className="rem-phone">{row.phone}</span>
                      </td>
                      <td>{row.nextServiceDate}</td>
                      <td>
                        <span
                          className={
                            "status-badge " +
                            (row.status === "overdue"
                              ? "status-overdue"
                              : row.status === "urgent"
                              ? "status-urgent"
                              : "status-duesoon")
                          }
                        >
                          {row.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className="contact-btn"
                          onClick={() => handleContact(row)}
                        >
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReminderPage;
