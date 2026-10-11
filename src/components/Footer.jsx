const columns = [
  {
    title: "Services",
    links: [
      "Portfolio Management",
      "Fixed Income Yield",
      "Alternative Investments",
      "Wealth Advisory",
    ],
  },
  {
    title: "Company",
    links: ["About Us", "Our Team", "Careers", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Disclosures", "Compliance"],
  },
];

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
  { label: "Bloomberg", href: "#" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0F1422",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "80px 2rem 40px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "4rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <img
                src="/logo.png"
                alt="Nexus Yield Group"
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                color: "#D6DEE8",
                opacity: 0.55,
                fontSize: "0.875rem",
                lineHeight: 1.7,
                margin: "0 0 1.5rem",
                maxWidth: 260,
              }}
            >
              Institutional-grade investment management for discerning investors
              seeking superior risk-adjusted returns.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{
                    color: "#D6DEE8",
                    opacity: 0.5,
                    fontSize: "0.78rem",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    transition: "opacity 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.color = "#C9A84C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.5";
                    e.currentTarget.style.color = "#D6DEE8";
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                {col.title}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        color: "#D6DEE8",
                        opacity: 0.55,
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        transition: "opacity 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.color = "#C9A84C";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.55";
                        e.currentTarget.style.color = "#D6DEE8";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(201,168,76,0.08)",
            paddingTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p
            style={{
              color: "#D6DEE8",
              opacity: 0.35,
              fontSize: "0.8rem",
              margin: 0,
            }}
          >
            © 2025 Nexus Yield Group. All rights reserved.
          </p>
          <p
            style={{
              color: "#D6DEE8",
              opacity: 0.25,
              fontSize: "0.75rem",
              margin: 0,
              maxWidth: 500,
              textAlign: "right",
            }}
          >
            Investment involves risk. Past performance is not indicative of
            future results.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
