import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const values = [
  {
    title: "Integrity",
    desc: "We operate with full transparency. Every decision we make is guided by honesty and accountability to our clients.",
  },
  {
    title: "Precision",
    desc: "Our strategies are data-driven and rigorously tested — no guesswork, only calculated, evidence-based investing.",
  },
  {
    title: "Growth",
    desc: "We are relentlessly focused on delivering consistent, compounding returns that build lasting wealth.",
  },
  {
    title: "Partnership",
    desc: "We treat every client as a long-term partner. Your success is the only metric that matters to us.",
  },
];

const team = [
  {
    initials: "JM",
    name: "James Mercer",
    role: "Chief Executive Officer",
    bio: "20+ years in institutional asset management. Former Managing Director at Goldman Sachs.",
  },
  {
    initials: "SR",
    name: "Sophia Reeves",
    role: "Chief Investment Officer",
    bio: "Quantitative finance expert. Built multi-billion dollar portfolios across global markets.",
  },
  {
    initials: "DK",
    name: "Daniel Kwon",
    role: "Head of Risk Management",
    bio: "Former risk analyst at BlackRock. Specialises in downside protection and volatility modelling.",
  },
  {
    initials: "AL",
    name: "Amara Levi",
    role: "Director of Client Relations",
    bio: "Dedicated to delivering white-glove service and ensuring every client achieves their financial goals.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0A0E1A", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(180deg, #0F1422 0%, #0A0E1A 100%)",
          padding: "160px 24px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}
        >
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#C9A84C",
              marginBottom: 16,
            }}
          >
            WHO WE ARE
          </motion.p>
          <motion.h1
            variants={fadeUp}
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(44px, 6vw, 80px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-1px",
              marginBottom: 24,
            }}
          >
            Built on Trust.
            <br />
            Driven by Results.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 17,
              color: "#D6DEE8",
              opacity: 0.75,
              lineHeight: 1.8,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Nexus Yield Group is a premier investment firm dedicated to
            delivering institutional-grade financial strategies to individuals
            and organisations worldwide.
          </motion.p>
        </motion.div>
      </section>

      {/* Story */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 64,
            alignItems: "center",
          }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#C9A84C",
                marginBottom: 16,
              }}
            >
              OUR STORY
            </motion.p>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: 24,
                lineHeight: 1.1,
              }}
            >
              15 Years of Disciplined Investing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 15,
                color: "#D6DEE8",
                opacity: 0.75,
                lineHeight: 1.85,
                marginBottom: 20,
              }}
            >
              Founded in 2009, Nexus Yield Group emerged from a simple
              conviction: that sophisticated investment strategies should not be
              reserved for the ultra-wealthy. We set out to democratise access
              to institutional-quality portfolio management.
            </motion.p>
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 15,
                color: "#D6DEE8",
                opacity: 0.75,
                lineHeight: 1.85,
              }}
            >
              Today, we manage over $2.4 billion in assets across six
              continents, serving thousands of clients who trust us to grow and
              protect their wealth with precision and integrity.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {[
              { value: "$2.4B", label: "Assets Under Management" },
              { value: "98%", label: "Client Retention Rate" },
              { value: "15+", label: "Years of Experience" },
              { value: "6", label: "Continents Served" },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 16,
                  padding: "28px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#C9A84C",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12,
                    color: "#D6DEE8",
                    opacity: 0.65,
                    marginTop: 8,
                    lineHeight: 1.4,
                  }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#0F1422", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#C9A84C",
                marginBottom: 16,
              }}
            >
              WHAT DRIVES US
            </motion.p>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Our Core Values
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 60px rgba(201,168,76,0.1)",
                }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 16,
                  padding: "36px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C9A84C",
                    marginBottom: 12,
                  }}
                >
                  {v.title}
                </div>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 14,
                    color: "#D6DEE8",
                    opacity: 0.75,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#C9A84C",
                marginBottom: 16,
              }}
            >
              THE PEOPLE BEHIND THE RETURNS
            </motion.p>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Leadership Team
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {team.map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 60px rgba(201,168,76,0.1)",
                }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 16,
                  padding: "36px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0A0E1A",
                  }}
                >
                  {m.initials}
                </div>
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12,
                    color: "#C9A84C",
                    letterSpacing: 1,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {m.role}
                </div>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    color: "#D6DEE8",
                    opacity: 0.7,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {m.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
