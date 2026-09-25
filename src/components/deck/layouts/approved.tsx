import { Reveal } from "../primitives";
import { SlideFrame, type LayoutProps } from "./frame";

/** The audience question is deliberately separate from the nine-second reveal. */
export function OpeningQuestionSlide({ slide, calm }: LayoutProps) {
  return (
    <SlideFrame slide={slide} calm={calm} showHeader={false}>
      <div className="flex h-full flex-col justify-center">
        <p className="mb-[70px] font-mono text-[23px] tracking-[0.24em] text-gold">{slide.kicker}</p>
        <h1 className="max-w-[1560px] font-serif text-[85px] leading-[1.13] font-bold text-white">
          How long does it take an AI coding agent to delete a production database —
          <br />
          <span className="italic text-gold">and its backups?</span>
        </h1>
        <p className="mt-[100px] font-mono text-[29px] font-bold tracking-[0.24em] text-white">Shout a number.</p>
      </div>
    </SlideFrame>
  );
}

/** Replay the incident against the controls, without changing the customised final slide. */
export function RewindSlide({ slide, calm }: LayoutProps) {
  const rows = slide.data?.rows as { time: string; action: string; control: string; rule: string }[];
  return (
    <SlideFrame slide={slide} calm={calm} titleSize={55}>
      <div className="flex h-full flex-col gap-[15px]">
        <div className="grid grid-cols-[135px_1fr_1fr] gap-5 font-mono text-[17px] tracking-[0.18em] text-gold">
          <span />
          <span>WHAT THE AGENT DID</span>
          <span>WHAT STOPS IT</span>
        </div>
        {rows.map((row) => (
          <div key={row.time} className="grid flex-1 grid-cols-[135px_1fr_1fr] items-stretch gap-5">
            <span className="self-center font-mono text-[29px] font-bold text-gold">{row.time}</span>
            <div className="flex items-center border border-[#694343] bg-[#392d34] px-7 font-sans text-[27px] leading-[1.3] text-gray-light">
              {row.action}
            </div>
            <div className="flex items-center gap-5 border border-[#3a6758] bg-[#203f3d] px-6 font-sans text-[26px] leading-[1.3] font-bold text-white">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ok text-[25px]">✓</span>
              <span className="flex-1">{row.control}</span>
              <span className="font-mono text-[17px] text-gray-light">{row.rule}</span>
            </div>
          </div>
        ))}
        <Reveal show className="flex items-baseline gap-10 pt-[28px]">
          <span className="font-mono text-[33px] font-bold text-gold">00:09</span>
          <span className="font-serif text-[49px] font-bold text-white">Nothing happened.</span>
          <span className="font-serif text-[28px] italic text-gold">The best AI incident report is the boring one.</span>
        </Reveal>
      </div>
    </SlideFrame>
  );
}