import { useState } from "react";
import { initials } from "./helpers";

// ─── Sidebar ───────────────────────────────────────────────────────────────
// Role-aware navigation: admins see management pages, employees see personal pages.
const Sidebar = ({ user, page, setPage, onLogout }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const adminNav = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "logs", icon: "📋", label: "Attendance Logs" },
    { id: "users", icon: "👥", label: "Team Members" },
    { id: "location", icon: "📍", label: "Work Location" },
  ];
  const empNav = [
    { id: "clockin", icon: "⏱", label: "Clock In" },
    { id: "history", icon: "📋", label: "My History" },
  ];
  const nav = user.role === "admin" ? adminNav : empNav;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <img className="sidebar-brand-icon" src="/COCOBOD.jpeg" alt="CHED logo" />
        <div>
          <div className="sidebar-brand-name">CHED NSS ATTENDANCE CLOCK-IN</div>
          <div className="sidebar-brand-sub">v1.0</div>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {nav.map((n) => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>
      <div className="sidebar-user">
        <div
          className="avatar avatar-sm"
          style={{ background: "linear-gradient(135deg, var(--brown-600), var(--brown-400))" }}
        >
          {initials(user.name)}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">{user.role}</div>
        </div>
        <button className="logout-btn" title="Sign out" onClick={() => setConfirmLogout(true)}>
          ⎋
        </button>
      </div>

      {confirmLogout && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Sign out?</div>
            <div className="modal-sub">You'll need to sign in again to access CHED NSS ATTENDANCE CLOCK-IN.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
