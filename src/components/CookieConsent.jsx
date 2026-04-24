import { useState, useEffect } from "react";

const T = {
  bg: "rgba(3,7,18,0.97)", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b",
  accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.1)",
  cardBg: "rgba(148,163,184,0.03)",
};

const STORAGE_KEY = "secuvion_consent_v2";

// Dispatch to the inline loader in index.html so it can fire GA + Clarity
function broadcast(consent) {
  try {
    window.dispatchEvent(new CustomEvent("secuvion:consent-updated", { detail: consent }));
  } catch (e) { /* ignore */ }
}

function save(consent) {
  const payload = { ...consent, timestamp: new Date().toISOString(), version: 2 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  broadcast(payload);
  return payload;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ essential: true, analytics: false });

  useEffect(() => {
    let existing = null;
    try { existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { /* ignore */ }

    if (!existing || existing.version !== 2) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // Already decided — re-broadcast so analytics loads on subsequent visits
    broadcast(existing);
  }, []);

  const acceptAll = () => { save({ essential: true, analytics: true }); setVisible(false); };
  const rejectAll = () => { save({ essential: true, analytics: false }); setVisible(false); };
  const saveCustom = () => { save({ essential: true, analytics: prefs.analytics }); setVisible(false); };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cookieSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .secuvion-cc-toggle { position: relative; width: 36px; height: 20px; border-radius: 20px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; border: none; padding: 0; }
        .secuvion-cc-toggle::after { content: ''; position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; }
      `}</style>
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Cookie consent preferences"
        style={{
          position: "fixed", bottom: 24, left: 24, right: "auto",
          maxWidth: expanded ? 520 : 440, width: "calc(100% - 48px)", zIndex: 10000,
          background: T.bg, backdropFilter: "blur(20px)",
          border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "20px 22px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "cookieSlideUp 0.4s ease both",
          transition: "max-width 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🛡️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, color: T.white,
              margin: "0 0 6px", fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Your privacy, your choice
            </h4>
            <p style={{ fontSize: 13, color: T.muted, margin: "0 0 14px", lineHeight: 1.6 }}>
              We use cookies to keep VRIKAAN secure and to understand how the platform is used.
              Under India's DPDP Act and GDPR, you control what we collect. Essential cookies keep
              authentication and security working — analytics are optional.{" "}
              <a href="/privacy" style={{ color: T.cyan, textDecoration: "none" }}>Privacy policy</a>
            </p>

            {expanded && (
              <div style={{ animation: "fadeIn 0.3s ease", marginBottom: 14 }}>
                {/* Essential */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: T.cardBg,
                  border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.white, marginBottom: 2 }}>
                      Essential <span style={{ color: T.mutedDark, fontWeight: 500, fontSize: 10 }}>• Always active</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                      Authentication, session, security, CSRF protection. Required for the site to function.
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-label="Essential cookies always on"
                    className="secuvion-cc-toggle"
                    style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, opacity: 0.6, cursor: "not-allowed" }}
                  >
                    <span style={{ position: "absolute", top: 2, left: 18, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                  </button>
                </div>

                {/* Analytics */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: T.cardBg,
                  border: `1px solid ${T.border}`, borderRadius: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.white, marginBottom: 2 }}>
                      Analytics <span style={{ color: T.mutedDark, fontWeight: 500, fontSize: 10 }}>• Optional</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                      Google Analytics &amp; Microsoft Clarity with anonymized IPs. Helps us fix bugs and improve tools.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.analytics}
                    aria-label="Toggle analytics cookies"
                    onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                    className="secuvion-cc-toggle"
                    style={{ background: prefs.analytics ? `linear-gradient(135deg, ${T.accent}, ${T.cyan})` : "rgba(148,163,184,0.2)" }}
                  >
                    <span style={{ position: "absolute", top: 2, left: prefs.analytics ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {expanded ? (
                <button onClick={saveCustom} style={{
                  padding: "9px 22px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Save preferences
                </button>
              ) : (
                <button onClick={acceptAll} style={{
                  padding: "9px 22px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Accept all
                </button>
              )}
              <button onClick={rejectAll} style={{
                padding: "9px 18px", borderRadius: 8,
                background: "transparent", border: `1px solid ${T.border}`,
                color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Reject non-essential
              </button>
              <button
                onClick={() => setExpanded(e => !e)}
                style={{
                  padding: "9px 4px", background: "transparent", border: "none",
                  color: T.cyan, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", marginLeft: "auto",
                }}
              >
                {expanded ? "Less" : "Customize"}
              </button>
            </div>
          </div>
          <button
            onClick={rejectAll}
            aria-label="Close and reject non-essential"
            style={{
              background: "none", border: "none", color: T.muted,
              cursor: "pointer", fontSize: 18, padding: 4, lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
