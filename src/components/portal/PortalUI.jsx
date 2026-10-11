// Shared UI primitives for portal pages

export function KPICard({
  label,
  value,
  sub,
  trend,
  trendUp,
  icon: Icon,
  accent = false,
}) {
  return (
    <div
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(232,184,75,0.06))"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${accent ? "rgba(201,168,76,0.35)" : "rgba(201,168,76,0.12)"}`,
        borderRadius: 16,
        padding: "24px 24px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#D6DEE8",
            opacity: 0.6,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(201,168,76,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={17} color="#C9A84C" />
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "Cormorant Garamond, serif",
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      {(sub || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {trend && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: trendUp ? "#4ade80" : "#f87171",
                background: trendUp
                  ? "rgba(74,222,128,0.1)"
                  : "rgba(248,113,113,0.1)",
                padding: "2px 8px",
                borderRadius: 100,
              }}
            >
              {trendUp ? "▲" : "▼"} {trend}
            </span>
          )}
          {sub && (
            <span style={{ fontSize: 12, color: "#D6DEE8", opacity: 0.5 }}>
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  actionHref,
  children,
  style = {},
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: 16,
        overflow: "hidden",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(201,168,76,0.08)",
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {title}
            </h3>
          )}
          {action && (
            <a
              href={actionHref ?? "#"}
              style={{
                fontSize: 13,
                color: "#C9A84C",
                textDecoration: "none",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {action} →
            </a>
          )}
        </div>
      )}
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

export function Badge({ label, color = "green" }) {
  const map = {
    green: { bg: "rgba(74,222,128,0.12)", text: "#4ade80" },
    amber: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
    blue: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa" },
    grey: { bg: "rgba(156,163,175,0.12)", text: "#9ca3af" },
    red: { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
    gold: { bg: "rgba(201,168,76,0.15)", text: "#C9A84C" },
    purple: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa" },
  };
  const c = map[color] ?? map.grey;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        padding: "3px 10px",
        borderRadius: 100,
        background: c.bg,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function Table({ columns, rows, emptyMsg = "No data found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
            {columns.map((col) => (
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
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "#D6DEE8",
                  opacity: 0.4,
                  fontSize: 14,
                }}
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "13px 14px",
                      color: "#D6DEE8",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GoldButton({
  children,
  onClick,
  style = {},
  variant = "solid",
}) {
  const base = {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 700,
    fontSize: 13,
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "opacity 0.2s, transform 0.15s",
    border: "none",
  };
  const solid = {
    background: "linear-gradient(135deg, #C9A84C, #E8B84B)",
    color: "#0A0E1A",
  };
  const outline = {
    background: "transparent",
    color: "#C9A84C",
    border: "1px solid rgba(201,168,76,0.4)",
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...(variant === "solid" ? solid : outline), ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        marginBottom: 32,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{ fontSize: 14, color: "#D6DEE8", opacity: 0.6, margin: 0 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
