import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuTriangleAlert, LuX, LuUsers } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";

/**
 * FamilyAlertBanner — Phase 3 of Scam DNA (family mesh).
 * Polls the family's alert feed; when another member reports a scam, every
 * member sees a sticky heads-up. Dismiss is remembered per-alert.
 * Only renders for signed-in users who belong to a family.
 */
const SEEN_KEY = "vrikaan_family_alert_seen";

export default function FamilyAlertBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  const inFamily = !!(user && (user.familyRole || user.plan === "family" || user.currentFamilyId));

  useEffect(() => {
    if (!inFamily) { setAlert(null); return; }
    let stop = false;
    async function poll() {
      try {
        const r = await apiFetch("/api/tools?tool=family-alerts", { method: "POST", body: JSON.stringify({}) });
        const d = await r.json();
        if (stop || !Array.isArray(d.alerts)) return;
        const seen = localStorage.getItem(SEEN_KEY);
        // newest alert from SOMEONE ELSE that hasn't been dismissed
        const latest = d.alerts.find((a) => !a.mine);
        if (latest && latest.id !== seen) setAlert(latest);
        else setAlert(null);
      } catch { /* ignore */ }
    }
    poll();
    const t = setInterval(poll, 60000);
    return () => { stop = true; clearInterval(t); };
  }, [inFamily, user?.uid]);

  if (!alert) return null;

  const dismiss = () => { localStorage.setItem(SEEN_KEY, alert.id); setAlert(null); };

  return (
    <div role="alert" style={{
      position: "sticky", top: 72, zIndex: 70, margin: "10px auto", maxWidth: 1100,
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      padding: "12px 18px", borderRadius: 12,
      background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.4)",
      fontFamily: "'Vrikaan Sans', sans-serif", backdropFilter: "blur(8px)",
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.2)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <LuTriangleAlert size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontWeight: 800, color: "#fecaca", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <LuUsers size={14} /> Family scam alert
        </div>
        <div style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>
          <strong>{alert.byName || "A family member"}</strong> just encountered a{" "}
          <strong style={{ textTransform: "capitalize" }}>{(alert.category || "scam").replace(/-/g, " ")}</strong>
          {alert.tactic ? ` — ${alert.tactic}` : ""}. Stay alert and verify before acting.
        </div>
      </div>
      <button onClick={() => { dismiss(); navigate("/scam-dna"); }} style={{
        padding: "8px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff",
        fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
      }}>Check it</button>
      <button onClick={dismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", display: "flex", flexShrink: 0 }}>
        <LuX size={18} />
      </button>
    </div>
  );
}
