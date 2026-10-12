import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { PRESENTATION_URL, SHARE } from "@/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SHARE.title },
      { name: "description", content: SHARE.description },
      { property: "og:title", content: SHARE.title },
      { property: "og:description", content: SHARE.description },
      { property: "og:url", content: PRESENTATION_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE.title },
      { name: "twitter:description", content: SHARE.description },
    ],
  }),
  component: () => <Deck index={0} />,
});
