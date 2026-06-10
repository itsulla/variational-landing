import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";
import CopyCode from "../../components/CopyCode.jsx";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  RATES_API_BASE,
  RECENT_LISTINGS,
} from "../../config.js";

/* ─── Theme: dark editorial with a "moonshot" accent ─────────────── */
const THEME = {
  bg: "#080b14",
  bgAlt: "#0e1322",
  text: "#eef1f8",
  textDim: "#c3cbdc",
  accent: "#7dd3fc",
  accent2: "#c4b5fd",
  positive: "#34d399",
  muted: "#8b95ab",
  hairline: "#1d2538",
};

const FONTS = {
  heading: "'Outfit', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

/* The three flagship pre-IPO perps — all verified live on the
 * Variational stats API. SPCX context: SpaceX IPO targeted June 12,
 * 2026 at a $135 reference price (~$1.77T valuation). */
const PRE_IPO_MARKETS = [
  {
    ticker: "SPCX",
    company: "SpaceX",
    blurb:
      "The most anticipated IPO on record — targeted for June 12, 2026 at a ~$1.77T valuation. SPCX perps track the implied pre-IPO price 24/7 and convert to regular stock perps after listing.",
    tag: "IPO imminent",
    tagColor: "#fbbf24",
  },
  {
    ticker: "OPENAI",
    company: "OpenAI",
    blurb:
      "Private-market exposure to the company behind ChatGPT — no accreditation, no secondary-market lockups, no broker. Long or short, your call.",
    tag: "AI giant",
    tagColor: "#7dd3fc",
  },
  {
    ticker: "ANTHROPIC",
    company: "Anthropic",
    blurb:
      "The Claude maker's valuation has been one of the fastest-rising in private markets. Trade the trajectory before any public listing exists.",
    tag: "AI giant",
    tagColor: "#c4b5fd",
  },
];

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "Synthetic exposure, real settlement",
    body:
      "Pre-IPO perps are derivatives that track a reference valuation via funding rates and oracle price feeds — no actual shares change hands. You get price exposure without accreditation requirements or secondary-market paperwork.",
  },
  {
    n: 2,
    title: "Long or short, 24/7",
    body:
      "Unlike locked-up secondary shares, perps trade around the clock and work in both directions. Think the IPO pops? Go long. Think the valuation is frothy? Short it.",
  },
  {
    n: 3,
    title: "Converts at IPO",
    body:
      "When the company lists publicly, the pre-IPO perp transitions into a standard stock perpetual tracking the live market price — your position carries through the event.",
  },
  {
    n: 4,
    title: "Know the risks",
    body:
      "Pre-IPO perps are volatile by construction: the reference price is model-driven until real price discovery exists. SPCX moved $135 → $216 → -45% within days of launch across venues. Variational caps these markets at lower leverage and fixes funding at 0.005%/8h until IPO. Size accordingly.",
  },
];

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

