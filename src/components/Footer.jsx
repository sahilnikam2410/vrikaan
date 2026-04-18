import { Link } from "react-router-dom";
import BackToTop from "./BackToTop";

const T = {
  bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  cyan: "#14e3c5", accent: "#6366f1", border: "rgba(148,163,184,0.08)",
};

const FooterLink = ({ to, children }) => (
  <li style={{ marginBottom: 10 }}>
    <Link to={to} style={{ color: T.mutedDark, textDecoration: "none", fontSize: 14, fontFamily: "var(--font-body)", transition: "color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.color = T.white}
      onMouseLeave={e => e.currentTarget.style.color = T.mutedDark}
    >{children}</Link>
  </li>
);

const Footer = () => (
  <footer style={{ borderTop: `1px solid ${T.border}`, padding: "64px clamp(24px, 5vw, 80px) 40px", background: T.bg }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: "clamp(32px, 4vw, 60px)", alignItems: "start", marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: T.bg }}>S</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 3, color: T.white, fontWeight: 700 }}>SECUVION</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: T.mutedDark, fontSize: 14, lineHeight: 1.8, marginBottom: 20, maxWidth: 240 }}>
            AI-powered cyber defense for everyone. Enterprise security made accessible.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "In", href: "https://www.linkedin.com/in/sahil-nikam-" },
              { label: "Gh", href: "https://github.com/sahilnikam2410" },
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

        {/* Security Tools */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Security Tools</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterLink to="/threat-map">Threat Map</FooterLink>
            <FooterLink to="/fraud-analyzer">Fraud Analyzer</FooterLink>
            <FooterLink to="/vulnerability-scanner">Vulnerability Scanner</FooterLink>
            <FooterLink to="/dark-web-monitor">Dark Web Monitor</FooterLink>
            <FooterLink to="/password-vault">Password Vault</FooterLink>
            <FooterLink to="/email-analyzer">Email Analyzer</FooterLink>
            <FooterLink to="/ip-lookup">IP Lookup</FooterLink>
            <FooterLink to="/qr-scanner">QR Scanner</FooterLink>
            <FooterLink to="/identity-xray">Identity X-Ray</FooterLink>
            <FooterLink to="/password-checker">Password Checker</FooterLink>
            <FooterLink to="/whois-lookup">WHOIS Lookup</FooterLink>
            <FooterLink to="/security-headers">Security Headers</FooterLink>
            <FooterLink to="/file-hash-scanner">File Hash Scanner</FooterLink>
            <FooterLink to="/security-audit">Security Audit</FooterLink>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Resources</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterLink to="/learn">Learn Academy</FooterLink>
            <FooterLink to="/cyber-news">Cyber News</FooterLink>
            <FooterLink to="/threats">Threat Directory</FooterLink>
            <FooterLink to="/blog">Blog</FooterLink>
            <FooterLink to="/security-checklist">Security Checklist</FooterLink>
            <FooterLink to="/security-score">Security Score</FooterLink>
            <FooterLink to="/scam-database">Scam Database</FooterLink>
            <FooterLink to="/emergency-help">Emergency Help</FooterLink>
            <FooterLink to="/2fa-guide">2FA Setup Guide</FooterLink>
            <FooterLink to="/phishing-trainer">Phishing Trainer</FooterLink>
            <FooterLink to="/browser-fingerprint">Browser Fingerprint</FooterLink>
            <FooterLink to="/dns-leak-test">DNS Leak Test</FooterLink>
            <FooterLink to="/referral">Refer & Earn</FooterLink>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: T.white, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Company</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/founder">Founder</FooterLink>
            <FooterLink to="/pricing">Pricing</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/features">Features</FooterLink>
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

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark }}>&copy; 2026 SECUVION. All rights reserved.</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(100,116,139,0.6)" }}>
          Founded by Sahil Anil Nikam | Built with security in mind | Protecting digital lives worldwide
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
    <BackToTop />
  </footer>
);

export default Footer;
