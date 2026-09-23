import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { exportPdf } from "@/lib/export-pdf.functions";
import { Icon } from "./primitives";

const FILENAME = "Hany-Saad-AI-Agent-On-Call-DevOpsDays-Cairo-2026.pdf";

export function useDownloadPdf() {
  const run = useServerFn(exportPdf);
  const [busy, setBusy] = useState(false);

  const download = async (variant: "slides" | "notes") => {
    setBusy(true);
    const id = toast.loading("Rendering the deck…");
    try {
      const res = await run({ data: { variant, origin: window.location.origin } });
      if (!res.ok) throw new Error(res.error);
      const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = variant === "notes" ? FILENAME.replace(".pdf", "-with-notes.pdf") : FILENAME;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF ready", { id });
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

export function DownloadMenu() {
  const { download, busy } = useDownloadPdf();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex h-[38px] min-w-[38px] items-center justify-center px-2 text-term-text hover:text-gold"
        onClick={() => setOpen((v) => !v)}
        aria-label="Download PDF"
        disabled={busy}
      >
        <Icon name="download" size={20} />
      </button>
      {open ? (
        <div className="absolute bottom-[46px] left-1/2 w-[240px] -translate-x-1/2 border border-navy-line bg-navy-card py-1">
          {(
            [
              ["slides", "Slides"],
              ["notes", "Slides + speaker notes"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              className="block w-full px-4 py-2 text-left font-sans text-[15px] text-term-text hover:text-gold"
              onClick={() => {
                setOpen(false);
                void download(v);
              }}
            >
              {label}
            </button>
          ))}
          <a
            className="block w-full px-4 py-2 text-left font-mono text-[13px] text-term-comment hover:text-gold"
            href="/print"
            target="_blank"
            rel="noreferrer"
          >
            Open print view
          </a>
        </div>
      ) : null}
    </div>
  );
}
