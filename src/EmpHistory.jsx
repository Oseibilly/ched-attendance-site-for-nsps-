import { useState, useEffect } from "react";
import { DB } from "./db";
import { formatDate, formatTime } from "./helpers";

// ─── Employee: My History ──────────────────────────────────────────────────
// Employee-facing view of their own historical attendance records.
const EmpHistory = ({ user }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    DB.get("aiq_attendance").then((a) => {
      setLogs(
        (a || [])
          .filter((r) => r.userId === user.id)
          .sort((x, y) => new Date(y.time) - new Date(x.time))
      );
    });
  }, [user.id]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My History</div>
        <div className="page-sub">Your complete attendance record.</div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-val">{logs.length}</div>
          <div className="stat-label">Total Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">
            {
              logs.filter((l) => {
                const d = new Date(l.time);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length
            }
          </div>
          <div className="stat-label">This Month</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Attendance Records</div>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No records yet</h3>
            <p>Clock in to start building your history.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Distance from Work</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.time)}</td>
                  <td style={{ fontWeight: 600 }}>{formatTime(a.time)}</td>
                  <td style={{ fontWeight: 600 }}>
                    {a.clockOutTime ? formatTime(a.clockOutTime) : "—"}
                  </td>
                  <td>{a.distance != null ? `${a.distance}m` : "—"}</td>
                  <td>
                    <span className="badge badge-success">✓ Present</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmpHistory;
