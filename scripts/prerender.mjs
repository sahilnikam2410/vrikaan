// VRIKAAN prerender — runs after `vite build` as a postbuild hook.
//
// Problem it solves: react-helmet-async mutates <head> on the client, but
// social-share crawlers (Facebook, Twitter/X, LinkedIn, WhatsApp, Slack,
// Discord, Telegram) don't execute JavaScript. They only see the static
// meta tags in the initial index.html response. That means every page on
// the SPA would otherwise share as the generic "VRIKAAN - AI-Powered
// Cyber Defense Platform" card.
//
// Fix: for every known route (blog posts, threat pages, primary public
// pages), generate dist/<route>/index.html containing the route-specific
// <title>, <meta description>, og:*, twitter:*, canonical, and JSON-LD
// baked into the static HTML. Vercel's static file serving finds these
// before falling through to the SPA rewrite, so crawlers get perfect
// per-page metadata while real users still get the hydrated SPA.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const INDEX = path.join(DIST, "index.html");
const SITE = "https://vrikaan.com";
const SITE_NAME = "VRIKAAN";

// ---------- helpers ----------

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const htmlEscape = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const ogUrl = ({ title, subtitle, category }) => {
  const p = new URLSearchParams();
  if (title) p.set("title", title);
  if (subtitle) p.set("subtitle", subtitle);
  if (category) p.set("category", category);
  return `${SITE}/api/og?${p.toString()}`;
};

// Rewrite the base index.html meta tags for a specific route.
function rewriteMeta(baseHtml, meta) {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType = "website",
    jsonLd,
    noindex = false,
  } = meta;

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${htmlEscape(title)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${htmlEscape(description)}$2`
    )
    .replace(
      /(<meta property="og:type" content=")[^"]*(")/,
      `$1${htmlEscape(ogType)}$2`
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${htmlEscape(canonical)}$2`
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${htmlEscape(title)}$2`
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${htmlEscape(description)}$2`
    )
    .replace(
      /(<meta property="og:image" content=")[^"]*(")/,
      `$1${htmlEscape(ogImage)}$2`
    )
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${htmlEscape(title)}$2`
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${htmlEscape(description)}$2`
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]*(")/,
      `$1${htmlEscape(ogImage)}$2`
    )
    .replace(
      /(<meta name="robots" content=")[^"]*(")/,
      `$1${noindex ? "noindex, nofollow" : "index, follow"}$2`
    );

  // Canonical link — add or replace.
  if (canonical) {
    if (/<link rel="canonical"/.test(html)) {
      html = html.replace(
        /<link rel="canonical" href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${htmlEscape(canonical)}" />`
      );
    } else {
      html = html.replace(
        /<\/head>/,
        `    <link rel="canonical" href="${htmlEscape(canonical)}" />\n  </head>`
      );
    }
  }

  // JSON-LD structured data (one <script> per schema).
  if (jsonLd && jsonLd.length) {
    const blocks = jsonLd
      .map(
        (d) =>
          `    <script type="application/ld+json">${JSON.stringify(d)}</script>`
      )
      .join("\n");
    html = html.replace(/<\/head>/, `${blocks}\n  </head>`);
  }

  return html;
}

function writeRoute(route, html) {
  const clean = route.replace(/^\/+/, "");
  // Root "/" — never overwrite dist/index.html; Vite's build output already
  // has clean homepage meta tags, and this keeps builds idempotent.
  if (!clean) return;
  const outDir = path.join(DIST, clean);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}

// ---------- extract blog article metadata from Blog.jsx ----------

