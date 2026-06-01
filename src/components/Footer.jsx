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
  bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  cyan: "#14e3c5", accent: "#6366f1", border: "rgba(148,163,184,0.08)",
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
                filter: "drop-shadow(0 0 6px rgba(20,227,197,0.4))",
                animation: "wolfPulse 2.6s ease-in-out infinite",
              }}
            />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: T.white, fontWeight: 700 }}>VRIKAAN</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: T.mutedDark, fontSize: 14, lineHeight: 1.8, marginBottom: 20, maxWidth: 240 }}>
            AI-powered cyber defense for everyone. Enterprise security made accessible.
          </p>
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

        {/* Security Tools — hidden while inside a tool page (keeps focus) */}
        {!onTool && (
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Security Tools</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterTool to="/scam-recovery">🚨 Scam Recovery Hotline</FooterTool>
            <FooterTool to="/safe-word">Family Safe-Word</FooterTool>
            <FooterTool to="/whatsapp-audit">WhatsApp Group Audit</FooterTool>
            <FooterTool to="/receipt-audit">Receipt Authenticity</FooterTool>
            <FooterTool to="/otp-decay">🚨 OTP Decay Emergency</FooterTool>
            <FooterTool to="/stolen-phone">📱 Stolen Phone Recovery</FooterTool>
            <FooterTool to="/upi-lookup">UPI Scam Lookup</FooterTool>
            <FooterTool to="/loan-app-check">Loan App Profiler</FooterTool>
            <FooterTool to="/voiceprint">Voiceprint Vault</FooterTool>
            <FooterTool to="/desktop">💻 Desktop App (waitlist)</FooterTool>
            <FooterTool to="/hi">🇮🇳 हिन्दी में</FooterTool>
            <FooterTool to="/enterprise">🏛 Enterprise SOC</FooterTool>
            <FooterTool to="/device-scan">Device Scanner</FooterTool>
            <FooterTool to="/aadhaar-mask">Aadhaar Mask Tool</FooterTool>
            <FooterTool to="/festival-fraud">Festival Fraud Forecast</FooterTool>
            <FooterTool to="/threat-map">Threat Map</FooterTool>
            <FooterTool to="/fraud-analyzer">Fraud Analyzer</FooterTool>
            <FooterTool to="/vulnerability-scanner">Vulnerability Scanner</FooterTool>
            <FooterTool to="/dark-web-monitor">Dark Web Monitor</FooterTool>
            <FooterTool to="/password-vault">Password Vault</FooterTool>
            <FooterTool to="/email-analyzer">Email Analyzer</FooterTool>
            <FooterTool to="/ip-lookup">IP Lookup</FooterTool>
            <FooterTool to="/qr-scanner">QR Scanner</FooterTool>
            <FooterTool to="/identity-xray">Identity X-Ray</FooterTool>
            <FooterTool to="/password-checker">Password Checker</FooterTool>
            <FooterTool to="/whois-lookup">WHOIS Lookup</FooterTool>
            <FooterTool to="/security-headers">Security Headers</FooterTool>
            <FooterTool to="/file-hash-scanner">File Hash Scanner</FooterTool>
            <FooterTool to="/security-audit">Security Audit</FooterTool>
          </ul>
        </div>
        )}

        {/* Resources — also hidden inside a tool page */}
        {!onTool && (
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Resources</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterTool to="/learn">Learn Academy</FooterTool>
            <FooterTool to="/cyber-news">Cyber News</FooterTool>
            <FooterTool to="/threats">Threat Directory</FooterTool>
            <FooterTool to="/blog">Blog</FooterTool>
            <FooterTool to="/security-checklist">Security Checklist</FooterTool>
            <FooterTool to="/security-score">Security Score</FooterTool>
            <FooterTool to="/scam-database">Scam Database</FooterTool>
            <FooterTool to="/emergency-help">Emergency Help</FooterTool>
            <FooterTool to="/2fa-guide">2FA Setup Guide</FooterTool>
            <FooterTool to="/phishing-trainer">Phishing Trainer</FooterTool>
            <FooterTool to="/browser-fingerprint">Browser Fingerprint</FooterTool>
            <FooterTool to="/dns-leak-test">DNS Leak Test</FooterTool>
            <FooterTool to="/referral">Refer & Earn</FooterTool>
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
