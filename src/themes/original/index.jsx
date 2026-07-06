import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ComparisonTable from "../../components/ComparisonTable.jsx";
import AirdropCalculator from "../../components/AirdropCalculator.jsx";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";
import CopyCode from "../../components/CopyCode.jsx";
import ToolButtons from "../../components/ToolButtons.jsx";
import SocialProof from "../../components/SocialProof.jsx";
import AnimatedCounter from "../../components/AnimatedCounter.jsx";
import OnboardingBanner from "../../components/OnboardingBanner.jsx";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  RATES_API_BASE,
  MARKET_DATA,
  RECENT_LISTINGS,
  getWeeksRemaining,
} from "../../config.js";

const THEME = {
  bg: "#0a0e1a",
  text: "#e8ecf4",
  accent: "#60a5fa",
  secondary: "#3b82f6",
  muted: "#94a3b8",
  winHighlight: "#60a5fa",
};

const FONTS = {
  heading: "'DM Sans', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

const LABEL_FONT = "'Space Mono', monospace";

/* ---------- reusable style helpers ---------- */

const section = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "80px 24px",
};

const sectionLabel = {
  fontFamily: LABEL_FONT,
  fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)",
  color: THEME.muted,
  letterSpacing: "0.04em",
  marginBottom: 16,
};

const sectionHeading = {
  fontFamily: FONTS.heading,
  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
  fontWeight: 700,
  color: THEME.text,
  lineHeight: 1.2,
  marginBottom: 16,
};

