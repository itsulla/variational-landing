# Variational Production Hardening Implementation Plan

> **For Hermes:** Implement task-by-task with strict RED→GREEN tests and an independent review gate.

**Goal:** Upgrade tryvariational.xyz from a working affiliate/data SPA into a crawler-visible, freshness-honest, tested, hardened production application without changing its product identity.

**Architecture:** Keep the React/Vite SPA and loopback Express API. Extract pure server/client helpers for testability, add response-level freshness metadata and visible UI state, generate route HTML at build time, harden file-backed referral mutations, and add Node test/CI gates. The live nginx root is this repository's `dist/`, so all pre-deployment builds must run in an isolated copy; an in-place `npm run build` is a production deployment.

**Tech Stack:** React 19, React Router 7, Vite 7, Express 4, Node built-in test runner, GitHub Actions, nginx static hosting.

---

## Scope ledger

### Accepted now
- Build-time prerendering for every indexable route and route-specific metadata.
- Explicit generated time, age, stale/degraded/source semantics for live APIs.
- Visible live/stale/fallback state on data tools.
- Correct homepage live counters.
- Accurate liquidation-estimator product naming and metadata.
- Referral input validation, acknowledgement-aware UI, rate limiting, and atomic file writes.
- Dependency/runtime upgrades, clean lint, tests, CI, and real README documentation.

### Deferred
- Database migration for referral/waitlist storage; atomic JSON/JSONL remains sufficient at current scale.
- Full server-side application migration; prerendered static route HTML preserves the existing SPA.
- Production deployment/restart until explicit deployment scope is confirmed.

### Out of scope
- Visual redesign, new data sources, trading execution, commits, pushes, or history rewrites.

## Task sequence

1. Add Node test scripts and focused failing tests for cache metadata, stale bounds, referral validation/rate limiting, live-stat formatting, and prerender metadata.
2. Extract API cache/referral helpers and make tests green.
3. Add response freshness headers/body metadata and update rates/compare/pre-IPO/liquidations clients with visible state.
4. Fix homepage counters and liquidation naming/SEO copy.
5. Add build-time prerender entry and generator; verify every sitemap route has content and canonical metadata.
6. Upgrade patch/minor dependencies and runtime requirements; fix all source lint findings and ignore generated worktrees.
7. Add GitHub Actions and replace the template README with architecture, operations, data-source, testing, deployment, and freshness documentation.
8. Run focused tests, full tests, lint, production build in an isolated copy, local HTTP/browser smoke checks, dependency audits, and independent code review.
