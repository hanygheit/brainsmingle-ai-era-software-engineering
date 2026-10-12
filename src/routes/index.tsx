import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { PRESENTATION_URL, SHARE, SITE_TITLE, SOCIAL_PREVIEW_ALT, SOCIAL_PREVIEW_URL } from "@/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SHARE.description },
      { property: "og:title", content: SHARE.title },
      { property: "og:description", content: SHARE.description },
      { property: "og:url", content: PRESENTATION_URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SOCIAL_PREVIEW_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SOCIAL_PREVIEW_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SOCIAL_PREVIEW_URL },
      { name: "twitter:image:alt", content: SOCIAL_PREVIEW_ALT },
      { name: "twitter:title", content: SHARE.title },
      { name: "twitter:description", content: SHARE.description },
    ],
  }),
  component: () => <Deck index={0} />,
});
