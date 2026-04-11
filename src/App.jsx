import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, DashboardRedirect } from "./components/ProtectedRoute";
import AIChatbot from "./components/AIChatbot.jsx";

/* ── Skeleton Loader ── */
const T = { bg: "#030712", card: "rgba(17,24,39,0.6)", border: "rgba(148,163,184,0.08)", accent: "#6366f1", cyan: "#14e3c5" };
const PageSkeleton = () => (
  <div style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 100 }}>
    <style>{`
      @keyframes sk-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      .sk-bone { background: linear-gradient(90deg, rgba(148,163,184,0.04) 25%, rgba(148,163,184,0.08) 50%, rgba(148,163,184,0.04) 75%);
        background-size: 800px 100%; animation: sk-shimmer 1.5s infinite linear; border-radius: 8px; }
    `}</style>
    {/* Navbar skeleton */}
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 64, background: "rgba(3,7,18,0.95)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 40px", gap: 20, zIndex: 100 }}>
      <div className="sk-bone" style={{ width: 32, height: 32 }} />
      <div className="sk-bone" style={{ width: 100, height: 16 }} />
      <div style={{ flex: 1 }} />
      <div className="sk-bone" style={{ width: 60, height: 14 }} />
      <div className="sk-bone" style={{ width: 60, height: 14 }} />
      <div className="sk-bone" style={{ width: 80, height: 34, borderRadius: 8 }} />
    </div>
    {/* Content skeleton */}
    <div style={{ maxWidth: 800, width: "100%", padding: "0 24px" }}>
      <div className="sk-bone" style={{ width: "60%", height: 36, marginBottom: 16 }} />
      <div className="sk-bone" style={{ width: "90%", height: 14, marginBottom: 10 }} />
      <div className="sk-bone" style={{ width: "75%", height: 14, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {[1, 2, 3].map(i => <div key={i} className="sk-bone" style={{ height: 140 }} />)}
      </div>
      <div className="sk-bone" style={{ width: "50%", height: 14, marginBottom: 10 }} />
      <div className="sk-bone" style={{ width: "80%", height: 14, marginBottom: 10 }} />
      <div className="sk-bone" style={{ width: "65%", height: 14 }} />
    </div>
  </div>
);

/* ── Page Transition Wrapper ── */
const PageTransition = ({ children }) => {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return (
    <div key={location.pathname} style={{ animation: "pageFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <style>{`@keyframes pageFadeIn { from { opacity: 0; transform: translateY(16px) scale(0.998); filter: blur(2px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }`}</style>
      {children}
    </div>
  );
};

/* ── Lazy-loaded Pages ── */
const Secuvion = lazy(() => import("./Secuvion"));
const Home = lazy(() => import("./assets/pages/Home.jsx"));
const ThreatMap = lazy(() => import("./assets/pages/ThreatMap.jsx"));
const FraudAnalyzer = lazy(() => import("./assets/pages/FraudAnalyzer.jsx"));
const SecurityScore = lazy(() => import("./assets/pages/SecurityScore.jsx"));
const Protection = lazy(() => import("./assets/pages/Protection.jsx"));
const ScamDatabase = lazy(() => import("./assets/pages/ScamDatabase.jsx"));
const EmergencyHelp = lazy(() => import("./assets/pages/EmergencyHelp.jsx"));
const Learn = lazy(() => import("./assets/pages/Learn.jsx"));
const Founder = lazy(() => import("./assets/pages/Founder.jsx"));
const Pricing = lazy(() => import("./assets/pages/Pricing.jsx"));
const Login = lazy(() => import("./assets/pages/Login.jsx"));
const Signup = lazy(() => import("./assets/pages/Signup.jsx"));
const AdminDashboard = lazy(() => import("./assets/pages/AdminDashboard.jsx"));
const UserDashboard = lazy(() => import("./assets/pages/UserDashboard.jsx"));
const Checkout = lazy(() => import("./assets/pages/Checkout.jsx"));
const Privacy = lazy(() => import("./assets/pages/Privacy.jsx"));
const Terms = lazy(() => import("./assets/pages/Terms.jsx"));
const Contact = lazy(() => import("./assets/pages/Contact.jsx"));
const About = lazy(() => import("./assets/pages/About.jsx"));
const FeaturesPage = lazy(() => import("./assets/pages/FeaturesPage.jsx"));
const NotFound = lazy(() => import("./assets/pages/NotFound.jsx"));
const Welcome = lazy(() => import("./assets/pages/Welcome.jsx"));
const DarkWebMonitor = lazy(() => import("./assets/pages/DarkWebMonitor.jsx"));
const PasswordVault = lazy(() => import("./assets/pages/PasswordVault.jsx"));
const VulnerabilityScanner = lazy(() => import("./assets/pages/VulnerabilityScanner.jsx"));
const Blog = lazy(() => import("./assets/pages/Blog.jsx"));
const IPLookup = lazy(() => import("./assets/pages/IPLookup.jsx"));
const SecurityChecklist = lazy(() => import("./assets/pages/SecurityChecklist.jsx"));
const EmailAnalyzer = lazy(() => import("./assets/pages/EmailAnalyzer.jsx"));
const CyberNews = lazy(() => import("./assets/pages/CyberNews.jsx"));
const QRScanner = lazy(() => import("./assets/pages/QRScanner.jsx"));
const ForgotPassword = lazy(() => import("./assets/pages/ForgotPassword.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <AIChatbot />
      <Suspense fallback={<PageSkeleton />}>
        <PageTransition>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Secuvion />} />
            <Route path="/home" element={<Home />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/emergency-help" element={<EmergencyHelp />} />

            {/* Protected — Tools (login required) */}
            <Route path="/threat-map" element={<ProtectedRoute><ThreatMap /></ProtectedRoute>} />
            <Route path="/fraud-analyzer" element={<ProtectedRoute><FraudAnalyzer /></ProtectedRoute>} />
            <Route path="/security-score" element={<ProtectedRoute><SecurityScore /></ProtectedRoute>} />
            <Route path="/protection" element={<ProtectedRoute><Protection /></ProtectedRoute>} />
            <Route path="/scam-database" element={<ProtectedRoute><ScamDatabase /></ProtectedRoute>} />
            <Route path="/dark-web-monitor" element={<ProtectedRoute><DarkWebMonitor /></ProtectedRoute>} />
            <Route path="/password-vault" element={<ProtectedRoute><PasswordVault /></ProtectedRoute>} />
            <Route path="/vulnerability-scanner" element={<ProtectedRoute><VulnerabilityScanner /></ProtectedRoute>} />
            <Route path="/ip-lookup" element={<ProtectedRoute><IPLookup /></ProtectedRoute>} />
            <Route path="/security-checklist" element={<ProtectedRoute><SecurityChecklist /></ProtectedRoute>} />
            <Route path="/email-analyzer" element={<ProtectedRoute><EmailAnalyzer /></ProtectedRoute>} />
            <Route path="/qr-scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />

            {/* Protected — Learn, Blog, News (login required) */}
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/cyber-news" element={<ProtectedRoute><CyberNews /></ProtectedRoute>} />

            {/* Welcome page after signup/login */}
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Protected - Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* Protected - User */}
            <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

            {/* Protected - Checkout */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
