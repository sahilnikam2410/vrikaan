import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, DashboardRedirect } from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

import Secuvion from "./Secuvion";
import Home from "./assets/pages/Home.jsx";
import ThreatMap from "./assets/pages/ThreatMap.jsx";
import FraudAnalyzer from "./assets/pages/FraudAnalyzer.jsx";
import SecurityScore from "./assets/pages/SecurityScore.jsx";
import Protection from "./assets/pages/Protection.jsx";
import ScamDatabase from "./assets/pages/ScamDatabase.jsx";
import EmergencyHelp from "./assets/pages/EmergencyHelp.jsx";
import Learn from "./assets/pages/Learn.jsx";
import Founder from "./assets/pages/Founder.jsx";
import Pricing from "./assets/pages/Pricing.jsx";
import Login from "./assets/pages/Login.jsx";
import Signup from "./assets/pages/Signup.jsx";
import AdminDashboard from "./assets/pages/AdminDashboard.jsx";
import UserDashboard from "./assets/pages/UserDashboard.jsx";
import Checkout from "./assets/pages/Checkout.jsx";
import Privacy from "./assets/pages/Privacy.jsx";
import Terms from "./assets/pages/Terms.jsx";
import Contact from "./assets/pages/Contact.jsx";
import About from "./assets/pages/About.jsx";
import FeaturesPage from "./assets/pages/FeaturesPage.jsx";
import NotFound from "./assets/pages/NotFound.jsx";
import Welcome from "./assets/pages/Welcome.jsx";

function App() {
  return (
    <HelmetProvider>
    <ToastProvider>
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Secuvion />} />
          <Route path="/home" element={<Home />} />
          <Route path="/threat-map" element={<ThreatMap />} />
          <Route path="/fraud-analyzer" element={<FraudAnalyzer />} />
          <Route path="/security-score" element={<SecurityScore />} />
          <Route path="/protection" element={<Protection />} />
          <Route path="/scam-database" element={<ScamDatabase />} />
          <Route path="/emergency-help" element={<EmergencyHelp />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/founder" element={<Founder />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesPage />} />

          {/* Welcome page after signup/login */}
          <Route path="/welcome" element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          } />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Protected - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected - User */}
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Protected - Checkout */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
