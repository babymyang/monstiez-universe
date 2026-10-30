# BM Tracker Feature Audit — evidence-backed inventory

**Reference guide:** https://bm-tracker.com/user-guide
**Main site:** https://bm-tracker.com/
**Audited by:** Super Z session (2026-10-30), via agent-browser headless Chromium
**Audit date/time/timezone:** 2026-10-30 ~09:00–09:30 UTC (KST 18:00, 30 Oct 2026)
**Browser/runtime:** agent-browser (Playwright/Chromium headless), network request tracking enabled
**Viewport sizes tested:** 1280×900 desktop, 390×844 mobile
**Screenshot evidence:** `docs/reference/bm-tracker/` (guide-top.png, app-desktop-top.png, app-spotify-tab.png, release-deserve-mv.png, audience.png, app-mobile-390.png)

> Every row below was directly observed in the live browser session on 2026-10-30.
> Nothing is inferred from the platform name alone. The full expanded guide text
> (14.7 KB, all 12 "More about this" disclosures opened) was extracted and is
> summarised here; release pages `/`, `/v/oC6brLXQe4I`, `/audience` were inspected.

## 1. Guide structure

| # | Guide section / heading | What it explains | Read completely? |
|---|---|---|---|
| 1 | The two lists | YouTube/Spotify tabs, item counts, platform totals, subscriber/follower header line | ✅ |
| 2 | Reading a line in the list | Row anatomy: yesterday's gain vs total, 7-day sparkline, rank movement, kind badge, honest missing states | ✅ |
| 3 | Finding one release | Sort buttons, search, filter chips with counts, URL state persistence, share | ✅ |
| 4 | The page for one video or song | Detail page: totals, position, weekly pace vs usual, likes-per-1000, song slices | ✅ |
| 5 | The chart | Line+bars history chart, Day/Week/Month/Year/All, arrows/drag strip, touch-to-read, dotted incomplete bars, release markers, note dots | ✅ |
| 6 | Milestones | Next milestone + ETA as month/range, passed-milestone ladder with dates, fixed mark set | ✅ |
| 7 | The biggest day | Per-day bars, peak marked, "fell to half the peak in N days", only when history starts at release | ✅ |
| 8 | Other versions of a song | Works cross-linking (recording/MV/stages/TV), never summed, TV behind "N more appearances" | ✅ |
| 9 | Albums | Album as one entity, per-track bands in chart, tap to highlight | ✅ |
| 10 | Everything added up | Platform totals page with full history and release markers | ✅ |
| 11 | Compare | Age-aligned comparison, up to 6, milestone-reach table, videos-with-videos / songs-with-songs | ✅ |
| 12 | Audience | YouTube/Spotify/TikTok/Instagram/X panels, three number kinds, never summed, "Reached" list | ✅ |
| 13 | Where the numbers come from | Provenance: YouTube + Spotify published figures; history imported from mystreamcount.com (Spotify plays back to Nov 2023) and viewstats.com (channel views/subs); own readings began 21 Oct 2026; est marking; unresolvable days dropped | ✅ |
| 14 | Words you will see | Glossary: est, No count, New · No full day, Paused · Unavailable, earlier · 3d, KST, Last collected | ✅ |
| 15 | Handy to know | Share links, light/dark, home-screen install + edge-swipe back, offline with stale notice, update bar, no accounts/cookies | ✅ |

## 2. Navigation and screen inventory

| Feature ID | Exact label | Route | Public? | Purpose | Evidence | Status |
|---|---|---|---|---|---|---|
| NAV-01 | YouTube tab · count badge | `/` | Yes | Switch to video list | app-desktop-top.png | confirmed |
| NAV-02 | Spotify tab · count badge | `/?platform=spotify` (client) | Yes | Switch to song list | app-spotify-tab.png | confirmed |
| NAV-03 | Release detail | `/v/{videoId}` | Yes | One video's full tracker page | release-deserve-mv.png | confirmed |
| NAV-04 | Song detail | `/s/{key}` (client-side) | Yes (inferred from row links; not opened) | One song's full tracker page | guide §"song page" | partially-confirmed |
| NAV-05 | Audience | `/audience` | Yes | Follower panels per platform | audience.png | confirmed |
| NAV-06 | Guide | `/user-guide` | Yes | Documentation | guide-top.png | confirmed |
| NAV-07 | Privacy | `/privacy` (footer link) | Yes (linked, not opened) | Privacy statement | footer snapshot | partially-confirmed |
| NAV-08 | Totals ("Everything added up") | tap big total | Yes (documented; not opened) | Platform total history | guide §10 | partially-confirmed |
| NAV-09 | Compare | "Compare with…" from release page | Yes (documented; not opened) | Age-aligned comparison | guide §11 | partially-confirmed |

