import { createFileRoute } from "@tanstack/react-router";
import { PresenterPanel } from "@/components/deck/PresenterPanel";
import { DeckProvider } from "@/deck/store";
import { useKeyboard } from "@/deck/useKeyboard";

export const Route = createFileRoute("/presenter")({
  head: () => ({
    meta: [
      { title: "Presenter — AI-Era Software Engineering" },
      { name: "description", content: "Presenter console: notes, timers, next screen and live polls." },
      { property: "og:title", content: "Presenter — AI-Era Software Engineering" },
      { property: "og:description", content: "Presenter console for the keynote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <DeckProvider isPresenter>
      <PresenterPage />
    </DeckProvider>
  ),
});

function PresenterPage() {
  useKeyboard({ presenterWindow: true });
  return (
    <main className="deck-room relative h-dvh overflow-hidden p-6 font-sans">
      <div className="room-backdrop" aria-hidden />
      <div className="relative h-full">
        <PresenterPanel />
      </div>
    </main>
  );
}
