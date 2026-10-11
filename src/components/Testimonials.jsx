import { useReveal } from "../hooks/useReveal";

const testimonials = [
  {
    initials: "RK",
    name: "Richard Keller",
    role: "Managing Director, Keller Capital",
    quote:
      "Nexus Yield Group transformed our family office strategy. Their fixed income desk delivered 12% annualized returns while keeping volatility well below our threshold.",
  },
  {
    initials: "SM",
    name: "Sophia Marchetti",
    role: "CFO, Marchetti Enterprises",
    quote:
      "The level of transparency and communication is unmatched. We always know exactly where our capital is deployed and why. Truly institutional-grade service.",
  },
  {
    initials: "JT",
    name: "James Thornton",
    role: "Private Investor",
    quote:
      "After 15 years of managing my own portfolio, I finally found an advisor I trust completely. The alternative investment access alone has been a game-changer.",
  },
];

export default function Testimonials() {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      style={{
        padding: "120px 2rem",
        background: "#0A0E1A",
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
            Client Stories
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Trusted by Investors Worldwide
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`reveal glass ${visible ? "visible" : ""}`}
              style={{
                transitionDelay: `${i * 0.12}s`,
                padding: "2.5rem",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              {/* Quote mark */}
              <div
                className="font-display"
                style={{
                  fontSize: "5rem",
                  lineHeight: 0.8,
                  color: "rgba(201,168,76,0.15)",
                  marginBottom: "1rem",
                  fontWeight: 700,
                }}
              >
                "
              </div>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#D6DEE8",
                  opacity: 0.8,
                  lineHeight: 1.75,
                  margin: "0 0 2rem",
                  fontStyle: "italic",
                }}
              >
                {t.quote}
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0A0E1A",
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      color: "#D6DEE8",
                      opacity: 0.55,
                      fontSize: "0.78rem",
                      marginTop: "0.15rem",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
