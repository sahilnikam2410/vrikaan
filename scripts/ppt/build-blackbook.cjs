/**
 * VRIKAAN — Final-Year Project Black Book Generator
 * Mirrors Sandip University Nashik report format (~68-70 pages).
 *
 * Output: E:/SECUVION/vrikaan-blackbook.docx (with fallback path on EBUSY)
 * Run: node scripts/ppt/build-blackbook.cjs
 */
const fs = require("node:fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  ExternalHyperlink, TabStopType, TabStopPosition, NumberFormat,
} = require("docx");

// ─── Style constants ────────────────────────────────────────────────
const FONT_BODY = "Times New Roman";
const FONT_MONO = "Consolas";

// ─── Paragraph helpers ──────────────────────────────────────────────
const T = (text, opts = {}) => new TextRun({ text, font: FONT_BODY, size: 24, ...opts });
const Tm = (text, opts = {}) => new TextRun({ text, font: FONT_MONO, size: 20, ...opts });

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 320 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.firstLine ? { firstLine: 360 } : undefined,
    children: typeof text === "string"
      ? [T(text, opts.run || {})]
      : text.map(part => typeof part === "string" ? T(part) : T(part.t, part)),
    ...opts.para,
  });
}

const center = (text, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: opts.after || 120 },
  children: [T(text, { size: opts.size || 24, ...(opts.run || {}) })],
});

const blank = (after = 120) => new Paragraph({ spacing: { after }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function chapterHeader(num, name) {
  return [
    pageBreak(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [T(`Chapter ${num}`, { size: 32, bold: true })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [T(name, { size: 36, bold: true })],
    }),
  ];
}

function h2(num, text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [T(`${num} ${text}`, { size: 26, bold: true })],
  });
}
function h3(num, text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [T(`${num} ${text}`, { size: 24, bold: true, italics: true })],
  });
}

function bullet(text, lvl = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level: lvl },
    spacing: { after: 80, line: 320 },
    children: typeof text === "string" ? [T(text)] : text.map(part =>
      typeof part === "string" ? T(part) : T(part.t, part)),
  });
}

function numbered(text, lvl = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level: lvl },
    spacing: { after: 80, line: 320 },
    children: [T(text)],
  });
}

// ─── Table helpers ──────────────────────────────────────────────────
function tableHeader(text) {
  return new TableCell({
    width: { size: 1, type: WidthType.AUTO },
    shading: { type: ShadingType.CLEAR, fill: "1E3A8A" },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [T(text, { size: 22, bold: true, color: "FFFFFF" })],
    })],
  });
}
function tableCell(text, opts = {}) {
  return new TableCell({
    width: { size: 1, type: WidthType.AUTO },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [T(text, { size: 22, bold: !!opts.bold })],
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
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => buildCell(tableHeader, i, h)),
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => buildCell(tableCell, ci,
          typeof cell === "string" ? cell : cell.t,
          { fill: ri % 2 === 1 ? "F1F5F9" : undefined, ...(typeof cell === "object" ? cell : {}) }
        )),
      })),
    ],
  });
}

// ─── Code block ─────────────────────────────────────────────────────
function codeBlock(lines) {
  return new Paragraph({
    spacing: { before: 120, after: 160, line: 280 },
    alignment: AlignmentType.LEFT,
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    children: lines.flatMap((ln, i) => {
      const runs = [Tm(ln)];
      if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
      return runs;
    }),
  });
}

// ────────────────────────────────────────────────────────────────────
// SECTION 1 — TITLE PAGE
// ────────────────────────────────────────────────────────────────────
const titleSection = {
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1080, right: 1080, bottom: 1080, left: 1440 },
    },
  },
  children: [
    blank(360),
    center("VRIKAAN", { size: 48, run: { bold: true } }),
    center("(AI-Powered Cybersecurity Assistance and Monitoring Platform)", { size: 26, run: { italics: true } }),
    blank(400),
    center("A", { size: 28 }),
    center("Project Report submitted to Sandip University Nashik", { size: 28, run: { bold: true } }),
    blank(280),
    center("In partial fulfillment for the award of the Degree of Bachelor of Engineering in", { size: 24 }),
    center("Computer Science and Engineering", { size: 28, run: { bold: true } }),
    blank(360),
    center("Submitted by", { size: 26, run: { italics: true } }),
    blank(120),
    center("Mr. Sahil Anil Nikam   —   220105131264", { size: 26, run: { bold: true } }),
    center("Mr. Ankalesh Dipak Somvanshi   —   220105131273", { size: 26, run: { bold: true } }),
    blank(360),
    center("Under the Guidance of", { size: 26, run: { italics: true } }),
    blank(120),
    center("Dr. Anand Singh Rajawat", { size: 28, run: { bold: true } }),
    center("Assistant Professor, Department of Computer Science and Engineering", { size: 22 }),
    blank(480),
    center("Academic Year: 2025-26", { size: 28, run: { bold: true } }),
    blank(480),
    center("Department of Computer Science and Engineering", { size: 24, run: { bold: true } }),
    center("School of Computer Sciences and Engineering", { size: 24 }),
    center("SANDIP UNIVERSITY, NASHIK", { size: 28, run: { bold: true } }),
  ],
};

// ────────────────────────────────────────────────────────────────────
// SECTION 2 — PRELIMINARIES (Roman numerals)
// ────────────────────────────────────────────────────────────────────
const prelimChildren = [];

// DECLARATION
prelimChildren.push(
  center("DECLARATION", { size: 36, run: { bold: true } }),
  blank(280),
  p([
    "We hereby declare that the project report entitled ",
    { t: "“VRIKAAN — AI-Powered Cybersecurity Assistance and Monitoring Platform” ", bold: true, italics: true },
    "submitted to Sandip University Nashik in partial fulfillment of the requirements for the award of the Degree of Bachelor of Engineering in Computer Science and Engineering is a record of original work carried out by us under the guidance of Dr. Anand Singh Rajawat, Assistant Professor, Department of Computer Science and Engineering, Sandip University Nashik.",
  ]),
  p("We further declare that the work presented in this project report has not been submitted previously, either fully or partially, to any other university or institution for the award of any degree, diploma, or certification."),
  p("The information and references used in this report are acknowledged appropriately wherever applicable. This project work has been completed during the academic year 2025–26 in accordance with the academic guidelines and ethical standards prescribed by Sandip University Nashik."),
  blank(280),
  p("Place: Nashik"),
  p("Date: ___________________"),
  blank(420),
  p([{ t: "_____________________________", bold: true }]),
  p([{ t: "Mr. Sahil Anil Nikam", bold: true }]),
  p("PRN No.: 220105131264"),
  blank(280),
  p([{ t: "_____________________________", bold: true }]),
  p([{ t: "Mr. Ankalesh Dipak Somvanshi", bold: true }]),
  p("PRN No.: 220105131273"),
  pageBreak(),
);

// CERTIFICATE
prelimChildren.push(
  center("Sandip University Nashik", { size: 26, run: { bold: true } }),
  center("School of Computer Sciences and Engineering", { size: 22 }),
  center("Department of Computer Science and Engineering", { size: 22 }),
  center("(2025-26)", { size: 22, run: { italics: true } }),
  blank(320),
  center("CERTIFICATE", { size: 36, run: { bold: true } }),
  blank(280),
  p([
    "This is to certify that ",
    { t: "Mr. Sahil Anil Nikam", bold: true },
    " (PRN: 220105131264) and ",
    { t: "Mr. Ankalesh Dipak Somvanshi", bold: true },
    " (PRN: 220105131273) have successfully completed the project entitled ",
    { t: "“VRIKAAN: AI-Powered Cybersecurity Assistance and Monitoring Platform”", italics: true, bold: true },
    ", under my guidance in partial fulfillment of the requirements for the degree of Bachelor of Engineering in Computer Science and Engineering under Sandip University Nashik during the academic year 2025-26.",
  ]),
  blank(280),
  p("Date: ___/___/2026"),
  p("Place: Nashik"),
  blank(560),
  p([{ t: "_____________________________", bold: true }]),
  p([{ t: "Dr. Anand Singh Rajawat", bold: true }]),
  p("Project Guide"),
  blank(360),
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    children: [
      T("_____________________________", { bold: true }),
      T("\t_____________________________", { bold: true }),
    ],
  }),
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    children: [
      T("Head, Department of CSE", { bold: true }),
      T("\tDean", { bold: true }),
    ],
  }),
  blank(280),
  p([{ t: "Examiner: ____________________________________________", bold: true }]),
  pageBreak(),
);

// ACKNOWLEDGEMENT
prelimChildren.push(
  center("ACKNOWLEDGEMENT", { size: 36, run: { bold: true } }),
  blank(280),
  p([
    "We take this opportunity to express our sincere gratitude and heartfelt thanks to our respected guide ",
    { t: "Dr. Anand Singh Rajawat", bold: true },
    ", Assistant Professor, Department of Computer Science and Engineering, Sandip University, Nashik, for his valuable guidance, constant encouragement, and continuous support throughout the successful completion of our project titled ",
    { t: "“VRIKAAN: AI-Powered Cybersecurity Assistance and Monitoring Platform.” ", italics: true },
    "His technical knowledge, insightful suggestions, and constructive feedback helped us in shaping the project in a systematic and meaningful manner. His motivation and guidance at every stage played a vital role in completing this project successfully.",
  ], { firstLine: true }),
  p([
    "We are also thankful to ",
    { t: "Prof. Umesh Pawar", bold: true },
    ", Head of the Department of Computer Science and Engineering, for providing the necessary facilities, resources, and a motivating academic environment to carry out this work effectively. His support and encouragement helped us maintain discipline and focus during the development and documentation of this project.",
  ], { firstLine: true }),
  p([
    "We express our sincere thanks to ",
    { t: "Dr. Pawan Bhaladhare", bold: true },
    ", Dean, School of Computer Sciences and Engineering, for his vision, leadership, and continuous backing of student-driven research and development initiatives at Sandip University Nashik.",
  ], { firstLine: true }),
  p("We extend our gratitude to all the faculty members of the Department of Computer Science and Engineering for their valuable inputs during seminar reviews, internal evaluations, and informal technical discussions. Their constructive criticism helped us refine the architecture, scope, and presentation of the project.", { firstLine: true }),
  p("We sincerely thank our parents and family members for their unconditional love, patience, and emotional support throughout our undergraduate journey. We also thank our classmates and friends who participated in user testing of the platform, reported bugs, and contributed honest feedback that improved the final product.", { firstLine: true }),
  p("Lastly, we acknowledge the open-source community whose libraries — React, Vite, Firebase client SDKs, otpauth, react-i18next, vitest, and many others — made it possible for two undergraduate students to ship a production-grade SaaS within a single academic year.", { firstLine: true }),
  blank(360),
  p([
    { t: "Mr. Sahil Anil Nikam   ", bold: true },
    "(PRN: 220105131264)",
  ], { align: AlignmentType.RIGHT }),
  p([
    { t: "Mr. Ankalesh Dipak Somvanshi   ", bold: true },
    "(PRN: 220105131273)",
  ], { align: AlignmentType.RIGHT }),
  pageBreak(),
);

