/**
 * Aadhaar / PAN / driving-license masking — pure client-side, no upload.
 *
 * Uses canvas pixel manipulation to draw black rectangles over detected
 * digits in an uploaded image. OCR via Tesseract.js (lazy-loaded) detects
 * the 12-digit Aadhaar / 10-char PAN / 15-char DL strings + their bounding
 * boxes, then we redact in-place. Output is a downloadable PNG/JPG.
 *
 * For text-only redaction (paste Aadhaar number into a textarea, get masked
 * string back), we provide maskText() which doesn't need Tesseract.
 */

// ── Detection regexes (Indian govt ID formats) ───────────────────────
const PATTERNS = {
  aadhaar:  /\b\d{4}\s?\d{4}\s?\d{4}\b/g,        // 12 digits, optionally space-separated
  pan:      /\b[A-Z]{5}\d{4}[A-Z]\b/g,           // ABCDE1234F
  dl:       /\b[A-Z]{2}[-\s]?\d{2}[-\s]?\d{11}\b/g, // MH-12-20240012345
  voter:    /\b[A-Z]{3}\d{7}\b/g,                // ABC1234567
  passport: /\b[A-Z]\d{7}\b/g,                   // A1234567
  phone:    /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,    // Indian mobile
  email:    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  upi:      /\b[a-zA-Z0-9._-]+@[a-zA-Z]{2,}\b/g, // UPI VPA (overlaps email — process email first)
};

const TYPE_LABEL = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  dl: "Driving Licence",
  voter: "Voter ID",
  passport: "Passport",
  phone: "Phone",
  email: "Email",
  upi: "UPI ID",
};

/**
 * Mask a text string. Returns { masked, found: [{ type, original, masked, start, end }] }
 *
 * Options:
 *   mode: "full" (default) — replace digits w/ X except last 4
 *         "none" — replace entire match w/ XXXX
 *         "first" — keep first 4, mask rest
 *
 *   types: array of types to mask (defaults to all)
 */
export function maskText(text, { mode = "full", types = null } = {}) {
  if (!text) return { masked: "", found: [] };
  const enabled = types ? new Set(types) : null;
  const found = [];
  let masked = text;

  // Process in order: email > upi (else upi over-matches), then everything else
  const order = ["email", "upi", "aadhaar", "pan", "dl", "voter", "passport", "phone"];

  for (const type of order) {
    if (enabled && !enabled.has(type)) continue;
    const regex = PATTERNS[type];
    masked = masked.replace(regex, (match, offset) => {
      const m = maskMatch(match, type, mode);
      found.push({ type, label: TYPE_LABEL[type], original: match, masked: m, offset });
      return m;
    });
  }
  return { masked, found };
}

function maskMatch(match, type, mode) {
  if (mode === "none") return repeat("X", match.length);
  if (type === "email") {
    const [user, domain] = match.split("@");
    return `${user[0]}${repeat("*", Math.max(1, user.length - 2))}${user.slice(-1)}@${domain}`;
  }
  if (type === "upi") {
    const [user, handle] = match.split("@");
    return `${user[0]}${repeat("*", Math.max(1, user.length - 1))}@${handle}`;
  }
  // Numeric IDs: keep last 4 (Aadhaar standard masking per UIDAI guidelines)
  const digits = match.replace(/[\s-]/g, "");
  if (digits.length <= 4) return repeat("X", digits.length);
  if (mode === "first") {
    return digits.slice(0, 4) + repeat("X", digits.length - 4);
  }
  // "full" mode — keep last 4
  return repeat("X", digits.length - 4) + digits.slice(-4);
}

function repeat(c, n) { return n <= 0 ? "" : Array(n + 1).join(c); }

/**
 * Find all sensitive patterns in text. Returns array w/ offsets — used by UI
 * to highlight detected items before user confirms masking.
 */
export function detect(text) {
  const found = [];
  for (const [type, regex] of Object.entries(PATTERNS)) {
    let m;
    const r = new RegExp(regex.source, regex.flags);
    while ((m = r.exec(text)) !== null) {
      found.push({
        type, label: TYPE_LABEL[type],
        match: m[0], start: m.index, end: m.index + m[0].length,
      });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

/**
 * Mask an uploaded image. Returns { blob, downloadName, found }.
 *
 * Strategy: load image into canvas → run OCR via Tesseract.js (lazy-loaded
 * from CDN to keep main bundle small) → for each detected ID, draw black
 * rectangle at its bounding box → export canvas as PNG.
 *
 * Tesseract.js is HEAVY (~5 MB), so we lazy-load. For text-only paste,
 * maskText() is instant and doesn't need it.
 */
export async function maskImage(file, { onProgress = () => {} } = {}) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Please upload an image file (JPG / PNG).");
  }

  onProgress({ stage: "load", pct: 5 });

  // Lazy-load Tesseract from CDN
  if (!window.Tesseract) {
    onProgress({ stage: "load-ocr", pct: 10 });
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load OCR engine. Check network."));
      document.head.appendChild(s);
    });
  }

  onProgress({ stage: "decode", pct: 20 });
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  onProgress({ stage: "ocr", pct: 30 });
  const { data } = await window.Tesseract.recognize(canvas, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress({ stage: "ocr", pct: 30 + Math.round(m.progress * 50) });
      }
    },
  });

  onProgress({ stage: "redact", pct: 85 });

  // OCR returns word-level bboxes; we walk all words, group by line, search for patterns
  const found = [];
  const lines = data.lines || [];
  for (const line of lines) {
    const text = (line.text || "").trim();
    if (!text) continue;
    for (const [type, regex] of Object.entries(PATTERNS)) {
      const r = new RegExp(regex.source, regex.flags);
      if (r.test(text)) {
        // Approx bbox = line bbox. Conservative: redact whole line bbox.
        const bbox = line.bbox || {};
        if (bbox.x0 != null) {
          // Black rectangle with 4px padding
          ctx.fillStyle = "#000000";
          ctx.fillRect(bbox.x0 - 4, bbox.y0 - 4, (bbox.x1 - bbox.x0) + 8, (bbox.y1 - bbox.y0) + 8);
          // Add red border for clarity
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.strokeRect(bbox.x0 - 4, bbox.y0 - 4, (bbox.x1 - bbox.x0) + 8, (bbox.y1 - bbox.y0) + 8);
          found.push({ type, label: TYPE_LABEL[type], match: text });
        }
      }
    }
  }

  // Watermark — VRIKAAN attribution
  ctx.fillStyle = "rgba(20, 227, 197, 0.6)";
  ctx.font = `${Math.max(14, Math.floor(canvas.width / 60))}px Inter, Arial, sans-serif`;
  const label = "Masked by VRIKAAN · vrikaan.com/aadhaar-mask";
  const padX = 12, padY = 28;
  ctx.fillText(label, padX, canvas.height - padY);

  onProgress({ stage: "encode", pct: 95 });

  const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
  const stem = (file.name || "masked").replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
  onProgress({ stage: "done", pct: 100 });
  return {
    blob,
    downloadName: `${stem}_masked.png`,
    found,
    dimensions: { w: canvas.width, h: canvas.height },
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image."));
    img.src = URL.createObjectURL(file);
  });
}

export const PATTERN_TYPES = Object.keys(PATTERNS);
