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
const READ_TIME = "9 min read";

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
export default function FundingRateFarmingGuide() {
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
          <div style={eyebrow}>Tutorial · Delta-Neutral Strategies</div>
          <h1 style={h1}>
            Funding-Rate Farming on Variational: A Delta-Neutral Guide
          </h1>
          <p style={subtitle}>
            Funding-rate farming is one of the most reliable ways to earn yield
            in crypto with limited directional risk. This is a step-by-step
            walkthrough of running a delta-neutral funding trade — and why
            Variational's 0% fees make the strategy especially efficient.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Funding Rates · Delta-Neutral · $VAR</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          Most crypto yield comes with a catch: either you take on directional
          risk (buy and pray it goes up), lock capital in an illiquid vault, or
          hand it to a protocol that can rehypothecate it out from under you.{" "}
          <span style={strong}>Funding-rate farming is different.</span> Done
          properly it's market-neutral — you collect a stream of payments from
          the perpetual-futures funding mechanism while your net exposure to
          price stays close to zero.
        </p>
        <p style={p}>
          It's also one of the few strategies where <em>fees</em> decide whether
          you make money at all. And that's where Variational stands out:
          trading fees are <span style={strong}>0% maker and 0% taker</span>, so
          the funding spread you capture isn't quietly eaten by transaction
          costs on every rebalance. This guide walks through funding-rate
          arbitrage from first principles, then shows exactly how to build the
          trade with Variational as one leg.
        </p>

        <h2 style={sectionH}>What funding rates actually are</h2>
        <p style={p}>
          A perpetual future ("perp") is a derivative that tracks a spot price
          with no expiry date. To keep the perp price anchored to spot, every
          venue applies a <span style={strong}>funding rate</span> — a small
          periodic payment exchanged directly between longs and shorts.
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Positive funding</span> — the perp is trading
            above spot (more demand to be long). Longs pay shorts. If you are
            short, you get paid.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Negative funding</span> — the perp is trading
            below spot (more demand to be short). Shorts pay longs. If you are
            long, you get paid.
          </li>
          <li>
            <span style={strong}>Paid periodically</span> — most venues settle
            funding every 1–8 hours. The quoted rate is per interval; annualize
            it to compare across venues.
          </li>
        </ul>
        <p style={p}>
          The key insight: funding is a payment between traders, not a fee to
          the exchange. Whoever is on the paying side loses that yield; whoever
          is on the receiving side earns it. Funding-rate farming is simply{" "}
          <span style={strong}>engineering yourself onto the receiving side
          without taking on price risk.</span>
        </p>

        <h2 style={sectionH}>The delta-neutral idea</h2>
        <p style={p}>
          "Delta" is your exposure to price. A long has positive delta, a short
          has negative delta. If you hold a long <em>and</em> an equal-notional
          short on the same asset, the two deltas cancel: your{" "}
          <span style={strong}>net delta ≈ 0</span>. Price can rip up or dump
          20% and your combined position barely moves in value — the legs offset
          each other.
        </p>
        <p style={p}>
          So why bother holding both sides if they cancel? Because the two legs
          don't earn the same funding. If one venue is paying you to be short
          while another is paying you (or charging you less) to be long, you
          pocket the <span style={strong}>funding-rate spread</span> between
          them. This is funding-rate arbitrage: you're not betting on direction,
          you're harvesting the difference in how two markets price the same
          perpetual.
        </p>
        <p style={p}>
          The two common constructions are{" "}
          <span style={strong}>perp vs. perp</span> (long the venue with cheap/
          negative funding, short the venue with rich/positive funding) and{" "}
          <span style={strong}>spot vs. perp</span> (hold spot, short the perp
          when funding is positive). Both keep net delta near zero; the perp-vs-
          perp version is what the{" "}
          <Link
            to="/rates"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            funding-rate comparison tool
          </Link>{" "}
          is built to surface.
        </p>

        <h2 style={sectionH}>Why Variational is a strong leg</h2>
        <p style={p}>
          Fees are the number-one drag on delta-neutral trades. You're capturing
          a spread that might be a few percent annualized, and you pay fees{" "}
          <em>twice</em> — once to open each leg, again to close, plus more on
          every rebalance. On a strategy you run thousands of times, a 0.05% fee
          per side compounds into the difference between a profitable book and a
          break-even one.
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>0% maker and 0% taker fees.</span> Variational
            doesn't charge trading fees in either direction. The Omni Liquidity
            Provider (OLP) monetizes the bid/ask spread it quotes, not a per-
            trade fee. Lower fees mean the funding spread you keep is bigger.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>USDC on Arbitrum.</span> Collateral is USDC
            settled on Arbitrum — cheap gas, fast finality, and a stablecoin you
            can move in and out without conversion friction.
          </li>
          <li>
            <span style={strong}>Portfolio margin.</span> Margin is assessed
            across your whole book rather than position-by-position, so a
            hedged, near-delta-neutral position is more capital-efficient than
            it would be under isolated margin.
          </li>
        </ul>
        <p style={p}>
          None of this is a "discount" and there's no fee coupon to redeem — the
          0% rate is simply how the venue works for every user.
        </p>

        <h2 style={sectionH}>The $VAR airdrop stack — the real edge</h2>
        <p style={p}>
          Here's the part that makes funding-rate farming on Variational a{" "}
          <span style={strong}>double yield</span> rather than a single one.
          Variational is pre-token. Every dollar of volume you trade also earns
          points toward the future <span style={strong}>$VAR token
          airdrop</span>, with the community allocation targeted around ~50% per
          Variational's docs.
        </p>
        <p style={p}>
          Stack the two together and a single delta-neutral funding trade earns
          you:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 8 }}>
            <span style={strong}>(a) the funding-rate spread</span> — the
            market-neutral yield the strategy is designed to capture, and
          </li>
          <li>
            <span style={strong}>(b) airdrop points on the notional</span> —
            because the Variational leg's volume counts toward $VAR regardless
            of whether the trade is directional or hedged.
          </li>
        </ul>
        <p style={p}>
          Delta-neutral farmers turn over a lot of notional relative to the
          capital they risk, which is precisely the profile that accrues airdrop
          points efficiently. You can model what those points might be worth with
          the{" "}
          <Link to="/">airdrop calculator on the home page</Link> — plug in your
          expected volume and a hypothetical $VAR value to see the second layer
          of yield on top of the funding spread.
        </p>

        <div style={callout}>
          The fee you DON'T pay is the yield you DO keep. On a delta-neutral
          trade run thousands of times, 0% versus 0.05% per side isn't a rounding
          error — it's the whole edge. Then $VAR points on the same notional are
          pure upside stacked on top.
        </div>

        <h2 style={sectionH}>Step-by-step: building the trade</h2>

        <h3 style={sectionH3}>1. Find a spread</h3>
        <p style={p}>
          Open the{" "}
          <Link
            to="/rates"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            funding-rate comparison tool
          </Link>{" "}
          and look for an asset where Variational's funding diverges meaningfully
          from a CEX or another DEX. The bigger and more persistent the gap, the
          better the trade. Illustratively: if Variational is paying{" "}
          <span style={strong}>+10%/yr</span> to shorts on an asset while a CEX
          is paying <span style={strong}>−20%/yr</span> to longs, the spread you
          can harvest is roughly <span style={strong}>30%/yr</span> — clearly
          hypothetical, but that's the shape of the opportunity.
        </p>

        <h3 style={sectionH3}>2. Decide direction</h3>
        <p style={p}>
          Short the venue paying high (positive) funding — you collect from the
          longs there. Long the venue paying low or negative funding — you
          collect from the shorts there, or at minimum pay very little. In the
          example above you'd short on Variational and long on the CEX, capturing
          both sides of the spread.
        </p>

        <h3 style={sectionH3}>3. Size both legs to equal notional</h3>
        <p style={p}>
          Match the dollar notional of the long and the short so the deltas
          cancel and your net delta ≈ 0. If one leg is $10,000 notional, the
          other should be $10,000 notional too. Unequal legs reintroduce
          directional risk — the whole point is that a price move on one side is
          offset by the other.
        </p>

        <h3 style={sectionH3}>4. Open the legs</h3>
        <p style={p}>
          Open the Variational leg first — 0% fees mean no cost drag on entry —
          using the access code below. Then open the hedge leg on the other
          venue. Try to execute the two close together in time so you aren't
          briefly exposed to a price move between fills.
        </p>

        <h3 style={sectionH3}>5. Collect, monitor, rebalance</h3>
        <p style={p}>
          Funding accrues over time on both legs. Check in periodically:
          confirm the spread is still positive, and if price has drifted enough
          that your legs are no longer equal notional, rebalance to restore net-
          zero delta. Variational's 0% fees make rebalancing essentially free,
          which is a real structural advantage over fee-charging venues where
          each adjustment costs you.
        </p>

        <h3 style={sectionH3}>6. Close when the spread compresses</h3>
        <p style={p}>
          Funding spreads mean-revert. When the gap narrows to the point where
          it no longer compensates you for the operational effort and residual
          risk, unwind both legs and redeploy the capital to the next spread the{" "}
          <Link
            to="/rates"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            comparison tool
          </Link>{" "}
          surfaces.
        </p>

        <h2 style={sectionH}>Risks & practicalities</h2>
        <p style={p}>
          Delta-neutral is not risk-free. It's directionally hedged, which is
          not the same thing. Know these before sizing up:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Funding can flip.</span> The spread that was
            paying you can invert. Monitor it; a trade that was profitable
            yesterday can start costing you today.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Leg risk and execution slippage.</span> If one
            leg fills at a worse price than the other, or one venue is
            momentarily illiquid, you take on unintended delta and cost. The gap
            between opening the two legs is your most exposed moment.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Liquidation risk.</span> Each leg uses margin.
            A sharp move can liquidate the losing leg even though your <em>net</em>{" "}
            position is hedged — if that happens you're suddenly one-sided. Keep
            margin buffers well above the minimum on both venues.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Basis risk.</span> The two venues can price the
            same asset slightly differently, and those bases can widen at
            exactly the wrong time. Your hedge is close to perfect, not perfect.
          </li>
          <li>
            <span style={strong}>Eligibility.</span> To be straight with you:
            residents of the United States and Canada are restricted persons and
            cannot access Variational. Check that you're eligible before building
            any of this.
          </li>
        </ul>

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
          This article is educational and is <span style={strong}>not
          financial advice.</span> Funding-rate farming involves real risk,
          including loss of capital; do your own research and size positions
          responsibly. tryvariational is an independent research and tooling site
          for the perp DEX category — we build{" "}
          <Link to="/rates" style={{ color: THEME.accent, textDecoration: "underline" }}>
            funding-rate
          </Link>
          ,{" "}
          <Link to="/pre-ipo" style={{ color: THEME.accent, textDecoration: "underline" }}>
            pre-IPO
          </Link>
          , and{" "}
          <Link to="/" style={{ color: THEME.accent, textDecoration: "underline" }}>
            airdrop
          </Link>{" "}
          tools that cover Variational and other major venues. We disclose that
          we operate a Variational referral link as part of how this project
          sustains itself; the referral code is an access code, and the standard
          referral share goes to us as the referrer, not to you as a fee
          discount.
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
            Spot a live funding spread on the{" "}
            <Link
              to="/rates"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              funding-rate comparison tool
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
