import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";
import { REFERRAL_LINK, REFERRAL_CODE } from "../../config.js";

/* ─── Theme tokens (editorial, neutral) ──────────────────────────── */
const THEME = {
  bg: "#0a0e1a",
  bgAlt: "#0f1424",
  text: "#e8ecf4",
  textDim: "#cbd5e1",
  accent: "#60a5fa",
  accentDim: "#60a5fa55",
  muted: "#94a3b8",
  hairline: "#1e293b",
  callout: "#1a2238",
};

const FONTS = {
  heading: "'Outfit', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const PUBLISHED_AT = "2026-05-23T00:00:00Z";
const PUBLISHED_DISPLAY = "May 23, 2026";
const READ_TIME = "5 min read";

/* ─── Inline shared styles ───────────────────────────────────────── */
const pageWrap = {
  background: THEME.bg,
  color: THEME.text,
  fontFamily: FONTS.body,
  minHeight: "100vh",
};

const article = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "56px 24px 80px",
};

const eyebrow = {
  fontFamily: FONTS.mono,
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: THEME.accent,
  marginBottom: 16,
};

const h1 = {
  fontFamily: FONTS.heading,
  fontSize: "clamp(2rem, 4.5vw, 3rem)",
  fontWeight: 700,
  letterSpacing: "-0.015em",
  lineHeight: 1.15,
  color: THEME.text,
  margin: "0 0 16px",
};

const subtitle = {
  fontFamily: FONTS.body,
  fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
  lineHeight: 1.55,
  color: THEME.textDim,
  margin: "0 0 24px",
  fontWeight: 400,
};

const byline = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  fontFamily: FONTS.mono,
  fontSize: "0.74rem",
  color: THEME.muted,
  paddingBottom: 28,
  marginBottom: 40,
  borderBottom: `1px solid ${THEME.hairline}`,
};

const bylineDot = {
  width: 3,
  height: 3,
  borderRadius: "50%",
  background: THEME.muted,
};

const sectionH = {
  fontFamily: FONTS.heading,
  fontSize: "clamp(1.4rem, 2.6vw, 1.7rem)",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  lineHeight: 1.25,
  color: THEME.text,
  margin: "44px 0 16px",
};

const sectionH3 = {
  fontFamily: FONTS.heading,
  fontSize: "1.1rem",
  fontWeight: 600,
  color: THEME.text,
  margin: "28px 0 12px",
};

const p = {
  fontSize: "1.05rem",
  lineHeight: 1.72,
  color: THEME.textDim,
  margin: "0 0 18px",
};

const strong = { color: THEME.text, fontWeight: 600 };

const callout = {
  margin: "32px 0",
  padding: "20px 24px",
  background: THEME.callout,
  borderLeft: `3px solid ${THEME.accent}`,
  borderRadius: "0 6px 6px 0",
  fontSize: "1.02rem",
  lineHeight: 1.65,
  color: THEME.text,
  fontStyle: "italic",
};

const hr = {
  border: 0,
  borderTop: `1px solid ${THEME.hairline}`,
  margin: "48px 0",
};

const tagPill = {
  display: "inline-block",
  padding: "3px 10px",
  background: `${THEME.accent}15`,
  border: `1px solid ${THEME.accent}33`,
  borderRadius: 999,
  fontSize: "0.7rem",
  fontWeight: 500,
  color: THEME.accent,
  fontFamily: FONTS.mono,
  letterSpacing: "0.04em",
};

const ctaBox = {
  margin: "48px 0 0",
  padding: "28px 28px 26px",
  background: `linear-gradient(135deg, ${THEME.accent}12, ${THEME.bgAlt})`,
  border: `1px solid ${THEME.accent}33`,
  borderRadius: 10,
};

const ctaBtn = {
  display: "inline-block",
  marginTop: 14,
  padding: "11px 22px",
  background: THEME.accent,
  color: THEME.bg,
  fontFamily: FONTS.body,
  fontWeight: 700,
  fontSize: "0.92rem",
  borderRadius: 6,
  textDecoration: "none",
  transition: "opacity 0.15s, transform 0.1s",
};

