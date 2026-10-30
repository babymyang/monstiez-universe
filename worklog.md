# Worklog — MONSTIEZ Universe + BM Tracker feature parity

## Session 2026-10-30 — Super Z (fresh recovery baseline → working tracker)

**Repo:** https://github.com/babymyang/monstiez-universe (branch `main`)
**Live:** https://babymyang.github.io/monstiez-universe/
**Environment:** sandbox (Node 24, Python 3.12, git 2.47, agent-browser headless Chromium)

### Milestone 0 — Recover and preserve ✅
- Extracted handoff ZIP; all starter files verified (7 screens, 6 Myangni SVGs, PWA shell, docs).
- `node --check app.js` PASS; served over HTTP; all core assets 200.
- GitHub token verified → user `babymyang` (scopes: repo, workflow, project, notifications).
- Existing repo contained a prior Next.js session (2026-10-29). **Preserved non-destructively** on branch `archive/nextjs-2026-10-29`; new vanilla baseline pushed to `main` per the 2026-10-30 handoff (`d0fc597`).
- Reused verified facts from the prior session: WE GO UP M/V `wlHwjkYpSr0` @228,252,529 (2026-10-29), DESERVE M/V `oC6brLXQe4I` @66,334,830 (2026-10-29), channel ID `UCqwUnggBBct-AY2lAdI88jQ`.

### Milestone 1 — BM Tracker browser audit ✅
- Audited guide + main site in real browser (agent-browser/Chromium); all 12 disclosures expanded; full guide text extracted (14.7 KB).
- Live app inspected: YouTube/Spotify tabs, release detail `/v/oC6brLXQe4I`, Audience, filters, milestones. Desktop + 390px screenshots in `docs/reference/bm-tracker/` (6 files).
- **Network evidence:** first-party API only — `/api/overview`, `/api/series?id=…&from=…`, `/api/avatar/*`. No upstream calls from the browser. Guide discloses provenance: YouTube + Spotify published figures; history imported from mystreamcount.com (Spotify plays since Nov 2023) + viewstats.com (channel); own readings began 21 Oct 2026; est-flagging philosophy.
- Output: `docs/BM_TRACKER_FEATURE_AUDIT.md` — 27 confirmed features (F-01..F-27) with evidence, plus parity destinations.

### Milestone 2 — Data foundation ✅
- Series format: dated readings `{v, estimated, source, method, daily?, alt?}` — provenance on every reading; validator enforces it (`scripts/validate.js`, 0 errors).
- Seed built honestly: Kworb (robots-allowed, page-dated 2026-10-28) + credited BM Tracker public observations (2026-10-30) + prior watch-page observations (2026-10-29).
- Catalogue: 138 videos / 44 songs / 27 works / 10 channels / 7 tags.

### Milestone 3 — YouTube provider ✅ (no-key mode verified)
- `scripts/collect.js`: official YouTube Data API path (channels.list → uploads playlist → batched videos.list; ~5–15 units/day; no search polling); **skips with recorded reason** when `YOUTUBE_API_KEY` absent. Key goes in GitHub Actions secrets only.
- Channel ID `UCqwUnggBBct-AY2lAdI88jQ` re-verified (BM Tracker channels list + prior official-page check).

### Milestone 4 — Spotify provider ✅
- Decision by evidence: Kworb songs page (robots `Allow: /`, stable table, page-declared date). ChartMasters/Spotify Charts evaluated and deferred (see DATA_SOURCES.md).
- Honesty rule discovered + implemented: readings filed under the **page's own "Last updated" date** — a stale page must not fabricate a flat extra day. Same-day conflicts keep both readings (primary + `alt`).
- Kworb vs BM Tracker same-day diff recorded (~0.05% — collection-timing artifact; kept as separate observations).

