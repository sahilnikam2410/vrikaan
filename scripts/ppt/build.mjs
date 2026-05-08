/**
 * VRIKAAN — Final-Year Project Presentation generator (LIGHT theme, 16 slides).
 * Output: vrikaan-presentation.pptx (16:9 widescreen).
 *
 * Run: node scripts/ppt/build.mjs
 */
import pptxgen from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pptx.title = "VRIKAAN — AI-Powered Cyber Defense";
pptx.company = "Sandip University Nashik";
pptx.author = "Sahil Anil Nikam";

// ─── LIGHT palette ──────────────────────────────────────────────────
const C = {
  bg: "FFFFFF",      // page background
  panel: "F8FAFC",   // card panels
  panelAlt: "F1F5F9",
  cyan: "0891B2",    // primary accent (deeper than dashboard cyan for contrast on white)
  indigo: "4F46E5",  // secondary accent
  ink: "0F172A",     // headline text
  body: "334155",    // body text
  muted: "64748B",   // muted captions
  border: "E2E8F0",  // light borders
  green: "16A34A",
  red: "DC2626",
  amber: "D97706",
  rose: "E11D48",
};

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

// Master with white background + cyan top stripe + footer brand
pptx.defineSlideMaster({
  title: "LIGHT_MASTER",
  background: { color: C.bg },
  objects: [
    // Tiny cyan square top-left (motif)
    { rect: { x: 0.5, y: 0.5, w: 0.18, h: 0.18, fill: { color: C.cyan } } },
    // Footer brand
    { text: {
        text: "VRIKAAN  •  vrikaan.com",
        options: { x: 0.5, y: 7.05, w: 6, h: 0.3, fontSize: 9, fontFace: FONT_BODY,
          color: C.muted, align: "left" },
    } },
    { text: {
        text: "Sahil Anil Nikam  •  Sandip University Nashik",
        options: { x: 7, y: 7.05, w: 5.83, h: 0.3, fontSize: 9, fontFace: FONT_BODY,
          color: C.muted, align: "right" },
    } },
    // Bottom thin cyan rule
    { rect: { x: 0, y: 7.4, w: 13.33, h: 0.06, fill: { color: C.cyan } } },
  ],
  slideNumber: { x: 12.7, y: 7.05, w: 0.5, h: 0.3, fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right" },
});

// ─── Helpers ────────────────────────────────────────────────────────
function addTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.8, y: 0.55, w: 12, h: 0.7,
    fontSize: 32, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.25, w: 12, h: 0.4,
      fontSize: 14, color: C.cyan, fontFace: FONT_BODY, italic: true,
    });
  }
}

function statCard(slide, x, y, w, h, value, label, color = C.cyan) {
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: C.panel }, line: { color: C.border, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(String(value), {
    x: x, y: y + 0.15, w: w, h: h * 0.55,
    fontSize: 36, bold: true, color, align: "center", fontFace: FONT_HEAD,
  });
  slide.addText(label, {
    x: x, y: y + h * 0.6, w: w, h: h * 0.35,
    fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY,
  });
}

