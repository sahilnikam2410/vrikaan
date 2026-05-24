/**
 * VRIKAAN — Black Book Front & Back Cover Generator
 * Produces: vrikaan-blackbook-covers.docx (2 pages: front + back)
 *
 * Run: node scripts/marketing/build-blackbook-covers.cjs
 */
const fs = require("node:fs");
const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, ShadingType,
  PageBreak, HeadingLevel, Table, TableRow, TableCell, WidthType,
} = require("docx");

const FONT = "Times New Roman";
const T = (text, opts = {}) => new TextRun({ text, font: FONT, size: 24, ...opts });
const center = (text, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: opts.after || 120 },
  children: [T(text, { size: opts.size || 24, ...(opts.run || {}) })],
});
const blank = (after = 120) => new Paragraph({ spacing: { after }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// Decorative double-rule paragraph
const rule = (color = "0F172A", size = 12) => new Paragraph({
  spacing: { before: 60, after: 60 },
  border: {
    top:    { style: BorderStyle.DOUBLE, size, color },
    bottom: { style: BorderStyle.DOUBLE, size, color },
  },
  children: [],
});

// ────────────────────────────────────────────────────────────────────
// FRONT PAGE (page 1)
// ────────────────────────────────────────────────────────────────────
const frontPage = [
  // Top decorative band
  new Paragraph({
    spacing: { before: 0, after: 80 },
    border: { bottom: { style: BorderStyle.DOUBLE, size: 18, color: "0F172A" } },
    children: [],
  }),

  // College banner
  center("SANDIP UNIVERSITY, NASHIK", { size: 28, run: { bold: true, color: "0F172A" } }),
  center("School of Computer Sciences and Engineering", { size: 22, run: { italics: true } }),
  center("Department of Computer Science and Engineering", { size: 22, run: { italics: true } }),

  rule("0891B2", 12),

  blank(280),

  // Project type tag
  center("FINAL-YEAR PROJECT REPORT", { size: 18, run: { bold: true, color: "475569", characterSpacing: 6 } }),
  blank(360),

  // Big title
  center("VRIKAAN", { size: 96, run: { bold: true, color: "0F172A" } }),
  blank(120),

  // Tagline
  center("AI-Powered Cybersecurity", { size: 28, run: { italics: true, color: "0891B2" } }),
  center("Assistance and Monitoring Platform", { size: 28, run: { italics: true, color: "0891B2" } }),

  blank(200),

  // Live URL pill
  center("● LIVE  vrikaan.com  ●", { size: 16, run: { bold: true, color: "0891B2" } }),

  blank(420),

  // Submitted-to block
  center("A Project Report submitted to", { size: 20, run: { italics: true } }),
  center("SANDIP UNIVERSITY, NASHIK", { size: 22, run: { bold: true } }),
  blank(80),
  center("In partial fulfillment of the requirements for the award of", { size: 18 }),
  center("Bachelor of Engineering", { size: 24, run: { bold: true } }),
  center("in Computer Science and Engineering", { size: 22 }),

  blank(360),

  // Submitted-by header
  center("Submitted by", { size: 20, run: { italics: true, color: "475569" } }),
  blank(80),

  // Three-member team table
  new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4500, 4500],
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4500, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Mr. Sahil Anil Nikam", { size: 22, bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("PRN: 220105131264", { size: 18, color: "475569" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Project Leader & SOC Analyst Developer", { size: 16, italics: true, color: "0891B2" })] }),
            ],
          }),
          new TableCell({
            width: { size: 4500, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Mr. Ankalesh Dipak Somvanshi", { size: 22, bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("PRN: 220105131273", { size: 18, color: "475569" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Helping Developer", { size: 16, italics: true, color: "0891B2" })] }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9000, type: WidthType.DXA },
            columnSpan: 2,
            margins: { top: 120, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Mr. Durgesh Prakash More", { size: 22, bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("PRN: ___________________", { size: 18, color: "475569" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [T("Documentation & Project Information", { size: 16, italics: true, color: "0891B2" })] }),
            ],
          }),
        ],
      }),
    ],
  }),

  blank(280),

  // Guide block
  center("Under the Guidance of", { size: 20, run: { italics: true, color: "475569" } }),
  blank(80),
  center("Dr. Anand Singh Rajawat", { size: 26, run: { bold: true } }),
  center("Assistant Professor, Department of Computer Science and Engineering", { size: 18 }),

  blank(360),

  // Year
  center("ACADEMIC YEAR  •  2025–26", { size: 22, run: { bold: true, characterSpacing: 6 } }),

  blank(120),

  // Bottom decorative band
  rule("0891B2", 12),
  rule("0F172A", 18),

  pageBreak(),
];

