# SUPER Z MASTER BUILD PROMPT — MONSTIEZ UNIVERSE + BM TRACKER FEATURE PARITY

**Reference to study:** https://bm-tracker.com/user-guide and https://bm-tracker.com/  
**Project:** MONSTIEZ Universe  
**Date:** 30 October 2026  
**Handoff state:** Fresh recovery baseline. Prior agent session is lost and must not be required.

---

## 0. Mission — build the app, not another proposal

Build MONSTIEZ Universe as a genuinely usable, Android-first, installable PWA for BABYMONSTER fans. Preserve and improve the attached working starter. Also study the BM Tracker main website and its complete user guide, then implement **all useful publicly documented BM Tracker features** inside MONSTIEZ Universe, adapted to our own UI and brand.

The user explicitly wants the agent to learn the main site, understand its full functionality and implement it. The user has accepted YouTube Data API usage. The source of BM Tracker's Spotify metrics is unknown and must be discovered rather than assumed.

This is a build task, not a plan-only task. You must first do a short, evidence-based reference audit, then start implementation in small checkpoints. Do not return only a list of recommendations. Do not ask the user to repeat details already contained in this handoff.

### Product intent

- App name: **MONSTIEZ Universe**.
- Audience: everyday BABYMONSTER fans / MONSTIEZ.
- Platform: mobile-first PWA, with Android as the main target.
- Visual identity: pastel pink and lavender, white cards, charcoal typography, rounded corners, small hearts/stars/sparkles, expressive Myangni mascot, high-quality mobile layout.
- Existing app experience: Welcome, Home, Discover, Stats & Milestones, Fan Calendar, Member Corner and My Baemon.
- Member selectors: Ruka, Pharita, Asa, Ahyeon, Rami, Rora and Chiquita. Ahyeon may be the starting selection.
- Mascot: **Myangni**, original chibi charcoal/black cat with pointed ears, pink inner ears and cheeks, big eyes, tiny paws, crown/heart/sparkle motifs. Actual SVG files are supplied; integrate them and refine them rather than inventing a new mascot.
- Data objective: expand Stats into a real fan tracker with the full confirmed public tracker functionality from BM Tracker, including YouTube and Spotify metrics that can actually be sourced.
- Zero-budget preference: no required paid APIs, paid data providers, paid hosting, paid databases or paid auth. Free/public sources and open-source tooling are preferred. A user-configured free/quota-limited API key is acceptable where necessary.
- Unofficial fan project: label the app clearly as independent and not affiliated with BABYMONSTER or YG Entertainment.

## 1. Recovery and file baseline

The supplied folder is the clean baseline. Read these files first:

- `index.html`, `styles.css`, `app.js` — existing real UI/screens and working client-side interaction logic.
- `manifest.webmanifest`, `service-worker.js` — PWA shell.
- `assets/myangni.svg` — canonical mascot.
- `assets/myangni-happy.svg`, `myangni-sleepy.svg`, `myangni-excited.svg`, `myangni-love.svg`, `myangni-peek.svg` — expressions.
- `assets/app-icon.svg` — app icon.
- `assets/ui-reference-four-screens.jpg` — UI art direction.
- `assets/mascot-and-ui-reference.jpg` — Myangni expression/design reference.
- `docs/ASSET_GUIDE.md`, `docs/DATA_SOURCES.md`, `docs/DATA_PROVIDER_RESEARCH.md`, `docs/BM_TRACKER_REVERSE_ENGINEERING_PLAN.md`, `docs/BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md` — starter docs and this research plan.
- `worklog.md` — recovery and checkpoint log.

The starter is intentionally local-first. Do not throw it away, replace its six-screen structure with a generic template, or display the mockup PNG as the whole app. Actual buttons, cards, screens, filters and charts must remain real UI controls/components.

First commands/checks:
1. `pwd`, `find . -maxdepth 3 -type f`, `git status --short --branch`, `git remote -v`, `git log -5 --oneline`.
2. Inspect the package/build environment before installing anything.
3. Run the starter locally with the simplest available static HTTP server.
4. Confirm that required JS/CSS/SVG/image paths exist and load.
5. Create a baseline Git checkpoint before major edits, without deleting or overwriting existing work.

## 2. Hard requirement: learn BM Tracker before feature-parity implementation

The reference URL's content could not be extracted by the initial research reader because it is client-rendered. Therefore you must use **your own working browser automation** to inspect the public website.

