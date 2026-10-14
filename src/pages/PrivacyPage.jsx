import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const section = (title, body) => ({ title, body });

const sections = [
  section(
    "Information We Collect",
    "We collect information you provide directly — such as your name, email address, date of birth, phone number, and residential address — when you register for an account or update your profile. We also collect financial information necessary to process deposits and withdrawals, and technical data such as IP address, browser type, and pages visited to operate and improve our services.",
  ),
  section(
    "How We Use Your Information",
    "Your information is used to create and manage your account, process transactions, verify your identity in accordance with applicable anti-money laundering regulations, send you notifications about your account activity, and improve our platform. We do not sell your personal information to third parties.",
  ),
  section(
    "Data Sharing",
    "We may share your information with trusted service providers who assist us in operating the platform (such as payment processors and identity verification services), and with regulatory authorities where required by law. All third-party providers are contractually obligated to protect your data.",
  ),
  section(
    "Data Retention",
    "We retain your personal information for as long as your account is active and for a minimum of five years thereafter, in compliance with financial services regulations. You may request deletion of your account at any time, subject to applicable legal retention requirements.",
  ),
  section(
    "Your Rights",
    "You have the right to access, correct, or delete the personal information we hold about you. You may also request that we restrict or stop processing your data in certain circumstances. To exercise any of these rights, please contact our support team.",
  ),
  section(
    "Security",
    "We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
  ),
  section(
    "Cookies",
    "We use essential cookies to operate our platform. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, though this may affect platform functionality.",
  ),
  section(
    "Changes to This Policy",
    "We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-platform notification. Continued use of our services after changes take effect constitutes your acceptance of the updated policy.",
  ),
  section(
    "Contact",
    "If you have questions about this Privacy Policy or your personal data, contact us at privacy@nexusyield.org.",
  ),
];

export default function PrivacyPage() {
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
          Privacy Policy
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
