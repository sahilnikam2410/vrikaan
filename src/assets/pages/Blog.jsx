import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

export const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", ember: "#f97316", red: "#ef4444", gold: "#eab308", purple: "#a78bfa", blue: "#38bdf8", green: "#22c55e", pink: "#ec4899", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827" };

export const categoryColors = {
  News: T.blue,
  Tutorials: T.cyan,
  Tips: T.green,
  Threats: T.red,
  Industry: T.purple,
};

export const categoryGradients = {
  News: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%, #1e40af 100%)",
  Tutorials: "linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #14532d 100%)",
  Tips: "linear-gradient(135deg, #1a2e05 0%, #0f172a 60%, #166534 100%)",
  Threats: "linear-gradient(135deg, #450a0a 0%, #0f172a 60%, #7f1d1d 100%)",
  Industry: "linear-gradient(135deg, #2e1065 0%, #0f172a 60%, #4c1d95 100%)",
};

// URL-safe slug from title
export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Lookup helpers used by Blog list + BlogPost detail page
export const getArticleBySlug = (slug) => articles.find((a) => slugify(a.title) === slug);
export const getRelatedArticles = (article, limit = 3) =>
  articles
    .filter((a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, limit);

const tags = ["Encryption", "Phishing", "Malware", "Privacy", "AI", "Cloud", "IoT", "Zero Trust", "Ransomware", "VPN", "Firewall", "SIEM", "SOC", "Pentesting", "OSINT", "MFA", "DDoS", "Blockchain"];

export const authors = [
  { name: "Sarah Chen", initials: "SC", color: T.cyan, bio: "Senior cybersecurity analyst with 10+ years of experience in threat intelligence and incident response. Former SOC lead at a Fortune 500 company." },
  { name: "Marcus Webb", initials: "MW", color: T.accent, bio: "Ethical hacker and penetration tester. OSCP and CEH certified. Passionate about making security accessible to everyone." },
  { name: "Aisha Patel", initials: "AP", color: T.pink, bio: "Privacy advocate and compliance specialist. Helps startups navigate GDPR, CCPA, and emerging data protection regulations worldwide." },
  { name: "James O'Brien", initials: "JO", color: T.ember, bio: "Cloud security architect and DevSecOps evangelist. Writes about securing modern infrastructure and CI/CD pipelines." },
  { name: "Lena Novak", initials: "LN", color: T.green, bio: "Malware researcher and reverse engineer. Tracks advanced persistent threats and publishes detailed technical analyses." },
  { name: "David Kim", initials: "DK", color: T.gold, bio: "AI security researcher focused on adversarial machine learning and the intersection of artificial intelligence and cybersecurity." },
];

export const articles = [
  {
    id: 1,
    title: "How to Detect Phishing Emails in 2026",
    category: "Tips",
    readTime: "5 min read",
    date: "Mar 25, 2026",
    author: authors[0],
    excerpt: "Phishing attacks have evolved dramatically. Learn the latest techniques to spot even the most convincing fraudulent emails before they compromise your data.",
    likes: 234,
    comments: 42,
    tags: ["Phishing", "Privacy", "MFA"],
    content: [
      { heading: "The Evolution of Phishing", text: "Phishing emails in 2026 are nothing like the poorly written Nigerian prince scams of the past. Modern attackers leverage AI-generated content that mimics corporate communication with terrifying accuracy. They use deepfake audio and video in spear-phishing campaigns, making it nearly impossible to distinguish legitimate requests from fraudulent ones based on content alone. The FBI reported a 300% increase in AI-assisted phishing attempts in the last year alone." },
      { heading: "Red Flags to Watch For", text: "Despite their sophistication, phishing emails still leave telltale signs. Look for subtle domain misspellings (like 'rnicrosoft.com' instead of 'microsoft.com'), unexpected urgency in requests, and links that redirect through multiple URLs. Always hover over links before clicking — your email client should show the actual destination. Be especially wary of emails requesting credential changes, payment modifications, or sensitive data exports, even if they appear to come from your CEO." },
      { heading: "Technical Defenses", text: "Enable DMARC, DKIM, and SPF on your organization's email domain to prevent spoofing. Use email security gateways with AI-powered analysis that can detect anomalies in sender behavior, language patterns, and attachment signatures. Consider implementing a zero-trust email policy where external links are automatically sandboxed and attachments are detonated in isolated environments before delivery." },
      { heading: "Building a Human Firewall", text: "Technology alone cannot stop phishing — your people are your last line of defense. Conduct regular phishing simulations using realistic scenarios. Create a no-blame reporting culture where employees feel comfortable flagging suspicious emails. Implement a simple one-click reporting button in your email client. Studies show organizations with monthly phishing awareness training reduce successful attacks by up to 75%." },
    ],
  },
  {
    id: 2,
    title: "The Rise of AI-Powered Cyber Attacks",
    category: "News",
    readTime: "8 min read",
    date: "Mar 23, 2026",
    author: authors[5],
    excerpt: "Artificial intelligence is being weaponized by threat actors at an unprecedented scale. A deep dive into the new threat landscape shaped by machine learning.",
    likes: 512,
    comments: 89,
    featured: true,
    tags: ["AI", "Malware", "SIEM"],
    content: [
      { heading: "AI as a Weapon", text: "The cybersecurity landscape has fundamentally shifted with the weaponization of artificial intelligence. Threat actors are now using large language models to generate polymorphic malware that rewrites its own code to evade signature-based detection. AI-powered botnets can coordinate attacks with unprecedented sophistication, adapting their strategies in real-time based on defender responses. In Q1 2026 alone, AI-generated malware variants increased by 450% compared to the same period last year." },
      { heading: "Deepfake Social Engineering", text: "Perhaps the most alarming development is the use of deepfake technology in social engineering attacks. Attackers can now generate convincing video calls impersonating executives, clone voices from a few seconds of audio, and create entirely synthetic personas with realistic social media histories. A recent attack on a European bank used a deepfake video call of the CFO to authorize a $35 million transfer — the entire interaction was AI-generated in real-time." },
      { heading: "Automated Vulnerability Discovery", text: "AI systems are now capable of discovering zero-day vulnerabilities at machine speed. Fuzzing tools enhanced with reinforcement learning can explore attack surfaces orders of magnitude faster than traditional approaches. While security researchers also benefit from these tools, the asymmetry between defense and offense means attackers often find and exploit vulnerabilities before patches can be developed and deployed." },
      { heading: "Defending Against AI Threats", text: "Combating AI-powered attacks requires AI-powered defenses. Organizations must invest in behavioral analysis systems that can detect anomalies regardless of how convincing the attack appears. Implementing continuous authentication, microsegmentation, and zero-trust architectures reduces the blast radius of successful attacks. Most importantly, security teams need to embrace AI as a tool — those who don't will find themselves outpaced by adversaries who do." },
    ],
  },
  {
    id: 3,
    title: "Complete Guide to Setting Up 2FA",
    category: "Tutorials",
    readTime: "12 min read",
    date: "Mar 21, 2026",
    author: authors[1],
    excerpt: "Step-by-step instructions for implementing two-factor authentication across all your accounts. From authenticator apps to hardware keys.",
    likes: 389,
    comments: 67,
    tags: ["MFA", "Privacy", "Encryption"],
    content: [
      { heading: "Why 2FA Matters More Than Ever", text: "With credential stuffing attacks becoming increasingly automated and password databases being breached regularly, a strong password alone is no longer sufficient. Two-factor authentication adds a critical second layer of security that stops 99.9% of automated attacks according to Microsoft's research. Yet only 28% of users have enabled 2FA on their accounts. This guide will walk you through setting it up everywhere that matters." },
      { heading: "Choosing Your 2FA Method", text: "Not all 2FA methods are created equal. SMS-based codes are the weakest option due to SIM-swapping attacks but are still better than nothing. Authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator generate time-based one-time passwords (TOTP) locally on your device, making them much harder to intercept. Hardware security keys like YubiKey provide the strongest protection — they use cryptographic protocols that are virtually immune to phishing." },
      { heading: "Setting Up Authenticator Apps", text: "Download your preferred authenticator app from the official app store. Navigate to the security settings of each account you want to protect. Select 'Enable 2FA' or 'Two-Step Verification' and choose the authenticator app option. Scan the QR code displayed with your app. Enter the generated code to verify the setup. Critical step: save the backup codes provided in a secure location like a password manager or a physical safe. Losing access to your authenticator without backup codes can lock you out permanently." },
      { heading: "Hardware Keys and Passkeys", text: "For maximum security, invest in at least two FIDO2/WebAuthn hardware keys. Register both with your critical accounts — keep one on your keychain and store the backup in a secure location. Many services now support passkeys, which combine the security of hardware keys with the convenience of biometrics. Enable passkeys where available, but maintain a hardware key as a fallback. For enterprise environments, consider mandating hardware keys for all privileged accounts." },
    ],
  },
  {
    id: 4,
    title: "Top 10 Password Managers Compared",
    category: "Tips",
    readTime: "7 min read",
    date: "Mar 19, 2026",
    author: authors[2],
    excerpt: "An honest comparison of the most popular password managers in 2026, including security audits, pricing, and features that actually matter.",
    likes: 445,
    comments: 93,
    tags: ["Encryption", "Privacy", "MFA"],
    content: [
      { heading: "Why You Need a Password Manager", text: "The average person has 100+ online accounts, each ideally requiring a unique, complex password. Without a password manager, most people reuse passwords or create weak variations. A password manager generates, stores, and auto-fills strong unique passwords for every account. After the LastPass breach in 2022, the industry implemented stronger encryption standards — modern password managers now use zero-knowledge architectures where even the provider cannot access your vault." },
      { heading: "Security-First Picks", text: "Bitwarden remains the top recommendation for its open-source transparency and third-party security audits. 1Password excels with its Watchtower feature that monitors for breached credentials and vulnerable passwords. KeePassXC offers local-only storage for those who don't trust cloud sync. For enterprise, Dashlane's business tier provides excellent admin controls and SCIM provisioning. Each of these has passed independent security audits in 2025-2026." },
      { heading: "Features That Matter", text: "Beyond basic password storage, look for: breach monitoring that alerts you when credentials appear in data leaks, secure sharing for family or team credentials, passkey support for passwordless authentication, travel mode that hides sensitive vaults when crossing borders, and emergency access for trusted contacts. Cross-platform sync is essential — your manager should work seamlessly across desktop, mobile, and browser extensions." },
      { heading: "Our Verdict", text: "For individuals, Bitwarden's free tier offers everything most people need. For families, 1Password's family plan provides the best balance of features and usability. For enterprises, Dashlane or 1Password Business offer comprehensive admin controls. Regardless of your choice, any password manager is infinitely better than reusing passwords. The best password manager is the one you'll actually use consistently." },
    ],
  },
  {
    id: 5,
    title: "Ransomware Attacks Hit Record High in Q1 2026",
    category: "News",
    readTime: "6 min read",
    date: "Mar 17, 2026",
    author: authors[4],
    excerpt: "New data reveals ransomware incidents surged 180% in the first quarter of 2026, with healthcare and education sectors bearing the brunt of attacks.",
    likes: 678,
    comments: 112,
    tags: ["Ransomware", "Malware", "SIEM"],
    content: [
      { heading: "The Numbers Are Alarming", text: "Cybersecurity firms tracking ransomware activity have recorded over 2,400 confirmed attacks in Q1 2026 alone — a 180% increase over the same period in 2025. The average ransom demand has risen to $2.7 million, with total losses including downtime and recovery costs averaging $8.1 million per incident. Healthcare organizations accounted for 23% of victims, followed by education at 18% and manufacturing at 15%." },
      { heading: "New Tactics and Groups", text: "Several new ransomware groups have emerged, deploying increasingly sophisticated tactics. Double and triple extortion — encrypting data, threatening to leak it, and attacking the victim's customers — has become standard practice. The most concerning trend is the rise of 'ransomware-as-a-service' platforms that lower the barrier to entry, allowing less technical criminals to launch devastating attacks using pre-built toolkits with profit-sharing arrangements." },
      { heading: "Critical Infrastructure Under Siege", text: "Attacks on critical infrastructure have escalated dramatically. Water treatment facilities, power grids, and transportation systems have all been targeted. The convergence of IT and OT networks has expanded the attack surface, and many industrial control systems were never designed with modern cybersecurity in mind. Governments worldwide are scrambling to implement mandatory security standards for critical infrastructure operators." },
      { heading: "Prevention and Response", text: "Organizations must adopt a 'when, not if' mindset toward ransomware. Essential measures include: maintaining offline, immutable backups tested regularly; implementing network segmentation to contain lateral movement; deploying endpoint detection and response (EDR) on all systems; keeping all software patched within 48 hours of critical updates; and having a tested incident response plan. The FBI continues to advise against paying ransoms, as payment funds further criminal activity and doesn't guarantee data recovery." },
    ],
  },
  {
    id: 6,
    title: "Understanding Zero-Day Vulnerabilities",
    category: "Threats",
    readTime: "10 min read",
    date: "Mar 15, 2026",
    author: authors[4],
    excerpt: "What makes zero-day exploits so dangerous and how organizations can build resilient defenses even against unknown threats.",
    likes: 321,
    comments: 54,
    tags: ["Malware", "Firewall", "SOC"],
    content: [
      { heading: "What Is a Zero-Day?", text: "A zero-day vulnerability is a software flaw unknown to the vendor and for which no patch exists. The term 'zero-day' refers to the fact that developers have had zero days to fix the issue before it's exploited. These vulnerabilities are the most prized assets in the cyber underground — a single zero-day for a major operating system can sell for $500,000 to $2.5 million on the black market. Nation-states and advanced persistent threat (APT) groups stockpile these exploits for strategic use." },
      { heading: "The Zero-Day Lifecycle", text: "A zero-day follows a predictable lifecycle: discovery by a researcher or attacker, weaponization into an exploit, initial deployment against targets, detection by security researchers, public disclosure, and finally patch development and deployment. The critical window between exploitation and patching — the 'exposure window' — averages 21 days for critical vulnerabilities, though some remain unpatched for months. During this window, organizations are essentially defenseless against targeted attacks." },
      { heading: "Recent Notable Zero-Days", text: "2025-2026 has seen several devastating zero-day campaigns. A chain of three zero-days in a popular enterprise VPN appliance allowed attackers to establish persistent access to thousands of corporate networks. A mobile OS zero-day enabled silent installation of surveillance spyware on journalists' devices. A zero-day in a widely-used open-source library affected millions of applications simultaneously, highlighting the risks of software supply chain dependencies." },
      { heading: "Defense in Depth", text: "While you cannot patch what you don't know about, you can make zero-day exploitation significantly harder and limit its impact. Implement application allowlisting to prevent unauthorized code execution. Use exploit mitigation technologies like ASLR, DEP, and Control Flow Guard. Deploy network microsegmentation to contain breaches. Monitor for anomalous behavior rather than known signatures. Maintain comprehensive logging and invest in threat hunting capabilities. The goal is not to prevent every zero-day but to detect and contain exploitation quickly." },
    ],
  },
  {
    id: 7,
    title: "Building a Home Network Security Lab",
    category: "Tutorials",
    readTime: "15 min read",
    date: "Mar 13, 2026",
    author: authors[1],
    excerpt: "A practical guide to setting up your own cybersecurity lab at home using affordable hardware and free tools for hands-on learning.",
    likes: 567,
    comments: 78,
    tags: ["Firewall", "VPN", "Pentesting"],
    content: [
      { heading: "Why Build a Home Lab?", text: "Hands-on practice is the fastest path to cybersecurity expertise, and a home lab gives you a safe environment to experiment without legal or ethical concerns. You can practice penetration testing, malware analysis, network forensics, and incident response at your own pace. Many hiring managers specifically ask about lab experience during interviews. The good news is that you don't need expensive equipment — a decent home lab can be built for under $300, or even free using virtualization on existing hardware." },
      { heading: "Hardware and Virtualization Setup", text: "Start with a machine that has at least 16GB RAM and a multi-core processor. Install a Type 1 hypervisor like Proxmox VE (free) or use VirtualBox/VMware on your existing OS. Create isolated virtual networks using VLANs or virtual switches. A basic lab needs: an attacker machine (Kali Linux), several vulnerable target machines (Metasploitable, DVWA, HackTheBox machines), a firewall/router VM (pfSense), and a Windows domain controller. Use snapshots liberally so you can quickly reset after experiments." },
      { heading: "Essential Free Tools", text: "Your lab toolkit should include: Wireshark for packet analysis, Nmap for network discovery, Burp Suite Community for web application testing, Metasploit Framework for exploitation, Splunk Free for log analysis, Security Onion for network security monitoring, and YARA for malware identification rules. For practice, use platforms like TryHackMe, HackTheBox, and OverTheWire wargames — these provide structured challenges that build skills progressively from beginner to advanced." },
      { heading: "Lab Projects to Get Started", text: "Begin with these projects: (1) Set up Active Directory and practice common attacks like Pass-the-Hash and Kerberoasting, (2) Deploy a vulnerable web application and practice OWASP Top 10 attacks, (3) Capture and analyze network traffic from simulated malware, (4) Build a SIEM stack and create detection rules for common attack patterns, (5) Practice incident response by investigating pre-built forensic images. Document everything in a blog or GitHub repository — this becomes your portfolio for job applications." },
    ],
  },
  {
    id: 8,
    title: "Social Engineering: The Human Factor",
    category: "Threats",
    readTime: "8 min read",
    date: "Mar 11, 2026",
    author: authors[0],
    excerpt: "Why humans remain the weakest link in cybersecurity and how sophisticated social engineering attacks bypass even the best technical controls.",
    likes: 289,
    comments: 45,
    tags: ["Phishing", "OSINT", "Privacy"],
    content: [
      { heading: "The Psychology of Deception", text: "Social engineering exploits fundamental human psychological traits: authority (we comply with perceived authority figures), urgency (pressure reduces critical thinking), reciprocity (we feel obligated to return favors), and social proof (we follow what others do). Attackers systematically exploit these biases to manipulate victims into revealing credentials, transferring funds, or granting system access. No firewall or encryption can protect against a trusted employee willingly handing over the keys." },
      { heading: "Modern Attack Vectors", text: "Today's social engineering goes far beyond email phishing. Voice phishing (vishing) uses AI-cloned voices of executives to authorize transfers. Smishing targets mobile users with urgent SMS messages. Baiting leaves infected USB drives in target organizations' parking lots. Pretexting creates elaborate fictional scenarios — an attacker might impersonate IT support over weeks, building trust before requesting remote access. Watering hole attacks compromise websites frequented by target employees." },
      { heading: "OSINT and Reconnaissance", text: "Before launching an attack, social engineers conduct extensive open-source intelligence (OSINT) gathering. LinkedIn profiles reveal organizational hierarchies and reporting structures. Social media posts expose personal interests, travel plans, and relationships. Corporate websites list employee names and roles. Data breach databases provide previously used passwords. This information is woven into highly targeted pretexts that feel completely legitimate to the victim because they reference real internal projects, colleagues, and events." },
      { heading: "Building Organizational Resilience", text: "Defending against social engineering requires a cultural shift. Implement verification procedures for all sensitive requests — a callback to a known number before processing wire transfers, for example. Train employees to recognize manipulation tactics, not just phishing emails. Conduct regular social engineering assessments including physical security tests. Create clear escalation paths so employees can quickly verify suspicious requests without fear of offending legitimate requesters. Remember: an employee who questions authority is an asset, not a problem." },
    ],
  },
  {
    id: 9,
    title: "GDPR Compliance Checklist for Startups",
    category: "Industry",
    readTime: "9 min read",
    date: "Mar 9, 2026",
    author: authors[2],
    excerpt: "A practical, no-nonsense guide to achieving GDPR compliance without enterprise budgets. Everything a startup needs to know.",
    likes: 198,
    comments: 36,
    tags: ["Privacy", "Encryption", "Cloud"],
    content: [
      { heading: "GDPR in 2026: What's Changed", text: "The General Data Protection Regulation continues to evolve through enforcement actions and court decisions. Recent rulings have tightened requirements around consent mechanisms, with several major fines levied against companies using dark patterns in cookie banners. The extraterritorial scope means any startup serving EU customers must comply, regardless of where they're based. Total fines exceeded 4.2 billion euros in 2025, with enforcement increasingly targeting smaller companies, not just tech giants." },
      { heading: "The Essential Checklist", text: "Start with these fundamentals: (1) Map all personal data flows — know what you collect, where it's stored, and who accesses it, (2) Establish a lawful basis for each processing activity (consent, legitimate interest, contractual necessity), (3) Implement a clear, accessible privacy policy written in plain language, (4) Set up data subject access request (DSAR) procedures with 30-day response times, (5) Implement data breach notification procedures — 72 hours to supervisory authorities, (6) Conduct Data Protection Impact Assessments for high-risk processing, (7) Ensure adequate data processing agreements with all third-party processors." },
      { heading: "Technical Measures", text: "GDPR requires 'appropriate technical measures' to protect personal data. At minimum: encrypt data at rest and in transit using AES-256 and TLS 1.3, implement role-based access controls with least privilege principles, maintain comprehensive audit logs, use pseudonymization where possible, implement automatic data retention policies, ensure secure deletion when data is no longer needed, and maintain regular backup procedures. Document all technical measures in a security policy that's reviewed quarterly." },
      { heading: "Common Startup Mistakes", text: "Avoid these frequent pitfalls: using pre-ticked consent checkboxes (invalid under GDPR), sending marketing emails without explicit opt-in consent, storing data longer than necessary 'just in case', using US-based processors without adequate safeguards after Schrems II, ignoring the right to data portability, not appointing a Data Protection Officer when required, and treating GDPR compliance as a one-time project rather than an ongoing process. Start building privacy into your product design from day one — retrofitting is always more expensive." },
    ],
  },
  {
    id: 10,
    title: "Cloud Security Best Practices for 2026",
    category: "Tips",
    readTime: "11 min read",
    date: "Mar 7, 2026",
    author: authors[3],
    excerpt: "Essential strategies for securing your cloud infrastructure, from IAM policies to container security and secrets management.",
    likes: 356,
    comments: 58,
    tags: ["Cloud", "Encryption", "Zero Trust"],
    content: [
      { heading: "The Shared Responsibility Model", text: "The most fundamental concept in cloud security is understanding what your provider secures versus what you're responsible for. AWS, Azure, and GCP secure the infrastructure, but you're responsible for your configurations, data, identity management, and application security. Misconfigurations remain the number one cause of cloud breaches — Gartner estimates that 99% of cloud security failures through 2026 will be the customer's fault, not the provider's." },
      { heading: "Identity and Access Management", text: "IAM is the cornerstone of cloud security. Implement these essential practices: enforce MFA for all human users and federate identity through a centralized IdP, use short-lived credentials and avoid long-term access keys, implement least privilege through granular IAM policies reviewed quarterly, use service accounts with minimal permissions for automated workloads, implement just-in-time access for administrative functions, and log every authentication and authorization event for forensic capabilities." },
      { heading: "Network and Data Security", text: "Design your cloud network with zero-trust principles: segment workloads into isolated VPCs/VNets with strict security group rules, use private endpoints for service-to-service communication, encrypt all data at rest with customer-managed keys, enforce TLS 1.3 for all data in transit, implement WAF rules for public-facing applications, use secrets managers (never hardcode credentials), and enable VPC flow logs and DNS query logging for visibility into network activity." },
      { heading: "Container and Serverless Security", text: "As organizations embrace containerization and serverless architectures, new security challenges emerge. Scan container images for vulnerabilities in CI/CD pipelines and enforce signed images. Use minimal base images (distroless or Alpine) to reduce attack surface. Implement runtime security monitoring with tools like Falco. For serverless, minimize function permissions, validate all inputs, set appropriate timeout and memory limits, and monitor for anomalous invocation patterns. Implement Infrastructure as Code scanning to catch misconfigurations before deployment." },
    ],
  },
  {
    id: 11,
    title: "How Quantum Computing Will Impact Encryption",
    category: "Industry",
    readTime: "13 min read",
    date: "Mar 5, 2026",
    author: authors[5],
    excerpt: "With quantum computing advancing rapidly, current encryption methods face an existential threat. Here's what organizations need to do now to prepare.",
    likes: 423,
    comments: 71,
    tags: ["Encryption", "AI", "Privacy"],
    content: [
      { heading: "The Quantum Threat Timeline", text: "Quantum computers capable of breaking RSA-2048 and ECC encryption are no longer a distant theoretical concern. Major technology companies and nation-states have invested over $50 billion in quantum computing research. While current quantum systems aren't yet powerful enough to crack modern encryption, experts estimate that cryptographically relevant quantum computers (CRQC) could emerge between 2030 and 2035. The 'harvest now, decrypt later' strategy means adversaries are already collecting encrypted data to decrypt once quantum capabilities mature." },
      { heading: "What Breaks and What Doesn't", text: "Quantum computers running Shor's algorithm will break asymmetric cryptography — RSA, Diffie-Hellman, and Elliptic Curve Cryptography will all become insecure. This affects TLS/SSL connections, digital signatures, key exchange, and certificate authorities. However, symmetric encryption (AES) and hash functions are more resilient — AES-256 retains approximately 128 bits of security against quantum attacks using Grover's algorithm. Post-quantum cryptography (PQC) algorithms like ML-KEM (formerly CRYSTALS-Kyber) and ML-DSA have been standardized by NIST specifically to resist quantum attacks." },
      { heading: "NIST Post-Quantum Standards", text: "In 2024, NIST finalized three post-quantum cryptographic standards: ML-KEM for key encapsulation, ML-DSA for digital signatures, and SLH-DSA as a hash-based signature backup. These algorithms are based on mathematical problems believed to be resistant to both classical and quantum computers — primarily lattice-based and hash-based cryptography. Major vendors are already integrating PQC into their products. Chrome and iOS have implemented hybrid TLS connections combining classical and post-quantum key exchange." },
      { heading: "Your Quantum Readiness Plan", text: "Organizations should start preparing now: (1) Conduct a cryptographic inventory — identify all systems using vulnerable algorithms, (2) Prioritize high-value, long-lived data that must remain confidential for decades, (3) Begin testing PQC algorithms in non-production environments, (4) Update procurement policies to require quantum-safe cryptography, (5) Implement crypto-agility — design systems that can swap cryptographic algorithms without major refactoring, (6) Monitor NIST and industry developments for updated guidance. The transition to post-quantum cryptography will take years, so starting now is essential." },
    ],
  },
  {
    id: 12,
    title: "Beginner's Guide to Ethical Hacking",
    category: "Tutorials",
    readTime: "14 min read",
    date: "Mar 3, 2026",
    author: authors[1],
    excerpt: "Everything you need to know to start your ethical hacking journey — from legal considerations to essential tools and your first penetration test.",
    likes: 712,
    comments: 134,
    tags: ["Pentesting", "OSINT", "Firewall"],
    content: [
      { heading: "What Is Ethical Hacking?", text: "Ethical hacking, also known as penetration testing or white-hat hacking, involves legally and systematically testing computer systems, networks, and applications for security vulnerabilities. Unlike malicious hackers, ethical hackers have explicit authorization to test systems and follow strict rules of engagement. The goal is to identify weaknesses before criminals do, then help organizations fix them. It's one of the fastest-growing careers in tech, with a projected shortage of 3.5 million cybersecurity professionals by 2025." },
      { heading: "Legal and Ethical Foundations", text: "Before touching any system, you must have explicit written authorization — testing without permission is illegal under laws like the Computer Fraud and Abuse Act (CFAA) in the US and the Computer Misuse Act in the UK. Always work under a signed scope document that defines exactly which systems you can test, what techniques are allowed, and the testing timeline. Bug bounty programs from companies like HackerOne and Bugcrowd provide legal frameworks for testing public-facing applications. Never test systems you don't own or have written permission to test." },
      { heading: "Essential Skills and Tools", text: "Start by building a strong foundation in networking (TCP/IP, DNS, HTTP), operating systems (Linux command line is essential), and basic programming (Python is the most useful language for security). Key tools to learn: Nmap for network scanning, Burp Suite for web application testing, Metasploit for exploitation frameworks, Wireshark for packet analysis, John the Ripper and Hashcat for password cracking, and SQLmap for database injection testing. Set up a home lab with vulnerable machines like DVWA, Metasploitable, and VulnHub images to practice safely." },
      { heading: "Your First Penetration Test", text: "Follow the standard methodology: (1) Reconnaissance — gather information about the target using OSINT techniques, (2) Scanning — use Nmap to identify open ports and services, (3) Enumeration — dig deeper into discovered services for version information and misconfigurations, (4) Exploitation — attempt to gain access using identified vulnerabilities, (5) Post-exploitation — assess the impact and attempt lateral movement, (6) Reporting — document everything with evidence, severity ratings, and remediation recommendations. Start with CTF (Capture the Flag) competitions on platforms like TryHackMe and HackTheBox to build confidence in a structured environment." },
    ],
  },
  {
    id: 13,
    title: "Securing IoT Devices in Smart Homes",
    category: "Tips",
    readTime: "8 min read",
    date: "Mar 1, 2026",
    author: authors[3],
    excerpt: "Your smart home could be a hacker's dream. Learn how to lock down IoT devices and protect your connected home from cyber threats.",
    likes: 267,
    comments: 41,
    tags: ["IoT", "Firewall", "VPN"],
    content: [
      { heading: "The IoT Security Problem", text: "The average smart home now contains 25+ connected devices — from thermostats and cameras to refrigerators and light bulbs. Most IoT manufacturers prioritize features and time-to-market over security, resulting in devices with default credentials, unencrypted communications, and no update mechanisms. These devices create an expanded attack surface that traditional security tools weren't designed to protect. In 2025, IoT devices were involved in 33% of home network compromises." },
      { heading: "Network Segmentation", text: "The single most effective step is isolating IoT devices on a separate network. Create a dedicated VLAN or use your router's guest network for all smart home devices. This prevents a compromised smart lightbulb from accessing your laptop with banking credentials. Configure firewall rules to allow IoT devices to reach the internet for updates but block them from communicating with your primary devices. Many modern routers support this through their admin interface without requiring advanced networking knowledge." },
      { heading: "Device Hardening", text: "For every IoT device: change default usernames and passwords immediately, disable UPnP (Universal Plug and Play) on your router, turn off features you don't use (remote access, voice control), keep firmware updated or enable auto-updates where possible, disable WPS on your router, and use WPA3 encryption for your WiFi network. For cameras and microphones, consider devices with physical privacy shutters. Review which devices actually need internet access — many can function on local network only." },
      { heading: "Monitoring and Response", text: "Deploy network monitoring to detect anomalous IoT behavior — a smart thermostat shouldn't be making connections to servers in foreign countries. Tools like Pi-hole can block known malicious domains at the DNS level, protecting all devices on your network. Set up alerts for new devices joining your network. Periodically audit your connected devices and remove any you no longer use. Consider a dedicated IoT security hub that monitors device behavior patterns and alerts you to suspicious activity." },
    ],
  },
  {
    id: 14,
    title: "The State of Cybersecurity Jobs in 2026",
    category: "Industry",
    readTime: "7 min read",
    date: "Feb 27, 2026",
    author: authors[2],
    excerpt: "A comprehensive look at the cybersecurity job market — top roles, salary ranges, required certifications, and how to break into the field.",
    likes: 534,
    comments: 87,
    tags: ["SOC", "SIEM", "Pentesting"],
    content: [
      { heading: "Market Overview", text: "The cybersecurity job market in 2026 remains one of the strongest in tech. Despite economic headwinds affecting other technology sectors, cybersecurity hiring has grown 35% year-over-year. The global talent shortage has reached 4.1 million unfilled positions. This supply-demand imbalance means qualified professionals can command premium salaries, with median compensation for senior roles exceeding $180,000 in the US. Remote work remains prevalent, with 67% of cybersecurity positions offering fully remote or hybrid arrangements." },
      { heading: "Hottest Roles and Salaries", text: "The most in-demand roles for 2026: Cloud Security Architect ($160K-$250K), AI Security Specialist ($150K-$230K), Threat Hunter ($120K-$190K), DevSecOps Engineer ($130K-$200K), and Incident Response Lead ($125K-$185K). Emerging roles include Quantum Cryptography Analyst and AI Red Team Engineer. Entry-level SOC Analyst positions start at $55K-$75K but offer rapid advancement. The fastest salary growth is in AI security, reflecting the industry's urgent need for professionals who understand both machine learning and cybersecurity." },
      { heading: "Certifications That Matter", text: "Certifications remain important for career advancement, but the landscape has shifted. The CISSP is still the gold standard for management roles. For technical practitioners, the OSCP and OSEP demonstrate hands-on skills that employers value. CompTIA Security+ remains the best entry-level certification. Cloud-specific certs (AWS Security Specialty, Azure Security Engineer) are increasingly required. Newer certifications gaining traction include the GIAC Cloud Penetration Tester and Certified Kubernetes Security Specialist. Focus on certifications that require practical demonstrations, not just multiple-choice exams." },
      { heading: "Breaking Into the Field", text: "The most effective path into cybersecurity: (1) Build foundational skills through free resources like Cybrary, TryHackMe, and Professor Messer, (2) Earn CompTIA Security+ or equivalent entry-level cert, (3) Build a home lab and document your projects on GitHub, (4) Participate in CTF competitions and bug bounty programs, (5) Network at local security meetups and conferences like BSides, (6) Apply for SOC Analyst or IT Security roles as your entry point. Many successful cybersecurity professionals transitioned from IT support, system administration, or software development — prior tech experience is valuable even if it's not directly security-related." },
    ],
  },
  {
    id: 15,
    title: "DNS Security: Protecting Your First Line of Defense",
    category: "Tutorials",
    readTime: "10 min read",
    date: "Feb 25, 2026",
    author: authors[3],
    excerpt: "DNS is the backbone of the internet and a favorite target for attackers. Learn how to implement DNS security that actually works.",
    likes: 213,
    comments: 32,
    tags: ["Firewall", "DDoS", "Encryption"],
    content: [
      { heading: "Why DNS Security Matters", text: "Every internet connection begins with a DNS query, making it one of the most critical — and most targeted — protocols on the internet. DNS attacks can redirect users to malicious sites, intercept credentials, exfiltrate data through DNS tunneling, or take entire organizations offline through DNS-based DDoS attacks. Despite its importance, many organizations treat DNS as a 'set and forget' infrastructure component with minimal security monitoring, creating a massive blind spot in their security posture." },
      { heading: "Implementing DNSSEC", text: "DNSSEC (Domain Name System Security Extensions) adds cryptographic signatures to DNS records, ensuring responses haven't been tampered with during transit. While it doesn't encrypt DNS queries, it prevents cache poisoning and man-in-the-middle attacks on DNS responses. To implement: enable DNSSEC signing on your authoritative DNS servers, configure DS records with your domain registrar, validate DNSSEC responses on your recursive resolvers, and monitor for DNSSEC validation failures that might indicate attacks or misconfiguration." },
      { heading: "Encrypted DNS: DoH and DoT", text: "DNS over HTTPS (DoH) and DNS over TLS (DoT) encrypt DNS queries, preventing eavesdropping and manipulation by ISPs or network attackers. DoH runs on port 443 (blending with normal HTTPS traffic), while DoT uses port 853. For organizations, deploy encrypted DNS internally using resolvers like Unbound or use managed services like Cloudflare Gateway or Cisco Umbrella. For personal use, configure your devices to use providers like Cloudflare (1.1.1.1) or Google (8.8.8.8) with DoH enabled. Be aware that DoH can bypass corporate security controls if not properly managed." },
      { heading: "DNS Monitoring and Threat Detection", text: "DNS logs are a goldmine for threat detection. Monitor for: unusually long domain names (potential DNS tunneling), high query volumes to new domains (potential DDoS or exfiltration), queries to known malicious domains using threat intelligence feeds, NXDOMAIN spikes (potential DGA malware), and zone transfer requests from unauthorized sources. Deploy DNS firewalls (RPZ — Response Policy Zones) to block access to known malicious domains. Tools like PassiveDNS, DNSdist, and commercial DNS security platforms provide comprehensive visibility into DNS activity." },
    ],
  },
  {
    id: 16,
    title: "Incident Response Playbook: A Step-by-Step Guide",
    category: "Tutorials",
    readTime: "11 min read",
    date: "Feb 22, 2026",
    author: authors[0],
    excerpt: "When a breach happens, every minute counts. This playbook gives you a structured approach to managing security incidents effectively.",
    likes: 389,
    comments: 65,
    tags: ["SOC", "SIEM", "Malware"],
    content: [
      { heading: "Preparation Is Everything", text: "The best incident response happens before an incident occurs. Preparation includes: establishing a cross-functional incident response team with clearly defined roles (incident commander, technical lead, communications lead, legal liaison), creating and maintaining an asset inventory and network diagrams, deploying detection tools (SIEM, EDR, NDR) with properly tuned alerting, establishing communication channels that work even if primary systems are compromised, and conducting tabletop exercises quarterly to practice response procedures." },
      { heading: "Detection and Analysis", text: "When an alert fires, the first priority is determining whether it's a true incident. Triage using your classification framework: is this a false positive, a policy violation, or an actual attack? Gather initial evidence without altering it — take memory dumps before rebooting, preserve log files, capture network traffic. Determine the scope: how many systems are affected, what data may be compromised, is the attack ongoing? Document everything with timestamps from the very beginning — this timeline will be critical for post-incident analysis and potential legal proceedings." },
      { heading: "Containment and Eradication", text: "Containment prevents the attacker from expanding their foothold. Short-term containment might include isolating affected systems from the network, blocking malicious IPs at the firewall, or disabling compromised accounts. Long-term containment involves bringing clean systems online while keeping evidence preserved. Eradication removes the attacker's presence entirely: reimage compromised systems (never just remove malware and keep using the system), rotate all potentially compromised credentials, patch the vulnerability that was exploited, and verify eradication with thorough scanning." },
      { heading: "Recovery and Lessons Learned", text: "Recovery focuses on restoring normal operations while maintaining heightened monitoring. Restore systems from known-good backups, validate data integrity, gradually bring services back online starting with the most critical. Monitor closely for signs of re-compromise — attackers often leave multiple backdoors. Within two weeks of resolution, conduct a blameless post-incident review. Document: what happened, how it was detected, what went well, what could be improved, and specific action items with owners and deadlines. Update your playbooks based on lessons learned." },
    ],
  },
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [likedArticles, setLikedArticles] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = ["All", "News", "Tutorials", "Tips", "Threats", "Industry"];

  const filteredArticles = articles.filter((a) => {
    const matchesCat = activeCategory === "All" || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const gridArticles = filteredArticles.filter((a) => a !== featuredArticle);

  const popularArticles = [...articles].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Article Card ───
  const ArticleCard = ({ article, large }) => {
    const isHovered = hoveredCard === article.id;
    const catColor = categoryColors[article.category] || T.cyan;
    const grad = categoryGradients[article.category] || categoryGradients.News;
    const liked = likedArticles[article.id];

    return (
      <Link
        to={`/blog/${slugify(article.title)}`}
        onMouseEnter={() => setHoveredCard(article.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          textDecoration: "none",
          background: T.card,
          border: `1px solid ${isHovered ? catColor + "40" : T.border}`,
          borderRadius: 16,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isHovered ? `0 12px 40px ${catColor}15` : "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          ...(large ? { gridColumn: "1 / -1" } : {}),
        }}
      >
        {/* Image placeholder */}
        <div
          style={{
            background: grad,
            height: large ? 280 : 180,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <div style={{ position: "absolute", top: 20, right: 20, width: 60, height: 60, borderRadius: "50%", border: `2px solid ${catColor}30`, opacity: 0.5 }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${catColor}10` }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: large ? 48 : 32, opacity: 0.15, color: catColor }}>
            {article.category === "News" ? "\u{1F4F0}" : article.category === "Tutorials" ? "\u{1F4BB}" : article.category === "Tips" ? "\u{1F4A1}" : article.category === "Threats" ? "\u26A0\uFE0F" : "\u{1F3ED}"}
          </div>
          {/* Category badge */}
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              background: `${catColor}25`,
              color: catColor,
              backdropFilter: "blur(8px)",
              border: `1px solid ${catColor}30`,
              fontFamily: "'Plus Jakarta Sans'",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: large ? "24px 28px" : "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              fontFamily: "'Space Grotesk'",
              fontSize: large ? 22 : 16,
              fontWeight: 700,
              color: T.white,
              margin: "0 0 8px 0",
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </h3>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans'",
              fontSize: 13,
              color: T.muted,
              margin: "0 0 16px 0",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: large ? 3 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {article.excerpt}
          </p>

          {/* Author + meta */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `${article.author.color}25`,
                  border: `2px solid ${article.author.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: article.author.color,
                  fontFamily: "'Space Grotesk'",
                }}
              >
                {article.author.initials}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.white, fontFamily: "'Plus Jakarta Sans'" }}>{article.author.name}</div>
                <div style={{ fontSize: 11, color: T.mutedDark, fontFamily: "'Plus Jakarta Sans'" }}>
                  {article.date} &middot; {article.readTime}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: T.mutedDark, fontFamily: "'Plus Jakarta Sans'" }}>
              <span onClick={(e) => toggleLike(article.id, e)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: liked ? T.red : T.mutedDark, transition: "color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? T.red : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {article.likes + (liked ? 1 : 0)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {article.comments}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };


  // ─── Grid View ───
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans'" }}>
      <SEO title="Cybersecurity Blog - VRIKAAN" description="Stay informed with the latest cybersecurity news, tips, tutorials, and insights from industry experts." />
      <Navbar />

      {/* Inject responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .blog-main-grid { grid-template-columns: 1fr !important; }
          .blog-sidebar { display: none !important; }
          .blog-sidebar-mobile { display: block !important; }
          .blog-article-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .blog-article-grid { grid-template-columns: 1fr !important; }
          .blog-hero-title { font-size: 32px !important; }
          .blog-categories { gap: 6px !important; }
          .blog-categories button { font-size: 12px !important; padding: 6px 14px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "110px 24px 0", textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${T.cyan}12`, color: T.cyan, border: `1px solid ${T.cyan}20`, fontFamily: "'Plus Jakarta Sans'" }}>VRIKAAN Blog</span>
        </div>
        <h1
          className="blog-hero-title"
          style={{
            fontFamily: "'Space Grotesk'",
            fontSize: 48,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${T.white} 0%, ${T.cyan} 50%, ${T.accent} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 16px 0",
            lineHeight: 1.1,
          }}
        >
          Cyber Security Blog
        </h1>
        <p style={{ fontSize: 17, color: T.muted, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Stay informed with the latest cybersecurity news, tips, and insights from our expert contributors.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 520, margin: "0 auto 28px", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.mutedDark} strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "13px 16px 13px 44px",
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              color: T.white,
              fontSize: 14,
              outline: "none",
              fontFamily: "'Plus Jakarta Sans'",
              boxSizing: "border-box",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>

        {/* Category pills */}
        <div className="blog-categories" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 48 }}>
          {categories.map((cat) => {
            const active = activeCategory === cat;
            const catColor = cat === "All" ? T.cyan : categoryColors[cat] || T.cyan;
            const isHov = hoveredCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: active ? `1px solid ${catColor}60` : `1px solid ${T.border}`,
                  background: active ? `${catColor}18` : isHov ? `${catColor}08` : "transparent",
                  color: active ? catColor : isHov ? T.white : T.muted,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Plus Jakarta Sans'",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="blog-main-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 36 }}>
        <div>
          {/* Featured article */}
          {featuredArticle && (
            <div style={{ marginBottom: 32 }}>
              <ArticleCard article={featuredArticle} large />
            </div>
          )}

          {/* Results count */}
          {(searchQuery || activeCategory !== "All") && (
            <p style={{ fontSize: 13, color: T.mutedDark, marginBottom: 16 }}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </p>
          )}

          {/* Article grid */}
          <div className="blog-article-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {gridArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>&#x1F50D;</div>
              <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, color: T.white, marginBottom: 8 }}>No articles found</h3>
              <p style={{ fontSize: 14, color: T.muted }}>Try adjusting your search or category filter.</p>
            </div>
          )}

          {/* Mobile sidebar */}
          <div className="blog-sidebar-mobile" style={{ display: "none", marginTop: 40 }}>
            {/* Popular articles */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
              <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 16px 0" }}>Popular Articles</h4>
              {popularArticles.map((a, i) => (
                <Link
                  key={a.id}
                  to={`/blog/${slugify(a.title)}`}
                  style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", cursor: "pointer", alignItems: "flex-start" }}
                >
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, color: `${T.cyan}30`, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.white, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: T.mutedDark }}>{a.likes} likes &middot; {a.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Tags */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22 }}>
              <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 14px 0" }}>Tags</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setSearchQuery(tag.toLowerCase())}
                    style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${T.accent}10`, color: T.muted, cursor: "pointer", border: `1px solid ${T.border}`, transition: "all 0.2s" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Popular articles */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, backdropFilter: "blur(10px)" }}>
            <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 16px 0" }}>Popular Articles</h4>
            {popularArticles.map((a, i) => (
              <Link
                key={a.id}
                to={`/blog/${slugify(a.title)}`}
                style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", cursor: "pointer", alignItems: "flex-start", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, color: `${T.cyan}30`, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: T.mutedDark }}>{a.likes} likes &middot; {a.readTime}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ background: `linear-gradient(135deg, ${T.accent}15 0%, ${T.cyan}10 100%)`, border: `1px solid ${T.accent}25`, borderRadius: 14, padding: 22 }}>
            <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 6px 0" }}>Newsletter</h4>
            <p style={{ fontSize: 12, color: T.muted, margin: "0 0 14px 0", lineHeight: 1.5 }}>Get the latest cybersecurity insights delivered to your inbox every week.</p>
            {newsletterSubmitted ? (
              <div style={{ fontSize: 13, color: T.green, fontWeight: 600, textAlign: "center", padding: "8px 0" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Subscribed!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(15,23,42,0.6)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.white,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "'Plus Jakarta Sans'",
                  }}
                />
                <button
                  onClick={() => { if (newsletterEmail.includes("@")) setNewsletterSubmitted(true); }}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans'",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, backdropFilter: "blur(10px)" }}>
            <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 14px 0" }}>Tags</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((tag) => {
                const isHov = hoveredTag === tag;
                return (
                  <span
                    key={tag}
                    onClick={() => setSearchQuery(tag.toLowerCase())}
                    onMouseEnter={() => setHoveredTag(tag)}
                    onMouseLeave={() => setHoveredTag(null)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: isHov ? `${T.accent}20` : `${T.accent}10`,
                      color: isHov ? T.accent : T.muted,
                      cursor: "pointer",
                      border: `1px solid ${isHov ? T.accent + "30" : T.border}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
