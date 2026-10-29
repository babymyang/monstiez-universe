# UI RESEARCH — Audit of the user's GitHub repositories

**Purpose:** extract reusable UI/UX engineering patterns from repos under `bilal140202`, `ansaribilal14`, and `superz1402` (per brief §A5) to raise MONSTIEZ Universe's implementation quality. **Licensing:** general patterns and lessons only — no code, assets, or branding copied. Several audited repos carry no license (all-rights-reserved by default).

**Method:** `api.github.com` was rate-limited during the audit, so repos were inspected via `github.com/<user>/<repo>` HTML (branch + HEAD SHA) and `raw.githubusercontent.com/.../HEAD/...` file fetches. SHAs below are the `currentOid` of `main` at fetch time. Everything reported was read directly from fetched files unless marked *inferred*.

---

## 1. ansaribilal14/tabit-android — Kotlin Jetpack Compose habit tracker

- **SHA:** `85fc1a89b186f3a1c94941bae21312506dd5dff3` · Kotlin/Compose M3 · **no LICENSE/README**
- **Architecture:** feature-first — `core/{db,di,theme,utils}` + `feature/{charts,habitform,onboarding,settings,table,today}`; thin `navigation/AppNavigation.kt` with a `sealed class Screen(val route)`.
- **Tokens:** `core/theme/Color.kt` defines complete light+dark M3 pairs (`md_primary_light #006B5E` / `md_primary_dark #5CDBC2`, all on-colors). Theme applies dynamic color on Android 12+ with fixed-scheme fallback.
- **States:** `TodayScreen.kt` verified — `isLoading` → centered spinner; empty → centered title + muted next-action hint; list keyed by id with `animateContentSize`.
- **Lessons:** feature-first layout with thin navigation layer; loading/empty/content triad as a top-level screen branch; token pairs defined once.
- **Avoid:** hardcoded user-facing strings inline in composables; zero test targets.

## 2. ansaribilan14 correction — ansaribilal14/EchoID-Android — Compose music app

- **SHA:** `00f212915c3d2b5ca61b2915d59a4fd7ed29c773` · Kotlin/Compose M3 · **no LICENSE/README**
- **Tokens (richest of set):** `theme/Color.kt` — brand + dark surfaces + **10 genre colors** + glass alphas; `Shape.kt` (4/8/12/16/24dp); `Type.kt` — 15-style full scale with explicit line heights (32→10sp).
- **Navigation:** 5-tab bottom bar; hidden on non-top-level routes (`showBottomBar` from back-stack hierarchy).
- **States:** skeleton shimmer components (`ShimmerSongCard`) live next to the real component — skeleton-over-spinner.
- **Lessons:** **member-color semantic map** (genre map → each BABYMONSTER member gets one pastel accent token); token files split Color/Shape/Type; skeletons shaped like real content.
- **Avoid:** default purple `#6C63FF` "AI-generated look"; hardcoded `Color(0xFFFF6B9D)` tint inside a component; placeholder route shipped in nav.

## 3. bilal140202/ahyeon-vision-v2 — BABYMONSTER fan dossier (closest domain match)

- **SHA:** `7492efd6306208adec5c51e87b490324ab40f2b4` · deploy-only GitHub Pages mirror (build output; *inferred* React SPA) · **no LICENSE**
- **Identity line (README, verbatim):** *"bone paper, broadcast crimson + signal lime, Syne / Hanken Grotesk / Martian Mono."*
- **Tokens (verified in compiled CSS):** semantic layer over shadcn HSL — `--paper #f2f0ea`, `--ink #131114`, `--red #e0281b` + `--red-wash` alpha, hairline tokens `--line rgba(19,17,20,.16)`, font trio display/body/mono, `--radius: 0rem`.
- **Hygiene:** every mp4 has a `-poster.jpg`; content-hashed assets; `ahyeon-og.jpg`, `robots.txt`, `404.html`, `_redirects`.
- **Lessons:** write the design identity as one canonical sentence in the README; paper/ink/accent/hairline semantic tokens; typed community-feedback flow with review-before-publish.
- **Avoid:** sharp-corner-only affordances (`--radius: 0`); source-only-in-build-output.

## 4. ansaribilal14/design-showcase — Next.js data-driven gallery

- **SHA:** `5d6bc7664da2ee53eacb3671f613dd10db4d851a` · **Next.js 16.1.1 / React 19 / Tailwind 4** (same stack family as MONSTIEZ; earlier "Next 14" labels are wrong) · **no LICENSE**
- **Pattern (verified):** `src/data/designs.json` (68 designs with per-entity `tokens{light,dark}`) + `generateStaticParams` SSG detail pages + per-slug `generateMetadata` + dynamic OG-image route (1200×630) + not-found fallback UI.
- **Lessons:** content-as-JSON + SSG is the right shape for member/content galleries; per-entity token objects; cheap per-page OG images.
- **Avoid:** vendoring all 48 shadcn components when a fraction is used; shipping UI without README/LICENSE.

