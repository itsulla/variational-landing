import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

export function currentRefCode(pool) {
  return pool.codes.find(
    (entry) => entry.active && entry.signups < entry.maxSlots
  ) ?? null;
}

export function refStatus(pool) {
  const slotsRemaining = pool.codes
    .filter((entry) => entry.active)
    .reduce((sum, entry) => sum + Math.max(0, entry.maxSlots - entry.signups), 0);
  return {
    slots_remaining: slotsRemaining,
    pool_exhausted: slotsRemaining === 0,
  };
}

export function normalizeReferralCode(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z0-9]{6,32}$/.test(normalized) ? normalized : null;
}

export function validateWaitlistContact(value) {
  if (typeof value !== "string") return null;
  const contact = value.trim();
  if (contact.length > 254) return null;

  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) {
    return { contact: contact.toLowerCase(), kind: "email" };
  }
  if (/^@[A-Za-z0-9_]{5,32}$/.test(contact)) {
    return { contact, kind: "telegram" };
  }
  return null;
}

export function createRateLimiter({ windowMs, max, now = Date.now }) {
  const buckets = new Map();

  function consume(key) {
    const timestamp = now();
    const existing = buckets.get(key);
    const bucket = !existing || timestamp - existing.startedAt >= windowMs
      ? { startedAt: timestamp, count: 0 }
      : existing;
    bucket.count += 1;
    buckets.set(key, bucket);

    const remainingMs = Math.max(0, windowMs - (timestamp - bucket.startedAt));
    return {
      allowed: bucket.count <= max,
      retryAfterSec: Math.max(1, Math.ceil(remainingMs / 1_000)),
      remaining: Math.max(0, max - bucket.count),
    };
  }

  return { consume };
}

export async function atomicWriteJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(tempPath, path);
  } catch (error) {
    const { rm } = await import("node:fs/promises");
    await rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
}
