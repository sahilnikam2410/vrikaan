import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import EmailRouting from "../../components/EmailRouting";

const T = {
  bg: "#030712", surface: "#111827", card: "rgba(17,24,39,0.7)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", amber: "#f59e0b",
  red: "#ef4444", white: "#f1f5f9", muted: "#94a3b8",
  border: "rgba(148,163,184,0.12)", chip: "rgba(20,227,197,0.10)",
};

// ── Job openings — edit this array to publish / pull roles ─────────────
const OPENINGS = [
  {
    id: "soc-analyst-intern",
    title: "SOC Analyst Intern",
    team: "Security",
    type: "Internship",
    location: "Remote · India",
    duration: "3 months · stipend ₹5k–₹15k/mo + ESOP + PPO path",
    seniority: "Student / Fresher",
    badge: "Hot",
    badgeColor: "#ef4444",
    summary: "Help us triage real alerts in the VRIKAAN SOC. MITRE ATT&CK mapping, SIEM tuning, incident-response playbook authoring.",
    responsibilities: [
      "Triage events from the production SOC dashboard (severity 0-15)",
      "Map detections to MITRE ATT&CK tactics and techniques",
      "Tune detection rules to reduce false positives",
      "Author IR playbooks for top scam patterns (UPI, vishing, deepfake)",
      "Publish weekly threat-intel digest to blog",
    ],
    musts: [
      "Comfortable with the basics of TCP/IP, HTTP, DNS, TLS",
      "Familiar with MITRE ATT&CK or completed equivalent training",
      "Can read JSON, write Markdown",
      "Owns a laptop, stable internet, can attend 2 sync calls / week",
    ],
    nice: [
      "Hands-on with Wazuh, Splunk, Elastic, or any SIEM",
      "CTF or TryHackMe / HackTheBox profile",
      "Hindi + English bilingual (for India-specific scam research)",
    ],
  },
  {
    id: "fullstack-intern",
    title: "Full-Stack Engineering Intern",
    team: "Engineering",
    type: "Internship",
    location: "Remote · India",
    duration: "3 months · stipend ₹8k–₹20k/mo + ESOP + PPO path",
    seniority: "Student / Fresher",
    summary: "Ship features end-to-end on the VRIKAAN platform. React 19 + Vercel serverless + Firestore + Gemini AI.",
    responsibilities: [
      "Build new tools inside the 50+ tool suite",
      "Add new actions to the api/tools.js router (stay under 12 Vercel functions)",
      "Wire Firestore listeners, write security rules",
      "Integrate Gemini for AI-powered features",
      "Write Vitest + React Testing Library tests (we have 109+, do not break them)",
    ],
    musts: [
      "React 18+ hooks, hooks-only components",
      "JavaScript ES2022 — async/await, modules, destructuring fluency",
      "Git basics (branch, PR, rebase)",
      "Can read and ship a CRUD feature in 1 week",
    ],
    nice: [
      "Vite, Vercel, Firebase prior experience",
      "Open-source contribution history",
      "Hindi + English UI translation contributions",
    ],
  },
  {
    id: "ai-ml-intern",
    title: "AI / ML Intern",
    team: "Engineering",
    type: "Internship",
    location: "Remote · India",
    duration: "3 months · stipend ₹10k–₹20k/mo + ESOP + PPO path",
    seniority: "Student / Fresher",
    summary: "Push our scam-detection, deepfake audio, and vulnerability-explanation pipelines further. Prompt engineering + lightweight fine-tuning.",
    responsibilities: [
      "Improve scam SMS / WhatsApp / email classifier accuracy and latency",
      "Build evaluation harness for Gemini prompts (precision/recall on labelled data)",
      "Curate Hindi + English fraud-pattern datasets",
      "Prototype voice-clone detector improvements",
    ],
    musts: [
      "Python + at least one of: NumPy, pandas, scikit-learn",
      "Prompt engineering intuition (few-shot, structured output)",
      "Understands precision vs recall trade-off",
    ],
    nice: [
      "Whisper, wav2vec, or audio model experience",
      "HuggingFace + transformers familiarity",
      "Published Kaggle notebook or research preprint",
    ],
  },
  {
    id: "content-marketing-intern",
    title: "Content & Social Marketing Intern",
    team: "Marketing",
    type: "Internship",
    location: "Remote · India",
    duration: "3 months · stipend ₹5k–₹12k/mo + ESOP + PPO path",
    seniority: "Student / Fresher",
    summary: "Run VRIKAAN's content engine — LinkedIn carousels, X threads, Reels scripts, scam-pattern explainers, weekly digest emails.",
    responsibilities: [
      "Ship 3 LinkedIn carousels + 2 X threads + 4 Reels per week",
      "Translate top posts into Hindi",
      "Maintain content calendar in Notion",
      "Author the weekly digest email (~1,500 subscribers and growing)",
    ],
    musts: [
      "Written English at a professional level",
      "Comfortable using Figma / Canva for visual assets",
      "Can hold a brand voice consistently",
    ],
    nice: [
      "Hindi native writer",
      "Active personal account with > 1k followers on any platform",
      "Basic video editing (CapCut, Premiere, DaVinci)",
    ],
  },
  {
    id: "junior-soc-engineer",
    title: "Junior SOC Engineer",
    team: "Security",
    type: "Full-Time",
    location: "Remote · India · Nashik HQ preferred",
    duration: "Full-time · ₹4–8 LPA + ESOPs",
    seniority: "0–2 yrs exp",
    summary: "Own a slice of our production threat-detection pipeline. Convert tactic ideas into deployed rules.",
    responsibilities: [
      "Write and maintain detection rules across MITRE ATT&CK tactics",
      "Build compliance evaluators for PCI / GDPR / DPDP / SOC 2 / ISO 27001",
      "On-call rotation for high-severity alerts (light, automated)",
      "Mentor SOC interns",
    ],
    musts: [
      "1+ yr hands-on cybersecurity, SOC, or DevSecOps",
      "Strong with MITRE ATT&CK, Sigma rules, JSON event shapes",
      "Comfortable shipping code (JS or Python), not just dashboards",
    ],
    nice: [
      "Certifications: BTL1, CompTIA Security+, GCIH, CEH",
      "Prior SaaS production exposure",
    ],
  },
];

