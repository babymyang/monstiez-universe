# MONSTIEZ Universe 🎀

> Your little BABYMONSTER corner — discover, follow, track, and celebrate in one place.

An **unofficial, fan-made** companion PWA for MONSTIEZ (BABYMONSTER fandom). Installable on Android (and iOS via Add-to-Home-Screen), built mobile-first at 320–430 px.

**Fan-made app. Not affiliated with, associated with, or endorsed by YG Entertainment or BABYMONSTER.**

---

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/` | Welcome | Original wordmark + mascot, functional intro slides, CTA → Home. No photography. |
| `/home` | Home | Category chips, verified-date countdown card, quick actions, latest videos, trending. |
| `/stats` | Stats | YouTube/Spotify tabs, real observed metrics, growth chart (requires ≥2 snapshots), milestones. |
| `/members/[slug]` | Member detail | 7-member selector, verified profile facts, content/moments tabs. |
| `/discover` | Search & catalogue | Instant local search, type filters, bookmarks, watched marks. |
| `/events` | Schedule | Verified tour dates with sources; ticket links point to YG only. |
| `/my-baemon` | You | Bias, bookmarks, watched, reminders, reset — all localStorage, no account. |

## Core constraints (enforced in code, not just policy)

- **No paid APIs, no API keys, no scraping of YouTube/Spotify pages, no private endpoint reverse-engineering.**
- **No invented data.** Every metric is a dated, manually observed public value with a `sourceUrl` (`data/metric-snapshots.json`). Charts render **only** with ≥2 dated observations of the same metric; otherwise a designed empty state shows. Unavailable metrics (likes/comments/saves/Spotify streams) display `—` with an explanation.
- **Facts need provenance.** Member birth dates come from the official YG profile (`ygfamily.com/en/artists/babymonster/profile`), stored with source + `verifiedAt`. Positions/MBTI/heights are **not officially published**, so they are not shown.
- **Validators block placeholders** (`value: 0`, fake dates, non-official URLs) from production — see `src/lib/validation.ts` + `npm run data:validate`.
- **Demo metrics are dev-only** (`NEXT_PUBLIC_DEMO_METRICS=1` + non-production) and cannot reach a production build.
- **Original artwork only** — the mascot, member avatars, wordmark rendering, and covers are hand-made SVGs in `src/components/`. No official logos or rehosted photos. YouTube thumbnails are hot-linked (never copied) with attribution + official links, with gradient-cover fallbacks.

## Data sources

| Source | What it provides | How used |
|---|---|---|
| Official channel RSS `youtube.com/feeds/videos.xml?channel_id=UCqwUnggBBct-AY2lAdI88jQ` | video id/title/link/published (no view counts) | Build-time refresh via `npm run data:refresh-rss`; falls back to curated catalogue on failure |
| YG official profile pages | member names + birth dates | Manually verified 2026-10-29, stored in `data/members.json` |
| Official announcements (Weverse/YG FB/press) | release dates, tour dates, milestones | Manually curated with `sourceUrl` per record |
| Manual public observation | view counts (one-time, dated) | `data/metric-snapshots.json` + CSV import (`npm run data:import-snapshots`) |

**Known environment note:** at build time on 2026-10-29 the sandbox network blocked `youtube.com/feeds/videos.xml` (HTTP 404 for every channel). The feed script is correct and will work in normal environments/CI; the app gracefully used the curated catalogue meanwhile.

## Development

```bash
bun install            # or npm install
bun run dev            # dev server on :3000
npm run lint           # eslint — 0 problems
npm run typecheck      # tsc --noEmit — 0 errors
npm run test           # vitest — 25 tests
npm run data:validate  # provenance validator
npm run build          # production build (+ generates sw-precache.json)
npm run start          # serve the production build
```

### Adding a metric snapshot (manual workflow)

1. Visit the public video page, note the exact view count and time.
2. Append a row to a CSV: `entityId,entityTitle,metric,value,observedAt,sourceUrl,notes`
3. `npm run data:import-snapshots your-file.csv` — validates, dedupes, merges into `data/metric-snapshots.json`.
4. Commit. The chart appears automatically once ≥2 dated observations exist.

### Refreshing recent uploads

`npm run data:refresh-rss` fetches the official RSS feed and updates `data/youtube-feed.json` + `data/feed-status.json`. On failure it preserves last-known data and records the error; the app never fabricates replacements.

## PWA

- Manifest (standalone, themed icons), service worker (`public/sw.js`): network-first pages, cache-first hashed assets, offline fallback to `/offline`.
- The **first online visit precaches the full shell** (`sw-precache.json`, generated at build).
- Verified: after one online visit, `/`, `/home`, `/stats` render fully offline.
- Preferences (bias/bookmarks/watched/reminders) persist in localStorage with version-safe parsing.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui primitives (heavily re-themed) · lucide-react · custom SVG charts · self-hosted OFL fonts (Nunito Sans, Baloo 2 — see `public/fonts/`) · Vitest.

Design tokens and screen inventory: [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) · [`docs/SCREEN_INVENTORY.md`](docs/SCREEN_INVENTORY.md). UI research basis: [`docs/UI_RESEARCH.md`](docs/UI_RESEARCH.md). Agent/AI-contributor rules: [`AGENTS.md`](AGENTS.md). Session recovery: [`docs/SESSION_RECOVERY.md`](docs/SESSION_RECOVERY.md).

## Deployment (static-first)

The app prerenders to static content (`next build` → all routes ○/● except the stub `/api`). Deploy options:

1. **Vercel / Netlify** — connect the repo, defaults work.
2. **Any static host** — `npm run build`, host `.next/standalone` with `npm run start` (Node), or export-compatible static hosts may serve the prerendered HTML + `public/`.

HTTPS is required for service-worker/install. GitHub repo is the source of truth; no workspace files are needed at runtime.

## Limitations (v1, by design)

- No live view-count history — snapshots start when recording starts; charts fill in over time.
- No Spotify stream metrics (not publicly/legitimately accessible) — curated links only.
- Per-member fancam links and member-specific moments/quotes are curated in future data refreshes (empty states until then).
- Push notifications are not implemented; reminders are local-only.
- Light theme only in v1 (token system ready for a dark column later).
