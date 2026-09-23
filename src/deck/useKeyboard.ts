import { useEffect, useRef } from "react";
import { useDeck } from "./store";

/** Global presentation shortcuts, shared by the deck and presenter windows. */
export function useKeyboard() {
  const deck = useDeck();
  const buffer = useRef("");
  const bufferTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const k = e.key;

      if (/^[0-9]$/.test(k)) {
        buffer.current += k;
        if (bufferTimer.current) clearTimeout(bufferTimer.current);
        bufferTimer.current = setTimeout(() => {
          buffer.current = "";
        }, 1500);
        return;
      }

      switch (k) {
        case "Enter":
          if (buffer.current) {
            deck.goto(Number(buffer.current) - 1);
            buffer.current = "";
          } else {
            deck.next();
          }
          e.preventDefault();
          return;
        case "ArrowRight":
        case " ":
        case "PageDown":
          if (e.shiftKey) deck.skipBuilds();
          else deck.next();
          e.preventDefault();
          return;
        case "ArrowLeft":
        case "Backspace":
        case "PageUp":
          deck.prev();
          e.preventDefault();
          return;
        case "Home":
          deck.goto(0);
          return;
        case "End":
          deck.goto(deck.total - 1);
          return;
        case "Escape":
          deck.setOverlay(null);
          return;
        case "?":
          deck.setOverlay(deck.overlay === "help" ? null : "help");
          return;
        case ".":
          deck.setOverlay(deck.overlay === "black" ? null : "black");
          return;
        default:
          break;
      }

      switch (k.toLowerCase()) {
        case "g":
        case "o":
          deck.setOverlay(deck.overlay === "overview" ? null : "overview");
          break;
        case "f":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
          break;
        case "p":
          window.open("/presenter", "presenter", "width=1400,height=900");
          break;
        case "b":
          deck.setOverlay(deck.overlay === "black" ? null : "black");
          break;
        case "w":
          deck.setOverlay(deck.overlay === "white" ? null : "white");
          break;
        case "l":
          deck.toggle("laser");
          break;
        case "s":
          deck.toggle("spotlight");
          break;
        case "z":
          deck.toggle("zoom");
          break;
        case "t":
          deck.toggle("timerOn");
          break;
        case "n":
          deck.toggle("notesOpen");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck]);
}
