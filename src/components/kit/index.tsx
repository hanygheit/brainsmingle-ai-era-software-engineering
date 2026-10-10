import { animate, motion, useReducedMotion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PDF_FILENAME } from "@/config";
import { exportPdf } from "@/lib/export-pdf.functions";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- type ---------- */
export function Eyebrow({ children, color = "var(--muted)" }: { children: ReactNode; color?: string }) {
  return (
    <p className="t-tag" style={{ color }}>
      {children}
    </p>
  );
}

export function Headline({
  children,
  size = "l",
  className = "",
}: {
  children: ReactNode;
  size?: "xl" | "l" | "m" | "headline";
  className?: string;
}) {
  const cls = { xl: "t-display-xl", l: "t-display-l", m: "t-display-m", headline: "t-headline" }[size];
  return <h2 className={`${cls} text-text ${className}`}>{children}</h2>;
}

export function SourceTag({ children }: { children: ReactNode }) {
  return <p className="t-small absolute right-[96px] bottom-[40px] font-mono text-muted">{children}</p>;
}

/* ---------- QuoteCard ---------- */
export function QuoteCard({
  quote,
  speaker,
  role,
  source,
  date,
  photo,
}: {
  quote: string;
  speaker: string;
  role: string;
  source: string;
  date: string;
  photo?: string;
}) {
  const initials = speaker
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <figure className="flex max-w-[1200px] gap-[40px] rounded-[20px] border border-line bg-surface p-[48px]">
      {photo ? (
        <img src={photo} alt={speaker} className="h-[120px] w-[120px] shrink-0 rounded-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border border-line font-display text-[44px] font-bold text-muted"
        >
          {initials}
        </div>
      )}
      <div>
        <blockquote className="t-headline text-text">“{quote}”</blockquote>
        <figcaption className="mt-[24px] t-body">
          <span className="font-semibold text-text">{speaker}</span>
          <span className="text-muted"> · {role}</span>
          <span className="mt-[6px] block t-small font-mono text-muted">
            {source} · {date}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

/* ---------- StatNumber (700 ms count-up) ---------- */
export function StatNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  color = "var(--text)",
  label,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  label?: string;
}) {
  const reduce = useReducedMotion();
  // First render always shows the final value (deep link, reload, print, reduced motion);
  // only later value changes count up, with a 1 s fallback that forces the final value.
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (reduce || from === value) return setShown(value);
    const c = animate(from, value, { duration: 0.7, ease: EASE, onUpdate: setShown, onComplete: () => setShown(value) });
    const t = setTimeout(() => setShown(value), 1000);
    return () => {
      c.stop();
      clearTimeout(t);
      setShown(value);
    };
  }, [value, reduce]);
  return (
    <div>
      <p className="t-display-xl tabular-nums" style={{ color }}>
        {prefix}
        {shown.toFixed(decimals)}
        {suffix}
      </p>
      {label ? <p className="mt-[12px] t-body text-muted">{label}</p> : null}
    </div>
  );
}

/* ---------- ArcMotif ---------- */
export function ArcMotif({
  count = 5,
  radius = 420,
  color = "var(--line)",
  className = "",
}: {
  count?: number;
  radius?: number;
  color?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const size = radius * 2 + 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const r = (radius * (i + 1)) / count;
        return (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            initial={reduce ? { r, opacity: 0 } : { r: r * 0.6, opacity: 0 }}
            animate={{ r, opacity: 1 }}
            transition={reduce ? { duration: 0.15 } : { duration: 0.7, ease: EASE, delay: i * 0.06 }}
          />
        );
      })}
    </svg>
  );
}

