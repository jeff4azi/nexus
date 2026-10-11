import { useState } from "react";
import { useReveal } from "../hooks/useReveal";

export default function CTABanner() {
  const { ref, visible } = useReveal();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        padding: "100px 2rem",
        background:
          "linear-gradient(135deg, #0F1422 0%, #0A0E1A 50%, #0F1422 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className={`reveal ${visible ? "visible" : ""}`}
        style={{
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            color: "#C9A84C",
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Get Started Today
        </p>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 1rem",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Ready to Maximize Your Returns?
        </h2>
        <p
          style={{
            color: "#D6DEE8",
            opacity: 0.7,
            fontSize: "1rem",
            lineHeight: 1.7,
            margin: "0 0 2.5rem",
          }}
        >
          Join hundreds of investors who trust Nexus Yield Group to grow and
          protect their wealth.
        </p>

        {submitted ? (
          <div
            style={{
              padding: "1.25rem 2rem",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "6px",
              color: "#C9A84C",
              fontSize: "0.95rem",
            }}
          >
            Thank you — a member of our team will be in touch shortly.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "0",
              maxWidth: 500,
              margin: "0 auto",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                flex: 1,
                padding: "0.9rem 1.25rem",
                background: "rgba(15,20,34,0.8)",
                border: "none",
                outline: "none",
                color: "#D6DEE8",
                fontSize: "0.9rem",
                fontFamily: "DM Sans, sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.9rem 1.75rem",
                background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                border: "none",
                color: "#0A0E1A",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.04em",
                fontFamily: "DM Sans, sans-serif",
                transition: "opacity 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Get Started
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