### Milestone 5 — Tracker UI parity ✅ (27 features; see ledger)
- Stats screen = full tracker: header line (subs/followers+listeners), big totals (tappable), milestone cards, Newest/Movement/Totals/Albums sorts, search, channel+tag chips **with counts**, rows with delta/total/sparkline/kind badges/rank movement, honest state words (New / No full day / No count), est marking.
- Release detail: totals + delta, rank ("29th of 138" — matches reference exactly), weekly pace vs usual, likes-per-1000 (videos) / share slices (songs), history chart (Day/Week/Month/Year/All, window panning, touch readout, dotted incomplete bars, release markers, note dots), milestone ladder (10M→every 100M; "before our readings began" for pre-observation marks), biggest day (with no-peak honesty), other versions (+ "N more appearances"), Compare-with link.
- Albums sort: records grouped with own totals; album links to Spotify.
- Audience view: YT subs (rounded/no-ETA note), YT channel views, Spotify followers (14-reading ETA rule), monthly listeners (28-day, highest-reading) — Myangni peek in no-history states.
- Totals views (channel history / sum-of-songs with scope notes), Compare (age-aligned + milestone race table), Sources view (provenance + glossary + honesty rules).
- Home/Discover/Member render the real catalogue (official thumbnails, live tag counts, member-name filtering).
- Shell: share button (F-24), light/dark theme with persistence (F-25), "new version ready" update bar (F-26), offline with SW v4 (F-27 pre-existing compliance).

### Milestone 6 — Automation ✅
- `.github/workflows/collect-public-stats.yml`: daily 01:20 UTC + workflow_dispatch; Kworb (no secrets) + YouTube (when key configured); validates then commits only on change.
- `data/feed-status.json` records per-collector status; app reads it.

### Milestone 7 — QA ✅
- Interaction tests (live browser): welcome→join→home→stats→tabs→sorts→search→chips→detail→chart ranges→versions→audience→compare-pick — PASS.
- Deep links: `#stats`, `#audience`, `#release/v/{id}`, `#release/s/{key}`, `#sources` — PASS (after fix).
- PWA: SW registers on deploy; **offline reload serves the full tracker** (138 rows) — PASS.
- Update flow: SW v4 with `cache:'reload'` precache + stale-while-revalidate self-healing + update bar — verified against a real stale-shell incident.
- Widths: 360 / 390 / 430 / desktop — no horizontal overflow (was fixed); PASS.
- Numbers cross-checked: rank 29th-of-138, likes-per-1000 10.5, share slices, milestone distances match reference values where comparable.
- Data: `scripts/validate.js` → 0 errors, 0 warnings.

### Bugs found by real testing (all fixed)
1. Screen ID mismatch (`trackerViewScreen` vs `trackerviewScreen`) broke detail routing.
2. SW v2 cache-first served stale HTML/JS after code changes → v4 SWR + `cache:'reload'` + update bar.
3. `rankMap('v')` kind mismatch → videos showed "not ranked yet".
4. Milestones pre-dating our observations showed a false date → now "before our readings began".
5. Kworb readings must use the page's declared date, not fetch date (fabricated flat day removed).
6. Home didn't re-render when data arrived → real videos now appear.
7. 360px horizontal overflow in detail hero → flex/clip guards.
8. `#stats` deep links landed on Home → main screens made deep-linkable.

### Known limitations / next steps
- Sort/filter state is not URL-encoded yet (reference F-10 partial) — share carries screen/release deep links.
- Album band chart (per-track bands under album line, F-18 advanced) not built — grouping + totals done.
- Song detail route uses hash URLs, not path URLs (no server rewrites on GH Pages) — functionally equivalent.
- TikTok/Instagram/X audience panels await collector extension (commented in views.js note).
- YouTube official collection starts after the user adds `YOUTUBE_API_KEY` to Actions secrets.
- 5 unresolvable early-2024 days (reference dropped 5 days for one song) don't apply to us — our history starts 2026-10-29.

### Git checkpoints (verified pushed)
d0fc597 baseline → 21bb811 audit → a784706 tracker core → 5005598 parity shell → bae66ee/5d17820 deep-link fixes → 77aa90c update bar → 1e6c7f6 SW v4 → 9256c7d + 3db75f8 overflow fixes → release checkpoint (this commit).
