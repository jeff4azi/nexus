import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

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

export default function LoginPage() {
  const { signIn, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated (handles back-button after login)
  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate("/portal/dashboard", { replace: true });
    }
  }, [isAuthenticated, ready, navigate]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: signInError } = await signIn(form.email, form.password);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : signInError.message,
      );
      setSubmitting(false);
      return;
    }
    // onAuthStateChange fires → isAuthenticated becomes true → useEffect navigates
  };

  if (!ready) return null;

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
              Welcome back
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
              Sign in to your investment account
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
              custom={3}
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
                autoComplete="current-password"
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
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "#C9A84C",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <button
                type="submit"
                disabled={submitting}
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
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: submitting ? 0.75 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {submitting ? (
                  <>
                    <Spinner /> Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={16} /> Sign In
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            custom={6}
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
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#C9A84C",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Create one
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          custom={7}
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
