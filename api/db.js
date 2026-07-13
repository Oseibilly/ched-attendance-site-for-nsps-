import { Pool } from "pg";

const ALLOWED_KEYS = new Set(["aiq_users", "aiq_attendance", "aiq_location"]);

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

// Reused across warm serverless invocations; capped at 1 connection since
// each function instance handles requests one at a time.
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

let schemaReady = null;
const ensureSchema = () => {
  if (!schemaReady) {
    schemaReady = pool.query(
      `CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value JSONB)`
    );
  }
  return schemaReady;
};

export default async function handler(req, res) {
  const key = req.method === "GET" ? req.query.key : req.body?.key;
  if (!ALLOWED_KEYS.has(key)) {
    res.status(400).json({ error: "Unknown key" });
    return;
  }

  await ensureSchema();

  if (req.method === "GET") {
    const { rows } = await pool.query("SELECT value FROM kv WHERE key = $1", [key]);
    res.status(200).json({ value: rows[0]?.value ?? null });
    return;
  }

  if (req.method === "POST") {
    await pool.query(
      `INSERT INTO kv (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, JSON.stringify(req.body.value)]
    );
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
