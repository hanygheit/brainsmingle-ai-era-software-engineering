# AI-Era Software Engineering — web keynote (project memory for Claude Code)

Talk: "AI-Era Software Engineering: From Graduate Readiness to Talent Development" — Hany Saad, BrainsMingle AI Summit 2026, AI in Learning & Development track, **Mon 12 Oct 2026, 20:00 Cairo (UTC+3)**, virtual, screen-shared.
Live site: https://brainsmingle-ai-era-software-engineering.lovable.app (published from Lovable).

## How this repo is deployed
- Built in Lovable; this GitHub repo is two-way synced with the Lovable project on the default branch.
- Workflow: edit → `bun run build` passes → commit → push to the default branch → the change appears in Lovable → Hany clicks **Publish → Update** in Lovable to put it live.
- Never force-push or rewrite history (it breaks the Lovable sync).

## Stack (do not migrate)
React + TypeScript + TanStack Start + Tailwind, existing animation library, Lovable Cloud (Supabase) backend. Keep the existing structure; reuse existing code.
- Package manager: **Bun** (`bun.lock`). Use `bun install`, `bun run dev`, `bun run build`. Never commit a `package-lock.json`.
- Also read `AGENTS.md` (architecture rules: screens are pure functions of screen/phase/choice; per-screen `timeline` arrays in `src/content/screens.ts` drive the auto-play; themes in `src/deck/theme.ts`; config in `src/config.ts`).
- Never edit `vite.config.ts` plugins (the Lovable config already includes them).
- Checks before pushing: `bun run build`, `./node_modules/.bin/tsc --noEmit -p .`, `./node_modules/.bin/vitest run` (`src/deck/store.test.ts` asserts slide count, separator positions, Q&A index, 41:30 / 2:00 totals, build-time limits and that slides and sources point at each other — update it when the deck changes). Dev server: `bun run dev` → http://localhost:8080.
- Windows checkout noise: ESLint's prettier rule reports CRLF line endings (ignore, or lint with `--rule 'prettier/prettier: off'`); `src/routeTree.gen.ts` shows as modified after every build (line endings only — `git checkout` it, don't commit). Don't run prettier over whole files: it reflows the one-line-per-slide table in `screens.ts` and unrelated lines.

## Hard rules
- **No third-party services** (no Browserless, no external PDF/render APIs). PDF = `/print` route → Playwright locally → uploaded in the presenter window.
- **Never commit secrets.** The presenter PIN (4 digits) is checked only against a salted PBKDF2 hash in `src/lib/print-token.server.ts` (server-only; never put the plain PIN in the repo — to change it, replace salt + hash). The `PRESENTER_PIN` secret is no longer used. `.env` values from Lovable (Supabase URL / publishable key) are public client keys; don't add others.
- **Database:** polls use the old `poll_votes` table with added `poll_id` and `option` columns. Do NOT drop/alter the old columns or the `poll_sessions` table. Poll ids: `s2-challenge` (now "Who's in the room?" — learning / building / leading or teaching), `s7-interview`; both keep exactly 3 options (check constraint). Schema migrations only apply via Lovable, so poll open/closed state (`state/polls.json`) and feedback (`feedback/<device>.json`) live in the private `exports` bucket, written by server functions (`src/lib/poll-state.functions.ts`, `feedback.functions.ts`, `store.server.ts`). Routes: `/vote`, `/feedback`, `/results` (PIN, noindex, unlinked). See README "Live polls, feedback and results".
- **Do not change any slide wording** unless a task says so. All text, quotes and numbers are verified; every number/quote keeps its on-slide SourceTag and its `sources.ts` entry (exact article URLs, never homepages).
- No pure black anywhere.

## Config (src/config.ts)
- LINKEDIN_URL `https://www.linkedin.com/in/hanysaad` · BRAINSMINGLE_URL `https://brainsmingle.com/hanysaad` · PRESENTATION_URL `https://brainsmingle-ai-era-software-engineering.lovable.app`
- PDF_FILENAME `AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf`
- Speaker: Hany Saad · Senior Software Engineering Manager · ITWorx · AI & Software Engineering Expert · ITI (text only, no logos)

