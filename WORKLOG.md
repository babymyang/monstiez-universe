# WORKLOG — MONSTIEZ Universe

**Project goal:** Build the working installable PWA "MONSTIEZ Universe" (unofficial BABYMONSTER fan companion) per `MONSTIEZ_Universe_Super_Z_Build_Brief.md` (v1.1). Four reference screens (Welcome / Home / Stats / Member detail), no paid APIs, no API keys, no unauthorized scraping, no invented statistics. Visual target: `a_wide_clean_pastel_ui_mockup_scene_showing_four.png` (kept out of repo per licensing caution; local reference at `handoff-extract/`, ignored by git).

**Durable repo:** https://github.com/babymyang/monstiez-universe (branch `main`)
**Workspace:** `/home/z/my-project` (ephemeral server — GitHub is source of truth)

---

## 2026-10-29 — Session 1 (checkpoint A)

**Issue IDs:** #1–#8 (foundation set; see below)
**Completed:**
- Inspected runtime: Node v24.22.1, bun 1.3.14, git 2.47.3, Next.js 16 scaffold at `/home/z/my-project` (port 3000, auto dev server).
- Extracted handoff zip → confirmed mockup image `a_wide_clean_pastel_ui_mockup_scene_showing_four.png` (1572×856, 4 phone screens at ~390px logical width).
- Enumerated research accounts: `bilal140202` (79 repos), `ansaribilal14` (39 repos), `superz1402` (21 repos). Candidates flagged for UI audit: `tabit-android`, `EchoID-Android`, `agent-ui-playbook`, `ahyeon-vision-v2`, `design-showcase`, `zerium-browser`, `momotts`.
- GitHub token verified (user: babymyang, id 349680628). No pre-existing repos — created `babymyang/monstiez-universe` (public).
- Hardened `.gitignore`, untracked local `.env` (contained only a local SQLite path — no secrets, but removed from tracking going forward).
- Pushed baseline scaffold: commit `87ecbff` → **verified on remote**.

**Commands run / results:**
- `git push -u origin main` → PASS (new branch main pushed).
- GitHub API create repo → PASS (201).
- Dev server auto-started on :3000 → `GET / 200`.

**Known blockers:** none yet.
**Next action:** create issues #1–#8, then docs/SESSION_RECOVERY.md + AGENTS.md, then UI research audit, then data verification (YouTube channel ID + RSS + member facts), then design system + four screens.

---

<!-- APPEND NEW ENTRIES BELOW THIS LINE. Preserve all previous entries. -->

## 2026-10-29 — Session 1 (checkpoint B — full implementation)

**Issue IDs:** #2 (UI research), #3 (design tokens), #4 (four screens), #5 (data layer), #6 (PWA), #7 (QA) — see per-issue evidence below.

