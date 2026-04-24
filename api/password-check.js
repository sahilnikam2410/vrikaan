export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { hash } = req.body || {};

  if (!hash || typeof hash !== "string" || !/^[a-fA-F0-9]{5}$/.test(hash)) {
    return res.status(400).json({ error: "Invalid hash prefix. Send exactly 5 hex characters." });
  }

  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hash.toUpperCase()}`,
      { headers: { "User-Agent": "VRIKAAN/1.0" } }
    );

    if (!response.ok) {
      throw new Error(`HIBP API returned ${response.status}`);
    }

    const text = await response.text();
    return res.status(200).send(text);
  } catch (error) {
    return res.status(502).json({ error: "Password check service temporarily unavailable" });
  }
}
