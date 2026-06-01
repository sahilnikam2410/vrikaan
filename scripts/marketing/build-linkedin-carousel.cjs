/**
 * VRIKAAN — LinkedIn Carousel PDF Generator
 *
 * Builds a 10-slide 4:5 portrait carousel optimised for LinkedIn's
 * document-post feature. Output is a .pptx that the docx-to-pdf.ps1
 * pipeline can convert to PDF via PowerPoint COM.
 *
 * Why 4:5 portrait: LinkedIn document posts default to portrait crop
 * on mobile. 4:5 maximises vertical screen real estate and avoids the
 * tiny-square problem of 1:1 slides.
 *
 * Run:  node scripts/marketing/build-linkedin-carousel.cjs
 * Then: powershell -File scripts/marketing/carousel-to-pdf.ps1
 */
const fs = require("node:fs");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();

// 4:5 portrait — 10in × 12.5in. PowerPoint renders crisply at this ratio
// and LinkedIn keeps the whole page visible on a phone.
pptx.defineLayout({ name: "LI_CAROUSEL", width: 10, height: 12.5 });
pptx.layout = "LI_CAROUSEL";

pptx.title = "VRIKAAN — Cybersecurity for Every Indian";
pptx.author = "Sahil Anil Nikam · Khushi Ishwar Raigade";
pptx.company = "VRIKAAN";

// ─── Brand palette (consistent with site) ──────────────────────────
const C = {
  bg:      "030712",  // dark navy
  bg2:     "0F172A",  // panel surface
  ink:     "F1F5F9",  // primary text
  muted:   "94A3B8",  // secondary text
  subtle:  "475569",  // tertiary
  cyan:    "14E3C5",  // primary accent
  indigo:  "6366F1",  // secondary accent
  green:   "22C55E",
  yellow:  "FBBF24",
  red:     "EF4444",
  white:   "FFFFFF",
};

const FONT_HEAD = "Calibri"; // safe fallback; Inter / Space Grotesk recommended in figma
const FONT_BODY = "Calibri";
const FONT_MONO = "Consolas";

// ─── Master with full-bleed dark bg + page corner brand ────────────
pptx.defineSlideMaster({
  title: "DARK_MASTER",
  background: { color: C.bg },
  objects: [
    // top-left cyan square motif
    { rect: { x: 0.4, y: 0.4, w: 0.18, h: 0.18, fill: { color: C.cyan } } },
    // bottom strip — brand bar
    { rect: { x: 0, y: 12.05, w: 10, h: 0.05, fill: { color: C.cyan } } },
    { text: {
        text: "VRIKAAN  •  vrikaan.com",
        options: { x: 0.4, y: 12.15, w: 5, h: 0.3, fontSize: 11, fontFace: FONT_BODY,
          color: C.muted, align: "left" },
    } },
    { text: {
        text: "𝕏  in  ig  gh",
        options: { x: 5.5, y: 12.15, w: 4.1, h: 0.3, fontSize: 11, fontFace: FONT_BODY,
          color: C.muted, align: "right" },
    } },
  ],
});

// ─── Helpers ────────────────────────────────────────────────────────
const center = (s, text, opts = {}) => s.addText(text, {
  x: 0.4, y: opts.y || 0.5, w: 9.2, h: opts.h || 1,
  align: "center", valign: opts.valign || "middle",
  fontSize: opts.size || 30, bold: opts.bold !== false,
  color: opts.color || C.ink, fontFace: FONT_HEAD, ...opts.run,
});

const para = (s, text, opts = {}) => s.addText(text, {
  x: 0.6, y: opts.y || 1, w: 8.8, h: opts.h || 1,
  align: opts.align || "center", valign: opts.valign || "middle",
  fontSize: opts.size || 16, color: opts.color || C.muted,
  fontFace: FONT_BODY, ...opts.run,
});

const pill = (s, text, x, y, w, h, color = C.cyan) => {
  s.addShape("roundRect", { x, y, w, h, fill: { color: C.bg2 }, line: { color, width: 1 }, rectRadius: h / 2 });
  s.addText(text, { x, y, w, h, fontSize: 12, bold: true, color, align: "center", valign: "middle", fontFace: FONT_BODY });
};

const card = (s, x, y, w, h, color) => {
  s.addShape("roundRect", { x, y, w, h, fill: { color: C.bg2 }, line: { color: color || "1E293B", width: 1 }, rectRadius: 0.15 });
};

