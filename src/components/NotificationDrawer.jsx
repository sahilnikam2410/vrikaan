import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listNotifications,
  markAllRead,
  markRead,
  dismissNotification,
  clearAll,
  subscribe,
  seedWelcome,
} from "../services/notificationService";

const T = {
  bg: "rgba(3,7,18,0.96)",
  card: "rgba(17,24,39,0.85)",
  white: "#f1f5f9",
  muted: "#94a3b8",
  mutedDark: "#64748b",
  accent: "#6366f1",
  cyan: "#14e3c5",
  red: "#ef4444",
  border: "rgba(148,163,184,0.12)",
};

/**
 * Slide-in notification drawer.
 *
 * Usage:
 *   <NotificationBell />              // shows the icon + unread count
 *   On click, mounts the drawer with the full list. Mobile-first.
 */
export default function NotificationBell({ size = 22 }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = useCallback(() => {
    setItems(listNotifications(user?.uid));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    seedWelcome(user.uid);
    refresh();
    const unsub = subscribe(refresh);
    return () => unsub();
  }, [user?.uid, refresh]);

  const unreadCount = items.filter((n) => !n.read).length;

  if (!user?.uid) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Notifications (${unreadCount} unread)`}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          color: T.white,
          cursor: "pointer",
          padding: 6,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(148,163,184,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8,
            background: T.red, color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #030712",
            fontFamily: "'Vrikaan Sans', sans-serif",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 9998, animation: "nd-fade 0.2s ease",
            }}
          />
          {/* Drawer */}
          <aside
            role="dialog"
            aria-label="Notifications"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "min(420px, 100vw)",
              background: T.bg,
              borderLeft: `1px solid ${T.border}`,
              boxShadow: "-12px 0 40px rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex", flexDirection: "column",
              animation: "nd-slide 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
              fontFamily: "'Vrikaan Sans', sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 20px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 17, fontWeight: 700, color: T.white,
                  margin: 0, fontFamily: "'Vrikaan Sans', sans-serif",
                }}>Notifications</h3>
                <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
                  {unreadCount === 0 ? "You're all caught up" : `${unreadCount} unread`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent", border: "none", color: T.muted,
                  cursor: "pointer", padding: 6, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Action row */}
            {items.length > 0 && (
              <div style={{
                padding: "10px 20px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", gap: 10,
              }}>
                <button
                  type="button"
                  onClick={() => markAllRead(user.uid)}
                  disabled={unreadCount === 0}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    background: "rgba(99,102,241,0.1)",
                    border: `1px solid ${T.border}`,
                    color: T.cyan, fontSize: 12, fontWeight: 600,
                    cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                    opacity: unreadCount === 0 ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => clearAll(user.uid)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    background: "rgba(239,68,68,0.08)",
                    border: `1px solid rgba(239,68,68,0.18)`,
                    color: T.red, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 80px" }}>
              {items.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  color: T.muted, fontSize: 13,
                }}>
                  <div style={{ fontSize: 38, marginBottom: 12 }}>🔔</div>
                  <p style={{ margin: 0, color: T.white, fontWeight: 600 }}>No notifications yet</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>You'll see security alerts and updates here.</p>
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(user.uid, n.id)}
                    style={{
                      padding: "12px 14px",
                      margin: "4px 0",
                      borderRadius: 10,
                      background: n.read ? "rgba(148,163,184,0.04)" : "rgba(99,102,241,0.06)",
                      border: `1px solid ${n.read ? T.border : "rgba(99,102,241,0.18)"}`,
                      display: "flex", alignItems: "flex-start", gap: 12,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <div style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                      background: `${n.color || T.accent}22`,
                      color: n.color || T.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700,
                    }}>
                      {n.icon || "✦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 13, color: T.white, lineHeight: 1.5,
                        fontWeight: n.read ? 400 : 500,
                      }}>{n.msg}</p>
                      <p style={{
                        margin: "4px 0 0", fontSize: 11, color: T.mutedDark,
                      }}>{n.time}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); dismissNotification(user.uid, n.id); }}
                      aria-label="Dismiss"
                      style={{
                        background: "transparent", border: "none", color: T.mutedDark,
                        cursor: "pointer", padding: 4, fontSize: 14, lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >×</button>
                  </div>
                ))
              )}
            </div>
          </aside>

          <style>{`
            @keyframes nd-fade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes nd-slide { from { transform: translateX(100%) } to { transform: translateX(0) } }
          `}</style>
        </>
      )}
    </>
  );
}
