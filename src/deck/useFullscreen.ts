import { useEffect, useState } from "react";

/**
 * True when the deck fills the whole screen: Fullscreen API (F key) or browser
 * fullscreen (F11). The deck then renders edge to edge; otherwise it sits in the
 * windowed "stage room" frame.
 */
export function useIsFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const check = () => {
      const api = !!document.fullscreenElement;
      const browser =
        window.matchMedia?.("(display-mode: fullscreen)").matches ||
        (Math.abs(window.innerWidth - window.screen.width) <= 1 &&
          Math.abs(window.innerHeight - window.screen.height) <= 1);
      setFullscreen(api || browser);
    };
    check();
    document.addEventListener("fullscreenchange", check);
    window.addEventListener("resize", check);
    return () => {
      document.removeEventListener("fullscreenchange", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return fullscreen;
}

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}
