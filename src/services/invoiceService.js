/**
 * Premium GST-style Tax Invoice / payment receipt — client-side jsPDF.
 * Branded dark header, cyber hexagon mark, SAC line item, CGST+SGST split
 * back-computed from the GST-inclusive price, PAID pill, dark footer band.
 *
 * Set SUPPLIER.gstin + legal name/address to real registered details. While
 * gstin is empty it prints as a "Payment Receipt" (no tax breakup) so it's
 * never a misleading tax invoice.
 */
import { jsPDF } from "jspdf";

const SUPPLIER = {
  name: "VRIKAAN",
  tagline: "AI Cyber Defense — Made in India",
  legal: "Vrikaan Cybersecurity",      // TODO: Pvt Ltd legal name on incorporation
  address: ["Pune, Maharashtra", "India"],
  gstin: "",                            // TODO: real GSTIN → flips to TAX INVOICE
  state: "Maharashtra",
  stateCode: "27",
  sac: "998314",
  email: "hello@vrikaan.com",
  website: "www.vrikaan.com",
};

const GST_RATE = 0.18;
const PRICE_INCLUSIVE = true;
const PLAN_LABEL = { starter: "Standard", standard: "Standard", pro: "Advanced", advanced: "Advanced", family: "Family", enterprise: "Enterprise" };

// palette
const C = {
  dark: [9, 14, 26], slate: [15, 23, 42], ink: [15, 23, 42],
  teal: [20, 184, 166], indigo: [99, 102, 241], green: [22, 163, 74],
  muted: [100, 116, 139], faint: [247, 249, 252], line: [226, 232, 240],
  white: [241, 245, 249], gray: [148, 163, 184],
};

function inr(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
}
function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function planLabel(p) {
  if (!p) return "Subscription";
  return PLAN_LABEL[String(p).toLowerCase()] || (String(p).charAt(0).toUpperCase() + String(p).slice(1));
}
function taxBreakup(gross) {
  const total = Number(gross) || 0;
  const taxable = PRICE_INCLUSIVE ? total / (1 + GST_RATE) : total;
  const tax = PRICE_INCLUSIVE ? total - taxable : total * GST_RATE;
  return { taxable: r2(taxable), cgst: r2(tax / 2), sgst: r2(tax / 2), total: PRICE_INCLUSIVE ? total : r2(total + tax) };
}
const r2 = (n) => Math.round(n * 100) / 100;

// filled hexagon from 6 triangles (jsPDF has no polygon fill)
function fillHex(doc, cx, cy, rad, color) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i - 90); pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
  doc.setFillColor(...color);
  for (let i = 0; i < 6; i++) { const a = pts[i], b = pts[(i + 1) % 6]; doc.triangle(cx, cy, a[0], a[1], b[0], b[1], "F"); }
}

