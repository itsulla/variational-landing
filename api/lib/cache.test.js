import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { createCachedRoute } from "./cache.js";

function createResponse() {
  return {
    body: null,
    headers: {},
    statusCode: 200,
    set(name, value) {
      this.headers[name] = String(value);
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe("createCachedRoute", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("serves fresh data with machine-readable freshness metadata", async () => {
    const now = Date.parse("2026-07-23T03:00:00.000Z");
    const cache = {
      rates: { data: { opportunities: ["BTC"] }, ts: now - 500 },
    };
    const fetcher = vi.fn();
    const handler = createCachedRoute({
      key: "rates",
      ttlMs: 1_000,
      maxStaleMs: 5_000,
      fetcher,
      source: "variational+venues",
      cache,
      inflight: {},
      now: () => now,
    });
    const res = createResponse();

    await handler({}, res);

    expect(fetcher).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      opportunities: ["BTC"],
      _meta: {
        generatedAt: "2026-07-23T02:59:59.500Z",
        dataAgeMs: 500,
        stale: false,
        degraded: false,
        source: "variational+venues",
      },
    });
    expect(res.headers["X-Data-Stale"]).toBe("false");
    expect(res.headers["X-Data-Age-Ms"]).toBe("500");
  });

  it("serves bounded stale data immediately while one refresh runs", async () => {
    const now = Date.parse("2026-07-23T03:00:00.000Z");
    const cache = { rates: { data: { value: "old" }, ts: now - 2_000 } };
    let resolveRefresh;
    const fetcher = vi.fn(() => new Promise((resolve) => { resolveRefresh = resolve; }));
    const inflight = {};
    const handler = createCachedRoute({
      key: "rates",
      ttlMs: 1_000,
      maxStaleMs: 5_000,
      fetcher,
      source: "test-source",
      cache,
      inflight,
      now: () => now,
    });
    const res = createResponse();

    await handler({}, res);

    expect(res.body.value).toBe("old");
    expect(res.body._meta.stale).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(inflight.rates).toBeTruthy();

    resolveRefresh({ value: "new" });
    await inflight.rates;
    expect(cache.rates.data).toEqual({ value: "new" });
  });

  it("does not serve data beyond the maximum stale age", async () => {
    const now = Date.parse("2026-07-23T03:00:00.000Z");
    const cache = { rates: { data: { value: "too-old" }, ts: now - 6_000 } };
    const fetcher = vi.fn().mockResolvedValue({ value: "fresh" });
    const handler = createCachedRoute({
      key: "rates",
      ttlMs: 1_000,
      maxStaleMs: 5_000,
      fetcher,
      source: "test-source",
      cache,
      inflight: {},
      now: () => now,
    });
    const res = createResponse();

    await handler({}, res);

    expect(res.body.value).toBe("fresh");
    expect(res.body._meta.stale).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns a 502 instead of presenting expired data as healthy", async () => {
    const now = Date.parse("2026-07-23T03:00:00.000Z");
    const cache = { rates: { data: { value: "too-old" }, ts: now - 60_000 } };
    const handler = createCachedRoute({
      key: "rates",
      ttlMs: 1_000,
      maxStaleMs: 5_000,
      fetcher: vi.fn().mockRejectedValue(new Error("upstream unavailable")),
      source: "test-source",
      cache,
      inflight: {},
      now: () => now,
    });
    const res = createResponse();

    await handler({}, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: "upstream unavailable" });
  });
});
