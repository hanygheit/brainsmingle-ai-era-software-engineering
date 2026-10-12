/** Central configuration for the "AI-Era Software Engineering" keynote. */

export const SPEAKER = {
  name: "Hany Saad",
  monogram: "HS",
  role: "Senior Software Engineering Manager · ITWorx",
} as const;

export const LINKEDIN_URL = "https://www.linkedin.com/in/hanysaad";
export const BRAINSMINGLE_URL = "https://brainsmingle.com/hanysaad";
export const PRESENTATION_URL = "https://brainsmingle-ai-era-software-engineering.lovable.app";
export const REPO_URL = "https://github.com/hanygheit/brainsmingle-ai-era-software-engineering";
/** Audience hub (/thanks): feedback, slides, PDF, code and links in one place. Always open. */
export const HUB_URL = `${PRESENTATION_URL}/thanks`;
/** The hub link as printed under its QR: exactly the URL it encodes, without the scheme. */
export const HUB_LINK_TEXT = HUB_URL.replace(/^https?:\/\//, "");
export const SITE_TITLE = "AI-Era Software Engineering — Hany Saad | BrainsMingle AI Summit 2026";
export const SITE_DESCRIPTION = "From Graduate Readiness to Talent Development: Hany Saad’s keynote on AI-era software engineering, learning and talent development at BrainsMingle AI Summit 2026.";
/** Link-preview image (public/og-image.png, 1200×630): title, Live · Mon 12 Oct · 8:00PM Cairo time, the seven stops. */
export const SOCIAL_PREVIEW_URL = `${PRESENTATION_URL}/og-image.png`;
export const SOCIAL_PREVIEW_ALT = "AI-Era Software Engineering — Hany Saad. Live · Mon 12 Oct · 8:00PM Cairo time. Seven stops from The shift to Software buyers & stakeholders.";
export const PDF_FILENAME = "AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf";

export const EVENT = {
  name: "BrainsMingle AI Summit 2026",
  track: "AI in Learning & Development",
  start: "2026-10-12T20:00:00+03:00",
  timeZone: "Africa/Cairo",
} as const;

export const BLUEPRINT_PATH = "/blueprint";

/**
 * The full deck (slides 2+, overview, presenter, /blueprint, /print, PDF) opens for
 * everyone at this instant — the end of the live session, 9:00PM Cairo time. Checked against
 * server time. Before it only the first PREVIEW_SLIDES slides are public; the presenter
 * PIN unlocks one browser for UNLOCK_TOKEN_HOURS.
 */
export const DECK_UNLOCK_AT = "2026-10-12T18:00:00Z";
export const PREVIEW_SLIDES = 2;
export const UNLOCK_TOKEN_HOURS = 6;

/** Link-preview text for the deck pages (Open Graph / Twitter), with the live date and the seven stops. */
export const SHARE = {
  title: "AI-Era Software Engineering — Hany Saad · Live · Mon 12 Oct · 8:00PM Cairo time",
  description:
    "From Graduate Readiness to Talent Development. Live keynote at BrainsMingle AI Summit 2026 · Mon 12 Oct · 8:00PM Cairo time. Seven stops: The shift · Universities & educators · Students · Fresh graduates & juniors · Experienced software engineers · Software companies & teams · Software buyers & stakeholders.",
} as const;

/** Total talk target: 41:30. */
export const TARGET_TOTAL_SEC = 41 * 60 + 30;
/** Q&A after the final slide (which holds): the presenter window counts this down. */
export const QA_SEC = 10 * 60;

export const ACTS = [
  "Lobby",
  "Opening",
  "Act 1 · The shift",
  "Act 2 · Universities & educators",
  "Act 3 · Students",
  "Act 4 · Fresh graduates & juniors",
  "Act 5 · Experienced software engineers",
  "Act 6 · Software companies & teams",
  "Act 7 · Software buyers & stakeholders",
  "Synthesis",
  "Q&A",
  "Closing",
] as const;
export type Act = (typeof ACTS)[number];

export const POLL_IDS = ["s2-challenge"] as const;
export type PollId = (typeof POLL_IDS)[number];
export const voteUrl = (poll: PollId) => `${PRESENTATION_URL}/vote?poll=${poll}`;
/** The vote link as printed under the QR: exactly the URL it encodes, without the scheme. */
export const voteLinkText = (poll: PollId) => voteUrl(poll).replace(/^https?:\/\//, "");
/**
 * Polls whose votes live in the private `exports` bucket instead of `poll_votes`
 * (s2-challenge has 4 options; the table's check constraint only allows 1–3).
 */
export const STORED_POLLS: readonly PollId[] = ["s2-challenge"];
/** Short on-screen form of the vote link (bare /vote opens whichever poll is open). */
export const VOTE_LINK_SHORT = "…lovable.app/vote";
export const FEEDBACK_URL = `${PRESENTATION_URL}/feedback`;

/** Theme tokens (mirrored as CSS variables in styles.css). */
export const THEME = {
  bg: "#0F1B33",
  surface: "#172744",
  line: "#2B3D63",
  text: "#F4F2EC",
  muted: "#AEB8CC",
  delegate: "#8E97AB",
  direct: "#4C8DFF",
  validate: "#F2B33D",
  own: "#3DDC97",
} as const;

export const BROADCAST_CHANNEL = "ai-era-deck";
