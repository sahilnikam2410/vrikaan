import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LuCopy, LuCheck, LuDownload, LuPhone, LuExternalLink, LuShieldAlert } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, Input, T, alpha } from "../../components/ui";

const TYPES = [
  "UPI / bank fraud", "Phishing link / fake website", "Loan-app harassment",
  "Job / task scam", "Investment / crypto scam", "Lottery / prize scam",
  "Fake police / digital arrest", "Deepfake / AI voice", "Other",
];

export default function FileComplaint() {
  const [f, setF] = useState({ type: TYPES[0], amount: "", upi: "", phone: "", date: "", desc: "", name: "", city: "" });
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const letter = useMemo(() => {
    const L = [];
    L.push(`SUBJECT: Complaint regarding ${f.type} — online financial fraud`);
    L.push("");
    L.push(`To: National Cyber Crime Reporting Portal (cybercrime.gov.in) / Cyber Crime Helpline 1930`);
    L.push("");
    L.push(`I, ${f.name || "[your name]"}${f.city ? `, resident of ${f.city}` : ""}, wish to report a cyber-fraud incident.`);
    L.push("");
    L.push(`Type of fraud: ${f.type}`);
    if (f.date) L.push(`Date of incident: ${f.date}`);
    if (f.amount) L.push(`Amount lost: ₹${f.amount}`);
    if (f.upi) L.push(`Fraudster UPI ID / account: ${f.upi}`);
    if (f.phone) L.push(`Fraudster phone number: ${f.phone}`);
    L.push("");
    L.push("Description of incident:");
    L.push(f.desc || "[Describe what happened — how you were contacted, what you were told, what you shared or paid.]");
    L.push("");
    L.push("I request immediate action to freeze the fraudulent account, trace the transaction, and assist in recovery. I am ready to provide screenshots, transaction IDs and bank statements as evidence.");
    L.push("");
    L.push(`Reported via VRIKAAN (vrikaan.com). ${f.name || "[your name]"}`);
    return L.join("\n");
  }, [f]);

  const copy = async () => { try { await navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  const download = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `VRIKAAN-cyber-complaint.txt`; a.click(); URL.revokeObjectURL(a.href);
  };

  const lbl = { fontFamily: "var(--font-body)", fontSize: 13, color: T.muted, marginBottom: 6, display: "block" };
  const fieldStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(148,163,184,0.05)", border: `1px solid ${T.border}`, color: T.white, fontFamily: "var(--font-body)", fontSize: 14 };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO title="File a Cyber-Fraud Complaint (1930) — Free Helper | VRIKAAN" description="Generate a ready-to-submit cyber-crime complaint for India's 1930 helpline & cybercrime.gov.in. Free step-by-step recovery guide after a UPI, loan-app or phishing scam." path="/file-complaint" />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120 }}>
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 12px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 100, border: `1px solid ${alpha("#ef4444", 0.35)}`, background: alpha("#ef4444", 0.08), color: "#ef4444", fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
            <LuShieldAlert size={15} /> Just got scammed? Act in the first 24h
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, color: T.white, margin: "0 0 14px", lineHeight: 1.06 }}>
            File your complaint in <span style={{ color: T.cyan }}>minutes</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, color: T.muted, lineHeight: 1.6 }}>
            Fill the details — we generate a ready complaint for the <strong style={{ color: T.white }}>1930</strong> helpline and <strong style={{ color: T.white }}>cybercrime.gov.in</strong>. Speed improves your chance of recovery.
          </p>
        </div>

        {/* urgent action band */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, maxWidth: 980, margin: "26px auto" }}>
          <a href="tel:1930" style={{ textDecoration: "none" }}><Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}><LuPhone size={22} color={T.cyan} /><div><div style={{ color: T.white, fontWeight: 700, fontFamily: "var(--font-body)" }}>Call 1930 now</div><div style={{ color: T.muted, fontSize: 12 }}>National cyber-fraud helpline</div></div></Card></a>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}><LuExternalLink size={22} color={T.cyan} /><div><div style={{ color: T.white, fontWeight: 700, fontFamily: "var(--font-body)" }}>cybercrime.gov.in</div><div style={{ color: T.muted, fontSize: 12 }}>Official reporting portal</div></div></Card></a>
          <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}><LuCheck size={22} color="#22c55e" /><div><div style={{ color: T.white, fontWeight: 700, fontFamily: "var(--font-body)" }}>Tell your bank</div><div style={{ color: T.muted, fontSize: 12 }}>Freeze card / block UPI</div></div></Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 980, margin: "0 auto", alignItems: "start" }} className="fc-grid">
          {/* form */}
          <Card style={{ padding: 24 }}>
            <label style={lbl}>Type of fraud</label>
            <select value={f.type} onChange={set("type")} style={{ ...fieldStyle, marginBottom: 14 }}>
              {TYPES.map((t) => <option key={t} value={t} style={{ background: "#0b1220" }}>{t}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><label style={lbl}>Amount lost (₹)</label><input style={fieldStyle} value={f.amount} onChange={set("amount")} placeholder="50000" /></div>
              <div><label style={lbl}>Date</label><input style={fieldStyle} value={f.date} onChange={set("date")} placeholder="14 Jun 2026" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><label style={lbl}>Scammer UPI / account</label><input style={fieldStyle} value={f.upi} onChange={set("upi")} placeholder="fraud@okaxis" /></div>
              <div><label style={lbl}>Scammer phone</label><input style={fieldStyle} value={f.phone} onChange={set("phone")} placeholder="+91…" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><label style={lbl}>Your name</label><input style={fieldStyle} value={f.name} onChange={set("name")} placeholder="Full name" /></div>
              <div><label style={lbl}>Your city</label><input style={fieldStyle} value={f.city} onChange={set("city")} placeholder="Pune" /></div>
            </div>
            <label style={lbl}>What happened</label>
            <textarea value={f.desc} onChange={set("desc")} rows={4} style={{ ...fieldStyle, resize: "vertical", fontFamily: "var(--font-body)" }} placeholder="They called claiming to be from my bank, said my KYC expired, sent a link…" />
          </Card>

          {/* preview */}
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: T.white }}>Your complaint</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, background: copied ? "rgba(34,197,94,0.12)" : alpha(T.cyan, 0.12), border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : alpha(T.cyan, 0.3)}`, color: copied ? "#22c55e" : T.cyan, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{copied ? <LuCheck size={14} /> : <LuCopy size={14} />}{copied ? "Copied" : "Copy"}</button>
                <button onClick={download} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, color: T.white, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><LuDownload size={14} /> .txt</button>
              </div>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6, margin: 0, maxHeight: 420, overflow: "auto" }}>{letter}</pre>
          </Card>
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <p style={{ color: T.mutedDark, fontSize: 13, marginBottom: 10 }}>Keep all evidence — screenshots, transaction IDs, the scammer's number. Submit the complaint above at cybercrime.gov.in or read it to 1930.</p>
          <Link to="/scam-dna" style={{ color: T.cyan, fontWeight: 700, textDecoration: "none" }}>Also report the scammer to Scam DNA → protect others</Link>
        </div>
      </Section>
      <style>{`@media (max-width: 760px){ .fc-grid{ grid-template-columns: 1fr !important; } }`}</style>
      <Footer />
    </div>
  );
}
