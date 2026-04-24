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
  const src = fs.readFileSync(
    path.join(ROOT, "src/assets/pages/Blog.jsx"),
    "utf8"
  );
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
}

main().catch((e) => {
  console.error("[prerender] failed:", e);
  process.exit(1);
});
