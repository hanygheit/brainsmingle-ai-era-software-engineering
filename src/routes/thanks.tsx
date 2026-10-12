import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowUpRight, CodeXml, Download, Lock, MessageSquareText, Presentation } from "lucide-react";
import { BRAINSMINGLE_URL, FEEDBACK_URL, HUB_URL, LINKEDIN_URL, PRESENTATION_URL, REPO_URL, SOCIAL_PREVIEW_URL } from "@/config";
import { useDownloadPdf } from "@/components/kit";
import { MobileShell } from "@/components/mobile/shell";
import { useGate, useServerNow } from "@/deck/gate";
import t from "@/content/thanks.json";

/**
 * Audience hub (HUB_URL, the one QR on the final slide): feedback first, then the deck, the PDF,
 * the code and the speaker's links. Always open; the deck and PDF wait for DECK_UNLOCK_AT.
 */
export const Route = createFileRoute("/thanks")({
  head: () => ({
    meta: [
      { title: "Thank you — AI-Era Software Engineering · Hany Saad" },
      { name: "description", content: "Feedback, slides, PDF and code from Hany Saad's keynote at BrainsMingle AI Summit 2026 — all in one place." },
      { property: "og:title", content: "Thank you for joining — AI-Era Software Engineering" },
      { property: "og:description", content: "Feedback, slides, PDF and code — all in one place." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: HUB_URL },
      { property: "og:image", content: SOCIAL_PREVIEW_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThanksPage,
});

const PRESENT_URL = `${PRESENTATION_URL}/present/0`;
const pad = (n: number) => String(n).padStart(2, "0");

/** Small white QR beside a link, for people watching on a laptop (≥ 900 px only). */
function SideQR({ url, label }: { url: string | null; label: string }) {
  return (
    <div className="hidden h-[118px] w-[104px] shrink-0 min-[900px]:block" aria-hidden>
      {url ? (
        <div className="flex flex-col items-center gap-1.5">
          <span className="block rounded-[12px] bg-white p-[6px]">
            <QRCodeSVG value={url} size={88} level="M" marginSize={2} fgColor="#0F1B33" bgColor="#FFFFFF" title={`QR code for ${label}`} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{t.scan}</span>
        </div>
      ) : null}
    </div>
  );
}

function Row({ children, qr, qrLabel }: { children: ReactNode; qr: string | null; qrLabel: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="min-w-0 flex-1">{children}</div>
      <SideQR url={qr} label={qrLabel} />
    </div>
  );
}

const card =
  "flex min-h-[76px] w-full items-center gap-4 rounded-2xl border border-line bg-surface/80 px-4 py-3 text-left transition-[border-color,background-color,transform] duration-150 outline-none hover:border-[var(--own)] focus-visible:ring-2 focus-visible:ring-[var(--own)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B152B] active:scale-[0.99]";

function CardBody({ icon, title, sub, accent = "var(--muted)" }: { icon: ReactNode; title: string; sub: ReactNode; accent?: string }) {
  return (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line" style={{ color: accent }} aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 leading-snug">
        <span className="block text-[18px] font-semibold">{title}</span>
        <span className="block text-[15px] text-muted">{sub}</span>
      </span>
    </>
  );
}

/** "Opens at 21:00 Cairo · in 00:42:10" on the server's clock. */
function OpensAt() {
  const { unlockAt } = useGate();
  const now = useServerNow();
  const left = now === null ? null : Math.max(0, Math.floor((unlockAt - now) / 1000));
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span>{t.locked}</span>
      {left !== null && left > 0 ? (
        <span className="font-mono text-[14px] tabular-nums">
          {t.lockedIn} {left >= 86400 ? `${Math.floor(left / 86400)}d ` : ""}
          {pad(Math.floor((left % 86400) / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
        </span>
      ) : null}
    </span>
  );
}

function LockedCard({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className={`${card} cursor-not-allowed opacity-70 hover:border-line active:scale-100`} aria-disabled="true">
      <CardBody icon={icon} title={title} sub={<OpensAt />} />
      <Lock className="h-4 w-4 shrink-0 text-muted" aria-hidden />
    </div>
  );
}

function ThanksPage() {
  const { status } = useGate();
  const open = status === "open";
  const pdf = useDownloadPdf();

  return (
    <MobileShell maxW="max-w-md min-[900px]:max-w-[760px]">
      <section className="mt-8">
        <h1 className="font-display text-[34px] leading-[1.08] font-bold tracking-[-0.03em] [text-wrap:balance] min-[900px]:text-[44px]">{t.title}</h1>
        <p className="mt-3 text-[18px] leading-snug [text-wrap:balance]">{t.talk}</p>
        <p className="mt-2 font-mono text-[12px] tracking-[0.12em] text-muted uppercase">{t.byline}</p>
      </section>

      <div className="mt-8 space-y-3">
        <Row qr={FEEDBACK_URL} qrLabel={t.feedback.title}>
          <Link
            to="/feedback"
            className="flex min-h-[112px] w-full items-center gap-3.5 rounded-2xl border-2 border-[var(--own)] px-5 py-4 text-left outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-[var(--own)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B152B] active:scale-[0.99]"
            style={{ backgroundColor: "color-mix(in oklab, var(--own-fill) 14%, var(--surface))" }}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-own-fill text-[#0F1B33]" aria-hidden>
              <MessageSquareText className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1 leading-snug">
              <span className="block font-display text-[20px] font-bold tracking-[-0.01em] min-[400px]:text-[22px]">{t.feedback.title}</span>
              <span className="mt-0.5 block text-[15px] text-muted">{t.feedback.sub}</span>
            </span>
            <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-own min-[400px]:block" aria-hidden />
          </Link>
        </Row>

        <Row qr={open ? PRESENT_URL : null} qrLabel={t.present.title}>
          {open ? (
            <Link to="/present/$n" params={{ n: "0" }} className={card}>
              <CardBody icon={<Presentation className="h-5 w-5" />} title={t.present.title} sub={t.present.sub} accent="var(--direct)" />
            </Link>
          ) : (
            <LockedCard icon={<Presentation className="h-5 w-5" />} title={t.present.title} />
          )}
        </Row>

        <Row qr={null} qrLabel={t.pdf.title}>
          {open ? (
            <button type="button" onClick={() => void pdf.download()} disabled={pdf.busy} aria-busy={pdf.busy} className={`${card} disabled:opacity-70`}>
              <CardBody icon={<Download className="h-5 w-5" />} title={t.pdf.title} sub={pdf.busy ? t.pdf.busy : t.pdf.sub} accent="var(--validate)" />
            </button>
          ) : (
            <LockedCard icon={<Download className="h-5 w-5" />} title={t.pdf.title} />
          )}
        </Row>

        <Row qr={REPO_URL} qrLabel={t.code.title}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={card}>
            <CardBody icon={<CodeXml className="h-5 w-5" />} title={t.code.title} sub={t.code.sub} accent="var(--text)" />
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          </a>
        </Row>
      </div>

      <section className="mt-8" aria-labelledby="connect">
        <h2 id="connect" className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">
          {t.connect.title}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { href: LINKEDIN_URL, label: t.connect.linkedin },
            { href: BRAINSMINGLE_URL, label: t.connect.brainsmingle },
          ].map(({ href, label }) => (
            <div key={href} className="flex flex-col items-center gap-3 min-[900px]:flex-row min-[900px]:items-center">
              <a href={href} target="_blank" rel="noopener noreferrer" className={`${card} min-h-[64px] justify-center min-[900px]:flex-1`}>
                <span className="text-[17px] font-semibold">{label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              </a>
              <SideQR url={href} label={label} />
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}
