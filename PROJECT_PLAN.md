# MONSTIEZ Universe — Full Product & Build Plan

**Reference product:** BM Tracker — https://bm-tracker.com/user-guide  
**Primary requirement:** implement every useful, publicly documented BM Tracker feature after a browser-based audit, inside the existing MONSTIEZ Universe fan app.  
**Plan date:** 30 October 2026  
**Deployment target:** free/zero-budget-first, Android-first installable PWA.

## Product goal

Turn MONSTIEZ Universe into a fan hub and a genuine BABYMONSTER stats tracker. Keep the existing app's identity and mascot, then add the full verified tracking functionality from BM Tracker: every public feature, metric, chart, ranking, detail page and interaction documented in its user guide and available in its main site.

The BM Tracker feature inventory must be created by the new Super Z session. The guide could not be reliably text-extracted by the research browser used to prepare this package, so this plan deliberately does not pretend to know every screen or formula before the agent inspects it in a real browser.

## Existing assets and app baseline

The package includes a real coded application, not just mockup images:
- Welcome and Home
- Discover with search/filter functionality
- Stats & Milestones with YouTube / Spotify / Fan Goals tabs
- Fan Calendar and local reminders
- Member Corner for all seven members
- My Baemon personal corner
- Myangni canonical SVG plus five editable SVG expression variants
- PWA manifest, service worker and SVG app icon
- Pastel pink/lavender four-screen reference and mascot/UI reference sheets

The first work unit is to run and inspect these files, preserve them, and establish a Git checkpoint. Do not discard them or replace them with a generic starter.

## Milestone 0 — Recover and preserve

**Outcome:** a known-good baseline that survives a server reset.

1. Inspect the handoff ZIP and existing Git state.
2. Run the current app over HTTP and verify screens/assets load.
3. Perform JS syntax and static reference checks.
4. Connect to the intended GitHub repository if access is available; commit and verify persistence.
5. Update `worklog.md` with commit, test results, push state and next action.

**Exit condition:** app can be run, its current limitations are recorded, and the exact baseline exists in Git.

## Milestone 1 — BM Tracker complete public audit

**Outcome:** an evidence-backed checklist of everything to implement.

1. Open `https://bm-tracker.com/user-guide` and `https://bm-tracker.com/` in Super Z's browser.
2. Read every guide section, including expandable content and linked pages.
3. Inspect every public navigation route, tab, dashboard, chart, table, filter, search, date selector, tooltip, export and detail page.
4. Capture desktop and Android-sized screenshots.
5. Inspect browser Network → Fetch/XHR for public API/provider evidence. Record provider domains and response field shapes without copying secrets or user data.
6. Create `docs/BM_TRACKER_FEATURE_AUDIT.md` and complete one row per feature.
7. Map each confirmed reference feature to a MONSTIEZ screen, component and test.

**Exit condition:** every public guide section and public navigation item has a coverage row, or is explicitly tagged inaccessible/not present. No assumed feature is silently promoted to confirmed.

## Milestone 2 — Data model and provider layer

**Outcome:** one consistent metric schema for all platforms.

Implement normalised entities for artist, album, track, channel and video. Keep raw metric type, unit, market, date period, source, method, retrieval time and verification status. Build provider adapters and cached last-known-good data. Keep source logic outside UI components.

Key provider decision:
- YouTube Data API: approved primary source for current public channel/video statistics and metadata.
- Spotify Web API: optional catalog metadata; it is not the source of public lifetime/daily stream counts.
- Spotify streams: trace BM Tracker's actual provider if possible; investigate public third-party aggregators (Kworb / ChartMasters) and official Spotify Charts as alternate source methods. Evaluate each provider's terms and practical stability before automating.

**Exit condition:** provider tests and data fixtures pass; the UI can distinguish current, cached, manual, sample and unavailable data.

## Milestone 3 — YouTube tracker

**Outcome:** working public YouTube channel and video tracking.

1. Verify BABYMONSTER's official channel ID from an official source.
2. Fetch channel statistics and uploads playlist via `channels.list`.
3. Read uploads via `playlistItems.list`.
4. Batch video metadata/statistics with `videos.list`.
5. Save daily snapshots and calculate changes only from real snapshots.
6. Handle quota, missing fields, hidden/removed/private videos, errors and stale cache.

Use quotas carefully: Google documents 10,000 units/day for most endpoints and a separate 100 calls/day default bucket for `search.list`; `channels.list` and `videos.list` currently cost 1 unit per request. Avoid recurring search requests.

**Exit condition:** real data loads with a configured key, no-key mode still works with cached/fallback data, and all displayed metrics include source/time.

## Milestone 4 — Spotify tracker

**Outcome:** Spotify tracking with defensible provenance.

