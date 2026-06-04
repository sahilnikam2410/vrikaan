import { useEffect, useRef } from "react";

/**
 * CustomCursor — hand-drawn cyber "scan node": a slowly-rotating hexagon ring
 * with a glowing core that follows the pointer. Over interactive elements it
 * locks on (a counter-rotating inner hex appears + brightens). Pure inline SVG
 * (no image), teal-themed. Desktop only (pointer: fine).
 */
const TEAL = "#14b8a6";

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const outRef = useRef(null);
  const inRef = useRef(null);
  const coreRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    const wrap = wrapRef.current, out = outRef.current, inn = inRef.current, core = coreRef.current;
    if (!wrap) return;

    document.body.style.cursor = "none";
    let mx = innerWidth / 2, my = innerHeight / 2, wx = mx, wy = my, rot = 0, raf;
    let interactive = false, down = false;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (core) core.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const t = e.target;
      interactive = !!(t && t.closest && t.closest('a,button,[role="button"],input,textarea,select,label,.vk-btn'));
    };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onLeave = () => { wrap.style.opacity = "0"; if (core) core.style.opacity = "0"; };
    const onEnter = () => { wrap.style.opacity = "1"; if (core) core.style.opacity = "1"; };

    const loop = () => {
      wx += (mx - wx) * 0.2; wy += (my - wy) * 0.2;
      rot += interactive ? 1.6 : 0.4;
      const k = (interactive ? 1.18 : 1) * (down ? 0.85 : 1);
      wrap.style.transform = `translate(${wx}px,${wy}px) translate(-50%,-50%) scale(${k})`;
      if (out) out.style.transform = `rotate(${rot}deg)`;
      if (inn) { inn.style.transform = `rotate(${-rot * 1.5}deg)`; inn.style.opacity = interactive ? "1" : "0"; }
      const stroke = interactive ? "rgba(20,184,166,1)" : "rgba(20,184,166,0.6)";
      if (out) out.setAttribute("stroke", stroke);
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

  // regular hexagon points (radius r, centred at 20,20 in a 40-box)
  const hex = (r) => {
    const c = 20, pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 90);
      pts.push(`${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  };

  return (
    <>
      <div ref={wrapRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 40, height: 40,
        pointerEvents: "none", zIndex: 100000, transition: "opacity .2s",
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ overflow: "visible", filter: "drop-shadow(0 0 6px rgba(20,184,166,0.55))" }}>
          <polygon ref={outRef} points={hex(15)} fill="none" stroke={TEAL} strokeWidth="1.4"
            style={{ transformOrigin: "20px 20px" }} />
          <polygon ref={inRef} points={hex(8.5)} fill="rgba(20,184,166,0.10)" stroke={TEAL} strokeWidth="1"
            style={{ transformOrigin: "20px 20px", opacity: 0 }} />
        </svg>
      </div>
      <div ref={coreRef} aria-hidden style={{
        position: "fixed", top: 0, left: 0, width: 5, height: 5, borderRadius: "50%",
        background: TEAL, boxShadow: `0 0 10px ${TEAL}, 0 0 4px #fff`, pointerEvents: "none",
        zIndex: 100001, transition: "opacity .2s",
      }} />
    </>
  );
}
