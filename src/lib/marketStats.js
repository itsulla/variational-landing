const FALLBACK_STATS = {
  cumVol: 260_000_000_000,
  vol24h: 1_000_000_000,
  markets: 495,
};

export function formatVolume(value) {
  if (value >= 1e12) return { value: +(value / 1e12).toFixed(1), suffix: "T+" };
  if (value >= 1e9) return { value: +(value / 1e9).toFixed(0), suffix: "B+" };
  if (value >= 1e6) return { value: +(value / 1e6).toFixed(0), suffix: "M+" };
  return { value: Math.round(value), suffix: "+" };
}

export function buildHomepageStats(liveStats) {
  const values = liveStats ?? FALLBACK_STATS;
  const cumulative = formatVolume(values.cumVol ?? FALLBACK_STATS.cumVol);
  const daily = formatVolume(values.vol24h ?? FALLBACK_STATS.vol24h);
  const markets = Number.isFinite(values.markets)
    ? values.markets
    : FALLBACK_STATS.markets;

  return [
    { prefix: "$", ...cumulative, label: "Cumulative Volume" },
    { prefix: "$", ...daily, label: "24h Volume" },
    { prefix: "", value: markets, suffix: "+", label: "Markets" },
    { prefix: "$", value: 50, suffix: "M", label: "Series A (May 2026)" },
  ];
}
