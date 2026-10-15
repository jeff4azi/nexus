import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Eye,
  Landmark,
  Mail,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Badge, KPICard, SectionCard } from "../../components/portal/PortalUI";

const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n || 0),
  );
const date = (v) =>
  v
    ? new Date(v).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const tone = (s = "") =>
  /paid|approved|completed|active|verified/i.test(s)
    ? "green"
    : /failed|rejected|cancelled/i.test(s)
      ? "red"
      : /processing/i.test(s)
        ? "blue"
        : "amber";
const button = (kind = "gold") => ({
  border: `1px solid ${kind === "danger" ? "rgba(248,113,113,.45)" : "rgba(201,168,76,.45)"}`,
  background:
    kind === "danger" ? "rgba(248,113,113,.1)" : "rgba(201,168,76,.13)",
  color: kind === "danger" ? "#fca5a5" : "#E8C86D",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
});
function State({ loading, error, empty, children }) {
  if (loading)
    return (
      <div style={{ padding: 38, color: "#8d9bad", textAlign: "center" }}>
        Loading operations data…
      </div>
    );
  if (error)
    return (
      <div
        style={{
          padding: 24,
          border: "1px solid rgba(248,113,113,.3)",
          color: "#fca5a5",
          background: "rgba(248,113,113,.06)",
          borderRadius: 10,
        }}
      >
        Could not load this queue. {error}
      </div>
    );
  if (empty)
    return (
      <div style={{ padding: 38, textAlign: "center", color: "#8390a3" }}>
        Nothing requires attention right now.
      </div>
    );
  return children;
}
function Dialog({ item, mode, onClose, onComplete }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [proofUrl, setProofUrl] = useState(null);
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    returnFocus.current = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(
      () => dialogRef.current?.querySelector("button, textarea")?.focus(),
      0,
    );

    if (item.proof_url) {
      supabase.storage
        .from("deposit-proofs")
        .createSignedUrl(item.proof_url, 300)
        .then(({ data }) => {
          if (data?.signedUrl) setProofUrl(data.signedUrl);
        });
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
      setProofUrl(null);
    };
  }, [item, onClose]);

  if (!item) return null;

  const act = async (action) => {
    setBusy(true);
    setErr("");

    if (action === "delete") {
      const { error } = await supabase.rpc("admin_delete_deposit", {
        p_deposit_id: item.id,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      onComplete();
      onClose();
      return;
    }

    const rpc =
      mode === "deposit" ? "admin_review_deposit" : "admin_review_withdrawal";
    const args =
      mode === "deposit"
        ? {
            p_deposit_id: item.id,
            p_approve: action === "approve",
            p_note: note || null,
          }
        : {
            p_withdrawal_id: item.id,
            p_status: action === "approve" ? "Paid" : "Rejected",
            p_note: note || null,
          };

    const { error } = await supabase.rpc(rpc, args);
    setBusy(false);
    if (error) return setErr(error.message);
    onComplete();
    onClose();
  };

  const isPending = item.status === "Pending Review";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3,7,14,.8)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        ref={dialogRef}
        style={{
          width: "min(860px,100%)",
          background: "#121a2a",
          border: "1px solid rgba(201,168,76,.28)",
          borderRadius: 14,
          boxShadow: "0 24px 80px #000",
          padding: 28,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                color: "#C9A84C",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
              }}
            >
              REVIEW {mode.toUpperCase()}
            </div>
            <h2
              style={{
                margin: "5px 0 2px",
                color: "#fff",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 32,
              }}
            >
              <span id="review-dialog-title">{money(item.amount)}</span>
            </h2>
            <div style={{ color: "#a6b0bf", fontSize: 13 }}>{item.id}</div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "none",
              border: 0,
              color: "#b6c1cf",
              cursor: "pointer",
            }}
          >
            <X />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: proofUrl ? "1fr 1fr" : "1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "rgba(255,255,255,.03)",
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.9,
            }}
          >
            <Detail
              label="Client"
              value={`${item.user?.first_name || "Unknown"} ${item.user?.last_name || ""}`}
            />
            <Detail
              label="Method"
              value={item.method || item.payment_method || "—"}
            />
            <Detail label="Amount" value={money(item.amount)} highlight />
            <Detail label="Submitted" value={date(item.created_at)} />
            <Detail label="Status" value={item.status} />
            {item.review_note && (
              <Detail label="Prior note" value={item.review_note} />
            )}
          </div>
          {proofUrl && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#8290a2",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                PROOF OF PAYMENT
              </div>
              {item.proof_url?.endsWith(".pdf") ? (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#C9A84C", fontSize: 13 }}
                >
                  Open PDF ↗
                </a>
              ) : (
                <a href={proofUrl} target="_blank" rel="noreferrer">
                  <img
                    src={proofUrl}
                    alt="Proof of payment"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid rgba(201,168,76,.15)",
                      maxHeight: 280,
                      objectFit: "contain",
                      background: "#0a101b",
                    }}
                  />
                </a>
              )}
            </div>
          )}
        </div>

        {isPending && (
          <label
            style={{
              fontSize: 12,
              color: "#b7c2d0",
              display: "block",
              marginBottom: 16,
            }}
          >
            Internal review note (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Proof reference, transaction hash, or rejection reason"
              style={{
                width: "100%",
                minHeight: 72,
                marginTop: 7,
                boxSizing: "border-box",
                background: "#0b101b",
                color: "#fff",
                border: "1px solid rgba(201,168,76,.22)",
                borderRadius: 8,
                padding: 10,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </label>
        )}

        {err && (
          <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 12 }}>
            {err}
          </div>
        )}

        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 9 }}
        >
          <button
            onClick={() => act("delete")}
            disabled={busy}
            style={button("danger")}
          >
            <Trash2
              size={13}
              style={{
                display: "inline",
                marginRight: 4,
                verticalAlign: "middle",
              }}
            />
            Delete
          </button>
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={onClose} style={button("plain")}>
              Cancel
            </button>
            {isPending && (
              <>
                <button
                  disabled={busy}
                  onClick={() => act("reject")}
                  style={button("danger")}
                >
                  Reject
                </button>
                <button
                  disabled={busy}
                  onClick={() => act("approve")}
                  style={button()}
                >
                  {busy
                    ? "Saving…"
                    : mode === "withdrawal"
                      ? "Confirm paid"
                      : "Approve & credit"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
function Detail({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,.05)",
        padding: "6px 0",
      }}
    >
      <span style={{ color: "#8290a2", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: highlight ? "#4ade80" : "#dce4ed",
          fontWeight: highlight ? 700 : 400,
          textAlign: "right",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}
function QueueTable({ rows, mode, review }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr>
            {["Client", "Amount", "Method", "Submitted", "Status", ""].map(
              (x) => (
                <th
                  key={x}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: "#8290a2",
                    fontSize: 10,
                    letterSpacing: 1,
                    borderBottom: "1px solid rgba(201,168,76,.12)",
                  }}
                >
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
            >
              <td style={{ padding: 12, color: "#fff" }}>
                {r.user?.first_name || "Unknown"} {r.user?.last_name || ""}
                <div style={{ color: "#8290a2", fontSize: 11 }}>
                  {r.user?.email}
                </div>
              </td>
              <td style={{ padding: 12, color: "#E8C86D", fontWeight: 700 }}>
                {money(r.amount)}
              </td>
              <td style={{ padding: 12 }}>
                {r.payment_method || r.payment_type || "—"}
              </td>
              <td style={{ padding: 12, color: "#a6b0bf" }}>
                {date(r.created_at)}
              </td>
              <td style={{ padding: 12 }}>
                <Badge label={r.status} color={tone(r.status)} />
              </td>
              <td style={{ padding: 12 }}>
                <button onClick={() => review(r)} style={button()}>
                  <Eye
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 5 }}
                  />
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function useAdminData(table, options = {}) {
  const [data, setData] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    let query = supabase.from(table).select(options.select || "*");
    if (options.filter) query = options.filter(query);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setData(data || []);
    setLoading(false);
  }, [table, options.select]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, loading, error, reload: load };
}
async function attachUsers(rows) {
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  if (!ids.length) return rows;
  const { data } = await supabase
    .from("admin_user_profiles")
    .select(
      "id,first_name,last_name,account_id,account_status,kyc_status,phone,country,city,address,ssn_last4,email",
    )
    .in("id", ids);
  const map = Object.fromEntries((data || []).map((u) => [u.id, u]));
  return rows.map((r) => ({ ...r, user: map[r.user_id] }));
}

export function OverviewPage() {
  const dep = useAdminData("deposit_requests", {
    filter: (q) =>
      q.eq("status", "Pending Review").order("created_at", { ascending: true }),
  });
  const wit = useAdminData("withdrawal_requests", {
    filter: (q) =>
      q
        .in("status", ["Pending", "Approved", "Processing"])
        .order("created_at", { ascending: true }),
  });
  const [clientCount, setClientCount] = useState(0);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [pendingBkCount, setPendingBkCount] = useState(0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "user")
      .then(({ count }) => setClientCount(count ?? 0));

    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "New")
      .then(({ count }) => setNewMsgCount(count ?? 0));

    supabase
      .from("consultation_bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "Pending")
      .then(({ count }) => setPendingBkCount(count ?? 0));
  }, []);
  const [dialog, setDialog] = useState(null);
  const [queues, setQueues] = useState({ d: [], w: [] });
  useEffect(() => {
    Promise.all([attachUsers(dep.data), attachUsers(wit.data)]).then(([d, w]) =>
      setQueues({ d, w }),
    );
  }, [dep.data, wit.data]);
  return (
    <>
      <Title
        eyebrow="OPERATIONS DESK"
        title="Approval control room"
        action={
          <button
            onClick={() => {
              dep.reload();
              wit.reload();
            }}
            style={button()}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />
      <div
        className="admin-kpis"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
        }}
      >
        <KPICard
          label="Pending deposits"
          value={dep.data.length}
          sub="Awaiting proof review"
          icon={Landmark}
          accent={dep.data.length > 0}
        />
        <KPICard
          label="Payment actions"
          value={wit.data.length}
          sub="Pending or in processing"
          icon={Send}
          accent={wit.data.length > 0}
        />
        <KPICard
          label="Client accounts"
          value={clientCount}
          sub="All registered profiles"
          icon={Users}
        />
        <KPICard
          label="Unread messages"
          value={newMsgCount}
          sub="Contact form submissions"
          icon={Users}
          accent={newMsgCount > 0}
        />
        <KPICard
          label="Pending bookings"
          value={pendingBkCount}
          sub="Consultation requests"
          icon={Users}
          accent={pendingBkCount > 0}
        />
      </div>
      <div
        className="admin-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 18,
        }}
      >
        <SectionCard
          title="Deposit queue"
          action="Open queue"
          actionHref="/admin/deposits"
        >
          <State
            loading={dep.loading}
            error={dep.error}
            empty={!queues.d.length}
          >
            <QueueTable
              rows={queues.d.slice(0, 5)}
              mode="deposit"
              review={(r) => setDialog({ mode: "deposit", item: r })}
            />
          </State>
        </SectionCard>
        <SectionCard
          title="Payment approval queue"
          action="Open queue"
          actionHref="/admin/withdrawals"
        >
          <State
            loading={wit.loading}
            error={wit.error}
            empty={!queues.w.length}
          >
            <QueueTable
              rows={queues.w.slice(0, 5)}
              mode="withdrawal"
              review={(r) => setDialog({ mode: "withdrawal", item: r })}
            />
          </State>
        </SectionCard>
      </div>
      <Dialog
        {...(dialog || {})}
        onClose={() => setDialog(null)}
        onComplete={() => {
          dep.reload();
          wit.reload();
        }}
      />
      <Responsive />
    </>
  );
}
export function DepositsPage() {
  return (
    <QueuePage
      title="Deposit approvals"
      eyebrow="FUNDS IN"
      table="deposit_requests"
      mode="deposit"
      filter={(q) => q.order("created_at", { ascending: true })}
    />
  );
}
export function WithdrawalsPage() {
  return (
    <QueuePage
      title="Payment approvals"
      eyebrow="FUNDS OUT"
      table="withdrawal_requests"
      mode="withdrawal"
      filter={(q) => q.order("created_at", { ascending: true })}
    />
  );
}
function QueuePage({ title, eyebrow, table, mode, filter }) {
  const { data, loading, error, reload } = useAdminData(table, { filter });
  const [rows, setRows] = useState([]),
    [dialog, setDialog] = useState(null);
  useEffect(() => {
    attachUsers(data).then(setRows);
  }, [data]);
  return (
    <>
      <Title
        eyebrow={eyebrow}
        title={title}
        action={
          <button onClick={reload} style={button()}>
            <RefreshCw size={13} /> Refresh queue
          </button>
        }
      />
      <SectionCard title={`${rows.length} records`}>
        <State loading={loading} error={error} empty={!rows.length}>
          <QueueTable
            rows={rows}
            mode={mode}
            review={(r) => setDialog({ mode, item: r })}
          />
        </State>
      </SectionCard>
      <Dialog
        {...(dialog || {})}
        onClose={() => setDialog(null)}
        onComplete={reload}
      />
    </>
  );
}
export function UsersPage() {
  const { data, loading, error, reload } = useAdminData("profiles", {
    filter: (q) =>
      q.eq("role", "user").order("created_at", { ascending: false }),
  });
  const [selected, setSelected] = useState(null),
    [search, setSearch] = useState("");
  const shown = useMemo(
    () =>
      data.filter((u) =>
        `${u.first_name} ${u.last_name} ${u.account_id}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [data, search],
  );
  return (
    <>
      <Title
        eyebrow="CLIENT RECORDS"
        title="Client directory"
        action={
          <button onClick={reload} style={button()}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name or account ID"
        style={{
          width: "min(370px,100%)",
          marginBottom: 16,
          background: "#111827",
          border: "1px solid rgba(201,168,76,.2)",
          color: "#fff",
          borderRadius: 8,
          padding: "11px 13px",
        }}
      />
      <SectionCard title={`${shown.length} client profiles`}>
        <State loading={loading} error={error} empty={!shown.length}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {["Client", "Account", "KYC", "Status", "Joined", ""].map(
                    (x) => (
                      <th
                        key={x}
                        style={{
                          textAlign: "left",
                          padding: 10,
                          color: "#8290a2",
                          fontSize: 10,
                          letterSpacing: 1,
                        }}
                      >
                        {x}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {shown.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}
                  >
                    <td style={{ padding: 12, color: "#fff", fontWeight: 700 }}>
                      {u.first_name} {u.last_name}
                      <div
                        style={{
                          color: "#8390a3",
                          fontWeight: 400,
                          fontSize: 11,
                        }}
                      >
                        {u.phone || "No phone recorded"}
                      </div>
                    </td>
                    <td style={{ padding: 12, color: "#E8C86D" }}>
                      {u.account_id}
                    </td>
                    <td style={{ padding: 12 }}>
                      <Badge label={u.kyc_status} color={tone(u.kyc_status)} />
                    </td>
                    <td style={{ padding: 12 }}>
                      <Badge
                        label={u.account_status}
                        color={tone(u.account_status)}
                      />
                    </td>
                    <td style={{ padding: 12 }}>{date(u.created_at)}</td>
                    <td style={{ padding: 12 }}>
                      <button onClick={() => setSelected(u)} style={button()}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </State>
      </SectionCard>
      {selected && (
        <ClientDrawer user={selected} close={() => setSelected(null)} />
      )}
      <Responsive />
    </>
  );
}
function ClientDrawer({ user, close }) {
  const [wallets, setWallets] = useState([]);
  const [kycStatus, setKycStatus] = useState(user.kyc_status ?? "Unverified");
  const [acctStatus, setAcctStatus] = useState(
    user.account_status ?? "Pending",
  );
  const [saving, setSaving] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    supabase
      .from("crypto_wallets")
      .select("asset, network, wallet_address, label")
      .eq("user_id", user.id)
      .then(({ data }) => setWallets(data || []));
  }, [user.id]);

  async function updateKyc() {
    setSaving("kyc");
    const { error } = await supabase.rpc("admin_update_kyc", {
      p_user_id: user.id,
      p_status: kycStatus,
    });
    setSaving("");
    setMsg({ text: error ? error.message : "KYC status updated.", ok: !error });
  }

  async function updateAcctStatus() {
    setSaving("acct");
    const { error } = await supabase.rpc("admin_update_account_status", {
      p_user_id: user.id,
      p_status: acctStatus,
    });
    setSaving("");
    setMsg({
      text: error ? error.message : "Account status updated.",
      ok: !error,
    });
  }

  const selectStyle = {
    background: "#0a101b",
    border: "1px solid rgba(201,168,76,.2)",
    borderRadius: 7,
    padding: "8px 12px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    fontFamily: "DM Sans, sans-serif",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,.62)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <aside
        style={{
          width: "min(520px,100%)",
          background: "#101828",
          padding: 24,
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={close}
          style={{
            float: "right",
            background: "none",
            border: 0,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <X />
        </button>
        <div
          style={{
            color: "#C9A84C",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.4,
          }}
        >
          RESTRICTED CLIENT RECORD
        </div>
        <h2
          style={{
            color: "#fff",
            fontFamily: "Cormorant Garamond,serif",
            fontSize: 32,
            margin: "7px 0 18px",
          }}
        >
          {user.first_name} {user.last_name}
        </h2>

        {/* Profile info */}
        <Record label="Account ID" value={user.account_id} />
        <Record label="Email" value={user.email} />
        <Record label="Phone" value={user.phone} />
        <Record
          label="Address"
          value={[user.address, user.city, user.country]
            .filter(Boolean)
            .join(", ")}
        />
        <Record
          label="SSN last four"
          value={user.ssn_last4 ? `•••-••-${user.ssn_last4}` : "Not supplied"}
        />

        {/* Crypto withdrawal wallets */}
        <h3
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 24,
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          Crypto Withdrawal Wallets
        </h3>
        {wallets.length === 0 ? (
          <div style={{ color: "#8290a2", fontSize: 13 }}>
            No wallets saved.
          </div>
        ) : (
          wallets.map((w, i) => (
            <Record
              key={i}
              label={`${w.asset} · ${w.network}`}
              value={w.wallet_address}
            />
          ))
        )}

        {/* KYC control */}
        <h3
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 24,
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          KYC Verification
        </h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <select
            value={kycStatus}
            onChange={(e) => setKycStatus(e.target.value)}
            style={selectStyle}
          >
            {["Unverified", "Pending", "Verified", "Rejected"].map((s) => (
              <option key={s} value={s} style={{ background: "#0F1422" }}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={updateKyc}
            disabled={saving === "kyc"}
            style={{ ...button(), padding: "8px 16px" }}
          >
            {saving === "kyc" ? "Saving…" : "Update"}
          </button>
        </div>

        {/* Account status control */}
        <h3
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 20,
            marginBottom: 10,
            letterSpacing: 0.5,
          }}
        >
          Account Status
        </h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <select
            value={acctStatus}
            onChange={(e) => setAcctStatus(e.target.value)}
            style={selectStyle}
          >
            {["Pending", "Active", "Suspended", "Closed"].map((s) => (
              <option key={s} value={s} style={{ background: "#0F1422" }}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={updateAcctStatus}
            disabled={saving === "acct"}
            style={{ ...button(), padding: "8px 16px" }}
          >
            {saving === "acct" ? "Saving…" : "Update"}
          </button>
        </div>

        {/* Feedback */}
        {msg.text && (
          <div
            style={{
              fontSize: 12,
              padding: "8px 12px",
              borderRadius: 7,
              marginTop: 8,
              background: msg.ok
                ? "rgba(74,222,128,.08)"
                : "rgba(248,113,113,.08)",
              border: `1px solid ${msg.ok ? "rgba(74,222,128,.25)" : "rgba(248,113,113,.25)"}`,
              color: msg.ok ? "#4ade80" : "#fca5a5",
            }}
          >
            {msg.text}
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: "rgba(201,168,76,.08)",
            fontSize: 11,
            color: "#b7c2d0",
            lineHeight: 1.5,
            borderRadius: 8,
          }}
        >
          <AlertTriangle
            size={14}
            color="#C9A84C"
            style={{ verticalAlign: "middle", marginRight: 5 }}
          />
          Sensitive data is access-controlled and should only be used for
          operational verification.
        </div>
      </aside>
    </div>
  );
}
function Record({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <div style={{ fontSize: 10, color: "#8390a3", letterSpacing: 1 }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#dce4ed",
          marginTop: 3,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}
export function FundingPage() {
  const { data, loading, error, reload } = useAdminData(
    "funding_destinations",
    {
      filter: (q) =>
        q.eq("kind", "crypto").order("created_at", { ascending: false }),
    },
  );

  const empty_form = { label: "", asset: "", network: "", wallet_address: "" };
  const [form, setForm] = useState(empty_form);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("funding_destinations").insert({
      kind: "crypto",
      label: form.label.trim(),
      currency: "USD",
      asset: form.asset.trim(),
      network: form.network.trim(),
      wallet_address: form.wallet_address.trim(),
      is_active: true,
    });
    if (error) {
      setMsg({ text: error.message, ok: false });
    } else {
      setMsg({ text: "Destination added.", ok: true });
      setForm(empty_form);
      reload();
    }
  };

  const toggle = async (d) => {
    await supabase
      .from("funding_destinations")
      .update({ is_active: !d.is_active })
      .eq("id", d.id);
    reload();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this funding destination?")) return;
    await supabase.from("funding_destinations").delete().eq("id", id);
    reload();
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 5,
    padding: 10,
    background: "#0a101b",
    border: "1px solid rgba(201,168,76,.2)",
    borderRadius: 7,
    color: "#fff",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    outline: "none",
  };

  return (
    <>
      <Title
        eyebrow="SETTLEMENT CONFIGURATION"
        title="Crypto funding destinations"
      />
      <div
        className="admin-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr .8fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        {/* Live destinations */}
        <SectionCard title="Live destinations">
          <State loading={loading} error={error} empty={!data.length}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: 16,
                    border: "1px solid rgba(201,168,76,.12)",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}
                      >
                        {d.label}
                      </span>
                      <Badge label={`${d.asset} · ${d.network}`} color="gold" />
                    </div>
                    <code
                      style={{
                        fontSize: 11,
                        color: "#9ba7b7",
                        wordBreak: "break-all",
                        display: "block",
                        lineHeight: 1.6,
                      }}
                    >
                      {d.wallet_address}
                    </code>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <Badge
                      label={d.is_active ? "Active" : "Disabled"}
                      color={d.is_active ? "green" : "grey"}
                    />
                    <button onClick={() => toggle(d)} style={button()}>
                      {d.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => remove(d.id)}
                      style={button("danger")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </State>
        </SectionCard>

        {/* Add destination */}
        <SectionCard title="Add crypto destination">
          <p
            style={{
              fontSize: 12,
              color: "#8290a2",
              marginTop: 0,
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          >
            These appear in the client deposit screen as selectable crypto
            options. Clients will see the label, asset, network, and wallet
            address.
          </p>
          <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            {[
              {
                key: "label",
                label: "Display name",
                placeholder: "e.g. USDT (TRC-20)",
              },
              { key: "asset", label: "Asset / Coin", placeholder: "e.g. USDT" },
              { key: "network", label: "Network", placeholder: "e.g. TRC-20" },
              {
                key: "wallet_address",
                label: "Wallet address",
                placeholder: "e.g. TQn9Y2kh…",
              },
            ].map(({ key, label, placeholder }) => (
              <label
                key={key}
                style={{ fontSize: 12, color: "#b7c2d0", display: "block" }}
              >
                {label}
                <input
                  required
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </label>
            ))}
            {msg.text && (
              <div
                style={{
                  fontSize: 12,
                  padding: "10px 12px",
                  borderRadius: 7,
                  background: msg.ok
                    ? "rgba(74,222,128,.08)"
                    : "rgba(248,113,113,.08)",
                  border: `1px solid ${msg.ok ? "rgba(74,222,128,.25)" : "rgba(248,113,113,.25)"}`,
                  color: msg.ok ? "#4ade80" : "#fca5a5",
                }}
              >
                {msg.text}
              </div>
            )}
            <button
              type="submit"
              style={{
                ...button(),
                display: "flex",
                alignItems: "center",
                gap: 6,
                justifyContent: "center",
              }}
            >
              <Check size={13} /> Save destination
            </button>
          </form>
        </SectionCard>
      </div>
      <Responsive />
    </>
  );
}
function Title({ eyebrow, title, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        gap: 16,
        marginBottom: 22,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            color: "#C9A84C",
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            margin: "5px 0 0",
            fontFamily: "Cormorant Garamond,serif",
            fontSize: 38,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
function Responsive() {
  return (
    <style>{`
      @media(max-width:1200px){.admin-kpis{grid-template-columns:repeat(3,1fr)!important}}
      @media(max-width:900px){.admin-grid{grid-template-columns:1fr!important}.admin-kpis{grid-template-columns:repeat(2,1fr)!important}}
      @media(max-width:560px){.admin-kpis{grid-template-columns:1fr!important}}
    `}</style>
  );
}

export function AdminAccountsPage() {
  const { profile: currentProfile } = useAuth();
  const isSuperAdmin = currentProfile?.role === "super_admin";

  // All hooks must be called unconditionally — the early return for non-super-admin
  // is handled in the render section below, not before hooks.
  const {
    data: admins,
    loading,
    error,
    reload,
  } = useAdminData("admin_user_profiles", {
    filter: (q) =>
      q
        .in("role", ["admin", "super_admin"])
        .order("created_at", { ascending: true }),
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [revoking, setRevoking] = useState(null);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  // Guard — shown after all hooks have been called
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#fca5a5" }}>
        <ShieldCheck size={32} style={{ marginBottom: 12 }} />
        <div>Only the super admin can manage admin accounts.</div>
      </div>
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMsg({ text: "", ok: true });
    if (form.password.length < 12) {
      setMsg({ text: "Password must be at least 12 characters.", ok: false });
      return;
    }
    setSaving(true);

    // Calls the create-admin Edge Function which uses the service-role key
    // server-side — the key never reaches the browser.
    const { data, error } = await supabase.functions.invoke("create-admin", {
      body: {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
      },
    });

    setSaving(false);
    if (error || data?.error) {
      setMsg({ text: error?.message ?? data?.error, ok: false });
    } else {
      setMsg({ text: `Admin account created for ${form.email}.`, ok: true });
      setForm({ firstName: "", lastName: "", email: "", password: "" });
      reload();
    }
  }

  async function handleRevoke(admin) {
    if (
      !window.confirm(
        `Revoke admin access for ${admin.first_name} ${admin.last_name}?`,
      )
    )
      return;
    setRevoking(admin.id);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "user" })
      .eq("id", admin.id);
    setRevoking(null);
    if (error) {
      setMsg({ text: error.message, ok: false });
    } else {
      reload();
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: "#0a101b",
    border: "1px solid rgba(201,168,76,.2)",
    borderRadius: 7,
    padding: "10px 12px",
    color: "#fff",
    fontSize: 13,
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    marginTop: 5,
  };

  return (
    <>
      <Title eyebrow="ACCESS MANAGEMENT" title="Admin accounts" />
      <div
        className="admin-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 18,
          alignItems: "start",
        }}
      >
        {/* Existing admins */}
        <SectionCard
          title={`${admins.length} admin account${admins.length !== 1 ? "s" : ""}`}
        >
          <State loading={loading} error={error} empty={!admins.length}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {["Name", "Email", "Role", "Status", "Since", ""].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            color: "#8290a2",
                            fontSize: 10,
                            letterSpacing: 1,
                            borderBottom: "1px solid rgba(201,168,76,.12)",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => {
                    const isSelf = a.id === currentProfile?.id;
                    const isTargetSuperAdmin = a.role === "super_admin";
                    return (
                      <tr
                        key={a.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <td
                          style={{
                            padding: 12,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {a.first_name} {a.last_name}
                          {isSelf && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "#C9A84C",
                                marginLeft: 6,
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: 12,
                            color: "#9ba7b7",
                            fontSize: 12,
                          }}
                        >
                          {a.email}
                        </td>
                        <td style={{ padding: 12 }}>
                          <Badge
                            label={
                              a.role === "super_admin" ? "Super Admin" : "Admin"
                            }
                            color={a.role === "super_admin" ? "gold" : "blue"}
                          />
                        </td>
                        <td style={{ padding: 12 }}>
                          <Badge
                            label={a.account_status}
                            color={tone(a.account_status)}
                          />
                        </td>
                        <td
                          style={{
                            padding: 12,
                            color: "#9ba7b7",
                            fontSize: 12,
                          }}
                        >
                          {date(a.created_at)}
                        </td>
                        <td style={{ padding: 12 }}>
                          {!isSelf && !isTargetSuperAdmin && (
                            <button
                              onClick={() => handleRevoke(a)}
                              disabled={revoking === a.id}
                              style={button("danger")}
                            >
                              {revoking === a.id
                                ? "Revoking…"
                                : "Revoke access"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </State>
        </SectionCard>

        {/* Create new admin */}
        <SectionCard title="Create admin account">
          <p
            style={{
              fontSize: 12,
              color: "#8290a2",
              marginTop: 0,
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            New admins can review deposits, process withdrawals, and manage
            client records. Only you (super admin) can create or revoke admin
            access.
          </p>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {[
              { key: "firstName", label: "First name", placeholder: "Jane" },
              { key: "lastName", label: "Last name", placeholder: "Smith" },
              {
                key: "email",
                label: "Email",
                placeholder: "jane@nexusyield.org",
              },
              {
                key: "password",
                label: "Temporary password (min 12 chars)",
                placeholder: "••••••••••••",
                type: "password",
              },
            ].map(({ key, label, placeholder, type = "text" }) => (
              <label
                key={key}
                style={{ fontSize: 12, color: "#b7c2d0", display: "block" }}
              >
                {label}
                <input
                  required
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  style={inputStyle}
                  autoComplete={type === "password" ? "new-password" : "off"}
                />
              </label>
            ))}

            {msg.text && (
              <div
                style={{
                  fontSize: 12,
                  padding: "10px 12px",
                  borderRadius: 7,
                  background: msg.ok
                    ? "rgba(74,222,128,.08)"
                    : "rgba(248,113,113,.08)",
                  border: `1px solid ${msg.ok ? "rgba(74,222,128,.25)" : "rgba(248,113,113,.25)"}`,
                  color: msg.ok ? "#4ade80" : "#fca5a5",
                }}
              >
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...button(),
                display: "flex",
                alignItems: "center",
                gap: 7,
                justifyContent: "center",
              }}
            >
              <UserPlus size={13} />
              {saving ? "Creating…" : "Create admin"}
            </button>
          </form>
        </SectionCard>
      </div>
      <Responsive />
    </>
  );
}

export function InvestmentsPage() {
  const {
    data: raw,
    loading,
    error,
    reload,
  } = useAdminData("user_investments", {
    select: "*, investment_plans(name, tier, roi_percent, duration_hrs)",
    filter: (q) => q.order("created_at", { ascending: false }),
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [dialog, setDialog] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);

  // Attach profile info via separate query — same pattern as deposit/withdrawal queues
  useEffect(() => {
    attachUsers(raw).then(setRows);
  }, [raw]);

  const statuses = [
    "All",
    "Pending",
    "Active",
    "Maturing Soon",
    "Matured",
    "Cancelled",
  ];
  const statusTone = {
    Active: "green",
    "Maturing Soon": "amber",
    Matured: "blue",
    Pending: "grey",
    Cancelled: "grey",
  };

  const shown = rows.filter(
    (r) => statusFilter === "All" || r.status === statusFilter,
  );

  async function handleAction() {
    setBusy(true);
    setErr("");
    let rpcError;

    if (dialog.mode === "activate") {
      const { error } = await supabase.rpc("admin_activate_investment", {
        p_investment_id: dialog.item.id,
      });
      rpcError = error;
    } else if (dialog.mode === "credit") {
      const amt = parseFloat(creditAmount);
      if (!amt || amt <= 0) {
        setErr("Enter a valid amount.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.rpc("admin_credit_returns", {
        p_investment_id: dialog.item.id,
        p_returns: amt,
      });
      rpcError = error;
    } else if (dialog.mode === "mature") {
      const { error } = await supabase.rpc("admin_mark_investment_matured", {
        p_investment_id: dialog.item.id,
      });
      rpcError = error;
    }

    setBusy(false);
    if (rpcError) {
      setErr(rpcError.message);
      return;
    }
    setDialog(null);
    setCreditAmount("");
    reload();
  }

  return (
    <>
      <Title
        eyebrow="INVESTMENT MANAGEMENT"
        title="Client investments"
        action={
          <button onClick={reload} style={button()}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Status filter */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "7px 16px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              transition: "all 0.2s",
              background:
                statusFilter === s
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "rgba(255,255,255,.06)",
              color: statusFilter === s ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <SectionCard
        title={`${shown.length} investment${shown.length !== 1 ? "s" : ""}`}
      >
        <State loading={loading} error={error} empty={!shown.length}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Client",
                    "Plan",
                    "Invested",
                    "Returns",
                    "ROI %",
                    "Status",
                    "Started",
                    "Matures",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        color: "#8290a2",
                        fontSize: 10,
                        letterSpacing: 1,
                        borderBottom: "1px solid rgba(201,168,76,.12)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
                  >
                    <td style={{ padding: 12, color: "#fff", fontWeight: 600 }}>
                      {inv.user?.first_name} {inv.user?.last_name}
                      <div style={{ color: "#8290a2", fontSize: 11 }}>
                        {inv.user?.account_id}
                      </div>
                    </td>
                    <td style={{ padding: 12, color: "#D6DEE8" }}>
                      {inv.investment_plans?.name ?? "—"}
                    </td>
                    <td
                      style={{ padding: 12, color: "#E8C86D", fontWeight: 700 }}
                    >
                      {money(inv.amount_invested)}
                    </td>
                    <td
                      style={{ padding: 12, color: "#4ade80", fontWeight: 600 }}
                    >
                      {money(inv.returns_earned)}
                    </td>
                    <td style={{ padding: 12, color: "#D6DEE8" }}>
                      {inv.investment_plans?.roi_percent ?? "—"}%
                    </td>
                    <td style={{ padding: 12 }}>
                      <Badge
                        label={inv.status}
                        color={statusTone[inv.status] ?? "grey"}
                      />
                    </td>
                    <td
                      style={{
                        padding: 12,
                        color: "#a6b0bf",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {date(inv.started_at)}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        color: "#a6b0bf",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {date(inv.matures_at)}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}
                      >
                        {inv.status === "Pending" && (
                          <button
                            onClick={() =>
                              setDialog({ mode: "activate", item: inv })
                            }
                            style={button()}
                          >
                            Activate
                          </button>
                        )}
                        {["Active", "Maturing Soon"].includes(inv.status) && (
                          <button
                            onClick={() =>
                              setDialog({ mode: "credit", item: inv })
                            }
                            style={button()}
                          >
                            Credit Returns
                          </button>
                        )}
                        {["Active", "Maturing Soon"].includes(inv.status) && (
                          <button
                            onClick={() =>
                              setDialog({ mode: "mature", item: inv })
                            }
                            style={button("danger")}
                          >
                            Mark Matured
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </State>
      </SectionCard>

      {/* Action dialog */}
      {dialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3,7,14,.8)",
            zIndex: 80,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <section
            style={{
              width: "min(520px,100%)",
              background: "#121a2a",
              border: "1px solid rgba(201,168,76,.28)",
              borderRadius: 14,
              boxShadow: "0 24px 80px #000",
              padding: 28,
            }}
          >
            <div
              style={{
                color: "#C9A84C",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
                marginBottom: 8,
              }}
            >
              {dialog.mode === "activate"
                ? "ACTIVATE INVESTMENT"
                : dialog.mode === "credit"
                  ? "CREDIT RETURNS"
                  : "MARK AS MATURED"}
            </div>
            <h2
              style={{
                color: "#fff",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 26,
                margin: "0 0 16px",
              }}
            >
              {dialog.item.user?.first_name} {dialog.item.user?.last_name} —{" "}
              {dialog.item.investment_plans?.name}
            </h2>
            <div
              style={{
                fontSize: 13,
                color: "#a6b0bf",
                marginBottom: 20,
                lineHeight: 1.7,
              }}
            >
              Invested:{" "}
              <strong style={{ color: "#E8C86D" }}>
                {money(dialog.item.amount_invested)}
              </strong>
              {" · "}Current returns:{" "}
              <strong style={{ color: "#4ade80" }}>
                {money(dialog.item.returns_earned)}
              </strong>
            </div>

            {dialog.mode === "credit" && (
              <label
                style={{
                  fontSize: 12,
                  color: "#b7c2d0",
                  display: "block",
                  marginBottom: 16,
                }}
              >
                Returns to credit ($)
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 6,
                    padding: "10px 14px",
                    background: "#0b101b",
                    color: "#fff",
                    border: "1px solid rgba(201,168,76,.22)",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "DM Sans, sans-serif",
                    outline: "none",
                  }}
                />
              </label>
            )}

            {dialog.mode === "mature" && (
              <p
                style={{
                  fontSize: 13,
                  color: "#fbbf24",
                  background: "rgba(251,191,36,.07)",
                  border: "1px solid rgba(251,191,36,.2)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 16,
                }}
              >
                This will mark the investment as Matured and notify the client.
                Ensure all returns have already been credited before proceeding.
              </p>
            )}

            {err && (
              <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 12 }}>
                {err}
              </div>
            )}

            <div
              style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => {
                  setDialog(null);
                  setErr("");
                  setCreditAmount("");
                }}
                style={button("plain")}
              >
                Cancel
              </button>
              <button onClick={handleAction} disabled={busy} style={button()}>
                {busy
                  ? "Saving…"
                  : dialog.mode === "activate"
                    ? "Activate"
                    : dialog.mode === "credit"
                      ? "Credit Returns"
                      : "Mark Matured"}
              </button>
            </div>
          </section>
        </div>
      )}

      <Responsive />
    </>
  );
}

export function AdminNotificationsPage() {
  const [tab, setTab] = useState("broadcast");
  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Promotion",
  });
  const [userId, setUserId] = useState("");
  const [directForm, setDirectForm] = useState({
    title: "",
    message: "",
    category: "Account",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 5,
    padding: "10px 12px",
    background: "#0a101b",
    border: "1px solid rgba(201,168,76,.2)",
    borderRadius: 7,
    color: "#fff",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    outline: "none",
  };

  async function handleBroadcast(e) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const { data, error } = await supabase.rpc("admin_broadcast_notification", {
      p_title: form.title,
      p_message: form.message,
      p_category: form.category,
    });
    setSending(false);
    if (error) setResult({ ok: false, text: error.message });
    else {
      setResult({
        ok: true,
        text: `Sent to ${data} active client${data !== 1 ? "s" : ""}.`,
      });
      setForm({ title: "", message: "", category: "Promotion" });
    }
  }

  async function handleDirect(e) {
    e.preventDefault();
    if (!userId.trim()) {
      setResult({ ok: false, text: "Enter an account ID." });
      return;
    }
    setSending(true);
    setResult(null);

    // Look up the real UUID from the account_id (e.g. NXY-ABCD123456)
    const { data: profileRow, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("account_id", userId.trim().toUpperCase())
      .single();

    if (lookupError || !profileRow) {
      setSending(false);
      setResult({
        ok: false,
        text: `No client found with account ID "${userId.trim()}".`,
      });
      return;
    }

    const { error } = await supabase.from("notifications").insert({
      user_id: profileRow.id,
      title: directForm.title,
      message: directForm.message,
      category: directForm.category,
    });
    setSending(false);
    if (error) setResult({ ok: false, text: error.message });
    else {
      setResult({ ok: true, text: "Notification sent." });
      setDirectForm({ title: "", message: "", category: "Account" });
      setUserId("");
    }
  }

  const categories = [
    "Account",
    "Deposit",
    "Withdrawal",
    "Investment",
    "Security",
    "Document",
    "Promotion",
  ];

  return (
    <>
      <Title eyebrow="COMMUNICATIONS" title="Send notifications" />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(201,168,76,.12)",
          borderRadius: 12,
          padding: 5,
          marginBottom: 24,
          width: "fit-content",
        }}
      >
        {[
          ["broadcast", "Broadcast to All"],
          ["direct", "Send to User"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setResult(null);
            }}
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              background:
                tab === id
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "transparent",
              color: tab === id ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 560 }}>
        {tab === "broadcast" && (
          <SectionCard title="Broadcast notification">
            <p
              style={{
                fontSize: 12,
                color: "#8290a2",
                marginTop: 0,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Sends to all clients whose account status is{" "}
              <strong style={{ color: "#E8C86D" }}>Active</strong>. Use for
              platform announcements, promotions, or service updates.
            </p>
            <form
              onSubmit={handleBroadcast}
              style={{ display: "grid", gap: 14 }}
            >
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Title
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Platform Maintenance"
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Message
                <textarea
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Enter your message…"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", marginTop: 5 }}
                />
              </label>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Category
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: "#0F1422" }}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              {result && (
                <div
                  style={{
                    fontSize: 12,
                    padding: "10px 12px",
                    borderRadius: 7,
                    background: result.ok
                      ? "rgba(74,222,128,.08)"
                      : "rgba(248,113,113,.08)",
                    border: `1px solid ${result.ok ? "rgba(74,222,128,.25)" : "rgba(248,113,113,.25)"}`,
                    color: result.ok ? "#4ade80" : "#fca5a5",
                  }}
                >
                  {result.text}
                </div>
              )}
              <button
                type="submit"
                disabled={sending}
                style={{
                  ...button(),
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {sending ? (
                  "Sending…"
                ) : (
                  <>
                    <Radio
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: 5,
                        verticalAlign: "middle",
                      }}
                    />
                    Send Broadcast
                  </>
                )}
              </button>
            </form>
          </SectionCard>
        )}

        {tab === "direct" && (
          <SectionCard title="Send to specific user">
            <p
              style={{
                fontSize: 12,
                color: "#8290a2",
                marginTop: 0,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Sends a notification directly to one user. Use the client's
              Account ID (e.g. NXY-ABCD123456) found in the client directory.
            </p>
            <form onSubmit={handleDirect} style={{ display: "grid", gap: 14 }}>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Account ID
                <input
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. NXY-ABCD123456"
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Title
                <input
                  required
                  value={directForm.title}
                  onChange={(e) =>
                    setDirectForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Your deposit has been approved"
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Message
                <textarea
                  required
                  value={directForm.message}
                  onChange={(e) =>
                    setDirectForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Enter your message…"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", marginTop: 5 }}
                />
              </label>
              <label style={{ fontSize: 12, color: "#b7c2d0" }}>
                Category
                <select
                  value={directForm.category}
                  onChange={(e) =>
                    setDirectForm((p) => ({ ...p, category: e.target.value }))
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: "#0F1422" }}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              {result && (
                <div
                  style={{
                    fontSize: 12,
                    padding: "10px 12px",
                    borderRadius: 7,
                    background: result.ok
                      ? "rgba(74,222,128,.08)"
                      : "rgba(248,113,113,.08)",
                    border: `1px solid ${result.ok ? "rgba(74,222,128,.25)" : "rgba(248,113,113,.25)"}`,
                    color: result.ok ? "#4ade80" : "#fca5a5",
                  }}
                >
                  {result.text}
                </div>
              )}
              <button
                type="submit"
                disabled={sending}
                style={{
                  ...button(),
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {sending ? (
                  "Sending…"
                ) : (
                  <>
                    <Mail
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: 5,
                        verticalAlign: "middle",
                      }}
                    />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </SectionCard>
        )}
      </div>
      <Responsive />
    </>
  );
}

export function MessagesPage() {
  const [tab, setTab] = useState("messages");

  const {
    data: messages,
    loading: msgLoading,
    error: msgError,
    reload: reloadMsgs,
  } = useAdminData("contact_messages", {
    filter: (q) => q.order("created_at", { ascending: false }),
  });

  const {
    data: bookings,
    loading: bkLoading,
    error: bkError,
    reload: reloadBks,
  } = useAdminData("consultation_bookings", {
    filter: (q) => q.order("created_at", { ascending: false }),
  });

  const {
    data: leads,
    loading: leadsLoading,
    error: leadsError,
    reload: reloadLeads,
  } = useAdminData("leads", {
    filter: (q) => q.order("created_at", { ascending: false }),
  });

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const newMsgCount = messages.filter((m) => m.status === "New").length;
  const pendingBkCount = bookings.filter((b) => b.status === "Pending").length;

  async function updateMessageStatus(id, status) {
    setSaving(true);
    await supabase
      .from("contact_messages")
      .update({ status, admin_note: note || null })
      .eq("id", id);
    setSaving(false);
    setSelected(null);
    setNote("");
    reloadMsgs();
  }

  async function updateBookingStatus(id, status) {
    setSaving(true);
    await supabase
      .from("consultation_bookings")
      .update({ status, admin_note: note || null })
      .eq("id", id);
    setSaving(false);
    setSelected(null);
    setNote("");
    reloadBks();
  }

  const statusTone = {
    New: "amber",
    Read: "blue",
    Replied: "green",
    Pending: "amber",
    Confirmed: "green",
    Cancelled: "red",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 5,
    padding: "10px 12px",
    background: "#0a101b",
    border: "1px solid rgba(201,168,76,.2)",
    borderRadius: 7,
    color: "#fff",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    outline: "none",
  };

  return (
    <>
      <Title
        eyebrow="INBOX"
        title="Messages & Bookings"
        action={
          <button
            onClick={() => {
              reloadMsgs();
              reloadBks();
              reloadLeads();
            }}
            style={button()}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
        className="admin-kpis"
      >
        <KPICard
          label="Unread messages"
          value={newMsgCount}
          sub="Awaiting review"
          icon={Users}
          accent={newMsgCount > 0}
        />
        <KPICard
          label="Pending consultations"
          value={pendingBkCount}
          sub="Awaiting confirmation"
          icon={Users}
          accent={pendingBkCount > 0}
        />
        <KPICard
          label="Leads captured"
          value={leads.length}
          sub="CTA email signups"
          icon={Users}
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(201,168,76,.12)",
          borderRadius: 12,
          padding: 5,
          marginBottom: 24,
          width: "fit-content",
        }}
      >
        {[
          ["messages", `Messages${newMsgCount > 0 ? ` (${newMsgCount})` : ""}`],
          [
            "bookings",
            `Bookings${pendingBkCount > 0 ? ` (${pendingBkCount})` : ""}`,
          ],
          ["leads", "Leads"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              background:
                tab === id
                  ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                  : "transparent",
              color: tab === id ? "#0A0E1A" : "#D6DEE8",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages tab */}
      {tab === "messages" && (
        <SectionCard
          title={`${messages.length} contact message${messages.length !== 1 ? "s" : ""}`}
        >
          <State loading={msgLoading} error={msgError} empty={!messages.length}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {["Name", "Email", "Subject", "Received", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            color: "#8290a2",
                            fontSize: 10,
                            letterSpacing: 1,
                            borderBottom: "1px solid rgba(201,168,76,.12)",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,.05)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{ padding: 12, color: "#fff", fontWeight: 600 }}
                      >
                        {m.name}
                      </td>
                      <td
                        style={{ padding: 12, color: "#9ba7b7", fontSize: 12 }}
                      >
                        {m.email}
                      </td>
                      <td
                        style={{ padding: 12, color: "#D6DEE8", opacity: 0.8 }}
                      >
                        {m.subject || "—"}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          color: "#9ba7b7",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {date(m.created_at)}
                      </td>
                      <td style={{ padding: 12 }}>
                        <Badge
                          label={m.status}
                          color={statusTone[m.status] ?? "grey"}
                        />
                      </td>
                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => {
                            setSelected({ type: "message", data: m });
                            setNote(m.admin_note || "");
                          }}
                          style={button()}
                        >
                          <Eye
                            size={13}
                            style={{ verticalAlign: "middle", marginRight: 4 }}
                          />{" "}
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </State>
        </SectionCard>
      )}

      {/* Bookings tab */}
      {tab === "bookings" && (
        <SectionCard
          title={`${bookings.length} consultation booking${bookings.length !== 1 ? "s" : ""}`}
        >
          <State loading={bkLoading} error={bkError} empty={!bookings.length}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Date",
                      "Time",
                      "Topic",
                      "Submitted",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          color: "#8290a2",
                          fontSize: 10,
                          letterSpacing: 1,
                          borderBottom: "1px solid rgba(201,168,76,.12)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,.05)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{ padding: 12, color: "#fff", fontWeight: 600 }}
                      >
                        {b.name}
                      </td>
                      <td
                        style={{ padding: 12, color: "#9ba7b7", fontSize: 12 }}
                      >
                        {b.email}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          color: "#D6DEE8",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.preferred_date}
                      </td>
                      <td style={{ padding: 12, color: "#D6DEE8" }}>
                        {b.preferred_time}
                      </td>
                      <td
                        style={{ padding: 12, color: "#D6DEE8", opacity: 0.8 }}
                      >
                        {b.topic || "—"}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          color: "#9ba7b7",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {date(b.created_at)}
                      </td>
                      <td style={{ padding: 12 }}>
                        <Badge
                          label={b.status}
                          color={statusTone[b.status] ?? "grey"}
                        />
                      </td>
                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => {
                            setSelected({ type: "booking", data: b });
                            setNote(b.admin_note || "");
                          }}
                          style={button()}
                        >
                          <Eye
                            size={13}
                            style={{ verticalAlign: "middle", marginRight: 4 }}
                          />{" "}
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </State>
        </SectionCard>
      )}

      {/* Leads tab */}
      {tab === "leads" && (
        <SectionCard
          title={`${leads.length} lead${leads.length !== 1 ? "s" : ""} captured`}
        >
          <State
            loading={leadsLoading}
            error={leadsError}
            empty={!leads.length}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {["Email", "Source", "Captured"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          color: "#8290a2",
                          fontSize: 10,
                          letterSpacing: 1,
                          borderBottom: "1px solid rgba(201,168,76,.12)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,.05)",
                      }}
                    >
                      <td style={{ padding: 12, color: "#fff" }}>{l.email}</td>
                      <td style={{ padding: 12 }}>
                        <Badge label={l.source} color="gold" />
                      </td>
                      <td
                        style={{ padding: 12, color: "#9ba7b7", fontSize: 12 }}
                      >
                        {date(l.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </State>
        </SectionCard>
      )}

      {/* Detail drawer */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            background: "rgba(0,0,0,.65)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            style={{
              width: "min(520px,100%)",
              background: "#101828",
              padding: 28,
              overflow: "auto",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => {
                setSelected(null);
                setNote("");
              }}
              style={{
                float: "right",
                background: "none",
                border: 0,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X />
            </button>

            <div
              style={{
                color: "#C9A84C",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
              }}
            >
              {selected.type === "message"
                ? "CONTACT MESSAGE"
                : "CONSULTATION BOOKING"}
            </div>
            <h2
              style={{
                color: "#fff",
                fontFamily: "Cormorant Garamond,serif",
                fontSize: 28,
                margin: "8px 0 20px",
              }}
            >
              {selected.data.name}
            </h2>

            {selected.type === "message" && (
              <>
                <Record label="Email" value={selected.data.email} />
                <Record
                  label="Subject"
                  value={selected.data.subject || "No subject"}
                />
                <Record
                  label="Received"
                  value={date(selected.data.created_at)}
                />
                <div style={{ marginTop: 16, marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#8390a3",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    MESSAGE
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#dce4ed",
                      lineHeight: 1.75,
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(201,168,76,.1)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      margin: 0,
                    }}
                  >
                    {selected.data.message}
                  </p>
                </div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#b7c2d0",
                    display: "block",
                    marginBottom: 16,
                  }}
                >
                  Internal note (optional)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Read", "Replied"].map((s) => (
                    <button
                      key={s}
                      disabled={saving || selected.data.status === s}
                      onClick={() => updateMessageStatus(selected.data.id, s)}
                      style={{
                        ...button(),
                        opacity: selected.data.status === s ? 0.4 : 1,
                      }}
                    >
                      {saving ? "Saving…" : `Mark ${s}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selected.type === "booking" && (
              <>
                <Record label="Email" value={selected.data.email} />
                <Record
                  label="Phone"
                  value={selected.data.phone || "Not provided"}
                />
                <Record
                  label="Preferred date"
                  value={selected.data.preferred_date}
                />
                <Record
                  label="Preferred time"
                  value={selected.data.preferred_time}
                />
                <Record
                  label="Topic"
                  value={selected.data.topic || "Not specified"}
                />
                <Record
                  label="Submitted"
                  value={date(selected.data.created_at)}
                />
                <label
                  style={{
                    fontSize: 12,
                    color: "#b7c2d0",
                    display: "block",
                    marginTop: 16,
                    marginBottom: 16,
                  }}
                >
                  Internal note (optional)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    disabled={saving || selected.data.status === "Confirmed"}
                    onClick={() =>
                      updateBookingStatus(selected.data.id, "Confirmed")
                    }
                    style={{
                      ...button(),
                      opacity: selected.data.status === "Confirmed" ? 0.4 : 1,
                    }}
                  >
                    {saving ? "Saving…" : "Confirm"}
                  </button>
                  <button
                    disabled={saving || selected.data.status === "Cancelled"}
                    onClick={() =>
                      updateBookingStatus(selected.data.id, "Cancelled")
                    }
                    style={{
                      ...button("danger"),
                      opacity: selected.data.status === "Cancelled" ? 0.4 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <Responsive />
    </>
  );
}
