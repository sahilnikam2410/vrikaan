import { useRef, useEffect, memo } from "react";

/*
  CyberGlobe — animated Canvas2D threat globe (zero dependencies).

  Previously this shipped a full Three.js WebGL globe (~649KB) with this
  Canvas2D version as a fallback. For a decorative homepage element the
  canvas version is indistinguishable in feel, so we dropped Three.js
  entirely — saving ~640KB off the bundle and removing two texture image
  loads. Renders identically on every device, no WebGL required.
*/

const FB_NODES = [
  { x: 0.24, y: 0.37, label: "NYC" }, { x: 0.47, y: 0.27, label: "LON" },
  { x: 0.50, y: 0.26, label: "BER" }, { x: 0.58, y: 0.24, label: "MOS" },
  { x: 0.66, y: 0.48, label: "MUM" }, { x: 0.83, y: 0.34, label: "TKY" },
  { x: 0.75, y: 0.55, label: "SGP" }, { x: 0.31, y: 0.66, label: "SAO" },
  { x: 0.87, y: 0.73, label: "SYD" }, { x: 0.61, y: 0.42, label: "DXB" },
];

function CanvasGlobe({ size }) {
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
      const w = c.width / dpr, h = c.height / dpr, now = Date.now(), t = now * 0.001;
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
      ctx.fillStyle = "#030712"; ctx.fillRect(0, 0, w, h);
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      gl.addColorStop(0, "rgba(6,255,208,0.05)"); gl.addColorStop(1, "transparent");
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = "rgba(6,255,208,0.025)"; ctx.lineWidth = 0.5;
      for (let x = 80; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 80; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.strokeStyle = "rgba(6,255,208,0.1)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const ig = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
      ig.addColorStop(0, "rgba(6,255,208,0.06)"); ig.addColorStop(1, "rgba(3,7,18,0.4)"); ctx.fillStyle = ig; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(6,255,208,0.04)"; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.06;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + t * 0.15; ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 0.04;
      for (let i = 1; i < 7; i++) { const ly = cy - R + (2 * R * i) / 7; const lr = Math.sqrt(Math.max(0, R * R - (ly - cy) * (ly - cy))); ctx.beginPath(); ctx.ellipse(cx, ly, lr, lr * 0.12, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      scanAngle += 0.008; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const sg = ctx.createConicGradient(scanAngle % (Math.PI * 2), cx, cy);
      sg.addColorStop(0, "rgba(6,255,208,0.06)"); sg.addColorStop(0.08, "rgba(6,255,208,0.02)"); sg.addColorStop(0.15, "transparent"); sg.addColorStop(1, "transparent");
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
        ctx.save(); ctx.globalAlpha = breathe * 0.5; ctx.fillStyle = "#06ffd0"; ctx.shadowColor = "#06ffd0"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = "#06ffd0"; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(nx, ny, 1, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.fillStyle = "#8ba4be"; ctx.font = "600 7px 'JetBrains Mono', monospace"; ctx.fillText(n.label, nx + 7, ny + 2); ctx.restore();
      }
      ctx.save(); ctx.strokeStyle = "#06ffd0"; ctx.lineWidth = 1; ctx.globalAlpha = 0.12; const pad = 10, len = 20;
      ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, h - pad - len); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + len, h - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - len); ctx.stroke(); ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [size]);

  return (
    <div style={{ width: "100%", height: size, background: "#030712", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

export default memo(function CyberGlobe({ size = 520 }) {
  return <CanvasGlobe size={size} />;
});
