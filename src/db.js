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

const DEFAULT_BATCH = "2025/2026";

export const initDB = async () => {
  // Seeds the shared database with initial app data on first run.
  if (!(await DB.get("aiq_users"))) {
    await DB.set("aiq_users", [
      { id: "1", name: "Admin User", email: "admin@company.com", password: "Admin@123", role: "admin", department: "Management", avatar: "AU", batch: DEFAULT_BATCH },
    ]);
  }
  if (!(await DB.get("aiq_attendance"))) await DB.set("aiq_attendance", []);
  if (!(await DB.get("aiq_location"))) await DB.set("aiq_location", null);

  let activeBatch = await DB.get("aiq_active_batch");
  if (!activeBatch) {
    activeBatch = DEFAULT_BATCH;
    await DB.set("aiq_active_batch", activeBatch);
  }

  // Backfill accounts created before service-year batching existed, so they
  // stay part of the currently active batch instead of being locked out.
  const users = await DB.get("aiq_users");
  if (users?.some((u) => !u.batch)) {
    await DB.set(
      "aiq_users",
      users.map((u) => (u.batch ? u : { ...u, batch: activeBatch }))
    );
  }
};
