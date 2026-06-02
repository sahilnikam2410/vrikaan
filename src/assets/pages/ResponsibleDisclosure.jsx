import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14b8a6",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

const SEVERITIES = [
  { level: "CRITICAL", bounty: "₹15,000 – ₹25,000", color: "#EF4444", examples: ["RCE on api.vrikaan.com / serverless functions", "Auth bypass — read another user's data", "Cashfree webhook signature bypass", "Firestore security-rule bypass leaking PII", "Stored XSS w/ user-takeover proof"] },
  { level: "HIGH",     bounty: "₹5,000 – ₹15,000",  color: "#F97316", examples: ["IDOR exposing other users' files / scans", "Privilege escalation user → admin", "Mass-data scrape via unauthenticated endpoint", "TOTP 2FA bypass"] },
  { level: "MEDIUM",   bounty: "₹2,000 – ₹5,000",   color: "#F59E0B", examples: ["Reflected XSS w/o cookie / session theft", "Open redirect on official domain", "CSRF on state-changing endpoint", "Rate-limit bypass via header spoofing"] },
  { level: "LOW",      bounty: "1-year Pro plan + Hall of Fame credit", color: "#22C55E", examples: ["Subdomain takeover (orphan record)", "Information disclosure (low-impact)", "Missing security header w/ demonstrable risk", "Verbose error message leaking stack info"] },
];

const OUT_OF_SCOPE = [
  "Denial-of-service / rate-limit exhaustion reports",
  "Reports from automated scanners w/ no manual validation",
  "Missing security headers w/o demonstrated impact",
  "Self-XSS or social-engineering attacks",
  "Vulnerabilities in 3rd-party services (Firebase, Vercel, Cashfree) — report directly to them",
  "Vulnerabilities requiring physical access to the user's device",
  "Reports already publicly disclosed elsewhere",
  "Vulnerabilities in domains we don't own (only vrikaan.com + www.vrikaan.com + *.vrikaan.com)",
  "Email spoofing without exploitation evidence (DMARC etc. are policy choices)",
  "Tab-napping / window.opener issues w/o XSS",
  "Clickjacking on pages without sensitive state-change actions",
];

const RULES = [
  "Give us **90 days** to fix before public disclosure (we'll usually patch in days, not months)",
  "Don't access or modify other users' data — use your own test account",
  "Don't run automated scanners against our production — use a copy on localhost if needed",
  "Don't deliberately degrade service (DoS / mass-bot traffic / spam our signup)",
  "Don't request payment / threaten public disclosure to extort a bounty",
  "Don't sell or share the vulnerability with anyone before we patch",
  "Provide enough detail to reproduce — vague reports get vague responses",
];

