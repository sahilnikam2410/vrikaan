/**
 * VRIKAAN Enterprise Sales Deck Builder.
 *
 * Outputs scripts/business/vrikaan-enterprise-deck.pptx (~1.2 MB)
 * Open in PowerPoint, customize per-prospect on slide 16 (case study) +
 * slide 18 (pricing), present 25-30 min, close.
 *
 * Run: cd scripts/business && node build-enterprise-deck.cjs
 * Requires: pptxgenjs (npm install --no-save pptxgenjs at repo root)
 */

const pptxgen = require("pptxgenjs");

// ── Brand palette (matches vrikaan.com) ──────────────────────────────
const C = {
  bg:      "030712",
  card:    "111827",
  ink:     "F8FAFC",
  inkSoft: "CBD5E1",
  muted:   "94A3B8",
  cyan:    "14E3C5",
  cyanDk:  "0EA5A0",
  indigo:  "6366F1",
  indigoDk:"4338CA",
  green:   "22C55E",
  red:     "EF4444",
  amber:   "F59E0B",
  gold:    "EAB308",
  line:    "1F2937",
};
const FONT_HEAD = "Inter";
const FONT_BODY = "Inter";
const FONT_MONO = "Consolas";

// ── Initialize ───────────────────────────────────────────────────────
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";  // 13.333 × 7.5 inches
pptx.title = "VRIKAAN Enterprise SOC — Sales Deck";
pptx.author = "Sahil Anil Nikam";
pptx.company = "VRIKAAN Private Limited";

