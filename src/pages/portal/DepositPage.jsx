import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  CheckCircle,
  Upload,
  AlertCircle,
  CreditCard,
  FileImage,
  ShieldCheck,
} from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useDeposits } from "../../hooks/usePortalData";
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
  Approved: "green",
  "Pending Review": "amber",
  Rejected: "red",
  Failed: "red",
};

const statusLabel = {
  Approved: "Approved",
  "Pending Review": "Pending",
  Rejected: "Rejected",
  Failed: "Failed",
};

function detectBrand(num) {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^(5061|6500|6509|650[2-9]|6512|651[0-9]|652[0-4])/.test(n))
    return "Verve";
  return "Other";
}

function formatCardNumber(val) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

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
  const { session, profile, user, updateProfile, refreshProfile } = useAuth();
  const { deposits, loading: depLoading } = useDeposits();

  // Balance comes directly from the profile row (set by admin_review_deposit)
  const balance = Number(profile?.balance ?? 0);

  const totalDeposited = deposits
    .filter((d) => d.status === "Approved")
    .reduce((s, d) => s + Number(d.amount), 0);

  // ── SSN gate ──
  const isVerified =
    profile?.ssn_verification_status === "Verified" ||
    profile?.ssn_verification_status === "Pending";
  const [ssnInput, setSsnInput] = useState("");
  const [ssnLoading, setSsnLoading] = useState(false);
  const [ssnError, setSsnError] = useState("");
  const [ssnSubmitted, setSsnSubmitted] = useState(false);

  // ── Deposit form state (always declared — rules of hooks) ──
  const [tab, setTab] = useState("crypto");
  const [cryptoDestinations, setCryptoDestinations] = useState([]);
  const [crypto, setCrypto] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Proof upload state (shared between crypto and card)
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Crypto form
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState("");

  // Card form
  const [cardAmount, setCardAmount] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardLoading, setCardLoading] = useState(false);

  const brand = detectBrand(cardNumber);

  useEffect(() => {
    if (!isVerified) return; // don't bother fetching until verified
    supabase
      .from("funding_destinations")
      .select("id, label, asset, network, wallet_address")
      .eq("kind", "crypto")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const destinations = data ?? [];
        setCryptoDestinations(destinations);
        if (destinations.length > 0) setCrypto(destinations[0]);
      });
  }, [isVerified]);

  async function handleSsnSubmit(e) {
    e.preventDefault();
    const clean = ssnInput.trim();
    if (!/^\d{4}$/.test(clean)) {
      setSsnError("Please enter exactly 4 digits.");
      return;
    }
    setSsnError("");
    setSsnLoading(true);
    const { error } = await updateProfile({
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      phone: profile?.phone ?? null,
      date_of_birth: profile?.date_of_birth ?? null,
      country: profile?.country ?? null,
      city: profile?.city ?? null,
      address: profile?.address ?? null,
      ssn_last4: clean,
    });
    setSsnLoading(false);
    if (error) {
      setSsnError("Could not save your SSN. Please try again.");
      return;
    }
    await refreshProfile();
    setSsnSubmitted(true);
  }

  // If not verified and SSN just submitted, show "under review" screen
  if (!isVerified && ssnSubmitted) {
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
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircle size={36} color="#C9A84C" />
          </div>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 30,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Identity Verification Submitted
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
            Your SSN has been submitted for review. Our compliance team
            typically verifies identities within a few hours. You'll receive a
            notification once approved and can return here to make deposits.
          </p>
          <a href="/portal/dashboard">
            <GoldButton>Return to Dashboard</GoldButton>
          </a>
        </motion.div>
      </div>
    );
  }

  // If not verified (no SSN on file or rejected), show SSN collection gate
  if (!isVerified) {
    return (
      <div>
        <PageHeader
          title="Identity Verification Required"
          subtitle="To make a deposit you must first verify your identity."
        />
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "14px 18px",
              background: "rgba(201,168,76,0.07)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 10,
              marginBottom: 28,
            }}
          >
            <AlertCircle
              size={16}
              color="#C9A84C"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <span
              style={{
                fontSize: 13,
                color: "#D6DEE8",
                opacity: 0.85,
                lineHeight: 1.6,
              }}
            >
              Federal regulations require identity verification before you can
              fund your account. This is a one-time step.
            </span>
          </div>
          <SectionCard title="Verify Your Identity">
            <p
              style={{
                fontSize: 14,
                color: "#D6DEE8",
                opacity: 0.7,
                marginBottom: 24,
                lineHeight: 1.7,
              }}
            >
              Please provide the last 4 digits of your Social Security Number
              (SSN). This information is encrypted and used solely for identity
              verification — we never store your full SSN.
            </p>
            <form
              onSubmit={handleSsnSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
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
                  Last 4 digits of SSN{" "}
                  <span style={{ color: "#C9A84C" }}>*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={ssnInput}
                  onChange={(e) => {
                    setSsnInput(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setSsnError("");
                  }}
                  style={{
                    ...inputStyle,
                    fontSize: 22,
                    letterSpacing: 8,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                />
                {ssnError && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#f87171",
                      margin: "6px 0 0",
                    }}
                  >
                    {ssnError}
                  </p>
                )}
                <p
                  style={{
                    fontSize: 12,
                    color: "#D6DEE8",
                    opacity: 0.4,
                    margin: "8px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ShieldCheck size={12} color="#4ade80" />
                  256-bit encrypted · Not stored in plain text
                </p>
              </div>
              <GoldButton
                type="submit"
                disabled={ssnLoading || ssnInput.length < 4}
                style={{
                  alignSelf: "flex-start",
                  opacity: ssnLoading || ssnInput.length < 4 ? 0.6 : 1,
                }}
              >
                {ssnLoading ? "Submitting…" : "Submit for Verification"}
              </GoldButton>
            </form>
          </SectionCard>
        </div>
      </div>
    );
  }

  function handleFileSelect(file) {
    if (!file) return;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowed.includes(file.type)) {
      setCryptoError("Only JPG, PNG, WEBP, or PDF files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCryptoError("File must be under 10 MB.");
      return;
    }
    setProofFile(file);
    setCryptoError("");
    setCardError("");
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setProofPreview("pdf");
    }
  }

  async function uploadProof(userId) {
    if (!proofFile) return null;
    const ext = proofFile.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("deposit-proofs")
      .upload(path, proofFile, { upsert: false });
    if (error) throw new Error("Proof upload failed: " + error.message);
    return path;
  }

  async function handleCryptoSubmit() {
    setCryptoError("");
    const numericAmount = Number(cryptoAmount);
    if (!crypto) return setCryptoError("Select a cryptocurrency.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0)
      return setCryptoError("Enter a valid amount.");
    if (!proofFile)
      return setCryptoError(
        "Please upload your transaction screenshot or hash.",
      );

    setCryptoLoading(true);
    try {
      const proofPath = await uploadProof(session.user.id);
      const { error } = await supabase.from("deposit_requests").insert({
        user_id: session.user.id,
        funding_destination_id: crypto.id,
        amount: numericAmount,
        method: "Crypto",
        proof_url: proofPath,
        status: "Pending Review",
      });
      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (err) {
      setCryptoError(err.message);
    } finally {
      setCryptoLoading(false);
    }
  }

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
    if (!proofFile) return setCardError("Please upload your payment receipt.");

    const expMonth = parseInt(expiryDigits.slice(0, 2), 10);
    const expYear = 2000 + parseInt(expiryDigits.slice(2), 10);
    if (expMonth < 1 || expMonth > 12)
      return setCardError("Invalid expiry month.");

    setCardLoading(true);
    try {
      const proofPath = await uploadProof(session.user.id);

      const { data: deposit, error: depositErr } = await supabase
        .from("deposit_requests")
        .insert({
          user_id: session.user.id,
          amount: numericAmount,
          method: "Card",
          proof_url: proofPath,
          status: "Pending Review",
        })
        .select()
        .single();

      if (depositErr) throw new Error(depositErr.message);

      // Store non-sensitive card metadata
      await supabase.from("card_details").insert({
        user_id: session.user.id,
        deposit_request_id: deposit.id,
        cardholder_name: cardholderName.trim(),
        card_last4: rawCard.slice(-4),
        card_brand: brand,
        expiry_month: expMonth,
        expiry_year: expYear,
      });

      await supabase.from("card_payment_attempts").insert({
        user_id: session.user.id,
        deposit_request_id: deposit.id,
        amount: numericAmount,
        provider: "manual_review",
        status: "Pending",
      });

      setSubmitted(true);
    } catch (err) {
      setCardError(err.message);
    } finally {
      setCardLoading(false);
    }
  }

  const tabs = [
    { id: "crypto", label: "Crypto" },
    { id: "card", label: "Card Payment" },
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
          Funds are typically confirmed within 1–24 hours. Upload your proof of
          payment to speed up review.
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
                onClick={() => {
                  setTab(t.id);
                  setProofFile(null);
                  setProofPreview(null);
                  setCryptoError("");
                  setCardError("");
                }}
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
            {/* ── Crypto ── */}
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
                    {cryptoDestinations.length === 0 ? (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#D6DEE8",
                          opacity: 0.45,
                          margin: 0,
                        }}
                      >
                        No crypto destinations configured yet. Please check back
                        soon.
                      </p>
                    ) : (
                      <>
                        {/* Amount */}
                        <div>
                          <label style={labelStyle}>Amount (USD)</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        {/* Select coin */}
                        <div>
                          <label style={labelStyle}>
                            Select Cryptocurrency
                          </label>
                          <select
                            value={crypto?.id ?? ""}
                            onChange={(e) =>
                              setCrypto(
                                cryptoDestinations.find(
                                  (c) => c.id === e.target.value,
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
                            {cryptoDestinations.map((c) => (
                              <option
                                key={c.id}
                                value={c.id}
                                style={{ background: "#0F1422" }}
                              >
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Wallet address */}
                        {crypto && (
                          <>
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
                                  {crypto.wallet_address}
                                </code>
                                <CopyButton text={crypto.wallet_address} />
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
                                Network fees apply. Only send {crypto.asset} on
                                the {crypto.network} network to this address.
                              </span>
                            </div>
                          </>
                        )}

                        {/* Proof upload */}
                        <ProofUpload
                          file={proofFile}
                          preview={proofPreview}
                          inputRef={fileInputRef}
                          onSelect={handleFileSelect}
                          onClear={() => {
                            setProofFile(null);
                            setProofPreview(null);
                          }}
                        />

                        {cryptoError && <ErrorBanner message={cryptoError} />}

                        <GoldButton
                          onClick={handleCryptoSubmit}
                          disabled={cryptoLoading}
                          style={{
                            alignSelf: "flex-start",
                            opacity: cryptoLoading ? 0.6 : 1,
                          }}
                        >
                          {cryptoLoading
                            ? "Submitting…"
                            : "I've Sent the Funds"}
                        </GoldButton>
                      </>
                    )}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* ── Card ── */}
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
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ShieldCheck size={12} color="#4ade80" /> SSL Secured
                      </span>
                    </div>

                    {/* Proof upload */}
                    <ProofUpload
                      file={proofFile}
                      preview={proofPreview}
                      inputRef={fileInputRef}
                      onSelect={handleFileSelect}
                      onClear={() => {
                        setProofFile(null);
                        setProofPreview(null);
                      }}
                      label="Upload Payment Receipt"
                    />

                    {cardError && <ErrorBanner message={cardError} />}

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
                fontSize: 36,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {fmt(balance)}
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
                ["Card Payment", "1–24 hours"],
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
                {["Date", "Amount", "Method", "Status"].map((c) => (
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
              {depLoading ? (
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
              ) : deposits.length === 0 ? (
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
                        color: d.status === "Approved" ? "#4ade80" : "#D6DEE8",
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
                      {d.method}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={statusLabel[d.status] ?? d.status}
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

/* ── Shared sub-components ── */

function ProofUpload({
  file,
  preview,
  inputRef,
  onSelect,
  onClear,
  label = "Upload Transaction Screenshot / Hash",
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed rgba(201,168,76,0.25)",
            borderRadius: 10,
            padding: "28px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")
          }
        >
          <Upload size={22} color="#C9A84C" style={{ marginBottom: 8 }} />
          <p
            style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.6, margin: 0 }}
          >
            Click to upload (JPG, PNG, WEBP, PDF · max 10 MB)
          </p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 10,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(74,222,128,0.05)",
          }}
        >
          {preview && preview !== "pdf" ? (
            <img
              src={preview}
              alt="proof"
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: 6,
                flexShrink: 0,
              }}
            />
          ) : (
            <FileImage size={40} color="#C9A84C" style={{ flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                color: "#fff",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#4ade80",
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CheckCircle size={12} color="#4ade80" /> Ready to upload
            </div>
          </div>
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
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
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      {message}
    </div>
  );
}
