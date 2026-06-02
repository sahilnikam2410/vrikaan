import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db, auth as firebaseAuth } from "../../firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#060a14", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14b8a6", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

export default function Team() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]); // invites I received
  const [teamInvites, setTeamInvites] = useState([]); // invites my team sent
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

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

  const loadTeamData = useCallback(async () => {
    if (!user?.uid) { setLoading(false); return; }
    setLoading(true); setMsg("");
    try {
      // Get user doc to find currentTeamId
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const teamId = userSnap.data()?.currentTeamId;
      if (teamId) {
        const teamSnap = await getDoc(doc(db, "teams", teamId));
        if (teamSnap.exists()) {
          setTeam({ id: teamSnap.id, ...teamSnap.data() });
          // Load pending invites for this team
          const sentSnap = await getDocs(query(
            collection(db, "teamInvites"),
            where("invitedBy", "==", user.uid),
            where("status", "==", "pending"),
          ));
          setTeamInvites(sentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      }
      // Pending invites I received (any team)
      if (user.email) {
        const recvSnap = await getDocs(query(
          collection(db, "teamInvites"),
          where("email", "==", user.email),
          where("status", "==", "pending"),
        ));
        setPendingInvites(recvSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      setMsg("Failed to load team data: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadTeamData();
  }, [user, navigate, loadTeamData]);

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    setBusy(true); setMsg("");
    try {
      await apiCall("team-create", { name: newTeamName.trim() });
      setNewTeamName("");
      await loadTeamData();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !team) return;
    setBusy(true); setMsg("");
    try {
      const r = await apiCall("team-invite", { teamId: team.id, email: inviteEmail.trim() });
      setMsg(r.alreadyInvited ? "Already invited — pending acceptance" : "Invite sent");
      setInviteEmail("");
      await loadTeamData();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const acceptInvite = async (inv) => {
    setBusy(true); setMsg("");
    try {
      await apiCall("team-accept-invite", { inviteId: inv.id });
      await loadTeamData();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const removeMember = async (uid) => {
    if (!window.confirm("Remove this member?")) return;
    setBusy(true); setMsg("");
    try {
      await apiCall("team-remove-member", { teamId: team.id, uid });
      await loadTeamData();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const isOwner = team && team.ownerUid === user?.uid;
  const memberList = team ? Object.entries(team.members || {}) : [];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Team — VRIKAAN" description="Manage your team members and invitations." path="/team" />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 20px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, margin: 0, marginBottom: 8, fontFamily: "'Vrikaan Sans', sans-serif" }}>Team</h1>
        <p style={{ color: T.muted, fontSize: 14, marginTop: 0, marginBottom: 28 }}>
          Add team members so they can collaborate on your VRIKAAN account. Members get their own login but share visibility on team-level data.
        </p>

        {msg && (
          <div style={{ padding: "10px 14px", marginBottom: 20, borderRadius: 8, background: msg.includes("Failed") || msg.includes("Invalid") || msg.includes("error") ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: msg.includes("Failed") || msg.includes("Invalid") || msg.includes("error") ? T.red : T.green, fontSize: 13 }}>{msg}</div>
        )}

        {loading && <p style={{ color: T.muted }}>Loading…</p>}

        {/* Pending invites I've received */}
        {!loading && pendingInvites.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: T.white, fontSize: 16, marginTop: 0, marginBottom: 12 }}>Pending invitations</h3>
            {pendingInvites.map((inv) => (
              <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <span style={{ color: T.white, fontSize: 14 }}>{inv.teamName}</span>
                  <p style={{ color: T.muted, fontSize: 12, margin: "2px 0 0" }}>From: {inv.invitedByEmail}</p>
                </div>
                <button onClick={() => acceptInvite(inv)} disabled={busy} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Accept</button>
              </div>
            ))}
          </div>
        )}

        {/* No team — offer to create */}
        {!loading && !team && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ color: T.white, fontSize: 16, marginTop: 0 }}>Create a team</h3>
            <p style={{ color: T.muted, fontSize: 13 }}>You're not in a team yet. Create one and invite others.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name (e.g. Acme Security)" maxLength={60} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 14, background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}`, color: T.white }} />
              <button onClick={createTeam} disabled={busy || !newTeamName.trim()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, color: "#fff", fontWeight: 600, cursor: busy ? "wait" : "pointer", opacity: busy || !newTeamName.trim() ? 0.6 : 1 }}>Create</button>
            </div>
          </div>
        )}

        {/* My team */}
        {!loading && team && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ color: T.white, fontSize: 18, marginTop: 0 }}>{team.name}</h3>
            <p style={{ color: T.muted, fontSize: 12 }}>{memberList.length} member{memberList.length === 1 ? "" : "s"} · Owner: {team.ownerEmail}</p>

            <h4 style={{ color: T.white, fontSize: 13, marginTop: 20, marginBottom: 8 }}>Members</h4>
            <div>
              {memberList.map(([uid, role]) => (
                <div key={uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: T.white, fontSize: 13 }}>{uid === user.uid ? "You" : uid.slice(0, 12) + "…"}</span>
                    <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, background: role === "admin" ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.1)", color: role === "admin" ? T.accent : T.muted, fontSize: 11, fontWeight: 600 }}>{role}</span>
                  </div>
                  {isOwner && uid !== team.ownerUid && (
                    <button onClick={() => removeMember(uid)} disabled={busy} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.red, fontSize: 12, cursor: "pointer" }}>Remove</button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending invites this team sent */}
            {teamInvites.length > 0 && (
              <>
                <h4 style={{ color: T.white, fontSize: 13, marginTop: 20, marginBottom: 8 }}>Pending invites sent</h4>
                {teamInvites.map((inv) => (
                  <div key={inv.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 13 }}>
                    {inv.email} <span style={{ marginLeft: 8, color: T.yellow, fontSize: 11 }}>pending</span>
                  </div>
                ))}
              </>
            )}

            {/* Invite form (admins only) */}
            {team.members[user.uid] === "admin" && (
              <>
                <h4 style={{ color: T.white, fontSize: 13, marginTop: 20, marginBottom: 8 }}>Invite by email</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="teammate@example.com" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 14, background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}`, color: T.white }} />
                  <button onClick={sendInvite} disabled={busy || !inviteEmail.trim()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, color: "#fff", fontWeight: 600, cursor: busy ? "wait" : "pointer", opacity: busy || !inviteEmail.trim() ? 0.6 : 1 }}>Invite</button>
                </div>
                <p style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>The invitee accepts this invite the next time they sign in.</p>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
