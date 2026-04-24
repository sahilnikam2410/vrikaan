import { useState, useEffect, useRef } from "react";

/*
  VRIKAAN — Cinematic Hollywood-Style Intro Loader
  Inspired by: Marvel/DC intros, Cyberpunk title sequences
  Flow: Dark → particles converge → hexagon builds → eye reveals →
        shield pulse → wordmark types in → tagline fades → transition out
*/

const TOTAL_DURATION = 5200; // ms total intro

export default function CinematicLoader({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0-6 phases
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const startRef = useRef(Date.now());

  // Phase timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // particles start
      setTimeout(() => setPhase(2), 900),   // hex builds
      setTimeout(() => setPhase(3), 1600),  // eye reveals
      setTimeout(() => setPhase(4), 2400),  // shield pulse + wordmark
      setTimeout(() => setPhase(5), 3600),  // tagline + status bar
      setTimeout(() => setPhase(6), 4600),  // fade out
      setTimeout(() => { setDone(true); onComplete?.(); }, TOTAL_DURATION),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Particle canvas for cinematic particle convergence
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const dpr = window.devicePixelRatio || 1;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      targetX: 0.5 + (Math.random() - 0.5) * 0.08,
      targetY: 0.42 + (Math.random() - 0.5) * 0.08,
      speed: 0.003 + Math.random() * 0.005,
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.4,
      converging: false,
      convergeTime: 800 + Math.random() * 600,
    }));

    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = c.width / dpr, h = c.height / dpr;
      const elapsed = Date.now() - startRef.current;
      ctx.clearRect(0, 0, w, h);

      // Converge particles toward center after phase 1
      const converge = elapsed > 300;

      particles.forEach(p => {
        if (converge && elapsed > 300 + p.convergeTime) {
          p.x += (p.targetX - p.x) * 0.02;
          p.y += (p.targetY - p.y) * 0.02;
        } else {
          p.x += (Math.random() - 0.5) * 0.002;
          p.y += (Math.random() - 0.5) * 0.002;
        }

        const fadeOut = elapsed > 2400 ? Math.max(0, 1 - (elapsed - 2400) / 800) : 1;
        const px = p.x * w, py = p.y * h;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(83,74,183,${p.alpha * fadeOut})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(175,169,236,${p.alpha * 0.1 * fadeOut})`;
        ctx.fill();
      });

      // Draw convergence lines between nearby particles
      if (converge && elapsed < 3000) {
        const lineAlpha = Math.min(1, (elapsed - 300) / 500) * Math.max(0, 1 - (elapsed - 2200) / 800);
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = (particles[i].x - particles[j].x) * w;
            const dy = (particles[i].y - particles[j].y) * h;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x * w, particles[i].y * h);
              ctx.lineTo(particles[j].x * w, particles[j].y * h);
              ctx.strokeStyle = `rgba(83,74,183,${0.06 * (1 - d / 120) * lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      if (elapsed < TOTAL_DURATION - 200) {
        raf = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (done) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "#06040f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: phase >= 6 ? 0 : 1,
      transition: "opacity 0.6s ease-out",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(83,74,183,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(83,74,183,0.06) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: phase >= 1 ? 0.6 : 0,
        transition: "opacity 1s ease",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(83,74,183,0.18) 0%, transparent 70%)",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.2s ease",
      }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0,
        pointerEvents: "none",
      }} />

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 0,
      }}>

        {/* SVG Logo */}
        <svg width="300" height="300" viewBox="0 0 400 390" style={{
          overflow: "visible",
          filter: phase >= 3 ? "drop-shadow(0 0 40px rgba(83,74,183,0.4))" : "none",
          transition: "filter 1s ease",
        }}>
          <defs>
            <clipPath id="loaderHexClip">
              <polygon points="200,80 276,123 276,210 200,253 124,210 124,123"/>
            </clipPath>
            <filter id="loaderGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Shield pulses */}
          {phase >= 4 && <>
            <polygon
              points="200,68 284,115 284,210 200,257 116,210 116,115"
              fill="none" stroke="#534AB7" strokeWidth="1.5" opacity="0"
              style={{ transformOrigin: "200px 195px", animation: "loaderPulse 2.6s ease-out infinite" }}
            />
            <polygon
              points="200,68 284,115 284,210 200,257 116,210 116,115"
              fill="none" stroke="#534AB7" strokeWidth="1" opacity="0"
              style={{ transformOrigin: "200px 195px", animation: "loaderPulse 2.6s ease-out 0.9s infinite" }}
            />
          </>}

          {/* Outer rotating ring */}
          {phase >= 2 && (
            <g style={{ transformOrigin: "200px 195px", animation: "loaderRotateCW 22s linear infinite", opacity: 0, animationFillMode: "forwards", animationDelay: "0s" }}>
              <polygon
                points="200,38 298,93 298,203 200,258 102,203 102,93"
                fill="none" stroke="#534AB7" strokeWidth="0.7" strokeDasharray="4 8" opacity="0.3"
                style={{ animation: "loaderFadeIn 0.8s ease forwards" }}
              />
            </g>
          )}

          {/* Inner counter-rotating ring */}
          {phase >= 2 && (
            <g style={{ transformOrigin: "200px 195px", animation: "loaderRotateCCW 14s linear infinite" }}>
              <polygon
                points="200,54 286,103 286,207 200,256 114,207 114,103"
                fill="none" stroke="#7F77DD" strokeWidth="0.5" strokeDasharray="2 10" opacity="0.2"
                style={{ animation: "loaderFadeIn 0.8s ease 0.2s forwards", opacity: 0 }}
              />
            </g>
          )}

          {/* Hex glow */}
          {phase >= 2 && (
            <polygon
              points="200,62 282,107 282,208 200,253 118,208 118,107"
              fill="#534AB7" stroke="none"
              style={{
                transformOrigin: "200px 195px",
                animation: "loaderHexPulse 3.5s ease-in-out infinite",
                opacity: 0.12,
              }}
            />
          )}

          {/* Outer hex */}
          {phase >= 2 && (
            <polygon
              points="200,68 278,113 278,208 200,253 122,208 122,113"
              fill="none" stroke="#534AB7" strokeWidth="1.8"
              style={{
                transformOrigin: "200px 195px",
                animation: "loaderHexIn 0.9s cubic-bezier(.34,1.4,.64,1) forwards",
                opacity: 0,
              }}
            />
          )}

          {/* Mid hex */}
          {phase >= 2 && (
            <polygon
              points="200,82 268,121 268,207 200,246 132,207 132,121"
              fill="#534AB7" fillOpacity="0.07" stroke="#7F77DD" strokeWidth="1"
              style={{
                transformOrigin: "200px 195px",
                animation: "loaderHexIn 0.8s cubic-bezier(.34,1.4,.64,1) 0.18s forwards",
                opacity: 0,
              }}
            />
          )}

          {/* Inner hex */}
          {phase >= 2 && (
            <polygon
              points="200,96 258,129 258,207 200,240 142,207 142,129"
              fill="#0d0b2a" fillOpacity="0.85" stroke="#534AB7" strokeWidth="2"
              style={{
                transformOrigin: "200px 195px",
                animation: "loaderHexIn 0.7s cubic-bezier(.34,1.4,.64,1) 0.34s forwards",
                opacity: 0,
              }}
            />
          )}

          {/* Corner ticks */}
          {phase >= 2 && (
            <g stroke="#AFA9EC" strokeWidth="2" strokeLinecap="round"
              style={{ animation: "loaderFadeIn 0.5s ease 0.5s forwards", opacity: 0 }}>
              <line x1="200" y1="68" x2="200" y2="56"/>
              <line x1="278" y1="113" x2="288" y2="107"/>
              <line x1="278" y1="208" x2="288" y2="214"/>
              <line x1="200" y1="253" x2="200" y2="265"/>
              <line x1="122" y1="208" x2="112" y2="214"/>
              <line x1="122" y1="113" x2="112" y2="107"/>
            </g>
          )}

          {/* Cross hair lines */}
          {phase >= 2 && <>
            <line x1="200" y1="96" x2="200" y2="240"
              stroke="#AFA9EC" strokeWidth="0.8" strokeDasharray="5 4"
              style={{ strokeDashoffset: 200, animation: "loaderLineGrow 0.6s ease 0.6s forwards", opacity: 0 }}
            />
            <line x1="144" y1="168" x2="256" y2="168"
              stroke="#AFA9EC" strokeWidth="0.8" strokeDasharray="5 4"
              style={{ strokeDashoffset: 200, animation: "loaderLineGrow 0.6s ease 0.7s forwards", opacity: 0 }}
            />
          </>}

          {/* Eye */}
          {phase >= 3 && (
            <g clipPath="url(#loaderHexClip)"
              style={{
                transformOrigin: "200px 190px",
                animation: "loaderEyeIn 0.6s cubic-bezier(.34,1.56,.64,1) forwards",
                opacity: 0,
              }}>
              <path d="M154 168 Q200 130 246 168 Q200 206 154 168Z"
                fill="none" stroke="#7F77DD" strokeWidth="1.8"/>
              {/* Scan line */}
              <line x1="158" y1="168" x2="242" y2="168"
                stroke="#AFA9EC" strokeWidth="1.2" opacity="0.9"
                style={{ animation: "loaderScan 1.4s ease-in-out 0.3s infinite", transformOrigin: "200px 190px" }}
              />
              <circle cx="200" cy="168" r="26" fill="#0a0820" fillOpacity="0.9" stroke="#7F77DD" strokeWidth="1.4"/>
              <circle cx="200" cy="168" r="13" fill="#534AB7" opacity="0.9"
                style={{ animation: "loaderIrisBreath 2.8s ease-in-out 0.5s infinite" }}
              />
              <circle cx="200" cy="168" r="6.5" fill="#EEEDFE"/>
              <circle cx="200" cy="168" r="2.8" fill="#06040f"/>
              <line x1="200" y1="142" x2="200" y2="148" stroke="#AFA9EC" strokeWidth="1" opacity="0.7"/>
              <line x1="200" y1="188" x2="200" y2="194" stroke="#AFA9EC" strokeWidth="1" opacity="0.7"/>
              <line x1="174" y1="168" x2="180" y2="168" stroke="#AFA9EC" strokeWidth="1" opacity="0.7"/>
              <line x1="220" y1="168" x2="226" y2="168" stroke="#AFA9EC" strokeWidth="1" opacity="0.7"/>
            </g>
          )}

          {/* Orbiting particles */}
          {phase >= 3 && <>
            <g style={{ transformOrigin: "200px 195px", animation: "loaderOrbit1 6s linear infinite" }}>
              <circle cx="200" cy="195" r="4.5" fill="#534AB7" opacity="0.9"/>
              <circle cx="200" cy="195" r="8" fill="#534AB7" opacity="0.15"/>
            </g>
            <g style={{ transformOrigin: "200px 195px", animation: "loaderOrbit2 6s linear infinite" }}>
              <circle cx="200" cy="195" r="3.5" fill="#7F77DD" opacity="0.85"/>
            </g>
            <g style={{ transformOrigin: "200px 195px", animation: "loaderOrbit3 6s linear infinite" }}>
              <circle cx="200" cy="195" r="3" fill="#AFA9EC" opacity="0.75"/>
            </g>
          </>}

          {/* Vertex glow nodes */}
          {phase >= 2 && <>
            {[
              { cx: 200, cy: 96, delay: 0 },
              { cx: 258, cy: 129, delay: 0.1 },
              { cx: 258, cy: 207, delay: 0.2 },
              { cx: 200, cy: 240, delay: 0.3 },
              { cx: 142, cy: 207, delay: 0.4 },
              { cx: 142, cy: 129, delay: 0.5 },
            ].map((n, i) => (
              <circle key={i} cx={n.cx} cy={n.cy} r="4" fill="#7F77DD"
                filter="url(#loaderGlow)"
                style={{
                  animation: `loaderNodeGlow 2s ease-in-out ${n.delay}s infinite, loaderFadeIn 0.4s ease ${0.5 + n.delay}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </>}
        </svg>

        {/* VRIKAAN wordmark — cinematic type-in */}
        <div style={{
          fontFamily: "'Orbitron', 'Space Grotesk', monospace",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 700,
          letterSpacing: phase >= 4 ? 10 : 22,
          color: "#AFA9EC",
          opacity: phase >= 4 ? 1 : 0,
          filter: phase >= 4 ? "blur(0px)" : "blur(8px)",
          transition: "all 1s cubic-bezier(.4,0,.2,1)",
          textShadow: "0 0 40px rgba(83,74,183,0.6), 0 0 80px rgba(83,74,183,0.3)",
          marginTop: -12,
          userSelect: "none",
        }}>
          VRIKAAN
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "'Rajdhani', 'Space Grotesk', sans-serif",
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: 4,
          color: "#7F77DD",
          opacity: phase >= 5 ? 0.65 : 0,
          transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.8s ease",
          marginTop: 10,
          userSelect: "none",
        }}>
          GUARDIAN OF YOUR DIGITAL WORLD
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Rajdhani', 'Space Grotesk', sans-serif",
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: 5,
          color: "#534AB7",
          opacity: phase >= 5 ? 0.45 : 0,
          transform: phase >= 5 ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.8s ease 0.2s",
          marginTop: 6,
          userSelect: "none",
        }}>
          SECURE · PROTECT · DEFEND · MONITOR
        </div>

        {/* Status bar */}
        <div style={{
          marginTop: 28,
          display: "flex", alignItems: "center", gap: 10,
          opacity: phase >= 5 ? 1 : 0,
          transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.5s ease 0.3s",
        }}>
          <span style={{
            fontFamily: "'Rajdhani', 'Space Grotesk', sans-serif",
            fontSize: 9, letterSpacing: 2, color: "#534AB7",
          }}>SHIELD ACTIVE</span>
          <div style={{
            width: 180, height: 2,
            background: "rgba(83,74,183,0.2)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #534AB7, #AFA9EC)",
              borderRadius: 2,
              width: phase >= 5 ? "100%" : "0%",
              transition: "width 2s ease",
            }} />
          </div>
          <span style={{
            fontFamily: "'Rajdhani', 'Space Grotesk', sans-serif",
            fontSize: 9, letterSpacing: 2, color: "#534AB7",
          }}>100%</span>
        </div>
      </div>

      {/* Cinematic letterbox bars */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: phase >= 6 ? "50%" : 0,
        background: "#06040f",
        transition: "height 0.6s cubic-bezier(0.65, 0, 0.35, 1)",
        zIndex: 10,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: phase >= 6 ? "50%" : 0,
        background: "#06040f",
        transition: "height 0.6s cubic-bezier(0.65, 0, 0.35, 1)",
        zIndex: 10,
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Rajdhani:wght@300;400;600&display=swap');

        @keyframes loaderRotateCW  { to { transform: rotate(360deg); } }
        @keyframes loaderRotateCCW { to { transform: rotate(-360deg); } }
        @keyframes loaderFadeIn { to { opacity: 1; } }

        @keyframes loaderHexIn {
          0%   { opacity: 0; transform: scale(0.4) rotate(-60deg); }
          60%  { opacity: 1; transform: scale(1.06) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes loaderHexPulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%       { opacity: 0.32; transform: scale(1.08); }
        }

        @keyframes loaderLineGrow {
          from { stroke-dashoffset: 200; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 0.55; }
        }

        @keyframes loaderEyeIn {
          0%   { opacity: 0; transform: scale(0.3); }
          70%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes loaderIrisBreath {
          0%, 100% { r: 13; opacity: 0.85; }
          50%       { r: 15; opacity: 1; }
        }

        @keyframes loaderScan {
          0%   { transform: translateY(-26px); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(26px); opacity: 0; }
        }

        @keyframes loaderOrbit1 { from { transform: rotate(0deg) translateX(130px); } to { transform: rotate(360deg) translateX(130px); } }
        @keyframes loaderOrbit2 { from { transform: rotate(120deg) translateX(130px); } to { transform: rotate(480deg) translateX(130px); } }
        @keyframes loaderOrbit3 { from { transform: rotate(240deg) translateX(130px); } to { transform: rotate(600deg) translateX(130px); } }

        @keyframes loaderNodeGlow {
          0%, 100% { opacity: 0.5; r: 3.5; }
          50%       { opacity: 1; r: 5; }
        }

        @keyframes loaderPulse {
          0%   { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.9); }
        }
      `}</style>
    </div>
  );
}
