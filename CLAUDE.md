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
- Checks before pushing: `bun run build`, `./node_modules/.bin/tsc --noEmit -p .`, `./node_modules/.bin/vitest run` (`src/deck/store.test.ts` asserts slide count, separator positions, Q&A index, 41:30 / 2:00 totals and build-time limits — update it when the deck changes). Dev server: `bun run dev` → http://localhost:8080.
- Windows checkout noise: ESLint's prettier rule reports CRLF line endings (ignore, or lint with `--rule 'prettier/prettier: off'`); `src/routeTree.gen.ts` shows as modified after every build (line endings only — `git checkout` it, don't commit). Don't run prettier over whole files: it reflows the one-line-per-slide table in `screens.ts` and unrelated lines.

## Hard rules
- **No third-party services** (no Browserless, no external PDF/render APIs). PDF = `/print` route → Playwright locally → uploaded in the presenter window.
- **Never commit secrets.** `PRESENTER_PIN` lives only in Lovable Cloud → Secrets. `.env` values from Lovable (Supabase URL / publishable key) are public client keys; don't add others.
- **Database:** polls use the old `poll_votes` table with added `poll_id` and `option` columns. Do NOT drop/alter the old columns or the `poll_sessions` table. Poll ids: `s2-challenge`, `s7-interview`.
- **Do not change any slide wording** unless a task says so. All text, quotes and numbers are verified; every number/quote keeps its on-slide SourceTag and its `sources.ts` entry (exact article URLs, never homepages).
- No pure black anywhere.

## Config (src/config.ts)
- LINKEDIN_URL `https://www.linkedin.com/in/hanysaad` · BRAINSMINGLE_URL `https://brainsmingle.com/hanysaad` · PRESENTATION_URL `https://brainsmingle-ai-era-software-engineering.lovable.app`
- PDF_FILENAME `AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf`
- Speaker: Hany Saad · Senior Software Engineering Manager · ITWorx · AI & Software Engineering Expert · ITI (text only, no logos)

## Design system
- **Stage theme (navy)** — lobby, cold open, title, separators, contract, Q&A, closing, presenter window, /vote: bg `#0F1B33` + soft radial glow `#1A2C52` upper-left; surface `#172744`; line `#2B3D63`; text `#F4F2EC`; muted `#AEB8CC`.
- **Content theme (warm paper)** — content slides and /blueprint: paper `#F7F6F2`, card `#FFFFFF`, rule `#E3E1DA`, ink `#14161C`, muted `#5B616E`; faint ArcMotif watermark top-right (~6%); 4 px act-colour line at top. Act colours: 1 `#2563EB`, 2 `#0E9F6E`, 3 `#B7791F`, 4 `#7C3AED`, 5 `#DC2626`.
- Code/terminal panels on paper: slate `#1B2540`, text `#F4F2EC`.
- Framework colours — fills: delegate `#8E97AB`, direct `#4C8DFF`, validate `#F2B33D`, own `#3DDC97`. Text on paper: delegate `#5B6478`, direct `#2563EB`, validate `#9A6516`, own `#0B7A55`. Text on navy: `#B4BCCD`, `#8AB6FF`, `#F6C35C`, `#5EE6AA`. All text ≥ 4.5:1 contrast.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code), self-hosted.
- Stage: fixed 1920×1080 canvas scaled to fit. Fullscreen (F / F11): edge to edge, letterbox bars use the slide's own background. Windowed: "stage room" — navy `#0B152B` backdrop, slide framed (rounded, lit, act-tinted ambient glow), branded header with Present button, docked controls in the footer (`src/deck/useFullscreen.ts`, `RoomHeader`/`RoomFooter` in Chrome.tsx).

## Deck structure — 39 slides (0–38), `/present/0…/present/38`, control bar "N / 39"
0 Lobby · 1 The code is ready (cold open) · 2 Ready for what? (poll `s2-challenge`)
- **3 ACT 1** · 4 Everyone can build software now · 5 The unit of delegation changed · 6 Then / Now · 7 AI is already inside the workflow · 8 When writing code is no longer the constraint · 9 More code is not more engineering value · 10 Two graduates (poll `s7-interview`)
- **11 ACT 2** · 12 AI-native ≠ fundamentals-free · Keep, Shift · 13 … Add, Prove · 14 … Dohmke quote · 15 Concepts outlive tools · 16 Learn with AI — and without it · 17 If AI can build it, what are we assessing?
- **18 ACT 3** · 19 The entry door is narrowing (4.5%) · 20 … Stanford 19% · 21 … Garman quote · 22 The new entry-level bar · 23 Senior reach ≠ senior judgment
- **24 ACT 4** · 25 The job changed (effort bar) · 26 … Amodei quote · 27 … "staying narrow" line · 28 Agentic coding is learned, not prompted · 29 One career, different learning paths
- **30 ACT 5** · 31 An AI subscription is not a development strategy (tool- vs capability-first) · 32 … before/after levers · 33 … evidence · 34 Measure outcomes · 35 The new engineering contract (Synthesis)
- 36 Q&A — Where should we raise the engineering bar first? · 37 The code is ready. Are we? — the answer · 38 The final line (Closing)
- The first content slide after each act separator is deliberately split into three slides (one idea per → press); don't merge them back.
- Durations: slides 1–36 must total exactly 2490 s (41:30); 37–38 = 120 s; slide 0 = 0. When splitting a slide, divide its original time between the parts.