const primaryBtn = {
  display: "inline-block",
  padding: "14px 32px",
  background: THEME.accent,
  color: THEME.bg,
  fontFamily: FONTS.heading,
  fontWeight: 700,
  fontSize: "1rem",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const secondaryBtn = {
  display: "inline-block",
  padding: "14px 32px",
  background: "transparent",
  color: THEME.accent,
  fontFamily: FONTS.heading,
  fontWeight: 600,
  fontSize: "1rem",
  borderRadius: 10,
  border: `1px solid ${THEME.accent}55`,
  cursor: "pointer",
  textDecoration: "none",
  transition: "border-color 0.2s, background 0.2s",
};

const cardBase = {
  padding: "28px 24px",
  borderRadius: 12,
  border: `1px solid ${THEME.muted}22`,
  background: `${THEME.bg}ee`,
  transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
  textDecoration: "none",
  color: THEME.text,
  display: "block",
};

/* ---------- Tier data ---------- */

/* Reward tiers — sourced from docs.variational.io/omni/rewards
   Volume mult marked "*" is "coming soon" per the official docs.
   Referral on Omni is flat: 1 point earned for every 10 your referrals earn. */
const TIERS = [
  { tier: "Iron",     volume: "$0",      boost: "+0%",   volMult: "1x" },
  { tier: "Bronze",   volume: "$1M",     boost: "+0.5%", volMult: "1x" },
  { tier: "Silver",   volume: "$5M",     boost: "+1%",   volMult: "1x" },
  { tier: "Gold",     volume: "$25M",    boost: "+2%",   volMult: "1.1x*" },
  { tier: "Platinum", volume: "$100M",   boost: "+3%",   volMult: "1.2x*" },
  { tier: "Diamond",  volume: "$750M",   boost: "+4%",   volMult: "1.2x*" },
  { tier: "Infinity", volume: "$2.5B",   boost: "+5%",   volMult: "1.3x*" },
];

/* ---------- Feature card data ---------- */

const FEATURES = [
  {
    title: "Private Execution",
    desc: "Every trade is executed through a private RFQ engine. No public order book — no one sees your orders, size, or direction.",
  },
  {
    title: "Tight Spreads",
    desc: "OLP aggregates liquidity from CEXs, DEXs, and TradFi dealers to quote tight, deterministic prices instead of sweeping an order book.",
  },
  {
    title: "Zero Trading Fees",
    desc: "0.00% maker and taker fees, permanently. The protocol earns by capturing the spread, not by charging users.",
  },
  {
    title: "Deribit-Compatible Portfolio Margin",
    desc: "Cross-margin every position from a single account. Variational's margin engine matches Deribit's portfolio-margin math, with a decorrelation-risk parameter that benefits diversified books.",
  },
];

/* ---------- Steps data ---------- */

const STEPS = [
  {
    step: 1,
    title: "Bridge to Arbitrum",
    desc: "Use the official bridge or a third-party bridge to move USDC/ETH to Arbitrum.",
  },
  {
    step: 2,
    title: "Connect & Use Access Code",
    showCode: true,
  },
  {
    step: 3,
    title: "Trade & Accumulate Points",
    desc: "Trade any of 495+ markets — crypto, stocks, ETFs, pre-IPO. Every dollar of volume earns points toward the $VAR airdrop.",
  },
];

/* ---------- Stats helpers ---------- */

function formatVolume(n) {
  if (n >= 1e12) return { value: +(n / 1e12).toFixed(1), suffix: "T+" };
  if (n >= 1e9) return { value: +(n / 1e9).toFixed(0), suffix: "B+" };
  if (n >= 1e6) return { value: +(n / 1e6).toFixed(0), suffix: "M+" };
  return { value: Math.round(n), suffix: "" };
}

/* ---------- Sticky conversion bar ----------
 * Slides up once the user scrolls past the hero so the primary
 * action (claim access code → open Variational) is always reachable
 * on a long page. Bottom-center, offset above the theme switcher. */
function StickyCtaBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      style={{
        position: "fixed",
        left: "50%",
        bottom: 20,
        transform: `translateX(-50%) translateY(${show ? "0" : "140%"})`,
        opacity: show ? 1 : 0,
        transition: "transform 0.35s ease, opacity 0.35s ease",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px 10px 20px",
        borderRadius: 999,
        background: "rgba(12,17,30,0.92)",
        border: `1px solid ${THEME.accent}44`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${THEME.accent}11`,
        backdropFilter: "blur(8px)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span
        style={{
          fontFamily: LABEL_FONT,
          fontSize: "0.8rem",
          color: THEME.text,
          whiteSpace: "nowrap",
        }}
      >
        Access code{" "}
        <span style={{ color: THEME.accent, fontWeight: 700 }}>{REFERRAL_CODE}</span>
      </span>
      <a
        href={REFERRAL_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...primaryBtn,
          padding: "9px 20px",
          fontSize: "0.9rem",
          whiteSpace: "nowrap",
        }}
      >
        Start Trading →
      </a>
    </div>
  );
}

/* ---------- Component ---------- */

export default function OriginalTheme() {
  const weeksLeft = getWeeksRemaining();

  /* Live Variational stats via our /api/compare/three endpoint */
  const [liveStats, setLiveStats] = useState(null);
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${RATES_API_BASE}/api/compare/three?window=ytd`);
        if (!res.ok) return;
        const data = await res.json();
        const variational = (data.protocols || []).find(
          (p) => p.slug === "variational"
        );
        const total24h = (data.protocols || []).reduce(
          (s, p) => s + (p.volume_24h || 0),
          0
        );
        if (variational) {
          setLiveStats({
            cumVol: variational.cumulative_volume,
            vol24h: variational.volume_24h,
            markets: variational.markets_count,
            marketShare:
              total24h > 0
                ? (variational.volume_24h / total24h) * 100
                : null,
          });
        }
      } catch (_e) {
        /* fallback to static */
      }
    }
    fetchStats();
  }, []);

  /* Build stats array — live if available, static fallback */
  const cumVol = liveStats?.cumVol;
  const cumVolFmt = cumVol ? formatVolume(cumVol) : { value: 175, suffix: "B+" };
  const vol24hFmt = liveStats?.vol24h
    ? formatVolume(liveStats.vol24h)
    : { value: 700, suffix: "M+" };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: FONTS.body,
        backgroundImage: `
          linear-gradient(${THEME.muted}08 1px, transparent 1px),
          linear-gradient(90deg, ${THEME.muted}08 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        overflowX: "hidden",
      }}
    >
      {/* ===== HERO ===== */}
      <section style={{ ...section, paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={sectionLabel}>// Peer-to-peer derivatives protocol</div>
          <span
            style={{
              fontFamily: LABEL_FONT,
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: THEME.accent,
              padding: "3px 8px",
              borderRadius: 3,
              border: `1px solid ${THEME.accent}55`,
              background: `${THEME.accent}10`,
            }}
          >
            Mainnet — Private Beta
          </span>
        </div>

        <h1
          style={{
            ...sectionHeading,
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            maxWidth: 860,
            marginBottom: 24,
          }}
        >
          Trade <span style={{ color: THEME.accent }}>SpaceX, OpenAI &amp;
          Anthropic pre-IPO</span>, stocks, gold, oil and 495+ crypto perps.
          Zero fees.
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: `${THEME.text}bb`,
            lineHeight: 1.7,
            maxWidth: 660,
            marginBottom: 36,
          }}
        >
          Variational is a peer-to-peer derivatives protocol on Arbitrum that
          puts crypto, stocks, ETFs, commodities, and pre-IPO equities in one
          cross-margined account. Trades execute through a private RFQ engine
          that aggregates CEX, DEX, and TradFi liquidity — at 0% trading fees,
          with no public order book and no front-running.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={primaryBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 32px ${THEME.accent}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Start Trading on Variational
          </a>
          <a
            href="#calculator"
            style={secondaryBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = THEME.accent;
              e.currentTarget.style.background = `${THEME.accent}11`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${THEME.accent}55`;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Airdrop Calculator ↓
          </a>
          <ToolButtons theme={THEME} fonts={FONTS} layout="row" />
        </div>

        {/* Stats bar — animated counters with live data */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            marginTop: 56,
            padding: "28px 0",
            borderTop: `1px solid ${THEME.muted}22`,
            borderBottom: `1px solid ${THEME.muted}22`,
          }}
        >
          {[
            { prefix: "$", value: cumVolFmt.value, suffix: cumVolFmt.suffix, label: "Cumulative Volume" },
            { prefix: "$", value: vol24hFmt.value, suffix: vol24hFmt.suffix, label: "24h Volume" },
            { prefix: "", value: 495, suffix: "+", label: "Markets" },
            { prefix: "$", value: 50, suffix: "M", label: "Series A (May 2026)" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <AnimatedCounter
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                duration={1800}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                  fontWeight: 700,
                  color: THEME.accent,
                }}
              />
              <div
                style={{
                  fontFamily: LABEL_FONT,
                  fontSize: "0.72rem",
                  color: THEME.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: 6,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <SocialProof theme={THEME} fonts={FONTS} />
      </section>

      {/* ===== CREDIBILITY (moved high — proof before the ask) ===== */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <TrustStrip theme={THEME} fonts={FONTS} />
      </div>

      {/* ===== PRE-IPO HOOK (the differentiator, high on the page) ===== */}
      <section style={section}>
        <Link
          to="/pre-ipo"
          style={{
            display: "block",
            textDecoration: "none",
            borderRadius: 16,
            padding: "28px 28px",
            background: `linear-gradient(135deg, ${THEME.accent}14, ${THEME.bg})`,
            border: `1px solid ${THEME.accent}33`,
            transition: "border-color 0.2s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${THEME.accent}77`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${THEME.accent}33`;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: LABEL_FONT,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: THEME.accent,
                  marginBottom: 8,
                }}
              >
                Pre-IPO perps · live now
              </div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                  fontWeight: 700,
                  color: THEME.text,
                  lineHeight: 1.2,
                }}
              >
                Trade <span style={{ color: THEME.accent }}>OpenAI</span> &amp;{" "}
                <span style={{ color: THEME.accent }}>Anthropic</span> before they IPO
              </div>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: `${THEME.text}99`,
                  margin: "10px 0 0",
                  maxWidth: 560,
                  lineHeight: 1.55,
                }}
              >
                Long or short the two biggest private AI companies — 24/7, no
                accreditation, zero trading fees. Every dollar of volume also
                farms the $VAR airdrop.
              </p>
            </div>
            <span
              style={{
                ...primaryBtn,
                padding: "12px 26px",
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              View Pre-IPO Markets →
            </span>
          </div>
        </Link>
      </section>

      {/* ===== RECENTLY LISTED (TradFi expansion) ===== */}
      <section style={section}>
        <div style={sectionLabel}>// Recently listed</div>
        <h2 style={{ ...sectionHeading, marginBottom: 12 }}>
          New real-world markets, almost daily
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: `${THEME.text}bb`,
            lineHeight: 1.7,
            maxWidth: 640,
            marginBottom: 24,
          }}
        >
          Since the May 2026 TradFi launch, Variational has listed a new
          real-world market roughly every day — pre-IPO giants, semiconductor
          stocks, country ETFs, and commodities. 100+ more TradFi listings are
          planned this summer.{" "}
          <a
            href="/pre-ipo"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            See the pre-IPO lineup →
          </a>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {RECENT_LISTINGS.map((l) => (
            <div
              key={l.ticker}
              title={`${l.name} — ${l.type}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 8,
                background: `${THEME.accent}08`,
                border: `1px solid ${
                  l.type === "Pre-IPO" ? `${THEME.accent}66` : `${THEME.muted}33`
                }`,
                fontFamily: FONTS.mono,
                fontSize: "0.78rem",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: l.type === "Pre-IPO" ? THEME.accent : THEME.text,
                }}
              >
                ${l.ticker}
              </span>
              <span style={{ color: THEME.muted, fontSize: "0.7rem" }}>
                {l.name}
              </span>
              <span
                style={{
                  fontSize: "0.6rem",
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: `${THEME.accent}15`,
                  color: THEME.accent,
                  letterSpacing: "0.04em",
                }}
              >
                {l.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY VARIATIONAL ===== */}
      <section style={section}>
        <div style={sectionLabel}>// Why Variational</div>
        <h2 style={{ ...sectionHeading, marginBottom: 12 }}>
          Built different from every other perp DEX
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: `${THEME.text}99`,
            lineHeight: 1.6,
            maxWidth: 600,
            marginBottom: 32,
          }}
        >
          While other DEXs use public order books where your positions are visible
          to everyone, Variational's private RFQ engine means no one can see your
          trades, copy them, or front-run them.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <a
              key={f.title}
              href={REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={cardBase}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = `${THEME.accent}55`;
                e.currentTarget.style.boxShadow = `0 8px 30px ${THEME.accent}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = `${THEME.muted}22`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: THEME.accent,
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: `${THEME.text}cc`,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ===== COMPARISON TABLE ===== */}
      <section style={section}>
        <div style={sectionLabel}>// Protocol comparison</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          How Variational compares
        </h2>
        <ComparisonTable theme={THEME} fonts={FONTS} compact={false} />
      </section>

      {/* ===== GET STARTED ===== */}
      <section style={section}>
        <div style={sectionLabel}>// Get started</div>
        <h2 style={{ ...sectionHeading, marginBottom: 24 }}>
          Three steps to start earning
        </h2>

        <div style={{ marginBottom: 32 }}>
          <OnboardingBanner theme={THEME} fonts={FONTS} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                ...cardBase,
                position: "relative",
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.72rem",
                  color: THEME.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                Step {s.step}
              </div>
              <h3
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: THEME.text,
                  marginBottom: 10,
                }}
              >
                {s.title}
              </h3>
              {s.showCode ? (
                <div>
                  <CopyCode
                    code={REFERRAL_CODE}
                    theme={THEME}
                    fonts={FONTS}
                  />
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: THEME.muted,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    Click to copy — use this access code when you connect
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: `${THEME.text}bb`,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== AIRDROP CALCULATOR (grouped with rewards — the "earn" block) ===== */}
      <section id="calculator" style={section}>
        <div style={sectionLabel}>// Airdrop calculator</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          Estimate your <span style={{ color: THEME.accent }}>$VAR</span>{" "}
          allocation
        </h2>
        <AirdropCalculator theme={THEME} fonts={FONTS} />
      </section>

      {/* ===== REWARD TIERS ===== */}
      <section style={section}>
        <div style={sectionLabel}>// Reward tiers</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          Volume unlocks higher rewards
        </h2>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: 12,
            border: `1px solid ${THEME.muted}22`,
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 640,
              borderCollapse: "collapse",
              fontFamily: FONTS.body,
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr>
                {["Tier", "30d Volume", "Points Boost", "Volume Multiplier"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 18px",
                        textAlign: "left",
                        fontFamily: LABEL_FONT,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: THEME.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `2px solid ${THEME.muted}33`,
                        background: `${THEME.bg}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((row, i) => {
                const isTop = i >= TIERS.length - 3;
                return (
                  <tr
                    key={row.tier}
                    style={{
                      background: isTop ? `${THEME.accent}08` : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 18px",
                        borderBottom: `1px solid ${THEME.muted}18`,
                        fontWeight: 700,
                        color: isTop ? THEME.accent : THEME.text,
                        fontFamily: FONTS.heading,
                      }}
                    >
                      {row.tier}
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        borderBottom: `1px solid ${THEME.muted}18`,
                        fontFamily: FONTS.mono,
                        color: `${THEME.text}cc`,
                      }}
                    >
                      {row.volume}
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        borderBottom: `1px solid ${THEME.muted}18`,
                        fontFamily: FONTS.mono,
                        fontWeight: 600,
                        color: isTop ? THEME.accent : `${THEME.text}cc`,
                      }}
                    >
                      {row.boost}
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        borderBottom: `1px solid ${THEME.muted}18`,
                        fontFamily: FONTS.mono,
                        color: `${THEME.text}cc`,
                      }}
                    >
                      {row.volMult}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p
          style={{
            marginTop: 12,
            fontSize: "0.78rem",
            color: `${THEME.text}88`,
            lineHeight: 1.6,
          }}
        >
          Source:{" "}
          <a
            href="https://docs.variational.io/omni/rewards"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: THEME.accent, textDecoration: "underline" }}
          >
            docs.variational.io/omni/rewards
          </a>
          . Items marked * are "coming soon" per the official docs. Omni
          referrals are flat: 1 point earned per 10 your referrals earn (no
          tier-based referral boost).
        </p>
      </section>

      {/* ===== INSIGHTS / FROM THE BLOG ===== */}
      <section style={section}>
        <div style={sectionLabel}>// From the blog</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          Guides &amp; research
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              slug: "openai-pre-ipo-perps",
              tag: "Pre-IPO",
              title: "How to Get OpenAI Pre-IPO Exposure",
            },
            {
              slug: "anthropic-pre-ipo-perps",
              tag: "Pre-IPO",
              title: "How to Get Anthropic Pre-IPO Exposure",
            },
            {
              slug: "funding-rate-farming-guide",
              tag: "Tutorial",
              title: "Funding-Rate Farming: A Delta-Neutral Guide",
            },
          ].map((a) => (
            <Link
              key={a.slug}
              to={`/insights/${a.slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                padding: "20px 20px",
                borderRadius: 12,
                background: `${THEME.accent}08`,
                border: `1px solid ${THEME.muted}22`,
                transition: "border-color 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${THEME.accent}66`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${THEME.muted}22`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span
                style={{
                  fontFamily: LABEL_FONT,
                  fontSize: "0.66rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: THEME.accent,
                }}
              >
                {a.tag}
              </span>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.02rem",
                  fontWeight: 600,
                  color: THEME.text,
                  marginTop: 10,
                  lineHeight: 1.35,
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: THEME.accent,
                  marginTop: 14,
                  fontFamily: FONTS.body,
                }}
              >
                Read →
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            to="/insights"
            style={{
              fontFamily: LABEL_FONT,
              fontSize: "0.85rem",
              color: THEME.muted,
              textDecoration: "none",
              borderBottom: `1px dotted ${THEME.muted}`,
            }}
          >
            All insights →
          </Link>
        </div>
      </section>

      {/* ===== URGENCY + FOOTER CTA ===== */}
      <section
        style={{
          ...section,
          textAlign: "center",
          paddingBottom: 40,
        }}
      >
        {/* Urgency banner */}
        <div
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 999,
            border: `1px solid ${THEME.accent}44`,
            background: `${THEME.accent}0a`,
            fontFamily: LABEL_FONT,
            fontSize: "0.82rem",
            color: THEME.muted,
            marginBottom: 24,
          }}
        >
          Points program closing Q3 2026 —{" "}
          <span style={{ color: THEME.accent, fontWeight: 700 }}>
            {weeksLeft} weeks remaining
          </span>
        </div>

        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            color: THEME.text,
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Zero fees. Tight spreads. What are you waiting for?
        </h2>

        <p
          style={{
            fontSize: "0.95rem",
            color: `${THEME.text}88`,
            maxWidth: 540,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Variational charges no trading fees — ever. OLP captures the bid-ask
          spread instead of charging users, then routes a cut to the protocol
          treasury. Start trading now and accumulate points toward the{" "}
          <span style={{ color: THEME.accent, fontWeight: 600 }}>$VAR airdrop</span>.
        </p>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.85rem",
            color: THEME.muted,
            marginBottom: 12,
          }}
        >
          Referral Code
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <CopyCode code={REFERRAL_CODE} theme={THEME} fonts={FONTS} />
        </div>

        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...primaryBtn,
            fontSize: "1.1rem",
            padding: "16px 48px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 8px 32px ${THEME.accent}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Start Trading on Variational
        </a>

      </section>

      <div style={{ marginTop: 24 }}>
        <Footer theme={THEME} />
      </div>

      <StickyCtaBar />
    </div>
  );
}
