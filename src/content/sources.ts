export interface Source {
  id: string;
  title: string;
  organisation: string;
  date: string;
  url: string;
  statistic?: string;
  excerpt?: string;
  method: string;
  caveat: string;
  screens: string[];
}

/** Structured evidence; filled by later prompts. */
export const sources: Source[] = [];

export const sourcesFor = (screenId: string) => sources.filter((s) => s.screens.includes(screenId));
