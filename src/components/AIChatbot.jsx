import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ─── Credit System (login-aware) ───
const PLANS = {
  guest:     { name: "Guest",     credits: 25,       daily: true,  price: null,       color: "#64748b" },
  free:      { name: "Free",      credits: 50,       daily: true,  price: "Free",     color: "#94a3b8" },
  starter:   { name: "Starter",   credits: 200,      daily: false, price: "$4.99/mo", color: "#22c55e" },
  pro:       { name: "Pro",       credits: 1000,     daily: false, price: "$9.99/mo", color: "#6366f1" },
  unlimited: { name: "Unlimited", credits: Infinity,  daily: false, price: "$19.99/mo", color: "#14e3c5" },
};

function isUserLoggedIn() {
  try { return !!JSON.parse(localStorage.getItem("secuvion_session")); } catch { return false; }
}

function getCredits() {
  const loggedIn = isUserLoggedIn();
  const data = JSON.parse(localStorage.getItem("secuvion_ai_credits") || "null");
  const today = new Date().toDateString();
  const basePlan = loggedIn ? "free" : "guest";
  const baseCredits = PLANS[basePlan].credits;

  // Reset daily for guest/free, or if no data exists
  if (!data || ((data.plan === "free" || data.plan === "guest") && data.resetDate !== today)) {
    const d = { plan: basePlan, credits: baseCredits, used: 0, resetDate: today, totalUsed: data?.totalUsed || 0 };
    localStorage.setItem("secuvion_ai_credits", JSON.stringify(d));
    return d;
  }

  // User just logged in but was on guest plan — upgrade to free
  if (loggedIn && data.plan === "guest") {
    data.plan = "free";
    data.credits = PLANS.free.credits;
    // Keep used count but give them the higher limit
    localStorage.setItem("secuvion_ai_credits", JSON.stringify(data));
  }

  // User logged out but was on free plan — downgrade to guest
  if (!loggedIn && data.plan === "free") {
    data.plan = "guest";
    localStorage.setItem("secuvion_ai_credits", JSON.stringify(data));
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
  localStorage.setItem("secuvion_ai_credits", JSON.stringify(data));
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
  localStorage.setItem("secuvion_ai_credits", JSON.stringify(data));
}

// ─── AI Engine (Groq — free, fast, answers everything like ChatGPT) ───
const SYSTEM_PROMPT = `You are SECUVION AI Assistant — a highly intelligent AI assistant built into the SECUVION cyber defense platform. You are like ChatGPT — you can answer ANY question on ANY topic.

Your personality:
- Friendly, professional, helpful, and knowledgeable
- You answer ALL questions — cybersecurity, programming, science, math, history, general knowledge, coding, writing, creative tasks, etc.
- Keep responses clear and well-formatted
- Use **bold**, *italic*, bullet points, and code blocks when helpful
- Keep responses concise (2-4 paragraphs) unless the user asks for detail
- For code questions, provide working code examples
- For cybersecurity questions, give actionable security advice

About SECUVION:
- AI-powered cyber defense platform
- Features: Threat Map, Fraud Analyzer, Security Score, Dark Web Monitor, Password Vault, Vulnerability Scanner, Learn Academy, Blog
- Founded by Sahil Anil Nikam
- Website: secuvion.com

You are powered by SECUVION AI. Be the most helpful assistant possible.`;

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
let chatHistory = [];

function initAI(apiKey) {
  try {
    chatHistory = [];
    localStorage.setItem("secuvion_ai_key", apiKey);
    return true;
  } catch { return false; }
}

async function askAI(message, apiKey) {
  if (!apiKey) return null;
  chatHistory.push({ role: "user", content: message });
  // Keep last 20 messages for context
  if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatHistory,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("SECUVION AI Error:", res.status, err);
      if (res.status === 401) return "ERROR_API_KEY";
      if (res.status === 429) return "ERROR_QUOTA";
      return "I'm experiencing a temporary issue. Please try again in a moment.";
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again!";
    chatHistory.push({ role: "assistant", content: reply });
    return reply;
  } catch (e) {
    console.error("SECUVION AI Error:", e.message);
    if (e.message?.includes("fetch") || e.message?.includes("network")) return "Network error — check your internet connection and try again.";
    return "I'm experiencing a temporary issue. Please try again in a moment.";
  }
}

