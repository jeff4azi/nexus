import { useState } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import {
  KPICard,
  SectionCard,
  Badge,
  Table,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useUserInvestments } from "../../hooks/usePortalData";
import { useAuth } from "../../context/AuthContext";

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

export default function PortfolioPage() {
  const { user } = useAuth();
  const { investments, loading } = useUserInvestments();
  const [showCompleted, setShowCompleted] = useState(false);

  const activeInvestments = investments.filter((i) =>
    ["Active", "Maturing Soon"].includes(i.status),
  );
  const completedInvestments = investments.filter((i) =>
    ["Matured", "Cancelled"].includes(i.status),
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
  const growthRate =
    totalInvested > 0
      ? ((totalReturns / totalInvested) * 100).toFixed(2)
      : "0.00";

  const kpis = [
    {
      label: "Total Portfolio Value",
      value: fmt(totalValue),
      accent: true,
      sub: "current value",
    },
    {
      label: "Total Capital Invested",
      value: fmt(totalInvested),
      sub: "all time",
    },
    {
      label: "Total Returns Earned",
      value: fmt(totalReturns),
      sub: "all time",
    },
    {
      label: "Portfolio Growth Rate",
      value: `${growthRate}%`,
      sub: "since inception",
    },
  ];

  const activePlanRows = activeInvestments.map((inv) => [
    inv.investment_plans?.name ?? "—",
    inv.investment_plans?.tier ?? "—",
    fmt(inv.amount_invested),
    fmt(inv.current_value ?? inv.amount_invested),
    `+${fmt(inv.returns_earned)}`,
    `${inv.expected_roi}%`,
    fmtDate(inv.started_at),
    fmtDate(inv.matures_at),
    <Badge
      label={inv.status}
      color={inv.status === "Active" ? "green" : "amber"}
    />,
  ]);

  const completedPlanRows = completedInvestments.map((inv) => [
    inv.investment_plans?.name ?? "—",
    fmt(inv.amount_invested),
    fmt(inv.returns_earned),
    fmt(Number(inv.amount_invested) + Number(inv.returns_earned ?? 0)),
    `${inv.expected_roi}%`,
    fmtDate(inv.started_at),
    fmtDate(inv.completed_at),
  ]);

  return (
    <div>
      <PageHeader
        title="My Portfolio"
        subtitle="A complete view of your investments and asset performance."
        action={
          <GoldButton>
            <Download size={14} /> Download Report
          </GoldButton>
        }
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpis.map((k, i) => (
          <KPICard key={i} {...k} />
        ))}
      </div>

      {/* Active plans */}
      <SectionCard title="Active Investment Plans" style={{ marginBottom: 20 }}>
        {loading ? (
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
            No active investments.
          </p>
        ) : (
          <Table
            columns={[
              "Plan Name",
              "Tier",
              "Invested",
              "Current Value",
              "Gain/Loss",
              "ROI",
              "Start",
              "Maturity",
              "Status",
            ]}
            rows={activePlanRows}
          />
        )}
      </SectionCard>

      {/* Completed plans */}
      <SectionCard style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowCompleted((s) => !s)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
            Completed / Matured Plans
          </span>
          {showCompleted ? (
            <ChevronUp size={18} color="#C9A84C" />
          ) : (
            <ChevronDown size={18} color="#C9A84C" />
          )}
        </button>
        {showCompleted && (
          <div style={{ marginTop: 16 }}>
            {completedPlanRows.length === 0 ? (
              <p
                style={{
                  color: "#D6DEE8",
                  opacity: 0.4,
                  fontSize: 13,
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No completed investments yet.
              </p>
            ) : (
              <Table
                columns={[
                  "Plan Name",
                  "Invested",
                  "Total Returns",
                  "Final Payout",
                  "ROI",
                  "Start",
                  "Completed",
                ]}
                rows={completedPlanRows}
              />
            )}
          </div>
        )}
      </SectionCard>

      {/* Risk profile */}
      <SectionCard title="Risk Profile">
        <div
          style={{
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
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.7 }}>
                Your risk level:
              </span>
              <Badge label={user?.riskProfile ?? "Balanced"} color="blue" />
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#D6DEE8",
                opacity: 0.6,
                margin: 0,
                maxWidth: 500,
                lineHeight: 1.7,
              }}
            >
              A balanced profile seeks moderate growth with controlled risk.
              Your portfolio is diversified across investment plans to optimise
              returns while managing volatility.
            </p>
          </div>
          <a
            href="/portal/settings"
            style={{
              fontSize: 13,
              color: "#C9A84C",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Update Risk Profile →
          </a>
        </div>
      </SectionCard>

      <style>{`@media (max-width: 768px) { .portal-two-col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
