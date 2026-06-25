import { useRef, useState, useEffect, useCallback, memo, Suspense, lazy } from "react";

/*
  CyberGlobe — real-threat globe.

  Loads in two stages so the heavy Three.js chunk never blocks first paint:
    1. Canvas2D globe renders INSTANTLY (zero deps).
    2. If WebGL is available, ./Globe3D (Three.js) is dynamically imported in
       the background and swapped in over the canvas.

  Real threats: fetches /api/threats (URLhaus malware + Feodo botnet C&C,
  free abuse.ch feeds) and feeds the live source-countries into the 3D arcs
  via threatsRef. A small overlay shows the latest real threat.
*/

const Globe3D = lazy(() => import("./Globe3D"));

const FB_NODES = [
  { x: 0.24, y: 0.37, label: "NYC" }, { x: 0.47, y: 0.27, label: "LON" },
  { x: 0.50, y: 0.26, label: "BER" }, { x: 0.58, y: 0.24, label: "MOS" },
  { x: 0.66, y: 0.48, label: "MUM" }, { x: 0.83, y: 0.34, label: "TKY" },
  { x: 0.75, y: 0.55, label: "SGP" }, { x: 0.31, y: 0.66, label: "SAO" },
  { x: 0.87, y: 0.73, label: "SYD" }, { x: 0.61, y: 0.42, label: "DXB" },
];

