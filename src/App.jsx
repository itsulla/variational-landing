import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import NavHeader from "./components/NavHeader.jsx";
import PageMeta from "./components/PageMeta.jsx";
import NotFound from "./components/NotFound.jsx";

const Original = lazy(() => import("./themes/original/index.jsx"));
const Terminal = lazy(() => import("./themes/terminal/index.jsx"));
const Bloomberg = lazy(() => import("./themes/bloomberg/index.jsx"));
const Neon = lazy(() => import("./themes/neon/index.jsx"));
const Rates = lazy(() => import("./themes/rates/index.jsx"));
const Compare = lazy(() => import("./themes/compare/index.jsx"));
const Liquidations = lazy(() => import("./themes/liquidations/index.jsx"));
const InsightsIndex = lazy(() => import("./themes/insights/index.jsx"));
const WhyPerpDexesCoexist = lazy(() =>
  import("./themes/insights/why-perp-dexes-coexist.jsx")
);

/* Nav header color presets per route */
const NAV_COLORS = {
  "/": { accent: "#60a5fa", bg: "#0a0e1a", text: "#e8ecf4" },
  "/terminal": { accent: "#00ff88", bg: "#0a0a0a", text: "#00ff88" },
  "/bloomberg": { accent: "#fbbf24", bg: "#0c0b09", text: "#e8e0d0" },
  "/neon": { accent: "#818cf8", bg: "#06060f", text: "#e8ecf4" },
  "/rates": { accent: "#fbbf24", bg: "#0c0b09", text: "#e8e0d0" },
  "/compare": { accent: "#FFB800", bg: "#0A0A0A", text: "#e8e0d0" },
  "/liquidations": { accent: "#00FF41", bg: "#000000", text: "#00FF41" },
  "/insights": { accent: "#60a5fa", bg: "#0a0e1a", text: "#e8ecf4" },
};

/* /insights uses the same nav-color palette as the home theme — the
 * NAV_COLORS lookup above is exact-match by pathname, so deeper article
 * routes (/insights/...) fall through to the home defaults. That's
 * fine: same blue accent, same dark bg. */

function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#60a5fa",
        fontFamily: "system-ui, sans-serif",
        fontSize: "1.1rem",
      }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navColors = useMemo(
    () => NAV_COLORS[location.pathname] || NAV_COLORS["/"],
    [location.pathname]
  );

  /* Bloomberg and Compare have their own sticky top bars, so skip the nav header for those */
  const skipNavHeader = ["/bloomberg", "/compare"].includes(location.pathname);

  return (
    <>
      <PageMeta path={location.pathname} />
      {!skipNavHeader && (
        <NavHeader accent={navColors.accent} bg={navColors.bg} text={navColors.text} />
      )}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Original />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/bloomberg" element={<Bloomberg />} />
          <Route path="/neon" element={<Neon />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/liquidations" element={<Liquidations />} />
          <Route path="/insights" element={<InsightsIndex />} />
          <Route
            path="/insights/why-perp-dexes-coexist"
            element={<WhyPerpDexesCoexist />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ThemeSwitcher />
    </>
  );
}
