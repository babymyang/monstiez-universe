# BM Tracker Feature-Parity Research & Implementation Plan

**Reference:** https://bm-tracker.com/ and https://bm-tracker.com/user-guide  
**Target product:** MONSTIEZ Universe  
**Prepared:** 30 October 2026  
**Status:** Research brief for Super Z — the live guide must still be inspected interactively.

## 1. Important research status

The BM Tracker homepage and `/user-guide` URLs were reachable from the research environment, but the pages exposed no readable document text to the page reader. Search indexing also did not return the guide's actual text. This means this brief does **not** pretend to have a complete, verified inventory of BM Tracker's buttons, pages, calculations, filters, or data sources.

The next Super Z session must open the actual site in its browser, read the guide page-by-page, inspect the live product, and create the evidence-backed feature inventory described in `BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md` **before claiming feature parity**. This is a mandatory build phase, not an optional research suggestion.

What is known from this research:
- The supplied reference URL is the BM Tracker user guide.
- YouTube Data API is an acceptable provider for our project, subject to quota-efficient implementation and secure key storage.
- BM Tracker visibly has Spotify-derived data according to the user's observation, but this research has **not** established whether BM Tracker uses Spotify's official API, a public chart data source, a third-party data provider, a server-side scraper, or a manual/imported dataset.
- Spotify's official Web API does not expose public lifetime/daily track stream totals as a standard field. Official API artist/track popularity and some artist follower fields are marked deprecated in current references. Public stream totals therefore need a different source or a carefully labelled estimate/snapshot.

## 2. Objective

Implement the complete useful public feature set documented by BM Tracker inside MONSTIEZ Universe, adapted to the MONSTIEZ visual identity and navigation. Treat BM Tracker as a functional reference, not a source-code, trademark, branding, or pixel-copy target.

The desired outcome is **feature parity for publicly accessible features** plus the existing fan-companion experience:
- Keep the MONSTIEZ Universe brand, pastel pink/lavender UI, Myangni mascot, seven-member corner, Discover, Fan Calendar, personal favorites and fan goals.
- Add the full verified feature set found in the BM Tracker user guide and main application: all public dashboards, metric views, song/video rankings, chart ranges, filters, milestones, country/market views, comparisons, detailed drill-downs, refresh behaviour, exports and other documented workflows, only where they actually exist in the reference.
- Do not silently drop a guide feature because it takes more effort. Decompose it into issues, implement in phases, and keep a visible coverage ledger.
- Do not invent BM Tracker features. The browser audit determines the scope.

## 3. Phase 1 — Browser audit of BM Tracker (mandatory)

### 3.1 Visit the actual product

Open both:
- `https://bm-tracker.com/user-guide`
- `https://bm-tracker.com/`

Use the Super Z browser, not just a text fetch. Wait for client-rendered content to hydrate. Test desktop and a narrow Android viewport. Save screenshots to `docs/reference/bm-tracker/` when browser tooling allows.

### 3.2 Read the entire user guide

- Scroll the entire guide from top to bottom.
- Expand every accordion, tab, tooltip, dropdown or collapsed section.
- Follow every in-site guide link and return to the guide after each.
- Record all page names, definitions, examples, formulas, refresh statements, limits, and data-source statements.
- Preserve the guide's own terms and field names in the audit notes.
- Record ambiguities rather than silently reinterpreting them.
- If the guide contains screenshots or diagrams, capture/read them; do not rely only on text extraction.

### 3.3 Inspect every public product workflow

On the main site, inspect and record:
- Every navigation item, page, tab, filter, range selector and view toggle.
- Every chart: title, axes, units, date range, hover tooltip, aggregation, comparison behaviour and no-data state.
- Every table: columns, sorting, pagination, search, row action, expanded details and export controls.
- Every artist/song/album/video/member detail page reachable publicly.
- Any dashboards, stream or view trackers, daily change displays, milestones, rankings, country breakdowns, release pages, playlists, notifications, watchlists, bookmarks, custom goals or community features — only if actually present.
- All settings, profile/account flows and sign-in requirements visible without bypassing access controls.
- Loading, stale, empty, unavailable, error and responsive states.

### 3.4 Inspect network/data behaviour (public pages only)

