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
- Screens are pure functions of (screen, step, choice) registered in `src/components/deck/ScreenRenderer.tsx`; why: Back must restore the exact prior state and print/overview render any step.
- All talk-wide values (speaker, URLs, acts, theme, poll ids) live in `src/config.ts`; content lives in `src/content/`; why: one place to edit.
- Deck position syncs via BroadcastChannel + sessionStorage and mirrors to `/present/N?step=k` with replaceState; why: reload resumes, no history spam.
- Poll votes upsert directly into `poll_votes` (RLS limits poll ids/options); resets go through a PIN-checked server function; why: no attendee sign-in.
