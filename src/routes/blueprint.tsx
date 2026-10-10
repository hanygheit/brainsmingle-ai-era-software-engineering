import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DownloadPdfButton, QRTile } from "@/components/kit";
import { BRAINSMINGLE_URL, LINKEDIN_URL, PRESENTATION_URL, SPEAKER } from "@/config";
import cm from "@/content/careerMatrix.json";
import ddvo from "@/content/ddvo.json";
import assessment from "@/content/assessment.json";
import scorecard from "@/content/scorecard.json";
import { sources } from "@/content/sources";
import { screens } from "@/content/screens";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import qrPres from "@/assets/qr-presentation-ai-era-software-engineering.svg.asset.json";

const TITLE = "AI-Era Software Engineering — The Blueprint";
const DESC = "Learning plans, rubrics and the full skills matrix from the BrainsMingle AI Summit 2026 talk";

export const Route = createFileRoute("/blueprint")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Blueprint,
});

const STAGES = ["Student", "Fresh grad", "Junior", "Mid", "Senior", "Lead"];

const MATRIX: [string, number[]][] = [
  ["Foundations", [5, 5, 4, 3, 2, 2]],
  ["Manual implementation", [5, 4, 3, 2, 1, 1]],
  ["Debugging", [4, 5, 5, 4, 3, 2]],
  ["Testing", [3, 4, 5, 4, 3, 3]],
  ["Problem decomposition", [3, 3, 4, 5, 5, 4]],
  ["AI as tutor", [4, 4, 3, 2, 2, 2]],
  ["Agentic coding", [2, 3, 4, 5, 4, 3]],
  ["Context engineering", [1, 2, 3, 4, 5, 5]],
  ["AI validation", [3, 4, 5, 5, 5, 4]],
  ["System thinking", [1, 2, 3, 4, 5, 5]],
  ["Architecture", [1, 1, 2, 3, 5, 5]],
  ["Security", [2, 3, 3, 4, 5, 4]],
  ["Product/domain", [1, 2, 3, 4, 4, 5]],
  ["Engineering judgment", [2, 2, 3, 4, 5, 5]],
  ["Communication", [2, 3, 3, 4, 4, 5]],
  ["Ownership", [2, 3, 4, 4, 5, 5]],
];

const WEEKS: [string, string][] = [
  ["Weeks 1–2", "Fundamentals by hand — a small API built AI-off, explained."],
  ["Weeks 3–4", "One agent end to end — extend the API, with a process log."],
  ["Weeks 5–6", "Validation — an “AI mistakes I caught” write-up."],
  ["Weeks 7–8", "Change and explain — a design rationale and a mock debugging interview."],
];

const RUBRIC: [string, number][] = [
  ["Requirements & threat model", 15],
  ["Design", 20],
  ["Implementation", 15],
  ["Testing incl. negative tests", 20],
  ["Debugging & adaptation", 20],
  ["Ownership & oral defence", 10],
];

const STACK = [
  "Software fundamentals",
  "Engineering maturity",
  "Cloud & DevOps",
  "AI-native skills",
  "Domain knowledge",
  "Human skills",
];
const SOFT = [
  "Precise specification & communication",
  "Problem decomposition",
  "Verification & critical reading",
  "Product & business judgment",
];

const SECTIONS: [string, string][] = [
  ["matrix", "Skills matrix"],
  ["stages", "Stage plans"],
  ["graduate", "8-week plan"],
  ["rubric", "Rubric"],
  ["scorecard", "Scorecard"],
  ["ddvo", "Delegate · Own"],
  ["stack", "Learning stack"],
  ["repo", "Starter repo"],
  ["sources", "Sources"],
];

const DDVO_COLORS = ["var(--delegate)", "var(--direct)", "var(--validate)", "var(--own)"];

