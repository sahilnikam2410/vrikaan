/**
 * GST-style Tax Invoice / payment receipt — pure client-side via jsPDF.
 * Generated after a successful payment. India-first: SAC code, place of
 * supply, CGST+SGST split back-computed from the GST-inclusive price.
 *
 * NOTE: set SUPPLIER.gstin + legal name/address to your real registered
 * details. While gstin is empty the document prints as a "Payment Receipt"
 * (not a tax invoice) and omits the GST breakup, so it's never misleading.
 */
import { jsPDF } from "jspdf";

// ── Supplier (you). Fill these with real registered details. ──────────
const SUPPLIER = {
  name: "VRIKAAN",
  tagline: "AI Cyber Defense — Made in India",
  legal: "Vrikaan Cybersecurity",      // TODO: update to Pvt Ltd legal name on incorporation
  address: ["Pune, Maharashtra", "India"],
  gstin: "",                            // TODO: real GSTIN (e.g. "27ABCDE1234F1Z5"). Empty → receipt mode.
  state: "Maharashtra",
  stateCode: "27",
  sac: "998314",                        // SAC: IT / software / cybersecurity services
  email: "hello@vrikaan.com",
  website: "https://www.vrikaan.com",
};

const GST_RATE = 0.18;          // 18% on IT services
const PRICE_INCLUSIVE = true;   // displayed plan prices already include GST

const PLAN_LABEL = { starter: "Standard", standard: "Standard", pro: "Advanced", advanced: "Advanced", family: "Family", enterprise: "Enterprise" };

const COLORS = {
  ink: [15, 23, 42], accent: [99, 102, 241], muted: [100, 116, 139],
  border: [226, 232, 240], faint: [248, 250, 252], green: [22, 163, 74],
};

