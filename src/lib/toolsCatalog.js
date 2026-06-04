// Single source of truth for the tools menu — shared by Navbar dropdown and
// the /tools catalog page. Labels keep an emoji prefix (Navbar strips it at
// render; the Tools page strips it too and shows a Lucide icon via ToolIcon).
export const toolsMenu = [
  { label: "Security Tools", items: [
    { to: "/scam-dna", label: "🧬 Scam DNA", desc: "Live community scam check · NEW" },
    { to: "/scambait", label: "🎭 AI Scambaiter", desc: "Waste scammers' time · NEW" },
    { to: "/scam-recovery", label: "🚨 Scam Recovery", desc: "Just got scammed? Help now" },
    { to: "/safe-word", label: "🛡️ Family Safe-Word", desc: "Beat AI voice clones" },
    { to: "/whatsapp-audit", label: "💬 WhatsApp Audit", desc: "Detect scam groups" },
    { to: "/receipt-audit", label: "🧾 Receipt Audit", desc: "Catch fake bills" },
    { to: "/desktop", label: "💻 Desktop App", desc: "Native scan · waitlist" },
    { to: "/enterprise", label: "🏛 Enterprise SOC", desc: "₹50k-50L/mo · MITRE · DPDP" },
    { to: "/otp-decay", label: "🚨 OTP Emergency", desc: "Shared OTP? Act in 90s" },
    { to: "/stolen-phone", label: "📱 Stolen Phone", desc: "7-step recovery flow" },
    { to: "/upi-lookup", label: "🔍 UPI Lookup", desc: "Check ID before pay" },
    { to: "/loan-app-check", label: "💸 Loan App Check", desc: "RBI registered?" },
    { to: "/voiceprint", label: "🎙 Voiceprint Vault", desc: "Record real voice" },
    { to: "/device-scan", label: "🛡️ Device Scanner", desc: "Scan files / folders / USB" },
    { to: "/aadhaar-mask", label: "🪪 Aadhaar Mask", desc: "Redact Aadhaar before share" },
    { to: "/festival-fraud", label: "📅 Festival Fraud", desc: "Diwali/Holi scam alerts" },
    { to: "/threat-map", label: "🌍 Threat Map", desc: "Real-time global threats" },
    { to: "/fraud-analyzer", label: "🔍 Fraud Analyzer", desc: "AI scam detection" },
    { to: "/security-score", label: "📊 Security Score", desc: "Check your security" },
    { to: "/vulnerability-scanner", label: "🛡️ Vulnerability Scanner", desc: "Scan websites" },
    { to: "/dark-web-monitor", label: "🕵️ Dark Web Monitor", desc: "Check data leaks" },
    { to: "/security-audit", label: "🔒 Security Audit", desc: "One-click full audit" },
    { to: "/security-headers", label: "🛡 Security Headers", desc: "Scan HTTP headers" },
    { to: "/file-hash-scanner", label: "🧬 File Hash Scanner", desc: "Check file for malware" },
  ]},
  { label: "Privacy & More", items: [
    { to: "/password-vault", label: "🔐 Password Vault", desc: "Generate & manage" },
    { to: "/email-analyzer", label: "📧 Email Analyzer", desc: "Detect spoofing" },
    { to: "/ip-lookup", label: "🌐 IP Lookup", desc: "Geolocation & threat" },
    { to: "/qr-scanner", label: "📱 QR Scanner", desc: "Scan & generate QR" },
    { to: "/security-checklist", label: "✅ Security Checklist", desc: "Personal audit" },
    { to: "/whois-lookup", label: "🔎 WHOIS Lookup", desc: "Domain registration" },
    { to: "/dns-leak-test", label: "🌊 DNS Leak Test", desc: "Check IP & DNS leaks" },
    { to: "/browser-fingerprint", label: "🖥️ Browser Fingerprint", desc: "Test browser privacy" },
  ]},
  { label: "Learn & Earn", items: [
    { to: "/phishing-trainer", label: "🎣 Phishing Trainer", desc: "Spot phishing URLs" },
    { to: "/2fa-guide", label: "🔑 2FA Setup Guide", desc: "Secure your accounts" },
    { to: "/password-checker", label: "🔓 Password Checker", desc: "Test password strength" },
    { to: "/identity-xray", label: "🔬 Identity X-Ray", desc: "Digital footprint scan" },
    { to: "/referral", label: "🎁 Refer & Earn", desc: "Invite friends, earn rewards" },
  ]},
];

// Strip a leading emoji (+ optional variation selector + space) from a label.
export const stripEmoji = (s) =>
  s.replace(/^(?:[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}️⃣]+\s*)/u, "");
