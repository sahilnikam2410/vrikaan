import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)" };

const STORAGE_KEY = "vrikaan_checklist";

const categories = [
  {
    id: "account",
    name: "Account Security",
    icon: "\u{1F512}",
    color: T.accent,
    items: [
      { id: "acc_2fa_email", label: "Enable 2FA on email", desc: "Two-factor authentication adds a critical second layer of protection to your primary email account." },
      { id: "acc_2fa_bank", label: "Enable 2FA on banking apps", desc: "Financial accounts are high-value targets. Always use multi-factor authentication on banking services." },
      { id: "acc_password_mgr", label: "Use a password manager", desc: "Generate and store unique, complex passwords for every account with a trusted password manager." },
      { id: "acc_unique_pw", label: "Unique passwords per account", desc: "Never reuse passwords. A single breach can cascade across all accounts sharing the same credentials." },
      { id: "acc_recovery", label: "Set up account recovery options", desc: "Configure backup email, phone number, and recovery codes so you can regain access if locked out." },
      { id: "acc_audit", label: "Audit connected third-party apps", desc: "Review and revoke access for apps you no longer use that are connected to your Google, GitHub, or social accounts." },
    ],
  },
  {
    id: "device",
    name: "Device Security",
    icon: "\u{1F4BB}",
    color: T.cyan,
    items: [
      { id: "dev_encryption", label: "Enable device encryption", desc: "Turn on BitLocker (Windows) or FileVault (macOS) to protect data if your device is lost or stolen." },
      { id: "dev_updates", label: "Regular software updates", desc: "Keep your OS, drivers, and applications up to date to patch known security vulnerabilities." },
      { id: "dev_antivirus", label: "Install reputable antivirus", desc: "Use endpoint protection software to detect and block malware, ransomware, and other threats." },
      { id: "dev_firewall", label: "Enable firewall", desc: "Your system firewall monitors incoming and outgoing traffic and blocks unauthorized network connections." },
      { id: "dev_lock", label: "Set auto-lock screen timer", desc: "Configure your device to lock automatically after a short period of inactivity to prevent unauthorized access." },
      { id: "dev_usb", label: "Disable USB auto-run", desc: "Prevent malicious USB devices from executing code automatically when plugged into your machine." },
      { id: "dev_bios", label: "Set BIOS/UEFI password", desc: "A firmware-level password prevents unauthorized users from booting or changing hardware settings." },
    ],
  },
  {
    id: "network",
    name: "Network Security",
    icon: "\u{1F310}",
    color: "#3b82f6",
    items: [
      { id: "net_vpn", label: "Use a VPN on public WiFi", desc: "Encrypt your internet traffic on untrusted networks to prevent eavesdropping and man-in-the-middle attacks." },
      { id: "net_router_pw", label: "Change default router password", desc: "Default router credentials are publicly known. Change them immediately to prevent unauthorized network access." },
      { id: "net_wpa3", label: "Use WPA3 or WPA2 encryption", desc: "Ensure your home WiFi uses strong encryption. Avoid WEP and open networks at all costs." },
      { id: "net_dns", label: "Use encrypted DNS (DoH/DoT)", desc: "Switch to DNS over HTTPS or DNS over TLS to prevent DNS queries from being intercepted or manipulated." },
      { id: "net_guest", label: "Set up guest WiFi network", desc: "Isolate IoT devices and visitors on a separate network to limit lateral movement if one device is compromised." },
      { id: "net_monitor", label: "Monitor connected devices", desc: "Regularly check your router admin panel for unknown devices that may indicate unauthorized access." },
    ],
  },
  {
    id: "privacy",
    name: "Privacy",
    icon: "\u{1F441}",
    color: "#a855f7",
    items: [
      { id: "prv_permissions", label: "Review app permissions", desc: "Audit which apps have access to your camera, microphone, contacts, and location. Revoke unnecessary ones." },
      { id: "prv_social", label: "Set social media to private", desc: "Limit who can see your posts, friends list, and personal information on social platforms." },
      { id: "prv_location", label: "Disable unnecessary location tracking", desc: "Turn off location services for apps that do not need it. Check both system and per-app settings." },
      { id: "prv_search", label: "Use a privacy-focused search engine", desc: "Consider DuckDuckGo or Startpage instead of engines that track and profile your search history." },
      { id: "prv_email_alias", label: "Use email aliases for signups", desc: "Create aliases or use services like SimpleLogin to keep your real email private and reduce spam." },
      { id: "prv_data_broker", label: "Opt out of data brokers", desc: "Request removal of your personal data from people-search sites and data broker databases." },
    ],
  },
  {
    id: "browsing",
    name: "Browsing Safety",
    icon: "\u{1F6E1}",
    color: "#eab308",
    items: [
      { id: "brw_https", label: "Verify HTTPS on sensitive sites", desc: "Always check for the padlock icon before entering credentials or payment information on any website." },
      { id: "brw_adblocker", label: "Install an ad blocker", desc: "Ad blockers prevent malvertising, reduce tracking, and improve page load times significantly." },
      { id: "brw_phishing", label: "Learn to identify phishing", desc: "Recognize suspicious URLs, urgent language, and mismatched sender addresses in emails and messages." },
      { id: "brw_extensions", label: "Audit browser extensions", desc: "Remove extensions you do not use. Each one is a potential attack vector with access to your browsing data." },
      { id: "brw_cookies", label: "Clear cookies regularly", desc: "Periodically clear cookies and site data to reduce long-term tracking across the web." },
      { id: "brw_downloads", label: "Scan downloads before opening", desc: "Always verify file integrity and scan downloaded files with antivirus before executing them." },
    ],
  },
  {
    id: "data",
    name: "Data Protection",
    icon: "\u{1F4BE}",
    color: "#f97316",
    items: [
      { id: "dat_backup", label: "Backup data (3-2-1 rule)", desc: "Keep 3 copies of data on 2 different media types with 1 stored offsite or in the cloud." },
      { id: "dat_breach", label: "Check breach status", desc: "Use HaveIBeenPwned or similar services to check if your email or passwords have been exposed in data breaches." },
      { id: "dat_encrypt_files", label: "Encrypt sensitive files", desc: "Use tools like VeraCrypt or 7-Zip with AES-256 to encrypt confidential documents and archives." },
      { id: "dat_cloud_2fa", label: "Secure cloud storage with 2FA", desc: "Enable two-factor authentication on Google Drive, Dropbox, OneDrive, and other cloud storage services." },
      { id: "dat_shred", label: "Securely delete old files", desc: "Use secure deletion tools to overwrite sensitive files instead of just moving them to the recycle bin." },
      { id: "dat_classify", label: "Classify sensitive information", desc: "Know where your most sensitive data lives. Label and protect financial records, medical data, and credentials." },
      { id: "dat_retention", label: "Set data retention policies", desc: "Do not keep data longer than necessary. Regularly purge old accounts, files, and unused credentials." },
    ],
  },
];

