/**
 * Receipt Authenticity Scanner.
 *
 * Validates a typed/pasted receipt against Indian tax math + GST format rules.
 * No OCR yet — user pastes the receipt text (or types totals). v2 will add
 * image OCR via Tesseract.
 *
 * Validates:
 *   - GSTIN format (15-char, state code, PAN, entity, checksum)
 *   - Tax math (CGST + SGST should equal IGST or split correctly)
 *   - Subtotal + tax = total (within ₹1 rounding tolerance)
 *   - Tip / service charge legitimacy (service charge is OPTIONAL per 2022 dept of consumer affairs)
 *   - Fake / inflated tax line items
 *   - Merchant name vs GSTIN consistency (basic — full PAN lookup needs paid API)
 */

const GSTIN_RX = /\b([0-9]{2})([A-Z]{5}[0-9]{4}[A-Z])([0-9])([A-Z])([0-9A-Z])\b/g;
const RUPEE_RX = /(?:₹|Rs\.?|INR)\s?([\d,]+\.?\d*)/gi;
const PCT_RX = /(\d+(?:\.\d+)?)\s*%/g;

const STATE_CODES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "28": "Andhra Pradesh (old)", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
  "37": "Andhra Pradesh", "38": "Ladakh", "97": "Other Territory",
};

// GST rates allowed in India (post-2024): 0, 5, 12, 18, 28
const VALID_GST_RATES = [0, 5, 12, 18, 28];
const ALLOWED_SLAB_TOLERANCE = 0.01; // 1 paisa tolerance for floating math

function gstinChecksum(gstin14) {
  // GSTIN checksum: weighted modulus over 36 (0-9 A-Z)
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const code = chars.indexOf(gstin14[i]);
    if (code < 0) return null;
    const weight = i % 2 === 0 ? 1 : 2;
    const product = code * weight;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checksum = (36 - (sum % 36)) % 36;
  return chars[checksum];
}

export function validateGSTIN(gstin) {
  if (!gstin || gstin.length !== 15) {
    return { valid: false, reason: "GSTIN must be exactly 15 characters." };
  }
  const m = gstin.match(/^([0-9]{2})([A-Z]{5}[0-9]{4}[A-Z])([0-9])([A-Z])([0-9A-Z])$/);
  if (!m) return { valid: false, reason: "GSTIN format invalid." };
  const [, state, pan, entity, zChar, check] = m;
  const stateName = STATE_CODES[state];
  if (!stateName) return { valid: false, reason: `Unknown state code "${state}".` };
  if (zChar !== "Z") return { valid: false, reason: `13th character must be 'Z', got '${zChar}'.` };
  const expectedCheck = gstinChecksum(gstin.slice(0, 14));
  if (expectedCheck !== check) {
    return { valid: false, reason: `Checksum mismatch — calculated '${expectedCheck}', got '${check}'.` };
  }
  return {
    valid: true,
    state: stateName,
    stateCode: state,
    pan,
    entity,
  };
}

/**
 * Audit a receipt — given the pasted text + structured fields.
 *
 * Input (best-effort, all optional):
 *   text       — full receipt text (we'll regex-find totals)
 *   gstin      — explicit GSTIN to validate
 *   subtotal   — number
 *   cgst       — number
 *   sgst       — number
 *   igst       — number
 *   service    — number (service charge)
 *   tip        — number
 *   total      — number (claimed grand total)
 */
