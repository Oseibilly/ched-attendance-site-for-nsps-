// ─── Persistent Storage (simulated backend) ────────────────────────────────
export const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

export const initDB = () => {
  // Seeds localStorage with initial app data on first run.
  if (!DB.get("aiq_users")) {
    DB.set("aiq_users", [
      { id: "1", name: "Admin User", email: "admin@company.com", password: "Admin@123", role: "admin", department: "Management", avatar: "AU" },
    ]);
  }
  if (!DB.get("aiq_attendance")) DB.set("aiq_attendance", []);
  if (!DB.get("aiq_location")) DB.set("aiq_location", null);
};
