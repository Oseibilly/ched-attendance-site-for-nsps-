import { useState, useEffect } from "react";
import { DB } from "./db";

// ─── Admin: Location Setup ─────────────────────────────────────────────────
const LocationSetup = ({ show }) => {
  const [loc, setLoc] = useState(null);
  const [radius, setRadius] = useState(200);
  const [name, setName] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  // A saved location is locked (read-only) until the admin explicitly
  // chooses to update it, so casually revisiting this page can never
  // silently overwrite the real work location.
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    DB.get("aiq_location").then((l) => {
      if (l) {
        setLoc(l);
        setRadius(l.radius);
        setName(l.name);
        setPending({ lat: l.lat, lng: l.lng });
        setAccuracy(l.accuracy ?? null);
        setEditing(false);
      } else {
        setEditing(true);
      }
    });
  }, []);

  const startEdit = () => {
    // Re-enter edit mode without touching the currently saved coordinates.
    setPending(loc ? { lat: loc.lat, lng: loc.lng } : null);
    setName(loc?.name || "");
    setRadius(loc?.radius || 200);
    setAccuracy(loc?.accuracy ?? null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setPending(loc ? { lat: loc.lat, lng: loc.lng } : null);
    setName(loc?.name || "");
    setRadius(loc?.radius || 200);
    setAccuracy(loc?.accuracy ?? null);
    setEditing(false);
  };

  const captureGPS = () => {
    // Captures current admin location to define the office geofence center.
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPending({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
        show("Location captured.", "success");
      },
      () => {
        show("Could not get GPS location.", "error");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const save = async () => {
    // Persists selected coordinates, radius, and location label.
    if (!pending) { show("Capture a GPS location first.", "error"); return; }
    if (!name.trim()) { show("Enter a location name.", "error"); return; }
    const data = { lat: pending.lat, lng: pending.lng, radius, name: name.trim(), accuracy };
    await DB.set("aiq_location", data);
    setLoc(data);
    setEditing(false);
    show("Work location saved successfully!", "success");
  };

  const clear = async () => {
    await DB.set("aiq_location", null);
    setLoc(null);
    setPending(null);
    setName("");
    setRadius(200);
    setAccuracy(null);
    setEditing(true);
    show("Location cleared.", "info");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Work Location</div>
        <div className="page-sub">
          Set the GPS coordinates employees must be within to clock in.
        </div>
      </div>

      {loc && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          ✓ Location active: <strong>{loc.name}</strong> — {loc.radius}m radius
          around ({loc.lat.toFixed(5)}, {loc.lng.toFixed(5)})
          {loc.accuracy != null && ` · captured to within ±${loc.accuracy}m`}
        </div>
      )}

      {!editing ? (
        <div className="card">
          <div className="card-title">Location Locked</div>
          <div style={{ fontSize: 14, color: "var(--brown-500)", marginBottom: 20 }}>
            This location stays fixed until you choose to update it — no one
            can change it by accident.
          </div>
          <a
            href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--brown-600)", textDecoration: "underline", display: "inline-block", marginBottom: 20 }}
          >
            🗺 View this exact point on Google Maps
          </a>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={startEdit}>
              ✎ Update Location
            </button>
            <button className="btn btn-danger btn-sm" onClick={clear}>
              Clear Location
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">Configure Location</div>
          <div className={`loc-map-mock ${pending ? "loc-map-active" : ""}`}>
            {pending ? (
              <>
                <span style={{ fontSize: 36 }}>📍</span>
                <span style={{ fontSize: 14, color: "var(--success)", fontWeight: 600 }}>
                  {name || "Work Location"}
                </span>
                <span className="loc-coords">
                  Lat: {pending.lat.toFixed(6)} · Lng: {pending.lng.toFixed(6)}
                </span>
                <span style={{ fontSize: 12, color: "var(--brown-500)" }}>
                  Radius: {radius}m
                  {accuracy != null && ` · GPS accuracy: ±${accuracy}m`}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${pending.lat},${pending.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "var(--brown-600)", textDecoration: "underline" }}
                >
                  🗺 View on Google Maps
                </a>
              </>
            ) : (
              <>
                <span style={{ fontSize: 36, opacity: 0.4 }}>🗺</span>
                <span style={{ color: "var(--brown-400)", fontSize: 14 }}>
                  No location set — use the button below to capture GPS
                </span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location Name</label>
            <input
              className="form-input"
              placeholder="e.g. Head Office, Warehouse A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allowed Radius</label>
            <div className="radius-input-wrap">
              <input
                type="range"
                min="5"
                max="1000"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--brown-600)" }}
              />
              <div className="radius-display">{radius}m</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--brown-400)", marginTop: 6 }}>
              Employees must be within {radius} meters of this point to clock in.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={captureGPS} disabled={gpsLoading}>
              {gpsLoading ? "⏳ Capturing…" : "📍 Capture Current GPS"}
            </button>
            <button className="btn btn-primary" onClick={save} disabled={!pending}>
              Save Location
            </button>
            {loc && (
              <button className="btn btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSetup;