## How slides are wired
- `src/content/screens.ts` is the single list: one row per slide. **`id` is always `"S" + index`** (S0–S38); renumber every later id when inserting a slide. Row fields: `act`, `title` (control bar / page title / overview), `durationSec`, `steps` + `timeline` (ms per build phase), `notes` (presenter; `**bold**` = key line), `sourceIds`. Separators are made with `sep(id, actNumber, act)` (`separator` field).
- Components: `S<n>` functions in `src/components/screens/{opening,act1,act2,act3,act5}.tsx`, registered in the `REGISTRY` of `src/components/deck/ScreenRenderer.tsx`. Separator slides all render `ActSeparator` (`screens/separators.tsx`) with text from `src/content/separators.json`. All slide text lives in `src/content/*.json`.
- Sources: `src/content/sources.ts` entries list the slide ids they belong to in `screens: [...]` (drives the S drawer, presenter list and the Blueprint "All sources") — keep these in sync with the renumbering, plus the on-slide `SrcTag`.
- Theme: paper = every non-separator slide whose act starts with "Act " (computed in `src/deck/theme.ts`); everything else is navy.
- Id-based hooks to update when renumbering: `POLL_SCREEN` in `src/lib/poll.ts` (`s7-interview` → `S10`), `PRINT_CHOICE` in `src/routes/print.tsx` (`S10: 2`), the "The S10 bug…" chip in `src/content/act2.json`. Q&A/close boundaries are derived (`QA_INDEX` = the slide whose act is "Q&A").
- `slideLabel(i)` in `screens.ts` ("N / 39 · title") is the one label used by the control bar, presenter window, `document.title` and the `/present/$n` head.

## Behaviour
- No click-steps: each slide auto-plays its build; → always goes to the next slide (also mid-build); ← shows the previous slide complete (no replay); R replays.
- Build speed: elements enter in 200 ms, staggered 60 ms (timelines like `[60, 120, 180…]`); every normal build completes within 0.8 s. Counters and morphs (75% counter, reach circles, effort bar, ladder arcs) 600 ms; typed text ≤ 1 s; cold open ≤ 3 s (terminal lines 0.12 s apart). Ambient motion (lobby arcs, Concepts crossfade) is exempt.
- Act separators (3, 11, 18, 24, 30) are real navy slides that wait for → (no timed overlay): "ACT n" eyebrow, 96 px title, 36 px muted question, act-colour line, quiet ArcMotif.
- Optional keys only: 1/2/3 (poll on 2; reveal answers on 10 "Two graduates"), 1–6 (career stage on 29 and 35), T (effort bar 2022/2026 on 25), Z (competency zoom on 32), S (sources), O (overview — separators shown as act headers), G+number, N (presenter), B (blackout, navy), F, D (download PDF).
- One source of truth for the current slide; control bar "N / total · title", page title, `/present/N`, progress bar and presenter window always agree.
- Presenter timer: talk total 41:30 counts slides 1–36 (up to Q&A); Q&A countdown stops at 0; separate "Close 2:00" for slides 37–38.

## PDF
- `/print` (noindex) renders every slide's final/print state at 1920×1080 per page, then /blueprint pages, sets `window.__PRINT_READY = true`.
- Generate: see README "Generate the PDF" (Playwright, `page.pdf({width:'1920px',height:'1080px',printBackground:true,tagged:true,outline:true})`). Playwright is a dev dependency (`bunx playwright install chromium` once). Locally: start the dev server, then `node scripts/export-pdf.mjs http://localhost:8080 AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf`. Current output: 56 pages (39 slides + Resources title + Blueprint).
- Lovable-hosted assets (`/__l5e/assets-v1/…`: monogram, QR images) 404 on the local dev server; `export-pdf.mjs` fetches them from the published site when the base URL isn't the live site. These 404s in local dev are expected.
- `*.pdf` is git-ignored: the PDF stays in the repo root locally and is never committed.
- Upload in the presenter window (PIN) → stored as PDF_FILENAME → every Download PDF button serves it. Re-generate and re-upload after any slide change.
- Print gotchas: large `rounded-full` divs print with a flattened bottom in Chromium's PDF output — draw big circles as SVG (as on slide 23). When checking PDF pages with pdf.js, navy pages show a pink glow: that's a pdf.js rendering artifact, Chrome's viewer shows the correct navy glow.
