/**
 * Invoice / Receipt PDF generation.
 * Pure client-side using jsPDF — no extra network calls or server load.
 *
 * Used after a successful payment to give the customer a downloadable
 * GST-style receipt. Saves directly to the user's machine and also
 * returns the Blob/data-URI for any caller that wants to email it.
 */
import { jsPDF } from "jspdf";

const BRAND = {
  name: "VRIKAAN",
  tagline: "Empowering Defenders for a Safer Digital Future",
  legal: "Vrikaan Cybersecurity",
  address: "India",
  email: "hello.vrikaan@gmail.com",
  website: "https://www.vrikaan.com",
};

const COLORS = {
  ink: [15, 23, 42],
  accent: [99, 102, 241],
  cyan: [20, 227, 197],
  muted: [100, 116, 139],
  border: [226, 232, 240],
};

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Build invoice PDF.
 * @param {Object} data
 * @param {string} data.invoiceNumber  – e.g. "VRK-2025-04-30-001"
 * @param {string} data.customerName
 * @param {string} data.customerEmail
 * @param {string} data.plan           – Standard / Advanced / Enterprise
 * @param {string} data.billing        – monthly / annual
 * @param {number} data.amount         – in INR
 * @param {string} data.transactionId  – Cashfree order id
 * @param {Date|string} data.paidAt
 * @param {string} [data.method]       – cashfree / upi / crypto
 * @returns {{ blob: Blob, dataUri: string, filename: string, doc: jsPDF }}
 */
export function buildInvoicePdf(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PAGE_W = doc.internal.pageSize.getWidth();
  let y = 56;

  // Header bar (accent stripe)
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, PAGE_W, 8, "F");

  // Brand block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.ink);
  doc.text(BRAND.name, 56, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(BRAND.tagline, 56, y + 16);

  // Invoice meta (right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.ink);
  doc.text("INVOICE", PAGE_W - 56, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Invoice #: ${data.invoiceNumber}`, PAGE_W - 56, y + 16, { align: "right" });
  doc.text(`Date: ${formatDate(data.paidAt)}`, PAGE_W - 56, y + 30, { align: "right" });

  y += 56;

  // Divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(56, y, PAGE_W - 56, y);
  y += 24;

  // Bill From / Bill To
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("BILL FROM", 56, y);
  doc.text("BILL TO", PAGE_W / 2 + 8, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(BRAND.legal, 56, y);
  doc.text(data.customerName || "Customer", PAGE_W / 2 + 8, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(BRAND.address, 56, y);
  doc.text(data.customerEmail || "—", PAGE_W / 2 + 8, y);
  y += 12;
  doc.text(BRAND.email, 56, y);
  y += 12;
  doc.text(BRAND.website, 56, y);
  y += 32;

  // Line items table — header
  doc.setFillColor(248, 250, 252);
  doc.rect(56, y, PAGE_W - 112, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);
  doc.text("DESCRIPTION", 64, y + 18);
  doc.text("BILLING", PAGE_W - 220, y + 18);
  doc.text("AMOUNT", PAGE_W - 64, y + 18, { align: "right" });
  y += 28;

  // Line item row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(`${BRAND.name} ${data.plan} subscription`, 64, y + 20);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(data.billing === "annual" ? "1 year of access" : "1 month of access", 64, y + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(data.billing === "annual" ? "Annual" : "Monthly", PAGE_W - 220, y + 20);
  doc.text(formatINR(data.amount), PAGE_W - 64, y + 20, { align: "right" });

  y += 56;
  doc.setDrawColor(...COLORS.border);
  doc.line(56, y, PAGE_W - 56, y);
  y += 18;

  // Totals block
  const labelX = PAGE_W - 200;
  const valueX = PAGE_W - 64;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text("Subtotal", labelX, y);
  doc.setTextColor(...COLORS.ink);
  doc.text(formatINR(data.amount), valueX, y, { align: "right" });
  y += 16;

  doc.setTextColor(...COLORS.muted);
  doc.text("Tax (GST)", labelX, y);
  doc.setTextColor(...COLORS.ink);
  doc.text(formatINR(0), valueX, y, { align: "right" });
  y += 22;

  doc.setDrawColor(...COLORS.border);
  doc.line(labelX - 8, y - 8, valueX + 8, y - 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.ink);
  doc.text("TOTAL PAID", labelX, y + 8);
  doc.setTextColor(...COLORS.accent);
  doc.text(formatINR(data.amount), valueX, y + 8, { align: "right" });
  y += 40;

  // Payment details box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(56, y, PAGE_W - 112, 80, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.ink);
  doc.text("PAYMENT DETAILS", 72, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Method:", 72, y + 40);
  doc.text("Transaction ID:", 72, y + 56);
  doc.text("Status:", 72, y + 72);

  doc.setTextColor(...COLORS.ink);
  doc.text(data.method || "Cashfree", 170, y + 40);
  doc.setFont("courier", "normal");
  doc.text(data.transactionId || "—", 170, y + 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94);
  doc.text("PAID", 170, y + 72);
  y += 100;

  // Footer
  doc.setDrawColor(...COLORS.border);
  doc.line(56, y, PAGE_W - 56, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Thank you for choosing VRIKAAN. For support contact " + BRAND.email, PAGE_W / 2, y, { align: "center" });
  doc.text("This is a computer-generated receipt and does not require a signature.", PAGE_W / 2, y + 12, { align: "center" });

  const filename = `VRIKAAN-Invoice-${data.invoiceNumber}.pdf`;
  const blob = doc.output("blob");
  const dataUri = doc.output("datauristring");
  return { blob, dataUri, filename, doc };
}

/**
 * Generate + immediately download.
 */
export function downloadInvoice(data) {
  const { doc, filename } = buildInvoicePdf(data);
  doc.save(filename);
}

/**
 * Build a deterministic invoice number from order + date.
 */
export function makeInvoiceNumber(orderId) {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const tail = (orderId || "").slice(-6).toUpperCase() || Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VRK-${ymd}-${tail}`;
}