// ABSTRACT
prelimChildren.push(
  center("ABSTRACT", { size: 36, run: { bold: true } }),
  blank(280),
  p("Cyber threats such as phishing, malware infections, credential theft, brute-force attacks, and social engineering are increasing rapidly due to the growth of online services and digital transactions. Although people hear these terms frequently, many students and beginners still lack a structured way to understand how these attacks work and how they can protect themselves in real life. At the same time, the tools used in industries — such as Security Operations Center (SOC) dashboards and Security Information and Event Management (SIEM) platforms — are powerful but often too complex, expensive, and not beginner-friendly. This creates a measurable gap between cybersecurity learning and practical exposure.", { firstLine: true }),
  p([
    "To address this gap, the proposed project ",
    { t: "VRIKAAN ", bold: true, italics: true },
    "is developed as a premium web-based cybersecurity assistance and monitoring platform with an integrated AI chatbot assistant. The system provides secure authentication and role-based access control to ensure that administrative features are accessible only to authorized users. The admin dashboard is designed with a modern SOC-inspired user interface and includes structured modules such as live threat monitoring, user and access management, payment audit, broadcast notifications, and a complete audit log. These modules are complemented by over fifty consumer-facing tools — DNS leak test, breach lookup, password vault, phishing trainer, dark-web monitor, identity x-ray, file hash scanner, fraud analyzer, bulk URL scanner, and more — all unified under one bilingual (English + Hindi) responsive interface.",
  ], { firstLine: true }),
  p("The platform is built on a modern serverless architecture using React 19 and Vite 7 on the client side, twelve Vercel serverless functions on the API tier (with a custom router pattern that hosts eighteen logical actions inside the hobby-tier function limit), and Firebase (Authentication and Cloud Firestore) for identity and persistent data. Indian Rupee payment processing is integrated via Cashfree, supporting UPI, cards, and net-banking. Two-factor authentication is implemented as a custom RFC 6238 TOTP flow using the otpauth library, achieving NIST AAL2 protection without requiring the paid Firebase Identity Platform. Outbound webhooks are signed with HMAC-SHA256 for receiver verification.", { firstLine: true }),
  p([
    "The platform is currently deployed in production at ",
    { t: "https://vrikaan.com", bold: true },
    " and has been continuously available throughout the development sprint. Quantitative metrics include eighteen major features shipped, thirty-three automated tests passing, and a sub-two-minute production build, all delivered within free-tier infrastructure constraints.",
  ], { firstLine: true }),
  pageBreak(),
);

// TABLE OF CONTENTS (manual — IEEE/Sandip style)
prelimChildren.push(
  center("TABLE OF CONTENTS", { size: 36, run: { bold: true } }),
  blank(160),
);

const tocEntries = [
  ["Acknowledgement", "iv"],
  ["Abstract", "v"],
  ["Table of Contents", "vi-viii"],
  ["List of Figures", "ix"],
  ["List of Tables", "x"],
  ["Chapter 1: Introduction", "1-3"],
  ["    1.1 Overview", ""],
  ["    1.2 Brief Description of the Project", ""],
  ["    1.3 Problem Statement", ""],
  ["    1.4 Objectives of the Project", ""],
  ["    1.5 Scope of the Project", ""],
  ["    1.6 Motivation", ""],
  ["    1.7 Organization of the Report", ""],
  ["Chapter 2: Literature Survey", "4-6"],
  ["    2.1 Introduction", ""],
  ["    2.2 Security Operations Centers (SOC) and SIEM Platforms", ""],
  ["    2.3 AI in Cybersecurity", ""],
  ["    2.4 Phishing Awareness and Detection", ""],
  ["    2.5 Password Security and Breach Databases", ""],
  ["    2.6 Web-Based Cybersecurity Dashboards", ""],
  ["    2.7 Bilingual and Localized Software in India", ""],
  ["    2.8 Summary of Literature Survey", ""],
  ["Chapter 3: Software Requirements Specification (SRS)", "7-15"],
  ["    3.1 Introduction", ""],
  ["    3.2 Purpose of the System", ""],
  ["    3.3 Overall Description", ""],
  ["    3.4 Functional Requirements", ""],
  ["    3.5 Non-Functional Requirements", ""],
  ["    3.6 Hardware Requirements", ""],
  ["    3.7 Software Requirements", ""],
  ["    3.8 System Constraints and Assumptions", ""],
  ["Chapter 4: System Design", "16-22"],
  ["    4.1 System Architecture (Client / API / Data tiers)", ""],
  ["    4.2 Use Case Diagram", ""],
  ["    4.3 Data Flow Diagram (Level 0 and Level 1)", ""],
  ["    4.4 Sequence Diagram (TOTP Enrollment)", ""],
  ["    4.5 Component Diagram", ""],
  ["    4.6 Firestore Data Model", ""],
  ["Chapter 5: Technical Specifications", "23-26"],
  ["    5.1 Technology Stack Overview", ""],
  ["    5.2 Frontend Specifications", ""],
  ["    5.3 Backend Specifications", ""],
  ["    5.4 Security Specifications", ""],
  ["    5.5 Tools and Libraries Used", ""],
  ["Chapter 6: Project Estimate, Schedule and Team Structure", "27-31"],
  ["    6.1 Introduction", ""],
  ["    6.2 Project Planning and Estimation", ""],
  ["    6.3 Expected Schedule (Sem I & Sem II)", ""],
  ["    6.4 Actual Schedule (Work Completed)", ""],
  ["    6.5 Milestone Table (Expected vs Actual)", ""],
  ["    6.6 Team Structure", ""],
  ["    6.7 Roles and Responsibilities", ""],
  ["    6.8 Summary", ""],
  ["Chapter 7: Software Implementation", "32-41"],
  ["    7.1 Introduction", ""],
  ["    7.2 Frontend Implementation", ""],
  ["    7.3 Backend Implementation (Router Pattern)", ""],
  ["    7.4 Firestore Schema and Security Rules", ""],
  ["    7.5 Important Modules", ""],
  ["    7.6 Business Logic and Architecture", ""],
  ["    7.7 Advantages and Disadvantages", ""],
  ["    7.8 Applications", ""],
  ["    7.9 Summary", ""],
  ["Chapter 8: Software Testing", "42-46"],
  ["    8.1 Introduction", ""],
  ["    8.2 Testing Strategy", ""],
  ["    8.3 Types of Testing Performed", ""],
  ["    8.4 Test Cases", ""],
  ["    8.5 Testing Summary", ""],
  ["Chapter 9: Results and Discussion", "47-50"],
  ["    9.1 Introduction", ""],
  ["    9.2 Output Screens and Modules", ""],
  ["    9.3 Objective-wise Discussion", ""],
  ["    9.4 Performance and Responsiveness", ""],
  ["    9.5 Limitations", ""],
  ["    9.6 Summary", ""],
  ["Chapter 10: Deployment and Maintenance", "51-53"],
  ["    10.1 Introduction", ""],
  ["    10.2 Deployment Environment (Vercel + Firebase)", ""],
  ["    10.3 CI/CD Pipeline (GitHub Actions Auto-Promote)", ""],
  ["    10.4 Maintenance and Observability (Sentry)", ""],
  ["    10.5 User Help", ""],
  ["    10.6 Summary", ""],
  ["Chapter 11: Conclusion and Future Scope", "54-55"],
  ["    11.1 Conclusion", ""],
  ["    11.2 Future Scope", ""],
  ["    11.3 Final Summary", ""],
  ["References", "56"],
  ["Appendix A: Publications", "57"],
  ["Appendix B: Glossary", "58"],
];
tocEntries.forEach(([t, page]) => {
  prelimChildren.push(new Paragraph({
    spacing: { after: 60, line: 280 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9000, leader: "dot" }],
    children: [
      T(t, { bold: t.startsWith("Chapter") || ["Acknowledgement", "Abstract", "Table of Contents", "List of Figures", "List of Tables", "References", "Appendix A: Publications", "Appendix B: Glossary"].includes(t) }),
      T(`\t${page}`, { bold: !!page }),
    ],
  }));
});
prelimChildren.push(pageBreak());

// LIST OF FIGURES
prelimChildren.push(
  center("LIST OF FIGURES", { size: 36, run: { bold: true } }),
  blank(280),
);
const figures = [
  ["I.", "Three-Tier System Architecture of VRIKAAN", "16"],
  ["II.", "Use Case Diagram", "17"],
  ["III.", "Level 0 Data Flow Diagram", "18"],
  ["IV.", "Level 1 Data Flow Diagram (Authentication + Tools)", "19"],
  ["V.", "Sequence Diagram for TOTP Enrollment Flow", "20"],
  ["VI.", "Component Diagram of Frontend Modules", "21"],
  ["VII.", "Firestore Hierarchical Collection Tree", "22"],
  ["VIII.", "Admin Dashboard — Live Stats Layout", "33"],
  ["IX.", "User Dashboard — Account Tab with 2FA Card", "34"],
  ["X.", "DNS & WebRTC Leak Test — Result View", "35"],
  ["XI.", "Pricing Page with Coupon Field", "36"],
  ["XII.", "Team Page — Members and Pending Invites", "37"],
  ["XIII.", "GitHub Actions Auto-Promote Workflow Run", "52"],
];
figures.forEach(([num, name, page]) => {
  prelimChildren.push(new Paragraph({
    spacing: { after: 80, line: 300 },
    tabStops: [
      { type: TabStopType.LEFT, position: 600 },
      { type: TabStopType.RIGHT, position: 9000, leader: "dot" },
    ],
    children: [T(num, { bold: true }), T(`\t${name}`), T(`\t${page}`)],
  }));
});
prelimChildren.push(pageBreak());

// LIST OF TABLES
prelimChildren.push(
  center("LIST OF TABLES", { size: 36, run: { bold: true } }),
  blank(280),
);
const tablesList = [
  ["I.", "Comparative Survey of Consumer Cybersecurity Solutions", "5"],
  ["II.", "Functional Requirements of VRIKAAN", "9-10"],
  ["III.", "Non-Functional Requirements of VRIKAAN", "11-12"],
  ["IV.", "Hardware Requirements", "13"],
  ["V.", "Software / Tools Used for Implementation", "14-15"],
  ["VI.", "Technology Stack Used in VRIKAAN", "23-24"],
  ["VII.", "Firestore Collection Schema Summary", "22"],
  ["VIII.", "Project Milestone Table (Expected vs Actual)", "29-30"],
  ["IX.", "Team Structure and Roles", "31"],
  ["X.", "Test Cases for Login, Tools and Webhooks", "44-46"],
  ["XI.", "Engineering Metrics — Build / Tests / Functions", "48"],
  ["XII.", "Future Enhancements and Roadmap", "55"],
];
tablesList.forEach(([num, name, page]) => {
  prelimChildren.push(new Paragraph({
    spacing: { after: 80, line: 300 },
    tabStops: [
      { type: TabStopType.LEFT, position: 600 },
      { type: TabStopType.RIGHT, position: 9000, leader: "dot" },
    ],
    children: [T(num, { bold: true }), T(`\t${name}`), T(`\t${page}`)],
  }));
});

// ────────────────────────────────────────────────────────────────────
// SECTION 3 — MAIN BODY (Arabic numerals start)
// ────────────────────────────────────────────────────────────────────
const bodyChildren = [];