function FallbackGlobe({ size, pausedRef }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const dpr = window.devicePixelRatio || 1;
    const attacks = [];
    let lastAttack = 0, scanAngle = 0;
    const colors = ["#ef4444", "#fbbf24", "#ff7a45", "#a78bfa", "#38bdf8"];
    const resize = () => {
      const rect = c.parentElement.getBoundingClientRect();
      c.width = rect.width * dpr; c.height = rect.height * dpr;
      c.style.width = rect.width + "px"; c.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      // Off-screen → keep the loop alive but skip all canvas work (no repaint).
      if (pausedRef?.current) return;
      const w = c.width / dpr, h = c.height / dpr, now = Date.now(), t = now * 0.001;
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
      ctx.fillStyle = "#060a14"; ctx.fillRect(0, 0, w, h);
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      gl.addColorStop(0, "rgba(20, 184, 166,0.05)"); gl.addColorStop(1, "transparent");
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = "rgba(20, 184, 166,0.025)"; ctx.lineWidth = 0.5;
      for (let x = 80; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 80; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.strokeStyle = "rgba(20, 184, 166,0.1)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const ig = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
      ig.addColorStop(0, "rgba(20, 184, 166,0.06)"); ig.addColorStop(1, "rgba(3,7,18,0.4)"); ctx.fillStyle = ig; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(20, 184, 166,0.04)"; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.06;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + t * 0.15; ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 0.04;
      for (let i = 1; i < 7; i++) { const ly = cy - R + (2 * R * i) / 7; const lr = Math.sqrt(Math.max(0, R * R - (ly - cy) * (ly - cy))); ctx.beginPath(); ctx.ellipse(cx, ly, lr, lr * 0.12, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      scanAngle += 0.008; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const sg = ctx.createConicGradient(scanAngle % (Math.PI * 2), cx, cy);
      sg.addColorStop(0, "rgba(20, 184, 166,0.06)"); sg.addColorStop(0.08, "rgba(20, 184, 166,0.02)"); sg.addColorStop(0.15, "transparent"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
      if (now - lastAttack > 1100) {
        const ai = Math.floor(Math.random() * FB_NODES.length); let bi = Math.floor(Math.random() * FB_NODES.length); while (bi === ai) bi = Math.floor(Math.random() * FB_NODES.length);
        attacks.push({ from: FB_NODES[ai], to: FB_NODES[bi], color: colors[Math.floor(Math.random() * colors.length)], born: now });
        if (attacks.length > 12) attacks.shift(); lastAttack = now;
      }
      for (let a = attacks.length - 1; a >= 0; a--) {
        const atk = attacks[a]; const age = (now - atk.born) / 1000; if (age > 5.5) { attacks.splice(a, 1); continue; }
        const fade = Math.max(0, 1 - age / 5); const x1 = atk.from.x * w, y1 = atk.from.y * h, x2 = atk.to.x * w, y2 = atk.to.y * h;
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.max(25, dist * 0.25);
        ctx.save(); ctx.strokeStyle = atk.color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.5 * fade; ctx.shadowColor = atk.color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
        const pt = (age * 0.28) % 1; const px = (1 - pt) ** 2 * x1 + 2 * (1 - pt) * pt * mx + pt ** 2 * x2; const py = (1 - pt) ** 2 * y1 + 2 * (1 - pt) * pt * my + pt ** 2 * y2;
        ctx.save(); ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = atk.color; ctx.shadowColor = atk.color; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.9 * fade; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      for (const n of FB_NODES) {
        const nx = n.x * w, ny = n.y * h; const breathe = 0.35 + Math.sin(t * 2 + n.x * 15) * 0.2;
        ctx.save(); ctx.globalAlpha = breathe * 0.5; ctx.fillStyle = "#14b8a6"; ctx.shadowColor = "#14b8a6"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = "#14b8a6"; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(nx, ny, 1, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.fillStyle = "#8ba4be"; ctx.font = "600 7px 'Vrikaan Mono', monospace"; ctx.fillText(n.label, nx + 7, ny + 2); ctx.restore();
      }
      ctx.save(); ctx.strokeStyle = "#14b8a6"; ctx.lineWidth = 1; ctx.globalAlpha = 0.12; const pad = 10, len = 20;
      ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, h - pad - len); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + len, h - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - len); ctx.stroke(); ctx.restore();
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [size, pausedRef]);
  return (
    <div style={{ width: "100%", height: size, background: "#060a14", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

export default memo(function CyberGlobe({ size = 520 }) {
  // WebGL support → upgrade to 3D. No WebGL → stay on Canvas2D.
  const [webgl] = useState(() => {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
    catch { return false; }
  });
  const [use3D, setUse3D] = useState(false);
  const threatsRef = useRef([]);      // live threat origins for the 3D arcs
  const [latest, setLatest] = useState(null); // latest real threat for overlay
  const handleContextLost = useCallback(() => setUse3D(false), []);

  // IntersectionObserver gate: globes off-screen pause their render loops, and
  // the heavy Three.js chunk only loads once the globe is near the viewport.
  const wrapRef = useRef(null);
  const pausedRef = useRef(true);     // true = off-screen → skip render work
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { pausedRef.current = false; setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { pausedRef.current = !e.isIntersecting; setInView(e.isIntersecting); },
      { rootMargin: "200px" } // start loading/animating slightly before visible
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Upgrade to 3D shortly after the globe scrolls into view (Canvas2D paints
  // first; off-screen globes never pull the Three.js chunk).
  useEffect(() => {
    if (!webgl || !inView) return;
    const id = setTimeout(() => setUse3D(true), 300);
    return () => clearTimeout(id);
  }, [webgl, inView]);

  // Fetch real threat intel (free abuse.ch feeds via our /api/threats).
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/threats");
        if (!r.ok) return;
        const d = await r.json();
        const mapped = [
          ...(d.recentMalware || []).map((m) => ({ country: m.country, threat: m.threat || "malware", kind: "malware" })),
          ...(d.recentBotnets || []).map((b) => ({ country: b.country || b.Country, threat: "botnet C&C", kind: "botnet" })),
        ].filter((x) => x.country && x.country !== "Unknown");
        if (alive && mapped.length) {
          threatsRef.current = mapped;
          setLatest(mapped[0]);
        }
      } catch { /* keep simulated arcs */ }
    };
    load();
    const iv = setInterval(load, 120000); // refresh every 2 min
    return () => { alive = false; clearInterval(iv); };
  }, []);

  // Overlay label: in 3D mode the globe drives it per-arc via onArc (each line =
  // the exact real threat shown). Only the 2D fallback rotates the label itself.
  useEffect(() => {
    if (use3D || !threatsRef.current.length) return;
    const iv = setInterval(() => {
      const arr = threatsRef.current;
      if (arr.length) setLatest(arr[Math.floor(Math.random() * arr.length)]);
    }, 2600);
    return () => clearInterval(iv);
  }, [latest, use3D]);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: size }}>
      {use3D && webgl ? (
        <Suspense fallback={<FallbackGlobe size={size} pausedRef={pausedRef} />}>
          <Globe3D size={size} threatsRef={threatsRef} onContextLost={handleContextLost} onArc={setLatest} pausedRef={pausedRef} />
        </Suspense>
      ) : (
        <FallbackGlobe size={size} pausedRef={pausedRef} />
      )}

      {/* Live real-threat label (only when feed returned data) */}
      {latest && (
        <div style={{
          position: "absolute", left: 12, bottom: 12, zIndex: 2,
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 10px", borderRadius: 8,
          background: "rgba(2,6,23,0.72)", border: "1px solid rgba(20, 184, 166,0.18)",
          backdropFilter: "blur(6px)", fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 10, color: "#cbd5e1", pointerEvents: "none", maxWidth: "85%",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: latest.kind === "botnet" ? "#a855f7" : "#ef4444", boxShadow: `0 0 6px ${latest.kind === "botnet" ? "#a855f7" : "#ef4444"}`, flexShrink: 0 }} />
          <span style={{ color: "#64748b" }}>LIVE</span>
          <span style={{ color: latest.kind === "botnet" ? "#c4b5fd" : "#fca5a5", fontWeight: 600 }}>{latest.threat}</span>
          <span style={{ color: "#64748b" }}>·</span>
          <span style={{ color: "#94a3b8" }}>{latest.country}</span>
          <span style={{ color: "#475569", fontSize: 9 }}>abuse.ch</span>
        </div>
      )}
    </div>
  );
});
