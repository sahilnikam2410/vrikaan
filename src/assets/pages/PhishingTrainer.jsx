import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", card: "rgba(17,24,39,0.8)", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", yellow: "#fbbf24", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)" };

const URLS = [
  { url: "https://accounts.google.com/signin", isPhishing: false, explanation: "Official Google sign-in page with correct domain.", redFlags: [] },
  { url: "https://accounts-google.com.verify-login.tk/signin", isPhishing: true, explanation: "Fake domain — 'accounts-google.com' is a subdomain of 'verify-login.tk'.", redFlags: ["verify-login.tk", ".tk TLD"] },
  { url: "https://www.paypal.com/myaccount", isPhishing: false, explanation: "Official PayPal domain.", redFlags: [] },
  { url: "https://www.paypa1.com/secure-login", isPhishing: true, explanation: "'paypa1' uses the number 1 instead of letter l.", redFlags: ["paypa1", "l replaced with 1"] },
  { url: "https://github.com/login", isPhishing: false, explanation: "Official GitHub login page.", redFlags: [] },
  { url: "https://github-verify.netlify.app/auth", isPhishing: true, explanation: "Hosted on netlify.app, not github.com.", redFlags: ["netlify.app", "github-verify"] },
  { url: "https://amazon.com.order-confirm.xyz/track", isPhishing: true, explanation: "'amazon.com' is just a subdomain of 'order-confirm.xyz'.", redFlags: ["order-confirm.xyz", ".xyz TLD"] },
  { url: "https://www.amazon.in/ap/signin", isPhishing: false, explanation: "Official Amazon India sign-in.", redFlags: [] },
  { url: "https://microsoft-365.login-verify.com/auth", isPhishing: true, explanation: "Real domain is 'login-verify.com', not microsoft.com.", redFlags: ["login-verify.com", "microsoft-365 subdomain"] },
  { url: "https://login.microsoftonline.com/common/oauth2", isPhishing: false, explanation: "Official Microsoft OAuth endpoint.", redFlags: [] },
  { url: "https://www.faceb00k.com/login", isPhishing: true, explanation: "'faceb00k' uses zeros instead of letter o.", redFlags: ["faceb00k", "o replaced with 0"] },
  { url: "https://www.facebook.com/login", isPhishing: false, explanation: "Official Facebook login.", redFlags: [] },
  { url: "https://appleid.apple.com.secure-verify.net/signin", isPhishing: true, explanation: "Real domain is 'secure-verify.net', not apple.com.", redFlags: ["secure-verify.net", "apple.com as subdomain"] },
  { url: "https://appleid.apple.com/auth/authorize", isPhishing: false, explanation: "Official Apple ID authentication.", redFlags: [] },
  { url: "https://www.netflix.com/login", isPhishing: false, explanation: "Official Netflix login.", redFlags: [] },
  { url: "https://netflix-billing-update.herokuapp.com", isPhishing: true, explanation: "Hosted on herokuapp.com, not netflix.com.", redFlags: ["herokuapp.com", "netflix-billing-update"] },
  { url: "https://secure-bankofamerica.com.phish.ly/verify", isPhishing: true, explanation: "Real domain is 'phish.ly', not bankofamerica.com.", redFlags: ["phish.ly", "bankofamerica as subdomain"] },
  { url: "https://www.linkedin.com/login", isPhishing: false, explanation: "Official LinkedIn login.", redFlags: [] },
  { url: "https://linkedin-verify.weebly.com/update-profile", isPhishing: true, explanation: "Hosted on weebly.com, not linkedin.com.", redFlags: ["weebly.com", "linkedin-verify"] },
  { url: "https://mail.google.com/mail/u/0/#inbox", isPhishing: false, explanation: "Official Gmail inbox.", redFlags: [] },
  { url: "https://docs.google.com.share-document.ru/view", isPhishing: true, explanation: "Real domain is 'share-document.ru', a Russian domain.", redFlags: [".ru TLD", "google.com as subdomain"] },
  { url: "https://www.dropbox.com/login", isPhishing: false, explanation: "Official Dropbox login.", redFlags: [] },
  { url: "https://dropbox-share.000webhostapp.com/dl", isPhishing: true, explanation: "Hosted on free hosting (000webhostapp.com).", redFlags: ["000webhostapp.com", "free hosting"] },
  { url: "https://twitter.com/i/flow/login", isPhishing: false, explanation: "Official Twitter/X login.", redFlags: [] },
  { url: "https://twltter-verify.pages.dev/auth", isPhishing: true, explanation: "'twltter' uses l instead of i. Hosted on pages.dev.", redFlags: ["twltter", "pages.dev", "i replaced with l"] },
];