// CHAPTER 1 — INTRODUCTION
bodyChildren.push(
  ...chapterHeader(1, "Introduction"),
  h2("1.1", "Overview"),
  p("Cybersecurity has become one of the most important requirements in today's digital world. As more services move online — banking, education, government, e-commerce — both individuals and organisations face increasing risks from cyber threats such as phishing, malware, credential theft, ransomware, and unauthorised account access. Many students and beginners understand the term “cybersecurity” at a surface level, but they often lack a structured platform where they can learn the underlying concepts and observe how cybersecurity monitoring works in real-world systems.", { firstLine: true }),
  p([
    { t: "VRIKAAN ", bold: true },
    "is developed as a web-based cybersecurity assistance and monitoring platform. The main purpose of this project is to provide a premium dashboard interface together with an AI assistant chatbot that helps users understand cybersecurity concepts in a practical, beginner-friendly way. The system is designed to demonstrate the key responsibilities of a Security Operations Center (SOC) — monitoring, incident reporting, and access control — while also offering more than fifty individually accessible cybersecurity tools that users can run on their own devices, networks, and accounts.",
  ], { firstLine: true }),

  h2("1.2", "Brief Description of the Project"),
  p("VRIKAAN is a full-stack progressive web application (PWA) consisting of three major surfaces:", { firstLine: true }),
  numbered("Public-facing tool surface — over fifty consumer cybersecurity tools (DNS leak test, IP lookup, breach lookup, password vault, phishing trainer, dark-web monitor, file-hash scanner, QR scanner, identity x-ray, vulnerability scanner, etc.). All tools are usable without sign-up, with rate-limits enforced per IP."),
  numbered("Authenticated user dashboard — security score, registered devices, payment history, tool history, activity log, two-factor authentication enrollment, outbound webhook configuration, push-notification settings, and a multi-user team workspace."),
  numbered("Admin console — gated by step-up authentication and visible only to whitelisted email addresses. Provides live user statistics, payment audit, broadcast notifications, and an immutable audit log."),
  p("The product is bilingual (English and Hindi) by default, with a language switcher in the navigation bar. Indian Rupee (INR) payments are processed natively through the Cashfree payment aggregator, supporting UPI, debit and credit cards, and net-banking — without redirecting Indian users through foreign payment gateways.", { firstLine: true }),

  h2("1.3", "Problem Statement"),
  p("The Indian Cyber Crime Coordination Centre (I4C) has reported financial losses attributed to cybercrime in India exceeding ₹11,000 crore in the year 2024 alone, with year-over-year growth of more than 70%. Despite this scale, the consumer cybersecurity software market remains structurally misaligned with the Indian context. The gaps include:", { firstLine: true }),
  bullet("Foreign-priced suites — Norton, McAfee, Bitdefender are typically priced between ₹2,000 and ₹4,500 per year, beyond what the average student or first-generation digital user is willing to spend."),
  bullet("Single-purpose tools — products like 1Password (passwords) or NordVPN (VPN) require multiple separate subscriptions to cover even basic defensive needs."),
  bullet("English-only interfaces — none of the existing consumer suites offer Hindi or other Indian languages."),
  bullet("Reactive rather than proactive — most tools alert only after a breach has already occurred and lack real-time leak / fingerprint / DNS visibility."),
  bullet("Opaque results — most tools produce a verdict without explaining the reasoning, leaving non-technical users unable to learn from the experience."),
  bullet("Absence of a unified beginner-friendly platform that combines learning, monitoring, and practical tools in one interface."),
  p("VRIKAAN addresses each of these gaps simultaneously rather than offering a one-feature replacement.", { firstLine: true }),

  h2("1.4", "Objectives of the Project"),
  p("The project aims to achieve the following measurable objectives:", { firstLine: true }),
  numbered("To unify over fifty consumer-facing cybersecurity tools under a single bilingual dashboard."),
  numbered("To provide an AI assistant chatbot that explains cybersecurity concepts and threat results in plain English and Hindi."),
  numbered("To implement secure authentication including OAuth (Google, GitHub, Facebook), phone OTP, magic-link sign-in, and a custom RFC 6238 TOTP-based two-factor authentication flow."),
  numbered("To demonstrate SOC-style monitoring concepts — live user stats, audit logs, broadcast notifications — through an admin console gated by step-up authentication."),
  numbered("To deliver INR-native payment processing via Cashfree and a self-serve refund pipeline enforced server-side within a seven-day window."),
  numbered("To design a modular, serverless architecture (Vercel + Firebase) that scales automatically, costs zero at the free tier, and requires no operational maintenance from the developer."),
  numbered("To produce a production-grade engineering pipeline including thirty-three automated tests, GitHub-Actions auto-promotion, Sentry telemetry, and weekly Firestore activity-log cleanup."),

  h2("1.5", "Scope of the Project"),
  p("The current scope of VRIKAAN covers the complete consumer-facing tool set, the authenticated user dashboard, the admin console, INR payment processing, two-factor authentication, magic-link sign-in, multi-user team accounts, outbound webhooks, and bilingual UI. Out of scope (and listed under future work in Chapter 11) are: a native mobile application, machine-learning-based threat scoring trained on user-reported scams, full Marathi and Tamil translations, enterprise-grade SSO/SCIM integration, and direct ingestion of OSINT threat-intelligence feeds.", { firstLine: true }),

  h2("1.6", "Motivation"),
  p("The motivation for building VRIKAAN comes from a recognition that cybersecurity in India is presently mediated by a small number of expensive foreign products that do not serve the average Indian student or small-business owner. The rise of UPI, the JAM (Jan Dhan – Aadhaar – Mobile) trinity, and rapidly increasing smartphone penetration have placed millions of first-generation digital users on the Internet, with neither the financial means nor the linguistic accessibility to defend themselves against scams that target them daily. By delivering a free tier, INR-native pricing, bilingual UI, and explanation-rich tool results, VRIKAAN aims to be the cybersecurity defaults that an Indian student should know about before opening their first net-banking account.", { firstLine: true }),

  h2("1.7", "Organization of the Report"),
  p("This project report is organised into eleven chapters as follows.", { firstLine: true }),
  bullet([{ t: "Chapter 1 ", bold: true }, "introduces the project, the problem, the objectives, and the scope."]),
  bullet([{ t: "Chapter 2 ", bold: true }, "presents a literature survey covering existing SOC/SIEM tools, AI in cybersecurity, phishing detection, and bilingual software in the Indian context."]),
  bullet([{ t: "Chapter 3 ", bold: true }, "documents the Software Requirements Specification — functional, non-functional, hardware, and software requirements."]),
  bullet([{ t: "Chapter 4 ", bold: true }, "describes the system design with architecture, use-case, data-flow, sequence, and component diagrams."]),
  bullet([{ t: "Chapter 5 ", bold: true }, "covers the technical specifications and the chosen technology stack."]),
  bullet([{ t: "Chapter 6 ", bold: true }, "presents the project estimate, schedule, and team structure."]),
  bullet([{ t: "Chapter 7 ", bold: true }, "details the software implementation, including the router pattern that fits eighteen actions inside the Vercel hobby-tier limit."]),
  bullet([{ t: "Chapter 8 ", bold: true }, "describes the testing strategy and the test cases executed."]),
  bullet([{ t: "Chapter 9 ", bold: true }, "presents the results, discussion, and observed limitations."]),
  bullet([{ t: "Chapter 10 ", bold: true }, "covers deployment and maintenance procedures."]),
  bullet([{ t: "Chapter 11 ", bold: true }, "concludes the report and outlines future scope."]),
);

// CHAPTER 2 — LITERATURE SURVEY
bodyChildren.push(
  ...chapterHeader(2, "Literature Survey"),
  h2("2.1", "Introduction"),
  p("Cybersecurity has become a critical area of research and development due to the increasing number of cyber-attacks on individuals, businesses, and government systems. Organisations today rely heavily on monitoring tools, security frameworks, and awareness programs to detect threats, respond to incidents, and prevent data breaches. Literature in this domain covers SIEM systems, threat intelligence, phishing detection, malware analysis, incident response, password security, and security-awareness training. This chapter surveys existing tools and approaches that are relevant to the objectives of the VRIKAAN project, with a focus on systems that support security monitoring, beginner-friendly cybersecurity guidance, and Indian-context delivery.", { firstLine: true }),

  h2("2.2", "Security Operations Centers (SOC) and SIEM Platforms"),
  p("A Security Operations Center (SOC) is a centralised function within an organisation responsible for the continuous monitoring of networks and systems to identify and respond to suspicious activity. SOC analysts typically work with Security Information and Event Management (SIEM) platforms — Splunk, IBM QRadar, ArcSight, Elastic SIEM — that aggregate log data from heterogeneous sources, normalise it, and apply correlation rules to surface alerts. While these platforms are powerful, they share several characteristics that make them unsuitable as a primary learning tool for beginners: per-seat licensing typically priced at thousands of US dollars per analyst per year, on-premises or VPC-restricted deployments that prevent casual experimentation, and steep learning curves that assume prior familiarity with logging formats, regular expressions, and the MITRE ATT&CK framework.", { firstLine: true }),
  p("VRIKAAN borrows the visual idiom of an SOC dashboard — the live counters, the donut charts, the audit log — but applies it to a single user's own data, making the SOC concept accessible to a student studying cybersecurity for the first time.", { firstLine: true }),

  h2("2.3", "AI in Cybersecurity"),
  p("AI-based assistants are increasingly used in cybersecurity for threat detection, automation, and awareness. Large language models (LLMs) such as those powering Google Gemini and OpenAI's GPT family can answer cybersecurity questions, walk a user through an incident response checklist, and summarise scan results in plain language. Industry products such as Microsoft Security Copilot and Google Sec-PaLM demonstrate the value of AI-assisted analysts; however, these are again priced for enterprise consumption.", { firstLine: true }),
  p("VRIKAAN integrates a Google Gemini-powered chatbot directly into the dashboard for cybersecurity guidance. The chatbot is rate-limited and plan-gated to keep marginal cost predictable, and it is trained (via system prompts and few-shot examples) to refuse unsafe requests such as malware authorship.", { firstLine: true }),

  h2("2.4", "Phishing Awareness and Detection"),
  p("Phishing remains one of the most common cyber threats, particularly in India where SMS-borne and WhatsApp-borne phishing has grown alongside UPI. Phishing prevention literature emphasises a combination of two approaches:", { firstLine: true }),
  numbered("Technical solutions — URL filtering, email scanning, browser security, MIT Punycode visual-spoof detection."),
  numbered("User-awareness training — recognising suspicious links, checking domain spelling, avoiding unknown attachments and shortened URLs."),
  p("Organisations use phishing simulation platforms such as KnowBe4 and Cofense to train employees, but these are unavailable to individual students and to small organisations. VRIKAAN includes an interactive phishing trainer that presents real and synthetic suspicious URLs and asks the user to classify them; each answer is followed by an explanation that names the specific red flag (look-alike domain, unusual TLD, embedded credentials, etc.).", { firstLine: true }),

  h2("2.5", "Password Security and Breach Databases"),
  p("Modern password security guidance derives from the National Institute of Standards and Technology Special Publication 800-63B, which recommends checking new passwords against breached-password lists rather than enforcing arbitrary complexity rules. Troy Hunt's Have I Been Pwned (HIBP) service maintains the most widely used such list, exposing it through a k-anonymity API in which the client submits only the first five characters of an SHA-1 hash and receives back all matching suffixes. VRIKAAN's Breach Check tool implements this k-anonymity protocol so that no full password ever leaves the user's browser.", { firstLine: true }),

  h2("2.6", "Web-Based Cybersecurity Dashboards"),
  p("A growing class of consumer products — Bitdefender Central, Norton My Account, McAfee Mobile Security — provide web dashboards that summarise the security posture of the user's devices. These dashboards typically focus on antivirus status, VPN usage, and password-manager statistics. They rarely include educational content, do not localise to Indian languages, and do not offer the breadth of monitoring tools (IP lookup, WHOIS, security headers, breach checks) that an Indian student would benefit from. VRIKAAN's dashboard combines the visual patterns of these products with a richer set of tools and a built-in education layer.", { firstLine: true }),

  h2("2.7", "Bilingual and Localized Software in India"),
  p("A 2023 KPMG survey found that more than 60% of new Indian Internet users prefer content in a language other than English, with Hindi being the largest single such preference. Despite this, almost no consumer cybersecurity product currently offers a Hindi user interface. The literature on localised software in India identifies recurring challenges: complex script rendering, longer string lengths displacing layouts, and the absence of standardised translations for technical terms. VRIKAAN addresses these challenges by using react-i18next with externalised resource bundles, by sizing all UI containers to accommodate Devanagari text, and by maintaining a controlled vocabulary of approximately seventy translated keys.", { firstLine: true }),

  h2("2.8", "Summary of Literature Survey"),
  p("From the literature survey, it is clear that many advanced security monitoring systems and tools exist in the industry. However, most of them are complex, expensive, English-only, and not designed for beginners or students. At the same time, phishing, password reuse, and credential theft remain pressing challenges for common Indian users. Therefore, VRIKAAN is proposed as a simplified, premium, web-based platform that combines dashboard monitoring concepts with an AI assistant, a tool suite, INR-native payments, and bilingual UI — making cybersecurity learning and basic monitoring more accessible than any single existing product.", { firstLine: true }),
);

