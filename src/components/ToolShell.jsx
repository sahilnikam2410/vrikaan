import Navbar from "./Navbar";
import Footer from "./Footer";
import SEO from "./SEO";
import ToolIcon from "../lib/toolIcons.jsx";
import { Section, T, alpha } from "./ui";

/**
 * ToolShell — standard chrome for every tool page: background, Navbar, SEO,
 * a max-width Section, and a consistent hero (icon tile + eyebrow + title +
 * subtitle). The tool's form/result is passed as children. Migrating a tool
 * page = replace its hand-rolled wrapper+hero with <ToolShell ...>{body}</>.
 *
 *   <ToolShell route="/scam-check" eyebrow="AI Tool"
 *     title="Scam Message Checker" subtitle="Paste a message…">
 *     {form/result}
 *   </ToolShell>
 */
export default function ToolShell({
  route, icon, eyebrow = "Security Tool", accent = T.cyan,
  title, titleAccent, subtitle, width = 820,
  seoTitle, seoDesc, path, actions, topSlot, footer, children,
}) {
  const iconEl = icon || (route ? <ToolIcon to={route} size={26} /> : null);
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title={seoTitle || (title ? `${title} | VRIKAAN` : "VRIKAAN")} description={seoDesc} path={path || route} />
      <Navbar />
      {topSlot && <div style={{ maxWidth: width, margin: "0 auto", padding: "0 20px" }}>{topSlot}</div>}
      <Section width={width} style={{ paddingTop: 100 }}>
        <div className="vk-rise" style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: subtitle ? 14 : 0 }}>
            {iconEl && (
              <span style={{
                width: 56, height: 56, borderRadius: 15, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: alpha(accent, 0.14), color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
              }}>{iconEl}</span>
            )}
            <div style={{ minWidth: 0 }}>
              {eyebrow && (
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: accent, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>
              )}
              <h1 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(28px, 4.5vw, 40px)", fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, margin: 0 }}>
                {title}{titleAccent && <> <span style={{ color: accent }}>{titleAccent}</span></>}
              </h1>
            </div>
          </div>
          {subtitle && (
            <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{subtitle}</p>
          )}
          {actions && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>{actions}</div>}
        </div>
        {children}
      </Section>
      {footer && <Footer />}
    </div>
  );
}
