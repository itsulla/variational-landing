export let REFERRAL_CODE = "OMNIXOIXIBOD";
export let REFERRAL_LINK = "https://omni.variational.io/?ref=OMNIXOIXIBOD";

export const RATES_API_BASE =
  import.meta.env.VITE_RATES_API_BASE || "";

export const VARIATIONAL_LAUNCH_DATE = "2025-01-01";

export const DUNE_DASHBOARD_URL =
  "https://dune.com/entropy_advisors/variational-protocol";
export const DUNE_AIRDROP_SIM_URL =
  "https://dune.com/entropy_advisors/variational-airdrop-simulator";

/* Recent RWA / TradFi listings on Variational Omni.
 * Curated from @variational_io announcements (each ticker verified
 * against the live stats API before adding). Variational has been
 * listing roughly one new TradFi market per day since the May 20, 2026
 * Phase-1 launch. Newest first. Dates are used only for ordering — the
 * UI shows ticker/name/type, since some mid-window dates are
 * approximate (between announcement sweeps). */
export const RECENT_LISTINGS = [
  { ticker: "QQQ", name: "Invesco QQQ Trust", type: "ETF", date: "2026-06-28" },
  { ticker: "NVDA", name: "NVIDIA", type: "Stock", date: "2026-06-25" },
  { ticker: "META", name: "Meta Platforms", type: "Stock", date: "2026-06-25" },
  { ticker: "GOOGL", name: "Alphabet", type: "Stock", date: "2026-06-24" },
  { ticker: "MSFT", name: "Microsoft", type: "Stock", date: "2026-06-24" },
  { ticker: "HOOD", name: "Robinhood", type: "Stock", date: "2026-06-20" },
  { ticker: "COIN", name: "Coinbase", type: "Stock", date: "2026-06-20" },
  { ticker: "PLTR", name: "Palantir", type: "Stock", date: "2026-06-18" },
  { ticker: "AMD", name: "AMD", type: "Stock", date: "2026-06-18" },
  { ticker: "INTC", name: "Intel", type: "Stock", date: "2026-06-15" },
  { ticker: "QCOM", name: "Qualcomm", type: "Stock", date: "2026-06-09" },
  { ticker: "MU", name: "Micron", type: "Stock", date: "2026-06-09" },
  { ticker: "TSM", name: "Taiwan Semiconductor", type: "Stock", date: "2026-06-08" },
  { ticker: "EWY", name: "South Korea ETF", type: "ETF", date: "2026-06-08" },
  { ticker: "EWJ", name: "Japan ETF", type: "ETF", date: "2026-06-08" },
  { ticker: "OPENAI", name: "OpenAI", type: "Pre-IPO", date: "2026-06-01" },
  { ticker: "ANTHROPIC", name: "Anthropic", type: "Pre-IPO", date: "2026-06-01" },
  { ticker: "TSLA", name: "Tesla", type: "Stock", date: "2026-05-28" },
  { ticker: "SPCX", name: "SpaceX", type: "Pre-IPO", date: "2026-05-21" },
  { ticker: "XAU", name: "Gold", type: "Commodity", date: "2026-05-20" },
  { ticker: "XAG", name: "Silver", type: "Commodity", date: "2026-05-20" },
  { ticker: "COPPER", name: "Copper", type: "Commodity", date: "2026-05-20" },
  { ticker: "CL", name: "WTI Crude Oil", type: "Commodity", date: "2026-05-20" },
];

export function swapReferralCode(newCode) {
  REFERRAL_CODE = newCode;
  REFERRAL_LINK = `https://omni.variational.io/?ref=${newCode}`;
}

export const SERIES_A_ARTICLE_URL =
  "https://fortune.com/2026/05/20/variational-raises-50-million-series-a/";

export const MARKET_DATA = {
  variational: {
    name: "Variational",
    cumulativeVolume: "$260B+",
    openInterest: "$1B+",
    markets: "495+",
    raised: "$50M Series A (May 2026)",
    communityAllocation: "Up to ~50%",
    fdv: "Pre-TGE",
    tradingFees: "0.00% (permanent)",
    executionPrivacy: "Private RFQ (orders not public)",
    blockTradeSlippage: "Minimal (aggregated CEX/DEX/TradFi depth)",
    tradableMarkets: "495+ markets incl. pre-IPO (SpaceX, OpenAI, Anthropic), stocks, ETFs, commodities",
    executionEdge: "OLP captures the spread, not fees — passes tighter pricing to traders",
    architecture: "Private RFQ (Omni LP)",
    status: "Mainnet (private beta)",
  },
  hyperliquid: {
    name: "Hyperliquid",
    cumulativeVolume: "$4.0T",
    fdv: "~$29B",
    markets: "230 + 79 RWA",
    communityAllocation: "31%",
    raised: "$0 (self-funded)",
    tradingFees: "0.015% maker / 0.045% taker",
    executionPrivacy: "Fully public L4 order book",
    blockTradeSlippage: "High (sweeps the book)",
    tradableMarkets: "230 crypto + 79 on 'xyz' RWA sub-dex",
    executionEdge: "Deep on-chain liquidity + market-maker rebates; $1.8B+/day RWA sub-protocol",
    architecture: "On-chain CLOB (HyperBFT L1)",
    status: "Mainnet (live)",
  },
  lighter: {
    name: "Lighter",
    cumulativeVolume: "$1.5T",
    fdv: "~$1B",
    markets: "190 (incl. 49 RWA)",
    communityAllocation: "25%",
    raised: "$68M",
    tradingFees: "0.00% maker / 0.025% taker",
    executionPrivacy: "Public order book",
    blockTradeSlippage: "Moderate",
    tradableMarkets: "190 markets (incl. 49 RWA listings)",
    executionEdge: "zk-proven matching, low-latency CLOB",
    architecture: "zkRollup CLOB (Ethereum L2)",
    status: "Mainnet (live)",
  },
};

export const POINTS_DATA = {
  weeklyPoints: 150000,
  retroactivePoints: 3000000,
  estimatedTotalAtTGE: 9500000,
  programEndDate: "2026-09-30",
  programEndLabel: "Q3 2026",
};

export function getWeeksRemaining() {
  const now = new Date();
  const end = new Date(POINTS_DATA.programEndDate);
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}
