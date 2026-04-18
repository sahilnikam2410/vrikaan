import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO, { breadcrumbSchema } from "../../components/SEO";
import THREATS, { THREAT_CATEGORIES } from "../../data/threats";

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

export default function ThreatDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return THREATS.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.lede.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Cybersecurity Threat Directory"
        description="A plain-English directory of the most common cybersecurity threats — phishing, ransomware, SIM swapping, romance scams and more. Signs, examples, and prevention for each."
        path="/threats"
        keywords="cybersecurity threats, phishing, ransomware, scam types, online fraud, security guide"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Threats", path: "/threats" },
        ])}
      />
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: T.cyan, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, marginBottom: 12 }}>
            THREAT DIRECTORY
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Know the threats. Defend smarter.
          </h1>
          <p style={{ fontSize: 16, color: T.muted, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
            Plain-English guides to the most common cyber threats. Each entry covers
            warning signs, real-world examples, and the prevention steps that actually work.
          </p>
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search threats..."
            style={{
              flex: "1 1 280px",
              maxWidth: 420,
              padding: "12px 16px",
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              color: T.white,
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "12px 16px",
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              color: T.white,
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {THREAT_CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ background: "#0a0f1e" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
            No threats matched "{query}". Try a different term or clear the filter.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
            {filtered.map((threat) => (
              <Link
                key={threat.slug}
                to={`/threat/${threat.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  padding: "22px 22px 20px",
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(20,227,197,0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: T.mutedDark,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {threat.category}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: SEVERITY_COLOR[threat.severity],
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      padding: "3px 8px",
                      background: `${SEVERITY_COLOR[threat.severity]}14`,
                      border: `1px solid ${SEVERITY_COLOR[threat.severity]}40`,
                      borderRadius: 6,
                    }}
                  >
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 8 }}>
                  {threat.title}
                </div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                  {threat.lede.length > 140 ? threat.lede.slice(0, 140) + "…" : threat.lede}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: T.cyan,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Read guide <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
