import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Send,
  WalletCards,
  ShieldCheck,
  UserCog,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function AdminLayout({ children }) {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isSuperAdmin = profile?.role === "super_admin";

  const baseItems = [
    ["Overview", "/admin", LayoutDashboard],
    ["Client directory", "/admin/users", Users],
    ["Investments", "/admin/investments", TrendingUp],
    ["Deposit review", "/admin/deposits", Landmark],
    ["Payment approvals", "/admin/withdrawals", Send],
    ["Funding destinations", "/admin/funding", WalletCards],
    ["Notifications", "/admin/notifications", Bell],
  ];
  const superItems = [["Admin accounts", "/admin/accounts", UserCog]];
  const items = isSuperAdmin ? [...baseItems, ...superItems] : baseItems;

  const nav = (
    <nav style={{ padding: "14px 10px", flex: 1 }}>
      {items.map(([label, href, Icon]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            to={href}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "11px 13px",
              marginBottom: 3,
              borderLeft: `3px solid ${active ? "#C9A84C" : "transparent"}`,
              borderRadius: 8,
              textDecoration: "none",
              background: active ? "rgba(201,168,76,.12)" : "transparent",
              color: active ? "#E8C86D" : "#b7c2d0",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
            }}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const side = (
    <aside
      style={{
        width: 250,
        background: "#0D1321",
        borderRight: "1px solid rgba(201,168,76,.14)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "22px 22px 16px",
          borderBottom: "1px solid rgba(201,168,76,.12)",
        }}
      >
        <img src={logo} alt="Nexus Yield" style={{ height: 32 }} />
        <div
          style={{
            marginTop: 14,
            fontSize: 10,
            color: "#C9A84C",
            letterSpacing: 1.5,
            fontWeight: 800,
          }}
        >
          OPERATIONS CONSOLE
        </div>
      </div>
      {nav}
      <div style={{ padding: 16, borderTop: "1px solid rgba(201,168,76,.12)" }}>
        <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
          {profile?.first_name} {profile?.last_name}
        </div>
        <div style={{ fontSize: 11, color: "#8490a0", margin: "3px 0 4px" }}>
          {isSuperAdmin ? "Super Administrator" : "Administrator"}
        </div>
        <button
          onClick={signOut}
          style={{
            color: "#fca5a5",
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 12,
            marginTop: 8,
          }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080D17",
        color: "#D6DEE8",
        fontFamily: "DM Sans, sans-serif",
        display: "flex",
      }}
    >
      <div
        className="admin-desktop-side"
        style={{ position: "fixed", inset: "0 auto 0 0", zIndex: 30 }}
      >
        {side}
      </div>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.6)",
              zIndex: 40,
            }}
          />
          <div style={{ position: "fixed", inset: "0 auto 0 0", zIndex: 41 }}>
            {side}
          </div>
        </>
      )}
      <main
        className="admin-main"
        style={{ marginLeft: 250, flex: 1, minWidth: 0 }}
      >
        <header
          style={{
            height: 68,
            padding: "0 28px",
            borderBottom: "1px solid rgba(201,168,76,.12)",
            background: "#0D1321",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <button
            className="admin-menu"
            onClick={() => setOpen(true)}
            style={{
              display: "none",
              color: "#C9A84C",
              background: "none",
              border: 0,
            }}
          >
            <Menu />
          </button>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.4,
                color: "#C9A84C",
                fontWeight: 800,
              }}
            >
              NEXUS YIELD / INTERNAL
            </div>
            <div style={{ fontSize: 13, color: "#79869a", marginTop: 2 }}>
              Approval actions are recorded in the audit trail.
            </div>
          </div>
          <ShieldCheck size={20} color="#4ade80" />
        </header>
        <div style={{ padding: "28px", maxWidth: 1500, margin: "auto" }}>
          {children}
        </div>
      </main>
      <style>{`@media(max-width:760px){.admin-desktop-side{display:none}.admin-main{margin-left:0!important}.admin-menu{display:block!important}.admin-main>header{padding:0 16px!important}.admin-main>div{padding:18px!important}}`}</style>
    </div>
  );
}