function Section({ id, letter, title, children }: { id: string; letter: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="bp-section scroll-mt-24 border-t border-line py-12">
      <p className="font-mono text-[13px] tracking-[0.14em] text-muted uppercase">({letter})</p>
      <h2 className="mt-2 font-display text-[28px] leading-tight font-bold sm:text-[34px]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Blueprint() {
  const bySlide = screens
    .map((s) => ({ s, list: sources.filter((x) => x.screens.includes(s.id)) }))
    .filter((g) => g.list.length);

  return (
    <main className="bp theme-paper min-h-dvh bg-bg font-sans text-text">
      <style>{`
        @media print {
          .bp-nav, .bp-noprint { display: none !important; }
          .bp, .bp-head { background: #F7F6F2 !important; }
          .bp-head { --bg:#F7F6F2; --text:#14161C; --muted:#5B616E; --line:#E3E1DA; box-shadow:none !important; }
          .bp * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .bp-section { break-before: page; break-inside: auto; }
          .bp-avoid { break-inside: avoid; }
          .bp-sticky { position: static !important; }
        }
      `}</style>
      <div className="bp-head theme-stage bg-bg" style={{ boxShadow: "none" }}>
      <header className="mx-auto max-w-6xl px-5 pt-10 pb-10 sm:px-8">
        <Link to="/present/$n" params={{ n: "0" }} className="bp-noprint font-mono text-[14px] text-muted hover:text-text">
          ← Back to the deck
        </Link>
        <h1 className="mt-6 font-display text-[36px] leading-[1.05] font-bold sm:text-[56px]">{TITLE}</h1>
        <p className="mt-4 max-w-3xl text-[18px] text-muted sm:text-[20px]">{DESC}</p>
        <p className="mt-4 text-[15px] text-text">
          {SPEAKER.name} · {SPEAKER.roles.join(" · ")}
        </p>
        <div className="bp-noprint mt-6">
          <DownloadPdfButton />
        </div>
      </header>
      </div>

      <nav className="bp-nav bp-sticky sticky top-0 z-20 border-y border-line bg-bg/95 backdrop-blur">
        <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 sm:px-8">
          {SECTIONS.map(([id, label], i) => (
            <li key={id} className="shrink-0">
              <a href={`#${id}`} className="block rounded-full border border-line px-3 py-1.5 font-mono text-[13px] text-muted hover:text-text">
                {String.fromCharCode(97 + i)} · {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Section id="matrix" letter="a" title="The full 16-capability emphasis matrix">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1 text-[14px]">
              <thead>
                <tr>
                  <th className="text-left font-mono text-[12px] text-muted uppercase">Capability</th>
                  {STAGES.map((s) => (
                    <th key={s} className="font-mono text-[12px] font-normal text-muted uppercase">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(([cap, vals]) => (
                  <tr key={cap}>
                    <td className="pr-3 text-text">{cap}</td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className="h-10 rounded text-center font-mono font-bold"
                        style={{
                          background: `color-mix(in oklab, var(--own) ${v * 18}%, var(--surface))`,
                          color: v >= 4 ? "var(--bg)" : "var(--text)",
                        }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-[13px] text-muted">Proposed learning emphasis, not skill scores.</p>
        </Section>

        <Section id="stages" letter="b" title="The six stage plans">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cm.panels.map((p, i) => (
              <article key={i} className="bp-avoid rounded-xl border border-line bg-surface p-5">
                <h3 className="font-display text-[22px] font-bold">{cm.tabs[i]}</h3>
                <p className="mt-1 font-mono text-[12px] text-muted">Delegation radius: {cm.radius[i]}</p>
                <p className="mt-4 font-mono text-[12px] text-direct uppercase">Your next 90 days</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                  {p.next.map((n) => <li key={n}>{n}</li>)}
                </ul>
                <p className="mt-4 font-mono text-[12px] text-validate uppercase">Never delegate</p>
                <p className="mt-1 text-[15px]">{p.never}</p>
                <p className="mt-4 font-mono text-[12px] text-own uppercase">Ready for next level when…</p>
                <p className="mt-1 text-[15px]">{p.ready}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="graduate" letter="c" title="The 8-week graduate plan">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKS.map(([w, t]) => (
              <li key={w} className="bp-avoid rounded-xl border border-line bg-surface p-5">
                <p className="font-mono text-[13px] text-direct">{w}</p>
                <p className="mt-2 text-[16px]">{t}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="rubric" letter="d" title="The weighted assessment rubric">
          <table className="w-full text-[15px]">
            <tbody>
              {RUBRIC.map(([k, w]) => (
                <tr key={k} className="border-b border-line">
                  <td className="py-3 pr-4">{k}</td>
                  <td className="w-1/2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 flex-1 rounded-full bg-surface">
                        <div className="h-3 rounded-full bg-validate-fill" style={{ width: `${(w / 20) * 100}%` }} />
                      </div>
                      <span className="w-10 text-right font-mono">{w}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {assessment.should.rows.map((r) => (
              <div key={r.to} className="bp-avoid rounded-xl border border-line bg-surface p-5">
                <p className="text-[14px] text-muted line-through">{r.from}</p>
                <p className="mt-1 font-display text-[19px] font-bold">{r.to}</p>
                <p className="mt-2 text-[15px] text-muted">{r.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="scorecard" letter="e" title="The five-layer scorecard">
          <ol className="space-y-2">
            {scorecard.layers.map(([name, ex, label], i) => (
              <li key={name} className="bp-avoid flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-line bg-surface p-4">
                <span className="font-mono text-[13px] text-muted">{i + 1}</span>
                <span className="font-display text-[20px] font-bold">{name}</span>
                <span className="text-[15px] text-muted">{ex}</span>
                {label ? (
                  <span className={`ml-auto font-mono text-[12px] tracking-[0.14em] ${label === "OUTCOMES" ? "text-own" : "text-muted"}`}>{label}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="ddvo" letter="f" title="Delegate / Direct / Validate / Own by stage">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[14px]">
              <thead>
                <tr>
                  <th className="p-2 text-left font-mono text-[12px] text-muted uppercase">Stage</th>
                  {ddvo.columns.map(([n], i) => (
                    <th key={n} className="p-2 text-left font-mono text-[12px] tracking-[0.12em]" style={{ color: DDVO_COLORS[i] }}>{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ddvo.rows.map((row, r) => (
                  <tr key={r} className="border-t border-line align-top">
                    <td className="p-2 font-bold">{ddvo.stages[r]}</td>
                    {row.map((c, i) => (
                      <td key={i} className="border-l-2 p-2" style={{ borderColor: DDVO_COLORS[i] }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="stack" letter="g" title="The layered learning stack">
          <div className="grid gap-8 lg:grid-cols-2">
            <ol className="flex flex-col-reverse gap-2">
              {STACK.map((l, i) => (
                <li
                  key={l}
                  className="rounded-lg border border-line p-4 text-center font-display text-[18px] font-bold"
                  style={{ background: `color-mix(in oklab, var(--direct) ${10 + i * 8}%, var(--surface))` }}
                >
                  {l}
                </li>
              ))}
            </ol>
            <div>
              <h3 className="font-display text-[22px] font-bold">Four soft skills that beat any framework</h3>
              <ul className="mt-4 space-y-2">
                {SOFT.map((s) => (
                  <li key={s} className="rounded-lg border border-line bg-surface p-4 text-[16px]">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="repo" letter="h" title="Starter repo for agentic practice">
          <a
            href="https://github.com/hanygheit/ai-agent-on-call"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[18px] break-all text-own underline underline-offset-4"
          >
            github.com/hanygheit/ai-agent-on-call
          </a>
          <p className="mt-3 text-[16px] text-muted">AGENTS.md, hooks and tests to practise L3–L5 delegation.</p>
        </Section>

        <Section id="sources" letter="i" title="All sources">
          <div className="space-y-8">
            {bySlide.map(({ s, list }) => (
              <div key={s.id} className="bp-avoid">
                <h3 className="font-mono text-[13px] tracking-[0.12em] text-muted uppercase">{s.id} · {s.title}</h3>
                <ul className="mt-3 space-y-2">
                  {list.map((x) => (
                    <li key={x.id} className="text-[15px]">
                      <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-text underline underline-offset-4 hover:text-direct">
                        {x.title}
                      </a>
                      <span className="text-muted"> — {x.organisation}, {x.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <footer className="bp-section border-t border-line py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-10 px-5">
          <QRTile url={LINKEDIN_URL} label="Connect on LinkedIn" image={qrLinkedin.url} size={180} />
          <QRTile url={BRAINSMINGLE_URL} label="Follow on BrainsMingle" image={qrBrains.url} size={180} />
          <QRTile url={PRESENTATION_URL} label="This presentation" image={qrPres.url} size={180} />
        </div>
      </footer>
    </main>
  );
}
