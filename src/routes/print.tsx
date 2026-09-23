import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SlideRenderer } from "@/components/deck/SlideRenderer";
import { slides } from "@/content/slides";

export const Route = createFileRoute("/print")({
  head: () => ({
    meta: [
      { title: "Print deck — Before You Put an AI Agent on Call" },
      {
        name: "description",
        content: "Printable version of the DevOpsDays Cairo 2026 talk, one slide per page.",
      },
      { property: "og:title", content: "Print deck — Before You Put an AI Agent on Call" },
      {
        property: "og:description",
        content: "Printable version of the DevOpsDays Cairo 2026 talk, one slide per page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintRoute,
});

function PrintRoute() {
  const [ready, setReady] = useState(false);
  const [withNotes, setWithNotes] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWithNotes(params.get("variant") === "notes");
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="print-root calm bg-terminal" data-print-ready={ready ? "true" : "false"}>
      <style>{`
        @page { size: 1920px 1080px; margin: 0 }
        .print-page { width: 1920px; height: 1080px; overflow: hidden; position: relative;
          break-after: page; page-break-after: always; print-color-adjust: exact;
          -webkit-print-color-adjust: exact }
        @media screen { .print-page { margin: 0 auto 24px; outline: 1px solid #2C4560 } }
      `}</style>

      {slides.map((s) => (
        <div key={s.id}>
          <div className="print-page">
            <SlideRenderer slide={s} step={s.steps} calm />
          </div>
          {withNotes ? (
            <div className="print-page bg-paper px-[120px] py-[110px] text-ink">
              <p className="font-mono text-[22px] tracking-[0.2em] text-teal">
                SLIDE {String(s.id).padStart(2, "0")} · CUE · {s.notes.cue}
              </p>
              <h2 className="mt-4 font-sans text-[54px] leading-[1.1] font-bold">
                {s.title.replace("\n", " ")}
              </h2>
              <p className="mt-8 font-sans text-[34px] leading-[1.5]">{s.notes.say}</p>
              {s.notes.fact ? (
                <p className="mt-8 font-serif text-[26px] italic text-gray-ink">{s.notes.fact}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
