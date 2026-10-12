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

## Live polls, feedback and results

No database migration is needed: everything uses the existing `poll_votes` table and the private `exports` storage bucket.

- **Polls** — slide 2 "Who's in the room?" (`s2-challenge`) and slide 12 "Two graduates" (`s7-interview`), three options each. Phones open the QR link (`/vote?poll=…`); votes upsert straight into `poll_votes` (RLS limits poll ids and options). The slides update over realtime, or every 3 s if realtime drops. Keys 1/2/3 on slide 2 add chat votes by hand. Slide 47 (Q&A) shows the slide-2 audience mix.
- **Bare `/vote`** opens whichever poll is open (the most recently opened), or shows "No poll is open right now".
- **Presenter window → Polls**: `OPEN · close` / `CLOSED · open` per poll. A closed poll's vote page says "Voting closed — watch the screen". The state is stored as `state/polls.json` in the bucket and needs the PIN. Both polls are open until you close one. **RESET** deletes a poll's votes (PIN, with a confirmation). Reset `s2-challenge` before the talk: the question changed, but the poll id stayed the same.
- **`/feedback`** — a one-minute form (rating, most valuable part, one change, comments, optional contact). A server function validates each response and stores it as `feedback/<device-id>.json` in the private bucket: one per device. Nothing is readable anonymously.
- **`/results`** (unlisted, noindex) asks for the presenter PIN. The server checks it against `PRESENTER_PIN` before returning the feedback. The page shows both polls live, a feedback summary, every response, and a CSV download for polls and for feedback.
- Local dev without `SUPABASE_SERVICE_ROLE_KEY` keeps poll state and feedback in memory (dev only). Set `PRESENTER_PIN` in the environment to test the PIN flows.