Read and audit both:
- `https://bm-tracker.com/user-guide`
- `https://bm-tracker.com/`

Follow the exact browser audit steps in `docs/BM_TRACKER_REVERSE_ENGINEERING_PLAN.md` and complete `docs/BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md`, producing `docs/BM_TRACKER_FEATURE_AUDIT.md`.

### Browser audit requirements

- Load the user guide in a real browser and wait until client-side rendering is complete.
- Scroll every section; open accordions, tabs, dropdowns and any collapsible content.
- Follow internal links, screenshots and linked documentation as needed.
- Inspect the live main app, every public nav item, page, tab, chart, table, dropdown, date/range selector, tooltip, filter, sorting control, export and detail view.
- Test at a desktop width and Android/narrow mobile width.
- Save browser screenshots, where available, to `docs/reference/bm-tracker/`.
- Record exact labels, units, formulas/definitions, date periods, refresh behaviour, error/empty states and source disclosures.
- For public pages, inspect Network → Fetch/XHR on reload and relevant interactions. Record the request host/path/method, status, response structure (only relevant public field names), initiator and whether a credential is required. Distinguish first-party app APIs, Spotify/YouTube official APIs, charts/aggregators, static JSON and other services.
- Do not save cookies, bearer tokens, private identifiers or personal account data. Do not bypass authentication, paywalls, anti-bot challenges or access controls. If a route requires an account, record that limitation and audit only the legitimately accessible public flows.
- If the browser runtime cannot access the site, try a normal page navigation/reload and the guide's public linked routes. Record the exact failure and evidence. Do not invent unseen features or claim full parity.

### Feature audit output

For every confirmed feature, record:
- stable feature ID;
- exact reference label;
- route / guide section;
- user purpose;
- displayed metric(s), units and formulas;
- filters, range options, market/country and sorting rules;
- interactions and state changes;
- data provider evidence and refresh/historical behaviour;
- screenshot evidence;
- MONSTIEZ target screen/component;
- test case and status (`confirmed`, `partially-confirmed`, `not-accessible`, `not-present`).

Do not omit any feature that the public guide documents. Add a parity coverage matrix that maps every confirmed BM Tracker feature to the implementation and tests. Keep the BM Tracker feature names in documentation so coverage can be checked later.

### What to copy and what not to copy

Reproduce the **functionality, information architecture where useful, data coverage, calculations, chart controls and workflow behaviour**. Do not copy BM Tracker's proprietary source code, branding, logos, copyrighted illustrations or exact visual design. The MONSTIEZ design system and Myangni identity remain the UI layer. A feature can be functionally equivalent while being expressed in our style.

## 3. YouTube provider — use the official Data API

YouTube Data API is approved for public metrics. Implement it as a provider adapter, not scattered calls inside screen code.

### Efficient collection design

1. Find and verify the official BABYMONSTER YouTube channel ID from an official public page/link or a one-time search. Record evidence. Never rely on a guessed channel ID.
2. Use `channels.list` to retrieve channel snippet/statistics/contentDetails and the uploads playlist ID.
3. Use `playlistItems.list` to enumerate uploads, with pagination when necessary.
4. Batch IDs into `videos.list` requests to get `snippet`, `statistics`, and `contentDetails` data.
5. Store video ID, title, published date, duration, thumbnail URL, current public `viewCount`, `likeCount`, `commentCount` where returned, channel ID, source URL and `collectedAt`.
6. Collect current channel public statistics and snapshots.
7. Compute daily/weekly/monthly deltas from our own dated snapshots. Do not invent history for periods before collection began.
8. Use conservative refreshes, cache, retry/backoff, request timeout and clear quota error handling.

### Quota facts to respect

The official Google quota guide documents a default 10,000 units/day for most methods and a separate 100-calls/day bucket for `search.list` and `videos.insert`. Current docs list `channels.list` and `videos.list` at 1 unit per call. Search is for discovery, not polling. Use uploads playlist + batch lookups after discovery. Recheck latest quota settings before deployment.

### YouTube limitations

- Public Data API counts are current values, not historic daily view counts. Capture snapshots to create historical charts.
- YouTube Analytics API private reports require OAuth by the channel owner/manager. Our app cannot obtain BABYMONSTER's private channel analytics using our public app's API key.
- Subscriber display may be rounded/hidden; display returned values honestly.
- Handle missing/disabled API key, quota exhaustion, `403`, `404`, deleted/private videos and missing fields without crashing the UI.

