import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO, { faqSchema, productSchema } from "../../components/SEO";

/**
 * /family-plan — public SEO landing page for the Family plan.
 * Distinct from /family (logged-in dashboard). Designed for:
 *   - Google search ("family cybersecurity india", "parental control india")
 *   - WhatsApp / share links from existing customers
 *   - Brevo email CTAs
 *
 * Conversion path: hero CTA → /checkout?plan=family&billing=monthly
 */

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.6)", white: "#f1f5f9",
  muted: "#94a3b8", mutedDark: "#64748b",
  pink: "#ec4899", cyan: "#14e3c5", indigo: "#6366f1",
  border: "rgba(148,163,184,0.10)", green: "#22c55e",
};

const FEATURES = [
  {
    icon: "👨‍👩‍👧‍👦",
    title: "5 seats included",
    body: "Parents, kids, grandparents — everyone gets their own login and private vault. Add more seats at ₹49/mo each.",
  },
  {
    icon: "🛡️",
    title: "Real-time scam shield",
    body: "AI scam-check on every UPI request, SMS, WhatsApp forward, suspicious link. Trained on Indian fraud patterns.",
  },
  {
    icon: "👶",
    title: "Kids mode",
    body: "Auto-blocks dark-web stories, deepfake tools, scary scam databases. Safe browsing layer with explainer popups.",
  },
  {
    icon: "👴",
    title: "Senior mode",
    body: "Extra UPI scam guard before every transfer. Voice alerts in Hindi & English. Big-text mode and family safe-word reminders.",
  },
  {
    icon: "🚨",
    title: "Family scam broadcast",
    body: "When a scam hits one member, the whole family gets a 30-second alert with the exact details so others can spot it instantly.",
  },
  {
    icon: "🗝️",
    title: "Shared safe-word vault",
    body: "Pre-agreed family passphrase to verify the caller is really your son / daughter / mom — even on a deepfake voice call.",
  },
];

const COMPARE = [
  { label: "Members covered",         standard: "1",        family: "5" },
  { label: "Parent dashboard",         standard: "—",        family: "✓" },
  { label: "Kids mode",                standard: "—",        family: "✓" },
  { label: "Senior mode (UPI guard)",  standard: "—",        family: "✓" },
  { label: "Family scam broadcast",    standard: "—",        family: "✓" },
  { label: "Shared safe-word vault",   standard: "—",        family: "✓" },
  { label: "Price",                    standard: "₹49/mo",   family: "₹149/mo" },
];

const TESTIMONIALS = [
  {
    name: "Anjali R.", city: "Pune", verdict: "My dad almost lost ₹40,000 to a fake bank-officer call. VRIKAAN's senior mode caught it. 5 seats, ₹149/mo — cheaper than one Netflix subscription split across the family.",
  },
  {
    name: "Vikram S.", city: "Bengaluru", verdict: "Kids mode is the killer feature. My 9-year-old browses on her own device now and I don't worry about scam ads or phishing forwards. Worth it just for that.",
  },
  {
    name: "Mehta family", city: "Mumbai", verdict: "Family scam broadcast saved us twice in 2 months — same UPI fraud pattern hit my brother first, the whole family got the alert, no one else fell for it.",
  },
];