// ────────────────────────────────────────────────────────────────────
// BACK PAGE (page 2)
// ────────────────────────────────────────────────────────────────────
const backPage = [
  // Top band
  rule("0F172A", 18),
  rule("0891B2", 12),
  blank(360),

  // VRIKAAN brand
  center("VRIKAAN", { size: 64, run: { bold: true, color: "0F172A" } }),
  center("AI-Powered Cybersecurity Assistance and Monitoring Platform", { size: 18, run: { italics: true, color: "475569" } }),

  blank(360),

  // Project blurb (2-3 lines)
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 320 },
    indent: { left: 720, right: 720 },
    children: [
      T("VRIKAAN is a production-deployed cybersecurity SaaS platform offering 50+ tools, bilingual (English + Hindi) UI, INR-native Cashfree payments, and custom RFC 6238 TOTP two-factor authentication — all running on free-tier infrastructure. Built by three students of Sandip University, Nashik, during the academic year 2025–26.", { size: 20, italics: true }),
    ],
  }),

  blank(280),

  // Project Team header
  center("PROJECT TEAM", { size: 22, run: { bold: true, color: "0891B2", characterSpacing: 6 } }),
  blank(160),

  // Three-member detail table
  new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [3000, 6000],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
    },
    rows: [
      // Row 1 — Sahil
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: "0F172A" },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Project Leader", { size: 18, bold: true, color: "FFFFFF" })] }),
              new Paragraph({ children: [T("& SOC Analyst Developer", { size: 14, italics: true, color: "BAE6FD" })] }),
            ],
          }),
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Sahil Anil Nikam", { size: 22, bold: true })] }),
              new Paragraph({ children: [T("PRN: 220105131264", { size: 16, color: "475569" })] }),
              new Paragraph({ children: [T("Lead architect, frontend, backend router pattern, Firebase rules, Cashfree integration, two-factor authentication, GitHub Actions CI/CD, Sentry telemetry, deployment.", { size: 16 })] }),
            ],
          }),
        ],
      }),
      // Row 2 — Ankalesh
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: "0891B2" },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Helping", { size: 18, bold: true, color: "FFFFFF" })] }),
              new Paragraph({ children: [T("Developer", { size: 18, bold: true, color: "FFFFFF" })] }),
            ],
          }),
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Ankalesh Dipak Somvanshi", { size: 22, bold: true })] }),
              new Paragraph({ children: [T("PRN: 220105131273", { size: 16, color: "475569" })] }),
              new Paragraph({ children: [T("UI design support, content writing, phishing trainer dataset, internationalisation translations (English + Hindi), testing assistance.", { size: 16 })] }),
            ],
          }),
        ],
      }),
      // Row 3 — Durgesh
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: "6366F1" },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Documentation", { size: 18, bold: true, color: "FFFFFF" })] }),
              new Paragraph({ children: [T("& Project Info", { size: 14, italics: true, color: "E0E7FF" })] }),
            ],
          }),
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ children: [T("Durgesh Prakash More", { size: 22, bold: true })] }),
              new Paragraph({ children: [T("PRN: ___________________", { size: 16, color: "475569" })] }),
              new Paragraph({ children: [T("Project documentation, black book preparation, technical-information compilation, viva preparation materials, presentation decks.", { size: 16 })] }),
            ],
          }),
        ],
      }),
    ],
  }),

  blank(280),

  // Guide credit
  center("Project Guide", { size: 16, run: { italics: true, color: "475569" } }),
  blank(40),
  center("Dr. Anand Singh Rajawat", { size: 20, run: { bold: true } }),
  center("Assistant Professor · Department of Computer Science and Engineering", { size: 16, run: { color: "475569" } }),

  blank(280),

  // Connect block
  center("CONNECT", { size: 18, run: { bold: true, color: "0891B2", characterSpacing: 6 } }),
  blank(80),
  center("🌐  vrikaan.com", { size: 22, run: { bold: true, color: "0891B2" } }),
  center("📦  github.com/sahilnikam2410/vrikaan", { size: 18, run: { color: "475569" } }),
  blank(80),
  center("𝕏 @vrikaan   ·   in vrikaan-ai-cybersecurity", { size: 16, run: { color: "475569" } }),
  center("ig @vrikaan_official   ·   contact: hello.vrikaan@gmail.com", { size: 16, run: { color: "475569" } }),

  blank(280),

  // College footer
  center("SANDIP UNIVERSITY, NASHIK  •  ACADEMIC YEAR 2025–26", { size: 16, run: { bold: true, color: "0F172A", characterSpacing: 4 } }),

  blank(120),

  // Bottom band
  rule("0891B2", 12),
  rule("0F172A", 18),
];

// ────────────────────────────────────────────────────────────────────
// DOCUMENT
// ────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Sahil Anil Nikam",
  title: "VRIKAAN — Black Book Covers",
  description: "Front and back cover pages for the VRIKAAN final-year project black book.",

  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter (close to A4 for binding)
        margin: { top: 720, right: 720, bottom: 720, left: 720 },
      },
    },
    children: [...frontPage, ...backPage],
  }],
});

(async () => {
  const buf = await Packer.toBuffer(doc);
  const out = "E:/SECUVION/scripts/marketing/vrikaan-blackbook-covers.docx";
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, "(", buf.length, "bytes )");
})();
