// Central tool/page icon registry — maps a route path to a clean Lucide SVG
// icon (react-icons/lu). Replaces emoji icons everywhere so tools look
// professional + on-brand. Use <ToolIcon to="/threat-map" size={18} />.
import {
  LuSiren, LuShield, LuShieldCheck, LuShieldAlert, LuShieldQuestion,
  LuMessageSquare, LuReceipt, LuLaptop, LuLandmark, LuTimer, LuSmartphone,
  LuBanknote, LuWallet, LuMic, LuMonitorSmartphone, LuIdCard, LuCalendar,
  LuGlobe, LuSearch, LuGauge, LuEye, LuFileCode, LuFileSearch, LuKeyRound,
  LuMail, LuMapPin, LuQrCode, LuListChecks, LuWaves, LuFingerprint, LuFish,
  LuKey, LuRadar, LuGift, LuBookOpen, LuPenLine, LuNewspaper, LuCreditCard,
  LuInfo, LuPhone, LuSparkles, LuLayoutDashboard, LuUser, LuActivity, LuLock,
  LuDatabase, LuTriangleAlert, LuMegaphone, LuBriefcase, LuUserRound,
} from "react-icons/lu";

// route → icon component
export const TOOL_ICONS = {
  // Security Tools
  "/scam-recovery": LuSiren,
  "/safe-word": LuShieldCheck,
  "/whatsapp-audit": LuMessageSquare,
  "/receipt-audit": LuReceipt,
  "/desktop": LuLaptop,
  "/enterprise": LuLandmark,
  "/otp-decay": LuTimer,
  "/stolen-phone": LuSmartphone,
  "/upi-lookup": LuBanknote,
  "/loan-app-check": LuWallet,
  "/voiceprint": LuMic,
  "/device-scan": LuMonitorSmartphone,
  "/aadhaar-mask": LuIdCard,
  "/festival-fraud": LuCalendar,
  "/threat-map": LuGlobe,
  "/fraud-analyzer": LuSearch,
  "/security-score": LuGauge,
  "/vulnerability-scanner": LuShieldAlert,
  "/dark-web-monitor": LuEye,
  "/security-audit": LuLock,
  "/security-headers": LuFileCode,
  "/file-hash-scanner": LuFileSearch,
  // Privacy & More
  "/password-vault": LuKeyRound,
  "/email-analyzer": LuMail,
  "/ip-lookup": LuMapPin,
  "/qr-scanner": LuQrCode,
  "/security-checklist": LuListChecks,
  "/whois-lookup": LuGlobe,
  "/dns-leak-test": LuWaves,
  "/browser-fingerprint": LuFingerprint,
  // Learn & Earn
  "/phishing-trainer": LuFish,
  "/2fa-guide": LuKey,
  "/password-checker": LuShieldQuestion,
  "/identity-xray": LuRadar,
  "/referral": LuGift,
  // Tools (extra)
  "/risk-score": LuActivity,
  "/scam-database": LuDatabase,
  "/threats": LuTriangleAlert,
  "/emergency-help": LuSiren,
  // Pages
  "/learn": LuBookOpen,
  "/blog": LuPenLine,
  "/cyber-news": LuNewspaper,
  "/pricing": LuCreditCard,
  "/about": LuInfo,
  "/contact": LuPhone,
  "/features": LuSparkles,
  "/dashboard": LuLayoutDashboard,
  "/user-dashboard": LuUser,
  "/founder": LuUserRound,
  "/press": LuMegaphone,
  "/careers": LuBriefcase,
};

// Fallback for any unmapped route.
const FALLBACK = LuShield;

export function getToolIcon(to) {
  return TOOL_ICONS[to] || FALLBACK;
}

/**
 * ToolIcon — renders the SVG icon for a route.
 * <ToolIcon to="/threat-map" size={18} color="#14b8a6" />
 */
export default function ToolIcon({ to, size = 18, color = "currentColor", style, className, strokeWidth = 2 }) {
  const Icon = getToolIcon(to);
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
}
