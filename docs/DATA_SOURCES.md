# Data Sources Register — MONSTIEZ Universe

This is the live register to complete during implementation. The browser audit of BM Tracker must verify its actual upstream providers; no source below is asserted to be BM Tracker's source until direct evidence exists.

## Current status

No provider is wired into the starter yet. Its content cards and chart are sample/illustrative UI. The initial Super Z session must update this file after it has tested each source from the actual runtime.

## Provider candidates

| Data category | Candidate | Type | What it may supply | Current status | Checks before automation |
|---|---|---|---|---|---|
| YouTube channel/video public stats | YouTube Data API | Official API | Current public channel/video counts and metadata | Approved candidate; not yet configured/tested in this starter | Quota, API key restriction, channel ID, missing/hidden fields, caching |
| Spotify catalogue metadata | Spotify Web API | Official API | Artist, album, track metadata and Spotify URLs | Optional candidate; not yet configured/tested | Current developer mode and endpoint access, Premium requirement, OAuth/client secrets, deprecation, attribution |
| Spotify daily/cumulative song streams | Kworb | Third-party public data aggregator | Public BABYMONSTER song totals and daily stream figures | Research candidate only; not confirmed as BM Tracker's provider | Terms/robots, reuse permission, rate limits, update cadence, parser stability, attribution |
| Spotify streams/trends | ChartMasters | Third-party music data aggregator | Publicly displayed track total/daily figures, selected trends and charts | Research candidate only; some functions may be gated | Terms, export/data restrictions, access, update cadence, attribution |
| Spotify charts | Spotify Charts | Official chart source | Chart-eligible daily/weekly counts by chart/market where available | Candidate for chart-specific metrics only | Chart windows/markets, filtered stream definition, permitted reuse, attribution |
| Historical snapshots | Our own collector | First-party project data | Daily history for all metrics we collect from go-live onward | Planned | Scheduled execution, integrity checks, storage and date handling |
| Manual fallback | User/community-entered snapshot | User-provided data | A dated metric where automated source unavailable | Planned | Source URL, observation date, unit, submitter/provenance and validation |

## Required provider record template

- Provider name:
- Data category and metric types:
- Source URL / API endpoint / repository:
- Official or third-party:
- Access method tested:
- Sample request or page inspected (without credentials):
- Response fields and units:
- Collection timestamp and source update date:
- Terms / licensing / attribution notes:
- Robots guidance / automation conditions:
- Quota, rate limit and polling interval:
- Historical coverage:
- Cache and last-known-good behaviour:
- Known failure modes:
- Fallback behaviour:
- Runtime test result:
- Evidence link / screenshot / commit:

## Design requirements

- Every displayed metric must identify its provider and source URL, observation/collection date, unit and scope.
- Distinguish official API metadata, third-party stream numbers, Spotify chart-eligible streams, manual snapshots and demo/sample data.
- Do not present Spotify Web API popularity as Spotify stream count.
- Do not present YouTube current counts as historical counts; create dated snapshots.
- Cache last-known-good data and display stale state if refresh fails.
- Keep provider adapters replaceable; the UI must not depend on one upstream service.
- Avoid aggressive polling and do not store credentials or private user data in the repository.

See `DATA_PROVIDER_RESEARCH.md` and `BM_TRACKER_REVERSE_ENGINEERING_PLAN.md` for the detailed technical plan.
