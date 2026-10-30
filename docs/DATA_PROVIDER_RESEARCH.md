# Data Provider Research — MONSTIEZ Universe

**Research snapshot date:** 30 October 2026. Confirm again before deployment.

## Executive summary

- **YouTube public channel/video metrics:** use YouTube Data API when the owner configures a Google API key. It's the most defensible primary provider for public current counts and video metadata.
- **YouTube historical charts:** collect our own dated snapshots. Public Data API values are current snapshots; they do not reconstruct old public view counts.
- **Spotify catalog metadata:** optional Spotify Web API integration can provide catalog metadata when authorized and available under the current developer mode. Protect credentials and attribute Spotify content correctly.
- **Spotify raw streams:** do not claim these come from Spotify Web API. The official public Web API does not expose public lifetime or daily track stream totals. Candidate public sources include Kworb and ChartMasters, after checking their use terms/automation conditions. Spotify Charts provide chart-eligible counts for chart windows, not necessarily global lifetime totals.
- **BM Tracker's actual Spotify source:** unknown until its browser Network activity or guide explicitly proves it. The agent must investigate the live site; never infer a provider just because the UI says Spotify.

## YouTube Data API

### What it can do

- Retrieve public channel metadata and statistics via `channels.list`.
- Retrieve uploads playlist IDs through channel `contentDetails`.
- Retrieve video metadata and public statistics via `videos.list`.
- Retrieve uploads playlist items through `playlistItems.list`.
- Batch known video IDs to reduce request counts.

### Quota

Google's current quota reference documents a default allocation of 10,000 units/day for most methods and a separate 100-calls/day default bucket for `search.list` and `videos.insert`. `channels.list` and `videos.list` currently cost 1 unit per call. Quota resets at midnight Pacific Time. Avoid routine search calls; discover the channel once and use its uploads playlist thereafter.

### Limitations

- Current public `viewCount`, `likeCount`, `commentCount`, subscriber count and metadata may be returned depending on visibility/policy.
- Subscriber display may be rounded/hidden.
- The API does not return old daily view counts. Our scheduled collector must store daily snapshots to draw our own history.
- YouTube Analytics API is tied to an authorized channel owner's/manager's account; it cannot provide the official BABYMONSTER channel's private analytics to our public tracker unless the channel owner explicitly authorizes access.

### Recommended implementation

1. Configure the official channel ID once.
2. `channels.list(part=snippet,statistics,contentDetails)` to obtain uploads playlist and current channel stats.
3. `playlistItems.list` to enumerate recent uploads.
4. `videos.list(part=snippet,statistics,contentDetails&id=...)` with batches of video IDs.
5. Save current JSON + dated snapshots, include `collectedAt`, source URL, video ID, and field availability.
6. Schedule conservative daily collection and cache results. Add a manual workflow run for troubleshooting.

## Spotify Web API

### What it can do

- Public catalog metadata for artists, albums and tracks through supported endpoints.
- Spotify IDs, canonical Spotify links, titles, release metadata and artwork where provided.
- Some response fields exist but are deprecated, including artist `followers` and `popularity`, and track popularity. Don't design the product around these as guaranteed primary metrics.

### What it does not provide for this use case

- No standard public endpoint field for an artist's or track's all-time global stream total.
- No general public historical daily stream-count series for another artist's tracks.
- User-specific top items and personal listening data require user OAuth and scopes; this does not solve public artist stream tracking.

### Current developer-mode considerations

Spotify's February 2026 update introduced a Premium requirement for development mode, a five-authorized-user cap and limited API access. The July 2026 quota update raised the developer account's Client ID cap to 25 and moved development-mode quota counting to the developer account across its apps. Check the latest quota/migration docs at setup time; do not assume a hobby app has unrestricted public multi-user API access.

### Appropriate use

Use the Web API optionally for metadata and verified Spotify links, not for stream counts. Any Spotify artwork/metadata must be displayed with Spotify attribution/linking and in line with current Spotify developer policy. Keep secrets server-side.

## Spotify raw-stream candidates

These are third-party aggregators. The values they display are not direct Spotify Web API responses and must not be described as official API totals.

### Kworb

- BABYMONSTER song totals/daily streams: https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS_songs.html
- BABYMONSTER chart history: https://kworb.net/spotify/artist/1SIocsqdEefUTE6XKGUiVS.html
- The songs view displayed total and daily streams and a page last-updated date in the 30 October 2026 research snapshot. The history view states the totals shown there cover time spent in the Top 200; do not conflate chart history totals with catalog lifetime totals.
- Before automation: inspect site terms and robots guidance, check stability and page update cadence, identify any provider contact/use policy, and avoid aggressive polling. Use cache and bounded requests.

### ChartMasters

- BABYMONSTER artist dashboard: https://chartmasters.org/artist/babymonster/
- The public page exposes top track total/daily Spotify figures, some trends, and an export affordance in the 30 October 2026 research snapshot. Some functionality may be limited/gated.
- Before automation: assess public availability, terms, rate limits, export restrictions, attribution and whether the page data can be reused. Do not use paid/gated data as a free dependency.

### Official Spotify Charts

- Spotify chart counting explanation: https://support.spotify.com/artists/article/understanding-spotify-charts/
- Spotify says chart stream numbers use a filtering formula and not every stream is eligible; chart counts may differ from Spotify for Artists.
- Use these numbers only as chart-eligible streams for the chart/date/market shown. They are not the same as full public lifetime streams.

## BM Tracker provider investigation

Do not claim its Spotify provider until browser evidence exists. During the user-guide and main-site audit:
1. Open each Spotify view and reload with Network → Fetch/XHR.
2. Record the first-party requests and third-party request domains.
3. Check whether first-party endpoints return normalized Spotify metrics.
4. Check whether outbound requests call Spotify APIs, public charts, aggregators or another service.
5. Compare response fields with the visible metric names and units.
6. Inspect the user guide for explicit provider disclosure.
7. Record the confidence of each conclusion.

## Source and method labels for the app

Use explicit labels such as:
- `YouTube Data API · current public statistics`
- `Spotify Web API · catalog metadata`
- `Kworb · third-party public stream figures`
- `ChartMasters · third-party stream figures`
- `Spotify Charts · chart-eligible streams`
- `Manual snapshot · user entered`
- `Sample data · demo only`

Every displayed metric should provide a source link, observation/collection date, unit/scope, and stale/error state where appropriate.

## Official references

- YouTube quota calculator: https://developers.google.com/youtube/data/determine_quota_cost
- YouTube videos.list: https://developers.google.com/youtube/v3/docs/videos/list
- YouTube channels.list: https://developers.google.com/youtube/v3/docs/channels/list
- YouTube Analytics OAuth: https://developers.google.com/youtube/analytics/guides/authorization/server-side-web-apps
- Spotify API calls: https://developer.spotify.com/documentation/web-api/concepts/api-calls
- Spotify get artist: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
- Spotify get track: https://developer.spotify.com/documentation/web-api/reference/get-track
- Spotify quota modes: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify developer access update (February 2026): https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
- Spotify quota update (July 2026): https://developer.spotify.com/blog/2026-07-23-web-api-quota-updates
- Spotify chart counting: https://support.spotify.com/artists/article/understanding-spotify-charts/
