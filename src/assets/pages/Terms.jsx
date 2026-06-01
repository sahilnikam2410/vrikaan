import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };

export default function Terms() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Terms of Service"
        description="Read the VRIKAAN Terms of Service. Rules governing your use of our AI-powered cybersecurity platform, subscription plans, acceptable use, and legal terms."
        path="/terms"
      />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Legal</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Terms of Service</h1>
        <p style={{ color: T.mutedDark, fontSize: 14, marginBottom: 48 }}>Last updated: March 26, 2026</p>

        {[
          { title: "1. Acceptance of Terms", content: "By accessing or using Vrikaan's platform, website, and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services. These terms apply to all visitors, users, and subscribers." },
          { title: "2. Description of Services", content: "Vrikaan provides AI-powered cybersecurity services including but not limited to: fraud detection, phishing analysis, email breach scanning, device protection, dark web monitoring, and security education resources. Our services are provided on an 'as-is' and 'as-available' basis." },
          { title: "3. User Accounts", content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these terms." },
          { title: "4. Subscription Plans", content: "Vrikaan offers free and paid subscription plans. Paid plans are billed monthly or annually as selected. All payments are processed securely. You may cancel your subscription at any time; access continues until the end of the billing period. Refunds are available within 14 days of initial purchase." },
          { title: "5. Acceptable Use", content: "You agree not to: (a) use the platform for illegal activities, (b) attempt to reverse-engineer our AI systems, (c) submit malicious content to disrupt services, (d) share account access with unauthorized users, (e) use automated tools to scrape or extract data, (f) misrepresent your identity or affiliation." },
          { title: "6. Intellectual Property", content: "All content, features, and functionality of Vrikaan — including software, algorithms, designs, text, and graphics — are owned by Vrikaan and protected by international copyright, trademark, and intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent." },
          { title: "7. Limitation of Liability", content: "Vrikaan shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim. This includes but is not limited to data breaches occurring despite our protection." },
          { title: "8. Disclaimer of Warranties", content: "While we strive for maximum protection, no cybersecurity solution can guarantee 100% security. Vrikaan does not warrant that our services will be uninterrupted, error-free, or capable of preventing all cyber threats. Users should maintain their own security hygiene practices alongside our platform." },
          { title: "9. Modifications to Terms", content: "We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-platform notification at least 30 days before taking effect. Continued use after changes constitutes acceptance. If you disagree with modifications, you should discontinue use." },
          { title: "10. Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law provisions. Any disputes arising under these terms shall be resolved through binding arbitration in Maharashtra, India." },
          { title: "11. Contact", content: "For questions about these Terms of Service, contact us at hello@vrikaan.com or call +91 8329935878." },
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
