import { useEffect, useRef } from "react";

/**
 * CustomCursor — cyber targeting reticle. Four corner brackets + center dot
 * that track the pointer; brackets "lock on" (tighten + brighten + rotate)
 * over interactive elements. Desktop only (pointer: fine).
 */
const TEAL = "#14b8a6";

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    const wrap = wrapRef.current, dot = dotRef.current;
    if (!wrap || !dot) return;

    document.body.style.cursor = "none";
    let mx = innerWidth / 2, my = innerHeight / 2, wx = mx, wy = my, raf;
    let interactive = false, spin = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const t = e.target;
      interactive = !!(t && t.closest && t.closest('a,button,[role="button"],input,textarea,select,label,.vk-btn'));
    };
    const onDown = () => { wrap.style.setProperty("--k", "0.8"); };
    const onUp = () => { wrap.style.setProperty("--k", "1"); };
    const onLeave = () => { wrap.style.opacity = "0"; dot.style.opacity = "0"; };
    const onEnter = () => { wrap.style.opacity = "1"; dot.style.opacity = "1"; };

    const loop = () => {
      wx += (mx - wx) * 0.22; wy += (my - wy) * 0.22;
      spin += interactive ? 1.4 : 0.25;
      const size = interactive ? 26 : 38;          // lock-on tightens
      const k = wrap.style.getPropertyValue("--k") || 1;
      wrap.style.width = wrap.style.height = `${size}px`;
      wrap.style.transform = `translate(${wx}px,${wy}px) translate(-50%,-50%) rotate(${spin}deg) scale(${k})`;
      wrap.style.opacity = wrap.style.opacity || "1";
      for (const c of wrap.children) c.style.borderColor = interactive ? TEAL : "rgba(20,184,166,0.6)";
      raf = requestAnimationFrame(loop);
    };
    loop();

    addEventListener("mousemove", onMove);
    addEventListener("mousedown", onDown);
    addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      cancelAnimationFrame(raf); document.body.style.cursor = "";
      removeEventListener("mousemove", onMove); removeEventListener("mousedown", onDown);
      removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      <div ref={wrapRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 38, height: 38,
        pointerEvents: "none", zIndex: 100000, transition: "opacity .2s",
      }}>
        <span style={{ position: "absolute", top: 0, left: 0, width: 9, height: 9, borderTop: `1.5px solid ${TEAL}`, borderLeft: `1.5px solid ${TEAL}` }} />
        <span style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, borderTop: `1.5px solid ${TEAL}`, borderRight: `1.5px solid ${TEAL}` }} />
        <span style={{ position: "absolute", bottom: 0, left: 0, width: 9, height: 9, borderBottom: `1.5px solid ${TEAL}`, borderLeft: `1.5px solid ${TEAL}` }} />
        <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderBottom: `1.5px solid ${TEAL}`, borderRight: `1.5px solid ${TEAL}` }} />
      </div>
      <div ref={dotRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 5, height: 5, borderRadius: "50%",
        background: TEAL, boxShadow: `0 0 8px ${TEAL}`, pointerEvents: "none",
        zIndex: 100000, transition: "opacity .2s",
      }} />
    </>
  );
}
