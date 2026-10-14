import { Link } from "react-router-dom";

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Invest",
    links: [
      { label: "Services", to: "/services" },
      { label: "View Plans", to: "/plans" },
      { label: "Open Account", to: "/register" },
      { label: "Client Portal", to: "/portal/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Disclosures", to: "/disclosures" },
      { label: "Compliance", to: "/compliance" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "X", href: "#", Icon: XIcon },
];

const linkStyle = {
  color: "#D6DEE8",
  opacity: 0.55,
  fontSize: "0.875rem",
  textDecoration: "none",
  transition: "opacity 0.2s, color 0.2s",
  display: "inline-block",
};

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
              <Link to="/">
                <img
                  src="/logo.png"
                  alt="Nexus Yield Group"
                  style={{
                    height: "44px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </Link>
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
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  style={{
                    color: "#D6DEE8",
                    opacity: 0.5,
                    display: "flex",
                    alignItems: "center",
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
                  <Icon />
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
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{ ...linkStyle }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.color = "#C9A84C";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.55";
                        e.currentTarget.style.color = "#D6DEE8";
                      }}
                    >
                      {link.label}
                    </Link>
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
            © {new Date().getFullYear()} Nexus Yield Group. All rights reserved.
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
