import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5",
  green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", orange: "#f97316",
  white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  border: "rgba(148,163,184,0.12)",
};

// 12 most useful tools, Hindi-first labels
const TOOLS = [
  { to: "/scam-recovery",    icon: "🚨", title: "धोखाधड़ी रिकवरी हॉटलाइन", desc: "अभी ठगा गया? 30 सेकंड में पूरा प्लान — हेल्पलाइन, IPC धाराएं, FIR ड्राफ्ट।", tag: "तुरंत", color: T.red },
  { to: "/otp-decay",        icon: "⏱", title: "OTP डिके अलर्ट",             desc: "OTP दे दिया? 90 सेकंड में बैंक को कॉल करो — नंबर पहले से तैयार।",            tag: "तुरंत", color: T.red },
  { to: "/safe-word",        icon: "🛡", title: "परिवार सेफ-वर्ड वॉल्ट",      desc: "AI वॉइस क्लोन तोड़ने का तरीका — एक शब्द पूरे परिवार के साथ।",                  tag: "परिवार", color: T.cyan },
  { to: "/aadhaar-mask",     icon: "🪪", title: "आधार मास्क टूल",             desc: "आधार/पैन शेयर करने से पहले मास्क करो — फोटो में भी काम करता है।",            tag: "प्राइवेसी", color: T.accent },
  { to: "/festival-fraud",   icon: "🎊", title: "त्योहार धोखाधड़ी फॉरकास्ट",   desc: "दिवाली/होली/शादी सीज़न में फ्रॉड बढ़ जाता है — पहले से जानो।",                 tag: "भारत", color: T.yellow },
  { to: "/upi-lookup",       icon: "🔍", title: "UPI ID चेक",                 desc: "किसी भी UPI ID पर पैसा भेजने से पहले — रेड फ्लैग + कम्युनिटी DB।",          tag: "पैसा", color: T.cyan },
  { to: "/loan-app-check",   icon: "💸", title: "लोन ऐप चेकर",                desc: "इंस्टॉल करने से पहले चेक — RBI में रजिस्टर्ड है क्या? परमिशन ठीक हैं?",       tag: "पैसा", color: T.accent },
  { to: "/stolen-phone",     icon: "📱", title: "फोन चोरी / गुम",              desc: "Android + iPhone — SIM ब्लॉक, CEIR IMEI ब्लॉक, FIR — सब एक जगह।",       tag: "तुरंत", color: T.red },
  { to: "/scam-check",       icon: "📝", title: "स्कैम मैसेज चेक (AI)",        desc: "कोई SMS/WhatsApp/email shaadi मिला? पेस्ट करो — AI 5 सेकंड में बताएगा।",  tag: "AI", color: T.accent },
  { to: "/whatsapp-audit",   icon: "💬", title: "WhatsApp ग्रुप ऑडिटर",        desc: "इन्वेस्टमेंट टिप्स वाला ग्रुप जॉइन हुआ? चैट export → स्कैम pattern detect।", tag: "AI", color: "#25D366" },
  { to: "/receipt-audit",    icon: "🧾", title: "बिल / रसीद चेकर",             desc: "होटल/पेट्रोल/पार्किंग में ज़्यादा चार्ज लगा? GSTIN + CGST math वेरीफाई करो।", tag: "भारत", color: T.yellow },
  { to: "/dark-web-monitor", icon: "🕵", title: "डार्क वेब मॉनिटर",            desc: "तुम्हारा ईमेल / पासवर्ड लीक हुआ है क्या? जाँचो।",                              tag: "AI", color: T.accent },
];

const TESTIMONIALS = [
  { name: "रामेश शर्मा", city: "नाशिक", text: "मेरी माँ को scam call आया था — VRIKAAN के safe-word ने बचा लिया। ₹50,000 बच गए।" },
  { name: "प्रिया देसाई", city: "पुणे", text: "Diwali पर fake delivery का SMS आया, scam-check में paste किया तो तुरंत red आ गया। बहुत काम का app है।" },
  { name: "अंकित वर्मा", city: "दिल्ली", text: "Loan app की harassment शुरू हुई थी — loan-app-check से पता चला RBI registered नहीं था। FIR कर दी।" },
];

