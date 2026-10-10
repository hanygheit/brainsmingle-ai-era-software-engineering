import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { MiniStage } from "@/components/deck/Stage";
import { ScreenRenderer } from "@/components/deck/ScreenRenderer";
import { screens } from "@/content/screens";
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
      { title: "Print — AI-Era Software Engineering" },
      { name: "description", content: "Print rendering of the AI-Era Software Engineering keynote." },
      { property: "og:title", content: "Print — AI-Era Software Engineering" },
      { property: "og:description", content: "Print rendering of the AI-Era Software Engineering keynote." },
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
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
      <div>
        <p className="font-mono text-[14px] tracking-[0.2em] text-muted">PRINT VIEW</p>
        <h1 className="mt-3 font-sans text-[28px] font-bold text-text">This link has expired.</h1>
        <p className="mt-2 font-sans text-[17px] text-muted">
          Use “Download PDF” in the deck to get the slides.
        </p>
      </div>
    </main>
  );
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
    <div className="print-root bg-bg">
      <style>{`
        @page { size: 1920px 1080px; margin: 0 }
        html, body { margin: 0; padding: 0; background: #0A0B0F }
        .print-root *, .print-root *::before, .print-root *::after {
          animation: none !important; transition: none !important; }
        .print-page { width: 1920px; height: 1080px; overflow: hidden; position: relative;
          break-after: page; page-break-after: always; print-color-adjust: exact;
          -webkit-print-color-adjust: exact; background: #0A0B0F; color: #F2F0EA }
        .print-page:last-child { break-after: auto; page-break-after: auto }
      `}</style>
      {screens.flatMap((s) => {
        const pages = [
          <div key={`s-${s.id}`} className="print-page">
            <ScreenRenderer screen={s} choice={null} />
          </div>,
        ];
        if (withNotes) {
          pages.push(
            <div key={`n-${s.id}`} className="print-page grid grid-cols-[760px_1fr] gap-[72px] p-[96px]">
              <div className="overflow-hidden rounded-lg border border-line self-start">
                <MiniStage width={760}>
                  <ScreenRenderer screen={s} choice={null} />
                </MiniStage>
              </div>
              <div>
                <p className="t-tag text-muted">{s.id} · {s.act}</p>
                <h2 className="mt-4 t-headline">{s.title}</h2>
                <p className="mt-6 t-body whitespace-pre-wrap">{s.notes}</p>
              </div>
            </div>,
          );
        }
        return pages;
      })}
    </div>
  );
}
