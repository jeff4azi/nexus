import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, AlertCircle, KeyRound } from "lucide-react";
import logo from "../assets/logo.png";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.08 },
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

function AuthInput({ label, type, placeholder, value, onChange, rightEl }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#D6DEE8",
          opacity: 0.8,
        }}
      >
        {label} <span style={{ color: "#C9A84C" }}>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required
          autoComplete="new-password"
          placeholder={placeholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 10,
            padding: "14px 48px 14px 16px",
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
        <button
          type="button"
          onClick={rightEl.onClick}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#C9A84C",
            display: "flex",
            padding: 0,
          }}
        >
          {rightEl.icon}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Each field has its own independent show-state
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // Three states: "checking" | "valid" | "invalid"
  const [sessionStatus, setSessionStatus] = useState("checking");

  useEffect(() => {
    // Supabase parses the token from the URL hash and sets a session automatically.
    // We listen for PASSWORD_RECOVERY to confirm the link is genuine.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionStatus("valid");
      }
    });

    // Fallback: if session already exists (e.g. page refresh after token consumed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionStatus("valid");
      else {
        // Give the hash-parsing a moment before declaring invalid
        setTimeout(() => {
          setSessionStatus((prev) =>
            prev === "checking" ? "invalid" : prev,
          );
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  // --- Render states ---

  if (sessionStatus === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0E1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(201,168,76,0.15)",
            borderTopColor: "#C9A84C",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (sessionStatus === "invalid") {
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
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 460,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 24,
            padding: "48px 40px",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AlertCircle size={28} color="#f87171" />
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
            Link expired or invalid
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              color: "#D6DEE8",
              opacity: 0.7,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            This password reset link has expired or already been used. Please
            request a new one.
          </p>
          <Link
            to="/forgot-password"
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
            Request New Link
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0E1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <FloatingOrbs />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 460,
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
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Check size={30} color="#0A0E1A" />
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
                Password Updated
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  color: "#D6DEE8",
                  opacity: 0.7,
                  lineHeight: 1.7,
                }}
              >
                Your password has been changed successfully. Redirecting you to
                sign in…
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 28,
                }}
              >
                <KeyRound size={26} color="#C9A84C" />
              </motion.div>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                style={{ marginBottom: 32 }}
              >
                <h1
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 10px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Set new password
                </h1>
                <p
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 14,
                    color: "#D6DEE8",
                    opacity: 0.65,
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  Choose a strong password for your account.
                </p>
              </motion.div>

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
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <AuthInput
                    label="New Password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightEl={{
                      onClick: () => setShowPw((p) => !p),
                      icon: showPw ? <EyeOff size={17} /> : <Eye size={17} />,
                    }}
                  />
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
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    rightEl={{
                      onClick: () => setShowConfirm((p) => !p),
                      icon: showConfirm ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      ),
                    }}
                  />
                  {confirm && password !== confirm && (
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
                >
                  <button
                    type="submit"
                    disabled={loading}
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
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: loading ? 0.75 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner /> Updating…
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Update Password
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
