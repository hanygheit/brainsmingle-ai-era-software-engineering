import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OverviewGrid } from "@/components/deck/Overview";
import { DeckProvider } from "@/deck/store";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Slide overview — Before You Put an AI Agent on Call" },
      {
        name: "description",
        content: "Every slide of the DevOpsDays Cairo 2026 talk in one grid.",
      },
      { property: "og:title", content: "Slide overview — Before You Put an AI Agent on Call" },
      {
        property: "og:description",
        content: "Every slide of the DevOpsDays Cairo 2026 talk in one grid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewRoute,
});

function OverviewRoute() {
  const navigate = useNavigate();
  return (
    <DeckProvider>
      <OverviewGrid onClose={() => void navigate({ to: "/" })} />
    </DeckProvider>
  );
}
