import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, TrendingUp } from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import {
  useInvestmentPlans,
  useUserInvestments,
} from "../../hooks/usePortalData";

const riskColor = { Low: "green", Medium: "amber", High: "red" };
const tierColor = {
  Starter: "grey",
  Elite: "blue",
  Deluxe: "blue",
  Superior: "gold",
  Ultimate: "purple",
  Platinum: "gold",
};
const statusColor = {
  Active: "green",
  "Maturing Soon": "amber",
  Matured: "blue",
  Pending: "grey",
  Cancelled: "grey",
};

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

function InvestModal({ plan, onClose }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  if (done)
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(74,222,128,0.15)",
            border: "1px solid rgba(74,222,128,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Check size={28} color="#4ade80" />
        </div>
        <h3
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 10,
          }}
        >
          Investment Activated!
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#D6DEE8",
            opacity: 0.7,
            marginBottom: 24,
          }}
        >
          {plan.name} · ${parseFloat(amount).toLocaleString()} invested
        </p>
        <GoldButton onClick={onClose}>View My Plans →</GoldButton>
      </div>
    );

  return (
    <div>
      <h3
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 4,
        }}
      >
        Invest in {plan.name}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#D6DEE8",
          opacity: 0.6,
          marginBottom: 24,
        }}
      >
        {plan.roi} return · {plan.duration}
      </p>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#D6DEE8",
                opacity: 0.8,
                display: "block",
                marginBottom: 8,
              }}
            >
              Investment Amount
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#C9A84C",
                  fontWeight: 700,
                }}
              >
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 10,
                  padding: "13px 16px 13px 30px",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  outline: "none",
                  fontFamily: "DM Sans, sans-serif",
                }}
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#D6DEE8",
                opacity: 0.45,
                margin: "6px 0 0",
              }}
            >
              Min: {plan.min} · Max: {plan.max}
            </p>
          </div>
          <GoldButton onClick={() => amount && setStep(2)}>
            Continue →
          </GoldButton>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "rgba(201,168,76,0.05)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 12,
              padding: "18px",
            }}
          >
            {[
              ["Plan", plan.name],
              ["Investment Amount", `$${parseFloat(amount).toLocaleString()}`],
              ["Expected ROI", plan.roi],
              ["Duration", plan.duration],
              [
                "Estimated Returns",
                `$${((parseFloat(amount) * parseFloat(plan.roi)) / 100).toFixed(2)}`,
              ],
              ["Payout", plan.payout],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.55 }}>
                  {l}
                </span>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <button
              onClick={() => setAgreed((a) => !a)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                flexShrink: 0,
                marginTop: 2,
                background: agreed
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "rgba(255,255,255,0.04)",
                border: agreed ? "none" : "1px solid rgba(201,168,76,0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {agreed && (
                <span
                  style={{ fontSize: 10, color: "#0A0E1A", fontWeight: 700 }}
                >
                  ✓
                </span>
              )}
            </button>
            <span style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.65 }}>
              I have read and agree to the Investment Terms.
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <GoldButton variant="outline" onClick={() => setStep(1)}>
              ← Back
            </GoldButton>
            <GoldButton
              onClick={() => agreed && setDone(true)}
              style={{ opacity: agreed ? 1 : 0.5 }}
            >
              <TrendingUp size={15} /> Confirm Investment
            </GoldButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlansPage() {
  const { plans: rawPlans, loading: plansLoading } = useInvestmentPlans();
  const { investments, loading: invLoading } = useUserInvestments();
  const [activeTab, setActiveTab] = useState("available");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [riskFilter, setRiskFilter] = useState("All");

  // Map DB plans to display shape
  const availablePlans = rawPlans.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    roi: `${p.roi_percent}%`,
    duration:
      p.duration_hrs < 24
        ? `${p.duration_hrs}h`
        : `${Math.round(p.duration_hrs / 24)} Day${Math.round(p.duration_hrs / 24) > 1 ? "s" : ""}`,
    min: fmt(p.min_amount),
    max: p.max_amount ? fmt(p.max_amount) : "Unlimited",
    payout: p.payout_type,
    risk: p.risk_level,
    desc: p.description ?? "",
  }));

  const activeInvestments = investments.filter((i) =>
    ["Active", "Maturing Soon"].includes(i.status),
  );
  const completedInvestments = investments.filter((i) =>
    ["Matured", "Cancelled"].includes(i.status),
  );
  const filtered = availablePlans.filter(
    (p) => riskFilter === "All" || p.risk === riskFilter,
  );

  return (
    <div>
      <PageHeader
        title="Investment Plans"
        subtitle="Choose a plan that matches your financial goals and risk appetite."
      />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 12,
          padding: 5,
          marginBottom: 28,
          width: "fit-content",
        }}
      >
        {[
          ["available", "Available Plans"],
          ["active", "My Active Plans"],
          ["completed", "Completed Plans"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              transition: "all 0.2s",
              fontFamily: "DM Sans, sans-serif",
              whiteSpace: "nowrap",
              background:
                activeTab === id
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "transparent",
              color: activeTab === id ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Available Plans */}
      {activeTab === "available" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {["All", "Low", "Medium", "High"].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                  background:
                    riskFilter === r
                      ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                      : "rgba(255,255,255,0.05)",
                  color: riskFilter === r ? "#0A0E1A" : "#D6DEE8",
                }}
              >
                Risk: {r}
              </button>
            ))}
          </div>
          {plansLoading ? (
            <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
              Loading plans…
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
              }}
            >
              {filtered.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 16px 50px rgba(201,168,76,0.12)",
                  }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: 16,
                    padding: "28px 24px",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 2,
                          color: "#C9A84C",
                          marginBottom: 6,
                        }}
                      >
                        {plan.tier.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#fff",
                          fontFamily: "Cormorant Garamond, serif",
                        }}
                      >
                        {plan.name}
                      </div>
                    </div>
                    <Badge label={plan.risk} color={riskColor[plan.risk]} />
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      background: "rgba(201,168,76,0.07)",
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: 44,
                        fontWeight: 700,
                        color: "#C9A84C",
                        lineHeight: 1,
                      }}
                    >
                      {plan.roi}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#D6DEE8",
                        opacity: 0.6,
                        marginTop: 4,
                      }}
                    >
                      After {plan.duration}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      `${plan.min} – ${plan.max}`,
                      `Payout: ${plan.payout}`,
                      plan.desc,
                    ].map((f, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: 13,
                          color: "#D6DEE8",
                          opacity: 0.75,
                        }}
                      >
                        <span style={{ color: "#C9A84C", flexShrink: 0 }}>
                          ·
                        </span>{" "}
                        {f}
                      </div>
                    ))}
                  </div>
                  <GoldButton
                    onClick={() => setSelectedPlan(plan)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <TrendingUp size={14} /> Invest Now
                  </GoldButton>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Plans */}
      {activeTab === "active" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Total Actively Invested",
                value: fmt(
                  activeInvestments.reduce(
                    (s, i) => s + Number(i.amount_invested),
                    0,
                  ),
                ),
              },
              {
                label: "Active Plans",
                value: String(activeInvestments.length),
              },
              {
                label: "Total Expected Returns",
                value: fmt(
                  activeInvestments.reduce(
                    (s, i) => s + Number(i.expected_return),
                    0,
                  ),
                ),
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#D6DEE8",
                    opacity: 0.5,
                    marginBottom: 6,
                    letterSpacing: 1,
                  }}
                >
                  {s.label.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C9A84C",
                    fontFamily: "Cormorant Garamond, serif",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <SectionCard>
            {invLoading ? (
              <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
                Loading…
              </p>
            ) : activeInvestments.length === 0 ? (
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
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                    >
                      {[
                        "Plan",
                        "Tier",
                        "Invested",
                        "Value",
                        "Returns",
                        "ROI",
                        "Start",
                        "Maturity",
                        "Days Left",
                        "Status",
                      ].map((c) => (
                        <th
                          key={c}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            color: "#D6DEE8",
                            opacity: 0.5,
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeInvestments.map((p) => {
                      const days = daysUntil(p.matures_at);
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <td
                            style={{
                              padding: "13px 14px",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          >
                            {p.investment_plans?.name ?? "—"}
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <Badge
                              label={p.investment_plans?.tier ?? "—"}
                              color={
                                tierColor[p.investment_plans?.tier] ?? "grey"
                              }
                            />
                          </td>
                          <td
                            style={{ padding: "13px 14px", color: "#D6DEE8" }}
                          >
                            {fmt(p.amount_invested)}
                          </td>
                          <td
                            style={{
                              padding: "13px 14px",
                              color: "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            {fmt(p.current_value ?? p.amount_invested)}
                          </td>
                          <td
                            style={{ padding: "13px 14px", color: "#C9A84C" }}
                          >
                            {fmt(p.returns_earned)}
                          </td>
                          <td
                            style={{ padding: "13px 14px", color: "#D6DEE8" }}
                          >
                            {p.expected_roi}%
                          </td>
                          <td
                            style={{
                              padding: "13px 14px",
                              color: "#D6DEE8",
                              opacity: 0.7,
                            }}
                          >
                            {fmtDate(p.started_at)}
                          </td>
                          <td
                            style={{
                              padding: "13px 14px",
                              color: "#D6DEE8",
                              opacity: 0.7,
                            }}
                          >
                            {fmtDate(p.matures_at)}
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <Badge
                              label={
                                days === 0
                                  ? "Today"
                                  : days !== null
                                    ? `${days}d`
                                    : "—"
                              }
                              color={
                                days !== null && days <= 7 ? "amber" : "blue"
                              }
                            />
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <Badge
                              label={p.status}
                              color={statusColor[p.status] ?? "grey"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Completed Plans */}
      {activeTab === "completed" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
            className="portal-two-col"
          >
            {[
              {
                label: "Total Capital Returned",
                value: fmt(
                  completedInvestments.reduce(
                    (s, i) => s + Number(i.amount_invested),
                    0,
                  ),
                ),
              },
              {
                label: "Total Profit Earned (Lifetime)",
                value: fmt(
                  completedInvestments.reduce(
                    (s, i) => s + Number(i.returns_earned ?? 0),
                    0,
                  ),
                ),
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#D6DEE8",
                    opacity: 0.5,
                    marginBottom: 6,
                    letterSpacing: 1,
                  }}
                >
                  {s.label.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C9A84C",
                    fontFamily: "Cormorant Garamond, serif",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <SectionCard>
            {invLoading ? (
              <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
                Loading…
              </p>
            ) : completedInvestments.length === 0 ? (
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
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                    >
                      {[
                        "Plan",
                        "Invested",
                        "Returns",
                        "Final Payout",
                        "ROI",
                        "Start",
                        "Completed",
                      ].map((c) => (
                        <th
                          key={c}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            color: "#D6DEE8",
                            opacity: 0.5,
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {completedInvestments.map((p) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <td
                          style={{
                            padding: "13px 14px",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {p.investment_plans?.name ?? "—"}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {fmt(p.amount_invested)}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#C9A84C" }}>
                          {fmt(p.returns_earned)}
                        </td>
                        <td
                          style={{
                            padding: "13px 14px",
                            color: "#4ade80",
                            fontWeight: 600,
                          }}
                        >
                          {fmt(
                            Number(p.amount_invested) +
                              Number(p.returns_earned ?? 0),
                          )}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {p.expected_roi}%
                        </td>
                        <td
                          style={{
                            padding: "13px 14px",
                            color: "#D6DEE8",
                            opacity: 0.7,
                          }}
                        >
                          {fmtDate(p.started_at)}
                        </td>
                        <td
                          style={{
                            padding: "13px 14px",
                            color: "#D6DEE8",
                            opacity: 0.7,
                          }}
                        >
                          {fmtDate(p.completed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Invest modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#0F1422",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 20,
                padding: "32px",
                maxWidth: 480,
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 8,
                }}
              >
                <button
                  onClick={() => setSelectedPlan(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#D6DEE8",
                    opacity: 0.5,
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <InvestModal
                plan={selectedPlan}
                onClose={() => setSelectedPlan(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 768px) { .portal-two-col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