function extractArticles() {
  const src = fs
    .readFileSync(path.join(ROOT, "src/assets/pages/Blog.jsx"), "utf8")
    .replace(/\r\n/g, "\n"); // normalize CRLF (Windows working copies) → LF
  const m = src.match(/export const articles = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error("[prerender] articles array not found in Blog.jsx");
  const body = m[1];

  // Each article starts with `\n  {\n    id: N,`
  const blocks = body.split(/\n  \{\n/).slice(1);

  return blocks
    .map((b) => {
      const grab = (key) =>
        b.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
      const unescape = (s) =>
        s == null ? s : s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      const title = unescape(grab("title"));
      const category = unescape(grab("category"));
      const excerpt = unescape(grab("excerpt"));
      const date = unescape(grab("date"));
      const tagsMatch = b.match(/tags:\s*\[([^\]]*)\]/);
      const tags = tagsMatch
        ? [...tagsMatch[1].matchAll(/"([^"]+)"/g)].map((mm) => mm[1])
        : [];
      return { title, category, excerpt, date, tags };
    })
    .filter((a) => a.title);
}

// ---------- auto-blog posts from Firestore (build-time) ----------
//
// Weekly cron writes AI posts into the `blog_posts` collection. Those are
// rendered client-side, so without baking static shells here they'd never
// reach crawlers (no sitemap entry, no per-page meta). This pulls published
// posts at build and emits dist/blog/<slug>/index.html — which the sitemap
// scanner + IndexNow ping below then include automatically.
//
// Graceful: FIREBASE_SERVICE_ACCOUNT is a Sensitive Vercel var (empty on
// local `vercel env pull`), so local builds simply skip this. Vercel's build
// has the real value and fetches for real.
async function fetchAutoPosts() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.log("[prerender] no FIREBASE_SERVICE_ACCOUNT — skipping auto-blog shells");
    return [];
  }
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (!getApps().length) {
      const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
      const creds = JSON.parse(text);
      if (creds.private_key?.includes("\\n")) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
      initializeApp({ credential: cert(creds) });
    }
    const db = getFirestore();
    const snap = await db.collection("blog_posts").orderBy("createdAtMs", "desc").limit(200).get();
    const posts = snap.docs.map((d) => d.data()).filter((x) => x && x.published && x.slug && x.title);
    console.log(`[prerender] fetched ${posts.length} auto-blog posts from Firestore`);
    return posts;
  } catch (e) {
    console.warn(`[prerender] auto-blog fetch skipped: ${e.message}`);
    return [];
  }
}

// Flagged scam identifiers (UPI IDs / phone numbers) from the Scam DNA network.
// Each `scamSignatures/id_<identifier>` doc → an indexable /lookup/<id> page
// ("Is <id> a scam?") with the verdict baked into static meta + JSON-LD. This
// is the SEO moat: VRIKAAN ranks for "is <upi/number> scam" searches (huge
// India volume) and every crowd report compounds the footprint.
//
// Only safe, path-friendly identifiers are emitted (UPI + phone; URLs and any
// id with path-breaking chars are skipped — they still work as live SPA pages).
async function fetchFlaggedIdentifiers() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return [];
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (!getApps().length) {
      const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
      const creds = JSON.parse(text);
      if (creds.private_key?.includes("\\n")) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
      initializeApp({ credential: cert(creds) });
    }
    const db = getFirestore();
    const snap = await db.collection("scamSignatures").orderBy("lastSeen", "desc").limit(1000).get();
    const out = [];
    for (const d of snap.docs) {
      if (!d.id.startsWith("id_")) continue;          // only identifier docs
      const identifier = d.id.slice(3);
      if (!identifier || identifier.length < 4) continue;
      if (/[\/\\:?#%\s]/.test(identifier)) continue;  // path/URL-unsafe → skip
      const x = d.data() || {};
      const reports = x.count || 0;
      const risk = x.verified ? 95 : Math.min(90, 40 + reports * 8 + (x.lossCount || 0) * 5);
      out.push({ identifier, reports, verified: !!x.verified, risk, category: x.category || "", tactic: x.tactic || "" });
    }
    console.log(`[prerender] fetched ${out.length} flagged identifiers from Firestore`);
    return out;
  } catch (e) {
    console.warn(`[prerender] flagged-identifier fetch skipped: ${e.message}`);
    return [];
  }
}

