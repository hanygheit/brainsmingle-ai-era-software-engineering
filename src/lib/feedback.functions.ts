import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fb from "@/content/feedback.json";

export interface FeedbackEntry {
  id: string;
  submittedAt: string;
  rating: number;
  valuable: string | null;
  change: string;
  comments: string;
  name: string;
  email: string;
  contactOk: boolean;
}

const FOLDER = "feedback";
const oneLine = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/\s+/g, " ").trim()).pipe(z.string().max(max));
const multiLine = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/\r\n?/g, "\n").trim()).pipe(z.string().max(max));

const FeedbackInput = z.object({
  device: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  valuable: z.string().refine((v) => fb.valuable.options.includes(v)).nullable(),
  change: oneLine(fb.change.max),
  comments: multiLine(fb.comments.max),
  name: oneLine(100),
  email: oneLine(200).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Check the email address."),
  contactOk: z.boolean(),
  /** Honeypot: hidden from people, bots fill it. */
  website: z.string().max(200).optional(),
});

/** Public: stores one response per device as feedback/<device>.json in the private bucket. */
export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const, duplicate: false };
    const entry: FeedbackEntry = {
      id: data.device,
      submittedAt: new Date().toISOString(),
      rating: data.rating,
      valuable: data.valuable,
      change: data.change,
      comments: data.comments,
      name: data.name,
      email: data.email,
      contactOk: data.contactOk,
    };
    try {
      const { writeJson } = await import("./store.server");
      const r = await writeJson(`${FOLDER}/${data.device}.json`, entry, { upsert: false });
      return { ok: true as const, duplicate: r === "exists" };
    } catch (e) {
      console.error("submitFeedback failed", e);
      return { ok: false as const, error: "Couldn't send your feedback. Try again." };
    }
  });

/** Presenter only: every feedback response. The PIN is checked on the server against PRESENTER_PIN. */
export const getFeedbackResults = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ pin: z.string().max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { checkPin } = await import("./print-token.server");
    if (!process.env["PRESENTER_PIN"]) return { ok: false as const, error: "Add the PRESENTER_PIN secret first." };
    if (!checkPin(data.pin)) {
      await new Promise((r) => setTimeout(r, 800));
      return { ok: false as const, error: "Wrong presenter PIN." };
    }
    try {
      const { readFolder } = await import("./store.server");
      const entries = (await readFolder<FeedbackEntry>(FOLDER)).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
      return { ok: true as const, entries };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Could not load feedback." };
    }
  });
