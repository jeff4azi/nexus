import { useReveal } from "../hooks/useReveal";
import { Check } from "lucide-react";

const features = [
  {
    title: "Institutional-Grade Research",
    desc: "Proprietary analytics and deep market intelligence driving every decision.",
  },
  {
    title: "Transparent Fee Structure",
    desc: "No hidden costs. Aligned incentives mean we grow only when you grow.",
  },
  {
    title: "Dedicated Relationship Managers",
    desc: "A senior advisor assigned to your portfolio from day one.",
  },
  {
    title: "Regulatory Compliance & Security",
    desc: "Fully regulated, audited, and insured — your capital is always protected.",
  },
];

export default function WhyUs() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="why-us"
      ref={ref}
      style={{
        padding: "120px 2rem",
        background: "#0A0E1A",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "center",
        }}
        className="why-grid"
      >
        {/* Left */}
        <div className={`reveal ${visible ? "visible" : ""}`}>
          <p
            style={{
              color: "#C9A84C",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Why Choose Us
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(36px, 4vw, 52px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 1.5rem",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            The Nexus Yield{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Advantage
            </span>
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#D6DEE8",
              opacity: 0.75,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            We combine the rigor of institutional investment management with the
            personalized attention of a boutique firm. Our track record speaks
            through consistent outperformance and unwavering client trust.
          </p>
        </div>

        {/* Right */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal ${visible ? "visible" : ""}`}
              style={{
                transitionDelay: `${i * 0.1}s`,
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  borderRadius: "50%",
                  background: "rgba(201,168,76,0.12)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "2px",
                }}
              >
                <Check size={13} color="#C9A84C" />
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    color: "#D6DEE8",
                    opacity: 0.65,
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
