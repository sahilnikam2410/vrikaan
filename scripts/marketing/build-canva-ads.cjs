/**
 * VRIKAAN Canva-style ad pack.
 *
 * Generates 3 single-slide PPTX files (one per format) so each can be exported
 * to a PNG at native resolution by PowerPoint COM.
 *
 *  • IG square      1080 x 1080  (10in x 10in)
 *  • IG/FB story    1080 x 1920  (10in x 17.78in)
 *  • LinkedIn feed  1200 x 627   (12in x 6.27in)
 *
 * Design language — bold gradient hero, big stat, layered shapes, glassy chips,
 * cyan/indigo brand, "professional cybersecurity company" tone. No student
 * framing. No college names.
 */

const pptxgen = require("pptxgenjs");

// ── Brand palette ─────────────────────────────────────────────────────
const C = {
  bg:      "030712", // gray-950
  bg2:     "0B1220",
  card:    "111827", // gray-900
  ink:     "F8FAFC", // slate-50
  inkSoft: "CBD5E1", // slate-300
  muted:   "94A3B8", // slate-400
  cyan:    "14E3C5",
  cyanDk:  "0EA5A0",
  indigo:  "6366F1",
  indigoDk:"4338CA",
  green:   "22C55E",
  red:     "EF4444",
  amber:   "F59E0B",
  line:    "1F2937",
};
const FONT_HEAD = "Inter";
const FONT_BODY = "Inter";
const FONT_MONO = "Consolas";

// ── Helpers ───────────────────────────────────────────────────────────
function rect(s, x, y, w, h, fill, opts = {}) {
  s.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { color: opts.lineColor || fill, width: opts.lineWidth || 0 }, ...opts.shape });
}
function rrect(s, x, y, w, h, fill, opts = {}) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: fill }, line: { color: opts.lineColor || fill, width: opts.lineWidth || 0 }, rectRadius: opts.r ?? 0.18, ...opts.shape });
}
function txt(s, str, opts) {
  s.addText(str, { fontFace: FONT_BODY, color: C.ink, ...opts });
}
function chip(s, label, x, y, w, h, color = C.cyan, textColor = "030712") {
  rrect(s, x, y, w, h, color, { r: h / 2 });
  txt(s, label, { x, y, w, h, fontSize: 11, bold: true, color: textColor, align: "center", valign: "middle", fontFace: FONT_HEAD });
}
function dotPattern(s, x, y, w, h, color = C.line, step = 0.3, size = 0.05) {
  for (let cy = y; cy <= y + h; cy += step) {
    for (let cx = x; cx <= x + w; cx += step) {
      s.addShape("ellipse", { x: cx, y: cy, w: size, h: size, fill: { color }, line: { type: "none" } });
    }
  }
}

// ── Common branding strip ────────────────────────────────────────────
function logoLockup(s, x, y, sz = 0.55, color = C.cyan) {
  rrect(s, x, y, sz, sz, color, { r: 0.12 });
  txt(s, "V", { x, y, w: sz, h: sz, fontSize: sz * 48, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD });
  txt(s, "VRIKAAN", { x: x + sz + 0.18, y: y + 0.04, w: 3, h: sz - 0.08, fontSize: sz * 28, bold: true, color: C.ink, fontFace: FONT_HEAD, charSpacing: 4 });
}

