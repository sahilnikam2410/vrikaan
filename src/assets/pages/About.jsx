import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8",
  mutedDark: "#64748b", accent: "#6366f1", accentSoft: "#818cf8",
  cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)",
  card: "rgba(17,24,39,0.6)", surface: "#111827",
};

const heading = (size) => ({
  fontFamily: "'Space Grotesk', sans-serif", fontSize: size, fontWeight: 700,
  letterSpacing: "-0.03em", margin: 0, color: T.white,
});

const gradientText = {
  background: "linear-gradient(135deg, #6366f1, #14e3c5)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
};

const sectionGap = { marginBottom: 100 };

const cardBase = {
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
  padding: 32, backdropFilter: "blur(10px)",
};

const badge = (color) => ({
  display: "inline-block", padding: "5px 14px", borderRadius: 100,
  background: `${color}0c`, border: `1px solid ${color}20`,
  fontSize: 11, fontWeight: 600, color, letterSpacing: 0.5, marginBottom: 16,
});

const STATS = [
  { val: "2.8M+", label: "Threats Blocked", color: T.cyan },
  { val: "50K+", label: "Users Protected", color: T.accent },
  { val: "99.7%", label: "Detection Rate", color: T.green },
  { val: "24/7", label: "Monitoring", color: "#f97316" },
];

const VALUES = [
  {
    icon: "\uD83D\uDCA1", title: "Innovation", color: T.accent,
    desc: "We push the boundaries of what cybersecurity can achieve by leveraging cutting-edge artificial intelligence, machine learning models, and behavioral analytics to stay ahead of emerging threats before they materialize.",
  },
  {
    icon: "\uD83D\uDD12", title: "Security First", color: T.cyan,
    desc: "Every decision we make is filtered through the lens of security. From zero-knowledge encryption to air-gapped infrastructure, we architect our systems so that user data remains untouchable, even to us.",
  },
  {
    icon: "\uD83C\uDF0D", title: "Accessibility", color: T.green,
    desc: "Cybersecurity should not be a privilege reserved for enterprises with six-figure budgets. We design intuitive tools and offer generous free tiers so that students, families, and small businesses can defend themselves.",
  },
  {
    icon: "\uD83D\uDC41", title: "Transparency", color: "#f97316",
    desc: "We believe trust is built through openness. Our threat reports are public, our methodologies are documented, and we communicate honestly about what our platform can and cannot do.",
  },
];

const TECH = [
  { name: "React", icon: "\u269B\uFE0F", desc: "Modern component-driven UI with blazing-fast rendering and seamless single-page navigation for our dashboard and tools.", color: "#61dafb" },
  { name: "AI / ML", icon: "\uD83E\uDDE0", desc: "Neural networks trained on billions of threat signatures power our real-time detection engine, achieving 99.7% accuracy across known and zero-day threats.", color: T.accent },
  { name: "Real-time Monitoring", icon: "\uD83D\uDCE1", desc: "WebSocket-driven telemetry streams and event-sourced architecture ensure threats are identified and neutralized within milliseconds of detection.", color: T.cyan },
  { name: "Cloud Security", icon: "\u2601\uFE0F", desc: "Distributed across multiple availability zones with end-to-end encryption at rest and in transit, ensuring high availability and data sovereignty compliance.", color: T.green },
];

const MILESTONES = [
  { year: "2024", title: "Founded", desc: "SECUVION was born in Pune, India when founder Sahil Anil Nikam identified a critical gap in accessible cybersecurity tools for everyday users.", color: T.accent },
  { year: "2025", title: "Platform Launch", desc: "Public launch of the SECUVION platform featuring dark web monitoring, password vault, vulnerability scanner, and an integrated learning hub.", color: T.cyan },
  { year: "2026", title: "AI Integration", desc: "Deployed Google Gemini-powered AI chatbot and intelligent threat analysis engine, bringing conversational cybersecurity assistance to every user.", color: T.green },
  { year: "2027", title: "Global Expansion", desc: "Planned rollout across Southeast Asia, Europe, and Africa with localized threat intelligence and multilingual support for 20+ languages.", color: "#f97316" },
];

