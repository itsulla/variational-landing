import express from "express";

const app = express();
const PORT = 8002;

// ─── Cache layer ────────────────────────────────────────────────
const cache = {};
function cached(key, ttlMs, fetcher) {
  return async (_req, res) => {
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < ttlMs) {
      return res.json(cache[key].data);
    }
    try {
      const data = await fetcher();
      cache[key] = { data, ts: now };
      res.json(data);
    } catch (err) {
      console.error(`[${key}] fetch error:`, err.message);
      if (cache[key]) return res.json(cache[key].data);
      res.status(502).json({ error: err.message });
    }
  };
}

// ─── Helper: fetch JSON ─────────────────────────────────────────
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

async function fetchJSON(url, opts = {}) {
  const headers = { ...DEFAULT_HEADERS, ...opts.headers };
  const res = await fetch(url, { signal: AbortSignal.timeout(15000), ...opts, headers });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
//  VARIATIONAL — Real funding rates from their public API
// ═══════════════════════════════════════════════════════════════

const VARIATIONAL_API = "https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats";

async function fetchVariationalRates() {
  const data = await fetchJSON(VARIATIONAL_API);
  const rates = {};
  for (const listing of data.listings || []) {
    const ticker = listing.ticker.toUpperCase();
    // Variational funding_rate: the docs say "multiply by 100 for %"
    // but comparing with other exchanges, the values align when treated as
    // already-percentage (e.g. -0.003800 = -0.0038% per interval)
    // BTC: -0.0038% * 3/day * 365 = ~-4.16% annual — consistent with market
    const intervalSeconds = listing.funding_interval_s || 28800;
    const periodsPerDay = 86400 / intervalSeconds;
    const rateDecimal = parseFloat(listing.funding_rate) || 0;
    const annualRate = rateDecimal * periodsPerDay * 365; // annualized %

    const longOI = parseFloat(listing.open_interest?.long_open_interest) || 0;
    const shortOI = parseFloat(listing.open_interest?.short_open_interest) || 0;
    const markPrice = parseFloat(listing.mark_price) || 0;

    rates[ticker] = {
      annualRate,
      rate: rateDecimal,
      intervalSeconds,
      markPrice,
      volume24h: parseFloat(listing.volume_24h) || 0,
      openInterest: (longOI + shortOI) * markPrice,
    };
  }
  return { rates, numMarkets: data.num_markets || 0, raw: data };
}

// ═══════════════════════════════════════════════════════════════
//  EXCHANGE RATE SOURCES (CEX + DEX)
// ═══════════════════════════════════════════════════════════════

const TICKERS = ["BTC", "ETH", "SOL", "DOGE", "AVAX", "ARB", "LINK", "OP", "WIF", "PEPE", "MATIC", "SUI"];

// edgeX contract ID mapping
const EDGEX_CONTRACTS = {
  BTC: "10000001", ETH: "10000002", SOL: "10000003", AVAX: "10000007",
  MATIC: "10000008", DOGE: "10000010", PEPE: "10000011", SUI: "10000014",
  WIF: "10000015", ARB: "10000019", OP: "10000020", LINK: "10000006",
};

async function fetchAllExchangeRates() {
  const results = {};

  // ── edgeX (DEX) — per ticker ──
  const edgexPromises = TICKERS.map(async (ticker) => {
    const contractId = EDGEX_CONTRACTS[ticker];
    if (!contractId) return;
    try {
      const data = await fetchJSON(
        `https://pro.edgex.exchange/api/v1/public/quote/getTicker?contractId=${contractId}`
      );
      const item = data?.data?.[0];
      if (!item) return;
      // edgeX fundingRate is per-interval (4h), annualize
      const rate = parseFloat(item.fundingRate) || 0;
      const fundingTime = parseInt(item.fundingTime) || 0;
      const nextFundingTime = parseInt(item.nextFundingTime) || 0;
      const intervalMs = nextFundingTime - fundingTime;
      const periodsPerDay = intervalMs > 0 ? 86400000 / intervalMs : 6; // default 4h = 6/day
      if (!results[ticker]) results[ticker] = {};
      results[ticker].edgex = {
        rate8h: rate, // store raw rate, we'll annualize later
        periodsPerDay,
        markPrice: parseFloat(item.markPrice) || 0,
        volume24h: parseFloat(item.value) || 0,
      };
    } catch (_e) { /* skip */ }
  });
  await Promise.all(edgexPromises);

  // ── Hyperliquid (DEX) — bulk ──
  try {
    const [metaResp, assetCtxs] = await fetchJSON("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
    });
    const universe = metaResp?.universe || [];
    for (const ticker of TICKERS) {
      const idx = universe.findIndex((u) => u.name === ticker);
      if (idx === -1 || !assetCtxs?.[idx]) continue;
      const ctx = assetCtxs[idx];
      if (!results[ticker]) results[ticker] = {};
      results[ticker].hyperliquid = {
        rate8h: parseFloat(ctx.funding) || 0,
        periodsPerDay: 3, // 8h intervals
        markPrice: parseFloat(ctx.markPx) || 0,
        volume24h: parseFloat(ctx.dayNtlVlm) || 0,
      };
    }
  } catch (e) {
    console.error("Hyperliquid fetch error:", e.message);
  }

  // ── Binance (CEX) — bulk ──
  try {
    const data = await fetchJSON("https://fapi.binance.com/fapi/v1/premiumIndex");
    for (const ticker of TICKERS) {
      const symbol = ticker === "MATIC" ? "POLUSDT" : `${ticker}USDT`;
      const item = data.find((d) => d.symbol === symbol);
      if (!item) continue;
      if (!results[ticker]) results[ticker] = {};
      results[ticker].binance = {
        rate8h: parseFloat(item.lastFundingRate) || 0,
        periodsPerDay: 3,
        markPrice: parseFloat(item.markPrice) || 0,
      };
    }
  } catch (e) {
    console.error("Binance fetch error:", e.message);
  }

  // ── Bybit (CEX) — bulk ──
  try {
    const data = await fetchJSON("https://api.bybit.com/v5/market/tickers?category=linear");
    for (const ticker of TICKERS) {
      const symbol = ticker === "MATIC" ? "POLUSDT" : `${ticker}USDT`;
      const item = (data.result?.list || []).find((d) => d.symbol === symbol);
      if (!item) continue;
      if (!results[ticker]) results[ticker] = {};
      results[ticker].bybit = {
        rate8h: parseFloat(item.fundingRate) || 0,
        periodsPerDay: 3,
        markPrice: parseFloat(item.markPrice) || 0,
      };
    }
  } catch (e) {
    console.error("Bybit fetch error:", e.message);
  }

  // ── Bitget (CEX) — bulk ──
  try {
    const data = await fetchJSON("https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES");
    for (const ticker of TICKERS) {
      const symbol = ticker === "MATIC" ? "POLUSDT" : `${ticker}USDT`;
      const item = (data?.data || []).find((d) => d.symbol === symbol);
      if (!item) continue;
      if (!results[ticker]) results[ticker] = {};
      results[ticker].bitget = {
        rate8h: parseFloat(item.fundingRate) || 0,
        periodsPerDay: 3,
        markPrice: parseFloat(item.markPrice) || 0,
      };
    }
  } catch (e) {
    console.error("Bitget fetch error:", e.message);
  }

  // ── OKX (CEX) — per ticker ──
  for (const ticker of TICKERS.slice(0, 8)) {
    try {
      const instId = ticker === "MATIC" ? "POL-USDT-SWAP" : `${ticker}-USDT-SWAP`;
      const data = await fetchJSON(`https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`);
      const item = data?.data?.[0];
      if (!item) continue;
      if (!results[ticker]) results[ticker] = {};
      results[ticker].okx = {
        rate8h: parseFloat(item.fundingRate) || 0,
        periodsPerDay: 3,
      };
    } catch (_e) { /* skip */ }
  }

  // ── Gate.io (CEX) — per ticker ──
  for (const ticker of TICKERS.slice(0, 6)) {
    try {
      const contract = ticker === "MATIC" ? "POL_USDT" : `${ticker}_USDT`;
      const data = await fetchJSON(`https://api.gateio.ws/api/v4/futures/usdt/contracts/${contract}`);
      if (!data?.funding_rate) continue;
      if (!results[ticker]) results[ticker] = {};
      results[ticker]["gate.io"] = {
        rate8h: parseFloat(data.funding_rate) || 0,
        periodsPerDay: 3,
        markPrice: parseFloat(data.mark_price) || 0,
      };
    } catch (_e) { /* skip */ }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
//  BUILD OPPORTUNITIES — Variational vs all exchanges
// ═══════════════════════════════════════════════════════════════

async function buildOpportunities() {
  const [varData, exchangeRates] = await Promise.all([
    fetchVariationalRates(),
    fetchAllExchangeRates(),
  ]);

  const opportunities = [];

  for (const ticker of TICKERS) {
    const varRate = varData.rates[ticker];
    if (!varRate) continue;

    const varAnnual = varRate.annualRate;
    const markPrice = varRate.markPrice;
    const volume24h = varRate.volume24h;

    // Find best spread across all exchanges
    const tickerExchanges = exchangeRates[ticker] || {};
    let bestExchange = null;
    let bestExchangeRate = 0;
    let bestSpread = 0;

    for (const [exchange, data] of Object.entries(tickerExchanges)) {
      const exAnnual = data.rate8h * data.periodsPerDay * 365 * 100;
      const spread = Math.abs(varAnnual - exAnnual);
      if (spread > bestSpread) {
        bestSpread = spread;
        bestExchange = exchange;
        bestExchangeRate = exAnnual;
      }
    }

    if (!bestExchange) continue;

    const direction = varAnnual > bestExchangeRate ? "short_var_long_cex" : "long_var_short_cex";
    const spreadAnnual = bestSpread;
    const dailyPer10k = (spreadAnnual / 365 / 100) * 10000;

    opportunities.push({
      ticker,
      var_rate_annual: Math.round(varAnnual * 100) / 100,
      cex_exchange: bestExchange,
      cex_rate_annual: Math.round(bestExchangeRate * 100) / 100,
      spread_annual: Math.round(spreadAnnual * 100) / 100,
      direction,
      daily_pnl_10k: Math.round(dailyPer10k * 100) / 100,
      daily_pnl_50k: Math.round(dailyPer10k * 5 * 100) / 100,
      daily_pnl_100k: Math.round(dailyPer10k * 10 * 100) / 100,
      var_mark_price: markPrice,
      volume_24h: Math.round(volume24h),
    });
  }

  opportunities.sort((a, b) => b.spread_annual - a.spread_annual);
  return opportunities;
}

// ─── /api/rates/opportunities ───────────────────────────────────
app.get("/api/rates/opportunities", cached("rates_opp", 5 * 60 * 1000, async () => {
  const opportunities = await buildOpportunities();
  return { opportunities };
}));

// ─── /api/rates/summary ─────────────────────────────────────────
app.get("/api/rates/summary", cached("rates_summary", 5 * 60 * 1000, async () => {
  const [opportunities, varData] = await Promise.all([
    cache["rates_opp"]?.data?.opportunities || buildOpportunities(),
    fetchVariationalRates(),
  ]);
  const best = opportunities[0] || {};
  const avgSpread = opportunities.length
    ? opportunities.reduce((s, o) => s + o.spread_annual, 0) / opportunities.length
    : 0;

  return {
    total_markets_tracked: varData.numMarkets || Object.keys(varData.rates).length,
    total_opportunities: opportunities.length,
    best_spread_ticker: best.ticker || "BTC",
    best_spread_annual: best.spread_annual || 0,
    best_daily_10k: best.daily_pnl_10k || 0,
    avg_spread_annual: Math.round(avgSpread * 100) / 100,
    updated_at: new Date().toISOString(),
  };
}));

// ─── /api/rates/history ─────────────────────────────────────────
// Simulated history based on current live rates (no historical DB)
app.get("/api/rates/history", async (req, res) => {
  const ticker = (req.query.ticker || "BTC").toUpperCase();
  const cacheKey = `history_${ticker}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].ts < 30 * 60 * 1000) {
    return res.json({ series: cache[cacheKey].data });
  }

  try {
    const opps = cache["rates_opp"]?.data?.opportunities || await buildOpportunities();
    const opp = opps.find((o) => o.ticker === ticker) || opps[0];
    const series = buildHistory(opp);
    cache[cacheKey] = { data: series, ts: now };
    res.json({ series });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

function buildHistory(opp) {
  const hours = 168;
  const series = { variational: [], binance: [], bybit: [], hyperliquid: [] };
  let varRate = opp.var_rate_annual;
  let binRate = opp.cex_rate_annual;
  let bybitRate = opp.cex_rate_annual + (Math.random() - 0.5) * 2;
  let hlRate = opp.cex_rate_annual - (Math.random() - 0.5) * 3;

  for (let i = 0; i < hours; i++) {
    const t = new Date(Date.now() - (hours - i) * 3600000).toISOString();
    varRate += (Math.random() - 0.5) * 4;
    varRate = Math.max(opp.var_rate_annual * 0.3, Math.min(varRate, opp.var_rate_annual * 2.5));
    binRate += (Math.random() - 0.5) * 0.8;
    binRate = Math.max(-5, Math.min(binRate, opp.cex_rate_annual * 3));
    bybitRate += (Math.random() - 0.5) * 0.9;
    bybitRate = Math.max(-5, Math.min(bybitRate, opp.cex_rate_annual * 3));
    hlRate += (Math.random() - 0.5) * 1.0;
    hlRate = Math.max(-8, Math.min(hlRate, opp.cex_rate_annual * 4));

    series.variational.push({ t, rate: Math.round(varRate * 100) / 100 });
    series.binance.push({ t, rate: Math.round(binRate * 100) / 100 });
    series.bybit.push({ t, rate: Math.round(bybitRate * 100) / 100 });
    series.hyperliquid.push({ t, rate: Math.round(hlRate * 100) / 100 });
  }
  return series;
}

// ═══════════════════════════════════════════════════════════════
//  COMPARE ENDPOINTS
// ═══════════════════════════════════════════════════════════════

async function fetchDefiLlamaProtocols() {
  const slugs = [
    "hyperliquid-perps", "gmx-v2", "drift-protocol", "vertex-protocol",
    "kwenta", "aevo", "rabbitx", "synfutures-v3", "bluefin",
  ];

  const [volumeData, protocolsData, varData] = await Promise.all([
    fetchJSON("https://api.llama.fi/overview/derivatives?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true"),
    Promise.all(slugs.map((s) => fetchJSON(`https://api.llama.fi/protocol/${s}`).catch(() => null))),
    fetchVariationalRates(),
  ]);

  const volumeMap = {};
  for (const p of volumeData?.protocols || []) {
    volumeMap[p.name] = {
      volume24h: p.total24h || p.dailyVolume || 0,
      cumulativeVolume: p.totalAllTime || p.total7d * 52 || 0,
    };
  }

  // Use real Variational stats
  const protocols = [
    {
      slug: "variational",
      display_name: "Variational",
      cumulative_volume: parseFloat(varData.raw.cumulative_volume) || null,
      volume_24h: parseFloat(varData.raw.total_volume_24h) || 0,
      markets_count: varData.numMarkets,
      fees: "0.00%",
      architecture: "Private RFQ",
      chain: "Ethereum L2",
    },
  ];

  for (const pData of protocolsData) {
    if (!pData) continue;
    const volInfo = volumeMap[pData.name] || {};
    protocols.push({
      slug: pData.slug,
      display_name: pData.name,
      cumulative_volume: volInfo.cumulativeVolume || 0,
      volume_24h: volInfo.volume24h || 0,
      markets_count: null,
      tvl: pData.tvl || 0,
      chain: pData.chain || pData.chains?.join(", ") || "Unknown",
    });
  }

  return protocols;
}

app.get("/api/compare/protocols", cached("compare_protocols", 30 * 60 * 1000, async () => {
  const protocols = await fetchDefiLlamaProtocols();
  return { protocols, last_updated: new Date().toISOString() };
}));

app.get("/api/compare/summary", cached("compare_summary", 30 * 60 * 1000, async () => {
  const protocols = cache["compare_protocols"]?.data?.protocols || await fetchDefiLlamaProtocols();
  const totalVol24h = protocols.reduce((s, p) => s + (p.volume_24h || 0), 0);
  const varVol = protocols.find((p) => p.slug === "variational")?.volume_24h || 0;

  return {
    variational_market_share_pct: totalVol24h > 0 ? Math.round((varVol / totalVol24h) * 10000) / 100 : 0,
    total_protocols: protocols.length,
    total_volume_24h: totalVol24h,
    updated_at: new Date().toISOString(),
  };
}));

// ═══════════════════════════════════════════════════════════════
//  THREE-WAY COMPARE: Hyperliquid / Variational / Lighter
//  Data sources (all free):
//    - DefiLlama /summary/fees/{slug}      → daily fees history
//    - DefiLlama /protocol/{slug}          → TVL snapshot
//    - api.hyperliquid.xyz                 → 24h vol, OI, mark px
//    - mainnet.zklighter.elliot.ai         → 24h vol per pair
//    - Variational metadata/stats          → 24h vol, OI, cumulative
// ═══════════════════════════════════════════════════════════════

const VARIATIONAL_LAUNCH_DATE = "2025-01-01";

async function fetchDLFeesHistory(slug) {
  try {
    const data = await fetchJSON(
      `https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`
    );
    return data?.totalDataChart || [];
  } catch (_e) {
    return [];
  }
}

async function fetchDLTVL(slug) {
  try {
    const data = await fetchJSON(`https://api.llama.fi/protocol/${slug}`);
    const tvl = Array.isArray(data?.tvl) && data.tvl.length
      ? data.tvl[data.tvl.length - 1]?.totalLiquidityUSD
      : null;
    return typeof tvl === "number" ? tvl : null;
  } catch (_e) {
    return null;
  }
}

async function fetchHyperliquidLive() {
  try {
    const [metaResp, ctxs] = await fetchJSON("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
    });
    const universe = metaResp?.universe || [];
    let vol24 = 0;
    let oi = 0;
    for (let i = 0; i < universe.length; i++) {
      const c = ctxs?.[i];
      if (!c) continue;
      vol24 += parseFloat(c.dayNtlVlm) || 0;
      const mark = parseFloat(c.markPx) || 0;
      const openI = parseFloat(c.openInterest) || 0;
      oi += openI * mark;
    }
    return {
      volume_24h: vol24,
      open_interest: oi,
      markets_count: universe.length,
    };
  } catch (_e) {
    return { volume_24h: null, open_interest: null, markets_count: null };
  }
}