function featureRow(slide, x, y, w, icon, heading, body, color = C.cyan) {
  slide.addShape("ellipse", {
    x, y, w: 0.55, h: 0.55,
    fill: { color }, line: { color },
  });
  slide.addText(icon, {
    x, y: y + 0.02, w: 0.55, h: 0.55,
    fontSize: 22, bold: true, color: "FFFFFF", align: "center", fontFace: FONT_HEAD,
  });
  slide.addText(heading, {
    x: x + 0.75, y: y - 0.02, w: w - 0.75, h: 0.32,
    fontSize: 14, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  slide.addText(body, {
    x: x + 0.75, y: y + 0.28, w: w - 0.75, h: 0.5,
    fontSize: 11, color: C.body, fontFace: FONT_BODY,
  });
}

function leftBar(slide) {
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.06, h: 7.5,
    fill: { color: C.cyan }, line: { color: C.cyan },
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  // Top + bottom accent strips
  s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: C.indigo }, line: { color: C.indigo } });
  s.addShape("rect", { x: 0, y: 6.8, w: 13.33, h: 0.7, fill: { color: C.cyan }, line: { color: C.cyan } });

  // College banner top
  s.addText("SANDIP UNIVERSITY, NASHIK", {
    x: 0.8, y: 1.0, w: 11.7, h: 0.5,
    fontSize: 16, bold: true, color: C.indigo, align: "center", fontFace: FONT_HEAD, charSpacing: 6,
  });
  s.addText("Department of Computer Engineering", {
    x: 0.8, y: 1.45, w: 11.7, h: 0.35,
    fontSize: 12, color: C.muted, align: "center", fontFace: FONT_BODY, italic: true,
  });

  // VRIKAAN big title
  s.addText("VRIKAAN", {
    x: 0.8, y: 2.2, w: 11.7, h: 1.2,
    fontSize: 80, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
    charSpacing: 4,
  });
  s.addText("AI-Powered Cyber Defense Platform", {
    x: 0.8, y: 3.4, w: 11.7, h: 0.5,
    fontSize: 22, color: C.cyan, align: "center", italic: true, fontFace: FONT_BODY,
  });

  // Live-site pill
  s.addShape("roundRect", {
    x: 5.4, y: 4.1, w: 2.5, h: 0.45,
    fill: { color: C.panel }, line: { color: C.cyan, width: 1 }, rectRadius: 0.22,
  });
  s.addText("● LIVE  vrikaan.com", {
    x: 5.4, y: 4.1, w: 2.5, h: 0.45,
    fontSize: 12, bold: true, color: C.cyan, align: "center", fontFace: FONT_BODY,
  });

  // Author + PRN block
  s.addShape("roundRect", {
    x: 3.5, y: 4.85, w: 6.3, h: 1.55,
    fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
  });
  s.addText("Submitted by", {
    x: 3.5, y: 4.95, w: 6.3, h: 0.3,
    fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY, italic: true,
  });
  s.addText("Sahil Anil Nikam", {
    x: 3.5, y: 5.25, w: 6.3, h: 0.5,
    fontSize: 24, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("PRN: 220105131264", {
    x: 3.5, y: 5.78, w: 6.3, h: 0.35,
    fontSize: 14, color: C.indigo, align: "center", fontFace: "Consolas",
  });
  s.addText("Final-Year Project Presentation  •  2026", {
    x: 3.5, y: 6.13, w: 6.3, h: 0.3,
    fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY,
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 2 — PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Problem Statement", "Cybercrime in India is exploding — defense tools aren't.");

  s.addShape("roundRect", {
    x: 0.8, y: 1.9, w: 5.2, h: 4.6,
    fill: { color: C.panel }, line: { color: C.red, width: 1.5 }, rectRadius: 0.1,
  });
  s.addText("₹11,000 Cr+", {
    x: 0.8, y: 2.3, w: 5.2, h: 1.3,
    fontSize: 64, bold: true, color: C.red, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("Reported cybercrime losses in India", {
    x: 0.8, y: 3.55, w: 5.2, h: 0.5,
    fontSize: 14, color: C.ink, align: "center", fontFace: FONT_BODY,
  });
  s.addText("(I4C / NCRP, 2024 estimates)", {
    x: 0.8, y: 4.0, w: 5.2, h: 0.4,
    fontSize: 11, color: C.muted, italic: true, align: "center", fontFace: FONT_BODY,
  });
  s.addText("70%+ growth year-over-year", {
    x: 0.8, y: 5.3, w: 5.2, h: 0.5,
    fontSize: 16, bold: true, color: C.amber, align: "center", fontFace: FONT_BODY,
  });

  s.addText("Where existing tools fall short", {
    x: 6.4, y: 1.9, w: 6.2, h: 0.5,
    fontSize: 18, bold: true, color: C.cyan, fontFace: FONT_HEAD,
  });
  const pains = [
    { t: "Fragmented",     d: "Users juggle separate apps for VPN, password, scanning, threat checks." },
    { t: "Costly",         d: "Premium suites (₹3-6k/yr) priced for enterprises, not students." },
    { t: "English-only",   d: "Most tools ignore Hindi / regional users entirely." },
    { t: "Reactive",       d: "Only alert AFTER breach — no real-time leak / fingerprint checks." },
    { t: "Opaque",         d: "Black-box ML; no explanation of what's being scanned or why." },
  ];
  pains.forEach((p, i) => {
    const y = 2.5 + i * 0.78;
    s.addShape("ellipse", { x: 6.4, y, w: 0.3, h: 0.3, fill: { color: C.red }, line: { color: C.red } });
    s.addText("✕", { x: 6.4, y, w: 0.3, h: 0.3, fontSize: 14, bold: true, color: "FFFFFF", align: "center", fontFace: FONT_HEAD });
    s.addText(p.t, { x: 6.85, y: y - 0.05, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: C.ink, fontFace: FONT_HEAD });
    s.addText(p.d, { x: 6.85, y: y + 0.25, w: 5.6, h: 0.4, fontSize: 11, color: C.body, fontFace: FONT_BODY });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 3 — LITERATURE REVIEW / COMPETITIVE ANALYSIS  (NEW)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Literature Review & Competitor Study", "What exists today — and the gap VRIKAAN closes.");

  // Header row
  const cols = ["Solution", "Tools", "Pricing (INR/yr)", "Indian-Lang", "Free Tier", "Verdict"];
  const colWidths = [2.3, 2.0, 1.8, 1.5, 1.2, 2.6];
  let xPos = 0.8;
  cols.forEach((c, i) => {
    s.addShape("rect", {
      x: xPos, y: 1.95, w: colWidths[i], h: 0.5,
      fill: { color: C.indigo }, line: { color: C.indigo },
    });
    s.addText(c, {
      x: xPos, y: 1.95, w: colWidths[i], h: 0.5,
      fontSize: 12, bold: true, color: "FFFFFF", align: "center", fontFace: FONT_HEAD,
    });
    xPos += colWidths[i];
  });

  // Rows
  const rows = [
    ["Norton 360",       "Antivirus + VPN",       "~₹2,000",  "❌",    "❌",   "Heavy install, narrow scope"],
    ["McAfee Total",     "AV + Identity",         "~₹2,500",  "❌",    "❌",   "Bloatware reputation"],
    ["1Password",        "Password mgr only",     "~₹3,000",  "❌",    "Trial", "Single-purpose, costly"],
    ["NordVPN + Pass",   "VPN + password",        "~₹4,500",  "❌",    "❌",   "Two products, two bills"],
    ["HaveIBeenPwned",   "Breach lookup only",    "Free",     "❌",    "✓",   "Tiny scope, no UI suite"],
    ["VRIKAAN (Ours)",   "50+ tools, AI, teams",  "₹0–₹990",  "✓ EN+HI", "✓",   "All-in-one, INR-native"],
  ];
  rows.forEach((r, ri) => {
    const y = 2.45 + ri * 0.65;
    const isOurs = ri === rows.length - 1;
    const fillColor = isOurs ? C.panel : (ri % 2 === 0 ? C.bg : C.panelAlt);
    let cx = 0.8;
    r.forEach((cell, ci) => {
      s.addShape("rect", {
        x: cx, y, w: colWidths[ci], h: 0.65,
        fill: { color: fillColor },
        line: { color: isOurs ? C.cyan : C.border, width: isOurs ? 1.5 : 0.5 },
      });
      s.addText(cell, {
        x: cx, y, w: colWidths[ci], h: 0.65,
        fontSize: 11,
        bold: isOurs || ci === 0,
        color: isOurs ? C.cyan : C.ink,
        align: ci === 0 ? "left" : "center",
        fontFace: FONT_BODY,
        valign: "middle",
      });
      cx += colWidths[ci];
    });
  });

  // Conclusion line
  s.addText("Gap: No Indian-priced, all-in-one, bilingual, education-first cybersecurity SaaS.", {
    x: 0.8, y: 6.45, w: 11.7, h: 0.4,
    fontSize: 12, italic: true, bold: true, color: C.indigo, align: "center", fontFace: FONT_BODY,
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 4 — PROJECT OBJECTIVES
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Project Objectives", "Build one affordable, transparent, all-in-one defense suite.");

  const objs = [
    { i: "①", t: "Unify",        d: "50+ cybersecurity tools under a single dashboard." },
    { i: "②", t: "Educate",      d: "Inline explanations + phishing trainer for non-experts." },
    { i: "③", t: "Defend",       d: "Real-time scans for IP leak, breach, dark-web, phishing." },
    { i: "④", t: "Localize",     d: "Bilingual UI (English + Hindi) for Indian audience." },
    { i: "⑤", t: "Monetize",     d: "Freemium with INR-native Cashfree (UPI/cards/wallets)." },
    { i: "⑥", t: "Scale",        d: "Serverless (Vercel + Firebase) — no ops, instant rollback." },
  ];
  for (let i = 0; i < objs.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.8 + col * 4.2;
    const y = 1.9 + row * 2.3;
    s.addShape("roundRect", {
      x, y, w: 3.9, h: 2.0,
      fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
    });
    s.addText(objs[i].i, {
      x: x + 0.2, y: y + 0.15, w: 0.8, h: 0.6,
      fontSize: 32, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    s.addText(objs[i].t, {
      x: x + 1.0, y: y + 0.2, w: 2.7, h: 0.5,
      fontSize: 18, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(objs[i].d, {
      x: x + 0.2, y: y + 0.95, w: 3.5, h: 0.95,
      fontSize: 11.5, color: C.body, fontFace: FONT_BODY,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 5 — TECH STACK
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Technology Stack", "Modern, free-tier-friendly, production-grade.");

  const tiers = [
    { name: "Frontend", color: C.cyan, items: [
      ["React 19",     "UI library — concurrent rendering"],
      ["Vite 7",       "Fast HMR + esbuild prod"],
      ["React Router", "Client-side routing"],
      ["Recharts + Three.js", "Data viz + 3D globe"],
    ]},
    { name: "Backend",  color: C.indigo, items: [
      ["Vercel Functions", "12 serverless routes (hobby tier)"],
      ["Firebase Auth",    "OAuth, phone, magic-link, custom 2FA"],
      ["Firestore",        "NoSQL + security rules"],
      ["Firebase Admin",   "Privileged server ops"],
    ]},
    { name: "Integrations", color: C.green, items: [
      ["Cashfree",      "INR payments (UPI / cards)"],
      ["EmailJS",       "Transactional email"],
      ["Sentry",        "Error telemetry"],
      ["Cloudflare Turnstile", "CAPTCHA"],
    ]},
  ];
  tiers.forEach((tier, ti) => {
    const x = 0.8 + ti * 4.2;
    s.addShape("roundRect", {
      x, y: 1.9, w: 3.9, h: 4.7,
      fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
    });
    s.addShape("rect", {
      x, y: 1.9, w: 3.9, h: 0.5,
      fill: { color: tier.color }, line: { color: tier.color },
    });
    s.addText(tier.name, {
      x: x + 0.2, y: 1.9, w: 3.7, h: 0.5,
      fontSize: 16, bold: true, color: "FFFFFF", fontFace: FONT_HEAD,
    });
    tier.items.forEach((it, i) => {
      const y = 2.65 + i * 0.95;
      s.addText(it[0], {
        x: x + 0.25, y, w: 3.5, h: 0.32,
        fontSize: 14, bold: true, color: C.ink, fontFace: FONT_HEAD,
      });
      s.addText(it[1], {
        x: x + 0.25, y: y + 0.32, w: 3.5, h: 0.55,
        fontSize: 10.5, color: C.body, fontFace: FONT_BODY,
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 6 — METHODOLOGY / SDLC  (NEW)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Methodology & Workflow", "Iterative Agile — ship small, learn fast, deploy daily.");

  // 5-phase pipeline (left to right)
  const phases = [
    { n: "1", t: "Plan",   d: "Issue tracker, weekly sprint goals", color: C.indigo },
    { n: "2", t: "Build",  d: "React feature in branch + unit tests", color: C.cyan },
    { n: "3", t: "Test",   d: "Vitest + manual smoke + lint", color: C.green },
    { n: "4", t: "Ship",   d: "Push → Vercel deploy → GH Action promotes", color: C.amber },
    { n: "5", t: "Observe",d: "Sentry + analytics → triage → next sprint", color: C.rose },
  ];
  const px = 0.8, py = 2.05, pw = 2.4, ph = 2.0, gap = 0.13;
  phases.forEach((p, i) => {
    const x = px + i * (pw + gap);
    s.addShape("roundRect", {
      x, y: py, w: pw, h: ph,
      fill: { color: C.panel }, line: { color: p.color, width: 1.5 }, rectRadius: 0.1,
    });
    // Number circle
    s.addShape("ellipse", {
      x: x + 0.95, y: py + 0.2, w: 0.5, h: 0.5,
      fill: { color: p.color }, line: { color: p.color },
    });
    s.addText(p.n, {
      x: x + 0.95, y: py + 0.18, w: 0.5, h: 0.5,
      fontSize: 18, bold: true, color: "FFFFFF", align: "center", fontFace: FONT_HEAD,
    });
    s.addText(p.t, {
      x, y: py + 0.85, w: pw, h: 0.4,
      fontSize: 16, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(p.d, {
      x: x + 0.15, y: py + 1.3, w: pw - 0.3, h: 0.7,
      fontSize: 10.5, color: C.body, align: "center", fontFace: FONT_BODY,
    });
    // Arrow to next
    if (i < phases.length - 1) {
      s.addText("▶", {
        x: x + pw + 0.005, y: py + 0.85, w: 0.13, h: 0.4,
        fontSize: 14, color: C.muted, align: "center", fontFace: FONT_HEAD,
      });
    }
  });

  // Tools-used chips
  s.addText("Tools used in this workflow", {
    x: 0.8, y: 4.5, w: 12, h: 0.4,
    fontSize: 14, bold: true, color: C.indigo, fontFace: FONT_HEAD,
  });
  const tools = ["Git + GitHub", "VS Code", "Vitest", "ESLint", "Vercel CLI", "Firebase CLI", "GitHub Actions", "Sentry"];
  tools.forEach((tool, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.8 + col * 3.05, y = 5.0 + row * 0.6;
    s.addShape("roundRect", {
      x, y, w: 2.85, h: 0.5,
      fill: { color: C.panelAlt }, line: { color: C.cyan, width: 0.75 }, rectRadius: 0.25,
    });
    s.addText(tool, {
      x, y, w: 2.85, h: 0.5,
      fontSize: 12, color: C.ink, align: "center", fontFace: FONT_BODY,
    });
  });

  // Footer note
  s.addText("Result: 16+ feature commits in a single sprint, 33 tests, zero production rollbacks.", {
    x: 0.8, y: 6.3, w: 11.7, h: 0.4,
    fontSize: 11, italic: true, color: C.muted, align: "center", fontFace: FONT_BODY,
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 7 — SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "System Architecture", "Browser → Vercel Edge → Firebase + 3rd-party APIs.");

  const layers = [
    { y: 1.95, name: "Client Layer", color: C.cyan, blocks: [
      "React 19 SPA", "Service Worker (5min cache)", "i18n (EN / HI)", "PWA Install",
    ]},
    { y: 3.55, name: "API Layer (Vercel)", color: C.indigo, blocks: [
      "/api/tools (router, 18 actions)", "/api/cashfree-webhook", "/api/cron-digest",
      "/api/scan-url, breach, ssl, og",
    ]},
    { y: 5.15, name: "Data + 3rd-Party", color: C.green, blocks: [
      "Firestore (users, teams, payments)", "Firebase Auth", "Cashfree", "ipinfo / haveibeenpwned",
    ]},
  ];
  layers.forEach((L) => {
    s.addShape("roundRect", {
      x: 0.8, y: L.y, w: 11.7, h: 1.4,
      fill: { color: C.panel }, line: { color: L.color, width: 1 }, rectRadius: 0.1,
    });
    s.addText(L.name, {
      x: 1.0, y: L.y + 0.1, w: 4, h: 0.4,
      fontSize: 14, bold: true, color: L.color, fontFace: FONT_HEAD,
    });
    L.blocks.forEach((b, i) => {
      const x = 1.0 + (i % 4) * 2.85;
      const y = L.y + 0.65;
      s.addShape("roundRect", {
        x, y, w: 2.7, h: 0.55,
        fill: { color: C.bg }, line: { color: L.color, width: 0.75 }, rectRadius: 0.06,
      });
      s.addText(b, {
        x, y, w: 2.7, h: 0.55,
        fontSize: 10.5, color: C.ink, align: "center", fontFace: FONT_BODY,
      });
    });
  });

  for (const ay of [3.4, 5.0]) {
    s.addText("▼", { x: 6.4, y: ay, w: 0.5, h: 0.18, fontSize: 14, color: C.muted, align: "center", fontFace: FONT_HEAD });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 8 — DATABASE SCHEMA  (NEW)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Database Design — Firestore Collections", "Document-based; security rules enforce ownership at the data layer.");

  // 6 collection cards in 3x2 grid
  const cols = [
    { name: "users/{uid}",                color: C.cyan,   fields: ["name, email, phone", "plan (free/pro/enterprise)", "mfa { enabled, secret, backupCodes }", "currentTeamId, webhook"] },
    { name: "users/{uid}/devices",        color: C.cyan,   fields: ["name, type (Desktop/Mobile)", "browser, os, osVersion", "model, gpu, ram, cpu", "lastActive, current"] },
    { name: "users/{uid}/payments",       color: C.indigo, fields: ["orderId, amount, plan", "status (success/pending)", "method (cashfree/upi/btc)", "refunded, refundId"] },
    { name: "teams/{teamId}",             color: C.indigo, fields: ["name, ownerUid", "members { uid: role }", "memberEmails [ ]", "createdAt"] },
    { name: "teamInvites/{inviteId}",     color: C.green,  fields: ["teamId, email", "invitedBy, status", "createdAt, acceptedAt", ""] },
    { name: "coupons/{CODE}",             color: C.green,  fields: ["percentOff or flatOff", "active (bool)", "expiresAt", "plans [ ]"] },
  ];
  cols.forEach((col, i) => {
    const cx = 0.8 + (i % 3) * 4.2;
    const cy = 1.95 + Math.floor(i / 3) * 2.45;
    s.addShape("roundRect", {
      x: cx, y: cy, w: 3.9, h: 2.2,
      fill: { color: C.panel }, line: { color: col.color, width: 1 }, rectRadius: 0.1,
    });
    s.addShape("rect", {
      x: cx, y: cy, w: 3.9, h: 0.45,
      fill: { color: col.color }, line: { color: col.color },
    });
    s.addText(col.name, {
      x: cx + 0.15, y: cy, w: 3.7, h: 0.45,
      fontSize: 12, bold: true, color: "FFFFFF", fontFace: "Consolas",
    });
    col.fields.forEach((f, fi) => {
      if (!f) return;
      s.addText("• " + f, {
        x: cx + 0.2, y: cy + 0.55 + fi * 0.36, w: 3.6, h: 0.32,
        fontSize: 10.5, color: C.body, fontFace: FONT_BODY,
      });
    });
  });

  s.addText("All writes for /teams + /coupons go through server (Admin SDK). Client cannot self-elevate.", {
    x: 0.8, y: 6.95, w: 11.7, h: 0.3,
    fontSize: 10, italic: true, color: C.muted, align: "center", fontFace: FONT_BODY,
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 9 — CORE FEATURES (Tools)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Core Features  ⟶  Tools", "50+ cybersecurity utilities under one roof.");

  const tools = [
    ["🌐", "DNS & WebRTC Leak Test", "Detect IP/DNS exposure"],
    ["🔍", "IP Lookup / WHOIS",      "Geo + ownership of any IP/domain"],
    ["🛡", "Security Headers Scan",  "Audit CSP, HSTS, X-Frame on any URL"],
    ["🔓", "Breach Check",           "haveibeenpwned email + password"],
    ["🗝", "Password Vault",         "Local-only zero-knowledge store"],
    ["🎣", "Phishing Trainer",       "Interactive quiz; tracks progress"],
    ["🌑", "Dark-Web Monitor",       "Track exposure in leaked DBs"],
    ["🪪", "Identity X-Ray",         "Compose digital footprint report"],
    ["📁", "File Hash Scanner",      "VirusTotal-style hash lookup"],
    ["📷", "QR Scanner",             "Decode + threat-flag any QR"],
    ["✉", "Email + Fraud Analyzer", "Detect scam patterns in messages"],
    ["📊", "Bulk Scanner",           "Batch scan hundreds of URLs"],
  ];
  for (let i = 0; i < tools.length; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.8 + col * 3.05;
    const y = 1.95 + row * 1.55;
    s.addShape("roundRect", {
      x, y, w: 2.85, h: 1.35,
      fill: { color: C.panel }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
    });
    s.addText(tools[i][0], {
      x: x + 0.15, y: y + 0.1, w: 0.6, h: 0.55,
      fontSize: 24, color: C.cyan, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(tools[i][1], {
      x: x + 0.75, y: y + 0.1, w: 2.0, h: 0.45,
      fontSize: 12, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(tools[i][2], {
      x: x + 0.15, y: y + 0.78, w: 2.6, h: 0.5,
      fontSize: 10, color: C.body, fontFace: FONT_BODY,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 10 — CORE FEATURES (Platform)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Core Features  ⟶  Platform", "Beyond the tools — full SaaS surface.");

  const items = [
    { i: "📊", t: "User Dashboard",       d: "Score, devices, payments, tool history, activity log. Real-time charts via Recharts." },
    { i: "💳", t: "Cashfree Payments",    d: "INR (UPI/cards/netbanking). Server-side verify + signed webhooks. Self-serve refunds within 7 days." },
    { i: "👥", t: "Team Accounts",        d: "Create team, invite by email, manage members. Server-only writes via Admin SDK." },
    { i: "🤖", t: "AI Chatbot",           d: "Google Gemini-powered helper for security questions; rate-limited, gated by plan." },
    { i: "🔔", t: "Push Notifications",   d: "Browser push (VAPID) + in-app drawer + EmailJS digests (weekly)." },
    { i: "🎮", t: "Gamification",         d: "Badges, security streaks, weekly digest emails to drive retention." },
    { i: "🛠", t: "Admin Console",        d: "User mgmt, payment audit, broadcast notifications, audit log — step-up auth." },
    { i: "🌐", t: "PWA + Offline",        d: "Installable; service worker caches shell + 5-min runtime cache for tool APIs." },
  ];
  for (let i = 0; i < items.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.8 + col * 6.25;
    const y = 1.95 + row * 1.18;
    featureRow(s, x, y, 6.0, items[i].i, items[i].t, items[i].d, col === 0 ? C.cyan : C.indigo);
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 11 — SECURITY HARDENING
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Security Hardening", "The product itself is built to its own standards.");

  const sec = [
    { t: "TOTP 2FA",          d: "Custom otpauth-based (no paid Identity Platform). QR enrollment + 10 backup codes." },
    { t: "Magic-Link Login",  d: "Passwordless email sign-in via Firebase sendSignInLinkToEmail." },
    { t: "HMAC Webhooks",     d: "Outbound signed with sha256(secret + body). Receiver verifies X-Vrikaan-Signature." },
    { t: "Strict CSP",        d: "Default-deny + per-domain allowlists for connect/script/frame/form-action." },
    { t: "Rate Limiting",     d: "IP + user-tier buckets (20/60/200/600 per minute) with Retry-After." },
    { t: "Firestore Rules",   d: "Owner-only on user data, server-only writes for teams/payments." },
    { t: "Self-Serve Refund", d: "Owner-bound, 7-day window enforced server-side, plan auto-downgrade on success." },
    { t: "Email-Verify Gate", d: "Tools blocked until email confirmed; reduces fake-account spam." },
  ];
  for (let i = 0; i < sec.length; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.8 + col * 3.05;
    const y = 2.0 + row * 2.25;
    s.addShape("roundRect", {
      x, y, w: 2.85, h: 2.05,
      fill: { color: C.panel }, line: { color: C.cyan, width: 1 }, rectRadius: 0.08,
    });
    s.addText("🔒", {
      x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.5,
      fontSize: 22, color: C.cyan, fontFace: FONT_HEAD,
    });
    s.addText(sec[i].t, {
      x: x + 0.75, y: y + 0.2, w: 2.0, h: 0.45,
      fontSize: 13, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(sec[i].d, {
      x: x + 0.2, y: y + 0.85, w: 2.55, h: 1.1,
      fontSize: 10.5, color: C.body, fontFace: FONT_BODY,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 12 — QUALITY & TESTING
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Quality, Testing & Operations", "Engineering practices behind the product.");

  const stats = [
    { v: "33", l: "Vitest tests passing",    c: C.green },
    { v: "12 / 12", l: "Vercel functions used", c: C.cyan },
    { v: "< 2 min", l: "Production build",      c: C.indigo },
    { v: "5 min", l: "API runtime cache TTL",   c: C.amber },
  ];
  stats.forEach((st, i) => {
    statCard(s, 0.8 + i * 3.05, 1.9, 2.85, 1.4, st.v, st.l, st.c);
  });

  const ops = [
    { t: "Vitest + RTL",        d: "Unit tests for billing math + CSV escaping; component tests for PlanGate, Auth flows." },
    { t: "GitHub Actions CI",   d: "Auto-promote latest Ready deploy → vrikaan.com on every push to master." },
    { t: "Sentry telemetry",    d: "Zero-bundle DSN-only adapter; captures unhandled errors + promise rejections." },
    { t: "Bundle Analyzer",     d: "rollup-plugin-visualizer (npm run analyze) to monitor chunk sizes." },
    { t: "Activity Cleanup",    d: "Weekly cron deletes activity + tool history > 90 days; Firestore stays lean." },
    { t: "Daily Backup",        d: "scripts/backup-firestore.js + GitHub Actions schedule for full export." },
  ];
  for (let i = 0; i < ops.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.8 + col * 4.05;
    const y = 3.7 + row * 1.5;
    s.addShape("roundRect", {
      x, y, w: 3.85, h: 1.3,
      fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.08,
    });
    s.addText(ops[i].t, {
      x: x + 0.2, y: y + 0.15, w: 3.5, h: 0.4,
      fontSize: 13, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    s.addText(ops[i].d, {
      x: x + 0.2, y: y + 0.55, w: 3.5, h: 0.7,
      fontSize: 10.5, color: C.body, fontFace: FONT_BODY,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 13 — DEMO / LIVE URLS
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Live Demo & URLs", "Every screen below is in production right now.");

  s.addShape("roundRect", {
    x: 0.8, y: 1.95, w: 12.0, h: 1.2,
    fill: { color: C.panel }, line: { color: C.cyan, width: 1.5 }, rectRadius: 0.1,
  });
  s.addText("🌐  vrikaan.com", {
    x: 1.0, y: 2.0, w: 11.5, h: 0.6,
    fontSize: 36, bold: true, color: C.cyan, fontFace: FONT_HEAD,
  });
  s.addText("Open the live site during the demo — login, run a tool, view the dashboard.", {
    x: 1.0, y: 2.6, w: 11.5, h: 0.5,
    fontSize: 13, color: C.body, fontFace: FONT_BODY, italic: true,
  });

  const urls = [
    ["/login",            "Email / Google / GitHub / Phone / Magic-link  +  TOTP gate"],
    ["/signup",           "Form with Turnstile CAPTCHA + Cloudflare bot check"],
    ["/dashboard",        "Score, devices, payments, history, 2FA, webhooks"],
    ["/dns-leak-test",    "Run scan — IP, ISP, WebRTC IPs, Cloudflare trace"],
    ["/pricing",          "Plans + coupon code field"],
    ["/team",             "Create team, invite member, manage roles"],
    ["/admin",            "Step-up auth required — user mgmt + audit log"],
    ["/threat-directory", "35+ SEO threat-detail pages"],
  ];
  urls.forEach((u, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.8 + col * 6.1;
    const y = 3.4 + row * 0.85;
    s.addText(u[0], {
      x, y, w: 1.9, h: 0.4,
      fontSize: 12, bold: true, color: C.cyan, fontFace: "Consolas",
    });
    s.addText(u[1], {
      x: x + 1.95, y, w: 4.0, h: 0.7,
      fontSize: 10.5, color: C.body, fontFace: FONT_BODY,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 14 — SCREENSHOTS / ADMIN DASHBOARD  (NEW)
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Screenshot — Admin Dashboard", "Real-time stats + chart visualizations.");

  // Try to embed admin dashboard screenshot if present
  const screenshotPath = path.resolve("E:/SECUVION/scripts/ppt/admin-dashboard.png");
  if (fs.existsSync(screenshotPath)) {
    // Image fills majority of slide, with caption block on right
    s.addImage({
      path: screenshotPath,
      x: 0.8, y: 1.9, w: 8.5, h: 4.8,
      sizing: { type: "contain", w: 8.5, h: 4.8 },
    });
    // Side caption
    s.addShape("roundRect", {
      x: 9.5, y: 1.9, w: 3.3, h: 4.8,
      fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
    });
    s.addText("Highlights", {
      x: 9.7, y: 2.05, w: 3.0, h: 0.4,
      fontSize: 14, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    const points = [
      "Live user count (real-time)",
      "Online users (5-min window)",
      "Revenue + ARPU stats",
      "Plan distribution donut",
      "User growth area chart",
      "Quick-action sidebar",
      "AI chat helper (bottom-right)",
    ];
    points.forEach((p, i) => {
      s.addText("• " + p, {
        x: 9.7, y: 2.55 + i * 0.45, w: 3.0, h: 0.4,
        fontSize: 11, color: C.body, fontFace: FONT_BODY,
      });
    });
  } else {
    // Placeholder if user hasn't dropped image
    s.addShape("roundRect", {
      x: 0.8, y: 1.9, w: 12.0, h: 4.8,
      fill: { color: C.panel }, line: { color: C.border, width: 2, dashType: "dash" }, rectRadius: 0.15,
    });
    s.addText("📷  ADMIN DASHBOARD SCREENSHOT", {
      x: 0.8, y: 3.6, w: 12.0, h: 0.7,
      fontSize: 28, bold: true, color: C.muted, align: "center", fontFace: FONT_HEAD,
    });
    s.addText("Save your screenshot as:  E:\\SECUVION\\scripts\\ppt\\admin-dashboard.png", {
      x: 0.8, y: 4.3, w: 12.0, h: 0.4,
      fontSize: 13, italic: true, color: C.muted, align: "center", fontFace: "Consolas",
    });
    s.addText("Then re-run:  node scripts/ppt/build.mjs", {
      x: 0.8, y: 4.7, w: 12.0, h: 0.4,
      fontSize: 13, italic: true, color: C.muted, align: "center", fontFace: "Consolas",
    });
    s.addText("(Or paste the screenshot directly into PowerPoint here.)", {
      x: 0.8, y: 5.2, w: 12.0, h: 0.4,
      fontSize: 12, italic: true, color: C.muted, align: "center", fontFace: FONT_BODY,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 15 — FUTURE SCOPE
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  leftBar(s);
  addTitle(s, "Future Scope", "Where VRIKAAN goes next.");

  const future = [
    { i: "🌍", t: "Full i18n",        d: "Extend Hindi translations to all 50+ pages; add Marathi + Tamil." },
    { i: "📱", t: "Mobile App",       d: "React Native wrapper with native push, biometric unlock, offline scans." },
    { i: "🤖", t: "ML Threat Score",  d: "Train classifier on user-reported scams to auto-score new URLs/messages." },
    { i: "🔐", t: "Identity Platform", d: "Firebase MFA on paid tier — SMS + WebAuthn alongside TOTP." },
    { i: "🪝", t: "More Webhook Events", d: "scan.complete, breach.detected, invoice.paid for full event stream." },
    { i: "🏢", t: "Enterprise Tier",  d: "SSO (SAML), SCIM provisioning, dedicated SOC dashboards, SLA." },
    { i: "🛰", t: "Threat Intel Feed", d: "Subscribe to OSINT feeds; surface trending IOCs in dashboard." },
    { i: "🧠", t: "Personal AI Agent", d: "Always-on agent that scans new emails / SMS / app installs proactively." },
  ];
  for (let i = 0; i < future.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.8 + col * 6.25;
    const y = 1.95 + row * 1.18;
    featureRow(s, x, y, 6.0, future[i].i, future[i].t, future[i].d, row % 2 === 0 ? C.cyan : C.indigo);
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 16 — CONCLUSION + THANK YOU
// ═══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide({ masterName: "LIGHT_MASTER" });
  s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: C.indigo }, line: { color: C.indigo } });
  s.addShape("rect", { x: 0, y: 6.8, w: 13.33, h: 0.7, fill: { color: C.cyan }, line: { color: C.cyan } });

  s.addText("Thank You", {
    x: 0.8, y: 0.9, w: 11.7, h: 1.2,
    fontSize: 72, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("VRIKAAN — built, tested, shipped. Live in production.", {
    x: 0.8, y: 2.2, w: 11.7, h: 0.5,
    fontSize: 16, italic: true, color: C.cyan, align: "center", fontFace: FONT_BODY,
  });

  const finalStats = [
    { v: "18",   l: "Major features shipped" },
    { v: "33",   l: "Automated tests" },
    { v: "16+",  l: "Git commits this sprint" },
    { v: "12 / 12", l: "Functions (under cap)" },
  ];
  finalStats.forEach((st, i) => {
    statCard(s, 0.8 + i * 3.05, 3.1, 2.85, 1.5, st.v, st.l, C.cyan);
  });

  // Contact + repo + socials block
  s.addShape("roundRect", {
    x: 1.5, y: 4.95, w: 10.3, h: 1.85,
    fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
  });
  s.addText("Sahil Anil Nikam  •  PRN 220105131264  •  Sandip University Nashik", {
    x: 1.5, y: 5.0, w: 10.3, h: 0.4,
    fontSize: 13, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
  });
  s.addText("🌐  vrikaan.com", {
    x: 1.5, y: 5.4, w: 10.3, h: 0.35,
    fontSize: 13, color: C.cyan, align: "center", fontFace: FONT_BODY,
  });

  // 4 social pills in a row
  const socials = [
    { l: "𝕏", n: "@vrikaan",        url: "x.com/vrikaan",                                 c: C.ink },
    { l: "in", n: "vrikaan-ai-cybersecurity", url: "linkedin.com/company/vrikaan-ai-cybersecurity", c: C.indigo },
    { l: "ig", n: "@vrikaan_official", url: "instagram.com/vrikaan_official",              c: C.rose },
    { l: "gh", n: "sahilnikam2410/vrikaan", url: "github.com/sahilnikam2410/vrikaan",      c: C.ink },
  ];
  socials.forEach((s2, i) => {
    const x = 1.7 + i * 2.55;
    s.addShape("roundRect", {
      x, y: 5.85, w: 2.4, h: 0.6,
      fill: { color: C.bg }, line: { color: s2.c, width: 1 }, rectRadius: 0.08,
    });
    // Hyperlink wrapping a text in the pill
    s.addText([
      { text: `${s2.l}  `, options: { fontSize: 13, bold: true, color: s2.c, fontFace: FONT_HEAD } },
      { text: s2.url, options: { fontSize: 11, color: C.body, fontFace: "Consolas",
        hyperlink: { url: "https://" + s2.url } } },
    ], {
      x, y: 5.85, w: 2.4, h: 0.6, align: "center", valign: "middle",
    });
  });
  s.addText("Questions?", {
    x: 1.5, y: 6.55, w: 10.3, h: 0.3,
    fontSize: 12, italic: true, color: C.muted, align: "center", fontFace: FONT_BODY,
  });
}

// Write
const out = "vrikaan-presentation.pptx";
await pptx.writeFile({ fileName: out });
console.log("Wrote", out, "— 16 slides");
