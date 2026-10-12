import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Search, X, FileText } from "lucide-react";
import { useTransactions } from "../../hooks/usePortalData";
import {
  SectionCard,
  Badge,
  GoldButton,
  PageHeader,
} from "../../components/portal/PortalUI";

// mockTx removed — all data comes from the DB via useTransactions()

const fmt = (n) =>
  "$" +
  Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const typeSign = (type) =>
  ["Deposit", "Return Credit", "Bonus"].includes(type) ? "+" : "-";

const typeColor = {
  Deposit: "green",
  Withdrawal: "red",
  "Return Credit": "blue",
  Bonus: "purple",
  Fee: "grey",
};
const statusColor = {
  Completed: "green",
  Pending: "amber",
  Processing: "blue",
  Failed: "red",
  Cancelled: "grey",
};

function ReceiptModal({ tx, onClose }) {
  const raw = tx._raw;
  const sign = typeSign(raw.type);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0F1422",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 480,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}
          >
            Transaction Receipt
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#D6DEE8",
              opacity: 0.6,
            }}
          >
            <X size={20} />
          </button>
        </div>
        {[
          ["Transaction ID", raw.reference],
          ["Date & Time", fmtDate(raw.created_at)],
          ["Type", raw.type],
          ["Description", raw.description ?? raw.type],
          ["Amount", `${sign}${fmt(raw.amount)}`],
          ["Fee", fmt(raw.fee ?? 0)],
          ["Net Amount", `${sign}${fmt(raw.net_amount)}`],
          ["Payment Method", raw.payment_method ?? "—"],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.55 }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 13,
                color:
                  label === "Amount" || label === "Net Amount"
                    ? sign === "+"
                      ? "#4ade80"
                      : "#f87171"
                    : "#fff",
                fontWeight: 500,
                textAlign: "right",
                maxWidth: "60%",
              }}
            >
              {val}
            </span>
          </div>
        ))}
        <div
          style={{
            marginTop: 16,
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.55 }}>
            Status
          </span>
          <Badge label={raw.status} color={statusColor[raw.status] ?? "grey"} />
        </div>
        <div style={{ marginTop: 24 }}>
          <GoldButton style={{ width: "100%", justifyContent: "center" }}>
            <Download size={14} /> Download Receipt (PDF)
          </GoldButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TransactionsPage() {
  const { transactions: rawTx, loading } = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [receipt, setReceipt] = useState(null);

  // Summary totals computed from raw numeric DB values — never from formatted strings
  const totalDeposits = rawTx
    .filter((t) => t.type === "Deposit" && t.status === "Completed")
    .reduce((s, t) => s + Number(t.net_amount), 0);
  const totalWithdrawals = rawTx
    .filter((t) => t.type === "Withdrawal" && t.status === "Completed")
    .reduce((s, t) => s + Number(t.net_amount), 0);
  const totalReturns = rawTx
    .filter((t) => t.type === "Return Credit" && t.status === "Completed")
    .reduce((s, t) => s + Number(t.net_amount), 0);

  // Map raw DB rows to display shape (only used for the table, not for calculations)
  const allTx = rawTx.map((tx) => {
    const sign = typeSign(tx.type);
    return {
      // keep the raw row so receipt modal can read real values
      _raw: tx,
      id: tx.reference,
      date: fmtDate(tx.created_at),
      type: tx.type,
      desc: tx.description ?? tx.type,
      amount: `${sign}${fmt(tx.amount)}`,
      fee: fmt(tx.fee ?? 0),
      net: `${sign}${fmt(tx.net_amount)}`,
      status: tx.status,
      method: tx.payment_method ?? "—",
      ref: tx.reference,
    };
  });

  const types = [
    "All",
    "Deposit",
    "Withdrawal",
    "Return Credit",
    "Bonus",
    "Fee",
  ];
  const statuses = ["All", "Completed", "Pending", "Failed", "Cancelled"];

  const filtered = allTx.filter((t) => {
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || t.type === typeFilter;
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        title="Transaction History"
        subtitle="A full record of all account activity."
      />

      {/* Summary strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Deposits",
            value: fmt(totalDeposits),
            color: "#4ade80",
          },
          {
            label: "Total Withdrawals",
            value: fmt(totalWithdrawals),
            color: "#f87171",
          },
          {
            label: "Total Returns Credited",
            value: fmt(totalReturns),
            color: "#60a5fa",
          },
          {
            label: "Net Balance Change",
            value: fmt(totalDeposits + totalReturns - totalWithdrawals),
            color: "#C9A84C",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#D6DEE8",
                opacity: 0.5,
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {s.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <SectionCard style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 200px", position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#D6DEE8",
                opacity: 0.4,
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or description…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 8,
                padding: "10px 12px 10px 36px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#D6DEE8",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {types.map((t) => (
              <option key={t} value={t} style={{ background: "#0F1422" }}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#D6DEE8",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s} style={{ background: "#0F1422" }}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("All");
              setStatusFilter("All");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#C9A84C",
              fontSize: 13,
              cursor: "pointer",
              padding: "10px 4px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Reset
          </button>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                {[
                  "#",
                  "Date & Time",
                  "Transaction ID",
                  "Type",
                  "Description",
                  "Amount",
                  "Fee",
                  "Net",
                  "Status",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      color: "#D6DEE8",
                      opacity: 0.5,
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#D6DEE8",
                      opacity: 0.4,
                    }}
                  >
                    <FileText
                      size={32}
                      style={{
                        marginBottom: 12,
                        display: "block",
                        margin: "0 auto 12px",
                      }}
                    />
                    {loading
                      ? "Loading transactions…"
                      : "No transactions found. Try adjusting your filters."}
                  </td>
                </tr>
              ) : (
                paginated.map((tx, i) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.4,
                      }}
                    >
                      {(page - 1) * perPage + i + 1}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.date}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#C9A84C",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {tx.id}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={tx.type}
                        color={typeColor[tx.type] ?? "grey"}
                      />
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.8,
                      }}
                    >
                      {tx.desc}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: tx.amount.startsWith("+")
                          ? "#4ade80"
                          : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {tx.amount}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.5,
                      }}
                    >
                      {tx.fee}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: tx.net.startsWith("+") ? "#4ade80" : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {tx.net}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={tx.status}
                        color={statusColor[tx.status] ?? "grey"}
                      />
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <button
                        onClick={() => setReceipt(tx)}
                        style={{
                          background: "none",
                          border: "1px solid rgba(201,168,76,0.3)",
                          borderRadius: 6,
                          padding: "5px 12px",
                          color: "#C9A84C",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#D6DEE8", opacity: 0.5 }}>
            Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length}{" "}
            transactions
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 6,
                padding: "6px 10px",
                color: "#D6DEE8",
                fontSize: 12,
                outline: "none",
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n} style={{ background: "#0F1422" }}>
                  {n} per page
                </option>
              ))}
            </select>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                color: "#D6DEE8",
                fontSize: 12,
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  border: "none",
                  background:
                    page === p
                      ? "linear-gradient(135deg, #C9A84C, #E8B84B)"
                      : "rgba(255,255,255,0.04)",
                  color: page === p ? "#0A0E1A" : "#D6DEE8",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                color: "#D6DEE8",
                fontSize: 12,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </SectionCard>

      <AnimatePresence>
        {receipt && (
          <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
