import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  atomicWriteJson,
  createRateLimiter,
  currentRefCode,
  normalizeReferralCode,
  refStatus,
  validateWaitlistContact,
} from "./referral.js";

describe("referral helpers", () => {
  it("selects the first active code with capacity and reports total capacity", () => {
    const pool = {
      codes: [
        { code: "FULLCODE", active: true, signups: 2, maxSlots: 2 },
        { code: "NEXTCODE", active: true, signups: 1, maxSlots: 3 },
        { code: "DISABLED", active: false, signups: 0, maxSlots: 10 },
      ],
    };

    expect(currentRefCode(pool)?.code).toBe("NEXTCODE");
    expect(refStatus(pool)).toEqual({ slots_remaining: 2, pool_exhausted: false });
  });

  it("accepts email or Telegram contacts and rejects arbitrary text", () => {
    expect(validateWaitlistContact("  USER@Example.COM ")).toEqual({
      contact: "user@example.com",
      kind: "email",
    });
    expect(validateWaitlistContact(" @Valid_Handle ")).toEqual({
      contact: "@Valid_Handle",
      kind: "telegram",
    });
    expect(validateWaitlistContact("not contact")).toBeNull();
    expect(validateWaitlistContact("a@b")).toBeNull();
  });

  it("normalizes only safe referral codes", () => {
    expect(normalizeReferralCode(" omni123abc ")).toBe("OMNI123ABC");
    expect(normalizeReferralCode("../../bad")).toBeNull();
    expect(normalizeReferralCode("short")).toBeNull();
  });

  it("limits repeated mutations and resets after the window", () => {
    let now = 1_000;
    const limiter = createRateLimiter({ windowMs: 10_000, max: 2, now: () => now });

    expect(limiter.consume("ip").allowed).toBe(true);
    expect(limiter.consume("ip").allowed).toBe(true);
    const denied = limiter.consume("ip");
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSec).toBe(10);

    now += 10_001;
    expect(limiter.consume("ip").allowed).toBe(true);
  });

  it("atomically replaces JSON without leaving a temporary file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "variational-ref-test-"));
    const file = join(dir, "pool.json");
    try {
      await atomicWriteJson(file, { codes: [{ code: "SAFE123" }] });
      expect(JSON.parse(await readFile(file, "utf8"))).toEqual({
        codes: [{ code: "SAFE123" }],
      });
      await expect(readFile(`${file}.tmp`, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
