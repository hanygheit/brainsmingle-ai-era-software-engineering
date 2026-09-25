import { useState } from "react";
import { TOTAL_SLIDES } from "@/content/slides";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { exportPdf } from "@/lib/export-pdf.functions";
import { readPin, usePresenterPin } from "@/lib/presenter-pin";
import { Icon } from "./primitives";

const FILENAME = "Hany-Saad-AI-Agent-On-Call-DevOpsDays-Cairo-2026.pdf";

export function useDownloadPdf() {
  const run = useServerFn(exportPdf);
  const [busy, setBusy] = useState(false);

  const download = async (variant: "slides" | "notes") => {
    setBusy(true);
    const id = toast.loading("Rendering slides… this takes ~10 s");
    try {
      const pin = readPin() ?? undefined;
      const res = await run({
        data: { variant, origin: window.location.origin, ...(pin ? { pin } : {}) },
      });
      if (!res.ok) throw new Error(res.error);
      const file = await fetch(res.url);
      if (!file.ok) throw new Error("Could not fetch the finished PDF.");
      const url = URL.createObjectURL(await file.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = variant === "notes" ? FILENAME.replace(".pdf", "-with-notes.pdf") : FILENAME;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(`PDF ready · ${res.pages} pages`, { id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not render the PDF.", {
        id,
        action: { label: "Retry", onClick: () => void download(variant) },
      });
    } finally {
      setBusy(false);
    }
  };

  return { download, busy };
}

export function DownloadMenu({
  up = true,
  label,
  className = "",
}: {
  up?: boolean;
  label?: string;
  className?: string;
}) {
  const { download, busy } = useDownloadPdf();
  const pin = usePresenterPin();
  const [open, setOpen] = useState(false);

  const items: [("slides" | "notes"), string][] = [["slides", "Slides (PDF, 21 pages)"]];
  if (pin) items.push(["notes", "Slides + speaker notes"]);

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        className="flex h-[38px] min-w-[38px] items-center justify-center gap-2 px-2 text-term-text hover:text-gold"
        onClick={() => setOpen((v) => !v)}
        aria-label="Download PDF"
        aria-expanded={open}
        disabled={busy}
      >
        <Icon name="download" size={20} />
        {label ? <span className="font-mono text-[14px] tracking-[0.12em]">{label}</span> : null}
      </button>
      {open ? (
        <div
          className={`absolute left-1/2 z-50 w-[250px] -translate-x-1/2 border border-navy-line bg-navy-card py-1 ${
            up ? "bottom-[46px]" : "top-[46px]"
          }`}
        >
          {items.map(([v, text]) => (
            <button
              key={v}
              className="block w-full px-4 py-2 text-left font-sans text-[15px] text-term-text hover:text-gold"
              onClick={() => {
                setOpen(false);
                void download(v);
              }}
            >
              {text}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
