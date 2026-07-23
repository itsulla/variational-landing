import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Footer from "../../components/Footer.jsx";
import LiveDataStatus from "../../components/LiveDataStatus.jsx";
import { fallbackLiveState, liveStateFromPayload } from "../../lib/liveData.js";
import { REFERRAL_LINK, REFERRAL_CODE, RATES_API_BASE } from "../../config.js";

/* ── Theme tokens ─────────────────────────────────────────── */
const THEME = {
  bg: "#000000",
  bgCard: "#0A0A0A",
  text: "#00FF41",
  accent: "#00FF41",
  muted: "#00FF4166",
  red: "#FF4444",
  orange: "#FF8800",
  yellow: "#FFD700",
  yellowGreen: "#AAFF00",
  dimGreen: "#00AA00",
  white: "#CCCCCC",
  dangerGlow: "#FF444444",
};

const FONTS = {
  heading: "'JetBrains Mono', monospace",
  body: "'JetBrains Mono', monospace",
};

const ASSETS = ["BTC", "ETH", "SOL", "HYPE", "ARB", "DOGE", "WIF", "AVAX", "LINK", "SUI"];

const LEVERAGE_COLORS = {
  50: THEME.red,
  20: THEME.orange,
  10: THEME.yellow,
  5: THEME.yellowGreen,
  3: THEME.dimGreen,
};

const LEVERAGE_LEVELS = [50, 20, 10, 5, 3];

/* ── Mock data ────────────────────────────────────────────── */
function generateMockLevels(markPrice) {
  return LEVERAGE_LEVELS.map((lev) => {
    const marginPct = 1 / lev;
    const maintenancePct = marginPct * 0.5;
    const longLiqPrice = markPrice * (1 - marginPct + maintenancePct);
    const shortLiqPrice = markPrice * (1 + marginPct - maintenancePct);
    return {
      leverage: lev,
      long_liq_price: longLiqPrice,
      short_liq_price: shortLiqPrice,
      long_distance_pct: ((longLiqPrice - markPrice) / markPrice) * 100,
      short_distance_pct: ((shortLiqPrice - markPrice) / markPrice) * 100,
    };
  });
}

const MOCK_ASSETS_DATA = [
  { coin: "BTC", mark_price: 87250.0, open_interest: 4850000000, funding_rate: 0.0142 },
  { coin: "ETH", mark_price: 2180.5, open_interest: 2100000000, funding_rate: 0.0098 },
  { coin: "SOL", mark_price: 138.2, open_interest: 890000000, funding_rate: 0.0215 },
  { coin: "HYPE", mark_price: 18.45, open_interest: 520000000, funding_rate: 0.0380 },
  { coin: "ARB", mark_price: 0.52, open_interest: 310000000, funding_rate: -0.0065 },
  { coin: "DOGE", mark_price: 0.172, open_interest: 420000000, funding_rate: 0.0110 },
  { coin: "WIF", mark_price: 0.68, open_interest: 180000000, funding_rate: 0.0450 },
  { coin: "AVAX", mark_price: 22.4, open_interest: 350000000, funding_rate: 0.0085 },
  { coin: "LINK", mark_price: 14.8, open_interest: 290000000, funding_rate: 0.0120 },
  { coin: "SUI", mark_price: 2.85, open_interest: 260000000, funding_rate: 0.0195 },
];

function buildMockAssetLevels(coin) {
  const asset = MOCK_ASSETS_DATA.find((a) => a.coin === coin) || MOCK_ASSETS_DATA[0];
  return {
    coin: asset.coin,
    mark_price: asset.mark_price,
    open_interest: asset.open_interest,
    funding_rate: asset.funding_rate,
    levels: generateMockLevels(asset.mark_price),
    updated_at: new Date().toISOString(),
  };
}

function buildMockAllAssets() {
  return {
    assets: MOCK_ASSETS_DATA.map((a) => ({
      ...a,
      levels: generateMockLevels(a.mark_price),
    })),
    updated_at: new Date().toISOString(),
  };
}