const allItems = categories.flatMap(c => c.items.map(item => ({ ...item, categoryId: c.id })));
const totalItems = allItems.length;

function getGrade(pct) {
  if (pct >= 90) return { grade: "A+", color: T.green };
  if (pct >= 80) return { grade: "A", color: T.green };
  if (pct >= 70) return { grade: "B", color: T.cyan };
  if (pct >= 60) return { grade: "C", color: "#eab308" };
  if (pct >= 50) return { grade: "D", color: "#f97316" };
  return { grade: "F", color: T.red };
}

function CircularProgress({ percentage, size = 200, strokeWidth = 10, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const { grade } = getGrade(percentage);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
      />
      <text x={size / 2} y={size / 2 - 14} textAnchor="middle" fontFamily="'Vrikaan Sans', sans-serif" fontSize="52" fontWeight="800" fill={color}>
        {Math.round(percentage)}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fontFamily="'Vrikaan Mono', monospace" fontSize="10" fill={T.muted} letterSpacing="2">
        PERCENT
      </text>
      <text x={size / 2} y={size / 2 + 36} textAnchor="middle" fontFamily="'Vrikaan Sans', sans-serif" fontSize="22" fontWeight="700" fill={color}>
        {grade}
      </text>
    </svg>
  );
}

function CategoryProgress({ category, checked, onToggle, expanded, onExpand }) {
  const checkedCount = category.items.filter(i => checked[i.id]).length;
  const pct = Math.round((checkedCount / category.items.length) * 100);
  const { grade, color: gradeColor } = getGrade(pct);

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(8px)", transition: "border-color 0.3s", marginBottom: 16 }}>
      <button
        onClick={onExpand}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", cursor: "pointer",
          background: "transparent", border: "none", textAlign: "left", color: T.white,
        }}
      >
        <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{category.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 16, fontWeight: 600 }}>{category.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 12, color: gradeColor, fontWeight: 700 }}>{grade}</span>
              <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 12, color: T.muted }}>{checkedCount}/{category.items.length}</span>
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(148,163,184,0.08)", borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: category.color, borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
        <span style={{ color: T.mutedDark, fontSize: 18, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0 }}>{"\u25BE"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 24px 20px" }}>
          {category.items.map((item, i) => (
            <div key={item.id}
              style={{
                display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0",
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <button
                onClick={() => onToggle(item.id)}
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer", marginTop: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s",
                  background: checked[item.id] ? `${category.color}18` : "transparent",
                  border: `1.5px solid ${checked[item.id] ? category.color : "rgba(148,163,184,0.2)"}`,
                  color: checked[item.id] ? category.color : "transparent",
                  fontSize: 13, fontWeight: 700, lineHeight: 1,
                }}
              >
                {checked[item.id] ? "\u2713" : ""}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 500, color: checked[item.id] ? T.muted : T.white,
                  textDecoration: checked[item.id] ? "line-through" : "none",
                  transition: "color 0.3s",
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: T.mutedDark, lineHeight: 1.6, marginTop: 4 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SecurityChecklist() {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch {}
  }, [checked]);

  const toggle = (id) => {
    setChecked(prev => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; } else { next[id] = true; }
      return next;
    });
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const expandAll = () => {
    const all = {};
    categories.forEach(c => { all[c.id] = true; });
    setExpandedCategories(all);
  };

  const collapseAll = () => setExpandedCategories({});

  const resetAll = () => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const checkedCount = Object.keys(checked).length;
  const overallPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const { grade: overallGrade, color: overallColor } = getGrade(overallPct);

  const uncheckedItems = allItems.filter(i => !checked[i.id]);
  const recommendations = uncheckedItems.slice(0, 5);

  const categoryStats = categories.map(c => {
    const done = c.items.filter(i => checked[i.id]).length;
    return { ...c, done, total: c.items.length, pct: Math.round((done / c.items.length) * 100) };
  });
  const weakestCategory = categoryStats.reduce((a, b) => a.pct < b.pct ? a : b, categoryStats[0]);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Security Checklist" description="Interactive personal security checklist to assess and improve your cybersecurity posture." path="/security-checklist" />
      <Navbar />
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.cyan}0c`, border: `1px solid ${T.cyan}20`, fontSize: 11, fontWeight: 600, color: T.cyan, marginBottom: 16, letterSpacing: 0.5 }}>
            Checklist
          </span>
          <h1 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Personal Security Checklist
          </h1>
          <p style={{ color: T.muted, fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Track your cybersecurity hygiene across {totalItems} items in {categories.length} categories. Your progress is saved automatically.
          </p>
        </div>

        {/* Overall Score Card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "40px 32px", backdropFilter: "blur(8px)", textAlign: "center", marginBottom: 32 }}>
          <CircularProgress percentage={overallPct} size={200} strokeWidth={10} color={overallColor} />
          <div style={{ marginTop: 16 }}>
            <span style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 20, fontWeight: 700, color: overallColor }}>
              {overallPct >= 90 ? "Excellent" : overallPct >= 70 ? "Good" : overallPct >= 50 ? "Moderate" : overallPct > 0 ? "Needs Work" : "Get Started"}
            </span>
          </div>
          <p style={{ color: T.muted, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
            {checkedCount} of {totalItems} items completed
          </p>

          {/* Category mini-bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28, textAlign: "left" }}>
            {categoryStats.map(cs => (
              <div key={cs.id} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{cs.icon} {cs.name}</span>
                  <span style={{ fontFamily: "'Vrikaan Mono', monospace", fontSize: 11, color: getGrade(cs.pct).color, fontWeight: 700 }}>{cs.pct}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(148,163,184,0.08)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${cs.pct}%`, background: cs.color, borderRadius: 3, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={expandAll} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: "pointer", fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.25s" }}>
              Expand All
            </button>
            <button onClick={collapseAll} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: "pointer", fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.25s" }}>
              Collapse All
            </button>
          </div>
          <button onClick={resetAll} style={{ padding: "8px 16px", background: "rgba(239,68,68,0.08)", border: `1px solid rgba(239,68,68,0.15)`, borderRadius: 8, color: T.red, cursor: "pointer", fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.25s" }}>
            Reset Progress
          </button>
        </div>

        {/* Category Sections */}
        {categories.map(cat => (
          <CategoryProgress
            key={cat.id}
            category={cat}
            checked={checked}
            onToggle={toggle}
            expanded={!!expandedCategories[cat.id]}
            onExpand={() => toggleCategory(cat.id)}
          />
        ))}

        {/* Recommendations */}
        {uncheckedItems.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "32px 28px", backdropFilter: "blur(8px)", marginTop: 32 }}>
            <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
              Recommended Actions
            </h3>
            <p style={{ color: T.mutedDark, fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
              {weakestCategory && weakestCategory.pct < 100
                ? `Your weakest area is ${weakestCategory.name} at ${weakestCategory.pct}%. Focus there first.`
                : "Keep going! Complete the remaining items to reach a perfect score."}
            </p>
            {recommendations.map((item, i) => {
              const cat = categories.find(c => c.id === item.categoryId);
              return (
                <div key={item.id} style={{
                  display: "flex", gap: 14, alignItems: "center", padding: "12px 0",
                  borderBottom: i < recommendations.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <span style={{
                    fontFamily: "'Vrikaan Mono', monospace", fontSize: 11, color: T.mutedDark, minWidth: 24,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
                    background: `${cat.color}12`, color: cat.color, flexShrink: 0,
                  }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.white, flex: 1 }}>{item.label}</span>
                  <button
                    onClick={() => {
                      toggle(item.id);
                      setExpandedCategories(prev => ({ ...prev, [item.categoryId]: true }));
                    }}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      background: `${cat.color}12`, border: `1px solid ${cat.color}25`, color: cat.color,
                      fontFamily: "'Vrikaan Sans', sans-serif", transition: "all 0.25s", flexShrink: 0,
                    }}
                  >
                    Mark Done
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* All Done State */}
        {uncheckedItems.length === 0 && checkedCount > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "40px 32px", backdropFilter: "blur(8px)", textAlign: "center", marginTop: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F389}"}</div>
            <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 12px", color: T.green }}>
              Perfect Score!
            </h3>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
              You have completed every item on the checklist. Your security posture is excellent. Remember to revisit periodically as threats evolve.
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ textAlign: "center", marginTop: 40, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/security-score" style={{ display: "inline-block", padding: "12px 28px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.muted, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Take Security Assessment
          </Link>
          <Link to="/learn" style={{ display: "inline-block", padding: "12px 28px", background: T.accent, borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Learn More
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}