async function fetchLighterLive() {
  try {
    const data = await fetchJSON(
      "https://mainnet.zklighter.elliot.ai/api/v1/exchangeStats"
    );
    const stats = data?.order_book_stats || [];
    let vol24 = 0;
    for (const s of stats) vol24 += parseFloat(s.daily_quote_token_volume) || 0;
    return {
      volume_24h: vol24,
      open_interest: null,
      markets_count: stats.length,
    };
  } catch (_e) {
    return { volume_24h: null, open_interest: null, markets_count: null };
  }
}

function sumFeesInWindow(chart, fromSec, toSec) {
  let sum = 0;
  let days = 0;
  for (const [ts, val] of chart) {
    if (ts < fromSec || ts > toSec) continue;
    const v = parseFloat(val) || 0;
    sum += v;
    days += 1;
  }
  return { sum, days };
}

function windowBounds(window) {
  const nowSec = Math.floor(Date.now() / 1000);
  if (window === "all") {
    return { from: 0, to: nowSec, label: "All-time" };
  }
  if (window === "launch") {
    const from = Math.floor(new Date(VARIATIONAL_LAUNCH_DATE).getTime() / 1000);
    return { from, to: nowSec, label: `Since Variational launch (${VARIATIONAL_LAUNCH_DATE})` };
  }
  // default ytd
  const y = new Date().getUTCFullYear();
  const from = Math.floor(Date.UTC(y, 0, 1) / 1000);
  return { from, to: nowSec, label: `Year to date (${y})` };
}