// ─── Built-in Knowledge Base (works without API) ───
const KB = [
  { k: ["phishing", "phish", "fake email", "scam email"], a: "**Phishing** is a social engineering attack where attackers impersonate trusted entities to steal sensitive data.\n\n**How to protect yourself:**\n- Never click links in unexpected emails — hover to check the real URL\n- Look for misspellings, urgency, or generic greetings (\"Dear Customer\")\n- Enable **2-Factor Authentication (2FA)** on all accounts\n- Use SECUVION's **Fraud Analyzer** to scan suspicious messages\n- Report phishing emails to your IT department or email provider\n\nRemember: legitimate companies never ask for passwords via email." },
  { k: ["password", "strong password", "password security", "password manager"], a: "**Strong Password Best Practices:**\n\n- Use **12+ characters** with uppercase, lowercase, numbers & symbols\n- Never reuse passwords across sites\n- Use a **password manager** (like SECUVION's Password Vault)\n- Enable **2FA/MFA** wherever available\n- Avoid personal info (birthdays, names, pet names)\n- Consider using **passphrases** — e.g., \"Coffee!Mountain#Sunset42\"\n\nCheck your password strength using SECUVION's **Password Vault** tool!" },
  { k: ["ransomware", "ransom", "encrypt files", "locked files"], a: "**Ransomware** is malware that encrypts your files and demands payment for the decryption key.\n\n**Prevention:**\n- Keep regular **offline backups** (3-2-1 rule)\n- Keep OS and software **updated**\n- Don't open suspicious email attachments\n- Use reputable **antivirus/EDR** solutions\n- Disable **macros** in Office documents from unknown sources\n- Use network **segmentation** to limit spread\n\n**If infected:** Don't pay the ransom — contact cybersecurity professionals and law enforcement." },
  { k: ["malware", "virus", "trojan", "worm", "spyware"], a: "**Malware** is malicious software designed to damage, disrupt, or gain unauthorized access.\n\n**Types:**\n- **Virus** — attaches to files, spreads when executed\n- **Trojan** — disguised as legitimate software\n- **Worm** — self-replicating, spreads across networks\n- **Spyware** — monitors your activity secretly\n- **Adware** — displays unwanted advertisements\n\n**Protection:**\n- Install reputable antivirus software\n- Keep your system updated\n- Download only from trusted sources\n- Scan files before opening them" },
  { k: ["vpn", "virtual private network", "privacy", "anonymous"], a: "**VPN (Virtual Private Network)** encrypts your internet traffic and masks your IP address.\n\n**Benefits:**\n- Encrypts data on public WiFi\n- Hides your browsing from ISPs\n- Bypasses geo-restrictions\n- Protects against man-in-the-middle attacks\n\n**Choose a VPN that:**\n- Has a **no-logs policy**\n- Uses **AES-256 encryption**\n- Offers a **kill switch**\n- Has servers in multiple countries\n\nNote: VPNs don't make you completely anonymous — combine with good security practices." },
  { k: ["2fa", "two factor", "mfa", "multi factor", "authenticator"], a: "**Two-Factor Authentication (2FA)** adds an extra layer of security beyond just a password.\n\n**Types (from most to least secure):**\n1. **Hardware keys** (YubiKey, FIDO2) — best protection\n2. **Authenticator apps** (Google Authenticator, Authy)\n3. **Push notifications** (Duo, Microsoft)\n4. **SMS codes** — better than nothing, but vulnerable to SIM swapping\n\n**Enable 2FA on:** Email, banking, social media, cloud storage, and any account with sensitive data.\n\nSECUVION recommends using authenticator apps for all critical accounts." },
  { k: ["dark web", "darknet", "tor", "hidden web"], a: "The **Dark Web** is a part of the internet only accessible through special software like Tor.\n\n**Risks:**\n- Stolen credentials and personal data are traded\n- Compromised credit cards are sold\n- Corporate data leaks are shared\n\n**Protection:**\n- Use SECUVION's **Dark Web Monitor** to check if your data has been exposed\n- Never reuse passwords\n- Monitor your credit reports\n- Enable fraud alerts with your bank\n\nSECUVION actively scans the dark web for your compromised information." },
  { k: ["firewall", "network security", "port", "intrusion"], a: "A **Firewall** monitors and controls incoming and outgoing network traffic based on security rules.\n\n**Types:**\n- **Network firewalls** — hardware/software at network perimeter\n- **Host-based firewalls** — on individual devices\n- **Next-gen firewalls (NGFW)** — deep packet inspection, IPS, application awareness\n\n**Best Practices:**\n- Enable your OS firewall (Windows Defender Firewall / iptables)\n- Block unnecessary inbound ports\n- Use **allow-list** approach (deny by default)\n- Log and monitor firewall events\n- Use SECUVION's **Vulnerability Scanner** to find open ports" },
  { k: ["zero trust", "zero-trust", "never trust"], a: "**Zero Trust** is a security model: \"Never trust, always verify.\"\n\n**Core Principles:**\n- **Verify explicitly** — always authenticate and authorize\n- **Least privilege access** — give minimum permissions needed\n- **Assume breach** — minimize blast radius, segment access\n\n**Implementation:**\n- Strong identity verification (MFA everywhere)\n- Micro-segmentation of networks\n- Continuous monitoring and validation\n- Encrypt all data in transit and at rest\n- Device health verification\n\nZero Trust is not a product — it's a strategy that SECUVION can help you implement." },
  { k: ["social engineering", "pretexting", "baiting", "tailgating"], a: "**Social Engineering** exploits human psychology rather than technical vulnerabilities.\n\n**Common Techniques:**\n- **Phishing** — fake emails/messages\n- **Pretexting** — creating a fabricated scenario\n- **Baiting** — offering something enticing (USB drives, free downloads)\n- **Tailgating** — following someone into a restricted area\n- **Quid pro quo** — offering a service in exchange for info\n\n**Defense:**\n- Verify identity before sharing information\n- Be skeptical of unsolicited contacts\n- Follow security policies strictly\n- Regular security awareness training" },
  { k: ["encryption", "encrypt", "aes", "rsa", "ssl", "tls", "https"], a: "**Encryption** converts data into unreadable code that only authorized parties can decrypt.\n\n**Types:**\n- **Symmetric** (AES-256) — same key encrypts/decrypts, fast\n- **Asymmetric** (RSA, ECC) — public/private key pair, used for key exchange\n- **TLS/SSL** — encrypts web traffic (look for HTTPS padlock)\n\n**Best Practices:**\n- Use **HTTPS** everywhere\n- Encrypt sensitive files and drives (BitLocker, FileVault)\n- Use **end-to-end encrypted** messaging (Signal)\n- Use SECUVION's **Vulnerability Scanner** to check TLS configuration" },
  { k: ["secuvion", "platform", "features", "what can you do", "about"], a: "**SECUVION** is an AI-powered cyber defense platform founded by **Sahil Anil Nikam**.\n\n**Our Features:**\n- **Threat Map** — real-time global cyber threat visualization\n- **Fraud Analyzer** — AI-powered scam detection\n- **Security Score** — assess your digital security posture\n- **Dark Web Monitor** — check if your data is compromised\n- **Password Vault** — generate & manage strong passwords\n- **Vulnerability Scanner** — scan websites for security issues\n- **Learn Academy** — cybersecurity courses with certificates\n- **AI Chatbot** — your personal security advisor (that's me!)\n\nStart exploring at secuvion.com!" },
  { k: ["hello", "hi", "hey", "good morning", "good evening", "greet"], a: "Hello! 👋 I'm your **SECUVION AI Assistant** — your personal cybersecurity advisor.\n\nI can help you with:\n- 🔒 Password security & best practices\n- 🎣 Phishing protection\n- 🛡️ Malware & ransomware defense\n- 🌐 VPN & network security\n- 🔐 Encryption & 2FA setup\n- 🕵️ Dark web monitoring\n- 📚 Security learning resources\n\nWhat would you like to know about cybersecurity?" },
  { k: ["sql injection", "sqli", "database attack", "injection attack"], a: "**SQL Injection** is a code injection technique that exploits vulnerabilities in web applications' database queries.\n\n**How it works:** Attackers insert malicious SQL code into input fields to manipulate the database.\n\n**Prevention:**\n- Use **parameterized queries** / prepared statements\n- Implement **input validation** and sanitization\n- Use **ORM** frameworks\n- Apply **least privilege** to database accounts\n- Enable **WAF** (Web Application Firewall)\n- Use SECUVION's **Vulnerability Scanner** to detect SQL injection flaws" },
  { k: ["ddos", "dos", "denial of service", "botnet"], a: "**DDoS (Distributed Denial of Service)** floods a target with traffic to overwhelm and take it offline.\n\n**Types:**\n- **Volumetric** — bandwidth flooding (UDP flood, DNS amplification)\n- **Protocol** — exploits network layer (SYN flood, Ping of Death)\n- **Application** — targets web apps (HTTP flood, Slowloris)\n\n**Protection:**\n- Use **CDN** services (Cloudflare, AWS Shield)\n- Implement **rate limiting**\n- Deploy **traffic analysis** and anomaly detection\n- Have a **DDoS response plan**\n- Use SECUVION's monitoring tools" },
  { k: ["incident response", "breach", "hacked", "compromised", "data breach"], a: "**If you've been hacked, act fast:**\n\n**Immediate Steps:**\n1. **Change all passwords** — start with email and banking\n2. **Enable 2FA** on all accounts\n3. **Check for unauthorized** transactions or logins\n4. **Scan devices** for malware\n5. **Notify** your bank and relevant services\n\n**Long-term:**\n- Monitor your credit reports\n- Use SECUVION's **Dark Web Monitor** to check for leaked data\n- Review connected apps and revoke suspicious access\n- Consider a credit freeze\n- Report to authorities (IC3, local law enforcement)" },
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
    return "Great question! I can help with many topics. Try asking about:\n\n- **Phishing** and email scams\n- **Password** security\n- **Ransomware** protection\n- **VPN** and network privacy\n- **Encryption** and 2FA\n- **Dark web** monitoring\n- **Social engineering** attacks\n\nOr connect a **Groq API key** (⚙️) for full AI-powered responses on any topic!";
  return "I'm your AI assistant! I can help with topics like **phishing, passwords, malware, VPNs, encryption, dark web safety**, and more.\n\nTry asking something specific, or connect a **Groq API key** (⚙️ icon) for full AI-powered conversations!";
}

