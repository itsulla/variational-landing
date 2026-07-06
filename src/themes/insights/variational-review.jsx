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

/* ═══════════════════════════════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════════════════════════════ */
export default function VariationalReview() {
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
          <div style={eyebrow}>Review · Variational Omni</div>
          <h1 style={h1}>
            Variational Review 2026: Fees, Airdrop &amp; Pre-IPO Markets
          </h1>
          <p style={subtitle}>
            An honest, hands-on look at the Variational exchange — how the 0%
            fee model actually works, what the $VAR airdrop is really worth,
            and whether the OpenAI and Anthropic pre-IPO perps live up to the
            hype. The good, the caveats, and who should skip it.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Review · Variational Omni</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          Most crypto "reviews" are thinly veiled ads. This isn't one — or at
          least, we've tried hard to keep it honest. We run tooling for the
          perp DEX category and, yes, we operate a{" "}
          <span style={strong}>Variational referral link</span> (disclosed
          again at the bottom). But a puff piece helps nobody. So here's the
          balanced version: what the <span style={strong}>Variational
          exchange</span> does well, where the trade-offs bite, and who
          genuinely shouldn't bother signing up.
        </p>

        <h2 style={sectionH}>What Variational Omni actually is</h2>
        <p style={p}>
          Variational is a peer-to-peer derivatives protocol built on{" "}
          <span style={strong}>Arbitrum</span>, and{" "}
          <span style={strong}>Omni</span> is its flagship trading app. Unlike
          a typical perp DEX with a public order book, Variational uses a{" "}
          <span style={strong}>request-for-quote (RFQ)</span> model: when you
          want to trade, the <span style={strong}>Omni Liquidity Provider
          (OLP)</span> quotes you a price and becomes the counterparty to your
          position. There's no visible book to sweep and no resting orders to
          front-run.
        </p>
        <p style={p}>
          The breadth is the first thing that stands out. Variational Omni
          lists <span style={strong}>495+ markets</span> spanning crypto,
          individual stocks, ETFs, commodities, and — the headline act —{" "}
          <span style={strong}>pre-IPO perps on OpenAI and Anthropic</span>.
          Leverage runs up to 50x, margin is posted in USDC on Arbitrum, and
          the whole experience is gasless once you've funded your account.
        </p>

        <h2 style={sectionH}>Variational fees: how 0% is actually possible</h2>
        <p style={p}>
          The pitch that makes people suspicious: Variational charges{" "}
          <span style={strong}>0% maker and 0% taker fees, permanently</span>.
          No fee tiers, no volume rebates to chase, no taker penalty. If you're
          used to paying 4–5 basis points a side on other venues, that reads as
          too good to be true.
        </p>
        <p style={p}>
          It isn't — but you should understand the mechanism, because "free"
          never really means free. Variational's business model isn't the
          fee line; it's the <span style={strong}>bid-ask spread</span>. The
          OLP quotes you a price a hair wide of the mid, aggregating liquidity
          from CEXs, DEXs, and TradFi dealers, and it earns on that spread as
          the counterparty. In other words, the fee moved from an explicit line
          item into the price you get filled at.
        </p>
        <div style={callout}>
          Honest take: 0% <em>Variational fees</em> are real and genuinely
          valuable, but the spread is your true cost. On deep, liquid markets
          the spread is tight and you almost certainly come out ahead versus a
          fee-charging venue. On thin or exotic markets — including pre-IPO
          perps — a wider spread can quietly cost more than a headline fee ever
          would. Always compare the actual fill, not the marketing.
        </div>

        <h2 style={sectionH}>The $VAR airdrop</h2>
        <p style={p}>
          Variational hasn't launched a token yet, and it runs a{" "}
          <span style={strong}>pre-token points program</span> in the meantime.
          The model is simple: every dollar of volume you trade earns points,
          and those points are expected to convert into a{" "}
          <span style={strong}>$VAR</span> allocation at the token generation
          event. Per the project's docs, the community allocation is targeted
          at roughly <span style={strong}>~50%</span> of supply — high relative
          to most comparable launches, which skews the risk/reward toward early
          users.
        </p>
        <p style={p}>
          Nobody knows the final token value, so treat any projection as a
          guess. If you want to sanity-check what your volume might be worth
          under different assumptions, we built an{" "}
          <Link
            to="/"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            airdrop calculator
          </Link>{" "}
          on the home page. Plug in your own numbers rather than trusting a
          headline figure.
        </p>

        <h2 style={sectionH}>Pre-IPO markets: the standout feature</h2>
        <p style={p}>
          The single most interesting thing on Variational Omni is the{" "}
          <span style={strong}>pre-IPO perps</span>. You can take leveraged
          long or short exposure to <span style={strong}>OpenAI</span> and{" "}
          <span style={strong}>Anthropic</span> — two of the most valuable
          private companies in the world — with no equity, no accreditation
          gate, and no lock-up. There is genuinely nowhere else that offers
          this cleanly on-chain, and it's the reason a lot of traders opened an
          account in the first place.
        </p>
        <p style={p}>
          A common point of confusion worth clearing up:{" "}
          <span style={strong}>SpaceX is not a pre-IPO market</span>. SpaceX
          has already gone public, and on Variational it trades as a regular{" "}
          <code style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}>
            SPCX
          </code>{" "}
          stock perp like any other listed equity. The real pre-IPO names are
          OpenAI and Anthropic. If you want the full mechanics — how the
          synthetic price is derived and why these contracts move the way they
          do — see our{" "}
          <Link
            to="/insights/openai-pre-ipo-perps"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            OpenAI pre-IPO perps guide
          </Link>{" "}
          and the live{" "}
          <Link
            to="/pre-ipo"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            pre-IPO market page
          </Link>
          .
        </p>

        <h2 style={sectionH}>What's good</h2>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Zero trading fees.</span> Permanently 0% maker
            and taker — the spread is the only cost, and on liquid markets
            it's competitive.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Enormous market breadth.</span> 495+ markets:
            crypto, stocks, ETFs, commodities, and pre-IPO names in one place.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Portfolio margin.</span> Cross-margining that's
            Deribit-compatible, which matters if you run multi-leg or
            options-style structures.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Private RFQ execution.</span> Your orders and
            positions aren't broadcast to a public book, so there's less signal
            leakage when sizing in.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Gasless UX on USDC/Arbitrum.</span> Fund once,
            then trade without paying gas per action — the app feels closer to
            a CEX than a typical DEX.
          </li>
          <li>
            <span style={strong}>Pre-IPO exposure</span> to OpenAI and
            Anthropic that you can't easily get anywhere else.
          </li>
        </ul>

        <h2 style={sectionH}>The honest cons and caveats</h2>
        <p style={p}>
          No review is worth reading if it only lists positives. Here's where
          Variational will frustrate you or rule you out entirely:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>It's in private beta.</span> You currently need
            an access code to onboard. Mainnet is live, but this is not yet a
            fully open, permissionless product.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>One counterparty, no public book.</span> The
            RFQ model means the OLP is on the other side of every trade. That
            buys you privacy, but you don't get the transparency or the
            maker-rebate dynamics of a public order book, and you're trusting
            that OLP quotes stay fair.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Pre-IPO perps are synthetic and volatile.</span>{" "}
            There's no continuous public market for OpenAI or Anthropic equity,
            so pricing is derived and can move sharply. Treat these as
            high-risk instruments, not a proxy for holding shares.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>The trading API isn't public yet.</span> If
            you're a systematic trader who wants to run bots or programmatic
            strategies, you'll be waiting.
          </li>
          <li>
            <span style={strong}>US and Canada residents are restricted.</span>{" "}
            This is a hard blocker — if you reside in the United States or
            Canada, you cannot use Variational. Don't try to route around it.
          </li>
        </ul>

        <h2 style={sectionH}>About the referral / access code</h2>
        <p style={p}>
          Let's be precise, because this is where a lot of crypto content gets
          dishonest. The <span style={strong}>Variational referral code</span>{" "}
          is an <span style={strong}>access code</span> that lets you onboard
          during the private beta. It is <em>not</em> a fee discount — and it
          can't be, because Variational already charges 0% fees. There's simply
          nothing to discount. Anyone promising you "cheaper trading" with a
          code is misleading you. The only thing a code does is get you in the
          door (and, on our end, attribute the referral).
        </p>

        <h2 style={sectionH}>How to sign up</h2>
        <p style={p}>
          The flow is short:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "decimal" }}>
          <li style={{ marginBottom: 8 }}>
            Get some <span style={strong}>USDC on Arbitrum One</span> (bridge or
            withdraw directly to Arbitrum from a supported exchange).
          </li>
          <li style={{ marginBottom: 8 }}>
            Connect your wallet at <span style={strong}>Variational Omni</span>{" "}
            and enter the access code to unlock onboarding.
          </li>
          <li style={{ marginBottom: 8 }}>
            Deposit your USDC into the trading account.
          </li>
          <li>
            Start trading — and remember every dollar of volume accrues points
            toward the $VAR airdrop.
          </li>
        </ul>

        {/* FAQ */}
        <h2 style={sectionH}>Frequently asked questions</h2>

        <h3 style={sectionH3}>How much does Variational charge?</h3>
        <p style={p}>
          Variational fees are <span style={strong}>0% for both makers and
          takers</span>, permanently. There is no explicit trading fee. Your
          real cost is the bid-ask spread the OLP quotes, since that's how the
          protocol makes money instead of charging fees. On liquid markets the
          spread is tight; on thin or exotic markets it can be wider, so check
          your actual fill.
        </p>

        <h3 style={sectionH3}>Is Variational legit? Who backed it?</h3>
        <p style={p}>
          Variational raised a <span style={strong}>$50M Series A</span> led by{" "}
          <span style={strong}>Dragonfly</span>, with participation from{" "}
          <span style={strong}>Bain Capital Crypto</span> and{" "}
          <span style={strong}>Coinbase Ventures</span>, among others. Its
          contracts have been audited by <span style={strong}>Spearbit</span>{" "}
          and <span style={strong}>Zellic</span>. That's a credible backer and
          audit lineup — though, as with any early protocol, it doesn't
          eliminate risk, and you should size positions accordingly.
        </p>

        <h3 style={sectionH3}>Do I need an access code?</h3>
        <p style={p}>
          Yes. Variational is currently in private beta, so you need an{" "}
          <span style={strong}>access code</span> to onboard. To be clear, this
          is purely an access/referral code — it is not a fee discount, since
          there are no fees to discount.
        </p>

        <h3 style={sectionH3}>Can US residents use Variational?</h3>
        <p style={p}>
          No. <span style={strong}>Residents of the United States and Canada
          are restricted</span> and cannot use Variational. This is a firm
          geographic restriction, not a soft recommendation.
        </p>

        <h3 style={sectionH3}>What is the $VAR airdrop?</h3>
        <p style={p}>
          It's a pre-token points program. Every dollar of volume you trade
          earns points that are expected to convert into a $VAR allocation at
          launch, with a community allocation targeted around ~50% per the
          docs. Final token value is unknown — model it yourself with the{" "}
          <Link
            to="/"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            airdrop calculator
          </Link>
          .
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
          perp DEX category. We build comparison, funding-rate, and airdrop
          tools that cover Variational and other major venues. We disclose that
          we operate a Variational referral link as part of how this project
          sustains itself — it's an access code for the private beta, not a fee
          discount, and it doesn't change your pricing.
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
            Ready to try it?
          </div>
          <div style={{ ...p, margin: 0, color: THEME.text }}>
            Onboard to Variational Omni with the access code below, or first
            model your $VAR points value with the{" "}
            <Link
              to="/"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              airdrop calculator
            </Link>{" "}
            and browse the{" "}
            <Link
              to="/pre-ipo"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              pre-IPO markets
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
