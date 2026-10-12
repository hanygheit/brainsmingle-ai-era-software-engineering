/** Deck window events, kept dependency-free so small pages (/vote) can import them without the deck store. */
export const CHOICE_EVENT = "deck-choice";
export type ChoiceDetail = { screenId: string; n: number };