## 5. superz1402/agent-ui-playbook — UI quality standard (MIT) ⭐ adopt as review gate

- **SHA:** `a7c62f420b4222251540c6e3798947f4368665c3` · docs-only · **MIT (verified)**
- **Key laws verified:** 1 identity from tokens, not components; 2 color never carries meaning alone; 3 every async surface ships loading+empty+error first (error = what+why+next action); 6 tabular numerals + monospace identifiers; 9 one loud thing per screen; **10 touch targets ≥44px on mobile web**; 11 no emoji as UI icons; 12 honest states, no dark patterns.
- **Working rules verified:** typecheck+lint+build green, then exercise the real flow; **"screenshot before and after every UI change — a UI change without a before/after didn't happen."**
- **Anti-pattern catalog ("the AI-generated look"):** purple/indigo gradients + glassy cards + glow shadows; happy-path-only screens; emoji iconography; dark-mode bolt-on.

## 6. bilal140202/momotts (+ momostack) — static product sites (MIT)

- **SHA:** `ebdbf31581a4f169ee3ae4d2bdb9c2addb445dc0` (momotts) / `baa348b5cf17bc1c2630668e07094300d4baf8a0` (momostack) · **MIT (both)**
- **Tokens (verified in `assets/css/main.css`):** paper-and-ink system with **accent hue + `-tint` alpha variants** (`--pink #FF2E93` + `--pink-tint`), `--radius-card 18px`, `--radius-pill 999px`, named shadows, **motion tokens** (`--ease-out cubic-bezier(0.22,1,0.36,1)`), font trio.
- **Governance:** `AGENTS.md` house rules protecting product facts ("never invent versions, byte sizes…"), link policy, SECURITY.md, CHANGELOG.
- **Lessons:** warm paper/ink + accent-with-tint is the **direct template for MONSTIEZ's pastel-pink system**; motion as CSS variables; mascot as brand anchor; AGENTS.md as fact-guardrail.

## 7. ansaribilal14/zerium-browser — Java Android browser (skim)

- **SHA:** `f9568187e9522926e8b358f10d21f33d6501eabd` · **GPL-3.0 (verified)** · docs-first hygiene (ARCHITECTURE/PRIVACY/ROADMAP docs, full governance set, release CI). **Lesson:** docs-first repo hygiene + release CI.

## 8. bilal140202/Your-Files-Redesign — Kotlin Android file cleaner (skim)

- **SHA:** `c54b23051b6e5693ca01b65fd5873a021d04fbb5` · **MIT (verified)** · ships in-repo screenshots + "readiness report" docs as QA/release trail. **Lesson:** committed screenshot trail for UI QA.

---

## Cross-cutting lessons adopted for MONSTIEZ Universe

1. **Three-layer token system in CSS vars** (momotts + ahyeon): semantic base (`paper/ink/line` equivalents), accent hues with `-tint` alpha variants, component tokens (radius/shadow/motion) — all in `globals.css` under Tailwind 4 `@theme inline`.
2. **Member-color semantic map** (EchoID genre map): each of the 7 members maps to one pastel accent token, always paired with a text label (color never carries meaning alone).
3. **States triad as a screen contract** (tabit + playbook Law 3): loading = skeleton shaped like the real row; empty = centered title + next-action hint; error = what/why/next action. Applies to feed, stats, member content, search.
4. **Type scale as a full token file with line heights** (EchoID Type.kt) + display/body font pair + tabular numerals for metrics (playbook Law 6).
5. **Navigation shape:** persistent 5-destination bottom bar on top-level routes, back-header detail routes, one loud thing per screen, ≥44px touch targets.
6. **Content-as-JSON + SSG** (design-showcase): `data/*.json` with provenance fields; member pages statically generated per slug; per-page metadata.
7. **Process guardrails:** screenshot before/after every UI change; `AGENTS.md` fact-guardrails; honest states (playbook Law 12) — which directly enforces this project's no-fabricated-data rule.

## Anti-patterns explicitly avoided

1. Purple/indigo-gradient + glassy-card + glow default — MONSTIEZ defines its own pastel-pink base.
2. Emoji as UI icons — lucide icons only (decorative hearts/stars are SVG illustrations, not functional icons).
3. Happy-path-only screens and dead-end errors — every data surface has loading/empty/error/offline/stale states.
4. Dark mode as a bolt-on — v1 ships light-only tokens (documented decision; structure allows a second token column later).
5. Hardcoded colors/strings inside components — everything user-visible goes through tokens/data files.
6. Shipping without README/LICENSE — both included in this repo.
