/**
 * VRIKAAN — IEEE-style Research Paper Generator
 * Output: E:/SECUVION/vrikaan-research-paper.docx
 *
 * Run: node scripts/ppt/build-paper.cjs
 */
const fs = require("node:fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  ExternalHyperlink, TabStopType, TabStopPosition,
} = require("docx");

// ─── Helpers ────────────────────────────────────────────────────────
const FONT_BODY = "Times New Roman";
const FONT_MONO = "Consolas";

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 280 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT_BODY, size: 22, ...opts.run })],
    ...opts.para,
  });
}

function center(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT_BODY, size: opts.size || 22, ...opts.run })],
  });
}

function h1(num, text) {
  // Empty num → unnumbered (e.g. Acknowledgments, References)
  const labeled = num ? `${num}. ${text}` : text;
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: labeled, font: FONT_BODY, size: 24, bold: true, allCaps: true })],
  });
}

function h2(num, text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: `${num} ${text}`, font: FONT_BODY, size: 22, bold: true, italics: true })],
  });
}

// Inline fragments helper — bold/italic spans inside a justified paragraph
function par(...runs) {
  return new Paragraph({
    spacing: { after: 120, line: 280 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs.map((r) => typeof r === "string"
      ? new TextRun({ text: r, font: FONT_BODY, size: 22 })
      : new TextRun({ font: FONT_BODY, size: 22, ...r })),
  });
}

// Code block — single paragraph, monospace, light shading
function code(lines) {
  return new Paragraph({
    spacing: { before: 120, after: 160, line: 260 },
    alignment: AlignmentType.LEFT,
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    children: lines.flatMap((ln, i) => {
      const runs = [new TextRun({ text: ln, font: FONT_MONO, size: 18 })];
      if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
      return runs;
    }),
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 280 },
    children: [new TextRun({ text, font: FONT_BODY, size: 22 })],
  });
}

function refItem(num, text) {
  return new Paragraph({
    spacing: { after: 100, line: 260 },
    indent: { left: 480, hanging: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: `[${num}] `, font: FONT_BODY, size: 20, bold: true }),
      new TextRun({ text, font: FONT_BODY, size: 20 }),
    ],
  });
}

// Table builder
function tableHeader(text) {
  return new TableCell({
    width: { size: 1, type: WidthType.AUTO },
    shading: { type: ShadingType.CLEAR, fill: "1E3A8A" },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: FONT_BODY, size: 20, bold: true, color: "FFFFFF" })],
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
      children: [new TextRun({ text, font: FONT_BODY, size: 20, bold: !!opts.bold })],
    })],
  });
}
function makeTable(columnWidthsDxa, headers, rows, opts = {}) {
  const totalWidth = columnWidthsDxa.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" };
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
  // Re-build cells with explicit DXA widths
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
          { fill: ri % 2 === 1 ? "F8FAFC" : undefined, ...(typeof cell === "object" ? cell : {}) }
        )),
      })),
    ],
  });
}

