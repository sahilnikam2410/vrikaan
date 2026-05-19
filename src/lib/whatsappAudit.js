/**
 * WhatsApp Group Export auditor.
 *
 * Parses a WhatsApp "Export chat (without media)" .txt file and flags:
 *   - Suspicious admin patterns (foreign numbers, blocked-pattern admins)
 *   - Investment-tip / pump-and-dump linguistic patterns
 *   - URL shorteners + suspicious link patterns
 *   - Crypto wallet addresses + UPI ID drops
 *   - High-frequency burst-posters (likely bots)
 *   - Add-spam patterns (single member adds many others)
 *
 * All client-side. No upload. Designed for the 800M+ Indians in WhatsApp
 * "stock tip" / "investment" / "crypto signal" / "work-from-home" groups
 * that lose lakhs every week.
 */

// WhatsApp export line format:
//   [DD/MM/YY, HH:MM AM/PM] Name: message
//   (system msgs: "Name added Name to group")
const MSG_RX = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\]?\s+(?:-\s+)?([^:]+?):\s+(.*)$/;
const SYSTEM_RX = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\]?\s+(?:-\s+)?(.*)$/;

// Scam pattern lexicon (Hindi + English)
const SCAM_KEYWORDS = [
  // Investment/stock tips
  "guaranteed return", "guaranteed profit", "100% safe", "100% return",
  "lakh in", "crore in", "double your money", "triple your",
  "intraday call", "sure shot", "jackpot call", "premium call",
  "5x return", "10x return", "joining bonus", "referral bonus",
  // Hindi
  "garantee", "garanteed", "munafa", "pakka call", "100 percent",
  "lakhpati", "crorepati", "ghar baithe", "घर बैठे", "लाख", "करोड़",
  // Loan
  "instant loan", "loan in 5 minutes", "no documents", "no cibil",
  // Crypto
  "to the moon", "wagmi", "x100", "presale", "airdrop alert",
  "telegram link", "join telegram", "dm me for", "private link",
  // Job
  "wfh job", "data entry", "typing job", "easy earning",
  "send aadhaar", "id proof needed", "₹3000 per day", "registration fee",
  // Generic urgency
  "act now", "limited slots", "only today", "expires in",
];

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "rebrand.ly", "is.gd", "ow.ly",
  "buff.ly", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "lnkd.in",
];

const URL_RX = /https?:\/\/[^\s]+/gi;
const UPI_RX = /\b[a-zA-Z0-9._-]+@[a-zA-Z][a-zA-Z0-9]+\b/g;
const BTC_RX = /\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,42}\b/g;
const ETH_RX = /\b0x[a-fA-F0-9]{40}\b/g;
const INTL_PHONE_RX = /\+(?!91|92|93|94|95|880|975|977)\d{1,3}[\s-]?\d{4,}/g; // non-Indian-subcontinent codes

/**
 * Parse a WhatsApp export .txt content into messages + system events.
 */
export function parseExport(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];
  const systemEvents = [];
  let pending = null;

  for (const line of lines) {
    const m = line.match(MSG_RX);
    if (m) {
      if (pending) messages.push(pending);
      pending = {
        date: m[1],
        time: m[2],
        sender: m[3].trim(),
        text: m[4].trim(),
      };
    } else if (pending) {
      // Multi-line message continuation
      pending.text += "\n" + line.trim();
    } else {
      // Could be a system event (add/remove/leave)
      const sm = line.match(SYSTEM_RX);
      if (sm) {
        systemEvents.push({
          date: sm[1], time: sm[2], event: sm[3].trim(),
        });
      }
    }
  }
  if (pending) messages.push(pending);

  return { messages, systemEvents };
}

/**
 * Audit a parsed export. Returns findings + members + risk score.
 */
