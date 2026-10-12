import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { SITE_TITLE as TITLE, SITE_DESCRIPTION as DESC, SOCIAL_PREVIEW_URL } from "@/config";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SOCIAL_PREVIEW_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "AI-Era Software Engineering — From Graduate Readiness to Talent Development, Hany Saad, BrainsMingle AI Summit 2026" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SOCIAL_PREVIEW_URL },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: () => <Deck index={0} />,
});
