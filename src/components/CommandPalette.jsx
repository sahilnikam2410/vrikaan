import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ToolIcon from "../lib/toolIcons.jsx";

const T = {
  bg: "rgba(3,7,18,0.92)",
  surface: "#0a0f1e",
  card: "rgba(17,24,39,0.95)",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  accent: "#6366f1",
  cyan: "#14b8a6",
  border: "rgba(148,163,184,0.12)",
};

const COMMANDS = [
  // Tools
  { id: "fraud-analyzer", label: "Fraud Analyzer", path: "/fraud-analyzer", group: "Tools", icon: "🔍", keywords: "scan url phishing scam" },
  { id: "password-vault", label: "Password Vault", path: "/password-vault", group: "Tools", icon: "🔐", keywords: "passwords store generator" },
  { id: "password-checker", label: "Password Checker", path: "/password-checker", group: "Tools", icon: "🔑", keywords: "strength leak haveibeenpwned" },
  { id: "vuln-scanner", label: "Vulnerability Scanner", path: "/vulnerability-scanner", group: "Tools", icon: "⚡", keywords: "cve security holes" },
  { id: "dark-web", label: "Dark Web Monitor", path: "/dark-web-monitor", group: "Tools", icon: "🌑", keywords: "breach leak email exposed" },
  { id: "ip-lookup", label: "IP Lookup", path: "/ip-lookup", group: "Tools", icon: "🌐", keywords: "geolocation reputation" },
  { id: "qr-scanner", label: "QR Scanner", path: "/qr-scanner", group: "Tools", icon: "📷", keywords: "barcode" },
  { id: "email-analyzer", label: "Email Analyzer", path: "/email-analyzer", group: "Tools", icon: "📧", keywords: "phishing header dmarc" },
  { id: "whois", label: "WHOIS Lookup", path: "/whois-lookup", group: "Tools", icon: "🔎", keywords: "domain registrar owner" },
  { id: "fingerprint", label: "Browser Fingerprint", path: "/browser-fingerprint", group: "Tools", icon: "🖐", keywords: "tracking privacy" },
  { id: "dns-leak", label: "DNS Leak Test", path: "/dns-leak-test", group: "Tools", icon: "📡", keywords: "vpn privacy" },
  { id: "headers", label: "Security Headers", path: "/security-headers", group: "Tools", icon: "🛡", keywords: "csp hsts grade" },
  { id: "phish-trainer", label: "Phishing Trainer", path: "/phishing-trainer", group: "Tools", icon: "🎯", keywords: "practice quiz" },
  { id: "hash-scan", label: "File Hash Scanner", path: "/file-hash-scanner", group: "Tools", icon: "📁", keywords: "malware md5 sha256 virustotal" },
  { id: "2fa-guide", label: "2FA Setup Guide", path: "/2fa-guide", group: "Tools", icon: "🔢", keywords: "totp authenticator" },
  { id: "identity-xray", label: "Identity X-Ray", path: "/identity-xray", group: "Tools", icon: "🪪", keywords: "exposure footprint" },
  { id: "security-audit", label: "Security Audit", path: "/security-audit", group: "Tools", icon: "📋", keywords: "checklist score" },
  { id: "threat-map", label: "Threat Map", path: "/threat-map", group: "Tools", icon: "🗺", keywords: "global attacks live" },
  { id: "scam-db", label: "Scam Database", path: "/scam-database", group: "Tools", icon: "📚", keywords: "report scammer" },

  // Account
  { id: "dashboard", label: "Dashboard", path: "/dashboard", group: "Account", icon: "📊", keywords: "home overview" },
  { id: "user-dashboard", label: "User Settings", path: "/user-dashboard", group: "Account", icon: "⚙️", keywords: "profile devices security" },
  { id: "referral", label: "Refer & Earn", path: "/referral", group: "Account", icon: "🎁", keywords: "invite friends credits" },
  { id: "pricing", label: "Plans & Pricing", path: "/pricing", group: "Account", icon: "💳", keywords: "upgrade subscription" },

  // Content
  { id: "learn", label: "Learn Center", path: "/learn", group: "Content", icon: "🎓", keywords: "courses tutorials" },
  { id: "blog", label: "Blog", path: "/blog", group: "Content", icon: "📝", keywords: "articles posts" },
  { id: "cyber-news", label: "Cyber News", path: "/cyber-news", group: "Content", icon: "📰", keywords: "latest threats" },
  { id: "threats", label: "Threat Directory", path: "/threats", group: "Content", icon: "⚠️", keywords: "phishing ransomware" },

  // Public
  { id: "about", label: "About", path: "/about", group: "Pages", icon: "ℹ️" },
  { id: "founder", label: "Founder", path: "/founder", group: "Pages", icon: "👤" },
  { id: "press", label: "Press Kit", path: "/press", group: "Pages", icon: "📰", keywords: "media brand" },
  { id: "careers", label: "Careers · We are hiring", path: "/careers", group: "Pages", icon: "💼", keywords: "jobs internship hire intern openings" },
  { id: "contact", label: "Contact", path: "/contact", group: "Pages", icon: "✉️" },
  { id: "features", label: "Features", path: "/features", group: "Pages", icon: "✨" },
  { id: "emergency", label: "Emergency Help", path: "/emergency-help", group: "Pages", icon: "🚨", keywords: "panic urgent" },
];

