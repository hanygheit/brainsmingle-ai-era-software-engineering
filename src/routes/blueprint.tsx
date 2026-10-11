import { createFileRoute, Link } from "@tanstack/react-router";
import { DownloadPdfButton } from "@/components/kit";
import { EVENT, SPEAKER } from "@/config";
import { BrandBar, Pill } from "@/components/screens/shared";
import { BLUEPRINT_DESC as DESC, BLUEPRINT_TITLE as TITLE, BlueprintFooter, BlueprintSections, SECTIONS } from "@/components/blueprint/content";


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

function Blueprint() {

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
      <div className="bp-head theme-stage deck-room relative overflow-hidden bg-bg" style={{ boxShadow: "none", ["--ambient" as string]: "#5EE6AA" }}>
      <div className="room-backdrop bp-noprint" aria-hidden />
      <header className="relative mx-auto max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-12 sm:pb-16">
        <Link to="/present/$n" params={{ n: "0" }} className="bp-noprint font-mono text-[14px] text-muted hover:text-text">
          ← Back to the deck
        </Link>
        <div className="bp-noprint mt-8">
          <Pill size="page">{EVENT.name}</Pill>
        </div>
        <h1 className="mt-6 max-w-5xl font-display text-[36px] leading-[1.04] font-bold tracking-[-0.03em] [text-wrap:balance] sm:text-[60px]">{TITLE}</h1>
        <div className="bp-noprint mt-6">
          <BrandBar width={200} />
        </div>
        <p className="mt-6 max-w-3xl text-[18px] text-muted sm:text-[20px]">{DESC}</p>
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
        <BlueprintSections />
      </div>

      <BlueprintFooter />
    </main>
  );
}
