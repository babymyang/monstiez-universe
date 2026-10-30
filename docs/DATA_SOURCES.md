# Data Sources Register — MONSTIEZ Universe

This is the live register of providers actually wired into the app, each with tested evidence. The BM Tracker browser audit (2026-10-30) is recorded in `BM_TRACKER_FEATURE_AUDIT.md`.

## Current status — providers in use

| Data category | Provider | Type | Supplies | Status | Evidence |
|---|---|---|---|---|---|
| YouTube channel + video public stats | YouTube Data API v3 | Official API | Current channel stats, uploads, video views/likes | **Implemented** in `scripts/collect.js`; activates when `YOUTUBE_API_KEY` secret is set; quota-efficient path (channels.list → playlistItems.list → batched videos.list, no search polling) | Workflow `.github/workflows/collect-public-stats.yml`; collector dry-run passes; skips cleanly without key |
| YouTube seed observations | Manual/public observation | Manual + credited public figures | Two dated watch-page observations (2026-10-29) and dated observations from BM Tracker's public overview API (2026-10-30, credited, not affiliated) | **In data** (`data/series/youtube.json`, every reading carries source+method) | Prior session records; audit §6; readings carry `method: manual-public-observation` / `public-api-observation` |
| Spotify per-track play totals | Kworb artist songs page | Third-party public data aggregator | Total + daily plays per track, page-declared "Last updated" date | **In use** — daily collection live; robots.txt: `User-agent: * / Allow: /`; polite single daily fetch; readings filed under the page's own date, never the fetch date | Fetch tested 2026-10-30 (HTTP 200, 42 tracks parsed); collector run: 41 matched, 41 alreadySame on re-run; cross-source diff vs BM Tracker same-day figures recorded (~0.05%, both kept as separate observations) |
| Spotify followers / monthly listeners | Credited dated public observations | Manual/public observation | Artist followers + monthly listeners readings | **In data** (`data/series/spotify.json` artist) | 2026-10-28 observation with source URL |
| Catalogue metadata | Platform public metadata (via BM Tracker public overview, credited) | Public metadata | Video IDs, titles, channels, publish dates, thumbnails; Spotify track/album IDs, release dates, cover art | **In data** (`data/catalog.json`) | `meta.sources` records provenance; artwork hot-linked from i.ytimg.com / i.scdn.co with broken-image fallbacks |
| Historical snapshots | Our own collector | First-party | Daily history from 2026-10-29/30 onward | **Live** — one dated point at seed + daily runs accumulating | `data/series/*.json`; validator enforces provenance on every reading |
| Spotify Charts (chart-eligible counts) | charts.spotify.com | Official chart source | Chart-eligible daily/weekly counts | **Not used** — would add scope creep without a confirmed BM Tracker parity need; chart counts are filtered/eligible and can differ from totals | Evaluated; deliberately deferred |
| ChartMasters | chartmasters.org | Third-party aggregator | Track totals/trends | **Not used** — Kworb chosen instead (simpler licence surface, robots-permitted, stable structure) | Evaluated 2026-10-30 |

## Provider records (tested)

### Kworb — Spotify play totals
- Source URL: https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html
- Official or third-party: third-party public page
- Access method tested: single polite GET with custom UA; robots.txt allows all
- Fields/units: per-track total streams + daily streams, page "Last updated" date
- Collection timestamp & source update date: both recorded (`lastCollection`, `kworbUpdatedAt`, per-reading `note` with page date)
- Terms/attribution: figures credited as "Kworb (third-party public stream figures)" on every display; link in Sources view
- Rate limit/polling: 1 fetch/day via scheduled workflow
- Historical coverage: starts at first reading (2026-10-28 seed); grows daily
- Known failure modes: page layout change (parser yields 0 → collector errors, last-known-good data stays), stale page (handled by filing under page-declared date), tracks outside catalogue (skipped, counted)
- Fallback: app serves last cached data with stale bar; no fabricated values
- Runtime test result: PASS (2026-10-30, collector + validator)
- Evidence: commit 5005598, `scripts/collect.js`, audit §6

### YouTube Data API v3 — official public stats
- Endpoint: googleapis.com/youtube/v3 (channels, playlistItems, videos)
- Official: yes
- Quota plan: ~5–15 units/day typical (1u channels + ~3u playlist pages + ~3u video batches); search.list never polled
- Key handling: GitHub Actions secret only; never in client JS; app works without it (no-key mode = dated manual/public observations)
- Limitations surfaced in UI: subscriber counts may be rounded/hidden (precision recorded); public API gives current counts only — history builds from our snapshots; private Analytics is owner-OAuth only and is explicitly out of scope
- Runtime test result: PASS in no-key mode (skip + reason recorded). Live-key run pending user configuration.
- Evidence: `scripts/collect.js`, `data/feed-status.json` (collector status `awaiting-key`)

## Design requirements (enforced by scripts/validate.js)

- Every displayed metric identifies provider, source URL, observation date, unit and scope.
- Official API metadata, third-party stream numbers, chart-eligible counts, manual snapshots and sample data remain distinct typed metrics.
- No Spotify Web API figure is ever presented as a stream count (the API does not publish streams).
- No YouTube current count is presented as history; history = dated snapshots only.
- Last-known-good caching with visible stale state; providers stay swappable.
- No credentials or private user data in the repository.

See `DATA_PROVIDER_RESEARCH.md` and `BM_TRACKER_REVERSE_ENGINEERING_PLAN.md` for the detailed technical plan.
