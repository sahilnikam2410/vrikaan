import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };

export default function Privacy() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Privacy Policy"
        description="VRIKAAN Privacy Policy. Learn how we collect, use, and protect your personal data. GDPR-compliant. AES-256 encryption. No data sold to third parties."
        path="/privacy"
      />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Legal</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Privacy Policy</h1>
        <p style={{ color: T.mutedDark, fontSize: 14, marginBottom: 48 }}>Last updated: March 26, 2026</p>

        {[
          { title: "1. Information We Collect", content: "We collect information you provide directly to us, including your name, email address, and account credentials when you create an account. We also collect usage data such as device information, IP addresses, browser type, and interaction patterns with our platform to improve our services and detect threats more effectively." },
          { title: "2. How We Use Your Information", content: "Your information is used to provide and improve our cybersecurity services, including threat detection, fraud analysis, and security scoring. We use anonymized and aggregated data to train our AI models and enhance threat detection accuracy. We never sell your personal data to third parties." },
          { title: "3. Data Security", content: "We implement industry-leading security measures to protect your data, including AES-256 encryption at rest, TLS 1.3 for data in transit, and zero-knowledge architecture where applicable. Our infrastructure undergoes regular third-party security audits and penetration testing." },
          { title: "4. Data Retention", content: "We retain your personal information for as long as your account is active or as needed to provide services. Threat detection logs are retained for 90 days for security analysis purposes. You may request deletion of your data at any time through your account settings or by contacting our support team." },
          { title: "5. Cookies & Tracking", content: "We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how users interact with our platform. You can manage cookie preferences through your browser settings. We do not use cookies for advertising purposes." },
          { title: "6. Third-Party Services", content: "We may share limited data with trusted service providers who assist in operating our platform (hosting, analytics, payment processing). All third-party providers are contractually obligated to maintain the confidentiality and security of your data." },
          { title: "7. Your Rights", content: "You have the right to access, correct, or delete your personal data. You may also request data portability or restrict processing of your information. For users in the EU/EEA, we comply fully with GDPR requirements. To exercise these rights, contact hello@vrikaan.com." },
          { title: "8. Children's Privacy", content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can take appropriate action." },
          { title: "9. Changes to This Policy", content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through a prominent notice on our platform. Your continued use of Vrikaan after changes are posted constitutes acceptance of the updated policy." },
          { title: "10. Contact Us", content: "If you have questions about this Privacy Policy or our data practices, contact us at hello@vrikaan.com or write to: VRIKAAN, Nashik, Maharashtra, India." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, color: T.white, margin: "0 0 12px" }}>{s.title}</h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8, margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
