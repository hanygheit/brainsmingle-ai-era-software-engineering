import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { slideLabel } from "@/content/screens";
import { PREVIEW_SLIDES, SHARE } from "@/config";

export const Route = createFileRoute("/present/$n")({
  head: ({ params }) => ({
    meta: [
      { title: slideTitle(params.n) },
      { name: "description", content: SHARE.description },
      { property: "og:title", content: SHARE.title },
      { property: "og:description", content: SHARE.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE.title },
      { name: "twitter:description", content: SHARE.description },
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
  return i < PREVIEW_SLIDES ? slideLabel(i) : "AI-Era Software Engineering — Hany Saad";
}
