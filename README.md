# MONSTIEZ Universe

A fan-made, unofficial **BABYMONSTER companion PWA** — discover, follow, track, celebrate.
Android-first, installable, offline-friendly, **zero paid services**, no accounts, no tracking.

**Live app:** https://babymyang.github.io/monstiez-universe/

## What's inside

| Area | What you get |
|---|---|
| Welcome / Home / Discover | Mascot onboarding, quick actions, **138 real tracked videos** with official thumbnails, live tag filters and search |
| Stats & Milestones | A genuine fan tracker (feature parity with the audited BM Tracker reference): YouTube + Spotify tabs, totals, milestone cards, sort/search/filters, release detail pages with history charts, milestone ladders, biggest-day, other-versions, age-aligned Compare, Audience panels, Totals pages |
| Fan goals | Personal local goals and reminders (device-only) |
| Member Corner | All seven members (Ruka, Pharita, Asa, Ahyeon, Rami, Rora, Chiquita) with member-filtered tracked content |
| My Baemon | Personal corner, local data export, reset |
| Myangni | Original editable SVG mascot with expression variants used for loading/empty/milestone states |

## Data honesty (the core rule)

Every number in the tracker is a **dated observation with its own source**, shown in the UI:

- **YouTube** — official public figures. Automatic collection uses the **YouTube Data API**
  (channels.list → uploads playlist → batched videos.list; no search polling) once a key is configured.
  Until then, figures come from dated manual/public observations.
- **Spotify plays** — **Kworb** public artist page (third-party public stream figures;
  robots.txt permits access; credited on every figure). The Spotify Web API does **not**
  publish stream totals, so nothing here is ever labelled as a Spotify API stream count.
- **Spotify followers / monthly listeners** — dated public observations (credited).
- History starts when collection started (2026-10-29). **Nothing older is reconstructed.**
  Charts appear only when at least two dated readings exist. Missing values show honest
  words (`New`, `No full day`, `No count`) — never a made-up zero. Estimates are marked `est`.

Full details: [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) ·
Reference audit: [`docs/BM_TRACKER_FEATURE_AUDIT.md`](docs/BM_TRACKER_FEATURE_AUDIT.md)

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

A local HTTP server is required for PWA/service-worker behaviour. On `localhost` the
service worker does not register (dev convenience); it registers on the deployed site.

## Scheduled data collection

`.github/workflows/collect-public-stats.yml` runs daily (01:20 UTC ≈ 10:20 KST) and on
manual dispatch:

1. Parses Kworb's public BABYMONSTER page (no secrets needed) and files readings under the
   page's own "Last updated" date — never under the collection date.
2. If `YOUTUBE_API_KEY` is set in **Settings → Secrets and variables → Actions**, collects
   official channel + video statistics (≈5–15 quota units/day).
3. Validates honesty invariants (`scripts/validate.js`) and commits only when data changed.

Setup: add `YOUTUBE_API_KEY` as an Actions secret to enable official YouTube collection.
Everything else works without configuration.

## Repository layout

```
index.html / styles.css / app.js     app shell + screens
js/util.js                           KST day logic, formatting, milestones, biggest-day
js/data/store.js                     data loading, last-known-good cache, derived models
js/ui/charts.js                      SVG line+bars chart engine, age-aligned compare chart
js/ui/tracker.js                     tracker lists (sort/search/filters, album grouping)
js/ui/detail.js                      release detail view (chart, milestones, versions)
js/ui/views.js                       Audience / Totals / Compare / Sources views
data/catalog.json                    tracked entities (videos, songs, works, tags, channels)
data/series/youtube.json             dated YouTube readings (channel + videos)
data/series/spotify.json             dated Spotify readings (tracks + artist)
scripts/collect.js                   daily collector (Kworb + YouTube Data API)
scripts/validate.js                  data honesty validation
docs/                                audit, data sources, plans, reference screenshots
```

## Legal

MONSTIEZ Universe is a fan-made, unofficial companion. It is not affiliated with
BABYMONSTER, YG Entertainment, YouTube, Spotify, BM Tracker, Kworb or any other data
provider. All displayed figures carry their own source labels. Functional inspiration for
the tracker comes from BM Tracker's publicly documented behaviour — no proprietary code,
branding or assets were copied. Myangni is an original mascot.
