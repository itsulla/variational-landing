function stripMeta(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const { _meta, ...data } = payload;
    if (Array.isArray(data.data) && Object.keys(data).length === 1) {
      return { data: data.data, meta: _meta ?? null };
    }
    return { data, meta: _meta ?? null };
  }
  return { data: payload, meta: null };
}

export function liveStateFromPayload(payload) {
  const { data, meta } = stripMeta(payload);
  let status = "live";
  if (meta?.stale) status = "stale";
  else if (meta?.degraded) status = "degraded";

  return { data, status, meta, error: null };
}

export function fallbackLiveState(data, error) {
  return {
    data,
    status: "fallback",
    meta: null,
    error: error instanceof Error ? error.message : String(error),
  };
}

export function formatDataAge(ageMs) {
  if (!Number.isFinite(ageMs) || ageMs < 0) return "unknown age";
  if (ageMs < 60_000) return `${Math.max(1, Math.round(ageMs / 1_000))}s old`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m old`;
  return `${Math.round(ageMs / 3_600_000)}h old`;
}
