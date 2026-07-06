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
const READ_TIME = "10 min read";

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

/* ─── Table styles ───────────────────────────────────────────────── */
const table = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse",
  fontFamily: FONTS.body,
  fontSize: "0.92rem",
  margin: "8px 0 4px",
};

const th = {
  textAlign: "left",
  padding: "10px 14px",
  borderBottom: `1px solid ${THEME.accent}44`,
  color: THEME.text,
  fontFamily: FONTS.mono,
  fontSize: "0.74rem",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontWeight: 600,
  verticalAlign: "bottom",
};

const td = {
  padding: "11px 14px",
  borderBottom: `1px solid ${THEME.hairline}`,
  color: THEME.textDim,
  verticalAlign: "top",
  lineHeight: 1.5,
};

const tdLabel = {
  ...td,
  color: THEME.text,
  fontWeight: 600,
};

const linkStyle = { color: THEME.accent, textDecoration: "underline" };

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
export default function BestPreIpoPlatforms() {
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
          <div style={eyebrow}>Comparison · Pre-IPO Access</div>
          <h1 style={h1}>
            Best Ways to Buy Pre-IPO Stock in 2026: Forge vs EquityZen vs Hiive
            vs Perps
          </h1>
          <p style={subtitle}>
            Everyone wants exposure to OpenAI and Anthropic before they list.
            There are two fundamentally different routes — buying real secondary
            shares, or trading synthetic perps — and they serve completely
            different investors. Here's an honest side-by-side.
          </p>
          <div style={byline}>
            <span>By the tryvariational research team</span>
            <span style={bylineDot} />
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_DISPLAY}</time>
            <span style={bylineDot} />
            <span>{READ_TIME}</span>
            <span style={bylineDot} />
            <span style={tagPill}>Forge · EquityZen · Hiive · Variational</span>
          </div>
        </header>

        {/* Body */}
        <p style={p}>
          The most-searched question in private markets right now is some
          version of <em>"how do I invest in OpenAI?"</em> or{" "}
          <em>"how do I buy Anthropic stock before the IPO?"</em> The biggest AI
          companies of the decade are still private, and the demand for pre-IPO
          exposure has never been higher. The problem is that the traditional
          answer has always come with a wall around it.
        </p>
        <p style={p}>
          There are really only two ways to get exposure, and they are
          fundamentally different products:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Buy actual secondary shares</span> through an
            accredited-investor marketplace like Forge Global, EquityZen, or
            Hiive. You end up owning real equity in the company.
          </li>
          <li>
            <span style={strong}>Trade a synthetic perpetual</span> on a venue
            like Variational, Hyperliquid xyz, or Lighter. You get price
            exposure through a derivative — no equity, but no accreditation gate
            either.
          </li>
        </ul>
        <p style={p}>
          Both are legitimate. Which one is <em>best for you</em> depends
          entirely on whether you qualify for the first route and what you
          actually want out of the position. This guide compares all of them
          fairly.
        </p>

        <h2 style={sectionH}>Route 1: Buy real secondary shares</h2>
        <p style={p}>
          These marketplaces are the established, reputable way to acquire
          actual equity in a private company before it goes public. Their core
          advantage is real and worth stating up front:{" "}
          <span style={strong}>
            you own genuine shares (or an interest in a fund that holds them),
          </span>{" "}
          with all the upside — and voting/economic rights via the structure —
          that implies. A perp cannot give you that.
        </p>

        <h3 style={sectionH3}>Forge Global</h3>
        <p style={p}>
          Forge is one of the largest and most established secondary
          marketplaces for private-company stock. It connects sellers of
          employee/early-investor shares with buyers, and provides data and
          settlement infrastructure for private markets. Access is for{" "}
          <span style={strong}>accredited investors</span>, minimums tend to be
          high, and transactions involve company approval, transfer processes,
          and settlement timelines rather than instant fills. It's long-only:
          you buy shares hoping the valuation rises. For qualifying investors who
          want durable equity ownership, it's a serious venue.
        </p>

        <h3 style={sectionH3}>EquityZen</h3>
        <p style={p}>
          EquityZen offers a similar proposition, frequently through
          SPV/fund structures where you buy into a vehicle that holds the
          underlying shares. This lets it package access with somewhat lower
          entry points than a direct block, but it remains{" "}
          <span style={strong}>accredited-only</span>, still carries meaningful
          minimums, and the positions are illiquid — you generally hold until a
          liquidity event such as an IPO or acquisition. Long-only, real
          exposure to the underlying.
        </p>

        <h3 style={sectionH3}>Hiive</h3>
        <p style={p}>
          Hiive runs a marketplace that connects buyers and sellers of private
          shares directly, with a more transparent, exchange-like listing
          experience than the traditional broker-negotiated model.
          Accreditation is typically required, and — like the others — it is
          long-only and settlement is a process, not a click. Traders who like
          seeing live bids and asks on private names often prefer its interface.
        </p>

        <h2 style={sectionH}>The common gate: accreditation</h2>
        <p style={p}>
          Here is the single fact that shapes this entire market. All three of
          these marketplaces —{" "}
          <span style={strong}>Forge, EquityZen, and Hiive</span> — require you
          to be an <span style={strong}>accredited investor</span>. This is a
          well-established regulatory reality, not a marketing quirk. In the US,
          accreditation generally means clearing high income thresholds (roughly
          $200k individual / $300k joint annual income) or a net worth over $1M
          excluding your primary residence.
        </p>
        <p style={p}>
          For the majority of retail investors, that gate is closed before the
          conversation even starts. On top of it, minimums are large, you can
          only go <span style={strong}>long</span>, and once you're in, the
          position is <span style={strong}>illiquid</span> — there's no exit
          button until a liquidity event or a willing secondary buyer appears.
          None of this is a knock on these platforms; it's simply who they are
          built to serve.
        </p>

        <h2 style={sectionH}>Route 2: Pre-IPO perpetuals</h2>
        <p style={p}>
          The second route is newer and structurally different. A{" "}
          <span style={strong}>pre-IPO perpetual</span> is a derivative that
          tracks an oracle valuation of a private company. You're not buying
          shares — you're taking a synthetic position on where the market thinks
          the company is valued. Venues offering these include{" "}
          <span style={strong}>Variational</span>,{" "}
          <span style={strong}>Hyperliquid xyz</span>, and{" "}
          <span style={strong}>Lighter</span>.
        </p>
        <p style={p}>The trade-offs cut the opposite way from the marketplaces:</p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "disc" }}>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>No accreditation required</span> — it's a
            crypto derivative, open to anyone who can access the venue.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Small size</span> — position in whatever amount
            you like, not a five- or six-figure minimum.
          </li>
          <li style={{ marginBottom: 10 }}>
            <span style={strong}>Long or short</span> — you can express a
            bearish view, something no secondary marketplace lets you do.
          </li>
          <li>
            <span style={strong}>24/7 and liquid</span> — enter and exit any
            time, rather than waiting for a liquidity event.
          </li>
        </ul>
        <p style={p}>
          The honest trade-off:{" "}
          <span style={strong}>
            you do not own any equity in OpenAI or Anthropic.
          </span>{" "}
          A perp is a bet on the price, settled in USDC, referencing an oracle
          valuation. If your goal is to <em>own a piece of the company</em>, the
          marketplaces are the only route. If your goal is{" "}
          <em>exposure to the price</em> without the accreditation wall, perps
          are the only route.
        </p>

        <h2 style={sectionH}>Side-by-side comparison</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}></th>
                <th style={th}>Forge / EquityZen / Hiive</th>
                <th style={th}>Pre-IPO Perps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdLabel}>Accreditation required</td>
                <td style={td}>Yes — accredited only</td>
                <td style={td}>No</td>
              </tr>
              <tr>
                <td style={tdLabel}>Minimum size</td>
                <td style={td}>High minimums</td>
                <td style={td}>Small — trade any size</td>
              </tr>
              <tr>
                <td style={tdLabel}>Long / short</td>
                <td style={td}>Long only</td>
                <td style={td}>Long or short</td>
              </tr>
              <tr>
                <td style={tdLabel}>Liquidity</td>
                <td style={td}>Illiquid until a liquidity event</td>
                <td style={td}>Liquid, 24/7</td>
              </tr>
              <tr>
                <td style={tdLabel}>Own actual equity?</td>
                <td style={td}>Yes — real shares</td>
                <td style={td}>No — synthetic derivative</td>
              </tr>
              <tr>
                <td style={tdLabel}>Fees</td>
                <td style={td}>Transaction / platform fees vary</td>
                <td style={td}>
                  Low; 0% trading fees on Variational (spread-based)
                </td>
              </tr>
              <tr>
                <td style={tdLabel}>Access</td>
                <td style={td}>Accredited investors, KYC, approvals</td>
                <td style={td}>Open — connect a wallet</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: "0.9rem", color: THEME.muted, marginTop: 12 }}>
          Neither column is "better" in the abstract. They're built for
          different people with different goals — ownership on one side, open
          access and flexibility on the other.
        </p>

        <h2 style={sectionH}>
          How to invest in OpenAI or Anthropic without accreditation
        </h2>
        <p style={p}>
          If you're not an accredited investor — which is most people — the
          secondary marketplaces simply aren't available to you. The practical
          answer to <em>"how do I invest in OpenAI"</em> or{" "}
          <em>"how do I buy Anthropic stock"</em> without clearing that gate is
          a pre-IPO perpetual. The workflow is short:
        </p>
        <ul style={{ ...p, paddingLeft: 22, listStyle: "decimal" }}>
          <li style={{ marginBottom: 8 }}>
            Fund a wallet with USDC (Variational settles in USDC on Arbitrum).
          </li>
          <li style={{ marginBottom: 8 }}>
            Open the venue and find the pre-IPO market — e.g. an{" "}
            <code
              style={{
                fontFamily: FONTS.mono,
                fontSize: "0.94em",
                color: THEME.accent,
              }}
            >
              OPENAI
            </code>{" "}
            or{" "}
            <code
              style={{
                fontFamily: FONTS.mono,
                fontSize: "0.94em",
                color: THEME.accent,
              }}
            >
              ANTHROPIC
            </code>{" "}
            perpetual.
          </li>
          <li style={{ marginBottom: 8 }}>
            Take a long (or short) position in the size you want, and manage it
            like any other perp.
          </li>
        </ul>
        <p style={p}>
          For a full walkthrough of each name, read our{" "}
          <Link to="/insights/openai-pre-ipo-perps" style={linkStyle}>
            OpenAI guide
          </Link>{" "}
          and{" "}
          <Link to="/insights/anthropic-pre-ipo-perps" style={linkStyle}>
            Anthropic guide
          </Link>
          . Just keep the distinction clear: this is price exposure through a
          derivative, not share ownership.
        </p>

        <div style={callout}>
          The irony of private markets in 2026: the incumbents built the best
          infrastructure for owning pre-IPO shares in the world's most exciting
          companies — and then, entirely by regulation, reserved it for the
          accredited few. Pre-IPO perps opened the same names — OpenAI,
          Anthropic — to everyone else. Different instrument, same underlying
          bet.
        </div>

        <h2 style={sectionH}>Why Variational among the perp venues</h2>
        <p style={p}>
          If you go the perp route, the venue still matters. Variational stands
          out on a few fronts. First, <span style={strong}>fees</span>:
          Variational charges 0% trading fees in both directions — the Omni
          Liquidity Provider (OLP) monetizes the spread rather than billing you
          per trade. Second, it settles in{" "}
          <span style={strong}>USDC on Arbitrum</span>, so your collateral is a
          familiar stablecoin on cheap, fast infrastructure.
        </p>
        <p style={p}>
          Third — and this is the part that doesn't exist anywhere in the
          traditional route — every trade you place currently{" "}
          <span style={strong}>farms the $VAR airdrop</span>. You can estimate
          what that's worth for your expected volume with the{" "}
          <Link to="/" style={linkStyle}>
            airdrop calculator
          </Link>
          . New accounts open with an{" "}
          <span style={strong}>access code</span> (it unlocks entry to the app —
          it is not a discount or a fee reduction), and ours is{" "}
          <code
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.94em",
              color: THEME.accent,
            }}
          >
            {REFERRAL_CODE}
          </code>
          .
        </p>

        <h2 style={sectionH}>Frequently asked questions</h2>

        <h3 style={sectionH3}>What is the best pre-IPO platform?</h3>
        <p style={p}>
          There's no single best platform — it depends on whether you're
          accredited and what you want. If you're accredited and want to{" "}
          <em>own real shares</em>, Forge, EquityZen, and Hiive are the
          established venues. If you're not accredited, or you want small size,
          the ability to go short, and 24/7 liquidity, a pre-IPO perpetual on a
          venue like Variational is the practical option. Best is a function of
          your eligibility and your goal, not a universal ranking.
        </p>

        <h3 style={sectionH3}>Which is better, Forge or Hiive?</h3>
        <p style={p}>
          Both are reputable secondary marketplaces for accredited investors,
          and both give you real equity exposure. Forge is one of the largest
          and most established, with deep data and settlement infrastructure.
          Hiive offers a more transparent, exchange-like listing experience that
          many buyers prefer for price discovery. Neither is universally
          "better" — it comes down to the specific names listed, the deal terms,
          and which interface suits you. Both share the same accreditation gate.
        </p>

        <h3 style={sectionH3}>Can I invest in Anthropic on Robinhood?</h3>
        <p style={p}>
          Generally, no — you can't buy Anthropic's private shares directly on a
          standard retail brokerage like Robinhood, because the company is still
          private and its stock isn't listed on a public exchange. Retail
          brokerages trade public securities. To get exposure before an IPO
          without accreditation, the available route is a pre-IPO perpetual that
          tracks Anthropic's oracle valuation — a derivative, not share
          ownership. See our{" "}
          <Link to="/insights/anthropic-pre-ipo-perps" style={linkStyle}>
            Anthropic guide
          </Link>{" "}
          for how that works.
        </p>

        <h3 style={sectionH3}>
          Do I need to be an accredited investor to trade pre-IPO perps?
        </h3>
        <p style={p}>
          No. That's the core structural difference. Pre-IPO perpetuals are
          crypto derivatives, not private securities, so they don't carry the
          accredited-investor requirement that Forge, EquityZen, and Hiive do.
          You take on the trade-off that you own no equity — the position is
          synthetic and references an oracle valuation — but you don't have to
          clear the income or net-worth thresholds to participate.
        </p>

        <h3 style={sectionH3}>
          Is a pre-IPO perp the same as owning the stock?
        </h3>
        <p style={p}>
          No. Owning secondary shares through Forge, EquityZen, or Hiive gives
          you a real economic interest in the company that pays out at a
          liquidity event. A perp is a derivative: you gain or lose based on the
          oracle valuation while your position is open, settled in USDC. Same
          directional bet, very different instrument — and worth understanding
          before you size up.
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
          tryvariational is an independent research and tooling site for the
          perp DEX category. Forge Global, EquityZen, and Hiive are legitimate,
          reputable secondary marketplaces that provide real equity ownership to
          accredited investors — a genuine advantage that perps do not offer. We
          disclose that we operate a Variational referral link as part of how
          this project sustains itself. Nothing here is financial, investment,
          or legal advice; derivatives carry risk, and you should do your own
          research before trading. Note that Variational is not available to
          residents of the United States or Canada, who are restricted persons
          under its terms.
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
            See the live pre-IPO perp markets and how they price on our{" "}
            <Link to="/pre-ipo" style={linkStyle}>
              pre-IPO overview
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