const FAQS = [
  { q: "How many members does ₹149/mo cover?", a: "5 members. Each gets their own login, private vault, and tool access. Need more? Add extra seats from the family dashboard at ₹49/mo per seat." },
  { q: "Do my kids get all the same tools?", a: "Kid-role members get the safe subset — scam-block, password checker, 2FA guide, safe browsing — but are blocked from dark-web monitor, deepfake audio, identity X-ray and other scary/adult tools. You control this from the parent dashboard." },
  { q: "What does Senior mode actually do?", a: "Adds an extra confirmation step before every UPI/banking action, plays voice alerts in Hindi or English, surfaces the family safe-word vault prominently, and runs deeper scam-check on incoming calls and SMS." },
  { q: "Can grandparents join even if they're not tech-savvy?", a: "Yes. The invite link arrives via email; they click → sign up in 30 seconds with email + OTP. The senior-mode UI is large-text and walks them through every step. We also have a Hindi version at /hi." },
  { q: "What happens if I downgrade or cancel?", a: "Downgrade takes effect at the start of your next billing cycle. Existing family members retain free-tier access; their data is never deleted. Cancel anytime with one click — 30-day money-back guarantee on first payment." },
  { q: "Is my family's data shared with each other?", a: "No. Only safety-related alerts are broadcast (e.g. 'someone in your family flagged a scam matching pattern X'). Personal passwords, vaults, scan history stay private to each member. Even the family owner can't see other members' private data — only aggregate safety status." },
];

const MARKETING_HEAD = `
@keyframes fpFloat {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-6px); }
}
.fp-hero-shield {
  animation: fpFloat 4s ease-in-out infinite;
}
`;

