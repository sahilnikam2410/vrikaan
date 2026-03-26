import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CyberGlobe from "./components/CyberGlobe";
import ThreatMapLive from "./components/ThreatMapLive";

/* ═══════════════════════════════════════════════════════
   SECUVION v5 — PROFESSIONAL CYBER DEFENSE PLATFORM
   Aesthetic: CrowdStrike x SentinelOne x Vercel
   ═══════════════════════════════════════════════════════ */

const T = {
  bg: "#030712",
  deep: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1f2937",
  card: "rgba(17,24,39,0.6)",
  glass: "rgba(3,7,18,0.65)",
  accent: "#6366f1",
  accentSoft: "#818cf8",
  accentDim: "rgba(99,102,241,0.08)",
  accentMed: "rgba(99,102,241,0.18)",
  cyan: "#14e3c5",
  cyanSoft: "#00e5b9",
  cyanDim: "rgba(20,227,197,0.06)",
  cyanMed: "rgba(20,227,197,0.15)",
  cyanGlow: "rgba(20,227,197,0.3)",
  ember: "#f97316",
  emberDim: "rgba(249,115,22,0.08)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.08)",
  gold: "#eab308",
  purple: "#a78bfa",
  blue: "#38bdf8",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  border: "rgba(148,163,184,0.08)",
  borderHover: "rgba(99,102,241,0.25)",
  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
};

/* ── SECUVION SHIELD LOGO ── */
let brandClipId = 0;
const BrandIcon = ({ size = 50 }) => {
  const id = useState(() => ++brandClipId)[0];
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`bg1_${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B6CF6"/><stop offset="50%" stopColor="#534AB7"/><stop offset="100%" stopColor="#3B2F9E"/>
        </linearGradient>
        <linearGradient id={`bg2_${id}`} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#9B8FFF" stopOpacity="0.9"/><stop offset="100%" stopColor="#6358D4" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id={`bg3_${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3DA8"/><stop offset="100%" stopColor="#2A1F7A"/>
        </linearGradient>
        <linearGradient id={`orb_${id}`} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#14e3c5" stopOpacity="0"/><stop offset="30%" stopColor="#14e3c5" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#7B6CF6" stopOpacity="0.9"/><stop offset="100%" stopColor="#534AB7" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id={`core_${id}`} cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#EEEDFE" stopOpacity="0.95"/><stop offset="40%" stopColor="#AFA9EC" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#534AB7" stopOpacity="0"/>
        </radialGradient>
        <filter id={`glow_${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id={`sh_${id}`} x="-20%" y="-10%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="shadow"/><feOffset dx="0" dy="8" result="offsetShadow"/>
          <feFlood floodColor="#1a0e4a" floodOpacity="0.5"/><feComposite in2="offsetShadow" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter={`url(#sh_${id})`}>
        <path d="M100,22 L152,55 L152,130 L100,163 L100,163 L100,88Z" fill={`url(#bg3_${id})`} opacity="0.6"/>
        <path d="M100,163 L152,130 L152,55 L100,88Z" fill={`url(#bg3_${id})`}/>
        <path d="M100,163 L48,130 L48,55 L100,88Z" fill={`url(#bg2_${id})`}/>
        <path d="M100,22 L152,55 L100,88 L48,55Z" fill={`url(#bg1_${id})`}/>
        <path d="M100,22 L152,55 L100,88 L48,55Z" fill="white" opacity="0.08"/>
        <path d="M100,22 L126,38 L100,54 L74,38Z" fill="white" opacity="0.12"/>
      </g>
      <path d="M100,52 L128,68 L128,108 L100,124 L72,108 L72,68Z" fill="#0d0b2a" fillOpacity="0.85"/>
      <path d="M100,52 L128,68 L128,108 L100,124 L72,108 L72,68Z" fill="none" stroke="#9B8FFF" strokeWidth="1" opacity="0.5"/>
      <circle cx="100" cy="88" r="18" fill={`url(#core_${id})`} filter={`url(#glow_${id})`}>
        <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="88" r="10" fill="#534AB7" opacity="0.9">
        <animate attributeName="r" values="10;11.5;10" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="88" r="5" fill="#EEEDFE" opacity="0.95"/>
      <circle cx="100" cy="88" r="2.2" fill="#1a0e4a"/>
      <circle cx="96" cy="84" r="2" fill="white" opacity="0.7"/>
      <g style={{ transformOrigin: "100px 88px", animation: "brand-orbit-ring 8s linear infinite" }}>
        <ellipse cx="100" cy="88" rx="80" ry="22" fill="none" stroke={`url(#orb_${id})`} strokeWidth="3.5" strokeLinecap="round" transform="rotate(-25 100 88)"/>
        <circle cx="178" cy="80" r="4.5" fill="#14e3c5" opacity="0.95" transform="rotate(-25 100 88)">
          <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="178" cy="80" r="8" fill="#14e3c5" opacity="0.15" transform="rotate(-25 100 88)"/>
      </g>
      <g style={{ transformOrigin: "100px 88px", animation: "brand-orbit-ring2 12s linear infinite" }}>
        <ellipse cx="100" cy="88" rx="70" ry="16" fill="none" stroke="#7B6CF6" strokeWidth="1.2" strokeDasharray="6 12" opacity="0.3" transform="rotate(15 100 88)"/>
      </g>
      <circle cx="45" cy="40" r="3" fill="#14e3c5" opacity="0.7">
        <animate attributeName="cy" values="40;36;40" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="160" cy="48" r="2" fill="#FF3CAC" opacity="0.6">
        <animate attributeName="cy" values="48;44;48" dur="3s" repeatCount="indefinite"/>
      </circle>
      <path d="M100,22 L48,55" stroke="white" strokeWidth="1.5" opacity="0.2" strokeLinecap="round"/>
      <circle cx="100" cy="163" r="3" fill="#534AB7" opacity="0.6">
        <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
};

/* ── PARTICLE BACKGROUND ── */
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      pulse: Math.random() * Math.PI * 2,
      size: 0.4 + Math.random() * 0.8,
    }));
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.pulse += 0.008;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const px = p.x * w, py = p.y * h;
        const op = 0.06 + Math.sin(p.pulse) * 0.04;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${op})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
};

/* ── SCROLL REVEAL ── */
const useReveal = (thresh = 0.1) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: thresh });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

