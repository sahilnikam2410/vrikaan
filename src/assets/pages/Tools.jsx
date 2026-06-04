import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LuSearch, LuWrench } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import ToolIcon from "../../lib/toolIcons.jsx";
import { toolsMenu, stripEmoji } from "../../lib/toolsCatalog";
import { Section, PageHero, Card, Input, T, alpha } from "../../components/ui";

export default function Tools() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!query) return toolsMenu;
    return toolsMenu
      .map((g) => ({
        ...g,
        items: g.items.filter((it) =>
          stripEmoji(it.label).toLowerCase().includes(query) ||
          (it.desc || "").toLowerCase().includes(query) ||
          it.to.includes(query)
        ),
      }))
      .filter((g) => g.items.length);
  }, [query]);

  const total = toolsMenu.reduce((n, g) => n + g.items.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="All Tools — VRIKAAN" description="Every VRIKAAN cyber-defense tool in one place — scam detection, UPI fraud check, dark-web monitoring, password vault, deepfake detection and more. India-first, mostly free." path="/tools" />
      <Navbar />
      <Section width={1120} style={{ paddingTop: 100 }}>
        <PageHero
          eyebrow="Toolbox" icon={<LuWrench size={14} />}
          title={<>All <span style={{ color: T.cyan }}>Tools</span></>}
          subtitle={`${total} cyber-defense tools, grouped by what they do. Click any tool to open it — most are free.`}
        />

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 460, marginBottom: 36 }}>
          <LuSearch size={17} color={T.dim} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools…" style={{ paddingLeft: 40 }} />
        </div>

        {groups.length === 0 && (
          <p style={{ color: T.dim, textAlign: "center", padding: 40 }}>No tools match “{q}”.</p>
        )}

        {groups.map((group) => (
          <div key={group.label} style={{ marginBottom: 44 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: T.cyan, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              {group.label}
              <span style={{ fontSize: 11, fontWeight: 600, color: T.dim, letterSpacing: 0 }}>{group.items.length}</span>
              <span style={{ flex: 1, height: 1, background: T.border }} />
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {group.items.map((it) => (
                <Card key={it.to} hover padding={16} style={{ display: "flex" }}>
                  <Link to={it.to} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", width: "100%" }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: alpha(T.cyan, 0.14), color: T.cyan, border: `1px solid ${alpha(T.cyan, 0.25)}` }}>
                      <ToolIcon to={it.to} size={20} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stripEmoji(it.label)}</div>
                      <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.4 }}>{it.desc}</div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </Section>
      <Footer />
    </div>
  );
}
