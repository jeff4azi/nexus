import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useTransactions() {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[transactions]", error.message);
        else setTransactions(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { transactions, loading };
}

export function useUserInvestments() {
  const { session } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("user_investments")
      .select(
        "*, investment_plans(name, tier, roi_percent, duration_hrs, payout_type, risk_level)",
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[user_investments]", error.message);
        else setInvestments(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { investments, loading };
}

export function useInvestmentPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_amount", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("[investment_plans]", error.message);
        else setPlans(data ?? []);
        setLoading(false);
      });
  }, []);

  return { plans, loading };
}

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[notifications]", error.message);
        else setNotifications(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  async function markRead(id) {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllRead() {
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id);
  }

  return { notifications, loading, markRead, markAllRead };
}

export function useBankAccounts() {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[bank_accounts]", error.message);
        else setAccounts(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  async function addAccount(payload) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({ ...payload, user_id: session.user.id })
      .select()
      .single();
    if (data) setAccounts((a) => [data, ...a]);
    return { data, error };
  }

  async function removeAccount(id) {
    setAccounts((a) => a.filter((acc) => acc.id !== id));
    await supabase.from("bank_accounts").delete().eq("id", id);
  }

  async function setDefault(id) {
    setAccounts((a) => a.map((acc) => ({ ...acc, is_default: acc.id === id })));
    await supabase
      .from("bank_accounts")
      .update({ is_default: false })
      .eq("user_id", session.user.id);
    await supabase
      .from("bank_accounts")
      .update({ is_default: true })
      .eq("id", id);
  }

  return { accounts, loading, addAccount, removeAccount, setDefault };
}

export function useCryptoWallets() {
  const { session } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("crypto_wallets")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[crypto_wallets]", error.message);
        else setWallets(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  async function addWallet(payload) {
    const { data, error } = await supabase
      .from("crypto_wallets")
      .insert({ ...payload, user_id: session.user.id })
      .select()
      .single();
    if (data) setWallets((items) => [data, ...items]);
    return { data, error };
  }

  async function removeWallet(id) {
    const { error } = await supabase
      .from("crypto_wallets")
      .delete()
      .eq("id", id);
    if (!error)
      setWallets((items) => items.filter((wallet) => wallet.id !== id));
    return { error };
  }

  return { wallets, loading, addWallet, removeWallet };
}

export function useLoginSessions() {
  const { session } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("login_sessions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) console.error("[login_sessions]", error.message);
        else setSessions(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { sessions, loading };
}

export function useWithdrawals() {
  const { session } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("withdrawal_requests")
      .select(
        "*, crypto_wallets(asset, network, wallet_address), transactions(reference)",
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[withdrawals]", error.message);
        else setWithdrawals(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { withdrawals, loading };
}

export function useDeposits() {
  const { session } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    // Read from deposit_requests so pending deposits show up immediately,
    // not just completed ones from the transactions table.
    supabase
      .from("deposit_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[deposits]", error.message);
        else setDeposits(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { deposits, loading };
}

export function useDocuments() {
  const { session } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[documents]", error.message);
        else setDocuments(data ?? []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { documents, loading };
}
