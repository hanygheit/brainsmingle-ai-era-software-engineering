import { createFileRoute } from "@tanstack/react-router";
import { SPEAKER } from "@/config";

export const Route = createFileRoute("/blueprint")({
  head: () => ({
    meta: [
      { title: "Blueprint — AI-Era Software Engineering resources" },
      { name: "description", content: "Resources and frameworks from Hany Saad's AI-Era Software Engineering keynote." },
      { property: "og:title", content: "Blueprint — AI-Era Software Engineering" },
      { property: "og:description", content: "Resources and frameworks from the keynote." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <main className="min-h-dvh bg-bg px-6 py-16 font-sans text-text">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">Blueprint</p>
        <h1 className="mt-3 font-display text-[44px] leading-tight font-bold">AI-Era Software Engineering</h1>
        <p className="mt-4 text-[18px] text-muted">{SPEAKER.name} · resources arrive with the next update.</p>
      </div>
    </main>
  ),
});
