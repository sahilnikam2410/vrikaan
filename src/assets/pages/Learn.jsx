import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", green: "#22c55e", pink: "#ec4899", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg, clr) => ({ padding: "10px 20px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Vrikaan Sans'", transition: "all 0.2s" }),
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Vrikaan Sans'" },
};

const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{children}</span>
);

// ─── Course Data ───
// ── India-first practical tracks (VRIKAAN Academy originals) ──────────
// Text-based lessons + hands-on practice on real VRIKAAN tools. These are
// the courses our actual users need — scam defense for families, seniors,
// kids and UPI — not generic Western pentest theory.
const indiaCourses = [
  {
    id: "scam-defense-families",
    title: "Scam Defense for Indian Families",
    desc: "The exact scams draining Indian families today — UPI fraud, digital arrest, deepfake voice calls, loan-app traps — and how to stop each one.",
    level: "Beginner",
    duration: "1h 20m",
    lessons: 6,
    color: "#ec4899",
    icon: "👨‍👩‍👧‍👦",
    category: "India · Family Safety",
    instructor: "VRIKAAN Academy",
    rating: 4.9,
    students: 0,
    chapters: [
      {
        title: "The 'Digital Arrest' Scam", duration: "12 min read",
        desc: "How fake CBI/RBI officers extract lakhs over WhatsApp video — and the one rule that defeats it.",
        body: "A uniformed 'officer' video-calls on WhatsApp. They claim a parcel in your name held drugs, or your Aadhaar is linked to money laundering. They keep you on a continuous call for hours — sometimes days — forbidding you to tell family, demanding you transfer all your money to a 'safe RBI account for verification'.\n\nThis is the single highest-loss scam in India. Median loss: ₹4.7 lakh. 73% of victims are highly educated — doctors, lawyers, retired officials. Being smart does not protect you; the scam attacks emotion, not intelligence.\n\nThe one rule that defeats it completely: NO Indian law-enforcement agency — CBI, RBI, ED, NCB, police — EVER arrests anyone over a video call, and NEVER asks you to transfer money for 'verification'. The moment money is requested, it is 100% a scam. Hang up. Call 1930 (cybercrime helpline). Tell your family immediately — secrecy is the scammer's weapon.",
        practiceTool: { label: "Get emergency help if scammed", path: "/scam-recovery" },
      },
      {
        title: "UPI Collection-Request Fraud", duration: "8 min read",
        desc: "Why you tapped 'Approve' and lost money you thought you were receiving.",
        body: "Someone says they'll send you money — for a product you sold on OLX, a refund, a 'prize'. You get a UPI notification. You tap Approve. Money leaves YOUR account.\n\nThis works because a UPI 'collect request' (someone asking you to PAY) looks almost identical to receiving money. The Approve button is in the same place, same colour. In a distracted moment, you confirm a payment thinking you're accepting one.\n\nThe rule: To RECEIVE money, you NEVER enter your UPI PIN. If any screen asks for your PIN, you are SENDING money, not receiving it. Read every UPI screen twice — look for the words 'Pay' vs 'Requesting'. If you never use collect requests, disable them in GPay/PhonePe settings entirely.",
        practiceTool: { label: "Check a UPI ID against our scam registry", path: "/upi-lookup" },
      },
      {
        title: "Deepfake Voice — The Fake Family Emergency", duration: "10 min read",
        desc: "Your son's voice, crying, asking for money. Except it isn't your son.",
        body: "The phone rings. It's your child / grandchild, voice breaking: 'I've had an accident', 'I'm in police custody', 'I need money right now, don't tell anyone'. The voice is unmistakably theirs.\n\nIt is cloned. Scammers scrape 6-10 seconds of audio from Instagram Reels or WhatsApp status and generate a perfect voice clone for under ₹5. Deepfake-voice attacks against Indian families rose 17× in one year. 84% of victims are 50+.\n\nThe defence is a FAMILY SAFE-WORD: one secret word every family member knows, never shared online. When a distressed 'relative' calls asking for money, ask the safe-word. A deepfake cannot answer. Also: always hang up and call the person back on their saved number — the clone can't intercept that.",
        practiceTool: { label: "Set up your Family Safe-Word now", path: "/safe-word" },
      },
      {
        title: "Predatory Loan Apps", duration: "9 min read",
        desc: "₹5,000 borrowed becomes ₹50,000 owed — plus harassment of everyone you know.",
        body: "A quick-loan app offers instant cash, no paperwork. You borrow ₹5,000. Hidden charges balloon it. When you can't pay, recovery agents — who got your entire contact list via a permission you granted on install — call your family, boss and friends. Worse, they morph photos of your female relatives and threaten to circulate them.\n\n17 known victims in our data died by suicide this year from this harassment. It is widely under-reported.\n\nThe rules: (1) NEVER grant a loan app access to Contacts, Photos or SMS. (2) Borrow only from apps registered as RBI NBFCs — check the app's listing. (3) If harassed, it's a crime: report at cybercrime.gov.in, file an FIR, and contact the NCW for any image-based abuse. You are the victim, not the criminal.",
        practiceTool: { label: "Check if a loan app is RBI-registered", path: "/loan-app-check" },
      },
      {
        title: "OTP & KYC Phishing", duration: "7 min read",
        desc: "The 'your account will be blocked' SMS — and why no real bank sends it.",
        body: "'Your KYC expires today. Update now or your account is blocked.' '₹X has been debited — if not you, click here.' These SMS/WhatsApp messages create panic and push you to a fake link or to share an OTP.\n\nThe absolute rule: Your bank NEVER asks for your OTP, PIN, CVV or full card number — not by call, SMS, email or link. An OTP is the LAST step a scammer needs. Sharing it hands them your account.\n\nNever click links in such messages. Open your bank's official app directly. When unsure, paste the message into a scam-checker before acting.",
        practiceTool: { label: "Paste a suspicious message into Scam Check", path: "/scam-check" },
      },
      {
        title: "Building Your Family's Defense Plan", duration: "8 min read",
        desc: "Turn everything above into a 20-minute family routine that actually sticks.",
        body: "Knowledge fails without a plan. This weekend, do these with your family:\n\n1. Set ONE family safe-word. Tell every member — parents, kids, grandparents. Never write it online.\n2. Enable 2FA on everyone's main email + banking app.\n3. Turn off UPI collect-requests for anyone who doesn't use them.\n4. Add every elder's bank-fraud helpline + 1930 to their phone speed-dial.\n5. Agree one rule out loud: 'No money moves on an urgent call until we verify in person or via safe-word.'\n6. Put VRIKAAN on each family member's phone — kids on kid-mode, elders on senior-mode.\n\nThe families that survive scams aren't the smartest — they're the ones who agreed the rules BEFORE the call came.",
        practiceTool: { label: "Set up your Family Plan (5 members)", path: "/family-plan" },
      },
    ],
    quiz: [
      { q: "A 'CBI officer' video-calls saying you must transfer money to a 'safe account' for verification. What is this?", opts: ["A real legal process", "Always a scam — hang up", "Only a scam if they're rude", "Legitimate if they show ID"], ans: 1 },
      { q: "When RECEIVING money on UPI, do you ever enter your UPI PIN?", opts: ["Yes, always", "No — PIN means you're SENDING", "Only for large amounts", "Only on GPay"], ans: 1 },
      { q: "What best defeats a deepfake voice 'family emergency' call?", opts: ["Hanging up rudely", "A pre-agreed family safe-word", "Recording the call", "Paying quickly to be safe"], ans: 1 },
      { q: "A loan app asks for access to your Contacts. You should:", opts: ["Allow it — it's normal", "Deny it — never grant this", "Allow only once", "Ask the app why"], ans: 1 },
      { q: "Your bank will ask you for your OTP when:", opts: ["During KYC update", "When your account is at risk", "Never — banks never ask for OTP", "Only over a verified call"], ans: 2 },
    ],
  },
  {
    id: "senior-online-safety",
    title: "Online Safety for Seniors",
    desc: "A calm, plain-language guide for parents and grandparents — the scams that target elders, and simple habits that stop them.",
    level: "Beginner",
    duration: "55 min",
    lessons: 5,
    color: "#fbbf24",
    icon: "👴",
    category: "India · Senior Safety",
    instructor: "VRIKAAN Academy",
    rating: 4.9,
    students: 0,
    chapters: [
      {
        title: "Why Scammers Target Seniors", duration: "8 min read",
        desc: "It isn't about being 'not tech-savvy'. It's about trust, politeness and isolation.",
        body: "Scammers target elders not because they're foolish, but because they were raised to trust authority and be polite — and many live somewhat isolated, so a friendly caller fills a gap. Scammers exploit exactly these good qualities.\n\nThe most important mindset shift: It is OK to be 'rude' to a stranger on the phone. Hanging up on a scammer is not impolite — it is self-defence. You owe an unknown caller nothing. Real officials and real banks will never mind you calling back on an official number to verify.",
        practiceTool: { label: "Run a free 2-minute risk check", path: "/risk-score" },
      },
      {
        title: "Phone & WhatsApp Call Scams", duration: "10 min read",
        desc: "Fake bank officer, fake government officer, fake relative — the three calls to fear.",
        body: "Three calls cause most senior losses:\n\n1. 'Bank officer' — says your card is blocked / KYC pending, asks for OTP or card details. REAL banks never ask these.\n2. 'Government / police officer' — threatens arrest over a parcel or case, demands money. REAL agencies never arrest by phone or take payment.\n3. 'Relative in trouble' — a cloned or panicked voice asking for urgent money. Always hang up and call them back on their saved number.\n\nThe universal rule for all three: Money + Urgency + Secrecy = Scam. Any call combining those three is a scam, every time. Hang up and ask a family member.",
        practiceTool: { label: "Check a suspicious caller's message", path: "/scam-check" },
      },
      {
        title: "Safe UPI & Banking for Elders", duration: "12 min read",
        desc: "Simple settings that make digital payments far safer.",
        body: "Digital payments are convenient but need guardrails for peace of mind:\n\n1. Set a daily UPI transaction limit (low — e.g. ₹5,000). Most banks allow this in the app.\n2. Turn on SMS/app alerts for EVERY transaction, any amount.\n3. Never enter your UPI PIN to RECEIVE money — PIN is only for paying.\n4. Keep a trusted family member as a 'second check' for any payment above your limit.\n5. Never share PIN, OTP or card number with anyone — not even someone claiming to be from your bank.\n\nWith VRIKAAN's senior mode, you get an extra confirmation step and a voice alert before any UPI action.",
        practiceTool: { label: "Verify a UPI ID before paying", path: "/upi-lookup" },
      },
      {
        title: "The Family Safe-Word", duration: "6 min read",
        desc: "One secret word that protects you from fake-relative calls forever.",
        body: "Because scammers can now fake a relative's exact voice, agree a secret family safe-word — one word only your family knows, never posted online.\n\nIf anyone calls claiming to be family and asking for money or help urgently, ask: 'What's our safe-word?' A real family member knows it. A scammer — even with a perfect voice clone — does not. This single habit defeats the most frightening scam of all.",
        practiceTool: { label: "Set up the Family Safe-Word", path: "/safe-word" },
      },
      {
        title: "What To Do If Something Goes Wrong", duration: "7 min read",
        desc: "Acting in the first hour can get your money back. Here's the exact order.",
        body: "If you've shared details or sent money, act fast — speed matters most:\n\n1. Call 1930 (national cybercrime helpline) immediately. The sooner you report, the better the chance of freezing the money.\n2. Call your bank's fraud number, block the card/account.\n3. Report at cybercrime.gov.in.\n4. Tell your family — do NOT hide it out of embarrassment. Shame is what scammers count on; speaking up is what stops them.\n\nYou are not foolish for being targeted. Millions are. What matters is acting quickly and telling someone.",
        practiceTool: { label: "Open the Scam Recovery guide", path: "/scam-recovery" },
      },
    ],
    quiz: [
      { q: "Is it OK to hang up on a stranger who calls claiming to be a bank officer?", opts: ["No, that's rude", "Yes — hanging up is self-defence", "Only if they're aggressive", "Only after taking their name"], ans: 1 },
      { q: "The universal sign of a phone scam is the combination of:", opts: ["Money + Urgency + Secrecy", "A foreign accent", "A long phone number", "Calling at night"], ans: 0 },
      { q: "To receive money on UPI you should enter your PIN:", opts: ["Always", "Never — PIN is only for paying", "Only small amounts", "Only with family"], ans: 1 },
      { q: "A 'grandchild' calls in tears asking for urgent money. You:", opts: ["Send it immediately", "Ask the family safe-word + call back on saved number", "Ask which grandchild", "Keep them talking"], ans: 1 },
      { q: "First thing to do after being scammed:", opts: ["Hide it from family", "Call 1930 immediately", "Wait and watch", "Delete the app"], ans: 1 },
    ],
  },
  {
    id: "kids-online-safety",
    title: "Keeping Kids Safe Online",
    desc: "For parents: the real risks your child faces online today — gaming scams, predators, cyberbullying, privacy — and how to protect without spying.",
    level: "Beginner",
    duration: "1h",
    lessons: 5,
    color: "#a855f7",
    icon: "🧒",
    category: "India · Kids Safety",
    instructor: "VRIKAAN Academy",
    rating: 4.8,
    students: 0,
    chapters: [
      {
        title: "The Risks Kids Actually Face", duration: "9 min read",
        desc: "It's not what most parents think. The real dangers in 2026.",
        body: "Children under 14 became a measurable scam-victim group for the first time in 2026. The real risks:\n\n1. In-game currency scams — 'free V-Bucks / UC / Robux' links that steal accounts or payment details.\n2. Fake giveaway / influencer scams on Instagram and YouTube.\n3. Grooming — adults posing as peers in game chats and DMs.\n4. Cyberbullying — often from people they know.\n5. Oversharing — kids posting school name, location, routine.\n\nThe goal isn't to scare or to spy — it's to build your child's judgement so they come to YOU when something feels wrong.",
        practiceTool: { label: "Set up Family Plan with Kid Mode", path: "/family-plan" },
      },
      {
        title: "Gaming & In-App Scams", duration: "10 min read",
        desc: "Free in-game currency is the #1 hook for kids. Teach the red flags.",
        body: "Every 'free V-Bucks / free UC / free skins' offer is a scam. They lead to phishing pages that steal the game account (and any saved parent card), or trick kids into 'verifying' by entering an OTP from YOUR phone.\n\nTeach your child three rules:\n1. Nothing in games is ever free in exchange for your login or an OTP.\n2. Never enter a code/OTP that arrives on a parent's phone — that's the parent's money.\n3. If a website outside the game asks for your game password, it's fake.\n\nKeep payment methods off kids' devices, or use VRIKAAN kid-mode which blocks known scam-game domains.",
        practiceTool: { label: "Check a game-offer link for scams", path: "/scam-check" },
      },
      {
        title: "Strangers, Chats & Grooming", duration: "11 min read",
        desc: "How predators operate in game chats — and the conversations to have.",
        body: "Predators meet kids in game voice/text chat and Discord, posing as a same-age friend. They build trust over weeks, move to private chat, then ask for photos or a meeting.\n\nWhat protects kids isn't surveillance — it's an open relationship. Have these talks calmly:\n1. 'A real friend never asks you to keep secrets from me.'\n2. 'Anyone who asks for photos or to meet in person — tell me, you won't be in trouble.'\n3. 'People online can pretend to be anyone.'\n\nMake it safe for your child to report a creepy message without fear of losing their device — punishment teaches them to hide, not to tell.",
        practiceTool: { label: "Learn the warning signs", path: "/learn" },
      },
      {
        title: "Privacy & Digital Footprint", duration: "8 min read",
        desc: "What kids overshare, and the simple settings that lock it down.",
        body: "Kids reveal more than they realise: school uniform in photos, location tags, daily routine, full name. This is a map for a stranger.\n\nDo together with your child:\n1. Set all social accounts to private.\n2. Turn OFF location tagging on photos.\n3. Review who can DM them — friends only.\n4. Agree: no posting school name, address, or live location.\n5. Explain that anything posted can be screenshotted and is permanent.\n\nFrame it as 'street smarts for the internet', not punishment.",
        practiceTool: { label: "Run a family risk check", path: "/risk-score" },
      },
      {
        title: "Setting Up Protection Without Spying", duration: "9 min read",
        desc: "Tools and trust, balanced. Protect young kids, coach teens.",
        body: "Protection should match age:\n\nYounger kids (under 12): VRIKAAN kid-mode blocks scam-game domains, adult content and dark-web tools automatically. Keep devices in shared family spaces. No payment methods on their device.\n\nTeens: heavy-handed spying breaks trust and pushes them to secret accounts. Instead, use VRIKAAN's scam-alert broadcast (the whole family learns when one member hits a scam) and coach judgement. Agree screen-time and app rules together, not imposed.\n\nThe aim: a kid who, when something feels wrong, immediately tells you — because they trust you won't overreact.",
        practiceTool: { label: "Enable Kid Mode in Family Plan", path: "/family-plan" },
      },
    ],
    quiz: [
      { q: "An offer of 'free in-game currency' is:", opts: ["A nice bonus", "Always a scam", "Fine if from a YouTuber", "Safe in small amounts"], ans: 1 },
      { q: "Your child should enter an OTP from YOUR phone into a game site:", opts: ["Yes, to verify", "Never — that's your money", "Only for big games", "If a friend says so"], ans: 1 },
      { q: "Best protection against online grooming is:", opts: ["Banning all games", "An open relationship where kids can report safely", "Reading every message secretly", "No internet at all"], ans: 1 },
      { q: "For teens, heavy secret spying tends to:", opts: ["Build trust", "Break trust and push them to hidden accounts", "Stop all risk", "Improve grades"], ans: 1 },
      { q: "A safe rule for kids' social media:", opts: ["Public so you can see it", "Private + no school name or location", "Share location with friends", "Use real full name everywhere"], ans: 1 },
    ],
  },
  {
    id: "upi-payment-safety",
    title: "UPI & Digital Payment Safety",
    desc: "Master safe digital payments — how UPI fraud works, the settings that protect you, and how to verify before you pay.",
    level: "Beginner",
    duration: "50 min",
    lessons: 5,
    color: "#f97316",
    icon: "₹",
    category: "India · Money Safety",
    instructor: "VRIKAAN Academy",
    rating: 4.9,
    students: 0,
    chapters: [
      {
        title: "How UPI Fraud Actually Works", duration: "9 min read",
        desc: "41% of India's scam losses run on UPI. Understand the rails to beat them.",
        body: "UPI is brilliant but fast and irreversible — perfect for scammers. The core trick across all UPI fraud is making YOU authorise a payment you think is something else: receiving money, a refund, a reward, a 'verification'.\n\nThe one fact that protects you above all: You NEVER enter your UPI PIN to receive money. Entering your PIN ALWAYS means money is LEAVING your account. If anything — anyone — asks for your PIN to 'receive' or 'verify', it's fraud.",
        practiceTool: { label: "Look up a UPI ID's scam history", path: "/upi-lookup" },
      },
      {
        title: "Collect-Request & QR Scams", duration: "10 min read",
        desc: "Two scams that turn 'receiving' into 'paying'.",
        body: "Collect-request scam: A buyer/refunder sends a UPI 'request' that you approve thinking you're getting paid — money leaves you. Fix: read the screen; 'Requesting' means they want YOUR money. Disable collect-requests if unused.\n\nQR scam: 'Scan this QR to RECEIVE your refund/prize.' Scanning a QR and entering your PIN PAYS money — QR codes are for paying, never for receiving. Never scan a QR to get money.\n\nBoth exploit the same confusion. Anchor on the PIN rule: PIN = paying, always.",
        practiceTool: { label: "Scan a suspicious QR safely first", path: "/qr-scanner" },
      },
      {
        title: "Lock Down Your UPI Settings", duration: "8 min read",
        desc: "Five settings that dramatically cut your risk in 10 minutes.",
        body: "Open your UPI app (GPay/PhonePe/Paytm/BHIM) and do these now:\n\n1. Set a daily transaction limit you're comfortable with.\n2. Enable transaction alerts for every amount.\n3. Disable collect/request payments if you never use them.\n4. Turn on app lock (PIN/biometric) for the UPI app itself.\n5. Register only ONE bank account you actively monitor.\n\nTen minutes here saves you from the most common loss scenarios.",
        practiceTool: { label: "Check your overall risk score", path: "/risk-score" },
      },
      {
        title: "Verify Before You Pay", duration: "8 min read",
        desc: "Simple checks before sending money to someone new.",
        body: "Before paying a new person or merchant:\n\n1. Confirm the receiver NAME that UPI shows matches who you expect — scammers use look-alike names.\n2. For sellers (OLX, Instagram shops), be wary of any who insist on advance payment or push urgency.\n3. Check the UPI ID against a scam registry if unsure.\n4. Start with a tiny test amount (₹1) for large first-time payments.\n5. Never pay 'to receive' anything — refunds, prizes, cashback never need YOU to pay first.",
        practiceTool: { label: "Verify the VPA in UPI Lookup", path: "/upi-lookup" },
      },
      {
        title: "If You've Been Defrauded", duration: "7 min read",
        desc: "The golden-hour playbook to recover UPI money.",
        body: "UPI fraud recovery depends on speed:\n\n1. Within minutes: call 1930 and report. Early reports can freeze the money mid-transfer.\n2. Call your bank, report the fraudulent transaction, ask to flag the beneficiary.\n3. File at cybercrime.gov.in with the transaction ID.\n4. Raise a dispute in your UPI app.\n5. Keep screenshots of everything.\n\nThe RBI's framework can reverse fraud if reported fast enough — every minute counts.",
        practiceTool: { label: "Open the recovery guide + FIR helper", path: "/scam-recovery" },
      },
    ],
    quiz: [
      { q: "Entering your UPI PIN always means:", opts: ["Receiving money", "Money is LEAVING your account", "Verifying identity", "Nothing important"], ans: 1 },
      { q: "Scanning a QR code and entering your PIN does what?", opts: ["Receives money", "Pays money out", "Verifies the sender", "Nothing"], ans: 1 },
      { q: "A 'collect request' you approve will:", opts: ["Send you money", "Take money from you", "Just verify", "Cancel a payment"], ans: 1 },
      { q: "For a large first-time payment, a smart move is:", opts: ["Pay full immediately", "Send a ₹1 test first", "Skip verification", "Use a QR to receive"], ans: 1 },
      { q: "Fastest action after UPI fraud:", opts: ["Wait a day", "Call 1930 within minutes", "Only tell family", "Change UPI PIN only"], ans: 1 },
    ],
  },
];

