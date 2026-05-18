/**
 * Indian festival + commerce-moment fraud calendar.
 *
 * Each entry describes a recurring high-risk window when scams spike,
 * the dominant scam patterns observed historically, and defensive
 * actions a user can take 7 days before the event.
 *
 * Dates calculated from the Hindu / Gregorian calendar w/ rough offsets.
 * For accurate astronomical dates, replace with a lunar-calendar lib.
 * Current entries cover 2026.
 */

export const FESTIVALS = [
  {
    id: "diwali-2026",
    name: "Diwali",
    nameHi: "दिवाली",
    date: "2026-11-08", // approximate — actual date varies
    emoji: "🪔",
    color: "#F59E0B",
    fraudSpike: "+380%",
    topScams: [
      {
        title: "Fake bonus / Diwali gift SMS from \"HR\"",
        pattern: "\"Your Diwali bonus ₹15,000 has been credited. Click to claim: bit.ly/diwali-claim\"",
        defense: "Real HR never uses bit.ly. Check the company portal directly. Long-press → Copy URL → paste into vrikaan.com/scam-check.",
      },
      {
        title: "Fake e-commerce Diwali deals",
        pattern: "WhatsApp message: \"₹89,990 iPhone 17 — only 200 units left. Order now: flipkart-deals.in\"",
        defense: "Real Flipkart never uses substring domains. Always go to flipkart.com from your bookmarks, never from a link.",
      },
      {
        title: "Fake delivery / customs charges",
        pattern: "\"Your Diwali parcel held at DHL customs. Pay ₹35 to release: dhl-india.in/pay\"",
        defense: "Real couriers don't ask for payment via SMS link. Call the brand's official helpline from a Google search you typed yourself.",
      },
      {
        title: "QR code phishing at sweet shops",
        pattern: "Stickers pasted over real shop QR — money goes to attacker, merchant name spoofed",
        defense: "Type UPI ID manually. Verify merchant name shown in your UPI app before tapping Pay. ₹1 test first.",
      },
    ],
    actions: [
      "Set a family WhatsApp safe-word for forwarded \"deal\" messages",
      "Bookmark official Flipkart / Amazon URLs — don't search Google around Diwali (typo-domains rank)",
      "Enable transaction alerts on every UPI app for Diwali week",
      "Hold weekly family call on UPI hygiene — grandparents are #1 target",
    ],
  },
  {
    id: "holi-2026",
    name: "Holi",
    nameHi: "होली",
    date: "2026-03-14",
    emoji: "🎨",
    color: "#EC4899",
    fraudSpike: "+210%",
    topScams: [
      {
        title: "Fake party-pass / event-booking apps",
        pattern: "\"Big Holi party at XYZ farmhouse — book on holicelebrations.in\" — fake site collects card details",
        defense: "Use BookMyShow / Insider for events. Avoid \"farm house\" Instagram ads with no permanent URL.",
      },
      {
        title: "Color / item delivery scams",
        pattern: "Cheap Holi color orders from Insta sellers — money taken, no delivery, account deleted",
        defense: "Buy from established sellers w/ COD option only. Pay-on-delivery survives most fraud.",
      },
      {
        title: "Fake Holi greeting cards w/ malware APK",
        pattern: "WhatsApp: \"Happy Holi 🎨 download this card\" → installs spyware APK",
        defense: "NEVER install APK from links. Tap-tap-tap closes the WhatsApp tab without thinking — pause.",
      },
    ],
    actions: [
      "Disable \"install from unknown sources\" on family Android phones",
      "Set up Google Family Link on parents' / kids' devices",
      "Pre-download legitimate Holi music playlists — no need to search around the festival",
    ],
  },
  {
    id: "raksha-bandhan-2026",
    name: "Raksha Bandhan",
    nameHi: "रक्षाबंधन",
    date: "2026-08-28",
    emoji: "🪢",
    color: "#A855F7",
    fraudSpike: "+170%",
    topScams: [
      {
        title: "Fake online rakhi-delivery sites",
        pattern: "Pop-up Insta ads selling \"premium rakhi\" — collect address + UPI, never deliver",
        defense: "FNP / IGP / Archies are the only large legitimate online rakhi sellers. Verify URL exactly.",
      },
      {
        title: "Sibling-impersonation OTP request",
        pattern: "\"Bhaiya please send me OTP that just came, my bank app is stuck\" — sent from spoofed number",
        defense: "Never share OTP. Call the sibling back on their saved number — not the one calling.",
      },
    ],
    actions: [
      "Order rakhis 10+ days in advance from known retailers",
      "Brief siblings: never share OTP, even with each other",
    ],
  },
  {
    id: "navratri-2026",
    name: "Navratri",
    nameHi: "नवरात्रि",
    date: "2026-10-13",
    emoji: "💃",
    color: "#F97316",
    fraudSpike: "+140%",
    topScams: [
      {
        title: "Fake Garba pass / event booking",
        pattern: "Insta ads for \"Falguni Pathak Navratri night\" — sells fake tickets, vanishes after collecting payment",
        defense: "Only book via BookMyShow, Insider, or organizer's official social handle (verify blue tick).",
      },
      {
        title: "Bidesi / NRI investment scam",
        pattern: "\"Navratri lucky stock tip — 30% return guaranteed by Diwali\" — Telegram pump-and-dump",
        defense: "SEBI does NOT register stock tip channels. Any \"guaranteed\" return = fraud. Report at sebi.gov.in.",
      },
    ],
    actions: [
      "Verify event organizer's Insta blue tick before paying for passes",
      "Block any Telegram group offering \"sure-shot\" stock tips",
    ],
  },
  {
    id: "republic-day-2026",
    name: "Republic Day",
    nameHi: "गणतंत्र दिवस",
    date: "2026-01-26",
    emoji: "🇮🇳",
    color: "#22C55E",
    fraudSpike: "+95%",
    topScams: [
      {
        title: "Fake \"government subsidy\" SMS",
        pattern: "\"PM-KISAN ₹6,000 credit pending — verify Aadhaar at pmkisan-verify.in\"",
        defense: "Real PM-KISAN never uses non-gov.in domains. Check status only at pmkisan.gov.in.",
      },
      {
        title: "Fake DBT (Direct Benefit Transfer) updates",
        pattern: "\"Your DBT subsidy of ₹2,500 has been credited — confirm bank by clicking\"",
        defense: "Banks never ask you to confirm anything via SMS link. Open your bank app directly.",
      },
    ],
    actions: [
      "Tell family: any \"government money pending\" message is fraud",
      "Check actual PM-KISAN / DBT status via official mobile app, not SMS links",
    ],
  },
  {
    id: "wedding-season-2026",
    name: "Wedding Season",
    nameHi: "शादी का मौसम",
    date: "2026-11-20",
    emoji: "💍",
    color: "#EAB308",
    fraudSpike: "+250%",
    topScams: [
      {
        title: "Fake wedding photographer / caterer scams",
        pattern: "Instagram ads from \"Royal Photography\" — collect ₹50k advance, vanish week before event",
        defense: "Verify GST number at gst.gov.in. Demand video walkthrough of past events. Pay max 25% advance, rest after delivery.",
      },
      {
        title: "Wedding-loan apps targeting Indian families",
        pattern: "\"Instant wedding loan ₹5 lakh — 5-min approval\" — predatory APR + harassment + data theft",
        defense: "RBI-registered NBFCs only. Check sachet.rbi.org.in. Never give Aadhaar to any unverified loan app.",
      },
      {
        title: "Matrimonial site con artists",
        pattern: "Fake NRI profiles on Shaadi.com / Jeevansathi — emotional manipulation → \"customs fee\" / \"gold gift\" wire fraud",
        defense: "Never send money to anyone you haven't met in person. Video-call first. Reverse-image search their photos.",
      },
    ],
    actions: [
      "Verify all vendors via GST + Google Reviews + at least one in-person visit",
      "Cap advance payments at 25% — written contract for the rest",
      "Audit matrimonial chats — anyone asking for money is a scammer",
    ],
  },
];

