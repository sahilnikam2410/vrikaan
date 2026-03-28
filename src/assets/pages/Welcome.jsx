import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", border: "rgba(148,163,184,0.08)" };

function generateMemberCertificate(userName, email, memberId) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0a0f1e";
  ctx.fillRect(0, 0, 1200, 850);

  // Border gradient
  const borderGrad = ctx.createLinearGradient(0, 0, 1200, 850);
  borderGrad.addColorStop(0, "#6366f1");
  borderGrad.addColorStop(1, "#14e3c5");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 1160, 810);

  // Inner border
  ctx.strokeStyle = "rgba(148,163,184,0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 770);

  // Corner decorations
  [[50, 50], [1140, 50], [50, 790], [1140, 790]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#14e3c5";
    ctx.fill();
  });

  // Shield icon (top center)
  ctx.save();
  ctx.translate(600, 95);
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.bezierCurveTo(-25, -28, -35, -15, -35, 0);
  ctx.bezierCurveTo(-35, 20, -15, 35, 0, 42);
  ctx.bezierCurveTo(15, 35, 35, 20, 35, 0);
  ctx.bezierCurveTo(35, -15, 25, -28, 0, -30);
  ctx.closePath();
  const shieldGrad = ctx.createLinearGradient(-35, -30, 35, 42);
  shieldGrad.addColorStop(0, "#6366f1");
  shieldGrad.addColorStop(1, "#14e3c5");
  ctx.fillStyle = shieldGrad;
  ctx.fill();
  // Checkmark inside shield
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-3, 10);
  ctx.lineTo(12, -8);
  ctx.stroke();
  ctx.restore();

  // SECUVION
  ctx.font = "bold 22px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.textAlign = "center";
  ctx.fillText("SECUVION", 600, 160);

  // Subtitle
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("AI-POWERED CYBER DEFENSE PLATFORM", 600, 180);

  // MEMBERSHIP CERTIFICATE
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("OFFICIAL MEMBERSHIP CERTIFICATE", 600, 230);

  // Decorative line
  const lineGrad = ctx.createLinearGradient(300, 250, 900, 250);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, "#6366f1");
  lineGrad.addColorStop(0.8, "#14e3c5");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 250);
  ctx.lineTo(900, 250);
  ctx.stroke();

  // "This certifies that"
  ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("This is to certify that", 600, 300);

  // Name
  ctx.font = "bold 42px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(userName, 600, 360);

  // Underline
  const nameW = ctx.measureText(userName).width;
  ctx.strokeStyle = "rgba(99,102,241,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(600 - nameW / 2 - 20, 375);
  ctx.lineTo(600 + nameW / 2 + 20, 375);
  ctx.stroke();

  // Description
  ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("is now a verified member of the SECUVION platform", 600, 420);
  ctx.fillText("and is authorized to access enterprise-grade cybersecurity tools.", 600, 445);

  // Member details box
  ctx.fillStyle = "rgba(99,102,241,0.06)";
  ctx.strokeStyle = "rgba(99,102,241,0.15)";
  ctx.lineWidth = 1;
  const boxW = 400, boxH = 70, boxX = 600 - boxW / 2, boxY = 475;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText(`Member ID: ${memberId}`, 600, 500);
  ctx.fillText(`Email: ${email}`, 600, 518);
  ctx.fillText(`Joined: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 600, 536);

  // Signature lines
  ctx.strokeStyle = "rgba(148,163,184,0.15)";
  ctx.lineWidth = 1;
  // Left
  ctx.beginPath(); ctx.moveTo(220, 670); ctx.lineTo(440, 670); ctx.stroke();
  ctx.font = "italic 18px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.fillText("Sahil Anil Nikam", 330, 660);
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Founder, SECUVION", 330, 690);

  // Right
  ctx.beginPath(); ctx.moveTo(760, 670); ctx.lineTo(980, 670); ctx.stroke();
  ctx.font = "italic 18px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("SECUVION Platform", 870, 660);
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Membership Division", 870, 690);

  // Footer
  ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Verify this certificate at secuvion.onrender.com/verify", 600, 770);

  // Watermark
  ctx.globalAlpha = 0.03;
  ctx.font = "bold 300px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.fillText("S", 600, 550);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certImage, setCertImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [step, setStep] = useState(0); // 0=welcome, 1=certificate

  const memberId = `SEC-${(user?.id || Date.now()).toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    // Animate steps
    const t1 = setTimeout(() => setStep(1), 2000);
    const t2 = setTimeout(() => setShowConfetti(false), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [user, navigate]);

  const handleGenerateCert = () => {
    const img = generateMemberCertificate(user?.name || "Member", user?.email || "", memberId);
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

        {/* Welcome text */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: T.white, marginBottom: 12, animation: "fadeInUp 0.8s ease 0.2s both" }}>
          Welcome to <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SECUVION</span>, {user.name?.split(" ")[0]}!
        </h1>

        <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, marginBottom: 32, animation: "fadeInUp 0.8s ease 0.4s both" }}>
          Your cybersecurity journey begins now. You're now part of a community<br />dedicated to making the digital world safer.
        </p>

        {/* Stats */}
        {step >= 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 40, flexWrap: "wrap", animation: "fadeInUp 0.6s ease" }}>
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
        )}

        {/* Certificate section */}
        {step >= 1 && !certImage && (
          <div style={{ animation: "fadeInUp 0.6s ease", background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, backdropFilter: "blur(10px)", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Your Membership Certificate</h2>
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
          <div style={{ animation: "fadeInUp 0.6s ease" }}>
            <div style={{ background: "rgba(17,24,39,0.8)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 8, display: "inline-block", marginBottom: 20, backdropFilter: "blur(10px)" }}>
              <img src={certImage} alt="Membership Certificate" style={{ width: "100%", maxWidth: 700, borderRadius: 10 }} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleDownload} style={{
                padding: "14px 32px", background: "linear-gradient(135deg, #22c55e, #14e3c5)", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ⬇ Download Certificate
              </button>
              <button onClick={() => navigate("/dashboard")} style={{
                padding: "14px 32px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10,
                color: T.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk'",
              }}>
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Skip to dashboard */}
        {!certImage && step >= 1 && (
          <button onClick={() => navigate("/dashboard")} style={{
            background: "none", border: "none", color: T.muted, fontSize: 14, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans'", marginTop: 12,
          }}>
            Skip and go to Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
