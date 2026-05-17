import { useEffect, useState } from "react";

/**
 * ScrollProgress — fixed gradient bar at top showing scroll % across the page.
 * Cyan → indigo gradient. Fades out near top to avoid masthead overlap.
 * Always-on, ultra-thin (3px), GPU-accelerated transform.
 */
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const next = Math.max(0, Math.min(1, h.scrollTop / max));
      setPct(next);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { compute(); raf = 0; });
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 3, zIndex: 9999, pointerEvents: "none",
        background: "rgba(15,23,42,0.0)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct * 100}%`,
          background: "linear-gradient(90deg, #14E3C5 0%, #6366F1 50%, #14E3C5 100%)",
          backgroundSize: "200% 100%",
          backgroundPosition: `${pct * 100}% 50%`,
          boxShadow: pct > 0.02 ? "0 0 12px rgba(20,227,197,0.6), 0 0 24px rgba(99,102,241,0.4)" : "none",
          transition: "box-shadow 0.2s ease",
          willChange: "width",
          borderRadius: "0 3px 3px 0",
        }}
      />
    </div>
  );
}
