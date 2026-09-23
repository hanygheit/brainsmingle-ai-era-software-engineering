// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// DECK_VERSION covers slide content and slide-specific presentation assets so cached PDFs stay current.
let deckVersion = "dev";
try {
  const deckFiles = [
    "./src/content/slides.ts",
    "./src/components/deck/layouts/outro.tsx",
    "./src/assets/github-repo-qr.png.asset.json",
  ];
  const hash = createHash("sha256");
  deckFiles.forEach((file) => hash.update(readFileSync(new URL(file, import.meta.url))));
  deckVersion = hash.digest("hex").slice(0, 12);
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
