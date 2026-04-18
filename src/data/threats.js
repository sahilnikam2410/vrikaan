/**
 * Threat directory — one entry per common cyber threat.
 * Powers /threats index page and /threat/:slug detail pages (SEO).
 * Fields are intentionally short & actionable, not encyclopedic.
 */

const THREATS = [
  {
    slug: "phishing",
    title: "Phishing Attacks",
    category: "Social Engineering",
    severity: "High",
    lede:
      "Phishing is fraud by impersonation — an attacker poses as a trusted brand or contact to trick you into revealing credentials, payment data, or clicking a malicious link.",
    signs: [
      "Sender domain is slightly misspelled (amaz0n.com, paypa1.com)",
      "Urgent language: 'your account will be suspended in 24 hours'",
      "Generic greeting ('Dear Customer') instead of your name",
      "Links don't match the visible text — hover to inspect",
      "Attachments from unexpected senders",
    ],
    examples: [
      "Fake Microsoft 365 login page after clicking 'invoice review' link",
      "Cloned bank SMS asking you to verify a transaction",
      "DocuSign impersonation requesting signature on a fake contract",
    ],
    prevention: [
      "Never click links in unexpected emails — navigate manually",
      "Enable 2FA on every account that supports it",
      "Check sender's full email address, not just the display name",
      "Run suspicious URLs through our Fraud Analyzer before clicking",
    ],
    relatedTool: { path: "/fraud-analyzer", name: "Fraud Analyzer" },
    related: ["smishing", "vishing", "business-email-compromise"],
  },
  {
    slug: "smishing",
    title: "Smishing (SMS Phishing)",
    category: "Social Engineering",
    severity: "High",
    lede:
      "Smishing is phishing delivered via SMS — texts that impersonate banks, couriers, or government agencies to steal credentials or push malware.",
    signs: [
      "Shortened URLs (bit.ly, tinyurl) in a text you weren't expecting",
      "Claims a package is stuck and needs a small 'customs fee'",
      "Requests verification codes you didn't request",
      "Sender is a regular phone number pretending to be a brand",
    ],
    examples: [
      "'DHL: your package is waiting — confirm delivery: dhl-notif[.]xyz'",
      "'Your bank card has been locked, verify at: sbi-secure[.]in'",
      "'You owe ₹2,400 in toll fees, pay now to avoid court'",
    ],
    prevention: [
      "Never click links in SMS — visit the brand's app directly",
      "Banks never send login links via SMS — treat any that do as fraud",
      "Report smishing to 1909 (India) or 7726 (US/UK)",
      "Scan suspicious URLs in our Fraud Analyzer",
    ],
    relatedTool: { path: "/fraud-analyzer", name: "Fraud Analyzer" },
    related: ["phishing", "vishing", "sim-swapping"],
  },
  {
    slug: "vishing",
    title: "Vishing (Voice Phishing)",
    category: "Social Engineering",
    severity: "High",
    lede:
      "Vishing is phishing over a phone call. Attackers impersonate bank staff, tax officials, or tech support to pressure victims into transferring money or installing remote-access software.",
    signs: [
      "Caller creates artificial urgency ('your account is being hacked right now')",
      "Asks you to install AnyDesk, TeamViewer, or Quick Assist",
      "Demands payment via gift cards, cryptocurrency, or wire transfer",
      "Threatens arrest or account closure for non-compliance",
    ],
    examples: [
      "Fake income tax officer demanding immediate penalty payment",
      "'Microsoft support' calling about a virus on your computer",
      "Bank fraud department asking you to read out an OTP",
    ],
    prevention: [
      "Hang up and call the official number from the back of your card",
      "Banks never ask for OTPs, passwords, or PINs over the phone",
      "Never install remote-access software at a caller's request",
      "Report to Cyber Crime Helpline: 1930 (India)",
    ],
    relatedTool: { path: "/emergency-help", name: "Emergency Help" },
    related: ["phishing", "smishing", "tech-support-scam"],
  },
  {
    slug: "business-email-compromise",
    title: "Business Email Compromise (BEC)",
    category: "Social Engineering",
    severity: "Critical",
    lede:
      "BEC attacks impersonate executives or trusted vendors to authorize fraudulent wire transfers. Losses per incident often exceed ₹50 lakh.",
    signs: [
      "CEO/CFO 'urgently' requests a wire transfer while traveling",
      "Vendor 'updates' their bank details right before a large invoice",
      "Email domain is off by one letter (@compаny.com with Cyrillic 'а')",
      "Request bypasses normal approval workflow",
    ],
    examples: [
      "Fake CEO asking accounts team to pay an 'acquisition deposit'",
      "Vendor hijack: invoice pays attacker's account instead of supplier's",
      "Fake lawyer requesting confidential M&A funds",
    ],
    prevention: [
      "Verify payment changes via a phone call to a known number",
      "Require dual approval for all wire transfers over a threshold",
      "Train finance staff on CEO-fraud red flags",
      "Enable DMARC, DKIM, SPF on your email domain",
    ],
    relatedTool: { path: "/email-analyzer", name: "Email Analyzer" },
    related: ["phishing", "fake-invoice-scam", "credential-stuffing"],
  },
  {
    slug: "ransomware",
    title: "Ransomware",
    category: "Malware",
    severity: "Critical",
    lede:
      "Ransomware encrypts your files and demands payment (usually in cryptocurrency) for the decryption key. Modern variants also exfiltrate data and threaten leaks.",
    signs: [
      "Files suddenly have unusual extensions (.locked, .crypt, random)",
      "Desktop wallpaper replaced with a ransom note",
      "Applications fail to open with 'file not recognized' errors",
      "Antivirus is disabled without your action",
    ],
    examples: [
      "LockBit 3.0 targeting healthcare providers and supply chains",
      "BlackCat/ALPHV hitting enterprise VMware ESXi servers",
      "Akira ransomware compromising VPN accounts without MFA",
    ],
    prevention: [
      "Maintain offline, immutable backups (3-2-1 rule)",
      "Patch operating systems and VPN gateways within 48 hours",
      "Enforce MFA on all remote access, especially VPN and RDP",
      "Segment networks — don't let a single breach spread",
    ],
    relatedTool: { path: "/security-audit", name: "Security Audit" },
    related: ["cryptojacking", "drive-by-download", "credential-stuffing"],
  },
  {
    slug: "credential-stuffing",
    title: "Credential Stuffing",
    category: "Account Takeover",
    severity: "High",
    lede:
      "Attackers take leaked username/password pairs from one breach and try them on thousands of other sites. Works because 65%+ of users reuse passwords.",
    signs: [
      "Unexplained login attempts from unfamiliar locations",
      "Password reset emails you didn't request",
      "Sudden account lockouts after 'too many attempts'",
      "New devices appearing in your security settings",
    ],
    examples: [
      "Netflix accounts sold on dark web for ₹50 each after mass testing",
      "Attackers buying credential lists on Genesis Market",
      "Disney+ breach (2019) — credential stuffing, not a Disney hack",
    ],
    prevention: [
      "Use a password manager to generate unique passwords per site",
      "Check your email against our Fraud Analyzer's breach lookup",
      "Enable 2FA — ideally app-based, not SMS",
      "Replace any password you've used on more than one site, today",
    ],
    relatedTool: { path: "/password-vault", name: "Password Vault" },
    related: ["phishing", "sim-swapping", "dark-web-leak"],
  },
  {
    slug: "man-in-the-middle",
    title: "Man-in-the-Middle (MITM) Attacks",
    category: "Network",
    severity: "High",
    lede:
      "MITM attacks intercept traffic between you and a legitimate service to steal credentials, inject malware, or downgrade encryption.",
    signs: [
      "Browser warns about invalid or unexpected SSL certificate",
      "Websites suddenly display a '⚠ Not secure' warning",
      "Redirects to a clone site with a subtly different URL",
      "Unexpected VPN or proxy prompts on public Wi-Fi",
    ],
    examples: [
      "'Free Airport WiFi' captive portal that logs your credentials",
      "SSL stripping on coffee-shop networks",
      "DNS spoofing on compromised routers (DNSChanger)",
    ],
    prevention: [
      "Always check for the padlock and HTTPS before entering credentials",
      "Use a reputable VPN on public Wi-Fi",
      "Keep your browser updated — it blocks most downgrade attacks",
      "Avoid banking on shared or unencrypted networks",
    ],
    relatedTool: { path: "/dns-leak-test", name: "DNS Leak Test" },
    related: ["phishing", "malvertising", "drive-by-download"],
  },
  {
    slug: "sim-swapping",
    title: "SIM Swapping",
    category: "Account Takeover",
    severity: "Critical",
    lede:
      "Attackers social-engineer your mobile carrier into transferring your number to a SIM they control, intercepting SMS-based 2FA and password resets.",
    signs: [
      "Sudden loss of mobile signal with no outage in your area",
      "'Welcome to the network' text from your carrier when you didn't switch",
      "Banking alerts for transactions you didn't make",
      "Email password resets you didn't trigger",
    ],
    examples: [
      "₹20 crore cryptocurrency theft via 2AM SIM swap in Mumbai (2023)",
      "Twitter CEO's account hijacked via SIM swap (2019)",
      "Targeted swaps after social media doxxing",
    ],
    prevention: [
      "Set a carrier PIN/passphrase for account changes (not your DOB)",
      "Switch from SMS 2FA to authenticator apps (Aegis, Authy, Google)",
      "Don't post your phone number publicly",
      "If signal drops unexpectedly, call your carrier from another phone immediately",
    ],
    relatedTool: { path: "/emergency-help", name: "Emergency Help" },
    related: ["credential-stuffing", "vishing", "phishing"],
  },
  {
    slug: "formjacking",
    title: "Formjacking & Magecart",
    category: "Web Attack",
    severity: "High",
    lede:
      "Attackers inject malicious JavaScript into legitimate e-commerce sites to skim payment details at checkout — invisible to most visitors.",
    signs: [
      "Card charged multiple small test amounts after shopping online",
      "Browser DevTools shows unknown third-party scripts on checkout",
      "Site asks for payment details on an unusual-looking form",
      "Card issuer flags 'suspicious pattern' after a purchase",
    ],
    examples: [
      "British Airways Magecart breach (380K cards skimmed, 2018)",
      "Ticketmaster chat widget compromise",
      "Hundreds of Shopify third-party apps injected with skimmers",
    ],
    prevention: [
      "Use virtual cards or payment providers (UPI, Apple Pay) instead of raw card entry",
      "Enable card transaction alerts — catch skim tests early",
      "Prefer merchants that redirect to the bank's hosted payment page",
      "Monitor credit report quarterly for unknown charges",
    ],
    relatedTool: { path: "/fraud-analyzer", name: "Fraud Analyzer" },
    related: ["malvertising", "drive-by-download", "man-in-the-middle"],
  },
  {
    slug: "malvertising",
    title: "Malvertising",
    category: "Web Attack",
    severity: "Medium",
    lede:
      "Malicious code injected into legitimate ad networks. Simply loading an infected page — no click required — can trigger an exploit.",
    signs: [
      "Browser crashes or redirects after page load",
      "Fake 'Your PC is infected' pop-ups demanding scareware install",
      "CPU spikes to 100% without any tab doing obvious work",
      "Unexpected downloads starting automatically",
    ],
    examples: [
      "Zero-click drive-by via compromised Yahoo ad network (2016)",
      "Fake Chrome update pop-ups pushing info-stealers",
      "Search-engine malvertising impersonating AnyDesk/Brave downloads",
    ],
    prevention: [
      "Run a reputable ad blocker (uBlock Origin)",
      "Keep browser and OS patched",
      "Download software only from the vendor's real domain",
      "Disable Flash/Java plugins permanently",
    ],
    relatedTool: { path: "/file-hash-scanner", name: "File Hash Scanner" },
    related: ["drive-by-download", "cryptojacking", "formjacking"],
  },
  {
    slug: "cryptojacking",
    title: "Cryptojacking",
    category: "Malware",
    severity: "Medium",
    lede:
      "Hidden code — in a site, extension, or binary — uses your device's CPU/GPU to mine cryptocurrency for the attacker. Slow, silent, and usually very long-lived.",
    signs: [
      "Fan running constantly even when the device is idle",
      "Battery drains rapidly on mobile",
      "CPU at 90–100% with no visible heavy app",
      "System overheats during basic browsing",
    ],
    examples: [
      "Coinhive JavaScript miners embedded in torrenting sites",
      "Trojanized npm packages mining Monero on developer laptops",
      "Browser extension updates pushing hidden miners",
    ],
    prevention: [
      "Audit browser extensions monthly — remove what you don't use",
      "Block known mining domains at DNS level",
      "Monitor CPU usage — Task Manager / Activity Monitor",
      "Prefer browsers with built-in miner blocking (Brave)",
    ],
    relatedTool: { path: "/vulnerability-scanner", name: "Vulnerability Scanner" },
    related: ["malvertising", "ransomware", "drive-by-download"],
  },
  {
    slug: "drive-by-download",
    title: "Drive-by Downloads",
    category: "Malware",
    severity: "High",
    lede:
      "Malware that installs silently when you simply visit a compromised or malicious page — often via browser or plugin vulnerabilities.",
    signs: [
      "New programs in your Start Menu that you didn't install",
      "Browser homepage or search engine changed unexpectedly",
      "Antivirus quarantine notifications after visiting a new site",
      "System slowdown starting right after a specific browsing session",
    ],
    examples: [
      "SocGholish fake 'browser update' pop-ups dropping loaders",
      "Exploit kits targeting outdated Internet Explorer & Flash",
      "Compromised WordPress sites serving malicious payloads",
    ],
    prevention: [
      "Enable automatic browser and OS updates",
      "Disable or uninstall Flash, Java, and old browser plugins",
      "Use a modern sandboxed browser (Chrome, Firefox, Edge — updated)",
      "Run endpoint protection with behavioral detection",
    ],
    relatedTool: { path: "/file-hash-scanner", name: "File Hash Scanner" },
    related: ["malvertising", "ransomware", "cryptojacking"],
  },
  {
    slug: "tech-support-scam",
    title: "Tech Support Scams",
    category: "Social Engineering",
    severity: "Medium",
    lede:
      "Fraudsters impersonate Microsoft, Apple, or your ISP to convince you your computer is infected, then charge for fake 'cleanup' or install remote-access tools.",
    signs: [
      "Browser pop-up with siren sounds and a support phone number",
      "Unsolicited call claiming 'your Windows license has expired'",
      "Caller insists you share your screen immediately",
      "Asked to pay via gift cards, wire, or cryptocurrency",
    ],
    examples: [
      "Fake 'Microsoft Defender' alert locking the browser in full screen",
      "Call-center operations out of Noida/Kolkata targeting US seniors",
      "Amazon/Apple refund scams tricking victims into reversing transactions",
    ],
    prevention: [
      "No legit tech company calls you out of the blue",
      "Never install AnyDesk/TeamViewer at a stranger's request",
      "If a pop-up locks your browser, kill the process — don't call the number",
      "Report to Cyber Crime: 1930 (India) / IC3 (US)",
    ],
    relatedTool: { path: "/emergency-help", name: "Emergency Help" },
    related: ["vishing", "phishing", "romance-scam"],
  },
  {
    slug: "romance-scam",
    title: "Romance & Pig-Butchering Scams",
    category: "Social Engineering",
    severity: "Critical",
    lede:
      "Long-con scams — weeks to months of fake romance — that pivot into 'investment opportunities' (often fake crypto platforms) designed to drain victims' life savings.",
    signs: [
      "Match moves you off the dating app quickly (WhatsApp/Telegram)",
      "Excuses preventing video calls or meeting in person",
      "Shows you screenshots of 'crypto profits' and urges you to invest",
      "Small withdrawals work at first — large ones trigger 'tax' demands",
    ],
    examples: [
      "Pig-butchering ('Sha Zhu Pan') syndicates operating from Cambodia/Myanmar",
      "Fake military deployed overseas asking for emergency funds",
      "Long-term romance converted into fake trading platform deposits",
    ],
    prevention: [
      "Reverse image search their profile photos (Google Lens, TinEye)",
      "Never send money, gift cards, or crypto to someone you haven't met in person",
      "If an investment opportunity is 'guaranteed', it's fraud",
      "Talk to a friend or family member before any financial decision",
    ],
    relatedTool: { path: "/emergency-help", name: "Emergency Help" },
    related: ["phishing", "tech-support-scam", "fake-invoice-scam"],
  },
  {
    slug: "fake-invoice-scam",
    title: "Fake Invoice Scams",
    category: "Business Fraud",
    severity: "High",
    lede:
      "Fraudulent invoices impersonating real vendors, subscriptions, or regulatory bodies — designed to slip through accounts payable unchecked.",
    signs: [
      "Invoice for a service you don't remember buying",
      "Domain registrar 'expiry notices' that aren't from your registrar",
      "'Official' business directory listings with ₹15K+ fees",
      "Invoice amounts just below authorization thresholds",
    ],
    examples: [
      "Fake GoDaddy/Namecheap renewal PDFs sent to WHOIS-listed emails",
      "'Your Google Business Listing needs verification — ₹8,999'",
      "Forged Microsoft 365 or Adobe invoices with attacker's bank details",
    ],
    prevention: [
      "Require PO matching for every invoice",
      "Verify vendor bank details via a phone call to a known number",
      "Subscribe to domain/SaaS renewal through one consolidated dashboard",
      "Train AP staff to treat email invoices as untrusted by default",
    ],
    relatedTool: { path: "/email-analyzer", name: "Email Analyzer" },
    related: ["business-email-compromise", "phishing", "tech-support-scam"],
  },
];

export const THREAT_CATEGORIES = [
  "All",
  ...Array.from(new Set(THREATS.map((t) => t.category))),
];

export function getThreatBySlug(slug) {
  return THREATS.find((t) => t.slug === slug);
}

export function getRelatedThreats(slugs = []) {
  return slugs.map(getThreatBySlug).filter(Boolean);
}

export default THREATS;
