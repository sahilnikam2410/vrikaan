import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import SEO from "../../components/SEO";
import {
  HiOutlineViewGrid, HiOutlineShieldCheck, HiOutlineBell, HiOutlineCog,
  HiOutlineLogout, HiOutlineGlobe, HiOutlineLightningBolt,
  HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCheck,
  HiOutlineLockClosed, HiOutlineWifi, HiOutlineMail, HiOutlineExclamation,
  HiOutlineCreditCard, HiOutlineChartBar, HiOutlineRefresh, HiOutlineStatusOnline,
  HiOutlineDesktopComputer, HiOutlineDeviceMobile, HiOutlineKey,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineSave, HiOutlineDownload,
  HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineClipboardCheck,
  HiOutlineDocumentReport, HiOutlineBan, HiOutlineDatabase
} from "react-icons/hi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", gold: "#eab308", pink: "#ec4899",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans'" },
  btn: (bg, clr) => ({ padding: "8px 16px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans'" }),
};

const Badge = ({ children, color }) => (
  <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{children}</span>
);

const activityData = [
  { day: "Mon", threats: 12, blocked: 11 }, { day: "Tue", threats: 19, blocked: 18 },
  { day: "Wed", threats: 8, blocked: 8 }, { day: "Thu", threats: 24, blocked: 22 },
  { day: "Fri", threats: 15, blocked: 14 }, { day: "Sat", threats: 6, blocked: 6 },
  { day: "Sun", threats: 3, blocked: 3 },
];

const monthlyData = [
  { month: "Oct", scans: 45, threats: 12 }, { month: "Nov", scans: 52, threats: 8 },
  { month: "Dec", scans: 38, threats: 15 }, { month: "Jan", scans: 61, threats: 6 },
  { month: "Feb", scans: 55, threats: 9 }, { month: "Mar", scans: 48, threats: 4 },
];

const deviceData = [
  { name: "Desktop", value: 45, color: T.accent }, { name: "Mobile", value: 30, color: T.cyan },
  { name: "Tablet", value: 15, color: T.orange }, { name: "IoT", value: 10, color: T.pink },
];

