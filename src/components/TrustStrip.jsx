/**
 * TrustStrip — credibility band shown above the Footer on every theme.
 *
 * Surfaces the strongest trust signals that the marketing copy doesn't
 * naturally bake in: backers, audit firms, bug-bounty program, custody
 * provider, and the founders' pedigree. Sourced from docs.variational.io.
 *
 * Design philosophy:
 *  - One horizontal band, two rows (backers + security).
 *  - Theme-aware so it blends into bloomberg/neon/terminal aesthetics.
 *  - All claims are linked to source-of-truth (Fortune, docs, ImmuneFi,
 *    Arbiscan) so anyone can verify in one click.
 */
const FOUNDERS = [
  { name: "Lucas Schuermann", handle: "variational_lvs" },
  { name: "Edward Yu", handle: "mr_plumpkin" },
];

const BACKERS = [
  { name: "Dragonfly Capital", role: "lead" },
  { name: "Bain Capital Crypto" },
  { name: "Coinbase Ventures" },
];

const SECURITY_ITEMS = [
  {
    label: "Spearbit audit",
    href: "https://docs.variational.io/technical-documentation/audits",
    title: "Spearbit audit completed March 2025 — PDF on docs.variational.io",
  },
  {
    label: "Zellic audit",
    href: "https://docs.variational.io/technical-documentation/audits",
    title: "Zellic audit completed December 2024 — PDF on docs.variational.io",
  },
  {
    label: "ImmuneFi bug bounty",
    href: "https://immunefi.com/bug-bounty/variational/information/",
    title: "Active bug bounty program on ImmuneFi",
  },
  {
    label: "Fireblocks custody",
    href: "https://www.fireblocks.com/",
    title: "Fireblocks handles contract deployment + oracle signing",
  },
  {
    label: "Treasury (Arbiscan)",
    href: "https://arbiscan.io/address/0x5e91b40467fb8902c46a7b6cb90482363188d645",
    title: "On-chain protocol treasury — 20% of OLP spread revenue routed here",
  },
];

const SERIES_A_HREF =
  "https://fortune.com/2026/05/20/variational-raises-50-million-series-a/";

export default function TrustStrip({ theme, fonts, compact = false }) {
  const t = theme;

  const wrap = {
    width: "100%",
    padding: compact ? "20px 16px" : "28px 24px",
    borderTop: `1px solid ${t.muted}22`,
    borderBottom: `1px solid ${t.muted}22`,
    background: `${t.accent}06`,
    fontFamily: fonts.body,
    color: t.text,
  };

  const inner = {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };

  const row = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    fontSize: compact ? "0.72rem" : "0.78rem",
    lineHeight: 1.5,
  };

  const label = {
    fontFamily: fonts.heading || fonts.body,
    fontWeight: 700,
    fontSize: compact ? "0.62rem" : "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: t.muted,
    marginRight: 4,
  };

  const linkBase = {
    color: t.accent,
    textDecoration: "none",
    fontWeight: 600,
    borderBottom: `1px dotted ${t.accent}66`,
    transition: "color 0.15s, border-color 0.15s",
  };

  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    border: `1px solid ${t.accent}33`,
    borderRadius: 999,
    background: `${t.accent}08`,
    fontSize: compact ? "0.7rem" : "0.74rem",
    fontWeight: 500,
    color: `${t.text}d0`,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "border-color 0.15s, background 0.15s",
  };

  const dot = (color) => ({
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  });

  const sep = {
    color: `${t.muted}66`,
    fontSize: "0.75em",
    margin: "0 2px",
  };

  return (
    <section aria-label="Trust signals" style={wrap}>
      <div style={inner}>
        {/* Row 1: $50M Series A backers */}
        <div style={row}>
          <span style={label}>Backers</span>
          <a
            href={SERIES_A_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkBase, fontFamily: fonts.mono || fonts.body }}
            title="Fortune: Variational raises $50M Series A (May 20, 2026)"
            onMouseEnter={(e) => { e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.accent; }}
          >
            $50M Series A
          </a>
          <span style={{ color: `${t.text}99` }}>led by</span>
          {BACKERS.map((b, i) => (
            <span key={b.name} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={dot(b.role === "lead" ? t.accent : `${t.muted}88`)} />
              <strong style={{ fontWeight: 600, color: t.text }}>{b.name}</strong>
              {i < BACKERS.length - 1 && <span style={sep}>·</span>}
            </span>
          ))}
        </div>

        {/* Row 2: Security + custody */}
        <div style={row}>
          <span style={label}>Security</span>
          {SECURITY_ITEMS.map((item, i) => (
            <span key={item.label} style={{ display: "inline-flex", alignItems: "center" }}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.title}
                style={pill}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.background = `${t.accent}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${t.accent}33`;
                  e.currentTarget.style.background = `${t.accent}08`;
                }}
              >
                {item.label}
              </a>
              {i < SECURITY_ITEMS.length - 1 && <span style={{ width: 4 }} />}
            </span>
          ))}
        </div>

        {/* Row 3: Founder credentials */}
        <div style={{ ...row, fontSize: compact ? "0.7rem" : "0.74rem", color: `${t.text}aa` }}>
          <span style={label}>Built by</span>
          <span>
            Ex-{" "}
            <strong style={{ color: t.text, fontWeight: 600 }}>Genesis Trading</strong>{" "}
            VPs (processed hundreds of billions in volume) —{" "}
            {FOUNDERS.map((f, i) => (
              <span key={f.handle}>
                <a
                  href={`https://x.com/${f.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkBase}
                  onMouseEnter={(e) => { e.currentTarget.style.color = t.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = t.accent; }}
                >
                  {f.name}
                </a>
                {i < FOUNDERS.length - 1 ? " & " : ""}
              </span>
            ))}
            . Bootstrapped $10M from trading profits before raising VC.
          </span>
        </div>
      </div>
    </section>
  );
}
