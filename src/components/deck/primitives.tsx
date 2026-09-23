import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { ReactNode } from "react";
import arcsDark from "@/assets/arcs-on-dark.png.asset.json";
import arcsLight from "@/assets/arcs-on-light.png.asset.json";
import monogram from "@/assets/hs-monogram.png.asset.json";
import qr from "@/assets/linkedin-qr.png.asset.json";
import type { SlideBg } from "@/content/types";
import { SPEAKER } from "@/content/types";

export const ASSETS = { arcsDark, arcsLight, monogram, qr };

export const isDark = (bg: SlideBg) => bg === "navy";

export function bgClass(bg: SlideBg) {
  switch (bg) {
    case "navy":
      return "bg-navy";
    case "paper":
      return "bg-paper";
    case "cream":
      return "bg-cream";
    case "amber":
      return "bg-gold-bg";
  }
}

/* ---------------------------------------------------------------- icons */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = Icons as unknown as Record<string, any>;

function pascal(name: string) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function Icon({
  name,
  size = 32,
  className = "",
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = iconMap[pascal(name)] ?? iconMap['Circle'];
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

/* ------------------------------------------------------------ signature */

export function Kicker({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <span className="block h-[3px] w-[38px] bg-gold" />
      <span
        className={`font-mono text-[20px] font-medium tracking-[0.3em] uppercase ${
          dark ? "text-term-text" : "text-teal"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export function Title({
  children,
  dark,
  size = 66,
  className = "",
}: {
  children: ReactNode;
  dark?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <h1
      className={`font-sans font-bold leading-[1.08] tracking-[-0.02em] ${
        dark ? "text-white" : "text-ink"
      } ${className}`}
      style={{ fontSize: size }}
    >
      {children}
    </h1>
  );
}

export function Footer({ right, dark }: { right?: string; dark?: boolean }) {
  return (
    <div
      className={`absolute right-[64px] bottom-[34px] left-[64px] flex items-center justify-between font-mono text-[15px] tracking-[0.2em] uppercase ${
        dark ? "text-navy-line" : "text-taupe-light"
      }`}
    >
      <span>{SPEAKER.talk}</span>
      {right ? <span>{right}</span> : null}
    </div>
  );
}

export function SourceLine({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`absolute right-[64px] bottom-[74px] left-[64px] font-mono text-[13px] ${
        dark ? "text-navy-line" : "text-taupe-light"
      }`}
    >
      Source: {children}
    </p>
  );
}

export function Arcs({ dark, calm }: { dark?: boolean; calm?: boolean }) {
  return (
    <motion.img
      src={dark ? arcsDark.url : arcsLight.url}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute -top-[220px] -right-[260px] w-[1150px] opacity-90 select-none"
      initial={calm ? false : { opacity: 0, rotate: -3 }}
      animate={{ opacity: 0.9, rotate: 0 }}
      transition={{ duration: 2.2, ease: "easeOut" }}
    />
  );
}

export function IconDisc({
  name,
  size = 76,
  tone = "gold",
}: {
  name: string;
  size?: number;
  tone?: "gold" | "white" | "navy";
}) {
  const bg = tone === "gold" ? "bg-gold" : tone === "white" ? "bg-white" : "bg-navy-card";
  const fg = tone === "navy" ? "text-gold" : "text-navy";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${bg} ${fg}`}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={size * 0.45} strokeWidth={2.2} />
    </span>
  );
}

export function Chip({
  children,
  tone = "sand",
  className = "",
}: {
  children: ReactNode;
  tone?: "sand" | "ok" | "gold" | "deny" | "navy" | "teal";
  className?: string;
}) {
  const tones: Record<string, string> = {
    sand: "bg-sand text-ink",
    ok: "bg-ok text-white",
    gold: "bg-gold text-navy",
    deny: "bg-deny text-white",
    navy: "bg-navy-card text-term-text",
    teal: "bg-teal text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-[6px] font-mono text-[18px] font-medium tracking-[0.16em] uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- terminal */

export function TerminalWindow({
  title,
  children,
  className = "",
  style,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`flex flex-col overflow-hidden bg-terminal ${className}`} style={style}>
      <div className="flex items-center gap-3 bg-navy-card px-6 py-[14px]">
        <span className="h-[12px] w-[12px] rounded-full bg-term-error" />
        <span className="h-[12px] w-[12px] rounded-full bg-gold" />
        <span className="h-[12px] w-[12px] rounded-full bg-term-ok" />
        <span className="ml-4 font-mono text-[17px] text-term-comment">{title}</span>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-auto px-7 py-6 font-mono text-[21px] leading-[1.62] text-term-text">
        {children}
      </div>
    </div>
  );
}

export function BigNumeral({
  children,
  size = 320,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`font-serif leading-[0.8] font-bold text-gold ${className}`}
      style={{ fontSize: size }}
    >
      {children}
    </span>
  );
}

export function Monogram({ size = 56 }: { size?: number }) {
  return (
    <img src={monogram.url} alt="HS monogram" style={{ width: size, height: size }} />
  );
}

export function LinkedInQR({ size = 150, caption = true }: { size?: number; caption?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2">
        <img src={qr.url} alt="LinkedIn QR code for Hany Saad" style={{ width: size, height: size }} />
      </div>
      {caption ? (
        <span className="font-mono text-[13px] tracking-[0.12em] text-taupe-light">
          Connect on LinkedIn
        </span>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- motion */

export const rise = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export function Reveal({
  show,
  children,
  delay = 0,
  className = "",
}: {
  show: boolean;
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.35, delay: show ? delay : 0, ease: "easeOut" }}
      aria-hidden={!show}
    >
      {children}
    </motion.div>
  );
}
