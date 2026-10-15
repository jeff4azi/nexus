import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, Check, AlertCircle } from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.07 },
  }),
};

function FloatingOrbs() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          top: "-15%",
          left: "-10%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          bottom: "-10%",
          right: "-5%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  rightEl,
  autoComplete,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#D6DEE8",
          opacity: 0.8,
          letterSpacing: 0.3,
        }}
      >
        {label}
        {required && <span style={{ color: "#C9A84C" }}> *</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 10,
            padding: rightEl ? "14px 48px 14px 16px" : "14px 16px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "#fff",
            outline: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(201,168,76,0.55)";
            e.target.style.background = "rgba(255,255,255,0.06)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(201,168,76,0.2)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
        {rightEl && (
          <div
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}
    >
      {checks.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: c.pass
                ? "rgba(201,168,76,0.2)"
                : "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {c.pass && <Check size={10} color="#C9A84C" />}
          </div>
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              color: c.pass ? "#C9A84C" : "#D6DEE8",
              opacity: c.pass ? 1 : 0.45,
              transition: "all 0.2s",
            }}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{
        width: 16,
        height: 16,
        border: "2px solid rgba(10,14,26,0.3)",
        borderTopColor: "#0A0E1A",
        borderRadius: "50%",
      }}
    />
  );
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    country: "",
    city: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);

    const { data, error } = await signUp(
      form.email,
      form.password,
      form.firstName,
      form.lastName,
      form.phone,
      form.dateOfBirth,
      form.country,
      form.city,
      form.address,
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Issue 3 fix: verify the DB trigger actually created the profile row.
    // We poll for up to ~5 seconds. If it never appears we surface a clear
    // error rather than silently showing the success screen with a broken account.
    const userId = data?.user?.id;
    if (userId) {
      const MAX_ATTEMPTS = 10;
      const DELAY_MS = 500;
      let profileFound = false;

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        if (profileRow) {
          profileFound = true;
          break;
        }
      }

      if (!profileFound) {
        setError(
          "Your account was created but your profile could not be set up. " +
            "Please contact support with your email address.",
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setEmailSent(true);
  };

  if (emailSent)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0E1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          position: "relative",
        }}
      >
        <FloatingOrbs />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 460,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 24,
            padding: "48px 40px",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={32} color="#0A0E1A" />
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
            Check your email
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              color: "#D6DEE8",
              opacity: 0.7,
              marginBottom: 8,
              lineHeight: 1.7,
            }}
          >
            We've sent a confirmation link to
          </p>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              color: "#C9A84C",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            {form.email}
          </p>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "#D6DEE8",
              opacity: 0.5,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Click the link in the email to verify your account, then sign in.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
              color: "#0A0E1A",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 40px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Go to Sign In
          </Link>
        </motion.div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0E1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
      }}
    >
      <FloatingOrbs />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 520,
        }}
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="Nexus Yield Group"
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
          </Link>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 24,
            padding: "48px 40px",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 34,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Create your account
            </h1>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#D6DEE8",
                opacity: 0.65,
                margin: 0,
              }}
            >
              Start growing your wealth with Nexus Yield Group
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 16px",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <AlertCircle
                size={16}
                color="#f87171"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "#f87171",
                }}
              >
                {error}
              </span>
            </motion.div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <AuthInput
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChange={set("firstName")}
                required
                autoComplete="given-name"
              />
              <AuthInput
                label="Last Name"
                placeholder="Smith"
                value={form.lastName}
                onChange={set("lastName")}
                required
                autoComplete="family-name"
              />
            </motion.div>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div
              custom={3.5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
              />
            </motion.div>

            <motion.div
              custom={3.6}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
                autoComplete="bday"
              />
            </motion.div>

            <motion.div
              custom={3.7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <AuthInput
                label="Country"
                placeholder="United States"
                value={form.country}
                onChange={set("country")}
                autoComplete="country-name"
              />
              <AuthInput
                label="City"
                placeholder="New York"
                value={form.city}
                onChange={set("city")}
                autoComplete="address-level2"
              />
            </motion.div>

            <motion.div
              custom={3.8}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Residential Address"
                placeholder="123 Main St"
                value={form.address}
                onChange={set("address")}
                autoComplete="street-address"
              />
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
                autoComplete="new-password"
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#C9A84C",
                      display: "flex",
                    }}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AuthInput
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm}
                onChange={set("confirm")}
                required
                autoComplete="new-password"
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#C9A84C",
                      display: "flex",
                    }}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
              {form.confirm && form.password !== form.confirm && (
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12,
                    color: "#f87171",
                    margin: "6px 0 0",
                  }}
                >
                  Passwords do not match
                </p>
              )}
            </motion.div>

            <motion.div
              custom={6}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
            >
              <button
                type="button"
                onClick={() => setAgreed((p) => !p)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  flexShrink: 0,
                  marginTop: 1,
                  background: agreed
                    ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                    : "rgba(255,255,255,0.04)",
                  border: agreed ? "none" : "1px solid rgba(201,168,76,0.3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {agreed && <Check size={12} color="#0A0E1A" />}
              </button>
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "#D6DEE8",
                  opacity: 0.7,
                  lineHeight: 1.6,
                }}
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#C9A84C", textDecoration: "none" }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#C9A84C", textDecoration: "none" }}
                >
                  Privacy Policy
                </Link>
              </span>
            </motion.div>

            <motion.div
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <button
                type="submit"
                disabled={loading || !agreed}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                  color: "#0A0E1A",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "15px",
                  borderRadius: 10,
                  border: "none",
                  cursor: loading || !agreed ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading || !agreed ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <Spinner /> Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{
              marginTop: 28,
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              color: "#D6DEE8",
              opacity: 0.65,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#C9A84C",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          custom={9}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            textAlign: "center",
            marginTop: 24,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "#D6DEE8",
            opacity: 0.35,
          }}
        >
          © {new Date().getFullYear()} Nexus Yield Group. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