const Reveal = ({ children, delay = 0, direction = "up", style = {} }) => {
  const [ref, vis] = useReveal();
  const transforms = { up: "translateY(40px)", left: "translateX(-40px)", right: "translateX(40px)", scale: "scale(0.92)" };
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      willChange: vis ? "auto" : "transform, opacity",
      ...style
    }}>{children}</div>
  );
};

/* ── GRADIENT TEXT ── */
const GradientText = ({ children, style = {} }) => (
  <span style={{
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #14e3c5 100%)",
    backgroundSize: "200% 200%", animation: "gradient-shift 8s ease infinite",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", ...style,
  }}>{children}</span>
);

/* ── BADGE ── */
const Badge = ({ children, color = T.accent }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 14px", borderRadius: 100,
    background: `${color}0c`, border: `1px solid ${color}20`,
    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color,
  }}>{children}</span>
);

/* ── BUTTON ── */
const Btn = ({ children, primary, to, onClick, style: s = {}, icon }) => {
  const [h, setH] = useState(false);
  const inner = (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: primary ? (h ? "#818cf8" : "#6366f1") : (h ? "rgba(99,102,241,0.08)" : "rgba(148,163,184,0.04)"),
        color: primary ? "#fff" : (h ? T.white : T.muted),
        border: primary ? "none" : `1px solid ${h ? T.borderHover : T.border}`,
        padding: primary ? "14px 32px" : "13px 28px",
        fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: h ? "translateY(-2px)" : "translateY(0)",
        boxShadow: primary ? (h ? "0 12px 40px rgba(99,102,241,0.4)" : "0 4px 16px rgba(99,102,241,0.2)") : "none",
        display: "inline-flex", alignItems: "center", gap: 8, ...s,
      }}>
      {primary && <span style={{ position: "absolute", top: 0, left: h ? "120%" : "-40%", width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", transition: "left 0.6s ease", pointerEvents: "none" }} />}
      {icon && <span style={{ fontSize: 16, opacity: 0.85 }}>{icon}</span>}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
  if (to) return <Link to={to} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
};

/* ── CARD ── */
const Card = ({ children, style: s = {}, hover = true }) => {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.card, border: `1px solid ${h && hover ? "rgba(99,102,241,0.15)" : T.border}`,
        backdropFilter: "blur(8px)", padding: 32, borderRadius: 16,
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: h && hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: h && hover ? "0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(99,102,241,0.06)" : "0 2px 12px rgba(0,0,0,0.1)",
        position: "relative", overflow: "hidden", ...s,
      }}>
      {hover && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h ? 2 : 0, background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)", transition: "height 0.4s ease" }} />}
      {children}
    </div>
  );
};

/* ── SECTION WRAPPER ── */
const Section = ({ children, id, style = {} }) => (
  <section id={id} style={{ padding: "120px clamp(24px, 5vw, 80px)", maxWidth: 1280, margin: "0 auto", position: "relative", ...style }}>
    {children}
  </section>
);

/* ── SECTION HEADER ── */
const SectionHeader = ({ badge, title, subtitle, align = "center" }) => (
  <div style={{ marginBottom: 64, textAlign: align, maxWidth: align === "center" ? 700 : "none", margin: align === "center" ? "0 auto 64px" : "0 0 48px" }}>
    {badge && <div style={{ marginBottom: 16 }}><Badge>{badge}</Badge></div>}
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: T.white, margin: 0, lineHeight: 1.15, letterSpacing: "-0.03em" }}>{title}</h2>
    {subtitle && <p style={{ fontFamily: "var(--font-body)", color: T.muted, fontSize: "clamp(15px, 1.3vw, 17px)", marginTop: 16, lineHeight: 1.7, maxWidth: align === "center" ? 540 : "none" }}>{subtitle}</p>}
  </div>
);

/* ══════════════════════════════════════════════════
   HERO SECTION — Professional split layout
   ══════════════════════════════════════════════════ */
const Hero = () => {
  const [threats, setThreats] = useState(2841029);

  useEffect(() => {
    const t = setInterval(() => setThreats(c => c + Math.floor(Math.random() * 30) + 5), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "120px clamp(24px, 5vw, 80px) 80px" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07), transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,227,197,0.04), transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 2 }} className="hero-grid">
        {/* Left — Content */}
        <div>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 100, marginBottom: 32, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "status-pulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#22c55e", fontWeight: 500 }}>All systems operational</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5.5vw, 72px)", fontWeight: 700, color: T.white, margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-0.04em" }}>
              Cyber Defense<br />for the <GradientText>Modern World</GradientText>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(16px, 1.5vw, 18px)", color: T.muted, maxWidth: 480, lineHeight: 1.8, marginBottom: 40 }}>
              AI-powered protection against fraud, phishing, and identity theft. Enterprise-grade security made accessible for everyone — students, families, and businesses.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
              <Btn primary to="/signup" icon="&#9889;">Start Free Protection</Btn>
              <Btn to="/fraud-analyzer" icon="&#9670;">Analyze a Threat</Btn>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { val: threats.toLocaleString(), label: "Threats Blocked", color: T.accent },
                { val: "1.2M+", label: "Users Protected", color: T.cyan },
                { val: "84", label: "Countries", color: T.ember },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — 3D Globe */}
        <Reveal delay={0.3} direction="right">
          <div style={{ position: "relative", width: "100%", aspectRatio: "1", maxWidth: 560, margin: "0 auto" }} className="hero-globe">
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(99,102,241,0.08), transparent 60%)" }} />
            <CyberGlobe size={560} />
            {/* Floating stat cards */}
            <div style={{ position: "absolute", top: "8%", right: "-5%", padding: "12px 18px", background: "rgba(17,24,39,0.85)", backdropFilter: "blur(12px)", border: `1px solid ${T.border}`, borderRadius: 12, animation: "float 4s ease-in-out infinite" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: T.red, fontWeight: 600, marginBottom: 4 }}>THREAT DETECTED</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.mutedDark }}>SQL Injection &bull; 192.168.x.x</div>
            </div>
            <div style={{ position: "absolute", bottom: "12%", left: "-8%", padding: "12px 18px", background: "rgba(17,24,39,0.85)", backdropFilter: "blur(12px)", border: `1px solid ${T.border}`, borderRadius: 12, animation: "float 5s ease-in-out infinite 1s" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#22c55e", fontWeight: 600, marginBottom: 4 }}>BLOCKED</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.mutedDark }}>Phishing attempt neutralized</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── TRUSTED BY BAR ── */
const TrustedBy = () => (
  <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "40px clamp(24px, 5vw, 80px)", background: "rgba(17,24,39,0.2)" }}>
    <Reveal>
      <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, marginBottom: 28, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Trusted by organizations worldwide</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(32px, 5vw, 72px)", flexWrap: "wrap", opacity: 0.35 }}>
          {["TechCorp", "SecureNet", "DataFlow", "CyberSync", "NetGuard"].map((name, i) => (
            <span key={i} style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: T.white, letterSpacing: "0.05em" }}>{name}</span>
          ))}
        </div>
      </div>
    </Reveal>
  </div>
);

