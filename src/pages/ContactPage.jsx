import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const contactInfo = [
  { icon: Mail, label: "Email Us", value: "support@nexusyieldgroup.com" },
  { icon: Phone, label: "Call Us", value: "+1 (800) 123-4567" },
  {
    icon: MapPin,
    label: "Head Office",
    value: "1 Financial Plaza, New York, NY 10005",
  },
  { icon: Clock, label: "Support Hours", value: "24/7 — Always Available" },
];

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#D6DEE8",
          opacity: 0.8,
          letterSpacing: 0.5,
        }}
      >
        {label}
        {required && <span style={{ color: "#C9A84C" }}> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 8,
          padding: "14px 16px",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
          color: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
      />
    </div>
  );
}

function Textarea({ label, placeholder, value, onChange, rows = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#D6DEE8",
          opacity: 0.8,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 8,
          padding: "14px 16px",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
          color: "#fff",
          outline: "none",
          resize: "vertical",
          transition: "border-color 0.2s",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
      />
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "60px 32px" }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Send size={24} color="#0A0E1A" />
        </div>
        <h3
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Message Sent
        </h3>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            color: "#D6DEE8",
            opacity: 0.75,
          }}
        >
          We'll get back to you within 24 hours.
        </p>
      </motion.div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Input
          label="Full Name"
          placeholder="John Smith"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>
      <Input
        label="Subject"
        placeholder="How can we help?"
        value={form.subject}
        onChange={set("subject")}
      />
      <Textarea
        label="Message"
        placeholder="Tell us more about your enquiry..."
        value={form.message}
        onChange={set("message")}
      />
      <button
        type="submit"
        style={{
          background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
          color: "#0A0E1A",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          padding: "16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Send size={16} /> Send Message
      </button>
    </form>
  );
}

function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    topic: "",
  });
  const [booked, setBooked] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setBooked(true);
  };

  if (booked)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "60px 32px" }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Calendar size={24} color="#0A0E1A" />
        </div>
        <h3
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Consultation Booked
        </h3>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15,
            color: "#D6DEE8",
            opacity: 0.75,
          }}
        >
          A confirmation has been sent to {form.email}. We look forward to
          speaking with you.
        </p>
      </motion.div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Input
          label="Full Name"
          placeholder="John Smith"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={set("phone")}
        />
        <Input
          label="Preferred Date"
          type="date"
          value={form.date}
          onChange={set("date")}
          required
        />
      </div>

      {/* Time slot picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#D6DEE8",
            opacity: 0.8,
            letterSpacing: 0.5,
          }}
        >
          Preferred Time <span style={{ color: "#C9A84C" }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {timeSlots.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, time: t }))}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  form.time === t
                    ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                    : "rgba(255,255,255,0.04)",
                color: form.time === t ? "#0A0E1A" : "#D6DEE8",
                border:
                  form.time === t ? "none" : "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#D6DEE8",
            opacity: 0.8,
            letterSpacing: 0.5,
          }}
        >
          Consultation Topic
        </label>
        <select
          value={form.topic}
          onChange={set("topic")}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 8,
            padding: "14px 16px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: form.topic ? "#fff" : "rgba(255,255,255,0.4)",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          <option value="" disabled style={{ background: "#0F1422" }}>
            Select a topic
          </option>
          {[
            "Portfolio Management",
            "Fixed Income Yield",
            "Alternative Investments",
            "Wealth Advisory",
            "Investment Plans",
            "General Enquiry",
          ].map((o) => (
            <option key={o} value={o} style={{ background: "#0F1422" }}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        style={{
          background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
          color: "#0A0E1A",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          padding: "16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Calendar size={16} /> Book Consultation
      </button>
    </form>
  );
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState("contact");

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
            GET IN TOUCH
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
            Let's Talk About
            <br />
            Your Future
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
            Whether you have a question or are ready to start investing, our
            team is here to guide you every step of the way.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact info cards */}
      <section
        style={{ padding: "80px 24px 0", maxWidth: 1100, margin: "0 auto" }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {contactInfo.map((c, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(201,168,76,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <c.icon size={20} color="#C9A84C" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: "#C9A84C",
                    marginBottom: 6,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 14,
                    color: "#D6DEE8",
                    opacity: 0.85,
                    lineHeight: 1.5,
                  }}
                >
                  {c.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Forms */}
      <section
        style={{ padding: "80px 24px 120px", maxWidth: 800, margin: "0 auto" }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 40,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 12,
            padding: 6,
          }}
        >
          {[
            { id: "contact", label: "Send a Message", icon: Send },
            { id: "booking", label: "Book a Consultation", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                padding: "14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s",
                background:
                  activeTab === tab.id
                    ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                    : "transparent",
                color: activeTab === tab.id ? "#0A0E1A" : "#D6DEE8",
              }}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 20,
            padding: "48px 40px",
          }}
        >
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            {activeTab === "contact"
              ? "Send Us a Message"
              : "Book a Free Consultation"}
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              color: "#D6DEE8",
              opacity: 0.65,
              marginBottom: 32,
            }}
          >
            {activeTab === "contact"
              ? "Fill in the form below and we'll respond within 24 hours."
              : "Schedule a 30-minute call with one of our investment advisors — completely free."}
          </p>
          {activeTab === "contact" ? <ContactForm /> : <BookingForm />}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