// ── Helpers ──────────────────────────────────────────────────────────
function bgDark(s) {
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.bg }, line: { type: "none" } });
}
function rrect(s, x, y, w, h, fill, r = 0.12) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, rectRadius: r });
}
function rect(s, x, y, w, h, fill) {
  s.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
}
function logoMark(s, x, y, sz = 0.6, color = C.cyan) {
  rrect(s, x, y, sz, sz, color, 0.14);
  s.addText("V", { x, y, w: sz, h: sz, fontSize: sz * 50, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD });
  s.addText("VRIKAAN", { x: x + sz + 0.15, y: y + 0.06, w: 2.5, h: sz - 0.12, fontSize: sz * 25, bold: true, color: C.ink, fontFace: FONT_HEAD, charSpacing: 4 });
}
function slideNumber(s, n, total = 25) {
  s.addText(`${String(n).padStart(2, "0")} / ${total}`, {
    x: 12.0, y: 7.0, w: 1.2, h: 0.4,
    fontSize: 10, color: C.muted, align: "right", fontFace: FONT_MONO,
  });
  s.addText("vrikaan.com/enterprise", {
    x: 0.5, y: 7.0, w: 4, h: 0.4,
    fontSize: 10, color: C.muted, fontFace: FONT_MONO,
  });
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 1 — COVER
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  rect(s, 0, 0, 13.333, 4.5, C.indigoDk);
  rect(s, 0, 4.3, 13.333, 0.4, C.indigo);
  rect(s, 0, 7.2, 6.5, 0.3, C.cyan);

  logoMark(s, 0.6, 0.6, 0.8, C.cyan);

  s.addText("VRIKAAN", {
    x: 0.6, y: 1.8, w: 12, h: 1.3,
    fontSize: 96, bold: true, color: C.ink, fontFace: FONT_HEAD, charSpacing: 10,
  });
  s.addText("Enterprise SOC for India", {
    x: 0.6, y: 3.1, w: 12, h: 0.8,
    fontSize: 36, color: C.cyan, fontFace: FONT_HEAD,
  });
  s.addText("MITRE ATT&CK. DPDP-ready. INR-billed. Hindi-fluent.", {
    x: 0.6, y: 5.0, w: 12, h: 0.6,
    fontSize: 22, color: C.muted, fontFace: FONT_BODY,
  });

  s.addText("Sahil Anil Nikam · Founder & CEO", {
    x: 0.6, y: 6.2, w: 12, h: 0.4,
    fontSize: 14, color: C.ink, bold: true, fontFace: FONT_BODY,
  });
  s.addText("hello@vrikaan.com · +91 9607742410 · Nashik, India", {
    x: 0.6, y: 6.6, w: 12, h: 0.4,
    fontSize: 12, color: C.muted, fontFace: FONT_MONO,
  });
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 2 — THE PROBLEM
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);

  s.addText("The Indian mid-market's SOC dilemma", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 36, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("Three doors. All three are bad.", {
    x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    fontSize: 18, color: C.muted, fontFace: FONT_BODY,
  });

  const cards = [
    { title: "Door 1: TCS / Wipro / Infosys", price: "₹50L-5Cr / year", pain: "6-month onboarding · generic playbooks · juniors on your account · no MITRE depth" },
    { title: "Door 2: Splunk / CrowdStrike DIY", price: "₹2-15Cr licence + 5+ FTE", pain: "USD pricing · need huge internal team · no Indian on-call · no DPDP automation" },
    { title: "Door 3: Quick Heal / Seqrite", price: "₹50k-2L / month", pain: "Antivirus-first · weak SIEM · no MITRE · 8-hour SLA" },
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 4.27, y = 3.0;
    rrect(s, x, y, 4.0, 3.6, C.card, 0.18);
    rect(s, x, y, 0.12, 3.6, C.red);
    s.addText(c.title, {
      x: x + 0.3, y: y + 0.3, w: 3.5, h: 0.7,
      fontSize: 16, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(c.price, {
      x: x + 0.3, y: y + 1.0, w: 3.5, h: 0.6,
      fontSize: 22, bold: true, color: C.red, fontFace: FONT_HEAD,
    });
    s.addText(c.pain, {
      x: x + 0.3, y: y + 1.8, w: 3.5, h: 1.7,
      fontSize: 12, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.3,
    });
  });

  slideNumber(s, 2);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 3 — THE OPPORTUNITY
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);

  s.addText("THE OPPORTUNITY", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.cyan, charSpacing: 6, fontFace: FONT_HEAD,
  });
  s.addText("India lost ₹11,000 Cr to cyber fraud in 2024.", {
    x: 0.5, y: 1.7, w: 12.3, h: 1.0,
    fontSize: 38, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("BFSI · fintech · IT services share most of the regulatory + brand pain.", {
    x: 0.5, y: 2.7, w: 12.3, h: 0.5,
    fontSize: 18, color: C.muted, fontFace: FONT_BODY,
  });

  const stats = [
    { n: "₹11k Cr", l: "annual cyber loss · India 2024" },
    { n: "300%", l: "YoY rise in incidents" },
    { n: "67%", l: "of incidents at SMB / mid-market" },
    { n: "300+", l: "RBI inspection findings on SOC capability (2024)" },
    { n: "9 mo", l: "avg time to detect breach (India)" },
    { n: "₹17 Cr", l: "avg breach cost (India · IBM 2024)" },
  ];
  stats.forEach((st, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 4.27, y = 3.7 + row * 1.7;
    rrect(s, x, y, 4.0, 1.5, C.card, 0.14);
    rect(s, x, y, 0.1, 1.5, C.cyan);
    s.addText(st.n, {
      x: x + 0.25, y: y + 0.15, w: 3.6, h: 0.6,
      fontSize: 30, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    s.addText(st.l, {
      x: x + 0.25, y: y + 0.85, w: 3.6, h: 0.55,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY,
    });
  });

  slideNumber(s, 3);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 4 — INTRODUCING VRIKAAN
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);

  s.addText("INTRODUCING", {
    x: 0.5, y: 1.4, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.cyan, charSpacing: 6,
  });

  s.addText("VRIKAAN Enterprise SOC", {
    x: 0.5, y: 1.9, w: 12.3, h: 1.2,
    fontSize: 52, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  s.addText("Managed 24×7 SOC built for Indian compliance.", {
    x: 0.5, y: 3.1, w: 12.3, h: 0.6,
    fontSize: 22, color: C.cyan, fontFace: FONT_HEAD,
  });

  s.addText([
    { text: "MITRE ATT&CK", options: { bold: true, color: C.ink } },
    { text: " · ", options: { color: C.muted } },
    { text: "DPDP-ready evidence", options: { bold: true, color: C.ink } },
    { text: " · ", options: { color: C.muted } },
    { text: "INR-billed", options: { bold: true, color: C.ink } },
    { text: " · ", options: { color: C.muted } },
    { text: "Hindi on-call", options: { bold: true, color: C.ink } },
    { text: " · ", options: { color: C.muted } },
    { text: "India data residency (AWS Mumbai)", options: { bold: true, color: C.ink } },
  ], {
    x: 0.5, y: 4.0, w: 12.3, h: 0.6,
    fontSize: 18, fontFace: FONT_BODY,
  });

  const pillars = [
    { label: "₹50k/mo", sub: "Entry tier" },
    { label: "2 weeks", sub: "Onboarding" },
    { label: "1 hour", sub: "Critical SLA" },
    { label: "100% INR", sub: "No FX risk" },
  ];
  pillars.forEach((p, i) => {
    const x = 0.5 + i * 3.21, y = 5.2;
    rrect(s, x, y, 3.0, 1.5, C.card, 0.18);
    s.addText(p.label, {
      x, y: y + 0.2, w: 3.0, h: 0.7,
      fontSize: 28, bold: true, color: C.cyan, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(p.sub, {
      x, y: y + 0.95, w: 3.0, h: 0.4,
      fontSize: 12, color: C.muted, align: "center", fontFace: FONT_BODY,
    });
  });

  slideNumber(s, 4);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 5 — HOW IT WORKS (ARCHITECTURE)
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);

  s.addText("HOW IT WORKS", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.cyan, charSpacing: 6,
  });
  s.addText("Your endpoints → our SOC → your dashboard", {
    x: 0.5, y: 1.7, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  // 4-step flow
  const steps = [
    { icon: "🖥", title: "1. Endpoints", desc: "Wazuh agent auto-installs on your servers + workstations. Cloud sources (AWS, Azure, O365) connect via API." },
    { icon: "🛡", title: "2. VRIKAAN SOC", desc: "Isolated Wazuh manager + ELK cluster on AWS Mumbai. Per-tenant indices. 50+ India-tuned Sigma rules." },
    { icon: "📊", title: "3. Dashboard", desc: "MITRE ATT&CK heatmap. Compliance posture (PCI/GDPR/DPDP). Per-tenant scoped — your data only." },
    { icon: "📞", title: "4. On-call", desc: "24×7 triage. Critical alerts → phone within 1 hr. Hindi + English. Indian timezone aligned." },
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 3.21, y = 3.0;
    rrect(s, x, y, 3.0, 3.5, C.card, 0.18);
    rect(s, x, y, 3.0, 0.12, C.cyan);
    s.addText(st.icon, {
      x, y: y + 0.3, w: 3.0, h: 0.8,
      fontSize: 36, align: "center",
    });
    s.addText(st.title, {
      x: x + 0.2, y: y + 1.2, w: 2.6, h: 0.5,
      fontSize: 16, bold: true, color: C.cyan, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(st.desc, {
      x: x + 0.2, y: y + 1.8, w: 2.6, h: 1.5,
      fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY, lineSpacingMultiple: 1.4,
    });
  });

  s.addText("Privacy: only metadata + signatures cross network. Raw logs stay in your AWS account if you prefer.", {
    x: 0.5, y: 6.7, w: 12.3, h: 0.3,
    fontSize: 11, color: C.amber, align: "center", italic: true, fontFace: FONT_BODY,
  });

  slideNumber(s, 5);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDES 6-7 — 3-TIER PRICING
// ─────────────────────────────────────────────────────────────────────
const tiers = [
  {
    name: "SOC-Lite", price: "₹50,000", per: "/ month", color: C.cyan,
    target: "SMBs · 50-200 employees · single office",
    features: [
      "24×7 monitoring AWS/O365/Azure AD logs",
      "MITRE ATT&CK customer-scoped dashboard",
      "Compliance posture (PCI/GDPR/DPDP/SOC 2/ISO 27001)",
      "Email + Slack alerts (Critical+High)",
      "4-hour Critical SLA",
      "Monthly PDF threat report",
      "Self-serve onboarding portal",
    ],
  },
  {
    name: "SOC-Pro", price: "₹2-8 L", per: "/ month", color: C.indigo, popular: true,
    target: "Mid-market · 200-2,000 employees · fintech / BFSI / healthtech",
    features: [
      "Everything in SOC-Lite, plus:",
      "Wazuh agent deployment + tuning",
      "Custom Sigma rules + MITRE mappings (industry-specific)",
      "DPDP Act audit-ready evidence automation",
      "24×7 phone hotline (rotating senior on-call)",
      "1-hour Critical · 4-hour High SLA",
      "Monthly tabletop exercise · weekly intel briefing",
      "Quarterly red-team-lite (1-day external pentest)",
    ],
  },
  {
    name: "SOC-Enterprise", price: "₹10-50 L", per: "/ month + setup", color: C.gold,
    target: "Banks · NBFC · insurance · IT services · government",
    features: [
      "Everything in SOC-Pro, plus:",
      "Co-located engineer 2-5 days/mo on customer site",
      "Dedicated isolated Wazuh/ELK cluster",
      "Custom integrations (Splunk/QRadar/Sentinel/CrowdStrike)",
      "15-min Critical SLA",
      "Quarterly full red-team (3-5 day engagement)",
      "DFIR (digital forensics + IR) retainer",
      "CISO-level monthly review w/ board slides",
      "Regulatory audit support (RBI/IRDAI/SEBI)",
    ],
  },
];

// Slide 6 — pricing overview
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);

  s.addText("3 TIERS · INR · 12-MONTH CONTRACT", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.cyan, charSpacing: 6,
  });
  s.addText("Pick your scale", {
    x: 0.5, y: 1.7, w: 12.3, h: 0.8,
    fontSize: 36, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  tiers.forEach((t, i) => {
    const x = 0.5 + i * 4.27, y = 2.8;
    const isPopular = t.popular;
    rrect(s, x, y, 4.0, 4.0, isPopular ? C.indigoDk : C.card, 0.2);
    rect(s, x, y, 4.0, 0.15, t.color);

    if (isPopular) {
      rrect(s, x + 1.2, y - 0.25, 1.6, 0.4, t.color, 0.2);
      s.addText("MOST POPULAR", {
        x: x + 1.2, y: y - 0.25, w: 1.6, h: 0.4,
        fontSize: 9, bold: true, color: C.bg, align: "center", valign: "middle",
        fontFace: FONT_HEAD, charSpacing: 2,
      });
    }

    s.addText(t.name, {
      x: x + 0.3, y: y + 0.4, w: 3.4, h: 0.6,
      fontSize: 22, bold: true, color: t.color, fontFace: FONT_HEAD,
    });
    s.addText(t.target, {
      x: x + 0.3, y: y + 1.0, w: 3.4, h: 0.7,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.3,
    });
    s.addText(t.price, {
      x: x + 0.3, y: y + 1.9, w: 3.4, h: 0.7,
      fontSize: 32, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(t.per, {
      x: x + 0.3, y: y + 2.6, w: 3.4, h: 0.3,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY,
    });

    rect(s, x + 0.3, y + 3.0, 3.4, 0.02, C.line);

    s.addText(`${t.features.length} features`, {
      x: x + 0.3, y: y + 3.15, w: 3.4, h: 0.5,
      fontSize: 11, color: t.color, fontFace: FONT_MONO,
    });
    s.addText("→ See full breakdown next slide", {
      x: x + 0.3, y: y + 3.5, w: 3.4, h: 0.4,
      fontSize: 10, color: C.muted, fontFace: FONT_BODY, italic: true,
    });
  });

  slideNumber(s, 6);
}

// Slide 7 — pricing detail (3 columns each tier's features)
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("What's in each tier", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  tiers.forEach((t, i) => {
    const x = 0.5 + i * 4.27, y = 2.4;
    rrect(s, x, y, 4.0, 4.5, C.card, 0.16);
    rect(s, x, y, 0.12, 4.5, t.color);
    s.addText(t.name, {
      x: x + 0.3, y: y + 0.2, w: 3.4, h: 0.5,
      fontSize: 16, bold: true, color: t.color, fontFace: FONT_HEAD,
    });
    s.addText(t.price + " " + t.per, {
      x: x + 0.3, y: y + 0.65, w: 3.4, h: 0.4,
      fontSize: 13, color: C.muted, fontFace: FONT_BODY,
    });
    rect(s, x + 0.3, y + 1.1, 3.4, 0.02, C.line);

    t.features.forEach((f, j) => {
      s.addText(`• ${f}`, {
        x: x + 0.3, y: y + 1.2 + j * 0.4, w: 3.4, h: 0.4,
        fontSize: 10, color: C.inkSoft, fontFace: FONT_BODY, lineSpacingMultiple: 1.2,
      });
    });
  });

  slideNumber(s, 7);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 8 — VS COMPETITORS
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("VRIKAAN vs the incumbents", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 32, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const rows = [
    ["Feature",            "VRIKAAN",       "TCS / Wipro",    "Splunk",       "Quick Heal"],
    ["Entry price (mo)",   "₹50,000",       "₹10-50L",        "₹15L+",        "₹50k-2L"],
    ["Onboarding time",    "2 weeks",       "3-6 months",     "2-3 months",   "4-8 weeks"],
    ["INR billing",        "✓",             "✓",              "❌ USD",       "✓"],
    ["Hindi on-call",      "✓",             "✓",              "❌",           "✓"],
    ["MITRE ATT&CK rules", "✓ industry",    "Limited",         "✓ DIY",        "❌"],
    ["DPDP automation",    "✓",             "Manual",          "DIY",          "❌"],
    ["India residency",    "✓ Mumbai",       "✓",              "Optional ₹",   "✓"],
    ["Critical SLA (Pro)", "1 hr",           "4 hr",           "DIY",          "8 hr"],
  ];
  const colWidths = [3.4, 2.3, 2.3, 2.3, 2.3];
  const headerHeight = 0.5;
  const rowHeight = 0.4;
  const startY = 2.3;

  rows.forEach((row, i) => {
    const y = startY + (i === 0 ? 0 : headerHeight + (i - 1) * rowHeight);
    let xOff = 0.5;
    row.forEach((cell, j) => {
      const w = colWidths[j];
      if (i === 0) {
        rect(s, xOff, y, w, headerHeight, C.indigoDk);
        s.addText(cell, {
          x: xOff + 0.1, y, w: w - 0.2, h: headerHeight,
          fontSize: 11, bold: true, color: j === 1 ? C.cyan : C.ink,
          align: "left", valign: "middle", fontFace: FONT_HEAD,
        });
      } else {
        if (i % 2 === 0) rect(s, xOff, y, w, rowHeight, C.card);
        s.addText(cell, {
          x: xOff + 0.1, y, w: w - 0.2, h: rowHeight,
          fontSize: 11,
          color: j === 0 ? C.ink : j === 1 ? C.cyan : (cell.startsWith("❌") ? C.red : C.muted),
          bold: j === 0 || j === 1,
          align: "left", valign: "middle", fontFace: FONT_BODY,
        });
      }
      xOff += w;
    });
  });

  slideNumber(s, 8);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 9 — COMPLIANCE POSTURE
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Compliance you can show your auditor", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("VRIKAAN auto-collects evidence across 5 frameworks. Audit-ready exports.", {
    x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    fontSize: 16, color: C.muted, fontFace: FONT_BODY,
  });

  const fws = [
    { name: "DPDP Act 2023",       sub: "India · mandatory",    color: C.green },
    { name: "ISO 27001:2022",      sub: "International",         color: C.cyan },
    { name: "SOC 2 Type II",       sub: "US-facing",             color: C.indigo },
    { name: "PCI DSS v4.0",        sub: "Payment-handling",      color: C.gold },
    { name: "RBI Cyber Framework", sub: "Banks · NBFC",          color: C.amber },
  ];
  fws.forEach((fw, i) => {
    const x = 0.5 + (i % 5) * 2.57, y = 3.0;
    rrect(s, x, y, 2.4, 1.6, C.card, 0.14);
    rect(s, x, y, 0.1, 1.6, fw.color);
    s.addText(fw.name, {
      x: x + 0.25, y: y + 0.25, w: 2.0, h: 0.5,
      fontSize: 13, bold: true, color: fw.color, fontFace: FONT_HEAD,
    });
    s.addText(fw.sub, {
      x: x + 0.25, y: y + 0.8, w: 2.0, h: 0.4,
      fontSize: 10, color: C.muted, fontFace: FONT_BODY,
    });
    s.addText("✓ Auto", {
      x: x + 0.25, y: y + 1.15, w: 2.0, h: 0.3,
      fontSize: 11, bold: true, color: C.green, fontFace: FONT_MONO,
    });
  });

  s.addText("Audit-day deliverables", {
    x: 0.5, y: 5.0, w: 12.3, h: 0.4,
    fontSize: 16, bold: true, color: C.cyan, fontFace: FONT_HEAD,
  });
  const deliverables = [
    "All 26 PCI DSS controls mapped to evidence files",
    "DPDP §8 + §17 obligations w/ proof of processing",
    "Control-by-control SOC 2 trust-service-criteria matrix",
    "MITRE ATT&CK technique coverage matrix",
  ];
  deliverables.forEach((d, i) => {
    s.addText(`✓ ${d}`, {
      x: 0.5, y: 5.5 + i * 0.32, w: 12.3, h: 0.32,
      fontSize: 12, color: C.inkSoft, fontFace: FONT_BODY,
    });
  });

  slideNumber(s, 9);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 10-14 — INDUSTRY SLIDES (skipped for brevity — duplicate pattern)
// ─────────────────────────────────────────────────────────────────────
// In production these would be 5 separate slides — fintech / BFSI / healthcare / IT services / e-commerce
// Each w/ specific compliance pain + 3 customer scenarios

const industries = [
  { icon: "🏦", name: "Fintech / NBFC",      pain: "PCI DSS · DPDP · RBI cyber audit · KYC fraud", color: C.cyan },
  { icon: "💳", name: "Bank / Cooperative",  pain: "RBI cyber inspection · SAR reporting · ATM fraud", color: C.gold },
  { icon: "🏥", name: "Healthcare / Pharma", pain: "DPDP patient data · ISO 27001 · ransomware", color: C.green },
  { icon: "💻", name: "IT Services",         pain: "SOC 2 · ISO 27001 · client-data isolation · DDoS", color: C.indigo },
  { icon: "🛍", name: "E-commerce / D2C",    pain: "PCI DSS · credential stuffing · CSRF · fake orders", color: C.amber },
];
industries.forEach((ind, idx) => {
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("INDUSTRY FOCUS", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: ind.color, charSpacing: 6,
  });
  s.addText(`${ind.icon}  ${ind.name}`, {
    x: 0.5, y: 1.7, w: 12.3, h: 1.0,
    fontSize: 40, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText(`Compliance + threat focus: ${ind.pain}`, {
    x: 0.5, y: 2.8, w: 12.3, h: 0.6,
    fontSize: 16, color: ind.color, fontFace: FONT_BODY,
  });

  const scenarios = [
    `Scenario 1: Day-1 alert detects [specific attack pattern for ${ind.name}]`,
    `Scenario 2: Quarterly audit prep — auto-compiled evidence pack delivered in 48 hrs`,
    `Scenario 3: Critical incident → 1-hour response → forensics + root cause within 24 hrs`,
  ];
  scenarios.forEach((sc, i) => {
    rrect(s, 0.5, 4.0 + i * 0.85, 12.3, 0.7, C.card, 0.12);
    s.addText(sc, {
      x: 0.8, y: 4.0 + i * 0.85, w: 11.7, h: 0.7,
      fontSize: 14, color: C.inkSoft, valign: "middle", fontFace: FONT_BODY,
    });
  });

  slideNumber(s, 10 + idx);
});

// ─────────────────────────────────────────────────────────────────────
// SLIDE 15 — CUSTOMER ONBOARDING TIMELINE
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("From contract to first alert: 14 days", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const phases = [
    { day: "Day 1", title: "Kickoff", desc: "Joint kickoff call · stakeholder map · access provisioning starts" },
    { day: "Day 2-3", title: "Discovery", desc: "Asset inventory · log sources mapped · compliance scope confirmed" },
    { day: "Day 4-7", title: "Deploy", desc: "Wazuh agents installed · log connectors configured · baseline collection" },
    { day: "Day 8-12", title: "Tune", desc: "False-positive tuning · custom Sigma rules · MITRE mapping for industry" },
    { day: "Day 13-14", title: "Live", desc: "First production alerts → 24×7 monitoring begins · weekly digest starts" },
  ];
  const colWidth = 12.3 / phases.length;
  phases.forEach((p, i) => {
    const x = 0.5 + i * colWidth, y = 2.5;
    rrect(s, x + 0.1, y, colWidth - 0.2, 4.0, C.card, 0.14);
    rect(s, x + 0.1, y, colWidth - 0.2, 0.1, C.cyan);

    s.addText(p.day, {
      x: x + 0.2, y: y + 0.25, w: colWidth - 0.4, h: 0.4,
      fontSize: 14, bold: true, color: C.cyan, align: "center", fontFace: FONT_MONO,
    });
    s.addText(p.title, {
      x: x + 0.2, y: y + 0.75, w: colWidth - 0.4, h: 0.6,
      fontSize: 18, bold: true, color: C.ink, align: "center", fontFace: FONT_HEAD,
    });
    s.addText(p.desc, {
      x: x + 0.2, y: y + 1.5, w: colWidth - 0.4, h: 2.3,
      fontSize: 11, color: C.muted, align: "center", fontFace: FONT_BODY, lineSpacingMultiple: 1.4,
    });
  });

  slideNumber(s, 15);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 16 — CUSTOMER CASE STUDY (placeholder — customize per-prospect)
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("CASE STUDY", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.cyan, charSpacing: 6,
  });
  s.addText("[CUSTOMIZE THIS SLIDE PER PROSPECT]", {
    x: 0.5, y: 1.7, w: 12.3, h: 0.8,
    fontSize: 26, bold: true, color: C.amber, fontFace: FONT_HEAD,
  });
  s.addText("Replace with anonymized customer scenario closest to prospect's industry.", {
    x: 0.5, y: 2.6, w: 12.3, h: 0.5,
    fontSize: 14, color: C.muted, italic: true, fontFace: FONT_BODY,
  });

  rrect(s, 0.5, 3.4, 6.0, 3.4, C.card, 0.18);
  s.addText("CHALLENGE", {
    x: 0.8, y: 3.6, w: 5.4, h: 0.4,
    fontSize: 11, bold: true, color: C.red, charSpacing: 4,
  });
  s.addText("[e.g. RBI inspection found inadequate SOC capability. Existing AV-only setup. 2-person internal security team. 6-week deadline to demonstrate 24×7 monitoring.]", {
    x: 0.8, y: 4.0, w: 5.4, h: 2.7,
    fontSize: 12, color: C.inkSoft, fontFace: FONT_BODY, lineSpacingMultiple: 1.5,
  });

  rrect(s, 6.8, 3.4, 6.0, 3.4, C.card, 0.18);
  s.addText("OUTCOME", {
    x: 7.1, y: 3.6, w: 5.4, h: 0.4,
    fontSize: 11, bold: true, color: C.green, charSpacing: 4,
  });
  s.addText("[e.g. SOC-Pro deployed in 12 days. RBI audit gap closed. MTTR 8h → 35 min. Zero critical alerts missed in 6 months. Renewed 24-month contract.]", {
    x: 7.1, y: 4.0, w: 5.4, h: 2.7,
    fontSize: 12, color: C.inkSoft, fontFace: FONT_BODY, lineSpacingMultiple: 1.5,
  });

  slideNumber(s, 16);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 17 — FOUNDERS & TEAM
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Built by SOC analysts. Not corporate strangers.", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 26, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const founders = [
    {
      name: "Sahil Anil Nikam", role: "Founder & CEO · SOC Analyst",
      bio: "Pune-born full-stack developer + cybersecurity researcher. Drives product architecture, AI integration, payments, deploy pipeline.",
      quote: "Cybersecurity shouldn't be a luxury — it should be a right.",
      color: C.indigo,
    },
    {
      name: "Khushi Ishwar Raigade", role: "Co-Founder · SOC Analyst",
      bio: "Leads VRIKAAN's threat-intelligence pipeline, MITRE ATT&CK rule engineering, SIEM tuning, IR playbooks.",
      quote: "Detection beats reaction. A defender's job is to find the attacker before they find the data.",
      color: C.cyan,
    },
  ];
  founders.forEach((f, i) => {
    const x = 0.5 + i * 6.42, y = 2.4;
    rrect(s, x, y, 6.15, 4.4, C.card, 0.18);
    rect(s, x, y, 0.15, 4.4, f.color);

    s.addText(f.name, {
      x: x + 0.4, y: y + 0.4, w: 5.5, h: 0.6,
      fontSize: 22, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(f.role, {
      x: x + 0.4, y: y + 1.0, w: 5.5, h: 0.4,
      fontSize: 13, color: f.color, fontFace: FONT_BODY,
    });
    s.addText(f.bio, {
      x: x + 0.4, y: y + 1.5, w: 5.5, h: 1.5,
      fontSize: 12, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.4,
    });

    rect(s, x + 0.4, y + 3.1, 5.5, 0.02, C.line);
    s.addText(`"${f.quote}"`, {
      x: x + 0.4, y: y + 3.25, w: 5.5, h: 0.9,
      fontSize: 11, color: C.inkSoft, italic: true, fontFace: FONT_BODY, lineSpacingMultiple: 1.5,
    });
  });

  slideNumber(s, 17);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 18 — PRICING FOR THIS PROSPECT (customizable)
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("PROPOSED PRICING — [CUSTOMER NAME]", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.4,
    fontSize: 12, bold: true, color: C.amber, charSpacing: 6,
  });
  s.addText("[CUSTOMIZE PER PROSPECT]", {
    x: 0.5, y: 1.7, w: 12.3, h: 0.7,
    fontSize: 22, color: C.muted, italic: true, fontFace: FONT_BODY,
  });

  rrect(s, 0.5, 2.8, 12.3, 4.0, C.card, 0.2);
  rect(s, 0.5, 2.8, 12.3, 0.15, C.cyan);

  s.addText("SOC-Pro · 12-month commitment", {
    x: 0.8, y: 3.1, w: 11.7, h: 0.5,
    fontSize: 18, bold: true, color: C.cyan, fontFace: FONT_HEAD,
  });

  const line = [
    ["Monthly fee:",             "INR [AMOUNT]"],
    ["Setup fee (one-time):",   "INR 1,00,000 (waived if 24-mo)"],
    ["Annual contract value:",   "INR [AMOUNT × 12]"],
    ["Payment terms:",           "Net 30 · INR · GST extra"],
    ["Termination:",             "60-day notice post year-1"],
  ];
  line.forEach((row, i) => {
    s.addText(row[0], {
      x: 0.8, y: 3.8 + i * 0.45, w: 5.0, h: 0.4,
      fontSize: 14, color: C.muted, fontFace: FONT_BODY,
    });
    s.addText(row[1], {
      x: 5.8, y: 3.8 + i * 0.45, w: 6.7, h: 0.4,
      fontSize: 14, bold: true, color: C.ink, fontFace: FONT_MONO,
    });
  });

  slideNumber(s, 18);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 19 — SLA SUMMARY
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Service Level Agreement", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("Contractual commitments. Credits if missed.", {
    x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    fontSize: 16, color: C.muted, fontFace: FONT_BODY,
  });

  const slas = [
    { metric: "Platform uptime",  v: "99.9%",  excl: "Excludes scheduled maintenance" },
    { metric: "Critical SLA",     v: "1 hour", excl: "Acknowledged + triage started (Pro)" },
    { metric: "High SLA",         v: "4 hours", excl: "" },
    { metric: "Medium SLA",       v: "Next BD", excl: "" },
    { metric: "Monthly report",   v: "3 BD",   excl: "From end of month" },
    { metric: "Credit if missed", v: "15%",    excl: "Of monthly fee per SLA missed (cap 50%)" },
  ];
  slas.forEach((sl, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 4.27, y = 2.8 + row * 1.8;
    rrect(s, x, y, 4.0, 1.6, C.card, 0.14);
    rect(s, x, y, 0.1, 1.6, C.cyan);
    s.addText(sl.metric, {
      x: x + 0.25, y: y + 0.15, w: 3.6, h: 0.4,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY, charSpacing: 1,
    });
    s.addText(sl.v, {
      x: x + 0.25, y: y + 0.5, w: 3.6, h: 0.6,
      fontSize: 22, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    if (sl.excl) {
      s.addText(sl.excl, {
        x: x + 0.25, y: y + 1.1, w: 3.6, h: 0.4,
        fontSize: 9, color: C.muted, italic: true, fontFace: FONT_BODY,
      });
    }
  });

  slideNumber(s, 19);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 20 — SECURITY OF VRIKAAN ITSELF
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Who watches the watchers?", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("We hold ourselves to the standards we ask of you.", {
    x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    fontSize: 16, color: C.muted, fontFace: FONT_BODY,
  });

  const measures = [
    { t: "Data residency",        d: "All customer data stored in AWS Mumbai (ap-south-1). No transfer outside India." },
    { t: "Encryption",            d: "AES-256 at rest. TLS 1.3 in transit. Per-tenant isolated indices." },
    { t: "Access control",        d: "RBAC + MFA mandatory for all VRIKAAN staff. Audit logged." },
    { t: "Annual pentest",        d: "External pentest by certified firm. Report shared on request under NDA." },
    { t: "Bug bounty",            d: "Public program at vrikaan.com/responsible-disclosure. ₹2-25k INR bounties." },
    { t: "Sub-processors disclosed", d: "AWS · Firestore · Brevo (mail) · Sentry (errors). DPA covers all." },
  ];
  measures.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 6.42, y = 3.0 + row * 1.3;
    rrect(s, x, y, 6.15, 1.15, C.card, 0.14);
    rect(s, x, y, 0.1, 1.15, C.green);
    s.addText(m.t, {
      x: x + 0.25, y: y + 0.15, w: 5.5, h: 0.4,
      fontSize: 14, bold: true, color: C.green, fontFace: FONT_HEAD,
    });
    s.addText(m.d, {
      x: x + 0.25, y: y + 0.55, w: 5.5, h: 0.6,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.3,
    });
  });

  slideNumber(s, 20);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 21 — ROADMAP
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Roadmap · next 12 months", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const quarters = [
    { q: "Q2 2026", items: ["ISO 27001 certification", "CERT-In empanelment", "100+ Sigma rules (BFSI tuned)", "Desktop app v1.0 release"] },
    { q: "Q3 2026", items: ["SOC 2 Type II report", "Android security app launch", "Custom integrations: Splunk + QRadar", "Multi-region failover (AWS Hyderabad)"] },
    { q: "Q4 2026", items: ["Threat-intel feed (paid tier)", "Bring-your-own-LLM option", "EDR module (light)", "30+ paying customers · ₹50L MRR"] },
    { q: "Q1 2027", items: ["MSP / channel-partner program", "Compliance auto-evidence v2", "MITRE ATT&CK v17 mappings", "ASEAN expansion (Singapore)"] },
  ];
  quarters.forEach((q, i) => {
    const x = 0.5 + i * 3.21, y = 2.5;
    rrect(s, x, y, 3.0, 4.4, C.card, 0.16);
    rect(s, x, y, 3.0, 0.12, C.indigo);
    s.addText(q.q, {
      x: x + 0.2, y: y + 0.3, w: 2.6, h: 0.5,
      fontSize: 16, bold: true, color: C.indigo, align: "center", fontFace: FONT_MONO,
    });
    q.items.forEach((it, j) => {
      s.addText(`• ${it}`, {
        x: x + 0.25, y: y + 1.0 + j * 0.8, w: 2.5, h: 0.7,
        fontSize: 11, color: C.inkSoft, fontFace: FONT_BODY, lineSpacingMultiple: 1.4,
      });
    });
  });

  slideNumber(s, 21);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 22 — REFERENCES / TRUST
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Why early. Why us.", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("Honest position: we're early. That's the opportunity, not the risk.", {
    x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    fontSize: 16, color: C.muted, italic: true, fontFace: FONT_BODY,
  });

  const items = [
    { t: "Founder-led service",       d: "You talk to Sahil + Khushi personally, not a 22-year-old account exec at a 50,000-person SI." },
    { t: "Bootstrapped, no rush",     d: "We're not VC-funded yet. Decisions optimize for your retention, not our growth metrics." },
    { t: "MITRE-first from Day 1",    d: "Built on industry-standard frameworks. Easy to switch off us. No vendor lock-in." },
    { t: "Code partially public",     d: "github.com/sahilnikam2410/vrikaan — audit our work before signing." },
    { t: "Pricing transparent",       d: "All tiers + add-ons published at vrikaan.com/enterprise. No 'request a quote' games." },
    { t: "First 3 customers = case studies", d: "Lock in launch pricing forever. Shape the product. Speaking slots at our launch event." },
  ];
  items.forEach((item, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 6.42, y = 3.0 + row * 1.3;
    rrect(s, x, y, 6.15, 1.15, C.card, 0.14);
    rect(s, x, y, 0.1, 1.15, C.cyan);
    s.addText(item.t, {
      x: x + 0.25, y: y + 0.15, w: 5.5, h: 0.4,
      fontSize: 13, bold: true, color: C.cyan, fontFace: FONT_HEAD,
    });
    s.addText(item.d, {
      x: x + 0.25, y: y + 0.55, w: 5.5, h: 0.6,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.3,
    });
  });

  slideNumber(s, 22);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 23 — TECHNICAL DEEP-DIVE (for technical buyers)
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Tech stack — under the hood", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const blocks = [
    { title: "Detection",      items: ["Wazuh manager (SIEM)", "Sigma rule engine", "MITRE ATT&CK v15", "Custom Indian-threat rules"] },
    { title: "Infrastructure", items: ["AWS Mumbai (ap-south-1)", "Per-tenant Elasticsearch indices", "Terraform infra-as-code", "Multi-AZ HA"] },
    { title: "Integrations",   items: ["AWS / Azure / GCP", "Office 365 + Google Workspace", "Splunk / QRadar / Sentinel forwarder", "REST API + webhooks"] },
    { title: "Alerting",       items: ["Email + Slack + Teams", "Phone (Twilio) for Critical", "PagerDuty + Opsgenie connectors", "Custom webhook"] },
    { title: "Reporting",      items: ["MITRE coverage heatmap", "Compliance posture (5 frameworks)", "Weekly executive digest", "Monthly PDF + 30-min call"] },
    { title: "Source code",    items: ["github.com/sahilnikam2410/vrikaan", "Audit before signing", "React 19 · Vite · Node 20", "PR review w/ Khushi"] },
  ];
  blocks.forEach((b, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 4.27, y = 2.4 + row * 2.3;
    rrect(s, x, y, 4.0, 2.1, C.card, 0.14);
    rect(s, x, y, 0.1, 2.1, C.indigo);
    s.addText(b.title, {
      x: x + 0.25, y: y + 0.15, w: 3.6, h: 0.4,
      fontSize: 14, bold: true, color: C.indigo, fontFace: FONT_HEAD,
    });
    b.items.forEach((it, j) => {
      s.addText(`• ${it}`, {
        x: x + 0.25, y: y + 0.6 + j * 0.35, w: 3.6, h: 0.32,
        fontSize: 10, color: C.muted, fontFace: FONT_MONO,
      });
    });
  });

  slideNumber(s, 23);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 24 — NEXT STEPS
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  logoMark(s, 0.5, 0.4, 0.5);
  s.addText("Next steps", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.8,
    fontSize: 36, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });

  const steps = [
    { n: "1", title: "Discovery (today)",   desc: "Confirm scope, compliance needs, current stack", time: "30 min · today" },
    { n: "2", title: "Sandbox demo (Day 2)", desc: "Live alerts firing on your sample data", time: "45 min · async demo" },
    { n: "3", title: "Pricing call (Day 7)",  desc: "Tier selection, contract draft sent", time: "30 min" },
    { n: "4", title: "Legal review (Days 7-21)", desc: "Your team reviews MSA + DPA + SLA", time: "1-3 weeks" },
    { n: "5", title: "Signature + onboarding (Day 21-35)", desc: "E-sign · Wazuh agents deployed · go live", time: "2 weeks" },
  ];
  steps.forEach((st, i) => {
    const y = 2.5 + i * 0.85;
    rrect(s, 0.5, y, 12.3, 0.75, C.card, 0.14);
    rrect(s, 0.6, y + 0.1, 0.6, 0.55, C.cyan, 0.12);
    s.addText(st.n, {
      x: 0.6, y: y + 0.1, w: 0.6, h: 0.55,
      fontSize: 22, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD,
    });
    s.addText(st.title, {
      x: 1.4, y: y + 0.15, w: 6.0, h: 0.4,
      fontSize: 15, bold: true, color: C.ink, fontFace: FONT_HEAD,
    });
    s.addText(st.desc, {
      x: 1.4, y: y + 0.45, w: 6.5, h: 0.3,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY,
    });
    s.addText(st.time, {
      x: 9.0, y: y + 0.2, w: 3.3, h: 0.4,
      fontSize: 11, color: C.cyan, fontFace: FONT_MONO, align: "right",
    });
  });

  slideNumber(s, 24);
}

