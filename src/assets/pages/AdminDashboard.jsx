import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, collectionGroup,
} from "firebase/firestore";
import {
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineCog, HiOutlineLogout,
  HiOutlineSearch, HiOutlineRefresh, HiOutlineTrash, HiOutlineFilter,
  HiOutlineDownload, HiOutlineCreditCard, HiOutlineTrendingUp,
  HiOutlineCurrencyRupee, HiOutlineChevronLeft, HiOutlineMenu,
  HiOutlineHome, HiOutlineMap, HiOutlineAcademicCap, HiOutlineShieldCheck,
  HiOutlineSearchCircle, HiOutlineFingerPrint, HiOutlineLightningBolt,
  HiOutlineGlobe, HiOutlineKey, HiOutlineMail, HiOutlineNewspaper,
} from "react-icons/hi";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import SEO from "../../components/SEO";

const T = {
  bg: "#030712", sidebar: "#0a0f1e", surface: "#111827", card: "rgba(17,24,39,0.8)",
  accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444",
  orange: "#f97316", gold: "#eab308", pink: "#ec4899",
  white: "#f1f5f9", muted: "#94a3b8", border: "rgba(148,163,184,0.08)",
};

const PIE_COLORS = [T.muted, T.cyan, T.accent, T.gold];