// ── Tag helpers ────────────────────────────────────────────────────────
const TYPE_COLORS = { Internship: T.cyan, "Full-Time": T.accent, Contract: T.amber };
const TEAMS = ["All", "Security", "Engineering", "Marketing"];
const TYPES = ["All", "Internship", "Full-Time", "Contract"];

// ── Google JobPosting schema helpers (https://developers.google.com/search/docs/appearance/structured-data/job-posting) ──
const SITE_URL = "https://vrikaan.com";

// Parse min/max + unit (MONTH for stipend, YEAR for LPA) out of duration strings like:
//   "3 months · stipend ₹5k–₹15k/mo + ESOP + PPO path"
//   "Full-time · ₹4–8 LPA + ESOPs"
function parseSalary(duration = "") {
  // Match LPA pattern first (annual)
  const lpa = duration.match(/₹\s*(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*LPA/i);
  if (lpa) {
    return { min: Number(lpa[1]) * 100000, max: Number(lpa[2]) * 100000, unit: "YEAR" };
  }
  // Match monthly stipend in either format:
  //   ₹5,000–₹15,000   (full digits)
  //   ₹5k–₹15k         (k-suffixed)
  const mon = duration.match(/₹\s*([\d,]+)\s*(k)?\s*[–-]\s*₹?\s*([\d,]+)\s*(k)?/i);
  if (mon) {
    const expand = (n, k) => Number(n.replace(/,/g, "")) * (k ? 1000 : 1);
    return { min: expand(mon[1], mon[2]), max: expand(mon[3], mon[4]), unit: "MONTH" };
  }
  return null;
}

function buildJobPostingSchema(job) {
  const sal = parseSalary(job.duration);
  // datePosted: 7 days ago (so Google considers it "fresh" but not "just posted")
  // validThrough: 60 days from today
  const now = new Date();
  const datePosted = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const validThrough = new Date(now.getTime() + 60 * 86400000).toISOString().slice(0, 10);

  const employmentTypeMap = {
    "Internship": "INTERN",
    "Full-Time": "FULL_TIME",
    "Contract": "CONTRACTOR",
    "Part-Time": "PART_TIME",
  };

  // Build plain-text description Google likes: summary + sections
  const sectionToText = (label, items) => items?.length
    ? `${label}:\n${items.map(i => `• ${i}`).join("\n")}`
    : "";
  const description = [
    job.summary,
    "",
    sectionToText("What you will do", job.responsibilities),
    "",
    sectionToText("Must-have", job.musts),
    "",
    sectionToText("Nice-to-have", job.nice),
    "",
    `Compensation: ${job.duration}`,
    `Apply: ${SITE_URL}/careers#${job.id}  ·  or ${SITE_URL}/apply`,
  ].filter(Boolean).join("\n");

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "VRIKAAN",
      "value": job.id,
    },
    "datePosted": datePosted,
    "validThrough": validThrough,
    "employmentType": employmentTypeMap[job.type] || "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "VRIKAAN",
      "sameAs": SITE_URL,
      "logo": `${SITE_URL}/wolf-icon.png`,
    },
    "jobLocationType": "TELECOMMUTE",
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "IN",
    },
    // Fallback physical address (Nashik HQ) — required when jobLocationType is set
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nashik",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN",
      },
    },
    "directApply": true,
    "url": `${SITE_URL}/careers#${job.id}`,
  };

  if (sal) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": sal.min,
        "maxValue": sal.max,
        "unitText": sal.unit,
      },
    };
  }

  if (job.seniority) {
    schema.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": /freshe?r|student/i.test(job.seniority) ? 0
        : /(\d+)\s*[–-]?\s*(\d+)?\s*yrs?/i.test(job.seniority)
          ? Number(RegExp.$1) * 12
          : 0,
    };
    schema.qualifications = job.musts?.join(" · ") || job.seniority;
  }

  schema.skills = (job.musts || []).concat(job.nice || []).slice(0, 10).join(", ");
  schema.industry = "Cybersecurity";
  schema.workHours = "Flexible";

  return schema;
}