No YouTube key is embedded in public client JavaScript. Use GitHub Actions secrets / server-side configuration. The app must still load and show last-known data without a configured key.

## 4. Spotify provider — do not confuse catalog metadata with stream counts

**Critical technical point:** the standard Spotify Web API does not provide a public lifetime streams field or historical daily track stream series for arbitrary artists. It is not a substitute for the Spotify totals visible on a stream tracker.

### A. Optional Spotify Web API metadata

Use it for supported catalog information where useful: artist, album and track IDs, titles, release dates, URLs, metadata and artwork. All calls require authorization. Keep client secrets server-side. Do not require fan logins for the core public dashboard.

Current Spotify references mark fields such as artist followers and artist/track popularity as deprecated. Treat these as optional/possibly unavailable, not as a guaranteed KPI.

Spotify developer mode has changed during 2026. The February 2026 changes include a Spotify Premium requirement for the app owner, a five-user allowlist cap and constrained access; the July 2026 update raises the developer account Client ID limit to 25 and uses account-shared dev-mode quota. Verify the latest rules and supported endpoints when configuring it. Do not assume a public fan app can scale with a development-mode app.

### B. Public stream totals and daily streams

Investigate the actual BM Tracker data path in its Network requests and guide. Determine whether it uses Spotify API metadata plus a separate streams provider, a first-party backend, official charts, a third-party aggregator, imported CSV or manual snapshots. Record evidence and confidence. Do not infer from the Spotify logo/tab alone.

Research candidates already identified:
- Kworb BABYMONSTER songs: `https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html` — public page currently displays total and daily streams per song and last-updated date.
- Kworb BABYMONSTER chart history: `https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS.html` — chart history; note its description that displayed stream counts cover time spent in the Top 200.
- ChartMasters BABYMONSTER dashboard: `https://chartmasters.org/artist/babymonster/` — public data includes Spotify total/daily track counts, trend/achievement information and a CSV affordance; some content/features may be gated.
- Spotify Charts: official chart data for specific markets/date windows. Spotify states chart counts are filtered/chart-eligible and may differ from overall stream figures or Spotify for Artists. Never label these as total lifetime streams.

These are **candidates, not confirmed BM Tracker sources**. Check terms, robots guidance, acceptable reuse, rate limits, attribution, freshness and technical stability before automation. Prefer a documented public feed/API if one exists. If page scraping is permitted and stable, implement a polite cached parser behind a replaceable adapter. If not, use another source or manual dated snapshots. No blanket refusal; evaluate each provider properly.

### C. Spotify display rules

Every metric must identify its source category:
- `Spotify Web API · catalog metadata`
- `Kworb · third-party public stream figures`
- `ChartMasters · third-party stream figures`
- `Spotify Charts · chart-eligible streams`
- `Manual snapshot · user entered`
- `Sample data · demo only`

Keep track stream totals, daily streams, chart-eligible streams, daily listeners, monthly listeners, followers, track popularity and Spotify metadata as distinct typed metrics with different units. Do not compare incompatible metrics or infer one from another.

## 5. Shared provider architecture and data provenance

Implement normalized providers and data contracts. The UI must not be coupled to a particular upstream page.

Each metric snapshot should store at least:
- stable entity ID and entity type (artist, album, track, video, channel);
- platform;
- metric key and numeric value;
- exact unit;
- period start/end and/or observation date;
- market/country/global scope where relevant;
- provider name and source URL;
- collection method (official API, public page parse, chart export, manual entry);
- whether source is official or third-party;
- collection timestamp in UTC;
- state (`verified`, `cached`, `manual`, `sample`, `unavailable`);
- explanatory caveat.

A sample record schema appears in `docs/BM_TRACKER_REVERSE_ENGINEERING_PLAN.md`.

Rules:
- Keep raw and normalized response snapshots where reasonable for debugging, but never commit secrets or personal data.
- Validate schema changes and numeric/date ranges.
- Include source name, observation date and a source link in all public metric UI.
- Preserve last-known-good data and show stale status when an update fails.
- No fabricated numbers, historical interpolation or unlabelled sample values.
- Keep providers swappable and independently testable.
- Use cache + conservative refresh. Avoid unnecessary scraping or repeated API polling.