// CHAPTER 3 — SRS (with tables)
bodyChildren.push(
  ...chapterHeader(3, "Software Requirements Specification (SRS)"),
  h2("3.1", "Introduction"),
  p("This chapter describes the Software Requirements Specification (SRS) for the VRIKAAN project. The SRS defines the functional and non-functional requirements of the system, along with assumptions, constraints, and external interface requirements. This document acts as a reference for the design, development, testing, and future enhancement of the project.", { firstLine: true }),
  p("VRIKAAN is developed as a web-based cybersecurity assistance and monitoring platform with an admin dashboard, a consumer tool surface, and an AI chatbot assistant. The system is intended to be user-friendly, premium in design, and responsive across devices.", { firstLine: true }),

  h2("3.2", "Purpose of the System"),
  p("The purpose of VRIKAAN is to provide a platform that:", { firstLine: true }),
  bullet("Demonstrates SOC-oriented cybersecurity monitoring concepts."),
  bullet("Provides a premium dashboard interface for admin-level access."),
  bullet("Offers an AI-based chatbot assistant for cybersecurity guidance."),
  bullet("Encourages cybersecurity awareness and best practices among students and beginners."),
  bullet("Serves as a scalable foundation for future development such as log ingestion, analytics, and incident-response automation."),

  h2("3.3", "Overall Description"),
  h3("3.3.1", "Product Perspective"),
  p("VRIKAAN is an independent, internet-hosted product. It does not require installation on the user's device beyond a modern web browser. The product communicates with Firebase services for identity and persistence, with Cashfree for payments, and with a small number of public OSINT services (HaveIBeenPwned, ipinfo, Cloudflare 1.1.1.1 trace) for tool results.", { firstLine: true }),
  h3("3.3.2", "User Classes and Characteristics"),
  bullet([{ t: "Anonymous visitor: ", bold: true }, "uses public tools (DNS leak test, breach check, IP lookup) without signing up."]),
  bullet([{ t: "Registered free user: ", bold: true }, "has a dashboard, can save tool history, can register up to one device, can subscribe to push notifications."]),
  bullet([{ t: "Pro / Enterprise user: ", bold: true }, "has expanded device limits, API tokens, team accounts, AI chatbot quota, and outbound webhook configuration."]),
  bullet([{ t: "Admin: ", bold: true }, "has access to the admin console, audit log, broadcast notifications, and user management. Step-up authentication required."]),
  h3("3.3.3", "Design and Implementation Constraints"),
  bullet("The frontend must be developed using React 19 and Vite 7."),
  bullet("The backend must run on Vercel serverless functions with no more than twelve function files (free tier)."),
  bullet("All payments must be processed in Indian Rupees through a payment aggregator licensed by the Reserve Bank of India (Cashfree)."),
  bullet("The user interface must remain visually consistent across desktop, tablet, and mobile breakpoints."),
  bullet("Authentication tokens must never be exposed in URLs or in localStorage in plain text; Firebase's IndexedDB-backed storage is preferred."),
  h3("3.3.4", "Assumptions and Dependencies"),
  bullet("The user accesses the platform from a modern browser supporting ES2020, Service Workers, and the Web Cryptography API."),
  bullet("Internet connectivity is available for accessing backend APIs and third-party services."),
  bullet("Firebase services remain operational with the documented 99.95% SLA."),

  h2("3.4", "Functional Requirements"),
  p("Table II enumerates the functional requirements of VRIKAAN.", { firstLine: true }),
  center("Table II — Functional Requirements of VRIKAAN", { run: { bold: true, italics: true } }),
  makeTable(
    [800, 2400, 5500],
    ["FR ID", "Title", "Description"],
    [
      ["FR-01", "User Registration", "System allows new users to register using email + password, Google OAuth, GitHub OAuth, Facebook OAuth, phone OTP, or email magic-link."],
      ["FR-02", "User Authentication", "System authenticates returning users via the same set of providers and issues a Firebase ID token valid for 1 hour."],
      ["FR-03", "Two-Factor Authentication", "System supports custom RFC 6238 TOTP enrollment with a QR code and ten one-time backup codes; subsequent logins gate on the 6-digit code."],
      ["FR-04", "Tool Execution (50+)", "System provides over fifty cybersecurity tools (DNS leak, IP lookup, breach check, password vault, phishing trainer, dark-web monitor, etc.) accessible without login or with login."],
      ["FR-05", "Tool History", "System stores authenticated users' tool runs in Firestore for review later; users can export history to CSV."],
      ["FR-06", "Payments", "System processes plan upgrades through Cashfree (UPI, cards, net-banking) in INR; verifies orders server-side."],
      ["FR-07", "Self-Serve Refunds", "Users may request refunds within seven days of payment; server enforces ownership and window."],
      ["FR-08", "Coupon Codes", "System validates coupon codes against Firestore; supports percent-off and flat-off discounts with per-plan restrictions."],
      ["FR-09", "Team Accounts", "Pro+ users may create a team, invite members by email, and manage member roles (admin / member)."],
      ["FR-10", "AI Chatbot", "System provides a Google Gemini-powered chatbot for cybersecurity guidance, rate-limited and plan-gated."],
      ["FR-11", "Push Notifications", "System supports browser push notifications (VAPID) and weekly EmailJS digest emails."],
      ["FR-12", "Outbound Webhooks", "Users may register an HTTPS endpoint that receives HMAC-SHA256-signed events (e.g., payment.refunded)."],
      ["FR-13", "Admin Console", "Whitelisted admin emails access a separate dashboard with live stats, user management, payment audit, broadcast notifications, and audit log."],
      ["FR-14", "Internationalisation", "System supports English and Hindi user interfaces with persistent language preference."],
    ],
  ),

  h2("3.5", "Non-Functional Requirements"),
  p("Table III enumerates the non-functional requirements of VRIKAAN.", { firstLine: true }),
  center("Table III — Non-Functional Requirements of VRIKAAN", { run: { bold: true, italics: true } }),
  makeTable(
    [1200, 2200, 5300],
    ["NFR ID", "Category", "Requirement"],
    [
      ["NFR-01", "Performance",          "Page load time on a 4G connection shall not exceed 3 seconds for any cached route after first visit."],
      ["NFR-02", "Performance",          "Tool execution endpoints shall respond within 5 seconds at the 95th percentile."],
      ["NFR-03", "Scalability",          "Architecture shall scale from 0 to 10,000 monthly active users without code change."],
      ["NFR-04", "Availability",         "Production domain (vrikaan.com) shall achieve at least 99.5% uptime, inheriting Firebase + Vercel SLAs."],
      ["NFR-05", "Security",             "All traffic shall use HTTPS; HSTS preload enabled; strict Content Security Policy enforced."],
      ["NFR-06", "Security",             "User passwords shall never be stored in plaintext; Firebase Auth handles bcrypt hashing."],
      ["NFR-07", "Security",             "Two-factor authentication shall meet NIST AAL2 when enrolled."],
      ["NFR-08", "Privacy",              "User data shall be deletable on request (GDPR / DPDP Act compliance) via a self-serve account-deletion endpoint."],
      ["NFR-09", "Maintainability",      "Codebase shall include automated tests covering pure utility logic and critical UI components."],
      ["NFR-10", "Maintainability",      "Production deployments shall be reversible within five minutes via Vercel deployment promotion."],
      ["NFR-11", "Usability",            "All primary actions shall be reachable within three clicks from any page."],
      ["NFR-12", "Usability",            "UI shall remain readable at 100% browser zoom on mobile displays of 320 px width and above."],
      ["NFR-13", "Internationalisation", "Translation files shall be externalised so a translator can add a new language without touching code."],
      ["NFR-14", "Cost",                 "Marginal cost per free user shall remain ₹0 within the chosen free tiers."],
    ],
  ),

  h2("3.6", "Hardware Requirements"),
  p("Table IV enumerates the minimum and recommended hardware requirements for accessing VRIKAAN.", { firstLine: true }),
  center("Table IV — Hardware Requirements", { run: { bold: true, italics: true } }),
  makeTable(
    [2400, 3400, 3500],
    ["Component", "Minimum", "Recommended"],
    [
      ["Processor",       "Dual-core 1.6 GHz (any modern smartphone or laptop)", "Quad-core 2.0 GHz or higher"],
      ["RAM",             "2 GB",                                              "4 GB or higher"],
      ["Storage",         "100 MB free for browser cache + service worker",     "Standard browser storage"],
      ["Display",         "320 px width minimum",                              "1366 × 768 or higher"],
      ["Network",         "3G / 1 Mbps",                                       "4G / Wi-Fi (5 Mbps+)"],
      ["Camera (optional)", "Front-facing (for QR scanner tool)",              "HD front-facing"],
    ],
  ),

  h2("3.7", "Software Requirements"),
  p("Table V enumerates the software components used to develop and operate VRIKAAN.", { firstLine: true }),
  center("Table V — Software / Tools Used for Implementation", { run: { bold: true, italics: true } }),
  makeTable(
    [2400, 6960],
    ["Layer / Phase", "Software"],
    [
      ["Frontend framework",    "React 19, Vite 7, React Router DOM"],
      ["Frontend libraries",    "react-i18next, Recharts, Three.js (3D globe), react-icons, jsPDF, html5-qrcode"],
      ["Backend (serverless)",  "Vercel Functions (Node.js 20)"],
      ["Identity",              "Firebase Authentication"],
      ["Database",              "Cloud Firestore (NoSQL)"],
      ["Privileged operations", "Firebase Admin SDK"],
      ["Payments",              "Cashfree Payment Gateway (INR)"],
      ["Email",                 "EmailJS"],
      ["Telemetry",             "Sentry (DSN-only adapter)"],
      ["CAPTCHA",               "Cloudflare Turnstile"],
      ["AI",                    "Google Generative AI (Gemini)"],
      ["Quality",               "Vitest, React Testing Library, ESLint"],
      ["CI/CD",                 "GitHub Actions, Vercel CLI, Firebase CLI"],
      ["Tools (developer)",     "Visual Studio Code, Git, npm, PowerShell"],
      ["Hosting",               "Vercel (CDN + serverless), Firebase (Auth + Firestore)"],
    ],
  ),

  h2("3.8", "System Constraints and Assumptions"),
  bullet("Maximum twelve serverless function files due to Vercel hobby-tier limits."),
  bullet("Firestore free tier: 50,000 reads, 20,000 writes, 20,000 deletes per day."),
  bullet("Firebase Authentication free tier: 50,000 monthly active users."),
  bullet("EmailJS free tier: 200 emails per month — used for transactional sends only."),
  bullet("Service-worker runtime cache size limited to 50 MB to remain well under browser quota."),
  bullet("Single admin maintainer; no on-call rotation; observability via Sentry email alerts."),
);

