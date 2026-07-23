import { describe, expect, it } from "vitest";

import { liveStateFromPayload, fallbackLiveState } from "./liveData.js";

describe("live data state", () => {
  it("preserves server freshness metadata", () => {
    const state = liveStateFromPayload({
      opportunities: [{ ticker: "BTC" }],
      _meta: {
        generatedAt: "2026-07-23T03:00:00.000Z",
        dataAgeMs: 4_000,
        stale: true,
        degraded: false,
        source: "variational+venues",
      },
    });

    expect(state.status).toBe("stale");
    expect(state.data).toEqual({ opportunities: [{ ticker: "BTC" }] });
    expect(state.meta.source).toBe("variational+venues");
  });

  it("distinguishes degraded data from stale data", () => {
    const state = liveStateFromPayload({
      value: 1,
      _meta: { stale: false, degraded: true, source: "partial" },
    });
    expect(state.status).toBe("degraded");
  });

  it("marks local fallback fixtures explicitly", () => {
    const state = fallbackLiveState({ opportunities: [] }, "API unavailable");
    expect(state).toEqual({
      data: { opportunities: [] },
      status: "fallback",
      meta: null,
      error: "API unavailable",
    });
  });
});
