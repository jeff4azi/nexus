import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Anti-Money Laundering (AML)",
    body: "Nexus Yield Group maintains a comprehensive Anti-Money Laundering programme in accordance with applicable regulations. We are required to verify the identity of all clients before processing transactions, monitor account activity for suspicious patterns, and report suspicious activity to the relevant authorities where required by law.",
  },
  {
    title: "Know Your Customer (KYC)",
    body: "As part of our regulatory obligations, we require all clients to complete identity verification. This involves providing government-issued photo identification and proof of address. Accounts that do not complete KYC verification within the required timeframe may be restricted.",
  },
  {
    title: "Sanctions Screening",
    body: "We screen all clients and transactions against applicable sanctions lists, including those maintained by OFAC, the EU, and the UN. We are prohibited from providing services to individuals or entities on these lists.",
  },
  {
    title: "Data Protection",
    body: "Our compliance programme includes policies and procedures to ensure that personal data is collected, stored, and processed in accordance with applicable data protection laws. Please refer to our Privacy Policy for full details.",
  },
  {
    title: "Reporting Obligations",
    body: "We are required by law to report certain transactions and suspicious activity to financial intelligence units and regulatory bodies. This reporting is performed without client notification where required by law.",
  },
  {
    title: "Complaint Handling",
    body: "We are committed to resolving client complaints fairly and promptly. If you have a complaint, please contact us at compliance@nexusyield.org. We aim to acknowledge all complaints within 2 business days and resolve them within 14 business days.",
  },
  {
    title: "Contact",
    body: "For compliance-related enquiries, contact our compliance team at compliance@nexusyield.org.",
  },
];

export default function CompliancePage() {
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
          Compliance
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
