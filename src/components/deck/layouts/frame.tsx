import type { ReactNode } from "react";
import type { Slide } from "@/content/types";
import { SECTIONS } from "@/content/types";
import { Arcs, Footer, Kicker, SourceLine, Title, bgClass, isDark } from "../primitives";

export interface LayoutProps {
  slide: Slide;
  step: number;
  calm: boolean;
  onGoto?: ((index: number) => void) | undefined;
}

export function SlideFrame({
  slide,
  children,
  calm,
  showHeader = true,
  titleSize = 66,
  className = "",
}: {
  slide: Slide;
  children: ReactNode;
  calm: boolean;
  showHeader?: boolean;
  titleSize?: number;
  className?: string;
}) {
  const dark = isDark(slide.bg);
  const section = SECTIONS.find((s) => s.id === slide.section);
  return (
    <div className={`relative h-full w-full ${bgClass(slide.bg)} ${className}`}>
      {slide.bg !== "amber" ? <Arcs dark={dark} calm={!!calm} /> : null}
      <div className="relative z-10 flex h-full w-full flex-col px-[84px] pt-[74px] pb-[110px]">
        {showHeader ? (
          <header className="mb-[26px] shrink-0">
            <Kicker dark={dark}>{slide.kicker}</Kicker>
          </header>
        ) : null}
        {showHeader && slide.title && !["bigNumber", "close", "title"].includes(slide.layout) ? (
          <Title dark={dark} size={titleSize} className="mb-[30px] shrink-0">
            {slide.title}
          </Title>
        ) : null}
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>
      {slide.sources ? <SourceLine dark={dark}>{slide.sources}</SourceLine> : null}
      <Footer dark={dark} right={section?.short ?? ""} />
    </div>
  );
}