### Completed
- **UI research (A5):** audited 9 repos across bilal140202 / ansaribilal14 / superz1402 via HTML+raw fetches (SHA-pinned). `docs/UI_RESEARCH.md` committed (a-73186…agent run). Key adoptions: 3-layer tokens w/ accent tints (momotts), member-color map (EchoID), states triad (tabit+playbook), stretched links, screenshot-before/after rule, MIT playbook as review gate.
- **Design system (#3):** tokens in `globals.css` (@theme) + `src/lib/design-tokens.ts`; self-hosted OFL fonts (Nunito Sans var, Baloo 2 var) in `public/fonts/`; original SVG mascot + 7 member kitten avatars; shared components (BottomNav, ScreenHeader, ChipRow, SectionHeader, SourceBadge, Thumb w/ fallback, EmptyState).
- **Four screens (#4):** `/` (Welcome: 3 functional slides, CTA→/home, returning pill), `/home` (chips filter feed, verified countdown D-9 → Bangkok Nov 7, quick actions, latest w/ real thumbnails, trending w/ observed metrics only), `/stats` (YouTube/Spotify tabs, song picker, observed totals 228,252,529 / 66,334,830 w/ source, honest "—" secondary cards, growth chart w/ empty state + 7D/30D/90D/All, milestones Achieved/In-progress/Not-verified), `/members/[slug]` (7-member selector w/ ring, verified facts only, tabs Profile/Content/Moments/Quotes, filters All/MV/Performance/Variety/Shorts, bias heart, bookmarks).
- **Data layer (#5):** members/content/events/song-catalog/metric-snapshots/feed-status JSON all with sourceUrl+verifiedAt+status. Channel ID verified from official page HTML: UCqwUnggBBct-AY2lAdI88jQ. RSS endpoint BLOCKED in sandbox (HTTP 404 for all channels incl. majors) → recorded exact error in feed-status.json; refresh script implemented and correct for normal environments. 2 real manual observations recorded 2026-10-29 (WE GO UP M/V 228,252,529; DESERVE M/V 66,334,830). Validators reject placeholders (npm run data:validate → PASS, 0 errors).
- **PWA (#6):** manifest.ts (standalone, 3 icons via sharp), SW v2 (network-first pages, cache-first hashed assets, offline fallback), build-time sw-precache.json (23 assets) so FIRST visit enables offline. **Verified offline: /, /home, /stats render fully offline after one online visit.**
- **QA (#7):** vitest 25/25 PASS; eslint 0 problems; tsc 0 errors; `next build` PASS (19 routes, members SSG ×7). Screenshots at 390×844 and 320px (no horizontal overflow, all 4 screens). Side-by-side comparison artifact: scripts/qa/comparison-side-by-side.png. Interaction tests: CTA→/home PASS, welcome slides PASS, chips PASS, YouTube↔Spotify PASS, song switch PASS, member switch PASS, bookmark+bias persist across reload PASS.

### Bugs found by real browser/runtime testing (all fixed)
1. lucide-react `Bookmarks` doesn't exist → `Bookmark`.
2. `@/../../data/*.json` alias escape → added `@data/*` tsconfig path.
3. Nested `<a>` (CountdownCard) hydration error → stretched-link pattern.
4. setState-in-useEffect lint errors (Next 16 react-hooks v6) → useSyncExternalStore hooks (`src/hooks/use-preferences.ts`).
5. **useSyncExternalStore getSnapshot returned fresh object each call → infinite update loop (app crash)** → coherent snapshot cache in local-storage.ts, invalidated on events. Caught by offline test.
6. Offline shell failed: chunks not cached on first visit → SW precaches sw-precache.json at install.
7. Stale SSR cache + EADDRINUSE stale prod server caused confusing false-positive "online crash" — diagnosed and resolved (process hygiene).

### Commands & results (final state)
- `bunx vitest run` → 3 files, 25/25 PASS
- `bun run lint` → 0 problems
- `bun run typecheck` → 0 errors
- `npm run build` → ✓ compiled, 19 static/SSG routes
- `npm run start` + agent-browser → all routes 200; SW REGISTERED; manifest valid; offline PASS
- `npm run data:validate` → PASS (0 errors, 0 warnings)
- `npm run data:refresh-rss` in sandbox → BLOCKED (404; recorded, graceful)

### BLOCKED / NOT RUN
- Real-device PWA install (no Android device in sandbox) — manifest+SW verified via Chromium automation instead.
- RSS fetch in this sandbox (network-level block, documented in data/feed-status.json).
- GitHub Actions RSS workflow — left as documented next task (non-blocking, optional per brief §7).

### Commits (verified pushed)
87ecbff → 91c09cb → 0630963 → 8256fa8 → a7adf60 (+next.config commit) → 7b85e05 → final docs commit (this one).

**Open defects:** none known in code. Environment limitation: RSS blocked (fallback active).
**Next action:** optional — add GitHub Actions RSS refresh workflow; curate per-member fancam links with exact video IDs; real-device install test.
