import { MARKET_DATA } from "../config.js";

const ROWS = [
  { label: "Trading Fees", key: "tradingFees", varWins: true },
  { label: "Execution Privacy", key: "executionPrivacy", varWins: true },
  { label: "Block Trade Slippage", key: "blockTradeSlippage", varWins: true },
  { label: "Tradable Markets", key: "tradableMarkets", varWins: true },
  { label: "Execution Edge", key: "executionEdge", varWins: true },
  { label: "Architecture", key: "architecture", varWins: false },
  { label: "Community Token Allocation", key: "communityAllocation", varWins: true },
  { label: "Funding Raised", key: "raised", varWins: false },
  { label: "Current FDV", key: "fdv", varWins: false },
  { label: "Status", key: "status", varWins: false },
];

export default function ComparisonTable({ theme, fonts, compact }) {
  const t = theme;
  const protocols = ["variational", "hyperliquid", "lighter"];

  const tableWrap = {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    borderRadius: 12,
    border: `1px solid ${t.muted}33`,
  };

  const table = {
    width: "100%",
    minWidth: compact ? 600 : "auto",
    borderCollapse: "collapse",
    fontFamily: fonts.body,
    fontSize: compact ? "0.8rem" : "0.9rem",
  };

  const thStyle = (isVar) => ({
    padding: compact ? "10px 12px" : "14px 18px",
    textAlign: "left",
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: compact ? "0.85rem" : "1rem",
    color: isVar ? t.accent : t.text,
    background: isVar ? `${t.accent}15` : `${t.bg}cc`,
    borderBottom: `2px solid ${t.muted}44`,
    position: compact ? "sticky" : "static",
    left: 0,
    zIndex: isVar ? 2 : 1,
    whiteSpace: "nowrap",
  });

  const labelTh = {
    ...thStyle(false),
    color: t.muted,
    fontWeight: 600,
    fontSize: compact ? "0.75rem" : "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    minWidth: compact ? 140 : "auto",
    background: t.bg,
  };

  const cellStyle = (isVar, isWinRow) => ({
    padding: compact ? "10px 12px" : "12px 18px",
    borderBottom: `1px solid ${t.muted}22`,
    color: isVar ? t.text : `${t.text}bb`,
    fontWeight: isVar ? 600 : 400,
    background: isVar && isWinRow ? `${t.winHighlight || t.accent}10` : "transparent",
    whiteSpace: compact ? "normal" : "nowrap",
  });

  const labelCell = (isWinRow) => ({
    padding: compact ? "10px 12px" : "12px 18px",
    borderBottom: `1px solid ${t.muted}22`,
    color: t.muted,
    fontWeight: 500,
    fontSize: compact ? "0.78rem" : "0.85rem",
    position: compact ? "sticky" : "static",
    left: 0,
    background: isWinRow ? `${t.winHighlight || t.accent}08` : t.bg,
    zIndex: 1,
  });

  return (
    <div style={tableWrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={labelTh}>Feature</th>
            {protocols.map((p) => (
              <th key={p} style={thStyle(p === "variational")}>
                {MARKET_DATA[p].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <td style={labelCell(row.varWins)}>{row.label}</td>
              {protocols.map((p) => (
                <td key={p} style={cellStyle(p === "variational", row.varWins)}>
                  {MARKET_DATA[p][row.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
