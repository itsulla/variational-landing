import { useEffect } from "react";
import ComparisonTable from "../../components/ComparisonTable.jsx";
import AirdropCalculator from "../../components/AirdropCalculator.jsx";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";
import CopyCode from "../../components/CopyCode.jsx";
import ToolButtons from "../../components/ToolButtons.jsx";
import SocialProof from "../../components/SocialProof.jsx";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  MARKET_DATA,
  getWeeksRemaining,
} from "../../config.js";

/* ---------- Theme tokens ---------- */

const THEME = {
  bg: "#06060f",
  text: "#e8ecf4",
  accent: "#818cf8",
  secondary: "#ec4899",
  tertiary: "#a855f7",
  positive: "#34d399",
  muted: "#64748b",
  winHighlight: "#818cf8",
};

const FONTS = {
  heading: "'Syne', sans-serif",
  body: "'Outfit', sans-serif",
};

/* ---------- CSS keyframes injected once ---------- */

const KEYFRAMES_ID = "var-neon-keyframes";

function injectKeyframes() {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes neon-float-1 {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(-20px) translateX(8px); }
    }
    @keyframes neon-float-2 {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(18px) translateX(-10px); }
    }
    @keyframes neon-float-3 {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-14px); }
    }
    @keyframes neon-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes neon-shimmer-band {
      0% { left: -50%; }
      100% { left: 150%; }
    }
  `;
  document.head.appendChild(style);
}

/* ---------- Reusable style helpers ---------- */

const section = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "80px 24px",
  position: "relative",
  zIndex: 1,
};

const sectionHeading = {
  fontFamily: FONTS.heading,
  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
  fontWeight: 800,
  color: THEME.text,
  lineHeight: 1.2,
  marginBottom: 16,
};

const sectionSub = {
  fontFamily: FONTS.body,
  fontSize: "0.82rem",
  color: THEME.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 16,
  fontWeight: 500,
};

const glassCard = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: "28px 24px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const gradientText = {
  background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ---------- Data ---------- */

const STATS = [
  { value: MARKET_DATA.variational.cumulativeVolume, label: "Cumulative Volume", color: THEME.accent },
  { value: MARKET_DATA.variational.openInterest, label: "Open Interest", color: THEME.secondary },
  { value: MARKET_DATA.variational.markets, label: "Markets", color: THEME.tertiary },
  { value: MARKET_DATA.variational.raised, label: "Total Raised", color: THEME.positive },
];

const FEATURES = [
  {
    title: "Private Execution",
    desc: "Every trade routes through a private RFQ engine. No public order book — no one sees your orders, size, or direction.",
    gradient: `linear-gradient(135deg, ${THEME.accent}, ${THEME.tertiary})`,
    borderColor: THEME.accent,
  },
  {
    title: "Tight Spreads",
    desc: "OLP aggregates liquidity from CEXs, DEXs, and TradFi dealers to quote tight, deterministic prices on every market.",
    gradient: `linear-gradient(135deg, ${THEME.secondary}, ${THEME.accent})`,
    borderColor: THEME.secondary,
  },
  {
    title: "Zero Trading Fees",
    desc: "0.00% maker and taker fees, permanently. OLP earns by capturing the spread, not by charging users.",
    gradient: `linear-gradient(135deg, ${THEME.tertiary}, ${THEME.secondary})`,
    borderColor: THEME.tertiary,
  },
  {
    title: "Deribit-Compatible Portfolio Margin",
    desc: "Cross-margin everything from one account. The margin engine matches Deribit's portfolio-margin math, with a decorrelation parameter for diversified books.",
    gradient: `linear-gradient(135deg, ${THEME.positive}, ${THEME.accent})`,
    borderColor: THEME.positive,
  },
];

const STEPS = [
  {
    step: 1,
    title: "Bridge to Arbitrum",
    desc: "Use the official bridge or a third-party bridge to move funds to Arbitrum.",
  },
  {
    step: 2,
    title: "Connect & Use Access Code",
    showCode: true,
  },
  {
    step: 3,
    title: "Trade & Accumulate Points",
    desc: "Trade any of 450+ markets. Earn points toward the $VAR airdrop.",
  },
];

const SCENARIOS = [
  { fdv: "$500M", fdvNum: 500_000_000, perPoint: "$26.32", estimated: "$2,632", glow: "none", glowColor: null, intensity: "base" },
  { fdv: "$1B", fdvNum: 1_000_000_000, perPoint: "$52.63", estimated: "$5,263", glow: `0 0 30px ${THEME.accent}20`, glowColor: THEME.accent, intensity: "low", sub: "LIT-level" },
  { fdv: "$2B", fdvNum: 2_000_000_000, perPoint: "$105.26", estimated: "$10,526", glow: `0 0 40px ${THEME.tertiary}30`, glowColor: THEME.tertiary, intensity: "mid" },
  { fdv: "$29B", fdvNum: 29_000_000_000, perPoint: "$1,526.32", estimated: "$152,632", glow: `0 0 60px ${THEME.secondary}40, 0 0 120px ${THEME.secondary}15`, glowColor: THEME.secondary, intensity: "high", sub: "HYPE-level" },
];

const BADGES = [
  { label: "RFQ Engine", color: THEME.accent },
  { label: "Zero Fees", color: THEME.secondary },
  { label: "Private Execution", color: THEME.tertiary },
];

/* ---------- Noise SVG data URI ---------- */

const NOISE_SVG = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="300" height="300" filter="url(#n)" opacity="1"/></svg>`)}`;

/* ---------- Component ---------- */

export default function NeonTheme() {
  useEffect(() => {
    if (!document.getElementById("var-neon-fonts")) {
      const link = document.createElement("link");
      link.id = "var-neon-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    injectKeyframes();
  }, []);

  const weeksLeft = getWeeksRemaining();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: FONTS.body,
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ===== FLOATING GRADIENT ORBS ===== */}
      <div
        style={{
          position: "fixed",
          top: "-5%",
          right: "-8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${THEME.accent}55 0%, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.3,
          pointerEvents: "none",
          zIndex: 0,
          animation: "neon-float-1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-10%",
          left: "-10%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${THEME.secondary}55 0%, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.3,
          pointerEvents: "none",
          zIndex: 0,
          animation: "neon-float-2 7s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "40%",
          left: "50%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${THEME.tertiary}33 0%, transparent 70%)`,
          filter: "blur(90px)",
          opacity: 0.2,
          pointerEvents: "none",
          zIndex: 0,
          animation: "neon-float-3 6s ease-in-out infinite",
        }}
      />

      {/* ===== NOISE OVERLAY ===== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundRepeat: "repeat",
          opacity: 0.03,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ===== HERO ===== */}
      <section style={{ ...section, paddingTop: 100, paddingBottom: 60, textAlign: "center" }}>
        {/* Badge Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 48,
          }}
        >
          {BADGES.map((b) => (
            <span
              key={b.label}
              style={{
                display: "inline-block",
                padding: "6px 18px",
                borderRadius: 999,
                border: `1px solid ${b.color}66`,
                background: `${b.color}0a`,
                color: b.color,
                fontFamily: FONTS.body,
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 24,
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <span style={{ display: "block", color: THEME.text }}>Your edge</span>
          <span
            style={{
              display: "block",
              ...gradientText,
            }}
          >
            stays invisible.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: `${THEME.text}bb`,
            lineHeight: 1.7,
            maxWidth: 600,
            margin: "0 auto 40px",
            fontWeight: 400,
          }}
        >
          Variational is a peer-to-peer derivatives protocol on Arbitrum, currently in private
          beta. Trades execute through a private RFQ engine at zero trading fees, with tight
          spreads sourced from aggregated CEX, DEX, and TradFi liquidity. No public order
          book. No front-running. Your strategy stays yours.
        </p>

        {/* Shimmer CTA */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "relative",
              display: "inline-block",
              padding: "16px 40px",
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.tertiary}, ${THEME.secondary})`,
              color: "#fff",
              fontFamily: FONTS.heading,
              fontWeight: 700,
              fontSize: "1.05rem",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: `0 0 30px ${THEME.accent}40, 0 0 60px ${THEME.accent}15`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              overflow: "hidden",
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 0 40px ${THEME.accent}60, 0 0 80px ${THEME.accent}25, 0 8px 32px rgba(0,0,0,0.4)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 0 30px ${THEME.accent}40, 0 0 60px ${THEME.accent}15`;
            }}
          >
            {/* Shimmer band */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "-50%",
                width: "50%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                animation: "neon-shimmer-band 3s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 2 }}>Start Trading on Variational</span>
          </a>

          <a
            href="#calculator"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "transparent",
              color: THEME.accent,
              fontFamily: FONTS.heading,
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 12,
              border: `1px solid ${THEME.accent}44`,
              cursor: "pointer",
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = THEME.accent;
              e.currentTarget.style.background = `${THEME.accent}11`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${THEME.accent}44`;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Airdrop Calculator
          </a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <ToolButtons theme={THEME} fonts={FONTS} layout="row" />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ ...section, paddingTop: 0, paddingBottom: 60 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 24,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                padding: "28px 16px",
                borderRadius: 14,
                border: `1px solid ${s.color}22`,
                background: `${s.color}08`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                  fontWeight: 800,
                  color: s.color,
                  marginBottom: 6,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.78rem",
                  color: THEME.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ADVANTAGE CARDS ===== */}
      <section style={section}>
        <div style={sectionSub}>Why Variational</div>
        <h2 style={{ ...sectionHeading, marginBottom: 40 }}>
          Built for traders who{" "}
          <span style={gradientText}>refuse to be seen</span>
        </h2>

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
              style={{
                ...glassCard,
                textDecoration: "none",
                color: THEME.text,
                display: "block",
                borderTop: `2px solid ${f.borderColor}88`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 40px ${f.borderColor}20, 0 0 20px ${f.borderColor}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  marginBottom: 10,
                  background: f.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: `${THEME.text}bb`,
                  lineHeight: 1.65,
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
        <div style={sectionSub}>Protocol Comparison</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          How Variational compares
        </h2>
        <div style={{ ...glassCard, padding: "2px" }}>
          <div style={{ padding: "24px 20px" }}>
            <ComparisonTable theme={THEME} fonts={FONTS} compact={false} />
          </div>
        </div>
      </section>

      {/* ===== AIRDROP CALCULATOR ===== */}
      <section id="calculator" style={section}>
        <div style={sectionSub}>Airdrop Calculator</div>
        <h2 style={{ ...sectionHeading, marginBottom: 32 }}>
          Estimate your{" "}
          <span style={gradientText}>$VAR</span>{" "}
          allocation
        </h2>
        <div style={{ ...glassCard, padding: "32px 28px" }}>
          <AirdropCalculator theme={THEME} fonts={FONTS} />
        </div>
      </section>

      {/* ===== VALUATION SCENARIOS ===== */}
      <section style={section}>
        <div style={sectionSub}>Valuation Scenarios</div>
        <h2 style={{ ...sectionHeading, marginBottom: 12 }}>
          What your points could be worth
        </h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: `${THEME.text}99`,
            lineHeight: 1.6,
            marginBottom: 36,
            maxWidth: 600,
          }}
        >
          Hypothetical values based on 100 points and 9.5M total points at TGE. Community allocation shown is 10% (conservative floor — Variational docs target up to ~50%; use the calculator on the landing page to model higher allocations).
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 20,
          }}
        >
          {SCENARIOS.map((s) => (
            <div
              key={s.fdv}
              style={{
                ...glassCard,
                boxShadow: s.glow,
                borderColor: s.glowColor ? `${s.glowColor}33` : "rgba(255,255,255,0.08)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle top gradient bar for intensity */}
              {s.glowColor && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${s.glowColor}, transparent)`,
                  }}
                />
              )}
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.75rem",
                  color: THEME.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                FDV
              </div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: s.glowColor || THEME.text,
                  marginBottom: 16,
                }}
              >
                {s.fdv}
                {s.sub && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: THEME.muted,
                      fontFamily: FONTS.body,
                      marginTop: 2,
                    }}
                  >
                    {s.sub}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: THEME.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 2,
                    }}
                  >
                    Value / Point
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: THEME.text,
                    }}
                  >
                    {s.perPoint}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: THEME.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 2,
                    }}
                  >
                    Est. Value (100 pts)
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: s.glowColor || THEME.accent,
                    }}
                  >
                    {s.estimated}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GET STARTED ===== */}
      <section style={section}>
        <div style={sectionSub}>Get Started</div>
        <h2 style={{ ...sectionHeading, marginBottom: 48 }}>
          Three steps to start earning
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                ...glassCard,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
              }}
            >
              {/* Oversized faded step number */}
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: 10,
                  fontFamily: FONTS.heading,
                  fontSize: 80,
                  fontWeight: 800,
                  color: THEME.text,
                  opacity: 0.04,
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {s.step}
              </div>

              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: "0.72rem",
                  color: THEME.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: 14,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Step {s.step}
              </div>
              <h3
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: THEME.text,
                  marginBottom: 12,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {s.title}
              </h3>

              {s.showCode ? (
                <div style={{ position: "relative", zIndex: 1 }}>
                  <CopyCode code={REFERRAL_CODE} theme={THEME} fonts={FONTS} />
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: THEME.muted,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    Click to copy — use this code when you connect
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: `${THEME.text}bb`,
                    lineHeight: 1.65,
                    margin: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {s.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER CTA ===== */}
      <section
        style={{
          ...section,
          textAlign: "center",
          paddingBottom: 40,
        }}
      >
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 32,
          }}
        >
          <span style={{ color: THEME.text }}>Every week you wait is</span>
          <br />
          <span style={gradientText}>points you miss.</span>
        </h2>

        {/* Shimmer CTA */}
        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "relative",
            display: "inline-block",
            padding: "18px 52px",
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.tertiary}, ${THEME.secondary})`,
            color: "#fff",
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: "1.15rem",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: `0 0 30px ${THEME.accent}40, 0 0 60px ${THEME.accent}15`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            overflow: "hidden",
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 0 40px ${THEME.accent}60, 0 0 80px ${THEME.accent}25, 0 8px 32px rgba(0,0,0,0.4)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 0 30px ${THEME.accent}40, 0 0 60px ${THEME.accent}15`;
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "-50%",
              width: "50%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "neon-shimmer-band 3s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "relative", zIndex: 2 }}>Start Trading on Variational</span>
        </a>

        {/* Countdown + Ref code */}
        <div
          style={{
            marginTop: 36,
            fontFamily: FONTS.body,
            fontSize: "0.88rem",
            color: THEME.muted,
          }}
        >
          Points program closing Q3 2026.{" "}
          <span style={{ color: THEME.accent, fontWeight: 700 }}>
            {weeksLeft} weeks remaining.
          </span>
        </div>

        <div
          style={{
            marginTop: 24,
            fontFamily: FONTS.body,
            fontSize: "0.78rem",
            color: THEME.muted,
            fontWeight: 500,
          }}
        >
          Referral Code
        </div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            fontWeight: 800,
            letterSpacing: "0.1em",
            marginTop: 4,
            marginBottom: 40,
            userSelect: "all",
            ...gradientText,
          }}
        >
          {REFERRAL_CODE}
        </div>
      </section>

      <TrustStrip theme={THEME} fonts={FONTS} />

      <Footer theme={THEME} />
    </div>
  );
}