export default function PreIpoTheme() {
  const [marketCount, setMarketCount] = useState(475);

  useEffect(() => {
    injectFonts();
    window.scrollTo(0, 0);
    /* Live market count via our API proxy (cached server-side) */
    fetch(`${RATES_API_BASE}/api/compare/three?window=ytd`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const v = d?.protocols?.find((p) => p.slug === "variational");
        if (v?.markets_count) setMarketCount(v.markets_count);
      })
      .catch(() => {});
  }, []);

  const container = { maxWidth: 980, margin: "0 auto", padding: "0 24px" };

  const h2 = {
    fontFamily: FONTS.heading,
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    margin: "0 0 20px",
  };

  const preIpoListings = RECENT_LISTINGS.filter((l) => l.type === "Pre-IPO");
  const otherListings = RECENT_LISTINGS.filter((l) => l.type !== "Pre-IPO");

  return (
    <div
      style={{
        background: THEME.bg,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: FONTS.body,
      }}
    >
      {/* ───── HERO ───── */}
      <section
        style={{
          padding: "72px 0 56px",
          background: `radial-gradient(ellipse 90% 60% at 50% -10%, ${THEME.accent}18, transparent)`,
        }}
      >
        <div style={{ ...container, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: 999,
              border: `1px solid ${THEME.accent}44`,
              background: `${THEME.accent}10`,
              fontFamily: FONTS.mono,
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: THEME.accent,
              marginBottom: 22,
            }}
          >
            Pre-IPO Perpetuals · Live Now
          </div>
          <h1
            style={{
              fontFamily: FONTS.heading,
              fontSize: "clamp(2.1rem, 5vw, 3.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.12,
              margin: "0 0 20px",
            }}
          >
            Trade{" "}
            <span style={{ color: THEME.accent }}>SpaceX</span>,{" "}
            <span style={{ color: THEME.accent2 }}>OpenAI</span> &{" "}
            <span style={{ color: THEME.accent2 }}>Anthropic</span>
            <br />
            before they go public.
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              lineHeight: 1.65,
              color: THEME.textDim,
              maxWidth: 640,
              margin: "0 auto 32px",
            }}
          >
            Pre-IPO exposure used to require accreditation, secondary-market
            connections, and six-figure minimums. On Variational Omni you can
            go long or short the world's hottest private companies with 0%
            trading fees — from one on-chain account.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "13px 30px",
                background: THEME.accent,
                color: THEME.bg,
                fontFamily: FONTS.heading,
                fontWeight: 700,
                fontSize: "0.95rem",
                borderRadius: 8,
                textDecoration: "none",
                transition: "transform 0.12s, box-shadow 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 32px ${THEME.accent}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Start Trading →
            </a>
            <Link
              to="/compare"
              style={{
                padding: "13px 30px",
                border: `1px solid ${THEME.hairline}`,
                color: THEME.textDim,
                fontFamily: FONTS.heading,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Compare venues
            </Link>
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: FONTS.mono,
              fontSize: "0.75rem",
              color: THEME.muted,
            }}
          >
            ACCESS CODE: <span style={{ color: THEME.accent, fontWeight: 600 }}>{REFERRAL_CODE}</span>
            {" · "}also earns you points toward the $VAR airdrop
          </div>
        </div>
      </section>

      {/* ───── THE THREE FLAGSHIPS ───── */}
      <section style={{ padding: "32px 0 48px" }}>
        <div style={container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {PRE_IPO_MARKETS.map((m) => (
              <div
                key={m.ticker}
                style={{
                  padding: "26px 24px",
                  background: THEME.bgAlt,
                  border: `1px solid ${THEME.hairline}`,
                  borderRadius: 12,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${THEME.accent}66`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.hairline; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: THEME.accent,
                    }}
                  >
                    ${m.ticker}
                  </span>
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: 999,
                      fontSize: "0.65rem",
                      fontFamily: FONTS.mono,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      background: `${m.tagColor}1a`,
                      color: m.tagColor,
                      border: `1px solid ${m.tagColor}44`,
                    }}
                  >
                    {m.tag}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.heading,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    marginBottom: 8,
                  }}
                >
                  {m.company}
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: THEME.textDim, margin: 0 }}>
                  {m.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW PRE-IPO PERPS WORK ───── */}
      <section style={{ padding: "40px 0 48px", background: THEME.bgAlt }}>
        <div style={container}>
          <h2 style={h2}>How pre-IPO perpetuals work</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: THEME.accent,
                    marginBottom: 8,
                  }}
                >
                  {String(s.n).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: FONTS.heading, fontWeight: 600, fontSize: "1.02rem", marginBottom: 8 }}>
                  {s.title}
                </div>
                <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: THEME.textDim, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: 26,
              fontSize: "0.75rem",
              color: THEME.muted,
              lineHeight: 1.6,
              maxWidth: 720,
            }}
          >
            Mechanics per{" "}
            <a
              href="https://docs.variational.io/omni/trading/pre-ipo-perpetuals"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: THEME.accent, textDecoration: "underline" }}
            >
              docs.variational.io — Pre-IPO Perpetuals
            </a>
            . Until IPO, mark and index prices derive from an aggregate of external
            venues listing the same contract; funding is fixed at 0.005% per 8h.
            Variational may delist and force-settle in adverse conditions.
          </p>
        </div>
      </section>

      {/* ───── RECENTLY LISTED (TradFi expansion) ───── */}
      <section style={{ padding: "48px 0" }}>
        <div style={container}>
          <h2 style={h2}>
            The TradFi expansion is shipping daily
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.65, color: THEME.textDim, maxWidth: 680, margin: "0 0 24px" }}>
            Variational has listed a new real-world market roughly every day
            since the May 20 Phase-1 launch — semiconductor stocks, country
            ETFs, commodities, and pre-IPO names. {marketCount}+ markets and
            counting, with 100+ more TradFi listings planned this summer.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[...preIpoListings, ...otherListings].map((l) => (
              <div
                key={l.ticker}
                title={`${l.name} — ${l.type}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: THEME.bgAlt,
                  border: `1px solid ${l.type === "Pre-IPO" ? `${THEME.accent2}55` : THEME.hairline}`,
                  fontFamily: FONTS.mono,
                  fontSize: "0.78rem",
                }}
              >
                <span style={{ fontWeight: 700, color: l.type === "Pre-IPO" ? THEME.accent2 : THEME.text }}>
                  ${l.ticker}
                </span>
                <span style={{ color: THEME.muted, fontSize: "0.7rem" }}>{l.name}</span>
                <span
                  style={{
                    fontSize: "0.6rem",
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: `${THEME.accent}12`,
                    color: THEME.accent,
                    letterSpacing: "0.04em",
                  }}
                >
                  {l.type}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px dashed ${THEME.hairline}`,
                fontFamily: FONTS.mono,
                fontSize: "0.75rem",
                color: THEME.muted,
              }}
            >
              +{Math.max(0, marketCount - RECENT_LISTINGS.length)} more markets live
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHY VARIATIONAL FOR THIS ───── */}
      <section style={{ padding: "8px 0 56px" }}>
        <div style={container}>
          <h2 style={h2}>Why trade these on Variational?</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {[
              {
                t: "0% trading fees",
                d: "No maker or taker fees, permanently. Hyperliquid charges 0.015%/0.045% on its xyz pre-IPO markets; Variational's OLP earns from the spread instead.",
              },
              {
                t: "One cross-margined account",
                d: "Hold SPCX, gold, BTC perps, and Korean ETF exposure against a single USDC margin balance with Deribit-compatible portfolio margin.",
              },
              {
                t: "Private RFQ execution",
                d: "No public order book — your entries, exits, and liquidation levels stay invisible. Useful when trading thin pre-IPO markets where signal leaks move price.",
              },
              {
                t: "Earn the $VAR airdrop while you trade",
                d: "Every dollar of volume earns points through Q3 2026. You're farming the airdrop with trades you'd make anyway.",
              },
            ].map((x) => (
              <div
                key={x.t}
                style={{
                  padding: "22px 20px",
                  borderRadius: 10,
                  border: `1px solid ${THEME.hairline}`,
                  background: `${THEME.accent}06`,
                }}
              >
                <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>
                  {x.t}
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: THEME.textDim, margin: 0 }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section style={{ padding: "16px 0 64px", textAlign: "center" }}>
        <div style={container}>
          <h2 style={{ ...h2, marginBottom: 12 }}>
            The IPO window won't wait.
          </h2>
          <p style={{ color: THEME.textDim, fontSize: "0.95rem", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Use the access code below to activate your account on Variational
            Omni and start trading pre-IPO perps in minutes.
          </p>
          <div style={{ maxWidth: 360, margin: "0 auto 24px" }}>
            <CopyCode code={REFERRAL_CODE} theme={THEME} fonts={FONTS} />
          </div>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              background: THEME.accent,
              color: THEME.bg,
              fontFamily: FONTS.heading,
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Trade Pre-IPO Perps →
          </a>
          <p style={{ marginTop: 24, fontSize: "0.72rem", color: THEME.muted, maxWidth: 560, margin: "24px auto 0", lineHeight: 1.6 }}>
            Pre-IPO perpetuals are high-risk, model-priced instruments. 25%+
            single-day moves around IPO events are plausible; leverage
            amplifies both directions. Nothing here is financial advice.
          </p>
        </div>
      </section>

      <TrustStrip theme={THEME} fonts={FONTS} />
      <Footer theme={THEME} />
    </div>
  );
}
