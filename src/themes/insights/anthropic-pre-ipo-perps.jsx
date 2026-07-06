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
const READ_TIME = "7 min read";

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
export default function AnthropicPreIpoPerps() {
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
          <div style={eyebrow}>Guide · Pre-IPO Perpetuals</div>
          <h1 style={h1}>How to Get Anthropic Pre-IPO Exposure in 2026</h1>
          <p style={subtitle}>
            Anthropic — the company behind Claude — is one of the fastest-growing
            private AI companies on earth. Everyone wants to invest in Anthropic
            before the IPO, but retail has almost no legitimate path in. Here's
            how synthetic pre-IPO perpetuals change that.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Anthropic · Pre-IPO · Variational</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          If you've searched "how to invest in Anthropic before IPO," you've
          probably hit the same wall everyone else does. Anthropic is still a
          private company. Its shares don't trade on any exchange. There is no
          Anthropic stock ticker you can buy on Robinhood, and there won't be
          one until the company decides to go public — on its own timeline, if
          ever.
        </p>
        <p style={p}>
          Meanwhile Anthropic keeps making headlines. Claude has become one of
          the most widely used AI models in the world, enterprise revenue is
          reportedly compounding at a rate few software companies have ever
          matched, and each new private funding round has been{" "}
          <span style={strong}>reportedly valued in the tens of billions</span>{" "}
          of dollars. Alongside OpenAI, Anthropic is one of the two marquee
          still-private names in AI — and one of the most requested pre-IPO
          exposure targets from retail traders. The demand is enormous. The
          access is close to zero.
        </p>

        <h2 style={sectionH}>The traditional ways in — and why they're gated</h2>
        <p style={p}>
          There are legitimate ways to buy pre-IPO shares of a company like
          Anthropic. Almost none of them are open to a normal retail investor.
        </p>

        <h3 style={sectionH3}>Secondary marketplaces</h3>
        <p style={p}>
          Platforms like Forge Global, EquityZen, and Hiive exist to match
          buyers with employees and early investors who want to sell private
          shares. In practice they are gated by law and by structure:{" "}
          <span style={strong}>
            you generally need accredited-investor status
          </span>{" "}
          (income or net-worth thresholds most people don't meet), minimum
          check sizes that run into the tens of thousands of dollars, and
          lockups that can trap your capital for years. You also can't short —
          these venues only let you go long, so there's no way to bet against a
          valuation you think is frothy.
        </p>

        <h3 style={sectionH3}>SPVs and pooled vehicles</h3>
        <p style={p}>
          Special-purpose vehicles bundle many small investors into a single
          line on the cap table. They can lower the per-person minimum, but they
          layer on{" "}
          <span style={strong}>steep management and carry fees</span>, opaque
          terms, and the same accreditation gate. You're trusting an
          intermediary's markup and paperwork, not holding anything liquid.
        </p>

        <h3 style={sectionH3}>Insider and employee shares</h3>
        <p style={p}>
          The deepest liquidity is in shares held by employees and early
          backers — but those aren't public, transfers are often
          company-restricted, and you need to be in the right network at the
          right moment. For everyone else, this door simply isn't open.
        </p>

        <p style={p}>
          The net effect: the people who most want Anthropic exposure — retail
          traders who believe in the AI thesis — are the ones structurally
          locked out.
        </p>

        <h2 style={sectionH}>How pre-IPO perpetuals work</h2>
        <p style={p}>
          A pre-IPO perpetual is a{" "}
          <span style={strong}>synthetic derivative</span> that tracks the
          private-market valuation of a company like Anthropic without ever
          touching a real share. It is the same perpetual-futures instrument
          crypto traders already use for BTC or ETH, pointed at a new
          underlying.
        </p>
        <p style={p}>
          Two ideas make it work.{" "}
          <span style={strong}>First, it's synthetic:</span> you are not buying
          equity, you don't appear on any cap table, and you have no
          shareholder rights. You're taking a position in a contract whose price
          is designed to move with Anthropic's valuation.{" "}
          <span style={strong}>Second, it's oracle-priced:</span> instead of a
          public order book of shares, the contract's reference price is fed
          from private secondary-market marks — the same funding-round and
          secondary-transaction data those gated marketplaces run on — so the
          perp can track a private valuation that has no live public quote.
        </p>
        <p style={p}>
          Because it's a perpetual and not equity, the constraints that lock out
          retail disappear:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>No accreditation.</span> It's a derivative
            position, not a securities purchase, so the accredited-investor gate
            doesn't apply.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Long or short.</span> You can bet on Anthropic
            rising into its IPO — or against a valuation you think has run too
            hot. Secondary marketplaces never let you do the latter.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>24/7 and small size.</span> No years-long
            lockup, no five-figure minimum. You can open a position for a few
            dollars and close it whenever you want.
          </li>
          <li>
            <span style={strong}>Leverage.</span> Perps let you express a view
            with margin rather than posting the full notional — powerful, and
            dangerous, in equal measure (more on risk below).
          </li>
        </ul>

        <div style={callout}>
          The real asymmetry isn't leverage — it's direction. Every gated
          secondary marketplace on earth only lets you <em>buy</em> a private
          company. A pre-IPO perpetual is the first instrument that lets ordinary
          traders <em>short</em> a private valuation they think is frothy. When
          a name like Anthropic is priced for perfection, the ability to take
          the other side is the edge the accredited crowd never had.
        </div>

        <h2 style={sectionH}>Trading Anthropic on Variational</h2>
        <p style={p}>
          Variational lists an{" "}
          <code style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}>
            ANTHROPIC
          </code>{" "}
          pre-IPO perpetual market alongside its crypto and RWA perps. A few
          things make it well-suited to this trade:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Zero trading fees.</span> 0% maker <em>and</em>{" "}
            0% taker. Variational's Omni Liquidity Provider (OLP) monetizes the
            bid-ask spread, <span style={strong}>not</span> per-trade fees, so
            you're not paying commission to open or close a position.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>USDC-on-Arbitrum collateral.</span> You post
            USDC on Arbitrum One as margin. No exotic collateral, no bridging
            gymnastics.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Up to 50x leverage</span> with{" "}
            <span style={strong}>portfolio margin</span>, so positions across
            markets net against each other rather than each locking up
            collateral independently.
          </li>
          <li>
            <span style={strong}>RFQ execution.</span> You get a quote from the
            OLP rather than sweeping a public book — no visible position to
            front-run.
          </li>
        </ul>
        <p style={p}>
          One honest note on the referral code: it is an{" "}
          <span style={strong}>access code</span>, not a discount. It's how you
          get onto the platform — it does not change fees (there are none to
          discount) or give you preferential pricing. Anyone claiming a
          "referral discount" is selling you something Variational doesn't offer.
        </p>

        <h2 style={sectionH}>The $VAR airdrop bonus</h2>
        <p style={p}>
          Here's the part that makes this more than a one-way bet. Variational
          is <span style={strong}>pre-token</span>. Every dollar of volume you
          trade earns points toward the upcoming{" "}
          <code style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}>
            $VAR
          </code>{" "}
          airdrop, and per the project's docs the community allocation is
          sizable — <span style={strong}>on the order of 50%</span> of supply
          earmarked for users rather than insiders.
        </p>
        <p style={p}>
          That means trading the ANTHROPIC market does double duty: you get your
          Anthropic pre-IPO exposure <em>and</em> you farm the airdrop with the
          same volume. Because fees are 0%, the drag on a
          points-farming strategy is unusually low. You can model what that
          volume might be worth with the{" "}
          <Link to="/">airdrop calculator on the home page</Link>.
        </p>

        <h2 style={sectionH}>The risks — read this part twice</h2>
        <p style={p}>
          A synthetic pre-IPO perp is a real financial instrument with real ways
          to lose money. Don't skip this section.
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Synthetic and oracle risk.</span> You hold no
            equity. The contract is only as good as the oracle feeding it — if
            the private-mark data is sparse, stale, or disputed, the perp price
            can behave in ways a real share wouldn't.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Funding costs.</span> Perpetuals charge periodic
            funding between longs and shorts. Hold a position long enough and
            funding can quietly eat your thesis even if the valuation moves your
            way. Watch the{" "}
            <Link
              to="/rates"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              funding-rate tool
            </Link>{" "}
            before sizing up.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Leverage and liquidation.</span> Up to 50x
            means a small adverse move can wipe your margin. Leverage cuts both
            ways, and liquidations are unforgiving.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Private-mark vs. perp gaps.</span> The perp
            price and the "official" last private valuation can diverge — the
            market may price in an expected up-round, a down-round, or IPO
            timing that the last funding mark doesn't reflect. You're trading the
            crowd's forward view, not a settled book value.
          </li>
          <li>
            <span style={strong}>Eligibility.</span> Be honest with yourself
            here: <span style={strong}>US and Canada residents are restricted
            persons</span> and cannot access Variational. If that's you, this
            route is not available, full stop.
          </li>
        </ul>

        <h2 style={sectionH}>How to start</h2>
        <p style={p}>
          If you're eligible, the flow is short:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Get USDC.</span> Buy USDC on any exchange or
            on-ramp that serves your region.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Withdraw on Arbitrum One.</span> Send it to
            your wallet on the Arbitrum One network directly — no bridging step
            if you withdraw on the right chain the first time.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Connect at Variational Omni</span> using the
            access code, then deposit your USDC as collateral.
          </li>
          <li>
            <span style={strong}>Trade the ANTHROPIC market.</span> Choose long
            or short, set your size and leverage, and every dollar of volume
            starts accruing $VAR points automatically.
          </li>
        </ul>
        <p style={p}>
          For the broader landscape of what's tradable this way — and how
          pre-IPO perps compare across venues — see our{" "}
          <Link to="/pre-ipo" style={{ color: THEME.accent, textDecoration: "underline" }}>
            pre-IPO perpetuals guide
          </Link>
          . (One accuracy note for anyone doing their own research: SpaceX has
          already IPO'd as of July 2026, so it is no longer a pre-IPO name —
          OpenAI and Anthropic are the marquee still-private targets.)
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
          This article is educational, not financial advice. Pre-IPO
          perpetuals are synthetic, oracle-priced, leveraged instruments and you
          can lose your entire margin. tryvariational is an independent research
          and tooling site for the perp DEX category; we disclose that we operate
          a Variational referral link as part of how this project sustains
          itself, and the code below is an <span style={strong}>access</span>{" "}
          code, not a discount. Nothing here is a solicitation to restricted
          persons, including US and Canada residents, who cannot access
          Variational.
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
            Read the full{" "}
            <Link
              to="/pre-ipo"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              pre-IPO perpetuals guide
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
