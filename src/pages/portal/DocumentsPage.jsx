import { Download, FileText } from "lucide-react";
import {
  SectionCard,
  Badge,
  PageHeader,
} from "../../components/portal/PortalUI";
import { useDocuments } from "../../hooks/usePortalData";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const typeColor = {
  Statement: "blue",
  Certificate: "gold",
  "Tax Document": "purple",
  Agreement: "grey",
  Other: "grey",
};

export default function DocumentsPage() {
  const { documents, loading } = useDocuments();

  return (
    <div>
      <PageHeader
        title="Documents & Statements"
        subtitle="Access your investment certificates, statements, and tax documents."
      />

      <SectionCard>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                {["Document Name", "Type", "Date", "Size", "Action"].map(
                  (c) => (
                    <th
                      key={c}
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
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#D6DEE8",
                      opacity: 0.4,
                      fontSize: 13,
                    }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#D6DEE8",
                      opacity: 0.4,
                      fontSize: 13,
                    }}
                  >
                    <FileText
                      size={32}
                      style={{
                        display: "block",
                        margin: "0 auto 12px",
                        opacity: 0.3,
                      }}
                    />
                    No documents available yet.
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr
                    key={d.id}
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
                    <td style={{ padding: "13px 14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <FileText size={16} color="#C9A84C" />
                        <span style={{ color: "#fff", fontWeight: 500 }}>
                          {d.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <Badge
                        label={d.doc_type}
                        color={typeColor[d.doc_type] ?? "grey"}
                      />
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.7,
                      }}
                    >
                      {fmtDate(d.created_at)}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "#D6DEE8",
                        opacity: 0.5,
                      }}
                    >
                      {d.file_size ?? "—"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "none",
                          border: "1px solid rgba(201,168,76,0.3)",
                          borderRadius: 6,
                          padding: "6px 12px",
                          color: "#C9A84C",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "DM Sans, sans-serif",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          textDecoration: "none",
                        }}
                      >
                        <Download size={13} /> Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
