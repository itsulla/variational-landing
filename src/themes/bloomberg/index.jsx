import { useEffect, useState } from "react";
import ComparisonTable from "../../components/ComparisonTable.jsx";
import AirdropCalculator from "../../components/AirdropCalculator.jsx";
import Footer from "../../components/Footer.jsx";
import CopyCode from "../../components/CopyCode.jsx";
import ToolButtons from "../../components/ToolButtons.jsx";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  MARKET_DATA,
  POINTS_DATA,
  getWeeksRemaining,
} from "../../config.js";

/* ─── Theme tokens ────────────────────────────────────────────────── */
const THEME = {
  bg: "#0c0b09",
  text: "#e8e0d0",
  accent: "#fbbf24",
  secondary: "#f59e0b",
  muted: "#a89968",
  winHighlight: "#fbbf24",
};

const FONTS = {
  heading: "'IBM Plex Mono', monospace",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

/* ─── Inject Google Fonts + keyframes once ────────────────────────── */
function injectGlobalStyles() {
  const id = "bloomberg-theme-globals";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

    @keyframes bbg-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes bbg-ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes bbg-fade-in {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    * { box-sizing: border-box; }
  `;
  document.head.appendChild(style);
}

/* ─── Shared inline helpers ───────────────────────────────────────── */
const sectionLabel = {
  fontFamily: FONTS.mono,
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: THEME.muted,
  marginBottom: 8,
};

const sectionTitle = {
  fontFamily: FONTS.mono,
  fontSize: "1.15rem",
  fontWeight: 700,
  color: THEME.accent,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 24,
};

const dataCell = {
  border: `1px solid ${THEME.muted}44`,
  padding: "16px 20px",
  background: `${THEME.bg}`,
};

const ctaButton = {
  display: "inline-block",
  padding: "14px 36px",
  background: THEME.accent,
  color: "#000",
  fontFamily: FONTS.mono,
  fontWeight: 700,
  fontSize: "0.9rem",
  letterSpacing: "0.06em",
  border: "none",
  borderRadius: 2,
  cursor: "pointer",
  textDecoration: "none",
  transition: "background 0.15s, transform 0.1s",
};

const pageWrap = {
  minHeight: "100vh",
  background: THEME.bg,
  color: THEME.text,
  fontFamily: FONTS.body,
  margin: 0,
  padding: 0,
  overflowX: "hidden",
};

const container = {
  maxWidth: 1120,
  margin: "0 auto",
  padding: "0 24px",
};

/* ─── Format date as "09 MAR 2026" ──────────────────────────────── */
function formatDateBloomberg(d) {
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ─── Format large currency values ───────────────────────────────── */
function fmtCurrency(n) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

/* ═════════════════════════════════════════════════════════════════════
   TOP BAR
   ═════════════════════════════════════════════════════════════════════ */
function TopBar() {
  const bar = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 24px",
    background: "#141310",
    borderBottom: `1px solid ${THEME.muted}33`,
    fontFamily: FONTS.mono,
    fontSize: "0.78rem",
    fontWeight: 600,
  };

  const live = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: THEME.text,
    letterSpacing: "0.06em",
  };

  const dot = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    marginRight: 5,
    animation: "bbg-pulse 1.8s ease-in-out infinite",
  };

  return (
    <div style={bar}>
      <span style={{ color: THEME.accent, fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem" }}>
        VARIATIONAL
      </span>
      <div style={live}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={dot} />
          LIVE
        </span>
        <span style={{ color: THEME.muted }}>ARBITRUM L2</span>
      </div>
      <span style={{ color: THEME.muted, letterSpacing: "0.06em" }}>
        {formatDateBloomberg(new Date())}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SCROLLING TICKER
   ═════════════════════════════════════════════════════════════════════ */
function TickerBar() {
  const content =
    "BTC/USDC 0% FEE \u2022 ETH/USDC 0% FEE \u2022 SOL/USDC 0% FEE \u2022 $224B+ VOLUME \u2022 450+ MARKETS \u2022 $50M SERIES A \u2022 PRIVATE BETA \u2022 ";

  const track = {
    overflow: "hidden",
    background: "#100f0c",
    borderBottom: `1px solid ${THEME.muted}22`,
    padding: "8px 0",
    whiteSpace: "nowrap",
  };

  const inner = {
    display: "inline-block",
    animation: "bbg-ticker-scroll 30s linear infinite",
    fontFamily: FONTS.mono,
    fontSize: "0.72rem",
    fontWeight: 500,
    color: THEME.accent,
    letterSpacing: "0.1em",
  };

  return (
    <div style={track}>
      <div style={inner}>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   HERO SECTION
   ═════════════════════════════════════════════════════════════════════ */
function Hero() {
  const v = MARKET_DATA.variational;

  const stats = [
    { label: "CUMULATIVE VOL", value: v.cumulativeVolume },
    { label: "OPEN INTEREST", value: v.openInterest },
    { label: "MARKETS", value: v.markets },
    { label: "STATUS", value: v.status },
  ];

  const section = {
    padding: "64px 0 48px",
    borderBottom: `1px solid ${THEME.muted}22`,
  };

  return (
    <section style={section}>
      <div style={container}>
        <div style={{ ...sectionLabel, marginBottom: 12 }}>
          MARKET BRIEF / MARCH 2026
        </div>
        <h1
          style={{
            fontFamily: FONTS.mono,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: THEME.text,
            lineHeight: 1.15,
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          Zero-Fee Perpetual
          <br />
          Trading Infrastructure
        </h1>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "1rem",
            lineHeight: 1.7,
            color: `${THEME.text}bb`,
            maxWidth: 640,
            margin: "0 0 32px",
          }}
        >
          Variational operates a private RFQ engine on Arbitrum L2, executing perpetual
          swaps at zero trading fees with tight spreads sourced from aggregated CEX, DEX,
          and TradFi liquidity. Institutional-grade infrastructure, currently in private
          beta and open to whitelisted participants.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={ctaButton}
            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.secondary; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = THEME.accent; }}
          >
            START TRADING &rarr;
          </a>
          <ToolButtons theme={THEME} fonts={FONTS} layout="row" />
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 0,
            marginTop: 48,
            border: `1px solid ${THEME.muted}44`,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                ...dataCell,
                borderLeft: i === 0 ? "none" : `1px solid ${THEME.muted}44`,
                borderTop: "none",
                borderBottom: "none",
                borderRight: "none",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  color: THEME.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: THEME.accent,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   COMPETITIVE ANALYSIS
   ═════════════════════════════════════════════════════════════════════ */
function CompetitiveAnalysis() {
  return (
    <section style={{ padding: "56px 0", borderBottom: `1px solid ${THEME.muted}22` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 02</div>
        <div style={sectionTitle}>COMPETITIVE ANALYSIS</div>
        <ComparisonTable theme={THEME} fonts={FONTS} compact={false} />
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   TOKEN VALUATION SCENARIOS
   ═════════════════════════════════════════════════════════════════════ */
function ValuationScenarios() {
  const scenarios = [
    { fdvLabel: "$500M FDV", fdv: 500_000_000, tag: "Conservative" },
    { fdvLabel: "$1B FDV", fdv: 1_000_000_000, tag: "LIT-level" },
    { fdvLabel: "$2B FDV", fdv: 2_000_000_000, tag: "Mid-range" },
    { fdvLabel: "$29B FDV", fdv: 29_000_000_000, tag: "HYPE-level" },
  ];

  const totalPointsEst = POINTS_DATA.estimatedTotalAtTGE;
  // Conservative 10% floor — Variational docs target up to ~50% community allocation.
  // The interactive Airdrop Calculator lets users vary this.
  const communityFraction = 0.1;

  return (
    <section style={{ padding: "56px 0", borderBottom: `1px solid ${THEME.muted}22` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 03</div>
        <div style={sectionTitle}>TOKEN VALUATION SCENARIOS</div>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.88rem",
            color: `${THEME.text}99`,
            lineHeight: 1.6,
            maxWidth: 720,
            marginBottom: 28,
          }}
        >
          Estimated value per point at a conservative 10% community token allocation
          (Variational docs target ~50% — use the calculator on the landing page to model
          higher allocations) and ~{(totalPointsEst / 1_000_000).toFixed(1)}M estimated
          total points at TGE. Speculative scenarios, not guarantees.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 0,
            border: `1px solid ${THEME.muted}44`,
          }}
        >
          {scenarios.map((s, i) => {
            const tokenPool = s.fdv * communityFraction;
            const valuePerPoint = tokenPool / totalPointsEst;
            const amberOpacity = (i + 1) * 0.04;

            const allocationFor100pts = valuePerPoint * 100;
            const allocationFor1000pts = valuePerPoint * 1000;

            return (
              <div
                key={s.fdvLabel}
                style={{
                  padding: "24px 20px",
                  borderRight:
                    i < scenarios.length - 1
                      ? `1px solid ${THEME.muted}44`
                      : "none",
                  background: `rgba(251, 191, 36, ${amberOpacity})`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    color: THEME.muted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {s.tag}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: THEME.text,
                    marginBottom: 16,
                  }}
                >
                  {s.fdvLabel}
                </div>

                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "0.68rem",
                    color: THEME.muted,
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  VALUE / POINT
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: THEME.accent,
                    marginBottom: 16,
                  }}
                >
                  ${valuePerPoint.toFixed(2)}
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${THEME.muted}33`,
                    paddingTop: 12,
                    fontFamily: FONTS.mono,
                    fontSize: "0.72rem",
                    color: `${THEME.text}99`,
                    lineHeight: 1.8,
                  }}
                >
                  <div>100 pts = {fmtCurrency(allocationFor100pts)}</div>
                  <div>1,000 pts = {fmtCurrency(allocationFor1000pts)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   AIRDROP CALCULATOR
   ═════════════════════════════════════════════════════════════════════ */
function Calculator() {
  return (
    <section
      id="calculator"
      style={{ padding: "56px 0", borderBottom: `1px solid ${THEME.muted}22` }}
    >
      <div style={container}>
        <div style={sectionLabel}>SECTION 04</div>
        <div style={sectionTitle}>VALUATION CALCULATOR</div>
        <div
          style={{
            border: `1px solid ${THEME.muted}44`,
            padding: "32px 28px",
            background: "#0f0e0b",
          }}
        >
          <AirdropCalculator theme={THEME} fonts={FONTS} />
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   EXECUTION PROTOCOL (Getting Started)
   ═════════════════════════════════════════════════════════════════════ */
function ExecutionProtocol() {
  const steps = [
    {
      num: "01",
      title: "BRIDGE",
      desc: "Bridge assets to Arbitrum via the official Arbitrum bridge or any major cross-chain protocol. ETH, USDC, and USDT supported.",
    },
    {
      num: "02",
      title: "AUTHENTICATE",
      desc: `Connect your wallet at omni.variational.io and enter referral code ${REFERRAL_CODE} to activate fee rebate tracking.`,
    },
    {
      num: "03",
      title: "EXECUTE",
      desc: "Trade perpetuals on any supported market. Every dollar of volume accumulates points toward the upcoming token generation event.",
    },
  ];

  return (
    <section style={{ padding: "56px 0", borderBottom: `1px solid ${THEME.muted}22` }}>
      <div style={container}>
        <div style={sectionLabel}>SECTION 05</div>
        <div style={sectionTitle}>EXECUTION PROTOCOL</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 0,
            border: `1px solid ${THEME.muted}44`,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{
                padding: "28px 24px",
                borderRight:
                  i < steps.length - 1
                    ? `1px solid ${THEME.muted}44`
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: `${THEME.accent}44`,
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: THEME.accent,
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.85rem",
                  color: `${THEME.text}bb`,
                  lineHeight: 1.65,
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   REFERENCE BAR
   ═════════════════════════════════════════════════════════════════════ */
function ReferenceBar() {
  const items = [
    { label: "HYPE FDV", value: "~$29B" },
    { label: "LIT FDV", value: "~$1B" },
    { label: "VAR RAISED", value: "$50M Series A" },
  ];

  return (
    <section style={{ padding: "0", borderBottom: `1px solid ${THEME.muted}22` }}>
      <div style={container}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            border: `1px solid ${THEME.muted}44`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: "18px 20px",
                borderRight:
                  i < items.length - 1
                    ? `1px solid ${THEME.muted}44`
                    : "none",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  color: THEME.muted,
                  letterSpacing: "0.08em",
                  marginRight: 10,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   FOOTER CTA
   ═════════════════════════════════════════════════════════════════════ */
function FooterCTA() {
  const weeksRemaining = getWeeksRemaining();

  return (
    <section style={{ padding: "56px 0 24px", textAlign: "center" }}>
      <div style={container}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.7rem",
            fontWeight: 500,
            color: THEME.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          TOKEN GENERATION EVENT
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: THEME.text,
            marginBottom: 8,
          }}
        >
          {POINTS_DATA.programEndLabel}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.85rem",
            color: THEME.accent,
            marginBottom: 8,
          }}
        >
          {weeksRemaining} weeks remaining
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.78rem",
            color: THEME.muted,
            marginBottom: 28,
          }}
        >
          REF CODE:{" "}
          <span style={{ color: THEME.text, fontWeight: 600 }}>
            {REFERRAL_CODE}
          </span>
        </div>
        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...ctaButton, fontSize: "1rem", padding: "16px 48px" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = THEME.secondary; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = THEME.accent; }}
        >
          OPEN POSITION &rarr;
        </a>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MAIN PAGE EXPORT
   ═════════════════════════════════════════════════════════════════════ */
export default function BloombergTheme() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    injectGlobalStyles();
    /* slight delay so fonts + keyframes register before first paint */
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: THEME.accent,
          fontFamily: "monospace",
          fontSize: "0.9rem",
        }}
      >
        LOADING...
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <TopBar />
      <TickerBar />
      <Hero />
      <CompetitiveAnalysis />
      <ValuationScenarios />
      <Calculator />
      <ExecutionProtocol />
      <ReferenceBar />
      <FooterCTA />
      <Footer theme={THEME} />
    </div>
  );
}
