import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";

const TITLE = "AI-Era Software Engineering — Hany Saad · BrainsMingle AI Summit 2026";
const DESC = "An interactive keynote by Hany Saad for the BrainsMingle AI Summit 2026, AI in Learning & Development track.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: () => <Deck index={0} step={0} />,
});
