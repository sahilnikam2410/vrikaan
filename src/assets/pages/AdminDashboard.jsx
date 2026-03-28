import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineShieldCheck, HiOutlineBell,
  HiOutlineCog, HiOutlineLogout, HiOutlineSearch, HiOutlineChevronDown,
  HiOutlineDatabase, HiOutlineGlobe, HiOutlineLightningBolt, HiOutlineDocumentReport,
  HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineEye, HiOutlineCheck,
  HiOutlineX, HiOutlineClock, HiOutlineExclamation, HiOutlineRefresh,
  HiOutlineTrash, HiOutlinePencil, HiOutlineFilter, HiOutlineDownload,
  HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineBan,
  HiOutlineTerminal, HiOutlineStatusOnline, HiOutlineStatusOffline,
  HiOutlineMail, HiOutlineKey, HiOutlineSave, HiOutlinePhotograph
} from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", gold: "#eab308", pink: "#ec4899",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const sty = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, backdropFilter: "blur(10px)" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  btn: (bg, clr) => ({ padding: "8px 16px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }),
  th: { textAlign: "left", padding: "10px 12px", fontSize: 12, color: T.muted, fontWeight: 500, borderBottom: `1px solid ${T.border}` },
  td: { padding: "12px", fontSize: 13, color: T.white, borderBottom: `1px solid ${T.border}` },
};

