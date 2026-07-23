import { describe, expect, it } from "vitest";

import { buildHomepageStats } from "./marketStats.js";

describe("buildHomepageStats", () => {
  it("uses every live API value instead of hardcoded fallbacks", () => {
    expect(buildHomepageStats({
      cumVol: 276_828_801_496,
      vol24h: 907_551_509,
      markets: 514,
    })).toEqual([
      { prefix: "$", value: 277, suffix: "B+", label: "Cumulative Volume" },
      { prefix: "$", value: 908, suffix: "M+", label: "24h Volume" },
      { prefix: "", value: 514, suffix: "+", label: "Markets" },
      { prefix: "$", value: 50, suffix: "M", label: "Series A (May 2026)" },
    ]);
  });

  it("uses current documented fallbacks when the API is unavailable", () => {
    const stats = buildHomepageStats(null);
    expect(stats[0]).toMatchObject({ value: 260, suffix: "B+" });
    expect(stats[1]).toMatchObject({ value: 1, suffix: "B+" });
    expect(stats[2]).toMatchObject({ value: 495, suffix: "+" });
  });
});
