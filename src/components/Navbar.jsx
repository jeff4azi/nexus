import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Plans", href: "/plans" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navBg = scrolled || menuOpen ? "rgba(10,14,26,0.95)" : "transparent";
  const navBorder =
    scrolled || menuOpen ? "1px solid rgba(201,168,76,0.12)" : "none";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: navBg,
        borderBottom: navBorder,
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "0 2rem",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Nexus Yield Group"
            style={{ height: 40, width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Desktop links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
          className="nyg-desktop-nav"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              style={{
                color: "#D6DEE8",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D6DEE8")}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              color: "#0A0E1A",
              padding: "0.5rem 1.4rem",
              borderRadius: 4,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Login
          </Link>
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="nyg-hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#C9A84C",
              transition: "transform 0.3s, opacity 0.3s",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#C9A84C",
              transition: "opacity 0.3s",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: "#C9A84C",
              transition: "transform 0.3s, opacity 0.3s",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid rgba(201,168,76,0.12)",
            }}
          >
            <div
              style={{
                padding: "1.5rem 2rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    color: "#D6DEE8",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: 400,
                    padding: "0.75rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C9A84C")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#D6DEE8")
                  }
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: "1rem",
                  background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                  color: "#0A0E1A",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "0.875rem",
                  borderRadius: 8,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                }}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nyg-desktop-nav { display: none !important; }
          .nyg-hamburger    { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
}