Use browser developer tools / Network where available:
- Reload each key route with Fetch/XHR filtered.
- Record request host, path, method, status, response format, key fields, apparent update interval, and Initiator.
- Distinguish first-party BM Tracker backend calls from calls to YouTube, Spotify, Kworb, ChartMasters, charts, other vendors, CDNs or static JSON.
- Note whether the browser fetches data directly or receives server-rendered/precomputed datasets.
- Inspect public script references and openly exposed source maps only to understand the public client architecture and endpoint contracts.
- Do not copy cookies, tokens, user data or session identifiers into notes. Never use private endpoints requiring another user's credentials, evade authentication, bypass access controls, or defeat anti-bot protections.
- Do not assume an endpoint's domain proves the upstream source. Trace observable requests and response provenance as far as the public UI permits.

### 3.5 Deliver an evidence-backed feature matrix

Create `docs/BM_TRACKER_FEATURE_AUDIT.md` and fill `docs/BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md` with one row per discovered feature. Every row must include:
- Feature ID and exact reference label.
- Route / screen and where it appears in the guide.
- What it displays and what user action does.
- Inputs, filters, units, calculation/formula and date/market scope.
- Data source/provider evidence, refresh cadence and whether historical data is available.
- Screenshot evidence filename or precise guide section reference.
- MONSTIEZ implementation destination.
- Status: `confirmed`, `partially-confirmed`, `not-accessible`, or `not-present`.

Never mark a feature `confirmed` just because it seems plausible for a tracker.

## 4. Phase 2 — Translate audit to MONSTIEZ architecture

Create a coverage matrix linking every confirmed BM Tracker feature to a MONSTIEZ route/component and test. Reuse existing application destinations when sensible; add dedicated subpages/details where the density warrants it.

Suggested architecture (adapt only after the audit):

| Layer | Responsibility |
|---|---|
| `ui/` or current screen modules | Responsive MONSTIEZ screens, cards, tables, charts, selectors and dialogs |
| `data/providers/youtube/` | YouTube Data API channel/video collection |
| `data/providers/spotify-metadata/` | Optional Spotify Web API catalog metadata |
| `data/providers/spotify-streams/` | Third-party public streams provider(s), if permitted and tested |
| `data/providers/bm-reference/` | Only a documented adapter if the reference itself exposes a legitimate public data feed; never assume one exists |
| `data/normalization/` | Common artist, release, track, video, snapshot and metric schemas |
| `data/cache/` | Cache/freshness and last-known-good values |
| `data/exports/` | CSV/JSON export and share-card data |
| `data/snapshots/` | Date-stamped snapshots for trend/history charts |
| `docs/` | Audit, source register, formulas, limitations, recovery/worklog |

Do not create separate apps for each data provider. Every screen should consume normalized data and identify the original provider.

## 5. Phase 3 — YouTube data implementation

YouTube Data API is an accepted source for public channel/video metadata and counts.

### 5.1 Efficient collection approach

1. Identify and verify the official BABYMONSTER YouTube channel ID from a trustworthy official link or a one-time search.
2. Fetch channel metadata/statistics and `contentDetails.relatedPlaylists.uploads` with `channels.list`.
3. Enumerate the uploads playlist using `playlistItems.list` (page through when necessary) instead of repeatedly searching YouTube.
4. Fetch current public metadata and statistics for video IDs in batches of up to the API's supported list size using `videos.list`.
5. Store view count, like count and comment count only where returned, title, description excerpt if needed, channel ID, video ID, thumbnail URLs, duration/published time and source timestamp.
6. Store one dated snapshot per configured collection run; compute daily/weekly/monthly deltas from snapshots created by our own collector.
7. Add pagination and a bounded refresh schedule. Use ETags / last-known-good cache where practical.

Official references show a default daily quota of 10,000 units for most endpoints, and a separate default allowance of 100 `search.list` calls per day. `channels.list` and `videos.list` each cost 1 unit per call. Do not use `search.list` as a repeated polling mechanism. See the official Google quota and method references in `docs/DATA_PROVIDER_RESEARCH.md`.

### 5.2 Limits to expose honestly

- The public Data API returns current public counts, not a complete historical view history. Historical charts must start from our own dated snapshots or a separately documented historical dataset.
- The YouTube Analytics API returns private channel analytics only for an authorized channel owner/manager. We cannot retrieve BABYMONSTER's private analytics using our public app's API key. Do not ask a fan to grant their personal channel access just to see official artist stats.
- Subscriber counts can be rounded/hidden according to YouTube's display policy. Show what the API returns; do not manufacture precision.
- Quota failure, `403`, `404`, `429`, disabled keys, deleted videos and private videos must have safe handling and a visible data freshness state.

## 6. Phase 4 — Spotify data research and implementation

### 6.1 Separate three kinds of Spotify data

