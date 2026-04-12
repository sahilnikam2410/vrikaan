import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };

export default function ShippingPolicy() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Shipping Policy" description="SECUVION shipping and delivery policy for digital services." path="/shipping-policy" />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Legal</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Shipping Policy</h1>
        <p style={{ color: T.mutedDark, fontSize: 14, marginBottom: 48 }}>Last updated: April 12, 2026</p>

        {[
          { title: "1. Digital Delivery", content: "SECUVION is a fully digital cybersecurity platform. All our products, services, and subscriptions are delivered electronically via our website. There are no physical products involved, and therefore no physical shipping is required." },
          { title: "2. Instant Access", content: "Upon successful payment and subscription activation, you will receive instant access to all features included in your chosen plan. There is no waiting period or delivery time. Your account will be upgraded immediately after payment confirmation." },
          { title: "3. Account Activation", content: "After completing your purchase, your account will be automatically upgraded to the selected plan. You can access all premium features by logging into your account at secuvion.vercel.app. A confirmation email will be sent to your registered email address." },
          { title: "4. Service Availability", content: "Our digital services are available 24 hours a day, 7 days a week, 365 days a year. We strive to maintain 99.9% uptime. In case of scheduled maintenance, users will be notified in advance via email." },
          { title: "5. Subscription Plans", content: "We offer multiple subscription tiers: Recon (Free), Sentinel, Fortress, and Citadel. Each plan provides different levels of access to our cybersecurity tools and features. Plan details and pricing are available on our Pricing page." },
          { title: "6. No Physical Shipping", content: "Since SECUVION is a Software-as-a-Service (SaaS) platform, we do not ship any physical goods. All tools, reports, and features are accessible through your web browser after login. No downloads or installations are required." },
          { title: "7. International Access", content: "Our services are accessible globally. Regardless of your location, you can access SECUVION's tools and features through any modern web browser with an internet connection. There are no geographical restrictions on our digital services." },
          { title: "8. Contact Us", content: "If you have any questions about our delivery process or face any issues accessing your subscription, please contact us at secuvion@gmail.com or call +91 8329935878. Our support team is available 24/7." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</h2>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
