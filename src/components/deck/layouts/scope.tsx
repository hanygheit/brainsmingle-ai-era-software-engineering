import { motion } from "framer-motion";
import { Reveal } from "../primitives";
import { SlideFrame, type LayoutProps } from "./frame";

const TONE: Record<string, string> = {
  gold: "#E39A16",
  teal: "#1D6F8B",
  deny: "#B5443A",
};

export function BranchesSlide({ slide, step, calm }: LayoutProps) {
  const d = slide.data as {
    mainLabel: string;
    branches: { name: string; worktree: string; status: string; tone: string }[];
    tiles: string[];
  };

  const mainY = 420;
  const rowH = 110;

  return (
    <SlideFrame slide={slide} calm={calm} titleSize={58}>
      <div className="flex h-full flex-col gap-[24px]">
        <div className="relative min-h-0 flex-1">
          <svg viewBox="0 0 1600 500" className="h-full w-full" role="img" aria-label="Git graph">
            {/* main line */}
            <motion.line
              x1="40"
              y1={mainY}
              x2="1560"
              y2={mainY}
              stroke="#132038"
              strokeWidth="8"
              initial={calm ? false : { pathLength: 0 }}
              animate={{ pathLength: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            />
            <text x="40" y={mainY + 42} className="fill-[#6B7381] font-mono" fontSize="20">
              main — {d.mainLabel}
            </text>
            {[120, 420, 780, 1180, 1500].map((x) => (
              <circle key={x} cx={x} cy={mainY} r="10" fill="#132038" />
            ))}

            {d.branches.map((b, i) => {
              const y = mainY - rowH * (i + 1);
              const startX = 240 + i * 120;
              const endX = 980 + i * 180;
              const color = TONE[b.tone] ?? "#E39A16";
              const show = step >= 2;
              return (
                <motion.g
                  key={b.name}
                  initial={calm ? false : { opacity: 0 }}
                  animate={{ opacity: show ? 1 : 0 }}
                  transition={{ delay: show && !calm ? i * 0.35 : 0, duration: 0.4 }}
                >
                  <path
                    d={`M ${startX} ${mainY} C ${startX + 60} ${mainY}, ${startX + 60} ${y}, ${startX + 130} ${y} L ${endX} ${y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                  />
                  {b.status === "merged" ? (
                    <path
                      d={`M ${endX} ${y} C ${endX + 80} ${y}, ${endX + 80} ${mainY}, ${endX + 160} ${mainY}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="6"
                      strokeDasharray="6 8"
                    />
                  ) : null}
                  {[startX + 200, startX + 340, startX + 480].map((cx) => (
                    <circle key={cx} cx={cx} cy={y} r="9" fill={color} />
                  ))}
                  <text x={startX + 135} y={y - 22} className="font-mono" fontSize="22" fill="#132038">
                    {b.name}
                  </text>
                  <text x={startX + 135} y={y + 34} className="font-mono" fontSize="17" fill="#9C8E76">
                    {b.worktree}
                  </text>
                  <rect x={endX + 18} y={y - 22} width={b.status.length * 13 + 26} height="40" fill={color} />
                  <text
                    x={endX + 31}
                    y={y + 5}
                    className="font-mono"
                    fontSize="18"
                    fill="#FBF9F6"
                    letterSpacing="2"
                  >
                    {b.status.toUpperCase()}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        <Reveal show={step >= 3} className="grid shrink-0 grid-cols-5 gap-[14px]">
          {d.tiles.map((t) => (
            <div key={t} className="bg-sand p-[18px] font-sans text-[19px] leading-[1.3] text-ink">
              {t}
            </div>
          ))}
        </Reveal>
      </div>
    </SlideFrame>
  );
}
