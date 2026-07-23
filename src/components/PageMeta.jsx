import { useEffect } from "react";

const SITE_URL = "https://tryvariational.xyz";

/**
 * SEO-optimised <head> manager.
 * Updates title, meta description, canonical, Open Graph, Twitter Card,
 * and JSON-LD structured data per route.
 */
const PAGE_META = {
  "/": {
    title: "Trade OpenAI & Anthropic Pre-IPO Perps, Stocks & Crypto | Variational",
    description:
      "Trade OpenAI & Anthropic pre-IPO perps plus stocks (incl. SpaceX), ETFs, commodities and 495+ crypto markets with zero trading fees on Variational. Earn points toward the $VAR airdrop. Built on Arbitrum.",
    og: {
      title: "Trade Pre-IPO Perps, Stocks & Crypto with Zero Fees | Variational",
      description:
        "Zero fees. OpenAI & Anthropic pre-IPO perps plus 495+ markets on Arbitrum.",
      image: `${SITE_URL}/og-image.svg`,
    },
    twitter: {
      title: "Trade Pre-IPO Perps, Stocks & Crypto with Zero Fees | Variational",
      description:
        "495+ markets incl. pre-IPO equities. Zero fees. Total privacy. Built on Arbitrum.",
    },
    jsonLd: null, // homepage uses Organization schema injected separately
  },
  "/terminal": {
    title: "Trade in the Dark | Variational Terminal",
    description:
      "Zero trading fees. Tight aggregated spreads. Total execution privacy. Trade 495+ perpetual markets on Variational's private RFQ engine.",
    og: {
      title: "Trade in the Dark | Variational Terminal",
      description:
        "Zero-fee perpetual trading with complete privacy. No front-running, no visible orders.",
      image: `${SITE_URL}/og-image.svg`,
    },
    twitter: {
      title: "Trade in the Dark | Variational Terminal",
      description:
        "Zero-fee perpetual trading with complete privacy. No front-running, no visible orders.",
    },
    jsonLd: null,
  },
  "/bloomberg": {
    title: "Market Brief | Variational Protocol Analysis",
    description:
      "Bloomberg-style analysis of Variational's zero-fee perpetual trading infrastructure on Arbitrum.",
    og: {
      title: "Market Brief | Variational Protocol Analysis",
      description:
        "In-depth protocol analysis: volume, open interest, funding rates, token valuation scenarios.",
      image: `${SITE_URL}/og-image.svg`,
    },
    twitter: {
      title: "Market Brief | Variational Protocol Analysis",
      description:
        "In-depth protocol analysis: volume, open interest, funding rates, token valuation scenarios.",
    },
    jsonLd: null,
  },
  "/neon": {
    title: "Your Edge Stays Invisible | Variational",
    description:
      "Private execution, tight aggregated spreads, zero trading fees. Trade 495+ perpetual markets where your strategy stays yours.",
    og: {
      title: "Your Edge Stays Invisible | Variational",
      description:
        "Private execution, tight spreads, zero fees. Your strategy stays yours.",
      image: `${SITE_URL}/og-image.svg`,
    },
    twitter: {
      title: "Your Edge Stays Invisible | Variational",
      description:
        "Private execution, tight spreads, zero fees. Your strategy stays yours.",
    },
    jsonLd: null,
  },
  "/rates": {
    title:
      "Funding Rate Comparison Tool | Compare CEX & DEX Rates | Variational",
    description:
      "Compare live funding rates across every major CEX and DEX. Find delta-neutral arbitrage opportunities and farm yield with Variational's funding rate dashboard.",
    og: {
      title: "Funding Rate Comparison Tool | Variational",
      description:
        "Live funding rate spreads between Variational and CEX/DEX exchanges. Spot delta-neutral arb opportunities instantly.",
      image: `${SITE_URL}/og-rates.svg`,
    },
    twitter: {
      title: "Funding Rate Comparison Tool | Variational",
      description:
        "Compare live funding rates across every major CEX and DEX. Find the best delta-neutral arb opportunities.",
    },
    jsonLd: {
      "@type": "WebApplication",
      name: "Variational Funding Rate Comparison Tool",
      description:
        "Live funding rate comparison dashboard across major CEX and DEX exchanges for delta-neutral arbitrage.",
      url: `${SITE_URL}/rates`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  "/compare": {
    title:
      "Perp DEX Comparison | Compare Top Derivatives Protocols | Variational",
    description:
      "Side-by-side comparison of top perpetual DEX protocols. Live data from DefiLlama showing volume, fees, markets, and more.",
    og: {
      title: "Perp DEX Comparison | Variational",
      description:
        "Compare top perp DEX protocols side by side. Live volume, OI, fees, and market data from DefiLlama.",
      image: `${SITE_URL}/og-compare.svg`,
    },
    twitter: {
      title: "Perp DEX Comparison | Variational",
      description:
        "Compare top perp DEX protocols side by side. Live volume, OI, fees, and market data.",
    },
    jsonLd: {
      "@type": "WebApplication",
      name: "Variational Perp DEX Comparison Tool",
      description:
        "Live comparison of perpetual DEX protocols by volume, open interest, fees, and TVL.",
      url: `${SITE_URL}/compare`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  "/liquidations": {
    title:
      "Hyperliquid Liquidation Level Estimator | Variational",
    description:
      "Estimate theoretical long and short liquidation levels for Hyperliquid markets using live mark prices and configurable leverage bands.",
    og: {
      title: "Hyperliquid Liquidation Level Estimator | Variational",
      description:
        "Live Hyperliquid marks with clearly labeled theoretical liquidation level estimates.",
      image: `${SITE_URL}/og-liquidations.svg`,
    },
    twitter: {
      title: "Hyperliquid Liquidation Level Estimator | Variational",
      description:
        "Live Hyperliquid marks with clearly labeled theoretical liquidation level estimates.",
    },
    jsonLd: {
      "@type": "WebApplication",
      name: "Variational Hyperliquid Liquidation Level Estimator",
      description:
        "Theoretical liquidation level estimates derived from live Hyperliquid marks and simplified leverage assumptions.",
      url: `${SITE_URL}/liquidations`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },
  "/pre-ipo": {
    title:
      "Trade OpenAI & Anthropic Pre-IPO Perps with Zero Fees | Variational",
    description:
      "Get long or short exposure to OpenAI and Anthropic before they go public. Pre-IPO perpetuals with 0% trading fees on Variational Omni — no accreditation, no broker, 24/7.",
    og: {
      title: "Trade OpenAI & Anthropic Before They IPO",
      description:
        "Pre-IPO perpetuals with 0% fees. Long or short OPENAI, ANTHROPIC — 24/7, on-chain, no accreditation.",
      image: `${SITE_URL}/og-preipo.svg`,
    },
    twitter: {
      title: "Trade OpenAI & Anthropic Before They IPO",
      description:
        "Pre-IPO perps with 0% fees on Variational Omni. No accreditation, no broker, 24/7 on-chain.",
    },
    jsonLd: {
      "@type": "WebPage",
      name: "Pre-IPO Perpetuals on Variational",
      description:
        "Trade pre-IPO perpetual futures on OpenAI and Anthropic with zero trading fees.",
      url: `${SITE_URL}/pre-ipo`,
    },
  },
  "/insights": {
    title: "Insights | Perp DEX Research & Analysis | tryvariational",
    description:
      "Independent research and analysis on decentralized perpetuals — Hyperliquid, Lighter, Variational, and the broader perp DEX category.",
    og: {
      title: "Insights | Perp DEX Research & Analysis",
      description:
        "Architecture deep-dives, side-by-side comparisons, and category notes from tryvariational.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "Insights | Perp DEX Research & Analysis",
      description:
        "Architecture deep-dives, side-by-side comparisons, and category notes from tryvariational.",
    },
    jsonLd: {
      "@type": "Blog",
      name: "tryvariational Insights",
      description:
        "Independent research and analysis on the decentralized perpetuals category.",
      url: `${SITE_URL}/insights`,
    },
  },
  "/insights/why-perp-dexes-coexist": {
    title:
      "The Perp DEX Market Isn't Winner-Take-All | Hyperliquid vs Lighter vs Variational",
    description:
      "Different architectures attract different traders. Why Hyperliquid, Lighter, and Variational each own a distinct slice of decentralized perpetuals — and why their growth is additive, not zero-sum.",
    og: {
      title:
        "The Perp DEX Market Isn't Winner-Take-All — Why Hyperliquid, Lighter, and Variational All Win",
      description:
        "Three architectures, three audiences. A neutral take on why the perp DEX category isn't zero-sum.",
      image: `${SITE_URL}/og-insights-coexist.svg`,
    },
    twitter: {
      title:
        "The Perp DEX Market Isn't Winner-Take-All — Why Three Top Venues Can All Coexist",
      description:
        "Architecture is destiny. Hyperliquid, Lighter, Variational — different products for different traders.",
    },
    jsonLd: {
      "@type": "Article",
      headline:
        "The Perp DEX Market Isn't Winner-Take-All: Why Hyperliquid, Lighter, and Variational All Win",
      description:
        "Different architectures attract different traders. Why three of the largest decentralized perpetual exchanges occupy distinct niches and grow in parallel.",
      url: `${SITE_URL}/insights/why-perp-dexes-coexist`,
      image: `${SITE_URL}/og-insights-coexist.svg`,
      datePublished: "2026-05-23",
      dateModified: "2026-05-23",
      author: {
        "@type": "Organization",
        name: "tryvariational",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "tryvariational",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-image.svg`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/insights/why-perp-dexes-coexist`,
      },
      keywords:
        "perp DEX, Hyperliquid, Lighter, Variational, perpetual futures, RFQ, CLOB, decentralized derivatives",
      articleSection: "Category Analysis",
      inLanguage: "en",
    },
  },
  "/insights/openai-pre-ipo-perps": {
    title: "How to Get OpenAI Pre-IPO Exposure in 2026 | Variational",
    description:
      "Retail can't buy OpenAI stock and secondary markets are gated to accredited investors. How synthetic pre-IPO perpetuals let anyone go long or short OpenAI 24/7 — zero fees, plus $VAR airdrop points.",
    og: {
      title: "How to Get OpenAI Pre-IPO Exposure — Long or Short, 24/7",
      description:
        "No accreditation, no minimums. Trade OpenAI's private-market valuation with zero-fee perps and farm the $VAR airdrop.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "How to Get OpenAI Pre-IPO Exposure in 2026",
      description:
        "Synthetic pre-IPO perps: long or short OpenAI, 24/7, zero fees, $VAR airdrop points on every trade.",
    },
    jsonLd: {
      "@type": "Article",
      headline: "How to Get OpenAI Pre-IPO Exposure in 2026",
      description:
        "A guide to gaining OpenAI pre-IPO exposure through synthetic oracle-priced perpetual futures — no accreditation required, long or short, with zero trading fees.",
      url: `${SITE_URL}/insights/openai-pre-ipo-perps`,
      image: `${SITE_URL}/og-insights.svg`,
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "tryvariational",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/insights/openai-pre-ipo-perps`,
      },
      keywords:
        "OpenAI pre-IPO, OpenAI stock, invest in OpenAI, pre-IPO perpetuals, Variational, synthetic exposure, $VAR airdrop",
      articleSection: "Pre-IPO Guide",
      inLanguage: "en",
    },
  },
  "/insights/anthropic-pre-ipo-perps": {
    title: "How to Get Anthropic Pre-IPO Exposure in 2026 | Variational",
    description:
      "You can't buy Anthropic stock and secondary markets require accreditation. How pre-IPO perpetuals let anyone go long or short Anthropic 24/7 — zero fees, plus $VAR airdrop points.",
    og: {
      title: "How to Get Anthropic Pre-IPO Exposure — Long or Short, 24/7",
      description:
        "No accreditation, no minimums. Trade Anthropic's private-market valuation with zero-fee perps and farm the $VAR airdrop.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "How to Get Anthropic Pre-IPO Exposure in 2026",
      description:
        "Synthetic pre-IPO perps: long or short Anthropic, 24/7, zero fees, $VAR airdrop points on every trade.",
    },
    jsonLd: {
      "@type": "Article",
      headline: "How to Get Anthropic Pre-IPO Exposure in 2026",
      description:
        "A guide to gaining Anthropic pre-IPO exposure through synthetic oracle-priced perpetual futures — no accreditation required, long or short, with zero trading fees.",
      url: `${SITE_URL}/insights/anthropic-pre-ipo-perps`,
      image: `${SITE_URL}/og-insights.svg`,
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "tryvariational",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/insights/anthropic-pre-ipo-perps`,
      },
      keywords:
        "Anthropic pre-IPO, Anthropic stock, invest in Anthropic, pre-IPO perpetuals, Variational, synthetic exposure, $VAR airdrop",
      articleSection: "Pre-IPO Guide",
      inLanguage: "en",
    },
  },
  "/insights/funding-rate-farming-guide": {
    title: "Funding-Rate Farming: A Delta-Neutral Guide | Variational",
    description:
      "A step-by-step tutorial on collecting funding-rate spreads with limited directional risk — and why Variational's 0% fees plus $VAR airdrop points make it a double yield.",
    og: {
      title: "Funding-Rate Farming: A Delta-Neutral Guide",
      description:
        "Collect funding spreads with net-zero delta. Why 0% fees and $VAR airdrop points make Variational a strong leg.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "Funding-Rate Farming: A Delta-Neutral Guide",
      description:
        "Step-by-step: collect funding-rate spreads with limited directional risk. Zero fees + $VAR airdrop = double yield.",
    },
    jsonLd: {
      "@type": "Article",
      headline: "Funding-Rate Farming on Variational: A Delta-Neutral Guide",
      description:
        "A step-by-step tutorial on delta-neutral funding-rate farming, why zero trading fees maximize the spread you keep, and how $VAR airdrop points stack on top.",
      url: `${SITE_URL}/insights/funding-rate-farming-guide`,
      image: `${SITE_URL}/og-insights.svg`,
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "tryvariational",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/insights/funding-rate-farming-guide`,
      },
      keywords:
        "funding rate farming, funding rate arbitrage, delta neutral, basis trade, Variational, zero fees, $VAR airdrop",
      articleSection: "Tutorial",
      inLanguage: "en",
    },
  },
  "/insights/variational-review": {
    title: "Variational Review 2026: Fees, Airdrop & Pre-IPO Markets | Variational Omni",
    description:
      "An honest review of Variational Omni — 0% maker/taker fees, the RFQ/OLP model, 495+ markets, the $VAR airdrop, OpenAI & Anthropic pre-IPO perps, and the real caveats. Referral code included.",
    og: {
      title: "Variational Review 2026 — 0% Fees, $VAR Airdrop & Pre-IPO Perps",
      description:
        "A user-perspective review of Variational Omni: how the zero-fee model works, what's good, the honest cons, and how to get started.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "Variational Review 2026: Fees, Airdrop & Pre-IPO Markets",
      description:
        "0% fees, 495+ markets, OpenAI/Anthropic pre-IPO perps, $VAR airdrop — an honest review with the real caveats.",
    },
    jsonLd: {
      "@graph": [
        {
          "@type": "Article",
          headline: "Variational Review 2026: Fees, Airdrop & Pre-IPO Markets",
          description:
            "An honest, user-perspective review of Variational Omni — the zero-fee RFQ model, market breadth, the $VAR airdrop, pre-IPO perps, and the real caveats.",
          url: `${SITE_URL}/insights/variational-review`,
          image: `${SITE_URL}/og-insights.svg`,
          datePublished: "2026-07-06",
          dateModified: "2026-07-06",
          author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "tryvariational",
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/insights/variational-review`,
          },
          keywords:
            "Variational review, Variational exchange, Variational Omni, Variational fees, Variational referral code, $VAR airdrop",
          articleSection: "Review",
          inLanguage: "en",
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How much does Variational charge?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Variational Omni charges 0% maker and 0% taker fees on all markets. The cost to traders is the bid-ask spread quoted by the OLP, not an explicit trading fee.",
              },
            },
            {
              "@type": "Question",
              name: "Is Variational legit? Who backed it?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Variational raised a $50M Series A led by Dragonfly, with Bain Capital Crypto and Coinbase Ventures participating. Its contracts have been audited by Spearbit and Zellic.",
              },
            },
            {
              "@type": "Question",
              name: "Do I need an access code?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Omni is in private beta and requires an access (referral) code to onboard. The code grants access only — it is not a fee discount, since Variational already charges 0% fees.",
              },
            },
            {
              "@type": "Question",
              name: "Can US residents use Variational?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Residents of the United States and Canada are restricted persons and cannot access Variational.",
              },
            },
            {
              "@type": "Question",
              name: "What is the $VAR airdrop?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Variational runs a pre-token points program: every dollar of trading volume earns points toward the future $VAR token, with a community allocation targeted around 50% per the docs.",
              },
            },
          ],
        },
      ],
    },
  },
  "/insights/pre-ipo-perps-explained": {
    title: "Pre-IPO Perps Explained: How They Work & Where to Trade | Variational",
    description:
      "What pre-IPO perpetuals are, how oracle pricing and funding tether them to private-market valuations, why the same contract diverges across venues, and how they compare to owning real shares.",
    og: {
      title: "Pre-IPO Perps Explained — How They Work and Where to Trade",
      description:
        "The definitive explainer: synthetic exposure, oracle pricing, cross-venue divergence, IPO conversion, and the risks — with live cross-venue data.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "Pre-IPO Perps Explained: How They Work and Where to Trade",
      description:
        "Synthetic exposure, oracle pricing, cross-venue divergence, and the risks — the definitive pre-IPO perps explainer.",
    },
    jsonLd: {
      "@graph": [
        {
          "@type": "Article",
          headline: "Pre-IPO Perps Explained: How They Work and Where to Trade Them",
          description:
            "A definitive explainer on pre-IPO perpetual futures — synthetic exposure, oracle-based pricing, funding, cross-venue price divergence, IPO conversion, and risks.",
          url: `${SITE_URL}/insights/pre-ipo-perps-explained`,
          image: `${SITE_URL}/og-insights.svg`,
          datePublished: "2026-07-06",
          dateModified: "2026-07-06",
          author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "tryvariational",
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/insights/pre-ipo-perps-explained`,
          },
          keywords:
            "pre-IPO perps, pre-IPO perpetuals, pre-IPO trading platform, how pre-IPO perps work, synthetic exposure, oracle pricing",
          articleSection: "Explainer",
          inLanguage: "en",
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Can you buy OpenAI pre-IPO?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Unaccredited retail can't buy OpenAI shares directly, but you can get synthetic price exposure through pre-IPO perpetuals that track OpenAI's private-market valuation — long or short, with no accreditation.",
              },
            },
            {
              "@type": "Question",
              name: "Is buying pre-IPO a good idea?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on risk tolerance. Pre-IPO perps are volatile and model-priced until real price discovery exists. They offer asymmetric upside and the ability to short, but carry oracle, funding, and leverage risk. This is not financial advice.",
              },
            },
          ],
        },
      ],
    },
  },
  "/insights/best-pre-ipo-platforms": {
    title: "Best Ways to Buy Pre-IPO Stock in 2026: Forge vs EquityZen vs Hiive vs Perps",
    description:
      "Forge Global, EquityZen, and Hiive gate pre-IPO shares to accredited investors. How they compare to pre-IPO perps — and how anyone can go long or short OpenAI and Anthropic without accreditation.",
    og: {
      title: "Best Ways to Buy Pre-IPO Stock in 2026 — Forge, EquityZen, Hiive vs Perps",
      description:
        "A fair comparison of accredited-only secondary marketplaces vs synthetic pre-IPO perps. Own equity, or trade OpenAI/Anthropic with no accreditation.",
      image: `${SITE_URL}/og-insights.svg`,
    },
    twitter: {
      title: "Forge vs EquityZen vs Hiive vs Pre-IPO Perps",
      description:
        "Secondary marketplaces need accreditation; perps don't. How to get OpenAI & Anthropic exposure either way.",
    },
    jsonLd: {
      "@graph": [
        {
          "@type": "Article",
          headline: "Best Ways to Buy Pre-IPO Stock in 2026: Forge vs EquityZen vs Hiive vs Perps",
          description:
            "A fair comparison of accredited-only secondary-share marketplaces (Forge Global, EquityZen, Hiive) and synthetic pre-IPO perpetuals, and how to invest in OpenAI or Anthropic without accreditation.",
          url: `${SITE_URL}/insights/best-pre-ipo-platforms`,
          image: `${SITE_URL}/og-insights.svg`,
          datePublished: "2026-07-06",
          dateModified: "2026-07-06",
          author: { "@type": "Organization", name: "tryvariational", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "tryvariational",
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.svg` },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/insights/best-pre-ipo-platforms`,
          },
          keywords:
            "Forge Global alternative, EquityZen alternative, Hiive alternative, best pre-IPO platform, how to invest in OpenAI, how to invest in Anthropic, buy pre-IPO stock",
          articleSection: "Comparison",
          inLanguage: "en",
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the best pre-IPO platform?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on whether you want real equity or price exposure. Forge Global, EquityZen, and Hiive sell actual secondary shares but require accredited-investor status; pre-IPO perpetuals offer synthetic exposure with no accreditation, long or short.",
              },
            },
            {
              "@type": "Question",
              name: "Which is better, Forge or Hiive?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Both are reputable, accredited-only secondary marketplaces with similar structures — Forge tends to have broader inventory, while Hiive emphasizes a direct marketplace model. Neither serves unaccredited retail; pre-IPO perps do.",
              },
            },
            {
              "@type": "Question",
              name: "Can I invest in Anthropic on Robinhood?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Robinhood does not offer direct private-company shares of Anthropic. Unaccredited investors typically access Anthropic exposure through pre-IPO perpetuals rather than buying equity.",
              },
            },
          ],
        },
      ],
    },
  },
};

/* Organisation schema — injected on every page */
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Variational",
  url: SITE_URL,
  description:
    "Peer-to-peer derivatives protocol on Arbitrum with zero trading fees, tight aggregated spreads, and private RFQ execution.",
  sameAs: [
    "https://x.com/variaboreal",
    "https://discord.gg/variational",
  ],
};

function setMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/* Vanity ad-campaign aliases render the same page as /pre-ipo — give
 * them identical meta so the lookup doesn't fall back to the homepage.
 * Canonical still points at the alias path itself, which is fine for
 * ads (each campaign URL self-canonicalizes). */
PAGE_META["/spacex"] = PAGE_META["/pre-ipo"];
PAGE_META["/spcx"] = PAGE_META["/pre-ipo"];

let firstPageVisit = true;

export default function PageMeta({ path }) {
  useEffect(() => {
    const normalizedPath = path === "/" ? path : path.replace(/\/+$/, "");
    const meta = PAGE_META[normalizedPath] || PAGE_META["/"];

    /* Reddit Pixel: index.html fires PageVisit for the initial load;
     * re-fire here on SPA route CHANGES only (skip first mount to
     * avoid double-counting the landing view). */
    if (firstPageVisit) {
      firstPageVisit = false;
    } else if (typeof window.rdt === "function") {
      window.rdt("track", "PageVisit");
    }

    /* Title */
    document.title = meta.title;

    /* Description */
    setMetaTag("name", "description", meta.description);

    /* Canonical */
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute(
        "href",
        `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`
      );
    }

    /* Open Graph */
    setMetaTag("property", "og:title", meta.og.title);
    setMetaTag("property", "og:description", meta.og.description);
    setMetaTag("property", "og:image", meta.og.image);
    setMetaTag(
      "property",
      "og:url",
      `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`
    );
    setMetaTag("property", "og:type", "website");

    /* Twitter Card */
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", meta.twitter.title);
    setMetaTag("name", "twitter:description", meta.twitter.description);
    setMetaTag(
      "name",
      "twitter:image",
      meta.og.image /* reuse OG image for twitter */
    );

    /* JSON-LD: Organisation (always present) */
    setJsonLd("ld-org", ORG_SCHEMA);

    /* JSON-LD: Page-specific (WebApplication for tool pages) */
    if (meta.jsonLd) {
      setJsonLd("ld-page", {
        "@context": "https://schema.org",
        ...meta.jsonLd,
      });
    } else {
      const existing = document.getElementById("ld-page");
      if (existing) existing.remove();
    }
  }, [path]);

  return null;
}
