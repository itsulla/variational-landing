export let REFERRAL_CODE = "OMNIXOIXIBOD";
export let REFERRAL_LINK = "https://omni.variational.io/?ref=OMNIXOIXIBOD";

export const RATES_API_BASE =
  import.meta.env.VITE_RATES_API_BASE || "";

export const VARIATIONAL_LAUNCH_DATE = "2025-01-01";

export function swapReferralCode(newCode) {
  REFERRAL_CODE = newCode;
  REFERRAL_LINK = `https://omni.variational.io/?ref=${newCode}`;
}

export const MARKET_DATA = {
  variational: {
    name: "Variational",
    cumulativeVolume: "$175B+",
    openInterest: "$700M+",
    markets: "~500",
    refunded: "$4M+",
    raised: "$11.8M",
    communityAllocation: "~10%",
    fdv: "Pre-TGE",
    tradingFees: "0.00% (permanent)",
    executionPrivacy: "Full stealth (private RFQ)",
    blockTradeSlippage: "Zero (deterministic pricing)",
    tradableMarkets: "~500 (crypto, RWAs, indices)",
    lossRefund: "Yes, $4M+ already refunded",
    architecture: "Private RFQ (Omni LP)",
  },
  hyperliquid: {
    name: "Hyperliquid",
    cumulativeVolume: "$4.0T",
    fdv: "~$29B",
    markets: "~130",
    communityAllocation: "31%",
    raised: "$0 (self-funded)",
    tradingFees: "0.025% base",
    executionPrivacy: "Fully public L4 order book",
    blockTradeSlippage: "High (sweeps the book)",
    tradableMarkets: "~130",
    lossRefund: "None",
    architecture: "On-chain CLOB (HyperBFT L1)",
  },
  lighter: {
    name: "Lighter",
    cumulativeVolume: "$1.5T",
    fdv: "~$1B",
    markets: "Limited pairs",
    communityAllocation: "25%",
    raised: "$68M",
    tradingFees: "0.00%",
    executionPrivacy: "Public order book",
    blockTradeSlippage: "Moderate",
    tradableMarkets: "Limited pairs",
    lossRefund: "None",
    architecture: "zkRollup CLOB (Ethereum L2)",
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
