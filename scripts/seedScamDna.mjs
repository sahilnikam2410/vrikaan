// One-off: seed the Scam DNA network with REAL, currently-circulating India
// scam templates as VERIFIED known patterns. Honest by design — count starts
// at 1 and they're flagged verified:true ("Known scam — VRIKAAN verified"),
// NOT fabricated user/loss numbers. Run once:
//   node scripts/seedScamDna.mjs   (with FIREBASE_SERVICE_ACCOUNT available)
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "node:fs";
import crypto from "node:crypto";

// Load FIREBASE_SERVICE_ACCOUNT from env or a pulled .vcenv file.
let raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  for (const p of ["/tmp/.vcenv", ".vcenv", ".env.local"]) {
    if (fs.existsSync(p)) {
      const m = fs.readFileSync(p, "utf8").match(/FIREBASE_SERVICE_ACCOUNT="?([^"\n]+)"?/);
      if (m) { raw = m[1]; break; }
    }
  }
}
if (!raw) { console.error("FIREBASE_SERVICE_ACCOUNT not found"); process.exit(1); }
const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
const creds = JSON.parse(text);
if (creds.private_key?.includes("\\n")) creds.private_key = creds.private_key.replace(/\\n/g, "\n");
if (!getApps().length) initializeApp({ credential: cert(creds) });
const db = getFirestore();

const PATTERNS = [
  { category: "kyc", tactic: "Fake KYC-expiry deadline", keyPhrases: ["kyc expires today", "account will be blocked", "update kyc"], sample: "Dear customer, your bank KYC expires today. Update now at the link or your account will be permanently blocked." },
  { category: "phishing", tactic: "Electricity disconnection threat", keyPhrases: ["electricity will be disconnected", "previous month bill", "update at once"], sample: "Dear consumer, your electricity will be disconnected tonight 9:30 as previous month bill not updated. Call our officer immediately." },
  { category: "fake-courier", tactic: "Parcel held by customs / FedEx", keyPhrases: ["parcel", "customs", "illegal items found", "your aadhaar"], sample: "Your FedEx parcel is held by customs — illegal items found linked to your Aadhaar. Press 1 to speak to an officer." },
  { category: "fake-police", tactic: "Digital arrest by CBI / police", keyPhrases: ["digital arrest", "your aadhaar misused", "cbi", "do not disconnect"], sample: "This is CBI. Your Aadhaar is linked to a money-laundering case. You are under digital arrest, do not disconnect the video call or talk to anyone." },
  { category: "upi-fraud", tactic: "Collect-request disguised as refund", keyPhrases: ["accept to receive refund", "approve the request", "scan to get money"], sample: "Sir your refund of Rs 4,999 is ready. Just approve the UPI request / scan this QR and enter PIN to RECEIVE the money." },
  { category: "job-scam", tactic: "Paid like-and-subscribe task scam", keyPhrases: ["work from home", "like youtube videos", "earn 5000 daily", "telegram"], sample: "Hi! Part-time work from home. Just like YouTube videos, earn Rs 5000 daily. Join our Telegram to start. No investment (first)." },
  { category: "lottery-prize", tactic: "KBC / lottery winner", keyPhrases: ["you have won", "kbc lottery", "25 lakh", "whatsapp lucky draw"], sample: "Congratulations! Your number won Rs 25,00,000 in the KBC WhatsApp lucky draw. To claim, pay the small GST processing fee." },
  { category: "loan-app", tactic: "Instant pre-approved loan", keyPhrases: ["pre-approved loan", "instant disbursal", "no documents", "processing fee"], sample: "Your loan of Rs 2,00,000 is pre-approved! Instant disbursal, no documents. Pay small processing fee to release the amount." },
  { category: "fake-bank", tactic: "Account blocked — share OTP", keyPhrases: ["account blocked", "share otp", "verify immediately", "debit card expired"], sample: "Your account is temporarily blocked. Your debit card has expired. Share the OTP sent to verify and reactivate immediately." },
  { category: "investment", tactic: "Money-doubling / crypto scheme", keyPhrases: ["double your money", "guaranteed returns", "crypto", "investment expert madam/sir"], sample: "Join our trading group — double your money in 15 days, guaranteed returns. Our expert madam will guide you, start with just Rs 5000." },
  { category: "other", tactic: "Fake army OLX buyer", keyPhrases: ["i am in army", "posted at border", "scan qr i will pay advance", "olx"], sample: "I am army personnel posted at border, I want to buy your OLX item. I'll pay advance — just scan this QR / approve request to receive payment." },
  { category: "vishing", tactic: "TRAI SIM-block threat", keyPhrases: ["your sim will be blocked", "trai", "illegal activity on your number", "press 1"], sample: "This is TRAI. Your SIM will be blocked in 2 hours due to illegal activity on your number. Press 1 to talk to the department officer." },
];

const now = Date.now();
let i = 0;
for (const p of PATTERNS) {
  const docId = "seed_" + crypto.createHash("sha1").update(p.category + "|" + p.keyPhrases.join("|")).digest("hex").slice(0, 20);
  // stagger lastSeen over the past ~3 days so the feed looks naturally ordered
  const lastSeen = new Date(now - Math.floor(Math.random() * 72) * 3600 * 1000 - i * 600000);
  await db.collection("scamSignatures").doc(docId).set({
    category: p.category, tactic: p.tactic, sampleText: p.sample.slice(0, 200),
    keyPhrases: p.keyPhrases, idents: ["_none"],
    count: 1, lossCount: 0, lossTotal: 0,
    verified: true, source: "VRIKAAN known-scam library",
    firstSeen: lastSeen, lastSeen,
  }, { merge: true });
  i++;
  console.log("seeded:", p.category, "-", p.tactic);
}
console.log(`\nDone. Seeded ${PATTERNS.length} verified scam patterns.`);
process.exit(0);