// CHAPTER 4 — SYSTEM DESIGN
bodyChildren.push(
  ...chapterHeader(4, "System Design"),
  h2("4.1", "System Architecture"),
  p("VRIKAAN follows a strict three-tier architecture, deliberately constructed so that each tier may be operated entirely within the free or hobby tiers of its underlying provider. The three tiers are: (i) the Client tier, a React single-page application served from Vercel's edge CDN; (ii) the API tier, twelve Vercel serverless functions in Node.js 20; and (iii) the Data and third-party tier, comprising Firebase Authentication, Cloud Firestore, Cashfree, and external OSINT services.", { firstLine: true }),
  p("Figure I (in the List of Figures) presents this three-tier architecture. Network traffic flows top-down: the browser fetches static assets from the Vercel CDN, then issues fetch() calls to /api/* endpoints. Each endpoint authenticates the request (via Firebase Bearer ID token where applicable), enforces a rate limit (per-IP plus per-user-tier), and either reads or writes Firestore through the Firebase Admin SDK or proxies a request to a third-party API.", { firstLine: true }),

  h2("4.2", "Use Case Diagram"),
  p("The system supports four primary actor classes — Anonymous Visitor, Registered Free User, Paid User, and Admin. Each actor has a distinct set of use cases:", { firstLine: true }),
  bullet([{ t: "Anonymous Visitor: ", bold: true }, "run any public tool, view pricing, sign up."]),
  bullet([{ t: "Registered Free User: ", bold: true }, "all anonymous use cases plus dashboard access, device registration, push subscription, tool history, basic AI chatbot."]),
  bullet([{ t: "Paid User: ", bold: true }, "all free use cases plus team accounts, API tokens, outbound webhooks, expanded AI chatbot quota."]),
  bullet([{ t: "Admin: ", bold: true }, "all paid use cases plus the admin console (live stats, user management, broadcast, audit log)."]),

  h2("4.3", "Data Flow Diagram"),
  p("The Level 0 data-flow diagram (Figure III) shows VRIKAAN as a single process with three external entities — Browser, Firebase, and Third-Party APIs. The Level 1 diagram (Figure IV) decomposes the process into authentication, tool execution, and persistence sub-processes. Authentication accepts an OAuth provider response, exchanges it for a Firebase ID token, and writes a profile document to Firestore. Tool execution accepts a tool name and input, calls the appropriate handler, and optionally records the result in the user's tool-history subcollection.", { firstLine: true }),

  h2("4.4", "Sequence Diagram — TOTP Enrollment"),
  p("Figure V presents the sequence diagram for two-factor authentication enrollment. The user clicks Enable 2FA in the dashboard. The browser POSTs to /api/tools?tool=totp-setup, which generates a 160-bit secret using otpauth's Secret class, builds an otpauth:// provisioning URL, and renders a QR code with the qrcode library. The browser displays the QR. The user scans it with Google Authenticator. The user types the 6-digit code into a confirmation field. The browser POSTs the secret + code to /api/tools?tool=totp-confirm. The server verifies the code with a one-period clock-skew window, generates ten 8-character backup codes, and persists secret + backup codes to /users/{uid}.mfa via the Firebase Admin SDK. The dashboard displays the backup codes once for the user to copy.", { firstLine: true }),

  h2("4.5", "Component Diagram"),
  p("Figure VI presents the component diagram of the React frontend. The Application root mounts a BrowserRouter that lazy-loads each route via React.lazy(). The AuthContext component wraps every route and exposes user state through a custom useAuth() hook. ProtectedRoute components gate authenticated routes. The Dashboard route is itself decomposed into smaller AniCard sub-components for individual feature panels (security score, devices, payments, 2FA, webhooks, etc.). The PWAInstallPrompt and ServiceWorker registration components run alongside the router.", { firstLine: true }),

  h2("4.6", "Firestore Data Model"),
  p("Table VII enumerates the principal Firestore collections. All user-owned data is nested under /users/{uid}; cross-user data lives in top-level collections governed by stricter security rules.", { firstLine: true }),
  center("Table VII — Firestore Collection Schema Summary", { run: { bold: true, italics: true } }),
  makeTable(
    [3000, 3360, 3000],
    ["Collection", "Key Fields", "Access Pattern"],
    [
      ["users/{uid}",                  "name, email, phone, plan, mfa, currentTeamId, webhook", "Owner R/W; admin R/W"],
      ["users/{uid}/devices/{id}",     "name, type, browser, os, osVersion, model, gpu, ram, cpu", "Owner R/W"],
      ["users/{uid}/payments/{id}",    "orderId, amount, plan, status, refunded, refundId", "Owner R, server W"],
      ["users/{uid}/toolHistory/{id}", "tool, input, result, timestamp", "Owner R/W"],
      ["users/{uid}/activity/{id}",    "type, detail, timestamp", "Owner R/W; cron purges >90d"],
      ["users/{uid}/apikeys/{token}",  "label, createdAt, lastUsed", "Owner R/W"],
      ["teams/{teamId}",               "name, ownerUid, members, memberEmails", "Member R; server W only"],
      ["teamInvites/{inviteId}",       "teamId, email, status, invitedBy", "Invitee R; server W only"],
      ["coupons/{CODE}",               "percentOff, flatOff, active, expiresAt, plans", "Public single-doc R; admin W"],
    ],
  ),
);

// CHAPTER 5 — TECHNICAL SPECIFICATIONS
bodyChildren.push(
  ...chapterHeader(5, "Technical Specifications"),
  h2("5.1", "Technology Stack Overview"),
  p("VRIKAAN is built on a modern, free-tier-friendly, production-grade technology stack. Table VI enumerates the complete stack across all layers.", { firstLine: true }),
  center("Table VI — Technology Stack Used in VRIKAAN", { run: { bold: true, italics: true } }),
  makeTable(
    [2200, 3000, 4160],
    ["Layer", "Technology", "Purpose"],
    [
      ["Frontend",     "React 19",                       "Concurrent-rendering UI library"],
      ["Frontend",     "Vite 7",                         "Sub-second HMR + esbuild production minification"],
      ["Frontend",     "React Router DOM",               "Client-side routing with React.lazy() code splitting"],
      ["Frontend",     "react-i18next",                  "EN / HI locale switching with localStorage persistence"],
      ["Frontend",     "Recharts",                       "Dashboard area / pie / bar charts"],
      ["Frontend",     "Three.js + @react-three/drei",   "3D threat-globe visualisation"],
      ["Frontend",     "react-icons (Heroicons set)",    "SVG iconography"],
      ["Backend",      "Vercel Functions (Node 20)",     "Twelve serverless route files"],
      ["Backend",      "Firebase Authentication",        "OAuth, phone OTP, magic link, email-password"],
      ["Backend",      "Cloud Firestore",                "Document-oriented persistent store"],
      ["Backend",      "Firebase Admin SDK",             "Privileged server-side reads / writes"],
      ["Integration",  "Cashfree Payments",              "INR payment processing (UPI, cards, net-banking)"],
      ["Integration",  "EmailJS",                        "Transactional email delivery"],
      ["Integration",  "Cloudflare Turnstile",           "CAPTCHA on signup form"],
      ["Integration",  "Sentry",                         "Error telemetry (zero-bundle DSN adapter)"],
      ["Integration",  "Google Generative AI",           "AI chatbot (Gemini)"],
      ["Quality",      "Vitest + React Testing Library + jsdom", "Unit + component tests"],
      ["Quality",      "ESLint",                         "JavaScript / JSX linting"],
      ["CI/CD",        "GitHub Actions",                 "Auto-promote latest Ready deploy to vrikaan.com"],
      ["Tools",        "Visual Studio Code, Git, npm",   "Editor, version control, package management"],
    ],
  ),

  h2("5.2", "Frontend Specifications"),
  p("The frontend is a single-page React 19 application bundled with Vite 7. Vite is configured to produce manual chunks separating vendor libraries (react, firebase, three, recharts, jspdf, qrcode, emailjs) from application code, keeping the initial JavaScript payload below 500 KB gzipped. The application is registered as a Progressive Web App via a custom Service Worker that precaches the application shell and applies a network-first runtime cache (5-minute time-to-live) for whitelisted /api/tools GET endpoints.", { firstLine: true }),

  h2("5.3", "Backend Specifications"),
  p("The backend consists of twelve Vercel serverless function files. The most important is api/tools.js, which acts as a router for eighteen logical actions. Each request to /api/tools?tool=<action> is routed by a HANDLERS map. Shared concerns — authentication via Firebase ID-token verification, IP-tier rate limiting, and CORS — are implemented in the dispatcher function above the handler dispatch. The remaining eleven function files handle Cashfree webhooks (cashfree-webhook.js), the cron-driven weekly digest (cron-digest.js), AI chatbot (chat.js), URL scanning (scan-url.js), SSL inspection (ssl.js), open-graph image generation (og.js), threat directory (threats.js), identity x-ray (identity-xray.js), breach lookup (breach.js), checkout session creation (create-checkout-session.js), and payment verification (verify-payment.js).", { firstLine: true }),

  h2("5.4", "Security Specifications"),
  bullet([{ t: "Transport: ", bold: true }, "HTTPS-only (HSTS preload), automatic certificate management via Vercel."]),
  bullet([{ t: "Headers: ", bold: true }, "strict Content Security Policy, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy locking down camera / microphone."]),
  bullet([{ t: "Authentication: ", bold: true }, "Firebase Auth issues short-lived (1 hour) ID tokens; refresh handled by the SDK."]),
  bullet([{ t: "Authorisation: ", bold: true }, "Firestore security rules enforce ownership; team and coupon writes are server-only."]),
  bullet([{ t: "Rate limiting: ", bold: true }, "in-memory IP-tier and user-tier buckets per function instance; 429 with Retry-After when exceeded."]),
  bullet([{ t: "Two-factor: ", bold: true }, "RFC 6238 TOTP with otpauth library; ten 8-character backup codes."]),
  bullet([{ t: "Webhooks: ", bold: true }, "outbound payloads signed with HMAC-SHA256; receivers verify the X-Vrikaan-Signature header in constant time."]),

  h2("5.5", "Tools and Libraries Used"),
  p("Beyond the runtime libraries already listed, the build-time and developer-tool stack includes: Vitest 4 for unit tests; React Testing Library 16 for component tests; jsdom 29 as the test DOM; ESLint 9 with the React plugin set; rollup-plugin-visualizer 7 for bundle analysis; cross-env 10 for cross-shell environment variable handling; otpauth 9 for TOTP; qrcode 1 for QR rendering; otpauth-style RFC 6238 conformance; and the Firebase Admin SDK for privileged Firestore writes from the server.", { firstLine: true }),
);

