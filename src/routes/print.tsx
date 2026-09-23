import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { MiniStage } from "@/components/deck/Stage";
import { SlideRenderer } from "@/components/deck/SlideRenderer";
import { slides } from "@/content/slides";
import { SECTIONS } from "@/content/types";
import { PrintModeContext } from "@/deck/print-mode";
import { verifyPrintAccess } from "@/lib/presenter.functions";

const Search = z.object({
  variant: z.enum(["slides", "notes"]).catch("slides"),
  token: z.string().catch(""),
});

export const Route = createFileRoute("/print")({
  validateSearch: (s) => Search.parse(s),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) =>
    deps.token ? verifyPrintAccess({ data: { variant: deps.variant, token: deps.token } }) : { ok: false },
  head: () => ({
    meta: [
      { title: "Print deck — Before You Put an AI Agent on Call" },
      { name: "description", content: "Print rendering of the DevOpsDays Cairo 2026 talk." },
      { property: "og:title", content: "Print deck — Before You Put an AI Agent on Call" },
      { property: "og:description", content: "Print rendering of the DevOpsDays Cairo 2026 talk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: () => <Denied />,
  notFoundComponent: () => <Denied />,
  component: PrintRoute,
});

function Denied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-terminal px-6 text-center">
      <div>
        <p className="font-mono text-[14px] tracking-[0.2em] text-gold">PRINT VIEW</p>
        <h1 className="mt-3 font-sans text-[28px] font-bold text-white">This link has expired.</h1>
        <p className="mt-2 font-sans text-[17px] text-term-comment">
          Use “Download PDF” in the deck to get the slides.
        </p>
      </div>
    </main>
  );
}

function fmtSec(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function PrintRoute() {
  const access = Route.useLoaderData();
  const { variant } = Route.useSearch();
  const withNotes = variant === "notes";

  useEffect(() => {
    if (!access.ok) return;
    let cancelled = false;
    const imgs = Array.from(document.images);
    Promise.all([
      document.fonts.ready,
      ...imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((r) => {
              img.addEventListener("load", () => r(), { once: true });
              img.addEventListener("error", () => r(), { once: true });
            }),
      ),
      new Promise((r) => setTimeout(r, 300)),
    ]).then(() => {
      if (!cancelled) document.body.dataset["printReady"] = "true";
    });
    return () => {
      cancelled = true;
    };
  }, [access.ok]);

  if (!access.ok) return <Denied />;

  return (
    <PrintModeContext.Provider value={true}>
      <div className="print-root calm bg-terminal">
        <style>{`
          @page { size: 1920px 1080px; margin: 0 }
          html, body { margin: 0; padding: 0; background: #0F1C2B }
          .print-root *, .print-root *::before, .print-root *::after {
            animation: none !important; transition: none !important; }
          .print-page { width: 1920px; height: 1080px; overflow: hidden; position: relative;
            break-after: page; page-break-after: always; print-color-adjust: exact;
            -webkit-print-color-adjust: exact }
          .print-page:last-child { break-after: auto; page-break-after: auto }
          @media screen { .print-page { margin: 0 auto 24px; outline: 1px solid #2C4560 } }
        `}</style>

        {slides.flatMap((s) => {
          const pages = [
            <div key={`s-${s.id}`} className="print-page">
              <SlideRenderer slide={s} step={s.steps} calm />
            </div>,
          ];
          if (withNotes) {
            const section = SECTIONS.find((x) => x.id === s.section);
            pages.push(
              <div
                key={`n-${s.id}`}
                className="print-page grid grid-cols-[760px_1fr] gap-[72px] bg-paper px-[96px] py-[96px] text-ink"
              >
                <div className="flex flex-col gap-5">
                  <div className="border border-line">
                    <MiniStage width={760}>
                      <SlideRenderer slide={s} step={s.steps} calm />
                    </MiniStage>
                  </div>
                  <p className="font-mono text-[20px] tracking-[0.2em] text-teal">
                    SLIDE {String(s.id).padStart(2, "0")} / {slides.length} ·{" "}
                    {section?.label.toUpperCase()}
                  </p>
                  <p className="font-mono text-[20px] tracking-[0.14em] text-gray-ink">
                    TARGET {fmtSec(s.notes.targetSec)}
                    {s.notes.skipIfLate ? "  ·  SKIP IF LATE" : ""}
                  </p>
                </div>
                <div className="flex min-h-0 flex-col">
                  <div className="flex items-center gap-4">
                    <span className="block h-[3px] w-[38px] bg-gold" />
                    <span className="font-mono text-[20px] tracking-[0.24em] text-teal uppercase">
                      Cue · {s.notes.cue}
                    </span>
                  </div>
                  <h2 className="mt-5 font-sans text-[44px] leading-[1.12] font-bold">
                    {s.title.replace("\n", " ")}
                  </h2>
                  <p className="mt-7 font-sans text-[27px] leading-[1.5]">{s.notes.say}</p>
                  {s.notes.fact ? (
                    <p className="mt-auto border-l-[3px] border-gold pl-5 font-serif text-[21px] leading-[1.45] italic text-gray-ink">
                      {s.notes.fact}
                    </p>
                  ) : null}
                </div>
              </div>,
            );
          }
          return pages;
        })}
      </div>
    </PrintModeContext.Provider>
  );
}
