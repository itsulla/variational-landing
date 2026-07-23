# Variational Landing

Affiliate acquisition, market-data tools, and editorial research for Variational Omni.

The project is a React/Vite frontend backed by a small Express aggregation API. Public routes are prerendered at build time so the same crawler-visible HTML is served to people and search engines; the browser then refreshes live data from `/api`.

## Product surfaces

- `/` — Variational overview, onboarding, airdrop calculator, and referral conversion flow
- `/rates` — cross-venue funding-rate opportunities and trade-plan calculator
- `/compare` — Variational, Hyperliquid, and Lighter protocol comparison
- `/liquidations` — Hyperliquid liquidation-level estimator using live marks
- `/pre-ipo` — OpenAI and Anthropic pre-IPO perp campaign page
- `/insights` — research index and seven long-form guides
- `/terminal`, `/bloomberg`, `/neon` — alternate creative landing-page presentations

The referral bootstrap selects the current code from a server-side pool before the first render. If no slots remain, `CopyCode` switches to an acknowledged email/Telegram waitlist flow.

## Architecture

```text
Browser / crawler
  └─ build-time HTML snapshot + hydrated React SPA
       └─ same-origin /api
            └─ Express on 127.0.0.1:8002
                 ├─ Variational
                 ├─ Hyperliquid / HIP-3
                 ├─ DefiLlama and Lighter
                 ├─ edgeX, Bitget, OKX, Gate, and other venues
                 └─ file-backed referral pool and waitlist
```

### Live-data contract

Cached API responses include an additive `_meta` object:

```json
{
  "_meta": {
    "generatedAt": "2026-07-23T12:00:00.000Z",
    "dataAgeMs": 1250,
    "stale": false,
    "degraded": false,
    "source": "Variational + Hyperliquid + Lighter + DefiLlama"
  }
}
```

The shared cache serves fresh data inside its TTL, stale data only inside a bounded stale window while refreshing in the background, and HTTP 502 when neither live nor acceptably recent data exists. Tool pages visibly distinguish live, cached, partial, unavailable, and illustrative fallback states.

## Requirements

- Node.js 20.19+ (Node 22 is used in CI)
- npm
- Chromium for build-time prerendering

Install dependencies:

```bash
npm ci
npm ci --prefix api
npx playwright install chromium  # only when no system Chromium is available
```

## Local development

Run the API and Vite in separate terminals:

```bash
npm start --prefix api
```

```bash
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8002`.

Optional environment variables belong in `api/.env` and must never be committed:

- `PORT` — API port, default `8002`
- `REF_ADMIN_SECRET` — enables protected referral-pool administration
- `LITHUANIA_API_URL` / `LITHUANIA_API_SECRET` — optional Binance/Bybit proxy
- `COINALYZE_API_KEY` — optional rates provider

## Quality gates

```bash
npm run lint
npm test
npm run build
```

Or run all three:

```bash
npm run verify
```

The test suite covers cache freshness semantics, homepage metric formatting, live-data state parsing, animated counter updates, referral validation/rate limits/atomic writes, acknowledged waitlist UX, and the prerender route manifest.

GitHub Actions repeats lint, tests, production dependency audits, the full prerendered build, and crawler-visible output checks on pushes and pull requests.

## Build-time prerendering

`npm run build` performs two stages:

1. `vite build` emits hashed client assets.
2. `scripts/prerender.mjs` opens each public route in headless Chromium and writes `dist/<route>/index.html`.

The renderer blocks API and analytics calls intentionally. Static HTML therefore contains deterministic, clearly labeled fallback content; a normal browser fetches current API data after the React app starts.

Useful output checks:

```bash
test -s dist/rates/index.html
grep -q '<h1' dist/rates/index.html
grep -q 'Funding' dist/rates/index.html
```

`docs/nginx-prerender.conf` contains the matching Nginx routing pattern. It serves route snapshots directly, gives hashed assets immutable caching, proxies `/api`, and falls back to the SPA shell only for unknown paths.

## API routes

### Referral operations

- `GET /api/referral`
- `GET /api/ref/status`
- `POST /api/ref/track`
- `POST /api/ref/waitlist`
- `POST /api/ref/admin` — requires `REF_ADMIN_SECRET`

Public mutations are validated and protected by in-memory per-IP rate limits. Referral-pool writes use serialized atomic replacement; waitlist entries use append-only JSONL.

### Market data

- `GET /api/rates/opportunities`
- `GET /api/rates/history?ticker=BTC`
- `GET /api/rates/tradfi`
- `GET /api/rates/summary`
- `GET /api/compare/protocols`
- `GET /api/compare/summary`
- `GET /api/compare/three?window=ytd|launch|all`
- `GET /api/preipo/prices`
- `GET /api/liquidations/assets`
- `GET /api/liquidations/levels?coin=BTC`

## Referral persistence

Operational files are deliberately ignored by Git:

- `api/ref-codes.json`
- `api/waitlist.jsonl`
- `api/.env`

They must be included in host backups. File persistence is appropriate for the current single-process deployment; move these records to a transactional database before running multiple API replicas.

Rate limits are process-local and reset on restart. This is intentional for the current topology, not a substitute for edge/WAF controls at larger traffic volumes.

## Deployment safety

The production web server may serve `dist` directly from its checkout. On such a host, running `npm run build` changes the live site immediately.

Use this sequence instead:

1. Build and verify in a disposable checkout or staging directory.
2. Preview privately over Tailscale.
3. Copy or atomically swap the verified `dist` into the Nginx document root.
4. Restart the API only when backend files or dependencies changed.
5. Verify ordinary and Googlebot responses after deployment.

Example verification:

```bash
curl -fsS https://tryvariational.xyz/api/ref/status
curl -fsS -A Googlebot https://tryvariational.xyz/rates | grep -q '<h1'
curl -fsS https://tryvariational.xyz/rates | grep -q 'Funding'
```

Do not commit, print, or copy `.env`, referral state, or waitlist contacts into build artifacts or CI logs.