export default function FamilyPlanLanding() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Family Plan — VRIKAAN protects parents, kids & grandparents (₹149/mo)"
        description="One plan, whole family safe. 5 members. Parent dashboard, kid-safe mode, senior UPI scam guard, family scam alerts. ₹149/mo — cancel anytime, 30-day refund."
        path="/family-plan"
        keywords="family cybersecurity india, parental control india, family vpn, senior scam protection, upi fraud protection, kids safe browsing"
        jsonLd={[
          faqSchema(FAQS),
          productSchema({
            name: "VRIKAAN Family Plan",
            description: "Cybersecurity for the whole family — 5 members, parent dashboard, kids mode, senior mode, family scam broadcast.",
            price: 149,
          }),
        ]}
      />
      <style>{MARKETING_HEAD}</style>
      <Navbar />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center", marginBottom: 100 }} className="fp-hero">
          <div>
            <span style={{
              display: "inline-block", padding: "5px 14px", borderRadius: 100,
              background: `${T.pink}10`, border: `1px solid ${T.pink}30`,
              fontSize: 11, fontWeight: 700, color: T.pink, marginBottom: 18, letterSpacing: 0.5,
            }}>FAMILY PLAN · NEW</span>
            <h1 style={{
              fontFamily: "'Vrikaan Sans', sans-serif",
              fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 22px",
            }}>
              One plan. <br/>
              <span style={{ background: `linear-gradient(135deg, ${T.pink}, ${T.indigo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Whole family safe.
              </span>
            </h1>
            <p style={{ color: T.muted, fontSize: 18, lineHeight: 1.7, maxWidth: 500, margin: "0 0 32px" }}>
              5 members. Parents get a control dashboard. Kids get safe browsing. Grandparents get a UPI scam guard. Everyone gets real-time AI defence — for the price of <strong style={{ color: T.cyan }}>one coffee a week</strong>.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <Link to="/checkout?plan=family&billing=monthly" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 30px",
                background: `linear-gradient(135deg, ${T.pink}, ${T.indigo})`,
                color: "#fff", borderRadius: 12,
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 12px 32px ${T.pink}40`,
                fontFamily: "'Vrikaan Sans', sans-serif",
              }}>
                Start Family Plan — ₹149/mo
              </Link>
              <Link to="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 22px", borderRadius: 12,
                border: `1px solid ${T.border}`,
                color: T.white, textDecoration: "none",
                fontSize: 14, fontWeight: 600,
              }}>
                Compare plans →
              </Link>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: T.mutedDark }}>
              <span>✓ 30-day refund</span>
              <span>✓ Cancel anytime</span>
              <span>✓ India-built · Made in Pune</span>
            </div>
          </div>

          <div style={{ position: "relative", height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="fp-hero-shield" style={{
              width: 280, height: 280, borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${T.pink}33, ${T.indigo}11 60%, transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100,
              boxShadow: `inset 0 0 80px ${T.pink}33`,
            }}>
              👨‍👩‍👧‍👦
            </div>
            {/* Floating member chips */}
            {[
              { emoji: "👨", top: 30, left: 0, color: T.indigo },
              { emoji: "👩", top: 60, right: -10, color: T.pink },
              { emoji: "👧", bottom: 40, left: -20, color: T.cyan },
              { emoji: "👦", bottom: 80, right: 20, color: "#a855f7" },
              { emoji: "👴", bottom: -10, left: "40%", color: "#f59e0b" },
            ].map((m, i) => (
              <div key={i} style={{
                position: "absolute", ...m,
                width: 52, height: 52, borderRadius: "50%",
                background: T.card, border: `2px solid ${m.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
                boxShadow: `0 6px 20px ${m.color}33`,
              }}>{m.emoji}</div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 36, fontWeight: 700, textAlign: "center",
            margin: "0 0 14px", letterSpacing: "-0.02em",
          }}>What you get</h2>
          <p style={{ textAlign: "center", color: T.muted, fontSize: 15, maxWidth: 540, margin: "0 auto 48px" }}>
            6 family-only features on top of every Standard plan tool.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: 28,
                backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compare */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 32, fontWeight: 700, textAlign: "center",
            margin: "0 0 38px", letterSpacing: "-0.02em",
          }}>Standard vs Family</h2>
          <div style={{
            maxWidth: 720, margin: "0 auto",
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", padding: "16px 24px", borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: T.mutedDark }}>FEATURE</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: T.muted, textAlign: "center" }}>STANDARD</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: T.pink, textAlign: "center" }}>FAMILY</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr",
                padding: "14px 24px",
                borderBottom: i < COMPARE.length - 1 ? `1px solid ${T.border}` : "none",
                fontSize: 14,
              }}>
                <div style={{ color: T.white }}>{row.label}</div>
                <div style={{ textAlign: "center", color: row.standard === "—" ? T.mutedDark : T.muted }}>{row.standard}</div>
                <div style={{ textAlign: "center", color: row.family === "✓" ? T.cyan : T.white, fontWeight: 600 }}>{row.family}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 32, fontWeight: 700, textAlign: "center",
            margin: "0 0 38px", letterSpacing: "-0.02em",
          }}>Indian families using VRIKAAN</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: 26,
              }}>
                <p style={{ fontSize: 14, color: T.white, lineHeight: 1.75, margin: "0 0 16px", fontStyle: "italic" }}>"{t.verdict}"</p>
                <div style={{ fontSize: 12, color: T.cyan, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: T.mutedDark }}>{t.city}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: 32, fontWeight: 700, textAlign: "center",
            margin: "0 0 38px", letterSpacing: "-0.02em",
          }}>Family FAQs</h2>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {FAQS.map((f, i) => (
              <details key={i} style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "18px 22px",
              }}>
                <summary style={{ cursor: "pointer", fontSize: 15, fontWeight: 600, color: T.white }}>{f.q}</summary>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: "12px 0 0" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          textAlign: "center", padding: "56px 32px",
          background: `linear-gradient(135deg, ${T.pink}10, ${T.indigo}08)`,
          border: `1px solid ${T.pink}22`,
          borderRadius: 22,
        }}>
          <h2 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 32, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            Get your family on VRIKAAN today
          </h2>
          <p style={{ color: T.muted, fontSize: 15, marginBottom: 28 }}>
            5 members · ₹149/mo · cancel anytime · 30-day money-back.
          </p>
          <Link to="/checkout?plan=family&billing=monthly" style={{
            display: "inline-block", padding: "16px 40px",
            background: `linear-gradient(135deg, ${T.pink}, ${T.indigo})`,
            color: "#fff", borderRadius: 12, textDecoration: "none",
            fontSize: 15, fontWeight: 700,
            fontFamily: "'Vrikaan Sans', sans-serif",
            boxShadow: `0 12px 32px ${T.pink}40`,
          }}>
            Start Family Plan — ₹149/mo
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .fp-hero { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
