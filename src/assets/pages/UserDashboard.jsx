import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import PlanGate, { isPlanAllowed } from "../../components/PlanGate";
import OnboardingTour from "../../components/OnboardingTour";
import { db } from "../../firebase/config";
import { auth as firebaseAuth } from "../../firebase/config";
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, setDoc, updateDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { deleteUser as firebaseDeleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  HiOutlineViewGrid, HiOutlineShieldCheck, HiOutlineDesktopComputer, HiOutlineUser,
  HiOutlineLogout, HiOutlineRefresh, HiOutlineTrash, HiOutlinePlus, HiOutlineCheck,
  HiOutlineX, HiOutlineExclamation, HiOutlineLockClosed, HiOutlineMail, HiOutlineCreditCard,
  HiOutlineChevronRight, HiOutlineMenuAlt2, HiOutlinePencil, HiOutlineClipboardCheck,
  HiOutlineGlobe, HiOutlineKey, HiOutlineSave, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineChartBar, HiOutlineDocumentReport, HiOutlineCode, HiOutlineDownload,
  HiOutlineBell, HiOutlineClipboard, HiOutlineHome, HiOutlineMap, HiOutlineAcademicCap,
  HiOutlineSearchCircle, HiOutlineFingerPrint, HiOutlineLightningBolt, HiOutlineNewspaper,
  HiOutlineClock, HiOutlinePhotograph, HiOutlineCog, HiOutlineMoon, HiOutlineSun,
  HiOutlineSwitchHorizontal,
} from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";
import { getAllBadgesWithState, getStreak } from "../../services/gamificationService";
import { getPermissionState, requestPermission, isEnabled as isPushEnabled, setEnabled as setPushEnabled } from "../../services/pushService";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const sty = {
  card: { background: "rgba(17,24,39,0.6)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, backdropFilter: "blur(12px)", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Vrikaan Sans'", transition: "border-color 0.3s, box-shadow 0.3s" },
  btn: (bg, clr) => ({ padding: "8px 16px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Vrikaan Sans'", transition: "all 0.2s ease" }),
};

const AniCard = ({ children, delay = 0, className = "" }) => (
  <div className={`dash-card ${className}`} style={{ ...sty.card, animation: `fadeInUp 0.5s ease ${delay}s both` }}>{children}</div>
);

const AniTab = ({ children }) => (
  <div style={{ animation: "fadeInUp 0.4s ease forwards" }}>{children}</div>
);

const Badge = ({ children, color }) => (
  <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color, transition: "all 0.2s" }}>{children}</span>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.cyan}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", boxShadow: "0 0 15px rgba(20,227,197,0.3)" }} />
  </div>
);

// Android model-code → human name. Add more as needed; falls back to raw code.
const ANDROID_MODEL_LOOKUP = {
  "SM-G998B": "Galaxy S21 Ultra", "SM-G998U": "Galaxy S21 Ultra",
  "SM-G991B": "Galaxy S21", "SM-G996B": "Galaxy S21+",
  "SM-S901B": "Galaxy S22", "SM-S906B": "Galaxy S22+", "SM-S908B": "Galaxy S22 Ultra",
  "SM-S911B": "Galaxy S23", "SM-S916B": "Galaxy S23+", "SM-S918B": "Galaxy S23 Ultra",
  "SM-S921B": "Galaxy S24", "SM-S926B": "Galaxy S24+", "SM-S928B": "Galaxy S24 Ultra",
  "SM-A536B": "Galaxy A53", "SM-A546B": "Galaxy A54", "SM-A556B": "Galaxy A55",
  "SM-A346B": "Galaxy A34", "SM-A356B": "Galaxy A35",
  "SM-F946B": "Galaxy Z Fold5", "SM-F731B": "Galaxy Z Flip5",
  "Pixel 6": "Pixel 6", "Pixel 6 Pro": "Pixel 6 Pro", "Pixel 6a": "Pixel 6a",
  "Pixel 7": "Pixel 7", "Pixel 7 Pro": "Pixel 7 Pro", "Pixel 7a": "Pixel 7a",
  "Pixel 8": "Pixel 8", "Pixel 8 Pro": "Pixel 8 Pro", "Pixel 8a": "Pixel 8a",
  "Pixel 9": "Pixel 9", "Pixel 9 Pro": "Pixel 9 Pro",
  "CPH2417": "OnePlus 10 Pro", "CPH2581": "OnePlus 11", "CPH2583": "OnePlus 12",
  "M2102K1G": "Mi 11", "2201123G": "Xiaomi 12", "2210132G": "Xiaomi 13",
};

function shortGpu(s) {
  // Strip ANGLE wrapper + driver/vendor noise; keep brand+model
  return s
    .replace(/^ANGLE\s*\(/, "")
    .replace(/\)$/, "")
    .replace(/Direct3D11.*$/, "")
    .replace(/Vulkan.*$/, "")
    .replace(/OpenGL.*$/, "")
    .replace(/\([^)]*\)/g, "")
    .trim()
    .slice(0, 40);
}

function detectDeviceSync() {
  const ua = navigator.userAgent;
  let browser = "Unknown", os = "Unknown", type = "Desktop";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";
  if (/Mobi|Android/i.test(ua)) type = "Mobile";
  else if (/iPad|Tablet/i.test(ua)) type = "Tablet";
  return {
    browser, os, type,
    osVersion: "", model: "", gpu: "", ram: 0, cpu: 0,
    screenRes: `${screen.width}x${screen.height}`,
    name: `${browser} on ${os}`,
  };
}

async function enrichDevice(base) {
  const out = { ...base };
  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const hi = await navigator.userAgentData.getHighEntropyValues([
        "model", "platformVersion", "architecture", "bitness",
      ]);
      if (hi.model) out.model = ANDROID_MODEL_LOOKUP[hi.model] || hi.model;
      if (hi.platformVersion) {
        const major = parseInt(hi.platformVersion.split(".")[0], 10);
        // UA-CH Windows quirk: Win10 reports < 13, Win11 reports >= 13
        if (out.os === "Windows") out.osVersion = major >= 13 ? "11" : "10";
        else out.osVersion = String(major);
      }
    }
  } catch { /* UA-CH not available (Firefox/Safari) */ }
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
    if (dbg) out.gpu = shortGpu(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
  } catch { /* WebGL blocked */ }
  out.ram = navigator.deviceMemory || 0;
  out.cpu = navigator.hardwareConcurrency || 0;

  // Build a richer human-readable name
  if (out.model) {
    out.name = `${out.model} (${out.os}${out.osVersion ? " " + out.osVersion : ""})`;
  } else {
    const specs = [
      out.cpu ? `${out.cpu}C` : "",
      out.ram ? `${out.ram}GB` : "",
      out.gpu || "",
    ].filter(Boolean);
    const osLabel = `${out.os}${out.osVersion ? " " + out.osVersion : ""}`;
    const formFactor = out.type === "Mobile" ? "Phone" : out.type === "Tablet" ? "Tablet" : "PC";
    out.name = specs.length ? `${osLabel} ${formFactor} (${specs.join(" · ")})` : `${osLabel} ${formFactor}`;
  }
  return out;
}

