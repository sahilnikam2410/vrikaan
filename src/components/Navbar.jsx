import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TD = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };
const TL = { bg: "#f8fafc", white: "#0f172a", muted: "#475569", accent: "#6366f1", cyan: "#0d9488", border: "rgba(15,23,42,0.08)" };

const toolsMenu = [
  { label: "Security Tools", items: [
    { to: "/threat-map", label: "🌍 Threat Map", desc: "Real-time global threats" },
    { to: "/fraud-analyzer", label: "🔍 Fraud Analyzer", desc: "AI scam detection" },
    { to: "/security-score", label: "📊 Security Score", desc: "Check your security" },
    { to: "/vulnerability-scanner", label: "🛡️ Vulnerability Scanner", desc: "Scan websites" },
    { to: "/dark-web-monitor", label: "🕵️ Dark Web Monitor", desc: "Check data leaks" },
  ]},
  { label: "Privacy Tools", items: [
    { to: "/password-vault", label: "🔐 Password Vault", desc: "Generate & manage" },
    { to: "/email-analyzer", label: "📧 Email Analyzer", desc: "Detect spoofing" },
    { to: "/ip-lookup", label: "🌐 IP Lookup", desc: "Geolocation & threat" },
    { to: "/qr-scanner", label: "📱 QR Scanner", desc: "Scan & generate QR" },
    { to: "/security-checklist", label: "✅ Security Checklist", desc: "Personal audit" },
  ]},
];

const mainLinks = [
  { to: "/learn", label: "Learn" },
  { to: "/cyber-news", label: "News" },
  { to: "/blog", label: "Blog" },
  { to: "/pricing", label: "Pricing" },
];

const SEARCH_ITEMS = [
  { label: "Threat Map", to: "/threat-map", cat: "Tools", icon: "\uD83C\uDF0D" },
  { label: "Fraud Analyzer", to: "/fraud-analyzer", cat: "Tools", icon: "\uD83D\uDD0D" },
  { label: "Security Score", to: "/security-score", cat: "Tools", icon: "\uD83D\uDCCA" },
  { label: "Vulnerability Scanner", to: "/vulnerability-scanner", cat: "Tools", icon: "\uD83D\uDEE1\uFE0F" },
  { label: "Dark Web Monitor", to: "/dark-web-monitor", cat: "Tools", icon: "\uD83D\uDD75\uFE0F" },
  { label: "Password Vault", to: "/password-vault", cat: "Tools", icon: "\uD83D\uDD10" },
  { label: "Email Analyzer", to: "/email-analyzer", cat: "Tools", icon: "\uD83D\uDCE7" },
  { label: "IP Lookup", to: "/ip-lookup", cat: "Tools", icon: "\uD83C\uDF10" },
  { label: "QR Scanner", to: "/qr-scanner", cat: "Tools", icon: "\uD83D\uDCF1" },
  { label: "Security Checklist", to: "/security-checklist", cat: "Tools", icon: "\u2705" },
  { label: "Learn", to: "/learn", cat: "Pages", icon: "\uD83D\uDCDA" },
  { label: "Blog", to: "/blog", cat: "Pages", icon: "\u270D\uFE0F" },
  { label: "Cyber News", to: "/cyber-news", cat: "Pages", icon: "\uD83D\uDCF0" },
  { label: "Pricing", to: "/pricing", cat: "Pages", icon: "\uD83D\uDCB3" },
  { label: "About", to: "/about", cat: "Pages", icon: "\u2139\uFE0F" },
  { label: "Contact", to: "/contact", cat: "Pages", icon: "\uD83D\uDCEC" },
  { label: "Features", to: "/features", cat: "Pages", icon: "\u2728" },
  { label: "Dashboard", to: "/dashboard", cat: "Account", icon: "\uD83D\uDCCA" },
  { label: "Profile", to: "/user-dashboard", cat: "Account", icon: "\uD83D\uDC64" },
];