export default function Careers() {
  const [team, setTeam] = useState("All");
  const [type, setType] = useState("All");
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    return OPENINGS.filter(j =>
      (team === "All" || j.team === team) &&
      (type === "All" || j.type === type)
    );
  }, [team, type]);

  const stats = useMemo(() => ({
    total: OPENINGS.length,
    internships: OPENINGS.filter(j => j.type === "Internship").length,
    fulltime: OPENINGS.filter(j => j.type === "Full-Time").length,
  }), []);

  // Google JobPosting JSON-LD — one per opening, lets each role surface in
  // Google Jobs search (jobs.google.com) and rich-result cards on Google.com
  const jobSchemas = useMemo(() => OPENINGS.map(buildJobPostingSchema), []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SEO
        title="Careers"
        description="Open roles and internships at VRIKAAN — India's AI-powered cyber defense platform. SOC analysts, full-stack engineers, ML engineers, content marketers wanted."
        path="/careers"
        keywords="vrikaan careers, cybersecurity jobs india, SOC analyst internship, security internship india, remote cybersecurity intern"
        jsonLd={jobSchemas}
      />
      <Navbar />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px 60px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase", color: T.cyan,
            background: T.chip, border: `1px solid ${T.cyan}40`, borderRadius: 999,
          }}>Careers · We are hiring</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
            color: T.white, margin: "16px 0 12px", lineHeight: 1.05,
          }}>
            Build the shield with us.
          </h1>
          <p style={{ color: T.muted, maxWidth: 720, margin: "0 auto", fontSize: 17, lineHeight: 1.6 }}>
            VRIKAAN is India's AI-powered cyber defense platform. We protect families and small businesses
            from scams, fraud, and breaches — in English and हिन्दी. If you want to ship real product that
            real people use, look at the openings below.
          </p>

          {/* Stat row */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 16, marginTop: 32, flexWrap: "wrap",
          }}>
            {[
              { v: stats.total, l: "Open roles", c: T.cyan },
              { v: stats.internships, l: "Internships", c: T.accent },
              { v: stats.fulltime, l: "Full-time", c: T.green },
              { v: "Remote", l: "Default location", c: T.amber },
            ].map(s => (
              <div key={s.l} style={{
                padding: "14px 22px", background: T.card, border: `1px solid ${T.border}`,
                borderRadius: 14, minWidth: 130,
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: "var(--font-display)" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why VRIKAAN */}
        <section style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
          padding: 32, marginBottom: 48,
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: T.white, margin: "0 0 20px" }}>
            Why join VRIKAAN
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18,
          }}>
            {[
              { icon: "🛡️", title: "Real users, real impact", body: "Live product. Real Firestore data. Your code ships to vrikaan.com the same week." },
              { icon: "🧠", title: "Modern stack", body: "React 19, Vite 7, Firebase, Gemini 2.5 Flash, Vercel serverless, Sentry. No legacy debt." },
              { icon: "🇮🇳", title: "Built in India", body: "Founded in Nashik. India-first product. Hindi + English, INR-native payments, DPDP-aware." },
              { icon: "📈", title: "Learn fast", body: "Direct mentorship from both founders — both SOC analysts and cybersecurity researchers." },
              { icon: "💸", title: "Pay + ESOPs", body: "Interns get stipend + ESOPs + a real pre-placement offer (PPO) path. We're early-stage and honest about it: cash is lean, equity upside is real, and top interns convert to full-time. No 'exposure'-only offers." },
              { icon: "🏠", title: "Remote by default", body: "Work from anywhere in India. Occasional Nashik visits welcome but not required." },
            ].map(p => (
              <div key={p.title} style={{
                padding: 18, background: "rgba(2,6,23,0.6)", border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section style={{ marginBottom: 24 }}>
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TEAMS.map(t => (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  style={pillBtn(team === t)}
                >Team · {t}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={pillBtn(type === t)}
                >{t}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Job list */}
        <section style={{ display: "grid", gap: 14, marginBottom: 60 }}>
          {filtered.length === 0 && (
            <div style={{
              padding: 32, textAlign: "center", color: T.muted,
              background: T.card, border: `1px dashed ${T.border}`, borderRadius: 16,
            }}>
              No matching roles. Reset filters or send a speculative pitch to <a style={{ color: T.cyan }} href="mailto:hr@vrikaan.com?cc=hello@vrikaan.com">hr@vrikaan.com</a>.
            </div>
          )}

          {filtered.map(job => {
            const isOpen = open === job.id;
            const typeColor = TYPE_COLORS[job.type] || T.cyan;
            return (
              <article key={job.id} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 18,
                overflow: "hidden", transition: "border-color 0.2s",
                borderColor: isOpen ? typeColor + "55" : T.border,
              }}>
                <button
                  onClick={() => setOpen(isOpen ? null : job.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "22px 24px",
                    background: "transparent", border: 0, color: T.white, cursor: "pointer",
                    display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <Chip color={typeColor}>{job.type}</Chip>
                      <Chip color={T.muted}>{job.team}</Chip>
                      <Chip color={T.muted}>{job.location}</Chip>
                      <Chip color={T.muted}>{job.seniority}</Chip>
                      {job.badge && <Chip color={job.badgeColor || T.amber} solid>{job.badge}</Chip>}
                    </div>
                    <h3 style={{
                      fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
                      color: T.white, margin: "0 0 6px",
                    }}>{job.title}</h3>
                    <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>{job.summary}</div>
                    <div style={{ color: T.cyan, fontSize: 12, marginTop: 8, fontFamily: "ui-monospace, Menlo, monospace" }}>
                      {job.duration}
                    </div>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: typeColor + "22", color: typeColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, transform: isOpen ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s",
                  }}>+</div>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 24px", color: T.muted }}>
                    <Section title="What you will do" items={job.responsibilities} color={T.cyan} />
                    <Section title="Must-have" items={job.musts} color={T.green} />
                    <Section title="Nice-to-have" items={job.nice} color={T.amber} />

                    <div style={{
                      display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24,
                      padding: 18, background: "rgba(2,6,23,0.6)", borderRadius: 14,
                      border: `1px solid ${T.border}`,
                    }}>
                      <a
                        href={`mailto:hr@vrikaan.com?cc=hello@vrikaan.com&subject=${encodeURIComponent(`Application — ${job.title} — ${job.id}`)}&body=${encodeURIComponent(applyTemplate(job))}`}
                        style={primaryBtn(typeColor)}
                      >Apply via email →</a>
                      <a
                        href="https://forms.gle/ff3vA9kDC9vZaEzm9"
                        target="_blank" rel="noopener noreferrer"
                        style={secondaryBtn()}
                      >Apply via form</a>
                      <button
                        onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/careers#${job.id}`)}
                        style={secondaryBtn()}
                      >Copy link</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Speculative pitch */}
        <section style={{
          background: `linear-gradient(135deg, ${T.accent}22, ${T.cyan}22)`,
          border: `1px solid ${T.border}`, borderRadius: 22, padding: 36,
          marginBottom: 50, textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 26, color: T.white, margin: "0 0 10px",
          }}>Don't see your role?</h2>
          <p style={{ color: T.muted, maxWidth: 620, margin: "0 auto 22px", lineHeight: 1.6 }}>
            We hire opportunistically. Send a 5-line pitch + portfolio/GitHub/LinkedIn to{" "}
            <a href="mailto:hello@vrikaan.com" style={{ color: T.cyan }}>hello@vrikaan.com</a>.
            If your work is interesting, we will respond within 7 days.
          </p>
          <a
            href="mailto:hr@vrikaan.com?cc=hello@vrikaan.com&subject=Speculative%20pitch%20%E2%80%94%20VRIKAAN"
            style={primaryBtn(T.cyan)}
          >Send a pitch →</a>
        </section>

        {/* Contact channels */}
        <EmailRouting highlight="hr" />
        <p style={{ color: T.muted, fontSize: 12, marginTop: -40, marginBottom: 60, textAlign: "center" }}>
          Tip: applying for a role? Use <strong style={{ color: T.cyan }}>hr@vrikaan.com</strong> — the Apply buttons above auto-CC <strong style={{ color: T.white }}>hello@vrikaan.com</strong> for tracking.
        </p>

        {/* Process */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: T.white, margin: "0 0 22px" }}>
            Hiring process
          </h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { n: 1, t: "Apply", b: "Send email or fill the form. We read every application within 7 days." },
              { n: 2, t: "Short call (20 min)", b: "Founder-led call. We learn about you, you ask anything." },
              { n: 3, t: "Take-home task", b: "Small, paid for full-time. 4-8 hours of real-shape work." },
              { n: 4, t: "Decision (within 5 days)", b: "Offer + start date. No ghosting — even rejections get a written reason." },
            ].map(s => (
              <div key={s.n} style={{
                padding: 20, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 999, background: T.accent + "33",
                  color: T.accent, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, marginBottom: 12,
                }}>{s.n}</div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.t}</div>
                <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{s.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer-style links */}
        <section style={{ textAlign: "center", color: T.muted, fontSize: 13 }}>
          Questions? <Link to="/contact" style={{ color: T.cyan }}>Contact us</Link>{" · "}
          <Link to="/about" style={{ color: T.cyan }}>About VRIKAAN</Link>{" · "}
          <Link to="/press" style={{ color: T.cyan }}>Press kit</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────
function Chip({ children, color, solid }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      borderRadius: 999,
      background: solid ? color : color + "1a",
      color: solid ? "#030712" : color,
      border: solid ? "0" : `1px solid ${color}33`,
    }}>{children}</span>
  );
}

function Section({ title, items, color }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
        color, marginBottom: 10,
      }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────
function pillBtn(active) {
  return {
    padding: "8px 14px", fontSize: 12, fontWeight: 600,
    border: `1px solid ${active ? T.cyan : T.border}`,
    background: active ? T.cyan + "22" : "transparent",
    color: active ? T.cyan : T.muted,
    borderRadius: 999, cursor: "pointer",
    transition: "all 0.15s",
  };
}
function primaryBtn(color) {
  return {
    display: "inline-block", padding: "12px 22px",
    background: color, color: "#030712", fontWeight: 700, fontSize: 14,
    borderRadius: 12, textDecoration: "none",
  };
}
function secondaryBtn() {
  return {
    display: "inline-block", padding: "12px 18px",
    background: "transparent", color: T.white, fontWeight: 600, fontSize: 14,
    border: `1px solid ${T.border}`, borderRadius: 12, textDecoration: "none", cursor: "pointer",
  };
}

function applyTemplate(job) {
  return `Hi VRIKAAN team,

I'd like to apply for: ${job.title} (${job.id})

About me:
• Name —
• Location —
• Current role / college —
• Portfolio / GitHub / LinkedIn —

Why I'm a fit (3-5 lines):
•
•
•

Earliest start date:
Notice period (if any):

Resume attached.

Thanks,
`;
}
