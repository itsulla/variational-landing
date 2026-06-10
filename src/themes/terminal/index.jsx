import { useState, useEffect, useRef, useCallback } from "react";
import ComparisonTable from "../../components/ComparisonTable.jsx";
import AirdropCalculator from "../../components/AirdropCalculator.jsx";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";
import CopyCode from "../../components/CopyCode.jsx";
import ToolButtons from "../../components/ToolButtons.jsx";
import {
  REFERRAL_LINK,
  REFERRAL_CODE,
  MARKET_DATA,
  getWeeksRemaining,
} from "../../config.js";

/* ── Theme tokens ─────────────────────────────────────────── */
const THEME = {
  bg: "#0a0a0a",
  text: "#00ff88",
  accent: "#00ff88",
  secondary: "#ff9f1c",
  muted: "#00ff8866",
  winHighlight: "#00ff88",
};

const FONTS = {
  heading: "'JetBrains Mono', 'Fira Code', monospace",
  body: "'JetBrains Mono', 'Fira Code', monospace",
};

/* ── Keyframe injection (once) ────────────────────────────── */
const STYLE_ID = "terminal-theme-keyframes";
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @keyframes scanlineMove {
      0% { transform: translateY(-100px); }
      100% { transform: translateY(100vh); }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    @keyframes glitch {
      0%, 92%, 100% {
        text-shadow: none;
        clip-path: none;
      }
      93% {
        text-shadow: -3px 0 #ff0040, 3px 0 #00ff88;
        clip-path: inset(20% 0 30% 0);
      }
      94% {
        text-shadow: 3px 0 #ff0040, -3px 0 #00ff88;
        clip-path: inset(50% 0 10% 0);
      }
      95% {
        text-shadow: -2px 0 #ff0040, 2px 0 #00ff88;
        clip-path: inset(10% 0 60% 0);
      }
      96% {
        text-shadow: 2px 0 #ff0040, -2px 0 #00ff88;
        clip-path: inset(40% 0 20% 0);
      }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes countUp {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 8px rgba(0,255,136,0.15); }
      50% { box-shadow: 0 0 20px rgba(0,255,136,0.3); }
    }
  `;
  document.head.appendChild(style);
}

/* ── Animated counter hook ────────────────────────────────── */
function useCountUp(target, duration = 1500, trigger = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);

  return value;
}

/* ── IntersectionObserver hook ────────────────────────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/* ── Scanline overlay component ───────────────────────────── */
function ScanlineOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Horizontal scanlines */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,255,136,0.03) 2px, rgba(0,255,136,0.03) 4px)",
        }}
      />
      {/* Moving highlight bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: 100,
          background:
            "linear-gradient(180deg, transparent, rgba(0,255,136,0.06), transparent)",
          animation: "scanlineMove 8s linear infinite",
        }}
      />
    </div>
  );
}

/* ── Typewriter component ─────────────────────────────────── */
const TYPE_COMMAND = "> ./trade --zero-fees --tight-spreads --private-rfq";
const RESPONSES = [
  "[OK] Connected to Variational RFQ Engine",
  "[OK] Privacy mode: ACTIVE",
  '[OK] Fee schedule: 0.00% (permanent)',
  "[OK] Markets available: 475+ (incl. SPCX, OPENAI, ANTHROPIC)",
  "[OK] Ready to execute.",
];

function Typewriter({ onComplete }) {
  const [typed, setTyped] = useState("");
  const [responses, setResponses] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState("typing"); // typing | responses | done

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length < TYPE_COMMAND.length) {
      const timer = setTimeout(() => {
        setTyped(TYPE_COMMAND.slice(0, typed.length + 1));
      }, 35);
      return () => clearTimeout(timer);
    }
    // Command fully typed, start responses
    const timer = setTimeout(() => setPhase("responses"), 400);
    return () => clearTimeout(timer);
  }, [typed, phase]);

  useEffect(() => {
    if (phase !== "responses") return;
    if (responses.length < RESPONSES.length) {
      const timer = setTimeout(
        () => {
          setResponses((prev) => [...prev, RESPONSES[prev.length]]);
        },
        responses.length === 0 ? 300 : 250
      );
      return () => clearTimeout(timer);
    }
    // All responses shown
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 500);
    return () => clearTimeout(timer);
  }, [responses, phase, onComplete]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  const cursorChar = showCursor ? "\u2588" : "\u00A0";

  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: "clamp(0.7rem, 1.5vw, 0.95rem)",
        lineHeight: 1.8,
        color: THEME.text,
        minHeight: 200,
      }}
    >
      <div>
        <span style={{ color: THEME.text }}>
          {typed}
        </span>
        {phase === "typing" && (
          <span style={{ color: THEME.accent }}>{cursorChar}</span>
        )}
      </div>
      {responses.map((r, i) => (
        <div
          key={i}
          style={{
            color: r.startsWith("[OK]") ? THEME.text : THEME.secondary,
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {r}
        </div>
      ))}
      {phase === "responses" && responses.length < RESPONSES.length && (
        <span style={{ color: THEME.accent }}>{cursorChar}</span>
      )}
      {phase === "done" && (
        <div style={{ marginTop: 8, color: THEME.muted }}>
          <span style={{ color: THEME.accent }}>{cursorChar}</span>
        </div>
      )}
    </div>
  );
}

/* ── Section label component ──────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: FONTS.body,
        fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
        color: THEME.muted,
        marginBottom: 24,
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </div>
  );
}

/* ── Stat card with animated counter ──────────────────────── */
function StatCard({ prefix, value, suffix, label, inView }) {
  const count = useCountUp(value, 1500, inView);
  return (
    <div
      style={{
        padding: "20px 16px",
        border: `1px solid ${THEME.accent}33`,
        background: `${THEME.accent}08`,
        textAlign: "center",
        fontFamily: FONTS.body,
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 700,
          color: THEME.accent,
          lineHeight: 1.2,
        }}
      >
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: THEME.muted,
          marginTop: 6,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Feature card (terminal output block) ─────────────────── */
function FeatureCard({ title, description, detail }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? THEME.accent : THEME.accent + "44"}`,
        background: hovered ? `${THEME.accent}0a` : "transparent",
        padding: 0,
        transition: "all 0.3s ease",
        animation: hovered ? "pulseGlow 2s ease-in-out infinite" : "none",
      }}
    >
      {/* Terminal-style header bar */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${THEME.accent}33`,
          fontFamily: FONTS.heading,
          fontSize: "0.8rem",
          fontWeight: 600,
          color: THEME.accent,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: `${THEME.accent}0a`,
        }}
      >
        --- {title} ---
      </div>
      <div style={{ padding: "16px" }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.9rem",
            color: THEME.text,
            lineHeight: 1.6,
            marginBottom: 10,
          }}
        >
          {description}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: "0.78rem",
            color: THEME.muted,
            lineHeight: 1.5,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

/* ── CTA Button ───────────────────────────────────────────── */
function CTAButton({ children, href, large }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        padding: large ? "16px 40px" : "12px 28px",
        border: `2px solid ${THEME.accent}`,
        background: hovered ? THEME.accent : "transparent",
        color: hovered ? THEME.bg : THEME.accent,
        fontFamily: FONTS.body,
        fontSize: large ? "1rem" : "0.9rem",
        fontWeight: 700,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </a>
  );
}

/* ── Step component ───────────────────────────────────────── */
function StepCommand({ number, command, description }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
          color: THEME.accent,
          marginBottom: 6,
        }}
      >
        <span style={{ color: THEME.secondary }}>$</span> step-{number}:{" "}
        {command}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: "0.82rem",
          color: THEME.muted,
          paddingLeft: 16,
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN THEME COMPONENT
   ================================================================ */
export default function TerminalTheme() {
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [statsRef, statsInView] = useInView();
  const weeksRemaining = getWeeksRemaining();

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterDone(true);
  }, []);

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* ── Shared section styling ───── */
  const section = (extra = {}) => ({
    maxWidth: 1000,
    margin: "0 auto",
    padding: "60px 20px",
    ...extra,
  });

  const sectionDivider = {
    width: "100%",
    height: 1,
    background: `linear-gradient(90deg, transparent, ${THEME.accent}33, transparent)`,
    margin: "0 auto",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: FONTS.body,
        position: "relative",
        overflowX: "hidden",
        /* Subtle green grid background */
        backgroundImage: `
          linear-gradient(${THEME.accent}06 1px, transparent 1px),
          linear-gradient(90deg, ${THEME.accent}06 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <ScanlineOverlay />

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section style={section({ paddingTop: 80, paddingBottom: 40, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" })}>
        {/* Typewriter intro */}
        <div
          style={{
            padding: "24px",
            border: `1px solid ${THEME.accent}33`,
            background: `${THEME.bg}ee`,
            marginBottom: 48,
          }}
        >
          <Typewriter onComplete={handleTypewriterComplete} />
        </div>

        {/* Main headline - revealed after typewriter */}
        <div
          style={{
            opacity: typewriterDone ? 1 : 0,
            transform: typewriterDone ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1
            style={{
              fontFamily: FONTS.heading,
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: 24,
            }}
          >
            <span style={{ display: "block", color: THEME.text }}>
              TRADE IN
            </span>
            <span
              style={{
                display: "block",
                color: THEME.text,
                animation: "glitch 4s infinite",
              }}
            >
              THE DARK
            </span>
          </h1>

          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
              color: THEME.muted,
              maxWidth: 600,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Zero trading fees. Tight aggregated spreads. Total execution
            privacy. Variational's RFQ engine lets you trade 475+ perpetual
            markets without revealing your hand. Currently in private beta.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <CTAButton href={REFERRAL_LINK} large>
              [ START TRADING ] {"\u2192"}
            </CTAButton>
            <a
              href="#calculator"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "16px 28px",
                border: `1px solid ${THEME.accent}44`,
                color: THEME.muted,
                fontFamily: FONTS.body,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.2s",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.accent;
                e.currentTarget.style.color = THEME.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = THEME.accent + "44";
                e.currentTarget.style.color = THEME.muted;
              }}
            >
              ./calculate-airdrop
            </a>
          </div>
          <div style={{ marginTop: 16 }}>
            <ToolButtons theme={THEME} fonts={FONTS} layout="row" />
          </div>
        </div>
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={section()}>
        <SectionLabel>{"// PROTOCOL_STATUS.log"}</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <StatCard
            prefix="$"
            value={242}
            suffix="B+"
            label="Cumulative Volume"
            inView={statsInView}
          />
          <StatCard
            prefix="$"
            value={835}
            suffix="M+"
            label="Open Interest"
            inView={statsInView}
          />
          <StatCard
            prefix=""
            value={450}
            suffix="+"
            label="Markets"
            inView={statsInView}
          />
          <StatCard
            prefix="$"
            value={50}
            suffix="M"
            label="Series A (May 2026)"
            inView={statsInView}
          />
        </div>
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <SectionLabel>{"// ADVANTAGES.md"}</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <FeatureCard
            title="PRIVATE EXECUTION"
            description="Your orders never touch a public order book. The RFQ engine matches you with Omni LP behind the curtain."
            detail="No front-running. No sandwich attacks. No one sees your position until you want them to."
          />
          <FeatureCard
            title="ZERO FEES FOREVER"
            description="0.00% trading fees. Not a promo. Not a limited-time offer. Permanent zero-fee execution."
            detail="While others charge 0.025%+, Variational's LP model eliminates taker fees entirely."
          />
          <FeatureCard
            title="TIGHT SPREADS"
            description="Omni LP aggregates CEX, DEX, and TradFi liquidity into deterministic quotes. Tight pricing without sweeping an order book."
            detail="Block trades and whale orders execute at the quoted spread -- no book impact."
          />
          <FeatureCard
            title="PORTFOLIO MARGIN (DERIBIT-COMPAT)"
            description="Cross-margin every position from one account. Margin engine matches Deribit's portfolio-margin math, with a decorrelation-risk knob for diversified books."
            detail="Sophisticated trader feature. Settlement pools stay isolated per user — no contagion across accounts."
          />
        </div>
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <SectionLabel>{"// PROTOCOL_COMPARISON.log"}</SectionLabel>
        <ComparisonTable theme={THEME} fonts={FONTS} compact={false} />
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          AIRDROP CALCULATOR
          ═══════════════════════════════════════════════════════ */}
      <section id="calculator" style={section()}>
        <SectionLabel>{"// AIRDROP_CALCULATOR.exe"}</SectionLabel>
        <div
          style={{
            border: `1px solid ${THEME.accent}33`,
            padding: "clamp(16px, 3vw, 32px)",
            background: `${THEME.bg}ee`,
          }}
        >
          {/* Fake terminal header */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: `1px solid ${THEME.accent}22`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ff5f57",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#febc2e",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#28c840",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: "0.72rem",
                color: THEME.muted,
                marginLeft: 12,
              }}
            >
              airdrop_calculator.exe -- v2.1
            </span>
          </div>
          <AirdropCalculator theme={THEME} fonts={FONTS} />
        </div>
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          GET STARTED SECTION
          ═══════════════════════════════════════════════════════ */}
      <section style={section()}>
        <SectionLabel>{"// EXECUTION_PROTOCOL.md"}</SectionLabel>
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            fontWeight: 700,
            color: THEME.text,
            marginBottom: 36,
          }}
        >
          Deployment Sequence
        </h2>

        <div
          style={{
            border: `1px solid ${THEME.accent}33`,
            padding: "24px",
            background: `${THEME.bg}ee`,
            marginBottom: 36,
          }}
        >
          <StepCommand
            number="1"
            command="bridge-to-arbitrum"
            description="Bridge USDC to Arbitrum via the official bridge or a supported third-party bridge. Variational runs on Arbitrum One."
          />
          <StepCommand
            number="2"
            command={`authenticate --code ${REFERRAL_CODE}`}
            description={`Sign up at omni.variational.io with referral code ${REFERRAL_CODE} to activate your account and unlock full point accumulation.`}
          />
          <StepCommand
            number="3"
            command="trade --accumulate-points"
            description="Execute trades across 475+ markets — crypto, stocks, pre-IPO. Every dollar of volume earns points toward the airdrop. Zero fees, tight aggregated spreads."
          />

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${THEME.accent}22`,
              fontFamily: FONTS.body,
              fontSize: "0.8rem",
              color: THEME.accent,
            }}
          >
            <span style={{ color: THEME.secondary }}>[INFO]</span> Up to ~50%
            of tokens targeted for community allocation per docs. {weeksRemaining}
            {" "}weeks remaining before TGE.
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <CTAButton href={REFERRAL_LINK} large>
            [ START TRADING ] {"\u2192"}
          </CTAButton>
        </div>
      </section>

      <div style={sectionDivider} />

      {/* ═══════════════════════════════════════════════════════
          FOOTER CTA
          ═══════════════════════════════════════════════════════ */}
      <section style={section({ paddingBottom: 20 })}>
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            border: `1px solid ${THEME.accent}22`,
            background: `${THEME.accent}05`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.85rem",
              color: THEME.secondary,
              marginBottom: 16,
              letterSpacing: "0.05em",
            }}
          >
            [{weeksRemaining} WEEKS REMAINING UNTIL TGE]
          </div>
          <h3
            style={{
              fontFamily: FONTS.heading,
              fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 12,
            }}
          >
            Execute Before the Window Closes
          </h3>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.85rem",
              color: THEME.muted,
              marginBottom: 8,
            }}
          >
            Referral code:{" "}
            <span
              style={{
                color: THEME.accent,
                fontWeight: 700,
                background: `${THEME.accent}15`,
                padding: "2px 8px",
                border: `1px solid ${THEME.accent}33`,
              }}
            >
              {REFERRAL_CODE}
            </span>
          </p>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: "0.78rem",
              color: THEME.muted,
              marginBottom: 24,
            }}
          >
            Up to ~50% community allocation | $50M Series A | Pre-TGE
          </p>
          <CTAButton href={REFERRAL_LINK} large>
            [ INITIALIZE TRADING ] {"\u2192"}
          </CTAButton>
        </div>
      </section>

      <TrustStrip theme={THEME} fonts={FONTS} />

      <Footer theme={THEME} />
    </div>
  );
}
