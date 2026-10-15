import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Percent,
  ArrowDownToLine,
  ArrowUpFromLine,
  HeadphonesIcon,
  Calendar,
  ShieldAlert,
  Settings2,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  useTransactions,
  useUserInvestments,
  useNotifications,
} from "../../hooks/usePortalData";
import {
  KPICard,
  SectionCard,
  Badge,
  Table,
  GoldButton,
} from "../../components/portal/PortalUI";

const fmt = (n) =>
  "$" +
  Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const daysUntil = (d) =>
  d ? Math.max(0, Math.ceil((new Date(d) - Date.now()) / 86400000)) : null;

const catColor = {
  Deposits: "#4ade80",
  Withdrawals: "#f87171",
  Investments: "#60a5fa",
  Security: "#fbbf24",
  System: "#9ca3af",
};
const catIconMap = {
  Deposits: ArrowDownToLine,
  Withdrawals: ArrowUpFromLine,
  Investments: TrendingUp,
  Security: ShieldAlert,
  System: Settings2,
};

function PortfolioChart({ investments }) {
  const [range, setRange] = useState("1M");
  // Build a simple cumulative value line from real investment data
  const totalValue = investments.reduce(
    (s, i) => s + Number(i.current_value ?? i.amount_invested),
    0,
  );
  const totalInvested = investments.reduce(
    (s, i) => s + Number(i.amount_invested),
    0,
  );

  // Placeholder sparkline using real totals as anchor
  const ranges = { "1W": 7, "1M": 10, "3M": 10, "1Y": 10 };
  const points = ranges[range];
  const data = Array.from({ length: points }, (_, i) =>
    Math.round(
      totalInvested + (totalValue - totalInvested) * (i / (points - 1)),
    ),
  );

  const W = 600,
    H = 180,
    pad = 20;
  const min = Math.min(...data),
    max = Math.max(...data);
  const safeMax = max === min ? max + 1 : max;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (safeMax - min)) * (H - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `${pad},${H - pad} ${polyline} ${W - pad},${H - pad}`;

  return (
    <div>
      <div
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        {Object.keys(ranges).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              transition: "all 0.2s",
              background:
                range === r
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "rgba(255,255,255,0.05)",
              color: range === r ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {r}
          </button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 300, height: "auto" }}
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#chartGrad)" />
          <polyline
            points={polyline}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {pts.map((p, i) => {
            const [x, y] = p.split(",");
            return i === data.length - 1 ? (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#C9A84C"
                stroke="#0A0E1A"
                strokeWidth="2"
              />
            ) : null;
          })}
        </svg>
      </div>
    </div>
  );
}

