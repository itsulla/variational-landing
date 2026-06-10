import { REFERRAL_CODE } from "../config.js";

/**
 * OnboardingBanner — compact 3-step "how do I actually get money in"
 * strip for newcomers. The key insight it communicates: no bridge
 * needed — every major CEX withdraws USDC directly on the Arbitrum
 * network, and Variational deposits are USDC-on-Arbitrum.
 */
const STEPS = [
  {
    n: 1,
    title: "Buy USDC on any major exchange",
    detail: "Coinbase, Binance, Bybit, OKX, Kraken — wherever you already have an account.",
  },
  {
    n: 2,
    title: "Withdraw USDC on the Arbitrum network",
    detail: "Pick “Arbitrum One” as the withdrawal network. No bridging needed — fees are typically under $1.",
  },
  {
    n: 3,
    title: "Deposit to Variational Omni",
    detail: `Connect a wallet at omni.variational.io with access code ${REFERRAL_CODE}, deposit USDC, trade everything from one account.`,
  },
];

export default function OnboardingBanner({ theme, fonts, compact = false }) {
  const t = theme;

  return (
    <section
      aria-label="Getting started"
      style={{
        width: "100%",
        padding: compact ? "20px 16px" : "26px 24px",
        background: `${t.accent}07`,
        border: `1px solid ${t.accent}26`,
        borderRadius: 12,
        fontFamily: fonts.body,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono || fonts.heading,
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: t.accent,
          marginBottom: 16,
        }}
      >
        New to on-chain trading? Funding takes ~10 minutes
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `${t.accent}18`,
                border: `1px solid ${t.accent}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.mono || fonts.heading,
                fontWeight: 700,
                fontSize: "0.8rem",
                color: t.accent,
              }}
            >
              {s.n}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: t.text,
                  marginBottom: 4,
                  lineHeight: 1.35,
                }}
              >
                {s.title}
                {i < STEPS.length - 1 && (
                  <span style={{ color: `${t.accent}88`, marginLeft: 8 }}>→</span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: t.muted,
                  lineHeight: 1.5,
                }}
              >
                {s.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
