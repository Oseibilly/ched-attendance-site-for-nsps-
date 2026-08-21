// ─── Helpers ───────────────────────────────────────────────────────────────

/** Haversine formula: returns distance in meters between two coordinates. */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** Local YYYY-MM-DD for a Date or ISO string, avoiding UTC-parsing day shifts. */
export const toLocalDateStr = (val) => {
  const d = val instanceof Date ? val : new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const LATE_CUTOFF_MINUTES = 8 * 60 + 30; // 8:30am

export const isLate = (iso) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() > LATE_CUTOFF_MINUTES;
};

/** Triggers a browser download of rows as a CSV file (opens directly in Excel). */
export const downloadCSV = (filename, headers, rows) => {
  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
