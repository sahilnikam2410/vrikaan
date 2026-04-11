export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  const fields =
    "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,proxy,hosting";

  // When no query param, use the visitor's real IP (forwarded by Vercel)
  const clientIP = q || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.headers["x-real-ip"] || "";

  const endpoint = clientIP
    ? `http://ip-api.com/json/${encodeURIComponent(clientIP)}?fields=${fields}`
    : `http://ip-api.com/json/?fields=${fields}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ status: "fail", message: "IP lookup service unavailable" });
  }
}