// ════════════════════════════════════════════════════════════════════
// SLIDE 1 — HOOK
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  // Big gradient block top
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 4.5,
    fill: { color: C.indigo }, line: { color: C.indigo } });
  s.addShape("rect", { x: 0, y: 4.0, w: 10, h: 0.5,
    fill: { color: C.cyan }, line: { color: C.cyan } });

  // Big number stat
  s.addText("₹11,000 Cr+", {
    x: 0.5, y: 1.1, w: 9, h: 1.6,
    fontSize: 78, bold: true, color: C.white, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("lost to cybercrime in India.\nLast year alone.", {
    x: 0.5, y: 2.7, w: 9, h: 1.0,
    fontSize: 22, color: C.white, align: "center", italic: true, fontFace: FONT_BODY,
  });

  // Main message
  center(s, "Norton costs ₹2,000+", { y: 5.2, size: 30, color: C.muted, run: { italics: true } });
  center(s, "VRIKAAN is FREE", { y: 6.0, size: 50, color: C.cyan, run: { charSpacing: 4 } });
  center(s, "and built in India.", { y: 7.2, size: 26, color: C.ink });

  // Sub-message
  para(s, "50+ cybersecurity tools  •  English + हिन्दी  •  Live in production", {
    y: 8.3, size: 16, color: C.muted,
  });

  // Bottom CTA pill
  pill(s, "→  Swipe to learn more", 3.0, 10.6, 4.0, 0.7, C.cyan);
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "THE PROBLEM", 4.0, 0.9, 2.0, 0.5, C.red);

  center(s, "Indians get scammed every day.", { y: 1.8, size: 32 });
  center(s, "But defense tools are not built for them.", { y: 2.7, size: 22, color: C.muted, run: { italics: true } });

  // 5 problem cards
  const probs = [
    ["Fragmented",    "VPN, password manager, antivirus — 3 apps, 3 bills."],
    ["Costly",        "₹2,000 to ₹4,500/year. Built for foreign offices."],
    ["English-only",  "Your parents read Hindi. Norton doesn't."],
    ["Reactive",      "Alerts AFTER the breach. Never before."],
    ["Opaque",        "Black-box verdicts. You can't learn from them."],
  ];
  probs.forEach((p, i) => {
    const y = 3.8 + i * 1.5;
    card(s, 0.6, y, 8.8, 1.25, C.red);
    // Red X marker
    s.addShape("ellipse", { x: 0.85, y: y + 0.3, w: 0.65, h: 0.65, fill: { color: C.red }, line: { color: C.red } });
    s.addText("✕", { x: 0.85, y: y + 0.3, w: 0.65, h: 0.65, fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT_HEAD });
    s.addText(p[0], { x: 1.7, y: y + 0.15, w: 7.5, h: 0.4, fontSize: 20, bold: true, color: C.ink, fontFace: FONT_HEAD });
    s.addText(p[1], { x: 1.7, y: y + 0.6, w: 7.5, h: 0.6, fontSize: 14, color: C.muted, fontFace: FONT_BODY });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 3 — THE SOLUTION
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "INTRODUCING", 3.8, 0.9, 2.4, 0.5, C.cyan);

  // Big brand name
  s.addText("VRIKAAN", {
    x: 0.5, y: 1.8, w: 9, h: 1.6,
    fontSize: 88, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD, charSpacing: 6,
  });
  center(s, "AI-powered cyber defense", { y: 3.5, size: 22, color: C.cyan, run: { italics: true } });
  center(s, "for every Indian.", { y: 4.1, size: 22, color: C.cyan, run: { italics: true } });

  // 3 hero pillars
  const pillars = [
    { title: "50+ Tools",       sub: "One dashboard",   color: C.cyan },
    { title: "EN + हिन्दी",     sub: "Bilingual UI",    color: C.indigo },
    { title: "₹0 — ₹990/yr",    sub: "INR-native",      color: C.green },
  ];
  pillars.forEach((p, i) => {
    const x = 0.5 + i * 3.0 + 0.2;
    const w = 2.85;
    const y = 5.6;
    card(s, x, y, w, 2.8, p.color);
    s.addText(p.title, {
      x, y: y + 0.45, w, h: 0.9,
      fontSize: 26, bold: true, color: p.color, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(p.sub, {
      x, y: y + 1.6, w, h: 0.6,
      fontSize: 14, color: C.muted, align: "center", fontFace: FONT_BODY,
    });
  });

  // Tagline
  para(s, "Built in India by SOC analysts & cybersecurity researchers.", {
    y: 8.8, size: 16, color: C.muted, run: { italics: true },
  });

  // LIVE pill
  pill(s, "● LIVE  vrikaan.com", 3.2, 10.6, 3.6, 0.7, C.green);
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 4 — TOOLS GRID
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "50+ TOOLS", 4.0, 0.9, 2.0, 0.5, C.cyan);
  center(s, "Every defense tool you need.", { y: 1.8, size: 28 });
  center(s, "In one place.", { y: 2.6, size: 22, color: C.muted, run: { italics: true } });

  const tools = [
    ["🛡", "Vulnerability\nScanner"],
    ["🌐", "DNS Leak\nTest"],
    ["🔓", "Breach\nLookup"],
    ["🗝", "Password\nVault"],
    ["🎣", "Phishing\nTrainer"],
    ["🌑", "Dark Web\nMonitor"],
    ["📱", "Scam SMS\nChecker"],
    ["🎙", "Deepfake\nDetector"],
    ["📷", "QR Scanner"],
    ["🪪", "Identity\nX-Ray"],
    ["📁", "File Hash\nScanner"],
    ["🛠", "SOC\nDashboard"],
  ];

  // 4×3 grid
  tools.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 3.0;
    const y = 3.6 + row * 1.85;
    card(s, x, y, 2.8, 1.65, C.cyan);
    s.addText(t[0], {
      x, y: y + 0.1, w: 2.8, h: 0.7,
      fontSize: 30, color: C.cyan, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(t[1], {
      x, y: y + 0.85, w: 2.8, h: 0.7,
      fontSize: 13, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
    });
  });

  para(s, "… and 38 more.", {
    y: 11.0, size: 16, color: C.muted, run: { italics: true },
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 5 — SOC DASHBOARD HIGHLIGHT
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "FLAGSHIP", 4.1, 0.9, 1.8, 0.5, C.indigo);

  center(s, "Wazuh-style SOC", { y: 1.7, size: 36 });
  center(s, "on the free tier.", { y: 2.6, size: 36, color: C.cyan });

  // Mini SOC screenshot mock — coloured tiles to evoke the live dashboard
  card(s, 0.6, 3.8, 8.8, 5.2, C.cyan);

  // Pretend top bar
  s.addShape("rect", { x: 0.6, y: 3.8, w: 8.8, h: 0.55, fill: { color: C.bg }, line: { color: C.cyan, width: 1 } });
  s.addText("● LIVE  ·  24h  ·  All severities  ·  All agents", {
    x: 0.85, y: 3.85, w: 8.5, h: 0.45,
    fontSize: 11, color: C.cyan, fontFace: FONT_MONO,
  });

  // 4 stat tiles
  const stats = [
    { label: "EVENTS",   value: "1,847", color: C.cyan },
    { label: "TACTICS",  value: "12",    color: C.indigo },
    { label: "CRITICAL", value: "3",     color: C.red },
    { label: "AGENTS",   value: "8",     color: C.green },
  ];
  stats.forEach((st, i) => {
    const x = 0.85 + i * 2.05;
    const y = 4.6;
    s.addShape("roundRect", { x, y, w: 1.85, h: 1.3,
      fill: { color: C.bg }, line: { color: st.color, width: 1 }, rectRadius: 0.08 });
    s.addText(st.label, {
      x, y: y + 0.1, w: 1.85, h: 0.3,
      fontSize: 9, bold: true, color: C.muted, align: "center", fontFace: FONT_BODY, charSpacing: 1.5,
    });
    s.addText(st.value, {
      x, y: y + 0.4, w: 1.85, h: 0.8,
      fontSize: 28, bold: true, color: st.color, align: "center", fontFace: FONT_HEAD,
    });
  });

  // Bottom event rows mock
  const events = [
    { sev: "14", text: "Malware indicator — agent device-42",      color: C.red },
    { sev: "12", text: "Suspicious sign-in from new device",        color: C.red },
    { sev: "10", text: "MFA disabled — user@example.com",           color: C.yellow },
    { sev: "8",  text: "Failed login attempt (brute force)",        color: C.yellow },
    { sev: "5",  text: "Scam message analyzed via /scam-check",     color: C.cyan },
  ];
  events.forEach((e, i) => {
    const y = 6.15 + i * 0.55;
    s.addShape("roundRect", { x: 0.85, y, w: 8.3, h: 0.45,
      fill: { color: C.bg }, line: { color: "1E293B", width: 0.5 }, rectRadius: 0.04 });
    s.addText(e.sev, { x: 0.95, y: y + 0.07, w: 0.5, h: 0.32,
      fontSize: 12, bold: true, color: e.color, align: "center", fontFace: FONT_MONO });
    s.addText(e.text, { x: 1.55, y: y + 0.07, w: 7.5, h: 0.32,
      fontSize: 11, color: C.ink, fontFace: FONT_BODY });
  });

  // Bottom MITRE hint
  para(s, "MITRE ATT&CK mapped  •  PCI / GDPR / DPDP / SOC 2 / ISO 27001 compliance", {
    y: 9.3, size: 13, color: C.muted,
  });

  para(s, "All built on Vercel free tier. Zero infrastructure cost.", {
    y: 10.1, size: 15, color: C.cyan, run: { italics: true, bold: true },
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 6 — AI FEATURES
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "AI-POWERED", 3.7, 0.9, 2.6, 0.5, C.indigo);

  center(s, "Real AI. Real defense.", { y: 1.8, size: 32 });
  center(s, "Powered by Google Gemini 2.5 Flash", { y: 2.7, size: 16, color: C.muted, run: { italics: true } });

  const ai = [
    { emoji: "📱", title: "Scam SMS Checker",      desc: "Paste UPI fraud SMS. Get verdict + red flags in 5 sec." },
    { emoji: "🎙", title: "Deepfake Audio",         desc: "Upload a phone call. AI flags synthetic voice + scam scripts." },
    { emoji: "🛡", title: "AI Vulnerability Scan", desc: "14 passive checks → AI synthesizes risk report." },
    { emoji: "🔧", title: "Auto-Fix Generator",     desc: "Click → AI writes copy-paste-ready CSP / HSTS headers." },
    { emoji: "💬", title: "Bilingual Voice Chat",   desc: "Speak in English or Hindi. Get cybersecurity answers." },
  ];

  ai.forEach((a, i) => {
    const y = 3.7 + i * 1.4;
    card(s, 0.6, y, 8.8, 1.2, C.indigo);
    s.addText(a.emoji, {
      x: 0.85, y: y + 0.25, w: 0.9, h: 0.7,
      fontSize: 28, color: C.indigo, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(a.title, {
      x: 1.85, y: y + 0.18, w: 7.0, h: 0.4,
      fontSize: 16, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(a.desc, {
      x: 1.85, y: y + 0.6, w: 7.0, h: 0.5,
      fontSize: 12, color: C.muted, fontFace: FONT_BODY,
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 7 — THE FOUNDERS
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "MEET THE FOUNDERS", 3.2, 0.9, 3.6, 0.5, C.cyan);

  center(s, "Two students.", { y: 1.7, size: 38 });
  center(s, "One mission.", { y: 2.5, size: 38, color: C.cyan });

  // Founder 1 — Sahil
  card(s, 0.5, 3.6, 4.4, 6.7, C.indigo);

  // S avatar
  s.addShape("roundRect", { x: 0.95, y: 4.0, w: 1.5, h: 1.5,
    fill: { color: C.indigo }, line: { color: C.indigo }, rectRadius: 0.4 });
  s.addText("S", { x: 0.95, y: 4.0, w: 1.5, h: 1.5,
    fontSize: 60, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT_HEAD });

  s.addText("Sahil Anil Nikam", { x: 0.7, y: 5.65, w: 4.0, h: 0.5,
    fontSize: 20, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD });
  s.addText("Founder & CEO", { x: 0.7, y: 6.15, w: 4.0, h: 0.35,
    fontSize: 12, bold: true, color: C.indigo, align: "center", fontFace: FONT_BODY });
  s.addText("SOC Analyst & Cybersecurity Researcher", {
    x: 0.7, y: 6.5, w: 4.0, h: 0.4,
    fontSize: 10, color: C.muted, italic: true, align: "center", fontFace: FONT_BODY });

  s.addText("“Cybersecurity shouldn’t be a luxury — it should be a right.”", {
    x: 0.85, y: 7.2, w: 3.7, h: 1.6,
    fontSize: 12, italic: true, color: C.ink, align: "center", valign: "middle", fontFace: FONT_BODY,
  });

  s.addText("Product · Engineering · AI · Deployments", {
    x: 0.7, y: 9.6, w: 4.0, h: 0.5,
    fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY,
  });

  // Founder 2 — Khushi
  card(s, 5.1, 3.6, 4.4, 6.7, C.cyan);

  // K avatar
  s.addShape("roundRect", { x: 5.55, y: 4.0, w: 1.5, h: 1.5,
    fill: { color: C.cyan }, line: { color: C.cyan }, rectRadius: 0.4 });
  s.addText("K", { x: 5.55, y: 4.0, w: 1.5, h: 1.5,
    fontSize: 60, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD });

  s.addText("Khushi Ishwar Raigade", { x: 5.3, y: 5.65, w: 4.0, h: 0.5,
    fontSize: 20, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD });
  s.addText("Co-Founder", { x: 5.3, y: 6.15, w: 4.0, h: 0.35,
    fontSize: 12, bold: true, color: C.cyan, align: "center", fontFace: FONT_BODY });
  s.addText("SOC Analyst & Cybersecurity Researcher", {
    x: 5.3, y: 6.5, w: 4.0, h: 0.4,
    fontSize: 10, color: C.muted, italic: true, align: "center", fontFace: FONT_BODY });

  s.addText("“Detection beats reaction. Find the attacker before they find the data.”", {
    x: 5.45, y: 7.2, w: 3.7, h: 1.6,
    fontSize: 12, italic: true, color: C.ink, align: "center", valign: "middle", fontFace: FONT_BODY,
  });

  s.addText("Threat Intel · MITRE ATT&CK · SIEM · IR Playbooks", {
    x: 5.3, y: 9.6, w: 4.0, h: 0.5,
    fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY,
  });

  para(s, "VRIKAAN Cybersecurity  •  Nashik, India", {
    y: 10.7, size: 13, color: C.muted, run: { italics: true },
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 8 — THE PROOF (STATS)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  pill(s, "THE RECEIPTS", 3.7, 0.9, 2.6, 0.5, C.green);

  center(s, "Not just a college project.", { y: 1.8, size: 28 });
  center(s, "Real product. Real metrics.", { y: 2.6, size: 22, color: C.cyan, run: { italics: true } });

  const stats = [
    { value: "50+",         label: "Cybersecurity tools",  color: C.cyan },
    { value: "12/12",       label: "Vercel functions used", color: C.indigo },
    { value: "109",         label: "Automated tests passing", color: C.green },
    { value: "₹0",          label: "Infrastructure cost",  color: C.yellow },
    { value: "EN + हिन्दी", label: "Bilingual UI",         color: C.cyan },
    { value: "AAL2",        label: "NIST 2FA assurance",   color: C.indigo },
  ];
  stats.forEach((st, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 4.5;
    const y = 3.8 + row * 2.5;
    card(s, x, y, 4.3, 2.2, st.color);
    s.addText(st.value, {
      x, y: y + 0.3, w: 4.3, h: 1.2,
      fontSize: 44, bold: true, color: st.color, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(st.label, {
      x, y: y + 1.4, w: 4.3, h: 0.6,
      fontSize: 13, color: C.muted, align: "center", fontFace: FONT_BODY,
    });
  });

  para(s, "Built in 2 semesters. Live since March 2026.", {
    y: 11.2, size: 14, color: C.muted, run: { italics: true },
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 9 — CALL TO ACTION
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  // Full bg gradient blocks for finale energy
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.6, fill: { color: C.indigo }, line: { color: C.indigo } });
  s.addShape("rect", { x: 0, y: 11.4, w: 10, h: 0.6, fill: { color: C.cyan }, line: { color: C.cyan } });

  // Big headline
  s.addText("Your phone is", {
    x: 0.5, y: 1.5, w: 9, h: 1.0,
    fontSize: 38, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("a target.", {
    x: 0.5, y: 2.5, w: 9, h: 1.2,
    fontSize: 60, bold: true, color: C.red, align: "center", fontFace: FONT_HEAD,
  });

  s.addText("VRIKAAN is your shield.", {
    x: 0.5, y: 4.2, w: 9, h: 1.0,
    fontSize: 32, bold: true, color: C.cyan, align: "center", italic: true, fontFace: FONT_HEAD,
  });

  // Big CTA button shape
  s.addShape("roundRect", { x: 1.5, y: 5.8, w: 7.0, h: 1.4,
    fill: { color: C.cyan }, line: { color: C.cyan }, rectRadius: 0.4 });
  s.addText("Start free at vrikaan.com", {
    x: 1.5, y: 5.8, w: 7.0, h: 1.4,
    fontSize: 26, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD,
  });

  // Sub points
  para(s, "No card required  •  Free forever tier  •  English + Hindi UI", {
    y: 7.6, size: 14, color: C.muted,
  });

  // What you get
  const wins = [
    "✓  Instant scam SMS checker — paste any message",
    "✓  Free breach lookup for your email",
    "✓  AI-powered phishing trainer (quiz mode)",
    "✓  Hindi voice chatbot for cybersecurity questions",
    "✓  Browser extension — auto-flag bad links",
  ];
  wins.forEach((w, i) => {
    s.addText(w, {
      x: 1.5, y: 8.6 + i * 0.45, w: 7, h: 0.4,
      fontSize: 14, color: C.ink, align: "left", fontFace: FONT_BODY,
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 10 — CONNECT / CREDITS
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "DARK_MASTER" });

  // Top brand block
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 3.2,
    fill: { color: C.bg2 }, line: { color: C.bg2 } });
  s.addText("VRIKAAN", {
    x: 0.5, y: 0.7, w: 9, h: 1.4,
    fontSize: 72, bold: true, color: C.cyan, align: "center", fontFace: FONT_HEAD, charSpacing: 8,
  });
  s.addText("AI-Powered Cyber Defense Platform", {
    x: 0.5, y: 2.1, w: 9, h: 0.5,
    fontSize: 16, color: C.muted, align: "center", italic: true, fontFace: FONT_BODY,
  });

  // Section divider
  pill(s, "CONNECT WITH US", 3.4, 3.7, 3.2, 0.5, C.cyan);

  // Social pills in 2x2 grid
  const socials = [
    { icon: "🌐", label: "vrikaan.com",                          handle: "Live platform" },
    { icon: "𝕏",  label: "x.com/vrikaan",                        handle: "@vrikaan" },
    { icon: "in", label: "linkedin.com/company/vrikaan-ai-...", handle: "VRIKAAN AI Cybersecurity" },
    { icon: "ig", label: "instagram.com/vrikaan_official",      handle: "@vrikaan_official" },
    { icon: "gh", label: "github.com/sahilnikam2410/vrikaan",   handle: "Open source" },
    { icon: "✉",  label: "hello@vrikaan.com",                   handle: "Contact us" },
  ];
  socials.forEach((soc, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 4.45;
    const y = 4.5 + row * 1.4;
    card(s, x, y, 4.25, 1.2, C.cyan);
    s.addText(soc.icon, {
      x, y: y + 0.18, w: 0.8, h: 0.8,
      fontSize: 28, color: C.cyan, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(soc.label, {
      x: x + 0.9, y: y + 0.2, w: 3.3, h: 0.4,
      fontSize: 13, bold: true, color: C.ink, fontFace: FONT_BODY,
    });
    s.addText(soc.handle, {
      x: x + 0.9, y: y + 0.65, w: 3.3, h: 0.4,
      fontSize: 11, color: C.muted, italic: true, fontFace: FONT_BODY,
    });
  });

  // Founder credits
  s.addShape("roundRect", { x: 0.6, y: 9.7, w: 8.8, h: 1.5,
    fill: { color: C.bg2 }, line: { color: "1E293B", width: 1 }, rectRadius: 0.15 });
  s.addText("Built by", {
    x: 0.6, y: 9.78, w: 8.8, h: 0.35,
    fontSize: 11, color: C.muted, align: "center", italic: true, fontFace: FONT_BODY,
  });
  s.addText("Sahil Anil Nikam   ·   Khushi Ishwar Raigade", {
    x: 0.6, y: 10.12, w: 8.8, h: 0.55,
    fontSize: 18, bold: true, color: C.cyan, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("Founders  ·  SOC Analysts  ·  Cybersecurity Researchers  ·  Nashik, India", {
    x: 0.6, y: 10.68, w: 8.8, h: 0.4,
    fontSize: 10, color: C.muted, align: "center", fontFace: FONT_BODY,
  });

  // Final share nudge
  para(s, "Share this with anyone who uses UPI.", {
    y: 11.4, size: 14, color: C.indigo, run: { italics: true, bold: true },
  });
}

// ────────────────────────────────────────────────────────────────────
// WRITE
// ────────────────────────────────────────────────────────────────────
(async () => {
  const out = "E:/SECUVION/scripts/marketing/vrikaan-linkedin-carousel.pptx";
  await pptx.writeFile({ fileName: out });
  console.log("Wrote", out, "(10 slides, 4:5 portrait)");
})();
