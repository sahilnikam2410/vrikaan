/**
 * VRIKAAN — Cinematic Cyber-Forest Loader
 *
 * Detailed running wolf silhouette through a stylized cyber-forest:
 *   • Realistic 4-leg gallop cycle (rotary gallop pattern, 4 frame steps)
 *   • Body suspension (slight vertical bob during stride)
 *   • Tail with 3-segment wag
 *   • Multiple parallax depth planes (mist, trees, near grass)
 *   • Geometric pine-tree silhouettes with neon-tipped peaks
 *   • Crescent moon with volumetric ray of light
 *   • Drifting cyan data particles (fireflies, but tech)
 *   • Ground-level rolling fog
 *   • Sweeping radar scan-line across the whole scene
 *   • Dust puffs under each footfall
 *   • Pulsing cyan eye + glowing motion trail behind wolf
 *
 * The wolf silhouette is hand-shaped via SVG bezier paths so it animates
 * as a real running creature, not pixel-blocks.
 */
import React from "react";

const JungleLoader = ({ width = 420, height = 160 }) => (
  <div style={{
    width, height, position: "relative", borderRadius: 14, overflow: "hidden",
    background: "#020411",
    border: "1px solid rgba(20, 184, 166,0.22)",
    boxShadow: "0 0 60px rgba(20, 184, 166,0.10) inset, 0 8px 32px rgba(0,0,0,0.5)",
  }}>
    <style>{`
      /* ─── World scrolling speeds ─── */
      @keyframes cw-px-mist { from { transform: translateX(0) } to { transform: translateX(-420px) } }
      @keyframes cw-px-far  { from { transform: translateX(0) } to { transform: translateX(-420px) } }
      @keyframes cw-px-mid  { from { transform: translateX(0) } to { transform: translateX(-420px) } }
      @keyframes cw-px-near { from { transform: translateX(0) } to { transform: translateX(-420px) } }
      @keyframes cw-px-grass { from { transform: translateX(0) } to { transform: translateX(-420px) } }
      .cw-mist  { animation: cw-px-mist  40s linear infinite; }
      .cw-far   { animation: cw-px-far   24s linear infinite; }
      .cw-mid   { animation: cw-px-mid   12s linear infinite; }
      .cw-near  { animation: cw-px-near  6s  linear infinite; }
      .cw-grass { animation: cw-px-grass 3s  linear infinite; }

      /* ─── Wolf body bob (suspension phase of gallop) ─── */
      @keyframes cw-body-bob {
        0%,100% { transform: translate(0, 0) }
        25%     { transform: translate(0, -2px) }
        50%     { transform: translate(0, 1px) }
        75%     { transform: translate(0, -1px) }
      }
      .cw-body { animation: cw-body-bob 0.36s ease-in-out infinite; transform-origin: center bottom; }

      /* ─── Tail wag ─── */
      @keyframes cw-tail-wag {
        0%,100% { transform: rotate(2deg) }
        50%     { transform: rotate(-2deg) }
      }
      .cw-tail { animation: cw-tail-wag 0.36s ease-in-out infinite; transform-origin: 0 0; }

      /* ─── Rotary gallop — each leg has a 4-stage cycle, phase-offset 90° ─── */
      @keyframes cw-leg-cycle {
        0%   { transform: translate(-2px, 0) rotate(-25deg) }   /* extended forward */
        25%  { transform: translate(0, 0) rotate(0deg) }        /* touchdown */
        50%  { transform: translate(3px, 0) rotate(20deg) }     /* push-off */
        75%  { transform: translate(0, -2px) rotate(-10deg) }   /* recovery (lifted) */
        100% { transform: translate(-2px, 0) rotate(-25deg) }
      }
      .cw-leg { animation: cw-leg-cycle 0.36s linear infinite; transform-box: fill-box; transform-origin: top; }
      .cw-leg.l-fl { animation-delay: 0s; }
      .cw-leg.l-br { animation-delay: 0s; }
      .cw-leg.l-fr { animation-delay: -0.18s; }
      .cw-leg.l-bl { animation-delay: -0.18s; }

      /* ─── Eye pulse + halo ─── */
      @keyframes cw-eye-pulse {
        0%,100% { fill: #14b8a6; filter: drop-shadow(0 0 2px #14b8a6) }
        50%     { fill: #fff;     filter: drop-shadow(0 0 4px #14b8a6) }
      }
      .cw-eye { animation: cw-eye-pulse 1.2s ease-in-out infinite; }

      /* ─── Twinkling stars ─── */
      @keyframes cw-tw { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }
      .cw-twinkle { animation: cw-tw 2.2s ease-in-out infinite; }

      /* ─── Drifting cyan firefly particles ─── */
      @keyframes cw-firefly-1 {
        0%   { transform: translate(0, 0); opacity: 0; }
        15%  { opacity: 0.8; }
        85%  { opacity: 0.8; }
        100% { transform: translate(-440px, -10px); opacity: 0; }
      }
      @keyframes cw-firefly-2 {
        0%   { transform: translate(0, 0); opacity: 0; }
        15%  { opacity: 0.6; }
        85%  { opacity: 0.6; }
        100% { transform: translate(-440px, 6px); opacity: 0; }
      }
      .cw-firefly-1 { animation: cw-firefly-1 7s linear infinite; }
      .cw-firefly-2 { animation: cw-firefly-2 9s linear infinite; }

      /* ─── Radar scan sweep ─── */
      @keyframes cw-scan {
        0%   { transform: translateX(-30%); opacity: 0; }
        20%  { opacity: 0.55; }
        80%  { opacity: 0.55; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      .cw-scan { animation: cw-scan 5s ease-in-out infinite; }

      /* ─── Dust kick under feet (each puff fades and disperses) ─── */
      @keyframes cw-dust {
        0%   { transform: translate(0, 0) scale(0.6); opacity: 0.7 }
        100% { transform: translate(-30px, -4px) scale(1.2); opacity: 0 }
      }
      .cw-dust { animation: cw-dust 0.6s ease-out infinite; }

      /* ─── Wolf trail glow ─── */
      @keyframes cw-trail-pulse { 0%,100% { opacity: 0.18 } 50% { opacity: 0.35 } }
      .cw-trail { animation: cw-trail-pulse 0.36s ease-in-out infinite; }

      /* ─── Ground-fog drift ─── */
      @keyframes cw-fog-drift { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      .cw-fog { animation: cw-fog-drift 18s linear infinite; }
    `}</style>

    <svg viewBox="0 0 420 160" width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        {/* Sky gradient */}
        <linearGradient id="cw-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#020411"/>
          <stop offset="40%"  stopColor="#0d1431"/>
          <stop offset="100%" stopColor="#020411"/>
        </linearGradient>
        {/* Moon halo */}
        <radialGradient id="cw-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#dde7ff" stopOpacity="0.95"/>
          <stop offset="50%"  stopColor="#6366f1" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </radialGradient>
        {/* Volumetric moon-ray */}
        <linearGradient id="cw-moon-ray" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#cdd6ff" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#cdd6ff" stopOpacity="0"/>
        </linearGradient>
        {/* Ground fog */}
        <linearGradient id="cw-fog-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#14b8a6" stopOpacity="0"/>
          <stop offset="50%"  stopColor="#14b8a6" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#0d1431" stopOpacity="0.6"/>
        </linearGradient>
        {/* Wolf trail gradient — fades behind wolf */}
        <linearGradient id="cw-trail-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#14b8a6" stopOpacity="0"/>
          <stop offset="60%"  stopColor="#14b8a6" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#fff"    stopOpacity="0.85"/>
        </linearGradient>
        {/* Radar scan beam */}
        <linearGradient id="cw-scan-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#14b8a6" stopOpacity="0"/>
          <stop offset="50%"  stopColor="#14b8a6" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
        </linearGradient>
        {/* Reusable cyber pine tree (tall triangle with neon tip) */}
        <symbol id="cw-pine" viewBox="0 0 24 60">
          <polygon points="12,0 22,55 2,55" fill="#040818" stroke="#1f2937" strokeWidth="0.5"/>
          <line x1="12" y1="0" x2="12" y2="55" stroke="#0f1730" strokeWidth="1"/>
          <circle cx="12" cy="2" r="1.4" fill="#14b8a6" opacity="0.8"/>
        </symbol>
        <symbol id="cw-pine-far" viewBox="0 0 16 36">
          <polygon points="8,0 14,32 2,32" fill="rgba(99,102,241,0.22)"/>
        </symbol>
        {/* Filters */}
        <filter id="cw-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ─── 1. Sky + moon ─── */}
      <rect width="420" height="160" fill="url(#cw-sky)"/>
      {/* Volumetric moon ray descending */}
      <polygon points="332,30 360,30 380,160 312,160" fill="url(#cw-moon-ray)" opacity="0.55"/>
      {/* Moon halo */}
      <circle cx="346" cy="32" r="22" fill="url(#cw-moon)"/>
      {/* Moon body (crescent: full white with shadow circle offset) */}
      <circle cx="346" cy="32" r="10" fill="#f1f5f9"/>
      <circle cx="350" cy="30" r="9"  fill="#0d1431"/>

      {/* ─── 2. Twinkling stars (static) ─── */}
      <g>
        <circle className="cw-twinkle" cx="40"  cy="22" r="0.9" fill="#fff"/>
        <circle className="cw-twinkle" cx="80"  cy="14" r="0.7" fill="#fff" style={{ animationDelay: "0.4s" }}/>
        <circle className="cw-twinkle" cx="125" cy="28" r="0.8" fill="#fff" style={{ animationDelay: "0.9s" }}/>
        <circle className="cw-twinkle" cx="170" cy="18" r="0.6" fill="#fff" style={{ animationDelay: "1.6s" }}/>
        <circle className="cw-twinkle" cx="220" cy="42" r="0.7" fill="#fff" style={{ animationDelay: "0.7s" }}/>
        <circle className="cw-twinkle" cx="260" cy="20" r="0.8" fill="#fff" style={{ animationDelay: "2.1s" }}/>
        <circle className="cw-twinkle" cx="395" cy="50" r="0.6" fill="#fff" style={{ animationDelay: "1.2s" }}/>
      </g>

      {/* ─── 3. Far mist mountains (very slow) ─── */}
      <g className="cw-mist">
        <g>
          <polygon points="0,90 30,55 60,90"     fill="rgba(99,102,241,0.10)"/>
          <polygon points="50,90 90,50 130,90"   fill="rgba(99,102,241,0.10)"/>
          <polygon points="120,90 160,60 200,90" fill="rgba(99,102,241,0.10)"/>
          <polygon points="190,90 240,45 290,90" fill="rgba(99,102,241,0.10)"/>
          <polygon points="280,90 330,55 380,90" fill="rgba(99,102,241,0.10)"/>
          <polygon points="370,90 410,60 420,80" fill="rgba(99,102,241,0.10)"/>
        </g>
        <g transform="translate(420,0)">
          <polygon points="0,90 30,55 60,90"     fill="rgba(99,102,241,0.10)"/>
          <polygon points="50,90 90,50 130,90"   fill="rgba(99,102,241,0.10)"/>
          <polygon points="120,90 160,60 200,90" fill="rgba(99,102,241,0.10)"/>
          <polygon points="190,90 240,45 290,90" fill="rgba(99,102,241,0.10)"/>
          <polygon points="280,90 330,55 380,90" fill="rgba(99,102,241,0.10)"/>
        </g>
      </g>

      {/* ─── 4. Far pine silhouettes ─── */}
      <g className="cw-far" transform="translate(0,72)">
        <g>
          <use href="#cw-pine-far" x="20"  width="14" height="32"/>
          <use href="#cw-pine-far" x="55"  width="12" height="28"/>
          <use href="#cw-pine-far" x="95"  width="14" height="32"/>
          <use href="#cw-pine-far" x="140" width="11" height="26"/>
          <use href="#cw-pine-far" x="180" width="13" height="30"/>
          <use href="#cw-pine-far" x="225" width="14" height="34"/>
          <use href="#cw-pine-far" x="265" width="11" height="26"/>
          <use href="#cw-pine-far" x="310" width="13" height="30"/>
          <use href="#cw-pine-far" x="355" width="14" height="32"/>
          <use href="#cw-pine-far" x="395" width="12" height="28"/>
        </g>
        <g transform="translate(420,0)">
          <use href="#cw-pine-far" x="20"  width="14" height="32"/>
          <use href="#cw-pine-far" x="55"  width="12" height="28"/>
          <use href="#cw-pine-far" x="95"  width="14" height="32"/>
          <use href="#cw-pine-far" x="140" width="11" height="26"/>
          <use href="#cw-pine-far" x="180" width="13" height="30"/>
          <use href="#cw-pine-far" x="225" width="14" height="34"/>
          <use href="#cw-pine-far" x="265" width="11" height="26"/>
          <use href="#cw-pine-far" x="310" width="13" height="30"/>
        </g>
      </g>

      {/* ─── 5. Mid pine silhouettes (taller, with neon tips) ─── */}
      <g className="cw-mid" transform="translate(0,60)">
        <g>
          <use href="#cw-pine" x="20"  width="20" height="50"/>
          <use href="#cw-pine" x="65"  width="22" height="55"/>
          <use href="#cw-pine" x="110" width="18" height="46"/>
          <use href="#cw-pine" x="155" width="24" height="60"/>
          <use href="#cw-pine" x="210" width="20" height="50"/>
          <use href="#cw-pine" x="260" width="22" height="55"/>
          <use href="#cw-pine" x="310" width="18" height="46"/>
          <use href="#cw-pine" x="360" width="24" height="60"/>
          <use href="#cw-pine" x="400" width="20" height="50"/>
        </g>
        <g transform="translate(420,0)">
          <use href="#cw-pine" x="20"  width="20" height="50"/>
          <use href="#cw-pine" x="65"  width="22" height="55"/>
          <use href="#cw-pine" x="110" width="18" height="46"/>
          <use href="#cw-pine" x="155" width="24" height="60"/>
          <use href="#cw-pine" x="210" width="20" height="50"/>
        </g>
      </g>

      {/* ─── 6. Drifting cyan fireflies ─── */}
      <g className="cw-firefly-1">
        <circle cx="430"  cy="50"  r="1.2" fill="#14b8a6" filter="url(#cw-glow)"/>
        <circle cx="500"  cy="80"  r="0.9" fill="#14b8a6" filter="url(#cw-glow)" style={{ animationDelay: "1s" }}/>
      </g>
      <g className="cw-firefly-2">
        <circle cx="450"  cy="70"  r="1.0" fill="#14b8a6" filter="url(#cw-glow)"/>
        <circle cx="520"  cy="50"  r="0.8" fill="#14b8a6" filter="url(#cw-glow)" style={{ animationDelay: "2s" }}/>
        <circle cx="560"  cy="90"  r="1.1" fill="#14b8a6" filter="url(#cw-glow)" style={{ animationDelay: "3s" }}/>
      </g>

      {/* ─── 7. Ground line ─── */}
      <line x1="0" y1="125" x2="420" y2="125" stroke="#1f2937" strokeWidth="1"/>
      <line x1="0" y1="126" x2="420" y2="126" stroke="rgba(20, 184, 166,0.3)" strokeWidth="0.5"/>

      {/* ─── 8. Wolf trail (motion blur) ─── */}
      <g className="cw-trail" transform="translate(120,118)">
        <ellipse cx="-20" cy="0" rx="40" ry="3" fill="url(#cw-trail-grad)"/>
      </g>

      {/* ─── 9. Wolf body — running silhouette ─── */}
      <g className="cw-body" transform="translate(160,102)">
        {/* Tail (wagging) */}
        <g className="cw-tail" transform="translate(-26,2)">
          <path d="M 0 0 Q -8 -2 -14 -1 Q -20 0 -26 -2 L -30 0 Q -22 4 -14 4 Q -6 4 0 2 Z" fill="#0a0f1e"/>
          <path d="M 0 0 Q -8 -2 -14 -1 Q -20 0 -26 -2 L -30 0 Q -22 4 -14 4 Q -6 4 0 2 Z" fill="none" stroke="#1f2937" strokeWidth="0.4"/>
        </g>

        {/* Main body silhouette (head-to-rear in profile) */}
        <path
          d="M -28 0
             C -32 -4 -28 -10 -22 -12
             L -10 -14
             C -2 -15 8 -15 16 -13
             C 22 -12 26 -10 30 -8
             L 30 -10  L 34 -10
             C 38 -10 40 -8 41 -5
             L 44 -4
             L 44 -1
             L 41 0
             C 36 1 30 1 24 0
             L 18 0
             C 10 0 0 0 -6 0
             C -14 0 -22 0 -28 1
             Z"
          fill="#0a0f1e"
          stroke="#1f2937"
          strokeWidth="0.5"
        />

        {/* Ear (back) */}
        <path d="M 0 -14 L 4 -19 L 8 -14 Z" fill="#0a0f1e"/>
        {/* Ear (front, slightly forward) */}
        <path d="M 8 -15 L 12 -20 L 16 -14 Z" fill="#0a0f1e"/>

        {/* Snout shadow detail */}
        <path d="M 38 -7 L 41 -7 L 41 -3 L 38 -3 Z" fill="#000" opacity="0.5"/>

        {/* Glowing eye */}
        <circle className="cw-eye" cx="32" cy="-9" r="1.4" fill="#14b8a6"/>

        {/* Legs — 4 legs with rotary gallop pattern */}
        {/* Front-left leg */}
        <g className="cw-leg l-fl" transform="translate(20, 0)">
          <rect x="-1" y="0" width="2.2" height="9" fill="#0a0f1e"/>
          <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e"/>
        </g>
        {/* Front-right leg (slight offset for depth) */}
        <g className="cw-leg l-fr" transform="translate(15, 0)">
          <rect x="-1" y="0" width="2" height="9" fill="#0a0f1e" opacity="0.85"/>
          <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e" opacity="0.85"/>
        </g>
        {/* Back-left leg */}
        <g className="cw-leg l-bl" transform="translate(-16, 0)">
          <rect x="-1" y="0" width="2" height="9" fill="#0a0f1e" opacity="0.85"/>
          <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e" opacity="0.85"/>
        </g>
        {/* Back-right leg */}
        <g className="cw-leg l-br" transform="translate(-21, 0)">
          <rect x="-1" y="0" width="2.2" height="9" fill="#0a0f1e"/>
          <rect x="-1.5" y="8" width="3" height="2" fill="#0a0f1e"/>
        </g>
      </g>

      {/* ─── 10. Dust puffs under feet ─── */}
      <g transform="translate(140,124)">
        <circle className="cw-dust" cx="0" cy="0" r="2" fill="#94a3b8" opacity="0.5"/>
        <circle className="cw-dust" cx="-4" cy="0" r="1.5" fill="#94a3b8" opacity="0.4" style={{ animationDelay: "0.18s" }}/>
        <circle className="cw-dust" cx="-8" cy="0" r="1.2" fill="#94a3b8" opacity="0.3" style={{ animationDelay: "0.36s" }}/>
      </g>

      {/* ─── 11. Foreground grass (fast scroll) ─── */}
      <g className="cw-grass" transform="translate(0,128)">
        <g>
          <rect x="0"   y="2" width="2" height="6" fill="#0a0f1e"/>
          <rect x="20"  y="0" width="2" height="8" fill="#0a0f1e"/>
          <rect x="40"  y="3" width="2" height="5" fill="#0a0f1e"/>
          <rect x="60"  y="1" width="2" height="7" fill="#0a0f1e"/>
          <rect x="80"  y="2" width="2" height="6" fill="#0a0f1e"/>
          <rect x="100" y="0" width="2" height="8" fill="#0a0f1e"/>
          <rect x="180" y="1" width="2" height="7" fill="#0a0f1e"/>
          <rect x="200" y="2" width="2" height="6" fill="#0a0f1e"/>
          <rect x="220" y="0" width="2" height="8" fill="#0a0f1e"/>
          <rect x="280" y="1" width="2" height="7" fill="#0a0f1e"/>
          <rect x="300" y="3" width="2" height="5" fill="#0a0f1e"/>
          <rect x="320" y="0" width="2" height="8" fill="#0a0f1e"/>
          <rect x="380" y="2" width="2" height="6" fill="#0a0f1e"/>
          <rect x="400" y="1" width="2" height="7" fill="#0a0f1e"/>
        </g>
        <g transform="translate(420,0)">
          <rect x="0"   y="2" width="2" height="6" fill="#0a0f1e"/>
          <rect x="20"  y="0" width="2" height="8" fill="#0a0f1e"/>
          <rect x="40"  y="3" width="2" height="5" fill="#0a0f1e"/>
          <rect x="60"  y="1" width="2" height="7" fill="#0a0f1e"/>
        </g>
      </g>

      {/* ─── 12. Ground fog gradient ─── */}
      <rect x="0" y="100" width="420" height="60" fill="url(#cw-fog-grad)" opacity="0.7"/>

      {/* ─── 13. Radar scan-line sweep ─── */}
      <rect className="cw-scan" x="0" y="0" width="60" height="160" fill="url(#cw-scan-grad)"/>

      {/* ─── 14. Subtle vignette overlay ─── */}
      <radialGradient id="cw-vignette" cx="50%" cy="50%" r="60%">
        <stop offset="60%"  stopColor="#000" stopOpacity="0"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0.65"/>
      </radialGradient>
      <rect x="0" y="0" width="420" height="160" fill="url(#cw-vignette)"/>
    </svg>
  </div>
);

export default JungleLoader;
