import { useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  Upload,
  Plus,
  Trash2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useAuth } from "../../context/AuthContext";
import { useCryptoWallets, useLoginSessions } from "../../hooks/usePortalData";
import { supabase } from "../../lib/supabase";

const tabs = [
  "Personal Info",
  "Security",
  "Crypto Wallets",
  "Preferences",
  "Notifications",
];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.3s",
        background: on
          ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.3s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#D6DEE8",
          opacity: 0.65,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        style={{
          background: readOnly
            ? "rgba(255,255,255,0.02)"
            : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: 8,
          padding: "12px 14px",
          color: readOnly ? "#D6DEE8" : "#fff",
          fontSize: 14,
          outline: "none",
          fontFamily: "DM Sans, sans-serif",
          opacity: readOnly ? 0.6 : 1,
          cursor: readOnly ? "not-allowed" : "text",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          if (!readOnly) e.target.style.borderColor = "rgba(201,168,76,0.5)";
        }}
        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
      />
      {hint && (
        <p style={{ fontSize: 11, color: "#D6DEE8", opacity: 0.4, margin: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const { sessions, loading: sessionsLoading } = useLoginSessions();
  const {
    wallets,
    loading: walletsLoading,
    addWallet,
    removeWallet,
  } = useCryptoWallets();

  const [activeTab, setActiveTab] = useState("Personal Info");
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    dob: user?.dateOfBirth ?? "",
    country: user?.country ?? "",
    city: user?.city ?? "",
    address: user?.address ?? "",
    ssnLast4: "",
  });
  const [newWallet, setNewWallet] = useState({
    asset: "USDT",
    network: "TRC-20",
    wallet_address: "",
    label: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Transaction PIN state
  const hasPin = !!profile?.transaction_pin_hash;
  const [pinForm, setPinForm] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [showPinFields, setShowPinFields] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  const [saved, setSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    depositEmail: true,
    withdrawalEmail: true,
    planActivatedEmail: true,
    maturityReminderEmail: true,
    maturedEmail: true,
    statementEmail: false,
    newLoginEmail: true,
    passwordChangedEmail: true,
    kycEmail: true,
    depositApp: true,
    withdrawalApp: true,
    planActivatedApp: true,
    maturityReminderApp: true,
    maturedApp: true,
    statementApp: false,
    newLoginApp: true,
    passwordChangedApp: false,
    kycApp: true,
  });

  const set = (f) => (v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    const { error } = await updateProfile({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim() || null,
      date_of_birth: form.dob || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      address: form.address.trim() || null,
      ssn_last4: form.ssnLast4.trim() || null,
    });
    if (error) return console.error("[profile update]", error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  async function handlePinSave(e) {
    e.preventDefault();
    setPinError("");
    if (!/^\d{4}$/.test(pinForm.newPin)) {
      setPinError("New PIN must be exactly 4 digits.");
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError("PINs do not match.");
      return;
    }
    if (hasPin && !pinForm.oldPin) {
      setPinError("Please enter your current PIN.");
      return;
    }
    setPinLoading(true);
    const { error } = await supabase.rpc("set_transaction_pin", {
      p_new_pin: pinForm.newPin,
      p_old_pin: hasPin ? pinForm.oldPin : null,
    });
    setPinLoading(false);
    if (error) {
      const msg = error.message ?? "";
      if (msg.toLowerCase().includes("incorrect")) {
        setPinError("Current PIN is incorrect.");
      } else {
        setPinError(msg || "Could not update PIN. Please try again.");
      }
      return;
    }
    setPinForm({ oldPin: "", newPin: "", confirmPin: "" });
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 3000);
  }

  async function handleAddWallet() {
    if (!newWallet.wallet_address.trim()) return;
    const { error } = await addWallet({
      ...newWallet,
      wallet_address: newWallet.wallet_address.trim(),
      label: newWallet.label.trim() || null,
    });
    if (error) return console.error("[crypto wallet]", error.message);
    setNewWallet({
      asset: "USDT",
      network: "TRC-20",
      wallet_address: "",
      label: "",
    });
  }

  const notifGroups = [
    { key: "depositEmail", label: "Deposit confirmed" },
    { key: "withdrawalEmail", label: "Withdrawal processed" },
    { key: "planActivatedEmail", label: "Investment plan activated" },
    { key: "maturityReminderEmail", label: "Plan maturity reminder (7 days)" },
    { key: "maturedEmail", label: "Plan matured and payout credited" },
    { key: "statementEmail", label: "Monthly statement ready" },
    { key: "newLoginEmail", label: "Login from new device" },
    { key: "passwordChangedEmail", label: "Password changed" },
    { key: "kycEmail", label: "KYC status update" },
  ];

  return (
    <div>
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your personal information, security, and preferences."
      />

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 28,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: 12,
          padding: 5,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              transition: "all 0.2s",
              fontFamily: "DM Sans, sans-serif",
              whiteSpace: "nowrap",
              background:
                activeTab === t
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "transparent",
              color: activeTab === t ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Personal Info ── */}
      {activeTab === "Personal Info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionCard title="Profile Photo">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#0A0E1A",
                  flexShrink: 0,
                }}
              >
                {user?.firstName?.[0] ?? ""}
                {user?.lastName?.[0] ?? ""}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <GoldButton variant="outline">
                  <Upload size={13} /> Upload Photo
                </GoldButton>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Personal Details">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
              className="portal-two-col"
            >
              <Field
                label="First Name"
                value={form.firstName}
                onChange={set("firstName")}
              />
              <Field
                label="Last Name"
                value={form.lastName}
                onChange={set("lastName")}
              />
              <Field
                label="Email Address"
                value={user?.email ?? ""}
                readOnly
                hint="Contact support to change your email."
              />
              <Field
                label="Phone Number"
                value={form.phone}
                onChange={set("phone")}
                type="tel"
              />
              <Field
                label="Date of Birth"
                value={form.dob}
                onChange={set("dob")}
                type="date"
              />
              <Field
                label="Country"
                value={form.country}
                onChange={set("country")}
              />
              <Field label="City" value={form.city} onChange={set("city")} />
              <Field
                label="Residential Address"
                value={form.address}
                onChange={set("address")}
              />
              <Field
                label="SSN (last 4 digits, optional)"
                value={form.ssnLast4}
                onChange={set("ssnLast4")}
                hint="Used only to begin identity verification. We do not store your full SSN."
                inputMode="numeric"
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <GoldButton onClick={handleSave}>
                {saved ? (
                  <>
                    <Check size={14} /> Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </GoldButton>
            </div>
          </SectionCard>

          <SectionCard title="KYC / Identity Verification">
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
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.7 }}
                  >
                    Verification Status:
                  </span>
                  <Badge
                    label={
                      user?.kycStatus === "Verified"
                        ? "✓ Verified"
                        : (user?.kycStatus ?? "Unverified")
                    }
                    color={user?.kycStatus === "Verified" ? "green" : "amber"}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Account Details">
            {[
              ["Account ID", user?.accountId ?? "—"],
              ["Account Type", user?.accountType ?? "—"],
              ["Date Joined", user?.dateJoined ?? "—"],
              ["Account Status", user?.accountStatus ?? "—"],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.55 }}>
                  {l}
                </span>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                  {v}
                </span>
              </div>
            ))}
          </SectionCard>
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === "Security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionCard title="Change Password">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 440,
              }}
            >
              {[
                { key: "current", label: "Current Password" },
                { key: "new", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#D6DEE8",
                      opacity: 0.65,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {f.label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[f.key] ? "text" : "password"}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderRadius: 8,
                        padding: "12px 44px 12px 14px",
                        color: "#fff",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPw((p) => ({ ...p, [f.key]: !p[f.key] }))
                      }
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
                      {showPw[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "At least 8 characters",
                  "One uppercase letter",
                  "One number",
                  "One special character",
                ].map((r) => (
                  <div
                    key={r}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 12,
                      color: "#D6DEE8",
                      opacity: 0.5,
                    }}
                  >
                    <span style={{ color: "#C9A84C" }}>·</span> {r}
                  </div>
                ))}
              </div>
              <GoldButton style={{ alignSelf: "flex-start" }}>
                Update Password
              </GoldButton>
            </div>
          </SectionCard>

          <SectionCard title="Transaction PIN">
            <p
              style={{
                fontSize: 13,
                color: "#D6DEE8",
                opacity: 0.65,
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Your 4-digit PIN is required to authorise every withdrawal
              request.{" "}
              {hasPin
                ? "Change it below."
                : "Set one up to enable withdrawals."}
            </p>

            {pinSaved && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <Check size={15} color="#4ade80" />
                <span style={{ fontSize: 13, color: "#4ade80" }}>
                  Transaction PIN {hasPin ? "updated" : "set"} successfully.
                </span>
              </div>
            )}

            {pinError && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "12px 16px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <AlertCircle
                  size={15}
                  color="#f87171"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span style={{ fontSize: 13, color: "#f87171" }}>
                  {pinError}
                </span>
              </div>
            )}

            <form
              onSubmit={handlePinSave}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 340,
              }}
            >
              {hasPin && (
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#D6DEE8",
                      opacity: 0.65,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Current PIN
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPinFields.old ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={pinForm.oldPin}
                      onChange={(e) =>
                        setPinForm((p) => ({
                          ...p,
                          oldPin: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        borderRadius: 8,
                        padding: "12px 44px 12px 14px",
                        color: "#fff",
                        fontSize: 20,
                        letterSpacing: 6,
                        outline: "none",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPinFields((p) => ({ ...p, old: !p.old }))
                      }
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
                      {showPinFields.old ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#D6DEE8",
                    opacity: 0.65,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {hasPin ? "New PIN" : "Set PIN"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPinFields.new ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pinForm.newPin}
                    onChange={(e) =>
                      setPinForm((p) => ({
                        ...p,
                        newPin: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 8,
                      padding: "12px 44px 12px 14px",
                      color: "#fff",
                      fontSize: 20,
                      letterSpacing: 6,
                      outline: "none",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPinFields((p) => ({ ...p, new: !p.new }))
                    }
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
                    {showPinFields.new ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#D6DEE8",
                    opacity: 0.65,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Confirm PIN
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPinFields.confirm ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pinForm.confirmPin}
                    onChange={(e) =>
                      setPinForm((p) => ({
                        ...p,
                        confirmPin: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4),
                      }))
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 8,
                      padding: "12px 44px 12px 14px",
                      color: "#fff",
                      fontSize: 20,
                      letterSpacing: 6,
                      outline: "none",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPinFields((p) => ({ ...p, confirm: !p.confirm }))
                    }
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
                    {showPinFields.confirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {pinForm.confirmPin &&
                  pinForm.newPin !== pinForm.confirmPin && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#f87171",
                        margin: "5px 0 0",
                      }}
                    >
                      PINs do not match
                    </p>
                  )}
              </div>

              <GoldButton
                type="submit"
                disabled={
                  pinLoading ||
                  pinForm.newPin.length < 4 ||
                  pinForm.confirmPin.length < 4 ||
                  (hasPin && pinForm.oldPin.length < 4)
                }
                style={{
                  alignSelf: "flex-start",
                  opacity:
                    pinLoading ||
                    pinForm.newPin.length < 4 ||
                    pinForm.confirmPin.length < 4 ||
                    (hasPin && pinForm.oldPin.length < 4)
                      ? 0.55
                      : 1,
                }}
              >
                <KeyRound size={14} />
                {pinLoading
                  ? "Saving…"
                  : hasPin
                    ? "Update PIN"
                    : "Set Transaction PIN"}
              </GoldButton>
            </form>
          </SectionCard>

          <SectionCard title="Login Activity">
            {sessionsLoading ? (
              <p style={{ color: "#D6DEE8", opacity: 0.4, fontSize: 13 }}>
                Loading…
              </p>
            ) : sessions.length === 0 ? (
              <p
                style={{
                  color: "#D6DEE8",
                  opacity: 0.4,
                  fontSize: 13,
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No login sessions recorded.
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
                        "Date & Time",
                        "Device",
                        "Browser",
                        "IP Address",
                        "Location",
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
                    {sessions.map((s) => (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <td
                          style={{
                            padding: "13px 14px",
                            color: "#D6DEE8",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDate(s.created_at)}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {s.device ?? "—"}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {s.browser ?? "—"}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {s.ip_address ?? "—"}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#D6DEE8" }}>
                          {s.location ?? "—"}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <Badge
                            label={s.is_current ? "Current" : "Ended"}
                            color={s.is_current ? "green" : "grey"}
                          />
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

      {/* ── Crypto Wallets ── */}
      {activeTab === "Crypto Wallets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionCard title="Saved Crypto Wallets">
            <p
              style={{
                color: "#D6DEE8",
                opacity: 0.65,
                fontSize: 13,
                marginTop: 0,
              }}
            >
              Add a wallet you own for crypto withdrawals. Confirm the network
              carefully; transfers cannot be reversed.
            </p>
            {walletsLoading ? (
              <p style={{ color: "#D6DEE8", opacity: 0.6 }}>Loading wallets…</p>
            ) : wallets.length === 0 ? (
              <p style={{ color: "#D6DEE8", opacity: 0.6 }}>
                No crypto wallets saved yet.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: 14,
                      border: "1px solid rgba(201,168,76,0.15)",
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <strong style={{ color: "#fff" }}>
                        {wallet.label || `${wallet.asset} wallet`}
                      </strong>
                      <div
                        style={{
                          color: "#D6DEE8",
                          opacity: 0.65,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {wallet.asset} · {wallet.network} ·{" "}
                        {wallet.wallet_address}
                      </div>
                    </div>
                    <button
                      onClick={() => removeWallet(wallet.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
          <SectionCard title="Add Crypto Wallet">
            <div
              className="portal-two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                ["asset", "Asset (e.g. USDT)"],
                ["network", "Network (e.g. TRC-20)"],
                ["label", "Wallet label (optional)"],
                ["wallet_address", "Wallet address"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={newWallet[key]}
                  onChange={(value) =>
                    setNewWallet((current) => ({ ...current, [key]: value }))
                  }
                />
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <GoldButton onClick={handleAddWallet}>
                <Plus size={14} /> Save Wallet
              </GoldButton>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Preferences ── */}
      {activeTab === "Preferences" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionCard title="Display Preferences">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Theme", options: ["Dark"] },
                { label: "Language", options: ["English"] },
              ].map((pref) => (
                <div
                  key={pref.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.8 }}
                  >
                    {pref.label}
                  </span>
                  <select
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.15)",
                      borderRadius: 8,
                      padding: "9px 14px",
                      color: "#D6DEE8",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {pref.options.map((o) => (
                      <option key={o} style={{ background: "#0F1422" }}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Notifications ── */}
      {activeTab === "Notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionCard title="Email Notifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {notifGroups.map((n) => (
                <div
                  key={n.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.8 }}
                  >
                    {n.label}
                  </span>
                  <Toggle
                    on={notifPrefs[n.key]}
                    onChange={(v) =>
                      setNotifPrefs((p) => ({ ...p, [n.key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      <style>{`@media (max-width: 768px) { .portal-two-col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