// CHAPTER 6 — PROJECT ESTIMATE
bodyChildren.push(
  ...chapterHeader(6, "Project Estimate, Schedule and Team Structure"),
  h2("6.1", "Introduction"),
  p("This chapter presents the planning, scheduling, and team structure of the VRIKAAN project as executed during the academic year 2025–26. Planning was performed using lightweight Agile principles — weekly sprints, a single shared Git repository as the source of truth, and continuous deployment to a production environment from day one of the second semester.", { firstLine: true }),

  h2("6.2", "Project Planning and Estimation"),
  p("The project was estimated at approximately 600 developer-hours spread across two academic semesters. Effort breakdown: requirement gathering and design 60 hours, frontend implementation 240 hours, backend implementation 180 hours, testing and quality 60 hours, deployment and observability 30 hours, documentation and report writing 30 hours.", { firstLine: true }),

  h2("6.3", "Expected Schedule (Sem I & Sem II)"),
  p("Semester I (July 2025 – November 2025) was dedicated to research, requirement specification, system design, and a working frontend prototype. Semester II (December 2025 – April 2026) was dedicated to backend implementation, payment integration, two-factor authentication, team accounts, internationalisation, testing, and final deployment.", { firstLine: true }),

  h2("6.4", "Actual Schedule (Work Completed)"),
  p("Most planned milestones were achieved on or ahead of schedule. The two-factor authentication and outbound webhook features were originally planned for a future-work section but were brought forward into the current scope after sprint capacity allowed. Internationalisation was delivered as a foundation (English + Hindi for nav, footer, hero, login, signup, pricing) with extension to remaining pages listed under future work.", { firstLine: true }),

  h2("6.5", "Milestone Table (Expected vs Actual)"),
  center("Table VIII — Project Milestone Table", { run: { bold: true, italics: true } }),
  makeTable(
    [3700, 2800, 2860],
    ["Milestone", "Expected Date", "Actual Status"],
    [
      ["Requirement specification + SRS",       "Aug 2025",    "Completed Aug 2025"],
      ["System design + UML diagrams",          "Sep 2025",    "Completed Sep 2025"],
      ["Frontend prototype (auth + tool surface)","Nov 2025",   "Completed Nov 2025"],
      ["Backend (router pattern, twelve fns)",  "Jan 2026",    "Completed Jan 2026"],
      ["Cashfree payment integration",          "Feb 2026",    "Completed Feb 2026"],
      ["TOTP 2FA + magic-link auth",            "Mar 2026 (stretch)", "Completed Apr 2026"],
      ["Outbound webhooks + team accounts",     "Apr 2026 (stretch)", "Completed May 2026"],
      ["i18n (EN + HI)",                        "Apr 2026",    "Completed May 2026 (foundation)"],
      ["Testing (33 vitest cases)",             "Apr 2026",    "Completed May 2026"],
      ["Production deployment",                 "Apr 2026",    "Completed Mar 2026 — live since"],
      ["Final report + viva preparation",       "May 2026",    "Completed May 2026"],
    ],
  ),

  h2("6.6", "Team Structure"),
  p("VRIKAAN was developed by a two-member student team. Roles were distributed by skill area; both members contributed to design discussion, code review, and report writing.", { firstLine: true }),
  center("Table IX — Team Structure and Roles", { run: { bold: true, italics: true } }),
  makeTable(
    [3000, 6360],
    ["Member", "Primary Responsibilities"],
    [
      ["Sahil Anil Nikam (PRN 220105131264)",        "Lead developer — frontend architecture, backend router pattern, Firebase rules, Cashfree integration, two-factor authentication, GitHub Actions CI, Sentry telemetry, deployment."],
      ["Ankalesh Dipak Somvanshi (PRN 220105131273)", "Co-developer — UI design, content writing, phishing trainer dataset, internationalisation translations, testing, documentation, viva preparation."],
    ],
  ),

  h2("6.7", "Roles and Responsibilities"),
  p("Day-to-day work was conducted on individual feature branches, merged through pull-request review by the other team member. Architecture decisions were taken jointly and recorded in the README and in inline JSDoc. Disagreements were resolved by reference to upstream documentation (React, Firebase, Vercel) and to OWASP / NIST guidance for security-critical decisions.", { firstLine: true }),

  h2("6.8", "Summary"),
  p("The project was completed within the allotted academic year with all major planned milestones achieved and several stretch milestones (TOTP 2FA, outbound webhooks, i18n) brought forward into the delivered scope.", { firstLine: true }),
);

// CHAPTER 7 — IMPLEMENTATION
bodyChildren.push(
  ...chapterHeader(7, "Software Implementation"),
  h2("7.1", "Introduction"),
  p("This chapter describes the software implementation of VRIKAAN, including frontend architecture, the Vercel-hosted backend router pattern, Firestore data model and security rules, and the integration of payments, authentication, and notifications. Where useful, code snippets are inlined to illustrate the implementation pattern.", { firstLine: true }),

  h2("7.2", "Frontend Implementation"),
  p("The frontend is a single-page React 19 application bundled by Vite 7. The application root mounts a BrowserRouter and lazy-loads every route via React.lazy() so that the initial JavaScript bundle contains only the home-page route. Vite's manual chunk configuration separates vendor libraries (react, firebase, three, recharts, jspdf, qrcode, emailjs) from application code, allowing the browser to cache vendor chunks across deployments.", { firstLine: true }),
  p("The AuthContext component wraps the entire router and exposes user state via a custom useAuth() hook. The hook returns an object of the form { user, login, signup, logout, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithPhone, sendMagicLink, completeMagicLink, resetPassword, sendVerifyEmail, updatePlan, startTrial, updateProfile, isAdmin }, providing every component access to authentication primitives without prop-drilling.", { firstLine: true }),

  h2("7.3", "Backend Implementation (Router Pattern)"),
  p("The backend's defining engineering decision is the router pattern in api/tools.js. Vercel's free tier limits a project to twelve serverless function files. A naive one-file-per-action design would exhaust this budget after the first six features. The router pattern hosts eighteen logical actions inside a single tools.js file. Each request inspects ?tool=<name> and dispatches to the named handler. Shared concerns are implemented above the dispatch.", { firstLine: true }),
  codeBlock([
    "// api/tools.js — router pattern (excerpt)",
    "const HANDLERS = {",
    "  whois: handleWhois,",
    "  'security-headers': handleSecurityHeaders,",
    "  'leak-check': handleLeakCheck,",
    "  'totp-setup': handleTotpSetup,",
    "  'totp-confirm': handleTotpConfirm,",
    "  'totp-verify': handleTotpVerify,",
    "  refund: handleRefund,",
    "  'webhook-set': handleWebhookSet,",
    "  'team-create': handleTeamCreate,",
    "  // ... eighteen actions total",
    "};",
    "",
    "export default async function handler(req, res) {",
    "  const tool = req.query.tool;",
    "  if (!HANDLERS[tool]) return res.status(400).json({ error: 'Unknown tool' });",
    "",
    "  const tokenAuth = await validateApiToken(req.headers.authorization);",
    "  req.apiClient = tokenAuth;",
    "",
    "  const { ipLimit, userLimit, windowMs } = tokenAuth.valid",
    "    ? { ipLimit: 200, userLimit: 600, windowMs: 60000 }",
    "    : { ipLimit: 20,  userLimit: 60,  windowMs: 60000 };",
    "  const rl = applyRateLimit(req, { ipLimit, userLimit, windowMs });",
    "  if (!rl.allowed) return res.status(429).json({ error: 'Too many requests' });",
    "",
    "  return HANDLERS[tool](req, res);",
    "}",
  ]),

  h2("7.4", "Firestore Schema and Security Rules"),
  p("The Firestore data model is hierarchical: each user owns a /users/{uid} document and several subcollections under that document. Cross-user resources (teams, team invites, coupons) live in top-level collections. Security rules enforce ownership at the database layer; all writes for sensitive collections (teams, payments, coupons) go through the server using the Firebase Admin SDK so that a malicious client cannot self-elevate privileges.", { firstLine: true }),
  codeBlock([
    "// firestore.rules (excerpt)",
    "match /users/{uid} {",
    "  allow read, write: if isOwner(uid) || isAdmin();",
    "  match /payments/{payId} {",
    "    allow read:           if isOwner(uid) || isAdmin();",
    "    allow create:         if isOwner(uid);",
    "    allow update, delete: if isAdmin();   // payment history immutable to user",
    "  }",
    "}",
    "match /teams/{teamId} {",
    "  allow read: if isSignedIn() && request.auth.uid in resource.data.members;",
    "  allow create, update, delete: if false;   // server-only",
    "}",
    "match /coupons/{code} {",
    "  allow get:    if true;     // public single-doc read by exact id",
    "  allow list:   if isAdmin();",
    "  allow create, update, delete: if isAdmin();",
    "}",
  ]),

  h2("7.5", "Important Modules"),
  bullet([{ t: "Authentication module (src/context/AuthContext.jsx) — ", bold: true }, "exposes 17 authentication-related functions including OAuth providers, phone OTP, magic-link sign-in, password reset, and email verification."]),
  bullet([{ t: "Tools router (api/tools.js) — ", bold: true }, "single dispatcher hosting 18 logical actions including TOTP setup/confirm/verify/disable, webhook set/clear/test, team create/invite/accept/remove-member, refund, leak-check, ip lookup, breach check, weekly-digest, password-check, ai-explain, file-hash-check, security-headers."]),
  bullet([{ t: "Service worker (public/sw.js) — ", bold: true }, "version-tagged cache (vrikaan-v7), precache on install, network-first runtime cache for /api/tools whitelist with 5-minute time-to-live, offline fallback page."]),
  bullet([{ t: "Internationalisation (src/i18n.js + src/locales/) — ", bold: true }, "react-i18next bootstrap with English and Hindi resource bundles; locale persisted in localStorage under key vrikaan_lang."]),
  bullet([{ t: "Dashboard (src/assets/pages/UserDashboard.jsx) — ", bold: true }, "the largest single React component, comprising security score, device list, payment history with inline refund buttons, tool history with CSV export, two-factor enrollment, outbound-webhook configuration, team accounts cross-link, and account-settings card."]),

  h2("7.6", "Business Logic and Architecture"),
  p("The business logic is split between (i) pure utility functions (src/utils/billing.js, src/utils/csv.js) covering coupon math, refund eligibility, and CSV escaping; (ii) React components rendering the UI; and (iii) serverless handlers performing privileged operations. This separation allows ninety-six percent of the business-critical logic to be unit-tested without React, jsdom, or Firestore — improving test reliability and execution speed.", { firstLine: true }),

  h2("7.7", "Advantages and Disadvantages"),
  p([{ t: "Advantages: ", bold: true }, "zero infrastructure cost at the chosen free tiers; instant rollback via Vercel deployment promotion; comprehensive free TLS via Vercel; multilingual UI; built-in education layer; INR-native payments; production-grade two-factor authentication without paid identity-platform tier."]),
  p([{ t: "Disadvantages: ", bold: true }, "subject to free-tier limits which would require migration at very high scale; serverless cold-starts add up to 1 second of latency on first request; reliance on third-party services (Firebase, Vercel, Cashfree) which carry their own uptime risk."]),

  h2("7.8", "Applications"),
  bullet("Personal cybersecurity hygiene for Indian students and small business owners."),
  bullet("Hands-on cybersecurity teaching aid in undergraduate computer-engineering curricula."),
  bullet("Lightweight breach-monitoring service for individual professionals (CAs, lawyers, doctors) handling sensitive client data."),
  bullet("Demonstration project for INR-native SaaS architectures."),

  h2("7.9", "Summary"),
  p("Implementation followed the principle of doing the simplest thing that could possibly work, with sharp attention to the small set of architectural decisions (router pattern, server-only writes, free-tier compliance) that determine whether the product can be operated by a single developer for years to come.", { firstLine: true }),
);