**A. Spotify catalog metadata (potentially official API)**
- Artist, albums, track IDs/names, release dates, album art URLs, Spotify links and other catalog metadata returned by supported endpoints.
- All Spotify Web API calls require authorization. Public catalog access can use a server-side/client-credentials flow when the app mode and endpoints permit it. Never put a client secret in browser JavaScript.
- Current reference pages label artist `followers` and artist/track `popularity` fields as deprecated; do not make these the only key metrics.

**B. Public stream totals / daily stream counts (not supplied by ordinary Spotify Web API fields)**
- The public Spotify Web API does not provide a standard public lifetime stream total or a historical daily stream series for an artist's tracks.
- Candidate third-party pages discovered in research include:
  - Kworb BABYMONSTER Spotify top songs: `https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html` — displayed total and daily streams, last-updated date and track rows.
  - Kworb BABYMONSTER Spotify chart history: `https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS.html` — chart history and stream totals for charted periods; its page states that the history view only covers time spent in the Top 200.
  - ChartMasters BABYMONSTER artist dashboard: `https://chartmasters.org/artist/babymonster/` — displays Spotify total/daily figures for tracks, trends and other analysis; some detail may be gated.
- These are **third-party aggregators, not official Spotify APIs**. They are research candidates only. Check their terms, robots guidance, permitted reuse, update cadence, access stability, rate limits, data definitions and attribution before automating. Never present their figures as official Spotify API responses.

**C. Official Spotify Charts**
- Spotify Charts are useful for chart positions and chart-eligible stream counts in the markets/date windows the charts cover.
- Spotify explains that chart stream numbers are calculated with a filtering formula and not every stream is eligible; chart counts can differ from the stream counts in Spotify for Artists. Label those values as chart-eligible, not the total global lifetime stream count.

### 6.2 Investigate BM Tracker's actual Spotify provider

The browser audit must determine whether the site calls:
- `api.spotify.com` (official Web API),
- `charts.spotify.com` / public Spotify Charts pages,
- Kworb / ChartMasters / another aggregator,
- a BM Tracker first-party endpoint that returns precomputed Spotify metrics,
- a community dataset / CSV / other source,
- or a manual/imported dataset.

Record concrete request and response evidence if visible. If a first-party BM Tracker endpoint exists, record only its public route/schema and the terms/access conditions. Do not infer provider from a metric's label.

### 6.3 Recommended implementation fallback

Build provider adapters in this order, with actual tests deciding the final choice:
1. Reuse a legitimate documented public feed/API found in the reference audit, if accessible and permitted.
2. Use public third-party aggregator pages only if terms/robots/use conditions are acceptable and the agent can fetch them reliably. Keep adapter isolated, rate-limited, cached and credited.
3. Use official Spotify Charts for chart-eligible daily/weekly counts where a chart view exists.
4. Record manual dated snapshots or allow community/user-submitted snapshots with source URL and moderation/provenance if automated public data is not available.
5. Use Spotify Web API only for metadata that it actually returns. Do not substitute popularity for stream counts.

The app must continue to function if the Spotify stream provider becomes unavailable. Store each source's raw value and unit so that a switch between `daily`, `cumulative`, `chart_eligible`, `followers`, `monthly_listeners`, or `popularity_index` cannot silently corrupt the charts.

## 7. Phase 5 — Shared historical data model

