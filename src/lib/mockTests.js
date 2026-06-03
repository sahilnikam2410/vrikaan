// VRIKAAN Academy — Mock Test question bank + test definitions.
// India-first cyber-safety. Each question: { q, opts[], ans (index), why }.
// Tests pick questions by category. Keep `why` short — shown in review.

export const QUESTIONS = {
  upi: [
    { q: "You get a UPI 'collect request' for ₹5,000 from an unknown ID. Approving it will…", opts: ["Credit ₹5,000 to you", "Debit ₹5,000 from you", "Do nothing", "Verify your account"], ans: 1, why: "A collect/'requesting' UPI means they want YOUR money. Approving + PIN pays them." },
    { q: "When does entering your UPI PIN move money?", opts: ["Only when receiving", "Only when paying", "Both sending and receiving", "Never"], ans: 1, why: "UPI PIN is ONLY ever needed to PAY. You never enter a PIN to receive money." },
    { q: "A seller says 'scan this QR to RECEIVE your refund'. You should…", opts: ["Scan and enter PIN", "Scan only", "Refuse — QR is for paying", "Share your OTP"], ans: 2, why: "Scanning a QR + PIN PAYS money. QR codes are never needed to receive funds." },
    { q: "Before paying a new merchant on UPI, first check…", opts: ["Their profile photo", "The receiver NAME shown", "Their follower count", "Nothing"], ans: 1, why: "Confirm the receiver name UPI displays matches who you expect — scammers use look-alike names." },
    { q: "Safest way to test a large first-time UPI payment?", opts: ["Pay full amount", "Send ₹1 first", "Ask for discount", "Pay by QR"], ans: 1, why: "A ₹1 test confirms the receiver before committing a large amount." },
  ],
  phishing: [
    { q: "Biggest red flag in a 'Your account will be locked in 24 hours' SMS?", opts: ["It's polite", "Manufactured urgency", "It has your name", "It's from a long number"], ans: 1, why: "Urgency is the #1 phishing tactic — it pushes you to act before thinking." },
    { q: "An email link shows 'amaz0n.com'. This is…", opts: ["Official Amazon", "A typo, ignore", "A look-alike phishing domain", "Amazon India"], ans: 2, why: "Character swaps (0 for o) are classic look-alike domains. Type the real URL yourself." },
    { q: "Safest action on a suspicious bank email link?", opts: ["Click to check", "Open the official app directly", "Reply asking", "Forward to friends"], ans: 1, why: "Never click. Go to the bank's official app/site directly by typing the URL." },
    { q: "Which attachment is riskiest from an unknown sender?", opts: [".jpg photo", ".exe or .zip", ".txt note", "None are risky"], ans: 1, why: "Executables/archives can carry malware. Never open .exe/.zip from unknowns." },
    { q: "'Dear Customer' instead of your name in a bank email suggests…", opts: ["Premium service", "Bulk phishing blast", "A real bank", "Nothing"], ans: 1, why: "Generic greetings indicate a mass phishing send, not a personalised real message." },
  ],
  vishing: [
    { q: "A caller claims to be your 'bank officer' and asks for your OTP. You should…", opts: ["Share it quickly", "Never share — hang up", "Share half", "Call them back on the number they gave"], ans: 1, why: "Banks NEVER ask for OTP/PIN/CVV. Hang up; call the official number on your card." },
    { q: "A 'police officer' on video call says you're in a 'digital arrest'. This is…", opts: ["Real, comply", "A scam — disconnect", "Normal procedure", "Only if uniformed"], ans: 1, why: "'Digital arrest' is not a real legal process — it's a fear scam. Disconnect and report." },
    { q: "Is it rude to hang up on a suspicious caller?", opts: ["Yes, very", "No — it's self-defence", "Only if elderly", "Always answer"], ans: 1, why: "Hanging up on a stranger is not impolite — it's basic self-defence." },
    { q: "Fake courier call says 'pay ₹2 to release your parcel' via a link. You…", opts: ["Pay, it's small", "Refuse — verify with courier directly", "Share card details", "Click the link"], ans: 1, why: "Tiny 'fees' harvest card/UPI credentials. Verify via the courier's official app." },
    { q: "Best way to verify a relative's 'emergency money' call (possible AI voice)?", opts: ["Send money fast", "Use a family safe-word / call back", "Trust the voice", "Ask their name"], ans: 1, why: "AI can clone voices. A pre-agreed safe-word or calling back confirms identity." },
  ],
  passwords: [
    { q: "Strongest password choice?", opts: ["Password123", "Your name + DOB", "A 16-char passphrase", "qwerty"], ans: 2, why: "Length beats complexity. A long random passphrase is far harder to crack." },
    { q: "Why enable 2FA / OTP-app on accounts?", opts: ["Looks cool", "Blocks login even if password leaks", "Faster login", "Not needed"], ans: 1, why: "2FA stops attackers even when your password is stolen in a breach." },
    { q: "Reusing one password across sites is risky because…", opts: ["It's slow", "One breach exposes all accounts", "Sites ban it", "No risk"], ans: 1, why: "Credential-stuffing: leaked password from one site is tried on all others." },
    { q: "Best place to store many strong passwords?", opts: ["A diary", "Browser sticky note", "A reputable password manager", "Same password everywhere"], ans: 2, why: "A password manager generates + stores unique strong passwords securely." },
    { q: "Most secure 2FA method?", opts: ["SMS OTP", "Authenticator app / hardware key", "Email OTP", "Security question"], ans: 1, why: "Authenticator apps/hardware keys resist SIM-swap + phishing better than SMS." },
  ],
  privacy: [
    { q: "Risk of posting your child's school-uniform photo publicly?", opts: ["None", "Reveals school + routine to strangers", "Better photos", "Faster upload"], ans: 1, why: "Uniforms + tags map a child's location/routine for strangers. Keep accounts private." },
    { q: "Location tags on photos can…", opts: ["Improve quality", "Reveal your home/movements", "Save battery", "Nothing"], ans: 1, why: "Geotags expose where you live and your patterns. Turn them off." },
    { q: "Safest social-media privacy setting for kids/teens?", opts: ["Public", "Friends-only / private", "Anyone can DM", "Location on"], ans: 1, why: "Private/friends-only limits who can see and contact them." },
    { q: "Anything you post online is…", opts: ["Easily deleted forever", "Potentially permanent (screenshots)", "Private by default", "Invisible"], ans: 1, why: "Screenshots make 'deleted' content permanent. Think before posting." },
  ],
  breach: [
    { q: "First thing to do after an account breach?", opts: ["Post about it", "Change passwords + enable 2FA", "Wait a week", "Delete the app"], ans: 1, why: "Immediately change passwords on affected accounts and turn on 2FA." },
    { q: "After financial data is exposed, you should…", opts: ["Ignore it", "Alert your bank + monitor statements", "Buy more", "Share details"], ans: 1, why: "Tell your bank, freeze/monitor cards, watch for unauthorised transactions." },
    { q: "Where to report cyber fraud in India?", opts: ["Nowhere", "cybercrime.gov.in / 1930 helpline", "Social media only", "The scammer"], ans: 1, why: "Report at cybercrime.gov.in or call the 1930 cyber-fraud helpline fast." },
    { q: "Why act within the first 24 hours of a breach?", opts: ["No reason", "Limits damage + improves money recovery", "Cheaper", "It doesn't matter"], ans: 1, why: "Fast action (block cards, file complaint) greatly improves recovery odds." },
  ],
};

