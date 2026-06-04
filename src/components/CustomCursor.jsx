import { useEffect, useRef } from "react";

/**
 * CustomCursor — premium dot + lagging teal ring that follows the pointer.
 * Desktop only (pointer: fine); skipped on touch. Hides the native cursor,
 * grows the ring over interactive elements, shrinks on click.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const dot = dotRef.current, ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.style.cursor = "none";
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, prx = rx, pry = ry;
    let interactive = false, raf;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      const t = e.target;
      interactive = !!(t && t.closest && t.closest('a,button,[role="button"],input,textarea,select,label,.vk-btn'));
    };
    const onDown = () => { dot.style.opacity = "0.4"; };
    const onUp = () => { dot.style.opacity = "1"; };
    const onLeave = () => { dot.style.opacity = "0"; ring.style.opacity = "0"; };
    const onEnter = () => { dot.style.opacity = "1"; ring.style.opacity = "1"; };

    // Elastic ring: lags the pointer + squash-stretches along its velocity.
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      const vx = rx - prx, vy = ry - pry; prx = rx; pry = ry;
      const speed = Math.min(Math.hypot(vx, vy), 40);
      const angle = Math.atan2(vy, vx) * 180 / Math.PI;
      const stretch = speed / 40;            // 0..1
      const sx = 1 + stretch * 0.6;          // elongate along motion
      const sy = 1 - stretch * 0.35;         // squash perpendicular
      const base = interactive ? 1.5 : 1;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%) rotate(${angle}deg) scale(${sx * base}, ${sy * base})`;
      ring.style.borderColor = interactive ? "rgba(20,184,166,0.95)" : "rgba(20,184,166,0.55)";
      ring.style.background = interactive ? "rgba(20,184,166,0.12)" : "transparent";
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 7, height: 7, borderRadius: "50%",
        background: "#14b8a6", boxShadow: "0 0 8px rgba(20,184,166,0.8)",
        marginLeft: -3.5, marginTop: -3.5, pointerEvents: "none", zIndex: 100000,
        transition: "opacity .2s",
      }} />
      <div ref={ringRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 30, height: 30, borderRadius: "50%",
        border: "1.5px solid rgba(20,184,166,0.5)", pointerEvents: "none", zIndex: 100000,
        transition: "width .18s ease, height .18s ease, border-color .18s ease, background .18s ease, opacity .2s",
      }} />
    </>
  );
}