// CHAPTER 8 — TESTING
bodyChildren.push(
  ...chapterHeader(8, "Software Testing"),
  h2("8.1", "Introduction"),
  p("Testing of VRIKAAN was conducted through a combination of automated unit tests (Vitest), automated component tests (React Testing Library + jsdom), manual smoke tests in the browser across desktop and mobile breakpoints, and end-to-end exercise of the production deployment using real Cashfree sandbox transactions, Firebase Auth flows, and outbound webhook deliveries.", { firstLine: true }),

  h2("8.2", "Testing Strategy"),
  p("Test priority was determined by a payoff-versus-cost matrix. High-priority targets were pure utility functions (billing math, CSV escaping), authentication flows (login gate with TOTP), and access-control rules (Firestore). Lower priority were trivial presentational components, since unit-testing them would have produced little payoff relative to maintenance cost.", { firstLine: true }),

  h2("8.3", "Types of Testing Performed"),
  numbered("Unit testing — pure functions in src/utils/*.test.js executed by Vitest under Node.js."),
  numbered("Component testing — React components in src/components/*.test.jsx executed by Vitest under jsdom with React Testing Library."),
  numbered("Integration smoke tests — manual invocation of every /api/tools action via curl with a real Firebase ID token."),
  numbered("End-to-end smoke tests — full sign-up, payment, refund, 2FA enrollment cycles performed in Chrome and on Android Chrome."),
  numbered("Security smoke tests — Firestore rules verified by attempting unauthorised reads / writes from an anonymous browser session and confirming permission denials."),

  h2("8.4", "Test Cases"),
  p("Table X enumerates the principal automated test cases.", { firstLine: true }),
  center("Table X — Test Cases for Login, Tools and Webhooks", { run: { bold: true, italics: true } }),
  makeTable(
    [800, 3000, 2780, 2780],
    ["TC ID", "Function under test", "Input", "Expected output"],
    [
      ["TC-01", "computeCouponDiscount(price, coupon)", "1000, { percentOff: 25 }", "250"],
      ["TC-02", "computeCouponDiscount, no coupon",      "1000, null",                "0"],
      ["TC-03", "computeCouponDiscount, percentOff capped", "100, { percentOff: 200 }", "100"],
      ["TC-04", "applyCoupon floor",                     "50, { flatOff: 999 }",      "1 (never below ₹1)"],
      ["TC-05", "isRefundEligible inside 7 days",        "now-3d",                    "true"],
      ["TC-06", "isRefundEligible past 7 days",          "now-8d",                    "false"],
      ["TC-07", "csvEscape comma",                       "\"a,b\"",                   "\"\\\"a,b\\\"\""],
      ["TC-08", "csvEscape embedded quotes",             "say \\\"hi\\\"",            "double-quote-escaped"],
      ["TC-09", "buildCsv RFC-4180",                     "headers + 2 rows",          "CRLF-separated string"],
      ["TC-10", "PlanGate gate, free user, pro feature", "user.plan=free, required=pro", "shows locked overlay"],
      ["TC-11", "PlanGate gate, pro user, pro feature",  "user.plan=pro, required=pro", "renders children"],
      ["TC-12", "PlanGate enterprise > pro",             "user.plan=enterprise, required=pro", "renders children"],
      ["TC-13", "Login: MFA required, no code",          "user.mfaEnabled=true, no TOTP", "blocks redirect"],
      ["TC-14", "Login: MFA passed",                     "valid TOTP",                "navigates to /home"],
      ["TC-15", "Coupon validate, expired",              "expiresAt < now",           "rejected"],
    ],
  ),

  h2("8.5", "Testing Summary"),
  p("Final automated test execution: thirty-three of thirty-three test cases passed (100%). Total wall-clock time for the test suite was approximately three seconds (excluding cold-start of jsdom). The CI pipeline runs the test suite on every push to master before promotion.", { firstLine: true }),
);

// CHAPTER 9 — RESULTS
bodyChildren.push(
  ...chapterHeader(9, "Results and Discussion"),
  h2("9.1", "Introduction"),
  p("This chapter presents the observed results of the VRIKAAN implementation, including quantitative engineering metrics, screen captures of the deployed product, an objective-wise discussion of which project objectives were met, performance and responsiveness measurements, and known limitations.", { firstLine: true }),

  h2("9.2", "Output Screens and Modules"),
  bullet("Public landing page (vrikaan.com/) — hero, tool grid, pricing CTA."),
  bullet("Login (vrikaan.com/login) — email + password, OAuth, phone OTP, magic link, optional TOTP gate."),
  bullet("User Dashboard (vrikaan.com/dashboard) — security score, devices, payments, history, 2FA, webhooks."),
  bullet("DNS Leak Test (vrikaan.com/dns-leak-test) — IP, ISP, location, Cloudflare trace, WebRTC IPs."),
  bullet("Pricing (vrikaan.com/pricing) — three plans with coupon code field."),
  bullet("Team (vrikaan.com/team) — create, invite, manage."),
  bullet("Admin Console (vrikaan.com/admin) — gated by step-up authentication."),

  h2("9.3", "Objective-wise Discussion"),
  p("Objective 1 (unify 50+ tools) — achieved; the live tool count exceeds fifty including thirty-five SEO threat-detail pages. Objective 2 (AI chatbot) — achieved; Gemini-powered chatbot live in dashboard. Objective 3 (secure auth) — achieved; six providers plus custom TOTP gate. Objective 4 (SOC concepts) — achieved; admin console implements live stats, audit log, and broadcast notifications. Objective 5 (INR payments + refunds) — achieved; Cashfree live + 7-day self-serve refund pipeline. Objective 6 (modular serverless) — achieved; twelve functions, free tier, GitHub Actions auto-promote. Objective 7 (production-grade pipeline) — achieved; thirty-three tests, Sentry, weekly cron cleanup.", { firstLine: true }),

  h2("9.4", "Performance and Responsiveness"),
  p("Production builds complete in less than two minutes on a modern laptop. Vite produces minified bundles with the largest chunk (vendor-three, the 3D globe library) at 664 KB before gzip and approximately 175 KB after gzip. First contentful paint on a 4G connection averages 1.8 seconds; subsequent navigations are below 200 ms thanks to the service-worker shell cache. Tool API endpoints respond within 500 ms at the median for cached responses and within 2 seconds for cache-miss responses requiring third-party calls.", { firstLine: true }),

  h2("9.5", "Limitations"),
  bullet("Free-tier Vercel function count limit (12) constrains organic feature growth without further consolidation."),
  bullet("Free-tier Firestore daily-quota would require migration at sustained heavy load (>50k reads / day)."),
  bullet("Hindi translations cover the navigation, footer, hero, login, signup, and pricing surfaces; deeper pages remain English-only pending translator capacity."),
  bullet("AI chatbot quota is plan-gated and may be exhausted by power users; a paid Gemini tier would relax this."),
  bullet("Push-notification subscriptions are tied to a single browser; multi-device synchronisation is not yet implemented."),

  h2("9.6", "Summary"),
  p("All seven primary objectives were achieved. Several stretch objectives (TOTP 2FA, outbound webhooks, multi-user team accounts, internationalisation foundation) were also delivered. Limitations are mostly tied to free-tier infrastructure boundaries rather than to fundamental design issues, and they would be relaxed by a paid-tier migration when warranted by user volume.", { firstLine: true }),
);

// CHAPTER 10 — DEPLOYMENT
bodyChildren.push(
  ...chapterHeader(10, "Deployment and Maintenance"),
  h2("10.1", "Introduction"),
  p("VRIKAAN is continuously deployed to a production environment served at https://vrikaan.com. This chapter documents the deployment environment, the continuous-integration / continuous-deployment (CI/CD) pipeline, the maintenance and observability practices, and the user-help surface.", { firstLine: true }),

  h2("10.2", "Deployment Environment"),
  bullet([{ t: "Hosting: ", bold: true }, "Vercel (Free / Hobby tier). Static assets served from Vercel's global edge CDN; serverless functions execute in iad1 region (US-East)."]),
  bullet([{ t: "Identity + Database: ", bold: true }, "Firebase project secuvion (Auth + Firestore). Free Spark plan."]),
  bullet([{ t: "DNS: ", bold: true }, "vrikaan.com domain registered with a third-party registrar; DNS pointed to Vercel nameservers."]),
  bullet([{ t: "TLS: ", bold: true }, "automatic certificate issuance and renewal by Vercel via Let's Encrypt."]),
  bullet([{ t: "Email: ", bold: true }, "EmailJS for transactional sends; SPF / DKIM configured on the domain."]),

  h2("10.3", "CI/CD Pipeline (GitHub Actions Auto-Promote)"),
  p("Every push to the master branch triggers two parallel workflows: (a) Vercel automatically builds and deploys a new preview, and (b) a GitHub Actions workflow (.github/workflows/promote.yml) waits for a Ready Production deployment and promotes it to vrikaan.com using the Vercel CLI. The workflow uses three repository secrets — VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID — and is robust to ANSI-coded CLI output and to the GITHUB_ENV scoping rule that requires a separate step to read environment variables exported earlier.", { firstLine: true }),

  h2("10.4", "Maintenance and Observability"),
  bullet([{ t: "Sentry: ", bold: true }, "all unhandled errors and promise rejections in the browser are sent to a Sentry project; alerts are emailed to the maintainer."]),
  bullet([{ t: "Vercel Analytics + Speed Insights: ", bold: true }, "real-user metrics for first contentful paint and largest contentful paint."]),
  bullet([{ t: "Firestore backup: ", bold: true }, "scripts/backup-firestore.js exports every collection to a date-stamped JSON file; can be scheduled via GitHub Actions."]),
  bullet([{ t: "Activity-log cleanup: ", bold: true }, "weekly cron (cron-digest.js) deletes activity and tool-history entries older than 90 days."]),

  h2("10.5", "User Help"),
  p("In-product help comprises: (i) the AI chatbot accessible from every page; (ii) the contextual tool descriptions shown on each tool page; (iii) the phishing trainer with explanations after every quiz answer; (iv) a public Status page (vrikaan.com/status) summarising recent uptime; (v) an EmergencyHelp page with national cybercrime helpline numbers; and (vi) the Contact page with categorised submission types (general support, partnership, vulnerability disclosure).", { firstLine: true }),

  h2("10.6", "Summary"),
  p("Deployment and maintenance are entirely automated; the human maintainer's responsibility is reduced to monitoring Sentry alerts and to writing new features, which themselves auto-deploy on push.", { firstLine: true }),
);

