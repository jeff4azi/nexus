import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "STARTER",
    range: "$100 – $499",
    roi: "5.90%",
    after: "24 Hours",
    duration: "1 Day",
    badge: null,
  },
  {
    name: "ELITE",
    range: "$500 – $999",
    roi: "8.90%",
    after: "24 Hours",
    duration: "1 Day",
    badge: null,
  },
  {
    name: "DELUXE",
    range: "$1,000 – $1,999",
    roi: "11.50%",
    after: "32 Hours",
    duration: "32h",
    badge: null,
  },
  {
    name: "SUPERIOR",
    range: "$2,000 – $4,999",
    roi: "15%",
    after: "48 Hours",
    duration: "48h",
    badge: "Popular",
  },
  {
    name: "ULTIMATE",
    range: "$5,000 – $8,999",
    roi: "18.50%",
    after: "48 Hours",
    duration: "48h",
    badge: null,
  },
  {
    name: "PLATINUM VIP",
    range: "$9,000 – Unlimited",
    roi: "10%",
    after: "24 Hours",
    duration: "1 Day",
    badge: "VIP",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Plans() {
  return (
    <section
      id="plans"
      style={{ background: "#0A0E1A", padding: "120px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#C9A84C",
              marginBottom: 14,
            }}
          >
            INVESTMENT PLANS
          </p>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              margin: "0 0 16px",
            }}
          >
            Choose Your Plan
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 16,
              color: "#D6DEE8",
              opacity: 0.7,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Flexible tiers for every investor. All plans include instant
            withdrawals and 24/7 live support.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {plans.map((plan) => {
            const highlight = plan.badge === "VIP" || plan.badge === "Popular";
            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  boxShadow: highlight
                    ? "0 24px 80px rgba(201,168,76,0.28)"
                    : "0 16px 50px rgba(201,168,76,0.1)",
                }}
                style={{
                  position: "relative",
                  background: highlight
                    ? "linear-gradient(145deg, rgba(201,168,76,0.1), rgba(232,184,75,0.04))"
                    : "rgba(255,255,255,0.03)",
                  border: highlight
                    ? "1px solid rgba(201,168,76,0.5)"
                    : "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 20,
                  padding: "40px 32px",
                  backdropFilter: "blur(12px)",
                  transition: "border-color 0.3s",
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                      color: "#0A0E1A",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 2,
                      padding: "5px 18px",
                      borderRadius: 100,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {plan.badge.toUpperCase()}
                  </div>
                )}

                {/* Plan name */}
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: "#C9A84C",
                    marginBottom: 8,
                  }}
                >
                  {plan.name} PLAN
                </p>

                {/* Range */}
                <p
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 0,
                  }}
                >
                  {plan.range}
                </p>

                {/* ROI block */}
                <div
                  style={{
                    margin: "24px 0",
                    padding: "20px",
                    background: "rgba(201,168,76,0.07)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 54,
                      fontWeight: 700,
                      color: "#C9A84C",
                      lineHeight: 1,
                    }}
                  >
                    {plan.roi}
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 13,
                      color: "#D6DEE8",
                      opacity: 0.65,
                      marginTop: 6,
                    }}
                  >
                    After {plan.after}
                  </div>
                </div>

                {/* Features */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 32,
                  }}
                >
                  {[
                    "Instant Withdrawals",
                    "24/7 Live Support",
                    `${plan.duration} Plan Duration`,
                  ].map((feat) => (
                    <div
                      key={feat}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(201,168,76,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Check size={11} color="#C9A84C" />
                      </div>
                      <span
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: 14,
                          color: "#D6DEE8",
                          opacity: 0.85,
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  style={{
                    width: "100%",
                    background: highlight
                      ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                      : "transparent",
                    color: highlight ? "#0A0E1A" : "#C9A84C",
                    border: highlight
                      ? "none"
                      : "1px solid rgba(201,168,76,0.4)",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    letterSpacing: 0.5,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Invest Now
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
