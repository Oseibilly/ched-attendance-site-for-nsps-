import { useState } from "react";
import { DB } from "./db";

// ─── Login Page ─────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin, onSwitch }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    // Simulates async auth and validates credentials from stored users.
    const email = form.email.trim().toLowerCase();
    setTimeout(() => {
      const users = DB.get("aiq_users") || [];
      const user = users.find(
        (u) => u.email.toLowerCase() === email && u.password === form.password
      );
      if (user) {
        onLogin(user);
      } else {
        setErr("Invalid email or password.");
      }
      setLoading(false);
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
          <h1>Precision Attendance, Powered by Location</h1>
          <p>
            GPS-verified clock-ins ensure your team is exactly where they need
            to be — every single day.
          </p>
        </div>
        <div className="auth-features">
          {[
            "Real-time GPS location verification",
            "Automated time-stamped attendance logs",
            "Role-based admin & employee access",
            "Clean audit trail for every record",
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
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your CHED NSS ATTENDANCE CLOCK-IN account</p>
          {err && <div className="alert alert-error">⚠ {err}</div>}
          <form onSubmit={handle}>
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
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div style={{ marginTop: 8, marginBottom: 24, textAlign: "right" }}>
              <span style={{ fontSize: 12, color: "var(--brown-500)" }}>
                Demo: admin@company.com / Admin@123
              </span>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <div className="auth-switch">
            Don't have an account?{" "}
            <button onClick={onSwitch}>Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