const FAQ = [
  { q: "क्या VRIKAAN वाकई फ्री है?", a: "हाँ। 50+ tools बिल्कुल फ्री हैं — कोई card details नहीं, कोई trial नहीं। ₹990/yr Pro plan unlimited AI scans + premium features unlock करता है। Pro भी optional है।" },
  { q: "क्या मेरा data सुरक्षित है?", a: "हाँ। ज़्यादातर tools पूरी तरह तुम्हारे browser में चलते हैं — files, voice samples, Aadhaar images कुछ भी हमारे server पर upload नहीं होता। NIST AAL2 grade 2FA। Code partially open-source GitHub पर।" },
  { q: "क्या Hindi में पूरा काम करता है?", a: "हाँ। 60+ tools EN + हिन्दी दोनों में काम करते हैं। AI scam-check और chatbot दोनों भाषाओं में जवाब देते हैं।" },
  { q: "Norton/McAfee की जगह इस्तेमाल कर सकते हैं?", a: "नहीं — साथ में इस्तेमाल करो। Windows Defender already excellent है। VRIKAAN इस्तेमाल करो India-specific scams के लिए (UPI fraud, deepfake voice, Aadhaar leak, loan app harassment) — ये कोई foreign antivirus cover नहीं करता।" },
  { q: "क्या VRIKAAN कोई हमारी जानकारी बेचता है?", a: "नहीं। हम Indian startup हैं, GSTIN के साथ रजिस्टर्ड। DPDP Act (2023) compliant। पूरी policy: vrikaan.com/privacy" },
];