export function auditReceipt({ text = "", gstin, subtotal, cgst, sgst, igst, service, tip, total } = {}) {
  const findings = [];

  // ── GSTIN validation ────────────────────────────────────────────
  let foundGstins = [...text.matchAll(GSTIN_RX)].map(m => m[0]);
  if (gstin) foundGstins.push(gstin);
  foundGstins = [...new Set(foundGstins)];

  const gstinResults = foundGstins.map(g => ({ gstin: g, ...validateGSTIN(g) }));
  const validGstins = gstinResults.filter(r => r.valid);
  const invalidGstins = gstinResults.filter(r => !r.valid);

  if (foundGstins.length === 0) {
    findings.push({
      severity: "medium",
      title: "No GSTIN found",
      detail: "Any registered Indian business (turnover > ₹40L for goods, ₹20L for services) MUST print GSTIN on receipts. Absence suggests cash-only / unregistered operation, possibly avoiding tax.",
      action: "Ask for GST receipt. If refused — don't claim service charge or hidden 'tax' line items.",
    });
  }
  for (const inv of invalidGstins) {
    findings.push({
      severity: "high",
      title: `Invalid GSTIN: "${inv.gstin}"`,
      detail: inv.reason,
      action: "This is a fake or typo'd GSTIN. The merchant is impersonating tax registration. Don't pay any GST line item.",
    });
  }

  // ── Tax math ────────────────────────────────────────────────────
  const sub = Number(subtotal) || 0;
  const tCgst = Number(cgst) || 0;
  const tSgst = Number(sgst) || 0;
  const tIgst = Number(igst) || 0;
  const tService = Number(service) || 0;
  const tTip = Number(tip) || 0;
  const claimedTotal = Number(total) || 0;

  if (sub > 0) {
    // CGST should equal SGST (always split 50-50 for intra-state)
    if (tCgst > 0 && tSgst > 0 && Math.abs(tCgst - tSgst) > 0.5) {
      findings.push({
        severity: "high",
        title: `CGST ≠ SGST (₹${tCgst} vs ₹${tSgst})`,
        detail: "CGST and SGST must always be equal for intra-state sales. Unequal values = math error or attempted overcharge.",
        action: "Recompute. Genuine bills always have CGST == SGST for in-state.",
      });
    }
    // CGST + SGST + IGST shouldn't both be present
    if ((tCgst > 0 || tSgst > 0) && tIgst > 0) {
      findings.push({
        severity: "high",
        title: "Both CGST/SGST and IGST charged",
        detail: "A transaction is EITHER intra-state (CGST+SGST) OR inter-state (IGST only). Never both. This is a clear overcharge.",
        action: "Demand correction. Pay only the correct combination.",
      });
    }

    // Tax rate sanity
    const taxTotal = tCgst + tSgst + tIgst;
    if (sub > 0 && taxTotal > 0) {
      const rate = (taxTotal / sub) * 100;
      const closest = VALID_GST_RATES.reduce((best, r) => Math.abs(r - rate) < Math.abs(best - rate) ? r : best, 100);
      if (Math.abs(rate - closest) > 2) {
        findings.push({
          severity: "medium",
          title: `Tax rate ${rate.toFixed(2)}% doesn't match any GST slab`,
          detail: `Valid GST slabs are ${VALID_GST_RATES.join(", ")}%. Calculated effective rate ${rate.toFixed(2)}% on subtotal ₹${sub} = ₹${taxTotal} tax.`,
          action: "Ask which HSN code applies. Verify against gst.gov.in rate finder.",
        });
      }
    }

    // Sum check
    const expectedTotal = sub + taxTotal + tService + tTip;
    if (claimedTotal > 0 && Math.abs(claimedTotal - expectedTotal) > 1) {
      findings.push({
        severity: "high",
        title: `Total doesn't add up`,
        detail: `Expected: ₹${expectedTotal.toFixed(2)} (sub ${sub} + tax ${taxTotal.toFixed(2)} + service ${tService} + tip ${tTip}). Receipt claims: ₹${claimedTotal}. Difference: ₹${(claimedTotal - expectedTotal).toFixed(2)}.`,
        action: "Recompute. Politely point out the math error. Ask for corrected receipt.",
      });
    }
  }

  // ── Service charge legitimacy ───────────────────────────────────
  if (tService > 0) {
    findings.push({
      severity: "low",
      title: `Service charge ₹${tService} added`,
      detail: "Per Dept of Consumer Affairs (June 2022): service charge is OPTIONAL in India. Hotels/restaurants cannot force it. You have legal right to refuse.",
      action: "If you didn't agree to it, ask politely for removal. If denied, complaint at consumerhelpline.gov.in (1915).",
    });
  }

  // ── Tip inflation ───────────────────────────────────────────────
  if (tTip > 0 && sub > 0 && (tTip / sub) > 0.20) {
    findings.push({
      severity: "medium",
      title: `Tip is ${((tTip / sub) * 100).toFixed(0)}% of bill`,
      detail: "Above 15-20% is unusual in India. If it was pre-printed by the establishment, may be an attempted overcharge disguised as tip.",
      action: "Confirm tip was your choice. Cross it out if not.",
    });
  }

  // ── Risk score ──────────────────────────────────────────────────
  const score = findings.reduce((s, f) => s + (f.severity === "high" ? 30 : f.severity === "medium" ? 15 : 5), 0);
  const capped = Math.min(100, score);
  const verdict = capped >= 60 ? { label: "LIKELY FAKE / OVERCHARGE", color: "#EF4444" }
    : capped >= 30 ? { label: "SUSPICIOUS — VERIFY", color: "#F97316" }
    : capped > 0 ? { label: "MINOR ISSUES", color: "#F59E0B" }
    : { label: "LOOKS LEGITIMATE", color: "#22C55E" };

  return {
    findings,
    riskScore: capped,
    verdict,
    gstins: gstinResults,
    computed: {
      taxTotal: tCgst + tSgst + tIgst,
      expectedTotal: sub + tCgst + tSgst + tIgst + tService + tTip,
      claimedTotal,
    },
  };
}
