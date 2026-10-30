# MONSTIEZ Universe — BM Tracker parity handoff

This is a fresh, self-contained handoff for Super Z. It contains a working mobile-first PWA starter, real UI screens, editable Myangni mascot vectors, visual reference sheets, a detailed implementation plan, and an agent master prompt.

## Start here

1. Read `SUPER_Z_BUILD_PROMPT.md` and execute it.
2. Read `PROJECT_PLAN.md` for the milestone roadmap.
3. Open `docs/BM_TRACKER_REVERSE_ENGINEERING_PLAN.md` and complete `docs/BM_TRACKER_FEATURE_AUDIT_TEMPLATE.md` using the Super Z browser against:
   - https://bm-tracker.com/user-guide
   - https://bm-tracker.com/
4. Run and inspect the included starter before changing it.
5. Persist the project in GitHub and update `worklog.md` after every work unit.

## Run the starter locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. A local HTTP server is needed for service-worker/PWA checks; opening `index.html` directly as a file is not a valid PWA test.

## Included screens

- Welcome / onboarding
- Home dashboard
- Discover with content search and filters
- Stats & Milestones (YouTube / Spotify / Fan Goals tabs in starter UI)
- Fan Calendar with local reminders
- Member Corner with all seven members
- My Baemon personal area

The starter uses clear sample/illustrative labels where live data is not connected. It must not present the sample values as official or live.

## Myangni assets

`assets/myangni.svg` is the canonical vector mascot. Additional SVG expression variants are included for happy, sleepy, excited, love and peek. Use these actual SVGs in the app and keep them editable. The JPG reference sheets are for art direction, not replacement screens.

## BM Tracker feature parity

The guide is a client-rendered website and its text could not be reliably extracted by the initial research page reader. The new agent must inspect it in a real browser, capture evidence, create `docs/BM_TRACKER_FEATURE_AUDIT.md`, and map every confirmed public feature to a MONSTIEZ implementation and test. Do not invent a feature list or claim parity without this audit.

## Data strategy

- YouTube Data API is the intended source for current public channel/video statistics. Use the uploads playlist and batched `videos.list` calls; capture your own snapshots to build history.
- Spotify Web API is for optional catalog metadata, not public lifetime/daily stream totals.
- Determine BM Tracker's actual Spotify source from public guide disclosures and browser Network activity. Evaluate public candidates such as Kworb and ChartMasters, and distinguish official Spotify Charts chart-eligible figures from full stream totals.
- Read `docs/DATA_PROVIDER_RESEARCH.md` before designing data collection.

## Resource and persistence rules

The runtime/server may disappear. GitHub is the source of truth. Commit frequently, verify remote pushes, keep `worklog.md` current, use small bounded tasks, and leave recovery instructions. Avoid required paid services, paid APIs, paid hosting or a paid database. Keep keys in GitHub secrets, never in source code.

## Verification status at handoff

The inherited starter has previously passed `node --check app.js` and a static local asset reference audit. A browser screenshot run was not completed in the previous environment because Chromium hung during startup. Re-run visual and interaction testing in Super Z; do not treat old checks as proof that all new features work.
