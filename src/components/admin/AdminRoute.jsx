import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }) {
  const { ready, isAuthenticated, profile } = useAuth();
  if (!ready || (isAuthenticated && !profile)) return <div style={{ minHeight: "100vh", background: "#0A0E1A", color: "#C9A84C", display: "grid", placeItems: "center", fontFamily: "DM Sans, sans-serif" }}>Verifying operations access…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!["admin", "super_admin"].includes(profile?.role)) return <Navigate to="/portal/dashboard" replace />;
  return children;
}