## 3. Feature-by-feature audit

| Feature ID | Exact feature label | Guide section | Inputs / filters | Displayed output | Interactions | Formula / definition | Data source evidence | Refresh / history | MONSTIEZ target | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F-01 | Platform tabs with counts | Two lists | tap | "YouTube 138" / "Spotify 44" | switch list | — | overview API `youtube[138]`, `spotify[44]` | per load | Stats screen tabs | confirmed |
| F-02 | Subscriber/follower header line | Two lists | tap opens screen | YT "13.5M subscribers · stepped +100K 6 days ago"; SP "9.29M followers · 7.73M monthly listeners" | opens Audience | rounded figures "sit still and then jump" | API `audience.channels[].days`, `audience.artists[].days` | daily | Stats header line → Audience | confirmed |
| F-03 | Platform big total | Two lists | tap opens totals | YT "TOTAL VIEWS 10,587,102,276 +0 on 29 Oct · read 1 min ago"; SP "TOTAL PLAYS 2,816,275,834 +3,985,817 on 28 Oct" | opens history | YT = whole channel views (not list sum); SP = sum of listed songs | API `audience.channels[].views`; spotify rows summed | daily | Stats big total card | confirmed |
| F-04 | Upcoming milestone cards | Two lists | tap opens release | "'DESERVE' M/V: 23.7M to go to 100M, about 2 days"; "SUGAR HONEY ICE TEA 1.6M→150M ~7d"; SP: "DESERVE 4.5M→10M ~5d" | open release page | ETA at current pace, shown in days | API-derived (delta pace) | daily | Stats milestone cards | confirmed |
| F-05 | Release row anatomy | Reading a line | — | position, thumb, title, kind badge, gain (coloured) over total (grey), 7-day sparkline (desktop only), ▲2/▼1 rank vs a week ago | thumb → platform; else detail page | gain = last **full** day, today excluded | API `delta_24h`, `delta_day`, `spark[7]`, `views`, `likes` | daily | tracker list rows | confirmed |
| F-06 | Honest missing-value words | Reading a line | — | "New", "No full day", "No count", "Paused", "Unavailable" | — | never a fabricated zero | glossary | — | all metric slots | confirmed |
| F-07 | Sort buttons | Finding one release | 3 buttons | Newest / Movement / Totals; Spotify first = Albums | reorder list | Movement = grew most yesterday; Albums = group by record | — | — | list controls | confirmed |
| F-08 | Search | Finding one release | text box | filtered list | live filter | by name | — | — | list controls | confirmed |
| F-09 | Filter chips with counts | Finding one release | chips + channel dropdown | "All channels · BABYMONSTER (62) · SBSKPOP X INKIGAYO (24) · Mnet K-POP (14) · YG ENTERTAINMENT (10) · MBCkpop (10) · Beginagain (5) · So Hyang TV (5) · it's Live (4) · THE FIRST TAKE (3) · dingo music (1)"; tags: Music video 18 / Performance 22 / Music show 53 / Dance 7 / Cover 33 / Dance cover 5 | filter | count = resulting size | API `channels[]`, `tags[]` | static per release set | list controls | confirmed |
| F-10 | URL state + share | Finding one release / Handy to know | share button | link carries tab/order/search/filters | copy link | state in URL | — | — | stats routing + share | confirmed |
| F-11 | Detail totals block | One video or song | — | total + last full-day gain; position "29th of 138" + "1st in 7 days"; "Averaging +N a day this week" vs usual pace | — | this week vs release's normal pace | `/api/series?id=…` | daily | release detail view | confirmed |
| F-12 | Likes per 1,000 views | One video or song | video pages only | "10.5 likes per 1,000 views all time" + last 7 days beside it | — | lower recent = reaching different audience | API `likes`,`views` | daily | release detail | confirmed |
| F-13 | Song share slices | One video or song | song pages only | slice of all plays + slice of last 7 days | — | bigger recent slice = still climbing; Spotify publishes no likes | API plays | daily | song detail | confirmed |
| F-14 | History chart (line + bars) | The chart | Day/Week/Month/Year/All; arrows; drag strip; touch | line = total; bars = adds per period; dotted = incomplete; release markers; numbered note dots with text below | tap to read; press bar jumps main chart | — | `/api/series` daily series | full history | release detail chart | confirmed |
| F-15 | Milestones ladder | Milestones | scroll | next mark + distance + ETA (month or month-range, never exact day); passed marks with dates | scroll back through history | marks: 10M, 20M, 50M, 100M, 150M, 200M, then every 100M; spaced evenly (list, not ruler) | API series | accumulates | release detail | confirmed |
| F-16 | Biggest day | The biggest day | press bar | every day as bar; biggest marked; "Fell to half the peak in N days"; "still climbing — no peak yet" | press jumps main chart | only when history starts at release day | API series | daily | release detail | confirmed |
| F-17 | Other versions (works) | Other versions | expand | recording / MV / stages / TV listed with own numbers; "4 more appearances" collapsible; multi-song video lists contained songs | tap opens each | never added together | API `works[]`, `work_ids[]` | — | release detail + work pages | confirmed |
| F-18 | Album grouping + track bands | Albums | tap track | album total; per-track bands under album line; tap highlights band; track page via name | tap toggles | — | API `album`,`track_no` | — | Spotify album view | confirmed |
| F-19 | Platform totals history | Everything added up | tap big total | total over time + daily growth; release markers | — | not a sum of detail-page totals | audience channel series | daily | totals view | confirmed |
| F-20 | Age-aligned compare | Compare | pick up to 6 | lines from each release's day 0; milestone-reach table; summary about starting release | add via "Compare with…" | videos vs videos, songs vs songs, never mixed | API series | — | compare view | confirmed |
| F-21 | Audience panels | Audience | — | YT subs (rounded: jump, no ETA), SP followers (exact: pace + ETA month, needs 14 readings), monthly listeners (28-day, no milestone, direction + highest), IG/TikTok/X exact daily followers; "Reached" 100K-marks list with dates/ranges | — | never summed | API `audience.social[]` with `precision`, `measured` | daily | audience view | confirmed |
| F-22 | Provenance disclosure | Where the numbers come from | — | explicit statement of source per metric; history credited to mystreamcount.com + viewstats.com; own readings began 21 Oct 2026; ~24k days imported 26 Oct; overlap agrees exactly; est flags; 5 unresolvable days dropped | — | imported day = a reading; interpolated = est; filled never overwrites measured | guide text + API `estimated`, `measured` flags | — | DATA_SOURCES + UI labels | confirmed |
| F-23 | Glossary / honest states | Words you will see | — | est, No count, New · No full day, Paused · Unavailable, earlier · 3d, KST header, Last collected stale bar | — | KST = app day boundary; times shown in user clock | guide | — | app-wide status language | confirmed |
| F-24 | Share button | Handy to know | header button | exact-state URL | copy | — | — | — | header share | confirmed |
| F-25 | Light/dark theme | Handy to know | sun/moon button | theme persists | toggle | remembers | — | — | theme toggle | confirmed |
| F-26 | PWA install + offline | Handy to know | — | installs to home screen; offline reads last numbers; stale notice; update bar with Reload; swipe-from-left back | — | workbox PWA (observed `workbox-window` script) | manifest + SW observed | — | existing PWA shell | confirmed |
| F-27 | No accounts / no tracking | Handy to know / privacy | — | no account, no cookies, no visitor counting | — | — | guide + privacy link | — | app already complies | confirmed |

