import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToolTier } from "../lib/toolTiers";

// ─── Credit System (login-aware) ───
const PLANS = {
  guest:      { name: "Guest",      credits: 25,       daily: true,  price: null,       color: "#64748b" },
  free:       { name: "Free",       credits: 50,       daily: true,  price: "Free",     color: "#94a3b8" },
  starter:    { name: "Standard",   credits: 200,      daily: false, price: "₹49/mo",   color: "#22c55e" },
  pro:        { name: "Advanced",   credits: 1000,     daily: false, price: "₹99/mo",   color: "#f97316" },
  enterprise: { name: "Enterprise", credits: Infinity,  daily: false, price: "₹199/mo",  color: "#6366f1" },
  unlimited:  { name: "Enterprise", credits: Infinity,  daily: false, price: "₹199/mo",  color: "#14e3c5" },
};

// userObj is optional — pass from useAuth() for accurate detection
let _currentUser = null;
function setCurrentUser(u) { _currentUser = u; }

function isUserLoggedIn() {
  return !!_currentUser;
}

function getUserPlan() {
  if (!_currentUser) return "guest";
  const p = _currentUser.plan || "free";
  return PLANS[p] ? p : "free";
}

function getCredits() {
  const loggedIn = isUserLoggedIn();
  const userPlan = getUserPlan();
  const data = JSON.parse(localStorage.getItem("vrikaan_ai_credits") || "null");
  const today = new Date().toDateString();
  // Use actual subscription plan for logged-in users
  const basePlan = loggedIn ? userPlan : "guest";
  const baseCredits = PLANS[basePlan]?.credits ?? PLANS.guest.credits;

  // No data exists — create fresh
  if (!data) {
    const d = { plan: basePlan, credits: baseCredits, used: 0, resetDate: today, totalUsed: 0 };
    localStorage.setItem("vrikaan_ai_credits", JSON.stringify(d));
    return d;
  }

  // NOT logged in — force guest plan (no paid plans without login)
  if (!loggedIn && data.plan !== "guest") {
    data.plan = "guest";
    data.used = Math.min(data.used, PLANS.guest.credits);
    localStorage.setItem("vrikaan_ai_credits", JSON.stringify(data));
  }

  // Logged in — sync plan from Firestore subscription
  if (loggedIn && data.plan !== basePlan) {
    data.plan = basePlan;
    localStorage.setItem("vrikaan_ai_credits", JSON.stringify(data));
  }

  // Daily reset for guest/free plans
  if ((data.plan === "free" || data.plan === "guest") && data.resetDate !== today) {
    data.used = 0;
    data.resetDate = today;
    localStorage.setItem("vrikaan_ai_credits", JSON.stringify(data));
  }

  return data;
}

function useCredit() {
  const data = getCredits();
  const max = PLANS[data.plan]?.credits ?? PLANS.guest.credits;
  const remaining = data.plan === "unlimited" ? Infinity : max - data.used;
  if (remaining <= 0 && data.plan !== "unlimited") return false;
  data.used += 1;
  data.totalUsed = (data.totalUsed || 0) + 1;
  localStorage.setItem("vrikaan_ai_credits", JSON.stringify(data));
  return true;
}

function getRemainingCredits() {
  const data = getCredits();
  if (data.plan === "unlimited") return Infinity;
  const max = PLANS[data.plan]?.credits ?? PLANS.guest.credits;
  return Math.max(0, max - data.used);
}

function upgradePlan(planKey) {
  const data = getCredits();
  data.plan = planKey;
  data.used = 0;
  data.resetDate = new Date().toDateString();
  localStorage.setItem("vrikaan_ai_credits", JSON.stringify(data));
}

// ─── AI Engine — calls server-side /api/chat (key stays server-side) ───
// Includes sticky context: current page, user plan, tool tier.
async function askAI(message, history, ctx = {}) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        context: {
          path: ctx.path || "/",
          toolName: ctx.toolName || "",
          toolTier: ctx.toolTier || "free",
          userPlan: ctx.userPlan || "guest",
          loggedIn: !!ctx.loggedIn,
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return "ERROR_QUOTA";
      console.error("VRIKAAN AI Error:", res.status);
      return "I'm experiencing a temporary issue. Please try again in a moment.";
    }

    const data = await res.json();
    return data.reply || "Sorry, I couldn't process that. Try again!";
  } catch (e) {
    console.error("VRIKAAN AI Error:", e.message);
    return "Network error — check your internet connection and try again.";
  }
}

