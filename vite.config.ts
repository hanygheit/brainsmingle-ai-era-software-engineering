// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// DECK_VERSION = short hash of the slide content, so cached PDFs invalidate when slides change.
let deckVersion = "dev";
try {
  deckVersion = createHash("sha256")
    .update(readFileSync(new URL("./src/content/slides.ts", import.meta.url)))
    .digest("hex")
    .slice(0, 12);
} catch {
  /* keep "dev" */
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      __DECK_VERSION__: JSON.stringify(deckVersion),
    },
  },
});
