import { useState, useEffect } from "react";
import { DB } from "./db";
import { uid, initials } from "./helpers";

// ─── Admin: Manage Users ────────────────────────────────────────────────────
const ManageUsers = ({ show, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    DB.get("aiq_users").then((u) => {
      setUsers(u || []);
      setLoading(false);
    });
  }, []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });
  const [err, setErr] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const [sending, setSending] = useState(false);

  const add = async () => {
    // Creates a new employee/admin record and updates persistent storage.
    setErr("");
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const department = form.department.trim();
    if (!name || !email || !password) {
      setErr("All fields required.");
      return;
    }
    if (users.find((u) => u.email.toLowerCase() === email)) {
      setErr("Email already exists.");
      return;
    }
    const user = { id: uid(), name, email, password, role: form.role, department, avatar: initials(name) };
    const updated = [...users, user];
    await DB.set("aiq_users", updated);
    setUsers(updated);
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role: "employee", department: "" });

    setSending(true);
    try {
      const res = await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error();
      show("Employee added and credentials emailed.", "success");
    } catch {
      show("Employee added, but the credentials email failed to send.", "error");
    } finally {
      setSending(false);
    }
  };

  const del = async (id) => {
    // Removes a user account from the shared database and UI state.
    const updated = users.filter((u) => u.id !== id);
    await DB.set("aiq_users", updated);
    setUsers(updated);
    setDelConfirm(null);
    show("User removed.", "info");
  };

  const avatarColors = ["#6B4226", "#8B5A35", "#A67C52", "#4A2E1A", "#C4A882"];

  return (
    <div>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div className="page-title">Team Members</div>
          <div className="page-sub">Manage employee accounts and roles.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <h3>Loading…</h3>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users yet</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {initials(u.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--brown-500)" }}>{u.email}</td>
                  <td>{u.department || "—"}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-warning" : "badge-neutral"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.id !== currentUser.id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDelConfirm(u.id)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Add Employee</div>
            <div className="modal-sub">Create a new account for a team member.</div>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="jane@company.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  className="form-input"
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  placeholder="Finance"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setShowModal(false); setErr(""); }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={add}>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Remove User?</div>
            <div className="modal-sub">
              This user will lose access to CHED NSS ATTENDANCE CLOCK-IN.
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => del(delConfirm)}>
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
