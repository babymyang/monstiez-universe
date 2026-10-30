# Myangni mascot kit

## Character anchor
Myangni is the original MONSTIEZ Universe chibi cat mascot. Its identifying silhouette is a round charcoal-black cat head, prominent triangular ears with warm pink inner ears, huge expressive eyes, rosy cheeks, tiny cream paws, a small crown and one floating heart. Keep the character charming, smart and mischievous rather than generic stock clip art.

## Vector source files
- `../assets/myangni.svg` — default open-eyed pose.
- `../assets/myangni-happy.svg` — closed crescent eyes.
- `../assets/myangni-sleepy.svg` — sleepy eyes.
- `../assets/myangni-excited.svg` — starry eyes.
- `../assets/myangni-love.svg` — heart-shaped eyes.
- `../assets/myangni-peek.svg` — extra-wide curious eyes.
- `../assets/myangni-wink.svg` — one playful closed wink (added 2026-10-30).
- `../assets/myangni-sad.svg` — droopy eyes with a little tear, for gentle "no results yet" moments (added 2026-10-30).
- `../assets/myangni-proud.svg` — confident half-lidded eyes and smirk, for completed goals, exports and data answers (added 2026-10-30).
- `../assets/myangni-party.svg` — closed cheering eyes, open celebratory mouth, party hat and confetti, for welcome/join celebrations (added 2026-10-30).
- `../assets/app-icon.svg` — simplified application icon.

## Live mascot system (added 2026-10-30)
The mascot is no longer a static image — `mascot.js` and `myangni-ai.js` make Myangni a living companion:
- **Expression engine** (`mascot.js`): `Myangni.face(el, name)` swaps any mascot `<img>` to a named expression; `Myangni.react(el, name, hold)` shows an expression briefly and reverts. All ten expressions are preloaded.
- **Floating buddy**: Myangni floats above the bottom nav on every screen except Welcome, blinks/looks around on an idle loop, and shows speech bubbles. Tapping the buddy opens the chat.
- **Event reactions** (wired in `app.js`): joining (party), saving a clip (love/wink), completing a goal (excited), un-completing (wink), favoriting a member (love), exporting data (proud), resetting (sleepy), plus one-time per-session tips on first visit to each screen (including the tracker detail view).
- **Empty-state faces**: a MutationObserver injects a small expression-matched mascot into every `.empty-state` (peek for Discover/detail, sleepy for Calendar, proud for Stats, wink for Home, sad for Member corners with no tracked mention yet).
- **Welcome/hero life**: the Welcome art cycles through expressions; the Home hero mascot occasionally reacts.
- **Ask Myangni chat** (`myangni-ai.js`): a fully local, rule-based fan assistant (no cloud, no accounts, no paid APIs). It answers questions about the seven members and the group (fan-maintained, hedged), explains app features, cheers you up, and navigates to any screen. **It also reads `MONSTIEZ.store` directly**: ask "how many views does WE GO UP have?" or "SHEESH streams" and it quotes the latest dated snapshot from `data/series/*.json` with its source and unit caveats — numbers are never invented, and it always labels third-party sources (bm-tracker public API, Kworb) as such. Chat history (last 40 messages) is kept in localStorage. Entry points: the floating buddy, the ✦ topbar button, and the "Ask Myangni" option in My Baemon space. Bottom sheet on mobile, side panel ≥760px; dark-theme styles included.
- Reduced-motion users get no idle animation cycles (`prefers-reduced-motion` respected).

The SVGs are editable code, not flattened screenshots. The agent should visually render and refine these SVGs, then add more variants with shared proportions and tokenized colors. Keep outlines sufficiently thick to read at small mobile sizes, maintain high contrast, and provide `alt` text or `aria-hidden="true"` depending on whether each use is decorative.

## Look-and-feel tokens
- Page background: `#FFF4FA` / near-white pink gradient.
- Primary pink: `#FF4F9A`.
- Ink: `#24232F`.
- Lavender: `#8D72D9`.
- Pale surface: `#FFFFFF`.
- Mint accent: `#19B995`.
- Warm yellow accent: `#FFB83F`.
- Rounded cards: around 17–25px radius; welcome hero can be around 30–38px.
- UI style: gentle, friendly, layered card surfaces; avoid dense admin-dashboard austerity.

`mascot-and-ui-reference.jpg` is a visual style/expression reference. `ui-reference-four-screens.jpg` is a layout reference. Neither reference image is an actual screen implementation: all text, charts, tabs, cards, and navigation need to be real interface elements.
