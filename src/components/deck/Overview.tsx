import { slides } from "@/content/slides";
import { SECTIONS } from "@/content/types";
import { useDeck } from "@/deck/store";
import { Icon } from "./primitives";
import { MiniStage } from "./Stage";
import { SlideRenderer } from "./SlideRenderer";

export function OverviewGrid({ onClose }: { onClose?: () => void }) {
  const { index, goto, setOverlay } = useDeck();

  return (
    <div className="min-h-screen w-full overflow-auto bg-terminal px-10 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-sans text-[30px] font-bold text-white">
          Before You Put an AI Agent on Call
          <span className="ml-4 font-mono text-[16px] tracking-[0.18em] text-term-comment">
            {slides.length} SLIDES
          </span>
        </h1>
        {onClose ? (
          <button onClick={onClose} className="text-term-text hover:text-gold" aria-label="Close overview">
            <Icon name="x" size={28} />
          </button>
        ) : null}
      </div>

      {SECTIONS.map((section) => {
        const group = slides.filter((s) => s.section === section.id);
        if (group.length === 0) return null;
        return (
          <section key={section.id} className="mb-10">
            <h2 className="mb-4 font-mono text-[15px] tracking-[0.22em] text-gold">
              {section.label.toUpperCase()}
            </h2>
            <div className="flex flex-wrap gap-5">
              {group.map((s) => {
                const i = slides.indexOf(s);
                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        goto(i);
                        setOverlay(null);
                        onClose?.();
                      }
                    }}
                    onClick={() => {
                      goto(i);
                      setOverlay(null);
                      onClose?.();
                    }}
                    className={`border-2 text-left ${
                      i === index ? "border-gold" : "border-navy-line hover:border-taupe"
                    }`}
                    aria-label={`Slide ${s.id}: ${s.title}`}
                  >
                    <MiniStage width={320}>
                      <SlideRenderer slide={s} step={s.steps} calm />
                    </MiniStage>
                    <span className="block px-2 py-1 font-mono text-[13px] text-term-comment">
                      {String(s.id).padStart(2, "0")} · {s.title.replace("\n", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
