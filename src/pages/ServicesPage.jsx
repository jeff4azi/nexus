import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 },
  }),
};

const services = [
  {
    icon: "◈",
    eyebrow: "PORTFOLIO MANAGEMENT",
    title: "Bespoke multi-asset portfolios",
    desc: "We construct and manage diversified portfolios tailored to your risk profile, time horizon, and return objectives. Our investment committee continuously monitors allocations across equities, fixed income, and alternative assets to capture opportunity and protect capital across market cycles.",
    features: [
      "Personalised risk profiling",
      "Active rebalancing and monitoring",
      "Transparent performance reporting",
      "Dedicated relationship manager",
    ],
  },
  {
    icon: "◆",
    eyebrow: "FIXED INCOME YIELD",
    title: "Consistent income with capital preservation",
    desc: "Our fixed income strategies are designed to deliver reliable, predictable returns. We source high-quality credit instruments and structure investments with defined durations and yields — giving you income certainty without sacrificing capital safety.",
    features: [
      "Defined yield and duration",
      "Institutional-grade credit analysis",
      "Multiple payout structures",
      "Regular return credits to your account",
    ],
  },
  {
    icon: "⬡",
    eyebrow: "ALTERNATIVE INVESTMENTS",
    title: "Diversification beyond public markets",
    desc: "Access investment opportunities typically reserved for institutional investors — private equity, structured credit, and real asset strategies. These allocations provide low correlation to public markets, helping reduce overall portfolio volatility while improving risk-adjusted returns.",
    features: [
      "Access to private market opportunities",
      "Low correlation to public equities",
      "Structured risk management",
      "Minimum investment tiers available",
    ],
  },
  {
    icon: "◇",
    eyebrow: "WEALTH ADVISORY",
    title: "Holistic planning for long-term prosperity",
    desc: "Our wealth advisors work with you to create a comprehensive financial plan that integrates investment strategy, tax efficiency, estate planning, and generational wealth transfer. We take a long-term view, ensuring your wealth works as hard as you do.",
    features: [
      "Comprehensive financial planning",
      "Tax-efficient structuring",
      "Estate and succession planning",
      "Ongoing advisory relationship",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div
      style={{
        background: "#0A0E1A",
        minHeight: "100vh",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "160px 24px 80px", textAlign: "center" }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#C9A84C",
              marginBottom: 16,
            }}
          >
            WHAT WE OFFER
          </p>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              margin: "0 auto 20px",
              maxWidth: 760,
              lineHeight: 1.1,
            }}
          >
            Institutional-grade services for every investor
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#D6DEE8",
              opacity: 0.65,
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            From fixed income yield to full portfolio management, our suite of
            services is built to grow and preserve wealth across market cycles.
          </p>
        </motion.div>
      </section>

      {/* Services — alternating layout */}
      <section style={{ padding: "0 24px 120px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 80,
          }}
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 64,
                alignItems: "center",
                direction: i % 2 === 1 ? "rtl" : "ltr",
              }}
              className="services-row"
            >
              {/* Text */}
              <div style={{ direction: "ltr" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: "#C9A84C",
                    marginBottom: 12,
                  }}
                >
                  {s.eyebrow}
                </p>
                <h2
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "clamp(28px, 3.5vw, 44px)",
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 20px",
                    lineHeight: 1.15,
                  }}
                >
                  {s.title}
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "#D6DEE8",
                    opacity: 0.7,
                    lineHeight: 1.8,
                    marginBottom: 28,
                  }}
                >
                  {s.desc}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {s.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14,
                        color: "#D6DEE8",
                        opacity: 0.8,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#C9A84C",
                          flexShrink: 0,
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                    color: "#0A0E1A",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "12px 28px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Get Started
                </Link>
              </div>

              {/* Visual card */}
              <div
                style={{
                  direction: "ltr",
                  background:
                    "linear-gradient(145deg, rgba(201,168,76,0.08), rgba(232,184,75,0.02))",
                  border: "1px solid rgba(201,168,76,0.18)",
                  borderRadius: 24,
                  padding: "56px 48px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: 280,
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    color: "#C9A84C",
                    marginBottom: 20,
                    lineHeight: 1,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#fff",
                    lineHeight: 1.3,
                  }}
                >
                  {s.eyebrow
                    .split(" ")
                    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                    .join(" ")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(232,184,75,0.02))",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 16px",
            }}
          >
            Ready to put your capital to work?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#D6DEE8",
              opacity: 0.6,
              marginBottom: 32,
            }}
          >
            Open an account today and explore our investment plans.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/register"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                color: "#0A0E1A",
                fontWeight: 700,
                fontSize: 15,
                padding: "15px 40px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Open an Account
            </Link>
            <Link
              to="/plans"
              style={{
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#C9A84C",
                fontWeight: 600,
                fontSize: 15,
                padding: "15px 40px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              View Investment Plans
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .services-row { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>
    </div>
  );
}
