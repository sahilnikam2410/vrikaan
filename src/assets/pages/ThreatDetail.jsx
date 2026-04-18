import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO, { faqSchema, breadcrumbSchema } from "../../components/SEO";
import THREATS, { getThreatBySlug, getRelatedThreats } from "../../data/threats";

const T = {
  bg: "#030712",
  card: "rgba(17,24,39,0.6)",
  border: "rgba(148,163,184,0.08)",
  accent: "#6366f1",
  cyan: "#14e3c5",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  red: "#ef4444",
  gold: "#eab308",
  green: "#22c55e",
};

const SEVERITY_COLOR = {
  Critical: T.red,
  High: T.gold,
  Medium: T.cyan,
  Low: T.green,
};

export default function ThreatDetail() {
  const { slug } = useParams();
  const threat = getThreatBySlug(slug);

  if (!threat) return <Navigate to="/threats" replace />;

  const related = getRelatedThreats(threat.related || []);

  // Build FAQ structured data for rich snippets.
  const faq = faqSchema([
    {
      q: `What is ${threat.title}?`,
      a: threat.lede,
    },
    {
      q: `How can I recognize a ${threat.title.toLowerCase()} attack?`,
      a: `Look for: ${threat.signs.slice(0, 3).join("; ")}.`,
    },
    {
      q: `How do I protect myself from ${threat.title.toLowerCase()}?`,
      a: threat.prevention.slice(0, 3).join(" ").replace(/\s+/g, " "),
    },
  ]);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Threats", path: "/threats" },
    { name: threat.title, path: `/threat/${threat.slug}` },
  ]);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title={`${threat.title}: Signs, Examples & Prevention`}
        description={threat.lede}
        path={`/threat/${threat.slug}`}
        keywords={`${threat.title}, ${threat.category}, cybersecurity, ${threat.slug}, ${threat.related.join(", ")}`}
        type="article"
        jsonLd={[faq, breadcrumb]}
      />
      <Navbar />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "120px 24px 80px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: T.mutedDark, marginBottom: 20 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link to="/threats" style={{ color: T.mutedDark, textDecoration: "none" }}>
            Threats
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: T.muted }}>{threat.title}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                color: T.mutedDark,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                padding: "4px 10px",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
              }}
            >
              {threat.category.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 11,
                color: SEVERITY_COLOR[threat.severity],
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                letterSpacing: 1,
                padding: "4px 10px",
                background: `${SEVERITY_COLOR[threat.severity]}14`,
                border: `1px solid ${SEVERITY_COLOR[threat.severity]}40`,
                borderRadius: 6,
              }}
            >
              {threat.severity.toUpperCase()} SEVERITY
            </span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 18px", lineHeight: 1.15 }}>
            {threat.title}
          </h1>
          <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, margin: 0 }}>
            {threat.lede}
          </p>
        </div>

        {/* Warning signs */}
        <Section title="Warning Signs" icon="⚠" color={T.gold}>
          <ul style={listStyle}>
            {threat.signs.map((s, i) => (
              <li key={i} style={itemStyle}>
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Real examples */}
        <Section title="Real-World Examples" icon="🔍" color={T.cyan}>
          <ul style={listStyle}>
            {threat.examples.map((e, i) => (
              <li key={i} style={itemStyle}>
                {e}
              </li>
            ))}
          </ul>
        </Section>

        {/* Prevention */}
        <Section title="How to Protect Yourself" icon="🛡" color={T.green}>
          <ul style={listStyle}>
            {threat.prevention.map((p, i) => (
              <li key={i} style={itemStyle}>
                {p}
              </li>
            ))}
          </ul>
        </Section>

        {/* CTA to related tool */}
        {threat.relatedTool && (
          <div
            style={{
              marginTop: 40,
              padding: "24px 28px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,227,197,0.05))",
              border: `1px solid rgba(20,227,197,0.2)`,
              borderRadius: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: "1 1 260px" }}>
              <div
                style={{
                  fontSize: 11,
                  color: T.cyan,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 1.5,
                  marginBottom: 6,
                }}
              >
                TRY IT
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                Use our {threat.relatedTool.name}
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>
                Scan a suspicious {threat.category === "Social Engineering" ? "URL, email, or message" : "target"} in under 10 seconds.
              </div>
            </div>
            <Link
              to={threat.relatedTool.path}
              style={{
                padding: "12px 22px",
                background: T.cyan,
                color: "#030712",
                textDecoration: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Open {threat.relatedTool.name} →
            </Link>
          </div>
        )}

        {/* Related threats */}
        {related.length > 0 && (
          <div style={{ marginTop: 50 }}>
            <div
              style={{
                fontSize: 12,
                color: T.mutedDark,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              RELATED THREATS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/threat/${r.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: "14px 16px",
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(20,227,197,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 4 }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>{r.category}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to directory */}
        <div style={{ marginTop: 50, textAlign: "center" }}>
          <Link to="/threats" style={{ color: T.cyan, fontSize: 14, textDecoration: "none", fontWeight: 600 }}>
            ← Browse all threats
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const listStyle = { margin: 0, paddingLeft: 20 };
const itemStyle = { fontSize: 15, color: T.muted, lineHeight: 1.75, marginBottom: 8 };

function Section({ title, icon, color, children }) {
  return (
    <section style={{ marginBottom: 32, padding: "22px 24px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color, margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
