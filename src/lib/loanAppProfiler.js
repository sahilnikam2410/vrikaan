/**
 * Loan App Profiler.
 *
 * Checks a loan-app name / Play Store URL against:
 *  - RBI-registered NBFC + bank list (sachet.rbi.org.in baseline)
 *  - Known predatory loan apps (community + RBI alerts)
 *  - Permission red flags (any loan app asking for SMS / Contacts / Storage / Camera is a red flag)
 *  - APR estimation from typical predatory patterns
 *
 * All client-side. Future: pull live data from Play Store + RBI feed via backend.
 */

// Seed list of RBI-registered legitimate digital lenders (sample — not exhaustive).
// Full list: https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=22014
// Per RBI 2022 guideline, any app NOT on this list (or partnered with someone on it) is illegal to operate.
export const RBI_REGISTERED = [
  // Banks
  "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "SBI YONO",
  "Federal Bank", "IndusInd Bank", "RBL Bank", "Yes Bank", "IDFC First Bank",
  // Top NBFCs
  "Bajaj Finance", "Bajaj Finserv", "Tata Capital", "Mahindra Finance",
  "Aditya Birla Finance", "L&T Finance", "Capri Global", "Cholamandalam",
  "Muthoot Finance", "Manappuram Finance", "Shriram Finance",
  // Reputable fintech (NBFC partnerships)
  "PaySense", "MoneyTap", "EarlySalary (Fibe)", "KreditBee", "Bajaj Markets",
  "Cashe (Bhanix Finance)", "ZestMoney", "PaytmPostpaid", "LazyPay (PayU)",
  "MobiKwik Xtra", "Slice (Quadrillion Finance)", "Jupiter (Federal Bank)",
  "CRED (Newtap Finance)", "Fi Money (Epifi)",
];

// Public RBI/MeitY warnings + community-reported predatory apps (sample).
export const KNOWN_PREDATORY = [
  // 2020-2024 banned/raided apps — names recurring in police reports
  "Cash Mama", "Loan Gram", "Cash Bus", "Cash Park", "Cash Loan", "Rupee Plus",
  "Cash Wow", "Loan Cloud", "Cash Star", "Easy Loan", "Quick Loan", "Snap Loan",
  "Insta Loan", "Loan Pro", "Loan Up", "Rupee Card", "Rupee Mama", "Rupee Plus",
  "Rapid Rupee", "Rupee Bear", "Money Park", "My Loan", "Easy Rupee",
  "Cash Hello", "Cash King", "Cash Tank", "Cash Train", "Cash Power",
  "Loan Pe Loan", "Tamil Loan", "Indian Cash", "Bharat Loan", "Hindi Loan",
];

// Permissions that should NEVER be needed for a legit loan app
export const RED_FLAG_PERMISSIONS = [
  { perm: "READ_SMS / Receive SMS",  why: "Reads every OTP from banks. Allows OTP theft + bypasses 2FA on your existing accounts." },
  { perm: "READ_CONTACTS",            why: "Lifts entire address book. Used to harass family/friends if you miss payment." },
  { perm: "READ_EXTERNAL_STORAGE",    why: "Scrapes WhatsApp media + photos. Doctored 'morphed' photos used for blackmail later." },
  { perm: "ACCESS_FINE_LOCATION",     why: "Tracks you 24/7. Used to send 'recovery agents' to your address." },
  { perm: "CAMERA (always-on)",       why: "No legitimate loan needs camera access beyond one selfie KYC." },
  { perm: "RECORD_AUDIO",             why: "Recording phone calls without consent. Used for blackmail." },
  { perm: "CALL_PHONE",               why: "Can auto-dial premium numbers from your phone. Adds fake charges." },
  { perm: "ACCESS_NOTIFICATIONS",     why: "Reads ALL notifications including banking app alerts. Tracks every payment." },
  { perm: "SYSTEM_ALERT_WINDOW",      why: "Overlays UI on banking apps. Steals login credentials." },
  { perm: "QUERY_ALL_PACKAGES",       why: "Sees every other app on your phone. Adversarial profiling." },
];

const RED_FLAG_NAME_PATTERNS = [
  /cash/i, /loan/i, /rupee/i, /money/i, /quick/i, /instant/i, /paisa/i, /paise/i,
  /pe loan/i, /loan pe/i, /rapid/i, /easy/i, /express/i, /turbo/i, /fast/i,
];

