import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./global.css";
import App from "./App.jsx";
import { swapReferralCode, RATES_API_BASE } from "./config.js";

/* ─── Referral pool bootstrap ─────────────────────────────────────
 * Referral codes have limited signup slots, so the server rotates
 * through a pool (sequential fill). We fetch the current code BEFORE
 * first render so every CTA/CopyCode/banner picks it up through
 * swapReferralCode(). Hard 900ms timeout — if the API is slow or
 * down we render immediately with the baked-in fallback code rather
 * than blocking the page. Pool status is stashed on window for the
 * scarcity counter and waitlist fallback. */
window.__REF_POOL__ = { slots_remaining: null, pool_exhausted: false };

function render() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

const timeout = new Promise((resolve) => setTimeout(resolve, 900));
const fetchCode = fetch(`${RATES_API_BASE}/api/ref/next`)
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => {
    if (!d) return;
    window.__REF_POOL__ = {
      slots_remaining: d.slots_remaining ?? null,
      pool_exhausted: Boolean(d.pool_exhausted),
    };
    if (d.code) swapReferralCode(d.code);
  })
  .catch(() => {});

Promise.race([fetchCode, timeout]).then(render);
