import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, GoldButton } from "../../components/portal/PortalUI";
import { useNotifications } from "../../hooks/usePortalData";

const catColor = {
  Deposits: "#4ade80",
  Withdrawals: "#f87171",
  Investments: "#60a5fa",
  Security: "#fbbf24",
  System: "#9ca3af",
};
const catIcon = {
  Deposits: "💰",
  Withdrawals: "🔴",
  Investments: "📈",
  Security: "🔒",
  System: "⚙️",
};
const tabs = [
  "All",
  "Unread",
  "Deposits",
  "Withdrawals",
  "Investments",
  "Security",
  "System",
];

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 2880) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function NotificationsPage() {
  const { notifications, loading, markRead, markAllRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("All");
  const [visible, setVisible] = useState(10);

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.is_read;
    return n.category === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on all your account activity."
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <GoldButton variant="outline" onClick={markAllRead}>
              Mark All as Read
            </GoldButton>
          </div>
        }
      />

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 18px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              transition: "all 0.2s",
              fontFamily: "DM Sans, sans-serif",
              background:
                activeTab === t
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "rgba(255,255,255,0.05)",
              color: activeTab === t ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {t}
            {t === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "80px 24px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
              <p style={{ fontSize: 15, color: "#D6DEE8", opacity: 0.5 }}>
                You're all caught up! No new notifications.
              </p>
            </motion.div>
          ) : (
            filtered.slice(0, visible).map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 20px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: !n.is_read
                    ? "rgba(201,168,76,0.05)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${!n.is_read ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.2s",
                }}
                whileHover={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  style={{
                    width: 8,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    paddingTop: 6,
                  }}
                >
                  {!n.is_read && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#C9A84C",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${catColor[n.category] ?? "#9ca3af"}18`,
                    border: `1px solid ${catColor[n.category] ?? "#9ca3af"}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {catIcon[n.category] ?? "🔔"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: !n.is_read ? 600 : 500,
                        color: "#fff",
                      }}
                    >
                      {n.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#D6DEE8",
                        opacity: 0.45,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {fmtDate(n.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#D6DEE8",
                      opacity: 0.65,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {n.message}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load more */}
      {filtered.length > visible && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <GoldButton
            variant="outline"
            onClick={() => setVisible((v) => v + 10)}
          >
            Load More
          </GoldButton>
          <p
            style={{
              fontSize: 12,
              color: "#D6DEE8",
              opacity: 0.4,
              marginTop: 8,
            }}
          >
            Showing {Math.min(visible, filtered.length)} of {filtered.length}{" "}
            notifications
          </p>
        </div>
      )}

      {/* Preferences link */}
      {notifications.length > 0 && (
        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.1)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.6 }}>
            Want to manage what alerts you receive?
          </span>
          <a
            href="/portal/settings"
            style={{
              fontSize: 13,
              color: "#C9A84C",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Update Notification Settings →
          </a>
        </div>
      )}
    </div>
  );
}
