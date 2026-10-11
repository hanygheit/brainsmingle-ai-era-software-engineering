# AI-Era Software Engineering — web keynote (project memory for Claude Code)

Talk: "AI-Era Software Engineering: From Graduate Readiness to Talent Development" — Hany Saad, BrainsMingle AI Summit 2026, AI in Learning & Development track, **Mon 12 Oct 2026, 20:00 Cairo (UTC+3)**, virtual, screen-shared.
Live site: https://brainsmingle-ai-era-software-engineering.lovable.app (published from Lovable).

## How this repo is deployed
- Built in Lovable; this GitHub repo is two-way synced with the Lovable project on the default branch.
- Workflow: edit → `npm run build` passes → commit → push to the default branch → the change appears in Lovable → Hany clicks **Publish → Update** in Lovable to put it live.
- Never force-push or rewrite history (it breaks the Lovable sync).

## Stack (do not migrate)
React + TypeScript + TanStack Start + Tailwind, existing animation library, Lovable Cloud (Supabase) backend. Keep the existing structure; reuse existing code.
- Package manager: **Bun** (`bun.lock`). Use `bun install`, `bun run dev`, `bun run build`. Never commit a `package-lock.json`.
- Also read `AGENTS.md` (architecture rules: screens are pure functions of screen/phase/choice; per-screen `timeline` arrays in `src/content/screens.ts` drive the auto-play; themes in `src/deck/theme.ts`; config in `src/config.ts`).
- Never edit `vite.config.ts` plugins (the Lovable config already includes them).

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
- Stage: fixed 1920×1080 canvas scaled to fit; letterbox bars use the slide's own background.

## Behaviour
- No click-steps: each slide auto-plays its build; → always goes to the next slide; ← shows the previous slide complete (no replay); R replays.
- Optional keys only: 1/2/3 (polls; reveal answers on "Two graduates"), 1–6 (career stage), T (effort bar), Z (competency zoom), S (sources), O (overview), G+number, N (presenter), B (blackout, navy), F, D (download PDF).
- One source of truth for the current slide; control bar "N / total · title", page title, `/present/N`, progress bar and presenter window always agree.
- Presenter timer: talk total 41:30 counts slides up to the Q&A slide; Q&A countdown stops at 0; separate "Close 2:00" for the last two slides.

## PDF
- `/print` (noindex) renders every slide's final/print state at 1920×1080 per page, then /blueprint pages, sets `window.__PRINT_READY = true`.
- Generate: see README "Generate the PDF" (Playwright, `page.pdf({width:'1920px',height:'1080px',printBackground:true,tagged:true,outline:true})`).
- Upload in the presenter window (PIN) → stored as PDF_FILENAME → every Download PDF button serves it.
