import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/DeckView";
import { screens, TOTAL_SCREENS } from "@/content/screens";

export const Route = createFileRoute("/present/$n")({
  head: ({ params }) => ({
    meta: [
      { title: slideTitle(params.n) },
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
  const index = Number.parseInt(n, 10);
  // Old ?step= links are ignored. The deck stays mounted: the router sees our own
  // replaceState URL updates, and remounting here would reset the slide's state.
  return <Deck index={Number.isFinite(index) ? index : 0} />;
}

/** Same format the deck writes on every navigation, so the two never disagree. */
function slideTitle(n: string) {
  const i = Math.max(0, Math.min(TOTAL_SCREENS - 1, Number.parseInt(n, 10) || 0));
  const s = screens[i]!;
  return `${s.id} · ${i + 1}/${TOTAL_SCREENS} — ${s.title}`;
}
