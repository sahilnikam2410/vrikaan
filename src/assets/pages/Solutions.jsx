import { useParams, Link } from "react-router-dom";
import { LuArrowRight, LuTriangleAlert, LuShieldCheck, LuBuilding2 } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";
import { SOLUTIONS, getSolution } from "../../data/solutions";

export default function Solutions() {
  const { slug } = useParams();
  const sol = slug ? getSolution(slug) : null;
  return slug && sol ? <Detail sol={sol} /> : <Hub />;
}

// ── /solutions hub ──────────────────────────────────────────────────
function Hub() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Solutions by Industry — Cyber Defense for India | VRIKAAN"
        description="AI-powered cyber-defense built for Indian banks, fintech, government, enterprises and families. 24×7 SOC, Scam DNA threat intelligence, UPI fraud protection and more."
        path="/solutions"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 1100 }}>
        <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 44px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
            <LuBuilding2 size={15} /> Solutions by Industry
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,52px)", color: T.text, margin: 0, lineHeight: 1.1 }}>Built for how India gets scammed.</h1>
          <p style={{ color: T.muted, fontSize: 17, marginTop: 14 }}>One AI cyber-defense platform, tuned to each sector — from nationalised banks to first-time internet users.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {SOLUTIONS.map((s) => (
            <Link key={s.slug} to={`/solutions/${s.slug}`} style={{ textDecoration: "none" }}>
              <Card hover style={{ padding: 24, height: "100%", borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 34, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: T.text, marginBottom: 6 }}>{s.name}</div>
                <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{s.tagline}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: s.color, fontWeight: 700, fontSize: 13.5 }}>Explore <LuArrowRight size={15} /></span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
      <Footer />
    </div>
  );
}

// ── /solutions/:slug detail ─────────────────────────────────────────
function Detail({ sol }) {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title={`${sol.name} — Cyber Defense Solutions | VRIKAAN`}
        description={`${sol.tagline} ${sol.intro}`.slice(0, 300)}
        path={`/solutions/${sol.slug}`}
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, maxWidth: 980 }}>
        {/* Hero */}
        <Link to="/solutions" style={{ color: T.muted, fontSize: 13, textDecoration: "none" }}>← All solutions</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0 10px" }}>
          <div style={{ fontSize: 44 }}>{sol.icon}</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: sol.color }}>{sol.name}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,42px)", color: T.text, margin: "2px 0 0", lineHeight: 1.12 }}>{sol.tagline}</h1>
          </div>
        </div>
        <p style={{ color: T.muted, fontSize: 16.5, lineHeight: 1.7, maxWidth: 760, marginBottom: 20 }}>{sol.intro}</p>

        {/* Stat */}
        <Card style={{ padding: "18px 24px", display: "inline-flex", alignItems: "baseline", gap: 12, marginBottom: 40, border: `1px solid ${alpha(sol.color, 0.3)}` }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: sol.color }}>{sol.stat.value}</span>
          <span style={{ color: T.muted, fontSize: 14 }}>{sol.stat.label}</span>
        </Card>

        {/* Two columns: challenges + solutions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18, marginBottom: 40 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <LuTriangleAlert size={18} color={T.red} />
              <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>The challenges</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {sol.challenges.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: T.red, marginTop: 2, flexShrink: 0 }}>✕</span>
                  <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.55 }}>{c}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ padding: 24, border: `1px solid ${alpha(sol.color, 0.25)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <LuShieldCheck size={18} color={sol.color} />
              <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>How VRIKAAN helps</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {sol.solutions.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <LuShieldCheck size={16} color={sol.color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.55 }}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Related tools */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>Relevant capabilities</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {sol.tools.map((t) => (
              <Link key={t.to} to={t.to} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 100, background: alpha(sol.color, 0.1), border: `1px solid ${alpha(sol.color, 0.35)}`, color: sol.color, fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}>
                {t.label} <LuArrowRight size={14} />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card style={{ padding: 30, textAlign: "center", border: `1px solid ${alpha(sol.color, 0.3)}`, background: `linear-gradient(180deg, ${alpha(sol.color, 0.05)}, transparent)`, marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: T.text, margin: "0 0 8px", fontWeight: 700 }}>Talk to us about {sol.name}</h2>
          <p style={{ color: T.muted, fontSize: 15, maxWidth: 520, margin: "0 auto 18px" }}>Custom deployment, pricing and a security pack tailored to your organisation.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/enterprise" style={{ padding: "12px 24px", borderRadius: 10, background: sol.color, color: T.onAccent, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>Get in touch →</Link>
            <Link to="/contact" style={{ padding: "12px 24px", borderRadius: 10, background: alpha(sol.color, 0.1), border: `1px solid ${alpha(sol.color, 0.4)}`, color: sol.color, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Contact</Link>
          </div>
        </Card>

        {/* Other solutions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingBottom: 20 }}>
          {SOLUTIONS.filter((s) => s.slug !== sol.slug).map((s) => (
            <Link key={s.slug} to={`/solutions/${s.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 100, background: alpha("#94a3b8", 0.06), border: `1px solid ${T.border}`, color: T.muted, fontSize: 13, textDecoration: "none" }}>
              <span>{s.icon}</span> {s.name}
            </Link>
          ))}
        </div>
      </Section>
      <Footer />
    </div>
  );
}
