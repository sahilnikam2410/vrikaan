import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuTrophy, LuMedal, LuCrown, LuArrowRight, LuRefreshCw } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import { getTopScores, submitScore } from "../../services/leaderboardService";
import { totalMockXp, getMockResults } from "../../lib/mockTests";
import { Card, Button, Aurora } from "../../components/ui";

const T = {
  bg: "#060a14", card: "#0b1220", border: "rgba(148,163,184,0.12)",
  white: "#f1f5f9", muted: "#94a3b8", dim: "#64748b",
  cyan: "#14b8a6", accent: "#6366f1", gold: "#fbbf24", silver: "#cbd5e1", bronze: "#d97706",
};

const LEVEL_TITLES = ["Novice", "Aware", "Guarded", "Defender", "Sentinel", "Guardian", "Cyber Shield", "Threat Hunter", "Master Defender", "Cyber Sensei"];
const levelTitle = (lvl) => LEVEL_TITLES[Math.min((lvl || 1) - 1, LEVEL_TITLES.length - 1)] || "Cyber Sensei";
function levelFromXp(xp) {
  let level = 1, acc = 0, need = 100;
  while (xp >= acc + need) { acc += need; level++; need = Math.round(need * 1.35); }
  return level;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // Push our own latest score first so we appear/refresh, then fetch.
    if (user?.uid) {
      const academy = Number(localStorage.getItem("vrikaan_academy_xp")) || 0;
      const xp = academy + totalMockXp();
      const results = getMockResults();
      const bestMock = Math.max(0, ...Object.values(results).map((r) => r.best || 0));
      await submitScore(user.uid, {
        name: user.displayName || user.name || user.email?.split("@")[0] || "Learner",
        xp, level: levelFromXp(xp), bestMock,
      });
    }
    setRows(await getTopScores(50));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.uid]);

  const myRank = rows && user?.uid ? rows.findIndex((r) => r.uid === user.uid) + 1 : 0;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Leaderboard — VRIKAAN Academy" description="See the top cyber-safety learners. Earn XP from courses and mock tests to climb the ranks." path="/leaderboard" />
      <Navbar />
      <Aurora />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "100px 20px 80px" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.cyan, textTransform: "uppercase" }}>VRIKAAN Academy</span>
        <h1 style={{ fontSize: 38, fontWeight: 800, margin: "6px 0 10px", letterSpacing: -1, display: "flex", alignItems: "center", gap: 12 }}>
          <LuTrophy size={32} color={T.gold} /> Leaderboard
        </h1>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6, margin: "0 0 8px" }}>
          XP from courses, certificates and mock tests. Keep learning to climb.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 26, flexWrap: "wrap" }}>
          <Button to="/mock-test" variant="secondary" size="sm" iconRight={<LuArrowRight size={15} />} style={{ color: T.cyan, borderColor: `${T.cyan}40` }}>Take a mock test</Button>
          <Button onClick={load} variant="ghost" size="sm" icon={<LuRefreshCw size={13} />}>Refresh</Button>
        </div>

        {!user && (
          <div style={{ background: `${T.accent}14`, border: `1px solid ${T.accent}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, fontSize: 14, color: T.muted }}>
            <Link to="/login" style={{ color: T.cyan, fontWeight: 700 }}>Log in</Link> to appear on the leaderboard and track your rank.
          </div>
        )}

        {user && myRank > 0 && rows && (
          <div style={{ background: `${T.cyan}12`, border: `1px solid ${T.cyan}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 14, color: T.white }}>Your rank: <strong style={{ color: T.cyan }}>#{myRank}</strong> · {levelTitle(rows[myRank - 1]?.level)}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.cyan }}>{rows[myRank - 1]?.xp || 0} XP</span>
          </div>
        )}

        {loading ? (
          <p style={{ color: T.dim, textAlign: "center", padding: 40 }}>Loading rankings…</p>
        ) : rows && rows.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {rows.map((r, i) => {
              const rank = i + 1;
              const me = user?.uid === r.uid;
              const medal = rank === 1 ? T.gold : rank === 2 ? T.silver : rank === 3 ? T.bronze : null;
              return (
                <Card key={r.uid} hover padding="13px 18px" style={{
                  display: "flex", alignItems: "center", gap: 14,
                  ...(me ? { background: `${T.cyan}14`, borderColor: `${T.cyan}55` } : null),
                }}>
                  <span style={{ width: 30, textAlign: "center", fontWeight: 800, fontSize: 16, color: medal || T.dim, display: "flex", justifyContent: "center" }}>
                    {rank === 1 ? <LuCrown size={20} color={T.gold} /> : rank <= 3 ? <LuMedal size={18} color={medal} /> : rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.name || "Learner"} {me && <span style={{ color: T.cyan, fontSize: 12 }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.dim }}>Lvl {r.level || 1} · {levelTitle(r.level)}{r.bestMock ? ` · best test ${r.bestMock}%` : ""}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: T.cyan }}>{r.xp || 0}<span style={{ fontSize: 11, color: T.dim, fontWeight: 600 }}> XP</span></span>
                </Card>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 50, color: T.dim }}>
            <LuTrophy size={40} color={T.dim} style={{ marginBottom: 12 }} />
            <p>No rankings yet. <Link to="/mock-test" style={{ color: T.cyan }}>Take the first test</Link> and claim #1!</p>
          </div>
        )}
      </main>
    </div>
  );
}