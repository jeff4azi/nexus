import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  FileText,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/usePortalData";
import logo from "../../assets/logo.png";

const navItems = [
  { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/portal/portfolio", icon: PieChart },
  { label: "Investment Plans", href: "/portal/plans", icon: TrendingUp },
  { label: "Fund Account", href: "/portal/deposit", icon: ArrowDownToLine },
  { label: "Withdrawal", href: "/portal/withdrawal", icon: ArrowUpFromLine },
  { label: "Transactions", href: "/portal/transactions", icon: History },
  { label: "Documents", href: "/portal/documents", icon: FileText },
  { label: "Profile & Settings", href: "/portal/settings", icon: User },
  { label: "Notifications", href: "/portal/notifications", icon: Bell },
];

const SIDEBAR_W = 260;

export default function PortalLayout({ children }) {
  const { user, signOut } = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // user is guaranteed non-null here because ProtectedRoute already checked
  const initials = user
    ? `${(user.firstName || "U")[0]}${(user.lastName || "")[0] || ""}`
    : "…";

  function SidebarContent({ onClose }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Logo */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            <img
              src={logo}
              alt="Nexus Yield Group"
              style={{ height: 36, objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 10,
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  background: active ? "rgba(201,168,76,0.12)" : "transparent",
                  color: active ? "#C9A84C" : "#D6DEE8",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  borderLeft: active
                    ? "3px solid #C9A84C"
                    : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#D6DEE8";
                  }
                }}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          <button
            onClick={() => signOut()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#D6DEE8",
              opacity: 0.6,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.6";
              e.currentTarget.style.color = "#D6DEE8";
            }}
          >
            <LogOut size={17} /> Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0A0E1A",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          background: "#0F1422",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
        className="portal-sidebar"
      >
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 49,
              }}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_W }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W }}
              transition={{ type: "tween", duration: 0.25 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: SIDEBAR_W,
                background: "#0F1422",
                borderRight: "1px solid rgba(201,168,76,0.1)",
                zIndex: 50,
              }}
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div
        style={{
          flex: 1,
          marginLeft: SIDEBAR_W,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        className="portal-main"
      >
        {/* Topbar */}
        <header
          style={{
            height: 68,
            background: "rgba(15,20,34,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="portal-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#C9A84C",
                padding: 4,
              }}
            >
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
                {navItems.find((n) => n.href === location.pathname)?.label ??
                  "Portal"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#D6DEE8",
                  opacity: 0.45,
                  marginTop: 1,
                }}
              >
                Last login: {user?.lastLogin ?? "—"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Notifications */}
            <Link
              to="/portal/notifications"
              style={{
                position: "relative",
                color: "#D6DEE8",
                opacity: 0.7,
                textDecoration: "none",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                    borderRadius: "50%",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#0A0E1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 10,
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0A0E1A",
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown
                  size={14}
                  color="#D6DEE8"
                  style={{ opacity: 0.6 }}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "#0F1422",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 12,
                      padding: 8,
                      minWidth: 180,
                      zIndex: 60,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                  >
                    {[
                      {
                        label: "View Profile",
                        icon: User,
                        href: "/portal/settings",
                      },
                      {
                        label: "Settings",
                        icon: Settings,
                        href: "/portal/settings",
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 8,
                          textDecoration: "none",
                          color: "#D6DEE8",
                          fontSize: 13,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <item.icon size={15} color="#C9A84C" /> {item.label}
                      </Link>
                    ))}
                    <div
                      style={{
                        borderTop: "1px solid rgba(201,168,76,0.1)",
                        margin: "6px 0",
                      }}
                    />
                    <button
                      onClick={() => signOut()}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ff6b6b",
                        fontSize: 13,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,107,107,0.08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px 28px", overflowX: "hidden" }}>
          {children}
        </main>

        {/* Portal footer */}
        <footer
          style={{
            padding: "20px 28px",
            borderTop: "1px solid rgba(201,168,76,0.08)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.3 }}>
            © 2026 Nexus Yield Group. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms & Conditions", "Risk Disclaimer"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 12,
                    color: "#D6DEE8",
                    opacity: 0.3,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.3")}
                >
                  {l}
                </a>
              ),
            )}
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .portal-sidebar { display: none !important; }
          .portal-main { margin-left: 0 !important; }
          .portal-hamburger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
