import { useReveal } from "../hooks/useReveal";

const services = [
  {
    icon: "◈",
    title: "Portfolio Management",
    desc: "Bespoke multi-asset portfolios engineered for optimal risk-adjusted returns across market cycles.",
  },
  {
    icon: "◆",
    title: "Fixed Income Yield",
    desc: "Curated bond and credit strategies delivering consistent income streams with capital preservation.",
  },
  {
    icon: "⬡",
    title: "Alternative Investments",
    desc: "Access to private equity, hedge funds, and real assets — diversification beyond public markets.",
  },
  {
    icon: "◇",
    title: "Wealth Advisory",
    desc: "Holistic financial planning integrating tax efficiency, estate strategy, and generational wealth transfer.",
  },
];

export default function Services() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="services"
      ref={ref}
      style={{
        padding: "120px 2rem",
        background: "#0F1422",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          className={`reveal ${visible ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: "4rem" }}
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
            What We Offer
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Our Services
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {services.map((s, i) => (
            <ServiceCard
              key={s.title}
              service={s}
              delay={i * 0.12}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, delay, visible }) {
  return (
    <div
      className={`reveal glass ${visible ? "visible" : ""}`}
      style={{
        transitionDelay: `${delay}s`,
        padding: "2.5rem 2rem",
        borderRadius: "8px",
        cursor: "default",
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.7s ease, translateY 0.7s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(201,168,76,0.12)";
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.18)";
      }}
    >
      <div
        style={{
          fontSize: "1.8rem",
          color: "#C9A84C",
          marginBottom: "1.25rem",
          lineHeight: 1,
        }}
      >
        {service.icon}
      </div>
      <h3
        className="font-display"
        style={{
          fontSize: "1.35rem",
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 0.75rem",
          letterSpacing: "-0.01em",
        }}
      >
        {service.title}
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#D6DEE8",
          opacity: 0.75,
          lineHeight: 1.7,
          margin: "0 0 1.5rem",
        }}
      >
        {service.desc}
      </p>
      <a
        href="#contact"
        style={{
          color: "#C9A84C",
          fontSize: "0.85rem",
          fontWeight: 500,
          textDecoration: "none",
          letterSpacing: "0.04em",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          transition: "gap 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.gap = "0.7rem")}
        onMouseLeave={(e) => (e.currentTarget.style.gap = "0.4rem")}
      >
        Learn More →
      </a>
    </div>
  );
}
