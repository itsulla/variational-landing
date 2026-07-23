import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  RATES_API_BASE,
  VARIATIONAL_LAUNCH_DATE,
} from "../../config.js";
import TrustStrip from "../../components/TrustStrip.jsx";
import { CountdownBanner } from "../../components/Footer.jsx";
import LiveDataStatus from "../../components/LiveDataStatus.jsx";
import { liveStateFromPayload } from "../../lib/liveData.js";

const WINDOW_OPTIONS = [
  { key: "ytd", label: "Year to date" },
  { key: "launch", label: "Since Variational launch" },
  { key: "all", label: "All-time" },
];

const STATIC_PROTOCOL_FALLBACK = [
  {
    name: "Variational",
    slug: "variational",
    architecture: "Off-chain OLP RFQ execution with on-chain settlement",
    fee_model: "0% trading fees",
    fees_note: "Live metrics unavailable",
  },
  {
    name: "Hyperliquid",
    slug: "hyperliquid",
    architecture: "Purpose-built on-chain order book",
    fee_model: "Maker/taker schedule",
    fees_note: "Live metrics unavailable",
  },
  {
    name: "Lighter",
    slug: "lighter",
    architecture: "ZK rollup order book",
    fee_model: "Tiered fee schedule",
    fees_note: "Live metrics unavailable",
  },
];

/* ─── Theme tokens ────────────────────────────────────────────────── */
const THEME = {
  bg: "#0A0A0A",
  cardBg: "#1A1A1A",
  text: "#e8e0d0",
  accent: "#FFB800",
  accentDim: "#FFB80044",
  positive: "#22c55e",
  negative: "#ef4444",
  muted: "#888888",
  mutedLight: "#666666",
  barGray: "#444444",
  borderColor: "#ffffff12",
};

