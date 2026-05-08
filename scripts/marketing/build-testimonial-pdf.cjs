/**
 * VRIKAAN — Testimonial Script DOCX builder
 * Output: E:/SECUVION/scripts/marketing/vrikaan-testimonial-script.docx
 *
 * Run: node scripts/marketing/build-testimonial-pdf.cjs
 * Then: powershell -File scripts/marketing/testimonial-to-pdf.ps1
 */
const fs = require("node:fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  Header, Footer, TabStopType, TabStopPosition,
} = require("docx");

const FONT = "Calibri";
const FONT_MONO = "Consolas";

const T = (text, opts = {}) => new TextRun({ text, font: FONT, size: 22, ...opts });
const Tm = (text, opts = {}) => new TextRun({ text, font: FONT_MONO, size: 18, ...opts });

const blank = (after = 120) => new Paragraph({ spacing: { after }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const center = (text, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: opts.after || 120 },
  children: [T(text, { size: opts.size || 22, ...(opts.run || {}) })],
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 100, line: 300 },
  alignment: opts.align || AlignmentType.LEFT,
  children: typeof text === "string"
    ? [T(text, opts.run || {})]
    : text.map(part => typeof part === "string" ? T(part) : T(part.t, part)),
});

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "0891B2", space: 4 } },
    children: [T(text, { size: 32, bold: true, color: "0F172A" })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120 },
    children: [T(text, { size: 26, bold: true, color: "0891B2" })],
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [T(text, { size: 22, bold: true, italics: true })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60, line: 280 },
    children: typeof text === "string" ? [T(text)] : text.map(part =>
      typeof part === "string" ? T(part) : T(part.t, part)),
  });
}

// Speaker line — colored speaker name + dialogue text
function speaker(name, color, line) {
  return new Paragraph({
    spacing: { after: 100, line: 320 },
    indent: { left: 360 },
    children: [
      T(`${name}:`, { bold: true, color, size: 22 }),
      T(`  ${line}`, { size: 22 }),
    ],
  });
}

function direction(text) {
  return new Paragraph({
    spacing: { before: 120, after: 100, line: 280 },
    indent: { left: 360 },
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    children: [T(text, { italics: true, color: "475569", size: 20 })],
  });
}

function timeBeat(time) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: "0891B2", space: 4 } },
    children: [T(time, { bold: true, color: "0891B2", size: 20, font: FONT_MONO })],
  });
}

// Table builder
function tableHeader(text) {
  return new TableCell({
    width: { size: 1, type: WidthType.AUTO },
    shading: { type: ShadingType.CLEAR, fill: "0F172A" },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [T(text, { size: 20, bold: true, color: "FFFFFF" })],
    })],
  });
}
function tableCell(text, opts = {}) {
  return new TableCell({
    width: { size: 1, type: WidthType.AUTO },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [T(text, { size: 20, bold: !!opts.bold })],
    })],
  });
}
function makeTable(columnWidthsDxa, headers, rows) {
  const totalWidth = columnWidthsDxa.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" };
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
  const buildCell = (cellFn, idx, text, cellOpts = {}) => {
    const c = cellFn(text, cellOpts);
    c.options.width = { size: columnWidthsDxa[idx], type: WidthType.DXA };
    return c;
  };
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: columnWidthsDxa,
    borders,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => buildCell(tableHeader, i, h)) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => buildCell(tableCell, ci,
          typeof cell === "string" ? cell : cell.t,
          { fill: ri % 2 === 1 ? "F8FAFC" : undefined, ...(typeof cell === "object" ? cell : {}) }
        )),
      })),
    ],
  });
}

const SAHIL_COLOR = "0891B2";
const ANKALESH_COLOR = "6366F1";