// Map page paths → suggested quick-reply chips (page-aware nudges)
const QUICK_REPLIES_BY_PATH = {
  "/scam-recovery":  ["What helpline to call?", "How to file FIR?", "Recovery odds for UPI fraud?"],
  "/otp-decay":      ["I shared OTP, what now?", "Block card script", "RBI zero-liability rule?"],
  "/safe-word":      ["Suggest a safe-word", "Send briefing to family", "How does it stop voice clones?"],
  "/aadhaar-mask":   ["Why mask Aadhaar?", "UIDAI rules?", "Did my Aadhaar leak?"],
  "/festival-fraud": ["Top Diwali scams?", "How to warn family?", "Wedding-season fraud?"],
  "/device-scan":    ["What does it scan?", "Is my file safe?", "Pro vs free limits?"],
  "/upi-lookup":     ["Check this UPI for me", "Report scam UPI", "What's NPCI 1930?"],
  "/loan-app-check": ["Is KreditBee safe?", "What RBI rules?", "App harassing me"],
  "/stolen-phone":   ["Block my SIM how?", "CEIR IMEI block steps", "File phone-stolen FIR"],
  "/voiceprint":     ["How does it help?", "Record best practices", "Compare against deepfake"],
  "/whatsapp-audit": ["Export chat how?", "Spot scam group signs", "Leave group safely"],
  "/receipt-audit":  ["What's a valid GSTIN?", "Can I refuse service charge?", "Tax-slab rules"],
  "/desktop":        ["When does it launch?", "How is it different?", "Notify me on release"],
  "/careers":        ["Apply how?", "What's the stipend?", "Remote OK?"],
  "/pricing":        ["What unlocks in Pro?", "INR payment options?", "Refund policy?"],
  "/hi":             ["Hindi में बात करो", "UPI ठगी से कैसे बचूँ?", "मेरा OTP share हो गया"],
};

function getQuickRepliesForPath(path) {
  if (!path) return [];
  // Exact match
  if (QUICK_REPLIES_BY_PATH[path]) return QUICK_REPLIES_BY_PATH[path];
  // Partial prefix match (e.g. /pricing?from=x)
  const key = Object.keys(QUICK_REPLIES_BY_PATH).find(k => path.startsWith(k));
  return key ? QUICK_REPLIES_BY_PATH[key] : [];
}

