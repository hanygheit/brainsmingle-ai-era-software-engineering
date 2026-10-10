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

/** Structured evidence. URLs marked TODO need the exact article link from the speaker. */
export const sources: Source[] = [
  { id: "fortune-lovable-arr", title: "Lovable hits $200M ARR", organisation: "Fortune", date: "Nov 2025", url: "https://fortune.com", statistic: "$200M ARR", method: "Company-reported revenue run-rate", caveat: "Self-reported; ARR is a run-rate, not booked revenue", screens: ["S3"] },
  { id: "osika-quote", title: "Anton Osika on everyone becoming a developer", organisation: "Lovable", date: "2025", url: "https://lovable.dev", excerpt: "Everyone becomes a developer in the future.", method: "Public statement", caveat: "Opinion of a vendor CEO", screens: ["S3"] },
  { id: "so-2026-agents", title: "Developer Survey 2026 — coding agents", organisation: "Stack Overflow", date: "2026", url: "https://survey.stackoverflow.co", statistic: "Claude Code 66%, GitHub Copilot 59% among coding-agent users", method: "Self-selected developer survey", caveat: "Share among agent users only; not the whole population", screens: ["S3"] },
  { id: "github-agents-apr-2026", title: "Assign security alerts to multiple coding agents", organisation: "GitHub", date: "Apr 2026", url: "https://github.blog", method: "Product announcement", caveat: "Vendor feature description", screens: ["S3"] },
  { id: "google-pichai-next26", title: "Sundar Pichai keynote, Cloud Next '26", organisation: "Google & Alphabet", date: "22 Apr 2026", url: "https://cloud.google.com/next", statistic: "25% (Oct 2024) → 50% (fall 2025) → 75% (Apr 2026) of new code AI-generated", excerpt: "Today, 75% of all new code at Google is now AI-generated and approved by engineers, up from 50% last fall.", method: "Company statement", caveat: "Single company; Google's own definition of 'AI-generated'", screens: ["S4"] },
  { id: "so-oct-2026-daily", title: "Developer survey — daily AI use", organisation: "Stack Overflow", date: "Oct 2026", url: "https://survey.stackoverflow.co", statistic: "73% use coding assistants or agents daily", method: "Self-selected developer survey", caveat: "Self-reported usage", screens: ["S4"] },
  { id: "jetbrains-aug-2026", title: "State of developer AI usage", organisation: "JetBrains", date: "Aug 2026", url: "https://www.jetbrains.com/lp/devecosystem-2026/", statistic: "90% of professional developers use coding agents weekly at work", method: "Developer survey", caveat: "Self-reported; JetBrains user base", screens: ["S4"] },
  { id: "anthropic-ci-sep-2026", title: "Scaling CI when Claude writes the code", organisation: "Anthropic", date: "14 Sep 2026", url: "https://www.anthropic.com/engineering", statistic: "~80% of code by Claude · CI jobs 25× in six months · tests 10×", excerpt: "Writing code is no longer the constraint, and once PR review gets accelerated, CI starts feeling the pressure. — Sachin Malhotra", method: "Engineering blog, internal metrics", caveat: "One organisation's engineering setting", screens: ["S5"] },
  { id: "axios-cowork-jan-2026", title: "Claude Cowork built with Claude Code", organisation: "Axios", date: "Jan 2026", url: "https://www.axios.com", excerpt: "spent more time making product and architecture decisions than writing individual lines of code", method: "Press interview", caveat: "Team's own account; 'essentially all', not 100%", screens: ["S5"] },
  { id: "metr-jul-2025", title: "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", organisation: "METR", date: "Jul 2025", url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/", statistic: "Expected +24% · felt +20% · measured −19% (slower task time)", method: "RCT, 16 experienced OSS developers, 246 tasks", caveat: "Small sample; early-2025 tools; familiar codebases", screens: ["S6"] },
  { id: "cui-mgmt-sci", title: "The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers", organisation: "Cui et al., Management Science", date: "2025", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566", statistic: "+26% completed tasks; biggest gains for less-experienced developers", method: "Field RCTs, 4,867 developers", caveat: "Measures task completion, not quality", screens: ["S6"] },
  { id: "faros-apr-2026", title: "AI productivity paradox telemetry", organisation: "Faros AI", date: "Apr 2026", url: "https://www.faros.ai", statistic: "Bugs per developer +54% · time in review +441%", method: "Industry telemetry", caveat: "Vendor data; observational", screens: ["S6"] },
  { id: "dora-ai", title: "State of AI-assisted Software Development", organisation: "DORA (Google Cloud)", date: "2025", url: "https://dora.dev", excerpt: "AI is an amplifier", method: "Survey + modelling", caveat: "Correlational", screens: ["S6"] },
];

export const sourcesFor = (screenId: string) => sources.filter((s) => s.screens.includes(screenId));
