import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { REFERRAL_LINK } from "../config.js";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/pre-ipo", label: "Pre-IPO Perps", badge: "NEW" },
  { path: "/rates", label: "Funding Rates" },
  { path: "/compare", label: "DEX Compare" },
  { path: "/liquidations", label: "Liquidations" },
  { path: "/insights", label: "Insights" },
];

/**
 * Minimal sticky nav header.
 * Adapts to each theme via `accent` and `bg` props.
 */
export default function NavHeader({ accent = "#60a5fa", bg = "#0a0e1a", text = "#e8ecf4" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: `${bg}ee`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${text}11`,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
        }}
      >
        {/* Logo / Brand */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill={accent} opacity="0.9" />
            <path
              d="M10 20L16 10L22 20"
              stroke={bg}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: text,
              letterSpacing: "0.03em",
            }}
          >
            tryvariational
          </span>
        </button>

        {/* Desktop nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          className="nav-desktop"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive ? `${accent}18` : "transparent",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  color: isActive ? accent : `${text}99`,
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = text;
                    e.currentTarget.style.background = `${text}08`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = `${text}99`;
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      marginLeft: 6,
                      padding: "1px 6px",
                      borderRadius: 999,
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      background: accent,
                      color: bg,
                      verticalAlign: "middle",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 8,
              padding: "6px 16px",
              background: accent,
              color: bg,
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: "inherit",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Start Trading →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: text,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="nav-mobile-dropdown"
          style={{
            display: "none",
            flexDirection: "column",
            padding: "8px 24px 16px",
            borderTop: `1px solid ${text}11`,
            gap: 4,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                style={{
                  background: isActive ? `${accent}18` : "transparent",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 12px",
                  color: isActive ? accent : `${text}bb`,
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      marginLeft: 6,
                      padding: "1px 6px",
                      borderRadius: 999,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      background: accent,
                      color: bg,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <a
            href={REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 4,
              padding: "10px 16px",
              background: accent,
              color: bg,
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: "inherit",
              borderRadius: 6,
              border: "none",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Start Trading →
          </a>
        </div>
      )}

      {/* Responsive CSS for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
          .nav-mobile-dropdown { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
