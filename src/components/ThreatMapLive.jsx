import { useEffect, useRef, useState } from "react";
import worldMapSvg from "../assets/Worldmap.svg";

/* ── COLOR TOKENS ── */
const C = {
  black: "#030712",
  deepBlack: "#010409",
  cyan: "#06ffd0",
  cyanDim: "#04b898",
  red: "#ef4444",
  gold: "#fbbf24",
  ember: "#ff7a45",
  purple: "#a78bfa",
  blue: "#38bdf8",
  white: "#f1f5f9",
  muted: "#64748b",
  labelColor: "#8ba4be",
};

/* ── CITIES (expanded for global coverage) ── */
const cities = [
  // North America
  { n: "New York", x: 24, y: 37, major: true },
  { n: "Washington", x: 25.5, y: 40, major: false },
  { n: "Los Angeles", x: 14, y: 40, major: true },
  { n: "Chicago", x: 21, y: 35, major: false },
  { n: "Toronto", x: 23, y: 33, major: false },
  { n: "San Francisco", x: 12.5, y: 38, major: false },
  { n: "Miami", x: 23, y: 46, major: false },
  { n: "Mexico City", x: 18, y: 49, major: true },
  // Europe
  { n: "London", x: 46, y: 27, major: true },
  { n: "Berlin", x: 50, y: 26, major: true },
  { n: "Paris", x: 47, y: 29, major: true },
  { n: "Moscow", x: 58, y: 24, major: true },
  { n: "Stockholm", x: 51, y: 21, major: false },
  { n: "Kyiv", x: 55, y: 27, major: false },
  { n: "Rome", x: 50, y: 32, major: false },
  { n: "Madrid", x: 45, y: 33, major: false },
  { n: "Amsterdam", x: 48, y: 26, major: false },
  // Middle East & Africa
  { n: "Dubai", x: 61, y: 42, major: true },
  { n: "Tel Aviv", x: 57, y: 38, major: false },
  { n: "Cairo", x: 55, y: 38, major: true },
  { n: "Lagos", x: 49, y: 53, major: true },
  { n: "Nairobi", x: 58, y: 57, major: false },
  { n: "Johannesburg", x: 54, y: 70, major: false },
  { n: "Riyadh", x: 60, y: 43, major: false },
  // Asia
  { n: "Mumbai", x: 66, y: 48, major: true },
  { n: "Delhi", x: 67, y: 41, major: true },
  { n: "Beijing", x: 77, y: 35, major: true },
  { n: "Shanghai", x: 79, y: 38, major: true },
  { n: "Tokyo", x: 83, y: 34, major: true },
  { n: "Seoul", x: 80, y: 33, major: true },
  { n: "Singapore", x: 75, y: 56, major: true },
  { n: "Taipei", x: 79, y: 42, major: false },
  { n: "Bangkok", x: 73, y: 50, major: false },
  { n: "Jakarta", x: 75, y: 60, major: false },
  { n: "Hong Kong", x: 77, y: 42, major: false },
  // South America
  { n: "Sao Paulo", x: 31, y: 66, major: true },
  { n: "Buenos Aires", x: 29, y: 72, major: false },
  { n: "Bogota", x: 24, y: 54, major: false },
  { n: "Lima", x: 24, y: 62, major: false },
  // Oceania
  { n: "Sydney", x: 87, y: 73, major: true },
  { n: "Melbourne", x: 86, y: 76, major: false },
  { n: "Auckland", x: 93, y: 74, major: false },
];

const attackColors = [C.red, C.gold, C.ember, C.purple, C.blue];