/* ── Inject fonts + keyframes ─────────────────────────────── */
const STYLE_ID = "liquidations-theme-keyframes";
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @keyframes liq-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    @keyframes liq-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes liq-pulse-danger {
      0%, 100% { box-shadow: 0 0 4px rgba(255,68,68,0.15); }
      50% { box-shadow: 0 0 16px rgba(255,68,68,0.4); }
    }

    @keyframes liq-scanline-move {
      0% { transform: translateY(-100px); }
      100% { transform: translateY(100vh); }
    }

    @keyframes liq-glow-pulse {
      0%, 100% { box-shadow: 0 0 8px rgba(0,255,65,0.1); }
      50% { box-shadow: 0 0 20px rgba(0,255,65,0.25); }
    }

    * { box-sizing: border-box; }

    .liq-asset-scroll::-webkit-scrollbar { height: 4px; }
    .liq-asset-scroll::-webkit-scrollbar-track { background: #0A0A0A; }
    .liq-asset-scroll::-webkit-scrollbar-thumb { background: #00FF4133; border-radius: 2px; }

    .liq-table-wrap::-webkit-scrollbar { height: 6px; }
    .liq-table-wrap::-webkit-scrollbar-track { background: #0A0A0A; }
    .liq-table-wrap::-webkit-scrollbar-thumb { background: #00FF4122; border-radius: 3px; }
  `;
  document.head.appendChild(style);
}

/* ── Normalize API levels to frontend format ─────────────── */
function normalizeLevels(levels) {
  if (!Array.isArray(levels)) return [];
  return levels.map((l) => ({
    leverage: l.leverage,
    long_liq_price: l.long_liquidation ?? l.long_liq_price ?? 0,
    short_liq_price: l.short_liquidation ?? l.short_liq_price ?? 0,
    long_distance_pct: l.long_distance_pct ?? 0,
    short_distance_pct: l.short_distance_pct ?? 0,
  }));
}

/* ── Format helpers ───────────────────────────────────────── */
function formatPrice(price) {
  if (price == null || isNaN(price)) return "---";
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatOI(oi) {
  if (oi == null || isNaN(oi)) return "---";
  if (oi >= 1e9) return `$${(oi / 1e9).toFixed(2)}B`;
  if (oi >= 1e6) return `$${(oi / 1e6).toFixed(1)}M`;
  return `$${oi.toLocaleString()}`;
}

function formatFundingRate(rate) {
  if (rate == null || isNaN(rate)) return "---";
  // Hyperliquid settles funding EVERY HOUR and the API's funding field
  // is the hourly rate, so annualization is x24x365 — not x365.
  const annualized = rate * 24 * 365 * 100;
  const sign = annualized >= 0 ? "+" : "";
  return `${sign}${annualized.toFixed(2)}%`;
}

function formatTimestamp(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", { hour12: false }) + " UTC";
  } catch {
    return "---";
  }
}

/* ── Data hooks ───────────────────────────────────────────── */
function useAssetLevels(coin) {
  const [data, setData] = useState(() => buildMockAssetLevels(coin));
  const [loading, setLoading] = useState(true);
  const [liveState, setLiveState] = useState({ status: "fallback", meta: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(
          `${RATES_API_BASE}/api/liquidations/levels?coin=${coin}`
        );
        if (!res.ok) throw new Error("API error");
        const payload = await res.json();
        if (!cancelled) {
          const state = liveStateFromPayload(payload);
          setData({
            ...state.data,
            levels: normalizeLevels(state.data.levels),
          });
          setLiveState({ status: state.status, meta: state.meta, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setData(buildMockAssetLevels(coin));
          const fallback = fallbackLiveState(null, err);
          setLiveState({ status: fallback.status, meta: null, error: fallback.error });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [coin]);

  return { data, loading, ...liveState };
}

function useAllAssets() {
  const [data, setData] = useState(() => buildMockAllAssets());
  const [loading, setLoading] = useState(true);
  const [liveState, setLiveState] = useState({ status: "fallback", meta: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`${RATES_API_BASE}/api/liquidations/assets`);
        if (!res.ok) throw new Error("API error");
        const payload = await res.json();
        if (!cancelled) {
          const state = liveStateFromPayload(payload);
          setData(state.data);
          setLiveState({ status: state.status, meta: state.meta, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setData(buildMockAllAssets());
          const fallback = fallbackLiveState(null, err);
          setLiveState({ status: fallback.status, meta: null, error: fallback.error });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, ...liveState };
}

/* ── Countdown hook ───────────────────────────────────────── */
function useCountdown(intervalMs = 60000) {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return Math.floor(intervalMs / 1000);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [intervalMs]);

  return secondsLeft;
}

/* ── Scanline overlay (header only) ───────────────────────── */
function HeaderScanlines() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {/* Static scanlines */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,255,65,0.04) 2px, rgba(0,255,65,0.04) 4px)",
        }}
      />
      {/* Moving highlight bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: 80,
          background:
            "linear-gradient(180deg, transparent, rgba(0,255,65,0.06), transparent)",
          animation: "liq-scanline-move 6s linear infinite",
        }}
      />
    </div>
  );
}

/* ── Blinking cursor ──────────────────────────────────────── */
function BlinkingCursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.6em",
        height: "1.1em",
        background: THEME.accent,
        marginLeft: 4,
        verticalAlign: "text-bottom",
        animation: "liq-blink 1s step-end infinite",
      }}
    />
  );
}

/* ── Asset selector pills ─────────────────────────────────── */
function AssetSelector({ selected, onSelect }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="liq-asset-scroll"
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "16px 0",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {ASSETS.map((asset) => {
        const isSelected = asset === selected;
        return (
          <button
            key={asset}
            onClick={() => onSelect(asset)}
            style={{
              flexShrink: 0,
              padding: "8px 20px",
              border: `1px solid ${isSelected ? THEME.accent : "#333"}`,
              borderRadius: 20,
              background: isSelected ? `${THEME.accent}15` : "transparent",
              color: isSelected ? THEME.accent : "#666",
              fontFamily: FONTS.body,
              fontSize: "0.8rem",
              fontWeight: isSelected ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: "0.05em",
              outline: "none",
            }}
          >
            {asset}
          </button>
        );
      })}
    </div>
  );
}

/* ── Liquidation band visualization ───────────────────────── */
function LiquidationGauge({ levels, markPrice }) {
  if (!levels || levels.length === 0 || !markPrice) return null;

  /* Sort levels by leverage descending so 50x is closest to center */
  const sorted = [...levels].sort((a, b) => b.leverage - a.leverage);

  /* Calculate max range for scaling */
  const maxDistancePct = Math.max(
    ...sorted.map((l) => Math.abs(l.long_distance_pct)),
    ...sorted.map((l) => Math.abs(l.short_distance_pct))
  );
  const scale = maxDistancePct > 0 ? 100 / (maxDistancePct * 1.15) : 1;

  return (
    <div
      style={{
        border: `1px solid ${THEME.accent}22`,
        background: THEME.bgCard,
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.7rem",
          color: THEME.muted,
          marginBottom: 16,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {"// LIQUIDATION_LEVELS"}
      </div>

      {/* Gauge container */}
      <div style={{ position: "relative", height: sorted.length * 56 + 80 }}>
        {/* Center line = mark price */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: THEME.accent,
            transform: "translateX(-1px)",
            zIndex: 3,
          }}
        />

        {/* Mark price label */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            background: THEME.accent,
            color: THEME.bg,
            padding: "4px 12px",
            fontFamily: FONTS.body,
            fontSize: "0.75rem",
            fontWeight: 700,
            zIndex: 4,
            whiteSpace: "nowrap",
          }}
        >
          MARK: ${formatPrice(markPrice)}
        </div>

        {/* "SHORTS LIQUIDATED" label on right */}
        <div
          style={{
            position: "absolute",
            right: 8,
            top: 4,
            fontFamily: FONTS.body,
            fontSize: "0.6rem",
            color: THEME.red + "88",
            letterSpacing: "0.06em",
          }}
        >
          SHORTS LIQ &rarr;
        </div>

        {/* "LONGS LIQUIDATED" label on left */}
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 4,
            fontFamily: FONTS.body,
            fontSize: "0.6rem",
            color: THEME.accent + "88",
            letterSpacing: "0.06em",
          }}
        >
          &larr; LONGS LIQ
        </div>

        {/* Bands */}
        {sorted.map((level, i) => {
          const color = LEVERAGE_COLORS[level.leverage] || THEME.muted;
          const topOffset = 40 + i * 56;

          /* Distances from center (50%) */
          const longOffset = Math.abs(level.long_distance_pct) * scale;
          const shortOffset = Math.abs(level.short_distance_pct) * scale;

          return (
            <div key={level.leverage} style={{ position: "absolute", top: topOffset, left: 0, right: 0, height: 48 }}>
              {/* Leverage label - center */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontFamily: FONTS.body,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color,
                  zIndex: 5,
                  background: THEME.bgCard,
                  padding: "2px 8px",
                  border: `1px solid ${color}44`,
                  whiteSpace: "nowrap",
                }}
              >
                {level.leverage}x
              </div>

              {/* Long liquidation band (left of center) */}
              <div
                style={{
                  position: "absolute",
                  right: "50%",
                  top: 16,
                  height: 16,
                  width: `${longOffset}%`,
                  background: `linear-gradient(90deg, ${color}22, ${color}66)`,
                  borderLeft: `2px solid ${color}`,
                  transition: "width 0.5s ease",
                }}
              />
              {/* Long price label */}
              <div
                style={{
                  position: "absolute",
                  right: `calc(50% + ${longOffset}% + 4px)`,
                  top: 14,
                  fontFamily: FONTS.body,
                  fontSize: "0.6rem",
                  color,
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                ${formatPrice(level.long_liq_price)}
                <span style={{ color: `${color}88`, marginLeft: 4 }}>
                  {(level.long_distance_pct ?? 0).toFixed(1)}%
                </span>
              </div>

              {/* Short liquidation band (right of center) */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 16,
                  height: 16,
                  width: `${shortOffset}%`,
                  background: `linear-gradient(270deg, ${color}22, ${color}66)`,
                  borderRight: `2px solid ${color}`,
                  transition: "width 0.5s ease",
                }}
              />
              {/* Short price label */}
              <div
                style={{
                  position: "absolute",
                  left: `calc(50% + ${shortOffset}% + 4px)`,
                  top: 14,
                  fontFamily: FONTS.body,
                  fontSize: "0.6rem",
                  color,
                  whiteSpace: "nowrap",
                }}
              >
                ${formatPrice(level.short_liq_price)}
                <span style={{ color: `${color}88`, marginLeft: 4 }}>
                  +{(level.short_distance_pct ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${THEME.accent}11`,
        }}
      >
        {LEVERAGE_LEVELS.map((lev) => (
          <div
            key={lev}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: FONTS.body,
              fontSize: "0.65rem",
              color: LEVERAGE_COLORS[lev],
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: LEVERAGE_COLORS[lev],
                opacity: 0.7,
              }}
            />
            {lev}x
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mobile-friendly liquidation gauge ────────────────────── */
function LiquidationGaugeMobile({ levels, markPrice }) {
  if (!levels || levels.length === 0 || !markPrice) return null;

  const sorted = [...levels].sort((a, b) => b.leverage - a.leverage);

  return (
    <div
      style={{
        border: `1px solid ${THEME.accent}22`,
        background: THEME.bgCard,
        padding: "16px 12px",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.7rem",
          color: THEME.muted,
          marginBottom: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {"// LIQUIDATION_LEVELS"}
      </div>

      {/* Mark price */}
      <div
        style={{
          textAlign: "center",
          padding: "8px",
          background: `${THEME.accent}15`,
          border: `1px solid ${THEME.accent}44`,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.7rem",
            color: THEME.muted,
          }}
        >
          MARK PRICE{" "}
        </span>
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.9rem",
            fontWeight: 700,
            color: THEME.accent,
          }}
        >
          ${formatPrice(markPrice)}
        </span>
      </div>

      {/* Vertical stack of levels */}
      {sorted.map((level) => {
        const color = LEVERAGE_COLORS[level.leverage] || THEME.muted;
        return (
          <div
            key={level.leverage}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: `1px solid ${THEME.accent}0a`,
            }}
          >
            {/* Long side */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.65rem", color: THEME.accent + "88" }}>
                LONG LIQ
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.72rem", color: THEME.accent }}>
                ${formatPrice(level.long_liq_price)}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.6rem", color: `${color}88` }}>
                {(level.long_distance_pct ?? 0).toFixed(1)}%
              </div>
            </div>

            {/* Center leverage label */}
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: "0.75rem",
                fontWeight: 700,
                color,
                background: `${color}15`,
                border: `1px solid ${color}33`,
                padding: "4px 10px",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {level.leverage}x
            </div>

            {/* Short side */}
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.65rem", color: THEME.red + "88" }}>
                SHORT LIQ
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.72rem", color: THEME.red }}>
                ${formatPrice(level.short_liq_price)}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: "0.6rem", color: `${color}88` }}>
                +{(level.short_distance_pct ?? 0).toFixed(1)}%
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${THEME.accent}11`,
        }}
      >
        {LEVERAGE_LEVELS.map((lev) => (
          <div
            key={lev}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: FONTS.body,
              fontSize: "0.6rem",
              color: LEVERAGE_COLORS[lev],
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                background: LEVERAGE_COLORS[lev],
                opacity: 0.7,
              }}
            />
            {lev}x
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Responsive gauge wrapper ─────────────────────────────── */
function ResponsiveGauge({ levels, markPrice }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return <LiquidationGaugeMobile levels={levels} markPrice={markPrice} />;
  }
  return <LiquidationGauge levels={levels} markPrice={markPrice} />;
}

/* ── Data table for selected asset ────────────────────────── */
function LeverageTable({ levels }) {
  if (!levels || levels.length === 0) return null;

  const sorted = [...levels].sort((a, b) => b.leverage - a.leverage);

  const thStyle = {
    fontFamily: FONTS.body,
    fontSize: "0.65rem",
    fontWeight: 600,
    color: THEME.muted,
    padding: "10px 12px",
    textAlign: "left",
    borderBottom: `1px solid ${THEME.accent}22`,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: THEME.bgCard,
    zIndex: 2,
  };

  const tdStyle = {
    fontFamily: FONTS.body,
    fontSize: "0.75rem",
    padding: "10px 12px",
    borderBottom: `1px solid ${THEME.accent}0a`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        border: `1px solid ${THEME.accent}22`,
        background: THEME.bgCard,
        padding: "16px",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.7rem",
          color: THEME.muted,
          marginBottom: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {"// LEVERAGE_DETAIL_TABLE"}
      </div>

      <div className="liq-table-wrap" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 540,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Leverage</th>
              <th style={thStyle}>Long Liq Price</th>
              <th style={thStyle}>Distance</th>
              <th style={thStyle}>Short Liq Price</th>
              <th style={thStyle}>Distance</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((level) => {
              const color = LEVERAGE_COLORS[level.leverage] || THEME.muted;
              return (
                <tr key={level.leverage}>
                  <td style={{ ...tdStyle, color, fontWeight: 700 }}>
                    {level.leverage}x
                  </td>
                  <td style={{ ...tdStyle, color: THEME.accent }}>
                    ${formatPrice(level.long_liq_price)}
                  </td>
                  <td style={{ ...tdStyle, color: THEME.accent + "aa" }}>
                    {(level.long_distance_pct ?? 0).toFixed(2)}%
                  </td>
                  <td style={{ ...tdStyle, color: THEME.red }}>
                    ${formatPrice(level.short_liq_price)}
                  </td>
                  <td style={{ ...tdStyle, color: THEME.red + "aa" }}>
                    +{(level.short_distance_pct ?? 0).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Asset overview table (all assets) ────────────────────── */
function AssetOverviewTable({ assets }) {
  const [sortKey, setSortKey] = useState("open_interest");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  const sorted = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return [...assets].sort((a, b) => {
      let aVal, bVal;
      if (sortKey === "nearest_10x") {
        const aLevel = a.levels?.find((l) => l.leverage === 10);
        const bLevel = b.levels?.find((l) => l.leverage === 10);
        aVal = aLevel
          ? Math.min(Math.abs(aLevel.long_distance_pct), Math.abs(aLevel.short_distance_pct))
          : 999;
        bVal = bLevel
          ? Math.min(Math.abs(bLevel.long_distance_pct), Math.abs(bLevel.short_distance_pct))
          : 999;
      } else {
        aVal = a[sortKey] ?? 0;
        bVal = b[sortKey] ?? 0;
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [assets, sortKey, sortDir]);

  const thStyle = {
    fontFamily: FONTS.body,
    fontSize: "0.65rem",
    fontWeight: 600,
    color: THEME.muted,
    padding: "10px 12px",
    textAlign: "left",
    borderBottom: `1px solid ${THEME.accent}22`,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    position: "sticky",
    top: 0,
    background: THEME.bgCard,
    zIndex: 2,
  };

  const tdBase = {
    fontFamily: FONTS.body,
    fontSize: "0.75rem",
    padding: "10px 12px",
    borderBottom: `1px solid ${THEME.accent}0a`,
    whiteSpace: "nowrap",
    color: THEME.text,
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " \u25BC" : " \u25B2";
  };

  return (
    <div
      style={{
        border: `1px solid ${THEME.accent}22`,
        background: THEME.bgCard,
        padding: "16px",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.7rem",
          color: THEME.muted,
          marginBottom: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {"// ALL_ASSETS_OVERVIEW"} [{sorted.length} tracked]
      </div>

      <div className="liq-table-wrap" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 700,
          }}
        >
          <thead>
            <tr>
              <th
                style={{ ...thStyle, position: "sticky", left: 0, background: THEME.bgCard, zIndex: 3 }}
                onClick={() => handleSort("coin")}
              >
                Asset{sortIndicator("coin")}
              </th>
              <th style={thStyle} onClick={() => handleSort("mark_price")}>
                Mark Price{sortIndicator("mark_price")}
              </th>
              <th style={thStyle} onClick={() => handleSort("open_interest")}>
                Open Interest{sortIndicator("open_interest")}
              </th>
              <th style={thStyle} onClick={() => handleSort("funding_rate")}>
                Funding (Ann.){sortIndicator("funding_rate")}
              </th>
              <th style={thStyle} onClick={() => handleSort("nearest_10x")}>
                10x Liq Dist.{sortIndicator("nearest_10x")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => {
              const level10x = asset.levels?.find((l) => l.leverage === 10);
              const nearestDist = level10x
                ? Math.min(
                    Math.abs(level10x.long_distance_pct),
                    Math.abs(level10x.short_distance_pct)
                  )
                : null;
              const isDanger = nearestDist !== null && nearestDist < 5;
              const fundingAnn = asset.funding_rate * 365 * 100;

              return (
                <tr
                  key={asset.coin}
                  style={{
                    animation: isDanger ? "liq-pulse-danger 2s ease-in-out infinite" : "none",
                    background: isDanger ? `${THEME.red}08` : "transparent",
                  }}
                >
                  <td
                    style={{
                      ...tdBase,
                      fontWeight: 700,
                      color: isDanger ? THEME.red : THEME.accent,
                      position: "sticky",
                      left: 0,
                      background: isDanger ? "#0A0A0A" : THEME.bgCard,
                      zIndex: 1,
                    }}
                  >
                    {asset.coin}
                    {isDanger && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: "0.6rem",
                          color: THEME.red,
                          fontWeight: 400,
                        }}
                      >
                        DANGER
                      </span>
                    )}
                  </td>
                  <td style={tdBase}>${formatPrice(asset.mark_price)}</td>
                  <td style={tdBase}>{formatOI(asset.open_interest)}</td>
                  <td
                    style={{
                      ...tdBase,
                      color: fundingAnn >= 0 ? THEME.accent : THEME.red,
                    }}
                  >
                    {formatFundingRate(asset.funding_rate)}
                  </td>
                  <td
                    style={{
                      ...tdBase,
                      color: isDanger ? THEME.red : nearestDist !== null && nearestDist < 10 ? THEME.yellow : THEME.text,
                      fontWeight: isDanger ? 700 : 400,
                    }}
                  >
                    {nearestDist !== null ? `${nearestDist.toFixed(2)}%` : "---"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Marketing callout card ───────────────────────────────── */
function MarketingCallout() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        border: `1px solid ${THEME.accent}44`,
        background: `${THEME.accent}08`,
        padding: "clamp(20px, 4vw, 36px)",
        animation: "liq-glow-pulse 4s ease-in-out infinite",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: "0.7rem",
          color: THEME.muted,
          marginBottom: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {"// ADVISORY"}
      </div>

      <h3
        style={{
          fontFamily: FONTS.heading,
          fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
          fontWeight: 700,
          color: THEME.accent,
          margin: 0,
          marginBottom: 16,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        TRANSPARENCY IS A VULNERABILITY
      </h3>

      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)",
          color: THEME.white,
          lineHeight: 1.7,
          marginBottom: 24,
          maxWidth: 640,
        }}
      >
        Every position on Hyperliquid is visible. Bots track your liquidation
        levels and trade against you. On Variational, your positions are private
        by default. No one sees your liquidation price.
      </p>

      <a
        href={REFERRAL_LINK}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-block",
          padding: "14px 32px",
          border: `2px solid ${THEME.accent}`,
          background: hovered ? THEME.accent : "transparent",
          color: hovered ? THEME.bg : THEME.accent,
          fontFamily: FONTS.body,
          fontSize: "0.85rem",
          fontWeight: 700,
          textDecoration: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          letterSpacing: "0.05em",
        }}
      >
        Trade Privately on Variational &rarr;
      </a>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <a
          href="/rates"
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.75rem",
            color: THEME.muted,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#22c55e"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = THEME.muted; }}
        >
          {">"} Funding Rate Arb
        </a>
        <a
          href="/compare"
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.75rem",
            color: THEME.muted,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#FFB800"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = THEME.muted; }}
        >
          {">"} DEX Compare Tool
        </a>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function LiquidationsTheme() {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const {
    data: assetData,
    loading: assetLoading,
    status: assetStatus,
    meta: assetMeta,
    error: assetError,
  } = useAssetLevels(selectedCoin);
  const {
    data: allAssetsData,
    loading: allLoading,
    status: allStatus,
    error: allError,
  } = useAllAssets();
  const countdown = useCountdown(60000);

  const dataStatus = [assetStatus, allStatus].includes("fallback")
    ? "fallback"
    : [assetStatus, allStatus].includes("stale")
      ? "stale"
      : [assetStatus, allStatus].includes("degraded")
        ? "degraded"
        : "live";

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* ── Shared section styling ───── */
  const section = (extra = {}) => ({
    maxWidth: 1000,
    margin: "0 auto",
    padding: "48px 20px",
    ...extra,
  });

  const sectionDivider = {
    width: "100%",
    height: 1,
    background: `linear-gradient(90deg, transparent, ${THEME.accent}33, transparent)`,
    margin: "0 auto",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: FONTS.body,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ═══════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "relative",
          borderBottom: `1px solid ${THEME.accent}22`,
          background: THEME.bg,
          overflow: "hidden",
        }}
      >
        <HeaderScanlines />

        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "48px 20px 32px",
            position: "relative",
            zIndex: 3,
          }}
        >
          <h1
            style={{
              fontFamily: FONTS.heading,
              fontSize: "clamp(1rem, 3.5vw, 1.6rem)",
              fontWeight: 700,
              color: THEME.accent,
              margin: 0,
              marginBottom: 8,
              letterSpacing: "0.04em",
              lineHeight: 1.3,
            }}
          >
            HYPERLIQUID LIQUIDATION LEVEL ESTIMATOR
            <BlinkingCursor />
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              fontFamily: FONTS.body,
              fontSize: "0.7rem",
              color: THEME.muted,
            }}
          >
            <span>
              {assetData?.updated_at
                ? formatTimestamp(assetData.updated_at)
                : "---"}
            </span>
            <span style={{ color: `${THEME.accent}44` }}>|</span>
            <span>
              Next refresh:{" "}
              <span style={{ color: THEME.accent, fontWeight: 600 }}>
                {countdown}s
              </span>
            </span>
            {assetLoading && (
              <>
                <span style={{ color: `${THEME.accent}44` }}>|</span>
                <span style={{ animation: "liq-blink 1s step-end infinite" }}>
                  FETCHING...
                </span>
              </>
            )}
          </div>
          {!assetLoading && !allLoading && (
            <LiveDataStatus
              status={dataStatus}
              meta={assetMeta}
              error={assetError || allError}
              style={{ marginTop: 14 }}
            />
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          ASSET SELECTOR
          ═══════════════════════════════════════════════════════ */}
      <section style={section({ paddingTop: 16, paddingBottom: 0 })}>
        <AssetSelector selected={selectedCoin} onSelect={setSelectedCoin} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIQUIDATION GAUGE VISUALIZATION
          ═══════════════════════════════════════════════════════ */}
      <section style={section({ paddingTop: 24, paddingBottom: 24 })}>
        <ResponsiveGauge
          levels={assetData?.levels || []}
          markPrice={assetData?.mark_price}
        />
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          LEVERAGE DETAIL TABLE
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <LeverageTable
          levels={assetData?.levels || []}
          markPrice={assetData?.mark_price}
        />
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          ALL ASSETS OVERVIEW
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <AssetOverviewTable assets={allAssetsData?.assets || []} />
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          MARKETING CALLOUT
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <MarketingCallout />
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          DISCLAIMER FOOTER
          ═══════════════════════════════════════════════════════ */}
      <section style={section({ paddingTop: 24, paddingBottom: 8 })}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.65rem",
            color: `${THEME.text}44`,
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          Marks from Hyperliquid's public API. These are theoretical liquidation
          level estimates based on a simplified maintenance-margin model, not
          observed liquidation events or account-specific risk. Updated every minute. Not financial
          advice. This page contains a referral link &mdash; the author may earn
          points from referred trading volume.
        </div>
      </section>

      <Footer theme={THEME} />
    </div>
  );
}