Use a normalized event/snapshot format. Example (adapt to the current project's language):

```json
{
  "id": "spotify-track-streams-bm-001-2026-10-30",
  "entityType": "track",
  "entityId": "stable-internal-track-id",
  "platform": "spotify",
  "metric": "daily_streams",
  "value": 123456,
  "unit": "streams/day",
  "periodStart": "2026-10-29",
  "periodEnd": "2026-10-29",
  "market": "global",
  "source": {
    "name": "Provider name",
    "url": "https://source.example/record",
    "method": "public-page-parser",
    "isOfficial": false
  },
  "collectedAt": "2026-10-30T00:30:00Z",
  "status": "verified-public-source",
  "notes": "Definition and limitations"
}
```

Requirements:
- Every stat has a source URL, provider name, observed period/date, collection timestamp, unit, scope/market and verification state.
- Store current values and snapshots separately. Never calculate a fake historical series by interpolating a current total.
- Distinguish chart-eligible streams, daily streams, cumulative streams, monthly listeners, followers, YouTube views, likes, subscribers and estimates; they are not interchangeable.
- Keep UTC timestamps in data and display local timezone where the user needs it.
- Validate numeric fields, missing values, unexpected date changes, sudden zero resets and provider schema drift.
- Preserve last-known-good data and show stale status when refresh fails.
- Avoid saving raw personal Spotify/Google account data; this app does not require fan account OAuth for public group statistics.

## 8. Phase 6 — Charts, comparisons and exports

After the audit confirms exact reference features, implement all documented chart/report behaviours. At minimum, ensure the tracker can represent:
- Current values with clearly labelled provider and last checked time.
- Dated trend lines from actual snapshots.
- Daily change and percentage change, with calculation shown/available.
- Track/video ranking tables with sort and filters where reference includes them.
- Range selectors whose output really changes (e.g. 7/30/90/365 days if reference supports those ranges).
- Milestone progress calculated from a verified current metric and a user-configurable target.
- Optional CSV/JSON export of the currently viewed dataset, including provider and date metadata.
- Shareable fan cards only if they are based on data currently displayed and preserve attribution/source labels.

Never reuse static demo chart coordinates as if they were live. Show a no-history state until snapshots are accumulated.

## 9. Phase 7 — Zero-budget deployment and scheduled collection

Prefer the existing static PWA starter and GitHub-based persistence. Do not require a new paid backend/database. A viable low-cost model is:
- PWA hosted on GitHub Pages or an existing free static host.
- Scheduled GitHub Actions workflow runs a small collector (e.g. daily) using repository secrets for API credentials.
- Collector writes normalized public metric JSON snapshots into the repo, then commits changes with a bot identity only if data changed.
- PWA reads the generated JSON and can work offline with the last cached app shell/data.
- Optional `workflow_dispatch` manual refresh for debugging.

This architecture is a proposal, not a mandate if the existing project already has a free durable backend. The agent must estimate request volume and quota before selecting collection cadence. Use the least expensive approach that meets the audited features.

Secrets: use `YOUTUBE_API_KEY` as a GitHub Action secret. If optional Spotify API metadata is implemented, use a server-side secret or GitHub Action secrets for `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`; never check them into Git or expose a secret to the static client. Do not require Spotify credentials for the app to open. Do not create secrets or sign in on the user's behalf.

Add:
- `.github/workflows/collect-public-stats.yml` only after the collector has local tests.
- `scripts/collect-youtube.*` and provider scripts with bounded timeouts and retry/backoff.
- `data/` JSON files with schemas and provenance.
- `docs/DATA_PROVIDER_RESEARCH.md` and `docs/DATA_SOURCES.md` updated with tested results.

If GitHub Actions are unavailable in the agent environment, prepare the workflow but do not claim that it ran. Document setup steps and what the user must configure.

## 10. Feature-completeness gate

Do not call the project BM Tracker parity-complete until:
- The full user guide has been read in the Super Z browser.
- The main site's publicly visible features have been audited.
- The feature matrix lists every discovered feature and the implementation/test that covers it.
- All accessible public workflows have a MONSTIEZ implementation, or an explicit reason and issue for any blocked feature.
- Data sources have been traced as far as publicly possible and clearly labelled.
- The app does not falsely claim Spotify API stream counts or YouTube private analytics.
- The final browser screenshot set includes every major tracker screen at mobile width and at least one desktop width.

## 11. Known research references (30 October 2026)

- BM Tracker user guide: https://bm-tracker.com/user-guide
- BM Tracker main site: https://bm-tracker.com/
- YouTube quota reference: https://developers.google.com/youtube/data/determine_quota_cost
- YouTube videos.list reference: https://developers.google.com/youtube/v3/docs/videos/list
- YouTube channels.list reference: https://developers.google.com/youtube/v3/docs/channels/list
- YouTube Analytics API OAuth guide: https://developers.google.com/youtube/analytics/guides/authorization/server-side-web-apps
- Spotify API calls/auth overview: https://developer.spotify.com/documentation/web-api/concepts/api-calls
- Spotify artist endpoint: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
- Spotify track endpoint: https://developer.spotify.com/documentation/web-api/reference/get-track
- Spotify quota modes: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify 2026 developer access update: https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
- Spotify 2026 quota update: https://developer.spotify.com/blog/2026-07-23-web-api-quota-updates
- Spotify chart counting explanation: https://support.spotify.com/artists/article/understanding-spotify-charts/
- Kworb BABYMONSTER songs: https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html
- Kworb BABYMONSTER chart history: https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS.html
- ChartMasters BABYMONSTER artist dashboard: https://chartmasters.org/artist/babymonster/

All provider details must be rechecked by the agent at implementation time. Terms, endpoint availability and restrictions can change.
