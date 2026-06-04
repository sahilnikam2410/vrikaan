import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LuShield, LuBanknote, LuFish, LuLock, LuClock, LuTrophy, LuCircleCheck,
  LuCircleX, LuArrowRight, LuArrowLeft, LuRotateCcw, LuChevronRight,
} from "react-icons/lu";
import { Card, Button, Aurora } from "../../components/ui";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import {
  TESTS, buildTest, attemptXp, getMockResults, saveMockResult, totalMockXp,
} from "../../lib/mockTests";
import { submitScore } from "../../services/leaderboardService";

const T = {
  bg: "#060a14", card: "#0b1220", border: "rgba(148,163,184,0.12)",
  white: "#f1f5f9", muted: "#94a3b8", dim: "#64748b",
  cyan: "#14b8a6", accent: "#6366f1", green: "#22c55e", red: "#ef4444", gold: "#fbbf24",
};

const ICONS = { shield: LuShield, banknote: LuBanknote, fish: LuFish, lock: LuLock };

// Level curve mirrors Academy (computeStats in Learn.jsx).
function levelFromXp(xp) {
  let level = 1, acc = 0, need = 100;
  while (xp >= acc + need) { acc += need; level++; need = Math.round(need * 1.35); }
  return level;
}
function combinedXp() {
  const academy = Number(localStorage.getItem("vrikaan_academy_xp")) || 0;
  return academy + totalMockXp();
}

export default function MockTest() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);   // running test id
  const [results, setResults] = useState(getMockResults());

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Mock Tests — VRIKAAN Academy" description="Test your cyber-safety knowledge with timed mock exams on UPI fraud, phishing, scam calls and account security. Earn XP and climb the leaderboard." path="/mock-test" />
      <Navbar />
      <Aurora />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "100px 20px 80px" }}>
        {!activeId ? (
          <TestList results={results} onStart={setActiveId} />
        ) : (
          <TestRunner
            testId={activeId}
            user={user}
            onExit={() => { setResults(getMockResults()); setActiveId(null); }}
          />
        )}
      </main>
    </div>
  );
}

/* ───────────────────────── Test list ───────────────────────── */
function TestList({ results, onStart }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: T.cyan, textTransform: "uppercase" }}>VRIKAAN Academy</span>
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 10px", letterSpacing: -1 }}>
        Mock <span style={{ color: T.cyan }}>Tests</span>
      </h1>
      <p style={{ color: T.muted, fontSize: 16, maxWidth: 620, lineHeight: 1.6, margin: "0 0 14px" }}>
        Timed exams to prove your cyber-safety skills. Pass to earn bonus XP and climb the leaderboard.
      </p>
      <Link to="/leaderboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.gold, textDecoration: "none", fontWeight: 700, fontSize: 14, marginBottom: 28 }}>
        <LuTrophy size={16} /> View leaderboard <LuChevronRight size={15} />
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 8 }}>
        {TESTS.map((t) => {
          const Icon = ICONS[t.icon] || LuShield;
          const r = results[t.id];
          return (
            <Card key={t.id} hover padding={22} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 11, background: `${T.cyan}1f`, color: T.cyan, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: T.dim, display: "flex", alignItems: "center", gap: 5 }}>
                    <LuClock size={12} /> {Math.round(t.timeSec / 60)} min · pass {t.pass}%
                  </div>
                </div>
              </div>
              <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.55, flex: 1, margin: "0 0 16px" }}>{t.desc}</p>
              {r && (
                <div style={{ fontSize: 12, color: r.best >= t.pass ? T.green : T.gold, marginBottom: 12, fontWeight: 600 }}>
                  Best: {r.best}% · {r.attempts} attempt{r.attempts > 1 ? "s" : ""}{r.best >= t.pass ? " · Passed ✓" : ""}
                </div>
              )}
              <Button onClick={() => onStart(t.id)} iconRight={<LuArrowRight size={16} />}>
                {r ? "Retake" : "Start test"}
              </Button>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ───────────────────────── Test runner ───────────────────────── */
