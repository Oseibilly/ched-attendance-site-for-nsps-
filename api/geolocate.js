export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_GEOLOCATION_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Geolocation API is not configured on the server" });
    return;
  }

  try {
    // No wifi/cell data is available from a browser page, so this resolves
    // to an IP-based lookup only — approximate (often city-level), not a
    // substitute for GPS.
    const gRes = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ considerIp: true }),
      }
    );
    const data = await gRes.json();
    if (!gRes.ok) {
      res.status(gRes.status).json({ error: data.error?.message || "Geolocation lookup failed" });
      return;
    }
    res.status(200).json({
      lat: data.location.lat,
      lng: data.location.lng,
      accuracy: Math.round(data.accuracy),
      source: "ip",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