## 6. Build and navigation requirements

Keep the supplied product experience and grow it to include all confirmed BM Tracker capabilities.

Existing destinations:
1. Welcome / onboarding.
2. Home dashboard.
3. Discover.
4. Stats & Milestones (expand into the full tracker sections discovered in BM Tracker).
5. Fan Calendar.
6. Member Corner (all seven members).
7. My Baemon / personal corner.

Add screens/subpages when the audited feature set needs them, such as song detail, album detail, video detail, rankings, chart details, market/country comparisons or data source details. Do not force a dense data table into a tiny card if a dedicated full-page view is more usable.

Minimum expected interaction quality:
- navigation works in both directions;
- tabs change content, not just visual selected state;
- search/filter/sorting/range selectors actually update results;
- charts show accurate units, dates and hover/tap details;
- metric cards link to relevant detail views;
- tables support the reference's real sorting/paging/export behaviour if present;
- refresh/retry states are real and report actual status;
- user goals/favorites/reminders persist on-device;
- source/date metadata can be opened from metric views;
- screen readers get labels; touch targets are suitable for Android;
- all major views have loading, empty, error and stale/offline states.

### Preserve the Myangni vector mascot

Use the provided canonical SVG and expression variants in app UI. They must remain editable vectors, with transparent backgrounds and coherent proportions. Build a small reusable mascot renderer if compatible with the current implementation. Use different expressions to communicate empty states, loading, success, reminders or milestones. Do not trace the reference montage as one raster image and do not substitute random stock cat artwork.

### Images and thumbnails

Images are welcome and useful. Use public/external images or thumbnails where permitted, original SVG/CSS art where not, and a proper broken-image fallback. Preserve attribution and do not crop/overlay Spotify artwork in ways prohibited by Spotify policy. Never assume no images or scraping are allowed; assess each source and choose a practical method.

## 7. Zero-cost-first deployment plan

The user no longer has reliable project/server resources. Make persistence and recovery a first-class requirement.

Preferred design if no existing free durable backend is already present:
- Static PWA using the supplied HTML/CSS/JS starter.
- GitHub repo as source of truth.
- A scheduled GitHub Actions workflow runs data collection (initially daily, subject to quota/provider cadence).
- API keys are kept in GitHub Actions secrets, not in code.
- Collector writes dated normalized JSON into `data/` and commits only when values changed.
- PWA reads static JSON and keeps last-known good data available offline.
- Manual `workflow_dispatch` job provides a controlled refresh option.
- Static hosting via an existing free option or GitHub Pages if it fits the actual repo and domain setup.

Do not add a paid database, paid analytics API, paid scraper or mandatory account. If a free service is proposed, verify its current limits and whether a credit card is required; avoid dependencies that can silently become paid.

If a backend is needed by a confirmed BM Tracker feature, first determine whether the same capability can be achieved with scheduled static data plus browser local storage. Add the smallest free durable backend only if essential and explain any account/configuration requirement.

## 8. Repository, tasks and crash recovery

- GitHub repository is the persistent source of truth; the server/session is disposable.
- Inspect before modifying: `git status`, branch, remotes, recent commits.
- Never run destructive cleanup, `git reset --hard`, force-push or overwrite unknown work.
- If no repository is connected, prepare the project locally, then use the available GitHub integration to create/use the user's project repository only if permissions exist. Never invent credentials or create a remote without explicit successful tool confirmation.
- Commit in small functional checkpoints and verify remote push.
- Create a bounded set of GitHub issues for reference audit, YouTube provider, Spotify discovery/provider, tracker features, UI parity, QA and release. Keep the feature matrix as the source of truth, not an explosion of micro-issues.
- Update root `worklog.md` after each work unit: scope, files changed, tests, result, current commit, remote verification, blockers and exact next step.
- At the end of a session commit/push everything complete and leave recovery instructions.
- After a session reset/crash read worklog + git state + issues and continue. Do not ask the user to restate the product brief.

## 9. Implementation phases (keep them bounded)

### Phase A — Run and preserve starter

- Inspect and run the starter.
- Confirm all screens and mascot assets load.
- Establish the repository baseline and persistent checkpoint.
- Record baseline tests and current limitations.

### Phase B — BM Tracker audit

