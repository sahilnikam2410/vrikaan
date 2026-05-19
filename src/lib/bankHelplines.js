/**
 * Indian bank 24×7 fraud / block-card helplines.
 *
 * Used by OTPDecay + ScamRecovery + future tools that need to dispatch
 * users to the right bank fast. Numbers verified Mar 2026 — verify
 * against the back of card before publishing.
 */

export const BANKS = [
  // Public sector
  { id: "sbi",        name: "State Bank of India",           phone: "1800-1111-09",    blockPhone: "1800-11-2211",     internet: "https://onlinesbi.sbi" },
  { id: "pnb",        name: "Punjab National Bank",          phone: "1800-180-2222",   blockPhone: "1800-180-2222",    internet: "https://netpnb.com" },
  { id: "boi",        name: "Bank of Baroda",                phone: "1800-258-1700",   blockPhone: "1800-258-1700",    internet: "https://bankofbaroda.in" },
  { id: "boi2",       name: "Bank of India",                 phone: "1800-103-1906",   blockPhone: "1800-220-229",     internet: "https://bankofindia.co.in" },
  { id: "canara",     name: "Canara Bank",                   phone: "1800-425-0018",   blockPhone: "1800-425-0018",    internet: "https://canarabank.com" },
  { id: "union",      name: "Union Bank of India",           phone: "1800-22-2244",    blockPhone: "1800-22-2244",     internet: "https://unionbankofindia.co.in" },

  // Private sector
  { id: "hdfc",       name: "HDFC Bank",                     phone: "1800-258-6161",   blockPhone: "1800-258-6161",    internet: "https://netbanking.hdfcbank.com" },
  { id: "icici",      name: "ICICI Bank",                    phone: "1860-120-7777",   blockPhone: "1860-120-7777",    internet: "https://icicibank.com" },
  { id: "axis",       name: "Axis Bank",                     phone: "1860-419-5555",   blockPhone: "1860-419-5555",    internet: "https://axisbank.com" },
  { id: "kotak",      name: "Kotak Mahindra Bank",           phone: "1860-266-2666",   blockPhone: "1860-266-2666",    internet: "https://kotak.com" },
  { id: "yes",        name: "Yes Bank",                      phone: "1800-1200",       blockPhone: "1800-1200",        internet: "https://yesbank.in" },
  { id: "indusind",   name: "IndusInd Bank",                 phone: "1860-500-5004",   blockPhone: "1860-500-5004",    internet: "https://indusind.com" },
  { id: "rbl",        name: "RBL Bank",                      phone: "022-6232-7777",   blockPhone: "022-6232-7777",    internet: "https://rblbank.com" },

  // Small finance + payments
  { id: "paytm",      name: "Paytm Payments Bank",           phone: "0120-4456-456",   blockPhone: "0120-4456-456",    internet: "https://paytm.com" },
  { id: "airtel",     name: "Airtel Payments Bank",          phone: "400 / 8800-688-006", blockPhone: "400",           internet: "https://airtel.in" },
];

export const UNIVERSAL = [
  { label: "🚨 National Cyber Crime Helpline", phone: "1930",         note: "Single call covers ALL banks · 24×7 · ENG/HIN" },
  { label: "💳 NPCI UPI dispute",              phone: "1800-120-1740", note: "UPI fraud only" },
  { label: "🏦 RBI Banking Ombudsman",         phone: "14448",         note: "Bank disputes >30d unresolved" },
];

/** Find a bank by partial name (used in autocomplete) */
export function searchBanks(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return BANKS.filter(b => b.id.includes(q) || b.name.toLowerCase().includes(q)).slice(0, 6);
}