/* ---------- Terminal ---------- */
export type TermStatus = "ok" | "warn" | "fail" | "done" | "plain";
const STATUS_COLOR: Record<TermStatus, string> = {
  ok: "var(--own)",
  warn: "var(--validate)",
  fail: "var(--fail)",
  done: "var(--direct)",
  plain: "var(--text)",
};
/** Shows `visible` lines (deterministic per step); the last visible line types in. */
export function Terminal({
  lines,
  visible = lines.length,
  title = "terminal",
}: {
  lines: { text: string; status?: TermStatus }[];
  visible?: number;
  title?: string;
}) {
  const reduce = useReducedMotion();
  const shown = lines.slice(0, visible);
  return (
    <div className="w-[1100px] overflow-hidden rounded-[16px] border border-line bg-surface">
      <div className="flex items-center gap-[10px] border-b border-line px-[24px] py-[14px]">
        <span className="h-[12px] w-[12px] rounded-full bg-line" />
        <span className="h-[12px] w-[12px] rounded-full bg-line" />
        <span className="h-[12px] w-[12px] rounded-full bg-line" />
        <span className="ml-[12px] t-tag text-muted">{title}</span>
      </div>
      <div className="space-y-[8px] p-[28px] font-mono text-[24px] leading-[1.4]">
        {shown.map((l, i) => (
          <TypedLine key={i} text={l.text} color={STATUS_COLOR[l.status ?? "plain"]} animate={!reduce && i === shown.length - 1} />
        ))}
        <span className="inline-block h-[26px] w-[13px] translate-y-[4px] animate-pulse bg-text" aria-hidden />
      </div>
    </div>
  );
}
function TypedLine({ text, color, animate: doType }: { text: string; color: string; animate: boolean }) {
  const [n, setN] = useState(doType ? 0 : text.length);
  useEffect(() => {
    if (!doType) return setN(text.length);
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 2)), 16);
    return () => clearInterval(id);
  }, [text, doType]);
  return (
    <p style={{ color }} className="whitespace-pre-wrap">
      {text.slice(0, n)}
    </p>
  );
}