const FONTS = {
  heading: "'IBM Plex Mono', monospace",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

/* ─── Inject Google Fonts + keyframes once ────────────────────────── */
function injectGlobalStyles() {
  const id = "compare-theme-globals";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

    @keyframes compare-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes compare-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes compare-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    * { box-sizing: border-box; }

    .compare-table-wrap::-webkit-scrollbar {
      height: 6px;
    }
    .compare-table-wrap::-webkit-scrollbar-track {
      background: ${THEME.bg};
    }
    .compare-table-wrap::-webkit-scrollbar-thumb {
      background: ${THEME.mutedLight};
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Formatting helpers ──────────────────────────────────────────── */
function formatNumber(n) {
  if (!n && n !== 0) return "\u2014";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatTimestamp(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function timeSince(iso) {
  if (!iso) return "\u2014";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/* ─── Shared inline helpers ───────────────────────────────────────── */
const pageWrap = {
  minHeight: "100vh",
  background: THEME.bg,
  color: THEME.text,
  fontFamily: FONTS.body,
  margin: 0,
  padding: 0,
  overflowX: "hidden",
};

const container = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 24px",
};

/* ─── Data hook ───────────────────────────────────────────────────── */
function useThreeWayData(windowKey) {
  const [protocols, setProtocols] = useState([]);
  const [windowMeta, setWindowMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [liveState, setLiveState] = useState({ status: "live", meta: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const attemptTime = new Date().toISOString();
      if (!cancelled) {
        setLastAttempt(attemptTime);
        setLoading(true);
      }

      try {
        const res = await fetch(
          `${RATES_API_BASE}/api/compare/three?window=${windowKey}`
        );
        if (!res.ok) throw new Error("API error");
        const payload = await res.json();
        if (!cancelled) {
          const state = liveStateFromPayload(payload);
          const data = state.data;
          setProtocols(data.protocols || []);
          setWindowMeta(data.window || null);
          setLastUpdated(state.meta?.generatedAt || data.last_updated || attemptTime);
          setLiveState({ status: state.status, meta: state.meta });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const windowLabel = WINDOW_OPTIONS.find((option) => option.key === windowKey)?.label;
          setProtocols(STATIC_PROTOCOL_FALLBACK);
          setWindowMeta({ key: windowKey, label: windowLabel || "Selected window" });
          setLiveState({ status: "fallback", meta: null, error: err.message });
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [windowKey]);

  return {
    protocols,
    windowMeta,
    loading,
    error,
    lastUpdated,
    lastAttempt,
    ...liveState,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER BAR
   ═══════════════════════════════════════════════════════════════════════ */
function HeaderBar({ lastUpdated }) {
  const bar = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    padding: "12px 24px",
    background: THEME.cardBg,
    borderBottom: `1px solid ${THEME.borderColor}`,
    fontFamily: FONTS.mono,
    fontSize: "0.78rem",
    fontWeight: 600,
  };

  const dot = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: THEME.positive,
    marginRight: 6,
    animation: "compare-pulse 1.8s ease-in-out infinite",
    flexShrink: 0,
  };

  return (
    <div style={bar}>
      <h1
        style={{
          color: THEME.accent,
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontSize: "0.85rem",
          margin: 0,
        }}
      >
        PERP DEX COMPARE
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: THEME.muted,
          fontSize: "0.72rem",
          letterSpacing: "0.06em",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: `${THEME.text}88` }}>Data from DefiLlama</span>
        <span
          style={{ display: "flex", alignItems: "center", color: THEME.text }}
        >
          <span style={dot} />
          LIVE
        </span>
        <span>{lastUpdated ? formatTimestamp(lastUpdated) : "\u2014"}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════════════════════ */
function SkeletonBlock({ width = "100%", height = 20, style: extra = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: `linear-gradient(90deg, ${THEME.cardBg} 25%, #252525 50%, ${THEME.cardBg} 75%)`,
        backgroundSize: "200% 100%",
        animation: "compare-shimmer 1.5s ease-in-out infinite",
        ...extra,
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div style={pageWrap}>
      <div style={{ ...container, paddingTop: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${THEME.borderColor}`,
                padding: 20,
              }}
            >
              <SkeletonBlock width="60%" height={12} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="80%" height={28} />
            </div>
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock
            key={i}
            height={48}
            style={{ marginBottom: 4 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════════════ */
function ErrorState({ lastAttempt }) {
  return (
    <div
      style={{
        ...container,
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: "1.1rem",
          fontWeight: 600,
          color: THEME.accent,
          marginBottom: 12,
        }}
      >
        DATA TEMPORARILY UNAVAILABLE
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: "0.78rem",
          color: THEME.muted,
        }}
      >
        Last attempt: {lastAttempt ? formatTimestamp(lastAttempt) : "\u2014"}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.85rem",
          color: `${THEME.text}88`,
          marginTop: 16,
          maxWidth: 400,
          margin: "16px auto 0",
          lineHeight: 1.6,
        }}
      >
        The comparison data feed is currently offline. Data is refreshed
        automatically every 30 minutes. Please check back shortly.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WINDOW FILTER PILLS
   ═══════════════════════════════════════════════════════════════════════ */
function WindowFilter({ value, onChange, windowMeta }) {
  const wrap = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "20px 0 4px",
  };
  const row = {
    display: "inline-flex",
    border: `1px solid ${THEME.borderColor}`,
    background: THEME.cardBg,
    borderRadius: 3,
    overflow: "hidden",
  };
  const pill = (active) => ({
    padding: "9px 18px",
    fontFamily: FONTS.mono,
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    background: active ? THEME.accent : "transparent",
    color: active ? "#000" : THEME.text,
    border: "none",
    borderRight: `1px solid ${THEME.borderColor}`,
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  });
  return (
    <section style={{ ...container, ...wrap }}>
      <div style={row}>
        {WINDOW_OPTIONS.map((opt, i) => (
          <button
            key={opt.key}
            style={{
              ...pill(value === opt.key),
              borderRight:
                i === WINDOW_OPTIONS.length - 1
                  ? "none"
                  : `1px solid ${THEME.borderColor}`,
            }}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {windowMeta && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.68rem",
            color: THEME.muted,
            letterSpacing: "0.04em",
          }}
        >
          {windowMeta.label} — {windowMeta.days} day
          {windowMeta.days === 1 ? "" : "s"} of fee data
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUMMARY STATS ROW
   ═══════════════════════════════════════════════════════════════════════ */
function SummaryStats({ protocols, lastUpdated }) {
  const totalVolume24h = useMemo(
    () => protocols.reduce((sum, p) => sum + (p.volume_24h || 0), 0),
    [protocols]
  );
  const variational = protocols.find(
    (p) => p.name && p.name.toLowerCase() === "variational"
  );
  const marketShare =
    variational && totalVolume24h > 0
      ? ((variational.volume_24h || 0) / totalVolume24h) * 100
      : 0;
  const totalOI = protocols.reduce((s, p) => s + (p.open_interest || 0), 0);

  const stats = [
    { label: "COMBINED 24H VOLUME", value: formatNumber(totalVolume24h) },
    {
      label: "VARIATIONAL SHARE (24H)",
      value: `${marketShare.toFixed(2)}%`,
    },
    { label: "COMBINED OPEN INTEREST", value: formatNumber(totalOI) },
    { label: "DATA FRESHNESS", value: timeSince(lastUpdated) },
  ];

  return (
    <section style={{ padding: "24px 0 0" }}>
      <div style={container}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            border: `1px solid ${THEME.borderColor}`,
          }}
          className="compare-summary-grid"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "18px 20px",
                background: THEME.cardBg,
                borderRight:
                  i < stats.length - 1
                    ? `1px solid ${THEME.borderColor}`
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  color: THEME.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: THEME.accent,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Responsive override for summary grid */}
      <style>{`
        @media (max-width: 768px) {
          .compare-summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .compare-summary-grid > div:nth-child(2) {
            border-right: none !important;
          }
          .compare-summary-grid > div:nth-child(1),
          .compare-summary-grid > div:nth-child(2) {
            border-bottom: 1px solid ${THEME.borderColor} !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   THREE-WAY COMPARISON TABLE — metrics as rows, protocols as columns
   ═══════════════════════════════════════════════════════════════════════ */
function ThreeWayTable({ protocols, windowMeta }) {
  const order = ["variational", "hyperliquid", "lighter"];
  const byName = {};
  for (const p of protocols) byName[p.name.toLowerCase()] = p;
  const cols = order.map((k) => byName[k]).filter(Boolean);

  const winLabel = windowMeta?.label || "Selected window";

  function fmtFee(p) {
    if (p.fees_note) return p.fees_note;
    return formatNumber(p.fees_window);
  }
  function fmtAvg(p) {
    if (p.fees_note) return "—";
    return formatNumber(p.daily_avg_fees_window);
  }
  function fmtMarkets(p) {
    return p.markets_count != null ? String(p.markets_count) : "—";
  }
  function fmtNum(v) {
    return v != null ? formatNumber(v) : "—";
  }

  // RWA / TradFi coverage by protocol — all three perp DEXes have meaningful RWA
  // exposure as of May 2026. Numbers verified against each protocol's live API.
  // Don't oversell Variational here: HL's 'xyz' sub-protocol leads on both count
  // and volume right now ($1.8B+ 24h). Variational's pitch is the Phase 2 roadmap
  // (100+ TradFi markets summer 2026) and the OLP architecture, not current breadth.
  const RWA_COVERAGE = {
    variational:
      "25+ live & adding ~1/day (OPENAI, ANTHROPIC pre-IPO; SPCX, TSM, MU, QCOM stocks; EWY/EWJ ETFs; gold, oil); 100+ more this summer",
    hyperliquid:
      "79 on 'xyz' sub-protocol — $1.8B+ 24h vol (incl. AAPL, NVDA, SP500, BRENTOIL, SPCX, RKLB)",
    lighter:
      "49 live (~3% of platform volume — TSLA, NVDA, COIN, XAU, EURUSD, etc.)",
  };

  const rows = [
    {
      label: "Architecture",
      sublabel: null,
      cell: (p) => p.architecture || "—",
      mono: false,
    },
    {
      label: "Fee model",
      sublabel: null,
      cell: (p) => p.fee_model || "—",
      mono: false,
    },
    {
      label: "Markets",
      sublabel: "tradable instruments",
      cell: (p) => fmtMarkets(p),
      mono: true,
    },
    {
      label: "RWA / TradFi",
      sublabel: "real-world asset coverage",
      cell: (p) => RWA_COVERAGE[p.slug] || "—",
      mono: false,
    },
    {
      label: "24h Volume",
      sublabel: "live snapshot",
      cell: (p) => fmtNum(p.volume_24h),
      mono: true,
    },
    {
      label: "Cumulative Volume",
      sublabel: "all-time (where reported)",
      cell: (p) => fmtNum(p.cumulative_volume),
      mono: true,
    },
    {
      label: `Fees — ${winLabel}`,
      sublabel: "from DefiLlama",
      cell: (p) => fmtFee(p),
      mono: true,
    },
    {
      label: "Daily Avg Fees",
      sublabel: "across selected window",
      cell: (p) => fmtAvg(p),
      mono: true,
    },
    {
      label: "Open Interest",
      sublabel: "live snapshot",
      cell: (p) => fmtNum(p.open_interest),
      mono: true,
    },
    {
      label: "TVL",
      sublabel: "DefiLlama snapshot",
      cell: (p) => fmtNum(p.tvl),
      mono: true,
    },
  ];

  const isVar = (p) =>
    p && p.name && p.name.toLowerCase() === "variational";

  const headerCell = (p) => ({
    padding: "16px 18px",
    textAlign: "left",
    fontFamily: FONTS.mono,
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: isVar(p) ? THEME.accent : THEME.text,
    background: isVar(p) ? `${THEME.accent}10` : THEME.cardBg,
    borderBottom: `2px solid ${isVar(p) ? THEME.accent : THEME.borderColor}`,
    whiteSpace: "nowrap",
    width: "26%",
  });

  const labelCell = {
    padding: "14px 18px",
    fontFamily: FONTS.mono,
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: THEME.muted,
    background: THEME.bg,
    borderBottom: `1px solid ${THEME.borderColor}`,
    verticalAlign: "top",
    width: "22%",
    minWidth: 200,
  };

  const dataCell = (p, mono) => ({
    padding: "14px 18px",
    fontFamily: mono ? FONTS.mono : FONTS.body,
    fontSize: "0.88rem",
    fontWeight: isVar(p) ? 600 : 500,
    color: isVar(p) ? THEME.text : `${THEME.text}d0`,
    background: isVar(p) ? `${THEME.accent}08` : "transparent",
    borderBottom: `1px solid ${THEME.borderColor}`,
    borderLeft: isVar(p) ? `3px solid ${THEME.accent}` : "1px solid transparent",
    // Numeric/mono rows stay single-line for visual rhythm; descriptive
    // rows (Architecture, Fee model, RWA/TradFi) wrap so long strings
    // don't collide across columns.
    whiteSpace: mono ? "nowrap" : "normal",
    verticalAlign: "top",
    lineHeight: mono ? 1.2 : 1.45,
    wordBreak: "break-word",
  });

  return (
    <section style={{ padding: "20px 0 24px" }}>
      <div style={container}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: THEME.muted,
            }}
          >
            PROTOCOL COMPARISON — 3 PROTOCOLS
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.65rem",
              color: `${THEME.muted}cc`,
              letterSpacing: "0.04em",
            }}
          >
            Live: native APIs &middot; Fees/TVL: DefiLlama
          </span>
        </div>
        <div
          className="compare-table-wrap"
          style={{
            overflowX: "auto",
            border: `1px solid ${THEME.borderColor}`,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 760,
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...labelCell, background: THEME.cardBg, color: THEME.muted, borderBottom: `2px solid ${THEME.borderColor}`, fontSize: "0.68rem" }}>
                  Metric
                </th>
                {cols.map((p) => (
                  <th key={p.slug} style={headerCell(p)}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td style={labelCell}>
                    <div>{row.label}</div>
                    {row.sublabel && (
                      <div
                        style={{
                          marginTop: 4,
                          textTransform: "none",
                          fontSize: "0.65rem",
                          color: `${THEME.muted}aa`,
                          letterSpacing: "0.02em",
                          fontWeight: 400,
                        }}
                      >
                        {row.sublabel}
                      </div>
                    )}
                  </td>
                  {cols.map((p) => (
                    <td key={p.slug} style={dataCell(p, row.mono)}>
                      {row.cell(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONTS.mono,
            fontSize: "0.62rem",
            color: `${THEME.muted}cc`,
            lineHeight: 1.6,
          }}
        >
          Variational charges 0% trading fees, so its fee totals stay at $0
          regardless of window. Cumulative volume is reported only by protocols
          that expose it directly — Hyperliquid &amp; Lighter historical volume
          is paywalled on DefiLlama.
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   VOLUME CHART
   ═══════════════════════════════════════════════════════════════════════ */
function VolumeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div
      style={{
        background: THEME.cardBg,
        border: `1px solid ${THEME.borderColor}`,
        padding: "10px 14px",
        fontFamily: FONTS.mono,
        fontSize: "0.78rem",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: data.isVariational ? THEME.accent : THEME.text,
          marginBottom: 4,
        }}
      >
        {data.name}
      </div>
      <div style={{ color: THEME.muted }}>
        24h Volume: {formatNumber(data.volume)}
      </div>
    </div>
  );
}

function VolumeChart({ protocols }) {
  const chartData = useMemo(() => {
    return [...protocols]
      .filter((p) => p.volume_24h > 0)
      .sort((a, b) => (a.volume_24h || 0) - (b.volume_24h || 0))
      .map((p) => ({
        name: p.name,
        volume: p.volume_24h || 0,
        isVariational:
          p.name && p.name.toLowerCase() === "variational",
      }));
  }, [protocols]);

  const chartHeight = Math.max(300, chartData.length * 40);


  if (chartData.length === 0) return null;

  return (
    <section style={{ padding: "8px 0 24px" }}>
      <div style={container}>
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: THEME.muted,
            }}
          >
            24H VOLUME BY PROTOCOL
          </span>
        </div>
        <div
          style={{
            border: `1px solid ${THEME.borderColor}`,
            background: THEME.cardBg,
            padding: "20px 16px 12px",
          }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 10 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => formatNumber(v)}
                tick={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fill: THEME.muted,
                }}
                axisLine={{ stroke: THEME.borderColor }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fill: THEME.text,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<VolumeTooltip />}
                cursor={{ fill: `${THEME.text}08` }}
              />
              <Bar dataKey="volume" radius={[0, 3, 3, 0]} maxBarSize={28}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isVariational ? THEME.accent : THEME.barGray}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WHY VARIATIONAL CALLOUT
   ═══════════════════════════════════════════════════════════════════════ */
function WhyVariational() {
  // Ranked by genuine differentiation strength. RWA breadth deliberately
  // omitted \u2014 Hyperliquid currently leads on both market count (79) and
  // 24h volume ($1.8B+) via its 'xyz' sub-protocol, so it's not a moat.
  const points = [
    {
      label: "Zero Trading Fees",
      detail:
        "0% maker and taker fees, permanently. Hyperliquid charges 0.015% maker / 0.045% taker; OLP earns by capturing the spread instead.",
    },
    {
      label: "Private RFQ Execution",
      detail:
        "No public order book \u2014 positions, orders, and liquidation levels stay private. Hyperliquid's L4 order book is fully public.",
    },
    {
      label: "Vertically Integrated Liquidity (OLP)",
      detail:
        "Single counterparty aggregates depth from CEXs, DEXs, and TradFi dealers \u2014 tight deterministic quotes without bootstrapping a new order book per market.",
    },
    {
      label: "Deribit-Compatible Portfolio Margin",
      detail:
        "Cross-margin every position from one account. Engine matches Deribit's portfolio-margin math with a decorrelation-risk parameter \u2014 sophisticated feature competitors don't market.",
    },
    {
      label: "Up to ~50% Community Allocation",
      detail:
        "Per the docs (token/usdvar). Higher community share than Hyperliquid (31%) or Lighter (25%).",
    },
    {
      label: "$50M Series A (May 2026)",
      detail:
        "Led by Dragonfly Capital \u2014 Bain Capital Crypto and Coinbase Ventures participated. Audited by Spearbit and Zellic.",
    },
  ];

  return (
    <section style={{ padding: "0 0 24px" }}>
      <div style={container}>
        <div
          style={{
            border: `1px solid ${THEME.accent}44`,
            background: `${THEME.accent}06`,
            padding: "28px 28px 24px",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: THEME.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            WHY VARIATIONAL?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {points.map((pt) => (
              <div key={pt.label} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: THEME.accent,
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: THEME.text,
                      marginBottom: 2,
                    }}
                  >
                    {pt.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: "0.78rem",
                      color: THEME.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {pt.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TOOL CROSS-LINKS
   ═══════════════════════════════════════════════════════════════════════ */
function ToolCrossLinks() {
  const linkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    border: `1px solid ${THEME.borderColor}`,
    background: `${THEME.accent}08`,
    color: THEME.text,
    fontFamily: FONTS.mono,
    fontSize: "0.75rem",
    fontWeight: 500,
    textDecoration: "none",
    letterSpacing: "0.04em",
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <section style={{ padding: "16px 0 8px" }}>
      <div style={{ ...container, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a
          href="/rates"
          style={linkStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.accent; e.currentTarget.style.background = `${THEME.accent}15`; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderColor; e.currentTarget.style.background = `${THEME.accent}08`; }}
        >
          <span style={{ color: THEME.accent }}>&#9679;</span> Funding Rate Arb &rarr;
        </a>
        <a
          href="/liquidations"
          style={linkStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00FF41"; e.currentTarget.style.background = "#00FF4115"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderColor; e.currentTarget.style.background = `${THEME.accent}08`; }}
        >
          <span style={{ color: "#00FF41" }}>&#9679;</span> Liquidation Monitor &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════════════ */
function CTASection() {
  const ctaButton = {
    display: "inline-block",
    padding: "14px 40px",
    background: THEME.accent,
    color: "#000",
    fontFamily: FONTS.mono,
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.06em",
    border: "none",
    borderRadius: 2,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.15s, transform 0.1s",
  };

  return (
    <section style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={container}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: THEME.text,
            marginBottom: 12,
            letterSpacing: "0.02em",
          }}
        >
          Start Trading on Variational
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.75rem",
            color: THEME.muted,
            marginBottom: 20,
          }}
        >
          ACCESS CODE:{" "}
          <span style={{ color: THEME.accent, fontWeight: 600 }}>
            {REFERRAL_CODE}
          </span>
        </div>
        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#E0A300";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = THEME.accent;
          }}
        >
          START TRADING &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
function CompareFooter() {
  return (
    <>
      <CountdownBanner theme={THEME} />
      <footer
        style={{
          padding: "24px 0 32px",
          borderTop: `1px solid ${THEME.borderColor}`,
        }}
      >
        <div style={container}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.68rem",
            color: THEME.muted,
            lineHeight: 1.8,
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div>
            Data sourced from DefiLlama API. Protocol metadata manually curated.
            Updated every 30 minutes.
          </div>
          <div style={{ marginTop: 8, color: `${THEME.muted}aa` }}>
            This page contains a referral link. Trading perpetual contracts
            carries risk. Past performance is not indicative of future results.
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */
export default function CompareTheme() {
  const [ready, setReady] = useState(false);
  const [windowKey, setWindowKey] = useState("ytd");
  const {
    protocols,
    windowMeta,
    loading,
    error,
    lastUpdated,
    lastAttempt,
    status,
    meta,
  } =
    useThreeWayData(windowKey);

  useEffect(() => {
    injectGlobalStyles();
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!ready || (loading && protocols.length === 0)) {
    return (
      <div style={pageWrap}>
        <HeaderBar lastUpdated={null} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && protocols.length === 0) {
    return (
      <div style={pageWrap}>
        <HeaderBar lastUpdated={lastUpdated} />
        <ErrorState lastAttempt={lastAttempt} />
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <HeaderBar lastUpdated={lastUpdated} />
      <div style={{ ...container, paddingTop: 14 }}>
        <LiveDataStatus status={status} meta={meta} />
      </div>
      <WindowFilter
        value={windowKey}
        onChange={setWindowKey}
        windowMeta={windowMeta}
      />
      <SummaryStats protocols={protocols} lastUpdated={lastUpdated} />
      <ThreeWayTable protocols={protocols} windowMeta={windowMeta} />
      <VolumeChart protocols={protocols} />
      <WhyVariational />
      <CTASection />
      <ToolCrossLinks />
      <TrustStrip theme={{ ...THEME, muted: THEME.muted, text: THEME.text, accent: THEME.accent }} fonts={FONTS} compact />
      <CompareFooter />
    </div>
  );
}