// ---------- primary / tool pages ----------
//
// Keep this list narrow — only pages we actively want perfect social
// previews for. Everything else falls back to the SPA default card.
const PRIMARY_PAGES = [
  {
    path: "/",
    title: "VRIKAAN — AI-Powered Cyber Defense Platform",
    description:
      "Enterprise-grade cybersecurity for everyone. Real-time threat detection, fraud analysis, and digital protection powered by AI. 15+ security tools in one dashboard.",
    ogSubtitle: "AI-Powered Cyber Defense Platform",
  },
  {
    path: "/about",
    title: "About VRIKAAN",
    description:
      "Our mission: make enterprise-grade cybersecurity accessible to everyone — families, students, small businesses, not just Fortune 500s.",
    ogSubtitle: "Our mission and story",
  },
  {
    path: "/features",
    title: "Features",
    description:
      "15+ AI-powered security tools in one dashboard: fraud analysis, dark-web monitoring, phishing detection, identity protection, and more.",
    ogSubtitle: "15+ AI-powered security tools",
  },
  {
    path: "/pricing",
    title: "Pricing",
    description:
      "Transparent pricing for individuals, families, and businesses. Free forever tier available. No credit card required to start.",
    ogSubtitle: "Transparent plans for everyone",
  },
  {
    path: "/contact",
    title: "Contact Us",
    description:
      "Get in touch with the VRIKAAN team — security questions, partnership inquiries, press, or bug reports.",
    ogSubtitle: "Get in touch with our team",
  },
  {
    path: "/careers",
    title: "Careers",
    description:
      "Open roles and internships at VRIKAAN — India's AI-powered cyber defense platform. SOC analysts, full-stack engineers, ML engineers, content marketers wanted.",
    ogSubtitle: "We're hiring — SOC, full-stack, AI, marketing",
    ogCategory: "Careers",
  },
  {
    path: "/device-scan",
    title: "Device Scanner",
    description:
      "Scan files, folders, downloads, or USB drives for malware. SHA-256 hashes checked against malware databases. Privacy-first — files never leave your browser.",
    ogSubtitle: "Free malware scan · India-built · Privacy-first",
    ogCategory: "Security Tools",
  },
  {
    path: "/festival-fraud",
    title: "Festival Fraud Forecast",
    description:
      "Diwali / Holi / Rakhi / wedding season scam alerts — tailored to India. AI surfaces top scam patterns 7 days before each festival so you can warn your family.",
    ogSubtitle: "India-first festival scam forecast",
    ogCategory: "Threat Intelligence",
  },
  {
    path: "/aadhaar-mask",
    title: "Aadhaar Mask Tool",
    description:
      "Paste or upload an Aadhaar / PAN / driving license — get a redacted version in 2 seconds. Free, no signup. Mask Aadhaar before sharing on WhatsApp.",
    ogSubtitle: "Free Aadhaar redaction · No upload to our servers",
    ogCategory: "Privacy Tools",
  },
  {
    path: "/scam-recovery",
    title: "Scam Recovery Hotline",
    description:
      "Just got scammed? Get a personalized recovery plan in 30 seconds — exact helplines (1930, NPCI, RBI), IPC sections, pre-filled FIR draft, recovery odds.",
    ogSubtitle: "Emergency recovery plan · India-first · Free",
    ogCategory: "Emergency",
  },
  {
    path: "/safe-word",
    title: "Family Safe-Word Vault",
    description:
      "Set a family safe-word that AI voice clones can't fake. India's defense against deepfake-voice scams targeting parents and grandparents. Free, no signup, stored on your device.",
    ogSubtitle: "Beat AI voice clones · India-first · Free",
    ogCategory: "Family Safety",
  },
  {
    path: "/whatsapp-audit",
    title: "WhatsApp Group Auditor",
    description:
      "Export any WhatsApp group's chat → AI flags pump-and-dump patterns, fake admins, hidden URLs, UPI dumps, mass-adders. India-first. Free, no upload.",
    ogSubtitle: "Detect scam investment groups · India-first",
    ogCategory: "Privacy Tools",
  },
  {
    path: "/receipt-audit",
    title: "Receipt Authenticity Scanner",
    description:
      "Spot fake restaurant / fuel / parking bills in India. Validates GSTIN, checks CGST+SGST math, flags illegal service charge, catches overcharge tax. Free.",
    ogSubtitle: "Catch overcharged bills · GSTIN-aware",
    ogCategory: "Privacy Tools",
  },
  {
    path: "/desktop",
    title: "VRIKAAN Desktop — Native AI Cyber Defense",
    description:
      "Whole-disk malware scan + real-time download watcher + USB auto-scan for Windows / macOS / Linux. India-built, privacy-first. Free. Coming Q2 2026 — join waitlist.",
    ogSubtitle: "Native cyber defense for India · Win/Mac/Linux",
    ogCategory: "Desktop App",
  },
  {
    path: "/otp-decay",
    title: "OTP Decay — Just Shared an OTP? Act in 90 seconds",
    description:
      "Bank fraud helpline + 1-tap call buttons + countdown timer. RBI zero-liability rule + exact script to say. Free, India-built.",
    ogSubtitle: "Emergency · India-first · 1-tap bank helplines",
    ogCategory: "Emergency",
  },
  {
    path: "/upi-lookup",
    title: "UPI Scam Lookup — Check Before You Pay",
    description:
      "Paste any UPI / VPA → instant red-flag analysis + community scam database. Free, India-built. Saves lakhs.",
    ogSubtitle: "Check UPI ID before paying · India-first",
    ogCategory: "Privacy Tools",
  },
  {
    path: "/voiceprint",
    title: "Voiceprint Family Vault — Beat AI Voice Clones",
    description:
      "Record your real voice once. Compare against suspicious calls later via Deepfake Audio Detector. Mic-only, stored in browser.",
    ogSubtitle: "Reference voice samples for deepfake detection",
    ogCategory: "Family Safety",
  },
  {
    path: "/stolen-phone",
    title: "Stolen Phone Recovery — India Action Plan",
    description:
      "Phone lost or stolen? 7-step recovery flow for Android + iPhone. SIM block helplines (Jio/Airtel/Vi/BSNL), CEIR IMEI block, FIR steps. Free.",
    ogSubtitle: "60-min recovery flow · India-first",
    ogCategory: "Emergency",
  },
  {
    path: "/loan-app-check",
    title: "Loan App Profiler — RBI-aware Safety Check",
    description:
      "Check any loan app before installing. Cross-checks RBI's registered NBFC list, known predatory apps, permission red flags, APR.",
    ogSubtitle: "Avoid loan-app harassment · India-first",
    ogCategory: "Privacy Tools",
  },
  {
    path: "/enterprise",
    title: "VRIKAAN Enterprise SOC — Managed Security for India",
    description:
      "24×7 SOC-as-a-Service for Indian fintech, banks, IT services. MITRE ATT&CK, DPDP-ready, ₹50k-50L/mo. INR billing, Hindi-fluent on-call, India data residency (AWS Mumbai).",
    ogSubtitle: "SOC-as-a-Service · India · ₹50k-50L/mo",
    ogCategory: "Enterprise",
  },
  {
    path: "/hi",
    title: "VRIKAAN · भारत का फ्री AI साइबर डिफेंस",
    description:
      "UPI धोखाधड़ी, deepfake कॉल, Aadhaar leak, loan app harassment से बचाव — 60+ tools बिल्कुल मुफ्त। हिन्दी में। SOC analysts ने नाशिक में बनाया।",
    ogSubtitle: "60+ tools · हिन्दी · नाशिक से · फ्री",
    ogCategory: "Hindi · हिन्दी",
  },
  {
    path: "/responsible-disclosure",
    title: "Responsible Disclosure · Bug Bounty",
    description:
      "Found a vulnerability in VRIKAAN? Report responsibly — ₹2k-25k INR bounties + Hall of Fame credit + 1-year Pro plan. 48h acknowledgement SLA.",
    ogSubtitle: "Bug bounty program · India-first · INR payouts",
    ogCategory: "Security",
  },
  {
    path: "/security/hall-of-fame",
    title: "Security Hall of Fame",
    description:
      "Researchers who helped make VRIKAAN safer through responsible disclosure. Thank you for keeping Indian users protected.",
    ogSubtitle: "Researchers credited · Bug bounty",
    ogCategory: "Security",
  },
  {
    path: "/founder",
    title: "Founder's Note",
    description:
      "A personal letter from VRIKAAN's founder on why we're building accessible cybersecurity for everyone.",
    ogSubtitle: "A personal letter from our founder",
  },
  {
    path: "/protection",
    title: "Digital Protection",
    description:
      "Comprehensive digital protection services — identity monitoring, credit alerts, family safety, and breach response.",
    ogSubtitle: "Comprehensive digital protection",
  },
  {
    path: "/blog",
    title: "VRIKAAN Blog",
    description:
      "In-depth cybersecurity articles, tutorials, threat analysis, and industry news — written by practitioners for practitioners.",
    ogSubtitle: "Cybersecurity articles & tutorials",
    ogCategory: "News",
  },
  {
    path: "/cyber-news",
    title: "Cyber News",
    description:
      "Breaking cybersecurity news, breach disclosures, and threat advisories updated daily.",
    ogSubtitle: "Breaking cybersecurity news",
    ogCategory: "News",
  },
  {
    path: "/learn",
    title: "Learn Cybersecurity",
    description:
      "Interactive lessons, guides, and challenges to level up your cybersecurity skills — from beginner to advanced.",
    ogSubtitle: "Interactive cybersecurity lessons",
    ogCategory: "Tutorials",
  },
  {
    path: "/emergency-help",
    title: "Emergency Cyber Help",
    description:
      "Just been hacked, scammed, or had your identity stolen? Step-by-step emergency response guides to contain the damage fast.",
    ogSubtitle: "Step-by-step breach response",
    ogCategory: "Threats",
  },
  {
    path: "/scam-database",
    title: "Scam Database",
    description:
      "Searchable database of known scams, fraudulent websites, and fake support numbers. Report a scam or check before you click.",
    ogSubtitle: "Searchable scam & fraud database",
    ogCategory: "Threats",
  },
  {
    path: "/identity-xray",
    title: "Identity X-Ray",
    description:
      "Discover what the public internet knows about you. Free OSINT-style scan across data brokers, breaches, and social platforms.",
    ogSubtitle: "What does the internet know about you?",
  },
  {
    path: "/fraud-analyzer",
    title: "Fraud Analyzer",
    description:
      "Paste any suspicious URL, message, or email. Our AI checks it against fraud signatures, blocklists, and linguistic patterns in seconds.",
    ogSubtitle: "AI-powered fraud detection",
  },
  {
    path: "/dark-web-monitor",
    title: "Dark Web Monitor",
    description:
      "Check if your email, passwords, or personal data have been exposed in known breaches or are circulating on dark-web forums.",
    ogSubtitle: "Have you been breached?",
  },
  {
    path: "/password-checker",
    title: "Password Strength Checker",
    description:
      "Test password strength against modern cracking attacks. Checks haveibeenpwned, entropy, dictionary patterns, and more — all client-side.",
    ogSubtitle: "Test your password strength",
  },
  {
    path: "/security-audit",
    title: "Free Website Security Audit",
    description:
      "Enter any URL for an instant security audit: SSL config, security headers, cookie flags, CSP strength, and common misconfigurations.",
    ogSubtitle: "Free website security scan",
  },
  {
    path: "/email-analyzer",
    title: "Email Header Analyzer",
    description:
      "Paste raw email headers to trace the real sender, check SPF/DKIM/DMARC, and spot forged or phishing emails.",
    ogSubtitle: "Trace the real sender",
  },
  {
    path: "/ip-lookup",
    title: "IP Address Lookup",
    description:
      "Geolocate any IP address, identify its ISP, check reputation against threat feeds, and see open ports from free public scans.",
    ogSubtitle: "Geolocate & check any IP",
  },
  {
    path: "/whois-lookup",
    title: "WHOIS Domain Lookup",
    description:
      "Look up registration, ownership, age, and DNS details for any domain — fast, clean, ad-free.",
    ogSubtitle: "Fast domain WHOIS lookup",
  },
  {
    path: "/security-headers",
    title: "Security Headers Checker",
    description:
      "Scan any website's HTTP response headers and get a letter-graded security score with actionable fix suggestions.",
    ogSubtitle: "Grade any site's security headers",
  },
  {
    path: "/qr-scanner",
    title: "Safe QR Code Scanner",
    description:
      "Scan QR codes safely. We decode the payload and check the destination URL against phishing and malware databases before you visit.",
    ogSubtitle: "Scan QR codes without risk",
  },
  {
    path: "/threats",
    title: "Cyber Threat Directory",
    description:
      "Plain-English guide to every major cyber threat: what it is, how to spot it, and how to defend against it.",
    ogSubtitle: "Know your enemy",
    ogCategory: "Threats",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How VRIKAAN collects, uses, and protects your data. DPDP Act 2023 and GDPR compliant.",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description: "VRIKAAN terms of service and acceptable use policy.",
  },
  {
    path: "/refund-policy",
    title: "Refund Policy",
    description: "VRIKAAN refund and cancellation policy.",
  },
  {
    path: "/shipping-policy",
    title: "Shipping Policy",
    description:
      "VRIKAAN is a digital service — shipping policy for any physical deliverables (hardware security keys, merchandise).",
  },

  // --- Auth pages — noindex so they never appear in search results ---
  {
    path: "/login",
    title: "Sign In",
    description: "Sign in to your VRIKAAN account.",
    noindex: true,
  },
  {
    path: "/signup",
    title: "Create Account",
    description:
      "Create a free VRIKAAN account — 15+ security tools, dark-web monitoring, and real-time threat alerts. No credit card required.",
    ogSubtitle: "Free forever — no credit card required",
  },
  {
    path: "/forgot-password",
    title: "Reset Password",
    description: "Reset your VRIKAAN account password.",
    noindex: true,
  },

  // --- Additional tool pages ---
  {
    path: "/2fa-guide",
    title: "2FA Setup Guide",
    description:
      "Step-by-step guides to enable two-factor authentication on Google, Apple, Microsoft, banking, and social accounts. Interactive and beginner-friendly.",
    ogSubtitle: "Enable 2FA on every account that matters",
    ogCategory: "Tutorials",
  },
  {
    path: "/vulnerability-scanner",
    title: "Vulnerability Scanner",
    description:
      "Scan any public-facing website for the OWASP Top 10 and common CVEs. Get a detailed report in seconds, no signup required.",
    ogSubtitle: "OWASP Top 10 + CVE scanning",
  },
  {
    path: "/phishing-trainer",
    title: "Phishing Trainer",
    description:
      "Interactive training to teach you how to spot phishing emails, smishing texts, and vishing calls — before they catch you for real.",
    ogSubtitle: "Train yourself to spot phishing",
    ogCategory: "Tutorials",
  },
  {
    path: "/file-hash-scanner",
    title: "File Hash Scanner",
    description:
      "Compute SHA-256/MD5/SHA-1 hashes locally in your browser and check them against known-malware databases. No file is ever uploaded.",
    ogSubtitle: "Check any file against malware DBs",
  },
  {
    path: "/dns-leak-test",
    title: "DNS Leak Test",
    description:
      "Verify your VPN is actually private. Our DNS leak test reveals which resolvers your system is really using, exposing VPN misconfigurations.",
    ogSubtitle: "Is your VPN actually private?",
  },
  {
    path: "/security-score",
    title: "Security Score",
    description:
      "Get a personal cybersecurity posture score across passwords, 2FA, breach exposure, and device hygiene. Free and actionable.",
    ogSubtitle: "Rate your personal cyber posture",
  },
  {
    path: "/password-vault",
    title: "Password Vault",
    description:
      "Zero-knowledge encrypted password storage. Your vault is encrypted client-side with your master password — we never see your data.",
    ogSubtitle: "Zero-knowledge password storage",
  },
  {
    path: "/security-checklist",
    title: "Security Checklist",
    description:
      "A personal cybersecurity checklist covering passwords, devices, accounts, network, and backups. Track progress across all your security hygiene tasks.",
    ogSubtitle: "Your personal cyber hygiene plan",
    ogCategory: "Tips",
  },
  {
    path: "/browser-fingerprint",
    title: "Browser Fingerprint Test",
    description:
      "See exactly what information your browser leaks to every site you visit — canvas fingerprint, fonts, plugins, screen, timezone, and more.",
    ogSubtitle: "What your browser leaks",
  },
  {
    path: "/threat-map",
    title: "Live Threat Map",
    description:
      "Real-time global map of cyber attacks, DDoS events, and malware campaigns as they happen around the world.",
    ogSubtitle: "Real-time global cyber attacks",
    ogCategory: "Threats",
  },
  {
    path: "/referral",
    title: "Refer a Friend",
    description:
      "Invite friends to VRIKAAN and both of you get premium features free. Help us make cybersecurity accessible to everyone.",
    ogSubtitle: "Give security, get security",
  },
  {
    path: "/badge",
    title: "Secured by VRIKAAN — Free Trust Badge",
    description:
      "Add the free “Secured by VRIKAAN” trust badge to your website, store, or email signature. Show customers you take cyber-safety seriously. Copy-paste HTML or Markdown.",
    ogSubtitle: "Free trust badge for your website",
    ogCategory: "Partners",
  },
  {
    path: "/trust",
    title: "Trust & Security Center",
    description:
      "How VRIKAAN protects your data: AES-256 encryption, India data residency (AWS Mumbai), DPDP Act 2023 alignment, responsible disclosure, sub-processors & security practices. Built for banks, fintech & enterprises.",
    ogSubtitle: "Security, compliance & data protection",
    ogCategory: "Trust",
  },
];

