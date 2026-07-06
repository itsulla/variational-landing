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

const PUBLISHED_AT = "2026-07-06T00:00:00Z";
const PUBLISHED_DISPLAY = "July 6, 2026";
const READ_TIME = "8 min read";

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

const linkStyle = { color: THEME.accent, textDecoration: "underline" };

/* ═══════════════════════════════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════════════════════════════ */
export default function PreIpoPerpsExplained() {
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
          <div style={eyebrow}>Explainer · Pre-IPO Perpetuals</div>
          <h1 style={h1}>
            Pre-IPO Perps Explained: How They Work and Where to Trade Them
          </h1>
          <p style={subtitle}>
            Pre-IPO perps let you take long or short exposure to a private
            company — OpenAI, Anthropic — before it ever lists. No accreditation,
            no share ownership, no expiry. Here's exactly how the contract works,
            how it's priced, and why the same market can trade at different
            prices across venues.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Pre-IPO · Perpetuals · Explainer</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          A private company like OpenAI or Anthropic can be worth hundreds of
          billions of dollars while its shares are locked behind accreditation
          checks, minimum ticket sizes, and paperwork most people will never
          clear. <span style={strong}>Pre-IPO perps</span> are the crypto-native
          answer to that wall: a perpetual futures contract that tracks a private
          company's implied valuation, tradable long or short, 24/7, with no
          equity ownership and no invitation required.
        </p>
        <p style={p}>
          This guide explains what a pre-IPO perp actually is, the oracle
          methodology that prices it, why the same contract can trade at
          different prices on different venues, what happens when the company
          finally IPOs, and where you can trade these markets today.
        </p>

        <h2 style={sectionH}>What is a pre-IPO perp?</h2>
        <p style={p}>
          A pre-IPO perp is a{" "}
          <span style={strong}>perpetual futures contract</span> whose price is
          designed to track the implied valuation of a company that has not yet
          gone public. Break that into its three load-bearing parts:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Synthetic exposure.</span> You are not buying
            shares. You never own equity, get a cap-table entry, or hold anything
            redeemable for stock. You hold a derivative whose value moves with a
            reference price. Your profit and loss is cash-settled in
            stablecoins.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Perpetual — no expiry.</span> Unlike a dated
            future or an option, the contract never settles on a calendar date.
            You can hold the position indefinitely, and it stays open until you
            close it or get liquidated.
          </li>
          <li>
            <span style={strong}>Oracle-referenced.</span> Because a private
            company has no continuously-quoted market price, the perp is priced
            off an <em>oracle</em> — a data feed the venue builds from
            private-secondary-market marks. That oracle is the anchor the whole
            contract is tethered to.
          </li>
        </ul>
        <p style={p}>
          In short: a pre-IPO perp gives you directional exposure to a private
          company's valuation without ever touching its shares. If you think
          OpenAI is undervalued, you go long. If you think the AI trade is
          overheated, you can short it — something the traditional
          private-secondary market makes almost impossible for an outsider.
        </p>

        <h2 style={sectionH}>How is a pre-IPO perp priced?</h2>
        <p style={p}>
          This is where pre-IPO perps differ most from a normal crypto perp, and
          it's the part most thin explainer pages skip. With a BTC perp, there's
          a deep, continuously-traded spot market underneath, and the oracle just
          samples it. A private company has no exchange-traded underlying at all.
          So the <span style={strong}>oracle isn't sampling the truth — the
          oracle IS the reference.</span>
        </p>

        <h3 style={sectionH3}>Where the oracle gets its number</h3>
        <p style={p}>
          Each venue builds its own valuation oracle by aggregating{" "}
          <span style={strong}>private secondary-market marks</span> — the prices
          at which existing shareholders (employees, early investors, funds)
          transact in a company's stock before it lists. This data comes from
          sources like Caplight, Forge Global, and Hiive-style secondary
          marketplaces, along with tender-offer prices and reported funding-round
          valuations. The oracle blends and smooths these inputs into a single
          implied valuation, then divides by an assumed share count to produce a
          per-contract reference price.
        </p>

        <h3 style={sectionH3}>Mark price vs. index price vs. funding</h3>
        <p style={p}>
          Three numbers matter on any perp, pre-IPO included:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Index price</span> — the oracle's fair value,
            built from the aggregated secondary marks above. This is the
            "should-be" price of the underlying.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Mark price</span> — the price the venue uses to
            value open positions and trigger liquidations. It's tied to the
            index but nudged by where the perp is actually trading on that venue,
            so heavy one-sided flow can push mark away from index.
          </li>
          <li>
            <span style={strong}>Funding rate</span> — a periodic payment between
            longs and shorts that pulls mark back toward index (more on this
            below).
          </li>
        </ul>
        <p style={p}>
          Because there is no exchange-traded underlying to arbitrage against,
          nothing forces every venue's oracle to agree. Two exchanges can read
          the same secondary market and land on different implied valuations —
          different data providers, different smoothing windows, different share
          counts. The result is a structural feature of this asset class:{" "}
          <span style={strong}>cross-venue price divergence.</span>
        </p>

        <h2 style={sectionH}>The cross-venue reality</h2>
        <p style={p}>
          Here is the thing generic explainers won't tell you: the <em>same</em>{" "}
          pre-IPO contract — say, an OpenAI perp — can quote a{" "}
          <span style={strong}>different price on Variational than on
          Hyperliquid's xyz, Lighter, OKX, or Gate.io</span> at the very same
          moment. On a normal perp, arbitrageurs would slam that gap shut against
          the spot market in seconds. Here there is no spot market to arbitrage
          against, so the gaps persist and shift as each venue's oracle updates
          on its own schedule.
        </p>
        <p style={p}>
          That divergence is not a bug — it's the most important thing to
          understand about trading these markets. If one venue is marking OpenAI
          richer than the others, a long there is paying up relative to the same
          exposure elsewhere. This basis is both a risk and, for some traders, an
          opportunity.
        </p>
        <div style={callout}>
          The single biggest edge in pre-IPO perps isn't picking direction — it's
          knowing which venue is marking the same company cheap or rich right
          now. We track that spread in real time on our{" "}
          <Link to="/pre-ipo" style={linkStyle}>
            live cross-venue pre-IPO price tracker
          </Link>
          , which compares the same contract across Variational, Hyperliquid,
          Lighter, and other venues side by side.
        </div>

        <h2 style={sectionH}>How funding keeps the perp tethered</h2>
        <p style={p}>
          Since a perpetual never expires, it needs a mechanism to keep its price
          anchored to the oracle. That mechanism is the{" "}
          <span style={strong}>funding rate</span> — a small payment exchanged
          directly between longs and shorts at regular intervals, not paid to the
          exchange.
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Positive funding</span> — the perp is trading
            above the oracle (too many eager longs). Longs pay shorts. That cost
            discourages new longs and rewards shorts, nudging the price back down
            toward index.
          </li>
          <li>
            <span style={strong}>Negative funding</span> — the perp is trading
            below the oracle (crowded shorts). Shorts pay longs, pulling the
            price back up.
          </li>
        </ul>
        <p style={p}>
          On a hyped pre-IPO name, funding can run high and persistent — the
          crowd wants to be long OpenAI, so longs pay a steady premium to hold.
          That funding cost is a real, recurring drag on a long position, and
          it's exactly the kind of number our{" "}
          <Link to="/rates" style={linkStyle}>
            funding-rate tools
          </Link>{" "}
          are built to surface across venues.
        </p>

        <h2 style={sectionH}>Why trade pre-IPO perps vs. secondary shares?</h2>
        <p style={p}>
          The traditional way to get pre-IPO exposure is to buy actual secondary
          shares through an accredited-only marketplace. That path is gated in
          almost every way a pre-IPO perp is not:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>No accreditation.</span> Secondary-share
            platforms typically require accredited-investor status. A perp does
            not — anyone with a wallet and stablecoins can trade.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>No minimums.</span> Secondary lots often start
            in the tens or hundreds of thousands of dollars. A perp lets you take
            a position in small size.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Long or short.</span> You can't easily short a
            private company through secondary shares. A perp makes shorting a
            one-click trade.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>24/7 and instantly liquid.</span> No signing
            windows, no counterparty matching, no lock-ups. Open and close
            whenever you want.
          </li>
          <li>
            <span style={strong}>Leverage.</span> Perps let you express a view
            with leverage — which amplifies both gains and losses (see risks
            below).
          </li>
        </ul>
        <p style={p}>
          The trade-off is directness: a secondary share is a real claim on the
          company; a perp is synthetic exposure that only tracks an oracle. You
          give up ownership to gain access, flexibility, and the ability to go
          both ways.
        </p>

        <h2 style={sectionH}>What happens when the company IPOs?</h2>
        <p style={p}>
          A pre-IPO perp is a bridge, not a permanent structure. When the company
          actually lists, the contract{" "}
          <span style={strong}>
            converts into a standard stock perp that tracks the live public
            price.
          </span>{" "}
          The oracle stops leaning on smoothed secondary marks and starts
          referencing the real, exchange-traded stock — the same way a normal
          equity perp works. Real price discovery replaces model-driven pricing.
        </p>
        <p style={p}>
          This has already happened once. <span style={strong}>SpaceX
          IPO'd</span> and its pre-IPO perp converted into a live SPCX stock
          perp, now tracking the public share price. The two marquee names still
          in true pre-IPO territory are{" "}
          <span style={strong}>OpenAI and Anthropic</span> — both private, both
          heavily traded as pre-IPO perps, and both of whose contracts would
          convert to standard stock perps if and when they list.
        </p>

        <h2 style={sectionH}>The risks you need to price in</h2>
        <p style={p}>
          Pre-IPO perps are one of the higher-risk corners of on-chain trading.
          Go in clear-eyed:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Oracle and model risk.</span> Until the company
            is public, the price is model-driven. It's only as good as the
            secondary data feeding it and the assumptions baked into the venue's
            methodology. A stale, thin, or mis-specified oracle can misprice the
            contract.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Volatility.</span> These are young, sentiment-
            driven markets. Early pre-IPO contracts have swung 50%+ on headlines,
            funding-round leaks, and thin liquidity.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Funding costs.</span> On a persistently hyped
            name, high positive funding quietly erodes a long position over time,
            even if the price never moves against you.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Leverage and liquidation.</span> Leverage cuts
            both ways. A volatile, oracle-priced market plus leverage means
            liquidation risk is real and can trigger on a fast oracle update.
          </li>
          <li>
            <span style={strong}>Cross-venue basis.</span> Because venues
            disagree on price, the mark you're liquidated against on one venue
            may differ from another. Entering on the venue marking a name richest
            builds an immediate disadvantage into the position.
          </li>
        </ul>

        <h2 style={sectionH}>Where to trade pre-IPO perps</h2>
        <p style={p}>
          A handful of venues run pre-IPO markets today, each with a different
          architecture:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Hyperliquid (xyz)</span> — the RWA sub-protocol
            on Hyperliquid's order-book venue, with public depth and CEX-style
            execution.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Lighter</span> — a zk-proven central limit order
            book on an Ethereum L2, listing a growing set of RWA and pre-IPO
            markets.
          </li>
          <li>
            <span style={strong}>Variational</span> — a private request-for-quote
            venue with no public order book, quoting pre-IPO perps against its
            Omni Liquidity Provider.
          </li>
        </ul>
        <p style={p}>
          On <span style={strong}>Variational</span> specifically, a few things
          are worth calling out for anyone trading pre-IPO perps:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>0% trading fees.</span> There is no per-trade
            fee in either direction. The Omni Liquidity Provider (OLP) earns the
            spread on the quote it gives you, not a fee on top of it.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>USDC on Arbitrum.</span> Positions are
            collateralized and settled in USDC on Arbitrum, so there's no bridge
            gymnastics for most on-chain traders.
          </li>
          <li>
            <span style={strong}>Every trade farms the $VAR airdrop.</span>{" "}
            Volume you put through the venue accrues toward the upcoming $VAR
            distribution — you can estimate what your activity is worth with the{" "}
            <Link to="/" style={linkStyle}>
              airdrop calculator
            </Link>
            .
          </li>
        </ul>
        <p style={p}>
          Access to Variational Omni is via an access code (below). To be clear,
          the code is for access — it is not a discount or fee reduction; fees
          are already 0%.
        </p>

        <h2 style={sectionH}>Frequently asked questions</h2>

        <h3 style={sectionH3}>Can you buy OpenAI pre-IPO?</h3>
        <p style={p}>
          Not as an ordinary retail investor in the equity sense — OpenAI's
          actual shares are private and gated behind accreditation and large
          minimums. What you <em>can</em> do is trade a pre-IPO perp that tracks
          OpenAI's implied valuation, long or short, in small size and without
          accreditation. It's synthetic exposure to the valuation, not a purchase
          of shares.
        </p>

        <h3 style={sectionH3}>
          Are pre-IPO perps the same as owning shares?
        </h3>
        <p style={p}>
          No. A pre-IPO perp is a synthetic derivative. You never own equity, get
          a cap-table entry, receive dividends, or hold anything convertible into
          stock. Your profit and loss is cash-settled and driven by an oracle
          that tracks the company's implied valuation — that's a fundamentally
          different instrument from a secondary share.
        </p>

        <h3 style={sectionH3}>Is buying pre-IPO a good idea?</h3>
        <p style={p}>
          It depends entirely on your risk tolerance and your view. Pre-IPO perps
          give you access and flexibility no secondary marketplace offers — but
          they're model-priced until the company lists, they've been highly
          volatile, funding can be a persistent cost, and leverage adds
          liquidation risk. They can be a reasonable way to express a conviction
          view in controlled size; they are not a place to park money you can't
          afford to lose. Size accordingly and understand the oracle mechanics
          before you trade.
        </p>

        <h3 style={sectionH3}>
          What happens to a pre-IPO perp when the company IPOs?
        </h3>
        <p style={p}>
          It converts into a standard stock perp that tracks the live public
          share price. The oracle switches from smoothed private-secondary marks
          to the real, exchange-traded stock, and normal price discovery takes
          over. SpaceX already went through this: its pre-IPO perp became a live
          SPCX stock perp after the company listed.
        </p>

        <h3 style={sectionH3}>
          Why does the same pre-IPO perp cost different amounts on different
          venues?
        </h3>
        <p style={p}>
          Because there's no exchange-traded underlying, each venue's oracle is
          its own reference — built from different data providers, smoothing
          windows, and share-count assumptions — and nothing arbitrages the gaps
          away instantly. That's why we track the same contract across venues on
          the{" "}
          <Link to="/pre-ipo" style={linkStyle}>
            live cross-venue pre-IPO price tracker
          </Link>
          .
        </p>

        <hr style={hr} />

        {/* Disclosure + CTA */}
        <p
          style={{
            ...p,
            fontStyle: "italic",
            color: THEME.muted,
            fontSize: "0.95rem",
          }}
        >
          tryvariational is an independent research and tooling site for the perp
          DEX category. We build{" "}
          <Link to="/pre-ipo" style={linkStyle}>
            cross-venue pre-IPO
          </Link>
          ,{" "}
          <Link to="/rates" style={linkStyle}>
            funding-rate
          </Link>
          , and{" "}
          <Link to="/compare" style={linkStyle}>
            comparison
          </Link>{" "}
          tools that cover Hyperliquid, Lighter, Variational, and other major
          venues. Nothing here is financial advice. We disclose that we operate a
          Variational referral link as part of how this project sustains itself.
          Variational is not available to residents of the United States or
          Canada, who are restricted persons under its terms.
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
            Compare the same pre-IPO contract across venues on the{" "}
            <Link to="/pre-ipo" style={linkStyle}>
              live cross-venue price tracker
            </Link>
            , or model your $VAR airdrop value with the{" "}
            <Link to="/" style={linkStyle}>
              calculator on the home page
            </Link>
            .
          </div>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={ctaBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
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
