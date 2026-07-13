import express from "express";
import { loadEnvFile } from "node:process";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Load API keys / secrets from .env (chmod 600). Soft-fail if absent so
// the server still boots in environments without an env file — endpoints
// that depend on a missing key will just degrade gracefully.
try {
  loadEnvFile(new URL("./.env", import.meta.url));
} catch (_e) { /* no .env present, that's fine */ }

const COINALYZE_API_KEY = process.env.COINALYZE_API_KEY || "";
const REF_ADMIN_SECRET = process.env.REF_ADMIN_SECRET || "";
// Lithuania VPS funding proxy — reaches Binance/Bybit directly (not
// geo-blocked in the EU), replacing the slow Coinalyze path for those two.
const LT_PROXY_URL = process.env.LT_PROXY_URL || "";
const LT_PROXY_SECRET = process.env.LT_PROXY_SECRET || "";

const app = express();
app.use(express.json({ limit: "16kb" }));
const PORT = 8002;

// ═══════════════════════════════════════════════════════════════
//  REFERRAL CODE POOL — rotation, tracking, waitlist
// ═══════════════════════════════════════════════════════════════
// Variational referral codes have limited signup slots (1 slot per
// $1M of personal/referred volume per the docs), so the site serves
// codes from a pool with SEQUENTIAL FILL: the first active code with
// signups < maxSlots is "current" until it's manually reconciled as
// full, then the next takes over. `signups` is ground truth from the
// Variational dashboard (updated via the admin endpoint); `copies`
// is an automatic leading indicator only — clicks never decrement
// slots, because most copies don't become signups.

const REF_POOL_PATH = fileURLToPath(new URL("./ref-codes.json", import.meta.url));
const WAITLIST_PATH = fileURLToPath(new URL("./waitlist.jsonl", import.meta.url));

function loadRefPool() {
  try {
    return JSON.parse(readFileSync(REF_POOL_PATH, "utf8"));
  } catch (e) {
    console.error("[ref] pool load failed:", e.message);
    return { codes: [] };
  }
}

function saveRefPool(pool) {
  writeFileSync(REF_POOL_PATH, JSON.stringify(pool, null, 2) + "\n");
}

function currentRefCode(pool) {
  return pool.codes.find((c) => c.active && c.signups < c.maxSlots) || null;
}

function refStatus(pool) {
  const remaining = pool.codes
    .filter((c) => c.active)
    .reduce((s, c) => s + Math.max(0, c.maxSlots - c.signups), 0);
  return { slots_remaining: remaining, pool_exhausted: remaining === 0 };
}

// Current code for the frontend bootstrap. Never errors — an empty
// pool returns exhausted:true and the UI falls back to waitlist mode.
app.get("/api/ref/next", (_req, res) => {
  const pool = loadRefPool();
  const cur = currentRefCode(pool);
  const status = refStatus(pool);
  if (!cur) {
    return res.json({ code: null, link: null, ...status, pool_exhausted: true });
  }
  res.json({
    code: cur.code,
    link: `https://omni.variational.io/?ref=${cur.code}`,
    ...status,
  });
});

// Pool state for the scarcity counter (no per-code internals exposed
// beyond what the site shows anyway).
app.get("/api/ref/status", (_req, res) => {
  res.json(refStatus(loadRefPool()));
});

// Copy-click tracking — leading indicator for manual reconciliation.
app.post("/api/ref/track", (req, res) => {
  const code = String(req.body?.code || "").slice(0, 32);
  if (code) {
    const pool = loadRefPool();
    const entry = pool.codes.find((c) => c.code === code);
    if (entry) {
      entry.copies = (entry.copies || 0) + 1;
      saveRefPool(pool);
    }
  }
  res.json({ ok: true });
});

// Waitlist capture for when the pool is exhausted. Append-only JSONL.
app.post("/api/ref/waitlist", (req, res) => {
  const contact = String(req.body?.contact || "").trim().slice(0, 200);
  if (!contact || contact.length < 5) {
    return res.status(400).json({ error: "contact required" });
  }
  appendFileSync(
    WAITLIST_PATH,
    JSON.stringify({ contact, ts: new Date().toISOString() }) + "\n"
  );
  res.json({ ok: true });
});