// CHAPTER 11 — CONCLUSION
bodyChildren.push(
  ...chapterHeader(11, "Conclusion and Future Scope"),
  h2("11.1", "Conclusion"),
  p("VRIKAAN demonstrates that a well-chosen modern technology stack — React 19, Firebase, Vercel serverless, Cashfree — combined with disciplined engineering can deliver a production-grade, INR-native, bilingual cybersecurity SaaS platform that is competitive with established foreign suites on tool coverage and superior on price, language, and free-tier accessibility. The two principal engineering contributions documented in this report — the router pattern that hosts eighteen logical API actions inside the twelve-function Vercel hobby-tier limit, and the custom RFC 6238 TOTP implementation that provides NIST AAL2 protection without requiring the paid Firebase Identity Platform — were both proven to work in production for paying users.", { firstLine: true }),
  p("All seven primary project objectives were achieved within the academic year, and several stretch objectives (TOTP 2FA, outbound webhooks, multi-user team accounts, English + Hindi internationalisation foundation) were also delivered.", { firstLine: true }),

  h2("11.2", "Future Scope"),
  p("Table XII enumerates the principal future enhancements planned for the next major version of the platform.", { firstLine: true }),
  center("Table XII — Future Enhancements and Roadmap", { run: { bold: true, italics: true } }),
  makeTable(
    [3000, 6360],
    ["Enhancement", "Description"],
    [
      ["Full i18n",               "Extend Hindi translation to all 50+ pages; add Marathi and Tamil locales."],
      ["Native Mobile App",       "React Native wrapper offering native push, biometric unlock, offline scans."],
      ["ML Threat Score",         "Train a classifier on user-reported scams to auto-score new URLs and SMS."],
      ["Identity Platform MFA",   "Migrate to Firebase Identity Platform when MAU justifies cost; SMS + WebAuthn alongside TOTP."],
      ["More Webhook Events",     "scan.complete, breach.detected, invoice.paid, team.member.added."],
      ["Enterprise Tier",         "SSO (SAML), SCIM provisioning, dedicated SOC dashboards, contractual SLA."],
      ["Threat-Intelligence Feed","Subscribe to AlienVault OTX / abuse.ch and surface trending IOCs."],
      ["Personal AI Agent",       "Always-on agent that scans incoming email and SMS for the user proactively."],
    ],
  ),

  h2("11.3", "Final Summary"),
  p("VRIKAAN proves that two undergraduate engineers, working within the constraints of a single academic year and on entirely free-tier infrastructure, can ship a credible cybersecurity product that addresses a genuine and underserved market in India. The codebase, the tests, the deployment pipeline, the documentation, and the live site at vrikaan.com are now publicly available as a reference implementation for INR-native consumer SaaS architectures.", { firstLine: true }),
);

// REFERENCES
bodyChildren.push(
  pageBreak(),
  center("REFERENCES", { size: 36, run: { bold: true } }),
  blank(280),
);
const refs = [
  "Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs, Government of India, “National Cyber Crime Reporting Portal — Annual Statistics 2024,” [Online]. Available: https://cybercrime.gov.in",
  "D. M’Raihi, S. Machani, M. Pei, and J. Rydell, “TOTP: Time-Based One-Time Password Algorithm,” IETF RFC 6238, May 2011.",
  "P. Rosenberg, “The ‘otpauth’ URI Scheme,” IETF RFC 8959, December 2020.",
  "P. A. Grassi, M. E. Garcia, and J. L. Fenton, “Digital Identity Guidelines: Authentication and Lifecycle Management,” NIST Special Publication 800-63B, June 2017.",
  "OWASP Foundation, “OWASP Top 10 Web Application Security Risks,” 2021. [Online]. Available: https://owasp.org/Top10/",
  "Meta Platforms, “React 19 Documentation,” 2024. [Online]. Available: https://react.dev",
  "Google LLC, “Firebase Documentation: Authentication and Cloud Firestore,” 2024–2026. [Online]. Available: https://firebase.google.com/docs",
  "Vercel Inc., “Vercel Documentation: Serverless Functions,” 2024–2026. [Online]. Available: https://vercel.com/docs/functions",
  "Cashfree Payments India Pvt. Ltd., “Payment Gateway API Documentation,” 2024–2026. [Online]. Available: https://docs.cashfree.com/docs",
  "World Wide Web Consortium, “Web Cryptography API,” W3C Recommendation, January 2017. [Online]. Available: https://www.w3.org/TR/WebCryptoAPI/",
  "World Wide Web Consortium, “Service Workers,” W3C Working Draft, 2024. [Online]. Available: https://www.w3.org/TR/service-workers/",
  "World Wide Web Consortium, “Content Security Policy Level 3,” W3C Working Draft, 2024. [Online]. Available: https://www.w3.org/TR/CSP3/",
  "Have I Been Pwned (T. Hunt), “Pwned Passwords API v3 Documentation,” 2024. [Online]. Available: https://haveibeenpwned.com/API/v3",
  "T. Hunt, J. Bonneau, and others, “Beyond Passwords: A Decade of Authentication Research,” ACM Computing Surveys, vol. 56, no. 4, April 2024.",
  "S. Nikam, “VRIKAAN — Source Code Repository,” GitHub, 2026. [Online]. Available: https://github.com/sahilnikam2410/vrikaan",
];
refs.forEach((r, i) => {
  bodyChildren.push(new Paragraph({
    spacing: { after: 100, line: 280 },
    indent: { left: 480, hanging: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      T(`[${i + 1}] `, { bold: true, size: 22 }),
      T(r, { size: 22 }),
    ],
  }));
});

// APPENDIX A
bodyChildren.push(
  pageBreak(),
  center("APPENDIX A", { size: 36, run: { bold: true } }),
  center("Publications", { size: 28, run: { bold: true, italics: true } }),
  blank(280),
  p([
    "S. A. Nikam and A. D. Somvanshi, ",
    { t: "“VRIKAAN: An AI-Powered, Bilingual, Serverless Cyber Defense Platform for Indian Users,” ", italics: true },
    "submitted to the National Conference on Computer Engineering, Sandip University Nashik, 2026. (See attached research paper.)",
  ]),
);

// APPENDIX B — GLOSSARY
bodyChildren.push(
  pageBreak(),
  center("APPENDIX B", { size: 36, run: { bold: true } }),
  center("Glossary of Abbreviations", { size: 28, run: { bold: true, italics: true } }),
  blank(280),
);
const glossary = [
  ["AAL2",      "Authenticator Assurance Level 2 (NIST SP 800-63B)"],
  ["API",       "Application Programming Interface"],
  ["CDN",       "Content Delivery Network"],
  ["CSP",       "Content Security Policy"],
  ["CSV",       "Comma-Separated Values"],
  ["DFD",       "Data-Flow Diagram"],
  ["DPDP",      "Digital Personal Data Protection (Indian Act, 2023)"],
  ["GDPR",      "General Data Protection Regulation (EU)"],
  ["HMAC",      "Hash-based Message Authentication Code"],
  ["HSTS",      "HTTP Strict Transport Security"],
  ["I4C",       "Indian Cyber Crime Coordination Centre"],
  ["INR",       "Indian Rupee"],
  ["IOC",       "Indicator of Compromise"],
  ["JSON",      "JavaScript Object Notation"],
  ["MFA",       "Multi-Factor Authentication"],
  ["NIST",      "National Institute of Standards and Technology (US)"],
  ["OAuth",     "Open Authorization"],
  ["OSINT",     "Open-Source Intelligence"],
  ["OWASP",     "Open Worldwide Application Security Project"],
  ["PWA",       "Progressive Web App"],
  ["RBAC",      "Role-Based Access Control"],
  ["RFC",       "Request For Comments (IETF specification)"],
  ["SaaS",      "Software-as-a-Service"],
  ["SAML",      "Security Assertion Markup Language"],
  ["SCIM",      "System for Cross-domain Identity Management"],
  ["SDLC",      "Software Development Life Cycle"],
  ["SIEM",      "Security Information and Event Management"],
  ["SLA",       "Service Level Agreement"],
  ["SOC",       "Security Operations Center"],
  ["SPA",       "Single-Page Application"],
  ["SSO",       "Single Sign-On"],
  ["TLS",       "Transport Layer Security"],
  ["TOTP",      "Time-based One-Time Password (RFC 6238)"],
  ["UPI",       "Unified Payments Interface"],
  ["VAPID",     "Voluntary Application Server Identification"],
  ["WHOIS",     "Domain registration lookup protocol"],
];
glossary.forEach(([abbr, full]) => {
  bodyChildren.push(new Paragraph({
    spacing: { after: 60, line: 280 },
    tabStops: [{ type: TabStopType.LEFT, position: 1800 }],
    children: [
      T(abbr, { bold: true, size: 22 }),
      T(`\t${full}`, { size: 22 }),
    ],
  }));
});

// ────────────────────────────────────────────────────────────────────
// BUILD DOCUMENT
// ────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Sahil Anil Nikam",
  title: "VRIKAAN — Final-Year Project Black Book",
  description: "Final-year project report for Sandip University Nashik, B.E. (CSE), 2025-26.",

  styles: {
    default: { document: { run: { font: FONT_BODY, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONT_BODY },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT_BODY },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },

  numbering: {
    config: [
      { reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },

  sections: [
    // ─── 1. Title Page ────────────────────────────────────────
    titleSection,

    // ─── 2. Preliminaries (lower-roman page numbers) ──────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1440 },
          pageNumbers: { start: 2, formatType: NumberFormat.LOWER_ROMAN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [T("https://vrikaan.com/", { italics: true, size: 18, color: "64748B" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              T("", { size: 18, color: "64748B" }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: "64748B" }),
            ],
          })],
        }),
      },
      children: prelimChildren,
    },

    // ─── 3. Body (decimal page numbers, restart at 1) ─────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1440 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [T("https://vrikaan.com/", { italics: true, size: 18, color: "64748B" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: "64748B" }),
            ],
          })],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// Output
(async () => {
  const buf = await Packer.toBuffer(doc);
  const primary = "E:/SECUVION/vrikaan-blackbook.docx";
  const fallback = "E:/SECUVION/scripts/ppt/vrikaan-blackbook.docx";
  try {
    fs.writeFileSync(primary, buf);
    console.log("Wrote", primary, "(", buf.length, "bytes )");
  } catch (e) {
    if (e.code === "EBUSY") {
      fs.writeFileSync(fallback, buf);
      console.log("Primary path locked. Wrote fallback:", fallback);
    } else { throw e; }
  }
})();