const ROUNDS = 12;

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export default function PhishingTrainer() {
  const [screen, setScreen] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const startGame = () => {
    setQuestions(shuffle(URLS).slice(0, ROUNDS));
    setRound(0); setScore(0); setStreak(0); setAnswers([]); setFeedback(null);
    setScreen("game"); setTimeLeft(15);
  };

  useEffect(() => {
    if (screen !== "game" || feedback) return;
    setTimeLeft(15);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); answer(null); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [round, screen, feedback]);

  const answer = useCallback((userSaysPhishing) => {
    clearInterval(timerRef.current);
    const q = questions[round];
    const correct = userSaysPhishing === null ? false : (userSaysPhishing === q.isPhishing);
    const pts = correct ? 10 + (streak >= 2 ? 5 : 0) : -5;
    setScore(s => Math.max(0, s + pts));
    setStreak(correct ? s => s + 1 : 0);
    setAnswers(a => [...a, { ...q, userAnswer: userSaysPhishing, correct, timedOut: userSaysPhishing === null }]);
    setFeedback({ correct, q });
  }, [questions, round, streak]);

  const nextRound = () => {
    setFeedback(null);
    if (round + 1 >= ROUNDS) { setScreen("results"); return; }
    setRound(r => r + 1);
  };

  const share = () => {
    const correct = answers.filter(a => a.correct).length;
    const text = `I scored ${score} points (${correct}/${ROUNDS} correct) on VRIKAAN Phishing Trainer! Can you beat me? Try it at vrikaan.com/phishing-trainer`;
    if (navigator.share) { navigator.share({ title: "Phishing Trainer Score", text }); }
    else { navigator.clipboard.writeText(text); }
  };

  const q = questions[round];
  const correctCount = answers.filter(a => a.correct).length;
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;
  const grade = accuracy >= 90 ? "A" : accuracy >= 75 ? "B" : accuracy >= 60 ? "C" : accuracy >= 40 ? "D" : "F";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <SEO title="Phishing URL Trainer" description="Test your ability to spot phishing URLs in this gamified security trainer." path="/phishing-trainer" />
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 20px 60px" }}>

        {/* START */}
        {screen === "start" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>&#x1F3A3;</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 10 }}>Phishing URL Trainer</h1>
            <p style={{ color: T.muted, fontSize: 15, marginBottom: 8, maxWidth: 480, margin: "0 auto 8px" }}>Can you spot the difference between real and phishing URLs?</p>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 32 }}>{ROUNDS} rounds | 15 seconds each | +10 pts correct, +5 streak bonus</p>
            <button onClick={startGame} style={{ padding: "16px 48px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>Start Training</button>
          </div>
        )}

        {/* GAME */}
        {screen === "game" && q && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: T.muted }}>Round {round + 1}/{ROUNDS}</span>
              <span style={{ fontSize: 13, color: T.cyan, fontWeight: 600 }}>Score: {score}</span>
              {streak >= 2 && <span style={{ fontSize: 13, color: T.yellow }}>&#x1F525; {streak} streak!</span>}
            </div>

            {/* Timer bar */}
            <div style={{ height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(timeLeft / 15) * 100}%`, background: timeLeft <= 5 ? T.red : T.accent, transition: "width 1s linear", borderRadius: 2 }} />
            </div>

            {!feedback ? (
              <>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "center", marginBottom: 28 }}>
                  <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>Is this URL legitimate or phishing?</p>
                  <div style={{ padding: "16px 20px", background: "rgba(15,23,42,0.8)", borderRadius: 10, border: `1px solid ${T.border}`, wordBreak: "break-all" }}>
                    <span style={{ fontSize: 16, fontFamily: "'JetBrains Mono',monospace", color: T.white, lineHeight: 1.6 }}>{q.url}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <button onClick={() => answer(false)} style={{ padding: "18px", borderRadius: 12, border: `2px solid rgba(34,197,94,0.3)`, background: "rgba(34,197,94,0.06)", color: T.green, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>&#x2705; Legitimate</button>
                  <button onClick={() => answer(true)} style={{ padding: "18px", borderRadius: 12, border: `2px solid rgba(239,68,68,0.3)`, background: "rgba(239,68,68,0.06)", color: T.red, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>&#x1F6A8; Phishing</button>
                </div>
              </>
            ) : (
              <div style={{ background: T.card, border: `1px solid ${feedback.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>{feedback.correct ? "\u2705" : "\u274C"}</div>
                <h3 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: feedback.correct ? T.green : T.red, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {feedback.correct ? "Correct!" : answers[answers.length - 1]?.timedOut ? "Time's Up!" : "Wrong!"}
                </h3>
                <div style={{ padding: "12px 16px", background: "rgba(15,23,42,0.6)", borderRadius: 8, marginBottom: 12, wordBreak: "break-all" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: T.white }}>{feedback.q.url}</span>
                </div>
                <p style={{ fontSize: 13, color: T.white, marginBottom: 8 }}>This URL is <strong style={{ color: feedback.q.isPhishing ? T.red : T.green }}>{feedback.q.isPhishing ? "PHISHING" : "LEGITIMATE"}</strong></p>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: feedback.q.redFlags.length ? 12 : 16 }}>{feedback.q.explanation}</p>
                {feedback.q.redFlags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {feedback.q.redFlags.map(f => <span key={f} style={{ padding: "4px 10px", borderRadius: 4, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: T.red }}>{f}</span>)}
                  </div>
                )}
                <button onClick={nextRound} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                  {round + 1 >= ROUNDS ? "See Results" : "Next Question"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {screen === "results" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>{accuracy >= 80 ? "\uD83C\uDFC6" : accuracy >= 50 ? "\uD83D\uDC4D" : "\uD83D\uDCA1"}</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Training Complete!</h2>

            <div className="phish-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 400, margin: "24px auto" }}>
              <div style={{ padding: 16, background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk',sans-serif" }}>{score}</div>
                <div style={{ fontSize: 11, color: T.muted }}>Score</div>
              </div>
              <div style={{ padding: 16, background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: accuracy >= 70 ? T.green : T.yellow, fontFamily: "'Space Grotesk',sans-serif" }}>{accuracy}%</div>
                <div style={{ fontSize: 11, color: T.muted }}>Accuracy</div>
              </div>
              <div style={{ padding: 16, background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.accent, fontFamily: "'Space Grotesk',sans-serif" }}>{grade}</div>
                <div style={{ fontSize: 11, color: T.muted }}>Grade</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <button onClick={startGame} style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.accent},${T.cyan})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>Play Again</button>
              <button onClick={share} style={{ padding: "14px 32px", borderRadius: 10, border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.muted, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Share Score</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        @media (max-width: 480px) {
          .phish-stats-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  );
}
