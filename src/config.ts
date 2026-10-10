/** Central configuration for the "AI-Era Software Engineering" keynote. */

export const SPEAKER = {
  name: "Hany Saad",
  monogram: "HS",
  roles: ["Senior Software Engineering Manager · ITWorx", "AI & Software Engineering Expert · ITI"],
} as const;

export const LINKEDIN_URL = "https://www.linkedin.com/in/hanysaad";
export const BRAINSMINGLE_URL = "https://brainsmingle.com/hanysaad";
export const PRESENTATION_URL = "https://brainsmingle-ai-era-software-engineering.lovable.app";
export const PDF_FILENAME = "AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf";

export const EVENT = {
  name: "BrainsMingle AI Summit 2026",
  track: "AI in Learning & Development",
  start: "2026-10-12T20:00:00+03:00",
  timeZone: "Africa/Cairo",
} as const;

export const BLUEPRINT_PATH = "/blueprint";

/** Total talk target: 41:30. */
export const TARGET_TOTAL_SEC = 41 * 60 + 30;

export const ACTS = [
  "Lobby",
  "Opening",
  "Act 1 · The work has changed",
  "Act 2 · Students and educators",
  "Act 3 · Fresh graduates",
  "Act 4 · Engineers already inside",
  "Act 5 · Companies",
  "Synthesis",
  "Q&A",
  "Closing",
] as const;
export type Act = (typeof ACTS)[number];

export const POLL_IDS = ["s2-challenge", "s7-interview"] as const;
export type PollId = (typeof POLL_IDS)[number];
export const voteUrl = (poll: PollId) => `${PRESENTATION_URL}/vote?poll=${poll}`;

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
