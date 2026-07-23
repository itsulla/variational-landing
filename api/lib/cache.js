function resolveOption(option, data) {
  return typeof option === "function" ? option(data) : option;
}

function publicPayload(data, meta) {
  if (Array.isArray(data)) return { data, _meta: meta };
  return { ...data, _meta: meta };
}

function setFreshnessHeaders(res, meta) {
  res.set("X-Data-Generated-At", meta.generatedAt);
  res.set("X-Data-Age-Ms", meta.dataAgeMs);
  res.set("X-Data-Stale", meta.stale);
  res.set("X-Data-Degraded", meta.degraded);
  res.set("X-Data-Source", meta.source);
}

function makeMeta(entry, { nowMs, stale, degraded, source }) {
  return {
    generatedAt: new Date(entry.ts).toISOString(),
    dataAgeMs: Math.max(0, nowMs - entry.ts),
    stale: Boolean(stale),
    degraded: Boolean(degraded),
    source,
  };
}

/**
 * Express route wrapper with single-flight refreshes and a bounded stale window.
 * Data remains shape-compatible: metadata is added as `_meta`.
 */
export function createCachedRoute({
  key,
  ttlMs,
  maxStaleMs = ttlMs * 12,
  fetcher,
  source,
  degraded = false,
  cache,
  inflight,
  now = Date.now,
  logger = console,
}) {
  if (maxStaleMs < ttlMs) {
    throw new Error("maxStaleMs must be greater than or equal to ttlMs");
  }

  function respond(res, entry, stale, nowMs) {
    const meta = makeMeta(entry, {
      nowMs,
      stale,
      degraded: resolveOption(degraded, entry.data),
      source: resolveOption(source, entry.data),
    });
    setFreshnessHeaders(res, meta);
    return res.json(publicPayload(entry.data, meta));
  }

  function refresh(req) {
    if (!inflight[key]) {
      inflight[key] = Promise.resolve()
        .then(() => fetcher(req))
        .then((data) => {
          cache[key] = { data, ts: now() };
          return data;
        })
        .finally(() => {
          delete inflight[key];
        });
    }
    return inflight[key];
  }

  return async function cachedRoute(req, res) {
    const nowMs = now();
    const entry = cache[key];
    const ageMs = entry ? Math.max(0, nowMs - entry.ts) : Infinity;

    if (entry && ageMs <= ttlMs) {
      return respond(res, entry, false, nowMs);
    }

    if (entry && ageMs <= maxStaleMs) {
      refresh(req).catch((error) => {
        logger.warn?.(`[cache:${key}] background refresh failed: ${error.message}`);
      });
      return respond(res, entry, true, nowMs);
    }

    try {
      await refresh(req);
      return respond(res, cache[key], false, now());
    } catch (error) {
      logger.error?.(`[cache:${key}] refresh failed: ${error.message}`);
      return res.status(502).json({ error: error.message });
    }
  };
}