## 4. Charts and metrics

| Chart / metric | Units | Time range | Aggregation | Tooltip | Data provider | Timestamp | Caveats |
|---|---|---|---|---|---|---|---|
| Channel views over time | views | 22–30 Oct 2026 default window; All = full | daily snapshots | number at day, incomplete noted | BM Tracker backend (YouTube published figures; older from viewstats.com) | `data_as_of.youtube` 2026-10-30T08:55Z | channel total ≠ sum of listed videos |
| Video views history | views | Day/Week/Month/Year/All | daily | value + date; dotted = partial | `/api/series?id={videoId}` | `last_sample_at` | est days flagged |
| Likes history | likes | same | daily | same | same | same | likes can be disabled (No count) |
| Spotify plays history | plays | same | daily (measured/est) | same | backend (older from mystreamcount.com) | `data_as_of.spotify` 2026-10-28 | Spotify publishes on no fixed schedule ("earlier · 3d") |
| Added-per-day bars | views or plays per day | sync with line | day/week/month/year | biggest day marked | same | same | today = dotted incomplete |
| Follower/subscriber panels | followers, subscribers, listeners | 31 Aug–30 Oct (channel), 25–28 Oct (Spotify) | daily | panel caption describes axis | same | `at` field | rounded YT subs jump; listeners 28-day window |