// Admin: reconcile signup counts / toggle / add codes.
//   curl -X POST http://127.0.0.1:8002/api/ref/admin \
//     -H "content-type: application/json" -H "x-admin-secret: $SECRET" \
//     -d '{"action":"set","code":"OMNI...","signups":5}'
// Actions: set {code, signups?, maxSlots?, active?} | add {code, maxSlots} | list
app.post("/api/ref/admin", (req, res) => {
  if (!REF_ADMIN_SECRET || req.headers["x-admin-secret"] !== REF_ADMIN_SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }
  const pool = loadRefPool();
  const { action, code } = req.body || {};
  if (action === "list") return res.json(pool);
  if (action === "add" && code) {
    pool.codes.push({
      code: String(code),
      maxSlots: Number(req.body.maxSlots) || 1,
      signups: 0,
      copies: 0,
      active: true,
    });
  } else if (action === "set" && code) {
    const entry = pool.codes.find((c) => c.code === code);
    if (!entry) return res.status(404).json({ error: "unknown code" });
    if (req.body.signups !== undefined) entry.signups = Number(req.body.signups);
    if (req.body.maxSlots !== undefined) entry.maxSlots = Number(req.body.maxSlots);
    if (req.body.active !== undefined) entry.active = Boolean(req.body.active);
  } else {
    return res.status(400).json({ error: "unknown action" });
  }
  saveRefPool(pool);
  res.json(pool);
});

