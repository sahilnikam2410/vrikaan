/**
 * VRIKAAN animated ad — Claude-style staged reveal.
 *
 * Builds 12 keyframe slides in a single PPTX. Each slide = one reveal moment.
 * PowerPoint applies Fade transition between consecutive slides at export time
 * so progressive reveals look like smooth animation in the final MP4.
 *
 * Output: ad-video-square.pptx → exported by ads-video-export.ps1 to MP4
 * Format: 1080 x 1080  (10 x 10 in)
 * Length: ~17s @ 1.4s per scene + 0.3s transitions
 */

const pptxgen = require("pptxgenjs");

const C = {
  bg:      "030712",
  bg2:     "0B1220",
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
  line:    "1F2937",
};
const FONT = "Inter";
const FONT_MONO = "Consolas";

const pptx = new pptxgen();
pptx.defineLayout({ name: "SQ", width: 10, height: 10 });
pptx.layout = "SQ";

// ── helpers ───────────────────────────────────────────────────────────
function bg(s) {
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 10, fill: { color: C.bg }, line: { type: "none" } });
}
function rect(s, x, y, w, h, fill, opts = {}) {
  s.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, ...opts });
}
function rrect(s, x, y, w, h, fill, r = 0.18) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, rectRadius: r });
}
function txt(s, str, opts) {
  s.addText(str, { fontFace: FONT, color: C.ink, ...opts });
}
function logoMark(s, x, y, sz = 0.7) {
  rrect(s, x, y, sz, sz, C.cyan, 0.14);
  txt(s, "V", { x, y, w: sz, h: sz, fontSize: sz * 50, bold: true, color: C.bg, align: "center", valign: "middle" });
}
function logoWord(s, x, y, sz = 0.7) {
  txt(s, "VRIKAAN", { x, y: y + 0.05, w: 3.3, h: sz - 0.1, fontSize: sz * 30, bold: true, color: C.ink, charSpacing: 5 });
}
function chip(s, label, x, y, w, h, color, textColor = "030712") {
  rrect(s, x, y, w, h, color, h / 2);
  txt(s, label, { x, y, w, h, fontSize: 12, bold: true, color: textColor, align: "center", valign: "middle" });
}
function applyFade(s, advanceSec = 1.4) {
  // Slide-level XML attrs for transition + auto-advance.
  // pptxgenjs slide.transition / .hidden via _slideObjects isn't documented,
  // so we use the supported `slide.bkgd` already set + write timing in PPT COM
  // later. Here we just stash the per-slide advance time as a prop the
  // post-processor reads back — but pptxgenjs ignores unknown props, so
  // we set the timing via PowerPoint COM in the PS1 script instead.
  // (Function kept for symmetry / future extension.)
  return s;
}

// ─────────────────────────────────────────────────────────────────────
// SCENE 1 — black, logo mark fades in centred
// ─────────────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 4.5, 4.5, 1.0);
  applyFade(s, 1.2);
}

// SCENE 2 — logo mark + wordmark appear together centred
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 3.2, 4.5, 1.0);
  logoWord(s, 4.35, 4.5, 1.0);
}

// SCENE 3 — logo migrates to top-left, dark stage prepared
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  // empty stage
}

// SCENE 4 — eyebrow appears
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
}

// SCENE 5 — first half of headline
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
  txt(s, "Your phone", {
    x: 0.6, y: 2.7, w: 9, h: 1.6,
    fontSize: 88, bold: true, color: C.ink, lineSpacingMultiple: 1.0,
  });
}

// SCENE 6 — full headline w/ cyan period
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
  s.addText([
    { text: "Your phone\n", options: { color: C.ink, bold: true } },
    { text: "is a target", options: { color: C.ink, bold: true } },
    { text: ".", options: { color: C.cyan, bold: true } },
  ], {
    x: 0.6, y: 2.7, w: 9, h: 3.2,
    fontSize: 88, fontFace: FONT, lineSpacingMultiple: 1.0,
  });
}

// SCENE 7 — accent line draws + sub appears
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
  s.addText([
    { text: "Your phone\n", options: { color: C.ink, bold: true } },
    { text: "is a target", options: { color: C.ink, bold: true } },
    { text: ".", options: { color: C.cyan, bold: true } },
  ], {
    x: 0.6, y: 2.7, w: 9, h: 3.2,
    fontSize: 88, fontFace: FONT, lineSpacingMultiple: 1.0,
  });
  rect(s, 0.6, 6.05, 1.3, 0.08, C.cyan);
  txt(s, "VRIKAAN is your shield.", {
    x: 0.6, y: 6.25, w: 9, h: 0.9,
    fontSize: 36, bold: true, color: C.inkSoft,
  });
}

// SCENE 8 — 3 chips appear
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "AI-POWERED CYBER DEFENSE", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
  s.addText([
    { text: "Your phone\n", options: { color: C.ink, bold: true } },
    { text: "is a target", options: { color: C.ink, bold: true } },
    { text: ".", options: { color: C.cyan, bold: true } },
  ], {
    x: 0.6, y: 2.7, w: 9, h: 3.2,
    fontSize: 88, fontFace: FONT, lineSpacingMultiple: 1.0,
  });
  rect(s, 0.6, 6.05, 1.3, 0.08, C.cyan);
  txt(s, "VRIKAAN is your shield.", {
    x: 0.6, y: 6.25, w: 9, h: 0.9,
    fontSize: 36, bold: true, color: C.inkSoft,
  });
  chip(s, "50+ TOOLS",     0.6, 7.3, 2.1, 0.6, C.cyan);
  chip(s, "MITRE ATT&CK",  2.85, 7.3, 2.4, 0.6, C.indigo, "FFFFFF");
  chip(s, "EN + हिन्दी",      5.4, 7.3, 2.1, 0.6, C.amber);
}