const courses = [
  ...indiaCourses,
  {
    id: "cyber-fundamentals",
    title: "Cybersecurity Fundamentals",
    desc: "Master the basics of cybersecurity — threats, defenses, and best practices for staying safe online.",
    level: "Beginner",
    duration: "2h 15m",
    lessons: 8,
    color: T.cyan,
    icon: "🛡️",
    category: "Fundamentals",
    instructor: "VRIKAAN Academy",
    rating: 4.8,
    students: 12450,
    chapters: [
      { title: "What is Cybersecurity?", duration: "12:30", video: "https://www.youtube.com/embed/z5nc5GJv_28", desc: "Introduction to cybersecurity concepts, CIA triad, and why security matters in the digital age." },
      { title: "Types of Cyber Threats", duration: "18:45", video: "https://www.youtube.com/embed/Dk-ZqQ-bU4A", desc: "Malware, viruses, trojans, ransomware, spyware, and how they infiltrate systems." },
      { title: "Phishing & Social Engineering", duration: "15:20", video: "https://www.youtube.com/embed/u9dBGWVwMMA", desc: "How attackers manipulate humans — email phishing, vishing, smishing, and pretexting." },
      { title: "Password Security & Authentication", duration: "14:00", video: "https://www.youtube.com/embed/3NjQ9b3pgIg", desc: "Creating strong passwords, multi-factor authentication, and password manager setup." },
      { title: "Network Security Basics", duration: "16:30", video: "https://www.youtube.com/embed/9GZlVOafYTg", desc: "Firewalls, VPNs, encryption, and securing your home and office networks." },
      { title: "Safe Browsing & Privacy", duration: "13:15", video: "https://www.youtube.com/embed/ZhJiNGXmKiM", desc: "Browser security, HTTPS, cookies, trackers, and protecting your online privacy." },
      { title: "Mobile Device Security", duration: "11:45", video: "https://www.youtube.com/embed/GRMEbVBqZYE", desc: "Securing smartphones and tablets — app permissions, updates, and lost device protocols." },
      { title: "Incident Response Basics", duration: "15:00", video: "https://www.youtube.com/embed/zyVVr81CKGY", desc: "What to do when a breach happens — containment, eradication, recovery, and reporting." },
    ],
    quiz: [
      { q: "What does the CIA triad stand for in cybersecurity?", opts: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Cyber Intelligence Analysis", "Computer Information Architecture"], ans: 1 },
      { q: "Which type of attack uses fake emails to steal credentials?", opts: ["DDoS", "Brute Force", "Phishing", "SQL Injection"], ans: 2 },
      { q: "What is the minimum recommended password length?", opts: ["6 characters", "8 characters", "12 characters", "4 characters"], ans: 2 },
      { q: "What does a VPN primarily do?", opts: ["Speed up internet", "Encrypt your connection", "Block all ads", "Remove malware"], ans: 1 },
      { q: "What should you do FIRST after discovering a data breach?", opts: ["Ignore it", "Change all passwords", "Contain the breach", "Delete everything"], ans: 2 },
    ],
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking & Penetration Testing",
    desc: "Learn how ethical hackers think — reconnaissance, scanning, exploitation, and responsible disclosure.",
    level: "Intermediate",
    duration: "3h 40m",
    lessons: 8,
    color: T.accent,
    icon: "🔓",
    category: "Offensive Security",
    instructor: "VRIKAAN Academy",
    rating: 4.9,
    students: 8730,
    chapters: [
      { title: "Introduction to Ethical Hacking", duration: "14:30", video: "https://www.youtube.com/embed/fNzpcB7ODxQ", desc: "What is ethical hacking, legal considerations, and the hacker mindset." },
      { title: "Reconnaissance & Information Gathering", duration: "22:00", video: "https://www.youtube.com/embed/pL9q2lOZ1Fw", desc: "OSINT techniques, footprinting, DNS enumeration, and social media reconnaissance." },
      { title: "Network Scanning & Enumeration", duration: "25:00", video: "https://www.youtube.com/embed/4_7A8Ikp5Cc", desc: "Nmap, port scanning, service detection, and vulnerability identification." },
      { title: "Web Application Vulnerabilities", duration: "28:15", video: "https://www.youtube.com/embed/hPsU6TYkjJk", desc: "OWASP Top 10, SQL injection, XSS, CSRF, and how to test web applications." },
      { title: "Password Cracking Techniques", duration: "18:30", video: "https://www.youtube.com/embed/7U-RbOKanYs", desc: "Brute force, dictionary attacks, rainbow tables, and hash cracking tools." },
      { title: "Wireless Network Hacking", duration: "20:00", video: "https://www.youtube.com/embed/hxHMQfZyxCo", desc: "WEP/WPA/WPA2 vulnerabilities, evil twin attacks, and wireless security auditing." },
      { title: "System Exploitation", duration: "24:00", video: "https://www.youtube.com/embed/3Kq1MIfTWCE", desc: "Metasploit framework, privilege escalation, and post-exploitation techniques." },
      { title: "Report Writing & Disclosure", duration: "16:00", video: "https://www.youtube.com/embed/EOoBAq6z4Zk", desc: "Writing professional pentest reports and responsible vulnerability disclosure." },
    ],
    quiz: [
      { q: "What is the first phase of ethical hacking?", opts: ["Exploitation", "Scanning", "Reconnaissance", "Reporting"], ans: 2 },
      { q: "Which tool is commonly used for port scanning?", opts: ["Photoshop", "Nmap", "Excel", "Chrome"], ans: 1 },
      { q: "What does OWASP stand for?", opts: ["Open Web Application Security Project", "Online Website Attack Security Protocol", "Open Wireless Application Safety Program", "Official Web App Security Policy"], ans: 0 },
      { q: "What is a 'rainbow table' used for?", opts: ["Color design", "Password hash cracking", "Network mapping", "Data visualization"], ans: 1 },
      { q: "What should you ALWAYS have before performing a penetration test?", opts: ["Free time", "Written authorization", "A dark room", "Multiple monitors"], ans: 1 },
    ],
  },
  {
    id: "network-defense",
    title: "Network Security & Defense",
    desc: "Build and secure networks — firewalls, IDS/IPS, segmentation, and enterprise defense strategies.",
    level: "Intermediate",
    duration: "2h 50m",
    lessons: 7,
    color: T.green,
    icon: "🌐",
    category: "Defense",
    instructor: "VRIKAAN Academy",
    rating: 4.7,
    students: 6320,
    chapters: [
      { title: "Network Architecture & Security", duration: "18:00", video: "https://www.youtube.com/embed/qiQR5rTSshw", desc: "OSI model, TCP/IP, network topologies, and security-focused architecture design." },
      { title: "Firewall Configuration", duration: "22:30", video: "https://www.youtube.com/embed/kDEX1HXybrU", desc: "Types of firewalls, rule creation, DMZ setup, and best practices." },
      { title: "Intrusion Detection Systems", duration: "20:15", video: "https://www.youtube.com/embed/rvKQtRklwQ4", desc: "IDS vs IPS, signature-based vs anomaly-based detection, and SIEM integration." },
      { title: "VPN & Encryption", duration: "16:45", video: "https://www.youtube.com/embed/R-JUOpCgTZc", desc: "VPN protocols, IPSec, SSL/TLS, and end-to-end encryption implementation." },
      { title: "Wireless Security", duration: "18:30", video: "https://www.youtube.com/embed/hxHMQfZyxCo", desc: "WPA3, 802.1X authentication, rogue AP detection, and wireless monitoring." },
      { title: "Network Monitoring & Logging", duration: "24:00", video: "https://www.youtube.com/embed/dQw4w9WgXcQ", desc: "Traffic analysis, Wireshark, NetFlow, log management, and alert correlation." },
      { title: "Zero Trust Architecture", duration: "20:00", video: "https://www.youtube.com/embed/yn6CPQ9RioA", desc: "Zero trust principles, micro-segmentation, identity-centric security, and implementation." },
    ],
    quiz: [
      { q: "How many layers does the OSI model have?", opts: ["5", "6", "7", "8"], ans: 2 },
      { q: "What does IDS stand for?", opts: ["Internet Data System", "Intrusion Detection System", "Internal Defense Strategy", "Integrated Data Security"], ans: 1 },
      { q: "What is the primary purpose of a DMZ?", opts: ["Speed up network", "Isolate public-facing services", "Store backups", "Encrypt data"], ans: 1 },
      { q: "Which protocol does WPA3 use for key exchange?", opts: ["WEP", "TKIP", "SAE", "RC4"], ans: 2 },
      { q: "What is the core principle of Zero Trust?", opts: ["Trust everyone", "Never verify", "Never trust, always verify", "Trust but verify"], ans: 2 },
    ],
  },
  {
    id: "malware-analysis",
    title: "Malware Analysis & Reverse Engineering",
    desc: "Analyze malicious software — static analysis, dynamic analysis, sandboxing, and threat intelligence.",
    level: "Advanced",
    duration: "3h 20m",
    lessons: 7,
    color: T.red,
    icon: "🦠",
    category: "Forensics",
    instructor: "VRIKAAN Academy",
    rating: 4.6,
    students: 4150,
    chapters: [
      { title: "Introduction to Malware", duration: "15:00", video: "https://www.youtube.com/embed/z5nc5GJv_28", desc: "Malware taxonomy — viruses, worms, trojans, ransomware, rootkits, and APTs." },
      { title: "Setting Up an Analysis Lab", duration: "20:30", video: "https://www.youtube.com/embed/3Kq1MIfTWCE", desc: "Virtual machines, sandboxes, REMnux, FlareVM, and safe analysis environments." },
      { title: "Static Analysis Techniques", duration: "28:00", video: "https://www.youtube.com/embed/fNzpcB7ODxQ", desc: "PE file structure, strings analysis, imports, hashing, and YARA rules." },
      { title: "Dynamic Analysis & Sandboxing", duration: "30:15", video: "https://www.youtube.com/embed/pL9q2lOZ1Fw", desc: "Behavioral analysis, process monitoring, network capture, and automated sandboxing." },
      { title: "Reverse Engineering with IDA", duration: "32:00", video: "https://www.youtube.com/embed/4_7A8Ikp5Cc", desc: "Disassembly, debugging, control flow analysis, and function identification." },
      { title: "Ransomware Deep Dive", duration: "22:00", video: "https://www.youtube.com/embed/Dk-ZqQ-bU4A", desc: "Ransomware mechanics, encryption routines, C2 communication, and decryption strategies." },
      { title: "Threat Intelligence & IOCs", duration: "18:30", video: "https://www.youtube.com/embed/u9dBGWVwMMA", desc: "Indicators of compromise, STIX/TAXII, threat feeds, and attribution techniques." },
    ],
    quiz: [
      { q: "What is the difference between static and dynamic analysis?", opts: ["Static runs the malware, dynamic doesn't", "Static examines without running, dynamic observes behavior", "There is no difference", "Static is faster"], ans: 1 },
      { q: "What tool is commonly used for disassembly?", opts: ["Photoshop", "Excel", "IDA Pro", "PowerPoint"], ans: 2 },
      { q: "What does APT stand for?", opts: ["Advanced Persistent Threat", "Automated Protocol Testing", "Active Penetration Tool", "Advanced Phishing Technique"], ans: 0 },
      { q: "What are YARA rules used for?", opts: ["Network monitoring", "Pattern matching in malware", "Password cracking", "Database management"], ans: 1 },
      { q: "What is a C2 server?", opts: ["Customer service server", "Command and Control server", "Cloud Computing server", "Certificate authority server"], ans: 1 },
    ],
  },
  {
    id: "cloud-security",
    title: "Cloud Security Essentials",
    desc: "Secure cloud environments — AWS, Azure, GCP security controls, IAM, and cloud-native defense.",
    level: "Intermediate",
    duration: "2h 30m",
    lessons: 7,
    color: T.blue,
    icon: "☁️",
    category: "Cloud",
    instructor: "VRIKAAN Academy",
    rating: 4.8,
    students: 9870,
    chapters: [
      { title: "Cloud Computing & Security Overview", duration: "14:00", video: "https://www.youtube.com/embed/z5nc5GJv_28", desc: "IaaS, PaaS, SaaS models, shared responsibility, and cloud threat landscape." },
      { title: "Identity & Access Management", duration: "20:00", video: "https://www.youtube.com/embed/9GZlVOafYTg", desc: "IAM policies, roles, least privilege, federation, and SSO implementation." },
      { title: "Data Protection in the Cloud", duration: "18:30", video: "https://www.youtube.com/embed/3NjQ9b3pgIg", desc: "Encryption at rest and in transit, key management, and data classification." },
      { title: "Container & Kubernetes Security", duration: "24:00", video: "https://www.youtube.com/embed/R-JUOpCgTZc", desc: "Docker security, K8s RBAC, pod security policies, and image scanning." },
      { title: "Cloud Network Security", duration: "20:15", video: "https://www.youtube.com/embed/qiQR5rTSshw", desc: "VPCs, security groups, NACLs, WAF, and DDoS protection in cloud." },
      { title: "Compliance & Governance", duration: "16:00", video: "https://www.youtube.com/embed/kDEX1HXybrU", desc: "SOC2, ISO 27001, GDPR, HIPAA compliance in cloud environments." },
      { title: "Cloud Incident Response", duration: "18:00", video: "https://www.youtube.com/embed/zyVVr81CKGY", desc: "CloudTrail, GuardDuty, forensics in cloud, and automated response playbooks." },
    ],
    quiz: [
      { q: "In the shared responsibility model, who secures the data?", opts: ["Only the cloud provider", "Only the customer", "Both share responsibility", "Neither"], ans: 1 },
      { q: "What is the principle of least privilege?", opts: ["Give everyone admin access", "Grant minimum necessary permissions", "Remove all access", "Only use root accounts"], ans: 1 },
      { q: "What does VPC stand for?", opts: ["Virtual Private Cloud", "Very Private Computer", "Virtual Protocol Channel", "Verified Public Cloud"], ans: 0 },
      { q: "Which AWS service provides DDoS protection?", opts: ["S3", "EC2", "Shield", "Lambda"], ans: 2 },
      { q: "What is a WAF?", opts: ["Wide Area Firewall", "Web Application Firewall", "Wireless Access Frequency", "Web Authentication Framework"], ans: 1 },
    ],
  },
  {
    id: "digital-forensics",
    title: "Digital Forensics & Investigation",
    desc: "Investigate cyber incidents — evidence collection, disk forensics, memory analysis, and legal procedures.",
    level: "Advanced",
    duration: "3h 10m",
    lessons: 7,
    color: T.gold,
    icon: "🔍",
    category: "Forensics",
    instructor: "VRIKAAN Academy",
    rating: 4.7,
    students: 3890,
    chapters: [
      { title: "Introduction to Digital Forensics", duration: "16:00", video: "https://www.youtube.com/embed/ZhJiNGXmKiM", desc: "Forensic methodology, chain of custody, and legal considerations." },
      { title: "Evidence Collection & Preservation", duration: "22:00", video: "https://www.youtube.com/embed/u9dBGWVwMMA", desc: "Imaging drives, write blockers, hashing evidence, and documentation." },
      { title: "File System Forensics", duration: "28:00", video: "https://www.youtube.com/embed/hPsU6TYkjJk", desc: "NTFS, FAT32, ext4 analysis, deleted file recovery, and timeline creation." },
      { title: "Memory Forensics", duration: "30:00", video: "https://www.youtube.com/embed/rvKQtRklwQ4", desc: "Volatility framework, process analysis, network connections, and malware detection in RAM." },
      { title: "Network Forensics", duration: "24:00", video: "https://www.youtube.com/embed/4_7A8Ikp5Cc", desc: "PCAP analysis, Wireshark deep dive, log correlation, and traffic reconstruction." },
      { title: "Mobile Forensics", duration: "20:00", video: "https://www.youtube.com/embed/EOoBAq6z4Zk", desc: "iOS and Android forensics, data extraction, app analysis, and cloud artifacts." },
      { title: "Report Writing & Court Testimony", duration: "18:00", video: "https://www.youtube.com/embed/yn6CPQ9RioA", desc: "Expert witness preparation, report standards, and presenting findings in court." },
    ],
    quiz: [
      { q: "What is the chain of custody?", opts: ["A blockchain protocol", "Documentation of evidence handling", "A type of encryption", "An attack chain"], ans: 1 },
      { q: "Why do we create forensic images?", opts: ["For social media", "To preserve original evidence", "For backup only", "To delete data"], ans: 1 },
      { q: "Which tool is used for memory forensics?", opts: ["Photoshop", "Volatility", "Excel", "Wireshark"], ans: 1 },
      { q: "What hash algorithm is commonly used to verify evidence integrity?", opts: ["ROT13", "Base64", "SHA-256", "Caesar cipher"], ans: 2 },
      { q: "What does PCAP stand for?", opts: ["Personal Computer Access Protocol", "Packet Capture", "Private Cloud Application", "Protected Channel Access Point"], ans: 1 },
    ],
  },
];

// ─── Learning Paths ── ordered course bundles that grant a Path Certificate
// once every course in the path is completed. Guided progression vs a loose
// catalog — the Unacademy "track" feel.
const PATHS = [
  {
    id: "family-protector",
    title: "Family Protector Path",
    desc: "Become the cyber-defender your whole family relies on. Master every scam targeting Indian households + how to protect kids and elders.",
    icon: "🛡",
    color: "#ec4899",
    courseIds: ["scam-defense-families", "senior-online-safety", "kids-online-safety"],
  },
  {
    id: "upi-defender",
    title: "UPI & Money Defender Path",
    desc: "Lock down digital payments end-to-end. Spot every UPI fraud, secure your accounts, and recover fast if hit.",
    icon: "₹",
    color: "#f97316",
    courseIds: ["upi-payment-safety", "scam-defense-families"],
  },
  {
    id: "security-pro",
    title: "Security Professional Path",
    desc: "Go from aware to expert. Fundamentals, ethical hacking, network defense and forensics — the technical career track.",
    icon: "🎯",
    color: "#6366f1",
    courseIds: ["cyber-fundamentals", "ethical-hacking", "network-defense", "digital-forensics"],
  },
];

// ─── Knowledge Base (original modules) ───
const kbModules = [
  { id: 1, tag: "ESSENTIAL", color: T.red, title: "How to Spot Phishing Emails", time: "5 min", content: "Phishing is the #1 cyber threat. Red flags:\n\n1. Urgency tactics — 'Your account will be locked in 24 hours'\n2. Suspicious sender addresses — check for misspellings (amaz0n.com)\n3. Generic greetings — 'Dear Customer' instead of your name\n4. Hover over links — if the URL doesn't match, it's phishing\n5. Unexpected attachments — never open .exe, .zip from unknowns\n6. Grammar and spelling errors — legitimate companies proofread\n\nIf in doubt, go directly to the website by typing the URL yourself." },
  { id: 2, tag: "FUNDAMENTALS", color: T.blue, title: "Understanding Online Scams", time: "7 min", content: "Scammers use psychology to trick victims:\n\n1. Romance scams — fake profiles building emotional connections\n2. Investment scams — guaranteed high returns (crypto, forex)\n3. Tech support scams — fake pop-ups about infections\n4. Job scams — fake postings requesting fees\n5. Lottery/prize scams — pay a fee to claim winnings\n6. Impersonation — pretending to be government or bank\n\nRule: If it sounds too good to be true, it is." },
  { id: 3, tag: "FINANCE", color: T.gold, title: "Protecting Your Bank Account", time: "6 min", content: "Your financial accounts are prime targets:\n\n1. Enable two-factor authentication on all banking apps\n2. Never share OTPs — your bank will NEVER ask for them\n3. Use unique, strong passwords for each financial account\n4. Set up transaction alerts for any amount\n5. Avoid banking on public WiFi — use mobile data or VPN\n6. Regularly check statements for unauthorized transactions\n7. Freeze your card immediately if you suspect compromise\n8. Use virtual cards for online shopping" },
  { id: 4, tag: "EMERGENCY", color: T.ember, title: "What to Do After a Breach", time: "4 min", content: "If your accounts are compromised, act fast:\n\n1. IMMEDIATELY change passwords on all affected accounts\n2. Enable 2FA on everything — email, social, banking\n3. Check for unauthorized logins in security settings\n4. Revoke access to unknown devices and third-party apps\n5. Run a full antivirus scan on all devices\n6. Alert your bank if financial data was exposed\n7. File a report with cybercrime authorities\n8. Monitor credit report for unusual activity\n\nThe first 24 hours are critical." },
  { id: 5, tag: "PRIVACY", color: T.purple, title: "Social Media Privacy Guide", time: "5 min", content: "Your social media reveals more than you think:\n\n1. Set profiles to private — limit who sees your posts\n2. Disable location tags on photos\n3. Review app permissions — revoke unused apps\n4. Don't share: birthday, mother's maiden name, pet names\n5. Be cautious with quizzes — they harvest data\n6. Use different emails for social media and banking\n7. Regularly Google yourself to see what's public\n8. Enable login alerts for account access" },
  { id: 6, tag: "FUNDAMENTALS", color: T.cyan, title: "Password Security Mastery", time: "3 min", content: "Your password is your first line of defense:\n\n1. Use 12+ characters mixing types\n2. Never reuse passwords across accounts\n3. Use a password manager (1Password, Bitwarden)\n4. Enable 2FA everywhere — use authenticator apps\n5. Avoid personal info in passwords\n6. Use passphrases — 'correct-horse-battery-staple'\n7. Change passwords after any breach notification\n8. Never share passwords via text or email" },
  { id: 7, tag: "ESSENTIAL", color: T.red, title: "Safe Online Shopping", time: "5 min", content: "E-commerce fraud costs billions annually:\n\n1. Only shop on HTTPS sites — look for the padlock\n2. Use credit cards over debit cards\n3. Enable purchase notifications\n4. Be wary of deals 'too good to be true'\n5. Check seller reviews before purchasing\n6. Use virtual card numbers for online purchases\n7. Never save card details on untrusted sites\n8. Verify return/refund policy before buying" },
  { id: 8, tag: "PRIVACY", color: T.purple, title: "VPN & Public WiFi Safety", time: "4 min", content: "Public WiFi is a hacker's playground:\n\n1. Never access banking on public WiFi\n2. Use a reputable VPN to encrypt your connection\n3. Disable auto-connect to WiFi networks\n4. Verify network names with staff\n5. Turn off file sharing in public places\n6. Use HTTPS-only websites on shared networks\n7. Forget networks after you're done\n8. Consider using your phone's hotspot instead" },
];

// ─── Helpers ───
const STORAGE_KEY = "vrikaan_learn_progress";

function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCertificates() {
  try { return JSON.parse(localStorage.getItem("vrikaan_certificates")) || []; } catch { return []; }
}

function saveCertificate(cert) {
  const certs = getCertificates();
  if (!certs.find(c => c.courseId === cert.courseId)) {
    certs.push(cert);
    localStorage.setItem("vrikaan_certificates", JSON.stringify(certs));
  }
}

// ─── Gamification: XP, levels, streaks, badges ──────────────────────
const today = () => new Date().toISOString().slice(0, 10);

// Daily streak — bumps when the learner is active on a new day. Resets if
// a day was skipped. Returns { count, best, last }.
function touchStreak() {
  let s;
  try { s = JSON.parse(localStorage.getItem("vrikaan_academy_streak")); } catch { s = null; }
  s = s || { count: 0, best: 0, last: null };
  const t = today();
  if (s.last === t) return s; // already counted today
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  s.count = s.last === yest ? s.count + 1 : 1; // continued vs reset
  s.best = Math.max(s.best || 0, s.count);
  s.last = t;
  localStorage.setItem("vrikaan_academy_streak", JSON.stringify(s));
  return s;
}
function getStreak() {
  try { return JSON.parse(localStorage.getItem("vrikaan_academy_streak")) || { count: 0, best: 0, last: null }; }
  catch { return { count: 0, best: 0, last: null }; }
}

// XP: 10 per lesson + 25 per completed course + 50 per certificate.
function computeStats(progress, certs, allCourses) {
  let lessons = 0, completedCourses = 0;
  for (const c of allCourses) {
    const done = (progress[c.id] || []).length;
    lessons += done;
    if (done >= c.chapters.length && c.chapters.length > 0) completedCourses++;
  }
  const certCount = (certs || []).length;
  const xp = lessons * 10 + completedCourses * 25 + certCount * 50;
  // Level curve: each level needs progressively more XP.
  let level = 1, need = 100, acc = 0;
  while (xp >= acc + need) { acc += need; level++; need = Math.round(need * 1.35); }
  const intoLevel = xp - acc;
  return { lessons, completedCourses, certCount, xp, level, intoLevel, levelNeed: need };
}

const LEVEL_TITLES = ["Novice", "Aware", "Guarded", "Defender", "Sentinel", "Guardian", "Cyber Shield", "Threat Hunter", "Master Defender", "Cyber Sensei"];
const levelTitle = (lvl) => LEVEL_TITLES[Math.min(lvl - 1, LEVEL_TITLES.length - 1)] || "Cyber Sensei";

// Achievement badges — derived from progress, no extra storage needed.
function computeBadges(progress, certs, stats, allCourses) {
  const streak = getStreak();
  const indiaIds = ["scam-defense-families", "senior-online-safety", "kids-online-safety", "upi-payment-safety"];
  const indiaDone = indiaIds.filter(id => {
    const c = allCourses.find(x => x.id === id);
    return c && (progress[id] || []).length >= c.chapters.length;
  }).length;
  return [
    { id: "first-step", icon: "🌱", name: "First Step", desc: "Complete your first lesson", earned: stats.lessons >= 1 },
    { id: "quiz-master", icon: "🎓", name: "Certified", desc: "Earn your first certificate", earned: stats.certCount >= 1 },
    { id: "streak-3", icon: "🔥", name: "On Fire", desc: "3-day learning streak", earned: streak.count >= 3 || streak.best >= 3 },
    { id: "streak-7", icon: "⚡", name: "Unstoppable", desc: "7-day learning streak", earned: streak.best >= 7 },
    { id: "family-protector", icon: "👨‍👩‍👧‍👦", name: "Family Protector", desc: "Finish all 4 India courses", earned: indiaDone >= 4 },
    { id: "scholar", icon: "📚", name: "Scholar", desc: "Complete 25 lessons", earned: stats.lessons >= 25 },
    { id: "level-5", icon: "🛡", name: "Sentinel", desc: "Reach Level 5", earned: stats.level >= 5 },
    { id: "completionist", icon: "🏆", name: "Completionist", desc: "Finish 5 full courses", earned: stats.completedCourses >= 5 },
  ];
}

// ─── Certificate Generator ───
function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function generateCertificate(courseName, userName) {
  const W = 1600, H = 1130;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const cx = W / 2;
  const dark = "#1F1F1F";
  const gray = "#636363";
  const light = "#9E9E9E";

  // Load real images (signature, academy logo, stamp)
  const [sigImg, logoImg, stampImg] = await Promise.all([
    loadImg("/images/signature.png"),
    loadImg("/images/academy-logo.png"),
    loadImg("/images/stamp.png"),
  ]);

  // ── Clean white background ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── Top accent bar (brand gradient) ──
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, "#6366f1");
  topBar.addColorStop(0.5, "#14e3c5");
  topBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = topBar;
  ctx.fillRect(0, 0, W, 8);

  // ── Thin border ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // ── VRIKAAN Academy Logo (top-left) ──
  if (logoImg) {
    // Draw the real academy logo
    const logoH = 90;
    const logoW = logoH * (logoImg.width / logoImg.height);
    ctx.drawImage(logoImg, 80, 55, logoW, logoH);
    // Add text next to logo if logo is small
    if (logoW < 200) {
      ctx.textAlign = "left";
      ctx.font = "bold 22px 'Arial', sans-serif";
      ctx.fillStyle = dark;
      ctx.fillText("VRIKAAN ACADEMY", 80 + logoW + 16, 98);
      ctx.font = "11px 'Arial', sans-serif";
      ctx.fillStyle = light;
      ctx.fillText("AI-Powered Cyber Defense", 80 + logoW + 16, 116);
    }
  } else {
    // Fallback: draw shield + text
    ctx.save();
    ctx.translate(120, 100);
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(-18, -20, -24, -10, -24, 0);
    ctx.bezierCurveTo(-24, 14, -10, 24, 0, 30);
    ctx.bezierCurveTo(10, 24, 24, 14, 24, 0);
    ctx.bezierCurveTo(24, -10, 18, -20, 0, -22);
    ctx.closePath();
    const shGrad = ctx.createLinearGradient(-24, -22, 24, 30);
    shGrad.addColorStop(0, "#6366f1");
    shGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = shGrad;
    ctx.fill();
    ctx.font = "bold 20px 'Arial', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("S", 0, 8);
    ctx.restore();
    ctx.textAlign = "left";
    ctx.font = "bold 28px 'Arial', sans-serif";
    ctx.fillStyle = dark;
    ctx.fillText("VRIKAAN", 158, 100);
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = light;
    ctx.fillText("ACADEMY", 158, 118);
  }

  // ── "Powered by" badge (top-right) ──
  ctx.textAlign = "right";
  ctx.font = "10px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Powered by", W - 120, 88);
  ctx.font = "bold 16px 'Arial', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("VRIKAAN AI", W - 120, 108);
  ctx.font = "10px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Cyber Defense Platform", W - 120, 124);

  // ── Separator line ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 155); ctx.lineTo(W - 80, 155); ctx.stroke();

  // ── Certificate label ──
  ctx.textAlign = "left";
  ctx.font = "600 14px 'Arial', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.letterSpacing = "3px";
  ctx.fillText("CERTIFICATE OF COMPLETION", 120, 220);

  // ── Small accent line under label ──
  ctx.fillStyle = "#14e3c5";
  ctx.fillRect(120, 232, 60, 3);

  // ── Learner Name (largest element) ──
  ctx.font = "bold 56px 'Georgia', serif";
  ctx.fillStyle = dark;
  ctx.fillText(userName || "Student", 120, 310);

  // ── Completion text ──
  ctx.font = "18px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("has successfully completed the authorized professional course", 120, 365);

  // ── Course Name ──
  ctx.font = "bold 34px 'Georgia', serif";
  ctx.fillStyle = dark;
  // Wrap course name if too long
  const maxW = W - 240;
  if (ctx.measureText(courseName).width > maxW) {
    ctx.font = "bold 28px 'Georgia', serif";
  }
  ctx.fillText(courseName, 120, 430);

  // ── Offered by line ──
  ctx.font = "16px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("an online non-credit course offered by VRIKAAN Academy", 120, 475);

  // ── Course description ──
  ctx.font = "15px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("The learner demonstrated proficiency in cybersecurity concepts, tools, and industry best practices", 120, 520);
  ctx.fillText("as validated through the VRIKAAN Academy coursework and examination.", 120, 542);

  // ── Date and Certificate ID section ──
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const certId = `SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(120, 585); ctx.lineTo(W - 120, 585); ctx.stroke();

  // Date (left)
  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("DATE", 120, 620);
  ctx.font = "16px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText(dateStr, 120, 645);

  // Certificate ID (right side)
  ctx.textAlign = "right";
  ctx.font = "12px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("CERTIFICATE ID", W - 120, 620);
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = dark;
  ctx.fillText(certId, W - 120, 645);

  // ── Separator ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath(); ctx.moveTo(120, 680); ctx.lineTo(W - 120, 680); ctx.stroke();

  // ── Signatures ──
  ctx.textAlign = "left";

  // Signature 1 — Founder (real signature image or fallback)
  if (sigImg) {
    // Draw real signature image
    const sigH = 55;
    const sigW = sigH * (sigImg.width / sigImg.height);
    ctx.drawImage(sigImg, 120, 700, sigW, sigH);
  } else {
    // Fallback handwritten signature
    ctx.save();
    ctx.strokeStyle = "#2d3748"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    let px = 120;
    "Sahil Nikam".split("").forEach((ch, i) => {
      const baseY = 740 + Math.sin(i * 0.8) * 4;
      if (i === 0) { ctx.moveTo(px, baseY); ctx.quadraticCurveTo(px + 5, baseY - 18, px + 12, baseY - 12); ctx.quadraticCurveTo(px + 18, baseY - 6, px + 10, baseY + 2); ctx.quadraticCurveTo(px + 5, baseY + 8, px + 20, baseY); px += 22; }
      else if (ch === " ") { px += 8; ctx.moveTo(px, baseY); }
      else { ctx.quadraticCurveTo(px + 3, baseY - 6 + Math.random() * 4, px + 7, baseY + Math.random() * 3 - 1); px += 7 + Math.random() * 3; }
    });
    ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(380, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText("Sahil Anil Nikam", 120, 785);
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("Founder & CEO, VRIKAAN", 120, 805);

  // Signature 2 — Academy Director
  ctx.strokeStyle = "#d1d5db";
  ctx.beginPath(); ctx.moveTo(500, 760); ctx.lineTo(760, 760); ctx.stroke();
  ctx.font = "bold 14px 'Arial', sans-serif";
  ctx.fillStyle = dark;
  ctx.fillText("VRIKAAN Academy", 500, 785);
  ctx.font = "13px 'Arial', sans-serif";
  ctx.fillStyle = gray;
  ctx.fillText("Head of Education", 500, 805);

  // ── Official Stamp / Verified Badge (right side) ──
  if (stampImg) {
    // Draw real stamp image
    const stSize = 130;
    ctx.drawImage(stampImg, W - 300, 680, stSize, stSize);
  } else {
    // Fallback: gradient badge with checkmark
    const bx = W - 280, by = 720;
    ctx.beginPath();
    ctx.arc(bx + 30, by + 30, 28, 0, Math.PI * 2);
    const badgeGrad = ctx.createLinearGradient(bx, by, bx + 60, by + 60);
    badgeGrad.addColorStop(0, "#6366f1");
    badgeGrad.addColorStop(1, "#14e3c5");
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(bx + 18, by + 30); ctx.lineTo(bx + 27, by + 40); ctx.lineTo(bx + 44, by + 20);
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.font = "bold 13px 'Arial', sans-serif";
    ctx.fillStyle = "#6366f1";
    ctx.fillText("VERIFIED", bx + 68, by + 26);
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = gray;
    ctx.fillText("CERTIFICATE", bx + 68, by + 44);
  }

  // ── Bottom separator ──
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath(); ctx.moveTo(80, H - 120); ctx.lineTo(W - 80, H - 120); ctx.stroke();

  // ── Footer ──
  ctx.textAlign = "left";
  ctx.font = "11px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("Verify this certificate at vrikaan.com/verify/" + certId, 120, H - 85);

  ctx.textAlign = "right";
  ctx.font = "11px 'Arial', sans-serif";
  ctx.fillStyle = light;
  ctx.fillText("© 2026 VRIKAAN. All rights reserved.", W - 120, H - 85);

  // ── Bottom accent bar ──
  const btmBar = ctx.createLinearGradient(0, 0, W, 0);
  btmBar.addColorStop(0, "#6366f1");
  btmBar.addColorStop(0.5, "#14e3c5");
  btmBar.addColorStop(1, "#6366f1");
  ctx.fillStyle = btmBar;
  ctx.fillRect(0, H - 8, W, 8);

  return canvas.toDataURL("image/png");
}

// ─── Video Player ───
function VideoPlayer({ title, lessonDesc, duration }) {
  const [playing, setPlaying] = useState(false);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent("cybersecurity " + title + " tutorial")}`;

  if (playing) {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, #0a0f1e, #111827)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #22c55e, #14e3c5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, animation: "pulse 2s infinite" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Vrikaan Sans'", marginBottom: 6, textAlign: "center" }}>Opening YouTube...</div>
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Video is playing in a new tab</div>
        <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box", cursor: "pointer" }}
      onClick={() => { setPlaying(true); window.open(searchUrl, "_blank"); }}>
      {/* Decorative grid background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(20,227,197,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(20,227,197,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      {/* Shield icon */}
      <div style={{ position: "relative", width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(20,227,197,0.2))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14e3c5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" fill="rgba(20,227,197,0.3)"/>
        </svg>
      </div>
      <div style={{ position: "relative", fontSize: 17, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Vrikaan Sans'", marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div style={{ position: "relative", fontSize: 13, color: "#94a3b8", marginBottom: 16, textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>{lessonDesc}</div>
      <div style={{ position: "relative", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ padding: "10px 24px", background: "linear-gradient(135deg, #ef4444, #dc2626)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Vrikaan Sans'", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
          Watch on YouTube
        </div>
        <span style={{ fontSize: 12, color: "#64748b" }}>{duration}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function Learn() {
  const [view, setView] = useState("catalog"); // catalog | course | quiz | certificate | knowledge
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [progress, setProgress] = useState(getProgress);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certName, setCertName] = useState("");
  const [certImage, setCertImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [kbActive, setKbActive] = useState(null);
  const [kbFilter, setKbFilter] = useState("ALL");
  const certRef = useRef(null);
  const [streak, setStreak] = useState(getStreak);

  // Bump the daily learning streak once per session/day.
  useEffect(() => { setStreak(touchStreak()); }, []);

  // Live gamification stats + badges, recomputed as progress changes.
  const certs = getCertificates();
  const stats = computeStats(progress, certs, courses);
  const badges = computeBadges(progress, certs, stats, courses);

  // Continue-learning: most recent course with partial progress.
  const inProgressCourse = courses.find(c => {
    const done = (progress[c.id] || []).length;
    return done > 0 && done < c.chapters.length;
  });

  const categories = ["All", ...new Set(courses.map(c => c.category))];
  const kbTags = ["ALL", "ESSENTIAL", "FUNDAMENTALS", "FINANCE", "EMERGENCY", "PRIVACY"];

  // Filter courses
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const markLessonComplete = (courseId, lessonIdx) => {
    const p = { ...progress };
    if (!p[courseId]) p[courseId] = [];
    if (!p[courseId].includes(lessonIdx)) p[courseId].push(lessonIdx);
    setProgress(p);
    saveProgress(p);
  };

  const getCourseProgress = (courseId) => {
    const c = courses.find(x => x.id === courseId);
    if (!c) return 0;
    const done = (progress[courseId] || []).length;
    return Math.round((done / c.chapters.length) * 100);
  };

  const isLessonDone = (courseId, idx) => (progress[courseId] || []).includes(idx);

  const openCourse = (course) => {
    setActiveCourse(course);
    setActiveLesson(0);
    setView("course");
    window.scrollTo(0, 0);
  };

  const startQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setView("quiz");
    window.scrollTo(0, 0);
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const course = activeCourse;
    const score = course.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.ans ? 1 : 0), 0);
    if (score >= Math.ceil(course.quiz.length * 0.6)) {
      // Pass — mark all lessons as complete
      const p = { ...progress };
      p[course.id] = course.chapters.map((_, i) => i);
      setProgress(p);
      saveProgress(p);
    }
  };

  const getQuizScore = () => {
    if (!activeCourse) return 0;
    return activeCourse.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.ans ? 1 : 0), 0);
  };

  const downloadCert = () => {
    if (!certImage) return;
    const a = document.createElement("a");
    a.href = certImage;
    a.download = `VRIKAAN_Certificate_${activeCourse.title.replace(/\s+/g, "_")}.png`;
    a.click();
    saveCertificate({ courseId: activeCourse.id, name: certName, date: new Date().toISOString(), course: activeCourse.title });
  };

  // ─── Course Catalog View ───
  const renderCatalog = () => (
    <>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>VRIKAAN ACADEMY</span>
        <h1 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          Learn Cybersecurity. <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get Certified.</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          India-first scam-defense courses + technical security tracks. Learn the threat, practice on real VRIKAAN tools, earn a certificate.
        </p>
      </div>

      {/* ── Learner Dashboard (XP · level · streak · continue · badges) ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(20,227,197,0.05))",
        border: `1px solid ${T.accent}22`, borderRadius: 20, padding: "26px 28px", marginBottom: 36,
      }}>
        {/* Top row: level + XP bar + streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: "#02131a", fontFamily: "'Vrikaan Sans'",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, lineHeight: 1 }}>LVL</span>
            <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{stats.level}</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Vrikaan Sans'", fontSize: 18, fontWeight: 800, color: T.white }}>{levelTitle(stats.level)}</span>
              <span style={{ fontSize: 12, color: T.cyan, fontWeight: 700 }}>{stats.xp.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(148,163,184,0.12)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.round((stats.intoLevel / stats.levelNeed) * 100))}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, borderRadius: 4, transition: "width 0.6s" }} />
            </div>
            <div style={{ fontSize: 11, color: T.mutedDark, marginTop: 4 }}>{stats.levelNeed - stats.intoLevel} XP to Level {stats.level + 1}</div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0, padding: "0 8px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: streak.count > 0 ? "#f97316" : T.mutedDark, fontFamily: "'Vrikaan Sans'" }}>
              {streak.count > 0 ? "🔥" : "·"} {streak.count}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>day streak{streak.best > streak.count ? ` · best ${streak.best}` : ""}</div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: inProgressCourse || badges.some(b => b.earned) ? 20 : 0 }}>
          {[
            { v: stats.lessons, l: "Lessons done" },
            { v: stats.completedCourses, l: "Courses finished" },
            { v: stats.certCount, l: "Certificates" },
            { v: badges.filter(b => b.earned).length + "/" + badges.length, l: "Badges" },
          ].map(s => (
            <div key={s.l} style={{ flex: "1 1 120px", textAlign: "center", padding: "12px 8px", background: "rgba(2,6,23,0.3)", border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.cyan, fontFamily: "'Vrikaan Sans'" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        {inProgressCourse && (
          <button onClick={() => openCourse(inProgressCourse)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
            padding: "14px 18px", marginBottom: 18, cursor: "pointer",
            background: `linear-gradient(135deg, ${inProgressCourse.color}18, transparent)`,
            border: `1px solid ${inProgressCourse.color}33`, borderRadius: 14,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{inProgressCourse.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: T.cyan, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Continue learning</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{inProgressCourse.title}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{(progress[inProgressCourse.id] || []).length}/{inProgressCourse.chapters.length} lessons · {getCourseProgress(inProgressCourse.id)}%</div>
            </div>
            <span style={{ color: T.white, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>→</span>
          </button>
        )}

        {/* Badges */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {badges.map(b => (
            <div key={b.id} title={`${b.name} — ${b.desc}`} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 999,
              background: b.earned ? "rgba(20,227,197,0.10)" : "rgba(148,163,184,0.04)",
              border: `1px solid ${b.earned ? T.cyan + "44" : T.border}`,
              opacity: b.earned ? 1 : 0.45, filter: b.earned ? "none" : "grayscale(1)",
            }}>
              <span style={{ fontSize: 15 }}>{b.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: b.earned ? T.white : T.mutedDark }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Courses / Knowledge Base / My Certificates */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32 }}>
        {[
          { label: "Courses", v: "catalog" },
          { label: "Learning Paths", v: "paths" },
          { label: "Knowledge Base", v: "knowledge" },
          { label: "My Certificates", v: "mycerts" },
        ].map(tab => (
          <button key={tab.v} onClick={() => setView(tab.v)} style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Vrikaan Sans'",
            background: view === tab.v ? `${T.accent}15` : "transparent",
            border: `1px solid ${view === tab.v ? T.accent + "30" : T.border}`,
            color: view === tab.v ? T.accent : T.muted,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Search and filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search courses..." style={{ ...sty.input, maxWidth: 320 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Vrikaan Sans'",
              background: categoryFilter === c ? `${T.accent}15` : "rgba(148,163,184,0.04)",
              border: `1px solid ${categoryFilter === c ? T.accent + "30" : T.border}`,
              color: categoryFilter === c ? T.accent : T.muted,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      <div className="resp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {filtered.map(c => {
          const prog = getCourseProgress(c.id);
          return (
            <div key={c.id} onClick={() => openCourse(c)} style={{
              ...sty.card, cursor: "pointer", transition: "all 0.3s", position: "relative", overflow: "hidden",
            }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = c.color + "30"; }}
               onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = T.border; }}>
              {/* Progress bar at top */}
              {prog > 0 && <div style={{ position: "absolute", top: 0, left: 0, width: `${prog}%`, height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, borderRadius: "14px 14px 0 0" }} />}
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <Badge color={c.color}>{c.level}</Badge>
                <Badge color={T.muted}>{c.category}</Badge>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: T.mutedDark }}>
                <span>{c.lessons} lessons · {c.duration}</span>
                <span style={{ color: T.gold }}>★ {c.rating}</span>
              </div>
              {prog > 0 && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(148,163,184,0.1)" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: prog === 100 ? T.green : T.accent, width: `${prog}%`, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: prog === 100 ? T.green : T.accent }}>{prog}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 900px) { .resp-grid-3 { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );

  // ─── Course Detail View ───
  const renderCourse = () => {
    if (!activeCourse) return null;
    const c = activeCourse;
    const ch = c.chapters[activeLesson];
    const prog = getCourseProgress(c.id);
    const allDone = prog === 100;

    return (
      <>
        <button onClick={() => { setView("catalog"); setActiveCourse(null); }} style={{ ...sty.btn("transparent", T.muted), border: "none", padding: 0, marginBottom: 20, fontSize: 13 }}>
          ← Back to Courses
        </button>

        {/* Course header */}
        <div style={{ ...sty.card, marginBottom: 24, background: `linear-gradient(135deg, ${c.color}08, ${T.card})`, border: `1px solid ${c.color}15` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Badge color={c.color}>{c.level}</Badge>
                <Badge color={T.muted}>{c.category}</Badge>
                <Badge color={T.gold}>★ {c.rating}</Badge>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>{c.icon} {c.title}</h1>
              <p style={{ fontSize: 14, color: T.muted, maxWidth: 600 }}>{c.desc}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: T.muted }}>{c.lessons} lessons · {c.duration}</div>
              <div style={{ fontSize: 12, color: T.muted }}>Self-paced · Free</div>
              {allDone && (
                <button onClick={startQuiz} style={{ ...sty.btn(T.green, "#fff"), marginTop: 10 }}>
                  Take Final Quiz →
                </button>
              )}
            </div>
          </div>
          {/* Progress */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)" }}>
              <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, width: `${prog}%`, transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.cyan }}>{prog}%</span>
          </div>
        </div>

        <div className="course-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          {/* Video & Content */}
          <div>
            {/* India-first text lessons (have `body`) show a reading pane;
                legacy video courses keep the VideoPlayer hero. */}
            {!ch.body && (
              <div style={{ ...sty.card, padding: 0, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
                  <VideoPlayer title={ch.title} lessonDesc={ch.desc} duration={ch.duration} />
                </div>
              </div>
            )}
            <div style={sty.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Lesson {activeLesson + 1} of {c.chapters.length}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'" }}>{ch.title}</h2>
                </div>
                <span style={{ fontSize: 12, color: T.mutedDark }}>{ch.duration}</span>
              </div>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: ch.body ? 18 : 20 }}>{ch.desc}</p>

              {/* Rich lesson body (India courses) */}
              {ch.body && (
                <div style={{ marginBottom: 20 }}>
                  {ch.body.split("\n").filter(Boolean).map((para, pi) => (
                    <p key={pi} style={{ fontSize: 14.5, color: T.white, lineHeight: 1.8, marginBottom: 12, opacity: 0.92 }}>{para}</p>
                  ))}
                </div>
              )}

              {/* Hands-on practice on a real VRIKAAN tool */}
              {ch.practiceTool && (
                <Link to={ch.practiceTool.path} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 20px", marginBottom: 20, textDecoration: "none",
                  background: `linear-gradient(135deg, ${c.color}, ${T.accent})`,
                  color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  fontFamily: "'Vrikaan Sans'",
                }}>
                  🔧 Practice: {ch.practiceTool.label} →
                </Link>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!isLessonDone(c.id, activeLesson) ? (
                  <button onClick={() => markLessonComplete(c.id, activeLesson)} style={sty.btn(T.accent)}>
                    ✓ Mark as Complete
                  </button>
                ) : (
                  <span style={{ ...sty.btn("rgba(34,197,94,0.1)", T.green), cursor: "default" }}>✓ Completed</span>
                )}
                {activeLesson < c.chapters.length - 1 && (
                  <button onClick={() => { setActiveLesson(activeLesson + 1); window.scrollTo(0, 0); }} style={sty.btn("rgba(99,102,241,0.1)", T.accent)}>
                    Next Lesson →
                  </button>
                )}
                {activeLesson > 0 && (
                  <button onClick={() => { setActiveLesson(activeLesson - 1); window.scrollTo(0, 0); }} style={sty.btn("rgba(148,163,184,0.1)", T.muted)}>
                    ← Previous
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lesson sidebar */}
          <div style={sty.card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Course Content</h3>
            {c.chapters.map((ch, i) => (
              <div key={i} onClick={() => setActiveLesson(i)} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 4,
                background: i === activeLesson ? `${T.accent}12` : "transparent",
                border: `1px solid ${i === activeLesson ? T.accent + "20" : "transparent"}`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: isLessonDone(c.id, i) ? T.green : i === activeLesson ? T.accent : "rgba(148,163,184,0.1)",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                }}>
                  {isLessonDone(c.id, i) ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: i === activeLesson ? 600 : 400, color: i === activeLesson ? T.white : T.muted }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: T.mutedDark }}>{ch.duration}</div>
                </div>
              </div>
            ))}
            {allDone && (
              <button onClick={startQuiz} style={{ ...sty.btn(T.green, "#fff"), width: "100%", justifyContent: "center", marginTop: 16 }}>
                Take Final Quiz
              </button>
            )}
            {!allDone && (
              <div style={{ marginTop: 16, padding: 12, background: "rgba(99,102,241,0.06)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.1)" }}>
                <div style={{ fontSize: 12, color: T.muted }}>Complete all lessons to unlock the final quiz and earn your certificate.</div>
              </div>
            )}
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .course-layout { grid-template-columns: 1fr !important; } }`}</style>
      </>
    );
  };

  // ─── Quiz View ───
  const renderQuiz = () => {
    if (!activeCourse) return null;
    const c = activeCourse;
    const score = getQuizScore();
    const passed = score >= Math.ceil(c.quiz.length * 0.6);
    const total = c.quiz.length;

    return (
      <>
        <button onClick={() => setView("course")} style={{ ...sty.btn("transparent", T.muted), border: "none", padding: 0, marginBottom: 20, fontSize: 13 }}>
          ← Back to Course
        </button>

        <div style={{ ...sty.card, marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>Final Quiz: {c.title}</h1>
          <p style={{ fontSize: 14, color: T.muted }}>Score at least 60% to earn your certificate. {total} questions.</p>
        </div>

        {c.quiz.map((q, i) => (
          <div key={i} style={{ ...sty.card, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.accent, flexShrink: 0 }}>{i + 1}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white }}>{q.q}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 40 }}>
              {q.opts.map((opt, j) => {
                let bg = "rgba(148,163,184,0.04)";
                let border = T.border;
                let color = T.muted;
                if (quizSubmitted) {
                  if (j === q.ans) { bg = "rgba(34,197,94,0.1)"; border = T.green + "30"; color = T.green; }
                  else if (quizAnswers[i] === j && j !== q.ans) { bg = "rgba(239,68,68,0.1)"; border = T.red + "30"; color = T.red; }
                } else if (quizAnswers[i] === j) {
                  bg = `${T.accent}12`; border = T.accent + "30"; color = T.accent;
                }
                return (
                  <button key={j} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [i]: j })} disabled={quizSubmitted} style={{
                    padding: "12px 16px", borderRadius: 8, background: bg, border: `1px solid ${border}`,
                    color, fontSize: 14, cursor: quizSubmitted ? "default" : "pointer", textAlign: "left",
                    fontFamily: "'Vrikaan Sans'", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${quizAnswers[i] === j ? color : "rgba(148,163,184,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {quizAnswers[i] === j && <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!quizSubmitted ? (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < total} style={{
              ...sty.btn(Object.keys(quizAnswers).length < total ? "rgba(99,102,241,0.3)" : T.accent),
              padding: "14px 40px", fontSize: 15,
            }}>
              Submit Quiz ({Object.keys(quizAnswers).length}/{total} answered)
            </button>
          </div>
        ) : (
          <div style={{ ...sty.card, marginTop: 24, textAlign: "center", background: passed ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${passed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: passed ? T.green : T.red, fontFamily: "'Vrikaan Sans'" }}>{score}/{total}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: passed ? T.green : T.red, marginBottom: 8 }}>
              {passed ? "Congratulations! You Passed!" : "Not quite — try again!"}
            </div>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>
              {passed ? "You scored above 60%. You can now claim your certificate!" : "You need at least 60% to pass. Review the lessons and try again."}
            </p>
            {passed ? (
              <button onClick={() => { setView("certificate"); setCertName(""); setCertImage(null); window.scrollTo(0, 0); }} style={{ ...sty.btn(T.green, "#fff"), padding: "14px 32px", fontSize: 15 }}>
                Claim Certificate →
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} style={sty.btn(T.accent)}>Retry Quiz</button>
                <button onClick={() => setView("course")} style={sty.btn("rgba(148,163,184,0.1)", T.muted)}>Review Lessons</button>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // ─── Certificate View ───
  const renderCertificate = () => {
    if (!activeCourse) return null;

    return (
      <>
        <div style={{ ...sty.card, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>Claim Your Certificate</h1>
          <p style={{ fontSize: 14, color: T.muted }}>Enter your full name as it should appear on the certificate.</p>
        </div>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ ...sty.card, marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, color: T.muted, marginBottom: 8 }}>Full Name</label>
            <input
              type="text"
              value={certName}
              onChange={e => setCertName(e.target.value)}
              placeholder="e.g. Sahil Anil Nikam"
              style={{ ...sty.input, fontSize: 16, padding: "14px 16px", marginBottom: 16 }}
            />
            <button
              onClick={async () => {
                if (!certName.trim()) return;
                const img = await generateCertificate(activeCourse.title, certName.trim());
                setCertImage(img);
                saveCertificate({ courseId: activeCourse.id, name: certName.trim(), date: new Date().toISOString(), course: activeCourse.title });
              }}
              disabled={!certName.trim()}
              style={{ ...sty.btn(certName.trim() ? T.accent : "rgba(99,102,241,0.3)"), width: "100%", justifyContent: "center", padding: "14px" }}
            >
              Generate Certificate
            </button>
          </div>
        </div>

        {certImage && (
          <div style={{ textAlign: "center" }}>
            <div style={{ ...sty.card, display: "inline-block", padding: 8, marginBottom: 20 }}>
              <img ref={certRef} src={certImage} alt="Certificate" loading="lazy" style={{ width: "100%", maxWidth: 800, borderRadius: 8 }} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={downloadCert} style={{ ...sty.btn(T.green, "#fff"), padding: "14px 32px" }}>
                ⬇ Download Certificate (PNG)
              </button>
              <button onClick={() => { setView("catalog"); setActiveCourse(null); }} style={sty.btn("rgba(148,163,184,0.1)", T.muted)}>
                Back to Courses
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // ─── My Certificates View ───
  const renderMyCerts = () => {
    const certs = getCertificates();
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>My Certificates</h2>
          <p style={{ fontSize: 14, color: T.muted }}>All certificates you have earned are listed below.</p>
        </div>
        {certs.length === 0 ? (
          <div style={{ ...sty.card, textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <h3 style={{ fontSize: 18, color: T.white, marginBottom: 8 }}>No certificates yet</h3>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>Complete a course and pass the quiz to earn your first certificate.</p>
            <button onClick={() => setView("catalog")} style={sty.btn(T.accent)}>Browse Courses</button>
          </div>
        ) : (
          <div className="resp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {certs.map((cert, i) => {
              const course = courses.find(c => c.id === cert.courseId);
              return (
                <div key={i} style={{ ...sty.card, background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,227,197,0.04))", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{course?.icon || "🎓"}</span>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'" }}>{cert.course}</h3>
                      <div style={{ fontSize: 12, color: T.muted }}>Issued to: {cert.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.mutedDark, marginBottom: 12 }}>
                    Completed on {new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <button onClick={async () => {
                    setActiveCourse(course);
                    setCertName(cert.name);
                    const img = await generateCertificate(cert.course, cert.name);
                    setCertImage(img);
                    setView("certificate");
                  }} style={sty.btn("rgba(99,102,241,0.1)", T.accent)}>
                    View & Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <style>{`@media (max-width: 768px) { .resp-grid-2 { grid-template-columns: 1fr !important; } }`}</style>
      </>
    );
  };

  // ─── Knowledge Base View ───
  const renderKnowledge = () => {
    const kbFiltered = kbFilter === "ALL" ? kbModules : kbModules.filter(m => m.tag === kbFilter);
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", marginBottom: 8 }}>Knowledge Base</h2>
          <p style={{ fontSize: 14, color: T.muted }}>Quick, practical guides to protect yourself online.</p>
        </div>

        {/* Tabs back */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
          {[
            { label: "Courses", v: "catalog" },
            { label: "Learning Paths", v: "paths" },
            { label: "Knowledge Base", v: "knowledge" },
            { label: "My Certificates", v: "mycerts" },
          ].map(tab => (
            <button key={tab.v} onClick={() => setView(tab.v)} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Vrikaan Sans'",
              background: view === tab.v ? `${T.accent}15` : "transparent",
              border: `1px solid ${view === tab.v ? T.accent + "30" : T.border}`,
              color: view === tab.v ? T.accent : T.muted,
            }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          {kbTags.map(t => (
            <button key={t} onClick={() => setKbFilter(t)} style={{ padding: "8px 18px", borderRadius: 100, fontFamily: "'Vrikaan Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer", background: kbFilter === t ? `${T.accent}15` : "rgba(148,163,184,0.04)", border: `1px solid ${kbFilter === t ? T.accent + "30" : T.border}`, color: kbFilter === t ? T.accent : T.mutedDark }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {kbFiltered.map(m => (
            <div key={m.id} style={{ background: T.card, border: `1px solid ${kbActive === m.id ? m.color + "20" : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setKbActive(kbActive === m.id ? null : m.id)}>
              <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ padding: "4px 10px", borderRadius: 6, background: `${m.color}0a`, border: `1px solid ${m.color}15`, fontFamily: "'Vrikaan Mono', monospace", fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: 1, flexShrink: 0 }}>{m.tag}</span>
                <h3 style={{ fontFamily: "'Vrikaan Sans', sans-serif", fontSize: 17, fontWeight: 600, margin: 0, flex: 1 }}>{m.title}</h3>
                <span style={{ fontSize: 12, color: T.mutedDark, flexShrink: 0 }}>{m.time}</span>
                <span style={{ color: T.accent, fontSize: 18, transition: "transform 0.4s", transform: kbActive === m.id ? "rotate(45deg)" : "none", fontWeight: 300 }}>+</span>
              </div>
              {kbActive === m.id && (
                <div style={{ padding: "0 28px 28px", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  {m.content.split("\n").map((line, i) => (
                    <p key={i} style={{ color: /^\d\./.test(line) ? T.white : T.muted, fontSize: 14, lineHeight: 1.8, margin: line === "" ? "12px 0" : "4px 0", fontWeight: /^\d\./.test(line) ? 500 : 400 }}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  // ─── Render ───
  // Path progress = completed courses / total courses in the path.
  const pathProgress = (path) => {
    const done = path.courseIds.filter(id => getCourseProgress(id) === 100).length;
    return { done, total: path.courseIds.length, pct: Math.round((done / path.courseIds.length) * 100) };
  };

  const renderPaths = () => (
    <>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32 }}>
        {[
          { label: "Courses", v: "catalog" },
          { label: "Learning Paths", v: "paths" },
          { label: "Knowledge Base", v: "knowledge" },
          { label: "My Certificates", v: "mycerts" },
        ].map(tab => (
          <button key={tab.v} onClick={() => setView(tab.v)} style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Vrikaan Sans'",
            background: view === tab.v ? `${T.accent}15` : "transparent",
            border: `1px solid ${view === tab.v ? T.accent + "30" : T.border}`,
            color: view === tab.v ? T.accent : T.muted,
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Learning Paths</h2>
        <p style={{ color: T.muted, fontSize: 14, maxWidth: 520, margin: "0 auto" }}>
          Guided tracks — finish every course in a path to earn a Path Certificate and master the whole domain.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 820, margin: "0 auto" }}>
        {PATHS.map(p => {
          const pr = pathProgress(p);
          const complete = pr.pct === 100;
          return (
            <div key={p.id} style={{
              ...sty.card, position: "relative", overflow: "hidden",
              border: `1px solid ${complete ? p.color + "55" : T.border}`,
              background: `linear-gradient(135deg, ${p.color}0c, ${T.card})`,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: `${pr.pct}%`, height: 3, background: `linear-gradient(90deg, ${p.color}, ${T.cyan})` }} />
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: `${p.color}1a`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{p.icon}</div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 18, fontWeight: 700, color: T.white, margin: 0 }}>{p.title}</h3>
                    {complete && <Badge color={T.green}>✓ Complete</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</p>

                  {/* Course steps */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {p.courseIds.map((cid, i) => {
                      const c = courses.find(x => x.id === cid);
                      if (!c) return null;
                      const cdone = getCourseProgress(cid) === 100;
                      const cpct = getCourseProgress(cid);
                      return (
                        <button key={cid} onClick={() => openCourse(c)} style={{
                          display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer",
                          padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                          background: cdone ? `${T.green}10` : "rgba(2,6,23,0.3)",
                        }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: cdone ? T.green : "rgba(148,163,184,0.12)", color: cdone ? "#02131a" : T.muted }}>{cdone ? "✓" : i + 1}</span>
                          <span style={{ flex: 1, fontSize: 13, color: T.white }}>{c.icon} {c.title}</span>
                          <span style={{ fontSize: 11, color: T.mutedDark }}>{cpct}%</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: complete ? T.green : T.cyan }}>{pr.done}/{pr.total} courses · {pr.pct}%</span>
                    {complete && (
                      <button onClick={() => { setCertName(""); setView("certificate"); setActiveCourse({ ...p, title: p.title + " (Path)", id: "path-" + p.id, isPath: true }); }} style={{ ...sty.btn(p.color, "#fff"), fontSize: 12, padding: "7px 16px" }}>
                        Claim Path Certificate →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderView = () => {
    switch (view) {
      case "catalog": return renderCatalog();
      case "paths": return renderPaths();
      case "course": return renderCourse();
      case "quiz": return renderQuiz();
      case "certificate": return renderCertificate();
      case "mycerts": return renderMyCerts();
      case "knowledge": return renderKnowledge();
      default: return renderCatalog();
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Vrikaan Sans', sans-serif" }}>
      <SEO title="Learn Cybersecurity" description="Free cybersecurity courses with video lessons, quizzes, and certificates. Master ethical hacking, network defense, malware analysis, and more." path="/learn" />
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        {view !== "course" && view !== "quiz" && view !== "certificate" && (
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
          </div>
        )}
        {renderView()}
      </div>
      <Footer />
    </div>
  );
}
