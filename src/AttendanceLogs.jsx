import { useState, useEffect } from "react";
import { DB } from "./db";
import { formatDate, formatTime, initials } from "./helpers";

// ─── Admin: Attendance Logs ────────────────────────────────────────────────
const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    DB.get("aiq_attendance").then((a) => setLogs(a || []));
    DB.get("aiq_users").then((u) => setUsers(u || []));
    DB.get("aiq_location").then(setLocation);
  }, []);

  const filtered = logs
    .filter((l) => {
      // Applies search + date filters, then sorts newest entries first.
      const matchName =
        l.userName?.toLowerCase().includes(search.toLowerCase()) ||
        l.department?.toLowerCase().includes(search.toLowerCase());
      const matchDate = dateFilter
        ? new Date(l.time).toDateString() === new Date(dateFilter).toDateString()
        : true;
      return matchName && matchDate;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const del = async (id) => {
    const updated = logs.filter((l) => l.id !== id);
    await DB.set("aiq_attendance", updated);
    setLogs(updated);
    setConfirm(null);
  };

  const todayCount = logs.filter(
    (l) => new Date(l.time).toDateString() === new Date().toDateString()
  ).length;
  const empCount = users.filter((u) => u.role === "employee").length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Attendance Logs</div>
        <div className="page-sub">
          Full audit trail of all clock-ins across your organization.
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-val">{logs.length}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">{todayCount}</div>
          <div className="stat-label">Today's Clock-Ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-val">{empCount}</div>
          <div className="stat-label">Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-val">
            {location ? "Active" : "None"}
          </div>
          <div className="stat-label">Work Location</div>
        </div>
      </div>
      <div className="card">
        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="🔍 Search by name or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <input
            className="filter-input"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {(search || dateFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(""); setDateFilter(""); }}
            >
              Clear filters
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No records found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Distance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: `linear-gradient(135deg, var(--brown-600), var(--brown-400))` }}
                      >
                        {initials(a.userName)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{a.userName}</span>
                    </div>
                  </td>
                  <td>{a.department || "—"}</td>
                  <td>{formatDate(a.time)}</td>
                  <td style={{ fontWeight: 500 }}>{formatTime(a.time)}</td>
                  <td style={{ fontWeight: 500 }}>
                    {a.clockOutTime ? formatTime(a.clockOutTime) : "—"}
                  </td>
                  <td>{a.distance != null ? `${a.distance}m` : "—"}</td>
                  <td>
                    <span className="badge badge-success">✓ Present</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirm(a.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Delete Record?</div>
            <div className="modal-sub">
              This action cannot be undone. The attendance record will be
              permanently removed.
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => del(confirm)}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceLogs;
