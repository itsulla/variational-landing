import { useEffect, useState } from "react";
import { POINTS_DATA, REFERRAL_LINK, REFERRAL_CODE } from "../config.js";

/**
 * Footer — site-wide, theme-aware.
 *
 * Includes a live countdown banner to the $VAR points-program snapshot
 * deadline (POINTS_DATA.programEndDate, currently 2026-09-30). The
 * banner self-hides if the deadline has passed so we don't ship "ended
 * 47 days ago" indefinitely.
 *
 * The whole thing renders once per page (every theme mounts <Footer/>
 * at the bottom), so it's the right place for a site-wide CTA.
 */

const PROGRAM_END_MS = new Date(POINTS_DATA.programEndDate).getTime();

function computeRemaining(now = Date.now()) {
  const diff = PROGRAM_END_MS - now;
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function CountdownBanner({ theme }) {
  const [remaining, setRemaining] = useState(() => computeRemaining());

  useEffect(() => {
    if (!remaining) return undefined;
    const tick = () => setRemaining(computeRemaining());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [remaining === null]);

  if (!remaining) return null;

  const accent = theme?.accent || "#60a5fa";
  const bg = theme?.bg || "#0a0e1a";
  const text = theme?.text || "#e8ecf4";
  const muted = theme?.muted || "#94a3b8";

  const wrap = {
    width: "100%",
    background: `linear-gradient(135deg, ${accent}12, ${bg})`,
    borderTop: `1px solid ${accent}33`,
    borderBottom: `1px solid ${muted}22`,
    padding: "20px 16px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const inner = {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center",
    justifyContent: "space-between",
  };

  const left = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: "1 1 280px",
    minWidth: 0,
  };

  const eyebrow = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: accent,
  };

  const headline = {
    fontSize: "0.92rem",
    fontWeight: 600,
    color: text,
    lineHeight: 1.4,
  };

  const subline = {
    fontSize: "0.74rem",
    color: muted,
    lineHeight: 1.4,
  };

  const counter = {
    display: "flex",
    gap: 6,
    alignItems: "flex-end",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  };

  const unit = (val, label, big = false) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36 }}>
      <span
        style={{
          fontSize: big ? "1.55rem" : "1.1rem",
          color: text,
          lineHeight: 1,
        }}
      >
        {String(val).padStart(2, "0")}
      </span>
      <span
        style={{
          fontSize: "0.55rem",
          color: muted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {label}
      </span>
    </div>
  );

  const sep = (
    <span style={{ color: `${muted}88`, fontSize: "1.1rem", paddingBottom: 14 }}>:</span>
  );

  const cta = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: accent,
    color: bg,
    fontWeight: 700,
    fontSize: "0.82rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    borderRadius: 6,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s, transform 0.1s",
  };

  return (
    <section aria-label="Variational airdrop countdown" style={wrap}>
      <div style={inner}>
        <div style={left}>
          <span style={eyebrow}>$VAR points snapshot · Q3 2026</span>
          <span style={headline}>
            Airdrop farming window closes in
          </span>
          <span style={subline}>
            Points program ends {new Date(POINTS_DATA.programEndDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            UTC · Trade now to earn points toward $VAR
          </span>
        </div>

        <div style={counter} aria-live="polite">
          {unit(remaining.days, "days", true)}
          {sep}
          {unit(remaining.hours, "hrs", true)}
          {sep}
          {unit(remaining.minutes, "min", true)}
          {sep}
          {unit(remaining.seconds, "sec", true)}
        </div>

        <a
          href={REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={cta}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Start farming → <span style={{ opacity: 0.75, fontWeight: 500 }}>code {REFERRAL_CODE}</span>
        </a>
      </div>
    </section>
  );
}

export default function Footer({ theme }) {
  const text = theme?.text || "#e8ecf4";
  const muted = theme?.muted || "#94a3b8";

  return (
    <>
      <CountdownBanner theme={theme} />
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          fontSize: "0.75rem",
          color: `${text}66`,
          borderTop: `1px solid ${muted}22`,
          lineHeight: 1.6,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Contains referral link. Author earns points from referred volume. Not financial advice. DYOR.
      </footer>
    </>
  );
}
