import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowUpFromLine } from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import {
  useBankAccounts,
  useWithdrawals,
  useUserInvestments,
} from "../../hooks/usePortalData";

const quickAmounts = [500, 1000, 5000];
const MIN = 100;

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
const statusColor = {
  Completed: "green",
  Pending: "amber",
  Approved: "blue",
  Processing: "blue",
  Rejected: "red",
};

export default function WithdrawalPage() {
  const { accounts } = useBankAccounts();
  const { withdrawals, loading: wLoading } = useWithdrawals();
  const { investments } = useUserInvestments();

  // Available balance = sum of returns earned from active investments
  const available = investments.reduce(
    (s, i) => s + Number(i.returns_earned ?? 0),
    0,
  );

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const selectedAccount = accounts.find((a) => a.id === account) ?? accounts[0];

  function handleAmountNext() {
    if (numAmount < MIN) {
      setError(`Minimum withdrawal is $${MIN}`);
      return;
    }
    if (numAmount > available) {
      setError("Amount exceeds available balance");
      return;
    }
    setError("");
    setStep(2);
  }

  function handlePinInput(val, i) {
    const next = [...pin];
    next[i] = val.slice(-1);
    setPin(next);
    if (val && i < 3) document.getElementById(`pin-${i + 1}`)?.focus();
    if (next.every((d) => d !== "") && i === 3) {
      setTimeout(() => setSuccess(true), 400);
    }
  }

  if (success)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 440 }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(74,222,128,0.15)",
              border: "1px solid rgba(74,222,128,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircle size={36} color="#4ade80" />
          </div>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Withdrawal Request Submitted!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#D6DEE8",
              opacity: 0.7,
              lineHeight: 1.7,
              marginBottom: 8,
            }}
          >
            Your withdrawal of{" "}
            <strong style={{ color: "#C9A84C" }}>
              ${numAmount.toLocaleString()}
            </strong>{" "}
            is being processed.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#D6DEE8",
              opacity: 0.5,
              marginBottom: 8,
            }}
          >
            Estimated arrival: 1–3 business days
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#C9A84C",
              fontFamily: "monospace",
              marginBottom: 32,
            }}
          >
            Ref: NYG-WDR-{Date.now().toString().slice(-6)}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="/portal/transactions">
              <GoldButton variant="outline">
                View Transaction History
              </GoldButton>
            </a>
            <a href="/portal/dashboard">
              <GoldButton>Return to Dashboard</GoldButton>
            </a>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Request a Withdrawal"
        subtitle="Withdraw funds from your available balance to your linked bank account."
      />

      {/* Info notice */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 18px",
          background: "rgba(96,165,250,0.08)",
          border: "1px solid rgba(96,165,250,0.2)",
          borderRadius: 10,
          marginBottom: 28,
        }}
      >
        <AlertCircle
          size={16}
          color="#60a5fa"
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.8 }}>
          Withdrawals are processed within 1–3 business days.
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
        className="portal-chart-grid"
      >
        <div>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
            {["Enter Amount", "Select Destination", "Review & Confirm"].map(
              (s, i) => {
                const active = step === i + 1,
                  done = step > i + 1;
                return (
                  <div
                    key={i}
                    style={{ flex: 1, display: "flex", alignItems: "center" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          transition: "all 0.3s",
                          background: done
                            ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                            : active
                              ? "rgba(201,168,76,0.2)"
                              : "rgba(255,255,255,0.06)",
                          color: done
                            ? "#0A0E1A"
                            : active
                              ? "#C9A84C"
                              : "#D6DEE8",
                          border: active ? "2px solid #C9A84C" : "none",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: active ? "#C9A84C" : "#D6DEE8",
                          opacity: active ? 1 : 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: done
                            ? "rgba(201,168,76,0.4)"
                            : "rgba(255,255,255,0.08)",
                          margin: "0 8px",
                          marginBottom: 22,
                        }}
                      />
                    )}
                  </div>
                );
              },
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionCard title="Enter Withdrawal Amount">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
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
                        Withdrawal Amount
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
                            fontSize: 16,
                          }}
                        >
                          $
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setError("");
                          }}
                          placeholder="0.00"
                          min={MIN}
                          max={available}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${error ? "rgba(248,113,113,0.5)" : "rgba(201,168,76,0.2)"}`,
                            borderRadius: 10,
                            padding: "14px 16px 14px 32px",
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: 700,
                            outline: "none",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor =
                              "rgba(201,168,76,0.55)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = error
                              ? "rgba(248,113,113,0.5)"
                              : "rgba(201,168,76,0.2)")
                          }
                        />
                      </div>
                      {error && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#f87171",
                            margin: "6px 0 0",
                          }}
                        >
                          {error}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: 12,
                          color: "#D6DEE8",
                          opacity: 0.45,
                          margin: "8px 0 0",
                        }}
                      >
                        Min: $100 · Max: {fmt(available)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[...quickAmounts, available].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAmount(String(q));
                            setError("");
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "1px solid rgba(201,168,76,0.25)",
                            background:
                              amount == q
                                ? "rgba(201,168,76,0.15)"
                                : "rgba(255,255,255,0.04)",
                            color: amount == q ? "#C9A84C" : "#D6DEE8",
                            transition: "all 0.2s",
                          }}
                        >
                          {i === quickAmounts.length
                            ? "Max"
                            : `$${q.toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                    <GoldButton
                      onClick={handleAmountNext}
                      style={{ alignSelf: "flex-start" }}
                    >
                      Continue →
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionCard title="Select Destination">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    {accounts.length === 0 ? (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#D6DEE8",
                          opacity: 0.5,
                          textAlign: "center",
                          padding: "20px 0",
                        }}
                      >
                        No bank accounts saved. Add one in Settings first.
                      </p>
                    ) : (
                      accounts.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => setAccount(acc.id)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 18px",
                            borderRadius: 12,
                            cursor: "pointer",
                            border: `1px solid ${account === acc.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.12)"}`,
                            background:
                              account === acc.id
                                ? "rgba(201,168,76,0.08)"
                                : "rgba(255,255,255,0.02)",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#fff",
                                marginBottom: 4,
                              }}
                            >
                              {acc.bank_name} ****{acc.account_number.slice(-4)}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#D6DEE8",
                                opacity: 0.6,
                              }}
                            >
                              {acc.account_name} · {acc.account_type}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            {acc.is_default && (
                              <Badge label="Default" color="gold" />
                            )}
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: `2px solid ${account === acc.id ? "#C9A84C" : "rgba(255,255,255,0.2)"}`,
                                background:
                                  account === acc.id
                                    ? "#C9A84C"
                                    : "transparent",
                                transition: "all 0.2s",
                              }}
                            />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <GoldButton variant="outline" onClick={() => setStep(1)}>
                      ← Back
                    </GoldButton>
                    <GoldButton onClick={() => setStep(3)}>
                      Continue →
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionCard title="Review & Confirm">
                  <div
                    style={{
                      background: "rgba(201,168,76,0.05)",
                      border: "1px solid rgba(201,168,76,0.15)",
                      borderRadius: 12,
                      padding: "20px",
                      marginBottom: 20,
                    }}
                  >
                    {[
                      ["Withdrawal Amount", `$${numAmount.toLocaleString()}`],
                      ["Processing Fee", "$0.00"],
                      [
                        "Amount You'll Receive",
                        `$${numAmount.toLocaleString()}`,
                      ],
                      [
                        "Destination",
                        selectedAccount
                          ? `${selectedAccount.bank_name} ****${selectedAccount.account_number.slice(-4)}`
                          : "—",
                      ],
                      ["Estimated Arrival", "1–3 business days"],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: "#D6DEE8",
                            opacity: 0.6,
                          }}
                        >
                          {l}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    <button
                      onClick={() => setConfirmed((c) => !c)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        flexShrink: 0,
                        marginTop: 2,
                        background: confirmed
                          ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                          : "rgba(255,255,255,0.04)",
                        border: confirmed
                          ? "none"
                          : "1px solid rgba(201,168,76,0.3)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {confirmed && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#0A0E1A",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#D6DEE8",
                        opacity: 0.7,
                        lineHeight: 1.6,
                      }}
                    >
                      I confirm this withdrawal request is correct.
                    </span>
                  </div>

                  {/* PIN */}
                  <div style={{ marginBottom: 24 }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#D6DEE8",
                        opacity: 0.7,
                        marginBottom: 12,
                      }}
                    >
                      Enter your 4-digit transaction PIN to confirm:
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                      {pin.map((d, i) => (
                        <input
                          key={i}
                          id={`pin-${i}`}
                          type="password"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handlePinInput(e.target.value, i)}
                          style={{
                            width: 52,
                            height: 52,
                            textAlign: "center",
                            fontSize: 20,
                            fontWeight: 700,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(201,168,76,0.25)",
                            borderRadius: 10,
                            color: "#fff",
                            outline: "none",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor =
                              "rgba(201,168,76,0.6)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor =
                              "rgba(201,168,76,0.25)")
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <GoldButton variant="outline" onClick={() => setStep(2)}>
                      ← Back
                    </GoldButton>
                    <GoldButton
                      onClick={() => setSuccess(true)}
                      style={{ opacity: confirmed ? 1 : 0.5 }}
                    >
                      <ArrowUpFromLine size={15} /> Submit Withdrawal
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Balance card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(232,184,75,0.04))",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 16,
              padding: "28px 24px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#C9A84C",
                marginBottom: 8,
              }}
            >
              AVAILABLE BALANCE
            </div>
            <div
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 40,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              {fmt(available)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#D6DEE8",
                opacity: 0.5,
                marginBottom: 4,
              }}
            >
              Pending Withdrawals: $0.00
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#D6DEE8",
                opacity: 0.4,
                lineHeight: 1.6,
              }}
            >
              Only matured returns and uninvested funds are available for
              withdrawal.
            </div>
          </div>

          <SectionCard title="Policy">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Minimum withdrawal: $100",
                "Processing time: 1–3 business days",
                "No withdrawal fees",
                "Daily limit: $50,000",
              ].map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12,
                    color: "#D6DEE8",
                    opacity: 0.65,
                  }}
                >
                  <span style={{ color: "#C9A84C" }}>·</span> {p}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Recent withdrawals */}
      <SectionCard
        title="Recent Withdrawals"
        action="View Full History"
        actionHref="/portal/transactions"
        style={{ marginTop: 24 }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                {["Date", "Amount", "Destination", "Status", "Reference"].map(
                  (c) => (
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
                      }}
                    >
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {wLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#D6DEE8",
                      opacity: 0.4,
                      fontSize: 13,
                    }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#D6DEE8",
                      opacity: 0.4,
                      fontSize: 13,
                    }}
                  >
                    No withdrawals yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr
                    key={w.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                      {fmtDate(w.created_at)}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(w.amount)}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.8,
                      }}
                    >
                      {w.bank_accounts
                        ? `${w.bank_accounts.bank_name} ****${w.bank_accounts.account_number.slice(-4)}`
                        : "—"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={w.status}
                        color={statusColor[w.status] ?? "grey"}
                      />
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#C9A84C",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {w.transactions?.reference ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <style>{`@media (max-width: 1100px) { .portal-chart-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