// ──────────────────────────────────────────────────────────────────────
// AD 1 — INSTAGRAM SQUARE 1080 x 1080  (10 x 10 in)
// ──────────────────────────────────────────────────────────────────────
function buildSquare() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "SQ", width: 10, height: 10 });
  pptx.layout = "SQ";

  const s = pptx.addSlide();
  // Background — dual gradient blocks
  rect(s, 0, 0, 10, 10, C.bg);
  // Top diagonal indigo wash (faked with overlapping rectangles)
  rect(s, 0, 0, 10, 4.2, C.indigoDk);
  rect(s, 0, 3.6, 10, 0.8, C.indigo);
  // Cyan accent bar bottom-left
  rect(s, 0, 9.6, 4.2, 0.4, C.cyan);
  rect(s, 4.2, 9.6, 0.6, 0.4, C.cyanDk);

  // Background dot grid (right side)
  dotPattern(s, 5.6, 5.2, 4.0, 3.6, "1E293B", 0.35, 0.06);

  // Top brand row
  logoLockup(s, 0.55, 0.55, 0.6, C.cyan);
  chip(s, "● LIVE", 8.55, 0.62, 0.95, 0.45, C.green, "FFFFFF");

  // Eyebrow
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.55, y: 1.85, w: 8, h: 0.4,
    fontSize: 13, bold: true, color: C.cyan, charSpacing: 6, fontFace: FONT_HEAD,
  });

  // Massive headline
  txt(s, "Your phone\nis a target.", {
    x: 0.55, y: 2.3, w: 8.9, h: 2.3,
    fontSize: 64, bold: true, color: C.ink, fontFace: FONT_HEAD, lineSpacingMultiple: 1.0,
  });

  // Subtle separator
  rect(s, 0.55, 4.85, 1.2, 0.06, C.cyan);

  // Sub headline
  txt(s, "VRIKAAN is your shield.", {
    x: 0.55, y: 5.0, w: 8.9, h: 0.7,
    fontSize: 28, bold: true, color: C.inkSoft, fontFace: FONT_HEAD,
  });

  // 3 value chips
  const chips = [
    { label: "50+ TOOLS", color: C.cyan },
    { label: "MITRE ATT&CK", color: C.indigo },
    { label: "EN + हिन्दी", color: C.amber },
  ];
  chips.forEach((c, i) => chip(s, c.label, 0.55 + i * 2.1, 5.9, 1.95, 0.55, c.color, "030712"));

  // Stat slab
  rrect(s, 0.55, 6.8, 8.9, 1.7, C.card, { r: 0.18 });
  rect(s, 0.55, 6.8, 0.12, 1.7, C.cyan);
  txt(s, "₹11,000 Cr+", {
    x: 0.85, y: 6.85, w: 5.5, h: 0.95,
    fontSize: 56, bold: true, color: C.cyan, fontFace: FONT_HEAD,
  });
  txt(s, "lost to cyber scams in India last year.", {
    x: 0.85, y: 7.85, w: 5.5, h: 0.5,
    fontSize: 14, color: C.muted, fontFace: FONT_BODY,
  });
  // Right-side mini stat
  txt(s, "FREE", {
    x: 6.5, y: 6.95, w: 2.8, h: 0.7,
    fontSize: 42, bold: true, color: C.green, align: "right", fontFace: FONT_HEAD,
  });
  txt(s, "Norton ₹2,000+  •  VRIKAAN ₹0", {
    x: 6.5, y: 7.7, w: 2.8, h: 0.5,
    fontSize: 11, color: C.muted, align: "right", fontFace: FONT_BODY,
  });

  // CTA strip
  rrect(s, 0.55, 8.85, 8.9, 0.65, C.cyan, { r: 0.12 });
  txt(s, "→  Start free at vrikaan.com", {
    x: 0.55, y: 8.85, w: 8.9, h: 0.65,
    fontSize: 20, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD,
  });

  return pptx.writeFile({ fileName: "E:/SECUVION/scripts/marketing/ad-square-1080.pptx" });
}