// ─── Built-in Knowledge Base (works without API) ───
const KB = [
  { k: ["phishing", "phish", "fake email", "scam email"], a: "**Phishing** is a social engineering attack where attackers impersonate trusted entities to steal sensitive data.\n\n**How to protect yourself:**\n- Never click links in unexpected emails — hover to check the real URL\n- Look for misspellings, urgency, or generic greetings (\"Dear Customer\")\n- Enable **2-Factor Authentication (2FA)** on all accounts\n- Use VRIKAAN's **Fraud Analyzer** to scan suspicious messages\n- Report phishing emails to your IT department or email provider\n\nRemember: legitimate companies never ask for passwords via email." },
  { k: ["password", "strong password", "password security", "password manager"], a: "**Strong Password Best Practices:**\n\n- Use **12+ characters** with uppercase, lowercase, numbers & symbols\n- Never reuse passwords across sites\n- Use a **password manager** (like VRIKAAN's Password Vault)\n- Enable **2FA/MFA** wherever available\n- Avoid personal info (birthdays, names, pet names)\n- Consider using **passphrases** — e.g., \"Coffee!Mountain#Sunset42\"\n\nCheck your password strength using VRIKAAN's **Password Vault** tool!" },
  { k: ["ransomware", "ransom", "encrypt files", "locked files"], a: "**Ransomware** is malware that encrypts your files and demands payment for the decryption key.\n\n**Prevention:**\n- Keep regular **offline backups** (3-2-1 rule)\n- Keep OS and software **updated**\n- Don't open suspicious email attachments\n- Use reputable **antivirus/EDR** solutions\n- Disable **macros** in Office documents from unknown sources\n- Use network **segmentation** to limit spread\n\n**If infected:** Don't pay the ransom — contact cybersecurity professionals and law enforcement." },
  { k: ["malware", "virus", "trojan", "worm", "spyware"], a: "**Malware** is malicious software designed to damage, disrupt, or gain unauthorized access.\n\n**Types:**\n- **Virus** — attaches to files, spreads when executed\n- **Trojan** — disguised as legitimate software\n- **Worm** — self-replicating, spreads across networks\n- **Spyware** — monitors your activity secretly\n- **Adware** — displays unwanted advertisements\n\n**Protection:**\n- Install reputable antivirus software\n- Keep your system updated\n- Download only from trusted sources\n- Scan files before opening them" },
  { k: ["vpn", "virtual private network", "privacy", "anonymous"], a: "**VPN (Virtual Private Network)** encrypts your internet traffic and masks your IP address.\n\n**Benefits:**\n- Encrypts data on public WiFi\n- Hides your browsing from ISPs\n- Bypasses geo-restrictions\n- Protects against man-in-the-middle attacks\n\n**Choose a VPN that:**\n- Has a **no-logs policy**\n- Uses **AES-256 encryption**\n- Offers a **kill switch**\n- Has servers in multiple countries\n\nNote: VPNs don't make you completely anonymous — combine with good security practices." },
  { k: ["2fa", "two factor", "mfa", "multi factor", "authenticator"], a: "**Two-Factor Authentication (2FA)** adds an extra layer of security beyond just a password.\n\n**Types (from most to least secure):**\n1. **Hardware keys** (YubiKey, FIDO2) — best protection\n2. **Authenticator apps** (Google Authenticator, Authy)\n3. **Push notifications** (Duo, Microsoft)\n4. **SMS codes** — better than nothing, but vulnerable to SIM swapping\n\n**Enable 2FA on:** Email, banking, social media, cloud storage, and any account with sensitive data.\n\nVRIKAAN recommends using authenticator apps for all critical accounts." },
  { k: ["dark web", "darknet", "tor", "hidden web"], a: "The **Dark Web** is a part of the internet only accessible through special software like Tor.\n\n**Risks:**\n- Stolen credentials and personal data are traded\n- Compromised credit cards are sold\n- Corporate data leaks are shared\n\n**Protection:**\n- Use VRIKAAN's **Dark Web Monitor** to check if your data has been exposed\n- Never reuse passwords\n- Monitor your credit reports\n- Enable fraud alerts with your bank\n\nVRIKAAN actively scans the dark web for your compromised information." },
  { k: ["firewall", "network security", "port", "intrusion"], a: "A **Firewall** monitors and controls incoming and outgoing network traffic based on security rules.\n\n**Types:**\n- **Network firewalls** — hardware/software at network perimeter\n- **Host-based firewalls** — on individual devices\n- **Next-gen firewalls (NGFW)** — deep packet inspection, IPS, application awareness\n\n**Best Practices:**\n- Enable your OS firewall (Windows Defender Firewall / iptables)\n- Block unnecessary inbound ports\n- Use **allow-list** approach (deny by default)\n- Log and monitor firewall events\n- Use VRIKAAN's **Vulnerability Scanner** to find open ports" },
  { k: ["zero trust", "zero-trust", "never trust"], a: "**Zero Trust** is a security model: \"Never trust, always verify.\"\n\n**Core Principles:**\n- **Verify explicitly** — always authenticate and authorize\n- **Least privilege access** — give minimum permissions needed\n- **Assume breach** — minimize blast radius, segment access\n\n**Implementation:**\n- Strong identity verification (MFA everywhere)\n- Micro-segmentation of networks\n- Continuous monitoring and validation\n- Encrypt all data in transit and at rest\n- Device health verification\n\nZero Trust is not a product — it's a strategy that VRIKAAN can help you implement." },
  { k: ["social engineering", "pretexting", "baiting", "tailgating"], a: "**Social Engineering** exploits human psychology rather than technical vulnerabilities.\n\n**Common Techniques:**\n- **Phishing** — fake emails/messages\n- **Pretexting** — creating a fabricated scenario\n- **Baiting** — offering something enticing (USB drives, free downloads)\n- **Tailgating** — following someone into a restricted area\n- **Quid pro quo** — offering a service in exchange for info\n\n**Defense:**\n- Verify identity before sharing information\n- Be skeptical of unsolicited contacts\n- Follow security policies strictly\n- Regular security awareness training" },
  { k: ["encryption", "encrypt", "aes", "rsa", "ssl", "tls", "https"], a: "**Encryption** converts data into unreadable code that only authorized parties can decrypt.\n\n**Types:**\n- **Symmetric** (AES-256) — same key encrypts/decrypts, fast\n- **Asymmetric** (RSA, ECC) — public/private key pair, used for key exchange\n- **TLS/SSL** — encrypts web traffic (look for HTTPS padlock)\n\n**Best Practices:**\n- Use **HTTPS** everywhere\n- Encrypt sensitive files and drives (BitLocker, FileVault)\n- Use **end-to-end encrypted** messaging (Signal)\n- Use VRIKAAN's **Vulnerability Scanner** to check TLS configuration" },
  { k: ["vrikaan", "platform", "features", "what can you do", "about"], a: "**VRIKAAN** is an AI-powered cyber defense platform headquartered in Nashik, India.\n\n**Founders:**\n- **Sahil Anil Nikam** — Founder & CEO · SOC Analyst & Cybersecurity Researcher\n- **Khushi Ishwar Raigade** — Co-Founder · SOC Analyst & Cybersecurity Researcher\n\n**Features (50+ tools):**\n- **Threat Map** — real-time global cyber threat visualization\n- **Wazuh-style SOC Dashboard** — MITRE ATT&CK heat-map, compliance posture\n- **Vulnerability Scanner** — 14 passive checks (TLS, headers, DNS, CVEs)\n- **Scam Check** — paste any SMS/email/WhatsApp, AI verdict\n- **Deepfake Audio Detector** — upload a call, AI flags vishing\n- **Fraud Analyzer · Security Score · Dark Web Monitor · Password Vault**\n- **Learn Academy** — cybersecurity courses with certificates\n- **AI Chatbot** — your personal security advisor (that's me!)\n\nStart exploring at vrikaan.com." },
  { k: ["founder", "founders", "ceo", "co-founder", "cofounder", "team", "leadership", "who built", "who made", "who created", "sahil", "khushi", "raigade", "nikam"], a: "**VRIKAAN was founded in 2024 by two people:**\n\n**Sahil Anil Nikam** — *Founder & CEO · SOC Analyst & Cybersecurity Researcher*\nDrives product architecture, engineering, AI integration, payments, and the full deployment pipeline. Pune-born full-stack developer, SOC analyst, and cybersecurity researcher.\n> *\"Cybersecurity shouldn't be a luxury — it should be a right available to every person on Earth.\"*\n\n**Khushi Ishwar Raigade** — *Co-Founder · SOC Analyst & Cybersecurity Researcher*\nLeads VRIKAAN's threat-intelligence pipeline, MITRE ATT&CK rule engineering, SIEM tuning, and incident-response playbooks.\n> *\"Detection beats reaction. A defender's job is to find the attacker before they find the data.\"*\n\nHeadquartered in Nashik, Maharashtra, India. Meet them at **vrikaan.com/founder**." },
  { k: ["hello", "hi", "hey", "good morning", "good evening", "greet"], a: "Hello! 👋 I'm your **VRIKAAN AI Assistant** — your personal cybersecurity advisor.\n\nI can help you with:\n- 🔒 Password security & best practices\n- 🎣 Phishing protection\n- 🛡️ Malware & ransomware defense\n- 🌐 VPN & network security\n- 🔐 Encryption & 2FA setup\n- 🕵️ Dark web monitoring\n- 📚 Security learning resources\n\nWhat would you like to know about cybersecurity?" },
  { k: ["sql injection", "sqli", "database attack", "injection attack"], a: "**SQL Injection** is a code injection technique that exploits vulnerabilities in web applications' database queries.\n\n**How it works:** Attackers insert malicious SQL code into input fields to manipulate the database.\n\n**Prevention:**\n- Use **parameterized queries** / prepared statements\n- Implement **input validation** and sanitization\n- Use **ORM** frameworks\n- Apply **least privilege** to database accounts\n- Enable **WAF** (Web Application Firewall)\n- Use VRIKAAN's **Vulnerability Scanner** to detect SQL injection flaws" },
  { k: ["ddos", "dos", "denial of service", "botnet"], a: "**DDoS (Distributed Denial of Service)** floods a target with traffic to overwhelm and take it offline.\n\n**Types:**\n- **Volumetric** — bandwidth flooding (UDP flood, DNS amplification)\n- **Protocol** — exploits network layer (SYN flood, Ping of Death)\n- **Application** — targets web apps (HTTP flood, Slowloris)\n\n**Protection:**\n- Use **CDN** services (Cloudflare, AWS Shield)\n- Implement **rate limiting**\n- Deploy **traffic analysis** and anomaly detection\n- Have a **DDoS response plan**\n- Use VRIKAAN's monitoring tools" },
  { k: ["incident response", "breach", "hacked", "compromised", "data breach"], a: "**If you've been hacked, act fast:**\n\n**Immediate Steps:**\n1. **Change all passwords** — start with email and banking\n2. **Enable 2FA** on all accounts\n3. **Check for unauthorized** transactions or logins\n4. **Scan devices** for malware\n5. **Notify** your bank and relevant services\n\n**Long-term:**\n- Monitor your credit reports\n- Use VRIKAAN's **Dark Web Monitor** to check for leaked data\n- Review connected apps and revoke suspicious access\n- Consider a credit freeze\n- Report to authorities (IC3, local law enforcement)" },
  { k: ["contact", "email", "reach you", "reach out", "get in touch", "support", "help me", "talk to", "speak to", "phone", "whatsapp"], a: "**Reach the right VRIKAAN inbox** (we reply within 7 days):\n\n- 💼 **hr.vrikaan@gmail.com** → Careers, internships, job applications, take-home submissions, interview logistics. Apply at **vrikaan.com/apply**\n- 🤖 **vrikaan.ai@gmail.com** → AI/ML feedback, bug reports, feature requests, API integration, partnership pitches around our AI stack\n- ✉️ **hello.vrikaan@gmail.com** → General support, press & media, billing, refunds, account help, anything else\n\n**Phone:** +91 8329935878  ·  **HQ:** Nashik, Maharashtra, India\n\nNot sure which inbox? Tell me what you're trying to do and I'll route you." },
  { k: ["career", "careers", "job", "jobs", "internship", "internships", "intern", "hiring", "apply", "vacancy", "vacancies", "opening", "openings", "hire me"], a: "**VRIKAAN is hiring!** Open roles + internships are listed at **vrikaan.com/careers** (short link: **vrikaan.com/apply**).\n\n**Current openings:**\n- 🔴 SOC Analyst Intern\n- Full-Stack Engineering Intern\n- AI / ML Intern\n- Content & Social Marketing Intern\n- Junior SOC Engineer (full-time)\n\n**To apply:** fill the Google Form on the careers page OR email **hr.vrikaan@gmail.com** (auto-CCs hello.vrikaan@gmail.com for tracking).\n\nWe respond to every application within 7 days, even with a no. Stipends, ESOPs, remote-by-default. Built and run by founders Sahil + Khushi." },
];

