import { useState, useCallback } from "react";
import { RATES_API_BASE } from "../config.js";

/**
 * Click-to-copy referral code with toast feedback.
 * Accepts theme tokens to style itself contextually.
 *
 * Two pool-aware behaviours (state injected by main.jsx bootstrap):
 *  - every copy fires a beacon to /api/ref/track so the server can
 *    count copies per code (leading indicator for manual slot
 *    reconciliation against the Variational dashboard);
 *  - when the pool is exhausted, renders a waitlist capture instead
 *    of a dead code, so paid traffic is never wasted.
 */
export default function CopyCode({ code, theme, fonts, style = {} }) {
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);

  const exhausted = Boolean(window.__REF_POOL__?.pool_exhausted);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    /* Fire-and-forget copy tracking; sendBeacon survives navigation. */
    try {
      const payload = new Blob([JSON.stringify({ code })], {
        type: "application/json",
      });
      navigator.sendBeacon(`${RATES_API_BASE}/api/ref/track`, payload);
    } catch (_e) { /* tracking is best-effort */ }
  }, [code]);

  const submitWaitlist = useCallback(
    (e) => {
      e.preventDefault();
      const value = contact.trim();
      if (value.length < 5) return;
      fetch(`${RATES_API_BASE}/api/ref/waitlist`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contact: value }),
      }).catch(() => {});
      setWaitlisted(true);
    },
    [contact]
  );

  /* ── Waitlist mode: all referral slots taken ── */
  if (exhausted) {
    return (
      <div style={{ display: "inline-block", maxWidth: 420, ...style }}>
        <div
          style={{
            fontFamily: fonts?.body || "system-ui",
            fontSize: "0.85rem",
            color: theme.text || theme.accent,
            lineHeight: 1.5,
            marginBottom: 10,
          }}
        >
          All current access codes are claimed. New slots unlock as referred
          volume grows — leave an email or Telegram handle and we'll send you
          the next code.
        </div>
        {waitlisted ? (
          <div
            style={{
              fontFamily: fonts?.mono || "monospace",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: theme.accent,
              padding: "12px 18px",
              border: `1px solid ${theme.accent}44`,
              borderRadius: 8,
              background: `${theme.accent}10`,
            }}
          >
            ✓ You're on the list — we'll reach out when a slot opens.
          </div>
        ) : (
          <form onSubmit={submitWaitlist} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email or @telegram"
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 8,
                border: `1px solid ${theme.accent}33`,
                background: "transparent",
                color: theme.text || "#fff",
                fontFamily: fonts?.body || "system-ui",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "11px 18px",
                borderRadius: 8,
                border: "none",
                background: theme.accent,
                color: theme.bg || "#000",
                fontFamily: fonts?.body || "system-ui",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Notify me
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <button
        onClick={handleCopy}
        style={{
          fontFamily: fonts?.mono || fonts?.heading || "monospace",
          fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
          fontWeight: 700,
          color: theme.accent,
          background: `${theme.accent}12`,
          border: `1px solid ${theme.accent}33`,
          borderRadius: 8,
          padding: "14px 24px",
          textAlign: "center",
          letterSpacing: "0.08em",
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${theme.accent}22`;
          e.currentTarget.style.borderColor = `${theme.accent}66`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${theme.accent}12`;
          e.currentTarget.style.borderColor = `${theme.accent}33`;
        }}
        title="Click to copy"
      >
        {code}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, opacity: 0.7 }}
        >
          {copied ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>
      </button>

      {/* Toast */}
      <div
        style={{
          position: "absolute",
          top: -36,
          left: "50%",
          transform: `translateX(-50%) translateY(${copied ? "0" : "8px"})`,
          opacity: copied ? 1 : 0,
          background: theme.accent,
          color: theme.bg || "#000",
          fontFamily: fonts?.body || "system-ui",
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "4px 12px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          transition: "all 0.2s ease",
          zIndex: 10,
        }}
      >
        Copied!
      </div>
    </div>
  );
}