// Test definitions — each pulls from categories. timeSec = total timer.
export const TESTS = [
  { id: "fundamentals", title: "Cyber Safety Fundamentals", icon: "shield", desc: "A 10-question mix across UPI, phishing, scam calls, passwords and privacy. Start here.", timeSec: 300, pass: 70, pick: { upi: 2, phishing: 2, vishing: 2, passwords: 2, privacy: 1, breach: 1 } },
  { id: "upi-defender", title: "UPI Fraud Defender", icon: "banknote", desc: "Master payment-fraud defence: collect-requests, QR scams, look-alike IDs.", timeSec: 240, pass: 80, pick: { upi: 5, vishing: 2, breach: 1 } },
  { id: "phishing-pro", title: "Phishing & Scam-Call Pro", icon: "fish", desc: "Spot phishing emails, vishing calls, digital-arrest and courier scams.", timeSec: 240, pass: 80, pick: { phishing: 5, vishing: 3 } },
  { id: "account-armor", title: "Account Armor", icon: "lock", desc: "Passwords, 2FA, privacy and post-breach response — lock your accounts down.", timeSec: 240, pass: 80, pick: { passwords: 5, privacy: 3, breach: 2 } },
];

// Build a concrete question set for a test (shuffled).
export function buildTest(testId) {
  const t = TESTS.find((x) => x.id === testId);
  if (!t) return null;
  const out = [];
  for (const [cat, n] of Object.entries(t.pick)) {
    const pool = [...(QUESTIONS[cat] || [])];
    shuffle(pool);
    out.push(...pool.slice(0, n).map((q) => ({ ...q, cat })));
  }
  shuffle(out);
  return { ...t, questions: out, total: out.length };
}

// XP for a finished attempt: 5 per correct + 30 bonus on pass.
export function attemptXp(correct, total, passed) {
  return correct * 5 + (passed ? 30 : 0);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── local best-score persistence (per test) ──
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
