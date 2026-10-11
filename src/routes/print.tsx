import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ScreenRenderer } from "@/components/deck/ScreenRenderer";
import { BlueprintFooter, BlueprintSections, BLUEPRINT_TITLE } from "@/components/blueprint/content";
import { screens } from "@/content/screens";
import { PrintMode } from "@/deck/print-mode";
import { isPaper } from "@/deck/theme";
import { SPEAKER } from "@/config";

declare global {
  interface Window {
    __PRINT_READY?: boolean;
  }
}

/** Fixed per-screen choices for the PDF state (S12: question 2 revealed). */
const PRINT_CHOICE: Record<string, number> = { S12: 2 };

export const Route = createFileRoute("/print")({
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
  component: PrintRoute,
});

function PrintRoute() {
  useEffect(() => {
    let cancelled = false;
    const wait = async () => {
      await document.fonts.ready;
      // let React commit every page, then wait for every image (QR tiles, monogram)
      await new Promise((r) => setTimeout(r, 300));
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((r) => {
                img.addEventListener("load", () => r(), { once: true });
                img.addEventListener("error", () => r(), { once: true });
              }),
        ),
      );
      await new Promise((r) => setTimeout(r, 400));
      if (!cancelled) {
        window.__PRINT_READY = true;
        document.body.dataset["printReady"] = "true";
      }
    };
    void wait();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PrintMode.Provider value>
      <div className="print-root">
        <style>{`
          @page { size: 1920px 1080px; margin: 0 }
          html, body { margin: 0; padding: 0; background: #F7F6F2 }
          .print-root *, .print-root *::before, .print-root *::after {
            animation: none !important; transition: none !important; }
          .print-root * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-page { width: 1920px; height: 1080px; overflow: hidden; position: relative;
            break-after: page; page-break-after: always; }
          .print-page.stage { background: #0F1B33; }
          .print-page.stage .glow { position:absolute; inset:0;
            background: radial-gradient(ellipse 70% 65% at 32% 30%, #1A2C52 0%, transparent 70%); }
          .print-bp { width: 1280px; zoom: 1.5; }
          .print-bp .bp-section { break-before: page; border-top: 0; }
          .print-bp .bp-avoid { break-inside: avoid; }
        `}</style>
        {screens.map((s) => (
          <div key={s.id} className={`print-page ${isPaper(s.id) ? "" : "stage"}`}>
            {isPaper(s.id) ? null : <div className="glow" aria-hidden />}
            <div className="absolute inset-0">
              <ScreenRenderer screen={s} choice={PRINT_CHOICE[s.id] ?? null} />
            </div>
          </div>
        ))}
        <div className="print-page theme-paper bg-bg font-sans text-text flex flex-col justify-center px-[160px]">
          <p className="t-tag text-muted">Resources</p>
          <h1 className="mt-[24px] t-display-l">{BLUEPRINT_TITLE}</h1>
          <p className="mt-[24px] t-body text-muted">{SPEAKER.name} · {SPEAKER.roles.join(" · ")}</p>
        </div>
        <div className="theme-paper bg-bg font-sans text-text">
          <div className="print-bp px-[64px]">
            <BlueprintSections />
            <div className="bp-section">
              <BlueprintFooter />
            </div>
          </div>
        </div>
      </div>
    </PrintMode.Provider>
  );
}
