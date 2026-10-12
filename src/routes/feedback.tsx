import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LINKEDIN_URL, PDF_FILENAME, PRESENTATION_URL } from "@/config";
import { submitFeedback } from "@/lib/feedback.functions";
import { exportPdf } from "@/lib/export-pdf.functions";
import { readUnlockToken } from "@/deck/gate";
import { voterId } from "@/lib/device-id";
import { MobileShell } from "@/components/mobile/shell";
import fb from "@/content/feedback.json";

const SENT_KEY = "ai-era-feedback-sent";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Session feedback — AI-Era Software Engineering" },
      { name: "description", content: "One-minute feedback on Hany Saad's keynote at BrainsMingle AI Summit 2026." },
      { property: "og:title", content: "Session feedback — AI-Era Software Engineering" },
      { property: "og:description", content: "One-minute feedback on the keynote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeedbackPage,
});

const field =
  "w-full rounded-xl border border-line bg-surface/80 px-4 py-3 text-[17px] text-text placeholder:text-muted/80 outline-none focus-visible:border-[var(--own)] focus-visible:ring-2 focus-visible:ring-[var(--own)]/40";

function Question({ n, label, hint, children }: { n: number; label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 min-w-0">
      <legend className="flex w-full items-baseline gap-2 text-[18px] font-semibold">
        <span className="font-mono text-[13px] text-muted">{n}</span>
        <span className="flex-1">{label}</span>
        {hint ? <span className="font-mono text-[11px] font-normal tracking-[0.12em] text-muted uppercase">{hint}</span> : null}
      </legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function FeedbackPage() {
  const send = useServerFn(submitFeedback);
  const [done, setDone] = useState<null | "new" | "already">(null);
  const [rating, setRating] = useState(0);
  const [valuable, setValuable] = useState<string | null>(null);
  const [change, setChange] = useState("");
  const [comments, setComments] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const stars = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(SENT_KEY)) setDone("already");
    } catch {
      /* ignore */
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!rating) {
      setErr("Pick a star rating first.");
      stars.current?.querySelector("input")?.focus();
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Check the email address.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await send({ data: { device: voterId(), rating, valuable, change, comments, name, email, contactOk, website } });
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      try {
        localStorage.setItem(SENT_KEY, new Date().toISOString());
      } catch {
        /* ignore */
      }
      setDone(r.duplicate ? "already" : "new");
      window.scrollTo({ top: 0 });
    } catch {
      setErr("Couldn't send your feedback. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) return <ThankYou already={done === "already"} />;

  return (
    <MobileShell>
      <h1 className="mt-8 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.02em]">{fb.title}</h1>
      <p className="mt-2 text-[16px] text-muted">{fb.intro}</p>

      <form onSubmit={(e) => void submit(e)} noValidate>
        <fieldset ref={stars} className="mt-8 min-w-0">
          <legend className="flex w-full items-baseline gap-2 text-[18px] font-semibold">
            <span className="font-mono text-[13px] text-muted">1</span>
            <span className="flex-1">{fb.rating.label}</span>
            <span className="font-mono text-[11px] font-normal tracking-[0.12em] text-muted uppercase">{fb.rating.hint}</span>
          </legend>
          <div className="mt-3 flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="group relative flex-1">
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="peer sr-only"
                  aria-label={`${n} star${n > 1 ? "s" : ""} — ${fb.rating.words[n - 1]}`}
                  required
                />
                <span
                  className="flex h-14 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface/80 text-[30px] leading-none transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--own)]"
                  style={{ color: rating >= n ? "var(--validate)" : "color-mix(in oklab, var(--muted) 55%, transparent)", borderColor: rating === n ? "var(--validate)" : undefined }}
                  aria-hidden
                >
                  ★
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 h-5 text-center text-[14px] text-muted" aria-live="polite">{rating ? fb.rating.words[rating - 1] : ""}</p>
        </fieldset>

        <Question n={2} label={fb.valuable.label}>
          <div className="space-y-2">
            {fb.valuable.options.map((o) => (
              <label key={o} className="block">
                <input type="radio" name="valuable" value={o} checked={valuable === o} onChange={() => setValuable(o)} className="peer sr-only" />
                <span
                  className="flex min-h-[52px] cursor-pointer items-center rounded-xl border bg-surface/80 px-4 text-[17px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--own)]"
                  style={{
                    borderColor: valuable === o ? "var(--own)" : "var(--line)",
                    backgroundColor: valuable === o ? "color-mix(in oklab, var(--own-fill) 14%, var(--surface))" : undefined,
                  }}
                >
                  <span className="flex-1">{o}</span>
                  {valuable === o ? <span className="text-own" aria-hidden>✓</span> : null}
                </span>
              </label>
            ))}
          </div>
        </Question>

        <Question n={3} label={fb.change.label} hint="Optional">
          <input
            className={field}
            value={change}
            onChange={(e) => setChange(e.target.value)}
            maxLength={fb.change.max}
            placeholder={fb.change.placeholder}
            aria-label={fb.change.label}
            enterKeyHint="next"
          />
        </Question>

        <Question n={4} label={fb.comments.label} hint="Optional">
          <textarea
            className={`${field} min-h-[96px] resize-y`}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={fb.comments.max}
            placeholder={fb.comments.placeholder}
            aria-label={fb.comments.label}
            rows={3}
          />
        </Question>

        <Question n={5} label={fb.contact.label} hint={fb.contact.hint}>
          <div className="space-y-2">
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder={fb.contact.name} aria-label={fb.contact.name} autoComplete="name" />
            <input className={field} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} placeholder={fb.contact.email} aria-label={fb.contact.email} autoComplete="email" />
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[16px]">
              <input type="checkbox" checked={contactOk} onChange={(e) => setContactOk(e.target.checked)} className="h-5 w-5 accent-[var(--own-fill)]" />
              {fb.contact.ok}
            </label>
          </div>
        </Question>

        {/* Honeypot: hidden from people and assistive tech. */}
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        {err ? <p className="mt-6 text-[15px] text-[var(--fail)]" role="alert">{err}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-own-fill px-5 font-display text-[18px] font-bold text-[#0B152B] outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B152B] disabled:opacity-70"
        >
          {busy ? "Sending…" : fb.submit}
        </button>
      </form>
    </MobileShell>
  );
}

function ThankYou({ already }: { already: boolean }) {
  const getPdf = useServerFn(exportPdf);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const downloadPdf = async () => {
    setPdfMsg("Preparing the PDF…");
    try {
      const r = await getPdf({ data: { token: readUnlockToken() } });
      if (!r.ok) {
        setPdfMsg(r.error);
        return;
      }
      const a = document.createElement("a");
      a.href = r.url;
      a.download = PDF_FILENAME;
      a.rel = "noopener";
      a.click();
      setPdfMsg(null);
    } catch {
      setPdfMsg("Could not load the PDF. Try again.");
    }
  };
  const link =
    "flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-line bg-surface/80 px-5 text-[17px] font-semibold outline-none hover:border-[var(--own)] focus-visible:ring-2 focus-visible:ring-[var(--own)]";
  return (
    <MobileShell>
      <section className="mt-10" aria-live="polite">
        <p className="text-[40px] leading-none text-own" aria-hidden>✓</p>
        <h1 className="mt-4 font-display text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">{fb.thanks.title}</h1>
        <p className="mt-3 text-[17px] text-muted">{already ? fb.thanks.already : fb.thanks.body}</p>
        <div className="mt-8 space-y-3">
          <a className={link} href={PRESENTATION_URL}>
            {fb.thanks.links[0]} <span aria-hidden>→</span>
          </a>
          <button type="button" className={link} onClick={() => void downloadPdf()}>
            {fb.thanks.links[1]} <span aria-hidden>↓</span>
          </button>
          {pdfMsg ? <p className="text-[14px] text-muted">{pdfMsg}</p> : null}
          <a className={link} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            {fb.thanks.links[2]} <span aria-hidden>↗</span>
          </a>
        </div>
      </section>
    </MobileShell>
  );
}