const ADMIN_COMMANDS = [
  { id: "admin", label: "Admin Dashboard", path: "/admin", group: "Admin", icon: "🛡", keywords: "users payments audit" },
];

function fuzzyMatch(text, query) {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return 100 - (t.indexOf(q) * 0.5);
  // fuzzy character-by-character
  let ti = 0, score = 0, hits = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    score += found - ti < 3 ? 2 : 1;
    hits++;
    ti = found + 1;
  }
  return hits === q.length ? score : 0;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const allCommands = useMemo(() => {
    const base = [...COMMANDS];
    if (isAdmin) base.push(...ADMIN_COMMANDS);
    base.push({ id: "logout", label: "Sign Out", action: async () => { await logout(); navigate("/login"); }, group: "Account", icon: "🚪", keywords: "log out exit" });
    return base;
  }, [isAdmin, logout, navigate]);

  // Open with Cmd+K / Ctrl+K, close with Esc
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Ranked + grouped results
  const results = useMemo(() => {
    if (!query) return allCommands;
    return allCommands
      .map((c) => {
        const text = `${c.label} ${c.keywords || ""} ${c.group}`;
        return { ...c, _score: fuzzyMatch(text, query) };
      })
      .filter((c) => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 30);
  }, [query, allCommands]);

  // Reset active when results change
  useEffect(() => { setActive(0); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const handleSelect = (cmd) => {
    setOpen(false);
    if (cmd.action) cmd.action();
    else if (cmd.path) navigate(cmd.path);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[active]) { e.preventDefault(); handleSelect(results[active]); }
  };

  // Group results
  const grouped = results.reduce((acc, cmd) => {
    (acc[cmd.group] = acc[cmd.group] || []).push(cmd);
    return acc;
  }, {});

  let runningIdx = 0;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(3,7,18,0.7)", backdropFilter: "blur(6px)",
        zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: "10vh", animation: "cp-fade 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 92vw)",
          maxHeight: "75vh", display: "flex", flexDirection: "column",
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden", animation: "cp-pop 0.18s cubic-bezier(0.22,1,0.36,1)",
          fontFamily: "'Vrikaan Sans', sans-serif",
        }}
      >
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontSize: 18, color: T.muted }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type to search tools, pages, or actions…"
            aria-label="Command palette search"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: T.white, fontSize: 16, fontFamily: "inherit",
            }}
          />
          <kbd style={{
            padding: "3px 8px", borderRadius: 5,
            background: "rgba(148,163,184,0.1)", border: `1px solid ${T.border}`,
            fontSize: 11, color: T.muted, fontFamily: "monospace",
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
          {results.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: T.muted, fontSize: 13 }}>
              No matches for "<span style={{ color: T.white }}>{query}</span>"
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div style={{
                  padding: "8px 20px 4px", fontSize: 10, color: T.mutedDark,
                  textTransform: "uppercase", letterSpacing: 1, fontWeight: 700,
                }}>{group}</div>
                {items.map((c) => {
                  const idx = runningIdx++;
                  const isActive = idx === active;
                  return (
                    <button
                      key={c.id}
                      data-idx={idx}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setActive(idx)}
                      style={{
                        width: "100%", padding: "10px 20px",
                        display: "flex", alignItems: "center", gap: 12,
                        background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: T.white, fontSize: 14, textAlign: "left",
                        fontFamily: "inherit",
                        borderLeft: isActive ? `3px solid ${T.cyan}` : "3px solid transparent",
                      }}
                    >
                      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "rgba(20, 184, 166,0.14)" : "rgba(148,163,184,0.08)", color: T.cyan }}>
                        {c.path ? <ToolIcon to={c.path} size={16} /> : <span style={{ fontSize: 16 }}>{c.icon || "›"}</span>}
                      </span>
                      <span style={{ flex: 1 }}>{c.label}</span>
                      {isActive && <kbd style={{
                        padding: "2px 6px", borderRadius: 4,
                        background: "rgba(20, 184, 166,0.12)", border: `1px solid rgba(20, 184, 166,0.25)`,
                        fontSize: 10, color: T.cyan, fontFamily: "monospace",
                      }}>↵</kbd>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 20px", borderTop: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between",
          fontSize: 11, color: T.muted, background: "rgba(15,23,42,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span><kbd style={{ fontFamily: "monospace", padding: "1px 6px", borderRadius: 3, background: "rgba(148,163,184,0.1)" }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ fontFamily: "monospace", padding: "1px 6px", borderRadius: 3, background: "rgba(148,163,184,0.1)" }}>↵</kbd> Open</span>
          </div>
          <div>{results.length} result{results.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <style>{`
        @keyframes cp-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cp-pop { from { opacity: 0; transform: scale(0.96) translateY(-8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
