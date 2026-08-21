import { useState, useEffect, useRef } from "react";
import { DB } from "./db";
import { uid, initials, downloadCSV, parseCSV, toLocalDateStr } from "./helpers";

// ─── Admin: Manage Users ────────────────────────────────────────────────────
const ManageUsers = ({ show, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [sendEmailsOnImport, setSendEmailsOnImport] = useState(true);

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
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErr, setEditErr] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleteText, setBulkDeleteText] = useState("");

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

  const openEdit = (u) => {
    setEditErr("");
    setEditForm({ name: u.name, email: u.email, password: u.password, role: u.role, department: u.department || "" });
    setEditUser(u);
    setShowEditPassword(false);
  };

  const saveEdit = async () => {
    setEditErr("");
    const name = editForm.name.trim();
    const email = editForm.email.trim().toLowerCase();
    const password = editForm.password;
    const department = editForm.department.trim();
    if (!name || !email || !password) {
      setEditErr("All fields required.");
      return;
    }
    if (users.find((u) => u.id !== editUser.id && u.email.toLowerCase() === email)) {
      setEditErr("Email already exists.");
      return;
    }
    const updated = users.map((u) =>
      u.id === editUser.id
        ? { ...u, name, email, password, role: editForm.role, department, avatar: initials(name) }
        : u
    );
    await DB.set("aiq_users", updated);
    setUsers(updated);
    setEditUser(null);
    show("Employee updated successfully.", "success");
  };

  const resendCredentials = async () => {
    // Re-emails the employee's currently saved login credentials, e.g. when
    // they've forgotten their password.
    setResending(true);
    try {
      const res = await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editUser.name, email: editUser.email, password: editUser.password }),
      });
      if (!res.ok) throw new Error();
      show(`Credentials resent to ${editUser.email}.`, "success");
    } catch {
      show("Failed to resend the credentials email.", "error");
    } finally {
      setResending(false);
    }
  };

  const exportUsers = () => {
    downloadCSV(
      `employees-${toLocalDateStr(new Date())}.csv`,
      ["Name", "Email", "Department", "Role", "Password"],
      users.map((u) => [u.name, u.email, u.department || "", u.role, u.password])
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result).replace(new RegExp("^" + String.fromCharCode(0xfeff)), "");
      const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ""));
      if (rows.length < 2) {
        show("The file has no data rows.", "error");
        return;
      }
      const headers = rows[0].map((h) => h.trim().toLowerCase());
      const col = (name) => headers.indexOf(name);
      const nameIdx = col("name"), emailIdx = col("email"), passwordIdx = col("password");
      const departmentIdx = col("department"), roleIdx = col("role");
      if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
        show("CSV must include Name, Email, and Password columns.", "error");
        return;
      }
      const seenEmails = new Set(users.map((u) => u.email.toLowerCase()));
      const valid = [];
      let skipped = 0;
      for (const row of rows.slice(1)) {
        const name = (row[nameIdx] || "").trim();
        const email = (row[emailIdx] || "").trim().toLowerCase();
        const password = (row[passwordIdx] || "").trim();
        const department = departmentIdx > -1 ? (row[departmentIdx] || "").trim() : "";
        const role = roleIdx > -1 && (row[roleIdx] || "").trim().toLowerCase() === "admin" ? "admin" : "employee";
        if (!name || !email || !password || seenEmails.has(email)) {
          skipped++;
          continue;
        }
        seenEmails.add(email);
        valid.push({ name, email, password, department, role });
      }
      setImportPreview({ valid, skipped });
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    setImporting(true);
    const newUsers = importPreview.valid.map((u) => ({ ...u, id: uid(), avatar: initials(u.name) }));
    const updated = [...users, ...newUsers];
    await DB.set("aiq_users", updated);
    setUsers(updated);

    let emailFailures = 0;
    if (sendEmailsOnImport) {
      await Promise.all(
        newUsers.map(async (u) => {
          try {
            const res = await fetch("/api/send-credentials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: u.name, email: u.email, password: u.password }),
            });
            if (!res.ok) emailFailures++;
          } catch {
            emailFailures++;
          }
        })
      );
    }

    const skippedNote = importPreview.skipped ? ` ${importPreview.skipped} row(s) skipped.` : "";
    const emailNote = sendEmailsOnImport && emailFailures ? ` ${emailFailures} credential email(s) failed to send.` : "";
    show(`Imported ${newUsers.length} employee(s).${skippedNote}${emailNote}`, emailFailures ? "error" : "success");
    setImportPreview(null);
    setImporting(false);
  };

  const employeeCount = users.filter((u) => u.role === "employee" && u.id !== currentUser.id).length;

  const removeAllEmployees = async () => {
    // Keeps admin accounts (and the current user, as a safety net) intact;
    // attendance history is untouched since records store name/department
    // directly rather than referencing the user account.
    const updated = users.filter((u) => u.role !== "employee" || u.id === currentUser.id);
    const removedCount = users.length - updated.length;
    await DB.set("aiq_users", updated);
    setUsers(updated);
    setBulkDeleteConfirm(false);
    setBulkDeleteText("");
    show(`Removed ${removedCount} employee${removedCount === 1 ? "" : "s"}. Admin accounts were kept.`, "info");
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
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-gold" onClick={exportUsers} disabled={users.length === 0}>
            📊 Export to Excel
          </button>
          <button className="btn btn-gold" onClick={() => fileInputRef.current.click()}>
            📥 Import from Excel
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Employee
          </button>
        </div>
      </div>

      {employeeCount > 0 && (
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20, padding: "12px 16px", borderRadius: 10,
            background: "var(--error-light)", border: "1px solid rgba(200,60,60,0.2)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--brown-500)" }}>
            End of service year? Clear out this batch before importing the next one.
          </span>
          <button className="btn btn-danger btn-sm" onClick={() => setBulkDeleteConfirm(true)}>
            🗑 Remove All Employees
          </button>
        </div>
      )}
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
                <tr key={u.id} onClick={() => openEdit(u)} style={{ cursor: "pointer" }}>
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
                  <td onClick={(e) => e.stopPropagation()}>
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
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showAddPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword((v) => !v)}
                  aria-label={showAddPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: 16,
                    color: "var(--brown-500)", padding: 4, lineHeight: 1,
                  }}
                >
                  {showAddPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setShowModal(false); setErr(""); setShowAddPassword(false); }}
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

      {editUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Employee Details</div>
            <div className="modal-sub">View and update this team member's account.</div>
            {editErr && <div className="alert alert-error">{editErr}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  className="form-input"
                  value={editForm.department}
                  onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showEditPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((v) => !v)}
                  aria-label={showEditPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: 16,
                    color: "var(--brown-500)", padding: 4, lineHeight: 1,
                  }}
                >
                  {showEditPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div className="modal-actions" style={{ justifyContent: "space-between" }}>
              {editUser.id !== currentUser.id ? (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { setDelConfirm(editUser.id); setEditUser(null); }}
                >
                  Remove User
                </button>
              ) : <span />}
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-gold" onClick={resendCredentials} disabled={resending}>
                  {resending ? "Sending…" : "✉ Resend Password"}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveEdit}>
                  Save Changes
                </button>
              </div>
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

      {bulkDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Remove All Employees?</div>
            <div className="modal-sub">
              This will permanently remove {employeeCount} employee account{employeeCount === 1 ? "" : "s"}.
              Admin accounts are kept, and past attendance records are not affected — but export the Team
              Members list first if you want a record of who's leaving before continuing.
            </div>
            <div className="form-group">
              <label className="form-label">Type REMOVE ALL to confirm</label>
              <input
                className="form-input"
                value={bulkDeleteText}
                onChange={(e) => setBulkDeleteText(e.target.value)}
                placeholder="REMOVE ALL"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setBulkDeleteConfirm(false); setBulkDeleteText(""); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={removeAllEmployees}
                disabled={bulkDeleteText !== "REMOVE ALL"}
              >
                Remove All Employees
              </button>
            </div>
          </div>
        </div>
      )}

      {importPreview && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Import Employees</div>
            <div className="modal-sub">
              {importPreview.valid.length} employee{importPreview.valid.length === 1 ? "" : "s"} will be added.
              {importPreview.skipped > 0 &&
                ` ${importPreview.skipped} row(s) skipped (missing fields or duplicate email).`}
            </div>
            {importPreview.valid.length > 0 && (
              <div
                style={{
                  maxHeight: 200, overflowY: "auto", marginBottom: 20,
                  fontSize: 13, color: "var(--brown-500)", border: "1px solid var(--brown-100)",
                  borderRadius: 8, padding: "8px 12px",
                }}
              >
                {importPreview.valid.map((u) => (
                  <div key={u.email} style={{ padding: "4px 0" }}>
                    {u.name} — {u.email} ({u.role})
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={sendEmailsOnImport}
                onChange={(e) => setSendEmailsOnImport(e.target.checked)}
              />
              Email login credentials to each new employee
            </label>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setImportPreview(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmImport}
                disabled={importing || importPreview.valid.length === 0}
              >
                {importing ? "Importing…" : `Import ${importPreview.valid.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
