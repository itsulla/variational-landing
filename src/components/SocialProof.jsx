/**
 * Social proof / trust signal section for landing themes.
 * Shows key trust indicators that make Variational more convincing.
 */
export default function SocialProof({ theme, fonts }) {
  const SIGNALS = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "$50M Series A",
      desc: "Led by Dragonfly Capital — Bain Capital Crypto & Coinbase Ventures participated (May 2026)",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Live since 2024",
      desc: "Battle-tested on Arbitrum mainnet",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Growing community",
      desc: "Active traders earning daily points",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      ),
      title: "450+ markets",
      desc: "Crypto perps + RWAs (gold, silver, copper, oil) — TradFi coming",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}
    >
      {SIGNALS.map((s) => (
        <div
          key={s.title}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "16px",
            borderRadius: 10,
            border: `1px solid ${theme.muted}18`,
            background: `${theme.accent}05`,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
          <div>
            <div
              style={{
                fontFamily: fonts.heading || fonts.body,
                fontSize: "0.88rem",
                fontWeight: 700,
                color: theme.text,
                marginBottom: 2,
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: "0.78rem",
                color: theme.muted,
                lineHeight: 1.4,
              }}
            >
              {s.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