## Design system
- **Stage theme (navy)** — lobby, cold open, title, separators, contract, Q&A, closing, presenter window, /vote: bg `#0F1B33` + soft radial glow `#1A2C52` upper-left; surface `#172744`; line `#2B3D63`; text `#F4F2EC`; muted `#AEB8CC`.
- **Content theme (warm paper)** — content slides and /blueprint: paper `#F7F6F2`, card `#FFFFFF`, rule `#E3E1DA`, ink `#14161C`, muted `#5B616E`; faint ArcMotif watermark top-right (~6%); 4 px act-colour line at top. Act colours (stop 02–07): 1 `#2563EB`, 2 `#0E9F6E`, 3 `#BE185D`, 4 `#B7791F`, 5 `#7C3AED`, 6 `#DC2626`; on navy `#8AB6FF`, `#5EE6AA`, `#F9A8D4`, `#F6C35C`, `#B9A2FF`, `#FF8A80`. Stop 01 (Opening) uses the own green. `stopColors(stop)` in `src/deck/theme.ts`.
- Code/terminal panels on paper: slate `#1B2540`, text `#F4F2EC`.
- Framework colours — fills: delegate `#8E97AB`, direct `#4C8DFF`, validate `#F2B33D`, own `#3DDC97`. Text on paper: delegate `#5B6478`, direct `#2563EB`, validate `#9A6516`, own `#0B7A55`. Text on navy: `#B4BCCD`, `#8AB6FF`, `#F6C35C`, `#5EE6AA`. All text ≥ 4.5:1 contrast.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code), self-hosted.
- Stage: fixed 1920×1080 canvas scaled to fit. Fullscreen (F / F11): edge to edge, letterbox bars use the slide's own background. Windowed: "stage room" — navy `#0B152B` backdrop, slide framed (rounded, lit, act-tinted ambient glow), branded header with Present button, docked controls in the footer (`src/deck/useFullscreen.ts`, `RoomHeader`/`RoomFooter` in Chrome.tsx).

## Deck structure — 50 slides (0–49), `/present/0…/present/49`, control bar "N / 50"
The talk follows a 7-stop agenda (slide 3). Stops 02–07 are acts 1–6 in config (`"Act n · …"`); the audience sees them as "STOP 02…07" (separator eyebrow, paper header, overview, room header via `stopLabel()`).
- **Stop 01 Opening:** 0 Lobby · 1 The code is ready (cold open) · 2 Ready for what? (title + poll `s2-challenge`) · 3 Agenda "Seven stops. One question."
- **4 STOP 02 The shift** · 5 Everyone can build software now · 6 The unit of delegation changed · 7 Then / Now · 8 AI is already inside the workflow (Google 25→50→75 + 4 tiles) · 9 Developers increasingly direct, review and validate (3 leader quotes) · 10 When writing code is no longer the constraint · 11 More code is not more engineering value · 12 Two graduates (poll `s7-interview`) · 13 Your move: never delegate what you can't verify
- **14 STOP 03 Students** · 15 Concepts outlive tools · 16 Learn with AI — and without it · 17 Your plan (skills, habits, project, tools)
- **18 STOP 04 Universities & educators** · 19 AI-native ≠ fundamentals-free · Keep, Shift · 20 … Add, Prove · 21 … Dohmke quote · 22 If AI can build it, what are we assessing? · 23 Your rollout (month / term / year)
- **24 STOP 05 Fresh graduates** · 25 The entry door is narrowing (4.5% + SignalFire) · 26 … Stanford 19% + NY Fed · 27 … Garman + "narrower, not closed" · 28 Yesterday's senior skills are today's junior foundation · 29 The new entry-level bar · 30 Senior reach ≠ senior judgment · 31 Your first 90 days
- **32 STOP 06 Current engineers** · 33 The job changed (effort bar) · 34 … Amodei quote · 35 … "staying narrow" line · 36 Agentic coding is learned, not prompted · 37 One career, different learning paths · 38 Your learning system (new ways to grow)
- **39 STOP 07 Companies** · 40 AI adoption is no longer optional · 41 An AI subscription is not a development strategy (tool- vs capability-first) · 42 … before/after levers · 43 … evidence · 44 Measure outcomes · 45 Your 90-day roadmap · 46 The new engineering contract (Synthesis)
- 47 Q&A — Where should we raise the engineering bar first? · 48 The code is ready. Are we? Yes — we can be. (six role lines) · 49 The final line (Closing)
- Every stop ends with a "Your move" slide (13, 17, 23, 31, 38, 45) with an ACTION band — `StopPlan` in `screens/stops.tsx`. The three-slide splits (19–21, 25–27, 33–35, 41–43) are deliberate (one idea per → press); don't merge them back.
- Durations: slides 1–47 must total exactly 2490 s (41:30); 48–49 = 120 s; slide 0 = 0. When adding or splitting a slide, take its time from other slides.

