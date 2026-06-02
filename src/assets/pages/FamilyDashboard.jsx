import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { auth as firebaseAuth } from "../../firebase/config";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

/**
 * Family Dashboard — owner view (manage seats, invites, kid/senior modes) +
 * member view (see family info, accept pending invites).
 *
 * Backend: /api/tools router — family-create, family-invite, family-info,
 * family-accept-invite, family-remove-member, family-set-mode.
 *
 * Routes that point here: /family · /family-dashboard · /parent-dashboard
 */

const T = {
  bg: "#060a14", card: "rgba(17,24,39,0.8)", accent: "#6366f1",
  cyan: "#14b8a6", pink: "#ec4899", green: "#22c55e", red: "#ef4444",
  yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8",
  border: "rgba(148,163,184,0.08)",
};

const ROLE_LABEL = {
  owner: { text: "Owner", color: T.pink },
  member: { text: "Adult", color: T.cyan },
  kid: { text: "Kid", color: "#A855F7" },
  senior: { text: "Senior", color: T.yellow },
};

export default function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState("info"); // info | err | ok

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [pendingMyInvites, setPendingMyInvites] = useState([]);

  const flash = (text, kind = "info") => { setMsg(text); setMsgKind(kind); };

  const apiCall = useCallback(async (tool, body) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    const r = await fetch(`/api/tools?tool=${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body || {}),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  }, []);

  const loadFamily = useCallback(async () => {
    if (!user?.uid) { setLoading(false); return; }
    setLoading(true); setMsg("");
    try {
      const r = await apiCall("family-info", {});
      setFamily(r.family);
    } catch (e) {
      // Not in a family yet — fine, owner can create
      setFamily(null);
      if (!/Not in any family/i.test(e.message)) flash(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [user, apiCall]);

  const loadPendingInvitesForMe = useCallback(async () => {
    if (!user?.email) return;
    try {
      // Reuses existing teamInvites Firestore client path? No — invites stored in familyInvites.
      // We avoid direct Firestore reads here — let the family-info endpoint surface invites
      // for owners. Members receive an email invite link they click separately.
      // Below: lightweight scan via Firestore client SDK.
      const { db } = await import("../../firebase/config");
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(
        collection(db, "familyInvites"),
        where("email", "==", user.email),
        where("status", "==", "pending"),
      );
      const snap = await getDocs(q);
      setPendingMyInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      /* silent — Firestore rules may block; not fatal */
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Preserve invite query param across login redirect so user lands back here
      const next = `/family${window.location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    loadFamily();
    loadPendingInvitesForMe();
  }, [user, navigate, loadFamily, loadPendingInvitesForMe]);

  // Auto-create family doc for fresh Family-plan purchasers — closes the
  // pay → use loop with zero friction. Runs once after load when:
  // (a) user is on family plan, (b) no family exists yet, (c) not still
  // loading, (d) no pending invite in URL (handled by next effect).
  const autoCreateAttempted = useRef(false);
  useEffect(() => {
    if (autoCreateAttempted.current) return;
    if (loading) return;
    if (!user?.uid) return;
    if (user.plan !== "family") return;
    if (family) return;
    if (new URLSearchParams(window.location.search).get("invite")) return;
    autoCreateAttempted.current = true;
    (async () => {
      try {
        await apiCall("family-create", {});
        flash("Family created — invite members below", "ok");
        await loadFamily();
      } catch (e) {
        // Show button fallback if auto-create fails
        if (!/already/i.test(e.message)) flash(e.message, "err");
      }
    })();
  }, [user, family, loading, apiCall, loadFamily]);

  // Auto-accept invite when arriving from email link: /family?invite=<id>
  useEffect(() => {
    if (!user?.uid) return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get("invite");
    if (!inviteId) return;
    (async () => {
      try {
        const r = await apiCall("family-accept-invite", { inviteId });
        flash(`✓ Joined family as ${r.role || "member"}`, "ok");
        // Strip query param so refresh doesn't re-attempt
        window.history.replaceState({}, "", "/family");
        await loadFamily();
        await loadPendingInvitesForMe();
      } catch (e) {
        flash(`Invite link: ${e.message}`, "err");
      }
    })();
  }, [user, apiCall, loadFamily, loadPendingInvitesForMe]);

  const createFamily = async () => {
    setBusy(true);
    try {
      await apiCall("family-create", {});
      flash("Family created — invite members below", "ok");
      await loadFamily();
    } catch (e) { flash(e.message, "err"); }
    finally { setBusy(false); }
  };

  // Owner buys an extra seat (₹49/mo). Creates a Cashfree session for the
  // family_addon_monthly plan, opens checkout. On Cashfree redirect back to
  // /family?seat_order=<orderId>, the seat-apply effect calls family-add-seat
  // and the seat appears.
  const buyExtraSeat = async () => {
    if (!family) return;
    setBusy(true);
    try {
      const r = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey: "family_addon",
          billing: "monthly",
          email: user.email,
          name: user.displayName || user.email,
          phone: user.phoneNumber || "",
          returnPath: `/family?seat_order={order_id}&familyId=${family.id}`,
        }),
      });
      const data = await r.json();
      const sessionId = data.paymentSessionId || data.payment_session_id;
      if (!r.ok || !sessionId) {
        throw new Error(data.error || "Could not start checkout");
      }
      // Load Cashfree SDK + open checkout
      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const cashfree = window.Cashfree({ mode: data.mode || "sandbox" });
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (e) {
      flash(e.message, "err"); setBusy(false);
    }
  };

  // After Cashfree returns to /family?seat_order=<id>, apply the seat bump.
  useEffect(() => {
    if (!family || !apiCall) return;
    const params = new URLSearchParams(window.location.search);
    const seatOrder = params.get("seat_order");
    if (!seatOrder) return;
    (async () => {
      try {
        const r = await apiCall("family-add-seat", { familyId: family.id, orderId: seatOrder });
        flash(r.alreadyApplied ? "Seat already added" : `✓ Extra seat added — limit now ${r.seatLimit}`, "ok");
        window.history.replaceState({}, "", "/family");
        await loadFamily();
      } catch (e) { flash(`Seat add: ${e.message}`, "err"); }
    })();
  }, [family, apiCall, loadFamily]);

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !family) return;
    setBusy(true);
    try {
      const r = await apiCall("family-invite", {
        familyId: family.id, email: inviteEmail.trim(), role: inviteRole,
      });
      flash(r.alreadyInvited ? "Already invited — still pending" : "Invite sent — they accept on next sign-in", "ok");
      setInviteEmail("");
      await loadFamily();
    } catch (e) { flash(e.message, "err"); }
    finally { setBusy(false); }
  };

  const removeMember = async (uid) => {
    if (!confirm("Remove this member from family?")) return;
    setBusy(true);
    try {
      await apiCall("family-remove-member", { familyId: family.id, uid });
      flash("Member removed", "ok");
      await loadFamily();
    } catch (e) { flash(e.message, "err"); }
    finally { setBusy(false); }
  };

  const acceptInvite = async (inviteId) => {
    setBusy(true);
    try {
      await apiCall("family-accept-invite", { inviteId });
      flash("Joined family", "ok");
      setPendingMyInvites([]);
      await loadFamily();
    } catch (e) { flash(e.message, "err"); }
    finally { setBusy(false); }
  };

  const setMode = async (uid, kidMode, seniorMode) => {
    setBusy(true);
    try {
      await apiCall("family-set-mode", { familyId: family.id, uid, kidMode, seniorMode });
      await loadFamily();
    } catch (e) { flash(e.message, "err"); }
    finally { setBusy(false); }
  };

  // ─── Render guards ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", color: T.white }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px", textAlign: "center" }}>
          <div style={{ color: T.muted }}>Loading family…</div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = family?.isOwner;
  const userPlan = user?.plan || "free";
  const canCreateFamily = userPlan === "family";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO
        title="Family Dashboard — Manage Members, Kid Mode, Senior Mode"
        description="VRIKAAN Family — manage up to 5 members on one plan. Enable kid mode (safe browsing + scam-block) or senior mode (UPI guard + voice alerts) per member."
        path="/family"
      />
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "'Vrikaan Sans', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700,
            margin: "0 0 8px", letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${T.pink}, ${T.accent})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Family Dashboard
          </h1>
          <p style={{ color: T.muted, fontSize: 15, margin: 0 }}>
            One plan. Whole family safe. Up to {family?.seatLimit || 5} members.
          </p>
        </div>

        {/* Status flash */}
        {msg && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 24,
            background: msgKind === "err" ? "rgba(239,68,68,0.1)"
              : msgKind === "ok" ? "rgba(34,197,94,0.1)"
              : "rgba(148,163,184,0.08)",
            border: `1px solid ${msgKind === "err" ? T.red + "55" : msgKind === "ok" ? T.green + "55" : T.border}`,
            color: msgKind === "err" ? T.red : msgKind === "ok" ? T.green : T.muted,
            fontSize: 13,
          }}>
            {msg}
          </div>
        )}

        {/* Pending invites I received */}
        {pendingMyInvites.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>Family invites for you</h2>
            {pendingMyInvites.map(inv => (
              <div key={inv.id} style={{
                background: T.card, border: `1px solid ${T.pink}40`, borderRadius: 12,
                padding: 16, marginBottom: 10,
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontWeight: 600, color: T.white }}>
                    {inv.ownerEmail || inv.invitedByEmail} invited you as <span style={{ color: ROLE_LABEL[inv.role]?.color || T.cyan }}>{ROLE_LABEL[inv.role]?.text || "Member"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    You'll get all Family-plan protection at no extra cost.
                  </div>
                </div>
                <button
                  onClick={() => acceptInvite(inv.id)}
                  disabled={busy}
                  style={{
                    padding: "10px 20px", borderRadius: 8, border: "none",
                    background: `linear-gradient(135deg, ${T.pink}, ${T.accent})`,
                    color: "#fff", fontWeight: 700, fontSize: 13, cursor: busy ? "wait" : "pointer",
                  }}
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No family — show create or upgrade prompt */}
        {!family && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
            padding: 32, textAlign: "center",
          }}>
            {canCreateFamily ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
                <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Create your family</h2>
                <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
                  You're on the Family plan. Create a family to invite up to 5 members.
                </p>
                <button
                  onClick={createFamily}
                  disabled={busy}
                  style={{
                    padding: "14px 32px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${T.pink}, ${T.accent})`,
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "wait" : "pointer",
                  }}
                >
                  {busy ? "Creating…" : "Create Family"}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
                <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Upgrade to Family plan</h2>
                <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
                  Protect up to 5 family members — parents, kids, grandparents. ₹149/mo.
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  style={{
                    padding: "14px 32px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, ${T.pink}, ${T.accent})`,
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                  }}
                >
                  See Family Plan
                </button>
              </>
            )}
          </div>
        )}

        {/* Family exists — members list */}
        {family && (
          <>
            {/* Seats summary */}
            <div style={{
              display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28,
            }}>
              <div style={{ flex: "1 1 200px", padding: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: T.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>Seats Used</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.pink, marginTop: 4 }}>
                  {family.seatsUsed} / {family.seatLimit}
                </div>
              </div>
              <div style={{ flex: "1 1 200px", padding: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: T.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>Owner</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginTop: 4, wordBreak: "break-all" }}>
                  {family.ownerEmail}
                </div>
              </div>
              <div style={{ flex: "1 1 200px", padding: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: T.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>Your Role</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: ROLE_LABEL[isOwner ? "owner" : (user?.familyRole || "member")]?.color || T.cyan }}>
                  {ROLE_LABEL[isOwner ? "owner" : (user?.familyRole || "member")]?.text || "Member"}
                </div>
              </div>
            </div>

            {/* Invite form (owner only) */}
            {isOwner && family.seatsUsed < family.seatLimit && (
              <div style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 22, marginBottom: 28,
              }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Invite member</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    style={{
                      flex: "1 1 240px", padding: "12px 14px", borderRadius: 8,
                      background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                      color: T.white, fontSize: 14, outline: "none",
                    }}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{
                      padding: "12px 14px", borderRadius: 8,
                      background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`,
                      color: T.white, fontSize: 14, cursor: "pointer",
                    }}
                  >
                    <option value="member">Adult</option>
                    <option value="kid">Kid (safe browsing)</option>
                    <option value="senior">Senior (UPI guard)</option>
                  </select>
                  <button
                    onClick={sendInvite}
                    disabled={busy || !inviteEmail.trim()}
                    style={{
                      padding: "12px 24px", borderRadius: 8, border: "none",
                      background: `linear-gradient(135deg, ${T.pink}, ${T.accent})`,
                      color: "#fff", fontWeight: 700, fontSize: 13,
                      cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1,
                    }}
                  >
                    Send invite
                  </button>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: T.muted }}>
                  They'll see a pending invite next time they sign in. No card needed on their side.
                </div>
              </div>
            )}

            {isOwner && family.seatsUsed >= family.seatLimit && (
              <div style={{
                padding: 14, borderRadius: 10, background: "rgba(251,191,36,0.08)",
                border: `1px solid ${T.yellow}44`, marginBottom: 28,
                fontSize: 13, color: T.yellow, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <span style={{ flex: 1, minWidth: 200 }}>
                  Family is full. Add extra seats — <strong>₹49/mo each</strong>.
                </span>
                <button
                  onClick={buyExtraSeat}
                  disabled={busy}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: T.yellow, color: "#000",
                    fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer",
                    fontFamily: "'Vrikaan Sans', sans-serif",
                  }}
                >
                  {busy ? "Opening Cashfree…" : "+ Add seat (₹49/mo)"}
                </button>
              </div>
            )}

            {/* Members list */}
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Members</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {family.members.map((m) => {
                const roleInfo = ROLE_LABEL[m.role] || ROLE_LABEL.member;
                const isMe = m.uid === user?.uid;
                return (
                  <div key={m.uid} style={{
                    background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                    padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0,
                    }}>
                      {(m.displayName || m.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: T.white, wordBreak: "break-all" }}>
                        {m.displayName || m.email || "(pending)"} {isMe && <span style={{ fontSize: 11, color: T.muted }}>(you)</span>}
                      </div>
                      <div style={{ display: "inline-block", marginTop: 4, padding: "2px 10px", borderRadius: 100, background: roleInfo.color + "22", color: roleInfo.color, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                        {roleInfo.text}
                      </div>
                    </div>

                    {/* Owner controls: mode toggles + remove */}
                    {isOwner && m.role !== "owner" && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={m.kidMode}
                            onChange={(e) => setMode(m.uid, e.target.checked, m.seniorMode)}
                            disabled={busy}
                          />
                          Kid mode
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={m.seniorMode}
                            onChange={(e) => setMode(m.uid, m.kidMode, e.target.checked)}
                            disabled={busy}
                          />
                          Senior mode
                        </label>
                        <button
                          onClick={() => removeMember(m.uid)}
                          disabled={busy}
                          style={{
                            padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.red}55`,
                            background: "transparent", color: T.red, fontSize: 11, fontWeight: 700,
                            cursor: busy ? "wait" : "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pending invites the owner sent */}
            {isOwner && family.pendingInvites && family.pendingInvites.length > 0 && (
              <>
                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Pending invites</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  {family.pendingInvites.map((inv) => (
                    <div key={inv.id} style={{
                      background: "rgba(251,191,36,0.06)", border: `1px solid ${T.yellow}33`,
                      borderRadius: 10, padding: 12,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                    }}>
                      <div style={{ fontSize: 13, color: T.white, wordBreak: "break-all" }}>
                        {inv.email} <span style={{ color: T.muted, fontSize: 11 }}>· role: {inv.role}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.yellow, fontWeight: 700 }}>PENDING</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Help footer */}
            <div style={{
              marginTop: 36, padding: 20,
              background: "rgba(20, 184, 166,0.04)",
              border: `1px solid ${T.cyan}22`,
              borderRadius: 12, fontSize: 13, color: T.muted, lineHeight: 1.7,
            }}>
              <div style={{ color: T.cyan, fontWeight: 700, marginBottom: 6 }}>How modes work</div>
              <b style={{ color: T.white }}>Kid mode</b> — blocks adult content, scam-baiting sites, and risky downloads. Locks tool access to safe-browsing + scam-check only.
              <br />
              <b style={{ color: T.white }}>Senior mode</b> — enables UPI scam guard (warns before any UPI payment ≥ ₹1,000), voice alerts for OTP messages, and one-tap emergency call to family owner.
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
