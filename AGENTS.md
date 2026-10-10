<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Screens are pure functions of (screen, phase, choice); ScreenRenderer auto-plays phases on a per-screen timeline when entered forward and renders the final phase when entered back, in print, overview and presenter; why: one press = one slide, and the final state is what the PDF captures.
- All talk-wide values (speaker, URLs, acts, theme, poll ids) live in `src/config.ts`; content lives in `src/content/`; why: one place to edit.
- Deck position syncs via BroadcastChannel + sessionStorage and mirrors to `/present/N` with replaceState; the deck route stays mounted across its own URL updates; why: reload resumes, no history spam.
- Poll votes upsert directly into `poll_votes` (RLS limits poll ids/options); resets go through a PIN-checked server function; why: no attendee sign-in.
- Light/dark slide themes are scoped CSS-variable overrides (.theme-paper / .theme-stage) chosen per screen in src/deck/theme.ts; why: screens stay theme-agnostic and embedded dark panels just opt back in.
