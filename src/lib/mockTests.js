// VRIKAAN Academy — mock-test catalogue metadata + local result storage.
//
// The question bank USED to live here, answers included, which meant every
// correct answer shipped in the JS bundle and the score was whatever the
// browser decided to report. Questions now come from `?tool=quiz-start`
// without answers, and `?tool=quiz-submit` grades them server-side.
// See api/_quizBank.js — keep TEST_META below in sync with TESTS there.

// Catalogue entries for the test list. No `pick` — which questions a test
// draws is a server concern.
export const TESTS = [
  { id: "fundamentals", title: "Cyber Safety Fundamentals", icon: "shield", desc: "A 10-question mix across UPI, phishing, scam calls, passwords and privacy. Start here.", timeSec: 300, pass: 70 },
  { id: "upi-defender", title: "UPI Fraud Defender", icon: "banknote", desc: "Master payment-fraud defence: collect-requests, QR scams, look-alike IDs.", timeSec: 240, pass: 80 },
  { id: "phishing-pro", title: "Phishing & Scam-Call Pro", icon: "fish", desc: "Spot phishing emails, vishing calls, digital-arrest and courier scams.", timeSec: 240, pass: 80 },
  { id: "account-armor", title: "Account Armor", icon: "lock", desc: "Passwords, 2FA, privacy and post-breach response — lock your accounts down.", timeSec: 240, pass: 80 },
  { id: "loan-job-shield", title: "Loan & Job Scam Shield", icon: "briefcase", desc: "Predatory loan apps, fake job offers, task scams and money-mule traps.", timeSec: 240, pass: 80 },
  { id: "shopping-safety", title: "Online Shopping Safety", icon: "shopping-cart", desc: "Fake shops, marketplace QR tricks, refund scams and safe payment habits.", timeSec: 240, pass: 80 },
  { id: "deepfake-defense", title: "AI & Deepfake Defense", icon: "scan-face", desc: "Voice clones, deepfake video calls, CEO fraud and AI investment scams.", timeSec: 240, pass: 80 },
  { id: "social-shield", title: "Social Media Shield", icon: "users", desc: "Romance scams, sextortion, hacked-friend pleas and profile cloning.", timeSec: 240, pass: 80 },
  { id: "master-exam", title: "VRIKAAN Master Exam", icon: "award", desc: "The full 20-question gauntlet across every scam category. Earn your badge.", timeSec: 600, pass: 85 },
];

/**
 * Start an attempt. Returns the server's question set (answers withheld) plus
 * the attemptId that quiz-submit and cert-register are keyed to.
 * @returns {Promise<object|null>} null if not signed in or the call failed.
 */
export async function startAttempt(testId) {
  try {
    const { auth } = await import("../firebase/config");
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return null;
    const r = await fetch("/api/tools?tool=quiz-start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ testId }),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/**
 * Submit answers for grading. `answers` is an array of chosen option indexes
 * (or null), aligned to the question order the server sent.
 * @returns {Promise<object|null>} score + review, or null on failure.
 */
export async function submitAttempt(attemptId, answers) {
  try {
    const { auth } = await import("../firebase/config");
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return null;
    const r = await fetch("/api/tools?tool=quiz-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ attemptId, answers }),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ── local best-score persistence (per test) ──
// Display cache for the test list. The authoritative record of an attempt is
// the server-graded quizAttempts document.
const KEY = "vrikaan_mock_results";
export function getMockResults() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function saveMockResult(testId, scorePct, xpGained) {
  const all = getMockResults();
  const prev = all[testId] || { best: 0, attempts: 0, xp: 0 };
  all[testId] = {
    best: Math.max(prev.best, scorePct),
    attempts: prev.attempts + 1,
    xp: prev.xp + xpGained,
    lastAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(all));
  return all[testId];
}
export function totalMockXp() {
  const all = getMockResults();
  return Object.values(all).reduce((s, r) => s + (r.xp || 0), 0);
}
