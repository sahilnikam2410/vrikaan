import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

function generateCode(uid) {
  const base = uid ? uid.slice(0, 6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SECUV-${base}`;
}

export default function Referral() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        // Get or create referral code in Firestore
        const refDoc = doc(db, "referrals", user.uid);
        const refSnap = await getDoc(refDoc);
        if (refSnap.exists()) {
          setCode(refSnap.data().code);
        } else {
          const c = generateCode(user.uid);
          await setDoc(refDoc, { code: c, uid: user.uid, email: user.email || "", createdAt: serverTimestamp() });
          setCode(c);
        }

        // Fetch referrals where this user's code was used
        const refsQuery = query(collection(db, "referral_signups"), where("referredBy", "==", user.uid));
        const refsSnap = await getDocs(refsQuery);
        const refs = [];
        refsSnap.forEach(d => refs.push({ id: d.id, ...d.data() }));
        setReferrals(refs);
      } catch (err) {
        console.warn("Referral load error:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem(`secuvion_referral_${user.uid}`);
        if (stored) setCode(stored);
        else { const c = generateCode(user.uid); setCode(c); localStorage.setItem(`secuvion_referral_${user.uid}`, c); }
      }
      setLoading(false);
    })();
  }, [user]);

  const referralLink = `https://vrikaan.com/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const text = `Check out VRIKAAN — free AI-powered cybersecurity tools! Use my referral code: ${code}\n${referralLink}`;
    if (navigator.share) navigator.share({ title: "Join VRIKAAN", text, url: referralLink });
    else copyLink();
  };

  const rewards = [
    { count: 3, reward: "50 bonus AI credits", icon: "\u2B50" },
    { count: 5, reward: "1 month Standard free", icon: "\uD83C\uDF1F" },
    { count: 10, reward: "1 month Advanced free", icon: "\uD83D\uDC8E" },
    { count: 25, reward: "Lifetime Standard", icon: "\uD83C\uDFC6" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <SEO title="Refer & Earn" description="Invite friends to VRIKAAN and earn free credits and subscription upgrades." path="/referral" />
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 20px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F381;</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Refer & Earn</h1>
          <p style={{ color: T.muted, fontSize: 15 }}>Invite friends and earn free credits & subscription upgrades</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading referral data...</div>
        ) : (
          <>
            {/* Referral code card */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Your Referral Code</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: "14px 16px", background: "rgba(15,23,42,0.6)", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 18, fontWeight: 700, color: T.cyan, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>{code}</div>
                <button onClick={copyLink} style={{ padding: "14px 20px", borderRadius: 10, border: "none", background: copied ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "Copied!" : "Copy Link"}</button>
              </div>

              <div style={{ padding: "10px 14px", background: "rgba(15,23,42,0.4)", borderRadius: 8, border: `1px solid ${T.border}`, wordBreak: "break-all", marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{referralLink}</span>
              </div>

              <div className="ref-share-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <button onClick={share} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.white, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>&#x1F4E4; Share</button>
                <button onClick={() => { const url = `https://wa.me/?text=${encodeURIComponent(`Check out VRIKAAN! ${referralLink}`)}`; window.open(url, "_blank"); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.06)", color: T.green, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>WhatsApp</button>
                <button onClick={() => { const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out VRIKAAN — free AI cybersecurity tools! ${referralLink}`)}`; window.open(url, "_blank"); }} style={{ padding: "10px", borderRadius: 8, border: "1px solid rgba(29,161,242,0.2)", background: "rgba(29,161,242,0.06)", color: "#1DA1F2", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Twitter</button>
              </div>
            </div>

            {/* Stats */}
            <div className="ref-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 20, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk',sans-serif" }}>{referrals.length}</div>
                <div style={{ fontSize: 12, color: T.muted }}>Successful Referrals</div>
              </div>
              <div style={{ padding: 20, background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.green, fontFamily: "'Space Grotesk',sans-serif" }}>{referrals.length * 10}</div>
                <div style={{ fontSize: 12, color: T.muted }}>Credits Earned</div>
              </div>
            </div>

            {/* Recent referrals */}
            {referrals.length > 0 && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Recent Referrals</h3>
                {referrals.slice(0, 10).map((r, i) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < Math.min(referrals.length, 10) - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.accent }}>{(r.name || r.email || "U")[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{r.name || "User"}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{r.email ? r.email.replace(/(.{2}).*(@.*)/, "$1***$2") : "Joined via your link"}</div>
                    </div>
                    <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>+10 credits</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rewards tiers */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Reward Tiers</h3>
              {rewards.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < rewards.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{r.reward}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{r.count} referrals needed</div>
                  </div>
                  <div style={{ width: 60, textAlign: "right" }}>
                    {referrals.length >= r.count ? (
                      <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>&#x2705; Earned</span>
                    ) : (
                      <span style={{ fontSize: 12, color: T.muted }}>{r.count - referrals.length} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
      <style>{`
        @media (max-width: 500px) {
          .ref-share-grid { grid-template-columns: 1fr !important; }
          .ref-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