export default function HindiLanding() {
  // Add lang attribute on mount so browsers + screen readers know
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = "hi";
    return () => { document.documentElement.lang = prev; };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SEO
        title="VRIKAAN · भारत का फ्री AI साइबर डिफेंस"
        description="UPI धोखाधड़ी, deepfake कॉल, Aadhaar leak, loan app harassment — 60+ tools बिल्कुल मुफ्त। हिन्दी में। SOC analysts द्वारा भारत में बनाया।"
        path="/hi"
        keywords="साइबर सुरक्षा हिन्दी, UPI धोखाधड़ी, scam check hindi, deepfake voice scam, free antivirus india hindi, vrikaan hindi, धोखाधड़ी से बचाव"
      />
      <Navbar />

      {/* Hero */}
      <header style={{
        padding: "100px 24px 60px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          width: 800, height: 600,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08), transparent 60%)",
          transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <span style={{
            display: "inline-block", padding: "6px 16px", borderRadius: 999,
            background: "rgba(20,227,197,0.10)", border: `1px solid ${T.cyan}55`,
            fontSize: 12, fontWeight: 800, letterSpacing: 1,
            color: T.cyan, marginBottom: 18,
          }}>🇮🇳 हिन्दी में · नाशिक से · बिल्कुल फ्री</span>

          <h1 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800, color: T.white, margin: "0 0 18px", lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}>
            तुम्हारा फोन एक<br />
            <span style={{
              background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>निशाना है।</span>
          </h1>

          <p style={{
            color: T.muted, fontSize: 18, maxWidth: 680, margin: "0 auto 28px",
            lineHeight: 1.7,
          }}>
            पिछले साल भारत ने <strong style={{ color: T.red }}>₹11,000 करोड़</strong> साइबर fraud में खो दिए।
            VRIKAAN के <strong style={{ color: T.cyan }}>60+ tools</strong> — UPI fraud, deepfake voice,
            Aadhaar leak, loan harassment — सब free, सब हिन्दी में, सब भारत के लिए।
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <Link to="/scam-recovery" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 12,
              background: T.red, color: "#fff", textDecoration: "none",
              fontWeight: 800, fontSize: 15, fontFamily: "'Hanken Grotesk', sans-serif",
            }}>🚨 अभी ठगा गया?</Link>
            <Link to="/scam-check" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 12,
              background: T.cyan, color: T.bg, textDecoration: "none",
              fontWeight: 800, fontSize: 15, fontFamily: "'Hanken Grotesk', sans-serif",
            }}>📝 स्कैम मैसेज चेक करो</Link>
            <Link to="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 12,
              background: "transparent", color: T.white, textDecoration: "none",
              border: `1px solid ${T.border}`,
              fontWeight: 700, fontSize: 15, fontFamily: "'Hanken Grotesk', sans-serif",
            }}>⚡ साइन अप</Link>
          </div>

          {/* Trust strip */}
          <div style={{
            display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
            color: T.muted, fontSize: 13,
          }}>
            <span>🇮🇳 भारत निर्मित</span>
            <span>🔒 NIST AAL2 2FA</span>
            <span>📜 DPDP Act compliant</span>
            <span>💸 INR Cashfree (UPI/cards)</span>
          </div>
        </div>
      </header>

      {/* Tools grid */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 999,
            background: `${T.cyan}1a`, color: T.cyan,
            border: `1px solid ${T.cyan}55`, fontSize: 11, fontWeight: 800,
            letterSpacing: 2, textTransform: "uppercase", marginBottom: 14,
          }}>12 ज़रूरी tools</span>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 800, color: T.white, margin: 0,
          }}>हर भारतीय परिवार को चाहिए।</h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {TOOLS.map(t => (
            <Link key={t.to} to={t.to} style={{ textDecoration: "none", display: "block" }}>
              <div style={{
                padding: "22px 22px 18px", borderRadius: 14,
                background: T.card, border: `1px solid ${T.border}`,
                transition: "transform 0.2s, border-color 0.2s",
                cursor: "pointer", height: "100%", position: "relative",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = t.color + "66"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.border; }}
              >
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  fontSize: 9, fontWeight: 800, letterSpacing: 1,
                  padding: "3px 8px", borderRadius: 999,
                  background: `${t.color}1a`, color: t.color,
                  border: `1px solid ${t.color}55`,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}>{t.tag}</div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${t.color}12`, border: `1px solid ${t.color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 16,
                }}>{t.icon}</div>
                <h3 style={{
                  fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 17, fontWeight: 700,
                  color: T.white, margin: "0 0 8px",
                }}>{t.title}</h3>
                <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{t.desc}</p>
                <div style={{
                  marginTop: 14, paddingTop: 10,
                  borderTop: `1px dashed ${T.border}`,
                  fontSize: 12, fontWeight: 600, color: t.color,
                }}>खोलो →</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/features" style={{
            display: "inline-block", padding: "11px 22px", borderRadius: 10,
            background: "transparent", color: T.white,
            border: `1px solid ${T.border}`, fontSize: 14, fontWeight: 600,
            textDecoration: "none", fontFamily: "'Hanken Grotesk', sans-serif",
          }}>सभी 60+ tools देखो →</Link>
        </div>
      </section>

      {/* India-first comparison */}
      <section style={{ maxWidth: 1000, margin: "60px auto 0", padding: "0 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 800, color: T.white, margin: "0 0 10px",
          }}>Norton vs McAfee vs <span style={{ color: T.cyan }}>VRIKAAN</span></h2>
          <p style={{ color: T.muted, fontSize: 14 }}>विदेशी company भारत के लिए नहीं बनी। हम भारत के लिए बने हैं।</p>
        </div>

        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
          overflow: "hidden",
        }}>
          {[
            { f: "कीमत",            v: "₹0 free",                n: "₹2,000+/साल",     m: "$40+/साल" },
            { f: "हिन्दी UI",         v: "✓ हाँ",                   n: "❌ नहीं",          m: "❌ नहीं" },
            { f: "UPI धोखाधड़ी AI",  v: "✓ हाँ",                   n: "❌",              m: "❌" },
            { f: "Aadhaar मास्क",    v: "✓ फ्री + offline",        n: "❌",              m: "❌" },
            { f: "Deepfake आवाज़",   v: "✓ फ्री tier",             n: "❌",              m: "❌" },
            { f: "MITRE ATT&CK SOC", v: "✓ फ्री tier",             n: "सिर्फ Enterprise", m: "सिर्फ Enterprise" },
            { f: "1930 हेल्पलाइन",   v: "✓ अंदर ही",                n: "❌",              m: "❌" },
            { f: "INR payment",      v: "✓ UPI/cards",            n: "विदेशी card",      m: "विदेशी card" },
          ].map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr 0.8fr",
              gap: 10, padding: "14px 20px",
              borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
              alignItems: "center", fontSize: 13,
            }} className="hi-compare-row">
              <div style={{ color: T.white, fontWeight: 600 }}>{r.f}</div>
              <div style={{ color: T.cyan, fontWeight: 700 }}>{r.v}</div>
              <div style={{ color: r.n.startsWith("❌") ? T.red : T.muted }}>{r.n}</div>
              <div style={{ color: r.m.startsWith("❌") ? T.red : T.muted }}>{r.m}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1100, margin: "30px auto 0", padding: "0 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800, color: T.white, margin: 0,
          }}>हमारे users क्या कहते हैं</h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              padding: 22, borderRadius: 14,
              background: T.card, border: `1px solid ${T.border}`,
            }}>
              <div style={{
                color: T.cyan, fontSize: 32, lineHeight: 1, marginBottom: 8,
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>"</div>
              <p style={{ color: T.white, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>{t.text}</p>
              <div style={{
                paddingTop: 12, borderTop: `1px solid ${T.border}`,
                color: T.muted, fontSize: 12,
              }}>
                <strong style={{ color: T.white }}>— {t.name}</strong> · {t.city}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 820, margin: "30px auto 0", padding: "0 24px 60px" }}>
        <h2 style={{
          fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "clamp(26px, 4vw, 36px)",
          fontWeight: 800, color: T.white, margin: "0 0 24px", textAlign: "center",
        }}>आम सवाल</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {FAQ.map((f, i) => (
            <details key={i} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "16px 20px", cursor: "pointer",
            }}>
              <summary style={{
                color: T.white, fontWeight: 700, fontSize: 15,
                listStyle: "none", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 12,
              }}>
                <span>{f.q}</span>
                <span style={{ color: T.cyan, fontSize: 20 }}>+</span>
              </summary>
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: `1px solid ${T.border}`,
                color: T.muted, fontSize: 14, lineHeight: 1.7,
              }}>{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "40px 24px 80px" }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", padding: 36, borderRadius: 22, textAlign: "center",
          background: `linear-gradient(135deg, ${T.accent}1a, ${T.cyan}1a)`,
          border: `1px solid ${T.cyan}55`,
        }}>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 30, fontWeight: 800,
            color: T.white, margin: "0 0 12px",
          }}>आज ही शुरू करो</h2>
          <p style={{ color: T.muted, fontSize: 15, margin: "0 0 24px", lineHeight: 1.7 }}>
            कोई card नहीं, कोई trial नहीं। 60+ tools तुरंत free में।
            परिवार के साथ share करो — हर भारतीय को सुरक्षित होना चाहिए।
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{
              padding: "14px 30px", borderRadius: 12,
              background: T.cyan, color: T.bg, textDecoration: "none",
              fontWeight: 800, fontSize: 15, fontFamily: "'Hanken Grotesk', sans-serif",
            }}>⚡ Free साइन अप</Link>
            <Link to="/" style={{
              padding: "14px 30px", borderRadius: 12,
              background: "transparent", color: T.white, textDecoration: "none",
              border: `1px solid ${T.border}`,
              fontWeight: 600, fontSize: 15, fontFamily: "'Hanken Grotesk', sans-serif",
            }}>English version →</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .hi-compare-row { grid-template-columns: 1.5fr 1fr !important; }
          .hi-compare-row > div:nth-child(3),
          .hi-compare-row > div:nth-child(4) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
