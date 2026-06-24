import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LuShieldCheck, LuQrCode, LuMapPin, LuSiren, LuBadgeCheck, LuUsers, LuHeartPulse, LuScanLine, LuChevronDown } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const SAFFRON = "#f97316";
const KUMBH_DATE = new Date("2027-07-01T00:00:00+05:30");

// Countdown to Simhastha 2027
function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, KUMBH_DATE - Date.now());
      setT({ d: Math.floor(ms / 86400000), h: Math.floor(ms / 3600000) % 24, m: Math.floor(ms / 60000) % 60, s: Math.floor(ms / 1000) % 60 });
    };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);
  const box = (n, l) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,40px)", fontWeight: 800, color: SAFFRON, fontVariantNumeric: "tabular-nums", minWidth: 64 }}>{String(n).padStart(2, "0")}</div>
      <div style={{ fontSize: 11, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
    </div>
  );
  return (
    <div style={{ display: "inline-flex", gap: "clamp(10px,3vw,24px)", padding: "16px 24px", borderRadius: 16, background: alpha(SAFFRON, 0.06), border: `1px solid ${alpha(SAFFRON, 0.25)}`, marginTop: 26 }}>
      {box(t.d, "days")}{box(t.h, "hrs")}{box(t.m, "min")}{box(t.s, "sec")}
    </div>
  );
}

// Count-up on scroll
function CountUp({ to, suffix = "", dur = 1600 }) {
  const [n, setN] = useState(0); const ref = useRef(null); const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !done.current) {
        done.current = true; const t0 = performance.now();
        const step = (now) => { const p = Math.min(1, (now - t0) / dur); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to, dur]);
  return <span ref={ref}>{n.toLocaleString("en-IN")}{suffix}</span>;
}

const FAQS = [
  ["How does the QR band reunite a lost person?", "Anyone — a volunteer, police officer or stranger — scans the band's QR. It instantly shows the registered family contact and sends them an alert with the help-desk location. No phone or shared language needed."],
  ["Is my data safe?", "Yes. The band stores only what you choose (a contact + optional medical note). It's encrypted, never sold, and powered by VRIKAAN's security stack. You control and can wipe it anytime."],
  ["How does it stop donation fraud?", "Open the app, scan any donation/UPI QR before paying — VRIKAAN's Scam DNA network instantly flags fake or look-alike QR codes used to divert devotees' money."],
  ["What does it cost pilgrims?", "The band is ₹50. The safety app — lost-&-found, fake-QR guard, SOS, crowd alerts — is completely free."],
  ["We're a govt body / CSR sponsor — how do we partner?", "Pick 'Sponsor / Govt' in the form or email hello@vrikaan.com. We make VRIKAAN your official Kumbh safety partner: you fund/endorse, we build and run it."],
];
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {FAQS.map(([q, a], i) => (
        <Card key={i} style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
          <div onClick={() => setOpen(open === i ? -1 : i)} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ flex: 1, fontWeight: 600, color: T.white, fontSize: 15.5 }}>{q}</span>
            <LuChevronDown size={18} color={T.cyan} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
          </div>
          {open === i && <div style={{ padding: "0 20px 18px", color: T.muted, fontSize: 14.5, lineHeight: 1.65 }}>{a}</div>}
        </Card>
      ))}
    </div>
  );
}

