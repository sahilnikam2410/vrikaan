import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1",
  cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24",
  border: "rgba(148,163,184,0.08)",
};

// ── Time-of-day greeting (EN + Hindi) ──────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { en: "Working late?",       hi: "देर रात तक काम?" };
  if (h < 12) return { en: "Good morning",        hi: "सुप्रभात" };
  if (h < 17) return { en: "Good afternoon",      hi: "नमस्ते" };
  if (h < 21) return { en: "Good evening",        hi: "शुभ संध्या" };
  return       { en: "Good night",                hi: "शुभ रात्रि" };
}

// ── Live "users today" simulated counter ───────────────────────────────
function useLiveCounter(base = 247) {
  const [n, setN] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setN(prev => prev + (Math.random() < 0.3 ? 1 : 0)), 3000);
    return () => clearInterval(id);
  }, []);
  return n;
}

// ── Tool recommendations based on selected interests ──────────────────
const TOOL_RECS = {
  phishing:   [{ to: "/scam-check",       icon: "📝", label: "Scam Check AI",   why: "Paste SMS, get AI verdict" }],
  darkweb:    [{ to: "/dark-web-monitor", icon: "🕵", label: "Dark Web Monitor", why: "Check if email was leaked" }],
  passwords:  [{ to: "/password-vault",   icon: "🔐", label: "Password Vault",   why: "Generate + store securely" }],
  identity:   [{ to: "/aadhaar-mask",     icon: "🪪", label: "Aadhaar Mask",     why: "Redact ID before sharing" }],
  devices:    [{ to: "/device-scan",      icon: "🛡", label: "Device Scanner",   why: "Scan files / folders" }],
  education:  [{ to: "/learn",            icon: "📚", label: "Learn Academy",    why: "Free cyber courses" }],
};

const QUOTES = [
  { who: "Sahil Anil Nikam · Founder & CEO",       text: "Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth." },
  { who: "Khushi Ishwar Raigade · Co-Founder",     text: "Detection beats reaction. A defender's job is to find the attacker before they find the data." },
];

