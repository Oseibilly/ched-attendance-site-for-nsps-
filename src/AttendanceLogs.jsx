import { useState, useEffect } from "react";
import { DB } from "./db";
import { formatDate, formatTime, initials, isLate, toLocalDateStr, downloadCSV } from "./helpers";

// ─── Admin: Attendance Logs ────────────────────────────────────────────────
const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [rosterDate, setRosterDate] = useState(toLocalDateStr(new Date()));

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
  const todayStr = toLocalDateStr(new Date());

  const exportLogs = () => {
    downloadCSV(
      `attendance-logs-${toLocalDateStr(new Date())}.csv`,
      ["Employee", "Department", "Date", "Clock In", "Clock In Status", "Clock Out", "Clock Out Status", "Distance (m)", "Clock-Out Distance (m)"],
      filtered.map((a) => {
        const missingClockOut = !a.clockOutTime && toLocalDateStr(a.time) !== todayStr;
        return [
          a.userName,
          a.department || "",
          formatDate(a.time),
          formatTime(a.time),
          isLate(a.time) ? "Late" : "On Time",
          a.clockOutTime ? formatTime(a.clockOutTime) : "",
          a.clockOutTime ? "Recorded" : missingClockOut ? "Missing" : "Pending",
          a.distance ?? "",
          a.clockOutDistance ?? "",
        ];
      })
    );
  };

  // Per-employee status for a single day, including employees who never
  // clocked in at all — the raw log above only ever contains events that
  // happened, so absences have to be derived by exclusion.
  const roster = users
    .filter((u) => u.role === "employee")
    .map((u) => {
      const record = logs.find(
        (l) => l.userId === u.id && toLocalDateStr(l.time) === rosterDate
      );
      if (!record) {
        return { user: u, record: null, status: "Absent" };
      }
      const late = isLate(record.time);
      const missingClockOut = !record.clockOutTime && rosterDate !== todayStr;
      let status = late ? "Late" : "On Time";
      if (missingClockOut) status += " · No Clock-Out";
      else if (!record.clockOutTime && rosterDate === todayStr) status += " · Clocked In";
      return { user: u, record, status };
    });

  const exportRoster = () => {
    downloadCSV(
      `daily-roster-${rosterDate}.csv`,
      ["Employee", "Department", "Date", "Status", "Clock In", "Clock Out"],
      roster.map((r) => [
        r.user.name,
        r.user.department || "",
        rosterDate,
        r.status,
        r.record ? formatTime(r.record.time) : "",
        r.record?.clockOutTime ? formatTime(r.record.clockOutTime) : "",
      ])
    );
  };

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
          <button className="btn btn-gold btn-sm" onClick={exportLogs} disabled={filtered.length === 0}>
            📊 Export to Excel
          </button>
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
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`badge ${isLate(a.time) ? "badge-warning" : "badge-success"}`}>
                        {isLate(a.time) ? "⏰ Late" : "✓ On Time"}
                      </span>
                      {!a.clockOutTime && toLocalDateStr(a.time) !== todayStr && (
                        <span className="badge badge-error">⚠ No Clock-Out</span>
                      )}
                    </div>
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

      <div className="card" style={{ marginTop: 24 }}>
        <div
          className="page-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}
        >
          <div>
            <div className="card-title" style={{ marginBottom: 4 }}>Daily Roster</div>
            <div style={{ fontSize: 13, color: "var(--brown-500)" }}>
              Every employee's status for one day, including anyone who never clocked in.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              className="filter-input"
              type="date"
              value={rosterDate}
              onChange={(e) => setRosterDate(e.target.value)}
            />
            <button className="btn btn-gold btn-sm" onClick={exportRoster} disabled={roster.length === 0}>
              📊 Export to Excel
            </button>
          </div>
        </div>
        {roster.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No employees yet</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: `linear-gradient(135deg, var(--brown-600), var(--brown-400))` }}
                      >
                        {initials(r.user.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{r.user.name}</span>
                    </div>
                  </td>
                  <td>{r.user.department || "—"}</td>
                  <td style={{ fontWeight: 500 }}>{r.record ? formatTime(r.record.time) : "—"}</td>
                  <td style={{ fontWeight: 500 }}>
                    {r.record?.clockOutTime ? formatTime(r.record.clockOutTime) : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "Absent" || r.status.includes("No Clock-Out")
                          ? "badge-error"
                          : r.status.includes("Late")
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {r.status === "Absent" ? "✕ Absent" : r.status}
                    </span>
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
