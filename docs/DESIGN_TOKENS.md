# DESIGN TOKENS — MONSTIEZ Universe

**Identity line:** *cotton-candy pastel pink on cloud white, ink-berry text, chunky rounded cards, Nunito Sans + Baloo 2 display, a dark-navy kitten mascot, and one loud accent — MONSTIEZ pink `#FF4F9A`.*

Derived from the reference mockup (`a_wide_clean_pastel_ui_mockup_scene_showing_four.png`) and implemented in `src/app/globals.css` (`@theme inline`) + `src/lib/design-tokens.ts`.

## Palette

| Token | Value | Usage |
|---|---|---|
| `--cotton` | `#F6CDE0` | cotton-candy pink — canvas washes, feature cards |
| `--accent` | `#FF4F9A` | MONSTIEZ pink — selected chips, nav, rings, progress |
| `--accent-tint` | `rgba(255,79,154,.12)` | soft pink wash (momotts `-tint` pattern) |
| `--lilac` | `#DCD3FA` | secondary accent (milestones icon, gradients) |
| `--mint` | `#CBEFDF` | schedule/success accents |
| `--butter` | `#FFE7AE` | star/member accents |
| `--cloud` | `#FFF9FC` | app background |
| `--surface` | `#FFFFFF` | cards |
| `--ink` | `#38293A` | primary text (ink berry) |
| `--ink-soft` | `#6E5A70` | secondary text (readable muted mauve) |
| `--navy` | `#202333` | dark CTA, wordmark outline |
| `--hairline` | `rgba(56,41,58,.08)` | borders (ahyeon-vision hairline pattern) |
| `--danger` | `#E0284B` | notification dot only |

Contrast notes: `--ink` on `--cloud` = 11.4:1 ✓; `--accent` used for text only at ≥14px bold on white (3.05:1 — decorative/labels only; body text never pink-on-white); white on `--navy` = 15.9:1 ✓; white on `--accent` = 3.3:1 (used ≥14px semibold, chips/CTA-scale only).

## Member accents (color + label always paired — playbook Law 2)

| Member | Accent | Tint | Derived avatar |
|---|---|---|---|
| RUKA | `#3E3A45` | `rgba(62,58,69,.10)` | charcoal kitten, lilac bow |
| PHARITA | `#F2B8CF` | `rgba(242,184,207,.16)` | cream kitten, butter flower |
| ASA | `#A8C6F2` | `rgba(168,198,242,.16)` | ice-blue kitten, star clip |
| AHYEON | `#FF4F9A` | `rgba(255,79,154,.12)` | pink kitten, crown |
| RAMI | `#CBEFDF` | `rgba(203,239,223,.20)` | mint kitten, heart clip |
| RORA | `#C9B8F5` | `rgba(201,184,245,.16)` | lavender kitten, star |
| CHIQUITA | `#FFC66E` | `rgba(255,198,110,.16)` | peach kitten, cherry bow |

## Typography

- **Display (wordmark, big numbers):** Baloo 2 (OFL, self-hosted woff2) — weights 700/800.
- **Body/UI:** Nunito Sans (OFL, self-hosted woff2) — 400/600/700/800/900.
- Fallback stack: `ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manrope, system-ui, sans-serif`.
- Scale (rem): display-xl 2.5/1.1 · display 1.75/1.2 · title 1.25/1.3 · body 0.9375/1.45 · label 0.8125/1.2 · micro 0.6875/1.2 (min 11px, never below).
- Numerals: `font-variant-numeric: tabular-nums` on all metrics (playbook Law 6).

## Shape, space, elevation, motion

- Radius: `--r-sm 12px · --r-md 16px · --r-lg 20px · --r-xl 24px · --r-pill 999px`.
- Spacing: 8px scale (4/8/12/16/20/24/32). Card padding 16–20px. Screen gutter 20px.
- Shadow: `--shadow-card 0 6px 20px rgba(56,41,58,.06)` · `--shadow-lift 0 12px 32px rgba(56,41,58,.12)` (no glow shadows — playbook anti-pattern).
- Motion: `--ease-out cubic-bezier(0.22,1,0.36,1)`; durations 150/250/400ms; all wrapped in `@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none } }`.
- Touch targets: ≥44×44px for all interactive controls.
- Max content width 430px, centered, no horizontal overflow at 320px (verified in QA).
