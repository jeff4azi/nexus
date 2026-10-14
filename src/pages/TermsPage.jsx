import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using the Nexus Yield Group platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, do not use this platform.",
  },
  {
    title: "Eligibility",
    body: "You must be at least 18 years of age to open an account. By registering, you represent that all information you provide is accurate and complete. We reserve the right to refuse service or close accounts that do not meet our eligibility requirements.",
  },
  {
    title: "Account Responsibilities",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use. We are not liable for losses caused by your failure to secure your account.",
  },
  {
    title: "Investment Risk",
    body: "All investments carry risk. The value of your investments may go down as well as up, and you may receive back less than you invest. Past performance is not indicative of future results. You should not invest money you cannot afford to lose.",
  },
  {
    title: "Deposits and Withdrawals",
    body: "Deposits are subject to review and approval. Withdrawals are processed within 1–3 business days after admin approval. We reserve the right to place a hold on funds pending identity verification or investigation of suspicious activity.",
  },
  {
    title: "Fees",
    body: "Current fee schedules are published on the platform. We reserve the right to amend fees with reasonable notice. Continued use of the platform after a fee change constitutes acceptance of the new schedule.",
  },
  {
    title: "Prohibited Conduct",
    body: "You may not use the platform for money laundering, fraud, or any unlawful purpose. You may not attempt to gain unauthorised access to any part of our systems. Violation of these prohibitions may result in immediate account termination and referral to law enforcement.",
  },
  {
    title: "Termination",
    body: "We may suspend or terminate your account at any time for breach of these terms, suspicious activity, or at our sole discretion with reasonable notice. Upon termination, any outstanding balances will be returned to you subject to applicable legal holds.",
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Nexus Yield Group shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount held in your account at the time of the claim.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by and construed in accordance with applicable financial services laws. Any disputes shall be resolved through binding arbitration, except where prohibited by law.",
  },
  {
    title: "Contact",
    body: "For questions about these Terms, contact us at legal@nexusyield.org.",
  },
];

export default function TermsPage() {
  return (
    <div
      style={{
        background: "#0A0E1A",
        minHeight: "100vh",
        color: "#D6DEE8",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <Navbar />
      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#C9A84C",
            marginBottom: 14,
          }}
        >
          LEGAL
        </p>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 12px",
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#D6DEE8",
            opacity: 0.5,
            marginBottom: 56,
          }}
        >
          Last updated: January 2026
        </p>
        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              {s.title}
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "#D6DEE8",
                opacity: 0.75,
                margin: 0,
              }}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
