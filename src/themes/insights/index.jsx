import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import TrustStrip from "../../components/TrustStrip.jsx";

/* Match the article theme exactly so the navigation feels seamless. */
const THEME = {
  bg: "#0a0e1a",
  bgAlt: "#0f1424",
  text: "#e8ecf4",
  textDim: "#cbd5e1",
  accent: "#60a5fa",
  muted: "#94a3b8",
  hairline: "#1e293b",
};

const FONTS = {
  heading: "'Outfit', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

/* Source of truth for the article index. New articles append here. */
const ARTICLES = [
  {
    slug: "best-pre-ipo-platforms",
    title: "Best Ways to Buy Pre-IPO Stock in 2026: Forge vs EquityZen vs Hiive vs Perps",
    subtitle:
      "Secondary marketplaces gate pre-IPO shares to accredited investors. Here's how they compare to synthetic pre-IPO perps — and how anyone can get long or short OpenAI and Anthropic without accreditation.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "10 min read",
    tag: "Comparison",
  },
  {
    slug: "variational-review",
    title: "Variational Review 2026: Fees, Airdrop & Pre-IPO Markets",
    subtitle:
      "An honest, user-perspective review of Variational Omni — the 0%-fee RFQ model, 495+ markets, the $VAR airdrop, OpenAI/Anthropic pre-IPO perps, and the real caveats.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "8 min read",
    tag: "Review",
  },
  {
    slug: "pre-ipo-perps-explained",
    title: "Pre-IPO Perps Explained: How They Work and Where to Trade Them",
    subtitle:
      "What pre-IPO perpetuals are, how oracle pricing and funding keep them tethered to private-market valuations, why the same contract diverges across venues, and how they compare to owning real shares.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "8 min read",
    tag: "Explainer",
  },
  {
    slug: "openai-pre-ipo-perps",
    title: "How to Get OpenAI Pre-IPO Exposure in 2026",
    subtitle:
      "Retail has almost no legitimate path into OpenAI before it goes public. Here's how synthetic pre-IPO perpetuals let anyone go long or short 24/7 — with zero fees and $VAR airdrop points on every trade.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "7 min read",
    tag: "Pre-IPO Guide",
  },
  {
    slug: "anthropic-pre-ipo-perps",
    title: "How to Get Anthropic Pre-IPO Exposure in 2026",
    subtitle:
      "You can't buy Anthropic stock, and secondary markets are gated to accredited investors. Pre-IPO perps open the trade to everyone — long or short, no accreditation, while farming the $VAR airdrop.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "7 min read",
    tag: "Pre-IPO Guide",
  },
  {
    slug: "funding-rate-farming-guide",
    title: "Funding-Rate Farming: A Delta-Neutral Guide",
    subtitle:
      "A step-by-step tutorial on collecting funding-rate spreads with limited directional risk — and why Variational's 0% fees plus $VAR airdrop points make it a double yield.",
    date: "July 6, 2026",
    dateISO: "2026-07-06",
    readTime: "9 min read",
    tag: "Tutorial",
  },
  {
    slug: "why-perp-dexes-coexist",
    title: "The Perp DEX Market Isn't Winner-Take-All",
    subtitle:
      "Different architectures attract different traders. Why Hyperliquid, Lighter, and Variational each own a distinct slice of decentralized perpetuals — and why their growth is additive, not zero-sum.",
    date: "May 23, 2026",
    dateISO: "2026-05-23",
    readTime: "5 min read",
    tag: "Category Analysis",
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

export default function InsightsIndex() {
  useEffect(() => {
    injectFonts();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        background: THEME.bg,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: FONTS.body,
      }}
    >
      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: THEME.accent,
            marginBottom: 14,
          }}
        >
          Insights
        </div>
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(2rem, 4.5vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            margin: "0 0 16px",
          }}
        >
          Research &amp; analysis on the perp DEX category
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            color: THEME.textDim,
            maxWidth: 640,
            margin: 0,
          }}
        >
          Independent writing on decentralized perpetuals — architecture
          deep-dives, comparisons across Hyperliquid, Lighter, Variational, and
          the rest of the category, and notes on what actually matters when
          you're picking a venue.
        </p>
      </section>

      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "16px 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to={`/insights/${a.slug}`}
              style={{
                display: "block",
                padding: "26px 26px 24px",
                background: THEME.bgAlt,
                border: `1px solid ${THEME.hairline}`,
                borderRadius: 10,
                textDecoration: "none",
                color: THEME.text,
                transition: "border-color 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = THEME.accent;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = THEME.hairline;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  fontFamily: FONTS.mono,
                  fontSize: "0.72rem",
                  color: THEME.muted,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    padding: "2px 9px",
                    background: `${THEME.accent}15`,
                    border: `1px solid ${THEME.accent}33`,
                    borderRadius: 999,
                    color: THEME.accent,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  {a.tag}
                </span>
                <time dateTime={a.dateISO}>{a.date}</time>
                <span>·</span>
                <span>{a.readTime}</span>
              </div>
              <h2
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.25,
                  margin: "0 0 10px",
                }}
              >
                {a.title}
              </h2>
              <p
                style={{
                  fontSize: "0.98rem",
                  lineHeight: 1.6,
                  color: THEME.textDim,
                  margin: 0,
                }}
              >
                {a.subtitle}
              </p>
              <div
                style={{
                  marginTop: 16,
                  fontFamily: FONTS.mono,
                  fontSize: "0.75rem",
                  color: THEME.accent,
                  letterSpacing: "0.04em",
                }}
              >
                Read article →
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            padding: "20px 22px",
            border: `1px dashed ${THEME.hairline}`,
            borderRadius: 8,
            fontSize: "0.88rem",
            lineHeight: 1.6,
            color: THEME.muted,
            background: `${THEME.accent}05`,
          }}
        >
          More analysis is in the works. Topics on deck: funding-rate
          arbitrage mechanics, the OLP vs HLP design tradeoff, and a closer
          look at RWA perpetuals across venues.
        </div>
      </section>

      <TrustStrip theme={THEME} fonts={FONTS} />
      <Footer theme={THEME} />
    </div>
  );
}
