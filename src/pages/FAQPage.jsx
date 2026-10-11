import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const categories = [
  {
    label: "Getting Started",
    faqs: [
      {
        q: "How do I open an account with Nexus Yield Group?",
        a: 'Opening an account is straightforward. Click "Get Started" on our homepage, complete the registration form, verify your identity, and fund your account. The entire process typically takes under 10 minutes.',
      },
      {
        q: "What is the minimum investment amount?",
        a: "Our entry-level Starter Plan begins at $100, making professional investment management accessible to everyone. Higher-tier plans start from $500 and scale up to unlimited for our Platinum VIP clients.",
      },
      {
        q: "Is my investment secure?",
        a: "Yes. We employ bank-grade encryption, multi-factor authentication, and segregated client accounts. Your funds are held separately from company operating capital at all times.",
      },
    ],
  },
  {
    label: "Plans & Returns",
    faqs: [
      {
        q: "How are returns calculated?",
        a: "Returns are calculated as a percentage of your invested principal and credited to your account at the end of each plan cycle. For example, a 5.90% return on a $100 investment yields $5.90 profit after 24 hours.",
      },
      {
        q: "Can I invest in multiple plans simultaneously?",
        a: "Absolutely. Many of our clients diversify across multiple plans to balance yield and duration. Each plan operates independently with its own cycle and return rate.",
      },
      {
        q: "What happens when my plan expires?",
        a: "At the end of your plan duration, your principal plus returns are credited to your account balance. You can then reinvest, withdraw, or upgrade to a higher-tier plan.",
      },
      {
        q: "Are returns guaranteed?",
        a: "Our published return rates reflect our historical performance targets. While past performance is not a guarantee of future results, our risk management framework is designed to deliver consistent, stable yields.",
      },
    ],
  },
  {
    label: "Withdrawals & Payments",
    faqs: [
      {
        q: "How quickly can I withdraw my funds?",
        a: "All plans feature instant withdrawals. Once your plan cycle completes and returns are credited, you can withdraw to your linked payment method immediately — 24 hours a day, 7 days a week.",
      },
      {
        q: "What payment methods are supported?",
        a: "We support bank wire transfers, major cryptocurrencies (BTC, ETH, USDT), and select e-wallet providers. Payment options may vary by region.",
      },
      {
        q: "Are there any withdrawal fees?",
        a: "Nexus Yield Group does not charge withdrawal fees. Standard network or banking fees may apply depending on your chosen payment method.",
      },
    ],
  },
  {
    label: "Account & Security",
    faqs: [
      {
        q: "How do I reset my password?",
        a: 'Click "Forgot Password" on the login page and enter your registered email address. You will receive a secure reset link within minutes. For additional security, we recommend enabling two-factor authentication.',
      },
      {
        q: "Can I change my investment plan after funding?",
        a: "Active plans cannot be modified mid-cycle. However, you can select a different plan for your next investment cycle or open a new plan alongside your existing one.",
      },
      {
        q: "What happens if I need support outside business hours?",
        a: "Our support team is available 24/7 via live chat and email. Platinum VIP clients also have access to a dedicated account manager with a direct phone line.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      style={{
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 12,
        overflow: "hidden",
        background: open ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
        transition: "background 0.3s",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 28px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            lineHeight: 1.5,
          }}
        >
          {q}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            background: open
              ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
              : "rgba(201,168,76,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s",
          }}
        >
          {open ? (
            <Minus size={14} color="#0A0E1A" />
          ) : (
            <Plus size={14} color="#C9A84C" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#D6DEE8",
                opacity: 0.8,
                lineHeight: 1.85,
                padding: "0 28px 24px",
                margin: 0,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);

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
          style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}
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
            SUPPORT
          </motion.p>
          <motion.h1
            variants={fadeUp}
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(44px, 6vw, 76px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-1px",
              marginBottom: 24,
            }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 17,
              color: "#D6DEE8",
              opacity: 0.75,
              lineHeight: 1.8,
            }}
          >
            Everything you need to know about investing with Nexus Yield Group.
            Can't find your answer? Our team is available 24/7.
          </motion.p>
        </motion.div>
      </section>

      {/* FAQ Content */}
      <section
        style={{ padding: "80px 24px 120px", maxWidth: 860, margin: "0 auto" }}
      >
        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 48,
            justifyContent: "center",
          }}
        >
          {categories.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 100,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  activeCategory === i
                    ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                    : "rgba(255,255,255,0.04)",
                color: activeCategory === i ? "#0A0E1A" : "#D6DEE8",
                border:
                  activeCategory === i
                    ? "none"
                    : "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {categories[activeCategory].faqs.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: 64,
            textAlign: "center",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 20,
            padding: "48px 32px",
          }}
        >
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Still have questions?
          </h3>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              color: "#D6DEE8",
              opacity: 0.75,
              marginBottom: 28,
            }}
          >
            Our team is available around the clock to help you.
          </p>
          <a
            href="/contact"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              color: "#0A0E1A",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              padding: "14px 36px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Contact Support
          </a>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
