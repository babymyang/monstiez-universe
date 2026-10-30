# Worklog — MONSTIEZ Universe + BM Tracker feature parity

## Current handoff state — 2026-10-30
- Clean handoff rebuilt from `MONSTIEZ_Universe_Starter_Bundle.zip`; previous agent session/server is not required.
- Real starter UI exists in `index.html`, `styles.css`, `app.js`.
- Screens included: Welcome, Home, Discover, Stats & Milestones, Fan Calendar, Member Corner, My Baemon.
- Myangni canonical SVG and five expression variants are included.
- PWA shell includes manifest, service worker and SVG icon.
- UI mockups/reference sheets are in `assets/`.
- Added a BM Tracker feature-parity plan and audit template, a full product roadmap, technical YouTube/Spotify provider research and an updated Super Z master prompt.

## Reference research status
- `https://bm-tracker.com/user-guide` and `https://bm-tracker.com/` were reachable by URL from the research web reader, but no readable page lines/content were returned. Search indexing did not expose the guide text.
- Therefore, the precise BM Tracker feature inventory and its Spotify data source remain unverified at this stage.
- Mandatory next action: Super Z must open the guide and main site in its real browser, inspect all public workflows and public Network requests, capture evidence and complete `docs/BM_TRACKER_FEATURE_AUDIT.md`.
- Do not claim that the reference audit is complete before that file is filled with evidence.

## Technical research notes
- YouTube Data API: default quota described as 10,000 units/day for most methods plus a separate 100-call/day bucket for `search.list`; `channels.list` and `videos.list` currently cost 1 unit/call. Prefer uploads playlist discovery + batched video list calls; snapshot daily for historical charts.
- YouTube Analytics API private reports require owner/manager OAuth; not available for arbitrary official channels using our own API key.
- Spotify Web API does not provide public lifetime/daily stream totals as standard track fields. Artist followers/popularity and track popularity fields are marked deprecated in current endpoint documentation.
- Public Spotify stream candidates identified for agent evaluation: Kworb BABYMONSTER songs page and ChartMasters BABYMONSTER dashboard; these are third-party and are not confirmed as BM Tracker sources.
- Spotify Charts shows chart-eligible stream counts under a filtering formula; do not label those as all-time global totals.

## Verification performed in this handoff environment
- The previous starter bundle was unpacked and its complete contents preserved, including `app.js`, `styles.css`, SVG mascot files and reference images.
- `node --check app.js` — to be re-run below before final zip; inherited worklog records a previous pass.
- No GitHub remote or push was performed by this handoff builder.
- No BM Tracker browser screenshots or network trace were obtained in this research environment.

## Git / remote state
- This bundle is not yet connected to the user's GitHub repository; no remote push has been performed here.
- First action for Super Z: inspect actual GitHub access/repo state, make a baseline commit without destructive operations, verify remote push.

## Next sequence
1. Run syntax/reference checks and preview the included app.
2. Commit the clean starter baseline to GitHub.
3. Audit BM Tracker guide and main product in a real browser; complete the feature matrix.
4. Implement YouTube API collector using uploads playlist + batched video lookups.
5. Identify BM Tracker Spotify source; test permitted alternatives; implement metadata vs stream providers separately.
6. Implement every confirmed public feature with the MONSTIEZ UI and Myangni mascot.
7. Add scheduled snapshot collection only after local tests; use GitHub secrets and no paid dependencies.
8. Browser-test all screens/states; update docs and push every verified checkpoint.
