import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Deck } from "@/components/deck/DeckView";

export const Route = createFileRoute("/present/$n")({
  validateSearch: (s) => z.object({ step: z.coerce.number().int().min(0).catch(0) }).parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Screen ${params.n} — AI-Era Software Engineering · Hany Saad` },
      { name: "description", content: "Live keynote by Hany Saad, BrainsMingle AI Summit 2026." },
      { property: "og:title", content: "AI-Era Software Engineering — Hany Saad" },
      { property: "og:description", content: "Live keynote by Hany Saad, BrainsMingle AI Summit 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresentRoute,
});

function PresentRoute() {
  const { n } = Route.useParams();
  const { step } = Route.useSearch();
  const index = Number.parseInt(n, 10);
  return <Deck key={`${n}-${step}`} index={Number.isFinite(index) ? index : 0} step={step} />;
}
