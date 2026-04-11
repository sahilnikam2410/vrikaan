export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter required" });
  }

  try {
    // Try XposedOrNot API (free, no key needed)
    const response = await fetch(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { headers: { "Accept": "application/json", "User-Agent": "SECUVION/1.0" } }
    );

    if (response.status === 404) {
      // Email not found in breaches
      return res.status(200).json({ breached: false, breaches: [], total: 0 });
    }

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // XposedOrNot returns breaches in data.breaches array
    const breaches = (data.breaches || []).map((b) => ({
      name: b.breach || b.name || "Unknown",
      domain: b.domain || "",
      date: b.xposed_date || b.date || "",
      dataTypes: b.xposed_data ? b.xposed_data.split(",").map((s) => s.trim()) : [],
      records: b.xposed_records || 0,
      description: b.details || "",
      logo: b.logo || "",
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      breached: breaches.length > 0,
      breaches,
      total: breaches.length,
      source: "XposedOrNot",
    });
  } catch (error) {
    // Fallback: try HIBP if API key is configured
    const hibpKey = process.env.HIBP_API_KEY;
    if (hibpKey) {
      try {
        const hibpRes = await fetch(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
          {
            headers: {
              "hibp-api-key": hibpKey,
              "User-Agent": "SECUVION/1.0",
            },
          }
        );

        if (hibpRes.status === 404) {
          return res.status(200).json({ breached: false, breaches: [], total: 0 });
        }

        if (hibpRes.ok) {
          const hibpData = await hibpRes.json();
          const breaches = hibpData.map((b) => ({
            name: b.Name,
            domain: b.Domain,
            date: b.BreachDate,
            dataTypes: b.DataClasses || [],
            records: b.PwnCount || 0,
            description: b.Description || "",
            logo: b.LogoPath || "",
          }));

          return res.status(200).json({
            breached: true,
            breaches,
            total: breaches.length,
            source: "HaveIBeenPwned",
          });
        }
      } catch {}
    }

    return res.status(502).json({ error: "Breach lookup service temporarily unavailable" });
  }
}
