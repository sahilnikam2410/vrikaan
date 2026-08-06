/**
 * Academy completion certificate — client-side jsPDF (landscape A4).
 * Premium dark VRIKAAN design: teal border, hexagon mark, recipient name,
 * test title, score, date, verification id. Generated on a passed mock test.
 */
import { jsPDF } from "jspdf";

const C = { dark: [9, 14, 26], teal: [20, 184, 166], ink: [241, 245, 249], mut: [148, 163, 184], gold: [251, 191, 36] };

function fillHex(doc, cx, cy, rad, color) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i - 90); pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
  doc.setFillColor(...color);
  for (let i = 0; i < 6; i++) { const a = pts[i], b = pts[(i + 1) % 6]; doc.triangle(cx, cy, a[0], a[1], b[0], b[1], "F"); }
}

export function buildCertificate({ name, testTitle, scorePct, date, certId }) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // bg
  doc.setFillColor(...C.dark); doc.rect(0, 0, W, H, "F");
  // double teal border
  doc.setDrawColor(...C.teal); doc.setLineWidth(3); doc.rect(24, 24, W - 48, H - 48, "S");
  doc.setLineWidth(0.8); doc.setDrawColor(20, 184, 166); doc.rect(34, 34, W - 68, H - 68, "S");
  // corner accents
  doc.setFillColor(...C.teal);
  [[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].forEach(([x, y]) => doc.circle(x, y, 4, "F"));

  const cx = W / 2;
  // hexagon mark + V
  fillHex(doc, cx, 96, 24, C.teal); fillHex(doc, cx, 96, 14, C.dark);
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...C.teal);
  doc.text("V", cx, 103, { align: "center" });

  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...C.teal);
  doc.text("VRIKAAN ACADEMY", cx, 138, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(22).setTextColor(...C.ink);
  doc.text("Certificate of Completion", cx, 172, { align: "center" });

  doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(...C.mut);
  doc.text("This certifies that", cx, 210, { align: "center" });

  doc.setFont("helvetica", "bold").setFontSize(34).setTextColor(...C.ink);
  doc.text(name || "Cyber Defender", cx, 250, { align: "center" });
  // underline name
  const nameW = doc.getTextWidth(name || "Cyber Defender");
  doc.setDrawColor(...C.teal).setLineWidth(1); doc.line(cx - nameW / 2 - 20, 262, cx + nameW / 2 + 20, 262);

  doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(...C.mut);
  doc.text("has successfully passed", cx, 292, { align: "center" });
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...C.teal);
  doc.text(testTitle || "Cyber Safety Test", cx, 320, { align: "center" });

  // score pill
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...C.gold);
  doc.text(`Score: ${scorePct ?? 0}%`, cx, 350, { align: "center" });

  // footer row
  const fy = H - 70;
  doc.setDrawColor(...C.mut).setLineWidth(0.5);
  doc.line(80, fy, 230, fy); doc.line(W - 230, fy, W - 80, fy);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...C.mut);
  doc.text(date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 155, fy + 16, { align: "center" });
  doc.text("Date", 155, fy + 30, { align: "center" });
  doc.text("VRIKAAN · vrikaan.com", W - 155, fy + 16, { align: "center" });
  doc.text("Issued by", W - 155, fy + 30, { align: "center" });

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...C.mut);
  doc.text(`Verify ID: ${certId || "VRK-CERT"}  ·  Built by SOC analysts, Pune, India`, cx, H - 40, { align: "center" });

  return doc;
}

export function downloadCertificate(data) {
  const doc = buildCertificate(data);
  doc.save(`VRIKAAN-Certificate-${(data.testTitle || "test").replace(/\s+/g, "-")}.pdf`);
}

/**
 * Ask the server to issue a certificate and return its id.
 *
 * Both the id and the holder's name are decided server-side from the caller's
 * Firebase ID token — the client used to generate the id and post the name it
 * wanted, with no authentication at all, which let anyone mint or overwrite a
 * certificate in any name.
 *
 * Returns the recorded holder name alongside the id so the rendered
 * certificate shows exactly what /verify/:id will report — a printed name that
 * differs from the verified one is its own small forgery.
 *
 * @returns {Promise<{certId: string, name: string}|null>} null if issuance failed.
 */
export async function issueCert({ title, kind = "course", score = null }) {
  try {
    const { auth } = await import("../firebase/config");
    const user = auth.currentUser;
    const idToken = await user?.getIdToken();
    if (!idToken) return null;
    const r = await fetch("/api/tools?tool=cert-register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ title, kind, ...(score == null ? {} : { score }) }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.certId) return null;
    // The server derives the holder from the token the same way; mirroring it
    // here keeps the PNG/PDF consistent with the verification page.
    const name = user.displayName || user.email?.split("@")[0] || "VRIKAAN Learner";
    return { certId: data.certId, name };
  } catch { return null; }
}