// ──────────────────────────────────────────────────────────────────────
// AD 2 — INSTAGRAM STORY 1080 x 1920  (10 x 17.78 in)
// ──────────────────────────────────────────────────────────────────────
function buildStory() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "ST", width: 10, height: 17.78 });
  pptx.layout = "ST";

  const s = pptx.addSlide();

  // Background gradient stack
  rect(s, 0, 0, 10, 17.78, C.bg);
  rect(s, 0, 0, 10, 5.5, C.indigoDk);
  rect(s, 0, 5.0, 10, 0.8, C.indigo);
  rect(s, 0, 12.5, 10, 0.5, C.cyanDk);
  rect(s, 0, 13.0, 10, 4.78, "0E1A2F");
  // Cyan accent ribbon
  rect(s, 0, 17.18, 6, 0.6, C.cyan);

  dotPattern(s, 6.2, 6.0, 3.5, 5.0, "1E293B", 0.35, 0.06);

  // Top branding
  logoLockup(s, 0.55, 1.2, 0.65, C.cyan);
  chip(s, "● LIVE  vrikaan.com", 6.6, 1.3, 3.0, 0.5, C.green, "FFFFFF");

  // Eyebrow
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.55, y: 3.4, w: 9, h: 0.4,
    fontSize: 14, bold: true, color: C.cyan, charSpacing: 6, fontFace: FONT_HEAD,
  });

  // Massive headline — story format gets even bigger
  txt(s, "Built to\nprotect\nIndia.", {
    x: 0.55, y: 3.9, w: 9.0, h: 4.5,
    fontSize: 96, bold: true, color: C.ink, fontFace: FONT_HEAD, lineSpacingMultiple: 0.95,
  });

  // Underline
  rect(s, 0.55, 8.5, 1.6, 0.08, C.cyan);

  // Sub
  txt(s, "50+ cybersecurity tools.\nBilingual. Free. Made in India.", {
    x: 0.55, y: 8.8, w: 9.0, h: 1.6,
    fontSize: 26, color: C.inkSoft, fontFace: FONT_HEAD, lineSpacingMultiple: 1.15,
  });

  // 3 stat cards row
  const stats = [
    { big: "₹11kCr+", small: "annual scam loss" },
    { big: "12/12",  small: "free-tier functions" },
    { big: "109",    small: "automated tests" },
  ];
  stats.forEach((st, i) => {
    const x = 0.55 + i * 3.05;
    rrect(s, x, 11.0, 2.85, 1.55, C.card, { r: 0.2 });
    rect(s, x, 11.0, 0.12, 1.55, i === 0 ? C.red : i === 1 ? C.cyan : C.indigo);
    txt(s, st.big, { x: x + 0.25, y: 11.1, w: 2.55, h: 0.85, fontSize: 30, bold: true, color: C.ink, fontFace: FONT_HEAD });
    txt(s, st.small, { x: x + 0.25, y: 11.95, w: 2.55, h: 0.5, fontSize: 11, color: C.muted, fontFace: FONT_BODY });
  });

  // Feature list
  const feats = [
    "Scam SMS / WhatsApp / email AI",
    "Deepfake audio detector",
    "MITRE ATT&CK SOC dashboard",
    "Password vault + breach monitor",
  ];
  feats.forEach((f, i) => {
    const y = 13.4 + i * 0.65;
    s.addShape("ellipse", { x: 0.7, y: y + 0.12, w: 0.18, h: 0.18, fill: { color: C.cyan }, line: { type: "none" } });
    txt(s, f, { x: 1.05, y, w: 8.5, h: 0.45, fontSize: 17, color: C.inkSoft, fontFace: FONT_BODY });
  });

  // CTA at bottom
  rrect(s, 0.55, 16.15, 8.9, 0.9, C.cyan, { r: 0.18 });
  txt(s, "Swipe up  →  vrikaan.com", {
    x: 0.55, y: 16.15, w: 8.9, h: 0.9,
    fontSize: 26, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD,
  });

  return pptx.writeFile({ fileName: "E:/SECUVION/scripts/marketing/ad-story-1080x1920.pptx" });
}