/* ── FEATURES — Premium grid ── */
const Features = () => {
  const features = [
    { icon: "&#x2B21;", title: "AI Fraud Detection", desc: "Real-time scanning of URLs, messages, and calls with 99.7% accuracy using multi-layered neural networks.", color: T.cyan },
    { icon: "&#x2B22;", title: "Identity Shield", desc: "Continuous monitoring of your personal data across the web, dark web marketplaces, and breach databases.", color: T.blue },
    { icon: "&#x25C7;", title: "Device Armor", desc: "Intelligent threat detection across all your devices with zero-day exploit prevention.", color: T.purple },
    { icon: "&#x25CE;", title: "Phishing Radar", desc: "Instantly identify fraudulent websites, emails, and SMS with AI-powered pattern recognition.", color: T.ember },
    { icon: "&#x25D0;", title: "Dark Web Watch", desc: "24/7 monitoring for leaked credentials, financial data, and personal information on hidden networks.", color: T.red },
    { icon: "&#x25CB;", title: "Privacy Guard", desc: "Control your digital footprint, manage data exposure, and enforce online visibility policies.", color: T.gold },
  ];

  return (
    <Section id="features">
      <Reveal><SectionHeader badge="Platform" title={<>Enterprise Security,<br /><GradientText>Built for Everyone</GradientText></>} subtitle="Six layers of AI-powered protection. No technical expertise required." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        {features.map((f, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <Card style={{ height: "100%", padding: "36px 32px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}0a`, border: `1px solid ${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: f.color, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: f.icon }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: T.white, margin: "0 0 10px", letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── HOW IT WORKS — Horizontal flow ── */
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Detect", desc: "Our AI sensors continuously scan your digital interactions — links, messages, and emails — for anomalies and known threat signatures.", color: T.cyan },
    { n: "02", title: "Analyze", desc: "Machine learning models cross-reference billions of threat patterns in real-time, assessing risk level with over 99% accuracy.", color: T.accent },
    { n: "03", title: "Protect", desc: "Instant alerts with clear, actionable guidance. Threats are automatically neutralized before they can cause damage.", color: "#22c55e" },
  ];

  return (
    <Section>
      <Reveal><SectionHeader badge="How It Works" title="Three Steps to Total Protection" subtitle="Simple for you. Powerful against threats. Always-on defense." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, position: "relative" }}>
        {/* Connecting line */}
        <div style={{ position: "absolute", top: 40, left: "15%", right: "15%", height: 1, background: `linear-gradient(90deg, transparent, ${T.border}, ${T.border}, transparent)`, zIndex: 0 }} className="how-connector" />
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.15}>
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px", background: `${s.color}08`, border: `2px solid ${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: s.color }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: T.white, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── AI FRAUD ANALYZER ── */
const Analyzer = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("url");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scan = () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    setTimeout(() => {
      const r = Math.random();
      const level = r > 0.55 ? "CRITICAL" : r > 0.25 ? "WARNING" : "CLEAR";
      const data = {
        CLEAR: { color: "#22c55e", score: 94, msg: "No threats detected. Source appears legitimate and safe to interact with.", icon: "&#10003;" },
        WARNING: { color: T.gold, score: 42, msg: "Suspicious patterns detected. Exercise caution and verify the source independently before proceeding.", icon: "&#9888;" },
        CRITICAL: { color: T.red, score: 8, msg: "High-risk threat identified. Do not interact. This matches known malicious signatures in our database.", icon: "&#10005;" },
      };
      setResult({ level, ...data[level] });
      setLoading(false);
    }, 2500);
  };

  const modes = [
    { id: "url", label: "URL", ph: "Enter suspicious website URL..." },
    { id: "email", label: "Email", ph: "Enter suspicious email address..." },
    { id: "phone", label: "Phone", ph: "Enter suspicious phone number..." },
  ];

  return (
    <Section id="analyzer">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="analyzer-grid">
        {/* Left - Info */}
        <Reveal>
          <div>
            <Badge>Threat Analysis</Badge>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 700, color: T.white, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
              AI-Powered<br /><GradientText>Fraud Analyzer</GradientText>
            </h2>
            <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
              Paste any suspicious URL, email, or phone number. Our AI cross-references global threat databases with over 12 billion known signatures in real-time.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "12B+ threat signatures", color: T.cyan },
                { label: "Real-time analysis", color: T.accent },
                { label: "99.7% detection rate", color: "#22c55e" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: T.white, fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Right - Analyzer tool */}
        <Reveal delay={0.2} direction="right">
          <Card style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ padding: "24px 28px 0" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4 }}>
                {modes.map(m => (
                  <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 8,
                      background: mode === m.id ? "rgba(99,102,241,0.1)" : "transparent",
                      border: `1px solid ${mode === m.id ? "rgba(99,102,241,0.2)" : "transparent"}`,
                      color: mode === m.id ? T.accentSoft : T.mutedDark,
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease",
                    }}>{m.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder={modes.find(m => m.id === mode).ph}
                  onKeyDown={e => e.key === "Enter" && scan()}
                  style={{ flex: 1, padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white, fontFamily: "var(--font-body)", fontSize: 14, outline: "none", transition: "border-color 0.3s" }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"}
                  onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"}
                />
                <Btn primary onClick={scan}>{loading ? "Scanning..." : "Scan"}</Btn>
              </div>
            </div>
            {loading && (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ width: 40, height: 40, margin: "0 auto", border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, marginTop: 18 }}>Analyzing threat signatures...</div>
              </div>
            )}
            {result && (
              <div style={{ margin: "0 24px 24px", padding: 24, background: `${result.color}08`, border: `1px solid ${result.color}18`, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, border: `1.5px solid ${result.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: result.color, flexShrink: 0, background: `${result.color}0a` }} dangerouslySetInnerHTML={{ __html: result.icon }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: result.color }}>{result.score}</span>
                      <span style={{ fontSize: 14, color: T.mutedDark }}>/100</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: result.color, marginLeft: "auto" }}>{result.level}</span>
                    </div>
                    <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: "6px 0 0" }}>{result.msg}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </Section>
  );
};

/* ── GLOBAL THREAT MAP ── */
const ThreatMapSection = () => {
  const [events, setEvents] = useState([]);
  const [attackCount, setAttackCount] = useState(2843921);
  const [typeCounts, setTypeCounts] = useState({ MALWARE: 847, PHISHING: 1203, DDOS: 432, RANSOMWARE: 298, EXPLOIT: 615 });

  const cities = [
    { n: "New York", x: 27, y: 36 }, { n: "London", x: 47, y: 27 }, { n: "Moscow", x: 60, y: 25 },
    { n: "Mumbai", x: 66, y: 48 }, { n: "Tokyo", x: 83, y: 33 }, { n: "Sao Paulo", x: 31, y: 66 },
    { n: "Sydney", x: 85, y: 73 }, { n: "Lagos", x: 49, y: 53 }, { n: "Singapore", x: 75, y: 55 },
    { n: "Berlin", x: 51, y: 27 }, { n: "Dubai", x: 61, y: 42 }, { n: "Seoul", x: 80, y: 34 },
  ];
  const types = ["MALWARE", "PHISHING", "DDOS", "RANSOMWARE", "EXPLOIT"];
  const typeColors = { MALWARE: T.red, PHISHING: T.gold, DDOS: T.ember, RANSOMWARE: T.purple, EXPLOIT: T.blue };

  useEffect(() => {
    const c1 = setInterval(() => setAttackCount(c => c + Math.floor(Math.random() * 15) + 3), 1500);
    const c2 = setInterval(() => {
      setTypeCounts(prev => {
        const k = types[Math.floor(Math.random() * types.length)];
        return { ...prev, [k]: prev[k] + Math.floor(Math.random() * 3) + 1 };
      });
    }, 800);
    const add = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      if (from.n === to.n) return;
      setEvents(prev => [...prev.slice(-8), { id: Date.now() + Math.random(), from, to, type: types[Math.floor(Math.random() * types.length)], time: new Date().toLocaleTimeString("en-US", { hour12: false }) }]);
    };
    const iv = setInterval(add, 1400);
    add(); setTimeout(add, 300); setTimeout(add, 700);
    return () => { clearInterval(iv); clearInterval(c1); clearInterval(c2); };
  }, []);

  return (
    <Section id="threats" style={{ maxWidth: 1440 }}>
      <Reveal><SectionHeader badge="Live Intelligence" title={<>Global Threat <GradientText>Intelligence</GradientText></>} subtitle="Real-time visualization of cyber operations detected across 84 countries." /></Reveal>

      {/* Threat level bar */}
      <Reveal delay={0.1}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 24px", marginBottom: 20, borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-body)", color: T.red, fontWeight: 600, fontSize: 13 }}>Threat Level: Elevated</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", color: T.white, fontWeight: 700, fontSize: 16 }}>{attackCount.toLocaleString()}</span>
            <span style={{ color: T.mutedDark, fontSize: 12 }}>attacks today</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 220px", gap: 16 }} className="threat-map-grid">
          {/* Left panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ padding: 18, borderRadius: 12 }} hover={false}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 14 }}>Attack Vectors</div>
              {types.map(t => (
                <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[t] }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: T.white, fontWeight: 500 }}>{t}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: typeColors[t], fontWeight: 600 }}>{typeCounts[t].toLocaleString()}</span>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 18, borderRadius: 12, flex: 1 }} hover={false}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 14 }}>Quick Stats</div>
              {[
                { label: "Blocked", val: Math.floor(attackCount * 0.87).toLocaleString(), color: "#22c55e" },
                { label: "Critical", val: Math.floor(attackCount * 0.04).toLocaleString(), color: T.red },
                { label: "Active", val: events.length, color: T.ember },
                { label: "Nations", val: "84", color: T.cyan },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.mutedDark }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: s.color, fontWeight: 700 }}>{s.val}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Center — Map */}
          <div style={{ position: "relative", minHeight: 450, borderRadius: 18, overflow: "hidden", border: `1px solid rgba(20,227,197,0.06)`, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <ThreatMapLive events={events} />
          </div>

          {/* Right — Live Feed */}
          <Card style={{ padding: 16, borderRadius: 12, overflow: "hidden" }} hover={false}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.muted, fontWeight: 600 }}>Live Feed</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: T.red, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "pulse-dot 2s ease-in-out infinite" }} />Live
              </span>
            </div>
            <div style={{ maxHeight: 380, overflow: "auto" }}>
              {events.slice().reverse().map(e => (
                <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}`, animation: "fadeIn 0.4s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColors[e.type] }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: typeColors[e.type], fontWeight: 700 }}>{e.type}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: T.mutedDark, marginLeft: "auto" }}>{e.time}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: T.mutedDark, paddingLeft: 12 }}>
                    <span style={{ color: T.white }}>{e.from.n}</span>
                    <span style={{ color: T.red, margin: "0 6px" }}> &rarr; </span>
                    <span style={{ color: T.white }}>{e.to.n}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Reveal>

      {/* 3D Globe */}
      <Reveal delay={0.3}>
        <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${T.border})` }} />
          <Badge color={T.mutedDark}>3D Threat Visualization</Badge>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
        </div>
        <div style={{ position: "relative", height: 500, borderRadius: 20, overflow: "hidden", border: `1px solid ${T.border}`, background: "radial-gradient(ellipse at 50% 50%, rgba(20,227,197,0.02) 0%, #030712 70%)" }}>
          <CyberGlobe size={500} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", padding: "36px 0 20px", background: "linear-gradient(transparent, rgba(3,7,18,0.9))", pointerEvents: "none" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: T.mutedDark, marginBottom: 6 }}>Global operations detected</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: T.accent, letterSpacing: "-0.02em" }}>{attackCount.toLocaleString()}</div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
};

/* ── BIG NUMBERS SECTION ── */
const BigNumbers = () => {
  const stats = [
    { value: "99.7%", label: "Detection Accuracy", desc: "AI-powered threat identification" },
    { value: "<50ms", label: "Response Time", desc: "Real-time threat neutralization" },
    { value: "12B+", label: "Threat Signatures", desc: "Continuously updated database" },
    { value: "24/7", label: "Active Monitoring", desc: "Never-sleeping defense system" },
  ];
  return (
    <div style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 100%)", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "80px clamp(24px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 48 }}>
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 800, color: T.white, letterSpacing: "-0.03em", marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: T.cyan, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark }}>{s.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

/* ── SECURITY TOOLS — Breach Check + Safety Score ── */
const SecurityTools = () => {
  const [email, setEmail] = useState("");
  const [breachRes, setBreachRes] = useState(null);
  const [breachLoading, setBreachLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const checkBreach = () => {
    if (!email.includes("@")) return;
    setBreachLoading(true); setBreachRes(null);
    setTimeout(() => { const b = Math.floor(Math.random() * 6); setBreachRes({ breaches: b, safe: b === 0 }); setBreachLoading(false); }, 2200);
  };

  const questions = [
    { id: "pw", q: "Unique passwords per account?", w: 25 },
    { id: "mfa", q: "Two-factor authentication enabled?", w: 25 },
    { id: "upd", q: "Devices & apps updated regularly?", w: 25 },
    { id: "aware", q: "Can you spot phishing attempts?", w: 25 },
  ];
  const calcScore = () => { let total = 0; questions.forEach(q => { if (answers[q.id]) total += q.w; }); setScore(total); };
  const scoreColor = score === null ? T.cyan : score >= 75 ? "#22c55e" : score >= 50 ? T.gold : T.red;

  return (
    <Section id="tools">
      <Reveal><SectionHeader badge="Security Tools" title={<>Free Security <GradientText>Assessment</GradientText></>} subtitle="Check your exposure and assess your security posture in seconds." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }} className="tools-grid">
        {/* Breach Check */}
        <Reveal delay={0.1}>
          <Card style={{ height: "100%", padding: 36 }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.red}0a`, border: `1px solid ${T.red}15`, display: "flex", alignItems: "center", justifyContent: "center", color: T.red, fontSize: 18 }}>&#9888;</div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: T.white, margin: 0 }}>Email Breach Scanner</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, margin: 0 }}>Check if your email has been compromised</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address..."
                onKeyDown={e => e.key === "Enter" && checkBreach()}
                style={{ flex: 1, padding: "14px 18px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white, fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"} />
              <Btn primary onClick={checkBreach}>{breachLoading ? "..." : "Scan"}</Btn>
            </div>
            {breachLoading && <div style={{ textAlign: "center", padding: 28 }}><div style={{ width: 36, height: 36, border: "2px solid rgba(148,163,184,0.1)", borderTopColor: T.accent, borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} /></div>}
            {breachRes && (
              <div style={{ padding: 20, background: breachRes.safe ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${breachRes.safe ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`, borderRadius: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: breachRes.safe ? "#22c55e" : T.red }}>{breachRes.safe ? "ALL CLEAR" : `${breachRes.breaches} BREACHES`}</div>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{breachRes.safe ? "No compromises found. Continue using strong, unique passwords." : "Your credentials may be exposed. Change passwords and enable 2FA immediately."}</p>
              </div>
            )}
          </Card>
        </Reveal>

        {/* Safety Score */}
        <Reveal delay={0.2}>
          <Card style={{ height: "100%", padding: 36 }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.cyan}0a`, border: `1px solid ${T.cyan}15`, display: "flex", alignItems: "center", justifyContent: "center", color: T.cyan, fontSize: 18 }}>&#9670;</div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: T.white, margin: 0 }}>Cyber Safety Score</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, margin: 0 }}>Quick security posture assessment</p>
              </div>
            </div>
            {score === null ? (
              <>
                {questions.map(q => (
                  <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.white, fontSize: 14, fontWeight: 500 }}>{q.q}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[true, false].map(v => (
                        <button key={String(v)} onClick={() => setAnswers({ ...answers, [q.id]: v })}
                          style={{ padding: "6px 14px", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, background: answers[q.id] === v ? T.accentDim : "transparent", border: `1px solid ${answers[q.id] === v ? T.accentMed : T.border}`, color: answers[q.id] === v ? T.accent : T.muted, cursor: "pointer", transition: "all 0.25s" }}>
                          {v ? "Yes" : "No"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: "center", marginTop: 24 }}><Btn primary onClick={calcScore}>Run Diagnostic</Btn></div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={scoreColor} strokeWidth="6" strokeDasharray={`${(score / 100) * 377} 377`} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }} />
                  <text x="70" y="65" textAnchor="middle" fontFamily="var(--font-display)" fontSize="34" fontWeight="800" fill={scoreColor}>{score}</text>
                  <text x="70" y="85" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill={T.muted} letterSpacing="2">OUT OF 100</text>
                </svg>
                <p style={{ color: T.muted, marginTop: 12, lineHeight: 1.6, fontSize: 14 }}>
                  {score >= 75 ? "Excellent security posture." : score >= 50 ? "Moderate risk — room for improvement." : "High vulnerability detected. Take action now."}
                </p>
                <Btn onClick={() => { setScore(null); setAnswers({}); }} style={{ marginTop: 16 }}>Reset</Btn>
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </Section>
  );
};

/* ── EMERGENCY PROTOCOLS ── */
const Emergency = () => {
  const [open, setOpen] = useState(null);
  const protocols = [
    { code: "ALPHA", title: "Bank Fraud Recovery", steps: ["Freeze accounts immediately via your bank's emergency line.", "Document all unauthorized transactions with screenshots.", "File a police report and retain the reference number.", "Enable real-time transaction alerts going forward."], color: T.red },
    { code: "BRAVO", title: "Account Takeover Response", steps: ["Initiate password recovery on the affected platform.", "Revoke sessions from all unknown devices.", "Enable two-factor authentication once access is restored.", "Alert contacts about potential impersonation."], color: T.ember },
    { code: "CHARLIE", title: "Phishing Incident", steps: ["Do not interact further with the suspicious content.", "Change credentials for any exposed accounts.", "Run a comprehensive device security scan.", "Report the phishing attempt to your email provider."], color: T.gold },
  ];
  return (
    <Section>
      <Reveal><SectionHeader badge="Emergency Response" title="Incident Recovery Protocols" subtitle="Immediate, step-by-step action guides when security incidents happen." /></Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto" }}>
        {protocols.map((p, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card style={{ cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: p.color, background: `${p.color}0a`, padding: "5px 12px", borderRadius: 6, fontWeight: 700 }}>{p.code}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: T.white, margin: 0, flex: 1 }}>{p.title}</h3>
                <span style={{ color: T.accent, fontSize: 18, transition: "transform 0.4s ease", transform: open === i ? "rotate(45deg)" : "none", fontWeight: 300 }}>+</span>
              </div>
              {open === i && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                  {p.steps.map((s, j) => (
                    <div key={j} style={{ display: "flex", gap: 14, padding: "12px 0" }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: T.cyan, fontSize: 12, flexShrink: 0, fontWeight: 600 }}>0{j + 1}</span>
                      <span style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── WHO IT'S FOR ── */
const Audience = () => {
  const groups = [
    { title: "Students", icon: "\uD83C\uDF93", desc: "Defense against scholarship scams, fake job postings, and social media exploitation.", features: ["Social media monitoring", "Scholarship scam detection", "Safe browsing alerts"] },
    { title: "Families", icon: "\uD83C\uDFE0", desc: "Household-wide protection with shared dashboards, parental controls, and family alerts.", features: ["Parental controls", "Shared dashboard", "Family alert system"] },
    { title: "Seniors", icon: "\uD83D\uDEE1\uFE0F", desc: "Clear, simple defense against phone scams, phishing, and financial fraud targeting elderly users.", features: ["Phone scam detection", "Simple interface", "Financial fraud alerts"] },
    { title: "Small Business", icon: "\uD83D\uDCBC", desc: "Enterprise-grade security without the enterprise complexity or cost. Built for growing teams.", features: ["Employee protection", "Data leak prevention", "Compliance tools"] },
  ];

  return (
    <Section>
      <Reveal><SectionHeader badge="Built For" title={<>Protection for <GradientText>Everyone</GradientText></>} subtitle="Security designed for real people, not just IT departments." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 }}>
        {groups.map((g, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <Card style={{ height: "100%", padding: "36px 28px" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{g.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 10px" }}>{g.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{g.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.cyan, fontSize: 12, fontWeight: 700 }}>&#10003;</span>
                    <span style={{ fontSize: 13, color: T.mutedDark }}>{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── AI CHAT ASSISTANT ── */
const AssistantSection = () => {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "SECUVION AI online. I can help assess threats, guide incident response, or answer any cybersecurity question. How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim(); setMsgs(p => [...p, { role: "user", text: q }]); setInput("");
    setTimeout(() => {
      const lc = q.toLowerCase();
      let r = "Good practice: never share personal info with unverified sources, use unique passwords, and enable two-factor authentication on all accounts.";
      if (lc.includes("scam") || lc.includes("fake")) r = "To verify a potential scam: check for urgency tactics, spelling errors, and suspicious URLs. Use our Threat Analyzer to scan any link instantly.";
      else if (lc.includes("hack")) r = "Immediate steps: change all passwords, enable MFA, check for unauthorized access, and review connected apps. If financial data was exposed, contact your bank.";
      else if (lc.includes("phish")) r = "Phishing red flags: misspelled domains, generic greetings, urgent requests for credentials. Never click links in unexpected emails.";
      else if (lc.includes("password")) r = "Use 12+ character passwords mixing letters, numbers, and symbols. Consider a password manager like 1Password or Bitwarden.";
      setMsgs(p => [...p, { role: "ai", text: r }]);
    }, 1000);
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  return (
    <Section>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="assistant-grid">
        <Reveal>
          <div>
            <Badge>AI Assistant</Badge>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 700, color: T.white, margin: "16px 0 20px", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
              Your Personal<br /><GradientText>Cyber Advisor</GradientText>
            </h2>
            <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
              Ask anything about online safety and get instant, expert-level guidance. Powered by AI trained on millions of cybersecurity scenarios.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Is this a scam?", "I was hacked", "Password tips", "Phishing help"].map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }}
                  style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.12)`, color: T.muted, fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.target.style.background = "rgba(99,102,241,0.12)"; e.target.style.color = T.white; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(99,102,241,0.06)"; e.target.style.color = T.muted; }}
                >{q}</button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} direction="right">
          <Card style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, fontWeight: 600 }}>Secuvion AI</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ height: 300, overflowY: "auto", marginBottom: 16 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "fadeIn 0.4s ease" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: m.role === "ai" ? "rgba(99,102,241,0.1)" : "rgba(148,163,184,0.08)", fontSize: 11, fontFamily: "var(--font-body)", color: m.role === "ai" ? T.accent : T.muted, fontWeight: 600 }}>
                      {m.role === "ai" ? "AI" : "U"}
                    </div>
                    <div style={{ maxWidth: "78%", padding: "14px 18px", background: m.role === "user" ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.015)", border: `1px solid ${m.role === "user" ? "rgba(99,102,241,0.08)" : T.border}`, borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 14, color: T.white, lineHeight: 1.7 }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about cybersecurity..."
                  onKeyDown={e => e.key === "Enter" && send()}
                  style={{ flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, color: T.white, fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(148,163,184,0.1)"} />
                <Btn primary onClick={send}>Send</Btn>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
};

/* ── PRICING ── */
const PricingSection = () => {
  const plans = [
    { name: "RECON", tier: "Free", price: "$0", sub: "forever", features: ["Basic fraud detection", "Security advisories", "Email breach check", "Community reports", "Education access"], accent: T.mutedDark },
    { name: "SENTINEL", tier: "Professional", price: "$29", sub: "/mo", features: ["Everything in Free", "AI real-time monitoring", "Device protection (5)", "Phishing alerts", "Priority response", "Safety score tracking"], accent: T.cyan, featured: true },
    { name: "FORTRESS", tier: "Enterprise", price: "$79", sub: "/mo", features: ["Everything in Professional", "Identity monitoring", "Dark web surveillance", "Family/team protection", "Incident recovery ops", "Dedicated analyst"], accent: T.ember },
  ];

  return (
    <Section id="pricing">
      <Reveal><SectionHeader badge="Pricing" title={<>Simple, Transparent <GradientText>Pricing</GradientText></>} subtitle="World-class protection at prices built for real people. No hidden fees." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto", alignItems: "stretch" }}>
        {plans.map((p, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div className="pricing-card" style={{
              background: p.featured ? "linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(17,24,39,0.9) 40%)" : T.card,
              backdropFilter: "blur(16px)", border: `1px solid ${p.featured ? "rgba(99,102,241,0.2)" : T.border}`,
              padding: "40px 32px", borderRadius: 18, position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
              transform: p.featured ? "scale(1.03)" : "scale(1)", transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: p.featured ? "0 20px 60px rgba(0,0,0,0.35)" : "0 2px 12px rgba(0,0,0,0.1)",
            }}>
              {p.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)" }} />}
              {p.featured && <div style={{ position: "absolute", top: 16, right: 16 }}><Badge color={T.accent}>Most Popular</Badge></div>}
              <Badge color={p.accent}>{p.name}</Badge>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: T.white, margin: "18px 0", letterSpacing: "-0.02em" }}>{p.tier}</h3>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: p.accent, letterSpacing: "-0.04em", marginBottom: 8 }}>
                {p.price}<span style={{ fontSize: 16, fontWeight: 400, color: T.mutedDark, marginLeft: 2 }}>{p.sub}</span>
              </div>
              <div style={{ margin: "24px 0", flex: 1 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: p.accent, fontSize: 11, fontWeight: 700 }}>&#10003;</span>
                    <span style={{ color: T.muted, fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn primary={p.featured} to={p.price === "$0" ? "/signup" : `/checkout?plan=${p.tier.toLowerCase()}`} style={{ width: "100%", justifyContent: "center" }}>
                {p.price === "$0" ? "Get Started Free" : "Start Protection"}
              </Btn>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── EDUCATION MODULES ── */
const Education = () => {
  const modules = [
    { title: "Phishing Detection", time: "5 min", tag: "ESSENTIAL", color: T.red },
    { title: "How Scams Work", time: "7 min", tag: "FUNDAMENTALS", color: T.blue },
    { title: "Bank Account Safety", time: "6 min", tag: "FINANCE", color: T.gold },
    { title: "Post-Breach Actions", time: "4 min", tag: "EMERGENCY", color: T.ember },
    { title: "Social Media Privacy", time: "5 min", tag: "PRIVACY", color: T.purple },
    { title: "Password Mastery", time: "3 min", tag: "FUNDAMENTALS", color: T.cyan },
  ];

  return (
    <Section id="education">
      <Reveal><SectionHeader badge="Learn" title="Knowledge Base" subtitle="Concise, jargon-free guides to upgrade your digital literacy." /></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 920, margin: "0 auto" }}>
        {modules.map((m, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <Badge color={m.color}>{m.tag}</Badge>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: T.mutedDark }}>{m.time}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: T.white, margin: 0 }}>{m.title}</h3>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

/* ── FOUNDER ── */
const FounderSection = () => (
  <Section>
    <Reveal>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Badge color={T.mutedDark}>Our Story</Badge>
        <div style={{ marginTop: 36, background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "clamp(32px, 4vw, 56px)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 36, alignItems: "start" }} className="founder-grid">
            <div style={{ width: 100, height: 100, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, color: T.white, opacity: 0.9 }}>S</span>
            </div>
            <div>
              <Badge color={T.accent}>Founder & CEO</Badge>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: T.white, margin: "12px 0 20px", letterSpacing: "-0.03em" }}>Sahil Anil Nikam</h3>
              <blockquote style={{ fontFamily: "var(--font-body)", fontSize: 17, color: T.white, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 20px", opacity: 0.8, borderLeft: `3px solid ${T.accent}`, paddingLeft: 20 }}>
                "The digital world connects billions of people, but it also exposes them to invisible threats. I created Secuvion because cybersecurity shouldn't be a luxury — it should be a right."
              </blockquote>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
                Most cybersecurity platforms focus exclusively on enterprise clients, leaving billions of everyday users exposed. Secuvion was built to change that — creating a global defense network for students, families, and small businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  </Section>
);

/* ── CTA BANNER ── */
const CTABanner = () => (
  <div style={{ padding: "0 clamp(24px, 5vw, 80px)", marginBottom: 80 }}>
    <Reveal>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 64px)", borderRadius: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(20,227,197,0.04) 100%)", border: `1px solid rgba(99,102,241,0.12)`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, color: T.white, margin: "0 0 16px", letterSpacing: "-0.03em", position: "relative" }}>
          Ready to Secure Your <GradientText>Digital Life</GradientText>?
        </h2>
        <p style={{ fontFamily: "var(--font-body)", color: T.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px", position: "relative" }}>
          Join over 1.2 million users who trust Secuvion to protect their digital presence. Start free, upgrade anytime.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
          <Btn primary to="/signup" icon="&#9889;">Start Free Protection</Btn>
          <Btn to="/pricing">View Plans</Btn>
        </div>
      </div>
    </Reveal>
  </div>
);

/* ── FOOTER ── */
const Footer = () => (
  <footer style={{ borderTop: `1px solid ${T.border}`, padding: "80px clamp(24px, 5vw, 80px) 48px", background: "linear-gradient(180deg, transparent 0%, rgba(20,227,197,0.01) 100%)", position: "relative" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: "clamp(32px, 4vw, 60px)", alignItems: "start" }} className="footer-grid">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <BrandIcon size={38} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 3, color: T.white, fontWeight: 700 }}>SECUVION</span>
        </div>
        <p style={{ fontFamily: "var(--font-body)", color: T.mutedDark, fontSize: 14, lineHeight: 1.8, marginBottom: 20, maxWidth: 240 }}>
          AI-powered cyber defense for everyone. Enterprise security made accessible.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {["X", "GH", "LI"].map((s, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.mutedDark, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; e.currentTarget.style.color = T.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.mutedDark; }}
            >{s}</div>
          ))}
        </div>
      </div>
      {[
        { t: "Platform", l: [{ label: "Features", to: "/#features" }, { label: "Pricing", to: "/pricing" }, { label: "Dashboard", to: "/dashboard" }, { label: "Analyzer", to: "/fraud-analyzer" }] },
        { t: "Company", l: [{ label: "About", to: "/founder" }, { label: "Founder", to: "/founder" }, { label: "Threat Map", to: "/threat-map" }, { label: "Contact", to: "/emergency-help" }] },
        { t: "Resources", l: [{ label: "Learn", to: "/learn" }, { label: "Scam Database", to: "/scam-database" }, { label: "Security Score", to: "/security-score" }, { label: "Emergency Help", to: "/emergency-help" }] },
        { t: "Legal", l: [{ label: "Privacy Policy", to: "/pricing" }, { label: "Terms of Service", to: "/pricing" }, { label: "Login", to: "/login" }, { label: "Sign Up", to: "/signup" }] },
      ].map((c, i) => (
        <div key={i}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.white, marginBottom: 18, fontWeight: 600 }}>{c.t}</div>
          {c.l.map((l, j) => (
            <Link key={j} to={l.to} style={{ display: "block", color: T.mutedDark, fontSize: 14, padding: "7px 0", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.color = T.white; e.target.style.transform = "translateX(4px)"; }}
              onMouseLeave={e => { e.target.style.color = T.mutedDark; e.target.style.transform = "translateX(0)"; }}
            >{l.label}</Link>
          ))}
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 1280, margin: "60px auto 0", paddingTop: 28, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark }}>&copy; 2026 Secuvion. Founded by Sahil Anil Nikam. All rights reserved.</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: T.mutedDark, fontStyle: "italic" }}>Click with care, we are always there.</span>
    </div>
  </footer>
);

/* ══════════════════════════════
   MAIN APP
   ══════════════════════════════ */
export default function SecuvionV2() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); const t = setTimeout(() => setPageReady(true), 150); return () => clearTimeout(t); }, []);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 60); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); setMenuOpen(false); };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Threats", id: "threats" },
    { label: "Education", id: "education" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <div style={{ background: T.bg, color: T.white, minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --font-display: 'Space Grotesk', 'Outfit', -apple-system, sans-serif;
  --font-body: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; }
body { max-width: 1900px; margin: auto; }
::selection { background: rgba(99,102,241,0.3); color: #fff; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 10px; }
html { scroll-behavior: smooth; }

@keyframes spin { to { transform: rotate(360deg) } }
@keyframes pulse-dot { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes brand-orbit-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes brand-orbit-ring2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes status-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); } }
@keyframes card-enter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.nav-link-animated { position: relative; }
.nav-link-animated::after {
  content: ""; position: absolute; bottom: 0; left: 50%; width: 0; height: 1.5px;
  background: #6366f1; transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); transform: translateX(-50%); border-radius: 1px;
}
.nav-link-animated:hover::after { width: 100%; }

.pricing-card:hover {
  transform: scale(1.03) translateY(-6px) !important;
  box-shadow: 0 24px 70px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.08) !important;
  border-color: rgba(99,102,241,0.2) !important;
}

input:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }

.section-divider {
  height: 1px; width: 50%; margin: 0 auto;
  background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 20%, rgba(148,163,184,0.08) 50%, rgba(99,102,241,0.08) 80%, transparent 100%);
}

@media (max-width: 860px) {
  .threat-map-grid { grid-template-columns: 1fr !important; }
  .threat-map-grid > div:nth-child(1) { order: 2; }
  .threat-map-grid > div:nth-child(2) { min-height: 400px !important; order: 1; }
  .threat-map-grid > div:nth-child(3) { order: 3; }
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
  .hero-grid > div:last-child { max-width: 400px !important; margin: 0 auto !important; }
  .hero-globe > div[style*="absolute"] { display: none !important; }
  .analyzer-grid { grid-template-columns: 1fr !important; }
  .assistant-grid { grid-template-columns: 1fr !important; }
  .tools-grid { grid-template-columns: 1fr !important; }
  .footer-grid { grid-template-columns: 1fr 1fr !important; }
}

@media (max-width: 768px) {
  .nav-links-desktop { display: none !important; }
  .nav-burger { display: flex !important; }
  .founder-grid { grid-template-columns: 1fr !important; }
  .how-connector { display: none !important; }
}

@media (min-width: 769px) {
  .nav-burger { display: none !important; }
}
      `}</style>

      <ParticleField />

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(24px, 5vw, 80px)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,7,18,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: pageReady ? 1 : 0, transform: pageReady ? "translateY(0)" : "translateY(-20px)",
      }}>
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <BrandIcon size={38} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 3, color: T.white, fontWeight: 700 }}>SECUVION</span>
        </div>
        <div className="nav-links-desktop" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(l => (
            <span key={l.id} onClick={() => scrollTo(l.id)} className="nav-link-animated"
              style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: T.mutedDark, cursor: "pointer", transition: "color 0.3s", position: "relative", padding: "4px 0" }}
              onMouseEnter={e => e.target.style.color = T.white}
              onMouseLeave={e => e.target.style.color = T.mutedDark}>{l.label}</span>
          ))}
          {user ? (
            <Btn primary to="/dashboard" style={{ padding: "9px 22px", fontSize: 13 }}>Dashboard</Btn>
          ) : (
            <>
              <Btn to="/login" style={{ padding: "9px 22px", fontSize: 13 }}>Login</Btn>
              <Btn primary to="/signup" style={{ padding: "9px 22px", fontSize: 13 }}>Sign Up</Btn>
            </>
          )}
        </div>
        <div className="nav-burger" style={{ flexDirection: "column", gap: 5, cursor: "pointer", padding: 8 }} onClick={() => setMenuOpen(!menuOpen)}>
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 99, background: "rgba(3,7,18,0.95)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", padding: "48px clamp(24px, 5vw, 80px)", animation: "fadeIn 0.4s ease" }}>
          {navLinks.map((l, i) => (
            <div key={l.id} onClick={() => scrollTo(l.id)}
              style={{ padding: "22px 0", borderBottom: `1px solid ${T.border}`, fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: T.white, cursor: "pointer", letterSpacing: "-0.03em", opacity: 0, animation: `card-enter 0.5s ease forwards ${i * 0.08}s` }}>
              {l.label}
            </div>
          ))}
          <div style={{ marginTop: 40, opacity: 0, animation: `card-enter 0.5s ease forwards ${navLinks.length * 0.08}s`, display: "flex", flexDirection: "column", gap: 12 }}>
            {user ? (
              <Btn primary to="/dashboard" style={{ width: "100%", justifyContent: "center" }}>Dashboard</Btn>
            ) : (
              <>
                <Btn to="/login" style={{ width: "100%", justifyContent: "center" }}>Login</Btn>
                <Btn primary to="/signup" style={{ width: "100%", justifyContent: "center" }}>Sign Up</Btn>
              </>
            )}
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={{ position: "relative", zIndex: 2, opacity: pageReady ? 1 : 0, transform: pageReady ? "translateY(0)" : "translateY(30px)", transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <Hero />
        <TrustedBy />
        <Features />
        <div className="section-divider" />
        <HowItWorks />
        <div className="section-divider" />
        <Analyzer />
        <div className="section-divider" />
        <ThreatMapSection />
        <BigNumbers />
        <SecurityTools />
        <div className="section-divider" />
        <Emergency />
        <div className="section-divider" />
        <Audience />
        <div className="section-divider" />
        <AssistantSection />
        <div className="section-divider" />
        <Education />
        <div className="section-divider" />
        <PricingSection />
        <div className="section-divider" />
        <FounderSection />
        <CTABanner />
        <Footer />
      </div>
    </div>
  );
}
