// Lightweight local-database API (reads/writes persisted keys like attendance lists).
import { DB } from "./db";
// Human-readable date/time strings and initials for avatar placeholders.
import { formatDate, formatTime, initials } from "./helpers";
// Hook that returns the current Date and updates over time so the header stays “live”.
import { useClock } from "./index";

// ─── Admin Dashboard ───────────────────────────────────────────────────────
// First screen for admins: counts for today, employees, all records, location status,
// plus a table of who clocked in today (sorted by time).
const AdminDashboard = () => {
  // All attendance log entries ever stored (array); default to [] if nothing saved yet.
  const logs = DB.get("aiq_attendance") || [];
  // All user accounts; used to count how many employees exist.
  const users = DB.get("aiq_users") || [];
  // Single saved workplace GPS/config blob; required before employees can clock in.
  const loc = DB.get("aiq_location");
  // Keep only logs whose timestamp falls on today’s calendar date (local timezone).
  const todayLogs = logs.filter(
    (l) => new Date(l.time).toDateString() === new Date().toDateString()
  );
  // Number of users with role "employee" (excludes admins from the headcount).
  const empCount = users.filter((u) => u.role === "employee").length;
  // Current time for the subtitle; re-renders periodically via useClock().
  const now = useClock();

  return (
    <div>
      {/* Top title row: page name + today’s date string */}
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">
          {formatDate(now.toISOString())} · Admin overview
        </div>
      </div>
      {/* Four summary tiles: quick metrics at a glance */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">{todayLogs.length}</div>
          <div className="stat-label">Today's Clock-Ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-val">{empCount}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-val">{logs.length}</div>
          <div className="stat-label">All-Time Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          {/* "Set" if admin configured coordinates; "None" prompts them to fix setup */}
          <div className="stat-val">{loc ? "Set" : "None"}</div>
          <div className="stat-label">Work Location</div>
        </div>
      </div>

      {/* Warn prominently if clock-in would fail until location exists */}
      {!loc && (
        <div className="alert alert-warning">
          ⚠ No work location configured. Employees cannot clock in until you
          set a GPS location in Work Location settings.
        </div>
      )}

      <div className="card">
        <div className="card-title">Today's Attendance</div>
        {todayLogs.length === 0 ? (
          // Friendly empty state when nobody has clocked in yet today
          <div className="empty-state">
            <div className="empty-state-icon">🌅</div>
            <h3>No clock-ins yet today</h3>
            <p>Check back after your team arrives.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Distance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {
                // Earliest clock-in first; compare raw timestamps
                todayLogs
                  .sort((a, b) => new Date(a.time) - new Date(b.time))
                  .map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* Circle with initials; brown matches app theme */}
                          <div
                            className="avatar avatar-sm"
                            style={{ background: "var(--brown-600)" }}
                          >
                            {initials(a.userName)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{a.userName}</span>
                        </div>
                      </td>
                      {/* Show em dash when department was not stored */}
                      <td>{a.department || "—"}</td>
                      <td style={{ fontWeight: 600, color: "var(--brown-800)" }}>
                        {formatTime(a.time)}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--brown-800)" }}>
                        {a.clockOutTime ? formatTime(a.clockOutTime) : "—"}
                      </td>
                      {/* Distance from geofence in meters; em dash if missing */}
                      <td>{a.distance != null ? `${a.distance}m` : "—"}</td>
                      <td>
                        <span className="badge badge-success">✓ Present</span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