/* ─── Inject Google Fonts once ───────────────────────────────────── */
function injectFonts() {
  const id = "insights-fonts";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

/* ═══════════════════════════════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════════════════════════════ */
export default function WhyPerpDexesCoexist() {
  useEffect(() => {
    injectFonts();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={pageWrap}>
      <article style={article}>
        {/* Back link */}
        <div style={{ marginBottom: 36 }}>
          <Link
            to="/insights"
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.78rem",
              color: THEME.muted,
              textDecoration: "none",
              borderBottom: `1px dotted ${THEME.muted}`,
            }}
          >
            ← All insights
          </Link>
        </div>

        {/* Header */}
        <header>
          <div style={eyebrow}>Analysis · Perp DEX Category</div>
          <h1 style={h1}>The Perp DEX Market Isn't Winner-Take-All</h1>
          <p style={subtitle}>
            Different architectures attract different traders. Here's why
            Hyperliquid, Lighter, and Variational each own a distinct slice of
            decentralized perpetuals — and why their growth is additive, not
            zero-sum.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Hyperliquid · Lighter · Variational</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          The default crypto-Twitter narrative for any product category is{" "}
          <em>"X is eating Y's market share."</em> It plays well on the
          timeline, but it's almost always wrong about exchanges. NYSE didn't
          kill NASDAQ. Coinbase didn't kill Kraken. Hyperliquid won't kill
          Lighter or Variational — and neither will succeed by trying to be a
          worse version of Hyperliquid.
        </p>
        <p style={p}>
          Here's why the three current leaders in decentralized perpetuals each
          own a distinct slice of the market, why those slices are growing in
          parallel, and why the right mental model is{" "}
          <span style={strong}>
            complementary venues, not zero-sum combat.
          </span>
        </p>

        <h2 style={sectionH}>Three architectures, three audiences</h2>
        <p style={p}>
          These platforms aren't variations of the same thing. They're
          fundamentally different products that happen to share the word
          "perpetual."
        </p>

        <h3 style={sectionH3}>Hyperliquid — public order book, dedicated L1</h3>
        <p style={p}>
          Hyperliquid runs an on-chain central limit order book on HyperBFT, its
          own purpose-built Layer 1. The book is fully public. Market makers
          get rebates and post liquidity. Traders see depth, post limits, and
          execute the way they would on Binance. Daily volume sits above $6B,
          and Hyperliquid's "xyz" sub-protocol now does another $1.8B/day in
          RWA perps — oil, stocks, indices, even the{" "}
          <code style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}>
            SPCX
          </code>{" "}
          SpaceX pre-IPO contract.{" "}
          <span style={strong}>
            This is the venue for traders who think in order books:
          </span>{" "}
          market makers, latency-sensitive algos, anyone who wants
          CEX-style execution with on-chain settlement.
        </p>

        <h3 style={sectionH3}>Lighter — zk-proven CLOB on Ethereum L2</h3>
        <p style={p}>
          Lighter runs the same conceptual model as Hyperliquid — public order
          book, makers and takers — but with cryptographic proofs of every
          match and a more competitive fee schedule (0% maker / 0.025% taker).
          190 markets live, ~49 of them RWAs.{" "}
          <span style={strong}>
            This is the venue for traders who want a CEX-like experience with
            the strongest possible cryptographic guarantees
          </span>{" "}
          — and don't mind running on Ethereum's L2 infrastructure rather than
          a dedicated chain.
        </p>

        <h3 style={sectionH3}>Variational — private RFQ, vertically integrated OLP</h3>
        <p style={p}>
          Variational doesn't have an order book at all. It runs a
          request-for-quote (RFQ) protocol where a single vertically integrated
          counterparty — the Omni Liquidity Provider (OLP) — quotes prices by
          aggregating liquidity from CEXs, DEXs, and TradFi dealers. Nothing
          to sweep, nothing to front-run, no visible positions. Trading fees
          are 0% in both directions; OLP monetizes the spread.{" "}
          <span style={strong}>
            This is the venue for traders who don't want to leak signal:
          </span>{" "}
          whales sizing into positions, traders running spread strategies,
          RFQ-native institutions used to Deribit-style block quotes.
        </p>

        <p style={p}>
          Same asset class. Three completely different products. Three
          completely different ideal customers.
        </p>

        <h2 style={sectionH}>Architecture is destiny — and destiny is plural</h2>
        <p style={p}>
          You can see this in the data. The traders who route the most volume
          to Hyperliquid are not the same traders who would route to
          Variational. A market maker who lives on rebates can't operate on an
          RFQ venue with no public book. A whale who needs to put on $5M
          without moving the market doesn't want to sweep Hyperliquid's order
          book in fragments. A high-frequency strategy doesn't want Lighter's
          L2 latency.
        </p>

        <div style={callout}>
          This isn't a marketing-deck claim — it's the same pattern you see in
          TradFi every day. NYSE, NASDAQ, CBOE, and ICE all coexist because
          they serve different products and execution styles. Goldman,
          Citadel, and Jane Street don't compete on every venue; they each
          dominate the corners where their stack is best.
        </div>

        <p style={p}>
          Perp DEXes are no different.{" "}
          <span style={strong}>The architecture forces the audience,</span> and
          the architectures here are genuinely distinct.
        </p>

        <h2 style={sectionH}>The pie is growing faster than the slices</h2>
        <p style={p}>
          The other reason this isn't zero-sum: decentralized perpetuals
          captured roughly 26% of the futures market in 2026, up from a
          rounding error two years ago. The TAM is exploding, not stable.
        </p>
        <p style={p}>
          Hyperliquid does $6B+ a day in crypto perps. Globally, the
          perpetual-futures market — including TradFi-style derivatives —
          clears trillions per week. CME Group alone settled over a
          quadrillion dollars in notional derivatives in 2024. Even if you
          assume only 10% of that ultimately migrates on-chain over the next
          decade, that's a 100× larger pie than what these three platforms
          collectively serve today.
        </p>
        <p style={p}>
          Then layer on the categories that don't really exist anywhere yet:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>RWA perpetuals</span> — Hyperliquid's xyz
            sub-protocol is already at $1.8B/day, and there's no reason that
            number plateaus. Equities, commodities, and indices perps are
            net-new derivatives markets, not stolen volume from existing
            books.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Pre-IPO perpetuals</span> — SPCX (SpaceX),
            and whatever comes after, opens an asset class that has no
            on-chain equivalent today.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>OTC institutional flow</span> — Variational's
            Pro product (still unreleased) is targeting the trillion-dollar
            OTC derivatives market that currently moves over Telegram chats
            and bank wires.
          </li>
          <li>
            <span style={strong}>Prediction markets and exotic structures</span>{" "}
            — Polymarket-adjacent, but settled with the same infrastructure.
          </li>
        </ul>
        <p style={p}>
          When the addressable market is expanding by 10–100× over the cycle,
          "stealing share from the competitor" stops being the right frame.{" "}
          <span style={strong}>
            Every serious team is racing to define and own a new sub-category,
          </span>{" "}
          not to drag traders away from someone else's book.
        </p>

        <h2 style={sectionH}>They already interact — as venues, not enemies</h2>
        <p style={p}>
          Watch how serious traders actually use these platforms in 2026:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Aggregators route across all three.</span>{" "}
            When you want best execution on a mid-cap perp, the price you take
            is whichever venue is tightest right then — Hyperliquid sometimes,
            Lighter sometimes, Variational sometimes. The aggregator doesn't
            care about brand loyalty.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>
              Delta-neutral funding-rate strategies arb between them.
            </span>{" "}
            A long on Variational against a short on Hyperliquid is a real
            trade people run today (it's literally what our own{" "}
            <Link
              to="/rates"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              funding-rate tool
            </Link>{" "}
            is built to surface). Funding-rate spreads exist precisely{" "}
            <em>because</em> multiple venues exist — kill one and the strategy
            disappears.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>
              Audit firms, infra providers, and oracles are shared.
            </span>{" "}
            Spearbit audits both Variational and a half-dozen other perp
            DEXes. Chainlink, Pyth, and similar oracles serve everyone.
            Fireblocks, Alchemy, QuickNode — they're protocol-agnostic. The
            infra layer is converging even as the application layer
            specializes.
          </li>
          <li>
            <span style={strong}>Liquidity providers diversify.</span> A
            serious market-making firm has positions across all three. A
            serious LP allocates to HLP on Hyperliquid <em>and</em> OLP on
            Variational because they have different return profiles.
          </li>
        </ul>
        <p style={p}>
          This is what a healthy market looks like. Not three teams trying to
          murder each other, but three teams building specialized
          infrastructure for different parts of the same growing pie, with
          capital, talent, and tools flowing freely between them.
        </p>

        <h2 style={sectionH}>The right question</h2>
        <p style={p}>
          The question isn't <em>"Who's going to win?"</em> It's{" "}
          <em>
            "Which of these traders' workflow does each platform serve best,
            and where will the next workflow come from?"
          </em>
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 8 }}>
            If you trade in size and care about not leaking signal, the
            privacy-RFQ model is built for you.
          </li>
          <li style={{ marginBottom: 8 }}>
            If you make markets or run latency-sensitive strategies, the
            on-chain order book is built for you.
          </li>
          <li style={{ marginBottom: 8 }}>
            If you want the strongest possible cryptographic guarantees on
            every match, the zk-proven CLOB is built for you.
          </li>
          <li>
            If you trade equities, commodities, or forex on-chain, all three
            are racing to serve you — and the best architecture per asset
            class is genuinely undetermined.
          </li>
        </ul>
        <p style={p}>
          Treat the perp DEX category as{" "}
          <span style={strong}>
            one venue per workflow, not one venue per category,
          </span>{" "}
          and the "who wins" question dissolves. They all do. So do the
          traders who pick the right venue for the right job.
        </p>

        <hr style={hr} />

        {/* Author note + soft CTA */}
        <p
          style={{
            ...p,
            fontStyle: "italic",
            color: THEME.muted,
            fontSize: "0.95rem",
          }}
        >
          tryvariational is an independent research and tooling site for the
          perp DEX category. We build{" "}
          <Link to="/compare" style={{ color: THEME.accent, textDecoration: "underline" }}>
            comparison
          </Link>
          ,{" "}
          <Link to="/rates" style={{ color: THEME.accent, textDecoration: "underline" }}>
            funding-rate
          </Link>
          , and{" "}
          <Link to="/liquidations" style={{ color: THEME.accent, textDecoration: "underline" }}>
            liquidation
          </Link>{" "}
          tools that cover Hyperliquid, Lighter, Variational, and other major
          venues. We disclose that we operate a Variational referral link as
          part of how this project sustains itself.
        </p>

        <div style={ctaBox}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: THEME.accent,
              marginBottom: 10,
            }}
          >
            Explore further
          </div>
          <div style={{ ...p, margin: 0, color: THEME.text }}>
            Compare the three protocols side-by-side with live volume, fees,
            and TVL on our{" "}
            <Link
              to="/compare"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              perp DEX comparison
            </Link>
            , or model your $VAR airdrop value with the{" "}
            <Link
              to="/"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              calculator on the home page
            </Link>
            .
          </div>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={ctaBtn}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Try Variational Omni → (code: {REFERRAL_CODE})
          </a>
        </div>
      </article>

      <TrustStrip theme={THEME} fonts={FONTS} />
      <Footer theme={THEME} />
    </div>
  );
}
