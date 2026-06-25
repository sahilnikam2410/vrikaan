// Shareable scam-check warning card.
//
// Growth loop: every scam check can become a branded image a user forwards to
// their family WhatsApp group — the exact channel scams (and warnings) spread
// on in India. Each share carries the VRIKAAN mark + vrikaan.com + 1930, so a
// recipient sees a clear verdict and a link back to check their own messages.
//
// Canvas-only (no server cost), 1080×1080 so it doubles as a WhatsApp status.

const PALETTE = {
  scam:           { c: "#ef4444", title: "⚠️ SCAM ALERT",   tag: "Do NOT pay or click" },
  "likely-scam":  { c: "#ef4444", title: "⚠️ LIKELY SCAM",  tag: "Treat as fraud" },
  suspicious:     { c: "#fbbf24", title: "⚠️ SUSPICIOUS",   tag: "Verify before acting" },
  "probably-safe":{ c: "#22c55e", title: "✓ LOOKS SAFE",    tag: "Still stay alert" },
};

const wrapLines = (ctx, text, maxWidth, maxLines) => {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const used = lines.join(" ").split(" ").length;
  if (used < words.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/\.*$/, "") + "…";
  return lines;
};

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Returns a Promise<Blob> of the rendered PNG card.
export async function buildScamCard({ verdict, riskScore = 0, snippet = "" }) {
  const p = PALETTE[verdict] || PALETTE.suspicious;
  const S = 1080;
  const cv = document.createElement("canvas");
  cv.width = S; cv.height = S;
  const ctx = cv.getContext("2d");

  // Background
  ctx.fillStyle = "#060a14";
  ctx.fillRect(0, 0, S, S);
  const glow = ctx.createRadialGradient(S / 2, 360, 60, S / 2, 360, 720);
  glow.addColorStop(0, p.c + "26");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // Top accent bar
  ctx.fillStyle = p.c;
  ctx.fillRect(0, 0, S, 14);

  // Brand row
  const wolf = await loadImage("/wolf-compact.png");
  if (wolf) ctx.drawImage(wolf, 64, 60, 84, 84);
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "800 46px 'Vrikaan Sans', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("VRIKAAN", 164, 104);
  ctx.fillStyle = "#14b8a6";
  ctx.font = "600 22px Arial, sans-serif";
  ctx.fillText("AI Scam Check", 164, 140);

  // Verdict title
  ctx.fillStyle = p.c;
  ctx.font = "900 92px 'Vrikaan Sans', Arial, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(p.title, 64, 320);

  // Risk score pill
  ctx.fillStyle = p.c + "1f";
  const pillW = 360, pillH = 64;
  ctx.beginPath();
  ctx.roundRect(64, 350, pillW, pillH, 32);
  ctx.fill();
  ctx.fillStyle = p.c;
  ctx.font = "800 34px Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`Risk ${Math.round(riskScore)}/100 · ${p.tag}`, 88, 384);

  // Message snippet box
  if (snippet) {
    const boxY = 460, boxH = 320;
    ctx.fillStyle = "rgba(148,163,184,0.06)";
    ctx.strokeStyle = "rgba(148,163,184,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(64, boxY, S - 128, boxH, 24);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.font = "700 22px Arial, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("THE MESSAGE CHECKED", 96, boxY + 48);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "400 32px Arial, sans-serif";
    const lines = wrapLines(ctx, snippet, S - 192, 6);
    lines.forEach((ln, i) => ctx.fillText(ln, 96, boxY + 100 + i * 44));
  }

  // Footer
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "800 36px 'Vrikaan Sans', Arial, sans-serif";
  ctx.fillText("Check your messages free → vrikaan.com", 64, 920);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 28px Arial, sans-serif";
  ctx.fillText("Cyber-fraud helpline: 1930 · cybercrime.gov.in", 64, 968);
  ctx.fillStyle = p.c;
  ctx.font = "700 26px Arial, sans-serif";
  ctx.fillText("🐺 Forwarded by a family member who cares about your safety", 64, 1016);

  return new Promise((resolve) => cv.toBlob((b) => resolve(b), "image/png", 0.92));
}

const LABELS = {
  scam: "a SCAM", "likely-scam": "a LIKELY SCAM",
  suspicious: "SUSPICIOUS", "probably-safe": "probably safe",
};

// Tries native file share (image) → falls back to WhatsApp text link.
// Returns "shared" | "whatsapp" | "download" | "error".
export async function shareScamCard({ verdict, riskScore, snippet }) {
  const label = LABELS[verdict] || "suspicious";
  const text = `⚠️ VRIKAAN scam check: this message looks ${label} (${Math.round(riskScore || 0)}/100 risk). Check yours free at https://vrikaan.com 🐺 Report fraud: call 1930`;
  let blob;
  try { blob = await buildScamCard({ verdict, riskScore, snippet }); } catch { blob = null; }

  // 1. Native share with the image file (mobile — opens WhatsApp/etc).
  if (blob && navigator.canShare) {
    const file = new File([blob], "vrikaan-scam-check.png", { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, title: "VRIKAAN Scam Check" });
        return "shared";
      } catch (e) {
        if (e?.name === "AbortError") return "shared"; // user cancelled — not an error
      }
    }
  }

  // 2. Desktop / no file-share: download the card + open WhatsApp web with text.
  if (blob) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "vrikaan-scam-check.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch { /* ignore */ }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  return blob ? "download" : "whatsapp";
}
