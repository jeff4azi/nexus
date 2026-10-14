import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Investment Risk Disclosure",
    body: "All investment products offered through Nexus Yield Group carry financial risk. The value of your investment and the income derived from it can fall as well as rise. You may not get back the amount you originally invested. Returns quoted are indicative and are not guaranteed.",
  },
  {
    title: "No Financial Advice",
    body: "The information provided on this platform is for informational purposes only and does not constitute financial, investment, legal, or tax advice. You should consult a qualified professional before making any investment decisions.",
  },
  {
    title: "Performance Figures",
    body: "Any historical performance figures shown are for illustrative purposes only and are not a guarantee of future performance. Performance figures may be gross of fees; actual returns to investors will be reduced by applicable charges.",
  },
  {
    title: "Conflicts of Interest",
    body: "Nexus Yield Group may receive compensation from investment products or services featured on the platform. We maintain policies to identify and manage conflicts of interest. Where a conflict cannot be avoided, we will disclose it to you.",
  },
  {
    title: "Regulatory Status",
    body: "Nexus Yield Group operates under applicable financial services regulations. Our registration details and regulatory status are available on request. Users are responsible for ensuring that use of this platform complies with the laws of their jurisdiction.",
  },
  {
    title: "Third-Party Links",
    body: "Our platform may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of those sites and do not endorse them. Access to third-party sites is at your own risk.",
  },
];

export default function DisclosuresPage() {
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
          Disclosures
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