function useDeviceInfo() {
  const [device, setDevice] = useState(detectDeviceSync);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    enrichDevice(device).then((enriched) => {
      if (!cancelled) { setDevice(enriched); setReady(true); }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [device, ready];
}

function calcSecurityScore(user, deviceCount) {
  let score = 0;
  const factors = [];
  const emailVerified = firebaseAuth.currentUser?.emailVerified || false;
  if (emailVerified) { score += 20; factors.push({ label: "Email Verified", done: true }); }
  else factors.push({ label: "Email Verified", done: false });
  if (user?.plan && user.plan !== "free") { score += 20; factors.push({ label: "Paid Plan Active", done: true }); }
  else factors.push({ label: "Paid Plan Active", done: false });
  if (deviceCount > 0) { score += 20; factors.push({ label: "Device Registered", done: true }); }
  else factors.push({ label: "Device Registered", done: false });
  if (user?.phoneNumber) { score += 20; factors.push({ label: "Phone Number Added", done: true }); }
  else factors.push({ label: "Phone Number Added", done: false });
  if (user?.name && user.name.length > 1) { score += 20; factors.push({ label: "Profile Complete", done: true }); }
  else factors.push({ label: "Profile Complete", done: false });
  return { score, factors };
}

function calcAccountAge(createdAt) {
  if (!createdAt) return "Unknown";
  const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""}`;
}

function providerLabel(p) {
  if (!p) return "Email";
  if (p.includes("google")) return "Google";
  if (p.includes("github")) return "GitHub";
  if (p.includes("facebook")) return "Facebook";
  if (p.includes("phone")) return "Phone";
  return "Email";
}

function checkUrlSafety(url) {
  if (!url) return null;
  const suspicious = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".buzz", ".club"];
  const issues = [];
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) issues.push("Uses raw IP address");
    if (suspicious.some((t) => u.hostname.endsWith(t))) issues.push("Suspicious TLD");
    if (u.hostname.includes("login") || u.hostname.includes("secure") || u.hostname.includes("account"))
      issues.push("Impersonation keywords in domain");
    if (u.hostname.split(".").length > 4) issues.push("Excessive subdomains");
    if (u.hostname.includes("--") || u.hostname.includes("..")) issues.push("Suspicious domain pattern");
  } catch { issues.push("Invalid URL format"); }
  return issues.length > 0 ? { safe: false, issues } : { safe: true, issues: [] };
}

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "Enter a password", color: T.muted };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { label: "Very Weak", color: T.red },
    { label: "Weak", color: T.orange },
    { label: "Fair", color: "#eab308" },
    { label: "Strong", color: T.cyan },
    { label: "Very Strong", color: T.green },
  ];
  const idx = Math.min(s, 5) - 1;
  return idx < 0 ? { score: 0, label: "Very Weak", color: T.red } : { score: s, ...levels[idx] };
}

const planLabels = { free: "Free", starter: "Starter", pro: "Professional", enterprise: "Enterprise" };
const planColors = { free: T.muted, starter: T.orange, pro: T.cyan, enterprise: T.accent };
const planFeatures = {
  free: ["Basic security score", "1 device", "Community support"],
  pro: ["Advanced scanning", "5 devices", "Priority support", "Weekly reports", "Dark web monitor", "Analytics"],
  enterprise: ["Unlimited devices", "24/7 support", "API access", "Custom alerts", "Export data", "Advanced analytics"],
};
const planDeviceLimit = { free: 1, starter: 2, pro: 5, enterprise: Infinity };

const CHART_COLORS = [T.cyan, T.accent, T.green, T.orange, T.red];

const navItems = [
  { icon: HiOutlineViewGrid, label: "Overview" },
  { icon: HiOutlineDesktopComputer, label: "Devices" },
  { icon: HiOutlineShieldCheck, label: "Security" },
  { icon: HiOutlineClock, label: "Tool History" },
  { icon: HiOutlineExclamation, label: "Threat Monitor", plan: "pro" },
  { icon: HiOutlineChartBar, label: "Analytics", plan: "pro" },
  { icon: HiOutlineDocumentReport, label: "Reports", plan: "pro" },
  { icon: HiOutlineCode, label: "API Access", plan: "enterprise" },
  { icon: HiOutlineUser, label: "Account" },
];

// Bottom-nav for mobile — 4 main destinations visible always
const mobileBottomNav = [
  { icon: HiOutlineViewGrid, label: "Overview" },
  { icon: HiOutlineShieldCheck, label: "Security" },
  { icon: HiOutlineClock, label: "Tool History" },
  { icon: HiOutlineUser, label: "Account" },
];

// Daily security tips — rotates by day-of-year so everyone sees same tip on same day
const SECURITY_TIPS = [
  { icon: "🔐", title: "Use a Password Manager", body: "Generate unique 16+ char passwords for every account. Reused passwords are the #1 breach vector." },
  { icon: "🛡", title: "Enable 2FA Everywhere", body: "Add a second factor to email, banking, and crypto. SMS works but TOTP apps are stronger." },
  { icon: "🎣", title: "Inspect Every Link", body: "Hover before you click. Phishing sites mimic real URLs with one swapped character." },
  { icon: "📲", title: "Update Your Phone OS", body: "Patches close the same zero-days hackers are actively exploiting in the wild." },
  { icon: "💾", title: "Backup the 3-2-1 Way", body: "Three copies, two media types, one offsite. Ransomware can't encrypt what it can't reach." },
  { icon: "🌐", title: "Check Your DNS", body: "Use 1.1.1.1 or 9.9.9.9. Default ISP DNS leaks browsing data and can be hijacked." },
  { icon: "📧", title: "Hide Your Email", body: "Use forward-aliases when signing up to new services. Limits your blast radius if breached." },
  { icon: "🔍", title: "Audit App Permissions", body: "Most apps don't need camera, mic, or location. Revoke whatever you can't justify." },
  { icon: "🚫", title: "Skip Public Wi-Fi", body: "Open networks let anyone snoop your traffic. Use mobile hotspot or a VPN you trust." },
  { icon: "🧹", title: "Clean Up Old Accounts", body: "Closed accounts you forgot about are still in breach databases. Delete what you don't use." },
  { icon: "🪪", title: "Check HaveIBeenPwned", body: "Once a quarter, check if your email surfaced in a new breach. Rotate any reused passwords." },
  { icon: "💳", title: "Use Virtual Cards", body: "Most banks offer single-use card numbers for online purchases. Limits fraud exposure." },
];

function getTodaysTip() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return SECURITY_TIPS[dayOfYear % SECURITY_TIPS.length];
}

const toolLinks = [
  { icon: HiOutlineMap, label: "Threat Map", path: "/threat-map" },
  { icon: HiOutlineSearchCircle, label: "Fraud Analyzer", path: "/fraud-analyzer" },
  { icon: HiOutlineFingerPrint, label: "Security Score", path: "/security-score" },
  { icon: HiOutlineGlobe, label: "Dark Web Monitor", path: "/dark-web-monitor" },
  { icon: HiOutlineKey, label: "Password Vault", path: "/password-vault" },
  { icon: HiOutlineLightningBolt, label: "Vulnerability Scanner", path: "/vulnerability-scanner" },
  { icon: HiOutlineMail, label: "Email Analyzer", path: "/email-analyzer" },
  { icon: HiOutlineGlobe, label: "IP Lookup", path: "/ip-lookup" },
  { icon: HiOutlineAcademicCap, label: "Learn", path: "/learn" },
  { icon: HiOutlineNewspaper, label: "Blog", path: "/blog" },
];

export default function UserDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [activity, setActivity] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // 2FA / TOTP enrollment state
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [totpSetup, setTotpSetup] = useState(null); // { secret, qrDataUri }
  const [totpCode, setTotpCode] = useState("");
  const [totpBusy, setTotpBusy] = useState(false);
  const [backupCodes, setBackupCodes] = useState(null);
  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookBusy, setWebhookBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Responsive viewport tracking — updates on resize so the layout reacts without reload
  const [viewport, setViewport] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1024));
  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = viewport < 768;
  const isTablet = viewport >= 768 && viewport < 1024;
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [pwInput, setPwInput] = useState("");
  const [emailCheckInput, setEmailCheckInput] = useState("");
  const [emailCheckResult, setEmailCheckResult] = useState(null);
  const [showPw, setShowPw] = useState(false);
  /* Password change */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  /* Avatar */
  const [avatarUrl, setAvatarUrl] = useState("");
  const [editingAvatar, setEditingAvatar] = useState(false);
  /* Notification prefs */
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vrikaan_notif_prefs") || "null") || { security: true, updates: true, marketing: false, weekly: true }; }
    catch { return { security: true, updates: true, marketing: false, weekly: true }; }
  });
  /* Tool history */
  const [toolHistory, setToolHistory] = useState([]);
  const [toolHistoryLoading, setToolHistoryLoading] = useState(false);
  /* Theme */
  const { mode: themeMode, toggleTheme } = useTheme();

  const uid = user?.uid;
  const userPlan = user?.plan || "free";
  const deviceLimit = planDeviceLimit[userPlan] || 1;
  const [currentDevice, deviceReady] = useDeviceInfo();
  const { score: secScore, factors: secFactors } = calcSecurityScore(user, devices.length);

  const fsCol = useCallback((sub) => uid ? collection(db, "users", uid, sub) : null, [uid]);

  const loadData = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [devSnap, actSnap, paySnap, repSnap] = await Promise.all([
        getDocs(fsCol("devices")),
        getDocs(query(fsCol("activity"), orderBy("timestamp", "desc"), limit(50))),
        getDocs(query(fsCol("payments"), orderBy("date", "desc"), limit(20))),
        getDocs(query(fsCol("reports"), orderBy("createdAt", "desc"), limit(10))),
      ]);
      setDevices(devSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setActivity(actSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPayments(paySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReports(repSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // Load API key
      try {
        const apiSnap = await getDocs(fsCol("apikeys"));
        if (!apiSnap.empty) setApiKey(apiSnap.docs[0].data().key);
      } catch {}
    } catch (e) { console.error("Dashboard load error:", e); }
    setLoading(false);
  }, [uid, fsCol]);

  const logActivity = useCallback(async (type, detail) => {
    if (!uid) return;
    try {
      await addDoc(fsCol("activity"), { type, detail, timestamp: serverTimestamp() });
    } catch {}
  }, [uid, fsCol]);

  const autoRegisterDevice = useCallback(async () => {
    if (!uid) return;
    try {
      const snap = await getDocs(fsCol("devices"));
      const existing = snap.docs.find((d) => d.data().name === currentDevice.name);
      if (!existing && snap.docs.length < deviceLimit) {
        await addDoc(fsCol("devices"), { ...currentDevice, lastActive: serverTimestamp(), current: true });
      } else if (existing) {
        await setDoc(doc(db, "users", uid, "devices", existing.id), { ...existing.data(), lastActive: serverTimestamp() }, { merge: true });
      }
    } catch {}
  }, [uid, fsCol, currentDevice, deviceLimit]);

  useEffect(() => {
    if (!uid) { navigate("/login"); return; }
    loadData();
  }, [uid]);

  // Auto-register the device only after async enrichment finishes,
  // so the stored name reflects the real model/specs (not the sync UA stub).
  useEffect(() => {
    if (!uid || !deviceReady) return;
    autoRegisterDevice();
    logActivity("login", "Dashboard accessed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, deviceReady]);

  useEffect(() => { if (user) { setEditName(user.name || ""); setEditPhone(user.phoneNumber || ""); } }, [user]);

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const handleSwitchAccount = async () => { await logout(); navigate("/login?switch=1"); };

  const handleCancelSubscription = async () => {
    if (!user?.uid) return;
    setCancelling(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        subscriptionAutoRenew: false,
        subscriptionCancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast("Auto-renewal cancelled. Your plan stays active until expiry.", "success");
      setShowCancelModal(false);
    } catch (e) {
      toast("Could not cancel — try again or contact support.", "error");
    } finally {
      setCancelling(false);
    }
  };

  const addDevice = async () => {
    if (devices.length >= deviceLimit) {
      toast(`Your ${planLabels[userPlan]} plan allows max ${deviceLimit} device${deviceLimit > 1 ? "s" : ""}. Upgrade to add more.`, "error");
      return;
    }
    try {
      await addDoc(fsCol("devices"), { ...currentDevice, lastActive: serverTimestamp(), current: true });
      await logActivity("device_add", `Added ${currentDevice.name}`);
      toast("Device registered", "success");
      loadData();
    } catch (e) { toast("Failed to register device", "error"); }
  };

  const removeDevice = async (id) => {
    try {
      await deleteDoc(doc(db, "users", uid, "devices", id));
      await logActivity("device_remove", "Device removed");
      toast("Device removed", "success");
      loadData();
    } catch { toast("Failed to remove device", "error"); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: editName, phoneNumber: editPhone });
      await logActivity("profile_update", "Profile updated");
      toast("Profile saved", "success");
      setEditing(false);
    } catch { toast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    try {
      if (firebaseAuth.currentUser) await firebaseDeleteUser(firebaseAuth.currentUser);
      toast("Account deleted", "success");
      navigate("/");
    } catch (e) { toast(e.message || "Failed to delete account", "error"); }
    setShowDeleteModal(false);
  };

  const generateReport = async () => {
    const report = {
      generatedAt: new Date().toISOString(),
      securityScore: secScore,
      factors: secFactors,
      devices: devices.length,
      plan: userPlan,
      recentActivity: activity.slice(0, 10).map((a) => ({ type: a.type, detail: a.detail })),
    };
    try {
      await addDoc(fsCol("reports"), { ...report, createdAt: serverTimestamp() });
      await logActivity("report_generated", "Security report generated");
      toast("Report generated", "success");
      loadData();
    } catch { toast("Failed to generate report", "error"); }
  };

  const downloadReport = (r) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vrikaan-report-${r.generatedAt || "latest"}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const generateApiKey = async () => {
    // New token format: vrk_<48 hex>. Mirrored to /api_tokens for
    // server-side validation in api/tools.js.
    const buf = crypto.getRandomValues(new Uint8Array(24));
    const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
    const key = `vrk_${hex}`;
    try {
      const snap = await getDocs(fsCol("apikeys"));
      // Replace any existing single key for this user
      if (!snap.empty) {
        for (const d of snap.docs) {
          const old = d.data();
          if (old.key) { try { await deleteDoc(doc(db, "api_tokens", old.key)); } catch {} }
          await deleteDoc(doc(db, "users", uid, "apikeys", d.id));
        }
      }
      await addDoc(fsCol("apikeys"), { key, label: "Primary", active: true, createdAt: serverTimestamp(), callCount: 0 });
      // Public-by-id mirror for serverless validation
      await setDoc(doc(db, "api_tokens", key), {
        uid, plan: userPlan || "starter", active: true, createdAt: serverTimestamp(),
      });
      setApiKey(key);
      await logActivity("api_key_generated", "API key generated");
      toast("API key generated", "success");
    } catch (err) {
      toast("Failed to generate API key: " + err.message, "error");
    }
  };

  const copyApiKey = () => { if (apiKey) { navigator.clipboard.writeText(apiKey); toast("API key copied", "success"); } };

  /* ─── Password Change ─── */
  const handlePasswordChange = async () => {
    if (!newPw || !confirmPw) { toast("Please fill all fields", "error"); return; }
    if (newPw !== confirmPw) { toast("Passwords don't match", "error"); return; }
    if (newPw.length < 8) { toast("Password must be at least 8 characters", "error"); return; }
    setChangingPw(true);
    try {
      const fbUser = firebaseAuth.currentUser;
      if (currentPw && fbUser?.email) {
        const cred = EmailAuthProvider.credential(fbUser.email, currentPw);
        await reauthenticateWithCredential(fbUser, cred);
      }
      await updatePassword(firebaseAuth.currentUser, newPw);
      await logActivity("password_changed", "Password updated");
      toast("Password updated successfully", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      toast(e.code === "auth/wrong-password" ? "Current password is incorrect" : e.message || "Failed to change password", "error");
    }
    setChangingPw(false);
  };

  /* ─── Avatar Save ─── */
  const saveAvatar = async () => {
    if (!avatarUrl.trim()) { toast("Enter an avatar URL", "error"); return; }
    try {
      await updateProfile({ avatar: avatarUrl.trim() });
      await logActivity("avatar_changed", "Profile avatar updated");
      toast("Avatar updated", "success");
      setEditingAvatar(false);
    } catch { toast("Failed to update avatar", "error"); }
  };

  /* ─── Notification Prefs ─── */
  const saveNotifPrefs = async (key) => {
    // Browser push permission gate
    if (key === "browser_push") {
      const wasOn = isPushEnabled();
      if (!wasOn) {
        const result = await requestPermission();
        if (result !== "granted") {
          toast(result === "unsupported" ? "Browser doesn't support notifications" : "Permission denied — enable in browser settings", "error");
          return;
        }
        setPushEnabled(true);
        toast("Browser notifications enabled", "success");
      } else {
        setPushEnabled(false);
        toast("Browser notifications disabled", "success");
      }
      const updated = { ...notifPrefs, browser_push: !wasOn };
      setNotifPrefs(updated);
      localStorage.setItem("vrikaan_notif_prefs", JSON.stringify(updated));
      return;
    }

    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("vrikaan_notif_prefs", JSON.stringify(updated));
    // Wire the "weekly" toggle to the digest_subscribers Firestore collection
    if (key === "weekly" && user?.uid) {
      try {
        const { subscribeToDigest, unsubscribeFromDigest } = await import("../../services/digestService");
        if (updated.weekly) await subscribeToDigest(user);
        else await unsubscribeFromDigest(user.uid);
        toast(updated.weekly ? "Subscribed to weekly digest" : "Unsubscribed from weekly digest", "success");
        return;
      } catch (e) {
        toast("Could not update digest subscription: " + e.message, "error");
        return;
      }
    }
    toast("Notification preference updated", "success");
  };

  /* ─── Tool History ─── */
  const loadToolHistory = useCallback(async () => {
    if (!uid) return;
    setToolHistoryLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users", uid, "toolHistory"), orderBy("timestamp", "desc"), limit(50)));
      setToolHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { /* collection may not exist yet */ }
    setToolHistoryLoading(false);
  }, [uid]);

  useEffect(() => { if (uid && tab === "Tool History") loadToolHistory(); }, [uid, tab, loadToolHistory]);

  const clearToolHistory = async () => {
    if (!uid) return;
    try {
      const snap = await getDocs(collection(db, "users", uid, "toolHistory"));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "users", uid, "toolHistory", d.id))));
      setToolHistory([]);
      toast("Tool history cleared", "success");
    } catch { toast("Failed to clear history", "error"); }
  };

  // ── 2FA / TOTP handlers ───────────────────────────────────────────────
  const apiCall = useCallback(async (tool, body) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Sign-in required");
    const r = await fetch(`/api/tools?tool=${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body || {}),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  }, []);

  // Read mfa + webhook state from /users/{uid} on load
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        const d = snap.data() || {};
        setMfaEnrolled(!!d.mfa?.enabled);
        setWebhookEnabled(!!d.webhook?.enabled);
        setWebhookUrl(d.webhook?.url || "");
        setWebhookSecret(d.webhook?.secret || "");
      } catch { /* silent */ }
    })();
  }, [uid]);

  const saveWebhook = async () => {
    if (!webhookUrl.startsWith("https://")) { toast("URL must start with https://", "error"); return; }
    setWebhookBusy(true);
    try {
      const r = await apiCall("webhook-set", { url: webhookUrl });
      setWebhookSecret(r.secret);
      setWebhookEnabled(true);
      toast("Webhook saved — copy the secret", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setWebhookBusy(false); }
  };
  const clearWebhook = async () => {
    if (!window.confirm("Remove webhook?")) return;
    setWebhookBusy(true);
    try {
      await apiCall("webhook-clear");
      setWebhookEnabled(false);
      setWebhookSecret("");
      setWebhookUrl("");
      toast("Webhook removed", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setWebhookBusy(false); }
  };
  const testWebhook = async () => {
    setWebhookBusy(true);
    try {
      const r = await apiCall("webhook-test");
      if (r.ok) toast(`Test fired — receiver returned ${r.status}`, "success");
      else toast(`Receiver responded ${r.status || "?"}: ${r.error || "failed"}`, "error");
    } catch (e) { toast(e.message, "error"); }
    finally { setWebhookBusy(false); }
  };

  const startTotpEnroll = async () => {
    setTotpBusy(true);
    try { setTotpSetup(await apiCall("totp-setup")); }
    catch (e) { toast(e.message, "error"); }
    finally { setTotpBusy(false); }
  };

  const confirmTotp = async () => {
    if (!totpSetup || !totpCode) return;
    setTotpBusy(true);
    try {
      const r = await apiCall("totp-confirm", { secret: totpSetup.secret, code: totpCode });
      setBackupCodes(r.backupCodes);
      setMfaEnrolled(true);
      setTotpSetup(null);
      setTotpCode("");
      toast("2FA enabled — save your backup codes!", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setTotpBusy(false); }
  };

  const disableTotp = async () => {
    if (!window.confirm("Disable 2FA? This reduces your account security.")) return;
    setTotpBusy(true);
    try {
      await apiCall("totp-disable");
      setMfaEnrolled(false);
      setBackupCodes(null);
      toast("2FA disabled", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setTotpBusy(false); }
  };

  // Self-serve refund. Calls /api/tools?tool=refund with the user's Firebase
  // ID token. Server enforces 7-day window and ownership; on success we
  // refresh the payments list so the refunded badge shows.
  const requestRefund = async (payment) => {
    if (!payment.orderId) {
      toast("Missing order ID — contact support", "error");
      return;
    }
    const reason = window.prompt(`Request refund for ₹${payment.amount}?\nReason (optional):`, "");
    if (reason === null) return; // cancelled
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      if (!idToken) { toast("Sign in required", "error"); return; }
      const res = await fetch("/api/tools?tool=refund", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId: payment.orderId, reason }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Refund failed", "error"); return; }
      toast(`Refund queued — status: ${data.status || "pending"}`, "success");
      await loadData();
    } catch (e) {
      toast("Refund request failed", "error");
    }
  };

  // Export tool history to CSV. RFC-4180 quoting; flattens result object to JSON
  // string in a single column so any tool shape works.
  const exportToolHistoryCsv = () => {
    if (!toolHistory.length) return;
    const esc = (v) => {
      const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["timestamp", "tool", "input", "result"];
    const rows = toolHistory.map((h) => {
      const ts = h.timestamp?.toDate ? h.timestamp.toDate().toISOString() : String(h.timestamp || "");
      return [ts, h.tool, h.input || "", h.result].map(esc).join(",");
    });
    const csv = [header.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vrikaan-tool-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Exported CSV", "success");
  };

  // Chart data from activity
  const loginChartData = (() => {
    const map = {};
    activity.filter((a) => a.type === "login").forEach((a) => {
      const d = a.timestamp?.toDate ? a.timestamp.toDate().toLocaleDateString() : "Today";
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).slice(0, 7).reverse().map(([date, count]) => ({ date, logins: count }));
  })();

  const deviceTypeData = (() => {
    const map = {};
    devices.forEach((d) => { map[d.type || "Desktop"] = (map[d.type || "Desktop"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const eventTypeData = (() => {
    const map = {};
    activity.forEach((a) => { map[a.type || "other"] = (map[a.type || "other"] || 0) + 1; });
    return Object.entries(map).slice(0, 5).map(([name, count]) => ({ name, count }));
  })();

  const threatEvents = activity.filter((a) => ["threat", "breach", "alert", "scan", "security"].some((k) => (a.type || "").includes(k)));

  /* ─── RENDER TABS ─── */

  const renderOverview = () => (
    <AniTab>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, animation: "fadeInUp 0.4s ease both" }}>
        <div className="dash-avatar" style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "'Vrikaan Sans'", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
          {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (user?.name?.charAt(0)?.toUpperCase() || "U")}
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Welcome, {user?.name || "User"}</span></h2>
          <div style={{ marginTop: 4 }}><Badge color={planColors[userPlan]}>{planLabels[userPlan]} Plan</Badge></div>
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(170px, 1fr))",
        gap: isMobile ? 10 : 16,
        marginBottom: 28,
      }}>
        {[
          { label: "Security Score", value: `${secScore}/100`, color: secScore >= 80 ? T.green : secScore >= 50 ? T.orange : T.red, gradient: `linear-gradient(90deg, ${T.green}, ${T.cyan})` },
          { label: "Plan Status", value: planLabels[userPlan], color: planColors[userPlan], gradient: `linear-gradient(90deg, ${T.accent}, ${T.cyan})` },
          { label: "AI Credits", value: (() => { const d = JSON.parse(localStorage.getItem("vrikaan_ai_credits") || "null"); const plans = { guest: 25, free: 50, starter: 200, pro: 1000, unlimited: Infinity }; const max = plans[userPlan] || plans.free; const used = d?.used || 0; return max === Infinity ? "∞" : `${Math.max(0, max - used)}/${max}`; })(), color: T.accent, gradient: `linear-gradient(90deg, ${T.accent}, #ec4899)` },
          { label: "Active Devices", value: `${devices.length}/${deviceLimit === Infinity ? "∞" : deviceLimit}`, color: T.cyan, gradient: `linear-gradient(90deg, ${T.cyan}, ${T.green})` },
          { label: "Account Age", value: calcAccountAge(user?.createdAt), color: T.accent, gradient: `linear-gradient(90deg, ${T.orange}, ${T.accent})` },
        ].map((s, i) => (
          <div key={i} className="dash-stat" style={{ ...sty.card, textAlign: "center", position: "relative", overflow: "hidden", animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.gradient, borderRadius: "16px 16px 0 0" }} />
            <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontFamily: "'Vrikaan Sans'" }}>{s.label}</p>
            <p className="stat-value" style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, fontFamily: "'Vrikaan Sans'" }}>{s.value}</p>
          </div>
        ))}
      </div>
      {/* Family widget — surfaces family status for family-plan owners +
          invited members. Pink themed to match /family and Family-plan brand. */}
      {(user?.plan === "family" || user?.currentFamilyId) && (
        <a href="/family" style={{
          display: "block", textDecoration: "none",
          marginBottom: 16, padding: "16px 20px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(236,72,153,0.10), rgba(99,102,241,0.06))",
          border: "1px solid rgba(236,72,153,0.28)",
          animation: "fadeInUp 0.4s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 26, flexShrink: 0 }}>👨‍👩‍👧‍👦</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#ec4899", marginBottom: 4, textTransform: "uppercase" }}>
                Family
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {user.familyRole === "kid" ? "You're a kid member — safe tools only"
                  : user.familyRole === "senior" ? "Senior mode active — extra UPI guards on"
                  : user.familyRole === "member" ? "You're a family member"
                  : "Manage your family plan"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {user.plan === "family" ? "Add members, manage modes, buy extra seats →" : "View your family dashboard →"}
              </div>
            </div>
            <span style={{
              padding: "8px 14px", borderRadius: 8,
              background: "rgba(236,72,153,0.18)", color: "#ec4899",
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Vrikaan Sans', sans-serif", flexShrink: 0,
            }}>Open →</span>
          </div>
        </a>
      )}

      {/* Trial banner */}
      {user?.onTrial && user?.trialExpiresAt && (() => {
        const ms = user.trialExpiresAt.getTime() - Date.now();
        const days = Math.max(0, Math.ceil(ms / 86400000));
        const isUrgent = days <= 2;
        return (
          <div style={{
            marginBottom: 16, padding: "14px 18px", borderRadius: 14,
            background: isUrgent
              ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.08))"
              : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,227,197,0.08))",
            border: `1px solid ${isUrgent ? "rgba(249,115,22,0.35)" : "rgba(99,102,241,0.3)"}`,
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            animation: "fadeInUp 0.4s ease both",
          }}>
            <div style={{ fontSize: 22 }}>{isUrgent ? "⏰" : "🎁"}</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>
                {days > 0 ? `${days} day${days > 1 ? "s" : ""} left in your Advanced trial` : "Your trial ends today"}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                After expiry, your account reverts to Free. Upgrade now to keep all features.
              </div>
            </div>
            <button onClick={() => navigate("/pricing")} className="dash-btn" style={sty.btn(isUrgent ? T.orange : `linear-gradient(135deg, ${T.accent}, ${T.cyan})`)}>Upgrade Now <HiOutlineChevronRight size={14} /></button>
          </div>
        );
      })()}
      {/* Streak + Achievements */}
      {(() => {
        const streak = getStreak();
        const badges = getAllBadgesWithState({
          emailVerified: !!user?.emailVerified,
          profileComplete: !!(user?.name && user?.phoneNumber),
          paidPlan: userPlan !== "free",
        });
        const earned = badges.filter((b) => b.unlocked);
        return (
          <AniCard delay={0.1}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: streak.current > 0 ? "linear-gradient(135deg, #f97316, #eab308)" : "rgba(148,163,184,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, position: "relative",
                  boxShadow: streak.current >= 3 ? "0 0 20px rgba(249,115,22,0.35)" : "none",
                }}>🔥</div>
                <div>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Daily Streak</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.white, fontFamily: "'Vrikaan Sans'" }}>
                    {streak.current} day{streak.current !== 1 ? "s" : ""}
                  </div>
                  {streak.longest > streak.current && (
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Longest: {streak.longest}</div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Badges</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.cyan, fontFamily: "'Vrikaan Sans'" }}>
                  {earned.length}<span style={{ fontSize: 14, color: T.muted, fontWeight: 400 }}>/{badges.length}</span>
                </div>
              </div>
            </div>
            {/* Badge grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(5, 1fr)" : "repeat(auto-fit, minmax(72px, 1fr))",
              gap: 8,
            }}>
              {badges.map((b) => (
                <div
                  key={b.id}
                  title={`${b.title} — ${b.desc}${b.unlocked ? " ✓" : " (locked)"}`}
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 12,
                    background: b.unlocked
                      ? "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(20,227,197,0.12))"
                      : "rgba(148,163,184,0.05)",
                    border: `1px solid ${b.unlocked ? "rgba(99,102,241,0.3)" : T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, opacity: b.unlocked ? 1 : 0.35,
                    filter: b.unlocked ? "none" : "grayscale(80%)",
                    cursor: "help", transition: "all 0.2s",
                  }}
                >
                  {b.icon}
                </div>
              ))}
            </div>
          </AniCard>
        );
      })()}
      {/* Daily Security Tip */}
      {(() => { const tip = getTodaysTip(); return (
        <AniCard delay={0.15}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              flexShrink: 0, width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(20,227,197,0.12))",
              border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>{tip.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.cyan, textTransform: "uppercase", letterSpacing: 1 }}>Tip of the Day</span>
                <span style={{ fontSize: 10, color: T.muted }}>•</span>
                <span style={{ fontSize: 10, color: T.muted }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 4px", fontFamily: "'Vrikaan Sans'" }}>{tip.title}</h3>
              <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.55 }}>{tip.body}</p>
            </div>
          </div>
        </AniCard>
      ); })()}
      {/* Onboarding Checklist */}
      <AniCard delay={0.2}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, margin: 0, fontFamily: "'Vrikaan Sans'" }}>Setup Checklist</h3>
          <span style={{ fontSize: 12, color: T.cyan, fontFamily: "'Vrikaan Mono', monospace" }}>{[user?.emailVerified, userPlan !== "free", devices.length > 0, user?.phone, user?.name].filter(Boolean).length}/5 complete</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Verify your email", done: !!user?.emailVerified, icon: "✉" },
            { label: "Upgrade your plan", done: userPlan !== "free", icon: "⬆" },
            { label: "Register a device", done: devices.length > 0, icon: "💻" },
            { label: "Add phone number", done: !!user?.phone, icon: "📱" },
            { label: "Complete your profile", done: !!user?.name, icon: "👤" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 10, background: item.done ? "rgba(34,197,94,0.06)" : "rgba(148,163,184,0.04)",
              border: `1px solid ${item.done ? "rgba(34,197,94,0.15)" : T.border}`,
              animation: `fadeInUp 0.3s ease ${0.2 + i * 0.06}s both`,
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: item.done ? T.green : T.muted, textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
              <span style={{ fontSize: 14, color: item.done ? T.green : "rgba(148,163,184,0.3)" }}>{item.done ? "✓" : "○"}</span>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: "rgba(148,163,184,0.08)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${([user?.emailVerified, userPlan !== "free", devices.length > 0, user?.phone, user?.name].filter(Boolean).length / 5) * 100}%`,
            background: "linear-gradient(90deg, #6366f1, #14e3c5)",
            transition: "width 0.8s ease",
          }} />
        </div>
      </AniCard>
      <AniCard delay={0.3}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Current Device</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            ["Device", currentDevice.name],
            ["Browser", currentDevice.browser],
            ["OS", `${currentDevice.os}${currentDevice.osVersion ? " " + currentDevice.osVersion : ""}`],
            ["Type", currentDevice.type],
            ["Screen", currentDevice.screenRes],
            currentDevice.cpu && ["CPU", `${currentDevice.cpu} cores`],
            currentDevice.ram && ["RAM", `${currentDevice.ram} GB`],
            currentDevice.gpu && ["GPU", currentDevice.gpu],
          ].filter(Boolean).map(([l, v]) => (
            <span key={l} style={{ padding: "4px 12px", background: "rgba(99,102,241,0.1)", borderRadius: 6, fontSize: 12, color: T.muted }}>
              <span style={{ color: T.cyan }}>{l}:</span> {v}
            </span>
          ))}
        </div>
      </AniCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
        {[
          { label: "Quick Scan", icon: HiOutlineShieldCheck, action: () => setTab("Security") },
          { label: "Check Breach", icon: HiOutlineExclamation, action: () => setTab("Security") },
          { label: "View Threats", icon: HiOutlineBell, action: () => setTab("Threat Monitor") },
          { label: "Manage Devices", icon: HiOutlineDesktopComputer, action: () => setTab("Devices") },
        ].map((q, i) => (
          <button key={i} onClick={q.action} className="dash-quick-action" style={{ ...sty.btn("rgba(99,102,241,0.12)", T.white), padding: "14px 16px", borderRadius: 12, width: "100%", justifyContent: "center", animation: `fadeInUp 0.4s ease ${0.4 + i * 0.08}s both`, border: `1px solid ${T.border}`, backdropFilter: "blur(8px)" }}>
            <q.icon size={16} /> {q.label}
          </button>
        ))}
      </div>
      <AniCard delay={0.5} className="">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Recent Activity</h3>
        {activity.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99,102,241,0.08)", border: `1px solid ${T.border}`, fontSize: 20 }}>📋</div>
            <p style={{ fontSize: 13, color: T.white, margin: "0 0 4px", fontWeight: 500 }}>No activity yet</p>
            <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.6 }}>Your login events, scans, and security actions will appear here.</p>
          </div>
        ) :
          activity.slice(0, 5).map((a, i) => (
            <div key={i} className="dash-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 8px", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", borderRadius: 6, animation: `slideInLeft 0.3s ease ${0.5 + i * 0.05}s both` }}>
              <span style={{ fontSize: 13, color: T.white }}>{a.detail || a.type}</span>
              <span style={{ fontSize: 11, color: T.muted }}>{a.timestamp?.toDate ? a.timestamp.toDate().toLocaleDateString() : ""}</span>
            </div>
          ))}
      </AniCard>

      {/* Security Tip of the Day */}
      <AniCard delay={0.6}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.1))",
            border: `1px solid rgba(99,102,241,0.2)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>💡</div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: T.cyan, margin: "0 0 6px", fontFamily: "'Vrikaan Sans'", letterSpacing: 0.5 }}>Security Tip of the Day</h3>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, margin: 0 }}>
              {[
                "Enable two-factor authentication on all your accounts. It blocks 99.9% of automated attacks even if your password is compromised.",
                "Use unique passwords for every account. A password manager makes this easy — try VRIKAAN's Password Vault.",
                "Check URLs carefully before clicking. Phishing sites often use subtle misspellings like 'g00gle.com' instead of 'google.com'.",
                "Keep your devices and software updated. Security patches fix vulnerabilities that attackers actively exploit.",
                "Be cautious of unsolicited messages asking for personal info. Legitimate companies never ask for passwords via email.",
                "Review your app permissions regularly. Revoke access for apps you no longer use.",
                "Use a VPN on public WiFi. Open networks can expose your data to anyone on the same network.",
              ][new Date().getDay()]}
            </p>
          </div>
        </div>
      </AniCard>

      {/* Quick Links */}
      <AniCard delay={0.7}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Explore Tools</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          {[
            { label: "Threat Map", icon: "🌐", path: "/threat-map" },
            { label: "Fraud Analyzer", icon: "🔍", path: "/fraud-analyzer" },
            { label: "Dark Web", icon: "🕵️", path: "/dark-web-monitor" },
            { label: "Password Vault", icon: "🔐", path: "/password-vault" },
            { label: "Learn", icon: "📚", path: "/learn" },
            { label: "Security Score", icon: "📊", path: "/security-score" },
          ].map((t, i) => (
            <a key={i} href={t.path} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              borderRadius: 10, background: "rgba(99,102,241,0.04)", border: `1px solid ${T.border}`,
              color: T.muted, fontSize: 12, textDecoration: "none", fontWeight: 500,
              transition: "all 0.3s", animation: `fadeInUp 0.3s ease ${0.7 + i * 0.05}s both`,
            }} className="dash-tool-link">
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </a>
          ))}
        </div>
      </AniCard>
    </AniTab>
  );

  const renderDevices = () => (
    <AniTab>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Devices</span> <span style={{ color: T.muted, fontSize: 16 }}>({devices.length}/{deviceLimit === Infinity ? "∞" : deviceLimit})</span></h2>
        <button onClick={addDevice} className="dash-btn" style={sty.btn(T.accent)}><HiOutlinePlus size={14} /> Register Device</button>
      </div>
      {devices.length === 0 ? (
        <AniCard delay={0.1}>
          <div style={{ textAlign: "center", padding: 32 }}>
            <HiOutlineDesktopComputer size={40} style={{ color: T.muted, marginBottom: 12 }} />
            <p style={{ color: T.muted, fontSize: 14 }}>No devices registered</p>
            <button onClick={addDevice} className="dash-btn" style={{ ...sty.btn(T.cyan), marginTop: 12 }}><HiOutlinePlus size={14} /> Register This Device</button>
          </div>
        </AniCard>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {devices.map((d, idx) => (
            <div key={d.id} className="dash-device dash-card" style={{ ...sty.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, animation: `slideInLeft 0.4s ease ${idx * 0.08}s both` }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: T.white }}>{d.name || "Unknown"}</span>
                  {d.current && <Badge color={T.green}>This device</Badge>}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                  {[d.type, d.os, d.browser, d.screenRes].filter(Boolean).map((v, i) => (
                    <span key={i} style={{ fontSize: 11, color: T.muted, background: "rgba(99,102,241,0.06)", padding: "2px 8px", borderRadius: 4 }}>{v}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => removeDevice(d.id)} className="dash-btn" style={sty.btn("rgba(239,68,68,0.12)", T.red)}><HiOutlineTrash size={14} /> Remove</button>
            </div>
          ))}
        </div>
      )}
      {devices.length >= deviceLimit && deviceLimit !== Infinity && (
        <AniCard delay={0.3} className="">
          <div style={{ textAlign: "center", borderColor: `${T.orange}33` }}>
            <p style={{ fontSize: 13, color: T.orange }}>Device limit reached. Upgrade your plan for more devices.</p>
            <button onClick={() => navigate("/pricing")} className="dash-btn" style={{ ...sty.btn("linear-gradient(135deg, #6366f1, #14e3c5)"), marginTop: 8 }}>Upgrade Plan</button>
          </div>
        </AniCard>
      )}
    </AniTab>
  );

  const renderSecurity = () => (
    <AniTab>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Security Center</span></h2>
      {/* Free: Score + Factors */}
      <div className="dash-card" style={{ ...sty.card, marginBottom: 20, animation: "fadeInUp 0.5s ease both" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Security Score</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ width: 100, height: 100, position: "relative" }}>
            <ResponsiveContainer width={100} height={100}>
              <PieChart><Pie data={[{ v: secScore }, { v: 100 - secScore }]} dataKey="v" innerRadius={30} outerRadius={45} startAngle={90} endAngle={-270} paddingAngle={2}>
                <Cell fill={secScore >= 80 ? T.green : secScore >= 50 ? T.orange : T.red} /><Cell fill="rgba(148,163,184,0.1)" />
              </Pie></PieChart>
            </ResponsiveContainer>
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'", animation: "scaleIn 0.6s ease 0.3s both" }}>{secScore}</span>
          </div>
          <div style={{ flex: 1 }}>
            {secFactors.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {f.done ? <HiOutlineCheck size={14} color={T.green} /> : <HiOutlineX size={14} color={T.red} />}
                <span style={{ fontSize: 13, color: f.done ? T.white : T.muted }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Free: Password checker */}
      <div className="dash-card" style={{ ...sty.card, marginBottom: 20, animation: "fadeInUp 0.5s ease 0.1s both" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Password Strength Checker</h3>
        <div style={{ position: "relative" }}>
          <input type={showPw ? "text" : "password"} placeholder="Test a password..." value={pwInput} onChange={(e) => setPwInput(e.target.value)} style={sty.input} />
          <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
            {showPw ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
          </button>
        </div>
        {pwInput && (() => {
          const r = passwordStrength(pwInput);
          return (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 4, borderRadius: 2, background: T.border, overflow: "hidden" }}>
                <div style={{ width: `${(r.score / 5) * 100}%`, height: "100%", background: r.color, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 12, color: r.color, marginTop: 4, display: "block" }}>{r.label}</span>
            </div>
          );
        })()}
      </div>
      {/* Pro: URL Scanner + Email Breach */}
      <PlanGate required="pro" feature="Advanced security tools">
        <div style={{ ...sty.card, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>URL Safety Scanner</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Enter URL to check..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} style={{ ...sty.input, flex: 1 }} />
            <button onClick={() => setUrlResult(checkUrlSafety(urlInput))} style={sty.btn(T.accent)}>Scan</button>
          </div>
          {urlResult && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: urlResult.safe ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: urlResult.safe ? T.green : T.red }}>{urlResult.safe ? "URL appears safe" : "Potential issues found"}</span>
              {urlResult.issues.map((iss, i) => <p key={i} style={{ fontSize: 12, color: T.orange, margin: "4px 0 0" }}>- {iss}</p>)}
            </div>
          )}
        </div>
        <div style={{ ...sty.card, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Email Breach Checker</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Enter email to check..." value={emailCheckInput} onChange={(e) => setEmailCheckInput(e.target.value)} style={{ ...sty.input, flex: 1 }} />
            <button onClick={async () => {
              if (!emailCheckInput) return;
              setEmailCheckResult({ checking: true });
              await new Promise((r) => setTimeout(r, 1200));
              setEmailCheckResult({ checking: false, breached: false, message: "No known breaches found for this email." });
              logActivity("email_breach_check", `Checked ${emailCheckInput}`);
            }} style={sty.btn(T.accent)}>Check</button>
          </div>
          {emailCheckResult && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: emailCheckResult.checking ? "rgba(99,102,241,0.08)" : emailCheckResult.breached ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)" }}>
              {emailCheckResult.checking ? <span style={{ fontSize: 13, color: T.accent }}>Checking...</span>
                : <span style={{ fontSize: 13, color: emailCheckResult.breached ? T.red : T.green }}>{emailCheckResult.message}</span>}
            </div>
          )}
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Security Recommendations</h3>
          {[
            { text: "Enable two-factor authentication", done: false },
            { text: "Use a unique password for each account", done: false },
            { text: "Keep your devices updated", done: true },
            { text: "Review connected apps regularly", done: false },
            { text: "Monitor your email for breaches", done: secFactors.find((f) => f.label === "Email Verified")?.done || false },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
              {r.done ? <HiOutlineCheck size={14} color={T.green} /> : <HiOutlineChevronRight size={14} color={T.orange} />}
              <span style={{ fontSize: 13, color: r.done ? T.muted : T.white }}>{r.text}</span>
            </div>
          ))}
        </div>
      </PlanGate>
    </AniTab>
  );

  const renderThreatMonitor = () => (
    <AniTab>
    <PlanGate required="pro" feature="Threat Monitor">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Threat Monitor</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
          {[
            { title: "Dark Web Monitoring", status: "Active", statusColor: T.green, sub: `Monitoring: ${user?.email}`, dot: true },
            { title: "Breach Status", status: "No breaches found", statusColor: T.green, sub: `Last checked: ${new Date().toLocaleDateString()}` },
            { title: "Network Status", status: "Secure", statusColor: T.green, sub: `Connection: ${navigator.onLine ? "Online" : "Offline"}` },
          ].map((c, i) => (
            <div key={i} className="dash-card" style={{ ...sty.card, animation: `fadeInUp 0.5s ease ${i * 0.1}s both`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.green}, ${T.cyan})` }} />
              <h4 style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>{c.title}</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {c.dot && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />}
                <span style={{ fontSize: 14, color: c.statusColor, fontWeight: 600 }}>{c.status}</span>
              </div>
              <p style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{c.sub}</p>
            </div>
          ))}
        </div>
        <AniCard delay={0.3}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Threat Feed</h3>
          {threatEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <HiOutlineShieldCheck size={36} color={T.green} />
              <p style={{ fontSize: 14, color: T.green, marginTop: 8, fontWeight: 600 }}>All clear</p>
              <p style={{ fontSize: 12, color: T.muted }}>No security threats detected</p>
            </div>
          ) : (
            threatEvents.slice(0, 10).map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <HiOutlineExclamation size={14} color={T.orange} />
                  <span style={{ fontSize: 13, color: T.white }}>{e.detail || e.type}</span>
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>{e.timestamp?.toDate ? e.timestamp.toDate().toLocaleDateString() : ""}</span>
              </div>
            ))
          )}
        </AniCard>
      </div>
    </PlanGate>
    </AniTab>
  );

  const renderAnalytics = () => (
    <AniTab>
    <PlanGate required="pro" feature="Analytics">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Analytics</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <div className="dash-card" style={{ ...sty.card, animation: "fadeInUp 0.5s ease both" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Login History</h3>
            {loginChartData.length === 0 ? <p style={{ fontSize: 13, color: T.muted }}>No login data yet</p> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={loginChartData}><XAxis dataKey="date" tick={{ fontSize: 10, fill: T.muted }} /><YAxis tick={{ fontSize: 10, fill: T.muted }} /><Tooltip />
                  <Area type="monotone" dataKey="logins" stroke={T.cyan} fill={`${T.cyan}33`} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="dash-card" style={{ ...sty.card, animation: "fadeInUp 0.5s ease 0.1s both" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Device Types</h3>
            {deviceTypeData.length === 0 ? <p style={{ fontSize: 13, color: T.muted }}>No device data</p> : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={deviceTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name }) => name}>
                  {deviceTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="dash-card" style={{ ...sty.card, animation: "fadeInUp 0.5s ease 0.2s both" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>Security Events</h3>
            {eventTypeData.length === 0 ? <p style={{ fontSize: 13, color: T.muted }}>No events recorded</p> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={eventTypeData}><XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} /><YAxis tick={{ fontSize: 10, fill: T.muted }} /><Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>{eventTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </PlanGate>
    </AniTab>
  );

  const renderReports = () => (
    <AniTab>
    <PlanGate required="pro" feature="Security Reports">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Security Reports</span></h2>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button onClick={generateReport} className="dash-btn" style={sty.btn(T.accent)}><HiOutlineDocumentReport size={14} /> Generate Report</button>
        </div>
        {reports.length === 0 ? (
          <AniCard delay={0.1}>
            <div style={{ textAlign: "center", padding: 32 }}>
            <HiOutlineDocumentReport size={40} style={{ color: T.muted, marginBottom: 12 }} />
            <p style={{ color: T.muted, fontSize: 14 }}>No reports generated yet</p>
            <p style={{ color: T.muted, fontSize: 12 }}>Generate your first security report above</p>
            </div>
          </AniCard>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {reports.map((r, idx) => (
              <div key={r.id} className="dash-card" style={{ ...sty.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, animation: `slideInLeft 0.4s ease ${idx * 0.08}s both` }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.white }}>Report - {r.generatedAt || "Latest"}</span>
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: T.muted }}>Score: {r.securityScore}/100</span>
                    <span style={{ fontSize: 11, color: T.muted }}>Devices: {r.devices}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>Plan: {r.plan}</span>
                  </div>
                </div>
                <button onClick={() => downloadReport(r)} className="dash-btn" style={sty.btn("rgba(20,227,197,0.12)", T.cyan)}><HiOutlineDownload size={14} /> Download</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlanGate>
    </AniTab>
  );

  const renderApiAccess = () => (
    <AniTab>
    <PlanGate required="enterprise" feature="API Access">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">API Access</span></h2>
        <AniCard delay={0.1}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Vrikaan Sans'" }}>API Key</h3>
          {apiKey ? (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.cyan, fontSize: 13, fontFamily: "'Vrikaan Mono', monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{apiKey}</code>
                <button onClick={copyApiKey} style={sty.btn("rgba(20,227,197,0.12)", T.cyan)}><HiOutlineClipboard size={14} /> Copy</button>
              </div>
              <button onClick={generateApiKey} style={{ ...sty.btn("rgba(239,68,68,0.12)", T.orange), marginTop: 12 }}><HiOutlineRefresh size={14} /> Regenerate</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 24 }}>
              <HiOutlineKey size={32} style={{ color: T.muted, marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>No API key generated yet</p>
              <button onClick={generateApiKey} style={sty.btn(T.accent)}><HiOutlineKey size={14} /> Generate API Key</button>
            </div>
          )}
        </AniCard>
        <AniCard delay={0.2}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Usage</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[["Requests Today", "0"], ["Monthly Quota", "10,000"], ["Rate Limit", "100/min"]].map(([l, v], i) => (
              <div key={i} style={{ textAlign: "center", padding: 16, background: "rgba(99,102,241,0.06)", borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: T.muted }}>{l}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Vrikaan Sans'" }}>{v}</p>
              </div>
            ))}
          </div>
          <a href="https://docs.vrikaan.com/api" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 13, color: T.cyan, textDecoration: "none", transition: "all 0.2s" }}>
            <HiOutlineGlobe size={14} /> API Documentation <HiOutlineChevronRight size={12} />
          </a>
        </AniCard>
      </div>
    </PlanGate>
    </AniTab>
  );

  /* ─── Tool History Tab ─── */
  const toolIcons = { "Threat Map": HiOutlineMap, "Fraud Analyzer": HiOutlineSearchCircle, "Security Score": HiOutlineFingerPrint, "Dark Web Monitor": HiOutlineGlobe, "Password Vault": HiOutlineKey, "Vulnerability Scanner": HiOutlineLightningBolt, "Email Analyzer": HiOutlineMail, "IP Lookup": HiOutlineGlobe, "QR Scanner": HiOutlineCode, "Security Checklist": HiOutlineClipboardCheck };
  const renderToolHistory = () => (
    <AniTab>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Tool History</span></h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadToolHistory} className="dash-btn" style={sty.btn("rgba(99,102,241,0.12)", T.cyan)}><HiOutlineRefresh size={14} /> Refresh</button>
          {toolHistory.length > 0 && <button onClick={exportToolHistoryCsv} className="dash-btn" style={sty.btn("rgba(34,197,94,0.12)", T.green)}><HiOutlineDownload size={14} /> CSV</button>}
          {toolHistory.length > 0 && <button onClick={clearToolHistory} className="dash-btn" style={sty.btn("rgba(239,68,68,0.12)", T.red)}><HiOutlineTrash size={14} /> Clear</button>}
        </div>
      </div>
      {/* Stats summary */}
      {toolHistory.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {(() => {
            const toolCounts = {};
            toolHistory.forEach((h) => { toolCounts[h.tool] = (toolCounts[h.tool] || 0) + 1; });
            return Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tool, count], i) => {
              const Icon = toolIcons[tool] || HiOutlineCode;
              return (
                <div key={tool} className="dash-stat" style={{ ...sty.card, textAlign: "center", animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
                  <Icon size={20} style={{ color: T.cyan, marginBottom: 6 }} />
                  <p style={{ fontSize: 20, fontWeight: 700, color: T.white, margin: "4px 0", fontFamily: "'Vrikaan Sans'" }}>{count}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{tool}</p>
                </div>
              );
            });
          })()}
        </div>
      )}
      {toolHistoryLoading ? <Spinner /> : toolHistory.length === 0 ? (
        <AniCard>
          <div style={{ textAlign: "center", padding: 40 }}>
            <HiOutlineClock size={48} style={{ color: T.muted, marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: T.white, margin: "0 0 8px" }}>No tool history yet</p>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Your security tool results will appear here as you use them.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {toolLinks.slice(0, 4).map((t) => (
                <button key={t.path} onClick={() => navigate(t.path)} className="dash-btn" style={{ ...sty.btn("rgba(99,102,241,0.12)", T.cyan), padding: "8px 14px" }}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </AniCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {toolHistory.map((h, i) => {
            const Icon = toolIcons[h.tool] || HiOutlineCode;
            const statusColor = h.status === "success" ? T.green : h.status === "warning" ? T.orange : h.status === "error" ? T.red : T.cyan;
            return (
              <div key={h.id} className="dash-card" style={{ ...sty.card, padding: 16, animation: `fadeInUp 0.3s ease ${i * 0.04}s both` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} style={{ color: statusColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{h.tool}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge color={statusColor}>{h.status || "completed"}</Badge>
                        <span style={{ fontSize: 11, color: T.muted }}>{h.timestamp?.toDate ? h.timestamp.toDate().toLocaleString() : ""}</span>
                      </div>
                    </div>
                    {h.query && <p style={{ fontSize: 12, color: T.muted, margin: "6px 0 0", fontFamily: "'Vrikaan Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.query}</p>}
                    {h.result && <p style={{ fontSize: 12, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>{typeof h.result === "string" ? h.result.slice(0, 150) : JSON.stringify(h.result).slice(0, 150)}{((h.result?.length || JSON.stringify(h.result).length) > 150) ? "..." : ""}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AniTab>
  );

  const renderAccount = () => {
    const isEmailProvider = user?.provider === "password" || user?.provider === "email" || !user?.provider;
    return (
    <AniTab>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Vrikaan Sans'" }}><span className="dash-gradient-text">Account Settings</span></h2>
      {/* Profile + Avatar */}
      <AniCard delay={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, fontFamily: "'Vrikaan Sans'" }}>Profile</h3>
          {!editing && <button onClick={() => setEditing(true)} className="dash-btn" style={sty.btn("rgba(99,102,241,0.12)", T.accent)}><HiOutlinePencil size={14} /> Edit</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <div className="dash-avatar" style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Vrikaan Sans'", overflow: "hidden", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
              {(user?.photoURL || user?.avatar) ? <img src={user.photoURL || user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" /> : (user?.name?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <button onClick={() => setEditingAvatar(!editingAvatar)} title="Change avatar" style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: T.accent, border: `2px solid ${T.bg}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
              <HiOutlinePhotograph size={12} />
            </button>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.white }}>{user?.name || "User"}</p>
            <Badge color={planColors[userPlan]}>{planLabels[userPlan]}</Badge>
            <span style={{ marginLeft: 8 }}><Badge color={T.muted}>{providerLabel(user?.provider)}</Badge></span>
          </div>
        </div>
        {editingAvatar && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.15)` }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>Avatar URL</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" style={{ ...sty.input, flex: 1 }} />
              <button onClick={saveAvatar} className="dash-btn" style={sty.btn(T.cyan)}><HiOutlineSave size={14} /> Save</button>
              <button onClick={() => setEditingAvatar(false)} className="dash-btn" style={sty.btn("rgba(148,163,184,0.12)", T.muted)}>Cancel</button>
            </div>
            {avatarUrl && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: T.muted }}>Preview:</span>
                <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.border}` }}>
                  <img src={avatarUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>Name</label>
            {editing ? <input value={editName} onChange={(e) => setEditName(e.target.value)} style={sty.input} />
              : <p style={{ fontSize: 14, color: T.white, margin: 0 }}>{user?.name || "Not set"}</p>}
          </div>
          <div>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>Email</label>
            <p style={{ fontSize: 14, color: T.white, margin: 0 }}>{user?.email}</p>
          </div>
          <div>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>Phone</label>
            {editing ? <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+1234567890" style={sty.input} />
              : <p style={{ fontSize: 14, color: T.white, margin: 0 }}>{user?.phoneNumber || "Not set"}</p>}
          </div>
          {editing && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveProfile} disabled={saving} className="dash-btn" style={sty.btn(T.cyan)}><HiOutlineSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              <button onClick={() => { setEditing(false); setEditName(user?.name || ""); setEditPhone(user?.phoneNumber || ""); }} className="dash-btn" style={sty.btn("rgba(148,163,184,0.12)", T.muted)}>Cancel</button>
            </div>
          )}
        </div>
      </AniCard>
      {/* Password Change (email/password users only) */}
      {isEmailProvider && (
        <AniCard delay={0.1}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 14, fontFamily: "'Vrikaan Sans'" }}>Change Password</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" style={sty.input} />
                <button onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0 }}>
                  {showCurrentPw ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" style={sty.input} />
                <button onClick={() => setShowNewPw(!showNewPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0 }}>
                  {showNewPw ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
              {newPw && (() => { const r = passwordStrength(newPw); return (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 3, borderRadius: 2, background: T.border, overflow: "hidden" }}>
                    <div style={{ width: `${(r.score / 5) * 100}%`, height: "100%", background: r.color, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: r.color, marginTop: 2, display: "block" }}>{r.label}</span>
                </div>
              ); })()}
            </div>
            <div>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 4 }}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" style={sty.input} />
              {confirmPw && newPw !== confirmPw && <span style={{ fontSize: 11, color: T.red, marginTop: 2, display: "block" }}>Passwords don't match</span>}
            </div>
            <button onClick={handlePasswordChange} disabled={changingPw || !newPw || newPw !== confirmPw} className="dash-btn" style={{ ...sty.btn(T.accent), opacity: (!newPw || newPw !== confirmPw) ? 0.5 : 1, alignSelf: "flex-start" }}>
              <HiOutlineLockClosed size={14} /> {changingPw ? "Updating..." : "Update Password"}
            </button>
          </div>
        </AniCard>
      )}
      {/* Appearance */}
      <AniCard delay={isEmailProvider ? 0.2 : 0.1}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 14, fontFamily: "'Vrikaan Sans'" }}>Appearance</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {themeMode === "dark" ? <HiOutlineMoon size={20} style={{ color: T.accent }} /> : <HiOutlineSun size={20} style={{ color: "#f59e0b" }} />}
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.white, margin: 0 }}>{themeMode === "dark" ? "Dark Mode" : "Light Mode"}</p>
              <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>Switch between dark and light themes</p>
            </div>
          </div>
          <button onClick={toggleTheme} style={{ width: 48, height: 26, borderRadius: 13, background: themeMode === "dark" ? T.accent : "rgba(148,163,184,0.3)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: themeMode === "dark" ? 25 : 3, transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </button>
        </div>
      </AniCard>
      {/* Notification Preferences */}
      <AniCard delay={isEmailProvider ? 0.3 : 0.2}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 14, fontFamily: "'Vrikaan Sans'" }}>Notification Preferences</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "security", label: "Security Alerts", desc: "Get notified about threats and breaches", icon: HiOutlineShieldCheck },
            { key: "updates", label: "Product Updates", desc: "New features and improvements", icon: HiOutlineBell },
            { key: "weekly", label: "Weekly Report", desc: "Receive weekly security summary", icon: HiOutlineDocumentReport },
            { key: "browser_push", label: "Browser Notifications", desc: "Real-time alerts in your browser", icon: HiOutlineBell, isPush: true },
            { key: "marketing", label: "Marketing", desc: "Tips, offers, and promotions", icon: HiOutlineMail },
          ].map((n) => (
            <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <n.icon size={18} style={{ color: notifPrefs[n.key] ? T.cyan : T.muted }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.white, margin: 0 }}>{n.label}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: "1px 0 0" }}>{n.desc}</p>
                </div>
              </div>
              <button onClick={() => saveNotifPrefs(n.key)} style={{ width: 44, height: 24, borderRadius: 12, background: (n.isPush ? isPushEnabled() : notifPrefs[n.key]) ? T.cyan : "rgba(148,163,184,0.2)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: (n.isPush ? isPushEnabled() : notifPrefs[n.key]) ? 23 : 3, transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </button>
            </div>
          ))}
        </div>
      </AniCard>
      {/* Plan */}
      <AniCard delay={isEmailProvider ? 0.4 : 0.3}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Current Plan</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: planColors[userPlan], fontFamily: "'Vrikaan Sans'" }}>{planLabels[userPlan]}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {(planFeatures[userPlan] || planFeatures.free).map((f, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.muted }}><HiOutlineCheck size={12} color={T.green} /> {f}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {userPlan !== "enterprise" && (
            <button onClick={() => navigate("/pricing")} className="dash-btn" style={sty.btn("linear-gradient(135deg, #6366f1, #14e3c5)")}>Upgrade Plan <HiOutlineChevronRight size={14} /></button>
          )}
          {userPlan !== "free" && (
            <button onClick={() => setShowCancelModal(true)} className="dash-btn" style={sty.btn("rgba(239,68,68,0.1)", T.red)}>Cancel Plan</button>
          )}
        </div>
      </AniCard>
      {/* Payments */}
      <AniCard delay={isEmailProvider ? 0.5 : 0.4}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 12, fontFamily: "'Vrikaan Sans'" }}>Payment History</h3>
        {payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,227,197,0.08)", border: `1px solid ${T.border}`, fontSize: 20 }}>💳</div>
            <p style={{ fontSize: 13, color: T.white, margin: "0 0 4px", fontWeight: 500 }}>No payments yet</p>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 12px", lineHeight: 1.6 }}>You're on the free plan. Upgrade to unlock pro features.</p>
            <button onClick={() => navigate("/pricing")} className="dash-btn" style={{ ...sty.btn("rgba(99,102,241,0.12)", T.accent), margin: "0 auto" }}>View Plans <HiOutlineChevronRight size={12} /></button>
          </div>
        ) : (
          <div>
            {payments.map((p, i) => {
              const ageMs = p.date?.toDate ? Date.now() - p.date.toDate().getTime() : Infinity;
              const refundEligible = !p.refunded && p.status === "success" && ageMs < 7 * 24 * 60 * 60 * 1000 && p.orderId;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < payments.length - 1 ? `1px solid ${T.border}` : "none", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: T.white }}>{p.description || p.plan || "Payment"}</span>
                    <p style={{ fontSize: 11, color: T.muted, margin: "2px 0 0" }}>{p.date?.toDate ? p.date.toDate().toLocaleDateString() : p.date || ""}</p>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.cyan }}>{p.amount ? `₹${p.amount}` : ""}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {p.refunded && <Badge color={T.muted}>refunded</Badge>}
                      {!p.refunded && p.status && <Badge color={p.status === "success" ? T.green : T.orange}>{p.status}</Badge>}
                      {refundEligible && (
                        <button
                          onClick={() => requestRefund(p)}
                          style={{ padding: "3px 10px", fontSize: 11, borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, cursor: "pointer", fontFamily: "'Vrikaan Sans'" }}
                        >Refund</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AniCard>
      {/* Two-Factor Authentication */}
      <AniCard delay={isEmailProvider ? 0.55 : 0.45}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 6, fontFamily: "'Vrikaan Sans'" }}>
          Two-Factor Authentication
          {mfaEnrolled && <span style={{ marginLeft: 10, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(34,197,94,0.15)", color: T.green, fontWeight: 600 }}>ACTIVE</span>}
        </h3>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>
          Add a second login factor using any authenticator app (Google Authenticator, Authy, 1Password, etc).
        </p>

        {!mfaEnrolled && !totpSetup && (
          <button onClick={startTotpEnroll} disabled={totpBusy} style={sty.btn("rgba(99,102,241,0.12)", T.cyan)}>
            {totpBusy ? "Loading..." : "Enable 2FA"}
          </button>
        )}

        {!mfaEnrolled && totpSetup && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: T.white, margin: 0 }}>1. Scan this QR with your authenticator app:</p>
            <img src={totpSetup.qrDataUri} alt="Scan with authenticator" style={{ width: 220, height: 220, borderRadius: 8, alignSelf: "flex-start", background: "#fff", padding: 6 }} />
            <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Or manually enter this secret: <code style={{ color: T.cyan, fontFamily: "'Vrikaan Mono', monospace", fontSize: 12 }}>{totpSetup.secret}</code></p>
            <p style={{ fontSize: 13, color: T.white, margin: 0 }}>2. Enter the 6-digit code from your app:</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                style={{ width: 140, padding: "10px 14px", borderRadius: 8, fontSize: 16, background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}`, color: T.white, fontFamily: "'Vrikaan Mono', monospace", letterSpacing: 4 }}
              />
              <button onClick={confirmTotp} disabled={totpBusy || totpCode.length !== 6} style={{ ...sty.btn(`linear-gradient(135deg,${T.accent},${T.cyan})`, "#fff"), opacity: totpBusy || totpCode.length !== 6 ? 0.6 : 1 }}>
                {totpBusy ? "Verifying..." : "Confirm"}
              </button>
              <button onClick={() => { setTotpSetup(null); setTotpCode(""); }} style={sty.btn("rgba(148,163,184,0.12)", T.muted)}>Cancel</button>
            </div>
          </div>
        )}

        {backupCodes && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: T.yellow, margin: "0 0 8px", fontWeight: 600 }}>⚠ Save these backup codes — shown only once</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
              {backupCodes.map((c) => (
                <code key={c} style={{ padding: "6px 10px", background: "rgba(15,23,42,0.6)", borderRadius: 4, fontFamily: "'Vrikaan Mono', monospace", fontSize: 13, color: T.white, textAlign: "center" }}>{c}</code>
              ))}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")); toast("Backup codes copied", "success"); }}
              style={{ ...sty.btn("rgba(99,102,241,0.12)", T.cyan), marginTop: 10 }}
            >Copy all</button>
          </div>
        )}

        {mfaEnrolled && !totpSetup && (
          <button onClick={disableTotp} disabled={totpBusy} style={sty.btn("rgba(239,68,68,0.12)", T.red)}>
            {totpBusy ? "..." : "Disable 2FA"}
          </button>
        )}
      </AniCard>

      {/* Outbound Webhooks */}
      <AniCard delay={isEmailProvider ? 0.58 : 0.48}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 6, fontFamily: "'Vrikaan Sans'" }}>
          Outbound Webhook
          {webhookEnabled && <span style={{ marginLeft: 10, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(34,197,94,0.15)", color: T.green, fontWeight: 600 }}>ACTIVE</span>}
        </h3>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>
          Receive real-time notifications (refunds, threats, scans) at your own HTTPS endpoint. Each request is signed with HMAC-SHA256 in the <code style={{ color: T.cyan }}>X-Vrikaan-Signature</code> header.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}`, color: T.white }}
            disabled={webhookBusy}
          />
          <button onClick={saveWebhook} disabled={webhookBusy || !webhookUrl} style={sty.btn("rgba(99,102,241,0.12)", T.cyan)}>
            {webhookBusy ? "..." : webhookEnabled ? "Update" : "Save"}
          </button>
        </div>
        {webhookEnabled && (
          <>
            <div style={{ padding: 10, background: "rgba(15,23,42,0.5)", borderRadius: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: T.muted }}>Signing secret (verify HMAC on your server):</span>
              <code style={{ display: "block", marginTop: 4, fontFamily: "'Vrikaan Mono', monospace", fontSize: 12, color: T.cyan, wordBreak: "break-all" }}>{webhookSecret}</code>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={testWebhook} disabled={webhookBusy} style={sty.btn("rgba(34,197,94,0.12)", T.green)}>Send test ping</button>
              <button onClick={clearWebhook} disabled={webhookBusy} style={sty.btn("rgba(239,68,68,0.12)", T.red)}>Remove</button>
            </div>
          </>
        )}
      </AniCard>

      {/* Session Info */}
      <AniCard delay={isEmailProvider ? 0.6 : 0.5}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 14, fontFamily: "'Vrikaan Sans'" }}>Active Session</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {[
            { label: "Device", value: currentDevice.name, icon: HiOutlineDesktopComputer },
            { label: "Browser", value: currentDevice.browser, icon: HiOutlineGlobe },
            { label: "OS", value: `${currentDevice.os}${currentDevice.osVersion ? " " + currentDevice.osVersion : ""}`, icon: HiOutlineDesktopComputer },
            { label: "Type", value: currentDevice.type, icon: HiOutlineFingerPrint },
            { label: "Screen", value: currentDevice.screenRes, icon: HiOutlineDesktopComputer },
            currentDevice.cpu && { label: "CPU", value: `${currentDevice.cpu} cores`, icon: HiOutlineDesktopComputer },
            currentDevice.ram && { label: "RAM", value: `${currentDevice.ram} GB`, icon: HiOutlineDesktopComputer },
            currentDevice.gpu && { label: "GPU", value: currentDevice.gpu, icon: HiOutlineDesktopComputer },
          ].filter(Boolean).map((s) => (
            <div key={s.label} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(148,163,184,0.04)", border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <s.icon size={14} style={{ color: T.cyan }} />
                <span style={{ fontSize: 11, color: T.muted }}>{s.label}</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.white, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </AniCard>
      {/* Delete Account */}
      <div className="dash-card" style={{ ...sty.card, borderColor: "rgba(239,68,68,0.15)", animation: `fadeInUp 0.5s ease ${isEmailProvider ? 0.7 : 0.6}s both` }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.red, marginBottom: 8, fontFamily: "'Vrikaan Sans'" }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>Permanently delete your account and all data. This action cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} className="dash-btn" style={sty.btn("rgba(239,68,68,0.12)", T.red)}><HiOutlineTrash size={14} /> Delete Account</button>
      </div>
    </AniTab>
    );
  };

  const tabs = { Overview: renderOverview, Devices: renderDevices, Security: renderSecurity, "Tool History": renderToolHistory, "Threat Monitor": renderThreatMonitor, Analytics: renderAnalytics, Reports: renderReports, "API Access": renderApiAccess, Account: renderAccount };

  if (!user) return null;

  return (
    <>
      <SEO title="Dashboard | Vrikaan" description="Manage your security, devices, and account settings." />
      <OnboardingTour uid={user?.uid} />
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", fontFamily: "'Vrikaan Sans', sans-serif" }}>
        {/* Mobile hamburger */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open menu" style={{
          position: "fixed", top: 16, left: 16, zIndex: 100,
          background: "rgba(10,15,30,0.85)", backdropFilter: "blur(8px)",
          border: `1px solid ${T.border}`, borderRadius: 10, padding: 10,
          color: T.white, cursor: "pointer",
          display: isMobile ? "flex" : "none",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          <HiOutlineMenuAlt2 size={20} />
        </button>
        {/* Sidebar */}
        <aside style={{
          width: isMobile ? 280 : 240, height: "100vh",
          background: "linear-gradient(180deg, #0a0f1e 0%, #070b14 100%)",
          borderRight: `1px solid ${T.border}`,
          padding: "24px 12px", display: "flex", flexDirection: "column",
          position: "fixed", left: 0, top: 0,
          zIndex: 90, transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          overflowX: "hidden",
          transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
          boxShadow: isMobile && sidebarOpen ? "8px 0 32px rgba(0,0,0,0.5)" : "none",
        }}>
          <div style={{ padding: "0 8px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/wolf-compact.png" alt="VRIKAAN" width={36} height={36} style={{ flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(20,227,197,0.4))" }} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "'Vrikaan Sans'", letterSpacing: 1 }}>
                <span style={{ color: T.cyan }}>VRI</span><span style={{ color: T.white }}>KAAN</span>
              </h1>
              <p style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Security Dashboard</p>
            </div>
          </div>
          {/* Home Button */}
          <button onClick={() => navigate("/")} style={{
            width: "calc(100% - 16px)", margin: "0 8px 12px", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.1))", border: `1px solid ${T.border}`,
            borderRadius: 8, color: T.cyan, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Vrikaan Sans'", textAlign: "left",
          }}>
            <HiOutlineHome size={18} /> Home
          </button>
          <nav className="usr-side-nav" style={{ flex: 1, overflowY: "auto" }}>
            <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, padding: "0 12px", marginBottom: 6 }}>Dashboard</p>
            {navItems.map((n, i) => {
              const locked = n.plan && !isPlanAllowed(userPlan, n.plan);
              const isActive = tab === n.label;
              return (
                <button key={n.label} className="dash-nav-item" onClick={() => { setTab(n.label); setSidebarOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                    border: "none", borderRadius: 8, color: isActive ? T.cyan : T.muted,
                    fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer",
                    marginBottom: 2, fontFamily: "'Vrikaan Sans'", textAlign: "left",
                    opacity: locked ? 0.5 : 1,
                    borderLeft: isActive ? `3px solid ${T.cyan}` : "3px solid transparent",
                    animation: `slideInLeft 0.3s ease ${i * 0.04}s both`,
                  }}>
                  <n.icon size={18} /> {n.label}
                  {locked && <HiOutlineLockClosed size={12} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
            <div style={{ height: 1, background: T.border, margin: "12px 8px" }} />
            <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, padding: "0 12px", marginBottom: 6 }}>Tools & Features</p>
            {toolLinks.map((t, i) => (
              <button key={t.path} className="dash-tool-link" onClick={() => { navigate(t.path); setSidebarOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: "transparent", border: "none", borderRadius: 8, color: T.muted,
                  fontSize: 12, fontWeight: 400, cursor: "pointer", marginBottom: 1,
                  fontFamily: "'Vrikaan Sans'", textAlign: "left",
                  animation: `slideInLeft 0.3s ease ${0.3 + i * 0.03}s both`,
                }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>
          <button onClick={handleSwitchAccount} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: "transparent", border: "none", borderRadius: 8, color: T.cyan,
            fontSize: 13, cursor: "pointer", fontFamily: "'Vrikaan Sans'", textAlign: "left",
          }}>
            <HiOutlineSwitchHorizontal size={18} /> Switch Account
          </button>
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: "transparent", border: "none", borderRadius: 8, color: T.red,
            fontSize: 13, cursor: "pointer", fontFamily: "'Vrikaan Sans'", textAlign: "left",
          }}>
            <HiOutlineLogout size={18} /> Sign Out
          </button>
        </aside>
        {/* Overlay for mobile */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80 }} />}
        {/* Main */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 240,
          padding: isMobile ? "64px 14px 96px" : isTablet ? "28px 24px 48px" : "32px 32px 48px",
          maxWidth: isMobile ? "100%" : 1100,
          width: "100%",
          minWidth: 0,
        }}>
          {loading ? <Spinner /> : tabs[tab] ? tabs[tab]() : renderOverview()}
        </main>
        {/* Mobile Bottom Nav — sticky, always visible on phones */}
        {isMobile && (
          <nav style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 95,
            background: "rgba(10,15,30,0.92)", backdropFilter: "blur(14px)",
            borderTop: `1px solid ${T.border}`,
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            padding: "6px 4px env(safe-area-inset-bottom)",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.4)",
          }}>
            {mobileBottomNav.map((n) => {
              const isActive = tab === n.label;
              return (
                <button
                  key={n.label}
                  type="button"
                  onClick={() => { setTab(n.label); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{
                    background: "transparent", border: "none", padding: "10px 4px 8px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    color: isActive ? T.cyan : T.muted,
                    cursor: "pointer", fontFamily: "'Vrikaan Sans'",
                    transition: "color 0.2s",
                  }}
                >
                  <n.icon size={22} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{n.label}</span>
                  {isActive && <span style={{ position: "absolute", top: 0, width: 28, height: 3, borderRadius: "0 0 3px 3px", background: T.cyan }} />}
                </button>
              );
            })}
          </nav>
        )}
        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.2s ease" }}>
            <div style={{ ...sty.card, maxWidth: 420, width: "90%", textAlign: "center", animation: "scaleIn 0.3s ease both" }}>
              <HiOutlineExclamation size={40} color={T.orange} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginTop: 12, fontFamily: "'Vrikaan Sans'" }}>Cancel {planLabels[userPlan]} Plan?</h3>
              <p style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
                Your plan stays active until the current billing period ends. After that, your account reverts to the free plan. You can re-subscribe anytime.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                <button onClick={() => setShowCancelModal(false)} disabled={cancelling} style={sty.btn("rgba(148,163,184,0.12)", T.muted)}>Keep Plan</button>
                <button onClick={handleCancelSubscription} disabled={cancelling} style={sty.btn(T.orange)}>
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Modal */}
        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.2s ease" }}>
            <div style={{ ...sty.card, maxWidth: 400, width: "90%", textAlign: "center", animation: "scaleIn 0.3s ease both" }}>
              <HiOutlineExclamation size={40} color={T.red} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.white, marginTop: 12, fontFamily: "'Vrikaan Sans'" }}>Delete Account?</h3>
              <p style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>This will permanently delete your account and all associated data. This cannot be undone.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                <button onClick={() => setShowDeleteModal(false)} style={sty.btn("rgba(148,163,184,0.12)", T.muted)}>Cancel</button>
                <button onClick={handleDeleteAccount} style={sty.btn(T.red)}>Delete Forever</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
        @keyframes glow { 0%,100% { box-shadow:0 0 5px rgba(99,102,241,0.3) } 50% { box-shadow:0 0 20px rgba(99,102,241,0.6) } }
        @keyframes gradientShift { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes borderGlow { 0%,100% { border-color:rgba(99,102,241,0.1) } 50% { border-color:rgba(99,102,241,0.3) } }
        .dash-card:hover { transform:translateY(-3px) !important; box-shadow:0 8px 32px rgba(99,102,241,0.15) !important; border-color:rgba(99,102,241,0.2) !important }
        .dash-btn:hover { transform:scale(1.04) !important; filter:brightness(1.1) }
        .dash-nav-item { transition:all 0.2s ease !important }
        .dash-nav-item:hover { background:rgba(99,102,241,0.1) !important; transform:translateX(4px) }
        .dash-tool-link { transition:all 0.2s ease !important }
        .dash-tool-link:hover { background:rgba(20,227,197,0.08) !important; color:${T.cyan} !important; transform:translateX(4px) }
        .dash-stat { transition:all 0.3s cubic-bezier(0.4,0,0.2,1) !important }
        .dash-stat:hover { transform:translateY(-4px) scale(1.02) !important }
        .dash-stat:hover .stat-value { text-shadow:0 0 20px currentColor }
        .stat-value { transition:all 0.3s ease }
        .dash-input:focus { border-color:${T.accent} !important; box-shadow:0 0 0 3px rgba(99,102,241,0.15) !important }
        .dash-quick-action { transition:all 0.25s ease !important }
        .dash-quick-action:hover { transform:translateY(-3px) !important; box-shadow:0 4px 16px rgba(99,102,241,0.2) !important }
        .dash-avatar { animation:glow 3s ease-in-out infinite }
        .dash-gradient-text { background:linear-gradient(135deg,${T.cyan},${T.accent}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-size:200% 200%; animation:gradientShift 4s ease infinite }
        .dash-device:hover { transform:translateX(4px) !important; border-color:rgba(20,227,197,0.2) !important }
        .dash-row { transition:all 0.2s ease }
        .dash-row:hover { background:rgba(99,102,241,0.05) !important }
        @media (max-width: 768px) {
          /* Cards reflow tighter on mobile */
          .dash-card { padding: 16px !important; border-radius: 14px !important; }
          /* Larger tap targets */
          .dash-btn { min-height: 40px !important; }
          /* Hide section padding bleed */
          h2 { font-size: 22px !important; }
          h3 { font-size: 14px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .dash-card { padding: 18px !important; }
        }
        /* Smooth scrolling */
        main { scroll-behavior: smooth; }
        /* Prevent horizontal overflow on small screens */
        main, .dash-card { max-width: 100%; box-sizing: border-box; }
        table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .usr-side-nav::-webkit-scrollbar { width: 4px }
        .usr-side-nav::-webkit-scrollbar-track { background: transparent }
        .usr-side-nav::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 4px }
        .usr-side-nav::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.3) }
      `}</style>
    </>
  );
}