export default function KumbhKavach() {
  const [f, setF] = useState({ name: "", phone: "", email: "", role: "Pilgrim" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !/^\d{10}$/.test(f.phone.replace(/\D/g, "").slice(-10))) { setErr("Name + valid 10-digit phone needed."); return; }
    setErr("");
    try {
      await fetch("/api/tools?tool=enterprise-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(), email: f.email.trim() || `${f.phone.replace(/\D/g, "")}@kumbh.vrikaan`,
          company: `Kumbh Kavach — ${f.role}`, role: f.role, tier: "kumbh-kavach",
          message: `Phone: ${f.phone} · Interest: ${f.role} · Simhastha 2027 pre-register`,
        }),
      });
    } catch { /* best-effort */ }
    setSent(true);
  };

  const steps = [
    [LuQrCode, "Wear the Kavach band", "Every pilgrim gets a ₹50 QR wristband — family contact, medical info, language."],
    [LuScanLine, "Lost? Anyone scans it", "A volunteer, police or stranger scans the QR — sees who to call instantly."],
    [LuHeartPulse, "Reunited in minutes", "Auto-alert to family + nearest help desk. No phone, no language barrier needed."],
  ];
  const feats = [
    [LuUsers, "AI Lost & Found", "Crore-scale reunion network — photo + QR + help-desk boards."],
    [LuQrCode, "Fake-QR donation guard", "Scan any donation/UPI QR — we flag fakes before you pay."],
    [LuSiren, "One-tap SOS", "Instant alert to police control room + 1930 cyber helpline."],
    [LuBadgeCheck, "Verified vendors & stays", "Book only vetted hotels, guides, transport — no fraud."],
    [LuMapPin, "Crowd & route alerts", "Live density + safe-route guidance to avoid stampede zones."],
    [LuShieldCheck, "Scam DNA shield", "Powered by VRIKAAN's national scam-intel network."],
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title="Kumbh Kavach — Pilgrim Safety at Simhastha Nashik 2027 | VRIKAAN"
        description="At Simhastha Kumbh Nashik 2027, no family gets lost. Kumbh Kavach by VRIKAAN — QR safety band + lost-&-found + fake-QR donation guard + SOS. Pre-register or become a safety partner."
        path="/kumbh-kavach"
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, textAlign: "center", maxWidth: 900 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 100, border: `1px solid ${alpha(SAFFRON, 0.4)}`, background: alpha(SAFFRON, 0.1), color: SAFFRON, fontSize: 14, fontWeight: 700, marginBottom: 22 }}>🪔 Simhastha Kumbh · Nashik 2027</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5.5vw,60px)", color: T.white, margin: 0, lineHeight: 1.08 }}>
          कुंभ कवच — <span style={{ color: T.cyan }}>no family gets lost.</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 18, lineHeight: 1.7, maxWidth: 720, margin: "18px auto 0" }}>
          10 crore pilgrims. Thousands separated every day. <b style={{ color: T.white }}>Kumbh Kavach</b> by VRIKAAN — a ₹50 QR safety band + free app that reunites families, blocks fake-donation QR scams, and brings instant SOS.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          <a href="#preregister" style={btn(T.cyan, true)}>Pre-register a band</a>
          <a href="#partner" style={btn(SAFFRON, false)}>Become a safety partner</a>
        </div>
        <div><Countdown /></div>
        <div style={{ marginTop: 26, color: T.mutedDark, fontSize: 13, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <span>🛡 Powered by VRIKAAN Scam DNA</span><span>·</span><span>SOC analysts</span><span>·</span><span>★ Cyber 50</span><span>·</span><span>Made in Nashik</span>
        </div>
      </Section>

      {/* How it works */}
      <Section style={{ maxWidth: 1000 }}>
        <h2 style={h2}>Scan. Reunite. Protect.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {steps.map(([Ic, t, d], i) => (
            <Card key={i} style={{ padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: alpha(T.cyan, 0.12), border: `1px solid ${alpha(T.cyan, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={24} color={T.cyan} /></span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: alpha(T.cyan, 0.5) }}>{i + 1}</span>
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, color: T.white, marginBottom: 6 }}>{t}</div>
              <div style={{ color: T.muted, fontSize: 14.5, lineHeight: 1.6 }}>{d}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section style={{ maxWidth: 1100 }}>
        <h2 style={h2}>One band. Total safety.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {feats.map(([Ic, t, d], i) => (
            <Card key={i} style={{ padding: 22, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 11, background: alpha(T.cyan, 0.12), border: `1px solid ${alpha(T.cyan, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={22} color={T.cyan} /></span>
              <div><div style={{ fontSize: 17, fontWeight: 700, color: T.white, marginBottom: 4 }}>{t}</div><div style={{ color: T.muted, fontSize: 14, lineHeight: 1.55 }}>{d}</div></div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Scale band */}
      <Section style={{ maxWidth: 900 }}>
        <Card style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 18, textAlign: "center" }}>
            {[["10 cr", "pilgrims expected"], ["₹50", "per Kavach band"], ["< 5 min", "avg reunion target"], ["24×7", "police + 1930 SOS"]].map(([n, l], i) => (
              <div key={i}><div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: T.cyan }}>{n}</div><div style={{ color: T.muted, fontSize: 13.5, marginTop: 4 }}>{l}</div></div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Live impact */}
      <Section style={{ maxWidth: 900 }}>
        <Card style={{ padding: 30, textAlign: "center", border: `1px solid ${alpha(SAFFRON, 0.3)}` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,7vw,68px)", fontWeight: 800, color: SAFFRON }}>
            <CountUp to={50000000} />+
          </div>
          <div style={{ color: T.white, fontSize: 17, marginTop: 6 }}>safety touchpoints targeted for Simhastha 2027</div>
          <div style={{ color: T.muted, fontSize: 14, marginTop: 4 }}>Bands · scans · fraud blocks · SOS — one protective layer for every pilgrim.</div>
        </Card>
      </Section>

      {/* FAQ */}
      <Section style={{ maxWidth: 760 }}>
        <h2 style={h2}>Questions, answered</h2>
        <Faq />
      </Section>

      {/* Pre-register form */}
      <Section id="preregister" style={{ maxWidth: 620 }}>
        <h2 style={h2}>Pre-register</h2>
        <Card style={{ padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: 16 }}>
              <LuShieldCheck size={42} color="#22c55e" style={{ margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: T.white }}>You're on the list 🪔</div>
              <p style={{ color: T.muted, marginTop: 8, fontSize: 14.5 }}>We'll notify you when Kumbh Kavach bands open for Simhastha 2027. Stay safe.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Pilgrim", "Volunteer", "Sponsor / Govt", "Vendor"].map((r) => (
                  <button type="button" key={r} onClick={() => setF({ ...f, role: r })} style={{ padding: "8px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: f.role === r ? alpha(T.cyan, 0.16) : "transparent", border: `1px solid ${f.role === r ? T.cyan : alpha("#94a3b8", 0.25)}`, color: f.role === r ? T.cyan : T.muted }}>{r}</button>
                ))}
              </div>
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name *" style={inp} />
              <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone (10-digit) *" style={inp} />
              <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email (optional)" style={inp} />
              {err && <div style={{ color: "#ef4444", fontSize: 13 }}>{err}</div>}
              <button type="submit" style={{ ...btn(T.cyan, true), border: "none", cursor: "pointer", justifyContent: "center" }}>Reserve my Kavach →</button>
            </form>
          )}
        </Card>
        <div id="partner" style={{ textAlign: "center", marginTop: 30, color: T.muted, fontSize: 14.5, lineHeight: 1.7 }}>
          <b style={{ color: T.white }}>Govt, police or CSR sponsor?</b> Make VRIKAAN your official Kumbh safety partner.<br />
          Pick <b style={{ color: SAFFRON }}>Sponsor / Govt</b> above, or email <a href="mailto:hello@vrikaan.com" style={{ color: T.cyan }}>hello@vrikaan.com</a>.
        </div>
      </Section>
      <Footer />
    </div>
  );
}
const h2 = { fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,32px)", color: "#f1f5f9", textAlign: "center", marginBottom: 26 };
const inp = { padding: "13px 15px", borderRadius: 10, background: alpha("#94a3b8", 0.06), border: `1px solid ${alpha("#94a3b8", 0.2)}`, color: "#f1f5f9", fontSize: 15, outline: "none" };
const btn = (col, solid) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 12, background: solid ? col : alpha(col, 0.12), border: `1px solid ${alpha(col, solid ? 1 : 0.4)}`, color: solid ? "#04110e" : col, fontWeight: 800, fontSize: 16, textDecoration: "none" });