1. Investigate BM Tracker's actual network requests and user guide disclosures.
2. Determine whether Spotify numbers are obtained from an upstream provider, a private first-party BM Tracker data route, an official chart, a third-party aggregate, or manual snapshots.
3. Confirm whether each candidate provides lifetime streams, daily streams, chart-only streams, monthly listeners, followers, or catalog metadata; preserve those as different units/metrics.
4. Test the source from the agent runtime and check reuse terms, robots guidance, frequency, attribution and access limits.
5. If permissible, implement an isolated cached adapter and daily snapshots. Otherwise use an alternative or allow sourced manual snapshots.
6. Add optional Spotify Web API metadata separately, never using deprecated popularity/follower fields as a required KPI.

**Exit condition:** every displayed Spotify number carries a precise metric definition, provider label, date/market and source link. No number is presented as an official Spotify API stream count unless the API genuinely returns it.

## Milestone 5 — Complete tracker screens and feature parity

**Outcome:** all audited public features are usable inside MONSTIEZ Universe.

- Expand Stats into the data-rich tracker area required by the feature audit.
- Add track / album / video detail pages and rankings if found in the reference.
- Implement the exact confirmed range controls, filters, sorting, comparison, charts, tables, tooltips, drill-downs and export behaviour.
- Add verified milestones and clear personal goals.
- Preserve Home, Discover, Calendar, all seven member pages and My Baemon.
- Integrate Myangni SVG expressions into real UI, including empty/error/loading/success or milestone states where appropriate.
- Match the original pastel MONSTIEZ art direction; do not copy BM Tracker's branding or exact proprietary design.

**Exit condition:** every confirmed feature has a corresponding implementation and passing test or a documented concrete blocker.

## Milestone 6 — Free scheduled data collection and PWA resilience

**Outcome:** data refreshes without a paid backend or always-on server.

Preferred approach if no free durable backend is already configured:
- Static-hosted PWA.
- GitHub repository as the persistent source of truth.
- Daily scheduled GitHub Actions collector for API/public-source metrics.
- `YOUTUBE_API_KEY` and optional Spotify credentials stored as GitHub secrets.
- Collector commits dated JSON snapshots only when data changes.
- PWA reads public JSON and caches last-known-good data/offline shell.
- Manual workflow dispatch for controlled refreshes.

Check actual free-tier limits and credentials before choosing host/workflow. Do not create an external paid dependency. Do not expose API secrets to browser JavaScript.

**Exit condition:** scheduled/manual collector tested, workflow results documented, app works offline with stale labels, and setup does not require a paid plan.

## Milestone 7 — QA and release

**Outcome:** shippable app and clean continuation path.

- Run syntax, build and unit/integration tests.
- Browser-test every main route and all visible controls.
- Check Android widths 360px, 390px and 430px plus desktop.
- Test missing/invalid API key, quota exhaustion, provider timeout, schema change, empty results and stale data.
- Verify chart axes, units, date logic, change calculations and market scopes.
- Verify PWA manifest/installability and service-worker offline behaviour under HTTP(S).
- Capture final screenshots for each major feature area.
- Update `README.md`, `docs/DATA_SOURCES.md`, `docs/DATA_PROVIDER_RESEARCH.md`, `docs/BM_TRACKER_FEATURE_AUDIT.md` and `worklog.md`.
- Commit and push a final resumable checkpoint; record the commit SHA and push verification.

## Important technical distinctions

### YouTube

Public YouTube Data API counts can be collected at the current moment and saved as dated snapshots. The API does not reconstruct historical view counts. Private YouTube Analytics is owner-authorized; the app cannot access BABYMONSTER's private creator analytics through a public API key.

### Spotify

The standard Spotify Web API returns catalog metadata and selected fields; it does not give a public lifetime stream total or a daily historical stream series for arbitrary tracks. Public stream numbers require a different provider or public data collection method. Spotify Charts stream counts are chart-eligible and can differ from total Spotify streams. Treat Kworb and ChartMasters as third-party candidates, not official Spotify APIs and not automatically confirmed BM Tracker sources.

## Project files

- `SUPER_Z_BUILD_PROMPT.md` — complete execution instructions for the agent.
- `docs/BM_TRACKER_REVERSE_ENGINEERING_PLAN.md` — detailed reference audit and source plan.
- `docs/BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md` — template to capture each actual feature.
- `docs/DATA_PROVIDER_RESEARCH.md` — YouTube/Spotify technical research and caveats.
- `docs/DATA_SOURCES.md` — source register to update after real tests.
- `worklog.md` — ongoing task/checkpoint state.

## Ready-to-start instruction

Give Super Z the complete ZIP and ask it to start with Milestone 0, open the live BM Tracker user guide and main site in its browser, complete the initial feature inventory, then implement the first tested YouTube tracking slice. It must keep the rest of the work in GitHub checkpoints so a server crash does not destroy progress.
