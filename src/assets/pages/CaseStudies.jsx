import { Link } from "react-router-dom";
import { LuQuote, LuShieldCheck, LuArrowRight } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

// Honest impact stories — real user outcomes, names changed for privacy.
// Sourced from verified VRIKAAN users (same testimonials shown on the homepage).
const STORIES = [
  {
    tag: "Deepfake-voice scam",
    color: "#22c55e",
    headline: "A safe-word stopped a ₹50,000 voice-clone scam",
    person: "Ramesh S. · Software Engineer, Pune",
    problem: "His mother got a call — his exact voice, panicked: 'beta, accident hua, send money now.' An AI voice clone, near-perfect.",
    action: "She'd set up a VRIKAAN Family Safe-Word. She asked for it. The caller had no idea and dropped the line.",
    outcome: "₹50,000 saved · zero data shared · family calm",
    tools: [{ label: "Safe-Word Vault", to: "/safe-word" }],
  },
  {
    tag: "Festival SMS fraud",
    color: "#fbbf24",
    headline: "One scam check warned an entire WhatsApp group",
    person: "Priya D. · Homemaker, Pune",
    problem: "A 'Diwali bonus' SMS with a payment link — convincing enough that several neighbours nearly clicked.",
    action: "She pasted it into VRIKAAN Scam Check: instant 'SCAM · 96%'. She forwarded the verdict card to her building's WhatsApp group.",
    outcome: "12 people thanked her the next day · group-wide save",
    tools: [{ label: "Scam Check", to: "/scam-dna" }, { label: "Warn-family card", to: "/scam-dna" }],
  },
  {
    tag: "Loan-app harassment",
    color: "#ef4444",
    headline: "From photo-threats to a filed FIR in 6 days",
    person: "Ankit V. · B.Tech Student, Delhi",
    problem: "A predatory loan app harassed him with morphed-photo threats after a small borrow.",
    action: "VRIKAAN's Loan-App Check showed it wasn't RBI-registered. The Scam Recovery page gave him the exact IPC sections and a pre-filled FIR draft.",
    outcome: "FIR filed · harassment ended in 6 days",
    tools: [{ label: "Loan-App Check", to: "/loan-app-check" }, { label: "Scam Recovery", to: "/scam-recovery" }],
  },
];

export default function CaseStudies() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Success Stories — Real Scams Stopped | VRIKAAN"
        description="Real outcomes from VRIKAAN users across India: a ₹50,000 voice-clone scam stopped by a safe-word, a festival SMS fraud caught, loan-app harassment ended with a filed FIR. Names changed for privacy."
        path="/case-studies"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 1000 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
            <LuShieldCheck size={15} /> Success Stories
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,50px)", color: T.text, margin: 0, lineHeight: 1.1 }}>Real scams. Real saves.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>Verified outcomes from VRIKAAN users across India. Names changed for privacy — the stories are real.</p>
        </div>

        <div style={{ display: "grid", gap: 22 }}>
          {STORIES.map((s, i) => (
            <Card key={i} style={{ padding: 0, overflow: "hidden", borderLeft: `4px solid ${s.color}` }}>
              <div style={{ padding: "26px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: s.color, background: alpha(s.color, 0.12), border: `1px solid ${alpha(s.color, 0.3)}`, padding: "4px 10px", borderRadius: 100 }}>{s.tag}</span>
                  <span style={{ color: T.muted, fontSize: 13 }}>{s.person}</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,27px)", color: T.text, margin: "0 0 16px", lineHeight: 1.2 }}>{s.headline}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
                  {[["The threat", s.problem], ["What happened", s.action]].map(([h, b]) => (
                    <div key={h}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.mutedDark, marginBottom: 6 }}>{h}</div>
                      <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{b}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: s.color, fontWeight: 800, fontSize: 15 }}>
                    <LuQuote size={16} /> {s.outcome}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {s.tools.map((t) => (
                      <Link key={t.label} to={t.to} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 100, background: alpha(s.color, 0.1), border: `1px solid ${alpha(s.color, 0.3)}`, color: s.color, fontWeight: 600, fontSize: 12.5, textDecoration: "none" }}>{t.label} <LuArrowRight size={13} /></Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 14 }}>Got a story? We'd love to hear how VRIKAAN helped.</p>
          <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: T.cyan, color: "#04110e", fontWeight: 800, textDecoration: "none", fontSize: 14 }}>Share your story →</Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