/** Returns the next 3 upcoming festivals from today. */
export function upcoming(now = new Date()) {
  const todayTs = now.getTime();
  // For repeating annual events, advance year if past
  return FESTIVALS
    .map(f => {
      const d = new Date(f.date);
      if (d.getTime() < todayTs) {
        d.setFullYear(d.getFullYear() + 1);
      }
      return { ...f, parsedDate: d, daysAway: Math.ceil((d.getTime() - todayTs) / 86400000) };
    })
    .sort((a, b) => a.parsedDate - b.parsedDate)
    .slice(0, 6);
}

/** Format a date as "Nov 8 · 14 days away" */
export function formatFestivalDate(festival) {
  const dateStr = festival.parsedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  if (festival.daysAway < 0) return `${dateStr} · passed`;
  if (festival.daysAway === 0) return `${dateStr} · today`;
  if (festival.daysAway === 1) return `${dateStr} · tomorrow`;
  if (festival.daysAway < 7) return `${dateStr} · ${festival.daysAway} days away`;
  if (festival.daysAway < 30) return `${dateStr} · ${festival.daysAway} days away ⚠`;
  return `${dateStr} · ${festival.daysAway} days away`;
}

/** Returns true if a festival is in the high-alert 7-day window. */
export function isHighAlert(festival) {
  return festival.daysAway >= 0 && festival.daysAway <= 7;
}