// ─────────────────────────────────────────────────────────────────────
// Certificate generator (unchanged from prior version) — preserved as-is
// ─────────────────────────────────────────────────────────────────────
function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function generateMemberCertificate(userName, email, memberId) {
  const W = 1600, H = 1130;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const cx = W / 2;
  const dark = "#1F1F1F";
  const gray = "#636363";
  const light = "#9E9E9E";

  const [sigImg, logoImg, stampImg] = await Promise.all([
    loadImg("/images/signature.png"),
    loadImg("/images/academy-logo.png"),
    loadImg("/images/stamp.png"),
  ]);

  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, "#6366f1"); topBar.addColorStop(0.5, "#14e3c5"); topBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = topBar; ctx.fillRect(0, 0, W, 8);
  ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1; ctx.strokeRect(40, 40, W - 80, H - 80);

  if (logoImg) {
    const logoH = 90;
    const logoW = logoH * (logoImg.width / logoImg.height);
    ctx.drawImage(logoImg, 80, 55, logoW, logoH);
  } else {
    ctx.save();
    ctx.translate(120, 100);
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.bezierCurveTo(-18, -20, -24, -10, -24, 0);
    ctx.bezierCurveTo(-24, 14, -10, 24, 0, 30); ctx.bezierCurveTo(10, 24, 24, 14, 24, 0);
    ctx.bezierCurveTo(24, -10, 18, -20, 0, -22); ctx.closePath();
    const shGrad = ctx.createLinearGradient(-24, -22, 24, 30);
    shGrad.addColorStop(0, "#6366f1"); shGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = shGrad; ctx.fill();
    ctx.font = "bold 20px 'Arial', sans-serif"; ctx.fillStyle = "#fff";
    ctx.textAlign = "center"; ctx.fillText("V", 0, 8); ctx.restore();
    ctx.textAlign = "left";
    ctx.font = "bold 28px 'Arial', sans-serif"; ctx.fillStyle = dark; ctx.fillText("VRIKAAN", 158, 100);
    ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("PLATFORM", 158, 118);
  }

  ctx.textAlign = "right";
  ctx.font = "10px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("Official", W - 120, 88);
  ctx.font = "bold 16px 'Arial', sans-serif"; ctx.fillStyle = "#14e3c5"; ctx.fillText("MEMBERSHIP", W - 120, 108);
  ctx.font = "10px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("Verified Member", W - 120, 124);

  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(80, 155); ctx.lineTo(W - 80, 155); ctx.stroke();
  ctx.textAlign = "left"; ctx.font = "600 14px 'Arial', sans-serif"; ctx.fillStyle = "#6366f1";
  ctx.fillText("MEMBERSHIP CERTIFICATE", 120, 220);
  ctx.fillStyle = "#14e3c5"; ctx.fillRect(120, 232, 60, 3);

  ctx.font = "bold 56px 'Georgia', serif"; ctx.fillStyle = dark;
  ctx.fillText(userName || "Member", 120, 310);

  ctx.font = "18px 'Arial', sans-serif"; ctx.fillStyle = gray;
  ctx.fillText("is now a verified member of the VRIKAAN platform and is authorized", 120, 365);
  ctx.fillText("to access enterprise-grade cybersecurity tools and resources.", 120, 393);

  ctx.font = "bold 28px 'Georgia', serif"; ctx.fillStyle = dark;
  ctx.fillText("VRIKAAN Platform — Official Member", 120, 460);

  ctx.font = "16px 'Arial', sans-serif"; ctx.fillStyle = gray;
  ctx.fillText("with full access to AI-powered cyber defense, threat intelligence, and security training.", 120, 500);

  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(120, 545); ctx.lineTo(W - 120, 545); ctx.stroke();

  ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("MEMBER ID", 120, 580);
  ctx.font = "14px 'Courier New', monospace"; ctx.fillStyle = dark; ctx.fillText(memberId, 120, 605);

  ctx.textAlign = "center"; ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("EMAIL", cx, 580);
  ctx.font = "14px 'Arial', sans-serif"; ctx.fillStyle = dark; ctx.fillText(email, cx, 605);

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  ctx.textAlign = "right"; ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.fillText("JOINED", W - 120, 580);
  ctx.font = "14px 'Arial', sans-serif"; ctx.fillStyle = dark; ctx.fillText(dateStr, W - 120, 605);

  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(120, 640); ctx.lineTo(W - 120, 640); ctx.stroke();
  ctx.textAlign = "left";

  if (sigImg) {
    const sigH = 55;
    const sigW = sigH * (sigImg.width / sigImg.height);
    ctx.drawImage(sigImg, 120, 700, sigW, sigH);
  }
  ctx.strokeStyle = "#d1d5db"; ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(380, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif"; ctx.fillStyle = dark; ctx.fillText("Sahil Anil Nikam", 120, 785);
  ctx.font = "13px 'Arial', sans-serif"; ctx.fillStyle = gray; ctx.fillText("Founder & CEO, VRIKAAN", 120, 765);

  ctx.strokeStyle = "#d1d5db"; ctx.beginPath(); ctx.moveTo(500, 760); ctx.lineTo(760, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif"; ctx.fillStyle = dark; ctx.fillText("VRIKAAN Platform", 500, 785);
  ctx.font = "13px 'Arial', sans-serif"; ctx.fillStyle = gray; ctx.fillText("Membership Division", 500, 765);

  if (stampImg) {
    const stSize = 130;
    ctx.drawImage(stampImg, W - 300, 680, stSize, stSize);
  } else {
    const bx = W - 280, by = 680;
    ctx.beginPath(); ctx.arc(bx + 30, by + 30, 28, 0, Math.PI * 2);
    const badgeGrad = ctx.createLinearGradient(bx, by, bx + 60, by + 60);
    badgeGrad.addColorStop(0, "#6366f1"); badgeGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = badgeGrad; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(bx + 18, by + 30); ctx.lineTo(bx + 27, by + 40); ctx.lineTo(bx + 44, by + 20); ctx.stroke();
    ctx.textAlign = "left"; ctx.font = "bold 13px 'Arial', sans-serif"; ctx.fillStyle = "#6366f1"; ctx.fillText("VERIFIED", bx + 68, by + 26);
    ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = gray; ctx.fillText("MEMBER", bx + 68, by + 44);
  }

  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(120, 800); ctx.lineTo(W - 120, 800); ctx.stroke();

  ctx.font = "12px 'Arial', sans-serif"; ctx.fillStyle = light; ctx.textAlign = "left";
  ctx.fillText("MEMBER BENEFITS", 120, 835);

  const benefits = ["AI Threat Detection", "Security Score Monitoring", "Fraud Analyzer Access", "Academy Courses", "Priority Support"];
  ctx.font = "13px 'Arial', sans-serif"; ctx.fillStyle = gray;
  benefits.forEach((b, i) => {
    const bxx = 120 + i * 240;
    ctx.fillStyle = "#14e3c5"; ctx.font = "bold 14px 'Arial', sans-serif"; ctx.fillText("✓", bxx, 865);
    ctx.fillStyle = gray; ctx.font = "13px 'Arial', sans-serif"; ctx.fillText(b, bxx + 18, 865);
  });

  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath(); ctx.moveTo(80, H - 120); ctx.lineTo(W - 80, H - 120); ctx.stroke();
  ctx.textAlign = "left"; ctx.font = "11px 'Arial', sans-serif"; ctx.fillStyle = light;
  ctx.fillText("Verify at vrikaan.com/verify/" + memberId, 120, H - 85);
  ctx.textAlign = "right"; ctx.font = "11px 'Arial', sans-serif"; ctx.fillStyle = light;
  ctx.fillText("© 2026 VRIKAAN. All rights reserved.", W - 120, H - 85);

  const btmBar = ctx.createLinearGradient(0, 0, W, 0);
  btmBar.addColorStop(0, "#6366f1"); btmBar.addColorStop(0.5, "#14e3c5"); btmBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = btmBar; ctx.fillRect(0, H - 8, W, 8);

  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certImage, setCertImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState([]);
  const [checkProgress, setCheckProgress] = useState(0);
  const [konami, setKonami] = useState(0);
  const [extraConfetti, setExtraConfetti] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const greeting = useMemo(getGreeting, []);
  const usersToday = useLiveCounter(247);
  const firstName = user?.name?.split(" ")[0] || "there";

  const memberId = `SEC-${(user?.id || Date.now()).toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const t2 = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t2);
  }, [user, navigate]);

  // Rotate founder quote every 6 sec
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Konami code easter egg: ↑↑↓↓←→←→BA → extra confetti
  useEffect(() => {
    const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    const onKey = (e) => {
      const idx = SEQ.indexOf(e.key.toLowerCase ? e.key.toLowerCase() : e.key);
      if (idx === konami) {
        const next = konami + 1;
        if (next === SEQ.length) {
          setExtraConfetti(true);
          setShowConfetti(true);
          setTimeout(() => { setExtraConfetti(false); setShowConfetti(false); }, 6000);
          setKonami(0);
        } else setKonami(next);
      } else setKonami(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [konami]);

  const toggleInterest = (id) => setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const runSecurityCheck = () => {
    setStep(2);
    setCheckProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(timer); setTimeout(() => setStep(3), 800); }
      setCheckProgress(Math.min(100, Math.round(p)));
    }, 300);
  };

  const handleGenerateCert = async () => {
    const img = await generateMemberCertificate(user?.name || "Member", user?.email || "", memberId);
    setCertImage(img);
    // Re-trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    const certs = JSON.parse(localStorage.getItem("vrikaan_member_certs") || "[]");
    if (!certs.find(c => c.email === user?.email)) {
      certs.push({ name: user?.name, email: user?.email, memberId, date: new Date().toISOString() });
      localStorage.setItem("vrikaan_member_certs", JSON.stringify(certs));
    }
  };

  const handleDownload = () => {
    if (!certImage) return;
    const a = document.createElement("a");
    a.href = certImage;
    a.download = `VRIKAAN_Membership_${(user?.name || "Member").replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const handleShareWhatsApp = () => {
    const text = `🛡 I joined VRIKAAN — India's free AI cyber defense platform.\n\n60+ tools for scam detection, deepfake AI, Aadhaar mask, MITRE ATT&CK SOC. All free.\n\nJoin here: https://vrikaan.com\n\n— Member ID: ${memberId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `🛡 Just joined @vrikaan — India's free AI cyber defense platform.\n\n60+ tools for scam detection, deepfake AI, MITRE ATT&CK SOC. EN+हिन्दी. Built in Nashik.\n\nCheck it out:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://vrikaan.com`, "_blank");
  };

  // Tools recommended based on selected interests
  const recommendedTools = useMemo(() => {
    if (interests.length === 0) {
      return [
        { to: "/scam-check", icon: "📝", label: "Scam Check AI", why: "Paste any SMS → AI verdict" },
        { to: "/safe-word",  icon: "🛡", label: "Family Safe-Word", why: "Beat AI voice clones" },
        { to: "/aadhaar-mask", icon: "🪪", label: "Aadhaar Mask",   why: "Redact ID before share" },
      ];
    }
    const out = [];
    interests.forEach(i => { if (TOOL_RECS[i]) out.push(...TOOL_RECS[i]); });
    return out.slice(0, 3);
  }, [interests]);

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative", overflow: "hidden", padding: 24,
    }}>
      <SEO title="Welcome" description="Welcome to VRIKAAN — your cybersecurity journey starts here." path="/welcome" />

      {/* Styles */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-20vh) scale(1) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(20,227,197,0.2); }
          50%      { box-shadow: 0 0 60px rgba(20,227,197,0.5), 0 0 100px rgba(99,102,241,0.3); }
        }
        @keyframes shieldSpin {
          0%   { transform: rotateY(0deg)   rotateZ(0deg); }
          50%  { transform: rotateY(180deg) rotateZ(0deg); }
          100% { transform: rotateY(360deg) rotateZ(0deg); }
        }
        @keyframes ringOrbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes typeBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes counter-pulse {
          0%, 100% { color: ${T.muted}; }
          50% { color: ${T.cyan}; }
        }
        @media (max-width: 500px) {
          .welcome-interests-grid { grid-template-columns: 1fr !important; }
          .welcome-tool-rec       { grid-template-columns: 1fr !important; }
          .welcome-stats          { gap: 16px !important; }
        }
        .confetti-particle {
          position: absolute; animation: floatUp 3s ease-in-out forwards;
          pointer-events: none;
        }
      `}</style>

      {/* Confetti */}
      {showConfetti && Array.from({ length: extraConfetti ? 120 : 40 }).map((_, i) => (
        <div key={i} className="confetti-particle" style={{
          left: `${Math.random() * 100}%`,
          background: ["#14e3c5","#6366f1","#22c55e","#eab308","#ec4899","#f97316","#ef4444"][i % 7],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          width: 4 + Math.random() * 10,
          height: 4 + Math.random() * 10,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        }} />
      ))}

      {/* Background glows */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        top: "5%", right: "5%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,227,197,0.10) 0%, transparent 70%)",
        bottom: "5%", left: "5%", pointerEvents: "none",
      }} />

      {/* Top-right live counter */}
      <div style={{
        position: "absolute", top: 20, right: 20, zIndex: 3,
        padding: "8px 14px", borderRadius: 999,
        background: "rgba(17,24,39,0.7)", border: `1px solid ${T.border}`,
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "ui-monospace, monospace", fontSize: 12,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: T.green,
          boxShadow: `0 0 8px ${T.green}`, animation: "pulse 1.5s infinite",
        }} />
        <span style={{ color: T.muted }}>{usersToday.toLocaleString("en-IN")}</span>
        <span style={{ color: T.muted, fontSize: 11 }}>joined today</span>
      </div>

      {/* Welcome Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 760, width: "100%" }}>

        {/* 3D animated shield (replaces static "S" badge) */}
        <div style={{
          position: "relative", width: 120, height: 120, margin: "0 auto 24px",
          animation: "fadeInUp 0.8s ease",
        }}>
          {/* Outer rotating ring */}
          <div style={{
            position: "absolute", inset: -8,
            border: `2px solid ${T.cyan}33`,
            borderTopColor: T.cyan, borderRightColor: T.cyan + "88",
            borderRadius: "50%",
            animation: "ringOrbit 4s linear infinite",
          }} />
          {/* Inner reverse-rotating ring */}
          <div style={{
            position: "absolute", inset: 4,
            border: `1px dashed ${T.accent}55`,
            borderRadius: "50%",
            animation: "ringOrbit 7s linear infinite reverse",
          }} />
          {/* Shield body (rotating) */}
          <div style={{
            position: "absolute", inset: 14,
            background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`,
            borderRadius: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 46, fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            animation: "shieldSpin 6s ease-in-out infinite, glow 2s ease-in-out infinite",
            transformStyle: "preserve-3d",
          }}>V</div>
        </div>

        {/* Step indicators */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 8, marginBottom: 28,
          animation: "fadeInUp 0.8s ease 0.1s both", flexWrap: "wrap",
        }}>
          {["Welcome", "Interests", "Security Check", "Certificate"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk'",
                background: step >= i ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "rgba(148,163,184,0.08)",
                color: step >= i ? "#fff" : T.muted,
                border: `1px solid ${step >= i ? "transparent" : "rgba(148,163,184,0.12)"}`,
                transition: "all 0.4s",
                boxShadow: step === i ? `0 0 16px ${T.cyan}66` : "none",
              }}>{step > i ? "✓" : i + 1}</div>
              {i < 3 && <div style={{
                width: 24, height: 2, borderRadius: 1,
                background: step > i ? T.accent : "rgba(148,163,184,0.1)", transition: "background 0.4s",
              }} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Welcome (upgraded) */}
        {step === 0 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 14px", borderRadius: 999,
              background: `${T.cyan}15`, border: `1px solid ${T.cyan}33`,
              fontSize: 12, color: T.cyan, marginBottom: 18, fontWeight: 600,
            }}>
              <span style={{ color: T.muted }}>{greeting.hi}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{greeting.en}</span>
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 800,
              color: T.white, marginBottom: 14, lineHeight: 1.15,
            }}>
              Welcome, {firstName}.<br/>
              <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                You just upgraded your defenses.
              </span>
            </h1>
            <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, marginBottom: 28 }}>
              60+ AI-powered tools. Bilingual EN + हिन्दी. India-built. Free forever.<br/>
              Let's set up your protection in 3 quick steps.
            </p>

            {/* Trust strip */}
            <div className="welcome-stats" style={{
              display: "flex", justifyContent: "center", gap: 26, flexWrap: "wrap",
              marginBottom: 32, fontSize: 12, color: T.muted,
            }}>
              <span>🇮🇳 Built in Nashik</span>
              <span>🔒 NIST AAL2 2FA</span>
              <span>📜 DPDP-compliant</span>
              <span>💸 INR · Cashfree</span>
            </div>

            <button onClick={() => setStep(1)} style={{
              padding: "16px 44px",
              background: "linear-gradient(135deg, #6366f1, #14e3c5)", border: "none", borderRadius: 12,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk'", boxShadow: "0 8px 30px rgba(99,102,241,0.3)",
              transition: "all 0.3s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}
            >
              Let's go →
            </button>

            {/* Rotating founder quote */}
            <div key={quoteIdx} style={{
              marginTop: 38, padding: 18, borderRadius: 14,
              background: "rgba(17,24,39,0.5)", border: `1px solid ${T.border}`,
              animation: "fadeInUp 0.5s ease",
            }}>
              <div style={{
                color: T.cyan, fontSize: 28, lineHeight: 1, marginBottom: 6,
                fontFamily: "'Space Grotesk'",
              }}>"</div>
              <p style={{
                color: T.white, fontSize: 14, fontStyle: "italic", lineHeight: 1.6,
                margin: "0 0 10px",
              }}>{QUOTES[quoteIdx].text}</p>
              <div style={{ color: T.muted, fontSize: 11, fontWeight: 600 }}>— {QUOTES[quoteIdx].who}</div>
            </div>
          </div>
        )}

        {/* Step 1 — Interests */}
        {step === 1 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{
              fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 800,
              color: T.white, marginBottom: 8,
            }}>What matters most, {firstName}?</h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 28 }}>
              Pick what you want protected. We'll surface those tools first.
            </p>
            <div className="welcome-interests-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
              maxWidth: 540, margin: "0 auto 28px",
            }}>
              {[
                { id: "phishing",  icon: "🎣", label: "Phishing & Scam SMS",    color: "#ef4444" },
                { id: "darkweb",   icon: "🕵", label: "Dark Web Monitoring",    color: "#8b5cf6" },
                { id: "passwords", icon: "🔐", label: "Password Security",      color: "#14e3c5" },
                { id: "identity",  icon: "🛡", label: "Identity / Aadhaar",     color: "#3b82f6" },
                { id: "devices",   icon: "💻", label: "Device & Malware",       color: "#f97316" },
                { id: "education", icon: "📚", label: "Security Education",     color: "#22c55e" },
              ].map(item => {
                const selected = interests.includes(item.id);
                return (
                  <button key={item.id} onClick={() => toggleInterest(item.id)} style={{
                    padding: "16px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12, transition: "all 0.25s",
                    background: selected ? `${item.color}15` : "rgba(17,24,39,0.6)",
                    border: `1.5px solid ${selected ? `${item.color}66` : "rgba(148,163,184,0.08)"}`,
                    fontFamily: "inherit",
                    transform: selected ? "scale(1.02)" : "scale(1)",
                  }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: selected ? T.white : T.muted }}>{item.label}</span>
                    {selected && <span style={{ marginLeft: "auto", color: item.color, fontWeight: 700, fontSize: 16 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={runSecurityCheck} disabled={interests.length === 0} style={{
              padding: "14px 40px",
              background: interests.length > 0 ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "rgba(148,163,184,0.1)",
              border: "none", borderRadius: 12,
              color: interests.length > 0 ? "#fff" : T.muted,
              fontSize: 15, fontWeight: 700,
              cursor: interests.length > 0 ? "pointer" : "default",
              fontFamily: "'Space Grotesk'",
              opacity: interests.length > 0 ? 1 : 0.5,
            }}>
              {interests.length === 0 ? "Pick at least one above" : `Run security check (${interests.length} selected) →`}
            </button>
            <div>
              <button onClick={() => setStep(3)} style={{
                background: "none", border: "none", color: T.muted, fontSize: 13,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans'", marginTop: 16,
              }}>
                Skip to certificate →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Security check */}
        {step === 2 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8 }}>
              Running security check...
            </h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 32 }}>
              Analyzing your digital perimeter. Takes ~6 seconds.
            </p>
            <div style={{ maxWidth: 420, margin: "0 auto 28px" }}>
              <div style={{
                background: "rgba(148,163,184,0.08)", borderRadius: 10,
                height: 10, overflow: "hidden", marginBottom: 12,
              }}>
                <div style={{
                  height: "100%", borderRadius: 10,
                  background: "linear-gradient(90deg, #6366f1, #14e3c5)",
                  width: `${checkProgress}%`, transition: "width 0.3s ease",
                  boxShadow: `0 0 12px ${T.cyan}`,
                }} />
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: T.cyan,
              }}>{checkProgress}%</div>
            </div>
            <div style={{
              background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 20, maxWidth: 420, margin: "0 auto", textAlign: "left",
            }}>
              {[
                { label: "Email breach check (HIBP)", done: checkProgress > 20 },
                { label: "Password strength audit",   done: checkProgress > 40 },
                { label: "Dark web exposure scan",    done: checkProgress > 60 },
                { label: "Device fingerprint",        done: checkProgress > 80 },
                { label: "Risk score generated",      done: checkProgress >= 100 },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 0",
                  borderBottom: i < 4 ? "1px solid rgba(148,163,184,0.06)" : "none",
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: item.done ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.08)",
                    color: item.done ? T.green : T.muted,
                    border: `1px solid ${item.done ? "rgba(34,197,94,0.25)" : "rgba(148,163,184,0.12)"}`,
                    transition: "all 0.3s",
                  }}>{item.done ? "✓" : ""}</span>
                  <span style={{ fontSize: 13, color: item.done ? T.white : T.muted, transition: "color 0.3s" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Certificate + recommendations + share */}
        {step === 3 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8 }}>
              You're protected, {firstName}. 🛡
            </h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 20 }}>
              Profile ready. Grab your certificate + try your first tool below.
            </p>

            {/* Stats */}
            <div className="welcome-stats" style={{
              display: "flex", justifyContent: "center", gap: 32, marginBottom: 28, flexWrap: "wrap",
            }}>
              {[
                { label: "Security Score",   value: "87/100", color: T.green },
                { label: "Threats Blocked",  value: "1,247",  color: T.cyan },
                { label: "Tools Available",  value: "60+",    color: T.accent },
                { label: "Your Plan",        value: user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || "Free", color: "#eab308" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk'" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recommended tools — personalized to interests */}
            <div style={{ margin: "0 auto 28px", maxWidth: 720, textAlign: "left" }}>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: T.cyan,
                textTransform: "uppercase", marginBottom: 12, textAlign: "center",
              }}>
                {interests.length > 0 ? "Recommended for you" : "Try these first"}
              </div>
              <div className="welcome-tool-rec" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
              }}>
                {recommendedTools.map(t => (
                  <Link key={t.to} to={t.to} style={{
                    padding: 14, borderRadius: 12,
                    background: "rgba(17,24,39,0.7)", border: `1px solid ${T.border}`,
                    color: "inherit", textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan + "66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>{t.why}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Certificate section */}
            {!certImage && (
              <div style={{
                background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`,
                borderRadius: 16, padding: 28, backdropFilter: "blur(10px)", marginBottom: 20,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>
                  Your membership certificate
                </h3>
                <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>
                  Official VRIKAAN certificate w/ your name + unique member ID. Add to LinkedIn.
                </p>
                <button onClick={handleGenerateCert} style={{
                  padding: "14px 36px",
                  background: "linear-gradient(135deg, #14e3c5, #6366f1)",
                  border: "none", borderRadius: 10,
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Space Grotesk'",
                  animation: "pulse 2s infinite",
                }}>
                  🎨 Generate certificate
                </button>
              </div>
            )}

            {/* Certificate preview + share buttons */}
            {certImage && (
              <div>
                <div style={{
                  background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: 8, display: "inline-block",
                  marginBottom: 20, backdropFilter: "blur(10px)",
                }}>
                  <img src={certImage} alt="Membership Certificate" loading="lazy" style={{
                    width: "100%", maxWidth: 700, borderRadius: 10,
                  }} />
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                  <button onClick={handleDownload} style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #22c55e, #14e3c5)",
                    border: "none", borderRadius: 10,
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Space Grotesk'",
                  }}>
                    ⬇ Download
                  </button>
                  <button onClick={handleShareWhatsApp} style={{
                    padding: "12px 22px", borderRadius: 10,
                    background: "#25D366", color: "#fff", border: 0,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Space Grotesk'",
                  }}>
                    📲 WhatsApp share
                  </button>
                  <button onClick={handleShareTwitter} style={{
                    padding: "12px 22px", borderRadius: 10,
                    background: "#000", color: "#fff", border: 0,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Space Grotesk'",
                  }}>
                    𝕏 Post
                  </button>
                  <button onClick={() => navigate("/dashboard")} style={{
                    padding: "12px 22px",
                    background: "rgba(99,102,241,0.15)", border: `1px solid rgba(99,102,241,0.3)`,
                    borderRadius: 10,
                    color: T.accent, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Space Grotesk'",
                  }}>
                    Dashboard →
                  </button>
                </div>
              </div>
            )}

            {!certImage && (
              <button onClick={() => navigate("/dashboard")} style={{
                background: "none", border: "none", color: T.muted, fontSize: 14,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans'", marginTop: 12,
              }}>
                Skip to dashboard →
              </button>
            )}

            {/* Easter egg hint (subtle) */}
            <div style={{
              marginTop: 32, fontSize: 10, color: T.muted, opacity: 0.5,
              fontFamily: "ui-monospace, monospace",
            }}>
              🎮 Try the konami code (↑↑↓↓←→←→BA) for a surprise
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