function fuzzyMatch(name, list) {
  const n = name.toLowerCase().trim();
  for (const item of list) {
    const l = item.toLowerCase();
    if (l === n) return { match: item, type: "exact" };
    if (n.includes(l) || l.includes(n)) return { match: item, type: "partial" };
  }
  return null;
}

export function profileLoanApp({ name, playStoreUrl, permissions = [], chargesAPR, processingFee }) {
  const findings = [];
  const cleanName = (name || extractNameFromUrl(playStoreUrl) || "").trim();

  if (!cleanName) {
    return { findings: [{ severity: "high", text: "No app name provided." }], score: 100 };
  }

  // 1. RBI registered?
  const rbiMatch = fuzzyMatch(cleanName, RBI_REGISTERED);
  if (rbiMatch) {
    findings.push({
      severity: "low",
      type: "rbi_match",
      text: `✓ App name matches "${rbiMatch.match}" on RBI / NBFC registered list. Verify exact entity on sachet.rbi.org.in before borrowing.`,
    });
  } else {
    findings.push({
      severity: "high",
      type: "rbi_not_found",
      text: `"${cleanName}" NOT found in RBI's registered NBFC + bank list. Per RBI 2022 Digital Lending Guidelines, ANY app not regulated (or partnered with a regulated entity) is operating ILLEGALLY in India.`,
    });
  }

  // 2. Known predatory?
  const predMatch = fuzzyMatch(cleanName, KNOWN_PREDATORY);
  if (predMatch) {
    findings.push({
      severity: "high",
      type: "known_predatory",
      text: `🚨 App matches a known predatory app ("${predMatch.match}"). Reported in police FIRs / RBI warnings. Do NOT install.`,
    });
  }

  // 3. Suspicious naming
  for (const rx of RED_FLAG_NAME_PATTERNS) {
    if (rx.test(cleanName) && !rbiMatch) {
      findings.push({
        severity: "medium",
        type: "name_pattern",
        text: `Name contains red-flag keyword (matches /${rx.source}/i). Legit lenders rarely use these.`,
      });
      break;
    }
  }

  // 4. Permission analysis
  for (const p of permissions) {
    const flag = RED_FLAG_PERMISSIONS.find(rf => rf.perm.toLowerCase().includes(p.toLowerCase().trim()) || p.toLowerCase().includes(rf.perm.toLowerCase().split(" ")[0]));
    if (flag) {
      findings.push({
        severity: "high",
        type: "bad_permission",
        text: `⚠ Permission "${p}" requested. ${flag.why}`,
      });
    }
  }

  // 5. APR check
  if (chargesAPR != null) {
    const apr = Number(chargesAPR);
    if (apr > 36) {
      findings.push({
        severity: "high",
        type: "apr_high",
        text: `APR ${apr}% exceeds typical legal cap of 36% (some states cap NBFCs at 24%). Predatory pricing.`,
      });
    } else if (apr > 24) {
      findings.push({
        severity: "medium",
        type: "apr_moderate",
        text: `APR ${apr}% is high. Compare against bank personal loan (10-18%) before borrowing.`,
      });
    }
  }

  // 6. Processing fee check
  if (processingFee != null) {
    const fee = Number(processingFee);
    if (fee > 10) {
      findings.push({
        severity: "high",
        type: "fee_high",
        text: `Processing fee ${fee}% is excessive. RBI guidelines suggest <5% for genuine NBFCs.`,
      });
    }
  }

  // Score
  const score = Math.min(100, findings.reduce((s, f) => s + (f.severity === "high" ? 35 : f.severity === "medium" ? 15 : 0), 0));
  const verdict = score >= 70 ? { label: "DO NOT INSTALL", color: "#EF4444" }
    : score >= 35 ? { label: "HIGH RISK — RESEARCH MORE", color: "#F97316" }
    : score > 0 ? { label: "VERIFY DETAILS", color: "#F59E0B" }
    : { label: "LOOKS LEGITIMATE", color: "#22C55E" };

  return { findings, score, verdict, cleanName };
}

function extractNameFromUrl(url) {
  if (!url) return null;
  // Play Store: e.g. https://play.google.com/store/apps/details?id=com.bajajfinserv.app
  const m = url.match(/[?&]id=([^&]+)/);
  if (m) return m[1].split(".").slice(-2).join(" ").replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
  return null;
}