function getSmartResponse(message) {
  const lower = message.toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const keyword of entry.k) {
      if (lower.includes(keyword)) score += keyword.split(" ").length + 1;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  if (best) return best.a;
  // Generic helpful response for unmatched queries
  if (lower.includes("help") || lower.includes("what") || lower.includes("how"))
    return "Great question! I can help with many topics. Try asking about:\n\n- **Phishing** and email scams\n- **Password** security\n- **Ransomware** protection\n- **VPN** and network privacy\n- **Encryption** and 2FA\n- **Dark web** monitoring\n- **Social engineering** attacks\n\nJust type your question and I'll answer!";
  return "I'm your **VRIKAAN AI Assistant**! I can help with **cybersecurity, programming, science, math**, and more.\n\nJust type your question — I'm powered by real AI!";
}

// ─── Styles ───
const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)" };

export default function AIChatbot() {
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const pageMeta = getToolTier(location.pathname); // { tier, name }
  const quickReplies = getQuickRepliesForPath(location.pathname);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // chat | setup | credits
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [credits, setCredits] = useState(getRemainingCredits());
  const [creditData, setCreditData] = useState(getCredits());
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  // ── Voice (Web Speech API) ─────────────────────────────────────
  // Persisted lang lets HI users keep Hindi between sessions.
  const [voiceLang, setVoiceLang] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("vrikaan_voice_lang") || "en-IN") : "en-IN"
  );
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [voiceOutEnabled, setVoiceOutEnabled] = useState(
    typeof window !== "undefined" ? localStorage.getItem("vrikaan_voice_out") !== "false" : true
  );
  const recognitionRef = useRef(null);

  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechSupported = !!SR;
  const synthSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const startListening = () => {
    if (!SR) { setSpeechError("Voice input not supported in this browser. Use Chrome/Edge."); return; }
    setSpeechError("");
    const rec = new SR();
    rec.lang = voiceLang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = (e) => {
      setSpeechError(e.error === "not-allowed" ? "Microphone permission denied." : `Voice error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try { rec.start(); setListening(true); }
    catch (err) { setSpeechError("Could not start microphone."); }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  };

  // Speak the latest bot message when voiceOutEnabled
  const speakText = (text) => {
    if (!synthSupported || !voiceOutEnabled) return;
    // Strip markdown for TTS — punctuation hurts prosody
    const clean = String(text)
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/[*_`#>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ")
      .slice(0, 600);
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = voiceLang;
      u.rate = 1.0; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const toggleVoiceLang = () => {
    const next = voiceLang === "en-IN" ? "hi-IN" : "en-IN";
    setVoiceLang(next);
    if (typeof window !== "undefined") localStorage.setItem("vrikaan_voice_lang", next);
  };

  const toggleVoiceOut = () => {
    const next = !voiceOutEnabled;
    setVoiceOutEnabled(next);
    if (typeof window !== "undefined") localStorage.setItem("vrikaan_voice_out", String(next));
    if (!next && synthSupported) window.speechSynthesis.cancel();
  };

  // Sync auth user into credit system
  useEffect(() => {
    setCurrentUser(user || null);
  }, [user]);

  // Initial credits load
  useEffect(() => {
    setCredits(getRemainingCredits());
    setCreditData(getCredits());
  }, []);

  // React to login/logout — refresh credits & sync plan
  useEffect(() => {
    setCurrentUser(user || null);
    const data = getCredits();
    setCredits(getRemainingCredits());
    setCreditData(data);
  }, [user]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const loggedIn = isUserLoggedIn();
      const plan = getUserPlan();
      const planCredits = PLANS[plan]?.credits;
      const creditText = planCredits === Infinity ? "**Unlimited** credits" : `**${planCredits} ${PLANS[plan]?.daily ? "daily" : ""} credits**`;
      setMessages([{
        role: "bot",
        text: loggedIn
          ? `Welcome! I'm your **VRIKAAN AI Assistant** — powered by real AI. You have ${creditText} on your **${PLANS[plan]?.name}** plan. Ask me anything! 🚀`
          : `Hi! I'm **VRIKAAN AI Assistant** — powered by real AI. You have **25 guest credits**. **Log in** to get **50 daily credits** and unlock more! Ask me anything!`,
        time: new Date(),
      }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, typing]);

  const refreshCredits = () => {
    setCredits(getRemainingCredits());
    setCreditData(getCredits());
  };

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput("");

    // Check credits
    if (!useCredit()) {
      const loggedIn = isUserLoggedIn();
      const plan = getUserPlan();
      const planCredits = PLANS[plan]?.credits || 25;
      if (!loggedIn) {
        setMessages(p => [...p, { role: "user", text: msg, time: new Date() }, {
          role: "bot", text: "You've used all your **25 guest credits** for today! 🔒\n\n**Log in or sign up** to get **50 daily credits** — that's 2x more!", time: new Date(), isError: true, showLogin: true,
        }]);
      } else {
        setMessages(p => [...p, { role: "user", text: msg, time: new Date() }, {
          role: "bot", text: `You've used all your **${planCredits} ${PLANS[plan]?.name || "Free"} credits**! ${PLANS[plan]?.daily ? "Wait until tomorrow for credits to reset, or u" : "U"}pgrade your plan for more credits.`, time: new Date(), isError: true,
        }]);
      }
      refreshCredits();
      return;
    }

    setMessages(p => [...p, { role: "user", text: msg, time: new Date() }]);
    refreshCredits();
    setTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const response = await askAI(msg, history, {
      path: location.pathname,
      toolName: pageMeta.name,
      toolTier: pageMeta.tier,
      userPlan: user?.plan || "guest",
      loggedIn: !!user,
    });
    setTyping(false);

    if (response === "ERROR_QUOTA") {
      const fallback = getSmartResponse(msg);
      const fullText = fallback + "\n\n*⚡ High traffic — using offline knowledge. Try again in a few seconds for full AI.*";
      setMessages(p => [...p, { role: "bot", text: fullText, time: new Date() }]);
      speakText(fallback);
      return;
    }

    setMessages(p => [...p, { role: "bot", text: response, time: new Date() }]);
    speakText(response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, typing, messages, voiceOutEnabled, voiceLang]);

  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleUpgrade = (plan) => {
    const loggedIn = !!user;
    // Guest users must log in first
    if (!loggedIn) {
      setMessages(p => [...p, { role: "bot", text: "You need to **log in or sign up** first before upgrading your plan! 🔒", time: new Date(), isError: true, showLogin: true }]);
      setView("chat");
      return;
    }
    // Free logged-in users — show paywall
    setSelectedPlan(plan);
    setShowPaywall(true);
  };

  const confirmPurchase = () => {
    if (!selectedPlan) return;
    // Simulate purchase (in production, integrate Razorpay/Stripe here)
    upgradePlan(selectedPlan);
    refreshCredits();
    setShowPaywall(false);
    setSelectedPlan(null);
    setView("chat");
    setMessages(p => [...p, { role: "bot", text: `🎉 Payment successful! Upgraded to **${PLANS[selectedPlan].name}** plan. You now have **${PLANS[selectedPlan].credits === Infinity ? "Unlimited" : PLANS[selectedPlan].credits} credits**. Enjoy!`, time: new Date() }]);
  };

  // ─── Format markdown-like text ───
  const formatText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#14e3c5">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.2);padding:1px 5px;border-radius:3px;font-family:JetBrains Mono,monospace;font-size:12px">$1</code>')
      .replace(/^- (.*)/gm, '&bull; $1')
      .replace(/\n/g, "<br/>");
  };

  const quickActions = [
    "How do I protect against phishing?",
    "Generate a strong password strategy",
    "What is ransomware and how to prevent it?",
    "Explain zero-trust security",
  ];

  // ─── Render ───
  if (!open) {
    return (
      <div onClick={() => setOpen(true)} style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999, width: 62, height: 62,
        borderRadius: "50%", cursor: "pointer",
        background: "linear-gradient(135deg, #6366f1, #14e3c5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 24px rgba(99,102,241,0.4), 0 0 0 3px rgba(99,102,241,0.15)",
        animation: "chatPulse 2s ease-in-out infinite",
        transition: "transform 0.2s",
      }}>
        <style>{`
          @keyframes chatPulse { 0%,100% { box-shadow: 0 4px 24px rgba(99,102,241,0.4); } 50% { box-shadow: 0 4px 32px rgba(20,227,197,0.6), 0 0 0 6px rgba(20,227,197,0.1); } }
          @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes dotBounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        `}</style>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 5.92 2 10.5c0 2.5 1.34 4.74 3.44 6.3L4 22l4.66-2.34C9.72 19.88 10.84 20 12 20c5.52 0 10-3.42 10-7.5S17.52 2 12 2z"/>
          <circle cx="8" cy="10.5" r="1" fill="#fff"/><circle cx="12" cy="10.5" r="1" fill="#fff"/><circle cx="16" cy="10.5" r="1" fill="#fff"/>
        </svg>
        {/* AI badge */}
        <div style={{ position: "absolute", top: -4, right: -4, background: "#22c55e", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", border: "2px solid #030712" }}>AI</div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      width: 400, height: 580,
      background: T.dark, borderRadius: 16,
      border: `1px solid rgba(99,102,241,0.2)`,
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
      display: "flex", flexDirection: "column",
      animation: "slideUp 0.3s ease",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${T.border}`,
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,227,197,0.05))",
      }}>
        <img src="/wolf-mark.png?v=2" alt="VRIKAAN" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>VRIKAAN AI</div>
          <div style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green }} />
            Powered by VRIKAAN AI
          </div>
        </div>
        {/* Credits badge */}
        <div onClick={() => setView(view === "credits" ? "chat" : "credits")} style={{
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
          background: credits <= 3 ? "rgba(239,68,68,0.15)" : "rgba(20,227,197,0.1)",
          color: credits <= 3 ? T.red : T.cyan, border: `1px solid ${credits <= 3 ? "rgba(239,68,68,0.3)" : "rgba(20,227,197,0.2)"}`,
        }}>
          {credits === Infinity ? "∞" : credits} credits
        </div>
        {/* Settings */}
        <div onClick={() => setView(view === "setup" ? "chat" : "setup")} style={{ cursor: "pointer", fontSize: 18, color: T.muted, padding: 4 }}>⚙️</div>
        {/* Close */}
        <div onClick={() => setOpen(false)} style={{ cursor: "pointer", fontSize: 20, color: T.muted, padding: 4, lineHeight: 1 }}>&times;</div>
      </div>

      {/* ─── Setup View ─── */}
      {view === "setup" && (
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Settings</h3>

          <div style={{ background: "rgba(34,197,94,0.06)", border: `1px solid rgba(34,197,94,0.15)`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>AI is Active</span>
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
              VRIKAAN AI is powered and ready. No setup needed — just ask anything!
            </div>
          </div>

          <div style={{ background: "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 6 }}>Your Plan Credits</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
              <strong style={{ color: T.white }}>{PLANS[getUserPlan()]?.name}</strong> plan — <strong style={{ color: T.cyan }}>{credits === Infinity ? "Unlimited" : credits}</strong> credits remaining<br/>
              {PLANS[getUserPlan()]?.daily ? "Credits reset daily at midnight" : "Credits reset on subscription renewal"}
            </div>
          </div>

          <div style={{ marginTop: 8, padding: 12, background: "rgba(20,227,197,0.06)", borderRadius: 8, border: `1px solid rgba(20,227,197,0.15)` }}>
            <div style={{ fontSize: 11, color: T.cyan, fontWeight: 700 }}>Privacy & Security</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.6 }}>
              All conversations are private. AI responses are routed through VRIKAAN's secure server — your data is never sent to third parties from your browser.
            </div>
          </div>
        </div>
      )}

      {/* ─── Credits View ─── */}
      {view === "credits" && (
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 16 }}>AI Credits</h3>

          {/* Current usage */}
          <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: T.muted }}>Current Plan</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: PLANS[creditData.plan]?.color || T.muted }}>{PLANS[creditData.plan]?.name || "Free"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: T.muted }}>Credits Remaining</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: credits <= 3 ? T.red : T.cyan }}>{credits === Infinity ? "Unlimited" : credits}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(148,163,184,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, (credits / (PLANS[creditData.plan]?.credits || 20)) * 100)}%`, background: "linear-gradient(90deg, #6366f1, #14e3c5)", transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
              {(creditData.plan === "free" || creditData.plan === "guest") ? "Resets daily at midnight" : "Resets on subscription renewal"}
              {" · "}{creditData.totalUsed || 0} total messages sent
            </div>
          </div>

          {/* Login prompt for guests */}
          {creditData.plan === "guest" && (
            <div style={{ background: "rgba(20,227,197,0.08)", border: `1px solid rgba(20,227,197,0.2)`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.cyan, marginBottom: 6 }}>🔓 Log in for more credits!</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 10 }}>
                Guest: <strong style={{ color: T.white }}>25 credits/day</strong><br/>
                Logged in: <strong style={{ color: T.cyan }}>50 credits/day</strong> (2x more!)
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { navigate("/login"); setOpen(false); }} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #6366f1, #14e3c5)", color: "#fff", fontSize: 12, fontWeight: 700,
                }}>Log In</button>
                <button onClick={() => { navigate("/signup"); setOpen(false); }} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                  border: `1px solid rgba(99,102,241,0.3)`, background: "rgba(99,102,241,0.1)",
                  color: T.accent, fontSize: 12, fontWeight: 700,
                }}>Sign Up</button>
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 12 }}>
            {isUserLoggedIn() ? "Upgrade Plan" : "Subscription Plans"}
          </div>
          {Object.entries(PLANS).filter(([k]) => k !== "guest" && k !== "free" && k !== "unlimited").map(([key, plan]) => {
            const isCurrent = creditData.plan === key;
            return (
              <div key={key} onClick={() => handleUpgrade(key)} style={{
                padding: 14, borderRadius: 10, marginBottom: 10, cursor: "pointer",
                background: isCurrent ? "rgba(99,102,241,0.1)" : "rgba(3,7,18,0.4)",
                border: `1px solid ${isCurrent ? "rgba(99,102,241,0.3)" : T.border}`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: plan.color }}>{plan.name}</span>
                    <span style={{ fontSize: 12, color: T.muted, marginLeft: 8 }}>{plan.credits === Infinity ? "Unlimited" : plan.credits} credits</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{plan.price}</span>
                </div>
                {isCurrent
                  ? <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>✓ Current plan</div>
                  : <div style={{ fontSize: 11, color: T.accent, marginTop: 4 }}>Buy now →</div>
                }
              </div>
            );
          })}

          {/* Free tier info */}
          <div style={{ background: "rgba(148,163,184,0.04)", borderRadius: 8, padding: 12, marginTop: 4, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>Free Tier</span>
                <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{isUserLoggedIn() ? (PLANS[getUserPlan()]?.credits === Infinity ? "Unlimited" : PLANS[getUserPlan()]?.credits) : "25"} credits{PLANS[getUserPlan()]?.daily ? "/day" : ""}</span>
              </div>
              <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{(creditData.plan === "free" || creditData.plan === "guest") ? "✓ Active" : ""}</span>
            </div>
          </div>

          <div style={{ fontSize: 11, color: T.muted, marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
            Guest: 25/day · Logged in: 50/day · Resets at midnight<br/>
            Paid plans give more credits instantly
          </div>
        </div>
      )}

      {/* ─── Chat View ─── */}
      {view === "chat" && (
        <>
          {/* Messages */}
          <div ref={msgsRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
                {/* Avatar */}
                {m.role === "bot" && (
                  <img src="/wolf-mark.png?v=2" alt="VRIKAAN" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
                )}
                {m.role === "user" && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.accent, flexShrink: 0 }}>U</div>
                )}
                {/* Bubble */}
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
                  background: m.role === "user" ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.1))" : m.isError ? "rgba(239,68,68,0.08)" : "rgba(148,163,184,0.06)",
                  border: `1px solid ${m.role === "user" ? "rgba(99,102,241,0.2)" : m.isError ? "rgba(239,68,68,0.2)" : T.border}`,
                }}>
                  <div style={{ fontSize: 13, color: m.isError ? T.red : T.white, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                  {/* Login/Signup buttons when guest credits exhausted */}
                  {m.showLogin && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => { navigate("/login"); setOpen(false); }} style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #6366f1, #14e3c5)", color: "#fff",
                        fontSize: 12, fontWeight: 700,
                      }}>Log In</button>
                      <button onClick={() => { navigate("/signup"); setOpen(false); }} style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                        border: `1px solid rgba(99,102,241,0.3)`, background: "rgba(99,102,241,0.1)",
                        color: T.accent, fontSize: 12, fontWeight: 700,
                      }}>Sign Up</button>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                    {m.time ? new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <img src="/wolf-mark.png?v=2" alt="VRIKAAN" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(148,163,184,0.06)", border: `1px solid ${T.border}`, display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions (show when only welcome message) */}
            {messages.length <= 1 && !typing && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {quickActions.map((q, i) => (
                  <button key={i} onClick={() => { setInput(q); setTimeout(() => { setInput(q); }, 50); }} style={{
                    padding: "7px 12px", borderRadius: 20, border: `1px solid rgba(99,102,241,0.2)`,
                    background: "rgba(99,102,241,0.06)", color: T.accent, fontSize: 11, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s",
                  }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice controls row (when supported) */}
          {(speechSupported || synthSupported) && (
            <div style={{ padding: "6px 14px 0", display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
              {/* Language toggle */}
              <button
                onClick={toggleVoiceLang}
                title={`Voice language: ${voiceLang === "hi-IN" ? "Hindi" : "English"}. Click to switch.`}
                style={{
                  padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: voiceLang === "hi-IN" ? "rgba(99,102,241,0.18)" : "rgba(20,227,197,0.15)",
                  border: `1px solid ${voiceLang === "hi-IN" ? T.accent : T.cyan}40`,
                  color: voiceLang === "hi-IN" ? T.accent : T.cyan,
                  cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                }}
              >{voiceLang === "hi-IN" ? "हि" : "EN"}</button>
              {/* Speaker toggle (text-to-speech on/off) */}
              {synthSupported && (
                <button
                  onClick={toggleVoiceOut}
                  title={voiceOutEnabled ? "Mute bot voice" : "Unmute bot voice"}
                  style={{
                    width: 26, height: 22, borderRadius: 6, border: "none",
                    background: voiceOutEnabled ? "rgba(20,227,197,0.15)" : "rgba(148,163,184,0.08)",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={voiceOutEnabled ? T.cyan : T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    {voiceOutEnabled
                      ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
                      : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                    }
                  </svg>
                </button>
              )}
            </div>
          )}
          {speechError && (
            <div style={{ padding: "0 14px", fontSize: 11, color: T.red }}>{speechError}</div>
          )}

          {/* Page-aware quick-reply chips */}
          {quickReplies.length > 0 && messages.length < 3 && (
            <div style={{
              padding: "8px 14px 4px",
              borderTop: `1px solid ${T.border}`,
              display: "flex", gap: 6, flexWrap: "wrap",
              background: "rgba(20,227,197,0.04)",
            }}>
              <div style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                color: T.cyan, textTransform: "uppercase",
                width: "100%", marginBottom: 4,
              }}>💡 Suggested for {pageMeta.name || "this page"}</div>
              {quickReplies.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 10); }} style={{
                  padding: "5px 10px", borderRadius: 999,
                  background: "rgba(20,227,197,0.08)",
                  border: `1px solid ${T.cyan}33`,
                  color: T.cyan, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans'",
                  whiteSpace: "nowrap",
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center" }}>
            {speechSupported && (
              <button
                onClick={listening ? stopListening : startListening}
                title={listening ? "Stop listening" : `Speak (${voiceLang === "hi-IN" ? "Hindi" : "English"})`}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                  background: listening ? `linear-gradient(135deg, ${T.red}, #f97316)` : "rgba(20,227,197,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: listening ? "vrikaan-pulse 1.2s infinite" : "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={listening ? "#fff" : T.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={voiceLang === "hi-IN" ? "कुछ भी पूछें..." : "Ask me anything..."}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
                background: "rgba(3,7,18,0.6)", color: T.white, fontSize: 13,
                fontFamily: "'Plus Jakarta Sans'", outline: "none",
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || typing} style={{
              width: 38, height: 38, borderRadius: 10, border: "none", cursor: input.trim() && !typing ? "pointer" : "default",
              background: input.trim() && !typing ? "linear-gradient(135deg, #6366f1, #14e3c5)" : "rgba(148,163,184,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing ? "#fff" : "#475569"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* ─── Paywall / Purchase Confirmation Overlay ─── */}
      {showPaywall && selectedPlan && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "rgba(3,7,18,0.92)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, borderRadius: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💎</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 4 }}>
            Upgrade to {PLANS[selectedPlan]?.name}
          </h3>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.cyan, marginBottom: 4 }}>
            {PLANS[selectedPlan]?.price}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 20, textAlign: "center" }}>
            {PLANS[selectedPlan]?.credits === Infinity ? "Unlimited" : PLANS[selectedPlan]?.credits} AI credits
            {PLANS[selectedPlan]?.daily ? " per day" : " per month"}
          </div>

          {/* Features */}
          <div style={{ width: "100%", marginBottom: 20 }}>
            {[
              "Real AI responses on any topic",
              selectedPlan === "unlimited" ? "No credit limits ever" : `${PLANS[selectedPlan]?.credits} credits per month`,
              "Priority response speed",
              "Chat history saved",
              selectedPlan === "pro" || selectedPlan === "unlimited" ? "Advanced cybersecurity analysis" : "Standard cybersecurity help",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                <span style={{ color: T.green, fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 12, color: T.white }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Buy button */}
          <button onClick={confirmPurchase} style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #6366f1, #14e3c5)", color: "#fff",
            fontSize: 14, fontWeight: 800, marginBottom: 10,
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
          }}>
            Buy Now — {PLANS[selectedPlan]?.price}
          </button>

          <button onClick={() => { setShowPaywall(false); setSelectedPlan(null); }} style={{
            width: "100%", padding: "10px 0", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${T.border}`, background: "transparent",
            color: T.muted, fontSize: 12,
          }}>
            Cancel
          </button>

          <div style={{ fontSize: 10, color: T.muted, marginTop: 12, textAlign: "center" }}>
            🔒 Secure payment · Cancel anytime · Instant activation
          </div>
        </div>
      )}
    </div>
  );
}