// ─── Styles ───
const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)" };

export default function AIChatbot() {
  const { user } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // chat | setup | credits
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [credits, setCredits] = useState(getRemainingCredits());
  const [creditData, setCreditData] = useState(getCredits());
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  // Load saved API key
  useEffect(() => {
    const saved = localStorage.getItem("secuvion_ai_key");
    if (saved) {
      setApiKey(saved);
      initAI(saved);
      setConnected(true);
    }
    setCredits(getRemainingCredits());
    setCreditData(getCredits());
  }, []);

  // React to login/logout — refresh credits
  useEffect(() => {
    const data = getCredits();
    setCredits(getRemainingCredits());
    setCreditData(data);
  }, [user]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const saved = localStorage.getItem("secuvion_ai_key");
      const loggedIn = isUserLoggedIn();
      setMessages([{
        role: "bot",
        text: saved
          ? `Welcome back! I'm your **SECUVION AI Assistant** powered by real AI. ${loggedIn ? "You have **50 daily credits**" : "You have **25 guest credits** — log in for 50!"}. Ask me anything! 🚀`
          : `Hi! I'm **SECUVION AI Assistant**. ${loggedIn ? "You get **50 free credits daily**!" : "You get **25 guest credits** — **log in** for 50 daily!"} Set up your free API key (⚙️) for full AI responses!`,
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
      const noCreditsMsg = loggedIn
        ? "You've used all your **50 daily credits**! Upgrade your plan for more, or wait until tomorrow for credits to reset."
        : "You've used all your **25 guest credits**! **Log in or sign up** to get **50 daily credits**, or upgrade your plan for even more.";
      setMessages(p => [...p, { role: "user", text: msg, time: new Date() }, {
        role: "bot", text: noCreditsMsg, time: new Date(), isError: true,
      }]);
      refreshCredits();
      return;
    }

    setMessages(p => [...p, { role: "user", text: msg, time: new Date() }]);
    refreshCredits();
    setTyping(true);

    if (connected && apiKey) {
      // Real AI — answers everything like ChatGPT
      const response = await askAI(msg, apiKey);
      setTyping(false);

      if (response === "ERROR_API_KEY") {
        setMessages(p => [...p, { role: "bot", text: "Your API key seems invalid. Please update it in Settings (⚙️).", time: new Date(), isError: true }]);
        return;
      }
      if (response === "ERROR_QUOTA") {
        // Fallback to knowledge base on rate limit
        const fallback = getSmartResponse(msg);
        setMessages(p => [...p, { role: "bot", text: fallback + "\n\n*⚡ Rate limit hit — using offline knowledge. Try again in a few seconds for full AI.*", time: new Date() }]);
        return;
      }

      setMessages(p => [...p, { role: "bot", text: response, time: new Date() }]);
      return;
    }

    // No API key — use built-in knowledge base
    setTimeout(() => {
      const smartReply = getSmartResponse(msg);
      setMessages(p => [...p, { role: "bot", text: smartReply, time: new Date() }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  }, [input, typing, connected]);

  const handleKeySetup = async () => {
    if (!keyInput.trim()) return;
    // Validate key with a quick test call
    setTyping(true);
    try {
      const testRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keyInput.trim()}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: "Say OK" }], max_tokens: 5 }),
      });
      setTyping(false);
      if (testRes.ok) {
        initAI(keyInput.trim());
        setApiKey(keyInput.trim());
        setConnected(true);
        setView("chat");
        setMessages(p => [...p, { role: "bot", text: "API key connected successfully! 🎉 I'm now powered by **real AI** — ask me **anything** on any topic, just like ChatGPT!", time: new Date() }]);
      } else {
        setMessages(p => [...p, { role: "bot", text: "Invalid API key. Please check and try again. Get a free key from **console.groq.com**", time: new Date(), isError: true }]);
      }
    } catch {
      setTyping(false);
      setMessages(p => [...p, { role: "bot", text: "Connection failed. Check your internet and try again.", time: new Date(), isError: true }]);
    }
  };

  const handleUpgrade = (plan) => {
    upgradePlan(plan);
    refreshCredits();
    setView("chat");
    setMessages(p => [...p, { role: "bot", text: `Upgraded to **${PLANS[plan].name}** plan! You now have **${PLANS[plan].credits} credits**. Enjoy!`, time: new Date() }]);
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
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #14e3c5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>S</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>SECUVION AI</div>
          <div style={{ fontSize: 11, color: connected ? T.green : T.muted, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? T.green : T.muted }} />
            {connected ? "Powered by SECUVION AI" : "Setup required"}
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>API Key Setup</h3>
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>
            Get your <strong style={{ color: T.cyan }}>free</strong> Groq API key to unlock real AI that answers <strong style={{ color: T.white }}>everything</strong> — like ChatGPT!
          </p>

          <div style={{ background: "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 8 }}>How to get your free key (30 seconds):</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
              1. Go to <strong style={{ color: T.white }}>console.groq.com</strong><br/>
              2. Sign up free (Google/GitHub login)<br/>
              3. Go to <strong style={{ color: T.white }}>API Keys</strong> in sidebar<br/>
              4. Click <strong style={{ color: T.white }}>"Create API Key"</strong><br/>
              5. Copy and paste it below
            </div>
          </div>

          <div style={{ background: "rgba(20,227,197,0.06)", border: `1px solid rgba(20,227,197,0.15)`, borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 11, color: T.cyan }}>
            ⚡ Groq is <strong>100% free</strong> — 14,400 requests/day, no credit card needed!
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Paste your Groq API key..."
              type="password"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: "rgba(3,7,18,0.6)", color: T.white, fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace", outline: "none",
              }}
            />
            <button onClick={handleKeySetup} style={{
              padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #6366f1, #14e3c5)", color: "#fff",
              fontSize: 13, fontWeight: 700,
            }}>Connect</button>
          </div>

          {connected && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.green, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} /> Connected — AI is active
            </div>
          )}

          {connected && (
            <button onClick={() => {
              localStorage.removeItem("secuvion_ai_key");
              setApiKey(""); setConnected(false); chatHistory = [];
              setView("chat");
            }} style={{
              padding: "8px 14px", borderRadius: 8, border: `1px solid rgba(239,68,68,0.3)`,
              background: "rgba(239,68,68,0.1)", color: T.red, fontSize: 12, cursor: "pointer",
            }}>Disconnect API Key</button>
          )}

          <div style={{ marginTop: 20, padding: 12, background: "rgba(20,227,197,0.06)", borderRadius: 8, border: `1px solid rgba(20,227,197,0.15)` }}>
            <div style={{ fontSize: 11, color: T.cyan, fontWeight: 700 }}>Your data is safe</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.6 }}>
              API key is stored locally on your device only. We never send it to our servers. All conversations are private and secure.
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
              <div style={{ fontSize: 13, fontWeight: 700, color: T.cyan, marginBottom: 4 }}>🔓 Log in for more credits!</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                Guest: <strong style={{ color: T.white }}>25 credits/day</strong><br/>
                Logged in: <strong style={{ color: T.cyan }}>50 credits/day</strong> (2x more!)
              </div>
            </div>
          )}

          {/* Plans */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginBottom: 12 }}>Upgrade Plan</div>
          {Object.entries(PLANS).filter(([k]) => k !== "guest").map(([key, plan]) => (
            <div key={key} onClick={() => key === "free" ? null : handleUpgrade(key)} style={{
              padding: 14, borderRadius: 10, marginBottom: 10, cursor: key === "free" ? "default" : "pointer",
              background: creditData.plan === key ? "rgba(99,102,241,0.1)" : "rgba(3,7,18,0.4)",
              border: `1px solid ${creditData.plan === key ? "rgba(99,102,241,0.3)" : T.border}`,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: plan.color }}>{plan.name}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 8 }}>{plan.credits === Infinity ? "Unlimited" : plan.credits} credits{plan.daily ? "/day" : ""}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{plan.price || "Login required"}</span>
              </div>
              {creditData.plan === key && <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>Current plan</div>}
            </div>
          ))}

          <div style={{ fontSize: 11, color: T.muted, marginTop: 8, textAlign: "center" }}>
            Guest: 25/day · Free (logged in): 50/day · Resets automatically
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
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #14e3c5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>S</div>
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
                  <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                    {m.time ? new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #14e3c5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>S</div>
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

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={connected ? "Ask me anything..." : "Set up free API key for AI responses..."}
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
    </div>
  );
}