function inr(n) {
  const v = Number(n) || 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function planLabel(p) {
  if (!p) return "Subscription";
  return PLAN_LABEL[String(p).toLowerCase()] || (String(p).charAt(0).toUpperCase() + String(p).slice(1));
}

// Back-compute taxable value + tax from the (inclusive) gross amount.
function taxBreakup(gross) {
  const total = Number(gross) || 0;
  const taxable = PRICE_INCLUSIVE ? total / (1 + GST_RATE) : total;
  const tax = PRICE_INCLUSIVE ? total - taxable : total * GST_RATE;
  return {
    taxable: Math.round(taxable * 100) / 100,
    cgst: Math.round((tax / 2) * 100) / 100,
    sgst: Math.round((tax / 2) * 100) / 100,
    total: PRICE_INCLUSIVE ? total : total + tax,
  };
}

export function buildInvoicePdf(data = {}) {
  const isTaxInvoice = !!SUPPLIER.gstin;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const L = 56, R = W - 56;
  let y = 50;

  const amount = Number(data.amount) || 0;
  const plan = planLabel(data.plan);
  const billing = data.billing === "annual" ? "Annual" : "Monthly";
  const bk = taxBreakup(amount);

  // accent stripe
  doc.setFillColor(...COLORS.accent); doc.rect(0, 0, W, 8, "F");

  // brand
  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(...COLORS.ink);
  doc.text(SUPPLIER.name, L, y);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...COLORS.muted);
  doc.text(SUPPLIER.tagline, L, y + 15);

  // doc title + meta (right)
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...COLORS.ink);
  doc.text(isTaxInvoice ? "TAX INVOICE" : "PAYMENT RECEIPT", R, y, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...COLORS.muted);
  doc.text(`No: ${data.invoiceNumber || "—"}`, R, y + 15, { align: "right" });
  doc.text(`Date: ${fmtDate(data.paidAt)}`, R, y + 28, { align: "right" });

  y += 50;
  doc.setDrawColor(...COLORS.border).setLineWidth(0.5).line(L, y, R, y);
  y += 22;

  // Seller / Buyer columns
  const colR = W / 2 + 8;
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...COLORS.muted);
  doc.text("SELLER", L, y); doc.text("BILL TO", colR, y);
  y += 14;
  doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...COLORS.ink);
  doc.text(SUPPLIER.legal, L, y);
  doc.text(data.customerName || "Customer", colR, y);
  y += 13;
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...COLORS.muted);
  let ly = y, ry = y;
  SUPPLIER.address.forEach((line) => { doc.text(line, L, ly); ly += 11; });
  if (isTaxInvoice) { doc.text(`GSTIN: ${SUPPLIER.gstin}`, L, ly); ly += 11; }
  doc.text(`State: ${SUPPLIER.state} (${SUPPLIER.stateCode})`, L, ly); ly += 11;
  doc.text(SUPPLIER.email, L, ly); ly += 11;
  doc.text(data.customerEmail || "—", colR, ry); ry += 11;
  doc.text(`Place of supply: ${SUPPLIER.state} (${SUPPLIER.stateCode})`, colR, ry); ry += 11;
  y = Math.max(ly, ry) + 18;

  // Line-items table header
  doc.setFillColor(...COLORS.faint); doc.rect(L, y, R - L, 26, "F");
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...COLORS.ink);
  doc.text("DESCRIPTION", L + 10, y + 17);
  doc.text("SAC", R - 250, y + 17);
  doc.text("QTY", R - 180, y + 17);
  doc.text(isTaxInvoice ? "TAXABLE" : "AMOUNT", R - 10, y + 17, { align: "right" });
  y += 26;

  // Line item
  doc.setFont("helvetica", "normal").setFontSize(10.5).setTextColor(...COLORS.ink);
  doc.text(`${SUPPLIER.name} ${plan} — ${billing} subscription`, L + 10, y + 19);
  doc.setFontSize(8.5).setTextColor(...COLORS.muted);
  doc.text(billing === "Annual" ? "1 year of access" : "1 month of access", L + 10, y + 32);
  doc.setFontSize(9.5).setTextColor(...COLORS.ink);
  doc.text(isTaxInvoice ? SUPPLIER.sac : "—", R - 250, y + 19);
  doc.text("1", R - 180, y + 19);
  doc.text(inr(isTaxInvoice ? bk.taxable : amount), R - 10, y + 19, { align: "right" });
  y += 48;
  doc.setDrawColor(...COLORS.border).line(L, y, R, y);
  y += 18;

  // Totals (right aligned block)
  const lx = R - 200, vx = R;
  const row = (label, val, opts = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal").setFontSize(opts.bold ? 12 : 9.5);
    doc.setTextColor(...(opts.bold ? COLORS.ink : COLORS.muted));
    doc.text(label, lx, y);
    doc.setTextColor(...(opts.accent ? COLORS.accent : COLORS.ink));
    doc.text(val, vx, y, { align: "right" });
    y += opts.bold ? 0 : 15;
  };
  if (isTaxInvoice) {
    row("Taxable value", inr(bk.taxable));
    row(`CGST @ ${(GST_RATE / 2 * 100).toFixed(0)}%`, inr(bk.cgst));
    row(`SGST @ ${(GST_RATE / 2 * 100).toFixed(0)}%`, inr(bk.sgst));
  } else {
    row("Subtotal", inr(amount));
  }
  y += 6;
  doc.setDrawColor(...COLORS.border).line(lx - 8, y - 8, vx + 8, y - 8);
  row("TOTAL PAID", inr(bk.total), { bold: true, accent: true });
  y += 36;

  // Payment details box
  doc.setFillColor(...COLORS.faint); doc.roundedRect(L, y, R - L, 78, 6, 6, "F");
  doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...COLORS.ink);
  doc.text("PAYMENT DETAILS", L + 16, y + 20);
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...COLORS.muted);
  doc.text("Method:", L + 16, y + 38);
  doc.text("Transaction ID:", L + 16, y + 54);
  doc.text("Status:", L + 16, y + 70);
  doc.setTextColor(...COLORS.ink);
  doc.text(String(data.method || "Cashfree"), L + 130, y + 38);
  doc.setFont("courier", "normal");
  doc.text(String(data.transactionId || "—"), L + 130, y + 54);
  doc.setFont("helvetica", "bold").setTextColor(...COLORS.green);
  doc.text("PAID", L + 130, y + 70);
  y += 98;

  // Footer
  doc.setDrawColor(...COLORS.border).line(L, y, R, y);
  y += 16;
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...COLORS.muted);
  if (PRICE_INCLUSIVE && isTaxInvoice) {
    doc.text("Amount is inclusive of GST. CGST + SGST shown for intra-state supply.", W / 2, y, { align: "center" }); y += 11;
  }
  doc.text(`Thank you for choosing ${SUPPLIER.name}. Support: ${SUPPLIER.email}`, W / 2, y, { align: "center" });
  y += 11;
  doc.text("Computer-generated document — no signature required.", W / 2, y, { align: "center" });

  const filename = `VRIKAAN-${isTaxInvoice ? "Invoice" : "Receipt"}-${data.invoiceNumber || "VRK"}.pdf`;
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
