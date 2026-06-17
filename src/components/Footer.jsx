import { Link, useLocation } from "react-router-dom";
import PageJump from "./PageJump";
import ScrollProgress from "./ScrollProgress";
import EmailRouting from "./EmailRouting";
import SmartToolLink from "./SmartToolLink";
import { getToolTier } from "../lib/toolTiers";

// Paths where the footer's big tool/resource columns are HIDDEN. When a user
// is actively inside a tool, the long tool list is clutter — collapse the
// footer to brand + company + legal so the tool keeps focus.
// A page counts as a "tool page" if it's a registered Pro/Enterprise tool
// OR a free tool/resource the footer links to (but NOT marketing/content
// pages like /about, /pricing, /blog, /, /learn).
const FOOTER_TOOL_PATHS = new Set([
  "/scam-recovery","/safe-word","/whatsapp-audit","/receipt-audit","/otp-decay",
  "/stolen-phone","/upi-lookup","/loan-app-check","/voiceprint","/device-scan",
  "/aadhaar-mask","/festival-fraud","/threat-map","/fraud-analyzer",
  "/vulnerability-scanner","/dark-web-monitor","/password-vault","/email-analyzer",
  "/ip-lookup","/qr-scanner","/identity-xray","/password-checker","/whois-lookup",
  "/security-headers","/file-hash-scanner","/security-audit","/security-score",
  "/scam-check","/deepfake-audio","/risk-score","/security-checklist",
  "/phishing-trainer","/browser-fingerprint","/dns-leak-test","/bulk-scanner",
]);

function isToolPage(pathname) {
  if (!pathname) return false;
  const clean = pathname.split("?")[0].split("#")[0].toLowerCase().replace(/\/+$/, "") || "/";
  if (FOOTER_TOOL_PATHS.has(clean)) return true;
  // Any Pro/Enterprise-tier registered tool also counts as a tool page.
  const { tier } = getToolTier(clean);
  return tier === "pro" || tier === "enterprise";
}

const T = {
  bg: "#060a14", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  cyan: "#14b8a6", accent: "#6366f1", border: "rgba(148,163,184,0.08)",
};

// Plain link (Company / Legal columns — non-tool pages, no tier gating)
const FooterLink = ({ to, children }) => (
  <li style={{ marginBottom: 10 }}>
    <Link to={to} style={{ color: T.mutedDark, textDecoration: "none", fontSize: 14, fontFamily: "var(--font-body)", transition: "color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.color = T.white}
      onMouseLeave={e => e.currentTarget.style.color = T.mutedDark}
    >{children}</Link>
  </li>
);

// Tool link (Security Tools / Resources columns — shows tier badge + paywall for locked tools)
const FooterTool = ({ to, children }) => (
  <li style={{ marginBottom: 10 }}>
    <SmartToolLink to={to}>{children}</SmartToolLink>
  </li>
);

const Footer = () => {
  const { pathname } = useLocation();
  const onTool = isToolPage(pathname);
  // 5 columns normally; on a tool page drop the 2 tool columns -> 3 columns.
  const gridCols = onTool ? "1.5fr 1fr 1fr" : "1.5fr repeat(4, 1fr)";
  return (
  <footer data-footer style={{ borderTop: `1px solid ${T.border}`, padding: "64px clamp(24px, 5vw, 80px) 40px", background: T.bg }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "clamp(32px, 4vw, 60px)", alignItems: "start", marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <img
              src="/wolf-compact.png"
              alt="VRIKAAN"
              width="48"
              height="48"
              style={{
                display: "block",
                flexShrink: 0,
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px rgba(20, 184, 166,0.4))",
                animation: "wolfPulse 2.6s ease-in-out infinite",
              }}
            />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: T.white, fontWeight: 700 }}>VRIKAAN</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: T.mutedDark, fontSize: 14, lineHeight: 1.8, marginBottom: 14, maxWidth: 240 }}>
            AI-powered cyber defense for everyone. Enterprise security made accessible.
          </p>
          <a href="https://www.indianstartuptimes.com/news/the-cyber-50-indias-elite-founders-list/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "5px 11px", borderRadius: 100, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", textDecoration: "none", fontSize: 12, color: T.muted }}>
            <span style={{ color: "#fbbf24" }}>★</span> Featured in <strong style={{ color: T.white }}>Cyber 50</strong> ↗
          </a>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "X",  href: "https://x.com/vrikaan" },
              { label: "In", href: "https://www.linkedin.com/company/vrikaan-ai-cybersecurity" },
              { label: "Ig", href: "https://www.instagram.com/vrikaan_official/" },
              { label: "Gh", href: "https://github.com/sahilnikam2410/vrikaan" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.mutedDark, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.color = T.white; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.mutedDark; }}
                >{s.label}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Tools — full list lives on /tools now; footer stays clean. */}
        {!onTool && (
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Tools</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterTool to="/tools">All Tools →</FooterTool>
            <FooterTool to="/scam-dna">🧬 Scam DNA</FooterTool>
            <FooterTool to="/scambait">🎭 AI Scambaiter</FooterTool>
            <FooterTool to="/scam-recovery">🚨 Scam Recovery</FooterTool>
          </ul>
        </div>
        )}

        {/* Resources — content/learning, not tools */}
        {!onTool && (
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Resources</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterTool to="/learn">Learn Academy</FooterTool>
            <FooterTool to="/scam-feed">🔴 Live Scam Feed</FooterTool>
            <FooterTool to="/file-complaint">File a Complaint · 1930</FooterTool>
            <FooterTool to="/developers">For Developers · API</FooterTool>
            <FooterTool to="/cyber-news">Cyber News</FooterTool>
            <FooterTool to="/threats">Threat Directory</FooterTool>
            <FooterTool to="/blog">Blog</FooterTool>
            <FooterTool to="/hi">🇮🇳 हिन्दी में</FooterTool>
          </ul>
        </div>
        )}

        {/* Company */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Company</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/founder">Founder</FooterLink>
            <FooterLink to="/pricing">Pricing</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/features">Features</FooterLink>
            <FooterLink to="/careers">Careers · We are hiring</FooterLink>
            <FooterLink to="/press">Press</FooterLink>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/shipping-policy">Shipping Policy</FooterLink>
            <FooterLink to="/refund-policy">Cancellation & Refunds</FooterLink>
            <FooterLink to="/login">Login</FooterLink>
            <FooterLink to="/signup">Sign Up</FooterLink>
          </ul>
        </div>
      </div>

      {/* Email routing pills */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 8 }}>
        <EmailRouting variant="compact" />
      </div>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark }}>&copy; 2026 VRIKAAN. All rights reserved.</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(100,116,139,0.6)" }}>
          Founded by Sahil Anil Nikam &amp; Khushi Ishwar Raigade | SOC Analysts &amp; Cybersecurity Researchers | Pune, India
        </div>
      </div>
    </div>

    {/* Responsive */}
    <style>{`
      @media (max-width: 900px) {
        footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 560px) {
        footer > div > div:first-child { grid-template-columns: 1fr !important; }
      }
    `}</style>
    <PageJump />
    <ScrollProgress />
  </footer>
  );
};

export default Footer;
