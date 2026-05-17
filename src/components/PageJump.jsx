import { useState, useEffect, useRef, useCallback } from "react";

/**
 * PageJump — floating navigation aid.
 *
 *  • ▲ Top button + ▼ Bottom button (always visible after 400px scroll)
 *  • Section dot rail — auto-discovered from `section[id]`, `[data-section]`,
 *    or major headings (h1/h2 with id). Click dot → smooth-scroll to that
 *    section. Active section dot fills cyan and shows section title tooltip.
 *  • Hidden on screens < 720px wide (mobile bottom bar would compete).
 *  • Respects `prefers-reduced-motion` (jumps instantly instead of animating).
 *
 * Drop-in replacement for `<BackToTop />`. Renders nothing until first scroll.
 */
export default function PageJump() {
  const [show, setShow] = useState(false);
  const [sections, setSections] = useState([]); // [{id, label, top}]
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const observerRef = useRef(null);

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const jumpTo = useCallback((y) => {
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  // ── Discover sections + observe active ─────────────────────────────
  useEffect(() => {
    // Wait one tick so React-rendered sections exist
    const discover = () => {
      const els = Array.from(document.querySelectorAll(
        "section[id], [data-section][id], main [id][role='region'], article[id]"
      ));

      // De-dupe + keep only those with a useful label
      const seen = new Set();
      const list = [];
      for (const el of els) {
        if (!el.id || seen.has(el.id)) continue;
        if (el.offsetHeight < 80) continue; // skip tiny hidden anchors
        seen.add(el.id);

        // Label priority: data-jump-label > section heading > id
        const dataLabel = el.getAttribute("data-jump-label");
        const heading = el.querySelector("h1, h2, h3");
        const label = dataLabel
          || (heading?.innerText?.trim()?.slice(0, 28))
          || el.id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

        list.push({ id: el.id, label, el });
      }
      setSections(list);

      // Reset observer
      observerRef.current?.disconnect();
      if (list.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Pick the entry closest to top of viewport that is intersecting
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      list.forEach(s => observerRef.current.observe(s.el));
    };

    // Initial + delayed (catches lazy-rendered pages)
    discover();
    const t1 = setTimeout(discover, 600);
    const t2 = setTimeout(discover, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observerRef.current?.disconnect();
    };
  }, []);

  // ── Show/hide based on scroll ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  const bottomY = () => Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );

  return (
    <>
      <style>{`
        @media (max-width: 720px) { .vrk-pagejump { display: none !important; } }
        @keyframes vrk-pj-in { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        .vrk-pj-btn:hover { background: rgba(20,227,197,0.22) !important; border-color: rgba(20,227,197,0.5) !important; color: #14E3C5 !important; transform: translateY(-1px); }
        .vrk-pj-dot { position: relative; }
        .vrk-pj-dot:hover .vrk-pj-tip { opacity: 1; transform: translateX(-8px); }
      `}</style>
      <div
        className="vrk-pagejump"
        style={{
          position: "fixed",
          right: 18,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "10px 6px",
          background: "rgba(11,18,32,0.7)",
          border: "1px solid rgba(148,163,184,0.12)",
          borderRadius: 999,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "vrk-pj-in 0.35s ease",
          maxHeight: "75vh",
          overflow: "hidden",
        }}
      >
        {/* ▲ Top */}
        <button
          className="vrk-pj-btn"
          onClick={() => jumpTo(0)}
          aria-label="Scroll to top"
          title="Top"
          style={{
            width: 34, height: 34, borderRadius: 999,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#cbd5e1", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l7-7 7 7M12 19V5" />
          </svg>
        </button>

        {/* Section dots */}
        {sections.length > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            padding: "6px 0", maxHeight: "55vh", overflowY: "auto",
          }}>
            {sections.map(s => {
              const active = activeId === s.id;
              return (
                <div
                  key={s.id}
                  className="vrk-pj-dot"
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <button
                    onClick={() => {
                      const rect = s.el.getBoundingClientRect();
                      jumpTo(window.scrollY + rect.top - 80);
                    }}
                    aria-label={`Jump to ${s.label}`}
                    title={s.label}
                    style={{
                      width: active ? 10 : 7,
                      height: active ? 10 : 7,
                      borderRadius: 999,
                      background: active ? "#14E3C5"
                                : hoveredId === s.id ? "rgba(20,227,197,0.55)"
                                : "rgba(148,163,184,0.35)",
                      border: 0, cursor: "pointer", padding: 0,
                      transition: "all 0.2s",
                      boxShadow: active ? "0 0 10px rgba(20,227,197,0.6)" : "none",
                      display: "block",
                    }}
                  />
                  {/* Tooltip */}
                  <span
                    className="vrk-pj-tip"
                    style={{
                      position: "absolute", right: "100%", top: "50%",
                      transform: "translate(0, -50%)",
                      opacity: 0,
                      transition: "opacity 0.2s, transform 0.2s",
                      pointerEvents: "none",
                      marginRight: 6, padding: "4px 10px",
                      background: "rgba(3,7,18,0.95)",
                      border: "1px solid rgba(20,227,197,0.3)",
                      borderRadius: 8,
                      fontSize: 11, fontWeight: 600, color: "#f1f5f9",
                      whiteSpace: "nowrap", fontFamily: "var(--font-body), sans-serif",
                    }}
                  >{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ▼ Bottom */}
        <button
          className="vrk-pj-btn"
          onClick={() => jumpTo(bottomY())}
          aria-label="Scroll to bottom"
          title="Bottom"
          style={{
            width: 34, height: 34, borderRadius: 999,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#cbd5e1", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12l-7 7-7-7M12 5v14" />
          </svg>
        </button>
      </div>
    </>
  );
}
