# SCREEN INVENTORY — the four reference screens

Source of truth: the mockup (four 390-logical-px phone frames). This inventory maps every region of each screen to the component that implements it. Screens are real navigable pages — never a flattened image.

## A · Welcome — route `/` · `src/app/page.tsx` + `components/welcome/*`

| Region | Spec | Component |
|---|---|---|
| Canvas | gradient wash `#FBE3EF → #F3E8FC → #FFF9FC`, no header/nav | `.welcome-canvas` |
| Decorations | floating crown + sparkles + hearts + star doodles (SVG, gentle float animation, reduced-motion aware) | `Doodles` |
| Wordmark | "MONSTIEZ" Baloo 2 800, pink fill + navy stroke + white outer (text-stroke + layered shadow); "universe" beneath in lilac-purple italic rounded | `Wordmark` |
| Tagline | "YOUR BABYMONSTER CORNER ♡" letterspaced 800 caps + heart SVG | `p` |
| Mascot | original chibi dark kitten SVG (~180px), lower-middle, speech bubble "♡" + "BAEMON" doodle | `Mascot` (`components/mascot/`) |
| Body copy | "Discover · Track · Celebrate / Everything BABYMONSTER in one place." | `p` |
| CTA | dark navy pill "Join MONSTIEZ →" → `/home`; never implies registration | `Link` |
| Dots | 3 functional onboarding slides (promise / track / celebrate) — tap dots or swipe; slide 1 matches mockup copy | `WelcomeCarousel` |
| Disclaimer | "A fan-made app for MONSTIEZ ♡" micro text | footer line |
| Photography | none | — |

## B · Home — route `/home` · `src/app/home/page.tsx`

| Region | Spec | Component |
|---|---|---|
| Header | wordmark lockup left; search + bell icon buttons right (bell shows dot only when local reminders exist) | `HomeHeader` |
| Chips | All / Videos / News / Events / For You — selected = accent pink pill, functional filter over feed | `ChipRow` |
| Feature card | blush card: chip "WORLD TOUR" · big "D-9" countdown (ONLY when a verified upcoming date exists — live-computed to next verified tour stop; otherwise "No upcoming date confirmed") · date line with KST note · mascot art · chevron → `/events` | `CountdownCard` |
| Quick actions | 4 white cards: Latest Videos / Milestones / Schedule / Members with pastel icon tiles → real routes | `QuickActions` |
| Latest from BABYMONSTER | section header + "See all" → `/discover`; 2 horizontal video cards (thumbnail w/ duration badge + fallback cover, title, meta "Official · n views · age" only when sourced) | `SectionHeader` + `VideoCard` |
| Trending Now | numbered rows 1/2 with cover art, title, artist, metric ONLY if source-backed; else no metric | `TrendingRow` |
| Bottom nav | Home (pink active) / Discover / Stats / Events / My Baemon — persistent on B/C/D | `BottomNav` |

## C · Stats — route `/stats` · `src/app/stats/page.tsx`

| Region | Spec | Component |
|---|---|---|
| Header | back chevron + centered "Stats" | `ScreenHeader` |
| Segmented tab | YouTube / Spotify — real state switch | `SegmentedTabs` |
| Feature card | artwork slot + "WE GO UP" + BABYMONSTER + "Music Video" chip + official-link chip; per-tab content | `FeatureTrackCard` |
| Primary metric | real observed view count from `metric-snapshots.json` + observedAt label + source link; `—` if none | `PrimaryMetric` |
| Secondary ×4 | mockup layout; values only when sourced — otherwise "—" + "Not publicly available" | `StatCard` |
| Growth chart | filters 7D/30D/90D/All; renders ONLY with ≥2 dated observations of same metric; else designed empty state "History starts when we begin recording snapshots."; tooltip + tabular-nums axes | `GrowthChart` (custom SVG) |
| Milestones | rows with state pills Achieved (mint) / In progress (butter) / Not verified; progress bar only for sourced partials; "See all" → `/stats` anchors | `MilestoneRow` |
| Spotify tab | curated tracks/albums + official Spotify links + honest banner "Stream counts are not available in this version." | `SpotifyPanel` |

## D · Member detail — route `/members/[slug]` · `src/app/members/[slug]/page.tsx`

| Region | Spec | Component |
|---|---|---|
| Header | back chevron + centered "Members" | `ScreenHeader` |
| Selector | horizontal 7 chibi kitten avatars (RUKA…CHIQUITA) + name labels; selected = pink ring + scale; tap switches member (client nav, same template) | `MemberSelector` |
| Profile card | left: portrait slot (original member kitten SVG; no official photos) · right: name, hangul label if verified, heart (bias toggle, persists), derived pills (birth-date-derived zodiac "derived" label, lineup #), verified facts list (Born — sourced), signature doodle | `ProfileCard` |
| Tabs | Profile / Content / Moments / Quotes — real tab state | `ProfileTabs` |
| Filters | All / MV / Performance / Variety / Shorts — filter the member's content list | `FilterChips` |
| Content list | official items: thumbnail w/ duration + fallback, title, member tag, type, published-age only if sourced, external official link, bookmark toggle | `MemberContentRow` |
| Empty states | Moments/Quotes with no sourced material → friendly empty card ("Curated from official sources only — nothing verified yet.") | `EmptyState` |
| Facts policy | only verified facts render; nothing invented (no MBTI/quotes/activity figures) | data-driven |

## Shared

`BottomNav` (5 routes, aria-current, 44px targets) · `ScreenHeader` · `ChipRow` · `SectionHeader` · `SourceBadge` (source URL + observedAt) · `Thumb` (img + gradient fallback) · `EmptyState` · `SafeArea` wrapper (env(safe-area-inset-*)) · `Wordmark`.
