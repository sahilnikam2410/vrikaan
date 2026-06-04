import { useEffect, useRef } from "react";

/**
 * CustomCursor — VRIKAAN wolf cursor. The wolf mark glides after the pointer
 * (teal glow, scales/brightens over interactive elements); a small precise dot
 * leads at the exact pointer position for accuracy. Desktop only (pointer:fine).
 */
const TEAL = "#14b8a6";

export default function CustomCursor() {
  const wolfRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    const wolf = wolfRef.current, dot = dotRef.current;
    if (!wolf || !dot) return;

    document.body.style.cursor = "none";
    let mx = innerWidth / 2, my = innerHeight / 2, wx = mx, wy = my, raf;
    let interactive = false;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const t = e.target;
      interactive = !!(t && t.closest && t.closest('a,button,[role="button"],input,textarea,select,label,.vk-btn'));
    };
    const onDown = () => { wolf.dataset.k = "0.82"; };
    const onUp = () => { wolf.dataset.k = "1"; };
    const onLeave = () => { wolf.style.opacity = "0"; dot.style.opacity = "0"; };
    const onEnter = () => { wolf.style.opacity = "1"; dot.style.opacity = "1"; };

    const loop = () => {
      wx += (mx - wx) * 0.2; wy += (my - wy) * 0.2;
      const k = Number(wolf.dataset.k || 1) * (interactive ? 1.25 : 1);
      // slight lean toward motion
      const lean = Math.max(-12, Math.min(12, (mx - wx) * 0.6));
      wolf.style.transform = `translate(${wx}px,${wy}px) translate(-50%,-50%) rotate(${lean}deg) scale(${k})`;
      wolf.style.filter = interactive
        ? "drop-shadow(0 0 8px rgba(20,184,166,0.9)) brightness(1.15)"
        : "drop-shadow(0 0 5px rgba(20,184,166,0.5))";
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
      <img ref={wolfRef} src="/wolf-mark.png?v=2" alt="" aria-hidden data-k="1" style={{
        position: "fixed", top: 0, left: 0, width: 30, height: 30, borderRadius: 7,
        pointerEvents: "none", zIndex: 100000, transition: "opacity .2s",
        filter: "drop-shadow(0 0 5px rgba(20,184,166,0.5))",
      }} />
      <div ref={dotRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 5, height: 5, borderRadius: "50%",
        background: TEAL, boxShadow: `0 0 8px ${TEAL}`, pointerEvents: "none",
        zIndex: 100001, transition: "opacity .2s",
      }} />
    </>
  );
}
