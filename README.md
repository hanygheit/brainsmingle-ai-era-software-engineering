# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Generate the PDF

The PDF is rendered by our own pipeline (no third-party service) from the unlisted `/print` page:

```sh
npx playwright install chromium   # once
node scripts/export-pdf.mjs https://brainsmingle-ai-era-software-engineering.lovable.app AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf
```

Then open the presenter window → **Upload PDF** (needs the presenter PIN). Every Download PDF button serves that file.

Before the deck opens (see below), prefix the export with `DECK_PIN=<pin>` so the script unlocks its browser through the lock screen first.

## Presenter PIN

The presenter PIN (6–8 digits) unlocks the deck before `DECK_UNLOCK_AT`, the presenter window's PIN actions, `/results` and the PDF upload. The repo holds nothing about it: the server (`checkPin` in `src/lib/print-token.server.ts`) compares a PBKDF2-SHA256 hash (100,000 iterations) against two server secrets, and refuses every PIN when either is missing.

To set or change it:

1. `node scripts/hash-pin.mjs` — type the new PIN twice (not echoed); it prints `PRESENTER_PIN_SALT=…` and `PRESENTER_PIN_HASH=…`.
2. Lovable → Cloud → Secrets: add (or update) `PRESENTER_PIN_SALT` and `PRESENTER_PIN_HASH` with those values.
3. Publish → Update, then unlock the lock screen or open `/results` with the new PIN.

Never commit the PIN, the salt or the hash. The old 4-digit PIN's hash is in the git history: it is compromised and must not be reused.

## Time gate (preview until the session ends)

Until `DECK_UNLOCK_AT` in `src/config.ts` (2026-10-12T18:00:00Z = 21:00 Cairo), visitors get slides 0–1 plus `/vote` and `/feedback`. Every other slide, the overview, presenter window, `/blueprint`, `/print` and the PDF show a lock screen (navy, countdown, QR codes, "Presenter? Enter PIN").

- The decision is made on the server (`src/lib/deck-gate.server.ts`): the `deckGate` server function returns the server clock, the unlock time and whether the browser's token is valid; `exportPdf` refuses without it. Locked pages never render on the server, so their HTML holds no slide content (the JS bundle still does).
- The presenter PIN (see "Presenter PIN" below) returns an HMAC-signed token valid for 6 hours, kept in `localStorage` (`ai-era-unlock`) and shared with the presenter window. Wrong PINs: 0.8 s delay each, 5 per client per 15 minutes.
- After the unlock time everything is open to everyone with no PIN. `/results` stays PIN-protected.
- Tests: `scripts/test-gate.mjs` (Playwright) — run it against a dev server started with `DECK_UNLOCK_AT_OVERRIDE` (and `DEV_PRESENTER_PIN` for the PIN steps); both work in local dev only.

## Audience hub (`/thanks`)

`HUB_URL` (`/thanks`) is the one QR code on slide 49 (200 px) and the final slide (300 px): "Feedback · slides · PDF · code — all in one place". It is always open (outside the time gate), mobile-first, navy:

- **Share your feedback — 60 seconds** → `/feedback` (first and largest).
- **Open the presentation** → `/present/0` and **Download the PDF** (the stored PDF). Before `DECK_UNLOCK_AT` both are disabled with "Opens at 21:00 Cairo" and a countdown; afterwards they work.
- **Get the code on GitHub** → `REPO_URL`; **Connect** → LinkedIn and BrainsMingle.
- On screens ≥ 900 px a small QR code sits beside each link (for laptop viewers); phones get buttons only.

Text lives in `src/content/thanks.json`; URLs in `src/config.ts`.

## Live polls, feedback and results

No database migration is needed: everything uses the existing `poll_votes` table and the private `exports` storage bucket.

- **Polls** — slide 2 "Who's in the room?" (`s2-challenge`, four options: learning / building / teaching / leading) (the only live poll; the old slide-12 `s7-interview` poll is retired, its `poll_votes` rows left as they are). Phones open the QR link (`/vote?poll=…`; slide 2 prints the full URL under its QR).
  - `s2-challenge` needs option 4, which the table's check constraint rejects (schema changes only apply via Lovable), so its votes go through server functions (`src/lib/votes.functions.ts`) into the bucket: one file per voter, `votes/s2-challenge/<voter_id>.<option>.json`, replaced when the voter changes their answer, option validated 1–4 on the server, rejected while the poll is closed. The tally is a folder listing (newest file per voter wins); slide 2, slide 47, the presenter console, `/vote` and `/results` read it every 2 s. `STORED_POLLS` in `src/config.ts` lists the bucket-stored polls.
  - Keys 1–4 on slide 2 add chat votes by hand. Slide 49 shows the slide-2 audience mix ("Hold your questions — Q&A right after the close"); Q&A happens on the final slide, which holds while the presenter window counts down Q&A 10:00.
- **Bare `/vote`** opens whichever poll is open (the most recently opened), or shows "No poll is open right now".
- **Presenter window → Polls**: `OPEN · close` / `CLOSED · open` per poll. A closed poll's vote page says "Voting closed — watch the screen". The state is stored as `state/polls.json` in the bucket and needs the PIN. Both polls are open until you close one. **RESET** deletes a poll's votes (PIN, with a confirmation): the `poll_votes` rows and, for `s2-challenge`, its bucket files. Reset both polls before the talk.
- **`/feedback`** — a one-minute form (rating, most valuable part, one change, comments, optional contact). A server function validates each response and stores it as `feedback/<device-id>.json` in the private bucket: one per device. Nothing is readable anonymously.
- **`/results`** (unlisted, noindex) asks for the presenter PIN. The server checks it against the PIN hash before returning the feedback. The page shows both polls live, a feedback summary, every response, and a CSV download for polls and for feedback.
- Local dev without `SUPABASE_SERVICE_ROLE_KEY` keeps poll state, feedback and `s2-challenge` votes in memory (dev only; restarting the server clears them). The presenter PIN works locally only if `PRESENTER_PIN_HASH` / `PRESENTER_PIN_SALT` are set in the dev server's environment; a dev server started with `DEV_PRESENTER_PIN` also accepts that test PIN.
