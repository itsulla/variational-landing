import React, { useEffect, useState, useMemo, useCallback } from "react";
import Footer from "../../components/Footer.jsx";
import LiveDataStatus from "../../components/LiveDataStatus.jsx";
import { fallbackLiveState, liveStateFromPayload } from "../../lib/liveData.js";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  RATES_API_BASE,
  getWeeksRemaining,
} from "../../config.js";

/* ─── Theme tokens ───────────────────────────────────────────────── */
const THEME = {
  bg: "#0c0b09",
  text: "#e8e0d0",
  accent: "#fbbf24",
  positive: "#22c55e",
  negative: "#ef4444",
  muted: "#a89968",
  cardBg: "#141310",
  borderColor: "#a8996833",
};

const FONTS = {
  heading: "'IBM Plex Mono', monospace",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

/* ─── Mock data ───────────────────────────────────────────────────
   Fallback ONLY for when the API is unreachable. Magnitudes mirror
   real post-audit output (Variational majors sit at the ~10.95%/yr
   neutral baseline; realistic spreads are ~5-25%/yr, not 50-100%).
   Keep these aligned with /api/rates/opportunities semantics. */
const MOCK_OPPORTUNITIES = [
  { ticker: "LINK", var_rate_annual: -13.38, cex_exchange: "hyperliquid", cex_rate_annual: 10.95, spread_annual: 24.33, direction: "long_var_short_cex", daily_pnl_10k: 6.66, daily_pnl_50k: 33.32, daily_pnl_100k: 66.65, var_mark_price: 14.80, volume_24h: 54000000 },
  { ticker: "OP", var_rate_annual: -21.19, cex_exchange: "okx", cex_rate_annual: 2.41, spread_annual: 23.60, direction: "long_var_short_cex", daily_pnl_10k: 6.47, daily_pnl_50k: 32.33, daily_pnl_100k: 64.66, var_mark_price: 0.92, volume_24h: 43000000 },
  { ticker: "ETH", var_rate_annual: 10.95, cex_exchange: "edgex", cex_rate_annual: -11.29, spread_annual: 22.24, direction: "short_var_long_cex", daily_pnl_10k: 6.09, daily_pnl_50k: 30.47, daily_pnl_100k: 60.93, var_mark_price: 2180.50, volume_24h: 412000000 },
  { ticker: "SUI", var_rate_annual: -5.24, cex_exchange: "hyperliquid", cex_rate_annual: 10.95, spread_annual: 16.19, direction: "long_var_short_cex", daily_pnl_10k: 4.44, daily_pnl_50k: 22.18, daily_pnl_100k: 44.36, var_mark_price: 2.85, volume_24h: 25000000 },
  { ticker: "SOL", var_rate_annual: 10.95, cex_exchange: "gate.io", cex_rate_annual: -4.38, spread_annual: 15.33, direction: "short_var_long_cex", daily_pnl_10k: 4.20, daily_pnl_50k: 21.00, daily_pnl_100k: 42.00, var_mark_price: 138.20, volume_24h: 289000000 },
  { ticker: "BTC", var_rate_annual: 10.95, cex_exchange: "okx", cex_rate_annual: -1.70, spread_annual: 12.65, direction: "short_var_long_cex", daily_pnl_10k: 3.47, daily_pnl_50k: 17.33, daily_pnl_100k: 34.66, var_mark_price: 86250.00, volume_24h: 724957891 },
  { ticker: "DOGE", var_rate_annual: 1.52, cex_exchange: "hyperliquid", cex_rate_annual: 10.95, spread_annual: 9.43, direction: "long_var_short_cex", daily_pnl_10k: 2.58, daily_pnl_50k: 12.92, daily_pnl_100k: 25.84, var_mark_price: 0.1720, volume_24h: 156000000 },
  { ticker: "AVAX", var_rate_annual: -15.11, cex_exchange: "gate.io", cex_rate_annual: -20.91, spread_annual: 5.80, direction: "short_var_long_cex", daily_pnl_10k: 1.59, daily_pnl_50k: 7.95, daily_pnl_100k: 15.89, var_mark_price: 22.40, volume_24h: 98000000 },
  { ticker: "WIF", var_rate_annual: 10.95, cex_exchange: "bitget", cex_rate_annual: 5.48, spread_annual: 5.47, direction: "short_var_long_cex", daily_pnl_10k: 1.50, daily_pnl_50k: 7.49, daily_pnl_100k: 14.99, var_mark_price: 0.68, volume_24h: 38000000 },
];

const MOCK_SUMMARY = {
  total_markets_tracked: 476,
  total_opportunities: 9,
  best_spread_ticker: "LINK",
  best_spread_annual: 24.33,
  best_daily_10k: 6.66,
  avg_spread_annual: 15.1,
  updated_at: new Date().toISOString(),
};

/* ─── Mock history generator ─────────────────────────────────────── */
function generateMockHistory(baseRate, volatility = 2) {
  const points = [];
  let rate = baseRate;
  for (let i = 0; i < 168; i++) {
    rate += (Math.random() - 0.5) * volatility;
    rate = Math.max(rate * 0.3, Math.min(rate, baseRate * 3));
    const t = new Date(Date.now() - (168 - i) * 3600000).toISOString();
    points.push({ t, rate: Math.round(rate * 100) / 100 });
  }
  return points;
}

const MOCK_HISTORY_CACHE = {};
function getMockHistory(ticker) {
  if (MOCK_HISTORY_CACHE[ticker]) return MOCK_HISTORY_CACHE[ticker];
  const opp = MOCK_OPPORTUNITIES.find((o) => o.ticker === ticker);
  const varBase = opp ? opp.var_rate_annual : 20;
  const cexBase = opp ? opp.cex_rate_annual : 2;
  MOCK_HISTORY_CACHE[ticker] = {
    variational: generateMockHistory(varBase, 4),
    binance: generateMockHistory(cexBase, 0.8),
    bybit: generateMockHistory(cexBase + 0.5, 0.9),
    hyperliquid: generateMockHistory(cexBase - 0.3, 1.0),
  };
  return MOCK_HISTORY_CACHE[ticker];
}

/* ─── Inject Google Fonts + keyframes ────────────────────────────── */
function injectGlobalStyles() {
  const id = "rates-theme-globals";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

    @keyframes rates-ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes rates-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes rates-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    * { box-sizing: border-box; }
  `;
  document.head.appendChild(style);
}

/* ─── Data hooks ─────────────────────────────────────────────────── */
function useRatesData() {
  const [data, setData] = useState({ opportunities: MOCK_OPPORTUNITIES, summary: MOCK_SUMMARY });
  const [loading, setLoading] = useState(true);
  const [liveState, setLiveState] = useState({ status: "fallback", meta: null, error: null });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [oppRes, sumRes] = await Promise.all([
          fetch(`${RATES_API_BASE}/api/rates/opportunities?limit=50`),
          fetch(`${RATES_API_BASE}/api/rates/summary`),
        ]);
        if (!oppRes.ok || !sumRes.ok) throw new Error("API error");
        const oppData = await oppRes.json();
        const summary = await sumRes.json();
        if (!cancelled) {
          const opportunitiesState = liveStateFromPayload(oppData);
          const summaryState = liveStateFromPayload(summary);
          const status = opportunitiesState.status === "stale" || summaryState.status === "stale"
            ? "stale"
            : opportunitiesState.status === "degraded" || summaryState.status === "degraded"
              ? "degraded"
              : "live";
          setData({
            opportunities: opportunitiesState.data.opportunities || opportunitiesState.data,
            summary: summaryState.data,
          });
          setLiveState({ status, meta: opportunitiesState.meta, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setData({ opportunities: MOCK_OPPORTUNITIES, summary: MOCK_SUMMARY });
          const fallback = fallbackLiveState(null, err);
          setLiveState({
            status: fallback.status,
            meta: fallback.meta,
            error: fallback.error,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { ...liveState, data, loading };
}

function useHistoricalRates(ticker) {
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(
          `${RATES_API_BASE}/api/rates/history?ticker=${ticker}&hours=168`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled) setSeries(data.series || data);
      } catch {
        if (!cancelled) setSeries(getMockHistory(ticker));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    return () => { cancelled = true; };
  }, [ticker]);

  return { series, loading };
}

/* ─── Shared inline style helpers ────────────────────────────────── */
const sectionLabel = {
  fontFamily: FONTS.mono,
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: THEME.muted,
  marginBottom: 8,
};

const sectionTitle = {
  fontFamily: FONTS.mono,
  fontSize: "1.15rem",
  fontWeight: 700,
  color: THEME.accent,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 24,
};

const dataCell = {
  border: `1px solid ${THEME.borderColor}`,
  padding: "16px 20px",
  background: THEME.bg,
};

const ctaButton = {
  display: "inline-block",
  padding: "14px 36px",
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

/* ─── Utilities ──────────────────────────────────────────────────── */
function formatDateBloomberg(d) {
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtRate(val) {
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
}

function fmtDollar(val) {
  return `$${val.toFixed(2)}`;
}

function fmtVolume(val) {
  if (!val || val === 0) return "\u2014";
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function exchangeAbbr(name) {
  const map = {
    binance: "BIN", bybit: "BYB", hyperliquid: "HL",
    okx: "OKX", gateio: "GATE", "gate.io": "GATE", bitget: "BGT",
    bitmex: "MEX", htx: "HTX", aster: "ASTR", woox: "WOO",
    dydx: "DYDX", kraken: "KRKN", phemex: "PHMX",
    tradexyz: "XYZ", hyena: "HYNA", lighter: "LGTR", edgex: "EDGX",
  };
  return map[(name || "").toLowerCase()] || (name || "").toUpperCase().slice(0, 4);
}

function exchangeFullName(name) {
  const map = {
    binance: "Binance", bybit: "Bybit", hyperliquid: "Hyperliquid",
    okx: "OKX", gateio: "Gate.io", "gate.io": "Gate.io", bitget: "Bitget",
    bitmex: "BitMEX", htx: "HTX", aster: "Aster", woox: "WOO X",
    dydx: "dYdX", kraken: "Kraken Futures", phemex: "Phemex",
    edgex: "edgeX",
  };
  return map[(name || "").toLowerCase()] || (name || "").charAt(0).toUpperCase() + (name || "").slice(1);
}

/* Recompute a row's best CEX/DEX leg among only the *visible* exchanges.
 * Each opportunity carries an `exchanges` map { name: annualRate }; when the
 * user hides venues we re-pick the widest-spread visible one and rederive the
 * spread, direction, and per-notional PnL. Returns null if no visible venue
 * has data for that ticker (row is dropped). Falls back to the single best
 * venue if the API payload predates the `exchanges` field. */
function recomputeForVisible(opp, hidden) {
  const exchanges =
    opp.exchanges && Object.keys(opp.exchanges).length
      ? opp.exchanges
      : { [opp.cex_exchange]: opp.cex_rate_annual };
  const varRate = opp.var_rate_annual;

  let bestEx = null;
  let bestRate = 0;
  let bestSpread = -1;
  for (const [name, rate] of Object.entries(exchanges)) {
    if (hidden.has(name)) continue;
    const spread = Math.abs(varRate - rate);
    if (spread > bestSpread) {
      bestSpread = spread;
      bestEx = name;
      bestRate = rate;
    }
  }
  if (!bestEx) return null;

  const daily10k = (bestSpread / 365 / 100) * 10000;
  return {
    ...opp,
    cex_exchange: bestEx,
    cex_rate_annual: Math.round(bestRate * 100) / 100,
    spread_annual: Math.round(bestSpread * 100) / 100,
    direction: varRate > bestRate ? "short_var_long_cex" : "long_var_short_cex",
    daily_pnl_10k: Math.round(daily10k * 100) / 100,
    daily_pnl_50k: Math.round(daily10k * 5 * 100) / 100,
    daily_pnl_100k: Math.round(daily10k * 10 * 100) / 100,
  };
}

const EXCHANGE_FILTER_KEY = "var_rates_hidden_exchanges";

/* ─── CEX Fee Tables ──────────────────────────────────────────────
   Maker/taker fees as basis-point-equivalent percentages (0.02 = 0.02%).
   fundingInterval is hours per funding cycle — drives the per-period
   payout math elsewhere in this file. */
const CEX_FEES = {
  // Direct integrations (work from US VPS)
  okx:          { maker: 0.0200, taker: 0.0500, name: "OKX",            fundingInterval: 8 },
  gateio:       { maker: 0.0200, taker: 0.0500, name: "Gate.io",        fundingInterval: 8 },
  "gate.io":    { maker: 0.0200, taker: 0.0500, name: "Gate.io",        fundingInterval: 8 },
  bitget:       { maker: 0.0200, taker: 0.0600, name: "Bitget",         fundingInterval: 8 },
  /* HL: 0.015/0.045 base tier, hourly funding — keep consistent with /compare */
  hyperliquid:  { maker: 0.0150, taker: 0.0450, name: "Hyperliquid",    fundingInterval: 1 },
  // Coinalyze-proxied
  binance:      { maker: 0.0200, taker: 0.0500, name: "Binance",        fundingInterval: 8 },
  bybit:        { maker: 0.0200, taker: 0.0550, name: "Bybit",          fundingInterval: 8 },
  bitmex:       { maker: 0.0100, taker: 0.0500, name: "BitMEX",         fundingInterval: 8 },
  htx:          { maker: 0.0200, taker: 0.0500, name: "HTX",            fundingInterval: 8 },
  aster:        { maker: 0.0000, taker: 0.0350, name: "Aster",          fundingInterval: 8 },
  woox:         { maker: 0.0300, taker: 0.0300, name: "WOO X",          fundingInterval: 8 },
  dydx:         { maker: 0.0000, taker: 0.0500, name: "dYdX",           fundingInterval: 1 },
  kraken:       { maker: 0.0200, taker: 0.0500, name: "Kraken Futures", fundingInterval: 1 },
  phemex:       { maker: 0.0100, taker: 0.0600, name: "Phemex",         fundingInterval: 8 },
};

const VAR_FEES = { maker: 0, taker: 0, name: "Variational", fundingInterval: 1 };

/* ─── Trade Plan Calculator ──────────────────────────────────────── */
function calcTradePlan(opp, notional) {
  const cexFees = CEX_FEES[(opp.cex_exchange || "").toLowerCase()] || { maker: 0.05, taker: 0.05, name: opp.cex_exchange, fundingInterval: 8 };
  const halfNotional = notional / 2;

  // Position sizing: split notional across both legs
  const varPositionUSD = halfNotional;
  const cexPositionUSD = halfNotional;
  const varPositionSize = opp.var_mark_price > 0 ? varPositionUSD / opp.var_mark_price : 0;
  const cexPositionSize = opp.var_mark_price > 0 ? cexPositionUSD / opp.var_mark_price : 0;

  // Entry costs (taker fees for both legs)
  const varEntryCost = varPositionUSD * (VAR_FEES.taker / 100); // 0 for Variational
  const cexEntryCost = cexPositionUSD * (cexFees.taker / 100);
  const totalEntryCost = varEntryCost + cexEntryCost;

  // Exit costs (same as entry)
  const totalExitCost = totalEntryCost;
  const totalRoundTripCost = totalEntryCost + totalExitCost;

  // Gas cost estimate (Arbitrum)
  const estimatedGasCost = 0.50; // ~$0.50 per tx on Arbitrum
  const totalGas = estimatedGasCost * 2; // open + close

  // Daily funding income from spread. The spread accrues on the hedged
  // position size — and we split the notional across the two legs above,
  // so income is earned on halfNotional, not the full wallet amount.
  // (Using full notional here would overstate income 2x and halve the
  // apparent break-even time.)
  const spreadAnnual = opp.spread_annual || 0;
  const dailyFundingIncome = (halfNotional * spreadAnnual / 100) / 365;

  // Net daily P&L (spread income minus any ongoing costs)
  const netDailyPnL = dailyFundingIncome;

  // Break-even: days to recover entry+exit+gas costs
  const totalCosts = totalRoundTripCost + totalGas;
  const breakEvenDays = netDailyPnL > 0 ? totalCosts / netDailyPnL : Infinity;

  // Projected P&L at various horizons
  const pnl7d  = (netDailyPnL * 7)  - totalCosts;
  const pnl30d = (netDailyPnL * 30) - totalCosts;
  const pnl90d = (netDailyPnL * 90) - totalCosts;

  // Direction labels
  const isShortVar = opp.direction === "short_var_long_cex";
  const varSide = isShortVar ? "SHORT" : "LONG";
  const cexSide = isShortVar ? "LONG" : "SHORT";

  return {
    varPositionUSD, cexPositionUSD, varPositionSize, cexPositionSize,
    varEntryCost, cexEntryCost, totalEntryCost, totalExitCost, totalRoundTripCost,
    totalGas, estimatedGasCost,
    dailyFundingIncome, netDailyPnL,
    breakEvenDays, totalCosts,
    pnl7d, pnl30d, pnl90d,
    varSide, cexSide,
    cexFees, varFees: VAR_FEES,
  };
}

function formatDirection(direction, cex) {
  if (!direction) return "-";
  const abbr = exchangeAbbr(cex);
  if (direction === "short_var_long_cex") return `Short VAR / Long ${abbr}`;
  if (direction === "long_var_short_cex") return `Long VAR / Short ${abbr}`;
  return direction;
}

/* ═════════════════════════════════════════════════════════════════════
   1. TOP BAR (sticky)
   ═════════════════════════════════════════════════════════════════════ */
function TopBar() {
  const bar = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 44,
    background: "#0f0e0c",
    borderBottom: `1px solid ${THEME.borderColor}`,
    fontFamily: FONTS.mono,
    fontSize: "0.78rem",
    fontWeight: 600,
  };

  const center = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: THEME.text,
    letterSpacing: "0.06em",
  };

  const dot = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: THEME.positive,
    animation: "rates-pulse 1.8s ease-in-out infinite",
  };

  return (
    <div style={bar}>
      <span style={{ color: THEME.accent, fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem" }}>
        VARIATIONAL
      </span>
      <div style={center}>
        <span style={{ color: THEME.muted, letterSpacing: "0.08em" }}>FUNDING RATES</span>
        <span style={dot} />
        <span style={{ color: THEME.positive, fontSize: "0.72rem", fontWeight: 700 }}>LIVE</span>
      </div>
      <span style={{ color: THEME.muted, letterSpacing: "0.06em" }}>
        {formatDateBloomberg(new Date())}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   2. TICKER BANNER (scrolling marquee)
   ═════════════════════════════════════════════════════════════════════ */
function TickerBanner({ opportunities }) {
  const top5 = (opportunities || []).slice(0, 5);
  const content = top5
    .map((o) => `${o.ticker} +${o.spread_annual.toFixed(1)}% APR`)
    .join("  \u2022  ") + "  \u2022  ";

  const track = {
    overflow: "hidden",
    background: "#100f0c",
    borderBottom: `1px solid ${THEME.borderColor}`,
    height: 28,
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  };

  const inner = {
    display: "inline-block",
    animation: "rates-ticker-scroll 28s linear infinite",
    fontFamily: FONTS.mono,
    fontSize: "0.72rem",
    fontWeight: 500,
    color: THEME.accent,
    letterSpacing: "0.1em",
  };

  return (
    <div style={track}>
      <div style={inner}>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   3. SUMMARY STATS
   ═════════════════════════════════════════════════════════════════════ */
function SummaryStats({ summary }) {
  const cells = [
    { label: "MARKETS TRACKED", value: String(summary.total_markets_tracked) },
    { label: "AVG ANNUAL SPREAD", value: `${summary.avg_spread_annual.toFixed(1)}%` },
    { label: "BEST SPREAD", value: `${summary.best_spread_ticker} ${summary.best_spread_annual.toFixed(1)}%` },
    { label: "BEST DAILY $10K", value: fmtDollar(summary.best_daily_10k) },
  ];

  return (
    <section style={{ padding: "0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 0,
            border: `1px solid ${THEME.borderColor}`,
          }}
        >
          {cells.map((c, i) => (
            <div
              key={c.label}
              style={{
                ...dataCell,
                borderLeft: i === 0 ? "none" : `1px solid ${THEME.borderColor}`,
                borderTop: "none",
                borderBottom: "none",
                borderRight: "none",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  color: THEME.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: THEME.accent,
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   4. HERO SECTION
   ═════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{ padding: "60px 0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={{ ...sectionLabel, marginBottom: 12 }}>
          FUNDING RATE ARBITRAGE
        </div>
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: THEME.text,
            lineHeight: 1.15,
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          Earn while you hedge.
        </h1>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "1rem",
            lineHeight: 1.7,
            color: `${THEME.text}bb`,
            maxWidth: 640,
            margin: "0 0 32px",
          }}
        >
          Capture funding rate spreads between Variational and CEX/DEX exchanges.
          Zero trading fees on Variational means more alpha in your pocket.
        </p>
        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaButton}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f59e0b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = THEME.accent; }}
        >
          START TRADING &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   5a. MINI HISTORY CHART (for expanded panel)
   ═════════════════════════════════════════════════════════════════════ */
function MiniHistoryChart({ ticker }) {
  const { series, loading } = useHistoricalRates(ticker);
  const W = 360, H = 120;
  const PAD = { top: 12, right: 8, bottom: 24, left: 40 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const exColors = { variational: THEME.accent, binance: "#e8e0d0", bybit: "#60a5fa", hyperliquid: "#a855f7" };

  const chartData = useMemo(() => {
    if (!series) return null;
    const allRates = [];
    for (const key of Object.keys(series)) {
      for (const pt of series[key]) allRates.push(pt.rate);
    }
    if (allRates.length === 0) return null;
    const minR = Math.min(...allRates), maxR = Math.max(...allRates);
    const range = maxR - minR || 1;
    const padded = { min: minR - range * 0.08, max: maxR + range * 0.08 };
    const totalRange = padded.max - padded.min || 1;
    function toPath(points) {
      return points.map((pt, i) => {
        const x = PAD.left + (i / (points.length - 1)) * plotW;
        const y = PAD.top + plotH - ((pt.rate - padded.min) / totalRange) * plotH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    }
    const paths = {};
    for (const [key, points] of Object.entries(series)) paths[key] = toPath(points);
    const yTicks = [];
    const step = totalRange / 3;
    for (let i = 0; i <= 3; i++) {
      const val = padded.min + step * i;
      const y = PAD.top + plotH - (i / 3) * plotH;
      yTicks.push({ val, y });
    }
    return { paths, yTicks };
  }, [series, PAD.left, PAD.top, plotH, plotW]);

  if (loading || !chartData) {
    return (<div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.mono, fontSize: "0.65rem", color: THEME.muted }}>LOADING...</div>);
  }
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {chartData.yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={tick.y} x2={W - PAD.right} y2={tick.y} stroke={`${THEME.muted}18`} strokeWidth={1} />
            <text x={PAD.left - 4} y={tick.y + 3} textAnchor="end" fill={THEME.muted} fontFamily={FONTS.mono} fontSize={8}>{tick.val.toFixed(0)}%</text>
          </g>
        ))}
        {Object.entries(chartData.paths).map(([ex, path]) => (
          <path key={ex} d={path} fill="none" stroke={exColors[ex] || THEME.text}
            strokeWidth={ex === "variational" ? 2 : 1.2} strokeLinejoin="round" strokeLinecap="round"
            opacity={ex === "variational" ? 1 : 0.6} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
        {Object.entries(exColors).map(([name, color]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: FONTS.mono, fontSize: "0.58rem", color: THEME.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   5b. TRADE PLAN PANEL (expandable row detail)
   ═════════════════════════════════════════════════════════════════════ */
function TradePlanPanel({ opportunity, onClose }) {
  const [notional, setNotional] = useState(10000);
  const notionalOptions = [5000, 10000, 25000, 50000, 100000];
  const opp = opportunity;
  const plan = useMemo(() => calcTradePlan(opp, notional), [opp, notional]);
  const cexName = exchangeFullName(opp.cex_exchange);

  const labelStyle = { fontFamily: FONTS.mono, fontSize: "0.6rem", fontWeight: 500, color: THEME.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const valueStyle = { fontFamily: FONTS.mono, fontSize: "0.85rem", fontWeight: 700, color: THEME.text };
  const cardStyle = { padding: "14px 16px", background: "#0f0e0b", border: `1px solid ${THEME.borderColor}` };
  const notionalBtn = (n) => ({
    fontFamily: FONTS.mono, fontSize: "0.68rem", fontWeight: notional === n ? 700 : 500,
    color: notional === n ? "#000" : THEME.text,
    background: notional === n ? THEME.accent : "transparent",
    border: `1px solid ${notional === n ? THEME.accent : THEME.borderColor}`,
    padding: "5px 12px", cursor: "pointer", letterSpacing: "0.04em",
  });

  return (
    <div style={{ background: "#0c0b09", borderTop: `2px solid ${THEME.accent}`, padding: "24px 20px", animation: "rates-fade-in 0.25s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "1rem", fontWeight: 700, color: THEME.accent, letterSpacing: "0.06em" }}>
            {opp.ticker} TRADE PLAN
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: "0.65rem", fontWeight: 600, color: THEME.positive, background: `${THEME.positive}18`, padding: "3px 8px", letterSpacing: "0.06em" }}>
            {fmtRate(opp.spread_annual)} SPREAD
          </span>
        </div>
        <button onClick={onClose} style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", fontWeight: 600, color: THEME.muted, background: "transparent", border: `1px solid ${THEME.borderColor}`, padding: "5px 14px", cursor: "pointer", letterSpacing: "0.06em" }}>
          CLOSE
        </button>
      </div>

      {/* Notional selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>TOTAL NOTIONAL</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
          {notionalOptions.map((n) => (
            <button key={n} onClick={() => setNotional(n)} style={notionalBtn(n)}>${(n / 1000).toFixed(0)}K</button>
          ))}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

        {/* Col 1: Position Setup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...labelStyle, fontSize: "0.65rem", color: THEME.accent, marginBottom: 0 }}>POSITION SETUP</div>
          {/* Leg 1 */}
          <div style={cardStyle}>
            <div style={labelStyle}>LEG 1: VARIATIONAL</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ ...valueStyle, color: plan.varSide === "SHORT" ? THEME.negative : THEME.positive }}>{plan.varSide}</span>
              <span style={{ ...valueStyle, fontSize: "0.78rem" }}>${plan.varPositionUSD.toLocaleString()}</span>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: `${THEME.text}88` }}>
              {plan.varPositionSize.toFixed(opp.var_mark_price < 1 ? 0 : opp.var_mark_price < 100 ? 2 : 4)} {opp.ticker} @ ${opp.var_mark_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: THEME.positive, marginTop: 6 }}>Trading fee: 0% (FREE)</div>
          </div>
          {/* Leg 2 */}
          <div style={cardStyle}>
            <div style={labelStyle}>LEG 2: {cexName.toUpperCase()}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ ...valueStyle, color: plan.cexSide === "SHORT" ? THEME.negative : THEME.positive }}>{plan.cexSide}</span>
              <span style={{ ...valueStyle, fontSize: "0.78rem" }}>${plan.cexPositionUSD.toLocaleString()}</span>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: `${THEME.text}88` }}>
              {plan.cexPositionSize.toFixed(opp.var_mark_price < 1 ? 0 : opp.var_mark_price < 100 ? 2 : 4)} {opp.ticker} @ ${opp.var_mark_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: THEME.muted, marginTop: 6 }}>Trading fee: {plan.cexFees.taker.toFixed(3)}% (taker)</div>
          </div>
          {/* Liquidity */}
          <div style={cardStyle}>
            <div style={labelStyle}>LIQUIDITY (24H VOLUME)</div>
            <div style={{ ...valueStyle, color: THEME.accent }}>{fmtVolume(opp.volume_24h)}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.6rem", color: `${THEME.text}66`, marginTop: 4 }}>Variational 24h volume as liquidity proxy</div>
          </div>
        </div>

        {/* Col 2: Costs & Returns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...labelStyle, fontSize: "0.65rem", color: THEME.accent, marginBottom: 0 }}>COSTS & RETURNS</div>
          <div style={cardStyle}>
            <div style={labelStyle}>ENTRY COSTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: `${THEME.text}99` }}>Variational fee</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: THEME.positive }}>$0.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: `${THEME.text}99` }}>{cexName} fee</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: THEME.negative }}>-${plan.cexEntryCost.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: `${THEME.text}99` }}>Est. gas (Arbitrum)</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: THEME.negative }}>-${plan.estimatedGasCost.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${THEME.borderColor}`, paddingTop: 4, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.72rem", fontWeight: 600, color: THEME.text }}>Total entry</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.72rem", fontWeight: 700, color: THEME.negative }}>-${(plan.totalEntryCost + plan.estimatedGasCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>EXIT COSTS (ESTIMATED)</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: "0.72rem", fontWeight: 600, color: THEME.text }}>Round-trip total</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: "0.72rem", fontWeight: 700, color: THEME.negative }}>-${plan.totalCosts.toFixed(2)}</span>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>DAILY FUNDING INCOME</div>
            <div style={{ ...valueStyle, fontSize: "1.1rem", color: THEME.positive }}>+${plan.dailyFundingIncome.toFixed(2)}/day</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.6rem", color: `${THEME.text}66`, marginTop: 4 }}>From {fmtRate(opp.spread_annual)} annual spread on ${notional.toLocaleString()} notional</div>
          </div>
          <div style={{ ...cardStyle, borderColor: THEME.accent }}>
            <div style={labelStyle}>BREAK-EVEN TIME</div>
            <div style={{ ...valueStyle, fontSize: "1.1rem", color: THEME.accent }}>
              {plan.breakEvenDays === Infinity ? "N/A" : plan.breakEvenDays < 1 ? `${Math.ceil(plan.breakEvenDays * 24)}h` : `${plan.breakEvenDays.toFixed(1)} days`}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.6rem", color: `${THEME.text}66`, marginTop: 4 }}>To recover ${plan.totalCosts.toFixed(2)} in costs</div>
          </div>
        </div>

        {/* Col 3: P&L Projections + Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...labelStyle, fontSize: "0.65rem", color: THEME.accent, marginBottom: 0 }}>PROJECTED NET P&L</div>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "7 DAYS", val: plan.pnl7d }, { label: "30 DAYS", val: plan.pnl30d }, { label: "90 DAYS", val: plan.pnl90d }].map((p) => (
              <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.68rem", color: THEME.muted, letterSpacing: "0.06em" }}>{p.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.85rem", fontWeight: 700, color: p.val >= 0 ? THEME.positive : THEME.negative }}>
                  {p.val >= 0 ? "+" : ""}{p.val.toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{ fontFamily: FONTS.mono, fontSize: "0.58rem", color: `${THEME.text}55`, marginTop: 4 }}>Net of all trading fees and gas. Assumes current rates persist.</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>7D RATE TREND (SIMULATED)</div>
            <MiniHistoryChart ticker={opp.ticker} />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>FEE REFERENCE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: `${THEME.text}88` }}>Variational</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: THEME.positive }}>0% / 0%</span>
              </div>
              {Object.entries(CEX_FEES).map(([key, fees]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: `${THEME.text}88` }}>{fees.name}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: THEME.muted }}>{fees.maker.toFixed(3)}% / {fees.taker.toFixed(3)}%</span>
                </div>
              ))}
              <div style={{ fontFamily: FONTS.mono, fontSize: "0.55rem", color: `${THEME.text}44`, marginTop: 3 }}>Maker / Taker (default tier, excl. VIP discounts)</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <a href={REFERRAL_LINK} target="_blank" rel="noopener noreferrer"
          style={{ ...ctaButton, padding: "10px 28px", fontSize: "0.82rem" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f59e0b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = THEME.accent; }}>
          OPEN {opp.ticker} POSITION &rarr;
        </a>
        <span style={{ fontFamily: FONTS.mono, fontSize: "0.65rem", color: `${THEME.text}66` }}>
          {plan.varSide} {opp.ticker} on Variational, {plan.cexSide} on {cexName}
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   5. OPPORTUNITIES TABLE
   ═════════════════════════════════════════════════════════════════════ */
function OpportunitiesTable({ opportunities }) {
  const [sortKey, setSortKey] = useState("spread_annual");
  const [sortDir, setSortDir] = useState("desc");
  const [showAll, setShowAll] = useState(false);
  const [expandedTicker, setExpandedTicker] = useState(null);

  // All venues present across the current data (union of each row's map).
  const allExchanges = useMemo(() => {
    const set = new Set();
    for (const o of opportunities) {
      const ex = o.exchanges && Object.keys(o.exchanges).length
        ? Object.keys(o.exchanges)
        : [o.cex_exchange];
      ex.forEach((e) => e && set.add(e));
    }
    return Array.from(set).sort((a, b) =>
      exchangeFullName(a).localeCompare(exchangeFullName(b))
    );
  }, [opportunities]);

  // Hidden venues — persisted so a trader's preferred set sticks between visits.
  const [hidden, setHidden] = useState(() => {
    try {
      const raw = localStorage.getItem(EXCHANGE_FILTER_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const toggleExchange = useCallback((name) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      try { localStorage.setItem(EXCHANGE_FILTER_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setAllHidden = useCallback((hideAll) => {
    setHidden(() => {
      const next = hideAll ? new Set(allExchanges) : new Set();
      try { localStorage.setItem(EXCHANGE_FILTER_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, [allExchanges]);

  // Recompute each row's best leg among visible venues, then sort.
  const recomputed = useMemo(
    () => opportunities.map((o) => recomputeForVisible(o, hidden)).filter(Boolean),
    [opportunities, hidden]
  );

  const sorted = useMemo(() => {
    const arr = [...recomputed];
    arr.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return arr;
  }, [recomputed, sortKey, sortDir]);

  const visible = showAll ? sorted : sorted.slice(0, 15);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const handleRowClick = useCallback((ticker) => {
    setExpandedTicker((prev) => (prev === ticker ? null : ticker));
  }, []);

  const columns = [
    { key: "ticker", label: "ASSET", sortable: true },
    { key: "volume_24h", label: "VAR VOL", sortable: true },
    { key: "var_rate_annual", label: "VAR RATE", sortable: true },
    { key: "cex_exchange", label: "BEST RATE", sortable: false },
    { key: "cex_rate_annual", label: "CEX RATE", sortable: true },
    { key: "spread_annual", label: "SPREAD", sortable: true },
    { key: "direction", label: "DIRECTION", sortable: false },
    { key: "daily_pnl_10k", label: "$10K/DAY", sortable: true },
    { key: "daily_pnl_50k", label: "$50K/DAY", sortable: true },
    { key: "action", label: "", sortable: false },
  ];

  const thBase = {
    fontFamily: FONTS.mono,
    fontSize: "0.62rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: THEME.muted,
    textTransform: "uppercase",
    padding: "12px 14px",
    textAlign: "left",
    borderBottom: `1px solid ${THEME.borderColor}`,
    whiteSpace: "nowrap",
    userSelect: "none",
    background: "#0f0e0b",
    position: "sticky",
    top: 0,
  };

  const tdBase = {
    fontFamily: FONTS.mono,
    fontSize: "0.8rem",
    padding: "11px 14px",
    borderBottom: `1px solid ${THEME.borderColor}`,
    whiteSpace: "nowrap",
  };

  const sortArrow = (key) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " \u25BC" : " \u25B2";
  };

  return (
    <section style={{ padding: "60px 0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 02</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div style={sectionTitle}>TOP OPPORTUNITIES</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: "0.62rem", color: `${THEME.text}66`, letterSpacing: "0.06em", marginBottom: 24 }}>
            Click any row for full trade plan
          </div>
        </div>

        {/* ── Exchange filter — hide/show venues; best spread recomputes ── */}
        {allExchanges.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: THEME.muted,
                }}
              >
                Compare vs
              </span>
              <button
                onClick={() => setAllHidden(false)}
                style={{
                  fontFamily: FONTS.mono, fontSize: "0.6rem", letterSpacing: "0.06em",
                  color: THEME.accent, background: "transparent",
                  border: `1px solid ${THEME.accent}44`, borderRadius: 4,
                  padding: "3px 8px", cursor: "pointer", textTransform: "uppercase",
                }}
              >
                All
              </button>
              <button
                onClick={() => setAllHidden(true)}
                style={{
                  fontFamily: FONTS.mono, fontSize: "0.6rem", letterSpacing: "0.06em",
                  color: THEME.muted, background: "transparent",
                  border: `1px solid ${THEME.borderColor}`, borderRadius: 4,
                  padding: "3px 8px", cursor: "pointer", textTransform: "uppercase",
                }}
              >
                None
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allExchanges.map((name) => {
                const isHidden = hidden.has(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleExchange(name)}
                    title={isHidden ? `Show ${exchangeFullName(name)}` : `Hide ${exchangeFullName(name)}`}
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "0.66rem",
                      letterSpacing: "0.04em",
                      padding: "5px 11px",
                      borderRadius: 999,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      border: `1px solid ${isHidden ? THEME.borderColor : `${THEME.accent}66`}`,
                      background: isHidden ? "transparent" : `${THEME.accent}18`,
                      color: isHidden ? `${THEME.text}55` : THEME.accent,
                      textDecoration: isHidden ? "line-through" : "none",
                    }}
                  >
                    {exchangeFullName(name)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            overflowX: "auto",
            border: `1px solid ${THEME.borderColor}`,
            background: THEME.cardBg,
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 1000,
              borderCollapse: "collapse",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      ...thBase,
                      cursor: col.sortable ? "pointer" : "default",
                    }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.label}{col.sortable ? sortArrow(col.key) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      ...tdBase,
                      textAlign: "center",
                      color: THEME.muted,
                      padding: "28px 14px",
                      whiteSpace: "normal",
                    }}
                  >
                    No venues selected — turn a few back on above to see spreads.
                  </td>
                </tr>
              )}
              {visible.map((row, idx) => {
                const isExpanded = expandedTicker === row.ticker;
                const rowBg = isExpanded ? "#1a1710" : (idx % 2 === 0 ? THEME.cardBg : "#1a1814");
                return (
                  <React.Fragment key={row.ticker + idx}>
                    <tr
                      style={{ background: rowBg, cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => handleRowClick(row.ticker)}
                      onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "#1e1c16"; }}
                      onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = rowBg; }}
                    >
                      <td style={{ ...tdBase, fontWeight: 700, color: THEME.text }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 12, fontSize: "0.6rem", color: THEME.accent, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>&#9654;</span>
                          {row.ticker}
                        </span>
                      </td>
                      <td style={{ ...tdBase, color: THEME.muted, fontSize: "0.72rem" }}>
                        {fmtVolume(row.volume_24h)}
                      </td>
                      <td style={{ ...tdBase, color: row.var_rate_annual >= 0 ? THEME.positive : THEME.negative }}>
                        {fmtRate(row.var_rate_annual)}
                      </td>
                      <td style={{ ...tdBase, color: THEME.muted, fontSize: "0.72rem", letterSpacing: "0.06em" }}>
                        {exchangeAbbr(row.cex_exchange)}
                      </td>
                      <td style={{ ...tdBase, color: row.cex_rate_annual >= 0 ? THEME.positive : THEME.negative }}>
                        {fmtRate(row.cex_rate_annual)}
                      </td>
                      <td style={{ ...tdBase, color: THEME.accent, fontWeight: 700 }}>
                        {fmtRate(row.spread_annual)}
                      </td>
                      <td style={{ ...tdBase, color: `${THEME.text}99`, fontSize: "0.72rem" }}>
                        {formatDirection(row.direction, row.cex_exchange)}
                      </td>
                      <td style={{ ...tdBase, color: THEME.positive, fontWeight: 600 }}>
                        {fmtDollar(row.daily_pnl_10k)}
                      </td>
                      <td style={{ ...tdBase, color: THEME.positive, fontWeight: 600 }}>
                        {fmtDollar(row.daily_pnl_50k)}
                      </td>
                      <td style={{ ...tdBase }}>
                        <a
                          href={REFERRAL_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "#000",
                            background: THEME.accent,
                            padding: "5px 12px",
                            borderRadius: 2,
                            textDecoration: "none",
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          TRADE &rarr;
                        </a>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {expandedTicker && (() => {
          const expandedOpp = sorted.find(o => o.ticker === expandedTicker);
          if (!expandedOpp) return null;
          return (
            <div style={{ border: `1px solid ${THEME.borderColor}`, borderTop: "none" }}>
              <TradePlanPanel opportunity={expandedOpp} onClose={() => setExpandedTicker(null)} />
            </div>
          );
        })()}
        {sorted.length > 15 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                fontFamily: FONTS.mono,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: THEME.accent,
                background: "transparent",
                border: `1px solid ${THEME.borderColor}`,
                padding: "8px 24px",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {showAll ? "SHOW LESS" : `SHOW ALL (${sorted.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   6. EARNINGS CALCULATOR
   ═════════════════════════════════════════════════════════════════════ */
function EarningsCalculator({ opportunities }) {
  const notionalOptions = [10000, 25000, 50000, 100000, 250000];
  const topTickers = useMemo(
    () => (opportunities || []).slice(0, 6).map((o) => o.ticker),
    [opportunities]
  );

  const [notional, setNotional] = useState(10000);
  const [selectedTicker, setSelectedTicker] = useState(
    topTickers[0] || "BTC"
  );

  const selectedOpp = useMemo(
    () => (opportunities || []).find((o) => o.ticker === selectedTicker),
    [opportunities, selectedTicker]
  );

  const spread = selectedOpp ? selectedOpp.spread_annual : 0;
  const exchange = selectedOpp ? selectedOpp.cex_exchange : "";
  const daily = (notional * spread) / 100 / 365;
  const weekly = daily * 7;
  const monthly = daily * 30;
  const annual = daily * 365;

  const btnGroupStyle = (active) => ({
    fontFamily: FONTS.mono,
    fontSize: "0.78rem",
    fontWeight: active ? 700 : 500,
    color: active ? "#000" : THEME.text,
    background: active ? THEME.accent : "transparent",
    border: `1px solid ${active ? THEME.accent : THEME.borderColor}`,
    padding: "8px 18px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "all 0.15s",
  });

  const outputCard = {
    border: `1px solid ${THEME.borderColor}`,
    padding: "20px 18px",
    background: THEME.cardBg,
  };

  const earnings = [
    { label: "DAILY EARNINGS", value: daily },
    { label: "WEEKLY EARNINGS", value: weekly },
    { label: "MONTHLY EARNINGS", value: monthly },
    { label: "ANNUAL EARNINGS", value: annual },
  ];

  return (
    <section style={{ padding: "60px 0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 03</div>
        <div style={sectionTitle}>EARNINGS CALCULATOR</div>

        <div
          style={{
            border: `1px solid ${THEME.borderColor}`,
            padding: "32px 28px",
            background: "#0f0e0b",
          }}
        >
          {/* Notional size */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "0.68rem",
                fontWeight: 600,
                color: THEME.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              NOTIONAL SIZE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {notionalOptions.map((n) => (
                <button
                  key={n}
                  onClick={() => setNotional(n)}
                  style={btnGroupStyle(notional === n)}
                >
                  ${(n / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Pair selector */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "0.68rem",
                fontWeight: 600,
                color: THEME.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              SELECT PAIR
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {topTickers.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTicker(t)}
                  style={btnGroupStyle(selectedTicker === t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Output cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 0,
              border: `1px solid ${THEME.borderColor}`,
            }}
          >
            {earnings.map((e, i) => (
              <div
                key={e.label}
                style={{
                  ...outputCard,
                  borderLeft: i === 0 ? "none" : `1px solid ${THEME.borderColor}`,
                  borderTop: "none",
                  borderBottom: "none",
                  borderRight: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "0.62rem",
                    fontWeight: 500,
                    color: THEME.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {e.label}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: e.label === "DAILY EARNINGS" ? "1.6rem" : "1.25rem",
                    fontWeight: 700,
                    color: THEME.positive,
                  }}
                >
                  {fmtDollar(e.value)}
                </div>
              </div>
            ))}
          </div>

          {/* Context line */}
          <div
            style={{
              marginTop: 16,
              fontFamily: FONTS.body,
              fontSize: "0.8rem",
              color: `${THEME.text}88`,
              lineHeight: 1.5,
            }}
          >
            Based on current spread of {spread.toFixed(1)}% APR between Variational
            and {exchange ? exchange.charAt(0).toUpperCase() + exchange.slice(1) : "CEX"}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   7. HISTORICAL CHART (SVG)
   ═════════════════════════════════════════════════════════════════════ */
function HistoricalChart({ opportunities }) {
  const topTickers = useMemo(
    () => (opportunities || []).slice(0, 6).map((o) => o.ticker),
    [opportunities]
  );
  const [selectedTicker, setSelectedTicker] = useState(topTickers[0] || "BTC");
  const [chartNow] = useState(Date.now);
  const { series, loading } = useHistoricalRates(selectedTicker);

  const W = 800;
  const H = 320;
  const PAD = { top: 30, right: 20, bottom: 50, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const exchangeColors = {
    variational: THEME.accent,
    binance: "#e8e0d0",
    bybit: "#60a5fa",
    hyperliquid: "#a855f7",
  };

  const chartData = useMemo(() => {
    if (!series) return null;
    const allRates = [];
    for (const key of Object.keys(series)) {
      for (const pt of series[key]) {
        allRates.push(pt.rate);
      }
    }
    if (allRates.length === 0) return null;
    const minRate = Math.min(...allRates);
    const maxRate = Math.max(...allRates);
    const range = maxRate - minRate || 1;
    const padded = { min: minRate - range * 0.08, max: maxRate + range * 0.08 };
    const totalRange = padded.max - padded.min || 1;

    function toPath(points) {
      return points
        .map((pt, i) => {
          const x = PAD.left + (i / (points.length - 1)) * plotW;
          const y = PAD.top + plotH - ((pt.rate - padded.min) / totalRange) * plotH;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    }

    const paths = {};
    for (const [key, points] of Object.entries(series)) {
      paths[key] = toPath(points);
    }

    // Y axis ticks
    const yTicks = [];
    const step = totalRange / 5;
    for (let i = 0; i <= 5; i++) {
      const val = padded.min + step * i;
      const y = PAD.top + plotH - (i / 5) * plotH;
      yTicks.push({ val, y });
    }

    // X axis labels (7 days)
    const xLabels = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(chartNow - (6 - d) * 24 * 3600000);
      const label = `${date.getDate()} ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()]}`;
      const x = PAD.left + (d / 6) * plotW;
      xLabels.push({ label, x });
    }

    return { paths, yTicks, xLabels };
  }, [chartNow, series, PAD.left, PAD.top, plotH, plotW]);

  const btnStyle = (active) => ({
    fontFamily: FONTS.mono,
    fontSize: "0.75rem",
    fontWeight: active ? 700 : 500,
    color: active ? "#000" : THEME.text,
    background: active ? THEME.accent : "transparent",
    border: `1px solid ${active ? THEME.accent : THEME.borderColor}`,
    padding: "6px 16px",
    cursor: "pointer",
    letterSpacing: "0.04em",
  });

  return (
    <section style={{ padding: "60px 0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 04</div>
        <div style={sectionTitle}>
          RATE TREND &mdash; {selectedTicker}{" "}
          <span style={{ fontSize: "0.65em", color: THEME.muted, fontWeight: 500 }}>
            (SIMULATED — illustrative shape only, seeded from live spreads; not
            historical data)
          </span>
        </div>

        {/* Ticker selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0, marginBottom: 24 }}>
          {topTickers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              style={btnStyle(selectedTicker === t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          style={{
            border: `1px solid ${THEME.borderColor}`,
            background: THEME.cardBg,
            padding: "24px 20px 16px",
            overflowX: "auto",
          }}
        >
          {loading || !chartData ? (
            <div
              style={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONTS.mono,
                fontSize: "0.8rem",
                color: THEME.muted,
              }}
            >
              LOADING RATE DATA...
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", height: "auto", maxHeight: 400, display: "block" }}
            >
              {/* Grid lines */}
              {chartData.yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={PAD.left}
                    y1={tick.y}
                    x2={W - PAD.right}
                    y2={tick.y}
                    stroke={`${THEME.muted}22`}
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill={THEME.muted}
                    fontFamily={FONTS.mono}
                    fontSize={10}
                  >
                    {tick.val.toFixed(1)}%
                  </text>
                </g>
              ))}

              {/* X axis labels */}
              {chartData.xLabels.map((lbl, i) => (
                <text
                  key={i}
                  x={lbl.x}
                  y={H - PAD.bottom + 20}
                  textAnchor="middle"
                  fill={THEME.muted}
                  fontFamily={FONTS.mono}
                  fontSize={10}
                >
                  {lbl.label}
                </text>
              ))}

              {/* Data lines */}
              {Object.entries(chartData.paths).map(([exchange, path]) => (
                <path
                  key={exchange}
                  d={path}
                  fill="none"
                  stroke={exchangeColors[exchange] || THEME.text}
                  strokeWidth={exchange === "variational" ? 2.5 : 1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={exchange === "variational" ? 1 : 0.7}
                />
              ))}

              {/* Axis lines */}
              <line
                x1={PAD.left}
                y1={PAD.top}
                x2={PAD.left}
                y2={PAD.top + plotH}
                stroke={`${THEME.muted}44`}
                strokeWidth={1}
              />
              <line
                x1={PAD.left}
                y1={PAD.top + plotH}
                x2={W - PAD.right}
                y2={PAD.top + plotH}
                stroke={`${THEME.muted}44`}
                strokeWidth={1}
              />
            </svg>
          )}

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${THEME.borderColor}`,
            }}
          >
            {Object.entries(exchangeColors).map(([name, color]) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: FONTS.mono,
                  fontSize: "0.68rem",
                  color: THEME.muted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   8. HOW IT WORKS
   ═════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "IDENTIFY",
      desc: "Find assets where Variational's funding rate diverges from CEX rates. Larger spreads = more profit potential.",
    },
    {
      num: "02",
      title: "HEDGE",
      desc: "Go short where the funding rate is positive (collect payments), long on the other exchange. Delta-neutral = market-neutral.",
    },
    {
      num: "03",
      title: "COLLECT",
      desc: "Funding payments settle every 1-8 hours. Your hedged position earns the spread automatically, regardless of price direction.",
    },
  ];

  return (
    <section style={{ padding: "60px 0", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 05</div>
        <div style={sectionTitle}>HOW FUNDING RATE ARB WORKS</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 0,
            border: `1px solid ${THEME.borderColor}`,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: "28px 24px",
                borderRight:
                  i < steps.length - 1
                    ? `1px solid ${THEME.borderColor}`
                    : "none",
                animation: `rates-fade-in 0.5s ease ${i * 0.15}s both`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: `${THEME.accent}44`,
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: THEME.accent,
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.85rem",
                  color: `${THEME.text}bb`,
                  lineHeight: 1.65,
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   8b. TOOL LINKS
   ═════════════════════════════════════════════════════════════════════ */
function ToolLinks() {
  const linkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    border: `1px solid ${THEME.borderColor}`,
    background: "transparent",
    color: THEME.muted,
    fontFamily: FONTS.mono,
    fontSize: "0.78rem",
    textDecoration: "none",
    transition: "all 0.2s",
  };

  return (
    <section style={{ padding: "0 0 24px", textAlign: "center" }}>
      <div style={{ ...container, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a
          href="/compare"
          style={linkStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFB800"; e.currentTarget.style.color = "#FFB800"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderColor; e.currentTarget.style.color = THEME.muted; }}
        >
          Compare All DEXs &rarr;
        </a>
        <a
          href="/liquidations"
          style={linkStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00FF41"; e.currentTarget.style.color = "#00FF41"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderColor; e.currentTarget.style.color = THEME.muted; }}
        >
          Liquidation Monitor &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   9. CTA FOOTER
   ═════════════════════════════════════════════════════════════════════ */
function CTAFooter() {
  const weeksRemaining = getWeeksRemaining();

  return (
    <section style={{ padding: "60px 0 24px", textAlign: "center" }}>
      <div style={container}>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            fontWeight: 700,
            color: THEME.accent,
            marginBottom: 20,
            lineHeight: 1.3,
          }}
        >
          Start capturing funding rate alpha.
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.82rem",
            color: THEME.muted,
            marginBottom: 6,
          }}
        >
          Access code:
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "1.4rem",
            fontWeight: 700,
            color: THEME.text,
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}
        >
          {REFERRAL_CODE}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.85rem",
            color: THEME.accent,
            marginBottom: 28,
          }}
        >
          {weeksRemaining} weeks until points program closes
        </div>
        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...ctaButton, fontSize: "1rem", padding: "16px 48px" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f59e0b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = THEME.accent; }}
        >
          OPEN POSITION &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   10. DISCLAIMER
   ═════════════════════════════════════════════════════════════════════ */
function Disclaimer() {
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.68rem",
          color: `${THEME.text}55`,
          lineHeight: 1.7,
          textAlign: "center",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        Funding rates are snapshots and change every funding interval. Actual execution
        requires accounting for spreads, slippage, gas costs, and margin requirements.
        Historical rates do not guarantee future returns. Not financial advice.
      </p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MAIN PAGE EXPORT
   ═════════════════════════════════════════════════════════════════════ */
/* ═════════════════════════════════════════════════════════════════════
   TRADFI / RWA TABLE — Variational vs Hyperliquid HIP-3
   ═════════════════════════════════════════════════════════════════════ */
function useTradfiData() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function go() {
      try {
        const res = await fetch(`${RATES_API_BASE}/api/rates/tradfi`);
        if (!res.ok) throw new Error("api");
        const d = await res.json();
        if (!cancelled) setRows(d.opportunities || []);
      } catch {
        if (!cancelled) setRows([]);
      }
    }
    go();
    const iv = setInterval(go, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);
  return rows;
}

function formatTradfiDirection(direction) {
  return direction === "long_var_short_hl"
    ? "Long VAR / Short HL"
    : "Short VAR / Long HL";
}

function TradfiTable() {
  const rows = useTradfiData();
  const [hiddenCats, setHiddenCats] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const cats = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows]
  );

  const filtered = useMemo(
    () => rows.filter((r) => !hiddenCats.has(r.category)),
    [rows, hiddenCats]
  );
  const visible = showAll ? filtered : filtered.slice(0, 15);

  const toggleCat = useCallback((c) => {
    setHiddenCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }, []);

  if (!rows.length) return null;

  const th = {
    fontFamily: FONTS.mono, fontSize: "0.62rem", fontWeight: 600,
    letterSpacing: "0.1em", color: THEME.muted, textTransform: "uppercase",
    padding: "12px 14px", textAlign: "left",
    borderBottom: `1px solid ${THEME.borderColor}`, whiteSpace: "nowrap",
    background: "#0f0e0b", position: "sticky", top: 0,
  };
  const td = {
    fontFamily: FONTS.mono, fontSize: "0.8rem", padding: "11px 14px",
    borderBottom: `1px solid ${THEME.borderColor}`, whiteSpace: "nowrap",
  };

  return (
    <section style={{ padding: "20px 0 60px", borderBottom: `1px solid ${THEME.borderColor}` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 03</div>
        <div style={sectionTitle}>TRADFI &amp; RWA PERPS</div>
        <div style={{ fontFamily: FONTS.mono, fontSize: "0.72rem", color: `${THEME.text}88`, lineHeight: 1.6, marginBottom: 20, maxWidth: 720 }}>
          Stocks, ETFs, indices and commodities trade as perps on both Variational
          and Hyperliquid's HIP-3 <span style={{ color: THEME.muted }}>xyz</span> dex.
          Variational runs near-zero funding on most of these while HIP-3 charges
          real funding — so the spread is often collectable delta-neutral. Matched
          by underlying (e.g. XAU↔GOLD, US500↔SP500, BZ↔BRENTOIL).
        </div>

        {/* Category filter */}
        {cats.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {cats.map((c) => {
              const off = hiddenCats.has(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  style={{
                    fontFamily: FONTS.mono, fontSize: "0.66rem", letterSpacing: "0.04em",
                    padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${off ? THEME.borderColor : `${THEME.accent}66`}`,
                    background: off ? "transparent" : `${THEME.accent}18`,
                    color: off ? `${THEME.text}55` : THEME.accent,
                    textDecoration: off ? "line-through" : "none",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ overflowX: "auto", border: `1px solid ${THEME.borderColor}`, background: THEME.cardBg }}>
          <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ASSET", "CATEGORY", "VAR RATE", "HL HIP-3 RATE", "SPREAD", "DIRECTION", "$10K/DAY", "VAR VOL", "HL VOL"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={9} style={{ ...td, textAlign: "center", color: THEME.muted, padding: "28px 14px", whiteSpace: "normal" }}>
                  No categories selected.
                </td></tr>
              )}
              {visible.map((r, idx) => (
                <tr key={r.ticker} style={{ background: idx % 2 === 0 ? THEME.cardBg : "#1a1814" }}>
                  <td style={{ ...td, fontWeight: 700, color: THEME.text }}>{r.ticker}</td>
                  <td style={{ ...td, color: THEME.muted, fontSize: "0.7rem" }}>{r.category}</td>
                  <td style={{ ...td, color: r.var_rate_annual >= 0 ? THEME.positive : THEME.negative }}>{fmtRate(r.var_rate_annual)}</td>
                  <td style={{ ...td, color: r.hl_rate_annual >= 0 ? THEME.positive : THEME.negative }}>{fmtRate(r.hl_rate_annual)}</td>
                  <td style={{ ...td, color: THEME.accent, fontWeight: 700 }}>{fmtRate(r.spread_annual)}</td>
                  <td style={{ ...td, color: `${THEME.text}99`, fontSize: "0.72rem" }}>{formatTradfiDirection(r.direction)}</td>
                  <td style={{ ...td, color: THEME.positive, fontWeight: 600 }}>{fmtDollar(r.daily_pnl_10k)}</td>
                  <td style={{ ...td, color: THEME.muted, fontSize: "0.7rem" }}>{fmtVolume(r.var_volume_24h)}</td>
                  <td style={{ ...td, color: THEME.muted, fontSize: "0.7rem" }}>{fmtVolume(r.hl_volume_24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 15 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            style={{
              marginTop: 14, fontFamily: FONTS.mono, fontSize: "0.7rem", letterSpacing: "0.06em",
              color: THEME.accent, background: "transparent", border: `1px solid ${THEME.accent}44`,
              borderRadius: 4, padding: "7px 16px", cursor: "pointer", textTransform: "uppercase",
            }}
          >
            {showAll ? "Show less" : `Show all ${filtered.length}`}
          </button>
        )}
      </div>
    </section>
  );
}

export default function RatesTheme() {
  const [ready, setReady] = useState(false);
  const { data, loading, status, meta, error } = useRatesData();

  useEffect(() => {
    injectGlobalStyles();
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!ready || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: THEME.accent,
          fontFamily: "monospace",
          fontSize: "0.9rem",
        }}
      >
        LOADING RATES...
      </div>
    );
  }

  const { opportunities, summary } = data;

  return (
    <div style={pageWrap}>
      <TopBar />
      <div style={{ ...container, paddingTop: 14 }}>
        <LiveDataStatus status={status} meta={meta} error={error} />
      </div>
      <TickerBanner opportunities={opportunities} />
      <SummaryStats summary={summary} />
      <Hero />
      <OpportunitiesTable opportunities={opportunities} />
      <TradfiTable />
      <EarningsCalculator opportunities={opportunities} />
      <HistoricalChart opportunities={opportunities} />
      <HowItWorks />
      <ToolLinks />
      <CTAFooter />
      <Disclaimer />
      <Footer theme={THEME} />
    </div>
  );
}