- Complete the public user guide and live product inspection.
- Capture screenshots and public request/source observations.
- Create `docs/BM_TRACKER_FEATURE_AUDIT.md` and a parity matrix.
- Do not spend the entire session in audit: time-box the initial audit, then start the first implementation slice while continuing any remaining detail pages as bounded follow-up work.

### Phase C — Core data foundation

- Define entity and metric schemas.
- Build YouTube collector and fixtures/tests.
- Build Spotify metadata adapter only if it provides value and is compatible with current rules.
- Investigate actual BM Tracker Spotify provider plus Kworb/ChartMasters/Spotify Charts alternatives.
- Build snapshots, caching, data quality validation and freshness labels.

### Phase D — Full tracker UI parity

- Implement every confirmed public BM Tracker feature, using a MONSTIEZ design language.
- Add the required screen routes, details, rankings, charts, period controls, comparisons, data source disclosure and exports according to the audit.
- Preserve original fan app features and Myangni character.

### Phase E — Automation and offline support

- Add scheduled collection and manual workflow only after collectors pass local tests.
- Configure secret names and setup documentation; never ask Super Z to guess user's keys.
- Add static JSON cache, service worker support and offline fallback.

### Phase F — QA and completion

- Test desktop + 360/390/430px Android widths.
- Test every route and all interactions.
- Test provider failure, quota limit, malformed response, stale cache and missing data.
- Check PWA installability and offline operation under HTTP(S).
- Capture comparison screenshots for every major feature area.
- Mark feature coverage only when the matching tests/evidence pass.
- Update docs and commit/push a resumable release checkpoint.

## 10. Acceptance checklist — all required

### BM Tracker feature parity
- [ ] Entire public user guide has been read and sections listed.
- [ ] Main site's public navigation/screens/controls have been inspected.
- [ ] Browser screenshot evidence exists for the audited pages.
- [ ] Public Network request/provider findings are recorded without credentials or user data.
- [ ] A complete feature matrix exists.
- [ ] Every confirmed documented public feature maps to a MONSTIEZ screen/component and test.
- [ ] Anything inaccessible or blocked is marked as such, never invented.

### Data
- [ ] YouTube official channel ID verified from a reliable official link.
- [ ] YouTube Data API fetch works with a configured key and graceful fallback without one.
- [ ] Quota-efficient uploads-playlist + batch-video approach used.
- [ ] Historical YouTube values are based on actual dated snapshots.
- [ ] Spotify data source is documented by evidence; no unsupported assertion that public stream totals came from Spotify API.
- [ ] Spotify metadata, stream totals and Spotify Charts counts are different metric types.
- [ ] Third-party sources have reuse/robots/rate/attribution checks before automated use.
- [ ] All displayed public figures include provider, date, unit/scope and source link.

### Product and engineering
- [ ] Existing Welcome/Home/Discover/Stats/Events/Member/My Baemon journeys still work.
- [ ] All seven members are selectable.
- [ ] Myangni SVG variants load and are integrated into actual screens.
- [ ] The UI is responsive and resembles the supplied MONSTIEZ references, not a BM Tracker clone.
- [ ] Every visible action works or is explicitly disabled/labelled.
- [ ] Loading/empty/error/stale/offline states work.
- [ ] Local favorites/goals/reminders work and export/reset is tested.
- [ ] PWA manifest, icon, service worker and offline shell are tested.
- [ ] No paid service/API or login is required to open the core app.
- [ ] Tests and browser screenshots are recorded; no unrun test is reported as passed.
- [ ] Git checkpoint is persisted, push status is explicit, and `worklog.md` is current.

## 11. First actions — begin now

1. Inspect and run the supplied starter; verify its existing screens/mascot.
2. Open BM Tracker user guide and main site in the browser; begin evidence capture and audit.
3. Create/update a bounded GitHub issue set and commit the untouched baseline.
4. Complete a first audit pass that covers every visible navigation item and every guide heading.
5. Implement the first high-value tracker vertical slice using the existing Stats screen and YouTube provider.
6. Continue implementing all remaining confirmed features in small tested checkpoints.

Do not stop after generating a new plan. Do not ask the user to source the Myangni mascot: it is already supplied as SVG. Do not assume Spotify API provides streams. Do not arbitrarily prohibit scraping or unofficial data sources; evaluate the concrete source and its terms. Do not fabricate feature parity. Preserve every checkpoint in GitHub so a fresh session can recover.
