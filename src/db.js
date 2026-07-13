// ─── Persistent Storage (shared backend via /api/db) ───────────────────────
export const DB = {
  get: async (k) => {
    const res = await fetch(`/api/db?key=${encodeURIComponent(k)}`);
    if (!res.ok) return null;
    const { value } = await res.json();
    return value;
  },
  set: async (k, v) => {
    await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, value: v }),
    });
  },
};

export const initDB = async () => {
  // Seeds the shared database with initial app data on first run.
  if (!(await DB.get("aiq_users"))) {
    await DB.set("aiq_users", [
      { id: "1", name: "Admin User", email: "admin@company.com", password: "Admin@123", role: "admin", department: "Management", avatar: "AU" },
    ]);
  }
  if (!(await DB.get("aiq_attendance"))) await DB.set("aiq_attendance", []);
  if (!(await DB.get("aiq_location"))) await DB.set("aiq_location", null);
};
