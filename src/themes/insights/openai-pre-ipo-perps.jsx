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
export default function OpenAIPreIpoPerps() {
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
          <h1 style={h1}>How to Get OpenAI Pre-IPO Exposure in 2026</h1>
          <p style={subtitle}>
            OpenAI is one of the most valuable private companies on earth, and
            almost everyone wants a position before it goes public. For retail,
            the legitimate paths are gated shut. Here's how synthetic pre-IPO
            perpetuals open a door — and how to trade the OpenAI market on
            Variational.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>OpenAI · Pre-IPO · Variational</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          OpenAI is, by most accounts, one of the most valuable private
          companies in the world — reportedly valued in the hundreds of
          billions of dollars in its most recent private rounds. It is also the
          single name that shows up most often when people ask{" "}
          <em>"how do I invest in OpenAI before the IPO?"</em> The honest answer,
          for the vast majority of investors, has always been:{" "}
          <span style={strong}>you can't.</span>
        </p>
        <p style={p}>
          OpenAI stock does not trade on any exchange. There is no ticker to
          buy. The company is private, capped-profit in structure, and the
          shares that do exist are locked inside a small circle of employees,
          early investors, and strategic partners. Alongside Anthropic, it is
          one of the last marquee AI names still on the private side of the
          line. So the demand is enormous and the supply, for ordinary
          investors, is effectively zero. That gap is exactly why{" "}
          <span style={strong}>pre-IPO perpetuals</span> exist.
        </p>

        <h2 style={sectionH}>The traditional ways — and why they're gated</h2>
        <p style={p}>
          There are real ways to buy private OpenAI-style exposure. The problem
          isn't that they don't exist — it's that almost every one of them is
          built to keep retail out.
        </p>

        <h3 style={sectionH3}>Secondary marketplaces</h3>
        <p style={p}>
          Platforms like Forge Global, EquityZen, and Hiive match sellers of
          private shares (usually ex-employees) with buyers. In practice they
          require you to be an{" "}
          <span style={strong}>accredited investor</span> — an income or
          net-worth bar most people don't clear — plus large minimums that often
          run into five or six figures per allocation. Even if you qualify,
          you're subject to lockups, transfer restrictions the company can veto,
          and settlement that can take weeks. And critically:{" "}
          <span style={strong}>you can only go long.</span> There is no way to
          short a name you think is overvalued.
        </p>

        <h3 style={sectionH3}>SPVs and pooled vehicles</h3>
        <p style={p}>
          Special-purpose vehicles pool investor money to buy a private
          allocation. They lower the per-person minimum somewhat, but they stack
          on{" "}
          <span style={strong}>management fees, carry, and layers of
          intermediary spread</span>{" "}
          that quietly eat returns — and you're still trusting the SPV operator's
          access and pricing. You typically can't exit until the underlying does.
        </p>

        <h3 style={sectionH3}>Employee shares</h3>
        <p style={p}>
          The most direct exposure — actual equity or options — is reserved for
          people who work there. Unless you're on OpenAI's cap table, that door
          is simply closed. Full stop.
        </p>

        <div style={callout}>
          The pattern across all three is the same: accreditation gates, high
          minimums, long lockups, and no way to express a bearish view. Private
          markets were designed for institutions and insiders — not for a
          trader who wants a small, liquid, two-directional position.
        </div>

        <h2 style={sectionH}>How pre-IPO perpetuals work</h2>
        <p style={p}>
          A pre-IPO perpetual is a{" "}
          <span style={strong}>synthetic, oracle-priced derivative</span> that
          tracks a private company's valuation without you ever holding a share
          of it. There is no equity, no cap-table entry, no transfer agent. You
          are trading a contract whose price is fed by an oracle that references
          private secondary-market marks — the same kind of prints that clear on
          the secondary platforms above — and rolls them into a continuous,
          tradable price.
        </p>
        <p style={p}>
          Because it's a perpetual contract rather than actual stock, the
          properties are completely different from buying private shares:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>No accreditation.</span> You don't need to be
            an accredited investor to open a position.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Long or short.</span> You can express a bearish
            view on the valuation — impossible on a secondary marketplace.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>24/7, small size.</span> Trade any hour, in
            sizes that make sense for you, instead of a five-figure minimum
            allocation.
          </li>
          <li>
            <span style={strong}>Leverage available.</span> You can scale
            exposure up or down with margin rather than committing full notional.
          </li>
        </ul>
        <p style={p}>
          The trade-off to be clear-eyed about:{" "}
          <span style={strong}>this is synthetic exposure, not ownership.</span>{" "}
          You are not buying a claim on OpenAI. You are taking a position on a
          price feed. That has its own risks (covered below), but it is also
          precisely what makes the exposure accessible in the first place.
        </p>

        <h2 style={sectionH}>Trading OpenAI on Variational</h2>
        <p style={p}>
          Variational lists an{" "}
          <code
            style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}
          >
            OPENAI
          </code>{" "}
          pre-IPO market as one of its RFQ-quoted contracts. A few specifics
          that matter for anyone actually placing the trade:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Zero trading fees.</span> 0% maker{" "}
            <em>and</em> 0% taker. Variational's liquidity provider (the OLP)
            monetizes the bid/ask spread rather than charging fees. You don't
            pay a per-trade commission on either side.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>USDC collateral on Arbitrum.</span> You post
            USDC on Arbitrum One — no exotic collateral, no bridging gymnastics.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Up to 50x leverage.</span> Available on
            supported markets, so you can size exposure to your conviction and
            risk tolerance.
          </li>
          <li>
            <span style={strong}>Portfolio margin.</span> Positions are
            margined together, so offsetting exposure is treated efficiently
            rather than each leg being collateralized in isolation.
          </li>
        </ul>
        <p style={p}>
          One thing to be direct about, because it gets misrepresented
          elsewhere:{" "}
          <span style={strong}>
            there is no "discount" on entering the OpenAI market.
          </span>{" "}
          The referral code below is an <em>access</em> code that gets you into
          the platform — it is not a price cut, a rebate on your fill, or a coupon
          on the valuation. Fees are already zero for everyone; the code doesn't
          change your entry price.
        </p>

        <h2 style={sectionH}>The $VAR airdrop bonus</h2>
        <p style={p}>
          Here's the part that makes trading OpenAI on Variational specifically
          compelling. Variational is{" "}
          <span style={strong}>pre-token</span>, and every dollar of volume you
          trade earns points toward the future{" "}
          <code
            style={{ fontFamily: FONTS.mono, fontSize: "0.94em", color: THEME.accent }}
          >
            $VAR
          </code>{" "}
          token airdrop. Per Variational's own documentation, the community
          allocation is targeted around roughly 50% of supply — a large share
          earmarked for the traders who use the platform early.
        </p>
        <p style={p}>
          That means when you put on an OpenAI position, you're doing two things
          at once:{" "}
          <span style={strong}>
            getting the pre-IPO exposure you came for, and farming the airdrop
            with the same volume.
          </span>{" "}
          The trading fees are zero, so the volume you generate to build your
          position is also the volume that accrues points. You can model what
          that could be worth with the{" "}
          <Link to="/" style={{ color: THEME.accent, textDecoration: "underline" }}>
            airdrop calculator on the home page
          </Link>
          .
        </p>

        <h2 style={sectionH}>The risks — read this part</h2>
        <p style={p}>
          Synthetic pre-IPO exposure is genuinely useful, but it is not the same
          risk profile as owning stock. Be honest with yourself about the
          following before you size a position.
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Synthetic / oracle risk.</span> The price you
            trade is only as good as the oracle feeding it. Private marks are
            infrequent and can be stale or thin; the contract references them,
            not a live, liquid public tape.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Funding costs.</span> Perpetuals carry funding
            payments between longs and shorts. Holding a position over time has
            an ongoing cost (or credit) that can add up — check current funding
            on our{" "}
            <Link to="/rates" style={{ color: THEME.accent, textDecoration: "underline" }}>
              rates tool
            </Link>{" "}
            before you commit.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Leverage and liquidation.</span> Up to 50x
            cuts both ways. A sharp move against a levered position can liquidate
            you before the thesis ever plays out.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Valuation gaps.</span> The perp price can drift
            from where private shares actually change hands. A synthetic mark and
            a real secondary print are not guaranteed to converge on your
            timeline.
          </li>
          <li>
            <span style={strong}>Eligibility.</span> Residents of the United
            States and Canada are restricted persons and{" "}
            <span style={strong}>cannot access Variational.</span> This is a hard
            requirement, not a suggestion — if you're in those jurisdictions,
            this product is not available to you.
          </li>
        </ul>

        <h2 style={sectionH}>How to start</h2>
        <p style={p}>
          If you're eligible and you understand the risks, the actual mechanics
          are short:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "decimal" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Get USDC.</span> Buy USDC on any exchange or
            on-ramp you already use.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Withdraw on Arbitrum One.</span> Send it to
            your wallet directly on the Arbitrum One network — no bridging step
            required if you withdraw on-network.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Connect at Variational Omni.</span> Open
            Variational Omni, connect your wallet, and enter the access code.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Deposit.</span> Move your USDC into the
            protocol as collateral.
          </li>
          <li>
            <span style={strong}>Trade the OPENAI market.</span> Go long or
            short, size it sensibly, and remember every dollar of that volume is
            also accruing toward the $VAR airdrop.
          </li>
        </ul>

        <p style={p}>
          For the wider context on which private names are tradable and how
          on-chain pre-IPO markets are developing, see our{" "}
          <Link to="/pre-ipo" style={{ color: THEME.accent, textDecoration: "underline" }}>
            pre-IPO overview
          </Link>
          . And note that as of mid-2026, SpaceX has already gone public — so
          the marquee names still on the private side are OpenAI and Anthropic,
          not the whole 2024 vintage of "pre-IPO" darlings.
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
          <Link to="/pre-ipo" style={{ color: THEME.accent, textDecoration: "underline" }}>
            pre-IPO
          </Link>
          ,{" "}
          <Link to="/rates" style={{ color: THEME.accent, textDecoration: "underline" }}>
            funding-rate
          </Link>
          , and airdrop{" "}
          <Link to="/" style={{ color: THEME.accent, textDecoration: "underline" }}>
            calculator
          </Link>{" "}
          tools that cover Variational and other major venues. Nothing here is
          financial advice — synthetic pre-IPO perpetuals carry real risk and
          are not available to US or Canadian residents. We disclose that we
          operate a Variational referral link as part of how this project
          sustains itself.
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
            Trade the OpenAI market
          </div>
          <div style={{ ...p, margin: 0, color: THEME.text }}>
            Get synthetic OpenAI pre-IPO exposure with zero trading fees and
            farm the $VAR airdrop on the same volume. Read the full{" "}
            <Link
              to="/pre-ipo"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              pre-IPO overview
            </Link>
            , or model your airdrop value with the{" "}
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
