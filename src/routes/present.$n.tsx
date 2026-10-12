import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { slideLabel } from "@/content/screens";
import { SITE_TITLE, SITE_DESCRIPTION, SOCIAL_PREVIEW_URL } from "@/config";

export const Route = createFileRoute("/present/$n")({
  head: ({ params }) => ({
    meta: [
      { title: `${slideTitle(params.n)} — ${SITE_TITLE}` },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SOCIAL_PREVIEW_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "AI-Era Software Engineering — Hany Saad’s BrainsMingle AI Summit 2026 keynote" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: SOCIAL_PREVIEW_URL },
    ],
  }),
  component: PresentRoute,
});

function PresentRoute() {
  const { n } = Route.useParams();
  const index = Number.parseInt(n, 10);
  // Old ?step= links are ignored. The deck stays mounted: the router sees our own
  // replaceState URL updates, and remounting here would reset the slide's state.
  return <Deck index={Number.isFinite(index) ? index : 0} />;
}

/** Same format the deck writes on every navigation, so the two never disagree. */
function slideTitle(n: string) {
  return slideLabel(Number.parseInt(n, 10) || 0);
}