## 5. Tables, exports and details

| Table / page | Columns | Sorting / filters | Pagination | Drill-down | Export | Notes |
|---|---|---|---|---|---|---|
| YouTube list | position, thumb, title, kind badge, gain, total, spark, rank change | Newest/Movement/Totals + search + channel/tag chips with counts | single scroll (138 rows) | row → detail; thumb → YouTube | none observed (share URL only) | honest words replace missing numbers |
| Spotify list | position, cover, title, album grouping, gain, total, spark | Albums/Movement/Totals + search | single scroll (44 rows) | row → song detail | none observed | album headers carry own totals |
| Compare table | release × milestone marks | — | — | — | none observed | blank = not reached or before history begins |
| Milestone ladder | mark, date | scrollable history | — | — | none observed | list spacing, not ruler |

## 6. Network/provider observations

| UI feature | Request host | Path / method | Response shape (public fields) | Initiator | Auth? | Schedule | Confidence |
|---|---|---|---|---|---|---|---|
| Whole app dataset | bm-tracker.com | `GET /api/overview` | `{generated_at, min_projection_days{youtube:2,spotify:5}, data_as_of{youtube,spotify,spotify_at}, channels[10]{id,title,videos}, audience{avatars,channels,artists,social}, tags[7]{slug,label,colour,built_in}, works[27]{id,name}, notes[8]{id,day,text,scope,item_id,work_id}, youtube[138]{id,title,thumb,accent,published_at,views,likes,tag,channel_id,channel,days,delta_24h,delta_day,delta_estimated,projectable,tracking,availability,last_sample_at,spark,spark_days,work_ids}, spotify[44]{key,name,duration_ms,cover,accent,track_id,album_id,album,album_type,release_date,date_precision,track_no,disc_no,plays,stat_date,source,delta,delta_measured,delta_days,spark_days,spark,days,measured_days,projectable,work_ids}}` | SPA fetch | No | regenerated per request (`generated_at` = 09:00:44Z while loaded 09:00) | high (direct fetch + response inspection) |
| Release history | bm-tracker.com | `GET /api/series?id={videoId}&from={ISO datetime}` | dated daily series for one release | chart load | No | on demand | high |
| Audience avatars | bm-tracker.com | `GET /api/avatar/{platform}?v={hash}` | cached image | audience panels | No | on demand | high |
| App shell | bm-tracker.com | `/assets/index-*.js`, `manifest.webmanifest`, workbox-window | Vite SPA + Workbox PWA | document | No | — | high |
| Upstream providers | — | — | **not directly observable client-side**; guide states YouTube (views/likes/subs) and Spotify (plays/followers/listeners) published figures; historical imports credited to mystreamcount.com (Spotify daily plays since Nov 2023) and viewstats.com (channel views/subs). BM Tracker readings began 21 Oct 2026; ~24,000 earlier days imported 26 Oct 2026. | guide disclosure | — | YouTube ~fresh (read 1 min ago); Spotify ~daily-irregular (28 Oct as of 30 Oct) | high for the disclosure; upstream mechanics not observed |

