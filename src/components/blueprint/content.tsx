import type { ReactNode } from "react";
import { QRTile } from "@/components/kit";
import { BRAINSMINGLE_URL, LINKEDIN_URL, PRESENTATION_URL } from "@/config";
import cm from "@/content/careerMatrix.json";
import ddvo from "@/content/ddvo.json";
import assessment from "@/content/assessment.json";
import scorecard from "@/content/scorecard.json";
import plans from "@/content/plans.json";
import { stopColors } from "@/deck/theme";
import { sources } from "@/content/sources";
import { screens } from "@/content/screens";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import qrPres from "@/assets/qr-presentation-ai-era-software-engineering.svg.asset.json";


export const BLUEPRINT_TITLE = "AI-Era Software Engineering — The Blueprint";
export const BLUEPRINT_DESC = "Plans by role, learning plans, rubrics and the full skills matrix from the BrainsMingle AI Summit 2026 talk";

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

export const SECTIONS: [string, string][] = [
  ["plans", "Plans by role"],
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

/** Sections (a)–(j), shared by /blueprint and the PDF pages in /print. */
export function BlueprintSections() {
  const bySlide = screens
    .map((s) => ({ s, list: sources.filter((x) => x.screens.includes(s.id)) }))
    .filter((g) => g.list.length);
  return (
    <>
        <Section id="plans" letter="a" title="Plans by role — the action behind every stop">
          <p className="max-w-3xl text-[16px] text-muted">{plans.intro}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {plans.roles.map((r) => {
              const { fill } = stopColors(r.stop);
              const ink = `color-mix(in oklab, ${fill} 72%, #14161C)`;
              return (
                <article key={r.id} className="bp-avoid rounded-xl border border-t-4 border-line bg-surface p-5" style={{ borderTopColor: fill }}>
                  <h3 className="font-display text-[22px] font-bold" style={{ color: ink }}>{r.title}</h3>
                  <p className="mt-2 rounded-lg px-3 py-2 text-[15px] font-semibold" style={{ background: `color-mix(in oklab, ${fill} 9%, var(--surface))` }}>
                    <span className="mr-2 font-mono text-[11px] tracking-[0.16em]" style={{ color: ink }}>ACTION</span>
                    {r.action}
                  </p>
                  {r.blocks.map(([h, items]) => (
                    <div key={h as string} className="mt-4">
                      <p className="font-mono text-[12px] tracking-[0.12em] uppercase" style={{ color: ink }}>{h as string}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                        {(items as string[]).map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
          <h3 className="mt-10 font-display text-[22px] font-bold">{plans.toolsTitle}</h3>
          <table className="mt-3 w-full text-[15px]">
            <tbody>
              {plans.tools.map(([k, v]) => (
                <tr key={k} className="border-b border-line align-top">
                  <td className="w-[200px] py-3 pr-4 font-mono text-[12px] tracking-[0.12em] text-muted uppercase">{k}</td>
                  <td className="py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section id="matrix" letter="b" title="The full 16-capability emphasis matrix">
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

        <Section id="stages" letter="c" title="The six stage plans">
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

        <Section id="graduate" letter="d" title="The 8-week graduate plan">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKS.map(([w, t]) => (
              <li key={w} className="bp-avoid rounded-xl border border-line bg-surface p-5">
                <p className="font-mono text-[13px] text-direct">{w}</p>
                <p className="mt-2 text-[16px]">{t}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="rubric" letter="e" title="The weighted assessment rubric">
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

        <Section id="scorecard" letter="f" title="The five-layer scorecard">
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

        <Section id="ddvo" letter="g" title="Delegate / Direct / Validate / Own by stage">
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

        <Section id="stack" letter="h" title="The layered learning stack">
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

        <Section id="repo" letter="i" title="Starter repo for agentic practice">
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

        <Section id="sources" letter="j" title="All sources">
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
    </>
  );
}

export function BlueprintFooter() {
  return (
      <footer className="bp-section border-t border-line py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-10 px-5">
          <QRTile url={LINKEDIN_URL} label="Connect on LinkedIn" image={qrLinkedin.url} size={180} />
          <QRTile url={BRAINSMINGLE_URL} label="Follow on BrainsMingle" image={qrBrains.url} size={180} />
          <QRTile url={PRESENTATION_URL} label="This presentation" image={qrPres.url} size={180} />
        </div>
      </footer>
  );
}
