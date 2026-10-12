import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Spinner() {
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

export default function ProtectedRoute({ children }) {
  const { ready, isAuthenticated, session } = useAuth();

  if (!ready) return <Spinner />;

  // Guard against unconfirmed accounts: Supabase can return a live session
  // immediately after signUp if email confirmation is disabled in the project
  // settings. We treat those sessions as unauthenticated so users cannot
  // access the portal until their email is confirmed.
  if (!isAuthenticated || !session?.user?.email_confirmed_at) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
