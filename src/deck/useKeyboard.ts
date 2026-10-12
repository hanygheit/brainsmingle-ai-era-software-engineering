import { useEffect, useRef } from "react";
import { pointer } from "./pointer";
import { useDeck } from "./store";
import { CHOICE_EVENT, type ChoiceDetail } from "./events";

export { CHOICE_EVENT, type ChoiceDetail };
export const DOWNLOAD_EVENT = "deck-download";

/** Presentation shortcuts shared by the audience and presenter windows. */
export function useKeyboard({ presenterWindow = false }: { presenterWindow?: boolean } = {}) {
  const deck = useDeck();
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const gotoBuffer = useRef<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const d = deckRef.current;
      const k = e.key;

      // "G" → digits → Enter jumps to a screen
      if (gotoBuffer.current !== null) {
        if (/^[0-9]$/.test(k)) {
          gotoBuffer.current += k;
          e.preventDefault();
          return;
        }
        if (k === "Enter") {
          if (gotoBuffer.current) d.goto(Number(gotoBuffer.current));
          gotoBuffer.current = null;
          e.preventDefault();
          return;
        }
        gotoBuffer.current = null;
        if (k === "Escape") return;
      }

      if (d.overlay === "sources" && k !== "Escape" && k.toLowerCase() !== "s") return;

      switch (k) {
        case "ArrowRight":
        case "PageDown":
          d.next();
          e.preventDefault();
          return;
        case " ":
          if (e.shiftKey) d.prev();
          else d.next();
          e.preventDefault();
          return;
        case "ArrowLeft":
        case "PageUp":
          d.prev();
          e.preventDefault();
          return;
        case "Home":
          d.goto(0);
          e.preventDefault();
          return;
        case "End":
          d.goto(d.total - 1);
          e.preventDefault();
          return;
        case "Escape":
          if (!presenterWindow && pointer.get().tool) pointer.off();
          else if (d.overlay) d.setOverlay(null);
          else if (document.fullscreenElement) void document.exitFullscreen();
          return;
      }

      if (/^[1-6]$/.test(k)) {
        const n = Number(k);
        d.setChoice(d.choice === n ? null : n);
        window.dispatchEvent(
          new CustomEvent<ChoiceDetail>(CHOICE_EVENT, { detail: { screenId: d.screen.id, n } }),
        );
        return;
      }

      switch (k.toLowerCase()) {
        case "g":
          gotoBuffer.current = "";
          return;
        case "o":
          d.setOverlay(d.overlay === "overview" ? null : "overview");
          return;
        case "s":
          d.setOverlay(d.overlay === "sources" ? null : "sources");
          return;
        case "n":
          if (!presenterWindow) window.open("/presenter", "ai-era-presenter", "width=1440,height=900");
          return;
        case "p":
          if (!presenterWindow) d.setOverlay(d.overlay === "presenter" ? null : "presenter");
          return;
        case "b":
          d.setOverlay(d.overlay === "black" ? null : "black");
          return;
        case "f":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen?.();
          return;
        case "r":
          d.resetScreen();
          return;
        case "d":
          window.dispatchEvent(new Event(DOWNLOAD_EVENT));
          return;
      }

      // Pointer tools live in the audience (screen-shared) window only.
      if (presenterWindow) return;
      switch (k.toLowerCase()) {
        case "l":
          pointer.toggle("spotlight");
          return;
        case "h":
          pointer.toggle("highlight");
          return;
        case "c":
          pointer.clearInk();
          return;
        case "[":
          pointer.resize(-1);
          return;
        case "]":
          pointer.resize(1);
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenterWindow]);
}