// ──────────────────────────────────────────────────────────────────────
// AD 3 — LINKEDIN FEED 1200 x 627  (12 x 6.27 in)
// ──────────────────────────────────────────────────────────────────────
function buildLinkedIn() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "LI", width: 12, height: 6.27 });
  pptx.layout = "LI";

  const s = pptx.addSlide();

  // Split layout — left content, right visual block
  rect(s, 0, 0, 12, 6.27, C.bg);
  rect(s, 7.2, 0, 4.8, 6.27, C.indigoDk);
  rect(s, 7.2, 0, 0.6, 6.27, C.indigo);
  rect(s, 0, 5.97, 7.2, 0.3, C.cyan);

  dotPattern(s, 7.6, 0.4, 4.2, 5.5, "1E293B", 0.32, 0.05);

  // Brand top-left
  logoLockup(s, 0.5, 0.5, 0.55, C.cyan);

  // Eyebrow
  txt(s, "ENTERPRISE-GRADE CYBERSECURITY  •  FREE", {
    x: 0.5, y: 1.45, w: 6.6, h: 0.4,
    fontSize: 11, bold: true, color: C.cyan, charSpacing: 5, fontFace: FONT_HEAD,
  });

  // Headline
  txt(s, "50+ security tools.\nOne login. ₹0 to start.", {
    x: 0.5, y: 1.85, w: 6.7, h: 1.85,
    fontSize: 34, bold: true, color: C.ink, fontFace: FONT_HEAD, lineSpacingMultiple: 1.05,
  });

  // Sub
  txt(s, "Threat map, scam check, deepfake audio detector, MITRE ATT&CK SOC dashboard, vulnerability scanner, password vault — all on one platform.", {
    x: 0.5, y: 3.75, w: 6.7, h: 1.2,
    fontSize: 13, color: C.muted, fontFace: FONT_BODY, lineSpacingMultiple: 1.25,
  });

  // CTA
  rrect(s, 0.5, 5.0, 3.2, 0.6, C.cyan, { r: 0.12 });
  txt(s, "Start free  →", {
    x: 0.5, y: 5.0, w: 3.2, h: 0.6,
    fontSize: 16, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: FONT_HEAD,
  });
  txt(s, "vrikaan.com", {
    x: 3.85, y: 5.0, w: 3.0, h: 0.6,
    fontSize: 14, color: C.inkSoft, valign: "middle", fontFace: FONT_BODY,
  });

  // Right visual — terminal-style alert card
  const rx = 7.8, ry = 0.9, rw = 3.8, rh = 4.3;
  rrect(s, rx, ry, rw, rh, C.card, { r: 0.22 });
  // mac-style header dots
  ["EF4444", "F59E0B", "22C55E"].forEach((col, i) => {
    s.addShape("ellipse", { x: rx + 0.18 + i * 0.28, y: ry + 0.18, w: 0.18, h: 0.18, fill: { color: col }, line: { type: "none" } });
  });
  txt(s, "soc.vrikaan.com", { x: rx + 1.2, y: ry + 0.08, w: 2.4, h: 0.35, fontSize: 10, color: C.muted, fontFace: FONT_MONO });
  rect(s, rx + 0.1, ry + 0.55, rw - 0.2, 0.02, C.line);

  // Alert title row
  rrect(s, rx + 0.2, ry + 0.75, 1.2, 0.4, C.red, { r: 0.2 });
  txt(s, "CRITICAL 14", { x: rx + 0.2, y: ry + 0.75, w: 1.2, h: 0.4, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: FONT_HEAD });
  txt(s, "Just now", { x: rx + rw - 1.0, y: ry + 0.78, w: 0.85, h: 0.35, fontSize: 9, color: C.muted, align: "right", fontFace: FONT_MONO });

  txt(s, "Possible data exfiltration", {
    x: rx + 0.2, y: ry + 1.25, w: rw - 0.4, h: 0.4,
    fontSize: 14, bold: true, color: C.ink, fontFace: FONT_HEAD,
  });
  txt(s, "TA0010 · T1041", {
    x: rx + 0.2, y: ry + 1.65, w: rw - 0.4, h: 0.3,
    fontSize: 10, color: C.cyan, fontFace: FONT_MONO,
  });

  // Mini stat tiles
  const tiles = [
    { v: "1847", l: "events" },
    { v: "12",   l: "tactics" },
    { v: "8",    l: "agents" },
  ];
  tiles.forEach((t, i) => {
    const tx = rx + 0.2 + i * 1.18;
    rrect(s, tx, ry + 2.15, 1.05, 0.85, C.bg2, { r: 0.12 });
    txt(s, t.v, { x: tx, y: ry + 2.18, w: 1.05, h: 0.5, fontSize: 18, bold: true, color: C.cyan, align: "center", fontFace: FONT_HEAD });
    txt(s, t.l, { x: tx, y: ry + 2.65, w: 1.05, h: 0.3, fontSize: 9, color: C.muted, align: "center", fontFace: FONT_BODY });
  });

  // Sparkline (faked with shapes)
  const spX = rx + 0.2, spY = ry + 3.25, spW = rw - 0.4, spH = 0.85;
  rrect(s, spX, spY, spW, spH, C.bg2, { r: 0.1 });
  const sparkPoints = [0.4, 0.55, 0.3, 0.7, 0.5, 0.8, 0.45, 0.9, 0.6, 0.85, 0.95];
  sparkPoints.forEach((p, i) => {
    const bx = spX + 0.1 + i * ((spW - 0.2) / sparkPoints.length);
    const bh = (spH - 0.2) * p;
    rect(s, bx, spY + spH - 0.1 - bh, 0.18, bh, i === sparkPoints.length - 1 ? C.red : C.cyan);
  });

  // Footer caption right side
  txt(s, "Wazuh-style SOC  ·  MITRE ATT&CK  ·  Live", {
    x: rx + 0.2, y: ry + rh - 0.4, w: rw - 0.4, h: 0.3,
    fontSize: 9, color: C.muted, align: "center", fontFace: FONT_MONO,
  });

  return pptx.writeFile({ fileName: "E:/SECUVION/scripts/marketing/ad-linkedin-1200x627.pptx" });
}

// ── Run all ───────────────────────────────────────────────────────────
(async () => {
  await buildSquare();
  console.log("✓ ad-square-1080.pptx");
  await buildStory();
  console.log("✓ ad-story-1080x1920.pptx");
  await buildLinkedIn();
  console.log("✓ ad-linkedin-1200x627.pptx");
})();