export function buildInvoicePdf(data = {}) {
  const isTax = !!SUPPLIER.gstin;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 48, R = W - 48;

  const amount = Number(data.amount) || 0;
  const plan = planLabel(data.plan);
  const billing = data.billing === "annual" ? "Annual" : "Monthly";
  const bk = taxBreakup(amount);

  // ── HEADER BAND ──────────────────────────────────────────────
  doc.setFillColor(...C.dark); doc.rect(0, 0, W, 116, "F");
  doc.setFillColor(...C.teal); doc.rect(0, 116, W, 3, "F"); // accent rule

  // hexagon mark + V
  fillHex(doc, L + 22, 52, 22, C.teal);
  fillHex(doc, L + 22, 52, 13, C.dark);
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...C.teal);
  doc.text("V", L + 22, 58, { align: "center" });

  // wordmark
  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(...C.white);
  doc.text(SUPPLIER.name, L + 54, 50);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.gray);
  doc.text(SUPPLIER.tagline, L + 54, 66);
  doc.text(SUPPLIER.website + "  ·  " + SUPPLIER.email, L + 54, 80);

  // doc title + meta (right)
  doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(...C.teal);
  doc.text(isTax ? "TAX INVOICE" : "PAYMENT RECEIPT", R, 46, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.gray);
  doc.text(`Invoice  ${data.invoiceNumber || "—"}`, R, 64, { align: "right" });
  doc.text(`Date  ${fmtDate(data.paidAt)}`, R, 78, { align: "right" });
  // PAID pill
  doc.setFillColor(...C.green); doc.roundedRect(R - 56, 88, 56, 18, 9, 9, "F");
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(255, 255, 255);
  doc.text("PAID", R - 28, 100, { align: "center" });

  // ── PARTIES ──────────────────────────────────────────────────
  let y = 152;
  const colR = W / 2 + 6;
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...C.teal);
  doc.text("FROM", L, y); doc.text("BILLED TO", colR, y);
  y += 15;
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...C.ink);
  doc.text(SUPPLIER.legal, L, y);
  doc.text(data.customerName || "Customer", colR, y);
  y += 14;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.muted);
  let ly = y, ry = y;
  SUPPLIER.address.forEach((t) => { doc.text(t, L, ly); ly += 12; });
  if (isTax) { doc.text(`GSTIN  ${SUPPLIER.gstin}`, L, ly); ly += 12; }
  doc.text(`State  ${SUPPLIER.state} (${SUPPLIER.stateCode})`, L, ly); ly += 12;
  doc.text(data.customerEmail || "—", colR, ry); ry += 12;
  doc.text(`Place of supply  ${SUPPLIER.state} (${SUPPLIER.stateCode})`, colR, ry); ry += 12;
  y = Math.max(ly, ry) + 20;

  // ── ITEMS TABLE ──────────────────────────────────────────────
  doc.setFillColor(...C.slate); doc.rect(L, y, R - L, 26, "F");
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...C.white);
  doc.text("DESCRIPTION", L + 12, y + 17);
  doc.text("SAC", R - 240, y + 17);
  doc.text("QTY", R - 175, y + 17);
  doc.text(isTax ? "TAXABLE" : "AMOUNT", R - 12, y + 17, { align: "right" });
  y += 26;

  doc.setFillColor(...C.faint); doc.rect(L, y, R - L, 44, "F"); // zebra row
  doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...C.ink);
  doc.text(`${SUPPLIER.name} ${plan} Plan`, L + 12, y + 20);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...C.muted);
  doc.text(`${billing} subscription · ${billing === "Annual" ? "1 year" : "1 month"} of access`, L + 12, y + 33);
  doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...C.ink);
  doc.text(isTax ? SUPPLIER.sac : "—", R - 240, y + 20);
  doc.text("1", R - 175, y + 20);
  doc.text(inr(isTax ? bk.taxable : amount), R - 12, y + 20, { align: "right" });
  y += 44 + 22;

  // ── TOTALS ───────────────────────────────────────────────────
  const lx = R - 210, vx = R;
  const trow = (label, val) => {
    doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...C.muted);
    doc.text(label, lx, y);
    doc.setTextColor(...C.ink); doc.text(val, vx, y, { align: "right" });
    y += 17;
  };
  if (isTax) {
    trow("Taxable value", inr(bk.taxable));
    trow(`CGST @ ${(GST_RATE / 2 * 100).toFixed(0)}%`, inr(bk.cgst));
    trow(`SGST @ ${(GST_RATE / 2 * 100).toFixed(0)}%`, inr(bk.sgst));
  } else {
    trow("Subtotal", inr(amount));
  }
  y += 4;
  // teal total card
  doc.setFillColor(236, 253, 248); doc.roundedRect(lx - 14, y - 4, vx - lx + 26, 30, 6, 6, "F");
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...C.ink);
  doc.text("TOTAL PAID", lx, y + 15);
  doc.setTextColor(...C.teal); doc.text(inr(bk.total), vx, y + 15, { align: "right" });
  y += 30 + 26;

  // ── PAYMENT DETAILS CARD ─────────────────────────────────────
  doc.setDrawColor(...C.line).setLineWidth(0.8);
  doc.roundedRect(L, y, R - L, 76, 8, 8, "S");
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.teal);
  doc.text("PAYMENT DETAILS", L + 16, y + 20);
  const dx = L + 16, dv = L + 140;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C.muted);
  doc.text("Method", dx, y + 38); doc.text("Transaction ID", dx, y + 54); doc.text("Status", dx, y + 70);
  doc.setTextColor(...C.ink);
  doc.text(String(data.method || "Cashfree"), dv, y + 38);
  doc.setFont("courier", "normal").text(String(data.transactionId || "—"), dv, y + 54);
  doc.setFont("helvetica", "bold").setTextColor(...C.green).text("PAID · " + fmtDate(data.paidAt), dv, y + 70);

  // ── FOOTER BAND ──────────────────────────────────────────────
  const fy = H - 64;
  doc.setFillColor(...C.dark); doc.rect(0, fy, W, 64, "F");
  doc.setFillColor(...C.teal); doc.rect(0, fy, W, 2, "F");
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...C.white);
  doc.text(`Thank you for choosing ${SUPPLIER.name}`, W / 2, fy + 22, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...C.gray);
  const note = (PRICE_INCLUSIVE && isTax)
    ? "Amount inclusive of GST · CGST+SGST shown for intra-state supply · Computer-generated, no signature required"
    : "Computer-generated document · no signature required";
  doc.text(note, W / 2, fy + 38, { align: "center" });
  doc.text(`${SUPPLIER.website}  ·  ${SUPPLIER.email}`, W / 2, fy + 52, { align: "center" });

  const filename = `VRIKAAN-${isTax ? "Invoice" : "Receipt"}-${data.invoiceNumber || "VRK"}.pdf`;
  return { blob: doc.output("blob"), dataUri: doc.output("datauristring"), filename, doc };
}

export function downloadInvoice(data) {
  const { doc, filename } = buildInvoicePdf(data);
  doc.save(filename);
}

export function makeInvoiceNumber(orderId) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const tail = (orderId || "").slice(-6).toUpperCase() || Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VRK-${ymd}-${tail}`;
}