// ─────────────────────────────────────────────────────────────────────
// SLIDE 25 — THANK YOU
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bgDark(s);
  rect(s, 0, 0, 13.333, 7.5, C.indigoDk);
  rect(s, 0, 4.5, 13.333, 0.4, C.indigo);
  rect(s, 0, 7.2, 6.5, 0.3, C.cyan);

  logoMark(s, 0.6, 0.6, 0.8, C.cyan);

  s.addText("Thank you.", {
    x: 0.6, y: 2.0, w: 12, h: 1.5,
    fontSize: 80, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  s.addText("Let's get you secured.", {
    x: 0.6, y: 3.5, w: 12, h: 0.8,
    fontSize: 32, color: C.cyan, fontFace: FONT_HEAD,
  });

  s.addText("Sahil Anil Nikam · Founder & CEO", {
    x: 0.6, y: 5.5, w: 12, h: 0.4,
    fontSize: 16, bold: true, color: C.ink, fontFace: FONT_BODY,
  });
  s.addText("hello@vrikaan.com · +91 9607742410 · vrikaan.com/enterprise", {
    x: 0.6, y: 5.95, w: 12, h: 0.4,
    fontSize: 14, color: C.inkSoft, fontFace: FONT_MONO,
  });
  s.addText("Demo sandbox: soc.vrikaan.com  ·  Source: github.com/sahilnikam2410/vrikaan", {
    x: 0.6, y: 6.4, w: 12, h: 0.4,
    fontSize: 12, color: C.muted, fontFace: FONT_MONO,
  });
}

// ─────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: "scripts/business/vrikaan-enterprise-deck.pptx" }).then(name => {
  console.log("✓ Wrote", name, "(25 slides, 16:9)");
});
