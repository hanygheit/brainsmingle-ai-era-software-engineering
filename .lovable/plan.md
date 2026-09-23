# Fix deck navigation synchronization

## Changes
- Treat a clean deck URL with no slide hash as slide 1 instead of restoring the previous slide.
- Make the URL a reflection of the latest slide state without adding a browser-history entry for every key press.
- Validate and normalize incoming cross-window state before applying it.
- Keep the presenter synchronized while avoiding feedback loops between deck windows.

## Verification
- Open a numbered slide, remove the hash, and confirm the deck resets to slide 1.
- Rapidly navigate forward and backward and confirm the visible slide, counter, and URL always agree.
- Check PageUp/PageDown and browser Back/Forward behavior.