const Navbar = () => {
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const T = mode === "dark" ? TD : TL;
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, msg: "New phishing threat detected in your region", time: "2m ago", color: "#ef4444", icon: "!", read: false },
    { id: 2, msg: "Security score updated: 92/100", time: "1h ago", color: "#22c55e", icon: "\u2713", read: false },
    { id: 3, msg: "Dark web scan complete \u2014 no leaks found", time: "3h ago", color: "#14e3c5", icon: "\u25C6", read: false },
    { id: 4, msg: "Password vault: 2 weak passwords detected", time: "5h ago", color: "#f97316", icon: "!", read: true },
    { id: 5, msg: "Welcome to SECUVION! Start your security journey", time: "1d ago", color: "#6366f1", icon: "\u2605", read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const dropRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); setToolsOpen(false); setMobileToolsOpen(false); setNotifOpen(false); setSearchOpen(false); setSearchQuery(""); }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setToolsOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Ctrl+K shortcut to open search
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isToolActive = toolsMenu.some(g => g.items.some(i => location.pathname === i.to));

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "10px 40px" : "14px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? (mode === "dark" ? "rgba(3,7,18,0.95)" : "rgba(248,250,252,0.95)") : (mode === "dark" ? "rgba(3,7,18,0.7)" : "rgba(248,250,252,0.7)"),
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(148,163,184,0.06)",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: 20, fontWeight: 800, color: T.white, textDecoration: "none",
          fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #14e3c5, #6366f1)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>S</span>
          SECUVION
        </Link>

        {/* Desktop links — only show Tools, Learn, News, Blog when logged in */}
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {user && (
            <>
              {/* Tools dropdown */}
              <div ref={dropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  style={{
                    color: isToolActive ? T.accent : T.muted, background: toolsOpen ? "rgba(99,102,241,0.08)" : "transparent",
                    border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                    padding: "8px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.2s", fontFamily: "inherit",
                  }}
                >
                  Tools
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: toolsOpen ? "rotate(180deg)" : "none" }}>
                    <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {toolsOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                    background: mode === "dark" ? "rgba(10,15,30,0.98)" : "rgba(241,245,249,0.98)", backdropFilter: "blur(20px)",
                    border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 14,
                    padding: 16, minWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    display: "flex", gap: 20, animation: "dropIn 0.2s ease",
                  }}>
                    {toolsMenu.map((group, gi) => (
                      <div key={gi} style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, padding: "0 8px" }}>
                          {group.label}
                        </div>
                        {group.items.map(item => (
                          <Link key={item.to} to={item.to} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                            borderRadius: 8, textDecoration: "none", transition: "background 0.15s",
                            background: isActive(item.to) ? "rgba(99,102,241,0.1)" : "transparent",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = isActive(item.to) ? "rgba(99,102,241,0.1)" : "transparent"}
                          >
                            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.label.split(" ")[0]}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: isActive(item.to) ? T.accent : T.white }}>{item.label.split(" ").slice(1).join(" ")}</div>
                              <div style={{ fontSize: 11, color: T.muted }}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regular links (Learn, News, Blog) */}
              {mainLinks.filter(l => l.to !== "/pricing").map(l => (
                <Link key={l.to} to={l.to} style={{
                  color: isActive(l.to) ? T.accent : T.muted,
                  textDecoration: "none", fontSize: 14, fontWeight: 500,
                  padding: "8px 14px", borderRadius: 8, transition: "all 0.2s",
                  background: isActive(l.to) ? "rgba(99,102,241,0.08)" : "transparent",
                }}
                  onMouseEnter={e => { if (!isActive(l.to)) e.currentTarget.style.color = T.white; }}
                  onMouseLeave={e => { if (!isActive(l.to)) e.currentTarget.style.color = T.muted; }}
                >{l.label}</Link>
              ))}
            </>
          )}

          {/* Pricing — always visible */}
          <Link to="/pricing" style={{
            color: isActive("/pricing") ? T.accent : T.muted,
            textDecoration: "none", fontSize: 14, fontWeight: 500,
            padding: "8px 14px", borderRadius: 8, transition: "all 0.2s",
            background: isActive("/pricing") ? "rgba(99,102,241,0.08)" : "transparent",
          }}
            onMouseEnter={e => { if (!isActive("/pricing")) e.currentTarget.style.color = T.white; }}
            onMouseLeave={e => { if (!isActive("/pricing")) e.currentTarget.style.color = T.muted; }}
          >Pricing</Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="nav-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
            <button onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              style={{
                background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, borderRadius: 8,
                height: 34, display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                transition: "all 0.3s", color: T.muted, padding: "0 12px", fontFamily: "inherit", fontSize: 13,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent + "40"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="nav-search-label" style={{ color: T.muted }}>Search</span>
              <kbd style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, background: "rgba(148,163,184,0.08)", border: `1px solid ${T.border}`, color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>Ctrl K</kbd>
            </button>

            {searchOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0, width: 360,
                background: mode === "dark" ? "rgba(10,15,30,0.98)" : "rgba(241,245,249,0.98)", backdropFilter: "blur(20px)",
                border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 14,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)", overflow: "hidden",
                animation: "dropIn 0.2s ease",
              }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input ref={searchInputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && searchResults.length > 0) { navigate(searchResults[0].to); setSearchOpen(false); setSearchQuery(""); } }}
                    placeholder="Search tools, pages..."
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: T.white, fontSize: 14, fontFamily: "inherit" }}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>&times;</button>}
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {searchQuery && searchResults.length === 0 && (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: T.muted, fontSize: 13 }}>No results found</div>
                  )}
                  {searchResults.map((item, i) => (
                    <Link key={item.to} to={item.to} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                        textDecoration: "none", transition: "background 0.15s",
                        borderBottom: i < searchResults.length - 1 ? `1px solid ${T.border}` : "none",
                        background: "transparent",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{item.cat}</div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                  ))}
                  {!searchQuery && (
                    <div style={{ padding: "16px", color: T.muted, fontSize: 12, textAlign: "center" }}>
                      Type to search across tools, pages, and features
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"} style={{
            background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, borderRadius: 8,
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.3s", color: T.muted, padding: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent + "40"; e.currentTarget.style.color = T.white; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >
            {mode === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user ? (
            <>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: "relative", cursor: "pointer", padding: 6 }}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: "#ef4444", border: `2px solid ${T.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", padding: "0 3px", fontFamily: "'Space Grotesk'" }}>
                    {unreadCount}
                  </span>
                )}

                {/* Notification dropdown */}
                {notifOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 12px)", right: -40,
                    width: 340, background: mode === "dark" ? "rgba(10,15,30,0.98)" : "rgba(241,245,249,0.98)", backdropFilter: "blur(20px)",
                    border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)", overflow: "hidden",
                    animation: "dropIn 0.2s ease",
                  }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: T.white }}>
                        Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: T.accent, fontWeight: 600, marginLeft: 6 }}>{unreadCount} new</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); markAllRead(); }} style={{ background: "none", border: "none", fontSize: 11, color: T.accent, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", padding: "2px 6px" }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {notifications.length === 0 && (
                        <div style={{ padding: "32px 16px", textAlign: "center", color: T.muted, fontSize: 13 }}>No notifications</div>
                      )}
                      {notifications.map((n) => (
                        <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", transition: "background 0.2s", background: n.read ? "transparent" : (mode === "dark" ? "rgba(99,102,241,0.03)" : "rgba(99,102,241,0.04)") }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : (mode === "dark" ? "rgba(99,102,241,0.03)" : "rgba(99,102,241,0.04)")}
                          onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: `${n.color}12`, border: `1px solid ${n.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: n.color, flexShrink: 0, fontWeight: 700 }}>{n.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: n.read ? T.muted : T.white, lineHeight: 1.5, fontWeight: n.read ? 400 : 500 }}>{n.msg}</div>
                            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{n.time}</div>
                          </div>
                          {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, flexShrink: 0, marginTop: 6 }} />}
                          <button onClick={(e) => { e.stopPropagation(); dismissNotif(n.id); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1, opacity: 0.5 }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
                          >&times;</button>
                        </div>
                      ))}
                    </div>
                    <Link to="/dashboard" style={{ display: "block", padding: "10px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: T.accent, textDecoration: "none", borderTop: `1px solid ${T.border}` }}>
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <Link to="/dashboard" style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #14e3c5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
                border: "2px solid rgba(99,102,241,0.3)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </Link>

              <Link to="/dashboard" style={{
                padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
                borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13,
                fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
              }}>Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: "8px 18px", border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: 8, color: T.white, textDecoration: "none", fontSize: 13, fontWeight: 500, background: "transparent",
              }}>Login</Link>
              <Link to="/signup" style={{
                padding: "8px 18px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
                borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 13,
                fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
              }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-burger" onClick={() => setOpen(!open)} style={{
          display: "none", background: "none", border: "none", cursor: "pointer",
          padding: 6, flexDirection: "column", gap: 5, zIndex: 1001,
        }}>
          <span style={{ display: "block", width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 2, background: T.white, borderRadius: 2, transition: "all 0.3s", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: mode === "dark" ? "rgba(3,7,18,0.98)" : "rgba(248,250,252,0.98)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 80, overflowY: "auto",
          animation: "navFadeIn 0.25s ease",
        }}>
          {/* Tools accordion — only when logged in */}
          {user && (
            <>
              <button onClick={() => setMobileToolsOpen(!mobileToolsOpen)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: isToolActive ? T.accent : T.white, fontSize: 20, fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif", padding: "12px 24px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                Tools
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 0.2s", transform: mobileToolsOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {mobileToolsOpen && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 0 12px", animation: "navFadeIn 0.2s ease" }}>
                  {toolsMenu.flatMap(g => g.items).map(item => (
                    <Link key={item.to} to={item.to} style={{
                      color: isActive(item.to) ? T.accent : T.muted, textDecoration: "none",
                      fontSize: 15, fontWeight: 500, padding: "8px 24px",
                    }}>{item.label}</Link>
                  ))}
                </div>
              )}

              {/* Learn, News, Blog — only when logged in */}
              {mainLinks.filter(l => l.to !== "/pricing").map(l => (
                <Link key={l.to} to={l.to} style={{
                  color: isActive(l.to) ? T.accent : T.white,
                  textDecoration: "none", fontSize: 20, fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  padding: "12px 24px", transition: "color 0.2s",
                }}>{l.label}</Link>
              ))}
            </>
          )}

          {/* Pricing — always visible */}
          <Link to="/pricing" style={{
            color: isActive("/pricing") ? T.accent : T.white,
            textDecoration: "none", fontSize: 20, fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            padding: "12px 24px", transition: "color 0.2s",
          }}>Pricing</Link>

          <Link to="/about" style={{ color: T.muted, textDecoration: "none", fontSize: 16, fontWeight: 500, padding: "8px 24px" }}>About</Link>
          <Link to="/contact" style={{ color: T.muted, textDecoration: "none", fontSize: 16, fontWeight: 500, padding: "8px 24px" }}>Contact</Link>

          <div style={{ width: 60, height: 1, background: "rgba(148,163,184,0.1)", margin: "12px 0" }} />
          {user ? (
            <Link to="/dashboard" style={{
              padding: "12px 36px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
              borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 16,
              fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            }}>Dashboard</Link>
          ) : (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Link to="/login" style={{
                padding: "12px 28px", border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: 10, color: T.white, textDecoration: "none", fontSize: 15, fontWeight: 500,
              }}>Login</Link>
              <Link to="/signup" style={{
                padding: "12px 28px", background: "linear-gradient(135deg, #6366f1, #14e3c5)",
                borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600,
              }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation — only for logged-in users */}
      {user && (
        <div className="mobile-bottom-nav" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 998,
          background: mode === "dark" ? "rgba(3,7,18,0.95)" : "rgba(248,250,252,0.95)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${T.border}`,
          display: "none", justifyContent: "space-around", alignItems: "center",
          padding: "6px 0 env(safe-area-inset-bottom, 6px)", height: 60,
        }}>
          {[
            { to: "/", label: "Home", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            )},
            { to: "/dashboard", label: "Dashboard", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            )},
            { to: "/fraud-analyzer", label: "Scan", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )},
            { to: "/learn", label: "Learn", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            )},
            { to: "/user-dashboard", label: "Profile", icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            )},
          ].map((item, i) => {
            const active = location.pathname === item.to || (item.to === "/dashboard" && location.pathname.includes("dashboard"));
            return (
              <Link key={i} to={item.to} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                textDecoration: "none", color: active ? T.accent : T.muted, fontSize: 10, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "4px 12px",
                transition: "color 0.2s", position: "relative",
              }}>
                {active && <span style={{ position: "absolute", top: -6, width: 20, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #14e3c5)" }} />}
                <span style={{ color: active ? T.accent : T.muted, transition: "color 0.2s" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes navFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dropIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 1100px) {
          .nav-search-label { display: none !important; }
        }
        @media (max-width: 900px) {
          .nav-desktop-links, .nav-desktop-auth { display: none !important; }
          .nav-mobile-burger { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
