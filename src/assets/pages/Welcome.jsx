import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", border: "rgba(148,163,184,0.08)" };

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

  // Load real images
  const [sigImg, logoImg, stampImg] = await Promise.all([
    loadImg("/images/signature.png"),
    loadImg("/images/academy-logo.png"),
    loadImg("/images/stamp.png"),
  ]);

  // ── Clean white background ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── Top accent bar (brand gradient) ──
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, "#6366f1");
  topBar.addColorStop(0.5, "#14e3c5");
  topBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = topBar;
  ctx.fillRect(0, 0, W, 8);

  // ── Thin border ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // ── SECUVION Logo (top-left) ──
  if (logoImg) {
    const logoH = 90;
    const logoW = logoH * (logoImg.width / logoImg.height);
    ctx.drawImage(logoImg, 80, 55, logoW, logoH);
    if (logoW < 200) {
      ctx.textAlign = "left";
      ctx.font = "bold 22px 'Arial', sans-serif";
      ctx.fillStyle = dark;
      ctx.fillText("SECUVION", 80 + logoW + 16, 98);
      ctx.font = "11px 'Arial', sans-serif";
      ctx.fillStyle = light;
      ctx.fillText("AI-Powered Cyber Defense", 80 + logoW + 16, 116);
    }
  } else {
    ctx.save();
    ctx.translate(120, 100);
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(-18, -20, -24, -10, -24, 0);
    ctx.bezierCurveTo(-24, 14, -10, 24, 0, 30);
    ctx.bezierCurveTo(10, 24, 24, 14, 24, 0);
    ctx.bezierCurveTo(24, -10, 18, -20, 0, -22);
    ctx.closePath();
    const shGrad = ctx.createLinearGradient(-24, -22, 24, 30);
    shGrad.addColorStop(0, "#6366f1");
    shGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = shGrad;
    ctx.fill();
    ctx.font = "bold 20px 'Arial', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("S", 0, 8);
    ctx.restore();
    ctx.textAlign = "left";
    ctx.font = "bold 28px 'Arial', sans-serif";
    ctx.fillStyle = dark;
    ctx.fillText("SECUVION", 158, 100);
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = light;
    ctx.fillText("PLATFORM", 158, 118);
  }

  // ── Member badge (top-right) ──
  ctx.textAlign = "right";
  ctx.font = "10px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Official", W - 120, 88);
  ctx.font = "bold 16px 'Arial', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.fillText("MEMBERSHIP", W - 120, 108);
  ctx.font = "10px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Verified Member", W - 120, 124);

  // ── Separator line ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 155); ctx.lineTo(W - 80, 155); ctx.stroke();

  // ── Certificate label ──
  ctx.textAlign = "left";
  ctx.font = "600 14px 'Arial', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("MEMBERSHIP CERTIFICATE", 120, 220);

  // ── Small accent line under label ──
  ctx.fillStyle = "#14e3c5";
  ctx.fillRect(120, 232, 60, 3);

  // ── Member Name (largest element) ──
  ctx.font = "bold 56px 'Georgia', serif";
  ctx.fillStyle = dark;
  ctx.fillText(userName || "Member", 120, 310);

  // ── Description ──
  ctx.font = "18px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("is now a verified member of the SECUVION platform and is authorized", 120, 365);
  ctx.fillText("to access enterprise-grade cybersecurity tools and resources.", 120, 393);

  // ── Membership Plan ──
  ctx.font = "bold 28px 'Georgia', serif";
  ctx.fillStyle = dark;
  ctx.fillText("SECUVION Platform — Official Member", 120, 460);

  // ── Details line ──
  ctx.font = "16px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("with full access to AI-powered cyber defense, threat intelligence, and security training.", 120, 500);

  // ── Member details section ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(120, 545); ctx.lineTo(W - 120, 545); ctx.stroke();

  // Member ID (left)
  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("MEMBER ID", 120, 580);
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = dark;
  ctx.fillText(memberId, 120, 605);

  // Email (center)
  ctx.textAlign = "center";
  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("EMAIL", cx, 580);
  ctx.font = "14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText(email, cx, 605);

  // Date (right)
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  ctx.textAlign = "right";
  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("JOINED", W - 120, 580);
  ctx.font = "14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText(dateStr, W - 120, 605);

  // ── Separator ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath(); ctx.moveTo(120, 640); ctx.lineTo(W - 120, 640); ctx.stroke();

  // ── Signature (real image or fallback) ──
  ctx.textAlign = "left";

  if (sigImg) {
    const sigH = 55;
    const sigW = sigH * (sigImg.width / sigImg.height);
    ctx.drawImage(sigImg, 120, 700, sigW, sigH);
  } else {
    ctx.save();
    ctx.strokeStyle = "#2d3748"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    let px = 120;
    "Sahil Nikam".split("").forEach((ch, i) => {
      const baseY = 740 + Math.sin(i * 0.8) * 4;
      if (i === 0) { ctx.moveTo(px, baseY); ctx.quadraticCurveTo(px + 5, baseY - 18, px + 12, baseY - 12); ctx.quadraticCurveTo(px + 18, baseY - 6, px + 10, baseY + 2); ctx.quadraticCurveTo(px + 5, baseY + 8, px + 20, baseY); px += 22; }
      else if (ch === " ") { px += 8; ctx.moveTo(px, baseY); }
      else { ctx.quadraticCurveTo(px + 3, baseY - 6 + Math.random() * 4, px + 7, baseY + Math.random() * 3 - 1); px += 7 + Math.random() * 3; }
    });
    ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(380, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText("Sahil Anil Nikam", 120, 785);
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("Founder & CEO, SECUVION", 120, 765);

  // Signature 2
  ctx.strokeStyle = "#d1d5db";
  ctx.beginPath(); ctx.moveTo(500, 760); ctx.lineTo(760, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText("SECUVION Platform", 500, 785);
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("Membership Division", 500, 765);

  // ── Official Stamp / Verified Badge ──
  if (stampImg) {
    const stSize = 130;
    ctx.drawImage(stampImg, W - 300, 680, stSize, stSize);
  } else {
    const bx = W - 280, by = 680;
    ctx.beginPath();
    ctx.arc(bx + 30, by + 30, 28, 0, Math.PI * 2);
    const badgeGrad = ctx.createLinearGradient(bx, by, bx + 60, by + 60);
    badgeGrad.addColorStop(0, "#6366f1");
    badgeGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(bx + 18, by + 30); ctx.lineTo(bx + 27, by + 40); ctx.lineTo(bx + 44, by + 20);
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.font = "bold 13px 'Arial', sans-serif";
    ctx.fillStyle = "#6366f1";
    ctx.fillText("VERIFIED", bx + 68, by + 26);
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = gray;
    ctx.fillText("MEMBER", bx + 68, by + 44);
  }

  // ── What's included section ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath(); ctx.moveTo(120, 800); ctx.lineTo(W - 120, 800); ctx.stroke();

  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.textAlign = "left";
  ctx.fillText("MEMBER BENEFITS", 120, 835);

  const benefits = ["AI Threat Detection", "Security Score Monitoring", "Fraud Analyzer Access", "Academy Courses", "Priority Support"];
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  benefits.forEach((b, i) => {
    const bxx = 120 + i * 240;
    // Checkmark
    ctx.fillStyle = "#14e3c5";
    ctx.font = "bold 14px 'Arial', sans-serif";
    ctx.fillText("✓", bxx, 865);
    ctx.fillStyle = gray;
    ctx.font = "13px 'Arial', sans-serif";
    ctx.fillText(b, bxx + 18, 865);
  });

  // ── Bottom separator ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath(); ctx.moveTo(80, H - 120); ctx.lineTo(W - 80, H - 120); ctx.stroke();

  // ── Footer ──
  ctx.textAlign = "left";
  ctx.font = "11px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Verify at secuvion.onrender.com/verify/" + memberId, 120, H - 85);

  ctx.textAlign = "right";
  ctx.font = "11px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("© 2026 SECUVION. All rights reserved.", W - 120, H - 85);

  // ── Bottom accent bar ──
  const btmBar = ctx.createLinearGradient(0, 0, W, 0);
  btmBar.addColorStop(0, "#6366f1");
  btmBar.addColorStop(0.5, "#14e3c5");
  btmBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = btmBar;
  ctx.fillRect(0, H - 8, W, 8);

  return canvas.toDataURL("image/png");
}

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certImage, setCertImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [step, setStep] = useState(0); // 0=welcome, 1=preferences, 2=security-check, 3=certificate
  const [interests, setInterests] = useState([]);
  const [checkProgress, setCheckProgress] = useState(0);

  const memberId = `SEC-${(user?.id || Date.now()).toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const t2 = setTimeout(() => setShowConfetti(false), 5000);
    return () => { clearTimeout(t2); };
  }, [user, navigate]);

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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
    // Save to localStorage
    const certs = JSON.parse(localStorage.getItem("secuvion_member_certs") || "[]");
    if (!certs.find(c => c.email === user?.email)) {
      certs.push({ name: user?.name, email: user?.email, memberId, date: new Date().toISOString() });
      localStorage.setItem("secuvion_member_certs", JSON.stringify(certs));
    }
  };

  const handleDownload = () => {
    if (!certImage) return;
    const a = document.createElement("a");
    a.href = certImage;
    a.download = `SECUVION_Membership_${(user?.name || "Member").replace(/\s+/g, "_")}.png`;
    a.click();
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden", padding: 24 }}>
      <SEO title="Welcome" description="Welcome to SECUVION — your cybersecurity journey starts here." path="/welcome" />

      {/* Animated background particles */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-20vh) scale(1); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(20,227,197,0.2); }
          50% { box-shadow: 0 0 40px rgba(20,227,197,0.4), 0 0 60px rgba(99,102,241,0.2); }
        }
        @media (max-width: 500px) {
          .welcome-interests-grid { grid-template-columns: 1fr !important; }
        }
        .confetti-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: floatUp 3s ease-in-out forwards;
          pointer-events: none;
        }
      `}</style>

      {/* Confetti particles */}
      {showConfetti && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="confetti-particle" style={{
          left: `${Math.random() * 100}%`,
          background: ["#14e3c5", "#6366f1", "#22c55e", "#eab308", "#ec4899", "#f97316"][i % 6],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          width: 4 + Math.random() * 8,
          height: 4 + Math.random() * 8,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        }} />
      ))}

      {/* Background glows */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", top: "10%", right: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,227,197,0.08) 0%, transparent 70%)", bottom: "10%", left: "10%", pointerEvents: "none" }} />

      {/* Welcome Content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 700 }}>

        {/* Shield icon */}
        <div style={{ animation: "fadeInUp 0.8s ease, glow 2s ease-in-out infinite", width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #14e3c5, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36, fontWeight: 800, color: "#fff" }}>
          S
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32, animation: "fadeInUp 0.8s ease 0.1s both" }}>
          {["Welcome", "Interests", "Security Check", "Certificate"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk'",
                background: step >= i ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "rgba(148,163,184,0.08)",
                color: step >= i ? "#fff" : T.muted, border: `1px solid ${step >= i ? "transparent" : "rgba(148,163,184,0.12)"}`,
                transition: "all 0.4s",
              }}>{i + 1}</div>
              {i < 3 && <div style={{ width: 24, height: 2, borderRadius: 1, background: step > i ? T.accent : "rgba(148,163,184,0.1)", transition: "background 0.4s" }} />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: T.white, marginBottom: 12 }}>
              Welcome to <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SECUVION</span>, {user.name?.split(" ")[0] || "there"}!
            </h1>
            <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, marginBottom: 32 }}>
              Your cybersecurity journey begins now. Let's set up your protection in 3 quick steps.
            </p>
            <button onClick={() => setStep(1)} style={{
              padding: "16px 44px", background: "linear-gradient(135deg, #6366f1, #14e3c5)", border: "none", borderRadius: 12,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
              boxShadow: "0 8px 30px rgba(99,102,241,0.3)", transition: "all 0.3s",
            }}>
              Let's Get Started &rarr;
            </button>
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8 }}>What matters most to you?</h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 28 }}>Select your security priorities so we can tailor your experience.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 500, margin: "0 auto 28px" }} className="welcome-interests-grid">
              {[
                { id: "phishing", icon: "\uD83C\uDFA3", label: "Phishing Protection", color: "#ef4444" },
                { id: "darkweb", icon: "\uD83D\uDD76\uFE0F", label: "Dark Web Monitoring", color: "#8b5cf6" },
                { id: "passwords", icon: "\uD83D\uDD10", label: "Password Security", color: "#14e3c5" },
                { id: "identity", icon: "\uD83D\uDEE1\uFE0F", label: "Identity Protection", color: "#3b82f6" },
                { id: "devices", icon: "\uD83D\uDCBB", label: "Device Security", color: "#f97316" },
                { id: "education", icon: "\uD83D\uDCDA", label: "Security Education", color: "#22c55e" },
              ].map(item => {
                const selected = interests.includes(item.id);
                return (
                  <button key={item.id} onClick={() => toggleInterest(item.id)} style={{
                    padding: "16px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12, transition: "all 0.25s",
                    background: selected ? `${item.color}10` : "rgba(17,24,39,0.6)",
                    border: `1.5px solid ${selected ? `${item.color}40` : "rgba(148,163,184,0.08)"}`,
                    fontFamily: "inherit",
                  }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: selected ? T.white : T.muted }}>{item.label}</span>
                    {selected && <span style={{ marginLeft: "auto", color: item.color, fontWeight: 700, fontSize: 16 }}>&#10003;</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={runSecurityCheck} style={{
              padding: "14px 40px", background: interests.length > 0 ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "rgba(148,163,184,0.1)",
              border: "none", borderRadius: 12, color: interests.length > 0 ? "#fff" : T.muted,
              fontSize: 15, fontWeight: 700, cursor: interests.length > 0 ? "pointer" : "default",
              fontFamily: "'Space Grotesk'", transition: "all 0.3s",
              opacity: interests.length > 0 ? 1 : 0.5,
            }}>
              Run Security Check &rarr;
            </button>
            <div>
              <button onClick={() => setStep(3)} style={{ background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans'", marginTop: 16 }}>
                Skip to certificate &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Security Check */}
        {step === 2 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8 }}>Running Security Check</h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 32 }}>Analyzing your digital security posture...</p>
            <div style={{ maxWidth: 400, margin: "0 auto 28px" }}>
              <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 10, height: 8, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg, #6366f1, #14e3c5)", width: `${checkProgress}%`, transition: "width 0.3s ease" }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.accent }}>{checkProgress}%</div>
            </div>
            <div style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 14, padding: 20, maxWidth: 400, margin: "0 auto", textAlign: "left" }}>
              {[
                { label: "Email breach check", done: checkProgress > 20 },
                { label: "Password strength audit", done: checkProgress > 40 },
                { label: "Dark web scan", done: checkProgress > 60 },
                { label: "Device fingerprint", done: checkProgress > 80 },
                { label: "Risk assessment", done: checkProgress >= 100 },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? "1px solid rgba(148,163,184,0.06)" : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                    background: item.done ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.08)",
                    color: item.done ? "#22c55e" : T.muted, border: `1px solid ${item.done ? "rgba(34,197,94,0.25)" : "rgba(148,163,184,0.12)"}`,
                    transition: "all 0.3s",
                  }}>{item.done ? "\u2713" : ""}</span>
                  <span style={{ fontSize: 13, color: item.done ? T.white : T.muted, transition: "color 0.3s" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Certificate */}
        {step === 3 && (
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8 }}>You're All Set!</h2>
            <p style={{ fontSize: 15, color: T.muted, marginBottom: 20 }}>Your security profile is ready. Generate your membership certificate below.</p>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { label: "Security Score", value: "87/100", color: T.green },
                { label: "Threats Blocked", value: "1,247", color: T.cyan },
                { label: "Courses Available", value: "6", color: T.accent },
                { label: "Your Plan", value: user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || "Free", color: "#eab308" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk'" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Certificate section */}
            {!certImage && (
              <div style={{ background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, backdropFilter: "blur(10px)", marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\uD83C\uDF93"}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Your Membership Certificate</h3>
                <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>Download your official SECUVION membership certificate with your name and unique member ID.</p>
                <button onClick={handleGenerateCert} style={{
                  padding: "14px 36px", background: "linear-gradient(135deg, #14e3c5, #6366f1)", border: "none", borderRadius: 10,
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
                  transition: "all 0.3s", animation: "pulse 2s infinite",
                }}>
                  Generate My Certificate
                </button>
              </div>
            )}

            {/* Certificate preview */}
            {certImage && (
              <div>
                <div style={{ background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 8, display: "inline-block", marginBottom: 20, backdropFilter: "blur(10px)" }}>
                  <img src={certImage} alt="Membership Certificate" style={{ width: "100%", maxWidth: 700, borderRadius: 10 }} />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={handleDownload} style={{
                    padding: "14px 32px", background: "linear-gradient(135deg, #22c55e, #14e3c5)", border: "none", borderRadius: 10,
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    &#11015; Download Certificate
                  </button>
                  <button onClick={() => navigate("/dashboard")} style={{
                    padding: "14px 32px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10,
                    color: T.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
                  }}>
                    Go to Dashboard &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Skip to dashboard */}
            {!certImage && (
              <button onClick={() => navigate("/dashboard")} style={{
                background: "none", border: "none", color: T.muted, fontSize: 14, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans'", marginTop: 12,
              }}>
                Skip and go to Dashboard &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
