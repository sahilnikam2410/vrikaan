import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };

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

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); setToolsOpen(false); setMobileToolsOpen(false); setNotifOpen(false); }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setToolsOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isToolActive = toolsMenu.some(g => g.items.some(i => location.pathname === i.to));

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "10px 40px" : "14px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,7,18,0.95)" : "rgba(3,7,18,0.7)",
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
                    background: "rgba(10,15,30,0.98)", backdropFilter: "blur(20px)",
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
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "2px solid #030712" }} />

                {/* Notification dropdown */}
                {notifOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 12px)", right: -40,
                    width: 300, background: "rgba(10,15,30,0.98)", backdropFilter: "blur(20px)",
                    border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden",
                    animation: "dropIn 0.2s ease",
                  }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: T.white }}>
                      Notifications
                    </div>
                    {[
                      { msg: "New phishing threat detected in your region", time: "2m ago", color: "#ef4444", icon: "!" },
                      { msg: "Security score updated: 92/100", time: "1h ago", color: "#22c55e", icon: "&#10003;" },
                      { msg: "Dark web scan complete — no leaks found", time: "3h ago", color: T.cyan, icon: "&#9670;" },
                    ].map((n, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${n.color}12`, border: `1px solid ${n.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: n.color, flexShrink: 0, fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: n.icon }} />
                        <div>
                          <div style={{ fontSize: 12, color: T.white, lineHeight: 1.5 }}>{n.msg}</div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                    <Link to="/dashboard" style={{ display: "block", padding: "10px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: T.accent, textDecoration: "none" }}>
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
          background: "rgba(3,7,18,0.98)", backdropFilter: "blur(20px)",
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
          background: "rgba(3,7,18,0.95)", backdropFilter: "blur(20px)",
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