// ─── DATA ───
const generateLogs = () => {
  const types = ["INFO", "WARN", "ERROR", "DEBUG"];
  const msgs = [
    "User login successful from 192.168.1.45", "Firewall rule updated: block port 8080",
    "SSL certificate renewed for api.secuvion.com", "Failed login attempt from 45.33.21.88 (blocked)",
    "Database backup completed successfully", "New user registration: john@example.com",
    "Malware signature database updated (v2024.03.21)", "API rate limit exceeded for client #4521",
    "Scheduled scan initiated on subnet 10.0.0.0/24", "Intrusion detection: SYN flood from 103.45.67.89",
    "Patch KB5034441 applied to endpoint SRV-07", "VPN tunnel established: Tokyo datacenter",
    "DDoS mitigation activated: 12,000 req/s filtered", "Certificate pinning violation detected",
    "Audit log exported by admin@secuvion.com", "Endpoint agent updated to v2.4.1",
    "Quarantined file: trojan.gen.2 on WKS-15", "Network segmentation policy applied",
    "Two-factor auth enabled for 23 users", "Honeypot triggered: SSH brute force attempt",
  ];
  const now = Date.now();
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    time: new Date(now - i * 180000).toLocaleString(),
    type: types[Math.floor(Math.random() * types.length)],
    source: `SRV-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
    msg: msgs[i % msgs.length],
  }));
};

const allUsers = [
  { id: 1, name: "Alexandra Morella", email: "alex@corp.com", role: "Admin", status: "active", lastLogin: "2 min ago", plan: "enterprise", threats: 0, devices: 3 },
  { id: 2, name: "Michael Chen", email: "m.chen@corp.com", role: "User", status: "active", lastLogin: "1 hr ago", plan: "pro", threats: 2, devices: 2 },
  { id: 3, name: "Sarah Williams", email: "s.will@corp.com", role: "User", status: "inactive", lastLogin: "3 days ago", plan: "free", threats: 0, devices: 1 },
  { id: 4, name: "James Rodriguez", email: "j.rod@corp.com", role: "Moderator", status: "active", lastLogin: "5 hrs ago", plan: "pro", threats: 1, devices: 4 },
  { id: 5, name: "Emily Davis", email: "e.davis@corp.com", role: "User", status: "active", lastLogin: "12 min ago", plan: "enterprise", threats: 0, devices: 2 },
  { id: 6, name: "David Kim", email: "d.kim@corp.com", role: "User", status: "active", lastLogin: "30 min ago", plan: "pro", threats: 3, devices: 1 },
  { id: 7, name: "Lisa Patel", email: "l.patel@corp.com", role: "Admin", status: "active", lastLogin: "1 min ago", plan: "enterprise", threats: 0, devices: 5 },
  { id: 8, name: "Tom Anderson", email: "t.ander@corp.com", role: "User", status: "suspended", lastLogin: "15 days ago", plan: "free", threats: 12, devices: 1 },
  { id: 9, name: "Nina Garcia", email: "n.garcia@corp.com", role: "User", status: "active", lastLogin: "4 hrs ago", plan: "pro", threats: 1, devices: 3 },
  { id: 10, name: "Ryan Foster", email: "r.foster@corp.com", role: "User", status: "active", lastLogin: "20 min ago", plan: "free", threats: 0, devices: 2 },
  { id: 11, name: "Olivia Brown", email: "o.brown@corp.com", role: "Moderator", status: "active", lastLogin: "45 min ago", plan: "pro", threats: 0, devices: 2 },
  { id: 12, name: "Chris Lee", email: "c.lee@corp.com", role: "User", status: "inactive", lastLogin: "7 days ago", plan: "free", threats: 5, devices: 1 },
];

const allAlerts = [
  { id: 1, type: "critical", msg: "Ransomware detected on endpoint SRV-04", time: "2 min ago", source: "SRV-04", ip: "10.0.4.12", status: "active" },
  { id: 2, type: "warning", msg: "Unusual login from IP 192.168.45.12", time: "15 min ago", source: "AUTH", ip: "192.168.45.12", status: "active" },
  { id: 3, type: "info", msg: "SSL certificate expires in 7 days", time: "1 hr ago", source: "CERT-MGR", ip: "-", status: "pending" },
  { id: 4, type: "critical", msg: "Brute force attempt blocked (3,421 tries)", time: "2 hrs ago", source: "FIREWALL", ip: "45.33.21.88", status: "resolved" },
  { id: 5, type: "warning", msg: "Port scan detected from external IP", time: "3 hrs ago", source: "IDS", ip: "103.45.67.89", status: "resolved" },
  { id: 6, type: "critical", msg: "SQL injection attempt on /api/users", time: "4 hrs ago", source: "WAF", ip: "78.12.34.56", status: "active" },
  { id: 7, type: "warning", msg: "Elevated privileges requested by user #4521", time: "5 hrs ago", source: "IAM", ip: "10.0.1.45", status: "pending" },
  { id: 8, type: "info", msg: "New device registered: MacBook Pro (Lisa P.)", time: "6 hrs ago", source: "MDM", ip: "10.0.2.88", status: "resolved" },
  { id: 9, type: "critical", msg: "Data exfiltration attempt detected (2.3GB)", time: "8 hrs ago", source: "DLP", ip: "10.0.5.22", status: "resolved" },
  { id: 10, type: "warning", msg: "Outdated agent on 5 endpoints", time: "12 hrs ago", source: "PATCH-MGR", ip: "-", status: "pending" },
];

const scanData = [
  { month: "Feb", total: 2100, scanned: 1800 }, { month: "Mar", total: 3200, scanned: 2900 },
  { month: "Apr", total: 3800, scanned: 3500 }, { month: "May", total: 4200, scanned: 3800 },
  { month: "Jun", total: 4500, scanned: 4100 }, { month: "Jul", total: 3900, scanned: 3600 },
  { month: "Aug", total: 5800, scanned: 5200 }, { month: "Sep", total: 6200, scanned: 5800 },
  { month: "Oct", total: 7100, scanned: 6500 }, { month: "Nov", total: 8500, scanned: 7800 },
  { month: "Dec", total: 7200, scanned: 6600 }, { month: "Jan", total: 9500, scanned: 8000 },
];

const trafficData = [
  { hour: "00:00", inbound: 1200, outbound: 800, blocked: 45 },
  { hour: "04:00", inbound: 800, outbound: 400, blocked: 12 },
  { hour: "08:00", inbound: 3400, outbound: 2100, blocked: 89 },
  { hour: "12:00", inbound: 5600, outbound: 3800, blocked: 156 },
  { hour: "16:00", inbound: 4800, outbound: 3200, blocked: 134 },
  { hour: "20:00", inbound: 2800, outbound: 1600, blocked: 67 },
  { hour: "23:59", inbound: 1500, outbound: 900, blocked: 34 },
];

const threatPie = [
  { name: "Malware", value: 35, color: T.red }, { name: "Phishing", value: 28, color: T.orange },
  { name: "DDoS", value: 18, color: T.gold }, { name: "Ransomware", value: 12, color: T.pink },
  { name: "Other", value: 7, color: T.accent },
];

const navItems = [
  { icon: HiOutlineViewGrid, label: "Dashboard" },
  { icon: HiOutlineUsers, label: "Users" },
  { icon: HiOutlineShieldCheck, label: "Protection" },
  { icon: HiOutlineLightningBolt, label: "Analytics" },
  { icon: HiOutlineBell, label: "Alerts", badge: 3 },
  { icon: HiOutlineTerminal, label: "Logs" },
  { icon: HiOutlineCog, label: "Settings" },
];

// ─── HELPER COMPONENTS ───
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div style={{ ...sty.card, flex: 1, minWidth: 180, padding: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color || T.cyan} />
      </div>
      {trend && <span style={{ fontSize: 11, color: trend > 0 ? T.green : T.red, display: "flex", alignItems: "center", gap: 2 }}>
        {trend > 0 ? <HiOutlineTrendingUp size={14} /> : <HiOutlineTrendingDown size={14} />}{Math.abs(trend)}%
      </span>}
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif", marginTop: 12 }}>{value}</div>
    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color, textTransform: "capitalize" }}>{children}</span>
);

// ─── MAIN COMPONENT ───
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [logs] = useState(generateLogs);
  const [alerts, setAlerts] = useState(allAlerts);
  const [users, setUsers] = useState(allUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("all");
  const [logPage, setLogPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [settings, setSettings] = useState({
    siteName: "SECUVION", adminEmail: "admin@secuvion.com", twoFactor: true,
    emailNotifs: true, slackNotifs: false, autoScan: true, scanInterval: "6",
    retentionDays: "90", darkMode: true, maintenance: false,
  });
  const [liveCount, setLiveCount] = useState(2841233);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveFeedIdx, setLiveFeedIdx] = useState(0);

  const liveFeed = [
    { ip: "45.33.21.88", type: "Brute Force", country: "RU" },
    { ip: "103.45.67.89", type: "Port Scan", country: "CN" },
    { ip: "78.12.34.56", type: "SQL Injection", country: "BR" },
    { ip: "91.22.44.11", type: "XSS Attack", country: "UA" },
    { ip: "156.78.90.12", type: "DDoS", country: "IN" },
    { ip: "88.33.11.22", type: "Phishing", country: "NG" },
  ];

  useEffect(() => {
    const interval = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 5)), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLiveFeedIdx(i => (i + 1) % liveFeed.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };
  const alertColor = (t) => t === "critical" ? T.red : t === "warning" ? T.orange : T.cyan;
  const statusColor = (s) => s === "active" ? T.green : s === "pending" ? T.gold : s === "suspended" ? T.red : T.muted;
  const resolveAlert = (id) => { setAlerts(a => a.map(x => x.id === id ? { ...x, status: "resolved" } : x)); toast("Threat acknowledged and resolved", "success"); };
  const deleteUser = (id) => { setUsers(u => u.filter(x => x.id !== id)); toast("User deleted successfully", "warning"); };
  const toggleUserStatus = (id) => {
    const target = users.find(x => x.id === id);
    const newStatus = target?.status === "active" ? "suspended" : "active";
    setUsers(u => u.map(x => x.id === id ? { ...x, status: newStatus } : x));
    toast(`User ${newStatus === "suspended" ? "suspended" : "activated"} successfully`, newStatus === "suspended" ? "warning" : "success");
  };

  const filteredUsers = users.filter(u => {
    if (userFilter !== "all" && u.status !== userFilter) return false;
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredAlerts = alerts.filter(a => alertFilter === "all" || a.status === alertFilter);
  const filteredLogs = logs.filter(l => logFilter === "all" || l.type === logFilter);
  const logsPerPage = 12;
  const pagedLogs = filteredLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);

  // ─── TAB CONTENT ───
  const renderContent = () => {
    switch (activeNav) {
      case "Dashboard": return renderDashboard();
      case "Users": return renderUsers();
      case "Protection": return renderProtection();
      case "Analytics": return renderAnalytics();
      case "Alerts": return renderAlerts();
      case "Logs": return renderLogs();
      case "Settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={HiOutlineShieldCheck} label="Threats Blocked" value={liveCount.toLocaleString()} color={T.cyan} trend={12.5} />
        <StatCard icon={HiOutlineUsers} label="Total Users" value={users.length} color={T.accent} trend={8.2} />
        <StatCard icon={HiOutlineBell} label="Active Alerts" value={alerts.filter(a => a.status === "active").length} color={T.red} trend={-15} />
        <StatCard icon={HiOutlineStatusOnline} label="Uptime" value="99.97%" color={T.green} sub="Last 30 days" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={sty.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>File Scan Activity</h3>
              <Badge color={T.accent}>Monthly</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scanData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12 }} />
                <Bar dataKey="total" fill={T.accent} radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="scanned" fill={T.cyan} radius={[4, 4, 0, 0]} name="Scanned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={sty.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white }}>Recent Alerts</h3>
              <button onClick={() => setActiveNav("Alerts")} style={{ ...sty.btn("transparent", T.cyan), border: "none", padding: 0, fontSize: 13 }}>View All &gt;</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["", "Alert", "Source", "Time", "Status", "Action"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
              <tbody>
                {alerts.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <td style={sty.td}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: alertColor(a.type), boxShadow: `0 0 6px ${alertColor(a.type)}` }} /></td>
                    <td style={{ ...sty.td, maxWidth: 260 }}>{a.msg}</td>
                    <td style={sty.td}><Badge color={T.accent}>{a.source}</Badge></td>
                    <td style={{ ...sty.td, color: T.muted, fontSize: 12 }}>{a.time}</td>
                    <td style={sty.td}><Badge color={statusColor(a.status)}>{a.status}</Badge></td>
                    <td style={sty.td}>
                      {a.status !== "resolved" && <button onClick={() => resolveAlert(a.id)} style={sty.btn("rgba(34,197,94,0.1)", T.green)}><HiOutlineCheck size={14} /> Resolve</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ ...sty.card, textAlign: "center" }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 16 }}>Threat Distribution</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={threatPie} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                {threatPie.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            {threatPie.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 12, color: T.muted }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{d.value}%</span>
              </div>
            ))}
          </div>
          <div style={sty.card}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 12 }}>Recent Activity</h4>
            {[
              { msg: "Admin login from 10.0.1.1", time: "Just now", icon: HiOutlineKey, color: T.green },
              { msg: "User tom@corp.com suspended", time: "2 min ago", icon: HiOutlineBan, color: T.red },
              { msg: "Scan completed: 0 threats", time: "15 min ago", icon: HiOutlineShieldCheck, color: T.cyan },
              { msg: "Firewall rule #42 updated", time: "1 hr ago", icon: HiOutlineCog, color: T.accent },
              { msg: "Database backup completed", time: "3 hrs ago", icon: HiOutlineDatabase, color: T.green },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <a.icon size={14} color={a.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: T.white }}>{a.msg}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>User Management</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={sty.btn(T.accent)}><HiOutlinePlus size={14} /> Add User</button>
          <button style={sty.btn("rgba(99,102,241,0.1)", T.accent)}><HiOutlineDownload size={14} /> Export</button>
        </div>
      </div>
      <div style={{ ...sty.card, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, flex: 1, minWidth: 200 }}>
            <HiOutlineSearch size={16} color={T.muted} />
            <input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: "none", border: "none", color: T.white, fontSize: 13, outline: "none", width: "100%", fontFamily: "'Plus Jakarta Sans'" }} />
          </div>
          {["all", "active", "inactive", "suspended"].map(f => (
            <button key={f} onClick={() => setUserFilter(f)} style={{
              ...sty.btn(userFilter === f ? T.accent : "rgba(99,102,241,0.08)", userFilter === f ? "#fff" : T.muted),
              textTransform: "capitalize",
            }}>{f === "all" ? "All" : f} {f === "all" ? `(${users.length})` : `(${users.filter(u => u.status === f).length})`}</button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead><tr>{["User", "Email", "Role", "Plan", "Threats", "Devices", "Status", "Last Login", "Actions"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ cursor: "pointer" }} onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                  <td style={sty.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{u.name.charAt(0)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ ...sty.td, color: T.muted }}>{u.email}</td>
                  <td style={sty.td}><Badge color={u.role === "Admin" ? T.accent : u.role === "Moderator" ? T.orange : T.muted}>{u.role}</Badge></td>
                  <td style={sty.td}><Badge color={u.plan === "enterprise" ? T.accent : u.plan === "pro" ? T.cyan : T.muted}>{u.plan}</Badge></td>
                  <td style={sty.td}><span style={{ color: u.threats > 0 ? T.orange : T.green, fontWeight: 600 }}>{u.threats}</span></td>
                  <td style={sty.td}>{u.devices}</td>
                  <td style={sty.td}><Badge color={statusColor(u.status)}>{u.status}</Badge></td>
                  <td style={{ ...sty.td, color: T.muted, fontSize: 12 }}>{u.lastLogin}</td>
                  <td style={sty.td}>
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleUserStatus(u.id)} title={u.status === "active" ? "Suspend" : "Activate"} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        {u.status === "active" ? <HiOutlineBan size={16} color={T.orange} /> : <HiOutlineCheck size={16} color={T.green} />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                        <HiOutlineTrash size={16} color={T.red} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>No users found</div>}
      </div>
      {selectedUser && (
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>User Details: {selectedUser.name}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Email", value: selectedUser.email },
              { label: "Role", value: selectedUser.role },
              { label: "Plan", value: selectedUser.plan },
              { label: "Status", value: selectedUser.status },
              { label: "Devices", value: selectedUser.devices },
              { label: "Threats Detected", value: selectedUser.threats },
              { label: "Last Login", value: selectedUser.lastLogin },
              { label: "Account ID", value: `#${selectedUser.id}` },
              { label: "Risk Level", value: selectedUser.threats > 5 ? "High" : selectedUser.threats > 0 ? "Medium" : "Low" },
            ].map(d => (
              <div key={d.label} style={{ padding: 12, background: T.surface, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 14, color: T.white, fontWeight: 600 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderProtection = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Protection Overview</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={HiOutlineShieldCheck} label="Protected Endpoints" value="47/52" color={T.green} />
        <StatCard icon={HiOutlineGlobe} label="Monitored Domains" value="131" color={T.cyan} />
        <StatCard icon={HiOutlineStatusOnline} label="Active Agents" value="49" color={T.accent} />
        <StatCard icon={HiOutlineStatusOffline} label="Offline Agents" value="3" color={T.red} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Firewall Rules</h3>
          {[
            { rule: "Block inbound port 23 (Telnet)", status: "active", hits: "12,450" },
            { rule: "Allow HTTPS (443) from all", status: "active", hits: "1.2M" },
            { rule: "Block IP range 45.33.0.0/16", status: "active", hits: "3,421" },
            { rule: "Rate limit API endpoints (100/min)", status: "active", hits: "89,120" },
            { rule: "Block country: North Korea", status: "active", hits: "567" },
            { rule: "Allow SSH from 10.0.0.0/8 only", status: "active", hits: "34,210" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 13, color: T.white }}>{r.rule}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{r.hits} hits</div>
              </div>
              <Badge color={T.green}>{r.status}</Badge>
            </div>
          ))}
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Security Modules</h3>
          {[
            { name: "Antivirus Engine", ver: "v4.2.1", status: true },
            { name: "Intrusion Detection (IDS)", ver: "v3.8.0", status: true },
            { name: "Web Application Firewall", ver: "v2.1.4", status: true },
            { name: "Data Loss Prevention", ver: "v1.9.2", status: true },
            { name: "Email Gateway Scanner", ver: "v3.5.0", status: true },
            { name: "Endpoint Detection & Response", ver: "v2.4.1", status: false },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 13, color: T.white }}>{m.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{m.ver}</div>
              </div>
              <Badge color={m.status ? T.green : T.red}>{m.status ? "Running" : "Stopped"}</Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>Analytics & Reports</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Network Traffic (24hr)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="inG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={T.cyan} stopOpacity={0} /></linearGradient>
                <linearGradient id="outG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={T.accent} stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12 }} />
              <Area type="monotone" dataKey="inbound" stroke={T.cyan} fill="url(#inG)" strokeWidth={2} name="Inbound" />
              <Area type="monotone" dataKey="outbound" stroke={T.accent} fill="url(#outG)" strokeWidth={2} name="Outbound" />
              <Area type="monotone" dataKey="blocked" stroke={T.red} fill="none" strokeWidth={2} strokeDasharray="4 4" name="Blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Threat Types</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart><Pie data={threatPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {threatPie.map(d => <Cell key={d.name} fill={d.color} />)}
            </Pie><Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white }} /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={sty.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Key Metrics Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Avg Response Time", value: "1.2s", trend: -8 },
            { label: "Blocked Attacks/Day", value: "4,521", trend: 22 },
            { label: "False Positive Rate", value: "0.3%", trend: -45 },
            { label: "Scan Coverage", value: "94.2%", trend: 5 },
            { label: "Active Sessions", value: "1,247", trend: 12 },
            { label: "Bandwidth Saved", value: "2.4 TB", trend: 18 },
            { label: "Incidents Resolved", value: "98.7%", trend: 3 },
            { label: "Mean Time to Detect", value: "45s", trend: -32 },
          ].map((m, i) => (
            <div key={i} style={{ padding: 16, background: T.surface, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{m.value}</div>
              <span style={{ fontSize: 11, color: m.trend > 0 ? T.green : T.red, display: "flex", alignItems: "center", gap: 2, marginTop: 4 }}>
                {m.trend > 0 ? <HiOutlineTrendingUp size={12} /> : <HiOutlineTrendingDown size={12} />} {Math.abs(m.trend)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderAlerts = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>Alert Management</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {["all", "active", "pending", "resolved"].map(f => (
            <button key={f} onClick={() => setAlertFilter(f)} style={{
              ...sty.btn(alertFilter === f ? T.accent : "rgba(99,102,241,0.08)", alertFilter === f ? "#fff" : T.muted),
              textTransform: "capitalize",
            }}>{f} ({f === "all" ? alerts.length : alerts.filter(a => a.status === f).length})</button>
          ))}
        </div>
      </div>
      <div style={sty.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Severity", "Alert", "Source", "IP Address", "Time", "Status", "Actions"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredAlerts.map(a => (
              <tr key={a.id}>
                <td style={sty.td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: alertColor(a.type), boxShadow: `0 0 6px ${alertColor(a.type)}` }} />
                    <span style={{ fontSize: 12, color: alertColor(a.type), fontWeight: 600, textTransform: "uppercase" }}>{a.type}</span>
                  </span>
                </td>
                <td style={{ ...sty.td, maxWidth: 300 }}>{a.msg}</td>
                <td style={sty.td}><Badge color={T.accent}>{a.source}</Badge></td>
                <td style={{ ...sty.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{a.ip}</td>
                <td style={{ ...sty.td, color: T.muted, fontSize: 12 }}>{a.time}</td>
                <td style={sty.td}><Badge color={statusColor(a.status)}>{a.status}</Badge></td>
                <td style={sty.td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {a.status !== "resolved" && <button onClick={() => resolveAlert(a.id)} style={sty.btn("rgba(34,197,94,0.1)", T.green)}><HiOutlineCheck size={14} /></button>}
                    <button onClick={() => setAlerts(al => al.filter(x => x.id !== a.id))} style={sty.btn("rgba(239,68,68,0.1)", T.red)}><HiOutlineTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAlerts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>No alerts matching filter</div>}
      </div>
    </>
  );

  const renderLogs = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>System Logs</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {["all", "INFO", "WARN", "ERROR", "DEBUG"].map(f => (
            <button key={f} onClick={() => { setLogFilter(f); setLogPage(1); }} style={{
              ...sty.btn(logFilter === f ? (f === "ERROR" ? T.red : f === "WARN" ? T.orange : T.accent) : "rgba(99,102,241,0.08)",
                logFilter === f ? "#fff" : T.muted),
            }}>{f}</button>
          ))}
          <button style={sty.btn("rgba(99,102,241,0.1)", T.accent)}><HiOutlineDownload size={14} /> Export</button>
        </div>
      </div>
      <div style={{ ...sty.card, fontFamily: "'JetBrains Mono', monospace", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.muted }}>Showing {pagedLogs.length} of {filteredLogs.length} entries</span>
          <span style={{ fontSize: 12, color: T.muted }}>Page {logPage}/{totalLogPages}</span>
        </div>
        {pagedLogs.map(l => (
          <div key={l.id} style={{ display: "flex", gap: 16, padding: "8px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 12, alignItems: "center" }}>
            <span style={{ color: T.muted, minWidth: 150 }}>{l.time}</span>
            <Badge color={l.type === "ERROR" ? T.red : l.type === "WARN" ? T.orange : l.type === "DEBUG" ? T.muted : T.cyan}>{l.type}</Badge>
            <span style={{ color: T.accent, minWidth: 60 }}>{l.source}</span>
            <span style={{ color: T.white, fontFamily: "'Plus Jakarta Sans'" }}>{l.msg}</span>
          </div>
        ))}
        <div style={{ padding: "12px 20px", display: "flex", justifyContent: "center", gap: 8 }}>
          <button disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)} style={{ ...sty.btn(T.surface, logPage <= 1 ? T.muted : T.white), opacity: logPage <= 1 ? 0.5 : 1 }}><HiOutlineChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(5, totalLogPages) }, (_, i) => {
            const p = logPage <= 3 ? i + 1 : logPage + i - 2;
            if (p > totalLogPages || p < 1) return null;
            return <button key={p} onClick={() => setLogPage(p)} style={sty.btn(p === logPage ? T.accent : T.surface, "#fff")}>{p}</button>;
          })}
          <button disabled={logPage >= totalLogPages} onClick={() => setLogPage(p => p + 1)} style={{ ...sty.btn(T.surface, logPage >= totalLogPages ? T.muted : T.white), opacity: logPage >= totalLogPages ? 0.5 : 1 }}><HiOutlineChevronRight size={16} /></button>
        </div>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 20 }}>System Settings</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>General</h3>
          {[
            { label: "Site Name", key: "siteName", type: "text" },
            { label: "Admin Email", key: "adminEmail", type: "email" },
            { label: "Scan Interval (hours)", key: "scanInterval", type: "number" },
            { label: "Log Retention (days)", key: "retentionDays", type: "number" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} value={settings[f.key]} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} style={sty.input} />
            </div>
          ))}
          <button style={{ ...sty.btn(T.accent), marginTop: 8 }}><HiOutlineSave size={14} /> Save Changes</button>
        </div>
        <div style={sty.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: T.white, marginBottom: 16 }}>Toggles</h3>
          {[
            { label: "Two-Factor Authentication", key: "twoFactor", desc: "Require 2FA for all admin accounts" },
            { label: "Email Notifications", key: "emailNotifs", desc: "Send alerts via email" },
            { label: "Slack Integration", key: "slackNotifs", desc: "Post alerts to Slack channel" },
            { label: "Auto Scan", key: "autoScan", desc: "Automatically scan new files" },
            { label: "Dark Mode", key: "darkMode", desc: "Use dark theme (recommended)" },
            { label: "Maintenance Mode", key: "maintenance", desc: "Show maintenance page to users" },
          ].map(t => (
            <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 14, color: T.white, fontWeight: 500 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{t.desc}</div>
              </div>
              <div onClick={() => setSettings({ ...settings, [t.key]: !settings[t.key] })} style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.3s",
                background: settings[t.key] ? T.accent : "rgba(148,163,184,0.2)",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, transition: "left 0.3s",
                  left: settings[t.key] ? 23 : 3,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Admin Dashboard" description="Secuvion admin control panel." path="/admin" />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 99, display: "none",
        }} className="admin-overlay" />
      )}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.cyan}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>S</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>SECUVION</span>
        </div>
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{ padding: "8px 12px", background: "rgba(34,197,94,0.08)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.15)", fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 6 }}>
            <HiOutlineStatusOnline size={14} /> All Systems Operational
          </div>
        </div>
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.06)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, display: "inline-block", boxShadow: `0 0 6px ${T.red}`, animation: "pulse 1.2s infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: "uppercase", letterSpacing: 1 }}>Live Threats</span>
            </div>
            <div style={{ fontSize: 12, color: T.white, fontWeight: 600, marginBottom: 2 }}>{liveFeed[liveFeedIdx].ip}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.orange }}>{liveFeed[liveFeedIdx].type}</span>
              <span style={{ fontSize: 10, color: T.muted, background: "rgba(148,163,184,0.1)", padding: "1px 5px", borderRadius: 4 }}>{liveFeed[liveFeedIdx].country}</span>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button key={item.label} onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%",
              background: activeNav === item.label ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.08))" : "transparent",
              border: activeNav === item.label ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              borderRadius: 10, color: activeNav === item.label ? T.cyan : T.muted,
              cursor: "pointer", fontSize: 14, fontWeight: activeNav === item.label ? 600 : 400,
              fontFamily: "'Plus Jakarta Sans'", position: "relative",
            }}>
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && <span style={{ background: T.orange, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, marginLeft: "auto" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "8px 12px 8px" }}>
          <div style={{ padding: "12px", background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.1)", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{user?.name?.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", margin: "0 8px 8px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10,
          color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "'Plus Jakarta Sans'",
        }}>
          <HiOutlineLogout size={20} /> Log Out
        </button>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0,
          background: "rgba(3,7,18,0.85)", backdropFilter: "blur(12px)", zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'" }}>{activeNav}</h1>
            <p style={{ fontSize: 12, color: T.muted }}>Admin Control Panel</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="admin-burger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <HiOutlineSearch size={14} color={T.muted} />
              <input placeholder="Search..." style={{ background: "none", border: "none", color: T.white, fontSize: 12, outline: "none", width: 160, fontFamily: "'Plus Jakarta Sans'" }} />
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <HiOutlineBell size={20} color={T.muted} />
              <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: T.red, borderRadius: "50%", border: "2px solid #030712" }} />
            </div>
          </div>
        </header>

        <div style={{ padding: "28px 32px", maxWidth: 1400 }}>
          {renderContent()}
        </div>

        <footer style={{ padding: "20px 32px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.muted }}>&copy; 2026 SECUVION. All rights reserved. Founder: Sahil Anil Nikam</span>
          <span style={{ fontSize: 12, color: T.muted }}>v1.0.0 | Admin Panel</span>
        </footer>
      </main>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            left: -260px;
            z-index: 100;
            transition: left 0.3s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
          .admin-sidebar.open { left: 0 !important; }
          .admin-burger { display: flex !important; }
          .admin-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
