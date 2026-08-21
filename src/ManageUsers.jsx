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
  const [activeBatch, setActiveBatch] = useState("");
  const [viewBatch, setViewBatch] = useState("current");
  const [newBatchModal, setNewBatchModal] = useState(false);
  const [newBatchText, setNewBatchText] = useState("");

  useEffect(() => {
    Promise.all([DB.get("aiq_users"), DB.get("aiq_active_batch")]).then(([u, b]) => {
      setUsers(u || []);
      setActiveBatch(b || "");
      setLoading(false);
    });
  }, []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    batch: "",
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
    const batch = form.batch.trim() || activeBatch;
    const user = { id: uid(), name, email, password, role: form.role, department, avatar: initials(name), batch };
    const updated = [...users, user];
    await DB.set("aiq_users", updated);
    setUsers(updated);
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role: "employee", department: "", batch: "" });

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
    setEditForm({
      name: u.name, email: u.email, password: u.password, role: u.role,
      department: u.department || "", batch: u.batch || activeBatch,
    });
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
    const batch = editForm.batch.trim() || activeBatch;
    const updated = users.map((u) =>
      u.id === editUser.id
        ? { ...u, name, email, password, role: editForm.role, department, avatar: initials(name), batch }
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
      ["Name", "Email", "Department", "Role", "Service Year", "Password"],
      visibleUsers.map((u) => [u.name, u.email, u.department || "", u.role, u.batch || "", u.password])
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
      const batchIdx = col("service year") > -1 ? col("service year") : col("batch");
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
        const batch = (batchIdx > -1 ? (row[batchIdx] || "").trim() : "") || activeBatch;
        if (!name || !email || !password || seenEmails.has(email)) {
          skipped++;
          continue;
        }
        seenEmails.add(email);
        valid.push({ name, email, password, department, role, batch });
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

  const distinctBatches = [...new Set(users.map((u) => u.batch).filter(Boolean))].sort().reverse();
  const targetBatch = viewBatch === "current" ? activeBatch : viewBatch;
  const visibleUsers =
    viewBatch === "all" ? users : users.filter((u) => (u.batch || activeBatch) === targetBatch);

  const startNewServiceYear = async () => {
    const name = newBatchText.trim();
    if (!name) return;
    await DB.set("aiq_active_batch", name);
    setActiveBatch(name);
    setViewBatch(name);
    setNewBatchModal(false);
    setNewBatchText("");
    show(
      `"${name}" is now the active service year. Past employees keep their records but can no longer log in — add or import the new intake to get started.`,
      "success"
    );
  };

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
          <div className="page-sub">
            Manage employee accounts and roles. Current service year: <strong>{activeBatch}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-gold" onClick={exportUsers} disabled={visibleUsers.length === 0}>
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
          <button
            className="btn btn-primary"
            onClick={() => { setForm((p) => ({ ...p, batch: activeBatch })); setShowModal(true); }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, padding: "12px 16px", borderRadius: 10, flexWrap: "wrap", gap: 12,
          background: "var(--brown-100)",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--brown-500)" }}>
          End of service year? Starting a new one keeps every past employee's records — they just
          won't be able to log in anymore, freeing you up to add the next intake.
        </span>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => { setNewBatchText(""); setNewBatchModal(true); }}
        >
          🆕 Start New Service Year
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "var(--brown-500)" }}>Viewing:</span>
        <select
          className="filter-input"
          value={viewBatch}
          onChange={(e) => setViewBatch(e.target.value)}
        >
          <option value="current">Current Service Year ({activeBatch})</option>
          <option value="all">All Service Years</option>
          {distinctBatches.filter((b) => b !== activeBatch).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {employeeCount > 0 && (
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--error)" }}
            onClick={() => setBulkDeleteConfirm(true)}
          >
            🗑 Permanently delete all employee accounts instead
          </button>
        </div>
      )}
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <h3>Loading…</h3>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users in this view</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Service Year</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u, i) => {
                const userBatch = u.batch || activeBatch;
                const isCurrent = u.role === "admin" || userBatch === activeBatch;
                return (
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
                      <span className={`badge ${isCurrent ? "badge-success" : "badge-neutral"}`}>
                        {userBatch}
                      </span>
                    </td>
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
                );
              })}
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
              <label className="form-label">Service Year</label>
              <input
                className="form-input"
                value={form.batch}
                onChange={(e) => setForm((p) => ({ ...p, batch: e.target.value }))}
                placeholder={activeBatch}
              />
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
              <label className="form-label">
                Service Year
                {editForm.role === "admin" || editForm.batch === activeBatch ? (
                  <span className="badge badge-success" style={{ marginLeft: 8 }}>Current</span>
                ) : (
                  <span className="badge badge-neutral" style={{ marginLeft: 8 }}>Past — can't log in</span>
                )}
              </label>
              <input
                className="form-input"
                value={editForm.batch}
                onChange={(e) => setEditForm((p) => ({ ...p, batch: e.target.value }))}
              />
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

      {newBatchModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Start New Service Year</div>
            <div className="modal-sub">
              Everyone in <strong>{activeBatch}</strong> keeps their account and attendance history, but
              won't be able to log in once this switches. New employees you add or import will join the
              new service year by default.
            </div>
            <div className="form-group">
              <label className="form-label">New Service Year Name</label>
              <input
                className="form-input"
                value={newBatchText}
                onChange={(e) => setNewBatchText(e.target.value)}
                placeholder="e.g. 2026/2027"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setNewBatchModal(false); setNewBatchText(""); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={startNewServiceYear}
                disabled={!newBatchText.trim()}
              >
                Start "{newBatchText.trim() || "…"}"
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
              This will permanently delete {employeeCount} employee account{employeeCount === 1 ? "" : "s"}
              and cannot be undone. Admin accounts are kept, and past attendance records are not deleted
              with them — but if you just want to lock last year's group out without losing their records,
              use "Start New Service Year" instead. Export the Team Members list first if you want a backup
              before continuing.
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
                    {u.name} — {u.email} ({u.role}, {u.batch})
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
