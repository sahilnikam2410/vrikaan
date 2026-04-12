import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const SUBJECTS = ["General Inquiry", "Technical Support", "Partnership", "Bug Report", "Feature Request"];

const CONTACT_INFO = [
  { icon: "\u2709\uFE0F", label: "Email", value: "secuvion@gmail.com", sub: "We typically respond within 24 hours" },
  { icon: "\uD83D\uDCDE", label: "Phone", value: "+91 8329935878", sub: "Available 24/7" },
  { icon: "\uD83D\uDCCD", label: "Location", value: "Nashik, Maharashtra, India", sub: "Serving clients globally" },
  { icon: "\uD83D\uDD52", label: "Hours", value: "24/7", sub: "Always available for support" },
];

const SOCIALS = [
  { name: "GitHub", url: "https://github.com/sahilnikam2410", svg: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.337-2.22-.252-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/sahil-nikam-", svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { name: "X (Twitter)", url: "https://x.com/secuvion", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Instagram", url: "https://instagram.com/secuvion", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
];

const FAQS = [
  { q: "What is SECUVION?", a: "SECUVION is a comprehensive cybersecurity platform that provides tools for dark web monitoring, vulnerability scanning, password management, and security education. We help individuals and organizations stay protected against evolving cyber threats." },
  { q: "Is SECUVION free to use?", a: "We offer a free tier that gives you access to basic security tools and educational content. Premium plans unlock advanced features such as AI-powered threat analysis, unlimited dark web monitoring, and priority support." },
  { q: "How does dark web monitoring work?", a: "Our dark web monitoring system continuously scans underground forums, data breach databases, and paste sites for your email addresses and credentials. If a match is found, you receive an instant alert with recommended actions." },
  { q: "How do I report a security vulnerability?", a: "We take security seriously. Please use the dedicated 'Report a Vulnerability' section on this page, or email secuvion@gmail.com with a detailed description. We follow responsible disclosure practices and acknowledge all valid reports." },
  { q: "What data do you collect from users?", a: "We collect only the minimum data needed to provide our services: your email, display name, and usage analytics. We never sell your data to third parties. Full details are available in our Privacy Policy." },
  { q: "Can I use SECUVION for my organization?", a: "Absolutely. We offer team and enterprise plans with centralized dashboards, role-based access control, and dedicated account managers. Contact us via the Partnership subject option for a tailored proposal." },
  { q: "Which browsers and devices are supported?", a: "SECUVION works on all modern browsers including Chrome, Firefox, Safari, and Edge. Our responsive design ensures a seamless experience on desktops, tablets, and mobile devices." },
  { q: "How quickly do you respond to support requests?", a: "Standard support requests are answered within 24 hours on business days. Premium plan holders receive priority responses within 4 hours. Emergency security incidents are triaged immediately regardless of plan." },
];

const inputBase = {
  width: "100%", padding: "14px 18px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
  borderRadius: 10, color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14,
  outline: "none", transition: "border-color 0.3s", boxSizing: "border-box",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletter, setNewsletter] = useState("");
  const [nlSubmitted, setNlSubmitted] = useState(false);
  const [vulnForm, setVulnForm] = useState({ email: "", type: "", details: "" });
  const [vulnSent, setVulnSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.subject) e.subject = true;
    if (!form.message.trim()) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && publicKey) {
      try {
        const { default: emailjs } = await import("@emailjs/browser");
        await emailjs.send(serviceId, "template_i4z3gra", {
          name: form.name,
          from_name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }, publicKey);
        setSending(false);
        setSent(true);
      } catch (err) {
        console.error("EmailJS error:", err);
        setSending(false);
        alert("Failed to send email: " + (err?.text || err?.message || "Unknown error"));
      }
    } else {
      console.warn("EmailJS not configured. VITE_EMAILJS_SERVICE_ID:", serviceId, "VITE_EMAILJS_PUBLIC_KEY:", publicKey ? "set" : "missing");
      setSending(false);
      alert("Email service not configured. Please add VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_PUBLIC_KEY to Vercel environment variables.");
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletter.trim() || !/\S+@\S+\.\S+/.test(newsletter)) return;
    setNlSubmitted(true);
  };

  const handleVulnSubmit = (e) => {
    e.preventDefault();
    if (!vulnForm.email.trim() || !vulnForm.details.trim()) return;
    setVulnSent(true);
  };

  const resetForm = () => {
    setSent(false);
    setErrors({});
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const fieldStyle = (key) => ({
    ...inputBase,
    borderColor: errors[key] ? T.red : T.border,
  });

  const heading = (size) => ({ fontFamily: "'Space Grotesk', sans-serif", fontSize: size, fontWeight: 700, letterSpacing: "-0.03em", color: T.white, margin: 0 });
  const cardStyle = { background: T.card, border: `1px solid ${T.border}`, backdropFilter: "blur(10px)", borderRadius: 14, padding: 28 };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Contact Us - SECUVION" description="Get in touch with the SECUVION team for support, partnerships, security reports, or general inquiries." path="/contact" />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 60 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${T.accent}18 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "0 24px", position: "relative" }}>
          <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accentSoft, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>Contact Us</span>
          <h1 style={{ ...heading("clamp(38px, 5vw, 56px)"), marginBottom: 18, lineHeight: 1.15 }}>Get in Touch</h1>
          <p style={{ color: T.muted, fontSize: 17, lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
            Have a question, need support, or want to explore a partnership? We are here to help. Reach out and our team will get back to you promptly.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, padding: "8px 18px", borderRadius: 100, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}60`, animation: "pulse-dot 2s ease infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>We're Online</span>
            <span style={{ fontSize: 12, color: T.muted }}>· Avg. response: 2 hours</span>
          </div>
        </div>
      </section>

      {/* ── Contact Form + Info Cards ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "start" }}>

          {/* Left: Form */}
          <div style={{ ...cardStyle, padding: 36 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${T.green}14`, border: `2px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32, color: T.green }}>&#10003;</div>
                <h3 style={{ ...heading(24), marginBottom: 10 }}>Message Sent Successfully</h3>
                <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: "0 auto 28px" }}>Thank you for reaching out. Our team will review your message and respond within 24 hours.</p>
                <button onClick={resetForm} style={{ padding: "12px 28px", background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 10, color: T.accentSoft, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, transition: "all 0.3s" }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 style={{ ...heading(22), marginBottom: 6 }}>Send Us a Message</h3>
                <p style={{ color: T.mutedDark, fontSize: 13, marginBottom: 28, marginTop: 0 }}>Fields marked with * are required.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: 0.3 }}>Full Name *</label>
                    <input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fieldStyle("name")}
                      onFocus={e => { e.target.style.borderColor = T.accent + "50"; }} onBlur={e => { if (!errors.name) e.target.style.borderColor = T.border; }} />
                    {errors.name && <span style={{ fontSize: 11, color: T.red, marginTop: 4, display: "block" }}>Please enter your name</span>}
                  </div>
                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: 0.3 }}>Email Address *</label>
                    <input placeholder="john@example.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={fieldStyle("email")}
                      onFocus={e => { e.target.style.borderColor = T.accent + "50"; }} onBlur={e => { if (!errors.email) e.target.style.borderColor = T.border; }} />
                    {errors.email && <span style={{ fontSize: 11, color: T.red, marginTop: 4, display: "block" }}>Please enter a valid email</span>}
                  </div>
                  {/* Subject */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: 0.3 }}>Subject *</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ ...fieldStyle("subject"), cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
                      <option value="" style={{ background: T.surface }}>Select a subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s} style={{ background: T.surface }}>{s}</option>)}
                    </select>
                    {errors.subject && <span style={{ fontSize: 11, color: T.red, marginTop: 4, display: "block" }}>Please select a subject</span>}
                  </div>
                  {/* Message */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6, letterSpacing: 0.3 }}>Message *</label>
                    <textarea placeholder="Describe your question or request in detail..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5}
                      style={{ ...fieldStyle("message"), resize: "vertical", minHeight: 130 }}
                      onFocus={e => { e.target.style.borderColor = T.accent + "50"; }} onBlur={e => { if (!errors.message) e.target.style.borderColor = T.border; }} />
                    {errors.message && <span style={{ fontSize: 11, color: T.red, marginTop: 4, display: "block" }}>Please enter your message</span>}
                  </div>
                  {/* Submit */}
                  <button type="submit" disabled={sending}
                    style={{ padding: "15px 36px", background: sending ? T.mutedDark : `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s", opacity: sending ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {sending ? (
                      <>
                        <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                        Sending...
                      </>
                    ) : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CONTACT_INFO.map((c, i) => (
              <div key={i} style={{ ...cardStyle, padding: "22px 24px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${T.accent}0a`, border: `1px solid ${T.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.mutedDark, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 2 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{c.sub}</div>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div style={{ ...cardStyle, padding: "22px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 }}>Follow Us</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 9, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}`, fontSize: 13, color: T.muted, textDecoration: "none", cursor: "pointer", transition: "all 0.25s", fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent + "40"; e.currentTarget.style.color = T.white; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.svg} /></svg>
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.cyan}0c`, border: `1px solid ${T.cyan}20`, fontSize: 11, fontWeight: 600, color: T.cyan, marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>FAQ</span>
          <h2 style={{ ...heading("clamp(28px, 3vw, 38px)"), marginBottom: 12 }}>Frequently Asked Questions</h2>
          <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7 }}>Quick answers to common questions about SECUVION.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...cardStyle, padding: 0, overflow: "hidden", cursor: "pointer", transition: "border-color 0.3s", borderColor: openFaq === i ? T.accent + "30" : T.border }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? T.white : T.muted, transition: "color 0.3s" }}>{faq.q}</span>
                <span style={{ fontSize: 20, color: T.mutedDark, transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0, lineHeight: 1 }}>+</span>
              </div>
              <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: T.muted, lineHeight: 1.8 }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Report a Vulnerability ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden", border: `1px solid ${T.red}18` }}>
          <div style={{ background: `linear-gradient(135deg, ${T.red}08, ${T.red}03)`, padding: "32px 36px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.red}14`, border: `1px solid ${T.red}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              </div>
              <div>
                <h3 style={{ ...heading(20), color: T.white }}>Report a Vulnerability</h3>
                <p style={{ color: T.muted, fontSize: 13, margin: "4px 0 0" }}>For security researchers and responsible disclosure</p>
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 36px 32px" }}>
            {vulnSent ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 28, color: T.green, marginBottom: 12 }}>&#10003;</div>
                <h4 style={{ ...heading(18), marginBottom: 8 }}>Report Submitted</h4>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>Thank you for helping us stay secure. Our security team will triage your report and respond within 48 hours.</p>
              </div>
            ) : (
              <>
                <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.8, margin: "0 0 20px" }}>
                  We value the work of security researchers. If you have discovered a vulnerability in any SECUVION service,
                  please report it responsibly. We commit to acknowledging your report within 48 hours, keeping you informed
                  on progress, and crediting you publicly (if desired) once the issue is resolved.
                </p>
                <form onSubmit={handleVulnSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="vuln-grid">
                    <input placeholder="Your email *" type="email" value={vulnForm.email} onChange={e => setVulnForm({ ...vulnForm, email: e.target.value })} style={inputBase}
                      onFocus={e => { e.target.style.borderColor = T.red + "50"; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                    <select value={vulnForm.type} onChange={e => setVulnForm({ ...vulnForm, type: e.target.value })} style={{ ...inputBase, cursor: "pointer" }}>
                      <option value="" style={{ background: T.surface }}>Vulnerability type</option>
                      <option value="xss" style={{ background: T.surface }}>Cross-Site Scripting (XSS)</option>
                      <option value="sqli" style={{ background: T.surface }}>SQL Injection</option>
                      <option value="auth" style={{ background: T.surface }}>Authentication Bypass</option>
                      <option value="idor" style={{ background: T.surface }}>Insecure Direct Object Reference</option>
                      <option value="rce" style={{ background: T.surface }}>Remote Code Execution</option>
                      <option value="other" style={{ background: T.surface }}>Other</option>
                    </select>
                  </div>
                  <textarea placeholder="Describe the vulnerability, steps to reproduce, and potential impact *" value={vulnForm.details} onChange={e => setVulnForm({ ...vulnForm, details: e.target.value })} rows={4}
                    style={{ ...inputBase, resize: "vertical", minHeight: 100 }}
                    onFocus={e => { e.target.style.borderColor = T.red + "50"; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <span style={{ fontSize: 12, color: T.mutedDark, fontFamily: "'JetBrains Mono', monospace" }}>PGP key available at /security.txt</span>
                    <button type="submit" style={{ padding: "12px 28px", background: `${T.red}14`, border: `1px solid ${T.red}30`, borderRadius: 10, color: T.red, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, transition: "all 0.3s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${T.red}22`; }} onMouseLeave={e => { e.currentTarget.style.background = `${T.red}14`; }}>
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Newsletter Signup ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ ...cardStyle, textAlign: "center", padding: "48px 36px", background: `linear-gradient(135deg, ${T.card}, rgba(99,102,241,0.04))`, border: `1px solid ${T.accent}12` }}>
          {nlSubmitted ? (
            <div>
              <div style={{ fontSize: 28, color: T.green, marginBottom: 12 }}>&#10003;</div>
              <h3 style={{ ...heading(22), marginBottom: 8 }}>You're Subscribed</h3>
              <p style={{ color: T.muted, fontSize: 14 }}>You will receive our latest cybersecurity insights and updates.</p>
            </div>
          ) : (
            <>
              <h3 style={{ ...heading("clamp(24px, 3vw, 32px)"), marginBottom: 10 }}>Stay Ahead of Threats</h3>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px" }}>
                Subscribe to our newsletter for the latest cybersecurity insights, product updates, and security advisories delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", gap: 12, maxWidth: 480, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }} className="nl-form">
                <input placeholder="Enter your email address" type="email" value={newsletter} onChange={e => setNewsletter(e.target.value)}
                  style={{ ...inputBase, flex: 1, minWidth: 220 }}
                  onFocus={e => { e.target.style.borderColor = T.accent + "50"; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <button type="submit" style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.3s", whiteSpace: "nowrap" }}>
                  Subscribe
                </button>
              </form>
              <p style={{ color: T.mutedDark, fontSize: 11, marginTop: 14, marginBottom: 0 }}>No spam, ever. Unsubscribe at any time.</p>
            </>
          )}
        </div>
      </section>

      {/* ── Global Presence ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accentSoft, marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>Global Reach</span>
          <h2 style={{ ...heading("clamp(24px, 3vw, 32px)"), marginBottom: 10 }}>Serving Users Worldwide</h2>
          <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7 }}>Headquartered in Pune, India — protecting users across 84 countries.</p>
        </div>
        <div className="contact-presence-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { region: "Asia Pacific", users: "28K+", flag: "\uD83C\uDF0F", status: "Primary Hub" },
            { region: "Europe", users: "12K+", flag: "\uD83C\uDF0D", status: "Expanding" },
            { region: "Americas", users: "8K+", flag: "\uD83C\uDF0E", status: "Growing" },
          ].map((r, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{r.flag}</div>
              <h4 style={{ ...heading(16), marginBottom: 4 }}>{r.region}</h4>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: T.cyan, margin: "8px 0 4px" }}>{r.users}</div>
              <div style={{ fontSize: 12, color: T.muted }}>Active Users</div>
              <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", borderRadius: 6, background: `${T.accent}0a`, border: `1px solid ${T.accent}18`, fontSize: 10, fontWeight: 600, color: T.accent }}>{r.status}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .vuln-grid { grid-template-columns: 1fr !important; }
          .contact-presence-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