// ────────────────────────────────────────────────────────────────────
// CONTENT
// ────────────────────────────────────────────────────────────────────
const children = [
  // ── COVER ──
  blank(200),
  center("VRIKAAN", { size: 56, run: { bold: true, color: "0F172A" } }),
  center("Testimonial Video Script", { size: 32, run: { italics: true, color: "0891B2" } }),
  blank(280),
  center("Two students. One free tier. One real product.", { size: 22, run: { italics: true, color: "475569" } }),
  blank(560),
  center("Featuring", { size: 18, run: { italics: true, color: "475569" } }),
  blank(80),
  center("Sahil Anil Nikam", { size: 26, run: { bold: true } }),
  center("PRN 220105131264", { size: 18, run: { color: "475569" } }),
  blank(120),
  center("Ankalesh Dipak Somvanshi", { size: 26, run: { bold: true } }),
  center("PRN 220105131273", { size: 18, run: { color: "475569" } }),
  blank(360),
  center("Sandip University, Nashik", { size: 22, run: { bold: true } }),
  center("Department of Computer Science and Engineering", { size: 18, run: { color: "475569" } }),
  center("Academic Year 2025–26", { size: 18, run: { color: "475569" } }),
  blank(560),
  center("Live at vrikaan.com", { size: 22, run: { color: "0891B2", bold: true } }),
  pageBreak(),

  // ── BRIEF ──
  h1("Brief"),
  p([
    { t: "Format: ", bold: true },
    "ONE final video. Both speakers record at their own homes, separately. No on-camera meeting. Edit cuts between them. Sahil's half explains the project's ",
    { t: "what & why", italics: true },
    ". Ankalesh's half explains the ",
    { t: "engineering & impact", italics: true },
    ".",
  ]),
  p([
    { t: "Final length: ", bold: true },
    "~60–70 seconds. Each person speaks ~30 seconds + a 5s shared end card.",
  ]),
  p([
    { t: "Surfaces: ", bold: true },
    "Instagram Reels, YouTube Shorts, LinkedIn, X (Twitter), Sandip University social channels.",
  ]),

  h2("Shoot independently · edit together"),
  bullet("Each person shoots their own portion at home — phone or laptop webcam (1080p min, 4K preferred)."),
  bullet("Quiet room, plain wall behind, soft natural light from a window in front."),
  bullet("Lavalier mic OR clean phone audio with no echo."),
  bullet("Look just left or right of the lens — feels like an interview, not a piece-to-camera."),
  bullet("Editor stitches both takes together with B-roll between."),

  pageBreak(),

  // ── PART 1 — SAHIL ──
  h1("Part 1 — Sahil's Half"),
  p([
    { t: "Setting: ", bold: true },
    "Sahil's room. Plain wall, laptop on desk in foreground (closed or open).",
  ]),
  p([{ t: "Wardrobe: ", bold: true }, "plain T-shirt or shirt, no logos."]),
  p([{ t: "Mood: ", bold: true }, "confident, slightly excited."]),

  timeBeat("0:00 — 0:06   ON CAMERA — Sahil, medium shot."),
  direction("Lower-third caption (added in edit): Sahil Anil Nikam · PRN 220105131264 · Sandip University Nashik"),
  speaker("Sahil", SAHIL_COLOR, "Hi, I'm Sahil. Final-year Computer Science Engineering at Sandip University Nashik. Together with my project partner Ankalesh, we built VRIKAAN."),

  timeBeat("0:06 — 0:12   B-ROLL — vrikaan.com homepage on phone, scrolling. Sahil voice-over."),
  speaker("Sahil (V.O.)", SAHIL_COLOR, "VRIKAAN is an AI-powered cyber-security assistance and monitoring platform. It is live in production at vrikaan.com."),

  timeBeat("0:12 — 0:18   ON CAMERA again."),
  speaker("Sahil", SAHIL_COLOR, "Here's the problem we wanted to solve. India lost over eleven thousand crore rupees to cyber-crime last year. Seventy percent year-over-year growth."),

  timeBeat("0:18 — 0:26   B-ROLL — quick cuts of news headlines, fake UPI scam SMS, Norton/McAfee pricing pages. Sahil voice-over."),
  speaker("Sahil (V.O.)", SAHIL_COLOR, "But the existing tools — Norton, McAfee, Bitdefender — cost two to four thousand rupees a year. They are English only. Built for offices in foreign countries, not for Indian students."),

  timeBeat("0:26 — 0:32   ON CAMERA."),
  speaker("Sahil", SAHIL_COLOR, "So we built VRIKAAN. Fifty-plus cyber-security tools. English plus Hindi. INR-native payments. Free tier that actually works. All of this from a single dashboard."),

  timeBeat("0:32 — 0:34   QUICK B-ROLL — bilingual UI toggle (EN / हिन्दी). Sahil voice-over closes his half."),
  speaker("Sahil (V.O.)", SAHIL_COLOR, "And now I'll let Ankalesh tell you how we built it."),

  blank(160),
  direction("Sahil shoots this. Total speaking time ≈ 28 seconds."),

  pageBreak(),

  // ── PART 2 — ANKALESH ──
  h1("Part 2 — Ankalesh's Half"),
  p([
    { t: "Setting: ", bold: true },
    "Ankalesh's room. Plain wall, neutral colour. Optional: code editor visible on a screen behind him (blurred).",
  ]),
  p([{ t: "Wardrobe: ", bold: true }, "plain T-shirt or shirt, no logos."]),
  p([{ t: "Mood: ", bold: true }, "calm, technical, lightly proud."]),

  timeBeat("0:34 — 0:40   ON CAMERA — Ankalesh, medium shot."),
  direction("Lower-third caption (added in edit): Ankalesh Dipak Somvanshi · PRN 220105131273 · Sandip University Nashik"),
  speaker("Ankalesh", ANKALESH_COLOR, "Hi, I'm Ankalesh, Sahil's project partner. Let me tell you what makes VRIKAAN different from a usual college project."),

  timeBeat("0:40 — 0:48   B-ROLL — Vercel dashboard showing 12/12 functions, code snippet of the router pattern in tools.js (zoom in). Ankalesh voice-over."),
  speaker("Ankalesh (V.O.)", ANKALESH_COLOR, "Vercel's free tier only allows twelve serverless functions. We needed eighteen. So we built a router pattern that hosts all eighteen actions inside one file. Twelve out of twelve. Zero rupees of infrastructure cost."),

  timeBeat("0:48 — 0:54   ON CAMERA again."),
  speaker("Ankalesh", ANKALESH_COLOR, "We added two-factor authentication using RFC 6238 TOTP. NIST Authenticator Assurance Level 2. Without paying for Firebase Identity Platform."),

  timeBeat("0:54 — 1:00   B-ROLL — TOTP QR with backup codes, then GitHub Actions auto-promote workflow showing a green check, then Sentry. Ankalesh voice-over."),
  speaker("Ankalesh (V.O.)", ANKALESH_COLOR, "Thirty-three automated tests, all passing. GitHub Actions auto-deploy. Sentry telemetry. Live in production since March."),

  timeBeat("1:00 — 1:05   ON CAMERA — Ankalesh closes."),
  speaker("Ankalesh", ANKALESH_COLOR, "Two students. One free tier. One real product. Try it now — vrikaan dot com."),

  blank(160),
  direction("Ankalesh shoots this. Total speaking time ≈ 30 seconds."),

  pageBreak(),

  // ── END CARD ──
  h1("End Card (5 seconds)"),
  p("Full-frame end card. Dark navy background. No speaker on camera."),
  blank(120),
  bullet([{ t: "Top: ", bold: true }, "VRIKAAN logo"]),
  bullet([{ t: "Middle: ", bold: true }, "vrikaan.com   (large, cyan)"]),
  bullet([{ t: "Below: ", bold: true }, "github.com/sahilnikam2410/vrikaan"]),
  bullet([{ t: "Bottom-left: ", bold: true }, "𝕏  in  ig  gh"]),
  bullet([{ t: "Bottom-right: ", bold: true }, "Sahil Nikam · Ankalesh Somvanshi · SUN 2025-26"]),
  blank(160),
  direction("Both can record this single voice-over line separately and editor layers them."),
  speaker("Both (V.O.)", "0F172A", "VRIKAAN."),

  pageBreak(),

  // ── TIME MAP TABLE ──
  h1("Time Map"),
  makeTable(
    [1500, 1900, 2400, 1500, 1700],
    ["Block", "Speaker", "On / Off cam", "Duration", "Cumulative"],
    [
      ["0:00–0:06", "Sahil",    "On",                "6s", "0:06"],
      ["0:06–0:12", "Sahil",    "Off (B-roll V.O.)", "6s", "0:12"],
      ["0:12–0:18", "Sahil",    "On",                "6s", "0:18"],
      ["0:18–0:26", "Sahil",    "Off (B-roll V.O.)", "8s", "0:26"],
      ["0:26–0:32", "Sahil",    "On",                "6s", "0:32"],
      ["0:32–0:34", "Sahil",    "Off (handoff V.O.)","2s", "0:34"],
      ["0:34–0:40", "Ankalesh", "On",                "6s", "0:40"],
      ["0:40–0:48", "Ankalesh", "Off (B-roll V.O.)", "8s", "0:48"],
      ["0:48–0:54", "Ankalesh", "On",                "6s", "0:54"],
      ["0:54–1:00", "Ankalesh", "Off (B-roll V.O.)", "6s", "1:00"],
      ["1:00–1:05", "Ankalesh", "On",                "5s", "1:05"],
      [{ t: "1:05–1:10", bold: true }, { t: "End card", bold: true }, "—", "5s", { t: "1:10", bold: true }],
    ],
  ),

  pageBreak(),

  // ── CHECKLISTS ──
  h1("Shoot Checklist"),
  h2("Sahil"),
  bullet("Quiet room, blank wall behind."),
  bullet("Soft window light from front (not behind you)."),
  bullet("Phone in landscape OR portrait — match Ankalesh's choice (decide before)."),
  bullet("Read script 2 times silently, then 1 time aloud."),
  bullet("Record FOUR on-camera takes per beat — pick best in edit."),
  bullet("Record voice-over for 0:06–0:12, 0:18–0:26, 0:32–0:34 — separate audio file."),
  bullet("Send all clips + audio to editor."),

  h2("Ankalesh"),
  bullet("Same lighting setup as Sahil — match the look."),
  bullet("Same aspect ratio as Sahil."),
  bullet("Read script 2 times silently, then 1 time aloud."),
  bullet("Record FOUR on-camera takes per beat — pick best in edit."),
  bullet("Record voice-over for 0:40–0:48, 0:54–1:00 — separate audio file."),
  bullet("Send all clips + audio to editor."),

  h2("Editor"),
  bullet("Match colour-grade between Sahil's and Ankalesh's footage."),
  bullet("Add lower-third name + PRN bars at 0:00 and 0:34."),
  bullet("Add vrikaan.com watermark bottom-right on every shot."),
  bullet("Capture all B-roll in a single screen-recording session (~10 min total)."),
  bullet("Music: lo-fi instrumental, drops at 0:32 (Sahil hands off), comes back, drops again at 1:00."),
  bullet("Subtitles burned in (English version + a Hindi auto-translated version)."),
  bullet("Final length: 60–70 seconds."),

  pageBreak(),

  // ── B-ROLL TABLE ──
  h1("B-Roll Shot List"),
  p("Capture once on a desktop. ~10 minutes total. Either Sahil or Ankalesh can record these."),
  blank(120),
  makeTable(
    [2000, 7000],
    ["Time slot", "Footage"],
    [
      ["0:06–0:12", "vrikaan.com homepage scroll on phone"],
      ["0:18–0:26", "News headline + UPI scam SMS + Norton pricing page"],
      ["0:32–0:34", "EN / हिन्दी toggle on the dashboard"],
      ["0:40–0:48", "Vercel dashboard '12 functions' + zoom into tools.js router code"],
      ["0:54–1:00", "TOTP QR + backup codes + GitHub Actions green check + Sentry"],
    ],
  ),

  pageBreak(),

  // ── ON-SCREEN OVERLAYS ──
  h1("On-screen Overlays"),
  bullet([{ t: "Watermark: ", bold: true }, "vrikaan.com — bottom-right, low opacity, every shot."]),
  bullet([{ t: "Lower-thirds: ", bold: true }, "name bars at 0:00 (Sahil) and 0:34 (Ankalesh)."]),
  bullet([{ t: "Stats stinger: ", bold: true }, "0:54–0:58 → 12 functions  ·  33 tests  ·  live in production."]),
  bullet([{ t: "End card: ", bold: true }, "vrikaan.com  ·  github.com/sahilnikam2410/vrikaan  ·  𝕏 in ig gh."]),

  pageBreak(),

  // ── CAPTIONS ──
  h1("Captions to Post"),
  h2("LinkedIn"),
  p("Final-year project showcase — VRIKAAN (vrikaan.com), live in production."),
  p("50+ cybersecurity tools · English + Hindi · INR-native Cashfree payments · custom RFC 6238 TOTP without paid Firebase Identity Platform · 12 serverless functions on Vercel free tier (router pattern absorbs 18 actions) · 33 automated tests · GitHub Actions auto-promote · Sentry telemetry."),
  p("Built by Sahil Anil Nikam (PRN 220105131264) and Ankalesh Dipak Somvanshi (PRN 220105131273), B.E. Computer Science and Engineering, Sandip University Nashik (2025–26)."),
  p("Live: https://vrikaan.com   ·   Source: https://github.com/sahilnikam2410/vrikaan"),
  p("#finalyearproject #cybersecurity #engineering #sandipuniversity #saas #serverless #madeinindia"),

  h2("Instagram Reel"),
  p("Two CSE students from Sandip University Nashik shipped a full SaaS for their final-year project 🚀"),
  p("50+ tools · EN + हिन्दी · vrikaan.com"),
  p("#engineering #cybersecurity #project #sandipuniversity #nashik"),

  h2("X (Twitter)"),
  p("our final-year project at sandip university nashik is live in production."),
  p("50+ cybersecurity tools. EN + हिन्दी. 12 serverless fns. 33 tests."),
  p("two students. zero infra cost. one real product."),
  p("vrikaan.com  ·  github.com/sahilnikam2410/vrikaan"),

  pageBreak(),

  // ── DIRECTOR'S NOTES ──
  h1("Director's Notes"),
  p([
    { t: "1.  Match the look. ", bold: true },
    "Both shoots must use the same aspect ratio, similar lighting direction, and similar framing. If Sahil shoots in portrait 9:16 close-up, Ankalesh must do the same. Any mismatch will make the edit feel cheap.",
  ]),
  p([
    { t: "2.  Sahil's strongest line ", bold: true },
    "is \"Hindi or English. The same product.\" Read it slowly.",
  ]),
  p([
    { t: "3.  Ankalesh's strongest line ", bold: true },
    "is \"Twelve out of twelve. Zero rupees of infrastructure cost.\" Land it.",
  ]),
  p([
    { t: "4.  Closing trio. ", bold: true },
    "\"Two students. One free tier. One real product.\" — best delivered by Ankalesh alone. Read medium-pace, with a half-beat of silence after each line.",
  ]),
];

// ────────────────────────────────────────────────────────────────────
// DOCUMENT
// ────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Sahil Anil Nikam",
  title: "VRIKAAN — Testimonial Video Script",
  description: "Production script for the VRIKAAN final-year-project testimonial video.",

  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
  },

  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [T("VRIKAAN — Testimonial Video Script", { italics: true, size: 18, color: "64748B" })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            T("Sahil Nikam · Ankalesh Somvanshi · Sandip University Nashik", { size: 16, color: "64748B" }),
            T("\tPage ", { size: 16, color: "64748B" }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "64748B" }),
          ],
        })],
      }),
    },
    children,
  }],
});

(async () => {
  const buf = await Packer.toBuffer(doc);
  const out = "E:/SECUVION/scripts/marketing/vrikaan-testimonial-script.docx";
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, "(", buf.length, "bytes )");
})();