/* ── COMPONENT ── */
export default function ThreatMapLive() {
  const canvasRef = useRef(null);
  const attacksRef = useRef([]);
  const nodesRef = useRef(cities.map((c) => ({ ...c, pulse: 0, active: false })));
  const mapImgRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const [clock, setClock] = useState(new Date().toISOString().replace("T", " ").slice(0, 19));

  /* Clock updater */
  useEffect(() => {
    const iv = setInterval(() => {
      setClock(new Date().toISOString().replace("T", " ").slice(0, 19));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  /* Canvas rendering */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let scanX = 0;

    /* High-DPI support */
    const dpr = window.devicePixelRatio || 1;
    const BASE_W = 1200;
    const BASE_H = 600;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width || BASE_W;
      const h = rect.height || BASE_H;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    /* Load the world map SVG as an image */
    const mapImg = new Image();
    mapImg.onload = () => {
      mapImgRef.current = mapImg;
      mapLoadedRef.current = true;
    };
    mapImg.src = worldMapSvg;

    /* Coordinate helpers (percentage to pixel) */
    const getW = () => canvas.width / dpr;
    const getH = () => canvas.height / dpr;
    const toX = (pct) => (pct / 100) * getW();
    const toY = (pct) => (pct / 100) * getH();

    /* ── Draw background with radial glow ── */
    const drawBackground = () => {
      const W = getW(), H = getH();
      // Deep dark base
      ctx.fillStyle = C.deepBlack;
      ctx.fillRect(0, 0, W, H);

      // Subtle radial glow at center
      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.55);
      grd.addColorStop(0, "rgba(6,255,208,0.04)");
      grd.addColorStop(0.4, "rgba(6,255,208,0.015)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    };

    /* ── Draw the real SVG world map ── */
    const drawWorldMap = () => {
      if (!mapLoadedRef.current || !mapImgRef.current) return;
      const W = getW(), H = getH();
      const img = mapImgRef.current;

      // Draw the SVG map stretched to fill canvas
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      // Cyan tint overlay using composite
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(6,255,208,0.12)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Edge glow layer: redraw with lighter opacity and blur for glow effect
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.filter = "brightness(1.8) blur(2px)";
      ctx.drawImage(img, 0, 0, W, H);
      ctx.filter = "none";
      ctx.restore();
    };

    /* ── Draw subtle grid lines ── */
    const drawGrid = () => {
      const W = getW(), H = getH();
      ctx.save();

      // Longitude lines
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 0.4;
      ctx.globalAlpha = 0.04;
      for (let i = 1; i < 36; i++) {
        const x = (i / 36) * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Latitude lines
      for (let i = 1; i < 18; i++) {
        const y = (i / 18) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Equator line (more visible)
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      ctx.lineTo(W, H * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Prime meridian
      ctx.globalAlpha = 0.05;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.moveTo(W * 0.45, 0);
      ctx.lineTo(W * 0.45, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    };

    /* ── Scan line (subtle, premium) ── */
    const drawScanLine = () => {
      const W = getW(), H = getH();
      const trailWidth = 120;

      // Soft trailing glow
      const grad = ctx.createLinearGradient(scanX - trailWidth, 0, scanX, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.7, "rgba(6,255,208,0.012)");
      grad.addColorStop(1, "rgba(6,255,208,0.025)");
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - trailWidth, 0, trailWidth, H);

      // Thin bright edge
      ctx.save();
      ctx.strokeStyle = C.cyan;
      ctx.globalAlpha = 0.06;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, H);
      ctx.stroke();
      ctx.restore();
    };

    /* ── Draw attack arc with particles ── */
    const drawAttack = (a, now) => {
      const age = (now - a.born) / 1000;
      if (age > 6) return false;

      const x1 = toX(a.from.x), y1 = toY(a.from.y);
      const x2 = toX(a.to.x), y2 = toY(a.to.y);
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - Math.max(30, dist * 0.28);
      const fade = Math.max(0, 1 - age / 5);

      // Arc glow (outer)
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.2 * fade;
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Arc bright core
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6 * fade;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
      ctx.restore();

      // Moving particle along arc
      const t = (age * 0.35) % 1;
      const px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2;
      const py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2;

      // Particle outer glow
      ctx.save();
      ctx.globalAlpha = 0.25 * fade;
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Particle bright core
      ctx.save();
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Impact ring at destination
      if (age > 0.5) {
        const ra = age - 0.5;
        const rr = 4 + ra * 16;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 0.3 - ra * 0.08) * fade;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x2, y2, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      return true;
    };

    /* ── Draw city nodes with pulsing dots and labels ── */
    const drawNodes = (now) => {
      const W = getW();

      for (const node of nodesRef.current) {
        const cx = toX(node.x), cy = toY(node.y);

        // Active attack pulse ring
        if (node.active && node.pulse > 0) {
          const r = 5 + (1 - node.pulse) * 22;
          ctx.save();
          ctx.globalAlpha = node.pulse * 0.4;
          ctx.strokeStyle = C.red;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          node.pulse = Math.max(0, node.pulse - 0.007);
          if (node.pulse <= 0) node.active = false;
        }

        // Breathing outer glow
        const breathe = 0.3 + Math.sin(now * 0.002 + node.x * 0.5) * 0.15;
        const color = node.active ? C.red : C.cyan;

        ctx.save();
        ctx.globalAlpha = breathe * 0.6;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, node.major ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Solid core dot
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, node.major ? 2.8 : 2, 0, Math.PI * 2);
        ctx.fill();

        // White center highlight
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, node.major ? 1.2 : 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // City label
        const fontSize = node.major ? (W > 900 ? 9 : 7.5) : (W > 900 ? 7 : 6);
        ctx.save();
        ctx.globalAlpha = node.major ? 0.6 : 0.35;
        ctx.fillStyle = node.active ? "#f87171" : C.labelColor;
        ctx.font = `${node.major ? 700 : 500} ${fontSize}px 'Vrikaan Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace`;
        ctx.textBaseline = "middle";

        // Offset label to avoid overlaps (shift left if city is far right)
        const labelX = node.x > 85 ? cx - ctx.measureText(node.n.toUpperCase()).width - 8 : cx + 9;
        ctx.fillText(node.n.toUpperCase(), labelX, cy - 2);
        ctx.restore();
      }
    };

    /* ── Draw HUD corner brackets ── */
    const drawHUDBrackets = () => {
      const W = getW(), H = getH();
      const len = 20;
      const pad = 8;

      ctx.save();
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;

      // Top-left bracket
      ctx.beginPath();
      ctx.moveTo(pad, pad + len);
      ctx.lineTo(pad, pad);
      ctx.lineTo(pad + len, pad);
      ctx.stroke();

      // Top-right bracket
      ctx.beginPath();
      ctx.moveTo(W - pad - len, pad);
      ctx.lineTo(W - pad, pad);
      ctx.lineTo(W - pad, pad + len);
      ctx.stroke();

      // Bottom-left bracket
      ctx.beginPath();
      ctx.moveTo(pad, H - pad - len);
      ctx.lineTo(pad, H - pad);
      ctx.lineTo(pad + len, H - pad);
      ctx.stroke();

      // Bottom-right bracket
      ctx.beginPath();
      ctx.moveTo(W - pad - len, H - pad);
      ctx.lineTo(W - pad, H - pad);
      ctx.lineTo(W - pad, H - pad - len);
      ctx.stroke();

      ctx.restore();
    };

    /* ── Main render loop ── */
    const render = () => {
      const now = Date.now();
      const W = getW(), H = getH();

      ctx.clearRect(0, 0, W, H);

      drawBackground();
      drawGrid();
      drawWorldMap();
      drawScanLine();

      // Draw attacks
      attacksRef.current = attacksRef.current.filter((a) => drawAttack(a, now));

      drawNodes(now);
      drawHUDBrackets();

      scanX = (scanX + 0.4) % W;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* Generate attacks */
  useEffect(() => {
    const addAttack = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      while (to.n === from.n) to = cities[Math.floor(Math.random() * cities.length)];
      attacksRef.current.push({
        from,
        to,
        color: attackColors[Math.floor(Math.random() * attackColors.length)],
        born: Date.now(),
      });
      const fn = nodesRef.current.find((n) => n.n === from.n);
      const tn = nodesRef.current.find((n) => n.n === to.n);
      if (fn) { fn.active = true; fn.pulse = 1; }
      if (tn) { tn.active = true; tn.pulse = 1; }
    };
    const iv = setInterval(addAttack, 900);
    addAttack();
    setTimeout(addAttack, 250);
    setTimeout(addAttack, 550);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 420,
        overflow: "hidden",
        background: C.deepBlack,
        borderRadius: "inherit",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* ── HUD Overlays ── */}

      {/* Top-left: Title */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          fontFamily: "'Vrikaan Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
          fontSize: 10,
          color: C.cyan,
          opacity: 0.5,
          letterSpacing: 3,
          zIndex: 10,
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        Global Threat Intelligence // Real-Time
      </div>

      {/* Top-right: LIVE indicator */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          fontFamily: "'Vrikaan Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
          fontSize: 10,
          fontWeight: 700,
          color: C.red,
          letterSpacing: 3,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 7,
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.red,
            display: "inline-block",
            boxShadow: `0 0 10px ${C.red}, 0 0 20px ${C.red}50`,
            animation: "threatmap-pulse 1.5s ease-in-out infinite",
          }}
        />
        LIVE
      </div>

      {/* Bottom-left: Timestamp */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 20,
          fontFamily: "'Vrikaan Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
          fontSize: 9,
          color: C.muted,
          opacity: 0.55,
          letterSpacing: 1.5,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 1,
            height: 12,
            background: C.cyan,
            opacity: 0.4,
          }}
        />
        {clock} UTC
      </div>

      {/* Bottom-right: Node count */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 20,
          fontFamily: "'Vrikaan Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
          fontSize: 9,
          color: C.cyan,
          opacity: 0.45,
          letterSpacing: 1.5,
          zIndex: 10,
          userSelect: "none",
        }}
      >
        {cities.length} NODES ACTIVE
      </div>

      {/* Keyframe animation for LIVE dot */}
      <style>{`
        @keyframes threatmap-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
