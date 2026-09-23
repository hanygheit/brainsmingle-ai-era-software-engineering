import { useEffect, useState } from "react";

const KEY = "presenter-pin";

export function readPin() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function savePin(pin: string) {
  try {
    sessionStorage.setItem(KEY, pin);
    window.dispatchEvent(new Event("presenter-pin"));
  } catch {
    /* ignore */
  }
}

export function usePresenterPin() {
  const [pin, setPin] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setPin(readPin());
    sync();
    window.addEventListener("presenter-pin", sync);
    return () => window.removeEventListener("presenter-pin", sync);
  }, []);
  return pin;
}
