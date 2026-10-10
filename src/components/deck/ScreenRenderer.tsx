import type { ComponentType } from "react";
import type { Screen } from "@/content/screens";
import { Eyebrow, Headline } from "@/components/kit";
import { S0, S1, S2 } from "@/components/screens/opening";
import { S3, S4, S5, S6 } from "@/components/screens/act1";
import { S7, S8, S9, S10, S11 } from "@/components/screens/act2";

export interface ScreenProps {
  screen: Screen;
  /** Current reveal step, 0..screen.steps. Render purely from this so Back restores state exactly. */
  step: number;
  /** Screen-local choice from keys 1–6. */
  choice: number | null;
}

/** Screen components register here by id ("S0".."S23"); later prompts fill this in. */
const REGISTRY: Partial<Record<string, ComponentType<ScreenProps>>> = { S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };

export function ScreenRenderer(props: ScreenProps & { replay?: number }) {
  const C = REGISTRY[props.screen.id] ?? PlaceholderScreen;
  return <C key={`${props.screen.id}-${props.replay ?? 0}`} {...props} />;
}

function PlaceholderScreen({ screen, step }: ScreenProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center p-[96px]">
      <Eyebrow>{screen.act}</Eyebrow>
      <Headline className="mt-[24px]">{screen.id}</Headline>
      <p className="mt-[24px] t-body text-muted">
        Screen content arrives in the next prompt · step {step}/{screen.steps}
      </p>
    </div>
  );
}
