import { useState, useMemo } from "react";
import { getWeeksRemaining, REFERRAL_LINK } from "../config.js";

const FDV_OPTIONS = [
  { label: "$500M", value: 500_000_000 },
  { label: "$1B", value: 1_000_000_000, sub: "LIT-level" },
  { label: "$2B", value: 2_000_000_000 },
  { label: "$5B", value: 5_000_000_000 },
  { label: "$29B", value: 29_000_000_000, sub: "HYPE-level" },
];

const VOLUME_OPTIONS = [
  { label: "$100K", value: 100_000 },
  { label: "$500K", value: 500_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$5M", value: 5_000_000 },
  { label: "$10M", value: 10_000_000 },
];

function formatUsd(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function AirdropCalculator({ theme, fonts }) {
  const t = theme;
  const [fdv, setFdv] = useState(1_000_000_000);
  const [userPoints, setUserPoints] = useState(100);
  const [totalPoints, setTotalPoints] = useState(9_500_000);
  const [weeklyVolume, setWeeklyVolume] = useState(1_000_000);
  const [pointsRate, setPointsRate] = useState(5);
  const [communityPct, setCommunityPct] = useState(10);

  const weeksRemaining = getWeeksRemaining();

  const results = useMemo(() => {
    const tokenPool = fdv * (communityPct / 100);
    const valuePerPoint = tokenPool / totalPoints;
    const currentValue = userPoints * valuePerPoint;
    const projectedPoints = (weeklyVolume / 1_000_000) * pointsRate * weeksRemaining;
    const projectedValue = projectedPoints * valuePerPoint;
    return { valuePerPoint, currentValue, projectedPoints, projectedValue };
  }, [fdv, userPoints, totalPoints, weeklyVolume, pointsRate, weeksRemaining, communityPct]);

  const sectionStyle = {
    fontFamily: fonts.body,
    color: t.text,
  };

  const labelStyle = {
    fontSize: "0.85rem",
    color: t.muted,
    marginBottom: 8,
    fontWeight: 500,
  };

  const btnGroup = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  };

  const btn = (active) => ({
    padding: "8px 16px",
    border: `1px solid ${active ? t.accent : t.muted + "44"}`,
    borderRadius: 8,
    background: active ? `${t.accent}22` : "transparent",
    color: active ? t.accent : t.text,
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${t.muted}44`,
    borderRadius: 8,
    background: `${t.bg}`,
    color: t.text,
    fontFamily: fonts.body,
    fontSize: "1rem",
    outline: "none",
    marginBottom: 20,
  };

  const sliderWrap = {
    marginBottom: 20,
  };

  const sliderLabel = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: t.muted,
    marginTop: 4,
  };

  const outputCard = {
    padding: "16px 20px",
    borderRadius: 10,
    border: `1px solid ${t.accent}33`,
    background: `${t.accent}0a`,
    marginBottom: 12,
  };

  const outputLabel = {
    fontSize: "0.78rem",
    color: t.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
  };

  const outputValue = {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: t.accent,
    fontFamily: fonts.heading || fonts.body,
  };

  const outputSub = {
    fontSize: "0.78rem",
    color: `${t.text}99`,
    marginTop: 2,
  };

  const disclaimer = {
    fontSize: "0.75rem",
    color: `${t.text}66`,
    lineHeight: 1.5,
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 8,
    border: `1px solid ${t.muted}22`,
  };

  return (
    <div style={sectionStyle}>
      {/* FDV Scenario */}
      <div style={labelStyle}>FDV Scenario</div>
      <div style={btnGroup}>
        {FDV_OPTIONS.map((o) => (
          <button key={o.value} style={btn(fdv === o.value)} onClick={() => setFdv(o.value)}>
            {o.label}
            {o.sub && (
              <span style={{ fontSize: "0.7rem", opacity: 0.7, marginLeft: 4 }}>
                ({o.sub})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Community Allocation */}
      <div style={labelStyle}>
        Community Allocation: {communityPct}%
        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: `${t.muted}cc`, fontWeight: 400 }}>
          (docs: ~50% target)
        </span>
      </div>
      <div style={sliderWrap}>
        <input
          type="range"
          min={5}
          max={50}
          step={1}
          value={communityPct}
          onChange={(e) => setCommunityPct(Number(e.target.value))}
          style={{ width: "100%", accentColor: t.accent }}
        />
        <div style={sliderLabel}>
          <span>5%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Your Current Points */}
      <div style={labelStyle}>Your Current Points</div>
      <input
        type="number"
        value={userPoints}
        onChange={(e) => setUserPoints(Math.max(0, Number(e.target.value)))}
        style={inputStyle}
        min={0}
      />

      {/* Total Points at TGE */}
      <div style={labelStyle}>Est. Total Points at TGE: {(totalPoints / 1_000_000).toFixed(1)}M</div>
      <div style={sliderWrap}>
        <input
          type="range"
          min={5_000_000}
          max={15_000_000}
          step={500_000}
          value={totalPoints}
          onChange={(e) => setTotalPoints(Number(e.target.value))}
          style={{ width: "100%", accentColor: t.accent }}
        />
        <div style={sliderLabel}>
          <span>5M</span>
          <span>15M</span>
        </div>
      </div>

      {/* Weekly Volume */}
      <div style={labelStyle}>Your Weekly Trading Volume</div>
      <div style={btnGroup}>
        {VOLUME_OPTIONS.map((o) => (
          <button
            key={o.value}
            style={btn(weeklyVolume === o.value)}
            onClick={() => setWeeklyVolume(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Points Rate */}
      <div style={labelStyle}>
        Est. Points per $1M Volume: {pointsRate}
      </div>
      <div style={sliderWrap}>
        <input
          type="range"
          min={1}
          max={15}
          step={1}
          value={pointsRate}
          onChange={(e) => setPointsRate(Number(e.target.value))}
          style={{ width: "100%", accentColor: t.accent }}
        />
        <div style={sliderLabel}>
          <span>Conservative (1)</span>
          <span>Optimistic (15)</span>
        </div>
      </div>

      {/* Outputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 8 }}>
        <div style={outputCard}>
          <div style={outputLabel}>Value per Point</div>
          <div style={outputValue}>{formatUsd(results.valuePerPoint)}</div>
          <div style={outputSub}>at {formatUsd(fdv)} FDV</div>
        </div>
        <div style={outputCard}>
          <div style={outputLabel}>Current Points Value</div>
          <div style={outputValue}>{formatUsd(results.currentValue)}</div>
          <div style={outputSub}>{userPoints.toLocaleString()} pts</div>
        </div>
        <div style={outputCard}>
          <div style={outputLabel}>Volume Projection Value</div>
          <div style={outputValue}>{formatUsd(results.projectedValue)}</div>
          <div style={outputSub}>
            ~{Math.round(results.projectedPoints).toLocaleString()} pts over {weeksRemaining} weeks
          </div>
        </div>
      </div>

      {/* FDV Context */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 16,
          fontSize: "0.8rem",
          color: t.muted,
        }}
      >
        <span>HYPE FDV: ~$29B</span>
        <span>LIT FDV: ~$1B</span>
        <span style={{ color: t.accent, fontWeight: 600 }}>
          Selected: {formatUsd(fdv)}
        </span>
        <span>{weeksRemaining} weeks remaining</span>
      </div>

      <div style={disclaimer}>
        Estimates only. Community allocation set to {communityPct}% (slider above; Variational docs target ~50%). Default points rate (~5 pts/$1M) calibrated from observed trader data. Actual rates depend on weekly platform activity and reward tier. Not financial advice.
      </div>
    </div>
  );
}
