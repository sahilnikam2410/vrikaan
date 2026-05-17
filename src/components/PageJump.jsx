import { useState, useEffect, useRef, useCallback } from "react";

/**
 * PageJump — floating page navigation.
 *
 *  • ▲ Top button + ▼ Bottom button (after 400px scroll)
 *  • Section dot rail — auto-discovered from `section[id]`, `[data-section][id]`,
 *    `main [id][role='region']`, `article[id]`. Active dot fills cyan + glows.
 *  • Hover dot → rich preview card (section number + title + first paragraph).
 *  • Keyboard shortcuts (Vim-style):
 *      g g  → top
 *      G    → bottom
 *      j    → next section
 *      k    → previous section
 *      ?    → toggle help overlay
 *      Esc  → close help overlay
 *  • Shortcuts disabled while typing in input / textarea / contenteditable.
 *  • Hidden on screens < 720px wide.
 *  • Respects `prefers-reduced-motion`.
 */
export default function PageJump() {
  const [show, setShow] = useState(false);
  const [sections, setSections] = useState([]); // [{id, label, blurb, el}]
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const observerRef = useRef(null);
  const keySeqRef = useRef({ lastKey: "", at: 0 });

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const jumpTo = useCallback((y) => {
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const jumpToSection = useCallback((s) => {
    if (!s?.el) return;
    const rect = s.el.getBoundingClientRect();
    jumpTo(window.scrollY + rect.top - 80);
  }, [jumpTo]);

  const bottomY = useCallback(() => Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  ), []);

  // ── Discover sections + active observer ───────────────────────────
  useEffect(() => {
    const discover = () => {
      const els = Array.from(document.querySelectorAll(
        "section[id], [data-section][id], main [id][role='region'], article[id]"
      ));
      const seen = new Set();
      const list = [];
      for (const el of els) {
        if (!el.id || seen.has(el.id)) continue;
        if (el.offsetHeight < 80) continue;
        seen.add(el.id);

        const dataLabel = el.getAttribute("data-jump-label");
        const heading = el.querySelector("h1, h2, h3");
        const label = dataLabel
          || (heading?.innerText?.trim()?.slice(0, 32))
          || el.id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

        // Pull short blurb: first <p> text, capped 120 chars
        const para = el.querySelector("p");
        const blurb = para?.innerText?.trim()?.replace(/\s+/g, " ").slice(0, 120) || "";

        list.push({ id: el.id, label, blurb, el });
      }
      setSections(list);

      observerRef.current?.disconnect();
      if (list.length === 0) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      list.forEach(s => observerRef.current.observe(s.el));
    };

    discover();
    const t1 = setTimeout(discover, 600);
    const t2 = setTimeout(discover, 1800);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      observerRef.current?.disconnect();
    };
  }, []);

  // ── Show/hide rail based on scroll ─────────────────────────────────
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Vim-style keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };

    const indexOfActive = () => sections.findIndex(s => s.id === activeId);

    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping()) return;
      // Allow shortcuts when focus on body/html/buttons w/o text input
      const k = e.key;

      // Esc closes help
      if (k === "Escape" && helpOpen) { setHelpOpen(false); return; }
      // ? toggles help (Shift+/)
      if (k === "?") { e.preventDefault(); setHelpOpen(o => !o); return; }

      // G → bottom
      if (k === "G") { e.preventDefault(); jumpTo(bottomY()); return; }

      // g g → top (double-tap g within 600 ms)
      if (k === "g") {
        const now = Date.now();
        const seq = keySeqRef.current;
        if (seq.lastKey === "g" && now - seq.at < 600) {
          e.preventDefault();
          jumpTo(0);
          keySeqRef.current = { lastKey: "", at: 0 };
        } else {
          keySeqRef.current = { lastKey: "g", at: now };
        }
        return;
      }

      // j → next section
      if (k === "j") {
        if (sections.length === 0) return;
        e.preventDefault();
        const i = indexOfActive();
        const next = sections[Math.min(sections.length - 1, (i < 0 ? 0 : i + 1))];
        jumpToSection(next);
        return;
      }
      // k → previous section
      if (k === "k") {
        if (sections.length === 0) return;
        e.preventDefault();
        const i = indexOfActive();
        const prev = sections[Math.max(0, (i < 0 ? 0 : i - 1))];
        jumpToSection(prev);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sections, activeId, helpOpen, jumpTo, jumpToSection, bottomY]);

  const hoveredSection = sections.find(s => s.id === hoveredId);
  const hoveredIdx = hoveredSection ? sections.indexOf(hoveredSection) : -1;

  return (
    <>
      <style>{`
        @media (max-width: 720px) { .vrk-pagejump, .vrk-pj-help { display: none !important; } }
        @keyframes vrk-pj-in { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vrk-help-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        .vrk-pj-btn:hover { background: rgba(20,227,197,0.22) !important; border-color: rgba(20,227,197,0.5) !important; color: #14E3C5 !important; transform: translateY(-1px); }
        .vrk-pj-dot { position: relative; }
      `}</style>

      {/* ── Floating rail ── */}
      {show && (
        <div
          className="vrk-pagejump"
          style={{
            position: "fixed", right: 18, top: "50%",
            transform: "translateY(-50%)", zIndex: 900,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "10px 6px",
            background: "rgba(11,18,32,0.7)",
            border: "1px solid rgba(148,163,184,0.12)",
            borderRadius: 999,
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            animation: "vrk-pj-in 0.35s ease",
            maxHeight: "75vh", overflow: "visible",
          }}
        >
          {/* ▲ Top */}
          <button
            className="vrk-pj-btn"
            onClick={() => jumpTo(0)}
            aria-label="Scroll to top (gg)"
            title="Top (gg)"
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
              display: "flex", flexDirection: "column", gap: 7,
              padding: "6px 0", maxHeight: "55vh", overflowY: "auto",
            }}>
              {sections.map(s => {
                const active = activeId === s.id;
                const hov = hoveredId === s.id;
                return (
                  <div
                    key={s.id}
                    className="vrk-pj-dot"
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(prev => prev === s.id ? null : prev)}
                  >
                    <button
                      onClick={() => jumpToSection(s)}
                      aria-label={`Jump to ${s.label}`}
                      title={s.label}
                      style={{
                        width: active ? 10 : 7,
                        height: active ? 10 : 7,
                        borderRadius: 999,
                        background: active ? "#14E3C5"
                                  : hov ? "rgba(20,227,197,0.55)"
                                  : "rgba(148,163,184,0.35)",
                        border: 0, cursor: "pointer", padding: 0,
                        transition: "all 0.2s",
                        boxShadow: active ? "0 0 10px rgba(20,227,197,0.6)" : "none",
                        display: "block",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ▼ Bottom */}
          <button
            className="vrk-pj-btn"
            onClick={() => jumpTo(bottomY())}
            aria-label="Scroll to bottom (Shift+G)"
            title="Bottom (Shift+G)"
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

          {/* ? help trigger */}
          <button
            onClick={() => setHelpOpen(o => !o)}
            aria-label="Keyboard shortcuts (?)"
            title="Keyboard shortcuts (?)"
            style={{
              width: 22, height: 22, borderRadius: 999,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.18)",
              color: "#94a3b8", cursor: "pointer", fontSize: 11,
              fontWeight: 700, fontFamily: "ui-monospace, monospace",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 2, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#14E3C5"; e.currentTarget.style.borderColor = "rgba(20,227,197,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"; }}
          >?</button>
        </div>
      )}

      {/* ── Rich preview card (mini-map style) ── */}
      {show && hoveredSection && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            right: 78,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 901,
            width: 280,
            padding: 18,
            background: "rgba(3,7,18,0.96)",
            border: "1px solid rgba(20,227,197,0.35)",
            borderRadius: 14,
            boxShadow: "0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,227,197,0.08)",
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            color: "#f1f5f9", fontFamily: "var(--font-body), sans-serif",
            pointerEvents: "none",
            animation: "vrk-pj-in 0.18s ease",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 8,
              background: "rgba(20,227,197,0.18)", color: "#14E3C5",
              border: "1px solid rgba(20,227,197,0.4)",
              fontSize: 12, fontWeight: 800, fontFamily: "ui-monospace, monospace",
            }}>{String(hoveredIdx + 1).padStart(2, "0")}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
              color: "#94a3b8",
            }}>Section {hoveredIdx + 1} of {sections.length}</span>
          </div>
          <div style={{
            fontSize: 17, fontWeight: 700, color: "#f1f5f9",
            marginBottom: 8, lineHeight: 1.25,
            fontFamily: "var(--font-display), sans-serif",
          }}>{hoveredSection.label}</div>
          {hoveredSection.blurb && (
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>
              {hoveredSection.blurb}{hoveredSection.blurb.length >= 120 ? "…" : ""}
            </div>
          )}
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: "1px solid rgba(148,163,184,0.12)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 10, color: "#64748b",
            fontFamily: "ui-monospace, monospace",
          }}>
            <span>Click to jump</span>
            <span>j↓ · k↑</span>
          </div>
        </div>
      )}

      {/* ── Help overlay ── */}
      {helpOpen && (
        <>
          <div
            onClick={() => setHelpOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(3,7,18,0.7)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            }}
          />
          <div
            className="vrk-pj-help"
            style={{
              position: "fixed", left: "50%", top: "50%", zIndex: 9999,
              transform: "translate(-50%, -50%)",
              width: "min(440px, 92vw)",
              padding: 28,
              background: "rgba(11,18,32,0.98)",
              border: "1px solid rgba(20,227,197,0.3)",
              borderRadius: 18,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              color: "#f1f5f9", fontFamily: "var(--font-body), sans-serif",
              animation: "vrk-help-in 0.22s ease",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 18,
            }}>
              <h3 style={{
                margin: 0, fontSize: 18, fontWeight: 700,
                fontFamily: "var(--font-display), sans-serif",
              }}>Keyboard shortcuts</h3>
              <button
                onClick={() => setHelpOpen(false)}
                aria-label="Close help"
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(148,163,184,0.1)", border: 0,
                  color: "#cbd5e1", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["g g", "Scroll to top"],
                ["Shift + G", "Scroll to bottom"],
                ["j", "Next section"],
                ["k", "Previous section"],
                ["?", "Toggle this help"],
                ["Esc", "Close this help"],
              ].map(([k, desc]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px",
                  background: "rgba(15,23,42,0.6)", borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.08)",
                }}>
                  <span style={{ color: "#cbd5e1", fontSize: 14 }}>{desc}</span>
                  <kbd style={{
                    fontFamily: "ui-monospace, Menlo, monospace",
                    fontSize: 12, fontWeight: 700,
                    padding: "4px 10px",
                    background: "rgba(20,227,197,0.14)",
                    color: "#14E3C5",
                    border: "1px solid rgba(20,227,197,0.35)",
                    borderRadius: 6, minWidth: 64, textAlign: "center",
                  }}>{k}</kbd>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, fontSize: 11, color: "#64748b", textAlign: "center",
            }}>
              Shortcuts ignore inputs / textareas. Vim-style.
            </div>
          </div>
        </>
      )}
    </>
  );
}
