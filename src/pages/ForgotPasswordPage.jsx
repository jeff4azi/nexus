import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, Check, AlertCircle } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

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
          {!sent ? (
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
                <Mail size={26} color="#C9A84C" />
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
                  Reset your password
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
                  Enter the email address associated with your account and we'll
                  send you a secure reset link.
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
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
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
                    Email Address <span style={{ color: "#C9A84C" }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: 10,
                      padding: "14px 16px",
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
                </motion.div>

                <motion.div
                  custom={5}
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
                        <Spinner /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Reset Link
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: "center", padding: "16px 0" }}
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
                Check your inbox
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  color: "#D6DEE8",
                  opacity: 0.7,
                  lineHeight: 1.75,
                  marginBottom: 8,
                }}
              >
                We've sent a password reset link to
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
                {email}
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "#D6DEE8",
                  opacity: 0.5,
                  lineHeight: 1.7,
                }}
              >
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#C9A84C",
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  try again
                </button>
                .
              </p>
            </motion.div>
          )}

          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ marginTop: 32, display: "flex", justifyContent: "center" }}
          >
            <Link
              to="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#D6DEE8",
                opacity: 0.6,
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              <ArrowLeft size={15} /> Back to Sign In
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
