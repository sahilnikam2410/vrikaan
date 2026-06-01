import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(clientIP, 15);
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  const { message, history = [], context = {} } = req.body;
  if (!message || typeof message !== "string" || message.length > 1000) {
    return res.status(400).json({ error: "Invalid message" });
  }
  // Sanitize context
  const ctxPath = String(context.path || "/").slice(0, 100);
  const ctxToolName = String(context.toolName || "").slice(0, 60);
  const ctxToolTier = ["free", "pro", "enterprise"].includes(context.toolTier) ? context.toolTier : "free";
  const ctxUserPlan = ["guest", "free", "pro", "enterprise"].includes(context.userPlan) ? context.userPlan : "guest";
  const ctxLoggedIn = !!context.loggedIn;

  const pageContextLine = ctxToolName
    ? `User is currently on "${ctxToolName}" page (${ctxPath}, ${ctxToolTier.toUpperCase()} tier).`
    : `User is currently on ${ctxPath}.`;
  const userContextLine = ctxLoggedIn
    ? `User is signed in with ${ctxUserPlan.toUpperCase()} plan.`
    : `User is not signed in (guest).`;

  // Empathy hint for emergency pages
  const emergencyPaths = ["/scam-recovery", "/otp-decay", "/stolen-phone", "/hacked", "/scammed"];
  const inEmergency = emergencyPaths.some(p => ctxPath.startsWith(p));
  const emergencyHint = inEmergency
    ? "IMPORTANT: User may be in active distress (fraud/scam victim). Be calm, direct, action-oriented. Lead with the 1930 helpline. Skip pleasantries."
    : "";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const systemPrompt = `You are VRIKAAN AI Assistant — a highly intelligent AI assistant built into the VRIKAAN cyber defense platform. You can answer ANY question on ANY topic.

Your personality:
- Friendly, professional, helpful, and knowledgeable
- Answer cybersecurity, programming, science, math, history, general knowledge, coding, writing, and creative tasks
- Use **bold**, *italic*, bullet points, and code blocks when helpful
- Keep responses concise (2-4 paragraphs) unless the user asks for detail
- For cybersecurity questions, give actionable security advice. Never provide hacking instructions.

About VRIKAAN:
- AI-powered cyber defense platform headquartered in Nashik, Maharashtra, India
- Founded in 2024

Leadership team (two founders):
- **Sahil Anil Nikam** — Founder & CEO · SOC Analyst & Cybersecurity Researcher. Drives product architecture, engineering, AI integration, payments, and the full deployment pipeline. Pune-born full-stack developer, SOC analyst, and cybersecurity researcher. Famous quote: "Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth."
- **Khushi Ishwar Raigade** — Co-Founder · SOC Analyst & Cybersecurity Researcher. Leads VRIKAAN's threat-intelligence pipeline, MITRE ATT&CK rule engineering, SIEM tuning, and incident-response playbooks. Famous quote: "Detection beats reaction. A defender's job is to find the attacker before they find the data."

Features: 50+ cybersecurity tools — Threat Map, Fraud Analyzer, Security Score, Dark Web Monitor, Password Vault, Vulnerability Scanner, Scam Check (SMS/email/WhatsApp), Deepfake / Vishing Audio Detector, Wazuh-style SOC Dashboard with MITRE ATT&CK mapping and compliance posture (PCI / GDPR / DPDP / SOC 2 / ISO 27001), Learn Academy, Blog.

Contact inboxes — route the user to the RIGHT email by intent:
- **hr@vrikaan.com** → Careers, internships, job applications, take-home submissions, interview logistics, hiring questions. Always recommend this for anything career-related. Apply form: vrikaan.com/apply
- **ai@vrikaan.com** → AI / ML feedback, bug reports, feature requests, API integration questions, dev partnership pitches, anything about the Gemini integration, model behaviour, or scam-detection accuracy.
- **hello@vrikaan.com** → General support, press & media, brand partnerships outside AI/dev, billing, refunds, account help, anything that does not fit the two above.

Phone: +91 8329935878 · HQ: Nashik, Maharashtra, India
Socials: x.com/vrikaan · linkedin.com/company/vrikaan-ai-cybersecurity · instagram.com/vrikaan_official · github.com/sahilnikam2410/vrikaan
Careers page: vrikaan.com/careers (short link: vrikaan.com/apply)

When a user asks "who founded VRIKAAN", "who built this", "team", "leadership", "founders", or asks about Sahil or Khushi specifically — mention BOTH founders by name and describe their respective roles.

When a user asks "how do I contact", "support", "email", "reach you", or shows intent for careers / AI feedback / general help — DO NOT give a single default email. Pick the right inbox from the routing list above and explain in one line WHY that inbox. If their intent is ambiguous, list all three inboxes with a one-line purpose each so the user can pick. Recommend VRIKAAN tools when relevant.`;

  // Per-request context injection — page, plan, emergency hint
  const contextPrompt = [
    "\n\n--- CURRENT SESSION CONTEXT ---",
    pageContextLine,
    userContextLine,
    emergencyHint,
    "Tailor your response to where the user is and what tier they have. If they ask about a specific tool, mention if it's on their current page or recommend the right route. If they're on Pro page on free plan, mention upgrade options softly.",
  ].filter(Boolean).join("\n");

  const messages = [
    { role: "system", content: systemPrompt + contextPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role === "ai" || m.role === "bot" ? "assistant" : "user",
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
