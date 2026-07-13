import { useState } from "react";
import { DB } from "./db";
import { uid, initials } from "./helpers";

// ─── Register Page ──────────────────────────────────────────────────────────
const RegisterPage = ({ onLogin, onSwitch }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    department: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setErr("");
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const department = form.department.trim();
    // Validates signup input and persists a newly created user.
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setTimeout(async () => {
      const users = (await DB.get("aiq_users")) || [];
      if (users.find((u) => u.email.toLowerCase() === email)) {
        setErr("Email already registered.");
        setLoading(false);
        return;
      }
      const user = {
        id: uid(),
        name,
        email,
        password: form.password,
        // Public sign-up always creates an employee account; admins are
        // granted by an existing admin via Team Members, never self-selected.
        role: "employee",
        department,
        avatar: initials(name),
      };
      await DB.set("aiq_users", [...users, user]);
      onLogin(user);
    }, 600);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-brand">
          <img className="auth-brand-icon" src="/COCOBOD.jpeg" alt="CHED logo" />
          <div>
            <div className="auth-brand-name">CHED NSS ATTENDANCE CLOCK-IN</div>
          </div>
        </div>
        <div className="auth-hero">
          <h1>Join Your Team on CHED NSS ATTENDANCE CLOCK-IN</h1>
          <p>
            Create your account and start tracking attendance with GPS precision
            from day one.
          </p>
        </div>
        <div className="auth-features">
          {[
            "Instant GPS clock-in on arrival",
            "View your attendance history",
            "Secure & privacy-respecting",
            "Works on any device",
          ].map((f) => (
            <div className="auth-feat" key={f}>
              <div className="auth-feat-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create account</h2>
          <p className="sub">Fill in your details to get started</p>
          {err && <div className="alert alert-error">⚠ {err}</div>}
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                className="form-input"
                placeholder="e.g. Finance"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat"
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
          <div className="auth-switch">
            Already have an account? <button onClick={onSwitch}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