/* ---------- CodeDiff ---------- */
const TOKEN = /(\/\/.*$|#.*$|"[^"]*"|'[^']*'|`[^`]*`|\b(?:const|let|function|return|if|else|for|await|async|import|from|export|def|class|new)\b|\b\d+\b)/gm;
function highlight(line: string) {
  const out: ReactNode[] = [];
  let last = 0;
  line.replace(TOKEN, (m, _g, idx: number) => {
    out.push(line.slice(last, idx));
    const color = /^(\/\/|#)/.test(m)
      ? "var(--muted)"
      : /^["'`]/.test(m)
        ? "var(--own)"
        : /^\d/.test(m)
          ? "var(--validate)"
          : "var(--direct)";
    out.push(
      <span key={idx} style={{ color }}>
        {m}
      </span>,
    );
    last = idx + m.length;
    return m;
  });
  out.push(line.slice(last));
  return out;
}
export function CodeDiff({
  code,
  highlightLines = [],
  added = [],
  removed = [],
  title,
}: {
  code: string;
  highlightLines?: number[];
  added?: number[];
  removed?: number[];
  title?: string;
}) {
  return (
    <div className="w-[1100px] overflow-hidden rounded-[16px] border border-line bg-surface">
      {title ? <div className="border-b border-line px-[24px] py-[14px] t-tag text-muted">{title}</div> : null}
      <pre className="py-[20px] font-mono text-[22px] leading-[1.55]">
        {code.split("\n").map((l, i) => {
          const n = i + 1;
          const bg = added.includes(n)
            ? "color-mix(in oklab, var(--own) 14%, transparent)"
            : removed.includes(n)
              ? "color-mix(in oklab, var(--fail) 14%, transparent)"
              : highlightLines.includes(n)
                ? "color-mix(in oklab, var(--validate) 14%, transparent)"
                : "transparent";
          return (
            <div key={i} className="flex px-[24px] transition-colors duration-300" style={{ background: bg }}>
              <span className="w-[56px] shrink-0 text-muted select-none">{n}</span>
              <span className="w-[28px] shrink-0 text-muted">{added.includes(n) ? "+" : removed.includes(n) ? "−" : ""}</span>
              <code className="text-text">{highlight(l)}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* ---------- AudienceCards ---------- */
/** Three numbered cards at fixed positions, reused across screens. */
export function AudienceCards({
  labels,
  tally,
  action,
  active = null,
}: {
  labels: [string, string, string] | string[];
  tally?: number[];
  action?: string;
  active?: number | null;
}) {
  const total = tally ? tally.reduce((a, b) => a + b, 0) : 0;
  return (
    <div className="absolute right-[96px] bottom-[150px] left-[96px]">
      <div className="grid grid-cols-3 gap-[32px]">
        {[0, 1, 2].map((i) => {
          const pct = total ? Math.round(((tally?.[i] ?? 0) / total) * 100) : 0;
          const on = active === i + 1;
          return (
            <div
              key={i}
              className="relative min-h-[260px] overflow-hidden rounded-[20px] border bg-surface p-[36px] transition-colors duration-300"
              style={{ borderColor: on ? "var(--accent)" : "var(--line)" }}
            >
              <p className="font-display text-[56px] font-bold text-muted">{i + 1}</p>
              <p className="mt-[12px] t-body text-text">{labels[i]}</p>
              {tally ? (
                <div className="mt-[20px]">
                  <div className="h-[6px] w-full rounded-full bg-line">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </div>
                  <p className="mt-[10px] t-small font-mono text-muted tabular-nums">
                    {tally[i] ?? 0} · {pct}%
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {action ? <p className="mt-[28px] text-center t-body text-muted">{action}</p> : null}
    </div>
  );
}

/* ---------- BarList ---------- */
export function BarList({
  items,
  max,
  color = "var(--accent)",
}: {
  items: { label: string; value: number; color?: string }[];
  max?: number;
  color?: string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="w-[1200px] space-y-[28px]">
      {items.slice(0, 5).map((it) => (
        <div key={it.label}>
          <div className="mb-[10px] flex justify-between t-body">
            <span className="text-text">{it.label}</span>
            <span className="font-mono text-muted tabular-nums">{it.value}</span>
          </div>
          <div className="h-[14px] rounded-full bg-line">
            <motion.div
              layout
              className="h-full rounded-full"
              style={{ background: it.color ?? color }}
              animate={{ width: `${(it.value / top) * 100}%` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- ToggleSwitch ---------- */
export function ToggleSwitch({
  on,
  onChange,
  label,
  color = "var(--accent)",
}: {
  on: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!on);
      }}
      className="flex items-center gap-[18px]"
    >
      <span
        className="relative h-[44px] w-[84px] rounded-full border border-line transition-colors duration-300"
        style={{ background: on ? color : "var(--surface)" }}
      >
        <motion.span
          className="absolute top-[5px] h-[32px] w-[32px] rounded-full bg-text"
          animate={{ left: on ? 46 : 5 }}
          transition={{ duration: 0.25, ease: EASE }}
        />
      </span>
      {label ? <span className="t-body text-text">{label}</span> : null}
    </button>
  );
}

/* ---------- QRTile ---------- */
export function QRTile({
  url,
  label,
  size = 260,
  image,
}: {
  url: string;
  label?: string;
  size?: 260 | 200 | 180;
  /** Optional pre-rendered QR image for the same URL. */
  image?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex flex-col items-center gap-[14px]"
      aria-label={label ? `${label} — ${url}` : url}
    >
      <span className="block rounded-[18px] bg-qr-paper p-[10px]">
        {image ? (
          <img src={image} alt={`QR code for ${url}`} width={size} height={size} className="block" />
        ) : (
          <QRCodeSVG
            value={url}
            size={size}
            level="M"
            marginSize={4}
            fgColor="#0A0B0F"
            bgColor="#FFFFFF"
            title={`QR code for ${url}`}
          />
        )}
      </span>
      {label ? <span className="t-small font-mono text-muted">{label}</span> : null}
    </a>
  );
}

/* ---------- DownloadPdfButton ---------- */
export function useDownloadPdf() {
  const run = useServerFn(exportPdf);
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await run({ data: { variant: "slides", origin: window.location.origin } });
      if (!res.ok) throw new Error(res.error);
      const file = await fetch(res.url);
      if (!file.ok) throw new Error("Could not fetch the PDF.");
      const href = URL.createObjectURL(await file.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = PDF_FILENAME;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not download the PDF.", {
        action: { label: "Retry", onClick: () => void download() },
      });
    } finally {
      setBusy(false);
    }
  };
  return { download, busy };
}

export function DownloadPdfButton({ className = "", label = "Download PDF" }: { className?: string; label?: string }) {
  const { download, busy } = useDownloadPdf();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void download();
      }}
      disabled={busy}
      aria-busy={busy}
      className={`inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[14px] text-text hover:border-[var(--accent)] ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {label}
    </button>
  );
}
