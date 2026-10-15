import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = not yet resolved
  const [profile, setProfile] = useState(null);

  // ready = we've gotten the initial session response from Supabase
  const ready = session !== undefined;

  useEffect(() => {
    // Get the current session immediately on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ?? null);
      // Only load profile for confirmed users — unconfirmed signups return a
      // session immediately when email confirmation is disabled; we guard here
      // so the rest of the app never sees them as authenticated.
      if (s?.user && s.user.email_confirmed_at) {
        loadProfile(s.user.id);
      }
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s ?? null);
      if (s?.user && s.user.email_confirmed_at) {
        loadProfile(s.user.id);
      } else if (!s?.user) {
        setProfile(null);
      }
      // If the user exists but hasn't confirmed their email yet (event ===
      // 'SIGNED_IN' immediately after signUp with confirmation disabled),
      // we intentionally leave profile null so isAuthenticated stays false.
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    } else {
      console.error(
        "[Auth] profile fetch failed:",
        error?.code,
        error?.message,
      );
    }
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    country,
    city,
    address,
  ) {
    // Validate date format before it reaches the DB trigger.
    // The trigger casts this to ::date — a bad string would crash it silently.
    const isValidDate = (d) => {
      if (!d) return false;
      const re = /^\d{4}-\d{2}-\d{2}$/;
      if (!re.test(d)) return false;
      const parsed = new Date(d);
      return !isNaN(parsed.getTime());
    };

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          date_of_birth: isValidDate(dateOfBirth) ? dateOfBirth : null,
          country: country || null,
          city: city || null,
          address: address || null,
        },
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/login";
  }

  async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id);
  }

  async function updateProfile(changes) {
    if (!session?.user) return { error: new Error("You must be signed in") };
    const { data, error } = await supabase.rpc("update_my_profile", {
      p_first_name: changes.first_name,
      p_last_name: changes.last_name,
      p_phone: changes.phone,
      p_date_of_birth: changes.date_of_birth,
      p_country: changes.country,
      p_city: changes.city,
      p_address: changes.address,
      p_ssn_last4: changes.ssn_last4,
    });
    if (data) setProfile(data);
    return { data, error };
  }

  const user = profile
    ? {
        id: profile.id,
        firstName: profile.first_name || "User",
        lastName: profile.last_name || "",
        email: session?.user?.email ?? "",
        accountId: profile.account_id || "—",
        accountType: profile.account_type || "Individual",
        accountStatus: profile.account_status || "Pending",
        dateJoined: profile.created_at
          ? new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "—",
        lastLogin: profile.last_login_at
          ? new Date(profile.last_login_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        kycStatus: profile.kyc_status || "Unverified",
        riskProfile: profile.risk_profile || "Balanced",
        avatarUrl: profile.avatar_url || null,
        phone: profile.phone || "",
        dateOfBirth: profile.date_of_birth || "",
        country: profile.country || "",
        city: profile.city || "",
        address: profile.address || "",
      }
    : null;

  // A user is only considered authenticated once their email is confirmed.
  // Supabase returns a session immediately after signUp (even before confirmation),
  // so we must explicitly check email_confirmed_at here.
  const isAuthenticated = !!session?.user?.email_confirmed_at;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        ready,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
