import { useState, useEffect } from "react";
import { DB } from "./db";
import { getDistance, formatDate, formatTime, uid } from "./helpers";
import { useClock, useGPS } from "./index";

// ─── Employee: Clock In ────────────────────────────────────────────────────
const ClockIn = ({ user, show }) => {
  const now = useClock();
  const gps = useGPS();
  const [workLoc, setWorkLoc] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);

  useEffect(() => {
    DB.get("aiq_location").then(setWorkLoc);
    DB.get("aiq_attendance").then((a) => setAllAttendance(a || []));
  }, []);

  const attendance = allAttendance.filter((a) => a.userId === user.id);
  const todayStr = now.toDateString();
  const clockedToday = attendance.find(
    (a) => new Date(a.time).toDateString() === todayStr
  );

  let distance = null;
  let withinRange = false;
  if (gps.status === "ok" && workLoc) {
    distance = Math.round(
      getDistance(gps.lat, gps.lng, workLoc.lat, workLoc.lng)
    );
    withinRange = distance <= workLoc.radius;
  }

  const distPct =
    workLoc && distance !== null
      ? Math.min((distance / (workLoc.radius * 2)) * 100, 100)
      : 0;
  const distClass =
    distance === null
      ? ""
      : withinRange
      ? "safe"
      : distance < workLoc?.radius * 1.5
      ? "warn"
      : "danger";

  const doClockIn = async () => {
    // Enforces geofence and one-clock-in-per-day before writing attendance.
    if (!withinRange) {
      show("You are not within the registered work location.", "error");
      return;
    }
    if (clockedToday) {
      show("You have already clocked in today.", "error");
      return;
    }
    const record = {
      id: uid(),
      userId: user.id,
      userName: user.name,
      department: user.department,
      time: new Date().toISOString(),
      lat: gps.lat,
      lng: gps.lng,
      distance,
    };
    const updated = [...allAttendance, record];
    await DB.set("aiq_attendance", updated);
    setAllAttendance(updated);
    show(`✓ Attendance recorded at ${formatTime(record.time)}`, "success");
  };

  const doClockOut = async () => {
    if (!withinRange) {
      show("You are not within the registered work location.", "error");
      return;
    }
    if (!clockedToday) {
      show("You need to clock in first.", "error");
      return;
    }
    if (clockedToday.clockOutTime) {
      show("You have already clocked out today.", "error");
      return;
    }
    const clockOutTime = new Date().toISOString();
    const updated = allAttendance.map((a) =>
      a.id === clockedToday.id
        ? { ...a, clockOutTime, clockOutLat: gps.lat, clockOutLng: gps.lng, clockOutDistance: distance }
        : a
    );
    await DB.set("aiq_attendance", updated);
    setAllAttendance(updated);
    show(`✓ Clocked out at ${formatTime(clockOutTime)}`, "success");
  };

  const gpsClass =
    gps.status === "ok"
      ? "gps-ok"
      : gps.status === "loading"
      ? "gps-loading"
      : "gps-err";
  const dotClass =
    gps.status === "ok" ? "ok" : gps.status === "loading" ? "loading" : "err";
  const gpsMsg =
    gps.status === "ok"
      ? `Location acquired (±${gps.accuracy}m)`
      : gps.status === "loading"
      ? "Acquiring location…"
      : gps.error;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Good{" "}
          {now.getHours() < 12
            ? "Morning"
            : now.getHours() < 17
            ? "Afternoon"
            : "Evening"}
          , {user.name.split(" ")[0]}
        </div>
        <div className="page-sub">
          {formatDate(now.toISOString())} · Record your attendance for today
        </div>
      </div>

      <div className="clock-panel">
        <div className="clock-time">
          {now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </div>
        <div className="clock-date">{formatDate(now.toISOString())}</div>

        <div className={`gps-status ${gpsClass}`}>
          <div className={`gps-dot ${dotClass}`} />
          {gpsMsg}
        </div>

        {gps.status === "ok" && workLoc && (
          <div className="distance-bar">
            <div className="distance-label">
              <span>Your distance from work</span>
              <span>
                {distance}m away · Allowed: {workLoc.radius}m radius
              </span>
            </div>
            <div className="dist-track">
              <div
                className={`dist-fill ${distClass}`}
                style={{ width: `${distPct}%` }}
              />
            </div>
          </div>
        )}

        {!workLoc && (
          <div
            className="alert alert-warning"
            style={{
              marginTop: 20,
              background: "rgba(139,106,26,0.2)",
              color: "#E8D08A",
              border: "1px solid rgba(232,208,138,0.2)",
            }}
          >
            ⚠ Work location not configured. Contact your administrator.
          </div>
        )}

        <div className="clock-actions" style={{ marginTop: 28 }}>
          {!clockedToday ? (
            <button
              className="btn-clock-in"
              onClick={doClockIn}
              disabled={!withinRange || gps.status !== "ok" || !workLoc}
            >
              {gps.status === "loading"
                ? "⏳ Getting location…"
                : withinRange
                ? "✓ Clock In Now"
                : "✕ Outside Range"}
            </button>
          ) : clockedToday.clockOutTime ? (
            <div
              className="alert alert-success"
              style={{
                background: "rgba(61,107,79,0.3)",
                color: "#7DC49A",
                border: "1px solid rgba(125,196,154,0.2)",
                marginBottom: 0,
              }}
            >
              ✓ Clocked in at {formatTime(clockedToday.time)} · Clocked out at{" "}
              {formatTime(clockedToday.clockOutTime)}
            </div>
          ) : (
            <>
              <div
                className="alert alert-success"
                style={{
                  background: "rgba(61,107,79,0.3)",
                  color: "#7DC49A",
                  border: "1px solid rgba(125,196,154,0.2)",
                }}
              >
                ✓ You clocked in today at {formatTime(clockedToday.time)}
              </div>
              <button
                className="btn-clock-in"
                onClick={doClockOut}
                disabled={!withinRange || gps.status !== "ok"}
              >
                {gps.status === "loading"
                  ? "⏳ Getting location…"
                  : withinRange
                  ? "⏻ Clock Out Now"
                  : "✕ Outside Range"}
              </button>
            </>
          )}
          <button className="btn-clock-refresh" onClick={gps.refetch}>
            ↻ Refresh GPS
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Your Attendance History</div>
        {attendance.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No records yet</h3>
            <p>Your attendance history will appear here after your first clock-in.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Distance from Work</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...attendance]
                .reverse()
                .slice(0, 20)
                .map((a) => (
                  <tr key={a.id}>
                    <td>{formatDate(a.time)}</td>
                    <td style={{ fontWeight: 500 }}>{formatTime(a.time)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {a.clockOutTime ? formatTime(a.clockOutTime) : "—"}
                    </td>
                    <td>{a.distance != null ? `${a.distance}m` : "—"}</td>
                    <td>
                      <span className="badge badge-success">✓ Present</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClockIn;
