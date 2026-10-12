import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { slideLabel } from "@/content/screens";
import { PREVIEW_SLIDES, SHARE, SITE_TITLE, SOCIAL_PREVIEW_ALT, SOCIAL_PREVIEW_URL } from "@/config";

export const Route = createFileRoute("/present/$n")({
  head: ({ params }) => ({
    meta: [
      { title: slideTitle(params.n) },
      { name: "description", content: SHARE.description },
      { property: "og:title", content: SHARE.title },
      { property: "og:description", content: SHARE.description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SOCIAL_PREVIEW_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SOCIAL_PREVIEW_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE.title },
      { name: "twitter:description", content: SHARE.description },
      { name: "twitter:image", content: SOCIAL_PREVIEW_URL },
      { name: "twitter:image:alt", content: SOCIAL_PREVIEW_ALT },
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

/** Same format the deck writes on every navigation, so the two never disagree. Locked slides' titles stay out of the server HTML. */
function slideTitle(n: string) {
  const i = Number.parseInt(n, 10) || 0;
  return i < PREVIEW_SLIDES ? `${slideLabel(i)} — ${SITE_TITLE}` : SITE_TITLE;
}