const statusColor = {
  Active: "green",
  "Maturing Soon": "amber",
  Matured: "blue",
  Pending: "grey",
  Cancelled: "grey",
};
const txTypeSign = (type) =>
  ["Deposit", "Return Credit", "Bonus", "Adjustment"].includes(type)
    ? "+"
    : "-";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { transactions, loading: txLoading } = useTransactions();
  const { investments, loading: invLoading } = useUserInvestments();
  const { notifications, loading: notifLoading } = useNotifications();

  // KPI calculations
  const activeInvestments = investments.filter((i) =>
    ["Active", "Maturing Soon"].includes(i.status),
  );
  const totalInvested = investments.reduce(
    (s, i) => s + Number(i.amount_invested),
    0,
  );
  const totalReturns = investments.reduce(
    (s, i) => s + Number(i.returns_earned ?? 0),
    0,
  );
  const totalValue = investments.reduce(
    (s, i) => s + Number(i.current_value ?? i.amount_invested),
    0,
  );
  const overallROI =
    totalInvested > 0
      ? ((totalReturns / totalInvested) * 100).toFixed(2)
      : "0.00";

  // Available balance comes from profile.balance (set atomically when admin approves a deposit)
  const availableBalance = Number(profile?.balance ?? 0);

  const kpis = [
    {
      label: "Available Balance",
      value: fmt(availableBalance),
      icon: DollarSign,
      accent: true,
      sub: "ready to invest",
    },
    {
      label: "Total Invested",
      value: fmt(totalInvested),
      icon: ArrowDownToLine,
      sub: "all time",
    },
    {
      label: "Total Returns Earned",
      value: fmt(totalReturns),
      icon: TrendingUp,
      sub: "all time",
    },
    {
      label: "Overall ROI",
      value: `${overallROI}%`,
      icon: Percent,
      sub: "since inception",
    },
  ];

  // Upcoming maturities (next 30 days)
  const upcoming = activeInvestments
    .filter((i) => i.matures_at)
    .map((i) => ({ ...i, days: daysUntil(i.matures_at) }))
    .filter((i) => i.days !== null && i.days <= 30)
    .sort((a, b) => a.days - b.days);

  // Recent transactions (last 5)
  const recentTx = transactions.slice(0, 5).map((tx) => {
    const sign = txTypeSign(tx.type);
    return [
      fmtDate(tx.created_at),
      tx.type,
      `${sign}${fmt(tx.net_amount)}`,
      <Badge
        label={tx.status}
        color={
          {
            Completed: "green",
            Pending: "amber",
            Failed: "red",
            Processing: "blue",
            Cancelled: "grey",
          }[tx.status] ?? "grey"
        }
      />,
    ];
  });

  // Active plans table rows
  const activePlanRows = activeInvestments.slice(0, 5).map((inv) => [
    inv.investment_plans?.name ?? "—",
    fmt(inv.amount_invested),
    fmtDate(inv.started_at),
    fmtDate(inv.matures_at),
    `${inv.expected_roi}%`,
    fmt(inv.returns_earned),
    <Badge label={inv.status} color={statusColor[inv.status] ?? "grey"} />,
    <Link
      to="/portal/plans"
      style={{ color: "#C9A84C", fontSize: 12, textDecoration: "none" }}
    >
      View
    </Link>,
  ]);

  // Recent notifications (last 3)
  const recentNotifs = notifications.slice(0, 3);

  return (
    <div>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,184,75,0.04))",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Welcome back, {user?.firstName ?? ""}.
            </h2>
            <Badge
              label={user?.accountStatus ?? "Pending"}
              color={user?.accountStatus === "Active" ? "green" : "amber"}
            />
          </div>
          <p
            style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.65, margin: 0 }}
          >
            Here's an overview of your portfolio today —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link to="/portal/deposit">
          <GoldButton>
            <ArrowDownToLine size={15} /> Make a Deposit
          </GoldButton>
        </Link>
      </motion.div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <SectionCard title="Portfolio Performance">
          {invLoading ? (
            <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
              Loading…
            </p>
          ) : (
            <PortfolioChart investments={investments} />
          )}
        </SectionCard>
      </div>

      {/* Active plans */}
      <SectionCard
        title="Active Investment Plans"
        action="View All Plans"
        actionHref="/portal/plans"
        style={{ marginBottom: 20 }}
      >
        {invLoading ? (
          <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
            Loading…
          </p>
        ) : activePlanRows.length === 0 ? (
          <p
            style={{
              color: "#D6DEE8",
              opacity: 0.4,
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No active investments yet.
          </p>
        ) : (
          <Table
            columns={[
              "Plan Name",
              "Invested",
              "Start Date",
              "Maturity",
              "ROI",
              "Returns",
              "Status",
              "Action",
            ]}
            rows={activePlanRows}
          />
        )}
      </SectionCard>

      {/* Transactions + Maturities */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
        className="portal-two-col"
      >
        <SectionCard
          title="Recent Transactions"
          action="View Full History"
          actionHref="/portal/transactions"
        >
          {txLoading ? (
            <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
              Loading…
            </p>
          ) : recentTx.length === 0 ? (
            <p
              style={{
                color: "#D6DEE8",
                opacity: 0.4,
                fontSize: 13,
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No transactions yet.
            </p>
          ) : (
            <Table
              columns={["Date", "Type", "Amount", "Status"]}
              rows={recentTx}
            />
          )}
        </SectionCard>

        <SectionCard title="Upcoming Maturities">
          {invLoading ? (
            <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
              Loading…
            </p>
          ) : upcoming.length === 0 ? (
            <p
              style={{
                fontSize: 14,
                color: "#D6DEE8",
                opacity: 0.4,
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No plans maturing in the next 30 days.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcoming.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {m.investment_plans?.name ?? "—"}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.55 }}
                    >
                      {fmtDate(m.matures_at)} · {fmt(m.expected_return)}
                    </div>
                  </div>
                  <Badge
                    label={m.days === 0 ? "Today" : `${m.days} days`}
                    color={m.days <= 7 ? "amber" : "blue"}
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Notifications + Quick links */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
        className="portal-two-col"
      >
        <SectionCard
          title="Notifications"
          action="See All"
          actionHref="/portal/notifications"
        >
          {notifLoading ? (
            <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
              Loading…
            </p>
          ) : recentNotifs.length === 0 ? (
            <p
              style={{
                color: "#D6DEE8",
                opacity: 0.4,
                fontSize: 13,
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No notifications.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentNotifs.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 14px",
                    background: !n.is_read
                      ? "rgba(201,168,76,0.05)"
                      : "transparent",
                    borderRadius: 10,
                    border: `1px solid ${!n.is_read ? "rgba(201,168,76,0.15)" : "transparent"}`,
                  }}
                >
                  {!n.is_read && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#C9A84C",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#fff",
                        marginBottom: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {(() => {
                        const Icon = catIconMap[n.category] ?? Bell;
                        const color = catColor[n.category] ?? "#9ca3af";
                        return <Icon size={13} color={color} />;
                      })()}
                      {n.title}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#D6DEE8", opacity: 0.45 }}
                    >
                      {fmtDate(n.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "Make a Deposit",
                href: "/portal/deposit",
                icon: ArrowDownToLine,
              },
              {
                label: "Request Withdrawal",
                href: "/portal/withdrawal",
                icon: ArrowUpFromLine,
              },
              {
                label: "Contact Support",
                href: "/contact",
                icon: HeadphonesIcon,
              },
              {
                label: "Book a Consultation",
                href: "/contact",
                icon: Calendar,
              },
            ].map((q, i) => (
              <Link
                key={i}
                to={q.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  color: "#D6DEE8",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                  e.currentTarget.style.color = "#C9A84C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "#D6DEE8";
                }}
              >
                <q.icon size={15} color="#C9A84C" /> {q.label}
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @media (max-width: 1100px) { .portal-chart-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { .portal-two-col    { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