async function buildThreeWayCompare(window) {
  const { from, to, label } = windowBounds(window);

  const [
    hlLive,
    ltLive,
    varData,
    hlFees,
    ltFees,
    hlTVL,
    ltTVL,
  ] = await Promise.all([
    fetchHyperliquidLive(),
    fetchLighterLive(),
    fetchVariationalRates(),
    fetchDLFeesHistory("hyperliquid"),
    fetchDLFeesHistory("lighter"),
    fetchDLTVL("hyperliquid"),
    fetchDLTVL("lighter"),
  ]);

  const hlWin = sumFeesInWindow(hlFees, from, to);
  const ltWin = sumFeesInWindow(ltFees, from, to);

  // Variational has 0% trading fees by design, no DefiLlama fees adapter.
  // OI and TVL are reported as USD totals at the top level of the stats payload.
  const varOI = parseFloat(varData?.raw?.open_interest) || null;
  const varTVL = parseFloat(varData?.raw?.tvl) || null;

  const protocols = [
    {
      slug: "variational",
      name: "Variational",
      architecture: "Private RFQ (Omni LP)",
      fee_model: "0.00% (permanent)",
      cumulative_volume: parseFloat(varData?.raw?.cumulative_volume) || null,
      volume_24h: parseFloat(varData?.raw?.total_volume_24h) || null,
      open_interest: varOI || null,
      tvl: varTVL,
      markets_count: varData?.numMarkets || null,
      fees_window: 0,
      daily_avg_fees_window: 0,
      window_days: null,
      fees_note: "0% trading fees by design",
    },
    {
      slug: "hyperliquid",
      name: "Hyperliquid",
      architecture: "On-chain CLOB (HyperBFT L1)",
      fee_model: "0.025% base taker",
      cumulative_volume: null,
      volume_24h: hlLive.volume_24h,
      open_interest: hlLive.open_interest,
      tvl: hlTVL,
      markets_count: hlLive.markets_count,
      fees_window: hlWin.sum,
      daily_avg_fees_window: hlWin.days > 0 ? hlWin.sum / hlWin.days : 0,
      window_days: hlWin.days,
      fees_note: null,
    },
    {
      slug: "lighter",
      name: "Lighter",
      architecture: "zkRollup CLOB (Ethereum L2)",
      fee_model: "0.00% maker / 0.025% taker",
      cumulative_volume: null,
      volume_24h: ltLive.volume_24h,
      open_interest: null,
      tvl: ltTVL,
      markets_count: ltLive.markets_count,
      fees_window: ltWin.sum,
      daily_avg_fees_window: ltWin.days > 0 ? ltWin.sum / ltWin.days : 0,
      window_days: ltWin.days,
      fees_note: null,
    },
  ];

  return {
    protocols,
    window: { key: window, from, to, label, days: Math.floor((to - from) / 86400) },
    last_updated: new Date().toISOString(),
  };
}

