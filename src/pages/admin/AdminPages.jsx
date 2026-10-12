import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Eye,
  Landmark,
  RefreshCw,
  Send,
  ShieldCheck,
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
            🗑 Delete
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
  const users = useAdminData("profiles");
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
              users.reload();
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
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
        }}
      >
        <KPICard
          label="Pending deposits"
          value={dep.data.length}
          sub="Awaiting proof review"
          icon={Landmark}
          accent
        />
        <KPICard
          label="Payment actions"
          value={wit.data.length}
          sub="Pending or in processing"
          icon={Send}
        />
        <KPICard
          label="Client accounts"
          value={users.data.length}
          sub="All registered profiles"
          icon={Users}
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
    filter: (q) => q.order("created_at", { ascending: false }),
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
  const [wallets, setWallets] = useState([]),
    [banks, setBanks] = useState([]);
  useEffect(() => {
    supabase
      .from("crypto_wallets")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => setWallets(data || []));
    supabase
      .from("bank_accounts")
      .select("bank_name,account_name,account_number")
      .eq("user_id", user.id)
      .then(({ data }) => setBanks(data || []));
  }, [user.id]);
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
          width: "min(500px,100%)",
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
        <Record label="Account ID" value={user.account_id} />
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
        <h3 style={{ color: "#fff", fontSize: 14, marginTop: 25 }}>
          Withdrawal destinations
        </h3>
        {banks.map((b, i) => (
          <Record
            key={i}
            label={b.bank_name}
            value={`${b.account_name} ••••${b.account_number?.slice(-4)}`}
          />
        ))}
        {wallets.map((w) => (
          <Record
            key={w.id}
            label={`${w.network || "Crypto"} wallet`}
            value={w.wallet_address}
          />
        ))}
        {!banks.length && !wallets.length && (
          <div style={{ color: "#8290a2", fontSize: 13 }}>
            No destination has been added.
          </div>
        )}
        <div
          style={{
            marginTop: 25,
            padding: 12,
            background: "rgba(201,168,76,.08)",
            fontSize: 11,
            color: "#b7c2d0",
            lineHeight: 1.5,
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
    <style>{`@media(max-width:900px){.admin-grid{grid-template-columns:1fr!important}.admin-kpis{grid-template-columns:1fr!important}}`}</style>
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
