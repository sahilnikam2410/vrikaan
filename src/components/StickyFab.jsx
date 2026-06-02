import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * StickyFab — floating "Try Free" CTA bottom-left.
 * Appears after user scrolls past hero. Expands on hover.
 * Hidden on /dashboard, /admin/*, tool pages — only marketing pages.
 *
 * Mount once at homepage level.
 */
export default function StickyFab() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes vrk-fab-in {
          from { transform: translateY(80px) scale(0.6); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes vrk-fab-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(20, 184, 166,0.6); }
          70% { box-shadow: 0 0 0 16px rgba(20, 184, 166,0); }
          100% { box-shadow: 0 0 0 0 rgba(20, 184, 166,0); }
        }
        @media (max-width: 720px) {
          .vrk-fab { bottom: 80px !important; }
        }
      `}</style>
      <Link
        to="/signup"
        className="vrk-fab"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: "fixed", bottom: 28, left: 28, zIndex: 800,
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: expanded ? "14px 22px" : "14px 14px",
          background: "linear-gradient(135deg, #14b8a6, #6366F1)",
          color: "#060a14",
          borderRadius: 999,
          fontWeight: 800, fontSize: 14, textDecoration: "none",
          fontFamily: "'Vrikaan Sans', 'Vrikaan Sans', sans-serif",
          boxShadow: "0 12px 32px rgba(20, 184, 166,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset",
          animation: "vrk-fab-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), vrk-fab-pulse-ring 2.4s ease infinite",
          transition: "padding 0.25s, transform 0.15s",
          maxWidth: expanded ? 220 : 52,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🛡</span>
        <span style={{
          fontSize: 14, fontWeight: 800,
          opacity: expanded ? 1 : 0,
          transition: "opacity 0.2s",
          letterSpacing: 0.3,
        }}>Try VRIKAAN free →</span>
      </Link>
    </>
  );
}
