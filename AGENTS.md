# AGENTS.md — MONSTIEZ Universe working rules

Unofficial BABYMONSTER fan companion PWA. **Fan-made; not affiliated with or endorsed by YG Entertainment or BABYMONSTER.**

## Hard constraints (violating any of these is a failed task)

1. **No paid APIs, no API keys, no secrets in the repo or client bundle.** `.env` is never committed; `.env.example` holds placeholders only.
2. **No unauthorized scraping.** Permitted source: the official channel's public RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id=<VERIFIED_ID>`) fetched at build/refresh time only. Never extract view counts from YouTube/Spotify pages with bots, never reverse-engineer private endpoints, never bypass rate limits or bot protections.
3. **No invented data.** Every metric needs `sourceUrl` + `observedAt` (manual public observation). Charts render only with ≥2 dated observations of the same metric. Missing data → designed empty/`—` state, never a plausible-looking number. No fabricated views, likes, streams, dates, quotes, bios, birthdays, MBTI.
4. **Media licensing.** Original SVG illustrations/mascot only. No official logos, no rehosted photos/videos. YouTube thumbnails only with attribution + official link context, with graceful fallback covers. Prefer official embed/link-out.
5. **Provenance or it doesn't ship.** Content records carry `sourceUrl`, `verifiedAt`, `status` (`verified` | `needs_review`). Validators reject placeholder values (e.g. `value: 0`) and unverified release dates before production build.
6. **Demo fixtures are dev-only** and must be impossible to enable in production builds.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (heavily customized — no stock template look) · lucide-react · custom SVG charts (bundle-light) · no Prisma/DB/auth in MVP (static-first PWA, localStorage for preferences).

## Design system rules

- Tokens in `src/app/globals.css` + `src/lib/design-tokens.ts` — never style pages independently.
- Palette: cotton-candy `#F6CDE0`, accent `#FF4F9A`, lilac `#DCD3FA`, mint `#CBEFDF`, buttercream `#FFE7AE`, cloud `#FFF9FC`, ink `#38293A`, dark CTA `#202333`.
- Cards 16–24px radius, pill chips, 8px spacing scale, soft shadows, no heavy glass/blur.
- Rounded sans (Nunito Sans, self-hosted OFL woff2) + rounded icon family (lucide). Touch targets ≥44px. Respect reduced motion + safe areas. No horizontal overflow at 320/360/390/430px.

## Git discipline

- Commit small & coherent; message references the issue, e.g. `feat(stats): snapshot empty state (#5)`.
- Push + verify remote after every task; update `WORKLOG.md` (append, never truncate).
- Never force-push, reset, or discard unrelated work. Never commit `upload/`, `handoff-extract/`, `download/`, `.env`, `dev.log`, build output.
- Full recovery procedure: `docs/SESSION_RECOVERY.md`.