## How slides are wired
- `src/content/screens.ts` is the single list: one row per slide. **`id` is always `"S" + index`** (S0–S49); renumber every later id when inserting a slide. Row fields: `act`, `title` (control bar / page title / overview), `durationSec`, `steps` + `timeline` (ms per build phase), `notes` (presenter; `**bold**` = key line), `sourceIds`. Separators are made with `sep(id, actNumber, act)` (`separator` field, 1–6 = stop 02–07).
- Components: `S<n>` functions in `src/components/screens/{opening,act1,act2,act3,act5,stops}.tsx`, registered in the `REGISTRY` of `src/components/deck/ScreenRenderer.tsx`. `stops.tsx` holds the agenda (S3), the quote slides (S9, S40), the skill-shift slide (S28) and the `StopPlan` "Your move" slides. Separator slides all render `ActSeparator` (`screens/separators.tsx`) with text from `src/content/separators.json` and the 7-stop roadmap from `agenda.json`. All slide text lives in `src/content/*.json` (new-stop text in `stops.json`; the Blueprint's full per-role plans in `plans.json`).
- Sources: `src/content/sources.ts` entries list the slide ids they belong to in `screens: [...]` (drives the S drawer, presenter list and the Blueprint "All sources"); every slide's `sourceIds` must match (the store test checks both directions). Keep the on-slide `SrcTag` in sync too.
- Theme: paper = every non-separator slide whose act starts with "Act " (computed in `src/deck/theme.ts`); everything else is navy.
- Id-based hooks to update when renumbering: `POLL_SCREEN` in `src/lib/poll.ts` (`s7-interview` → `S12`), `PRINT_CHOICE` in `src/routes/print.tsx` (`S12: 2`). Q&A/close boundaries are derived (`QA_INDEX` = the slide whose act is "Q&A").
- `slideLabel(i)` in `screens.ts` ("N / 50 · title") is the one label used by the control bar, presenter window, `document.title` and the `/present/$n` head.

## Behaviour
- No click-steps: each slide auto-plays its build; → always goes to the next slide (also mid-build); ← shows the previous slide complete (no replay); R replays.
- Build speed: elements enter in 200 ms, staggered 60 ms (timelines like `[60, 120, 180…]`); every normal build completes within 0.8 s. Counters and morphs (75% counter, reach circles, effort bar, ladder arcs) 600 ms; typed text ≤ 1 s; cold open ≤ 3 s (terminal lines 0.12 s apart). Ambient motion (lobby arcs, Concepts crossfade) is exempt.
- Stop separators (4, 14, 18, 24, 32, 39) are real navy slides that wait for → (no timed overlay): "STOP 0n" eyebrow, big title, muted question, act-colour line, giant stop numeral, quiet ArcMotif, and the 7-stop roadmap along the bottom.
- Optional keys only: 1/2/3 (poll on 2; reveal answers on 12 "Two graduates"), 1–6 (career stage on 37 and 46), T (effort bar 2022/2026 on 33), Z (competency zoom on 42), S (sources), O (overview — separators shown as stop headers), G+number, N (presenter), B (blackout, navy), F, D (download PDF).
- One source of truth for the current slide; control bar "N / total · title", page title, `/present/N`, progress bar and presenter window always agree.
- Presenter timer: talk total 41:30 counts slides 1–47 (up to Q&A); Q&A countdown stops at 0; separate "Close 2:00" for slides 48–49.

## PDF
- `/print` (noindex) renders every slide's final/print state at 1920×1080 per page, then /blueprint pages, sets `window.__PRINT_READY = true`.
- Generate: see README "Generate the PDF" (Playwright, `page.pdf({width:'1920px',height:'1080px',printBackground:true,tagged:true,outline:true})`). Playwright is a dev dependency (`bunx playwright install chromium` once). Locally: start the dev server, then `node scripts/export-pdf.mjs http://localhost:8080 AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf`. Current output: 76 pages (50 slides + Resources title + 25 Blueprint pages).
- Lovable-hosted assets (`/__l5e/assets-v1/…`: monogram, QR images) 404 on the local dev server; `export-pdf.mjs` fetches them from the published site when the base URL isn't the live site. These 404s in local dev are expected.
- `*.pdf` is git-ignored: the PDF stays in the repo root locally and is never committed.
- Upload in the presenter window (PIN) → stored as PDF_FILENAME → every Download PDF button serves it. Re-generate and re-upload after any slide change.
- Print gotchas: large `rounded-full` divs print with a flattened bottom in Chromium's PDF output — draw big circles as SVG (as on slide 30 and the agenda rings on slide 3). When checking PDF pages with pdf.js, navy pages show a pink glow: that's a pdf.js rendering artifact, Chrome's viewer shows the correct navy glow.
