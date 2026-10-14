import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Plans from "../components/Plans";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function PlansPublicPage() {
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
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 0,
          textAlign: "center",
          padding: "160px 24px 0",
        }}
      >
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
            INVESTMENT PLANS
          </p>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              margin: "0 auto 20px",
              maxWidth: 720,
              lineHeight: 1.1,
            }}
          >
            Grow your wealth on your terms
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 17,
              color: "#D6DEE8",
              opacity: 0.65,
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Choose a plan that matches your financial goals. All plans are
            backed by institutional-grade infrastructure and include instant
            withdrawals and 24/7 support.
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
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 36px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Open an Account
            </Link>
            <Link
              to="/login"
              style={{
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#C9A84C",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 36px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")
              }
            >
              Sign In to Invest
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Plans grid — reuses the same component as the landing page */}
      <Plans />

      {/* Bottom CTA */}
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(232,184,75,0.02))",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          borderBottom: "1px solid rgba(201,168,76,0.12)",
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
            Ready to start investing?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#D6DEE8",
              opacity: 0.6,
              marginBottom: 32,
            }}
          >
            Create your account in minutes. No minimums to get started.
          </p>
          <Link
            to="/register"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              color: "#0A0E1A",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "15px 48px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Get Started Today
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
