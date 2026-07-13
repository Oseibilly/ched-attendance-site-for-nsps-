import { useState, useEffect, useCallback } from "react";
import { uid } from "./helpers";

// ─── Toast Hook ────────────────────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "info") => {
    // Pushes a toast and auto-removes it after a short delay.
    const id = uid();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, show };
};

// ─── Live Clock Hook ───────────────────────────────────────────────────────
export const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

// ─── GPS Hook ──────────────────────────────────────────────────────────────
export const useGPS = () => {
  const [state, setState] = useState({
    status: "idle",
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
  });

  const fetch = useCallback(() => {
    // Requests a fresh high-accuracy position from browser geolocation.
    setState((p) => ({ ...p, status: "loading", error: null }));
    if (!navigator.geolocation) {
      setState((p) => ({ ...p, status: "error", error: "Geolocation not supported." }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "ok",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          error: null,
        }),
      (err) =>
        setState((p) => ({
          ...p,
          status: "error",
          error: err.message || "Location access denied.",
        })),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { ...state, refetch: fetch };
};
