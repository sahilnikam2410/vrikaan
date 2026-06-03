// VRIKAAN UI kit — shared components. Lightweight CSS-in-JS over inline styles
// + ui.css for hover/focus/motion. Import from "../components/ui".
import { Link } from "react-router-dom";
import { tokens, T, alpha } from "./tokens";
import "./ui.css";

export { tokens, T, alpha };

/* ── Button ──────────────────────────────────────────────────────────
   <Button variant="primary|secondary|ghost|danger" size="sm|md|lg"
           to="/x" href="..." onClick icon={<LuX/>} loading disabled> */
export function Button({
  variant = "primary", size = "md", to, href, icon, iconRight, loading,
  children, style, className = "", ...rest
}) {
  const pad = size === "sm" ? "8px 14px" : size === "lg" ? "15px 26px" : "12px 20px";
  const fs = size === "sm" ? 13 : size === "lg" ? 16 : 14.5;
  const bg = {
    primary: T.cyan, danger: T.red, secondary: "transparent", ghost: "transparent",
  }[variant];
  const color = variant === "primary" || variant === "danger" ? T.onAccent : T.text;
  const border = variant === "secondary" ? `1px solid ${T.border}` : "1px solid transparent";
  const s = {
    padding: pad, fontSize: fs, borderRadius: tokens.radius.md,
    background: variant === "primary" ? T.cyan : variant === "danger" ? T.red : "transparent",
    color: variant === "ghost" ? T.muted : color, border, ...style,
  };
  const cls = `vk-btn vk-btn-${variant} ${className}`;
  const inner = <>{loading ? <Spinner /> : icon}{children}{iconRight}</>;
  if (to) return <Link to={to} className={cls} style={s} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} style={s} {...rest}>{inner}</a>;
  return <button className={cls} style={s} disabled={loading || rest.disabled} {...rest}>{inner}</button>;
}

function Spinner() {
  return <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "currentColor", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

/* ── Card ── */
export function Card({ hover, accent, padding = tokens.space.lg, children, style, className = "", ...rest }) {
  return (
    <div
      className={`vk-card ${hover ? "vk-card-hover" : ""} ${className}`}
      style={{ borderRadius: tokens.radius.lg, padding, ...(accent ? { borderColor: alpha(accent, 0.35) } : null), ...style }}
      {...rest}
    >{children}</div>
  );
}

/* ── Section (max-width container + rhythm) ── */
export function Section({ width = 1100, children, style, className = "" }) {
  return (
    <section className={className} style={{ maxWidth: width, margin: "0 auto", padding: `${tokens.space.xxl}px ${tokens.space.lg}px`, ...style }}>
      {children}
    </section>
  );
}

/* ── PageHero ── eyebrow + title (gradient option) + subtitle + actions ── */
export function PageHero({ eyebrow, icon, title, accent = T.cyan, subtitle, actions, align = "left", style }) {
  return (
    <div className="vk-rise" style={{ textAlign: align, marginBottom: tokens.space.xl, ...style }}>
      {eyebrow && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: accent, textTransform: "uppercase", marginBottom: tokens.space.sm }}>
          {icon}{eyebrow}
        </span>
      )}
      <h1 style={{ fontFamily: tokens.font.sans, fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 800, letterSpacing: -1, lineHeight: 1.08, margin: 0, color: T.text }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: `${tokens.space.md}px ${align === "center" ? "auto" : "0"} 0` }}>
          {subtitle}
        </p>
      )}
      {actions && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: tokens.space.lg, justifyContent: align === "center" ? "center" : "flex-start" }}>{actions}</div>}
    </div>
  );
}

/* ── Input / Textarea ── */
export function Input({ style, ...rest }) {
  return <input className="vk-input" style={{ width: "100%", background: alpha("#020617", 0.5), border: `1px solid ${T.border}`, borderRadius: tokens.radius.md, color: T.text, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", ...style }} {...rest} />;
}
export function Textarea({ style, ...rest }) {
  return <textarea className="vk-input" style={{ width: "100%", background: alpha("#020617", 0.5), border: `1px solid ${T.border}`, borderRadius: tokens.radius.md, color: T.text, padding: "12px 14px", fontSize: 15, resize: "vertical", boxSizing: "border-box", ...style }} {...rest} />;
}

/* ── Badge ── */
export function Badge({ tone = T.cyan, icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: tokens.radius.pill, background: alpha(tone, 0.14), border: `1px solid ${alpha(tone, 0.4)}`, color: tone, fontSize: 11.5, fontWeight: 700, ...style }}>
      {icon}{children}
    </span>
  );
}

/* ── Stat ── */
export function Stat({ value, label, color = T.cyan, icon }) {
  return (
    <div style={{ flex: "1 1 130px", textAlign: "center", padding: "14px 10px", background: alpha("#020617", 0.3), border: `1px solid ${T.border}`, borderRadius: tokens.radius.md }}>
      {icon && <div style={{ color, marginBottom: 4, display: "flex", justifyContent: "center" }}>{icon}</div>}
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: tokens.font.sans }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── EmptyState ── */
export function EmptyState({ icon, title, children, action }) {
  return (
    <div style={{ textAlign: "center", padding: `${tokens.space.xl}px ${tokens.space.lg}px`, color: T.dim }}>
      {icon && <div style={{ marginBottom: tokens.space.md, opacity: 0.6, display: "flex", justifyContent: "center" }}>{icon}</div>}
      {title && <div style={{ fontSize: 16, fontWeight: 700, color: T.muted, marginBottom: 6 }}>{title}</div>}
      {children && <div style={{ fontSize: 14, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>{children}</div>}
      {action && <div style={{ marginTop: tokens.space.md }}>{action}</div>}
    </div>
  );
}
