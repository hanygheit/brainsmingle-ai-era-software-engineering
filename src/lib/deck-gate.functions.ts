import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Token = z.object({ token: z.string().max(400).nullish() });

/** Server clock, unlock time and whether this browser's token opens the deck. */
export const deckGate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Token.parse(d ?? {}))
  .handler(async ({ data }) => {
    const { gateStatus } = await import("./deck-gate.server");
    return gateStatus(data.token);
  });

/** Presenter PIN → signed unlock token (rate-limited). */
export const unlockDeck = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ pin: z.string().max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { unlockWithPin } = await import("./deck-gate.server");
    return unlockWithPin(data.pin);
  });
