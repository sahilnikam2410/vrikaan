import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", green: "#22c55e", pink: "#ec4899", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  btn: (bg, clr) => ({ padding: "10px 20px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s" }),
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
};

const Badge = ({ children, color }) => (
  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{children}</span>
);

// ─── Course Data ───
const courses = [
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
    instructor: "SECUVION Academy",
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
    instructor: "SECUVION Academy",
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
    instructor: "SECUVION Academy",
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
    instructor: "SECUVION Academy",
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
    instructor: "SECUVION Academy",
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
    instructor: "SECUVION Academy",
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
const STORAGE_KEY = "secuvion_learn_progress";

function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCertificates() {
  try { return JSON.parse(localStorage.getItem("secuvion_certificates")) || []; } catch { return []; }
}

function saveCertificate(cert) {
  const certs = getCertificates();
  if (!certs.find(c => c.courseId === cert.courseId)) {
    certs.push(cert);
    localStorage.setItem("secuvion_certificates", JSON.stringify(certs));
  }
}

// ─── Certificate Generator ───
function generateCertificate(courseName, userName) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0a0f1e";
  ctx.fillRect(0, 0, 1200, 850);

  // Border gradient
  const borderGrad = ctx.createLinearGradient(0, 0, 1200, 850);
  borderGrad.addColorStop(0, "#6366f1");
  borderGrad.addColorStop(1, "#14e3c5");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 1160, 810);

  // Inner border
  ctx.strokeStyle = "rgba(148,163,184,0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 770);

  // Corner decorations
  const corners = [[50, 50], [1140, 50], [50, 790], [1140, 790]];
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#14e3c5";
    ctx.fill();
  });

  // SECUVION logo text
  ctx.font = "bold 22px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.textAlign = "center";
  ctx.fillText("SECUVION", 600, 100);

  // Academy subtitle
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("AI-POWERED CYBER DEFENSE ACADEMY", 600, 122);

  // Certificate of Completion
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.letterSpacing = "8px";
  ctx.fillText("CERTIFICATE OF COMPLETION", 600, 190);

  // Decorative line
  const lineGrad = ctx.createLinearGradient(300, 210, 900, 210);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, "#6366f1");
  lineGrad.addColorStop(0.8, "#14e3c5");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 210);
  ctx.lineTo(900, 210);
  ctx.stroke();

  // "This certifies that"
  ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("This is to certify that", 600, 270);

  // Name
  ctx.font = "bold 42px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(userName || "Student", 600, 330);

  // Underline name
  const nameWidth = ctx.measureText(userName || "Student").width;
  ctx.strokeStyle = "rgba(99,102,241,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(600 - nameWidth / 2 - 20, 345);
  ctx.lineTo(600 + nameWidth / 2 + 20, 345);
  ctx.stroke();

  // "has successfully completed"
  ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("has successfully completed the course", 600, 400);

  // Course name
  ctx.font = "bold 28px 'Space Grotesk', sans-serif";
  const courseGrad = ctx.createLinearGradient(350, 440, 850, 440);
  courseGrad.addColorStop(0, "#6366f1");
  courseGrad.addColorStop(1, "#14e3c5");
  ctx.fillStyle = courseGrad;
  ctx.fillText(courseName, 600, 450);

  // Date
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Issued on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 600, 510);

  // Certificate ID
  const certId = `SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`Certificate ID: ${certId}`, 600, 545);

  // Signature lines
  ctx.strokeStyle = "rgba(148,163,184,0.15)";
  ctx.lineWidth = 1;
  // Left signature
  ctx.beginPath(); ctx.moveTo(220, 680); ctx.lineTo(440, 680); ctx.stroke();
  ctx.font = "italic 18px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.fillText("Sahil Anil Nikam", 330, 670);
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Founder, SECUVION", 330, 700);

  // Right signature
  ctx.beginPath(); ctx.moveTo(760, 680); ctx.lineTo(980, 680); ctx.stroke();
  ctx.font = "italic 18px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("SECUVION Academy", 870, 670);
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Education Division", 870, 700);

  // Verification footer
  ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Verify this certificate at secuvion.onrender.com/verify", 600, 780);

  // Shield watermark
  ctx.globalAlpha = 0.03;
  ctx.font = "bold 300px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#14e3c5";
  ctx.fillText("S", 600, 550);
  ctx.globalAlpha = 1;

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
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Space Grotesk'", marginBottom: 6, textAlign: "center" }}>Opening YouTube...</div>
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
      <div style={{ position: "relative", fontSize: 17, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Space Grotesk'", marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div style={{ position: "relative", fontSize: 13, color: "#94a3b8", marginBottom: 16, textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>{lessonDesc}</div>
      <div style={{ position: "relative", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ padding: "10px 24px", background: "linear-gradient(135deg, #ef4444, #dc2626)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk'", display: "flex", alignItems: "center", gap: 8 }}>
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
    a.download = `SECUVION_Certificate_${activeCourse.title.replace(/\s+/g, "_")}.png`;
    a.click();
    saveCertificate({ courseId: activeCourse.id, name: certName, date: new Date().toISOString(), course: activeCourse.title });
  };

  // ─── Course Catalog View ───
  const renderCatalog = () => (
    <>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>SECUVION ACADEMY</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          Learn Cybersecurity. <span style={{ background: "linear-gradient(135deg, #6366f1, #14e3c5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get Certified.</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          Professional cybersecurity courses with video lessons, hands-on quizzes, and verifiable certificates upon completion.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 40, flexWrap: "wrap" }}>
        {[
          { label: "Courses", value: courses.length },
          { label: "Video Lessons", value: courses.reduce((a, c) => a + c.chapters.length, 0) },
          { label: "Students Enrolled", value: "45K+" },
          { label: "Certificates Issued", value: getCertificates().length || "∞" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.cyan, fontFamily: "'Space Grotesk'" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs: Courses / Knowledge Base / My Certificates */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32 }}>
        {[
          { label: "Courses", v: "catalog" },
          { label: "Knowledge Base", v: "knowledge" },
          { label: "My Certificates", v: "mycerts" },
        ].map(tab => (
          <button key={tab.v} onClick={() => setView(tab.v)} style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans'",
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
              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans'",
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
              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>{c.title}</h3>
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
              <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>{c.icon} {c.title}</h1>
              <p style={{ fontSize: 14, color: T.muted, maxWidth: 600 }}>{c.desc}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: T.muted }}>{c.students.toLocaleString()} students</div>
              <div style={{ fontSize: 12, color: T.muted }}>{c.lessons} lessons · {c.duration}</div>
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
            <div style={{ ...sty.card, padding: 0, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
                <VideoPlayer title={ch.title} lessonDesc={ch.desc} duration={ch.duration} />
              </div>
            </div>
            <div style={sty.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Lesson {activeLesson + 1} of {c.chapters.length}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{ch.title}</h2>
                </div>
                <span style={{ fontSize: 12, color: T.mutedDark }}>{ch.duration}</span>
              </div>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>{ch.desc}</p>
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
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk'" }}>Course Content</h3>
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Final Quiz: {c.title}</h1>
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
                    fontFamily: "'Plus Jakarta Sans'", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
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
            <div style={{ fontSize: 48, fontWeight: 800, color: passed ? T.green : T.red, fontFamily: "'Space Grotesk'" }}>{score}/{total}</div>
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Claim Your Certificate</h1>
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
              onClick={() => {
                if (!certName.trim()) return;
                const img = generateCertificate(activeCourse.title, certName.trim());
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
              <img ref={certRef} src={certImage} alt="Certificate" style={{ width: "100%", maxWidth: 800, borderRadius: 8 }} />
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
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>My Certificates</h2>
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
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{cert.course}</h3>
                      <div style={{ fontSize: 12, color: T.muted }}>Issued to: {cert.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.mutedDark, marginBottom: 12 }}>
                    Completed on {new Date(cert.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  <button onClick={() => {
                    setActiveCourse(course);
                    setCertName(cert.name);
                    const img = generateCertificate(cert.course, cert.name);
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
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>Knowledge Base</h2>
          <p style={{ fontSize: 14, color: T.muted }}>Quick, practical guides to protect yourself online.</p>
        </div>

        {/* Tabs back */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
          {[
            { label: "Courses", v: "catalog" },
            { label: "Knowledge Base", v: "knowledge" },
            { label: "My Certificates", v: "mycerts" },
          ].map(tab => (
            <button key={tab.v} onClick={() => setView(tab.v)} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans'",
              background: view === tab.v ? `${T.accent}15` : "transparent",
              border: `1px solid ${view === tab.v ? T.accent + "30" : T.border}`,
              color: view === tab.v ? T.accent : T.muted,
            }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          {kbTags.map(t => (
            <button key={t} onClick={() => setKbFilter(t)} style={{ padding: "8px 18px", borderRadius: 100, fontFamily: "'Plus Jakarta Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer", background: kbFilter === t ? `${T.accent}15` : "rgba(148,163,184,0.04)", border: `1px solid ${kbFilter === t ? T.accent + "30" : T.border}`, color: kbFilter === t ? T.accent : T.mutedDark }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {kbFiltered.map(m => (
            <div key={m.id} style={{ background: T.card, border: `1px solid ${kbActive === m.id ? m.color + "20" : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setKbActive(kbActive === m.id ? null : m.id)}>
              <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ padding: "4px 10px", borderRadius: 6, background: `${m.color}0a`, border: `1px solid ${m.color}15`, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: 1, flexShrink: 0 }}>{m.tag}</span>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0, flex: 1 }}>{m.title}</h3>
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
  const renderView = () => {
    switch (view) {
      case "catalog": return renderCatalog();
      case "course": return renderCourse();
      case "quiz": return renderQuiz();
      case "certificate": return renderCertificate();
      case "mycerts": return renderMyCerts();
      case "knowledge": return renderKnowledge();
      default: return renderCatalog();
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
