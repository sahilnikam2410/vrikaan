import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", white: "#f1f5f9", muted: "#94a3b8", mutedDark: "#64748b", accent: "#6366f1", cyan: "#14e3c5", border: "rgba(148,163,184,0.08)" };

export default function RefundPolicy() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.white, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Cancellation & Refund Policy" description="VRIKAAN cancellation and refund policy for subscriptions." path="/refund-policy" />
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{ color: T.mutedDark, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>&larr; Back to Home</Link>
        </div>

        <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, background: `${T.accent}0c`, border: `1px solid ${T.accent}20`, fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 16, letterSpacing: 0.5 }}>Legal</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Cancellation & Refund Policy</h1>
        <p style={{ color: T.mutedDark, fontSize: 14, marginBottom: 48 }}>Last updated: April 12, 2026</p>

        {[
          { title: "1. Cancellation Policy", content: "You may cancel your subscription at any time from your account dashboard. Upon cancellation, you will continue to have access to your current plan's features until the end of your current billing period. No further charges will be applied after cancellation." },
          { title: "2. Refund Eligibility", content: "We offer a full refund if you request it within 7 days of your initial purchase. After the 7-day period, refunds will be considered on a case-by-case basis. To request a refund, please contact our support team at secuvion@gmail.com with your transaction details." },
          { title: "3. How to Request a Refund", content: "To initiate a refund, send an email to secuvion@gmail.com with the subject line 'Refund Request' and include: (1) Your registered email address, (2) Transaction ID or payment receipt, (3) Reason for the refund request. Our team will review and respond within 2-3 business days." },
          { title: "4. Refund Processing", content: "Approved refunds will be processed within 5-7 business days. The refund will be credited back to the original payment method used during the purchase. Please note that bank processing times may vary and it could take an additional 3-5 business days for the amount to reflect in your account." },
          { title: "5. Non-Refundable Cases", content: "Refunds will not be provided in the following cases: (a) Requests made after 7 days from the purchase date without valid justification, (b) Violation of our Terms of Service, (c) Misuse of the platform or its tools, (d) If the user has consumed a significant portion of the service during the subscription period." },
          { title: "6. Plan Downgrades", content: "You can downgrade your plan at any time from your account settings. When you downgrade, the change will take effect at the start of your next billing cycle. You will retain access to your current plan's features until then. No partial refunds are issued for downgrades." },
          { title: "7. Free Plan", content: "The Recon (Free) plan does not involve any payment and therefore no refund policy applies. You can upgrade from or return to the free plan at any time without any financial obligation." },
          { title: "8. Service Interruptions", content: "In the unlikely event of extended service outages (exceeding 24 consecutive hours) that are within our control, we will provide proportional credit to affected subscribers. This does not apply to scheduled maintenance periods that are communicated in advance." },
          { title: "9. Changes to This Policy", content: "We reserve the right to modify this Cancellation and Refund Policy at any time. Changes will be effective immediately upon posting on our website. We will notify active subscribers of any material changes via email." },
          { title: "10. Contact Us", content: "For any questions regarding cancellations or refunds, please reach out to us at secuvion@gmail.com or call +91 8329935878. Our support team is available 24/7 to assist you." },
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