// SCENE 9 — stat slab swaps in (replaces chips with bigger reveal)
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "THE PROBLEM", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.red, charSpacing: 8,
  });
  txt(s, "₹11,000 Cr+", {
    x: 0.6, y: 2.8, w: 9, h: 2.2,
    fontSize: 130, bold: true, color: C.cyan,
  });
  txt(s, "lost to cyber scams in India last year.", {
    x: 0.6, y: 5.1, w: 9, h: 0.6,
    fontSize: 22, color: C.inkSoft,
  });
  txt(s, "Most weren't hackers. Just patterns repeated 1000s of times.", {
    x: 0.6, y: 5.7, w: 9, h: 0.6,
    fontSize: 16, color: C.muted, italic: true,
  });
}

// SCENE 10 — FREE counter-stat
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "THE FIX", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.green, charSpacing: 8,
  });
  txt(s, "FREE.", {
    x: 0.6, y: 2.8, w: 9, h: 2.5,
    fontSize: 180, bold: true, color: C.green,
  });
  // Comparison row
  rrect(s, 0.6, 5.7, 4.3, 1.4, C.card, 0.15);
  txt(s, "Norton", { x: 0.85, y: 5.85, w: 3, h: 0.5, fontSize: 16, color: C.muted });
  txt(s, "₹2,000+", { x: 0.85, y: 6.25, w: 3, h: 0.8, fontSize: 36, bold: true, color: C.red });
  rrect(s, 5.1, 5.7, 4.3, 1.4, C.card, 0.15);
  rect(s, 5.1, 5.7, 0.12, 1.4, C.cyan);
  txt(s, "VRIKAAN", { x: 5.35, y: 5.85, w: 3, h: 0.5, fontSize: 16, color: C.cyan, bold: true });
  txt(s, "₹0", { x: 5.35, y: 6.25, w: 3, h: 0.8, fontSize: 36, bold: true, color: C.ink });
}

// SCENE 11 — feature shower
{
  const s = pptx.addSlide(); bg(s);
  logoMark(s, 0.6, 0.6, 0.7);
  logoWord(s, 1.45, 0.6, 0.7);
  txt(s, "ALL ON ONE PLATFORM", {
    x: 0.6, y: 2.0, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: C.cyan, charSpacing: 8,
  });
  const feats = [
    ["Scam SMS / WhatsApp / Email AI", C.cyan],
    ["Deepfake Audio Detector",        C.indigo],
    ["MITRE ATT&CK SOC Dashboard",     C.cyan],
    ["Vulnerability Scanner",          C.indigo],
    ["Password Vault + Breach Monitor", C.cyan],
    ["Bilingual EN + हिन्दी UI",          C.indigo],
  ];
  feats.forEach((f, i) => {
    const y = 3.0 + i * 0.85;
    s.addShape("ellipse", { x: 0.65, y: y + 0.18, w: 0.28, h: 0.28, fill: { color: f[1] }, line: { type: "none" } });
    txt(s, f[0], { x: 1.1, y, w: 8.5, h: 0.6, fontSize: 24, bold: true, color: C.ink });
  });
}

// SCENE 12 — final CTA (hold)
{
  const s = pptx.addSlide(); bg(s);
  // Centred big logo
  logoMark(s, 3.5, 1.6, 1.4);
  logoWord(s, 5.05, 1.6, 1.4);
  rect(s, 4.4, 3.4, 1.2, 0.1, C.cyan);
  txt(s, "Built to protect India.", {
    x: 0.6, y: 3.8, w: 9, h: 1.0,
    fontSize: 44, bold: true, color: C.ink, align: "center",
  });
  txt(s, "AI-powered cyber defense. Free.", {
    x: 0.6, y: 4.9, w: 9, h: 0.6,
    fontSize: 20, color: C.muted, align: "center",
  });
  // Giant CTA pill
  rrect(s, 1.5, 6.4, 7.0, 1.2, C.cyan, 0.6);
  txt(s, "vrikaan.com  →", {
    x: 1.5, y: 6.4, w: 7.0, h: 1.2,
    fontSize: 44, bold: true, color: C.bg, align: "center", valign: "middle",
  });
  txt(s, "● LIVE  ·  no signup wall  ·  EN + हिन्दी", {
    x: 0.6, y: 8.0, w: 9, h: 0.5,
    fontSize: 14, color: C.muted, align: "center",
  });
  txt(s, "VRIKAAN  ·  Nashik, India", {
    x: 0.6, y: 9.3, w: 9, h: 0.4,
    fontSize: 11, color: C.muted, align: "center", charSpacing: 4,
  });
}

pptx.writeFile({ fileName: "E:/SECUVION/scripts/marketing/ad-video-square.pptx" })
  .then(f => console.log("✓", f, "(" + 12 + " scenes)"));
