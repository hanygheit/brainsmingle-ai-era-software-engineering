import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrPres from "@/assets/qr-presentation-ai-era-software-engineering.svg.asset.json";
import {
  ArcMotif,
  AudienceCards,
  BarList,
  CodeDiff,
  DownloadPdfButton,
  Eyebrow,
  Headline,
  QRTile,
  QuoteCard,
  SourceTag,
  StatNumber,
  Terminal,
  ToggleSwitch,
} from "@/components/kit";
import { MiniStage } from "@/components/deck/Stage";
import { BRAINSMINGLE_URL, LINKEDIN_URL, POLL_IDS, PRESENTATION_URL, voteUrl } from "@/config";
import { POLL_CONTENT, usePollCounts } from "@/lib/poll";

export const Route = createFileRoute("/engine-test")({
  head: () => ({
    meta: [
      { title: "Engine test — AI-Era keynote components" },
      { name: "description", content: "Every keynote component, QR tile and live poll count in one place." },
      { property: "og:title", content: "Engine test — AI-Era keynote" },
      { property: "og:description", content: "Component and poll test bench." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EngineTest,
});

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-mono text-[13px] tracking-[0.14em] text-muted uppercase">{title}</h2>
      <div className="overflow-hidden rounded-lg border border-line">
        <MiniStage width={960}>
          <div className="relative h-full w-full p-[96px]">{children}</div>
        </MiniStage>
      </div>
    </section>
  );
}

function PollRow({ poll }: { poll: (typeof POLL_IDS)[number] }) {
  const { counts, online } = usePollCounts(poll);
  return (
    <div className="flex items-center gap-6">
      <QRTile url={voteUrl(poll)} label={`/vote?poll=${poll}`} size={180} />
      <div className="text-text">
        <p className="font-mono text-[13px] text-muted">
          {poll} · {online ? "live" : "offline"}
        </p>
        <p className="text-[16px]">{POLL_CONTENT[poll].question}</p>
        <p className="mt-2 font-mono text-[20px] tabular-nums">{counts.join(" · ")}</p>
      </div>
    </div>
  );
}

function EngineTest() {
  const [step, setStep] = useState(2);
  const [on, setOn] = useState(true);
  const lines = [
    { text: "$ npm test", status: "plain" as const },
    { text: "✓ 42 passed", status: "ok" as const },
    { text: "! 1 flaky", status: "warn" as const },
    { text: "✗ 1 failed", status: "fail" as const },
    { text: "done in 3.2s", status: "done" as const },
  ];
  return (
    <main className="min-h-dvh bg-bg px-6 py-10 font-sans text-text">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="mb-2 font-display text-[32px] font-bold">Engine test</h1>
        <p className="mb-8 text-muted">Sample text below is test data only. Step: {step}</p>
        <div className="mb-8 flex gap-2">
          <button className="rounded border border-line px-3 py-1" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            ← step
          </button>
          <button className="rounded border border-line px-3 py-1" onClick={() => setStep((s) => Math.min(5, s + 1))}>
            step →
          </button>
          <DownloadPdfButton />
        </div>

        <Frame title="Type · Eyebrow · Headline · SourceTag">
          <Eyebrow color="var(--accent)">Eyebrow tag</Eyebrow>
          <Headline size="xl" className="mt-[20px]">Display 96</Headline>
          <Headline size="l" className="mt-[12px]">Display 72</Headline>
          <Headline size="m" className="mt-[12px]">Display 56</Headline>
          <Headline size="headline" className="mt-[12px]">Headline 44</Headline>
          <p className="mt-[16px] t-body">Body 26 — readable in a 1280×720 window.</p>
          <p className="t-small text-muted">Small 18</p>
          <SourceTag>Sample Source · Oct 2026</SourceTag>
        </Frame>

        <Frame title="Framework colours · StatNumber · ArcMotif">
          <div className="flex gap-[60px]">
            {(["delegate", "direct", "validate", "own"] as const).map((c) => (
              <StatNumber key={c} value={step * 10} suffix="%" color={`var(--${c})`} label={c} />
            ))}
          </div>
          <div className="absolute right-[-120px] bottom-[-200px]">
            <ArcMotif key={step} count={6} radius={380} color="var(--line)" />
          </div>
        </Frame>

        <Frame title="QuoteCard (typographic fallback)">
          <QuoteCard quote="Sample quote for layout testing." speaker="Test Person" role="Role" source="Sample source" date="2026" />
        </Frame>

        <Frame title="Terminal (visible lines = step)">
          <Terminal lines={lines} visible={Math.min(step + 1, lines.length)} />
        </Frame>

        <Frame title="CodeDiff">
          <CodeDiff
            title="sample.ts"
            code={`// sample\nconst a = 1;\nconst b = "two";\nexport function sum() {\n  return a + 2;\n}`}
            highlightLines={[step]}
            added={[5]}
            removed={[2]}
          />
        </Frame>

        <Frame title="AudienceCards (tally + action) · ToggleSwitch">
          <ToggleSwitch on={on} onChange={setOn} label="Toggle" />
          <AudienceCards labels={["Option one", "Option two", "Option three"]} tally={[step, 3, 1]} action="Sample action text" active={on ? 1 : null} />
        </Frame>

        <Frame title="BarList">
          <BarList
            items={[
              { label: "Delegate", value: 2 + step, color: "var(--delegate)" },
              { label: "Direct", value: 5, color: "var(--direct)" },
              { label: "Validate", value: 7 - step, color: "var(--validate)" },
              { label: "Own", value: 4, color: "var(--own)" },
            ]}
          />
        </Frame>

        <section className="mb-10">
          <h2 className="mb-3 font-mono text-[13px] tracking-[0.14em] text-muted uppercase">Profile QR tiles (260 / 200 / 180)</h2>
          <div className="flex flex-wrap items-end gap-8 rounded-lg border border-line p-6">
            <QRTile url={LINKEDIN_URL} label="LinkedIn" size={260} image={qrLinkedin.url} />
            <QRTile url={BRAINSMINGLE_URL} label="BrainsMingle" size={200} image={qrBrains.url} />
            <QRTile url={PRESENTATION_URL} label="This presentation" size={180} image={qrPres.url} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 font-mono text-[13px] tracking-[0.14em] text-muted uppercase">Vote QR tiles · live counts</h2>
          <div className="space-y-6 rounded-lg border border-line p-6">
            {POLL_IDS.map((p) => (
              <PollRow key={p} poll={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