app.get("/api/compare/three", async (req, res) => {
  const win = ["ytd", "launch", "all"].includes(req.query.window)
    ? req.query.window
    : "ytd";
  const key = `compare_three_${win}`;
  const now = Date.now();
  const ttl = 30 * 60 * 1000;
  if (cache[key] && now - cache[key].ts < ttl) {
    return res.json(cache[key].data);
  }
  try {
    const data = await buildThreeWayCompare(win);
    cache[key] = { data, ts: now };
    res.json(data);
  } catch (err) {
    console.error(`[${key}] error:`, err.message);
    if (cache[key]) return res.json(cache[key].data);
    res.status(502).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
//  LIQUIDATIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

const LIQ_ASSETS = ["BTC", "ETH", "SOL", "HYPE", "ARB", "DOGE", "WIF", "AVAX", "LINK", "SUI"];
const LEVERAGE_LEVELS = [50, 20, 10, 5, 3];

async function fetchHyperliquidAssetData() {
  const [metaResp, assetCtxs] = await fetchJSON("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
  });

  const universe = metaResp?.universe || [];
  const assets = [];

  for (const coin of LIQ_ASSETS) {
    const idx = universe.findIndex((u) => u.name === coin);
    if (idx === -1 || !assetCtxs?.[idx]) continue;

    const ctx = assetCtxs[idx];
    const markPrice = parseFloat(ctx.markPx) || 0;
    const openInterest = (parseFloat(ctx.openInterest) || 0) * markPrice;
    const fundingRate = parseFloat(ctx.funding) || 0;

    const levels = LEVERAGE_LEVELS.map((lev) => {
      const marginPct = 1 / lev;
      const maintenancePct = marginPct * 0.5;
      const longLiqPrice = markPrice * (1 - marginPct + maintenancePct);
      const shortLiqPrice = markPrice * (1 + marginPct - maintenancePct);
      return {
        leverage: lev,
        long_liq_price: Math.round(longLiqPrice * 1e6) / 1e6,
        short_liq_price: Math.round(shortLiqPrice * 1e6) / 1e6,
        long_distance_pct: Math.round(((longLiqPrice - markPrice) / markPrice) * 10000) / 100,
        short_distance_pct: Math.round(((shortLiqPrice - markPrice) / markPrice) * 10000) / 100,
      };
    });

    assets.push({
      coin,
      mark_price: markPrice,
      open_interest: Math.round(openInterest),
      funding_rate: fundingRate,
      levels,
      updated_at: new Date().toISOString(),
    });
  }

  return assets;
}

app.get("/api/liquidations/assets", cached("liq_assets", 60 * 1000, async () => {
  const assets = await fetchHyperliquidAssetData();
  return { assets, updated_at: new Date().toISOString() };
}));

app.get("/api/liquidations/levels", async (req, res) => {
  const coin = (req.query.coin || "BTC").toUpperCase();
  const cacheKey = "liq_assets";
  const now = Date.now();

  let assets;
  if (cache[cacheKey] && now - cache[cacheKey].ts < 60 * 1000) {
    assets = cache[cacheKey].data.assets;
  } else {
    try {
      assets = await fetchHyperliquidAssetData();
      cache[cacheKey] = { data: { assets, updated_at: new Date().toISOString() }, ts: now };
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  const asset = assets.find((a) => a.coin === coin);
  if (!asset) return res.status(404).json({ error: `Unknown coin: ${coin}` });
  res.json(asset);
});

// ─── Start ──────────────────────────────────────────────────────
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Variational API running on http://127.0.0.1:${PORT}`);
  console.log("Data sources: Variational (real), edgeX, Hyperliquid, Binance, Bybit, Bitget, OKX, Gate.io");
  setTimeout(async () => {
    try {
      await buildOpportunities();
      console.log("Rates cache warmed");
    } catch (e) {
      console.error("Rates warm-up failed:", e.message);
    }
  }, 1000);
});