// ─── Document ───────────────────────────────────────────────────────
const doc = new Document({
  creator: "Sahil Anil Nikam",
  title: "VRIKAAN: An AI-Powered, Bilingual, Serverless Cyber Defense Platform",
  description: "IEEE-style research paper on the VRIKAAN cybersecurity SaaS platform.",

  styles: {
    default: { document: { run: { font: FONT_BODY, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT_BODY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, italics: true, font: FONT_BODY },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ],
  },

  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
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
          children: [
            new TextRun({ text: "Sandip University Nashik — Final-Year Project Research Paper", font: FONT_BODY, size: 18, italics: true, color: "64748B" }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "vrikaan.com  •  github.com/sahilnikam2410/vrikaan  •  x.com/vrikaan  •  linkedin.com/company/vrikaan-ai-cybersecurity", font: FONT_BODY, size: 16, color: "64748B" }),
              new TextRun({ text: "\tPage ", font: FONT_BODY, size: 16, color: "64748B" }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 16, color: "64748B" }),
            ],
          }),
        ],
      }),
    },
    children: [
      // ─── TITLE BLOCK ──────────────────────────────────────────
      center("VRIKAAN: An AI-Powered, Bilingual, Serverless", { size: 32, run: { bold: true } }),
      center("Cyber Defense Platform for Indian Users", { size: 32, run: { bold: true } }),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      center("Sahil Anil Nikam", { size: 24, run: { bold: true } }),
      center("Department of Computer Engineering"),
      center("Sandip University, Nashik, Maharashtra, India"),
      center("PRN: 220105131264"),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
        children: [
          new ExternalHyperlink({
            children: [new TextRun({ text: "hello@vrikaan.com", font: FONT_BODY, size: 22, color: "0891B2", underline: {} })],
            link: "mailto:hello@vrikaan.com",
          }),
          new TextRun({ text: "  |  Live: ", font: FONT_BODY, size: 22 }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "https://vrikaan.com", font: FONT_BODY, size: 22, color: "0891B2", underline: {} })],
            link: "https://vrikaan.com",
          }),
        ],
      }),

      // ─── ABSTRACT ─────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 280 },
        children: [
          new TextRun({ text: "Abstract—", font: FONT_BODY, size: 22, bold: true, italics: true }),
          new TextRun({ text: "India faces a rapidly escalating cybercrime crisis with reported losses exceeding ₹11,000 crore in 2024 (I4C/NCRP) and 70% year-over-year growth, yet existing consumer-grade defense tools remain fragmented, foreign-priced, English-only, and reactive. This paper presents VRIKAAN, a production-deployed cybersecurity Software-as-a-Service (SaaS) platform that consolidates over fifty discrete security utilities — including DNS-leak detection, breach lookup, password vaulting, phishing simulation, and dark-web monitoring — under a single bilingual (English + Hindi) interface backed by AI-assisted explanations. The platform implements a custom Time-based One-Time Password (TOTP) two-factor authentication scheme, signed outbound webhooks (HMAC-SHA256), and Indian Rupee (INR) native payment processing via Cashfree. We make three engineering contributions: (i) a router pattern that hosts eighteen logical API actions inside the twelve-function Vercel hobby-tier limit, (ii) a custom TOTP enrollment flow that achieves NIST SP 800-63B Authenticator Assurance Level 2 without requiring the paid Firebase Identity Platform, and (iii) a self-serve refund pipeline gated by server-side ownership verification and a seven-day window. The platform has been continuously deployed to production at vrikaan.com.",
            font: FONT_BODY, size: 22 }),
        ],
      }),

      par(
        { text: "Index Terms—", bold: true, italics: true },
        "Cybersecurity, Software-as-a-Service, Serverless Computing, React, Firebase, Time-based One-Time Password (TOTP), Two-Factor Authentication, Phishing Detection, Bilingual User Interface, India, Vercel, Cashfree.",
      ),

      // ─── I. INTRODUCTION ──────────────────────────────────────
      h1("I", "Introduction"),
      par(
        "The Indian Computer Emergency Response Team (CERT-In) and the Indian Cyber Crime Coordination Centre (I4C) report that financial losses attributed to cybercrime in India exceeded ₹11,000 crore (approximately USD 1.32 billion) during the 2024 calendar year, marking a year-over-year growth of greater than 70% [1]. The volume of incidents — ranging from phishing fraud and SIM-swap account takeover to ransomware and unauthorized data exfiltration — disproportionately affects students, small business owners, and first-generation Internet users, demographics that simultaneously represent the fastest-growing segment of new web users in the country.",
      ),
      par(
        "Despite this growth in threat surface, the consumer cybersecurity software market remains structurally misaligned with the Indian context. Established suites such as ",
        { text: "Norton 360", italics: true }, ", ", { text: "McAfee Total Protection", italics: true }, ", ", { text: "Bitdefender", italics: true },
        ", and password management tools such as ", { text: "1Password", italics: true }, " are priced in foreign currencies (typically USD 80–150 per year, or ₹6,500–12,000 in INR), localized only into English, and historically focused on antivirus and VPN as their primary value propositions. Modular per-tool services such as ",
        { text: "HaveIBeenPwned", italics: true }, " offer free single-purpose lookups but lack a unified interface, education layer, or payment integration suitable for monetization in the Indian market.",
      ),
      par(
        "This paper presents VRIKAAN — a production-deployed, full-stack cybersecurity SaaS that closes the identified gap. Section II surveys related work and existing solutions. Section III describes the three-layer system architecture and the constraints imposed by the Vercel hobby-tier serverless function limit. Section IV details the methodology, technology stack, and database schema. Section V documents the security measures implemented within the platform itself. Section VI evaluates the implementation against quantitative engineering metrics. Section VII outlines the future-work roadmap, and Section VIII concludes.",
      ),

      // ─── II. LITERATURE REVIEW ────────────────────────────────
      h1("II", "Literature Review and Related Work"),
      par(
        "Existing consumer cybersecurity offerings in the Indian market can be classified along four axes: (a) breadth of tools offered, (b) annual subscription pricing in INR, (c) localization of the user interface, and (d) the existence of a meaningful free tier. Table I summarizes a representative survey conducted between November 2025 and April 2026.",
      ),

      // Table I — competitor comparison
      center("TABLE I", { run: { bold: true } }),
      center("Comparative Survey of Consumer Cybersecurity Solutions", { run: { italics: true, bold: true } }),
      makeTable(
        [1700, 1900, 1700, 1300, 1100, 1660], // sums to ~9360 DXA
        ["Solution", "Tools Offered", "INR Pricing", "Languages", "Free Tier", "Limitation"],
        [
          ["Norton 360",          "AV, VPN, password",       "~₹2,000/yr", "English", "No",       "Heavy install footprint"],
          ["McAfee Total",        "AV, identity",            "~₹2,500/yr", "English", "No",       "Bloatware reputation"],
          ["Bitdefender",         "AV, VPN, anti-tracker",   "~₹2,200/yr", "English", "Trial",    "Web tools limited"],
          ["1Password",           "Password manager only",   "~₹3,000/yr", "English", "No",       "Single-purpose"],
          ["NordVPN + NordPass",  "VPN + passwords",         "~₹4,500/yr", "English", "No",       "Two products, two bills"],
          ["HaveIBeenPwned",      "Breach lookup only",      "Free",       "English", "Yes",      "No UI suite, no auth"],
          [{ t: "VRIKAAN (this work)", bold: true }, { t: "50+ tools, AI, teams", bold: true }, { t: "₹0–₹990/yr", bold: true }, { t: "English + Hindi", bold: true }, { t: "Yes", bold: true }, { t: "All-in-one, INR-native", bold: true }],
        ],
      ),

      par(
        "From a standards perspective, the implementation of two-factor authentication in this work follows the Time-based One-Time Password (TOTP) algorithm specified in IETF RFC 6238 [2], which derives a six-digit code from an HMAC-SHA1 truncation of the current Unix time divided by a thirty-second window. The provisioning URI scheme used to encode the shared secret in QR codes is defined informally in Google's ",
        { text: "key-uri-format", italics: true },
        " specification and was later formalized in RFC 8959 [3]. The National Institute of Standards and Technology guidelines NIST SP 800-63B [4] classify TOTP authenticators as Authenticator Assurance Level 2 (AAL2) when paired with a memorized secret. The OWASP Top 10 (2021) [5] informed the threat model used during the implementation of access control, authentication, and supply-chain protections.",
      ),
      par(
        "The platform itself is built on the React 19 user-interface library [6], the Firebase backend-as-a-service suite (Authentication and Cloud Firestore) [7], and the Vercel serverless deployment platform [8]. Indian Rupee payment processing is delegated to the Cashfree Payments aggregator [9]. The Web Cryptography API [10], the Service Worker specification [11], and the Content Security Policy Level 3 specification [12] govern, respectively, the platform's password hashing, runtime caching, and resource-loading restrictions.",
      ),

      // ─── III. SYSTEM ARCHITECTURE ─────────────────────────────
      h1("III", "System Architecture"),
      par(
        "VRIKAAN follows a three-layer serverless architecture, deliberately constructed to operate entirely within the free or hobby tiers of its underlying providers in order to keep the marginal cost per user below the revenue per paid user.",
      ),

      h2("A.", "Client Layer"),
      par(
        "The client layer is a single-page React 19 application bundled with Vite 7. A service worker (Service Worker API [11]) precaches the application shell and provides a runtime network-first cache with a five-minute time-to-live for selected idempotent endpoints (e.g., /api/tools?tool=ip and /api/tools?tool=leak-check). Internationalization is implemented via the react-i18next library with English and Hindi resource bundles and locale persistence in localStorage.",
      ),

      h2("B.", "API Layer (Vercel Serverless)"),
      par(
        "The Vercel free tier enforces a hard upper bound of twelve serverless function files per project. Naively allocating one file per logical action would have exhausted this budget after the first six features. To accommodate eighteen distinct actions within the same constraint, a router pattern was implemented in api/tools.js. A single dispatcher function inspects the ?tool= query parameter and delegates to the corresponding handler function, while sharing a common rate-limit middleware and a common bearer-token authentication path.",
      ),
      code([
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
        "  // ... 9 more actions",
        "};",
        "export default async function handler(req, res) {",
        "  const tool = req.query.tool;",
        "  if (!HANDLERS[tool]) return res.status(400).json({ error: 'Unknown tool' });",
        "  // ... shared rate limiting + auth",
        "  return HANDLERS[tool](req, res);",
        "}",
      ]),

      h2("C.", "Data and Third-Party Layer"),
      par(
        "Persistent state is stored in Cloud Firestore. Identity is delegated to Firebase Authentication, which supports email-password, phone OTP, three OAuth providers (Google, GitHub, Facebook), and email-link passwordless sign-in out of the box. Outbound calls to third-party APIs (Cashfree for payments, ipinfo for geolocation, haveibeenpwned for breach lookup) are made server-side so that API secrets never reach the browser.",
      ),

      // ─── IV. METHODOLOGY ──────────────────────────────────────
      h1("IV", "Methodology and Implementation"),
      par(
        "Development followed an iterative Agile workflow consisting of five recurring phases: plan, build, test, ship, observe. Every code change was tracked in Git, automatically built by Vercel, validated by Vitest unit tests, and then promoted to the production domain by a GitHub Actions workflow. Sentry telemetry closes the observability loop by surfacing unhandled exceptions in production.",
      ),

      h2("A.", "Technology Stack"),
      par(
        "The complete technology stack is summarized in Table II.",
      ),
      center("TABLE II", { run: { bold: true } }),
      center("Technology Stack Summary", { run: { italics: true, bold: true } }),
      makeTable(
        [2400, 3200, 3760],
        ["Layer", "Component", "Purpose"],
        [
          ["Frontend",     "React 19 + Vite 7",                "UI rendering, dev hot-reload, prod minification"],
          ["Frontend",     "react-i18next",                    "EN/HI locale switching with persistence"],
          ["Frontend",     "Recharts, Three.js, react-icons",  "Charts, 3D threat globe, iconography"],
          ["Backend",      "Vercel Functions (Node 20)",       "12 serverless routes, router pattern"],
          ["Backend",      "Firebase Auth + Firestore",        "Identity, user data, security rules"],
          ["Backend",      "Firebase Admin SDK",               "Privileged server-side writes"],
          ["Integration",  "Cashfree Payments",                "INR UPI, cards, netbanking"],
          ["Integration",  "EmailJS",                          "Transactional email delivery"],
          ["Integration",  "Sentry, Cloudflare Turnstile",     "Telemetry, CAPTCHA"],
          ["Quality",      "Vitest + React Testing Library",   "Unit + component tests"],
          ["CI/CD",        "GitHub Actions",                   "Auto-promote production deployments"],
        ],
      ),

      h2("B.", "Database Schema"),
      par(
        "Firestore is a document-oriented database with hierarchical collection paths. Table III enumerates the principal collections used by VRIKAAN.",
      ),
      center("TABLE III", { run: { bold: true } }),
      center("Firestore Collection Schema", { run: { italics: true, bold: true } }),
      makeTable(
        [3000, 3360, 3000],
        ["Collection", "Key Fields", "Access Pattern"],
        [
          ["users/{uid}",                     "name, email, phone, plan, mfa, currentTeamId, webhook",  "Owner R/W; admin R/W"],
          ["users/{uid}/devices/{id}",        "name, type, browser, os, model, gpu, ram, cpu",          "Owner R/W"],
          ["users/{uid}/payments/{id}",       "orderId, amount, plan, status, refunded, refundId",      "Owner R, server W"],
          ["users/{uid}/toolHistory/{id}",    "tool, input, result, timestamp",                         "Owner R/W"],
          ["users/{uid}/activity/{id}",       "type, detail, timestamp",                                "Owner R/W; cron purges >90d"],
          ["users/{uid}/apikeys/{token}",     "label, createdAt, lastUsed",                             "Owner R/W"],
          ["teams/{teamId}",                  "name, ownerUid, members, memberEmails",                   "Member R; server W only"],
          ["teamInvites/{inviteId}",          "teamId, email, status, invitedBy",                       "Invitee R; server W only"],
          ["coupons/{CODE}",                  "percentOff, flatOff, active, expiresAt, plans",          "Public single-doc R; admin W"],
        ],
      ),

      h2("C.", "Security Rules"),
      par(
        "Firestore security rules are evaluated by the Firebase backend on every read and write request, providing a database-level enforcement layer that cannot be bypassed by malicious client code. The simplified pattern used to enforce ownership of personal data is:",
      ),
      code([
        "match /users/{uid} {",
        "  allow read, write: if isOwner(uid) || isAdmin();",
        "  match /payments/{payId} {",
        "    allow read:   if isOwner(uid) || isAdmin();",
        "    allow create: if isOwner(uid);",
        "    allow update, delete: if isAdmin(); // history is immutable to user",
        "  }",
        "}",
        "match /teams/{teamId} {",
        "  allow read: if isSignedIn() && request.auth.uid in resource.data.members;",
        "  allow create, update, delete: if false; // server-only",
        "}",
      ]),

      h2("D.", "TOTP Enrollment Flow"),
      par(
        "Two-factor authentication is implemented as a custom flow using the open-source ", { text: "otpauth", italics: true }, " library, avoiding the cost of Firebase Identity Platform's paid multi-factor authentication tier. The enrollment flow is server-stateless: the secret returned by /api/tools?tool=totp-setup is held only by the client until it is echoed back together with the first valid six-digit code via /api/tools?tool=totp-confirm, at which point the secret and ten one-time backup codes are persisted to the user document.",
      ),
      code([
        "// api/tools.js — handleTotpSetup (excerpt)",
        "const otpauth = await import('otpauth');",
        "const secret = new otpauth.Secret({ size: 20 }); // 160-bit",
        "const totp = new otpauth.TOTP({",
        "  issuer: 'VRIKAAN', label: user.email,",
        "  algorithm: 'SHA1', digits: 6, period: 30, secret,",
        "});",
        "const qrDataUri = await QRCode.toDataURL(totp.toString());",
        "return res.status(200).json({ secret: secret.base32, qrDataUri });",
      ]),

      // ─── V. SECURITY MEASURES ─────────────────────────────────
      h1("V", "Security Measures"),
      par(
        "The product itself is hardened to the standards it teaches. Eight measures are documented in Table IV; their detailed motivations follow.",
      ),
      center("TABLE IV", { run: { bold: true } }),
      center("Implemented Security Measures", { run: { italics: true, bold: true } }),
      makeTable(
        [3000, 6360],
        ["Measure", "Implementation"],
        [
          ["TOTP 2FA",            "RFC 6238, otpauth library, SHA-1, 30-second period, 6 digits, ±1 window for clock skew, 10 backup codes"],
          ["Magic-link login",    "Firebase sendSignInLinkToEmail; passwordless; email verification via continue URL"],
          ["HMAC webhooks",       "Outbound POST signed sha256(secret + body); X-Vrikaan-Signature header; receivers verify"],
          ["Strict CSP",          "default-src 'self'; per-domain allowlists for connect-src, script-src, frame-src, form-action"],
          ["Rate limiting",       "IP- and user-tier buckets: 20/60/200/600 requests per minute; 429 with Retry-After"],
          ["Firestore rules",     "Owner-scoped read/write; server-only writes for teams, coupons, payments"],
          ["Self-serve refund",   "Bearer ID token verified server-side; 7-day window; ownership of orderId required"],
          ["Email verification gate", "Tool endpoints return 403 until user.emailVerified is true; reduces fake signups"],
        ],
      ),
      par(
        "The chosen TOTP parameters (HMAC-SHA1, 30-second period, six digits) align with NIST SP 800-63B [4] guidance for AAL2 and with the de-facto interoperability profile supported by Google Authenticator, Authy, 1Password, and the FreeOTP open-source authenticator. Backup codes are eight characters drawn from the unambiguous Base32 alphabet (excluding 0, 1, I, O); each is single-use and removed from the user document upon successful verification.",
      ),
      par(
        "Outbound webhooks attach a X-Vrikaan-Signature header containing the lowercase hexadecimal HMAC-SHA256 digest of the raw request body keyed by the recipient's per-user secret. Receivers verify the signature in constant time, mitigating both replay attacks (in combination with a sufficiently fine-grained timestamp) and signature forgery via length-extension attacks (which HMAC, by construction, prevents).",
      ),

      // ─── VI. RESULTS ──────────────────────────────────────────
      h1("VI", "Results and Evaluation"),
      par(
        "Quantitative engineering metrics, captured at the time of paper preparation, are presented in Table V. The platform is continuously deployed to ", { text: "https://vrikaan.com", italics: true }, " and has remained in the production environment without rollback throughout the documented sprint.",
      ),
      center("TABLE V", { run: { bold: true } }),
      center("Engineering Metrics", { run: { italics: true, bold: true } }),
      makeTable(
        [4400, 4960],
        ["Metric", "Value"],
        [
          ["Major features shipped (sprint)",    "18"],
          ["Vitest unit + component tests",      "33 / 33 passing"],
          ["Vercel functions used / cap",        "12 / 12 (router pattern absorbs 7 actions)"],
          ["Production build duration",          "< 2 minutes (esbuild minify, manual chunks)"],
          ["Service Worker API cache TTL",       "5 minutes (whitelisted GET endpoints)"],
          ["Activity log retention",             "90 days, weekly cron purge"],
          ["Languages supported (UI)",           "2 (English, Hindi); ~70 string keys"],
          ["Authentication factors supported",   "5 (password, Google, GitHub, phone OTP, magic link) + TOTP MFA"],
        ],
      ),
      par(
        "Qualitatively, the platform improves upon the surveyed alternatives along all four axes identified in Section II: it offers more tools (50+ versus the 1–4 of single-purpose competitors), is priced lower (₹0 free, ₹490/year Pro, ₹990/year Enterprise versus ₹2,000–4,500 for foreign suites), supports an Indian language alongside English, and offers a meaningful free tier rather than a time-bounded trial.",
      ),
      par(
        "From an operational standpoint, the GitHub Actions auto-promote workflow has consistently delivered new commits to the production domain within 60 seconds of a successful Vercel build, with no manual promotion step required after the initial onboarding of three repository secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID).",
      ),

      // ─── VII. FUTURE WORK ─────────────────────────────────────
      h1("VII", "Future Work"),
      par("Eight directions are planned for the next major version of the platform:"),
      bullet("Expand internationalization to cover the full set of 50+ pages, and add Marathi and Tamil locales to serve additional Indian linguistic communities."),
      bullet("Deliver a React Native mobile application offering native push notifications, biometric unlock, and offline-capable scans."),
      bullet("Train a machine-learning classifier on user-reported scams (a labeled corpus accumulated through the existing Phishing Trainer module) to provide automated threat scores for newly submitted URLs and SMS messages."),
      bullet("Migrate two-factor authentication to Firebase Identity Platform once user volume justifies the per-MAU cost, enabling SMS and WebAuthn factors alongside the existing TOTP."),
      bullet("Expand the outbound webhook event catalog from the current single payment.refunded event to include scan.complete, breach.detected, invoice.paid, and team.member.added."),
      bullet("Introduce an Enterprise tier offering Single Sign-On (SAML), System for Cross-domain Identity Management (SCIM) provisioning, dedicated Security Operations Center dashboards, and a contractual Service Level Agreement."),
      bullet("Subscribe to open-source threat-intelligence feeds (e.g., AlienVault OTX, abuse.ch) and surface trending indicators of compromise in the user dashboard."),
      bullet("Deploy a personal AI agent that proactively scans a user's incoming email and SMS, raising alerts before the user takes action."),

      // ─── VIII. CONCLUSION ─────────────────────────────────────
      h1("VIII", "Conclusion"),
      par(
        "This paper has presented VRIKAAN, an end-to-end cybersecurity SaaS platform designed for the Indian consumer market. The principal contributions are: (i) a router-pattern API design that hosts eighteen logical actions inside the twelve-function Vercel hobby-tier limit without architectural compromise; (ii) a custom TOTP-based two-factor authentication implementation that delivers NIST AAL2 functionality without reliance on a paid identity-platform subscription; and (iii) a self-serve refund pipeline that enforces ownership and a seven-day window entirely on the server side, removing manual support intervention from the common-case refund flow.",
      ),
      par(
        "By combining over fifty tools with a bilingual interface, INR-native payments, education-first design, and a production-grade engineering pipeline, VRIKAAN demonstrates that a single undergraduate engineer can build a credible cybersecurity product that addresses an underserved market — without venture capital and without a subscription to any non-free infrastructure tier.",
      ),

      // ─── ACKNOWLEDGMENTS ──────────────────────────────────────
      h1("", "Acknowledgments"),
      par(
        "The author gratefully acknowledges the faculty of the Department of Computer Engineering at Sandip University, Nashik, for guidance, code review, and project mentorship throughout the development cycle. The open-source maintainers of React, Vite, Firebase client libraries, otpauth, react-i18next, vitest, and pptxgenjs deserve recognition for releasing the libraries that make a project of this scope feasible for a single developer. The Cashfree Payments support team provided technical assistance during sandbox-to-production migration of the payment-verification webhook.",
      ),

      // ─── REFERENCES ───────────────────────────────────────────
      h1("", "References"),
      refItem("1",  "Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs, Government of India, “National Cyber Crime Reporting Portal — Annual Statistics 2024,” [Online]. Available: https://cybercrime.gov.in"),
      refItem("2",  "D. M’Raihi, S. Machani, M. Pei, and J. Rydell, “TOTP: Time-Based One-Time Password Algorithm,” IETF RFC 6238, May 2011."),
      refItem("3",  "P. Rosenberg, “The ‘otpauth’ URI Scheme,” IETF RFC 8959, Dec. 2020."),
      refItem("4",  "P. A. Grassi, M. E. Garcia, and J. L. Fenton, “Digital Identity Guidelines: Authentication and Lifecycle Management,” NIST Special Publication 800-63B, Jun. 2017."),
      refItem("5",  "OWASP Foundation, “OWASP Top 10 Web Application Security Risks,” 2021. [Online]. Available: https://owasp.org/Top10/"),
      refItem("6",  "Meta Platforms, “React 19 Documentation,” 2024. [Online]. Available: https://react.dev"),
      refItem("7",  "Google LLC, “Firebase Documentation: Authentication and Cloud Firestore,” 2024–2026. [Online]. Available: https://firebase.google.com/docs"),
      refItem("8",  "Vercel Inc., “Vercel Documentation: Serverless Functions,” 2024–2026. [Online]. Available: https://vercel.com/docs/functions"),
      refItem("9",  "Cashfree Payments India Pvt. Ltd., “Payment Gateway API Documentation,” 2024–2026. [Online]. Available: https://docs.cashfree.com/docs"),
      refItem("10", "World Wide Web Consortium, “Web Cryptography API,” W3C Recommendation, Jan. 2017. [Online]. Available: https://www.w3.org/TR/WebCryptoAPI/"),
      refItem("11", "World Wide Web Consortium, “Service Workers,” W3C Working Draft, 2024. [Online]. Available: https://www.w3.org/TR/service-workers/"),
      refItem("12", "World Wide Web Consortium, “Content Security Policy Level 3,” W3C Working Draft, 2024. [Online]. Available: https://www.w3.org/TR/CSP3/"),
      refItem("13", "Have I Been Pwned (T. Hunt), “Pwned Passwords API v3 Documentation,” 2024. [Online]. Available: https://haveibeenpwned.com/API/v3"),
      refItem("14", "T. Hunt, J. Bonneau, and others, “Beyond Passwords: A Decade of Authentication Research,” ACM Computing Surveys, vol. 56, no. 4, Apr. 2024."),
      refItem("15", "S. Nikam, “VRIKAAN — Source Code Repository,” GitHub, 2026. [Online]. Available: https://github.com/sahilnikam2410/vrikaan"),
    ],
  }],
});

(async () => {
  const buf = await Packer.toBuffer(doc);
  const primary = "E:/SECUVION/vrikaan-research-paper.docx";
  const fallback = "E:/SECUVION/scripts/ppt/vrikaan-research-paper.docx";
  try {
    fs.writeFileSync(primary, buf);
    console.log("Wrote", primary, "(", buf.length, "bytes )");
  } catch (e) {
    if (e.code === "EBUSY") {
      fs.writeFileSync(fallback, buf);
      console.log("Primary path locked (file open in Word). Wrote fallback:", fallback);
    } else { throw e; }
  }
})();