// ─── Cache layer (stale-while-revalidate) ───────────────────────
// Fresh (< ttl):    serve from cache instantly.
// Stale (> ttl):    serve the stale copy instantly AND kick off a
//                   background refresh — so no user ever waits on a
//                   slow upstream fetch (some funding sources take
//                   10-20s). Only the very first call (empty cache)
//                   blocks on the fetch.
// `inflight` guards against a thundering herd of background refreshes.
const cache = {};
const inflight = {};
function cached(key, ttlMs, fetcher) {
  const refresh = async () => {
    if (inflight[key]) return inflight[key];
    inflight[key] = (async () => {
      try {
        const data = await fetcher();
        cache[key] = { data, ts: Date.now() };
        return data;
      } finally {
        inflight[key] = null;
      }
    })();
    return inflight[key];
  };

  return async (_req, res) => {
    const now = Date.now();
    const entry = cache[key];

    // Fresh — serve immediately.
    if (entry && now - entry.ts < ttlMs) {
      return res.json(entry.data);
    }

    // Stale — serve stale now, revalidate in the background.
    if (entry) {
      refresh().catch((err) => console.error(`[${key}] bg refresh error:`, err.message));
      return res.json(entry.data);
    }

    // Cold — nothing cached yet, must block on the first fetch.
    try {
      const data = await refresh();
      res.json(data);
    } catch (err) {
      console.error(`[${key}] fetch error:`, err.message);
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
    // Variational funding_rate is the ANNUALIZED rate as a decimal.
    // Verified 2026-06-10: BTC/ETH/SOL/WIF all read exactly 0.109500,
    // which is the protocol's fixed interest baseline from the docs
    // (0.00125%/hour × 24 × 365 = 10.95%/year) — i.e. majors sitting at
    // neutral funding. funding_interval_s (4h/8h) is the PAYMENT cadence
    // only and must not multiply the rate. The previous per-interval
    // interpretation inflated Variational rates ~11x (BTC showed +120%/yr
    // instead of +10.95%/yr) and produced absurd arb spreads.
    const intervalSeconds = listing.funding_interval_s || 28800;
    const rateDecimal = parseFloat(listing.funding_rate) || 0;
    const annualRate = rateDecimal * 100; // annualized decimal → percent

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
//  COINALYZE — proxies the US-blocked Binance + Bybit endpoints
// ═══════════════════════════════════════════════════════════════
// The VPS lives in a US datacenter, so fapi.binance.com (451) and
// api.bybit.com (CloudFront 403) are blocked at the IP level. Coinalyze
// aggregates funding rates from those exchanges as public reference
// data, so we route the two blocked exchanges through it instead.
//
// Exchange codes (verified via /v1/exchanges):
//   A=Binance, 6=Bybit, 3=OKX, Y=Gate.io, 0=BitMEX, 4=HTX/Huobi,
//   8=dYdX, K=Kraken, S=Aster, W=WOO X, 7=Phemex, 2=Deribit,
//   T=Lighter, H=Hyperliquid, …
//
// `value` returned by /v1/funding-rate is the rate as a PERCENT, not a
// decimal — cross-checked against Bitget's native API. We divide by 100
// before storing so the downstream annualization formula
// (`rate8h * periodsPerDay * 365 * 100`) keeps producing percentages.

const COINALYZE_BASE = "https://api.coinalyze.net/v1";
// Coinalyze's docs advertise 40 req/min per API key, but their burst
// tolerance is much tighter than the per-minute average suggests —
// observed 429s firing on as few as 4 requests inside 15 seconds during
// testing, with retry-after headers around ~27s. The combination below
// keeps us safely under both budgets:
//   - 40 symbols/chunk × 3 chunks  = covers our 9 Coinalyze exchanges
//   - 8s delay between chunks      = 3 requests across ~16s ≈ 11 req/min
//   - 5-min upstream cache         = at most 36 chunks/hour total
// This is well inside any reasonable interpretation of "40/min", AND
// the cache layer absorbs the occasional 429 (errored chunks just don't
// contribute, the next 5-min refresh tries again).
const COINALYZE_MAX_SYMBOLS_PER_REQ = 40;
const COINALYZE_CHUNK_DELAY_MS = 8000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Per-exchange symbol formatters ─────────────────────────────
// Each formatter takes a normalised base (after MATIC→POL etc) and
// returns the Coinalyze symbol, or null if the exchange doesn't list
// that ticker. Patterns confirmed by querying /v1/future-markets for BTC.
const SYMBOL_FORMATTERS = {
  // 8h funding, USDT perps — straightforward
  binance: (base) => `${base}USDT_PERP.A`,
  bybit:   (base) => `${base}USDT.6`,            // note: no _PERP segment
  okx:     (base) => `${base}USDT_PERP.3`,
  bitmex:  (base) => `${base}USDT_PERP.0`,
  htx:     (base) => `${base}USDT_PERP.4`,
  aster:   (base) => `${base}USDT.S`,            // same shape as Bybit
  woox:    (base) => `PERP_${base}_USDT.W`,      // unique pattern
  // USD perps (no USDT) — slightly different funding cycles
  dydx:    (base) => `${base}-USD.8`,
  kraken:  (base) => `pf_${base === "BTC" ? "xbt" : base.toLowerCase()}usd.K`,
  phemex:  (base) => `${base}USD.7`,
};

// ─── Per-exchange funding-cycle metadata ────────────────────────
// Tells the annualization formula how many funding payments happen
// per day. Coinalyze reports the rate PER NATIVE INTERVAL (verified:
// pf_xbtusd.K matched Kraken's own per-hour relative rate exactly).
// Most CEX USDT perps run 8h (3 per day). Exceptions:
//   - dYdX v4: 1h cycles (24/day)
//   - Kraken Futures: 1h relative funding (24/day) — verified against
//     futures.kraken.com /tickers: fundingRate/markPrice == Coinalyze
//     value to 2 decimal places, both per hour.
const PERIODS_PER_DAY = {
  binance: 3, bybit: 3, okx: 3, bitmex: 3, htx: 3,
  aster: 3, woox: 3, phemex: 3,
  dydx: 24, kraken: 24,
};

// ─── Per-exchange ticker normalisation ──────────────────────────
// Most exchanges retired MATIC for POL and scale meme coins by 1000x.
// Some exchanges may not have done this — easiest to apply uniformly
// since missing symbols just drop out of the response.
const SCALED_1000_BASES = new Set(["PEPE", "SHIB", "BONK", "FLOKI"]);
function normaliseBase(ticker) {
  let base = ticker === "MATIC" ? "POL" : ticker;
  if (SCALED_1000_BASES.has(base)) base = `1000${base}`;
  return base;
}

function coinalyzeSymbol(exchange, ticker) {
  const fmt = SYMBOL_FORMATTERS[exchange];
  if (!fmt) return null;
  return fmt(normaliseBase(ticker));
}

/**
 * Fetch funding rates from Coinalyze for many exchanges in as few
 * requests as possible. Returns the per-exchange/per-ticker shape the
 * rest of the codebase expects: { rate8h (decimal), periodsPerDay,
 * markPrice (0 — not exposed by /funding-rate) }.
 *
 * Chunks the symbol list under COINALYZE_MAX_SYMBOLS_PER_REQ so we
 * never hit the per-request symbol cap. The 5-min cache upstream keeps
 * total request volume well under any reasonable rate budget.
 */
async function fetchCoinalyzeFundingRates(exchanges, tickers) {
  if (!COINALYZE_API_KEY) return {};
  const symbolMap = {};   // symbol → { exchange, ticker }
  const symbols = [];
  for (const exchange of exchanges) {
    if (!SYMBOL_FORMATTERS[exchange]) continue;
    for (const t of tickers) {
      const sym = coinalyzeSymbol(exchange, t);
      if (!sym) continue;
      symbolMap[sym] = { exchange, ticker: t };
      symbols.push(sym);
    }
  }
  if (!symbols.length) return {};
  const out = {};
  for (const exchange of exchanges) out[exchange] = {};

  // Chunk to stay under the per-request symbol cap, then run chunks
  // sequentially (not in parallel — Coinalyze rate-limits aggressively
  // on burst, so back-to-back requests are safer than concurrent).
  const chunks = [];
  for (let i = 0; i < symbols.length; i += COINALYZE_MAX_SYMBOLS_PER_REQ) {
    chunks.push(symbols.slice(i, i + COINALYZE_MAX_SYMBOLS_PER_REQ));
  }

  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(COINALYZE_CHUNK_DELAY_MS);
    const chunk = chunks[i];
    try {
      const data = await fetchJSON(
        `${COINALYZE_BASE}/funding-rate?symbols=${chunk.join(",")}`,
        { headers: { api_key: COINALYZE_API_KEY } }
      );
      for (const row of data || []) {
        const map = symbolMap[row.symbol];
        if (!map) continue;
        const valuePercent = parseFloat(row.value);
        if (!Number.isFinite(valuePercent)) continue;
        out[map.exchange][map.ticker] = {
          rate8h: valuePercent / 100,
          periodsPerDay: PERIODS_PER_DAY[map.exchange] || 3,
          markPrice: 0,
        };
      }
    } catch (e) {
      console.error(`[Coinalyze] chunk ${i+1}/${chunks.length} error:`, e.message);
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
//  LITHUANIA PROXY — direct Binance + Bybit funding rates
// ═══════════════════════════════════════════════════════════════
// The Lithuania (EU) VPS can reach fapi.binance.com and api.bybit.com
// directly. Its funding-proxy service returns the exact per-exchange
// shape the rest of this file expects — { rate8h, periodsPerDay,
// markPrice } keyed by ticker — from bulk native endpoints in <1s,
// versus Coinalyze's ~16-24s (8s-per-chunk stagger). Coinalyze remains
// the fallback for these two if the proxy is unreachable, and still
// serves the other seven reference venues.
async function fetchLithuaniaFundingRates(tickers) {
  if (!LT_PROXY_URL || !LT_PROXY_SECRET) return null;
  try {
    const data = await fetchJSON(
      `${LT_PROXY_URL}/funding?tickers=${tickers.join(",")}`,
      { headers: { authorization: `Bearer ${LT_PROXY_SECRET}` } }
    );
    if (data?.errors?.length) {
      console.error("[LT proxy] partial errors:", data.errors.join("; "));
    }
    // Only treat as usable if at least one venue returned data.
    const binN = Object.keys(data?.binance || {}).length;
    const bybN = Object.keys(data?.bybit || {}).length;
    if (binN === 0 && bybN === 0) return null;
    return { binance: data.binance || {}, bybit: data.bybit || {} };
  } catch (e) {
    console.error("[LT proxy] fetch failed, falling back to Coinalyze:", e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXCHANGE RATE SOURCES (CEX + DEX)
// ═══════════════════════════════════════════════════════════════

// Canonical tickers = Variational's own listing names. MATIC was renamed
// to POL and PEPE trades as the scaled 1000PEPE on Variational; other venues
// disagree on the meme-coin scale name (HL: kPEPE, OKX/Gate/Bitget: PEPE),
// resolved per-venue in venueBase(). Funding RATE % is scale-invariant, so
// 1000PEPE ↔ PEPE ↔ kPEPE is a valid rate comparison.
const TICKERS = ["BTC", "ETH", "SOL", "DOGE", "AVAX", "ARB", "LINK", "OP", "WIF", "1000PEPE", "POL", "SUI", "HYPE"];

// Canonical ticker → venue-specific base name, for the few that differ.
function venueBase(ticker, venue) {
  if (ticker === "1000PEPE") {
    if (venue === "hyperliquid") return "kPEPE";
    if (venue === "okx" || venue === "gate" || venue === "bitget") return "PEPE";
    return "1000PEPE"; // binance/bybit/coinalyze use 1000PEPE
  }
  return ticker;
}

// edgeX contract ID mapping
const EDGEX_CONTRACTS = {
  BTC: "10000001", ETH: "10000002", SOL: "10000003", AVAX: "10000007",
  POL: "10000008", DOGE: "10000010", "1000PEPE": "10000011", SUI: "10000014",
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
      // edgeX fundingRate is a DECIMAL per 4h interval (verified: BTC reads
      // exactly 0.000050 = the textbook 4h neutral → 10.95%/yr).
      // Skip dead listings: edgeX keeps delisted/empty markets in the API
      // with $0 volume and a pinned garbage funding rate (ARB sat at
      // 0.359%/4h = 786%/yr with zero OI). An untradeable market is not
      // an arb opportunity.
      const volume24h = parseFloat(item.value) || 0;
      if (volume24h < 10_000) return;
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
        volume24h,
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
      const hlName = venueBase(ticker, "hyperliquid");
      const idx = universe.findIndex((u) => u.name === hlName);
      if (idx === -1 || !assetCtxs?.[idx]) continue;
      const ctx = assetCtxs[idx];
      if (!results[ticker]) results[ticker] = {};
      results[ticker].hyperliquid = {
        rate8h: parseFloat(ctx.funding) || 0,
        // HL pays funding EVERY HOUR and assetCtxs.funding is the hourly
        // rate (verified by magnitude: BTC ~-7e-6/h ≈ -6%/yr, matching
        // market levels; treating it as 8h understates HL by 8x).
        periodsPerDay: 24,
        markPrice: parseFloat(ctx.markPx) || 0,
        volume24h: parseFloat(ctx.dayNtlVlm) || 0,
      };
    }
  } catch (e) {
    console.error("Hyperliquid fetch error:", e.message);
  }

  // ── Binance + Bybit (Lithuania proxy) ∥ 7 venues (Coinalyze) ──
  // The EU VPS reaches fapi.binance.com / api.bybit.com directly and
  // returns both in <1s. Coinalyze aggregates the other seven reference
  // venues under one API. Run both fetches in parallel so the fast proxy
  // adds no latency to the (slower, chunk-staggered) Coinalyze path.
  const COINALYZE_EXCHANGES = [
    "bitmex", "htx",                   // major CEX, USDT perps
    "aster", "woox",                   // newer / quirkier USDT perps
    "dydx", "kraken", "phemex",        // USD perps (different funding cycle)
  ];
  const [ltRates, coinalyzeRates] = await Promise.all([
    fetchLithuaniaFundingRates(TICKERS),
    fetchCoinalyzeFundingRates(COINALYZE_EXCHANGES, TICKERS),
  ]);

  const ltCovered = new Set();
  if (ltRates) {
    for (const exchange of ["binance", "bybit"]) {
      for (const [ticker, row] of Object.entries(ltRates[exchange] || {})) {
        if (!results[ticker]) results[ticker] = {};
        results[ticker][exchange] = row;
      }
      if (Object.keys(ltRates[exchange] || {}).length > 0) ltCovered.add(exchange);
    }
  }

  for (const exchange of COINALYZE_EXCHANGES) {
    for (const [ticker, row] of Object.entries(coinalyzeRates[exchange] || {})) {
      if (!results[ticker]) results[ticker] = {};
      results[ticker][exchange] = row;
    }
  }

  // Fallback: if the Lithuania proxy was down, Binance/Bybit would be
  // missing entirely — pull them from Coinalyze instead so the two most
  // important reference venues never silently vanish from the table.
  const missing = ["binance", "bybit"].filter((e) => !ltCovered.has(e));
  if (missing.length) {
    console.error(`[LT proxy] uncovered ${missing.join(",")} — using Coinalyze fallback`);
    const fb = await fetchCoinalyzeFundingRates(missing, TICKERS);
    for (const exchange of missing) {
      for (const [ticker, row] of Object.entries(fb[exchange] || {})) {
        if (!results[ticker]) results[ticker] = {};
        results[ticker][exchange] = row;
      }
    }
  }

  // ── Bitget (CEX) — bulk ──
  try {
    const data = await fetchJSON("https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES");
    for (const ticker of TICKERS) {
      const symbol = `${venueBase(ticker, "bitget")}USDT`;
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

  // ── OKX (CEX) — per ticker, fetched in parallel ──
  await Promise.all(TICKERS.map(async (ticker) => {
    try {
      const instId = `${venueBase(ticker, "okx")}-USDT-SWAP`;
      const data = await fetchJSON(`https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`);
      const item = data?.data?.[0];
      if (!item) return;
      if (!results[ticker]) results[ticker] = {};
      results[ticker].okx = {
        rate8h: parseFloat(item.fundingRate) || 0,
        periodsPerDay: 3,
      };
    } catch (_e) { /* skip */ }
  }));

  // ── Gate.io (CEX) — per ticker, fetched in parallel ──
  await Promise.all(TICKERS.map(async (ticker) => {
    try {
      const contract = `${venueBase(ticker, "gate")}_USDT`;
      const data = await fetchJSON(`https://api.gateio.ws/api/v4/futures/usdt/contracts/${contract}`);
      if (!data?.funding_rate) return;
      if (!results[ticker]) results[ticker] = {};
      results[ticker]["gate.io"] = {
        rate8h: parseFloat(data.funding_rate) || 0,
        periodsPerDay: 3,
        markPrice: parseFloat(data.mark_price) || 0,
      };
    } catch (_e) { /* skip */ }
  }));

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

    // Per-exchange annualized rates — exposed so the frontend can let
    // users hide/show individual venues and recompute the best spread
    // among the ones they keep visible.
    const exchanges = {};
    for (const [exchange, data] of Object.entries(tickerExchanges)) {
      const exAnnual = data.rate8h * data.periodsPerDay * 365 * 100;
      exchanges[exchange] = Math.round(exAnnual * 100) / 100;
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
      exchanges,
    });
  }

  opportunities.sort((a, b) => b.spread_annual - a.spread_annual);
  return opportunities;
}

// ═══════════════════════════════════════════════════════════════
//  TRADFI / RWA FUNDING — Variational vs Hyperliquid HIP-3 (xyz)
// ═══════════════════════════════════════════════════════════════
// Stocks, ETFs, indices, commodities and FX trade as perps on both
// Variational (native RWA markets) and Hyperliquid's HIP-3 builder dex
// "xyz". This is a distinct comparison from the crypto one: CEXes don't
// list these, so it's a two-venue (Variational vs HL-HIP3) funding view.
// Match is by UNDERLYING — a few names differ between venues (below).
const TRADFI_ALIAS = {
  SP500: "US500", GOLD: "XAU", SILVER: "XAG", BRENTOIL: "BZ", NATGAS: "NG",
};
const TRADFI_MIN_VOL = 50000; // both sides must clear this 24h volume

function tradfiCategory(ticker) {
  const t = ticker.toUpperCase();
  if (["XAU", "XAG", "BZ", "CL", "COPPER", "NG", "PLATINUM", "PALLADIUM"].includes(t)) return "Commodity";
  if (["US500", "EWY", "EWJ", "EWZ", "EWT", "QQQ", "SOXL", "SMH", "XLE", "JP225", "KR200", "SPY", "DIA"].includes(t)) return "ETF / Index";
  if (["JPY", "EUR", "GBP", "NOK", "KRW"].includes(t)) return "FX";
  if (["SPCX", "OPENAI", "ANTHROPIC"].includes(t)) return "Pre-IPO / Space";
  return "Stock";
}

// Hyperliquid HIP-3 "xyz" funding — hourly rate, same cadence as HL core.
async function fetchHyperliquidHip3Rates() {
  const [meta, ctxs] = await fetchJSON("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs", dex: "xyz" }),
  });
  const out = {};
  const uni = meta?.universe || [];
  for (let i = 0; i < uni.length; i++) {
    const name = (uni[i].name || "").replace(/^xyz:/, "").toUpperCase();
    const ctx = ctxs?.[i];
    if (!name || !ctx) continue;
    out[name] = {
      annualRate: (parseFloat(ctx.funding) || 0) * 24 * 365 * 100, // hourly → %/yr
      markPrice: parseFloat(ctx.markPx) || 0,
      volume24h: parseFloat(ctx.dayNtlVlm) || 0,
    };
  }
  return out;
}

async function buildTradfiOpportunities() {
  const [varData, hlRates] = await Promise.all([
    fetchVariationalRates(),
    fetchHyperliquidHip3Rates(),
  ]);

  const opps = [];
  for (const [hlName, hl] of Object.entries(hlRates)) {
    const vtk = TRADFI_ALIAS[hlName] || hlName;
    const vr = varData.rates[vtk];
    if (!vr) continue;
    if (hl.volume24h < TRADFI_MIN_VOL || vr.volume24h < TRADFI_MIN_VOL) continue;

    const varAnnual = vr.annualRate;
    const hlAnnual = hl.annualRate;
    const spread = Math.abs(varAnnual - hlAnnual);
    const daily10k = (spread / 365 / 100) * 10000;

    opps.push({
      ticker: vtk,
      hl_market: hlName,
      category: tradfiCategory(vtk),
      var_rate_annual: Math.round(varAnnual * 100) / 100,
      hl_rate_annual: Math.round(hlAnnual * 100) / 100,
      spread_annual: Math.round(spread * 100) / 100,
      // Collect the side paying more funding: short the higher-funding venue,
      // long the lower one (net-delta-neutral on the underlying).
      direction: varAnnual < hlAnnual ? "long_var_short_hl" : "short_var_long_hl",
      daily_pnl_10k: Math.round(daily10k * 100) / 100,
      daily_pnl_50k: Math.round(daily10k * 5 * 100) / 100,
      daily_pnl_100k: Math.round(daily10k * 10 * 100) / 100,
      var_mark_price: vr.markPrice,
      var_volume_24h: Math.round(vr.volume24h),
      hl_volume_24h: Math.round(hl.volume24h),
    });
  }

  opps.sort((a, b) => b.spread_annual - a.spread_annual);
  return opps;
}

// ─── /api/rates/opportunities ───────────────────────────────────
app.get("/api/rates/opportunities", cached("rates_opp", 5 * 60 * 1000, async () => {
  const opportunities = await buildOpportunities();
  return { opportunities };
}));

// ─── /api/rates/tradfi ──────────────────────────────────────────
// Variational vs Hyperliquid HIP-3 funding for stocks/ETFs/commodities.
app.get("/api/rates/tradfi", cached("rates_tradfi", 5 * 60 * 1000, async () => {
  const opportunities = await buildTradfiOpportunities();
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
//  PRE-IPO CROSS-VENUE PRICES — OPENAI / ANTHROPIC
// ═══════════════════════════════════════════════════════════════
// SpaceX has IPO'd and now trades as a standard SPCX stock perp, so it
// is no longer part of the pre-IPO set — only still-private names remain.
// Pulls marks for the flagship pre-IPO perps from every venue
// with a public API reachable from this VPS:
//   - Variational (mark_price), HL xyz sub-dex (markPx + oraclePx),
//     Lighter (last trade), OKX (markPx), Gate.io (mark + index).
// "Oracle" rows: pre-IPO contracts have no exchange-traded underlying;
// each venue's oracle aggregates private-market marks (Caplight/Forge-
// style secondaries). Hyperliquid exposes its oracle directly
// (oraclePx); Gate exposes its index_price. Those are the closest
// public windows into the off-chain reference price.

const PRE_IPO_ASSETS = ["OPENAI", "ANTHROPIC"];

async function buildPreIpoPrices() {
  const assets = {};
  for (const a of PRE_IPO_ASSETS) {
    assets[a] = { venues: [], oracles: [] };
  }
  const push = (asset, venue, price, extra = {}) => {
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p <= 0) return;
    assets[asset].venues.push({ venue, price: p, ...extra });
  };

  const tasks = [
    // Variational
    (async () => {
      const d = await fetchJSON(VARIATIONAL_API);
      for (const l of d.listings || []) {
        const t = l.ticker.toUpperCase();
        if (PRE_IPO_ASSETS.includes(t)) {
          push(t, "variational", l.mark_price, {
            kind: "mark",
            vol24h: parseFloat(l.volume_24h) || 0,
          });
        }
      }
    })(),
    // Hyperliquid xyz sub-dex (also exposes its oracle)
    (async () => {
      const [meta, ctxs] = await fetchJSON("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs", dex: "xyz" }),
      });
      const names = (meta?.universe || []).map((u) => u.name);
      for (const a of PRE_IPO_ASSETS) {
        const i = names.indexOf(`xyz:${a}`);
        if (i === -1 || !ctxs?.[i]) continue;
        push(a, "hyperliquid", ctxs[i].markPx, {
          kind: "mark",
          vol24h: parseFloat(ctxs[i].dayNtlVlm) || 0,
        });
        const op = parseFloat(ctxs[i].oraclePx);
        if (Number.isFinite(op) && op > 0) {
          assets[a].oracles.push({ source: "hyperliquid-oracle", price: op });
        }
      }
    })(),
    // Lighter (last trade — no mark exposed on this endpoint)
    (async () => {
      const d = await fetchJSON(
        "https://mainnet.zklighter.elliot.ai/api/v1/exchangeStats"
      );
      for (const s of d?.order_book_stats || []) {
        const sym = s.symbol.toUpperCase();
        if (PRE_IPO_ASSETS.includes(sym)) {
          push(sym, "lighter", s.last_trade_price, {
            kind: "last",
            vol24h: parseFloat(s.daily_quote_token_volume) || 0,
          });
        }
      }
    })(),
    // OKX
    ...PRE_IPO_ASSETS.map((a) => (async () => {
      const d = await fetchJSON(
        `https://www.okx.com/api/v5/public/mark-price?instId=${a}-USDT-SWAP`
      );
      push(a, "okx", d?.data?.[0]?.markPx, { kind: "mark" });
    })()),
    // Gate.io (mark + index — Gate's index doubles as an oracle view)
    ...PRE_IPO_ASSETS.map((a) => (async () => {
      const d = await fetchJSON(
        `https://api.gateio.ws/api/v4/futures/usdt/contracts/${a}_USDT`
      );
      push(a, "gate.io", d?.mark_price, { kind: "mark" });
      const ip = parseFloat(d?.index_price);
      if (Number.isFinite(ip) && ip > 0) {
        assets[a].oracles.push({ source: "gate-index", price: ip });
      }
    })()),
  ];
  await Promise.allSettled(tasks);

  // Median + per-venue deviation
  for (const a of PRE_IPO_ASSETS) {
    const prices = assets[a].venues.map((v) => v.price).sort((x, y) => x - y);
    const n = prices.length;
    const median = n
      ? n % 2
        ? prices[(n - 1) / 2]
        : (prices[n / 2 - 1] + prices[n / 2]) / 2
      : null;
    assets[a].median = median;
    if (median) {
      for (const v of assets[a].venues) {
        v.diff_pct = Math.round(((v.price - median) / median) * 10000) / 100;
      }
      for (const o of assets[a].oracles) {
        o.diff_pct = Math.round(((o.price - median) / median) * 10000) / 100;
      }
    }
    assets[a].venues.sort((x, y) => x.price - y.price);
  }
  return { assets, updated_at: new Date().toISOString() };
}

app.get("/api/preipo/prices", cached("preipo_prices", 60 * 1000, buildPreIpoPrices));

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
  console.log(
    "Data sources:",
    "Variational, edgeX, Hyperliquid (direct);",
    "Bitget, OKX, Gate.io (direct);",
    "Binance, Bybit (Lithuania proxy, Coinalyze fallback);",
    "BitMEX, HTX, Aster, WOO X, dYdX, Kraken, Phemex (Coinalyze)"
  );
  setTimeout(async () => {
    try {
      await buildOpportunities();
      console.log("Rates cache warmed");
    } catch (e) {
      console.error("Rates warm-up failed:", e.message);
    }
  }, 1000);
});