export default function ResponsibleDisclosure() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Responsible Disclosure · Bug Bounty"
        description="Found a vulnerability in VRIKAAN? Report it via responsible disclosure. ₹2k-25k bounties + Hall of Fame credit + 1-year Pro plan. 48h acknowledgement."
        path="/responsible-disclosure"
        keywords="vrikaan bug bounty, responsible disclosure india, vrikaan security researcher, indian bug bounty program"
      />
      <Navbar />

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "100px 24px 80px" }}>
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 999,
            background: "rgba(20, 184, 166,0.10)", border: `1px solid ${T.cyan}40`,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
            color: T.cyan, marginBottom: 14,
          }}>🛡 Bug Bounty · India-First</span>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px", lineHeight: 1.1,
          }}>
            Find a vulnerability?<br />
            <span style={{ color: T.cyan }}>We pay + credit you.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
            VRIKAAN runs a coordinated-disclosure program. Report responsibly →
            we acknowledge within 48 hours → patch in days → reward you w/ INR cash + Hall of Fame credit + free Pro plan.
          </p>
        </header>

        {/* How to report */}
        <div style={{
          padding: 24, borderRadius: 16, marginBottom: 22,
          background: `linear-gradient(135deg, ${T.cyan}1a, ${T.accent}1a)`,
          border: `1px solid ${T.cyan}55`, textAlign: "center",
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 14px" }}>
            📧 Report at <span style={{ color: T.cyan }}>hello@vrikaan.com</span>
          </h2>
          <p style={{ color: T.muted, fontSize: 13, margin: "0 0 18px", lineHeight: 1.6 }}>
            Subject prefix: <code style={{ background: "rgba(2,6,23,0.6)", padding: "2px 8px", borderRadius: 6, color: T.cyan, fontFamily: "ui-monospace, Menlo, monospace" }}>[SECURITY]</code>
            <br />Include: vuln type, impact, reproduction steps, affected URL, your name/handle (for Hall of Fame credit).
          </p>
          <a href="mailto:hello@vrikaan.com?subject=%5BSECURITY%5D%20Vulnerability%20Report&body=Vuln%20type%3A%0AAffected%20URL%3A%0AImpact%3A%0AReproduction%20steps%3A%0A%0AMy%20name%2Fhandle%3A%0APreferred%20bounty%20payment%20method%3A%20(UPI%20%2F%20IMPS%20%2F%20PayPal)"
             style={{
               display: "inline-block",
               padding: "12px 28px", borderRadius: 10,
               background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 15,
               textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
             }}>📩 Open pre-filled email</a>
        </div>

        {/* SLA */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 22,
          background: T.card, border: `1px solid ${T.border}`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 14px" }}>
            ⏱ Our SLA — what to expect
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: T.muted, fontSize: 14, lineHeight: 2 }}>
            <li><strong style={{ color: T.cyan }}>Within 48 hours</strong> — acknowledgement + initial triage</li>
            <li><strong style={{ color: T.cyan }}>Within 7 days</strong> — severity rating + remediation timeline</li>
            <li><strong style={{ color: T.cyan }}>Within 14 days</strong> — fix deployed (Critical/High) · Within 30 days (Medium/Low)</li>
            <li><strong style={{ color: T.cyan }}>Within 60 days</strong> — bounty paid via UPI / IMPS / PayPal + Hall of Fame credit live (if you opted in)</li>
            <li><strong style={{ color: T.cyan }}>Within 90 days</strong> — public disclosure (coordinated w/ you) if vuln is interesting</li>
          </ul>
        </div>

        {/* Bounty table */}
        <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "32px 0 14px" }}>
          💰 Bounty tiers (INR)
        </h2>
        <p style={{ color: T.muted, fontSize: 13, margin: "0 0 18px", lineHeight: 1.6 }}>
          We're bootstrapped, so bounties are lower than FAANG — but we pay in INR (no foreign-transfer hassle), credit publicly, and act fast.
        </p>
        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          {SEVERITIES.map(s => (
            <div key={s.level} style={{
              background: T.card, border: `1px solid ${s.color}55`, borderRadius: 14,
              padding: 18, borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  padding: "4px 10px", borderRadius: 999,
                  background: `${s.color}1a`, color: s.color,
                  border: `1px solid ${s.color}55`,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}>{s.level}</span>
                <span style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{s.bounty}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 13, lineHeight: 1.8 }}>
                {s.examples.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 22,
          background: T.card, border: `1px solid ${T.border}`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.white, margin: "0 0 14px" }}>
            ✅ Rules of engagement
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: T.muted, fontSize: 14, lineHeight: 1.9 }}>
            {RULES.map((r, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: r.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${T.white}">$1</strong>`) }} />
            ))}
          </ul>
        </div>

        {/* Out of scope */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 22,
          background: `${T.red}0a`, border: `1px solid ${T.red}33`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.red, margin: "0 0 14px" }}>
            ❌ Out of scope
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: T.muted, fontSize: 13, lineHeight: 1.8 }}>
            {OUT_OF_SCOPE.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>

        {/* In scope */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 22,
          background: `${T.green}0a`, border: `1px solid ${T.green}33`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, color: T.green, margin: "0 0 14px" }}>
            ✅ In scope
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: T.muted, fontSize: 13, lineHeight: 1.8 }}>
            <li><strong style={{ color: T.white }}>vrikaan.com</strong> + <strong style={{ color: T.white }}>www.vrikaan.com</strong> (production)</li>
            <li><strong style={{ color: T.white }}>vrikaan.com/api/*</strong> (serverless functions)</li>
            <li><strong style={{ color: T.white }}>github.com/sahilnikam2410/vrikaan</strong> (public source)</li>
            <li>Authentication bypass / privilege escalation</li>
            <li>IDOR / cross-user data leakage</li>
            <li>Stored or reflected XSS, SQL/NoSQL injection</li>
            <li>Cashfree webhook signature bypass</li>
            <li>Firestore security-rule bypass</li>
            <li>RCE on serverless functions</li>
            <li>Subdomain takeover (orphan DNS records)</li>
          </ul>
        </div>

        {/* Hall of Fame link */}
        <div style={{
          padding: 22, borderRadius: 14, marginBottom: 22, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}33`,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 22, color: T.white, margin: "0 0 10px" }}>
            🏆 Hall of Fame
          </h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 16px" }}>
            Researchers who helped make VRIKAAN safer.
          </p>
          <Link to="/security/hall-of-fame" style={{
            display: "inline-block", padding: "11px 22px", borderRadius: 10,
            background: T.cyan, color: T.bg, fontWeight: 800, fontSize: 14,
            textDecoration: "none", fontFamily: "'Vrikaan Sans', sans-serif",
          }}>See the wall →</Link>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 24, padding: 16, color: T.mutedDark, fontSize: 12,
          textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${T.border}`,
        }}>
          📜 Machine-readable: <a href="/.well-known/security.txt" style={{ color: T.cyan }}>/.well-known/security.txt</a> (RFC 9116)<br />
          🇮🇳 Built in Nashik · Free forever · Thanks for keeping VRIKAAN safe
        </p>
      </main>

      <Footer />
    </div>
  );
}