function AnimatedStat({ val, label, color }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    const suffix = val.replace(/[0-9.]/g, "");
    if (isNaN(num)) { setDisplay(val); return; }
    const duration = 1800;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(num, increment * step);
      if (Number.isInteger(num)) {
        setDisplay(Math.round(current).toLocaleString() + suffix);
      } else {
        setDisplay(current.toFixed(1) + suffix);
      }
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, val]);

  return (
    <div ref={ref} style={{ ...cardBase, textAlign: "center", padding: "36px 16px" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color, letterSpacing: "-0.03em", transition: "all 0.3s" }}>
        {display}
      </div>
      <div style={{ fontSize: 13, color: T.mutedDark, marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="About SECUVION"
        description="Learn about SECUVION's mission to democratize AI-powered cybersecurity for everyone. Founded by Sahil Anil Nikam in Pune, India."
        path="/about"
      />
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", ...sectionGap }}>
          <span style={badge(T.accent)}>About Us</span>
          <h1 style={{ ...heading("clamp(38px, 5vw, 56px)"), marginBottom: 20 }}>
            About <span style={gradientText}>SECUVION</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 20, maxWidth: 640, margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 500 }}>
            AI-Powered Cyber Defense for Everyone
          </p>
          <p style={{ color: T.mutedDark, fontSize: 15, maxWidth: 580, margin: "0 auto", lineHeight: 1.85 }}>
            We are building the next generation of cybersecurity infrastructure, one that protects
            individuals and small teams with the same intelligence and rigor that Fortune 500
            companies rely on, but at a fraction of the cost.
          </p>
        </div>

        {/* ── Mission & Vision ── */}
        <RevealSection style={sectionGap}>
          <div className="about-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ ...cardBase, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}10, transparent)` }} />
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${T.accent}12`, border: `1px solid ${T.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                &#x1F3AF;
              </div>
              <h3 style={{ ...heading(22), marginBottom: 14 }}>Our Mission</h3>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.85, margin: 0 }}>
                To democratize cybersecurity by making enterprise-grade protection accessible and
                affordable for every individual on the planet. We believe that online safety is a
                fundamental human right, not a luxury reserved for corporations with massive IT
                budgets. Every student, freelancer, and family deserves intelligent defense against
                the threats that lurk in the digital world.
              </p>
            </div>
            <div style={{ ...cardBase, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${T.cyan}10, transparent)` }} />
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${T.cyan}12`, border: `1px solid ${T.cyan}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                &#x1F52D;
              </div>
              <h3 style={{ ...heading(22), marginBottom: 14 }}>Our Vision</h3>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.85, margin: 0 }}>
                A world where every person can navigate the digital landscape without fear of fraud,
                identity theft, or exploitation. We envision AI-powered security acting as a universal
                shield, protecting billions of connected lives across every continent. In this future,
                cybersecurity is invisible, intelligent, and always on, woven seamlessly into the
                fabric of everyday digital life.
              </p>
            </div>
          </div>
        </RevealSection>

        {/* ── Why SECUVION ── */}
        <RevealSection style={{ ...sectionGap, textAlign: "center" }}>
          <span style={badge("#f97316")}>Why Us</span>
          <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)"), marginBottom: 20 }}>
            Why Choose <span style={gradientText}>SECUVION</span>?
          </h2>
          <p style={{ color: T.muted, fontSize: 15, maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.85 }}>
            Traditional cybersecurity tools are built for enterprises with dedicated IT teams.
            SECUVION flips that model by delivering intelligent, automated protection designed
            for people who have better things to do than monitor threat dashboards all day.
          </p>
          <div className="about-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              {
                icon: "\u26A1",
                title: "Instant Setup",
                desc: "No complex configurations or onboarding processes. Sign up, and your digital life is protected within seconds.",
                color: "#f97316",
              },
              {
                icon: "\uD83E\uDDE0",
                title: "AI-First Architecture",
                desc: "Every feature is powered by machine learning models that adapt to your unique risk profile and usage patterns.",
                color: T.accent,
              },
              {
                icon: "\uD83D\uDCB0",
                title: "Free Forever Tier",
                desc: "Core protection features are free for life. Premium tiers unlock advanced AI capabilities and priority monitoring.",
                color: T.green,
              },
            ].map((item, i) => (
              <div key={i} style={{ ...cardBase, textAlign: "left" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: `${item.color}12`,
                  border: `1px solid ${item.color}20`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, marginBottom: 16,
                }}>
                  {item.icon}
                </div>
                <h4 style={{ ...heading(16), marginBottom: 8 }}>{item.title}</h4>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Stats Bar (animated counters) ── */}
        <div className="about-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, ...sectionGap }}>
          {STATS.map((s, i) => (
            <AnimatedStat key={i} val={s.val} label={s.label} color={s.color} />
          ))}
        </div>

        {/* ── Our Story ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.cyan)}>Our Story</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)"), marginBottom: 16 }}>
              How <span style={gradientText}>SECUVION</span> Began
            </h2>
          </div>
          <div style={{ ...cardBase, borderRadius: 20, padding: "clamp(32px, 4vw, 56px)", maxWidth: 860, margin: "0 auto" }}>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.9, margin: "0 0 20px" }}>
              SECUVION was founded by <strong style={{ color: T.white }}>Sahil Anil Nikam</strong>, a
              cybersecurity enthusiast from <strong style={{ color: T.white }}>Pune, India</strong>,
              who witnessed firsthand how vulnerable everyday internet users are to digital threats.
              While studying cybersecurity and building personal projects, Sahil noticed a troubling
              pattern: the best security tools were locked behind expensive enterprise contracts,
              while students, freelancers, and families were left exposed to phishing, data breaches,
              and identity theft.
            </p>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.9, margin: "0 0 20px" }}>
              Driven by a conviction that protection should be universal, Sahil began building
              SECUVION in 2024 as a solo project. The initial prototype included a dark web
              monitoring tool and a password vault. As the project grew, AI integration became the
              cornerstone of the platform, enabling real-time threat detection and intelligent
              security recommendations that adapt to each user's behavior and risk profile.
            </p>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.9, margin: 0 }}>
              Today, SECUVION has evolved into a comprehensive cybersecurity platform that combines
              artificial intelligence, real-time monitoring, and an educational learning hub to
              empower users not only to defend themselves but to truly understand the threats they
              face. What started as one person's frustration with an inequitable industry has become
              a mission to protect millions.
            </p>
          </div>
        </RevealSection>

        {/* ── Core Values ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.green)}>What We Believe</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)") }}>Core Values</h2>
          </div>
          <div className="about-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ ...cardBase, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${v.color}08, transparent)` }} />
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${v.color}12`, border: `1px solid ${v.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {v.icon}
                </div>
                <h4 style={{ ...heading(18), marginBottom: 10 }}>{v.title}</h4>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Technology Stack ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.accent)}>Under the Hood</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)") }}>Technology Stack</h2>
          </div>
          <div className="about-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {TECH.map((t, i) => (
              <div key={i} style={{ ...cardBase, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${t.color}12`, border: `1px solid ${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {t.icon}
                </div>
                <div>
                  <h4 style={{ ...heading(17), marginBottom: 8 }}>{t.name}</h4>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── What We Protect Against ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.red)}>Threat Landscape</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)") }}>What We Protect Against</h2>
          </div>
          <div className="about-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              {
                icon: "\uD83C\uDFA3", title: "Phishing Attacks", color: T.red,
                desc: "AI-powered detection identifies fraudulent emails, fake websites, and social engineering attempts before they reach you.",
              },
              {
                icon: "\uD83D\uDD13", title: "Data Breaches", color: "#f97316",
                desc: "Continuous dark web monitoring alerts you the moment your credentials or personal information appear in leaked databases.",
              },
              {
                icon: "\uD83D\uDC7E", title: "Malware & Ransomware", color: T.accent,
                desc: "Behavioral analysis and signature matching detect malicious payloads, cryptojackers, and ransomware before they execute.",
              },
              {
                icon: "\uD83D\uDC64", title: "Identity Theft", color: T.cyan,
                desc: "Proactive monitoring of personal data across the surface and dark web helps prevent unauthorized use of your identity.",
              },
              {
                icon: "\uD83D\uDCE7", title: "Credential Stuffing", color: T.green,
                desc: "Our password vault and breach checker identify reused or compromised credentials across all your online accounts.",
              },
              {
                icon: "\uD83D\uDD0D", title: "Vulnerability Exploits", color: "#eab308",
                desc: "Automated scanning discovers misconfigurations, outdated software, and unpatched vulnerabilities in your digital footprint.",
              },
            ].map((t, i) => (
              <div key={i} style={{ ...cardBase, padding: "28px 24px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: `${t.color}12`,
                  border: `1px solid ${t.color}20`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, marginBottom: 16,
                }}>
                  {t.icon}
                </div>
                <h4 style={{ ...heading(16), marginBottom: 8 }}>{t.title}</h4>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Founder / Team ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.cyan)}>Leadership</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)") }}>Meet the Founder</h2>
          </div>
          <div style={{ ...cardBase, borderRadius: 20, padding: "clamp(32px, 4vw, 56px)", maxWidth: 860, margin: "0 auto" }}>
            <div className="about-founder-row" style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
              <div style={{ width: 100, height: 100, borderRadius: 22, background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.08))", border: `1px solid ${T.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 300, color: T.white, opacity: 0.9 }}>S</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={badge(T.accent)}>Founder & CEO</span>
                <h3 style={{ ...heading(28), marginBottom: 16 }}>Sahil Anil Nikam</h3>
                <blockquote style={{
                  fontSize: 16, color: T.white, lineHeight: 1.75, fontStyle: "italic",
                  margin: "0 0 20px", opacity: 0.8, borderLeft: `3px solid ${T.accent}`,
                  paddingLeft: 20,
                }}>
                  "The digital world connects billions of people, but it also exposes them to
                  invisible threats. I created SECUVION because cybersecurity should not be a
                  luxury — it should be a right available to every person on Earth."
                </blockquote>
                <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.85, margin: "0 0 20px" }}>
                  Sahil is a cybersecurity enthusiast and self-taught developer from Pune, India.
                  His passion for digital security began during his early experiments with network
                  analysis and ethical hacking. Frustrated by the lack of affordable, user-friendly
                  security tools for everyday people, he channeled his energy into building SECUVION
                  from the ground up. Sahil handles everything from product architecture and AI
                  integration to frontend design and community engagement.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a
                    href="https://www.linkedin.com/in/sahil-nikam"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: "rgba(99,102,241,0.08)", border: `1px solid ${T.accent}25`,
                      color: T.accentSoft, textDecoration: "none", transition: "all 0.2s",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/sahilnikam"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`,
                      color: T.muted, textDecoration: "none", transition: "all 0.2s",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── Join Our Team ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge(T.accentSoft)}>Careers</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)"), marginBottom: 16 }}>
              Join Our <span style={gradientText}>Team</span>
            </h2>
            <p style={{ color: T.muted, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.85 }}>
              We're always looking for passionate people who want to make the internet safer for everyone.
            </p>
          </div>
          <div className="about-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { role: "AI/ML Engineer", type: "Full-time \u00B7 Remote", desc: "Build and optimize neural network models for real-time threat detection and behavioral analysis.", color: T.accent },
              { role: "Frontend Developer", type: "Full-time \u00B7 Remote", desc: "Craft beautiful, performant React interfaces for our cybersecurity dashboard and tools.", color: T.cyan },
              { role: "Security Researcher", type: "Part-time \u00B7 Remote", desc: "Analyze emerging threats, reverse-engineer malware, and contribute to our threat intelligence database.", color: T.red },
              { role: "Community Manager", type: "Full-time \u00B7 Remote", desc: "Grow and nurture our community of security-conscious users through content, events, and support.", color: T.green },
            ].map((job, i) => (
              <div key={i} style={{ ...cardBase, padding: "28px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${job.color}30`; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{ ...heading(17), margin: 0 }}>{job.role}</h4>
                  <span style={{ padding: "4px 10px", borderRadius: 6, background: `${job.color}10`, border: `1px solid ${job.color}20`, fontSize: 10, fontWeight: 600, color: job.color, whiteSpace: "nowrap" }}>Open</span>
                </div>
                <span style={{ fontSize: 12, color: T.mutedDark, fontWeight: 500 }}>{job.type}</span>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{job.desc}</p>
                <Link to="/contact" style={{ fontSize: 13, color: T.accent, fontWeight: 600, textDecoration: "none", marginTop: 4 }}>
                  Apply Now &rarr;
                </Link>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Timeline / Milestones ── */}
        <RevealSection style={sectionGap}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={badge("#f97316")}>Milestones</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 38px)") }}>Our Journey</h2>
          </div>
          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 24, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${T.accent}, ${T.cyan}, ${T.green}, #f97316)`, borderRadius: 2, opacity: 0.3 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingLeft: 0 }}>
                  <div style={{ width: 50, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: m.color, boxShadow: `0 0 12px ${m.color}40`, marginTop: 6 }} />
                  </div>
                  <div style={{ ...cardBase, flex: 1, padding: "24px 28px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: m.color, letterSpacing: "0.05em" }}>
                      {m.year}
                    </span>
                    <h4 style={{ ...heading(18), margin: "6px 0 10px" }}>{m.title}</h4>
                    <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* ── Join Our Mission CTA ── */}
        <div style={{
          textAlign: "center", padding: "64px 36px", borderRadius: 24,
          background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.04))",
          border: `1px solid rgba(99,102,241,0.12)`, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, left: -80, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}08, transparent)` }} />
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${T.cyan}06, transparent)` }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={badge(T.cyan)}>Get Started</span>
            <h2 style={{ ...heading("clamp(28px, 3.5vw, 36px)"), marginBottom: 16 }}>
              Join Our Mission
            </h2>
            <p style={{ color: T.muted, fontSize: 16, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.8 }}>
              Become part of a growing community that believes cybersecurity is a right, not a privilege.
              Start protecting your digital life today with our free plan.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/signup" style={{
                display: "inline-block", padding: "14px 36px", background: T.accent,
                color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14,
                fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: `0 4px 20px ${T.accent}30`,
              }}>
                Get Started Free
              </Link>
              <Link to="/learn" style={{
                display: "inline-block", padding: "14px 36px",
                background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`,
                color: T.white, borderRadius: 10, textDecoration: "none", fontSize: 14,
                fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Explore Platform
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .about-grid-2, .about-grid-3, .about-grid-4 { grid-template-columns: 1fr !important; }
          .about-founder-row { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .about-founder-row blockquote { text-align: left !important; }
        }
        @media (max-width: 900px) and (min-width: 769px) {
          .about-grid-3, .about-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
