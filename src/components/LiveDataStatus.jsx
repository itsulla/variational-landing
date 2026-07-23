import { formatDataAge } from "../lib/liveData.js";

const STATUS_COPY = {
  live: { label: "Live data", color: "#16a34a", background: "#16a34a12" },
  stale: { label: "Cached data", color: "#d97706", background: "#d9770614" },
  degraded: { label: "Partial live data", color: "#ea580c", background: "#ea580c14" },
  fallback: { label: "Illustrative fallback data", color: "#dc2626", background: "#dc262614" },
  unavailable: { label: "Live data unavailable", color: "#dc2626", background: "#dc262614" },
};

export default function LiveDataStatus({ status = "live", meta, error, style }) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.degraded;
  const details = [];

  if (meta?.dataAgeMs != null) details.push(formatDataAge(meta.dataAgeMs));
  if (meta?.source) details.push(meta.source);
  if (status === "fallback" || status === "unavailable") {
    details.push(error || "Live API unavailable");
  }

  return (
    <div
      role="status"
      aria-live={status === "live" ? "off" : "polite"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "6px 10px",
        width: "fit-content",
        maxWidth: "100%",
        padding: "6px 10px",
        border: `1px solid ${copy.color}33`,
        borderRadius: 6,
        color: copy.color,
        background: copy.background,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.02em",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          flex: "0 0 auto",
          borderRadius: "50%",
          background: copy.color,
          boxShadow: status === "live" ? `0 0 8px ${copy.color}` : "none",
        }}
      />
      <span>{copy.label}</span>
      {details.length > 0 && (
        <span style={{ color: "currentColor", opacity: 0.78, fontWeight: 500 }}>
          — {details.join(" · ")}
        </span>
      )}
    </div>
  );
}
