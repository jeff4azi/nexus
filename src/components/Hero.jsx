import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { value: "$2.4B", label: "Assets Managed" },
  { value: "98%", label: "Client Retention" },
  { value: "15+", label: "Years of Excellence" },
];

const floatVariants = {
  animate: {
    y: [0, -18, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

const floatVariants2 = {
  animate: {
    y: [0, 14, 0],
    x: [0, 8, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function Hero() {
  return (
    <section
      id="about"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "120px 2rem 80px",
        background:
          "radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.07) 0%, transparent 60%), #0A0E1A",
      }}
    >
      {/* Floating geometric shapes */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{
          position: "absolute",
          top: "15%",
          right: "8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.12)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={floatVariants2}
        animate="animate"
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.08)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: 180,
          height: 180,
          border: "1px solid rgba(201,168,76,0.1)",
          transform: "rotate(45deg)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={floatVariants2}
        animate="animate"
        style={{
          position: "absolute",
          top: "40%",
          left: "3%",
          width: 80,
          height: 80,
          border: "1px solid rgba(201,168,76,0.15)",
          transform: "rotate(45deg)",
          pointerEvents: "none",
        }}
      />

      {/* Mesh gradient blob */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            color: "#C9A84C",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Strategic Investment Solutions
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="font-display"
          style={{
            fontSize: "clamp(52px, 8vw, 88px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 1.5rem",
            color: "#fff",
          }}
        >
          Yield More.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Risk Less.
          </span>{" "}
          Grow Faster.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "#D6DEE8",
            lineHeight: 1.7,
            maxWidth: 620,
            margin: "0 auto 2.5rem",
            opacity: 0.85,
          }}
        >
          Nexus Yield Group delivers institutional-grade investment strategies
          tailored for discerning investors — combining precision analytics with
          decades of market expertise.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/register"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              color: "#0A0E1A",
              padding: "0.85rem 2.2rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 24px rgba(201,168,76,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(201,168,76,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 24px rgba(201,168,76,0.25)";
            }}
          >
            Start Investing
          </Link>
          <a
            href="#services"
            style={{
              border: "1px solid rgba(201,168,76,0.5)",
              color: "#C9A84C",
              padding: "0.85rem 2.2rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,168,76,0.08)";
              e.currentTarget.style.borderColor = "#C9A84C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
            }}
          >
            Explore Services
          </a>
        </motion.div>
      </div>

      {/* Stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.7 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "5rem",
          display: "flex",
          gap: "0",
          background: "rgba(15,20,34,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: "1.5rem 3rem",
              textAlign: "center",
              borderRight:
                i < stats.length - 1
                  ? "1px solid rgba(201,168,76,0.12)"
                  : "none",
            }}
          >
            <div
              className="font-display"
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.2,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "#D6DEE8",
                opacity: 0.7,
                marginTop: "0.3rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