// ---------- main ----------

async function main() {
  if (!fs.existsSync(INDEX)) {
    throw new Error(`[prerender] ${INDEX} not found — run vite build first`);
  }
  const baseHtml = fs.readFileSync(INDEX, "utf8");

  let count = 0;

  // Primary + tool pages
  for (const p of PRIMARY_PAGES) {
    const pageTitle =
      p.path === "/" ? p.title : `${p.title} | ${SITE_NAME}`;
    const canonical = `${SITE}${p.path === "/" ? "" : p.path}`;
    const ogImage = ogUrl({
      title: p.path === "/" ? "VRIKAAN" : p.title,
      subtitle: p.ogSubtitle ?? p.description.slice(0, 80),
      category: p.ogCategory,
    });
    const jsonLd = [];
    if (p.path === "/") {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE,
        logo: `${SITE}/favicon.svg`,
        sameAs: [],
      });
    }
    const html = rewriteMeta(baseHtml, {
      title: pageTitle,
      description: p.description,
      canonical,
      ogImage,
      ogType: "website",
      jsonLd,
      noindex: p.noindex === true,
    });
    writeRoute(p.path, html);
    count++;
  }

  // Blog posts (extracted from Blog.jsx)
  const articles = extractArticles();
  const staticSlugs = new Set(articles.map((a) => slugify(a.title)));
  for (const a of articles) {
    const slug = slugify(a.title);
    const canonical = `${SITE}/blog/${slug}`;
    const pageTitle = `${a.title} | ${SITE_NAME}`;
    const description = a.excerpt;
    const ogImage = ogUrl({
      title: a.title,
      subtitle: description?.slice(0, 80),
      category: a.category,
    });
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description,
        datePublished: a.date,
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
        },
        mainEntityOfPage: canonical,
        articleSection: a.category,
        keywords: a.tags.join(", "),
        image: ogImage,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: a.title,
            item: canonical,
          },
        ],
      },
    ];
    const html = rewriteMeta(baseHtml, {
      title: pageTitle,
      description,
      canonical,
      ogImage,
      ogType: "article",
      jsonLd,
    });
    writeRoute(`/blog/${slug}`, html);
    count++;
  }

  // Auto-blog posts (Firestore) — skip slugs already covered by Blog.jsx.
  const autoPosts = await fetchAutoPosts();
  for (const a of autoPosts) {
    const slug = slugify(a.slug || a.title);
    if (!slug || staticSlugs.has(slug)) continue;
    const canonical = `${SITE}/blog/${slug}`;
    const pageTitle = `${a.title} | ${SITE_NAME}`;
    const description = a.excerpt || (a.sections?.[0]?.text || "").slice(0, 200);
    const ogImage = ogUrl({
      title: a.title,
      subtitle: description?.slice(0, 80),
      category: a.category || "Threats",
    });
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description,
        author: { "@type": "Organization", name: a.author || SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
        },
        mainEntityOfPage: canonical,
        articleSection: a.category || "Threats",
        keywords: Array.isArray(a.tags) ? a.tags.join(", ") : "",
        image: ogImage,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: a.title, item: canonical },
        ],
      },
    ];
    const html = rewriteMeta(baseHtml, {
      title: pageTitle,
      description,
      canonical,
      ogImage,
      ogType: "article",
      jsonLd,
    });
    writeRoute(`/blog/${slug}`, html);
    count++;
  }

  // Scam DNA lookup pages (Firestore) — indexable "Is <id> a scam?" per
  // flagged UPI ID / phone number. The verdict is baked into static meta so
  // crawlers index it; the live SPA still hydrates the full report.
  const flagged = await fetchFlaggedIdentifiers();
  for (const f of flagged) {
    const idEnc = f.identifier; // already path-safe (filtered in fetcher)
    const kind = idEnc.includes("@") ? "UPI ID" : /^[+0-9-]{6,}$/.test(idEnc) ? "phone number" : "identifier";
    const verdict = f.verified || f.risk >= 75 ? "a known scam" : f.risk >= 45 ? "a likely scam" : "reported as suspicious";
    const canonical = `${SITE}/lookup/${idEnc}`;
    const pageTitle = `Is ${idEnc} a scam? — ${SITE_NAME} Scam DNA`;
    const description = `${idEnc} (${kind}) is ${verdict} — flagged ${f.reports} time${f.reports === 1 ? "" : "s"} in VRIKAAN's crowdsourced Scam DNA network${f.tactic ? `: ${f.tactic}` : ""}. Check any UPI ID or number free before you pay.`;
    const ogImage = ogUrl({ title: `Is ${idEnc} a scam?`, subtitle: `${verdict} · ${f.reports} reports`, category: "Scam DNA" });
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [{
          "@type": "Question",
          name: `Is ${idEnc} a scam?`,
          acceptedAnswer: { "@type": "Answer", text: description },
        }],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Scam Registry", item: `${SITE}/scam-registry` },
          { "@type": "ListItem", position: 3, name: `Is ${idEnc} a scam?`, item: canonical },
        ],
      },
    ];
    const html = rewriteMeta(baseHtml, {
      title: pageTitle, description, canonical, ogImage, ogType: "article", jsonLd,
    });
    writeRoute(`/lookup/${idEnc}`, html);
    count++;
  }

  // Threat pages (imported from src/data/threats.js)
  const threatsMod = await import(
    pathToFileURL(path.join(ROOT, "src/data/threats.js")).href
  );
  const threats = threatsMod.default || threatsMod.THREATS || [];
  for (const t of threats) {
    const canonical = `${SITE}/threat/${t.slug}`;
    const pageTitle = `${t.title} | ${SITE_NAME}`;
    const description = t.lede;
    const ogImage = ogUrl({
      title: t.title,
      subtitle: description?.slice(0, 80),
      category: "Threats",
    });
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: t.title,
        description,
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
        },
        mainEntityOfPage: canonical,
        articleSection: t.category || "Threats",
        image: ogImage,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Threats",
            item: `${SITE}/threats`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: t.title,
            item: canonical,
          },
        ],
      },
    ];
    const html = rewriteMeta(baseHtml, {
      title: pageTitle,
      description,
      canonical,
      ogImage,
      ogType: "article",
      jsonLd,
    });
    writeRoute(`/threat/${t.slug}`, html);
    count++;
  }

  console.log(`[prerender] wrote ${count} static HTML shells into dist/`);

  // ── RSS feed (/feed.xml) from blog posts — syndication + feed readers ──
  const WWW = "https://www.vrikaan.com";
  const feedItems = [
    ...articles.map((a) => ({ title: a.title, slug: slugify(a.title), desc: a.excerpt || "", cat: a.category || "", date: a.date ? new Date(a.date) : new Date() })),
    ...autoPosts
      .filter((a) => !staticSlugs.has(slugify(a.slug || a.title)))
      .map((a) => ({ title: a.title, slug: slugify(a.slug || a.title), desc: a.excerpt || "", cat: a.category || "", date: a.createdAtMs ? new Date(a.createdAtMs) : new Date() })),
  ]
    .filter((it) => it.title && it.slug)
    .sort((x, y) => y.date - x.date)
    .slice(0, 40);
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>VRIKAAN Blog — Scam &amp; Cyber-Safety, India</title>
<link>${WWW}/blog</link>
<description>AI scam-awareness, fraud alerts and cyber-safety guides for India, by VRIKAAN.</description>
<language>en-in</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${WWW}/feed.xml" rel="self" type="application/rss+xml"/>
${feedItems.map((it) => `<item>
<title>${htmlEscape(it.title)}</title>
<link>${WWW}/blog/${it.slug}</link>
<guid isPermaLink="true">${WWW}/blog/${it.slug}</guid>
${it.cat ? `<category>${htmlEscape(it.cat)}</category>` : ""}
<pubDate>${(isNaN(it.date) ? new Date() : it.date).toUTCString()}</pubDate>
<description>${htmlEscape(it.desc)}</description>
</item>`).join("\n")}
</channel>
</rss>
`;
  fs.writeFileSync(path.join(DIST, "feed.xml"), rssXml);
  console.log(`[prerender] feed.xml: ${feedItems.length} items`);

  // ── Auto-generate sitemap.xml from every prerendered route (never stale) ──
  const NOINDEX = new Set([
    "dashboard", "admin", "user-dashboard", "checkout", "login", "signup",
    "forgot-password", "offline", "family", "family-dashboard", "parent-dashboard",
  ]);
  const base = "https://www.vrikaan.com";
  // SPA-only routes (not prerendered yet) — listed so Google indexes them.
  const urls = ["/", "/scam-dna", "/scambait", "/tools", "/mock-test", "/leaderboard", "/risk-score", "/deepfake-audio", "/emergency-help", "/scam-registry", "/scam-feed", "/file-complaint", "/developers"];
  for (const name of fs.readdirSync(DIST)) {
    const full = path.join(DIST, name);
    let isDir = false;
    try { isDir = fs.statSync(full).isDirectory(); } catch { continue; }
    if (!isDir || name === "assets" || name.startsWith(".") || NOINDEX.has(name)) continue;
    if (fs.existsSync(path.join(full, "index.html"))) urls.push(`/${name}`);
    for (const sub of fs.readdirSync(full)) {
      try {
        const subFull = path.join(full, sub);
        if (fs.statSync(subFull).isDirectory() && fs.existsSync(path.join(subFull, "index.html"))) urls.push(`/${name}/${sub}`);
      } catch { /* skip */ }
    }
  }
  const uniq = [...new Set(urls)].sort();
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniq.map((u) => `  <url><loc>${base}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml);
  console.log(`[prerender] sitemap.xml: ${uniq.length} urls`);

  // ── IndexNow: ping Bing/DuckDuckGo/Yandex with the full URL list ──
  // Key file is served at https://www.vrikaan.com/<KEY>.txt (public/<KEY>.txt).
  // Build-time ping is fine — bots fetch the URLs minutes later, by which point
  // the new deploy is live. Non-fatal: a failed ping never breaks the build.
  const INDEXNOW_KEY = "5c85e6fe592581035abc4b28a57706fc";
  try {
    const host = "www.vrikaan.com";
    const urlList = [...uniq.map((u) => `${base}${u === "/" ? "/" : u}`), `${base}/feed.xml`];
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    console.log(`[prerender] IndexNow ping: ${res.status} (${urlList.length} urls)`);
  } catch (e) {
    console.warn(`[prerender] IndexNow ping skipped: ${e.message}`);
  }
}

main().catch((e) => {
  console.error("[prerender] failed:", e);
  process.exit(1);
});