function TestRunner({ testId, user, onExit }) {
  const test = useMemo(() => buildTest(testId), [testId]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});      // qIndex -> chosen option index
  const [left, setLeft] = useState(test?.timeSec || 300);
  const [done, setDone] = useState(false);
  const tickRef = useRef(null);

  // countdown
  useEffect(() => {
    if (done) return;
    tickRef.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { clearInterval(tickRef.current); finish(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const score = useMemo(() => {
    if (!test) return { correct: 0, total: 0, pct: 0, passed: false };
    let correct = 0;
    test.questions.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    const pct = Math.round((correct / test.total) * 100);
    return { correct, total: test.total, pct, passed: pct >= test.pass };
  }, [answers, test]);

  function finish() {
    if (done) return;
    clearInterval(tickRef.current);
    const xp = attemptXp(score.correct, score.total, score.passed);
    saveMockResult(testId, score.pct, xp);
    // sync to leaderboard (best-effort, non-blocking)
    if (user?.uid) {
      const xpTotal = combinedXp();
      const results = getMockResults();
      const bestMock = Math.max(0, ...Object.values(results).map((r) => r.best || 0));
      submitScore(user.uid, {
        name: user.displayName || user.name || user.email?.split("@")[0] || "Learner",
        xp: xpTotal, level: levelFromXp(xpTotal), bestMock,
      });
    }
    setDone(true);
  }

  if (!test) return <p style={{ color: T.muted }}>Test not found. <button onClick={onExit} style={linkBtn}>Back</button></p>;
  if (done) return <Result test={test} score={score} answers={answers} onExit={onExit} />;

  const q = test.questions[idx];
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const lowTime = left <= 30;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 14, color: T.muted }}>
          <strong style={{ color: T.white }}>{test.title}</strong> · Q{idx + 1} of {test.total}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 18, color: lowTime ? T.red : T.cyan, fontFamily: "'Vrikaan Mono', monospace" }}>
          <LuClock size={17} /> {mm}:{ss}
        </div>
      </div>
      {/* progress bar */}
      <div style={{ height: 6, background: "rgba(148,163,184,0.12)", borderRadius: 99, marginBottom: 26, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((idx + 1) / test.total) * 100}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, transition: "width .3s" }} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "26px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, margin: "0 0 20px" }}>{q.q}</h2>
        <div style={{ display: "grid", gap: 11 }}>
          {q.opts.map((opt, oi) => {
            const sel = answers[idx] === oi;
            return (
              <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [idx]: oi }))}
                style={{
                  textAlign: "left", padding: "14px 16px", borderRadius: 11, cursor: "pointer",
                  background: sel ? `${T.cyan}1a` : "rgba(15,23,42,0.5)",
                  border: `1.5px solid ${sel ? T.cyan : T.border}`,
                  color: sel ? T.white : T.muted, fontSize: 15, fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 12, transition: "all .15s",
                }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? T.cyan : "rgba(148,163,184,0.12)", color: sel ? "#04110e" : T.muted, fontWeight: 800, fontSize: 13 }}>{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, gap: 12 }}>
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} style={btnGhost(idx === 0)}>
          <LuArrowLeft size={16} /> Prev
        </button>
        {idx < test.total - 1 ? (
          <button onClick={() => setIdx((i) => i + 1)} style={btn(T.accent)}>Next <LuArrowRight size={16} /></button>
        ) : (
          <button onClick={finish} style={btn(T.green)}>Submit test <LuCircleCheck size={17} /></button>
        )}
      </div>
      <button onClick={onExit} style={{ ...linkBtn, marginTop: 18 }}>Exit (no save)</button>
    </div>
  );
}

/* ───────────────────────── Result ───────────────────────── */
function Result({ test, score, answers, onExit }) {
  const xp = attemptXp(score.correct, score.total, score.passed);
  return (
    <div>
      <div style={{ textAlign: "center", background: T.card, border: `1px solid ${score.passed ? `${T.green}55` : `${T.gold}55`}`, borderRadius: 20, padding: "40px 24px", marginBottom: 28 }}>
        <span style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: score.passed ? `${T.green}1f` : `${T.gold}1f`, color: score.passed ? T.green : T.gold }}>
          {score.passed ? <LuTrophy size={36} /> : <LuRotateCcw size={34} />}
        </span>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>{score.passed ? "Passed!" : "Keep going"}</h1>
        <div style={{ fontSize: 52, fontWeight: 900, color: score.passed ? T.green : T.gold, lineHeight: 1, margin: "10px 0" }}>{score.pct}%</div>
        <p style={{ color: T.muted, fontSize: 15, margin: "8px 0 0" }}>
          {score.correct}/{score.total} correct · <strong style={{ color: T.cyan }}>+{xp} XP</strong> earned
          {!score.passed && ` · need ${test.pass}% to pass`}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
          <button onClick={onExit} style={btn(T.cyan)}><LuRotateCcw size={16} /> Back to tests</button>
          <Link to="/leaderboard" style={{ ...btn(T.gold), textDecoration: "none" }}><LuTrophy size={16} /> Leaderboard</Link>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.muted, margin: "0 0 14px" }}>Review answers</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {test.questions.map((q, i) => {
          const ok = answers[i] === q.ans;
          return (
            <div key={i} style={{ background: T.card, border: `1px solid ${ok ? `${T.green}33` : `${T.red}33`}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ flexShrink: 0, color: ok ? T.green : T.red, marginTop: 2 }}>{ok ? <LuCircleCheck size={18} /> : <LuCircleX size={18} />}</span>
                <strong style={{ fontSize: 15, lineHeight: 1.4 }}>{q.q}</strong>
              </div>
              <div style={{ fontSize: 13.5, color: T.muted, paddingLeft: 27, lineHeight: 1.6 }}>
                {!ok && answers[i] != null && (
                  <div style={{ color: T.red }}>Your answer: {q.opts[answers[i]]}</div>
                )}
                <div style={{ color: T.green }}>Correct: {q.opts[q.ans]}</div>
                <div style={{ color: T.dim, marginTop: 4 }}>{q.why}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── styles ── */
const btn = (c) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "12px 20px", borderRadius: 11, border: "none", cursor: "pointer",
  background: c, color: "#04110e", fontWeight: 800, fontSize: 14.5, fontFamily: "'Vrikaan Sans', sans-serif",
});
const btnGhost = (disabled) => ({
  display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 18px", borderRadius: 11,
  border: `1px solid ${T.border}`, background: "transparent", color: disabled ? T.dim : T.muted,
  cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'Vrikaan Sans', sans-serif",
});
const linkBtn = {
  background: "none", border: "none", color: "#64748b", cursor: "pointer",
  fontSize: 13, textDecoration: "underline", fontFamily: "'Vrikaan Sans', sans-serif",
};