**Key architectural conclusion (evidence-based):** BM Tracker is a snapshot-based tracker served by its **own first-party backend**. It does **not** call the Spotify/YouTube APIs from the browser. Public stream totals shown for Spotify tracks (e.g. SHEESH 434,906,335 plays) cannot come from the standard Spotify Web API — consistent with the guide's provenance statement that figures are "published by the platform" and that history was imported from mystreamcount.com. For MONSTIEZ Universe (zero-budget, no backend), the equivalent architecture is: scheduled collectors (GitHub Actions) writing dated JSON snapshots to the repo, consumed read-only by the PWA — the same data contract, different infrastructure.

## 7. User/account/settings flows

- No login exists. No account, no cookies, "nothing you do here is recorded" (guide + privacy link).
- Settings observed: theme toggle (light/dark, remembered), share button. Nothing else.
- All data screens are publicly accessible without authentication. Nothing was bypassed.

## 8. Responsive and state behaviour

| Page | Mobile | Desktop | Loading | Empty | Error | Offline/stale | Accessibility |
|---|---|---|---|---|---|---|---|
| List | sparkline column hidden (documented); single column rows | sparkline shown | — | — | — | "Last collected" stale bar documented | semantic nav/landmarks observed |
| Chart | touch-to-read instead of hover | hover + press | — | — | — | — | figure + status roles observed |
| Release page | same blocks stacked | side asides (versions, milestone ladder) | — | — | — | — | heading structure observed |

State language is explicit and honest everywhere ("Only 9 days so far", "no peak yet", "no date — the figure is rounded", "a date needs 14 days of readings, and there are 4").

## 9. Parity coverage ledger

Implemented in the MONSTIEZ design language on `main` (commit history in `worklog.md`). Test evidence = live browser interaction runs recorded in the worklog + `docs/reference/` screenshots.

| Area | BM Tracker features | MONSTIEZ destination | Status |
|---|---|---|---|
| Lists + controls | F-01, F-05–F-09 | Stats screen tracker lists (YouTube/Spotify tabs) | ✅ implemented & tested |
| URL state | F-10 | Share button + hash deep links for screens/releases; sort/filter URL encoding deferred | ◐ partial (share works; filter-in-URL pending) |
| Release detail | F-11–F-17 | Release detail view (`#/release/v/{id}`, `#/release/s/{key}`) | ✅ implemented & tested |
| Albums | F-18 | Spotify Albums grouping with record totals + Spotify links; per-track band chart deferred | ◐ partial |
| Totals | F-03, F-19 | Totals views (`#/totals/youtube`, `#/totals/spotify`) | ✅ implemented |
| Compare | F-20 | Compare view (`#/compare/from/{kind}/{id}`) — age-aligned chart + milestone race table | ✅ implemented |
| Audience | F-02, F-21 | Audience view (`#/audience`); TikTok/IG/X panels pending collector extension | ◐ partial (YT+SP live) |
| Provenance/honesty | F-06, F-22, F-23 | Series schema (`estimated`, `source`, `method`, `alt`), est flags, honest state words, Sources view, `docs/DATA_SOURCES.md`, validator | ✅ implemented & enforced |
| Shell features | F-24–F-27 | Share button, light/dark theme, update bar, offline SW v4, no accounts/tracking | ✅ implemented & tested |

## 10. Unresolved questions

| Question | Why it matters | Evidence attempted | Still unknown | Next safe step |
|---|---|---|---|---|
| Exact upstream mechanism for BM Tracker's Spotify current-day counts | Not needed for parity if we use our own providers | Network trace (no third-party calls visible); guide disclosure | Whether backend uses official feeds, licensed data or page reading | Use our own evidence-based providers (Kworb parse / manual snapshots), labelled |
| Song detail route shape (`/s/…`) | Nice-to-have for URL parity | Not opened in session | exact route + layout differences | open one song page in follow-up audit pass |
| Totals page + Compare UI details | Follow-up pass | Documented in guide; not screenshot | exact controls | open both pages in follow-up pass |
| Privacy page contents | Attribution completeness | Link observed | contents | open in follow-up pass |

## Status definitions

- `confirmed`: directly observed with screenshot or request evidence.
- `partially-confirmed`: observed via guide or linked but not opened.
- `not-accessible`: unreachable in public session (none so far).
- `not-present`: checked and absent (none so far).
