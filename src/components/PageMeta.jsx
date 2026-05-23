import { useEffect } from "react";

const SITE_URL = "https://tryvariational.xyz";

/**
 * SEO-optimised <head> manager.
 * Updates title, meta description, canonical, Open Graph, Twitter Card,
 * and JSON-LD structured data per route.
 */
const PAGE_META = {
  "/": {
    title: "Trade 450+ Perpetuals with Zero Fees | Variational on Arbitrum",
    description:
      "Trade perpetual futures on Variational with zero trading fees, tight aggregated spreads, and private RFQ execution. Earn points toward the $VAR airdrop. Built on Arbitrum (currently in private beta).",
    og: {
      title: "Trade 450+ Perpetuals with Zero Fees | Variational",
      description:
        "Zero fees. Tight aggregated spreads. Private execution. 450+ perpetual markets on Arbitrum.",
      image: `${SITE_URL}/og-image.svg`,
    },
    twitter: {
      title: "Trade 450+ Perpetuals with Zero Fees | Variational",
      description:
        "450+ perp markets. Zero fees. Tight aggregated spreads. Total privacy. Built on Arbitrum.",
    },
    jsonLd: null, // homepage uses Organization schema injected separately
  },
  "/terminal": {
    title: "Trade in the Dark | Variational Terminal",
    description:
      "Zero trading fees. Tight aggregated spreads. Total execution privacy. Trade 450+ perpetual markets on Variational's private RFQ engine.",
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
      "Private execution, tight aggregated spreads, zero trading fees. Trade 450+ perpetual markets where your strategy stays yours.",
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
      "Crypto Liquidations Tracker | Live Liquidation Data | Variational",
    description:
      "Track real-time crypto liquidations across major exchanges. Monitor liquidation events, heatmaps, and market sentiment.",
    og: {
      title: "Crypto Liquidations Tracker | Variational",
      description:
        "Real-time crypto liquidation data and heatmaps across major perpetual exchanges.",
      image: `${SITE_URL}/og-liquidations.svg`,
    },
    twitter: {
      title: "Crypto Liquidations Tracker | Variational",
      description:
        "Real-time crypto liquidation data and heatmaps across major perpetual exchanges.",
    },
    jsonLd: {
      "@type": "WebApplication",
      name: "Variational Crypto Liquidations Tracker",
      description:
        "Real-time liquidation monitoring and heatmap visualization across major perpetual exchanges.",
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

export default function PageMeta({ path }) {
  useEffect(() => {
    const meta = PAGE_META[path] || PAGE_META["/"];

    /* Title */
    document.title = meta.title;

    /* Description */
    setMetaTag("name", "description", meta.description);

    /* Canonical */
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute(
        "href",
        `${SITE_URL}${path === "/" ? "" : path}`
      );
    }

    /* Open Graph */
    setMetaTag("property", "og:title", meta.og.title);
    setMetaTag("property", "og:description", meta.og.description);
    setMetaTag("property", "og:image", meta.og.image);
    setMetaTag("property", "og:url", `${SITE_URL}${path === "/" ? "" : path}`);
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
