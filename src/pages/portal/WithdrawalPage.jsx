import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowUpFromLine, Check } from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useCryptoWallets, useWithdrawals } from "../../hooks/usePortalData";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const MIN = 10;

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
  Pending: "amber",
  Approved: "blue",
  Processing: "blue",
  Paid: "green",
  Rejected: "red",
  Cancelled: "grey",
};

export default function WithdrawalPage() {
  const { profile } = useAuth();
  const { wallets, loading: walletsLoading } = useCryptoWallets();
  const { withdrawals, loading: wLoading } = useWithdrawals();

  const available = Number(profile?.balance ?? 0);

  const pendingTotal = withdrawals
    .filter((w) => ["Pending", "Approved", "Processing"].includes(w.status))
    .reduce((s, w) => s + Number(w.amount), 0);

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const numAmount = parseFloat(amount) || 0;
  const selectedWallet = wallets.find((w) => w.id === walletId) ?? wallets[0];

  function handleAmountNext() {
    if (numAmount < MIN) {
      setError(`Minimum withdrawal is ${fmt(MIN)}`);
      return;
    }
    if (numAmount > available) {
      setError(`Amount exceeds available balance of ${fmt(available)}`);
      return;
    }
    setError("");
    setStep(2);
  }

  function handleWalletNext() {
    if (!walletId && wallets.length > 0) setWalletId(wallets[0].id);
    if (wallets.length === 0) {
      setError("Add a crypto wallet in Settings first.");
      return;
    }
    setError("");
    setStep(3);
  }

  function handleReviewNext() {
    if (!confirmed) return;
    setError("");
    setStep(4);
  }

  async function handleSubmit() {
    if (pin.length !== 4) {
      setError("Please enter your 4-digit transaction PIN.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("submit_withdrawal", {
      p_amount: numAmount,
      p_crypto_wallet_id: walletId ?? wallets[0]?.id,
      p_pin: pin,
    });

    setSubmitting(false);

    if (rpcError) {
      const msg = rpcError.message ?? "";
      if (msg.toLowerCase().includes("incorrect transaction pin")) {
        setError("Incorrect PIN. Please try again.");
      } else if (msg.toLowerCase().includes("no transaction pin set")) {
        setError(
          "You haven't set a transaction PIN yet. Go to Settings → Security to create one.",
        );
      } else {
        setError(msg);
      }
      return;
    }

    setSuccessData(data);
  }

  if (successData)
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
            Withdrawal Submitted
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
            <strong style={{ color: "#C9A84C" }}>{fmt(numAmount)}</strong> is
            pending admin approval.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#D6DEE8",
              opacity: 0.5,
              marginBottom: 8,
            }}
          >
            Estimated processing: 1–3 business days
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#C9A84C",
              fontFamily: "monospace",
              marginBottom: 32,
            }}
          >
            Ref: {successData.id?.slice(0, 8).toUpperCase()}
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
              <GoldButton variant="outline">View Transactions</GoldButton>
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
        subtitle="Withdraw funds to your saved crypto wallet. Funds are reserved immediately on submission."
      />

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
          Withdrawals are processed within 1–3 business days after admin
          approval. Your balance is reserved immediately when you submit.
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
            {["Enter Amount", "Select Wallet", "Review", "Enter PIN"].map(
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
                        {done ? <Check size={13} color="#0A0E1A" /> : i + 1}
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
                    {i < 3 && (
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
            {/* Step 1 — Amount */}
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
                        Min: {fmt(MIN)} · Available: {fmt(available)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[100, 500, 1000, available].map(
                        (q, i) =>
                          q > 0 && (
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
                                  Number(amount) === q
                                    ? "rgba(201,168,76,0.15)"
                                    : "rgba(255,255,255,0.04)",
                                color:
                                  Number(amount) === q ? "#C9A84C" : "#D6DEE8",
                                transition: "all 0.2s",
                              }}
                            >
                              {i === 3 ? "Max" : `$${q.toLocaleString()}`}
                            </button>
                          ),
                      )}
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

            {/* Step 2 — Wallet */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionCard title="Select Destination Wallet">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    {walletsLoading ? (
                      <p
                        style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.5 }}
                      >
                        Loading wallets…
                      </p>
                    ) : wallets.length === 0 ? (
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#D6DEE8",
                            opacity: 0.5,
                            textAlign: "center",
                            padding: "20px 0",
                          }}
                        >
                          No crypto wallets saved.
                        </p>
                        <a
                          href="/portal/settings"
                          style={{
                            display: "block",
                            textAlign: "center",
                            color: "#C9A84C",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Add a wallet in Settings →
                        </a>
                      </div>
                    ) : (
                      wallets.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setWalletId(w.id)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 18px",
                            borderRadius: 12,
                            cursor: "pointer",
                            border: `1px solid ${walletId === w.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.12)"}`,
                            background:
                              walletId === w.id
                                ? "rgba(201,168,76,0.08)"
                                : "rgba(255,255,255,0.02)",
                            transition: "all 0.2s",
                            textAlign: "left",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#fff",
                                marginBottom: 4,
                              }}
                            >
                              {w.label || `${w.asset} wallet`}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#D6DEE8",
                                opacity: 0.6,
                              }}
                            >
                              {w.asset} · {w.network}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#C9A84C",
                                fontFamily: "monospace",
                                marginTop: 4,
                                wordBreak: "break-all",
                              }}
                            >
                              {w.wallet_address.slice(0, 20)}…
                              {w.wallet_address.slice(-8)}
                            </div>
                          </div>
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              border: `2px solid ${walletId === w.id ? "#C9A84C" : "rgba(255,255,255,0.2)"}`,
                              background:
                                walletId === w.id ? "#C9A84C" : "transparent",
                              flexShrink: 0,
                              transition: "all 0.2s",
                            }}
                          />
                        </button>
                      ))
                    )}
                    {error && (
                      <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>
                        {error}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <GoldButton variant="outline" onClick={() => setStep(1)}>
                      ← Back
                    </GoldButton>
                    <GoldButton
                      onClick={handleWalletNext}
                      disabled={wallets.length === 0}
                    >
                      Continue →
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Step 3 — Review */}
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
                      ["Withdrawal Amount", fmt(numAmount)],
                      ["Processing Fee", "$0.00"],
                      ["Amount You'll Receive", fmt(numAmount)],
                      [
                        "Asset",
                        selectedWallet
                          ? `${selectedWallet.asset} (${selectedWallet.network})`
                          : "—",
                      ],
                      [
                        "Destination Wallet",
                        selectedWallet
                          ? `${selectedWallet.wallet_address.slice(0, 16)}…`
                          : "—",
                      ],
                      ["Estimated Processing", "1–3 business days"],
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
                            textAlign: "right",
                            maxWidth: "55%",
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
                      gap: 10,
                      padding: "14px 16px",
                      background: "rgba(251,191,36,0.06)",
                      border: "1px solid rgba(251,191,36,0.18)",
                      borderRadius: 10,
                      marginBottom: 20,
                    }}
                  >
                    <AlertCircle
                      size={15}
                      color="#fbbf24"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span
                      style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.75 }}
                    >
                      Your balance will be reduced by {fmt(numAmount)}{" "}
                      immediately. If this request is rejected, your funds will
                      be fully restored.
                    </span>
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
                      {confirmed && <Check size={11} color="#0A0E1A" />}
                    </button>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#D6DEE8",
                        opacity: 0.7,
                        lineHeight: 1.6,
                      }}
                    >
                      I confirm this withdrawal request is correct and I
                      authorise the transfer.
                    </span>
                  </div>

                  {error && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: "12px 14px",
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 8,
                        color: "#f87171",
                        fontSize: 13,
                        marginBottom: 16,
                      }}
                    >
                      <AlertCircle
                        size={15}
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <GoldButton variant="outline" onClick={() => setStep(2)}>
                      ← Back
                    </GoldButton>
                    <GoldButton
                      onClick={handleReviewNext}
                      disabled={!confirmed}
                      style={{ opacity: !confirmed ? 0.5 : 1 }}
                    >
                      <ArrowUpFromLine size={15} />
                      Continue to PIN →
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Step 4 — Transaction PIN */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionCard title="Enter Transaction PIN">
                  <p
                    style={{
                      fontSize: 14,
                      color: "#D6DEE8",
                      opacity: 0.7,
                      marginBottom: 24,
                      lineHeight: 1.7,
                    }}
                  >
                    Enter your 4-digit transaction PIN to authorise this
                    withdrawal of{" "}
                    <strong style={{ color: "#C9A84C" }}>
                      {fmt(numAmount)}
                    </strong>
                    .
                  </p>
                  <div style={{ maxWidth: 260 }}>
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
                      Transaction PIN
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                          setError("");
                        }}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${error ? "rgba(248,113,113,0.5)" : "rgba(201,168,76,0.2)"}`,
                          borderRadius: 10,
                          padding: "14px 44px 14px 16px",
                          color: "#fff",
                          fontSize: 22,
                          fontWeight: 700,
                          letterSpacing: 8,
                          outline: "none",
                          fontFamily: "DM Sans, sans-serif",
                          textAlign: "center",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin((p) => !p)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#C9A84C",
                          display: "flex",
                        }}
                      >
                        {showPin ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {error && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          padding: "10px 12px",
                          background: "rgba(248,113,113,0.08)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: 8,
                          color: "#f87171",
                          fontSize: 13,
                          marginTop: 10,
                        }}
                      >
                        <AlertCircle
                          size={14}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />{" "}
                        {error}
                      </div>
                    )}
                    <p
                      style={{
                        fontSize: 12,
                        color: "#D6DEE8",
                        opacity: 0.4,
                        margin: "10px 0 0",
                      }}
                    >
                      Don't have a PIN?{" "}
                      <a
                        href="/portal/settings"
                        style={{ color: "#C9A84C", textDecoration: "none" }}
                      >
                        Set one in Settings →
                      </a>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                    <GoldButton
                      variant="outline"
                      onClick={() => {
                        setStep(3);
                        setPin("");
                        setError("");
                      }}
                    >
                      ← Back
                    </GoldButton>
                    <GoldButton
                      onClick={handleSubmit}
                      disabled={pin.length !== 4 || submitting}
                      style={{
                        opacity: pin.length !== 4 || submitting ? 0.5 : 1,
                      }}
                    >
                      <ArrowUpFromLine size={15} />
                      {submitting ? "Submitting…" : "Submit Withdrawal"}
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
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
            {pendingTotal > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "#fbbf24",
                  opacity: 0.8,
                  marginBottom: 4,
                }}
              >
                Pending withdrawals: {fmt(pendingTotal)}
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: "#D6DEE8",
                opacity: 0.4,
                lineHeight: 1.6,
              }}
            >
              Balance reflects approved deposits minus any active withdrawals.
            </div>
          </div>

          <SectionCard title="Policy">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Minimum withdrawal: $10",
                "Processing: 1–3 business days",
                "No withdrawal fees",
                "Funds reserved on submission",
                "Balance restored if rejected",
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
                {["Date", "Amount", "Wallet", "Status"].map((c) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {wLoading ? (
                <tr>
                  <td
                    colSpan={4}
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
                    colSpan={4}
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
                        opacity: 0.7,
                        fontSize: 12,
                      }}
                    >
                      {w.crypto_wallets
                        ? `${w.crypto_wallets.asset} · ${w.crypto_wallets.wallet_address.slice(0, 10)}…`
                        : "—"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={w.status}
                        color={statusColor[w.status] ?? "grey"}
                      />
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