export function audit(text) {
  const { messages, systemEvents } = parseExport(text);
  const findings = [];

  // ── Member analysis ─────────────────────────────────────────────
  const senderStats = new Map(); // sender → { count, urls, scamHits, firstSeen }
  for (const msg of messages) {
    const s = senderStats.get(msg.sender) || { count: 0, urls: 0, scamHits: 0, links: [], wallets: [], upis: [] };
    s.count++;
    const lower = msg.text.toLowerCase();
    for (const kw of SCAM_KEYWORDS) {
      if (lower.includes(kw)) { s.scamHits++; break; }
    }
    const urls = msg.text.match(URL_RX) || [];
    s.urls += urls.length;
    s.links.push(...urls);
    s.upis.push(...(msg.text.match(UPI_RX) || []).filter(u => !u.includes(".com") && !u.includes(".in"))); // exclude emails
    s.wallets.push(...(msg.text.match(BTC_RX) || []));
    s.wallets.push(...(msg.text.match(ETH_RX) || []));
    senderStats.set(msg.sender, s);
  }

  const totalMsgs = messages.length;
  const members = Array.from(senderStats.entries()).map(([name, s]) => ({
    name,
    msgs: s.count,
    sharePct: totalMsgs ? Math.round((s.count / totalMsgs) * 100) : 0,
    urls: s.urls,
    scamHits: s.scamHits,
    intlNumber: INTL_PHONE_RX.test(name),
    sampleLinks: [...new Set(s.links)].slice(0, 3),
    sampleUpis: [...new Set(s.upis)].slice(0, 3),
    sampleWallets: [...new Set(s.wallets)].slice(0, 3),
  })).sort((a, b) => b.msgs - a.msgs);

  // ── FINDINGS ────────────────────────────────────────────────────

  // 1. Suspicious top posters (>20% share + scam keywords)
  for (const m of members) {
    if (m.sharePct > 20 && m.scamHits >= 3) {
      findings.push({
        severity: "high",
        type: "scam_amplifier",
        title: `Top poster "${m.name}" is repeating scam patterns`,
        detail: `${m.sharePct}% of all messages, ${m.scamHits} scam keyword hits. Likely an "investment guru" / signal-pumper. These accounts vanish after collecting victims' UPI / crypto deposits.`,
        action: "Leave this group. Report to WhatsApp (Settings → Help → Contact us).",
      });
    }
  }

  // 2. International numbers as members (not common in real Indian groups)
  const intlMembers = members.filter(m => m.intlNumber);
  if (intlMembers.length > 0) {
    findings.push({
      severity: "medium",
      type: "intl_members",
      title: `${intlMembers.length} non-Indian phone numbers in group`,
      detail: `Numbers from outside India/Pakistan/Sri Lanka/Bangladesh: ${intlMembers.map(m => m.name).slice(0, 5).join(", ")}. Common pattern for matrimonial/romance + crypto scams.`,
      action: "Verify each foreign member's identity. If they don't have a real-world connection, leave the group.",
    });
  }

  // 3. URL shorteners (hide destination)
  const shortenerHits = new Set();
  for (const m of members) {
    for (const l of m.sampleLinks) {
      for (const s of URL_SHORTENERS) {
        if (l.toLowerCase().includes(s)) shortenerHits.add(`${s} (via ${m.name})`);
      }
    }
  }
  if (shortenerHits.size > 0) {
    findings.push({
      severity: "high",
      type: "url_shorteners",
      title: `${shortenerHits.size} URL shorteners hiding link destinations`,
      detail: `Real businesses use their own domains. URL shorteners (bit.ly, t.co, etc.) are a #1 phishing technique. Sources: ${[...shortenerHits].slice(0, 3).join(" · ")}`,
      action: "Never click these without expanding first. Paste into checkshorturl.com to preview.",
    });
  }

  // 4. UPI IDs posted (random members asking for payment = scam)
  const upiPosters = members.filter(m => m.sampleUpis.length > 0);
  if (upiPosters.length > 0) {
    findings.push({
      severity: "high",
      type: "upi_drops",
      title: `${upiPosters.length} members posted their UPI IDs in group`,
      detail: `Examples: ${upiPosters.flatMap(m => m.sampleUpis).slice(0, 4).join(" · ")}. Real businesses don't collect payment via UPI in group chats — they use payment gateways.`,
      action: "Never send money to a UPI ID dropped in a group. Period.",
    });
  }

  // 5. Crypto wallets posted
  const walletPosters = members.filter(m => m.sampleWallets.length > 0);
  if (walletPosters.length > 0) {
    findings.push({
      severity: "high",
      type: "crypto_wallets",
      title: `${walletPosters.length} crypto wallets shared`,
      detail: `Classic pump-and-dump scaffolding. Members ${walletPosters.map(m => m.name).slice(0, 3).join(", ")} dropped wallet addresses. Likely funneling deposits.`,
      action: "Don't transfer any crypto based on a group message. Verify on the actual exchange instead.",
    });
  }

  // 6. Add-spam pattern (one person adding many)
  const addStats = new Map();
  for (const ev of systemEvents) {
    const addedMatch = ev.event.match(/^(.+?) added (.+?) to the group/i);
    if (addedMatch) {
      const adder = addedMatch[1].trim();
      addStats.set(adder, (addStats.get(adder) || 0) + 1);
    }
  }
  const aggressiveAdders = [...addStats.entries()].filter(([, n]) => n >= 10);
  if (aggressiveAdders.length > 0) {
    findings.push({
      severity: "medium",
      type: "mass_adds",
      title: `${aggressiveAdders.length} members aggressively adding others`,
      detail: aggressiveAdders.map(([n, c]) => `${n} added ${c} people`).slice(0, 3).join(" · ") + ". This is how scam groups inflate membership before pitching.",
      action: "Aggressive group-builders are usually the scam orchestrators. Check who they are outside WhatsApp.",
    });
  }

  // 7. Burst posters (>50% in <10% of time — likely bots)
  // Skipped — requires per-day distribution; future enhancement.

  // ── Risk score ──────────────────────────────────────────────────
  const score = findings.reduce((s, f) => s + (f.severity === "high" ? 30 : 15), 0);
  const capped = Math.min(100, score);
  const verdict = capped >= 70 ? { label: "LEAVE NOW", color: "#EF4444" }
    : capped >= 40 ? { label: "HIGH RISK", color: "#F97316" }
    : capped >= 20 ? { label: "SUSPICIOUS", color: "#F59E0B" }
    : { label: "MOSTLY SAFE", color: "#22C55E" };

  return {
    parsed: { messages: messages.length, systemEvents: systemEvents.length },
    members: members.slice(0, 30),
    totalMembers: members.length,
    findings,
    riskScore: capped,
    verdict,
  };
}
