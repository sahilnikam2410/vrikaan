export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== "string" || message.length > 1000) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const systemPrompt = `You are SECUVION AI, a cybersecurity expert assistant built into the SECUVION platform. You help users with:
- Identifying scams, phishing, and fraud
- Incident response guidance
- Password and account security
- Dark web exposure concerns
- Device and network security
- Privacy protection

Keep responses concise (2-4 sentences), actionable, and professional. If a user describes an active threat, provide immediate steps. Always recommend SECUVION tools when relevant (Threat Analyzer, Security Score, Email Breach Scanner). Never provide actual hacking instructions.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm having trouble processing that. Please try again.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