const ToolsIcon = ({ size = 20, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const navItems = [
  { icon: HiOutlineViewGrid, label: "Overview" },
  { icon: HiOutlineShieldCheck, label: "Protection" },
  { icon: HiOutlineGlobe, label: "Network" },
  { icon: HiOutlineChartBar, label: "Analytics" },
  { icon: ToolsIcon, label: "Tools" },
  { icon: HiOutlineBell, label: "Alerts", badge: 2 },
  { icon: HiOutlineCreditCard, label: "Billing" },
  { icon: HiOutlineCog, label: "Settings" },
];

const planLabels = { free: "Free", pro: "Professional", enterprise: "Enterprise" };
const planColors = { free: T.muted, pro: T.cyan, enterprise: T.accent };

export default function UserDashboard() {
  const { user, logout, updatePlan } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [devices, setDevices] = useState([
    { id: 1, name: "MacBook Pro", type: "Desktop", os: "macOS 14.2", status: "protected", lastScan: "2 hrs ago", threats: 0 },
    { id: 2, name: "iPhone 15", type: "Mobile", os: "iOS 17.3", status: "protected", lastScan: "1 hr ago", threats: 0 },
    { id: 3, name: "Windows PC", type: "Desktop", os: "Windows 11", status: "at_risk", lastScan: "3 days ago", threats: 2 },
    { id: 4, name: "iPad Air", type: "Tablet", os: "iPadOS 17", status: "protected", lastScan: "5 hrs ago", threats: 0 },
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, msg: "Suspicious login blocked from 45.33.21.88", time: "5 min ago", type: "warning", read: false },
    { id: 2, msg: "Weekly scan completed - 2 threats found", time: "2 hrs ago", type: "info", read: false },
    { id: 3, msg: "Password change recommended (90 days old)", time: "1 day ago", type: "info", read: true },
    { id: 4, msg: "Phishing email blocked: 'Account Verification'", time: "2 days ago", type: "warning", read: true },
    { id: 5, msg: "New device connected: iPad Air", time: "3 days ago", type: "info", read: true },
    { id: 6, msg: "Malware quarantined: trojan.gen.2", time: "5 days ago", type: "critical", read: true },
  ]);
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || "User", email: user?.email || "", notifications: true,
    twoFactor: false, weeklyReport: true, autoScan: true, darkMode: true,
  });
  const [blockedThreats, setBlockedThreats] = useState(1247);
  const [breachEmail, setBreachEmail] = useState(user?.email || "");
  const [breachChecking, setBreachChecking] = useState(false);
  const [breachResult, setBreachResult] = useState(null);
  const [pwInput, setPwInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlChecking, setUrlChecking] = useState(false);
  const [urlResult, setUrlResult] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setBlockedThreats(c => c + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(interval);
  }, []);

  const plan = user?.plan || "free";
  const handleLogout = () => { logout(); navigate("/"); };

  const handleScan = () => {
    setScanning(true);
    setScanResults(null);
    setTimeout(() => {
      setScanning(false);
      const threats = Math.floor(Math.random() * 3);
      setScanResults({
        filesScanned: 12847, threatsFound: threats,
        duration: "1m 23s", cleanFiles: 12845 + Math.floor(Math.random() * 2),
      });
      if (threats === 0) {
        toast("System scan completed — no threats found", "success");
      } else {
        toast(`Scan complete — ${threats} threat${threats > 1 ? "s" : ""} detected`, "warning");
      }
    }, 3000);
  };

  const dismissAlert = (id) => { setAlerts(a => a.filter(x => x.id !== id)); toast("Alert dismissed", "info"); };
  const markRead = (id) => setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));
  const removeDevice = (id) => { setDevices(d => d.filter(x => x.id !== id)); toast("Device removed", "warning"); };

  const handleBreachCheck = () => {
    setBreachChecking(true);
    setBreachResult(null);
    setTimeout(() => {
      setBreachChecking(false);
      if (breachEmail.toLowerCase().includes("admin")) {
        setBreachResult({
          found: true,
          breaches: [
            { name: "LinkedIn", year: 2021, records: "700M", severity: "high" },
            { name: "Adobe", year: 2019, records: "7.5M", severity: "medium" },
          ],
        });
        toast("Breach detected — 2 breaches found for this email", "error");
      } else {
        setBreachResult({ found: false });
        toast("No breaches found for this email", "success");
      }
    }, 1500);
  };

  const renderContent = () => {
    switch (activeNav) {
      case "Overview": return renderOverview();
      case "Protection": return renderProtection();
      case "Network": return renderNetwork();
      case "Analytics": return renderAnalytics();
      case "Tools": return renderTools();
      case "Alerts": return renderAlerts();
      case "Billing": return renderBilling();
      case "Settings": return renderSettings();
      default: return renderOverview();
    }
  };

  const renderOverview = () => {
    const protectedCount = devices.filter(d => d.status === "protected").length;
    const scoreFromDevices = Math.min(protectedCount * 20, 80);
    const scoreFromAlerts = alerts.filter(a => !a.read).length === 0 ? 10 : 0;
    const scoreFromPlan = (plan === "pro" || plan === "enterprise") ? 10 : 0;
    const secScore = scoreFromDevices + scoreFromAlerts + scoreFromPlan;
    const scoreColor = secScore > 70 ? T.green : secScore > 40 ? T.orange : T.red;
    const circumference = 2 * Math.PI * 45;
    const strokeOffset = circumference - (secScore / 100) * circumference;

    const timeline = [
      { time: "2 min ago", event: "Quick scan completed", type: "success" },
      { time: "15 min ago", event: "Suspicious login blocked from 45.33.21.88", type: "warning" },
      { time: "1 hr ago", event: "Windows PC scan found 2 threats", type: "danger" },
      { time: "3 hrs ago", event: "iPhone 15 connected securely", type: "info" },
      { time: "1 day ago", event: "Password change recommended", type: "info" },
    ];
    const tlColor = { success: T.green, warning: T.orange, danger: T.red, info: T.cyan };

    return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ ...sty.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 28px", minWidth: 160 }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
            <circle cx="55" cy="55" r="45" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={strokeOffset}
              strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "55px 55px", transition: "stroke-dashoffset 1s ease" }} />
            <text x="55" y="51" textAnchor="middle" fontSize="20" fontWeight="800" fill={scoreColor} fontFamily="'Space Grotesk'">{secScore}</text>
            <text x="55" y="66" textAnchor="middle" fontSize="10" fill="#94a3b8">/ 100</text>
          </svg>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6, textAlign: "center" }}>Security Score</div>
          <div style={{ fontSize: 11, color: scoreColor, fontWeight: 600, marginTop: 2 }}>{secScore > 70 ? "Good" : secScore > 40 ? "Fair" : "At Risk"}</div>
        </div>
        {[
          { icon: HiOutlineShieldCheck, label: "Security Score", value: `${secScore}/100`, color: scoreColor, trend: 5 },
          { icon: HiOutlineLockClosed, label: "Threats Blocked", value: blockedThreats.toLocaleString(), color: T.cyan, trend: 12 },
          { icon: HiOutlineWifi, label: "Network Status", value: "Secure", color: T.green },
          { icon: HiOutlineMail, label: "Emails Scanned", value: "3,421", color: T.accent, trend: 8 },
        ].map(s => (
          <div key={s.label} style={{ ...sty.card, flex: 1, minWidth: 160, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={18} color={s.color} /></div>
              {s.trend && <span style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 2 }}><HiOutlineTrendingUp size={12} />{s.trend}%</span>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginTop: 12 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {scanResults && (
            <div style={{ ...sty.card, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Scan Results</h3>
                <button onClick={() => setScanResults(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><HiOutlineX size={18} color={T.muted} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Files Scanned", value: scanResults.filesScanned.toLocaleString() },
                  { label: "Clean Files", value: scanResults.cleanFiles.toLocaleString() },
                  { label: "Threats Found", value: scanResults.threatsFound, color: scanResults.threatsFound > 0 ? T.orange : T.green },
                  { label: "Duration", value: scanResults.duration },
                ].map(r => (
                  <div key={r.label} style={{ textAlign: "center", padding: 12, background: T.surface, borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: r.color || T.white, fontFamily: "'Space Grotesk'" }}>{r.value}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={sty.card}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Threat Activity (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.red} stopOpacity={0.3} /><stop offset="100%" stopColor={T.red} stopOpacity={0} /></linearGradient>
                  <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={T.cyan} stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12 }} />
                <Area type="monotone" dataKey="threats" stroke={T.red} fill="url(#tG)" strokeWidth={2} name="Detected" />
                <Area type="monotone" dataKey="blocked" stroke={T.cyan} fill="url(#bG)" strokeWidth={2} name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={sty.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Your Devices</h3>
              <button onClick={() => setActiveNav("Protection")} style={{ ...sty.btn("transparent", T.cyan), border: "none", padding: 0, fontSize: 13 }}>Manage &gt;</button>
            </div>
            {devices.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${T.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {d.type === "Mobile" ? <HiOutlineDeviceMobile size={18} color={T.accent} /> : <HiOutlineDesktopComputer size={18} color={T.accent} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{d.os} · Last scan: {d.lastScan}</div>
                  </div>
                </div>
                <Badge color={d.status === "protected" ? T.green : T.orange}>{d.status === "protected" ? "Protected" : "At Risk"}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...sty.card, textAlign: "center" }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16 }}>Overall Protection</h4>
            <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto 16px" }}>
              <svg viewBox="0 0 36 36" style={{ width: 150, height: 150, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={T.green} strokeWidth="2.5" strokeDasharray="97.4" strokeDashoffset={97.4 * 0.13} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: T.green, fontFamily: "'Space Grotesk'" }}>87%</div>
                <div style={{ fontSize: 11, color: T.muted }}>Protected</div>
              </div>
            </div>
            {[
              { label: "Firewall", active: true }, { label: "Real-time Protection", active: true },
              { label: "VPN", active: plan !== "free" }, { label: "Dark Web Monitor", active: plan === "enterprise" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.white }}>{f.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: f.active ? T.green : T.muted }}>{f.active ? "Active" : "Upgrade"}</span>
              </div>
            ))}
          </div>
          <div style={sty.card}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12 }}>Recent Alerts</h4>
            {alerts.filter(a => !a.read).length === 0 && <div style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 16 }}>No unread alerts</div>}
            {alerts.filter(a => !a.read).map(n => (
              <div key={n.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <HiOutlineExclamation size={16} color={n.type === "warning" ? T.orange : n.type === "critical" ? T.red : T.cyan} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: T.white }}>{n.msg}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{n.time}</div>
                </div>
                <button onClick={() => markRead(n.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><HiOutlineCheck size={14} color={T.green} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ ...sty.card, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Activity Timeline</h3>
        {timeline.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < timeline.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: tlColor[item.type], flexShrink: 0, marginTop: 4 }} />
            <div style={{ flex: 1, fontSize: 13, color: T.white }}>{item.event}</div>
            <div style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>{item.time}</div>
          </div>
        ))}
      </div>
    </>
  );
  };  // end renderOverview

  const renderProtection = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>Device Protection</h2>
        <button onClick={handleScan} disabled={scanning} style={sty.btn(scanning ? "rgba(99,102,241,0.3)" : T.accent)}>
          <HiOutlineRefresh size={14} style={{ animation: scanning ? "spin 1s linear infinite" : "none" }} />
          {scanning ? "Scanning..." : "Scan All Devices"}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={sty.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Device", "OS", "Type", "Status", "Last Scan", "Threats", "Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: T.muted, fontWeight: 500, borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td style={{ padding: "14px 12px", fontSize: 13, color: T.white, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {d.type === "Mobile" ? <HiOutlineDeviceMobile size={18} color={T.accent} /> : <HiOutlineDesktopComputer size={18} color={T.accent} />}
                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 12px", fontSize: 13, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{d.os}</td>
                <td style={{ padding: "14px 12px", fontSize: 13, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{d.type}</td>
                <td style={{ padding: "14px 12px", borderBottom: `1px solid ${T.border}` }}><Badge color={d.status === "protected" ? T.green : T.orange}>{d.status === "protected" ? "Protected" : "At Risk"}</Badge></td>
                <td style={{ padding: "14px 12px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{d.lastScan}</td>
                <td style={{ padding: "14px 12px", borderBottom: `1px solid ${T.border}` }}><span style={{ color: d.threats > 0 ? T.orange : T.green, fontWeight: 600 }}>{d.threats}</span></td>
                <td style={{ padding: "14px 12px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={sty.btn("rgba(99,102,241,0.1)", T.accent)}><HiOutlineRefresh size={14} /></button>
                    <button onClick={() => removeDevice(d.id)} style={sty.btn("rgba(239,68,68,0.1)", T.red)}><HiOutlineTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ ...sty.card, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 6 }}>Breach Check</h3>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Check if your email address has appeared in known data breaches.</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            type="email"
            value={breachEmail}
            onChange={e => { setBreachEmail(e.target.value); setBreachResult(null); }}
            placeholder="Enter email to check"
            style={{ ...sty.input, maxWidth: 320 }}
          />
          <button
            onClick={handleBreachCheck}
            disabled={breachChecking || !breachEmail}
            style={sty.btn(breachChecking ? "rgba(99,102,241,0.3)" : T.accent)}
          >
            {breachChecking ? <HiOutlineRefresh size={14} style={{ animation: "spin 1s linear infinite" }} /> : <HiOutlineDatabase size={14} />}
            {breachChecking ? "Checking..." : "Check Breaches"}
          </button>
        </div>
        {breachResult && !breachResult.found && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10 }}>
            <HiOutlineShieldCheck size={22} color={T.green} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.green }}>No breaches found</div>
              <div style={{ fontSize: 12, color: T.muted }}>Your email was not found in any known data breach.</div>
            </div>
          </div>
        )}
        {breachResult && breachResult.found && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <HiOutlineExclamation size={18} color={T.orange} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.orange }}>{breachResult.breaches.length} breach{breachResult.breaches.length > 1 ? "es" : ""} found</span>
            </div>
            {breachResult.breaches.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{b.name}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 10 }}>~{b.records} records leaked</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color={b.severity === "high" ? T.red : T.orange}>{b.severity}</Badge>
                  <span style={{ fontSize: 12, color: T.muted }}>{b.year}</span>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>We recommend changing your password immediately and enabling two-factor authentication.</p>
          </div>
        )}
      </div>
    </>
  );

  const renderNetwork = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Network Monitor</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { label: "DNS Queries", value: "45,821", color: T.cyan, icon: HiOutlineGlobe },
          { label: "Blocked Domains", value: "234", color: T.red, icon: HiOutlineBan },
          { label: "Active Connections", value: "127", color: T.green, icon: HiOutlineStatusOnline },
        ].map(s => (
          <div key={s.label} style={{ ...sty.card, padding: 20 }}>
            <s.icon size={20} color={s.color} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={sty.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Recent Connections</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Domain", "IP Address", "Protocol", "Status", "Data", "Time"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: T.muted, fontWeight: 500, borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              { domain: "api.secuvion.com", ip: "104.18.3.45", proto: "HTTPS", status: "allowed", data: "2.4 MB", time: "Just now" },
              { domain: "cdn.cloudflare.com", ip: "104.16.132.229", proto: "HTTPS", status: "allowed", data: "890 KB", time: "1 min ago" },
              { domain: "malware-c2.evil.com", ip: "45.33.21.88", proto: "TCP", status: "blocked", data: "0 B", time: "5 min ago" },
              { domain: "smtp.gmail.com", ip: "142.250.4.108", proto: "TLS", status: "allowed", data: "45 KB", time: "8 min ago" },
              { domain: "tracker.adnetwork.io", ip: "185.12.45.67", proto: "HTTPS", status: "blocked", data: "0 B", time: "12 min ago" },
              { domain: "github.com", ip: "140.82.121.4", proto: "HTTPS", status: "allowed", data: "1.2 MB", time: "15 min ago" },
              { domain: "phishing-site.xyz", ip: "78.12.34.56", proto: "HTTP", status: "blocked", data: "0 B", time: "22 min ago" },
            ].map((c, i) => (
              <tr key={i}>
                <td style={{ padding: "12px", fontSize: 13, color: T.white, borderBottom: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{c.domain}</td>
                <td style={{ padding: "12px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}>{c.ip}</td>
                <td style={{ padding: "12px", borderBottom: `1px solid ${T.border}` }}><Badge color={T.accent}>{c.proto}</Badge></td>
                <td style={{ padding: "12px", borderBottom: `1px solid ${T.border}` }}><Badge color={c.status === "allowed" ? T.green : T.red}>{c.status}</Badge></td>
                <td style={{ padding: "12px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{c.data}</td>
                <td style={{ padding: "12px", fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{c.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Security Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Scans & Threats (6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white }} />
              <Bar dataKey="scans" fill={T.accent} radius={[4, 4, 0, 0]} name="Scans" />
              <Bar dataKey="threats" fill={T.red} radius={[4, 4, 0, 0]} name="Threats" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Device Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
              {deviceData.map(d => <Cell key={d.name} fill={d.color} />)}
            </Pie></PieChart>
          </ResponsiveContainer>
          {deviceData.map(d => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} /><span style={{ fontSize: 12, color: T.muted }}>{d.name}</span></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={sty.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Security Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Total Scans", value: "299" }, { label: "Threats Detected", value: "54" },
            { label: "Threats Resolved", value: "52" }, { label: "Detection Rate", value: "99.8%" },
            { label: "Avg Scan Time", value: "1m 23s" }, { label: "Data Protected", value: "2.4 TB" },
            { label: "Emails Filtered", value: "12,450" }, { label: "Uptime", value: "99.9%" },
          ].map((m, i) => (
            <div key={i} style={{ padding: 14, background: T.surface, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderTools = () => {
    const pwStrength = (pw) => {
      if (!pw) return { label: "Enter a password", color: T.muted, score: 0 };
      let s = 0;
      if (pw.length >= 8) s++;
      if (pw.length >= 12) s++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
      if (/\d/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      const levels = [
        { label: "Very Weak", color: T.red },
        { label: "Weak", color: T.orange },
        { label: "Fair", color: T.gold },
        { label: "Strong", color: T.cyan },
        { label: "Very Strong", color: T.green },
      ];
      return { ...levels[Math.min(s, 4)], score: Math.min(s, 4) };
    };
    const pw = pwStrength(pwInput);

    const handleUrlCheck = () => {
      setUrlChecking(true);
      setUrlResult(null);
      setTimeout(() => {
        setUrlChecking(false);
        const suspicious = /free|win|prize|login.*verify|bit\.ly|tinyurl/i.test(urlInput);
        const hasSsl = urlInput.startsWith("https://");
        if (suspicious) {
          setUrlResult({ safe: false, reason: "URL contains suspicious keywords commonly used in phishing attacks." });
          toast("Warning: This URL appears suspicious", "warning");
        } else if (!hasSsl && urlInput.startsWith("http://")) {
          setUrlResult({ safe: false, reason: "URL uses unencrypted HTTP. Data could be intercepted." });
          toast("Warning: Insecure HTTP connection", "warning");
        } else if (urlInput.length > 5) {
          setUrlResult({ safe: true, reason: "No suspicious patterns detected. URL appears safe." });
          toast("URL appears safe", "success");
        }
      }, 1200);
    };

    return (
      <>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Security Tools</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Password Strength Checker */}
          <div style={sty.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <HiOutlineKey size={20} color={T.cyan} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Password Strength Checker</h3>
            </div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type={showPw ? "text" : "password"}
                value={pwInput}
                onChange={e => setPwInput(e.target.value)}
                placeholder="Enter a password to test"
                style={sty.input}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                {showPw ? <HiOutlineEyeOff size={16} color={T.muted} /> : <HiOutlineEye size={16} color={T.muted} />}
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pw.score && pwInput ? pw.color : "rgba(148,163,184,0.15)", transition: "background 0.3s" }} />
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: pw.color }}>{pw.label}</div>
            </div>
            {pwInput && (
              <div style={{ fontSize: 12, color: T.muted }}>
                <div style={{ marginBottom: 4 }}>Tips:</div>
                <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <li style={{ color: pwInput.length >= 12 ? T.green : T.muted }}>At least 12 characters</li>
                  <li style={{ color: /[A-Z]/.test(pwInput) && /[a-z]/.test(pwInput) ? T.green : T.muted }}>Upper & lowercase letters</li>
                  <li style={{ color: /\d/.test(pwInput) ? T.green : T.muted }}>Numbers</li>
                  <li style={{ color: /[^A-Za-z0-9]/.test(pwInput) ? T.green : T.muted }}>Special characters (!@#$%)</li>
                </ul>
              </div>
            )}
          </div>

          {/* URL / Phishing Checker */}
          <div style={sty.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <HiOutlineGlobe size={20} color={T.accent} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Phishing URL Detector</h3>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlResult(null); }}
                placeholder="https://example.com/suspicious-link"
                style={sty.input}
              />
              <button onClick={handleUrlCheck} disabled={urlChecking || !urlInput} style={sty.btn(urlChecking ? "rgba(99,102,241,0.3)" : T.accent)}>
                {urlChecking ? <HiOutlineRefresh size={14} style={{ animation: "spin 1s linear infinite" }} /> : <HiOutlineShieldCheck size={14} />}
                {urlChecking ? "Checking..." : "Check"}
              </button>
            </div>
            {urlResult && (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: urlResult.safe ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${urlResult.safe ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {urlResult.safe ? <HiOutlineShieldCheck size={18} color={T.green} /> : <HiOutlineExclamation size={18} color={T.red} />}
                  <span style={{ fontSize: 14, fontWeight: 600, color: urlResult.safe ? T.green : T.red }}>{urlResult.safe ? "URL Appears Safe" : "Suspicious URL Detected"}</span>
                </div>
                <div style={{ fontSize: 13, color: T.muted }}>{urlResult.reason}</div>
              </div>
            )}
          </div>

          {/* Hash Generator */}
          <div style={sty.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <HiOutlineLockClosed size={20} color={T.green} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Security Reports</h3>
            </div>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Download detailed security reports for your account.</p>
            {[
              { name: "Full Security Audit", desc: "Comprehensive analysis of all your devices and data", icon: HiOutlineDocumentReport },
              { name: "Threat History", desc: "6-month threat detection and response log", icon: HiOutlineClipboardCheck },
              { name: "Network Analysis", desc: "DNS queries, blocked domains, and traffic analysis", icon: HiOutlineGlobe },
            ].map(r => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <r.icon size={16} color={T.green} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{r.desc}</div>
                  </div>
                </div>
                <button onClick={() => toast(`${r.name} report downloaded`, "success")} style={sty.btn("rgba(34,197,94,0.1)", T.green)}>
                  <HiOutlineDownload size={14} /> PDF
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={sty.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <HiOutlineLightningBolt size={20} color={T.orange} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Quick Actions</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Full Scan", desc: "Scan all devices", icon: HiOutlineRefresh, color: T.accent, action: () => { handleScan(); setActiveNav("Protection"); } },
                { label: "Check Breaches", desc: "Email breach check", icon: HiOutlineDatabase, color: T.red, action: () => setActiveNav("Protection") },
                { label: "VPN Status", desc: plan !== "free" ? "Connected" : "Upgrade needed", icon: HiOutlineShieldCheck, color: T.green, action: () => toast(plan !== "free" ? "VPN is active and connected" : "Upgrade to Pro for VPN access", plan !== "free" ? "success" : "info") },
                { label: "Export Data", desc: "Download your data", icon: HiOutlineDownload, color: T.cyan, action: () => toast("Data export started — you'll receive an email shortly", "info") },
                { label: "Kill Sessions", desc: "Log out all devices", icon: HiOutlineBan, color: T.orange, action: () => toast("All other sessions terminated", "success") },
                { label: "2FA Setup", desc: profileSettings.twoFactor ? "Enabled" : "Not enabled", icon: HiOutlineKey, color: T.pink, action: () => { setProfileSettings(p => ({ ...p, twoFactor: !p.twoFactor })); toast(profileSettings.twoFactor ? "2FA disabled" : "2FA enabled successfully", profileSettings.twoFactor ? "warning" : "success"); } },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{ padding: 14, background: `${a.color}08`, border: `1px solid ${a.color}20`, borderRadius: 10, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 4 }}>
                  <a.icon size={18} color={a.color} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderAlerts = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>All Alerts ({alerts.length})</h2>
        <button onClick={() => setAlerts(a => a.map(x => ({ ...x, read: true })))} style={sty.btn("rgba(99,102,241,0.1)", T.accent)}>Mark All Read</button>
      </div>
      <div style={sty.card}>
        {alerts.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 0", borderBottom: `1px solid ${T.border}`, opacity: a.read ? 0.6 : 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${a.type === "critical" ? T.red : a.type === "warning" ? T.orange : T.cyan}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <HiOutlineExclamation size={16} color={a.type === "critical" ? T.red : a.type === "warning" ? T.orange : T.cyan} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: T.white, fontWeight: a.read ? 400 : 600 }}>{a.msg}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4, display: "flex", gap: 12 }}>
                <span>{a.time}</span>
                <Badge color={a.type === "critical" ? T.red : a.type === "warning" ? T.orange : T.cyan}>{a.type}</Badge>
                {!a.read && <Badge color={T.accent}>Unread</Badge>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!a.read && <button onClick={() => markRead(a.id)} style={sty.btn("rgba(34,197,94,0.1)", T.green)}><HiOutlineCheck size={14} /></button>}
              <button onClick={() => dismissAlert(a.id)} style={sty.btn("rgba(239,68,68,0.1)", T.red)}><HiOutlineX size={14} /></button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>No alerts - all clear!</div>}
      </div>
    </>
  );

  const renderBilling = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Billing & Subscription</h2>
      <div style={{ ...sty.card, marginBottom: 24, background: `linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,227,197,0.05))`, border: "1px solid rgba(99,102,241,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: planColors[plan], fontFamily: "'Space Grotesk'" }}>{planLabels[plan]}</div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{plan === "free" ? "Basic protection" : plan === "pro" ? "$29/month · Renews Apr 21, 2026" : "$79/month · Renews Apr 21, 2026"}</div>
          </div>
          {plan !== "enterprise" && <Link to={`/checkout?plan=${plan === "free" ? "pro" : "enterprise"}`} style={{ textDecoration: "none" }}>
            <button style={sty.btn(T.accent)}><HiOutlineLightningBolt size={14} /> Upgrade</button>
          </Link>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Payment History</h3>
          {[
            { date: "Mar 21, 2026", amount: plan === "enterprise" ? "$79.00" : plan === "pro" ? "$29.00" : "$0.00", status: "Paid" },
            { date: "Feb 21, 2026", amount: plan === "enterprise" ? "$79.00" : plan === "pro" ? "$29.00" : "$0.00", status: "Paid" },
            { date: "Jan 21, 2026", amount: plan === "enterprise" ? "$79.00" : plan === "pro" ? "$29.00" : "$0.00", status: "Paid" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.white }}>{p.date}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{p.amount}</span>
              <Badge color={T.green}>{p.status}</Badge>
            </div>
          ))}
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Plan Features</h3>
          {(plan === "enterprise" ? ["Everything in Pro", "Unlimited devices", "Dark web monitoring", "API access", "Dedicated manager", "Priority support"] :
            plan === "pro" ? ["Real-time protection", "VPN", "5 devices", "Email protection", "24/7 support", "Weekly reports"] :
              ["Basic scanning", "1 device", "Community support", "Email breach check"]).map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <HiOutlineCheck size={14} color={T.green} />
              <span style={{ fontSize: 13, color: T.white }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Account Settings</h2>

      {/* Profile Card with Avatar */}
      <div style={{ ...sty.card, marginBottom: 24, display: "flex", alignItems: "center", gap: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,227,197,0.04))", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {user?.name?.charAt(0) || "U"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Badge color={planColors[plan]}>{planLabels[plan]} Plan</Badge>
            <Badge color={T.green}>Verified</Badge>
            <Badge color={T.cyan}>Member since 2026</Badge>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Profile</h3>
          {[
            { label: "Display Name", key: "name", type: "text" },
            { label: "Email Address", key: "email", type: "email" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} value={profileSettings[f.key]} onChange={e => setProfileSettings({ ...profileSettings, [f.key]: e.target.value })} style={sty.input} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6 }}>Change Password</label>
            <input type="password" placeholder="Enter new password" style={sty.input} />
          </div>
          <button onClick={() => toast("Profile updated successfully", "success")} style={sty.btn(T.accent)}><HiOutlineSave size={14} /> Save Profile</button>
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Preferences</h3>
          {[
            { label: "Push Notifications", key: "notifications", desc: "Receive threat alerts" },
            { label: "Two-Factor Auth", key: "twoFactor", desc: "Extra security layer" },
            { label: "Weekly Report", key: "weeklyReport", desc: "Email summary every Monday" },
            { label: "Auto-Scan Downloads", key: "autoScan", desc: "Scan new files automatically" },
            { label: "Dark Mode", key: "darkMode", desc: "Dark theme (recommended)" },
          ].map(t => (
            <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 14, color: T.white, fontWeight: 500 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{t.desc}</div>
              </div>
              <div onClick={() => { setProfileSettings({ ...profileSettings, [t.key]: !profileSettings[t.key] }); toast(`${t.label} ${profileSettings[t.key] ? "disabled" : "enabled"}`, "info"); }} style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.3s",
                background: profileSettings[t.key] ? T.accent : "rgba(148,163,184,0.2)",
              }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, transition: "left 0.3s", left: profileSettings[t.key] ? 23 : 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Data section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Security</h3>
          {[
            { label: "Two-Factor Authentication", value: profileSettings.twoFactor ? "Enabled" : "Disabled", color: profileSettings.twoFactor ? T.green : T.orange },
            { label: "Last Login", value: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), color: T.cyan },
            { label: "Login Location", value: "India", color: T.muted },
            { label: "Active Sessions", value: "2 devices", color: T.muted },
            { label: "Password Last Changed", value: "45 days ago", color: T.orange },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.white }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Data & Privacy</h3>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Manage your data and export options.</p>
          {[
            { label: "Export Account Data", desc: "Download all your data as JSON", icon: HiOutlineDownload, action: () => toast("Data export started — check your email", "info") },
            { label: "Download Activity Log", desc: "Full activity history CSV", icon: HiOutlineDocumentReport, action: () => toast("Activity log downloaded", "success") },
            { label: "Clear Scan History", desc: "Remove all past scan records", icon: HiOutlineTrash, action: () => toast("Scan history cleared", "warning") },
          ].map(a => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a.icon size={16} color={T.cyan} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.white }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{a.desc}</div>
                </div>
              </div>
              <button onClick={a.action} style={sty.btn("rgba(99,102,241,0.1)", T.accent)}>
                <a.icon size={14} />
              </button>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 4 }}>Danger Zone</div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>Permanently delete your account and all associated data.</div>
            <button onClick={() => toast("Account deletion requires email confirmation", "error")} style={sty.btn("rgba(239,68,68,0.15)", T.red)}><HiOutlineTrash size={14} /> Delete Account</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Dashboard" description="Your personal Secuvion security dashboard." path="/user-dashboard" />
      <aside className={"user-sidebar" + (sidebarOpen ? " open" : "")} style={{ width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>S</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>SECUVION</span>
        </div>
        <div style={{ margin: "0 12px 12px", padding: 14, background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{user?.name?.charAt(0) || "U"}</div>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{user?.name}</div><div style={{ fontSize: 11, color: T.muted }}>{user?.email}</div></div>
          </div>
          <div style={{ padding: "3px 10px", background: `${planColors[plan]}15`, border: `1px solid ${planColors[plan]}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: planColors[plan], textAlign: "center" }}>{planLabels[plan]} Plan</div>
        </div>
        <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button key={item.label} onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%",
              background: activeNav === item.label ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.08))" : "transparent",
              border: activeNav === item.label ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              borderRadius: 10, color: activeNav === item.label ? T.cyan : T.muted,
              cursor: "pointer", fontSize: 14, fontWeight: activeNav === item.label ? 600 : 400, fontFamily: "'Plus Jakarta Sans'", position: "relative",
            }}>
              <item.icon size={20} /><span>{item.label}</span>
              {item.badge && <span style={{ background: T.orange, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, marginLeft: "auto" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "8px 12px" }}>
          <Link to="/pricing" style={{ textDecoration: "none" }}>
            <button style={{ ...sty.btn(T.accent), width: "100%", justifyContent: "center", padding: "10px", marginBottom: 8 }}><HiOutlineLightningBolt size={16} /> Upgrade Plan</button>
          </Link>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'Plus Jakarta Sans'" }}>
            <HiOutlineLogout size={20} /> Log Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        <style>{`
          @media (max-width: 900px) {
            .user-sidebar {
              position: fixed !important;
              left: -260px !important;
              top: 0 !important;
              z-index: 200 !important;
              height: 100vh !important;
              transition: left 0.28s cubic-bezier(0.4,0,0.2,1) !important;
              box-shadow: 4px 0 32px rgba(0,0,0,0.5) !important;
            }
            .user-sidebar.open {
              left: 0 !important;
            }
            .user-burger {
              display: flex !important;
            }
          }
        `}</style>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px",
          borderBottom: `1px solid ${T.border}`, background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="user-burger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>
                {activeNav === "Overview" ? `Welcome back, ${user?.name?.split(" ")[0] || "User"}` : activeNav}
              </h1>
              <p style={{ fontSize: 12, color: T.muted }}>{activeNav === "Overview" ? "Here's your security overview" : `Manage your ${activeNav.toLowerCase()}`}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {activeNav === "Overview" && <button onClick={handleScan} disabled={scanning} style={sty.btn(scanning ? "rgba(99,102,241,0.3)" : T.accent)}>
              <HiOutlineRefresh size={14} style={{ animation: scanning ? "spin 1s linear infinite" : "none" }} />
              {scanning ? "Scanning..." : "Quick Scan"}
            </button>}
            <div style={{ position: "relative" }}><HiOutlineBell size={20} color={T.muted} style={{ cursor: "pointer" }} />
              {alerts.filter(a => !a.read).length > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: T.red, borderRadius: "50%", border: "2px solid #030712" }} />}
            </div>
          </div>
        </header>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ padding: "28px 32px", maxWidth: 1200 }}>{renderContent()}</div>

        <footer style={{ padding: "20px 32px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.muted }}>&copy; 2026 SECUVION. All rights reserved. Founder: Sahil Anil Nikam</span>
          <span style={{ fontSize: 12, color: T.muted }}>{planLabels[plan]} Plan</span>
        </footer>
      </main>
    </div>
  );
}