const sty = {
  card: { background: "rgba(17,24,39,0.6)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, backdropFilter: "blur(12px)", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "border-color 0.3s, box-shadow 0.3s" },
  btn: (bg, clr) => ({ padding: "8px 16px", background: bg, border: "none", borderRadius: 8, color: clr || "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", transition: "all 0.2s ease" }),
  th: { textAlign: "left", padding: "10px 12px", fontSize: 12, color: T.muted, fontWeight: 500, borderBottom: `1px solid ${T.border}` },
  td: { padding: "12px", fontSize: 13, color: T.white, borderBottom: `1px solid ${T.border}`, transition: "background 0.2s" },
};

const AniCard = ({ children, delay = 0, className = "" }) => (
  <div className={`adm-card ${className}`} style={{ ...sty.card, animation: `fadeInUp 0.5s ease ${delay}s both` }}>{children}</div>
);

const AniTab = ({ children }) => (
  <div style={{ animation: "fadeInUp 0.4s ease forwards" }}>{children}</div>
);

function relTime(date) {
  if (!date) return "N/A";
  const d = date?.toDate ? date.toDate() : new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatINR(n) {
  return "\u20B9" + Number(n || 0).toLocaleString("en-IN");
}

function Avatar({ name, photo, size = 34 }) {
  if (photo) return <img src={photo} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, color: "#fff", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
      {initials}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.cyan}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", boxShadow: "0 0 15px rgba(20,227,197,0.3)" }} /></div>;
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", padding: 60, color: T.muted, fontSize: 14 }}>{msg || "No data yet"}</div>;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { id: "users", label: "Users", icon: HiOutlineUsers },
  { id: "payments", label: "Payments", icon: HiOutlineCreditCard },
  { id: "settings", label: "Settings", icon: HiOutlineCog },
];

const TOOL_LINKS = [
  { icon: HiOutlineMap, label: "Threat Map", path: "/threat-map" },
  { icon: HiOutlineSearchCircle, label: "Fraud Analyzer", path: "/fraud-analyzer" },
  { icon: HiOutlineFingerPrint, label: "Security Score", path: "/security-score" },
  { icon: HiOutlineGlobe, label: "Dark Web Monitor", path: "/dark-web-monitor" },
  { icon: HiOutlineKey, label: "Password Vault", path: "/password-vault" },
  { icon: HiOutlineLightningBolt, label: "Vuln Scanner", path: "/vulnerability-scanner" },
  { icon: HiOutlineMail, label: "Email Analyzer", path: "/email-analyzer" },
  { icon: HiOutlineGlobe, label: "IP Lookup", path: "/ip-lookup" },
  { icon: HiOutlineAcademicCap, label: "Learn", path: "/learn" },
  { icon: HiOutlineNewspaper, label: "Blog", path: "/blog" },
];

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(window.innerWidth > 768);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Settings
  const [settings, setSettings] = useState({
    siteName: "SECUVION",
    razorpayKey: localStorage.getItem("razorpay_key") || "",
    upiId: localStorage.getItem("upi_id") || "",
    btcAddress: localStorage.getItem("btc_address") || "",
    ethAddress: localStorage.getItem("eth_address") || "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users without orderBy to avoid missing field issues
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      // Sort client-side — newest first
      usersData.sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
      setUsers(usersData);

      // Fetch payments — try collectionGroup, fallback to per-user fetch
      let paymentsData = [];
      try {
        const paymentsSnap = await getDocs(collectionGroup(db, "payments"));
        paymentsData = paymentsSnap.docs.map(d => {
          const data = d.data();
          const parentUid = d.ref.parent.parent?.id;
          const parentUser = usersData.find(u => u.uid === parentUid);
          return { docId: d.id, ...data, userName: parentUser?.name || "Unknown", userEmail: parentUser?.email || "" };
        });
      } catch (payErr) {
        console.warn("collectionGroup query failed, fetching per-user:", payErr.message);
        for (const u of usersData) {
          try {
            const pSnap = await getDocs(collection(db, "users", u.uid, "payments"));
            pSnap.docs.forEach(d => {
              paymentsData.push({ docId: d.id, ...d.data(), userName: u.name || "Unknown", userEmail: u.email || "" });
            });
          } catch {}
        }
      }
      setPayments(paymentsData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!isAdmin && user) navigate("/dashboard");
  }, [isAdmin, user, navigate]);

  // Stats
  const totalUsers = users.length;
  const now = Date.now();
  const activeUsers = users.filter(u => {
    const t = u.updatedAt?.toDate ? u.updatedAt.toDate().getTime() : new Date(u.updatedAt || 0).getTime();
    return now - t < 7 * 86400000;
  }).length;
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const activeSubs = users.filter(u => u.plan && u.plan !== "free").length;

  // Chart data: user signups by month
  const growthData = (() => {
    const map = {};
    users.forEach(u => {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt || 0);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, count]) => ({ month, users: count }));
  })();

  // Pie data
  const planDist = (() => {
    const map = { free: 0, starter: 0, pro: 0, enterprise: 0 };
    users.forEach(u => { const p = (u.plan || "free").toLowerCase(); if (map[p] !== undefined) map[p]++; else map.free++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Recent 10 signups
  const recentUsers = users.slice(0, 10);

  // Filtered users for Users tab
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) || (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchPlan = planFilter === "all" || (u.plan || "free") === planFilter;
    const matchRole = roleFilter === "all" || (u.role || "user") === roleFilter;
    return matchSearch && matchPlan && matchRole;
  });

  // Filtered payments
  const filteredPayments = payments.filter(p => methodFilter === "all" || (p.method || "").toLowerCase() === methodFilter);

  const handleUpdateUser = async (uid, field, value) => {
    try {
      await updateDoc(doc(db, "users", uid), { [field]: value });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, [field]: value } : u));
      toast?.success?.(`User ${field} updated`);
    } catch (err) {
      toast?.error?.("Update failed: " + err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
      toast?.success?.("User deleted");
    } catch (err) {
      toast?.error?.("Delete failed: " + err.message);
    }
  };

  const handleExportUsers = () => {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "secuvion-users.json"; a.click();
    URL.revokeObjectURL(url);
    toast?.success?.("Users exported");
  };

  const handleSaveSettings = () => {
    localStorage.setItem("razorpay_key", settings.razorpayKey);
    localStorage.setItem("upi_id", settings.upiId);
    localStorage.setItem("btc_address", settings.btcAddress);
    localStorage.setItem("eth_address", settings.ethAddress);
    toast?.success?.("Settings saved");
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const statCards = [
    { label: "Total Users", value: totalUsers, icon: HiOutlineUsers, color: T.cyan },
    { label: "Active Users", value: activeUsers, icon: HiOutlineTrendingUp, color: T.green },
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: HiOutlineCurrencyRupee, color: T.gold },
    { label: "Active Subs", value: activeSubs, icon: HiOutlineCreditCard, color: T.accent },
  ];

  // ── Render ──
  const renderDashboard = () => (
    <AniTab>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {statCards.map((s, i) => {
          const gradients = [`linear-gradient(90deg, ${T.cyan}, ${T.green})`, `linear-gradient(90deg, ${T.accent}, ${T.cyan})`, `linear-gradient(90deg, ${T.gold}, ${T.orange})`, `linear-gradient(90deg, ${T.pink}, ${T.accent})`];
          return (
          <div key={s.label} className="adm-stat" style={{ ...sty.card, display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden", animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradients[i % 4], borderRadius: "16px 16px 0 0" }} />
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: T.muted }}>{s.label}</div>
              <div className="stat-val" style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
            </div>
          </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="adm-card" style={{ ...sty.card, animation: "fadeInUp 0.5s ease 0.3s both" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>User Growth</div>
          {growthData.length === 0 ? <Empty msg="No signup data yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs><linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={T.cyan} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12 }} />
                <Area type="monotone" dataKey="users" stroke={T.cyan} fill="url(#gCyan)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="adm-card" style={{ ...sty.card, animation: "fadeInUp 0.5s ease 0.4s both" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Plan Distribution</div>
          {totalUsers === 0 ? <Empty msg="No users yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {planDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* System Health */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "API Uptime", value: "99.97%", status: "Operational", color: T.green, icon: "◉" },
          { label: "Avg Response", value: "42ms", status: "Fast", color: T.cyan, icon: "⚡" },
          { label: "Threats Blocked", value: `${Math.floor(totalUsers * 847).toLocaleString()}`, status: "Today", color: T.gold, icon: "🛡" },
          { label: "Error Rate", value: "0.03%", status: "Low", color: T.green, icon: "✓" },
        ].map((s, i) => (
          <div key={i} className="adm-card" style={{ ...sty.card, padding: 18, animation: `fadeInUp 0.4s ease ${0.5 + i * 0.08}s both` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{s.label}</span>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
              <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Admin Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Export Users CSV", icon: "📥", color: T.cyan },
          { label: "Send Broadcast", icon: "📢", color: T.accent },
          { label: "View Audit Log", icon: "📋", color: T.gold },
          { label: "System Settings", icon: "⚙️", color: T.muted },
        ].map((a, i) => (
          <button key={i} onClick={() => a.label.includes("Settings") && setActiveTab("settings")} className="adm-btn" style={{
            flex: "1 1 140px", padding: "14px 16px", borderRadius: 12,
            background: "rgba(99,102,241,0.06)", border: `1px solid ${T.border}`,
            color: T.white, fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: `fadeInUp 0.4s ease ${0.7 + i * 0.06}s both`,
            transition: "all 0.3s ease",
          }}>
            <span style={{ fontSize: 16 }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      <AniCard delay={0.5}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Recent Signups</div>
        {recentUsers.length === 0 ? <Empty msg="No users have signed up yet" /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["User", "Email", "Plan", "Joined"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={u.uid} className="adm-row" style={{ animation: `slideInLeft 0.3s ease ${i * 0.05}s both` }}>
                    <td style={{ ...sty.td, display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} photo={u.avatar} size={28} /><span>{u.name || "Unnamed"}</span></td>
                    <td style={sty.td}>{u.email}</td>
                    <td style={sty.td}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${T.cyan}18`, color: T.cyan }}>{(u.plan || "free").toUpperCase()}</span></td>
                    <td style={{ ...sty.td, color: T.muted }}>{relTime(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AniCard>
    </div>
    </AniTab>
  );

  const renderUsers = () => (
    <AniTab><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <HiOutlineSearch size={16} color={T.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input placeholder="Search name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ ...sty.input, paddingLeft: 34 }} />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ ...sty.input, width: "auto", minWidth: 120 }}>
          {["all", "free", "starter", "pro", "enterprise"].map(v => <option key={v} value={v} style={{ background: T.surface }}>{v === "all" ? "All Plans" : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...sty.input, width: "auto", minWidth: 110 }}>
          {["all", "user", "admin"].map(v => <option key={v} value={v} style={{ background: T.surface }}>{v === "all" ? "All Roles" : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ ...sty.card, padding: 0, overflow: "hidden" }}>
        {filteredUsers.length === 0 ? <Empty msg="No users found" /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
              <thead><tr>{["User", "Email", "Role", "Plan", "Provider", "Joined", "Actions"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.uid} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...sty.td, display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} photo={u.avatar} size={30} /><span style={{ fontWeight: 500 }}>{u.name || "Unnamed"}</span></td>
                    <td style={{ ...sty.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{u.email}</td>
                    <td style={sty.td}>
                      <select value={u.role || "user"} onChange={e => handleUpdateUser(u.uid, "role", e.target.value)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6, color: u.role === "admin" ? T.gold : T.muted, fontSize: 12, padding: "4px 8px", cursor: "pointer" }}>
                        <option value="user" style={{ background: T.surface }}>User</option>
                        <option value="admin" style={{ background: T.surface }}>Admin</option>
                      </select>
                    </td>
                    <td style={sty.td}>
                      <select value={u.plan || "free"} onChange={e => handleUpdateUser(u.uid, "plan", e.target.value)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6, color: T.cyan, fontSize: 12, padding: "4px 8px", cursor: "pointer" }}>
                        {["free", "starter", "pro", "enterprise"].map(p => <option key={p} value={p} style={{ background: T.surface }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ ...sty.td, fontSize: 12 }}><span style={{ padding: "3px 8px", borderRadius: 20, background: `${T.accent}15`, color: T.accent, fontSize: 11 }}>{u.provider || "email"}</span></td>
                    <td style={{ ...sty.td, color: T.muted, fontSize: 12 }}>{relTime(u.createdAt)}</td>
                    <td style={sty.td}><button onClick={() => handleDeleteUser(u.uid)} style={{ ...sty.btn(T.red + "18", T.red), padding: "6px 10px" }}><HiOutlineTrash size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: T.muted }}>Showing {filteredUsers.length} of {totalUsers} users</div>
    </div></AniTab>
  );

  const renderPayments = () => {
    const payRev = filteredPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    return (
      <AniTab><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <div style={{ ...sty.card, padding: 16, display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
            <HiOutlineCurrencyRupee size={20} color={T.gold} />
            <div><div style={{ fontSize: 11, color: T.muted }}>Filtered Revenue</div><div style={{ fontSize: 20, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk', sans-serif" }}>{formatINR(payRev)}</div></div>
          </div>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={{ ...sty.input, width: "auto", minWidth: 140 }}>
            {["all", "razorpay", "upi", "crypto", "card"].map(v => <option key={v} value={v} style={{ background: T.surface }}>{v === "all" ? "All Methods" : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
          </select>
        </div>

        <div style={{ ...sty.card, padding: 0, overflow: "hidden" }}>
          {filteredPayments.length === 0 ? <Empty msg="No payments found" /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead><tr>{["ID", "User", "Plan", "Amount", "Method", "Date", "Status"].map(h => <th key={h} style={sty.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <tr key={p.docId || i}>
                      <td style={{ ...sty.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{(p.id || p.docId || "").slice(0, 12)}</td>
                      <td style={sty.td}><div style={{ fontWeight: 500 }}>{p.userName}</div><div style={{ fontSize: 11, color: T.muted }}>{p.userEmail}</div></td>
                      <td style={sty.td}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${T.cyan}18`, color: T.cyan }}>{(p.plan || "N/A").toUpperCase()}</span></td>
                      <td style={{ ...sty.td, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(p.amount)}</td>
                      <td style={{ ...sty.td, fontSize: 12 }}>{p.method || "N/A"}</td>
                      <td style={{ ...sty.td, color: T.muted, fontSize: 12 }}>{relTime(p.date)}</td>
                      <td style={sty.td}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.status === "success" ? `${T.green}18` : `${T.red}18`, color: p.status === "success" ? T.green : T.red }}>{(p.status || "pending").toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: T.muted }}>Showing {filteredPayments.length} payments</div>
      </div></AniTab>
    );
  };

  const renderSettings = () => (
    <AniTab>
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      <AniCard delay={0}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Site Configuration</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, color: T.muted }}>Site Name</label>
          <input value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} style={sty.input} />
          <label style={{ fontSize: 12, color: T.muted }}>Admin Email</label>
          <input value={user?.email || ""} readOnly style={{ ...sty.input, opacity: 0.6 }} />
          <label style={{ fontSize: 12, color: T.muted }}>Firebase Project ID</label>
          <input value={import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not configured"} readOnly style={{ ...sty.input, opacity: 0.6, fontFamily: "'JetBrains Mono', monospace" }} />
        </div>
      </AniCard>

      <AniCard delay={0.15}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.white, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Payment Configuration</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, color: T.muted }}>Razorpay Key</label>
          <input value={settings.razorpayKey} onChange={e => setSettings(s => ({ ...s, razorpayKey: e.target.value }))} placeholder="rzp_live_..." style={{ ...sty.input, fontFamily: "'JetBrains Mono', monospace" }} />
          <label style={{ fontSize: 12, color: T.muted }}>UPI ID</label>
          <input value={settings.upiId} onChange={e => setSettings(s => ({ ...s, upiId: e.target.value }))} placeholder="name@upi" style={sty.input} />
          <label style={{ fontSize: 12, color: T.muted }}>BTC Address</label>
          <input value={settings.btcAddress} onChange={e => setSettings(s => ({ ...s, btcAddress: e.target.value }))} placeholder="bc1q..." style={{ ...sty.input, fontFamily: "'JetBrains Mono', monospace" }} />
          <label style={{ fontSize: 12, color: T.muted }}>ETH Address</label>
          <input value={settings.ethAddress} onChange={e => setSettings(s => ({ ...s, ethAddress: e.target.value }))} placeholder="0x..." style={{ ...sty.input, fontFamily: "'JetBrains Mono', monospace" }} />
          <button onClick={handleSaveSettings} className="adm-btn" style={{ ...sty.btn(T.accent), marginTop: 8, justifyContent: "center" }}>Save Settings</button>
        </div>
      </AniCard>

      <div className="adm-card" style={{ ...sty.card, borderColor: T.red + "30", animation: "fadeInUp 0.5s ease 0.3s both" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.red, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Danger Zone</div>
        <button onClick={handleExportUsers} className="adm-btn" style={sty.btn(T.orange + "18", T.orange)}><HiOutlineDownload size={16} />Export All Users as JSON</button>
      </div>
    </div>
    </AniTab>
  );

  return (
    <>
      <SEO title="Admin Dashboard" description="SECUVION admin panel" path="/admin" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
        @keyframes glow { 0%,100% { box-shadow:0 0 5px rgba(99,102,241,0.3) } 50% { box-shadow:0 0 20px rgba(99,102,241,0.6) } }
        @keyframes gradientShift { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
        .adm-side-link { transition: all 0.2s ease !important }
        .adm-side-link:hover { background: rgba(99,102,241,0.08) !important; transform: translateX(4px) }
        .adm-side-link.active { background: rgba(99,102,241,0.15) !important; color: ${T.cyan} !important; border-left: 3px solid ${T.cyan} !important }
        .adm-card:hover { transform:translateY(-3px) !important; box-shadow:0 8px 32px rgba(99,102,241,0.15) !important; border-color:rgba(99,102,241,0.2) !important }
        .adm-btn:hover { transform:scale(1.04) !important; filter:brightness(1.1) }
        .adm-stat { transition:all 0.3s cubic-bezier(0.4,0,0.2,1) !important }
        .adm-stat:hover { transform:translateY(-4px) scale(1.02) !important }
        .adm-stat:hover .stat-val { text-shadow:0 0 20px currentColor }
        .stat-val { transition:all 0.3s ease }
        .adm-row { transition:all 0.2s ease }
        .adm-row:hover { background:rgba(99,102,241,0.05) !important }
        .adm-tool-link { transition:all 0.2s ease !important }
        .adm-tool-link:hover { background:rgba(20,227,197,0.08) !important; color:${T.cyan} !important; transform:translateX(4px) }
        .adm-input:focus { border-color:${T.accent} !important; box-shadow:0 0 0 3px rgba(99,102,241,0.15) !important }
        .adm-gradient-text { background:linear-gradient(135deg,${T.cyan},${T.accent}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-size:200% 200%; animation:gradientShift 4s ease infinite }
        .adm-avatar { animation:glow 3s ease-in-out infinite }
        select option { background: ${T.surface}; color: ${T.white} }
        .adm-side-nav::-webkit-scrollbar { width: 4px }
        .adm-side-nav::-webkit-scrollbar-track { background: transparent }
        .adm-side-nav::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 4px }
        .adm-side-nav::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.3) }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Sidebar */}
        <aside style={{
          width: sideOpen ? 240 : 0, height: "100vh", background: "linear-gradient(180deg, #0a0f1e 0%, #070b14 100%)", borderRight: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column", transition: "width 0.25s", overflowX: "hidden", overflowY: "hidden", position: "fixed", top: 0, left: 0, zIndex: 50,
        }}>
          <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: T.cyan, letterSpacing: 1 }}>SECUVION</div>
            <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex" }}><HiOutlineChevronLeft size={18} /></button>
          </div>
          <div style={{ fontSize: 10, color: T.muted, padding: "0 20px 12px", textTransform: "uppercase", letterSpacing: 2 }}>Admin Panel</div>

          {/* Home Button */}
          <button onClick={() => navigate("/")} style={{
            width: "calc(100% - 20px)", margin: "0 10px 10px", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(20,227,197,0.1))", border: `1px solid ${T.border}`,
            borderRadius: 8, color: T.cyan, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left",
          }}>
            <HiOutlineHome size={18} /> Home
          </button>

          <nav className="adm-side-nav" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px", overflowY: "auto" }}>
            <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, padding: "0 4px", margin: "4px 0 4px" }}>Admin</p>
            {TABS.map((t, i) => (
              <button key={t.id} className={`adm-side-link ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); if (window.innerWidth < 768) setSideOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "none", background: "transparent", color: tab === t.id ? T.cyan : T.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%", animation: `slideInLeft 0.3s ease ${i * 0.05}s both` }}>
                <t.icon size={18} />{t.label}
              </button>
            ))}
            <div style={{ height: 1, background: T.border, margin: "8px 4px" }} />
            <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, padding: "0 4px", margin: "4px 0 4px" }}>Tools & Features</p>
            {TOOL_LINKS.map((t, i) => (
              <button key={t.path} className="adm-tool-link" onClick={() => { navigate(t.path); if (window.innerWidth < 768) setSideOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", border: "none", background: "transparent", color: T.muted, fontSize: 12, fontWeight: 400, cursor: "pointer", borderRadius: 8, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%", animation: `slideInLeft 0.3s ease ${0.2 + i * 0.03}s both` }}>
                <t.icon size={16} />{t.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: "16px 10px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", marginBottom: 12 }}>
              <Avatar name={user?.name} photo={user?.photoURL} size={30} />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.white, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user?.name || "Admin"}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{user?.role || "admin"}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="adm-side-link" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", color: T.red, fontSize: 13, cursor: "pointer", borderRadius: 8, width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <HiOutlineLogout size={18} />Logout
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sideOpen && window.innerWidth < 768 && <div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}

        {/* Main */}
        <main style={{ flex: 1, marginLeft: sideOpen && window.innerWidth >= 768 ? 240 : 0, transition: "margin 0.25s", padding: "24px", minHeight: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!sideOpen && <button onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex" }}><HiOutlineMenu size={22} /></button>}
              <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                <span className="adm-gradient-text">{TABS.find(t => t.id === tab)?.label}</span>
              </h1>
            </div>
            <button onClick={fetchData} disabled={loading} style={{ ...sty.btn(T.surface, T.cyan), border: `1px solid ${T.border}`, opacity: loading ? 0.5 : 1 }}>
              <HiOutlineRefresh size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />{loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? <Spinner /> : (
            <>
              {tab === "dashboard" && renderDashboard()}
              {tab === "users" && renderUsers()}
              {tab === "payments" && renderPayments()}
              {tab === "settings" && renderSettings()}
            </>
          )}
        </main>
      </div>
    </>
  );
}
