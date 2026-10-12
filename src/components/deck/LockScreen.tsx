import { useState, type FormEvent } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { QRTile } from "@/components/kit";
import { BrandBar } from "@/components/screens/shared";
import { BRAINSMINGLE_URL, LINKEDIN_URL, SPEAKER } from "@/config";
import { useGate, useServerNow } from "@/deck/gate";
import monogram from "@/assets/hs-monogram.png.asset.json";
import qrLinkedin from "@/assets/qr-linkedin-hanysaad.svg.asset.json";
import qrBrains from "@/assets/qr-brainsmingle-hanysaad.svg.asset.json";

const pad = (n: number) => String(n).padStart(2, "0");

function OpensIn() {
  const { unlockAt } = useGate();
  const now = useServerNow();
  if (now === null) return <p className="h-[44px]" />;
  const left = Math.max(0, Math.floor((unlockAt - now) / 1000));
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  return (
    <p className="font-mono text-[30px] text-text tabular-nums sm:text-[36px]" aria-live="off">
      <span className="mr-3 text-[14px] tracking-[0.14em] text-muted uppercase sm:text-[15px]">Opens in</span>
      {d > 0 ? `${d}d ` : ""}
      {pad(h)}:{pad(m)}:{pad(left % 60)}
    </p>
  );
}

function PinForm() {
  const { unlock } = useGate();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="font-mono text-[12px] text-muted/80 underline-offset-4 hover:text-text hover:underline">
        Presenter? Enter PIN
      </button>
    );
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await unlock(pin);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      setPin("");
    }
  };
  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="deck-pin" className="sr-only">
          Presenter PIN
        </label>
        <input
          id="deck-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="PIN"
          className="h-[40px] w-[150px] rounded-full border border-line bg-surface px-4 text-center font-mono text-[16px] tracking-[0.3em] text-text outline-none focus:border-[var(--own)]"
        />
        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="h-[40px] rounded-full border border-line px-4 font-mono text-[13px] text-text hover:border-[var(--own)] disabled:opacity-50"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </div>
      <p className="min-h-[18px] font-mono text-[12px] text-[#FF8A80]" role="alert">
        {error}
      </p>
    </form>
  );
}

/**
 * Shown instead of any locked slide, control or page until the live session ends
 * (or the presenter PIN unlocks this browser). While the server check is pending only
 * the empty navy room is drawn, so nothing locked ever renders first.
 */
export function LockScreen({ onBack }: { onBack?: () => void }) {
  const { status } = useGate();
  return (
    <div className="deck-room theme-stage absolute inset-0 z-[60] overflow-y-auto font-sans text-text" style={{ ["--ambient" as string]: "#5EE6AA" }}>
      <div className="room-backdrop" aria-hidden />
      {status === "pending" ? null : (
        <main className="relative mx-auto flex min-h-full max-w-[1040px] flex-col items-center justify-center gap-5 px-4 py-6 text-center sm:px-8">
          <div className="flex items-center gap-3">
            <img src={monogram.url} alt="" className="h-[30px] w-[30px]" />
            <p className="font-mono text-[12px] tracking-[0.14em] text-muted uppercase">AI-Era Software Engineering · {SPEAKER.name}</p>
          </div>
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line bg-surface/70">
            <Lock className="h-6 w-6 text-own" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-[34px] leading-[1.08] font-bold tracking-[-0.03em] [text-wrap:balance] md:text-[44px]">
              The full deck opens after the live session
            </h1>
            <p className="mt-2 text-[18px] text-muted sm:text-[22px]">Mon 12 Oct, 9:00PM Cairo time</p>
            <div className="mx-auto mt-4 w-fit">
              <BrandBar width={180} />
            </div>
          </div>
          <OpensIn />
          <section className="flex w-full flex-col items-center gap-5 rounded-[20px] border border-line bg-surface/60 px-5 py-5 sm:px-8 md:flex-row md:justify-between md:text-left">
            <div>
              <p className="font-display text-[20px] font-bold [text-wrap:balance] sm:text-[26px]">Join the session at 8:00PM Cairo time</p>
              <p className="mt-1 text-[15px] text-muted">BrainsMingle AI Summit 2026 · AI in Learning &amp; Development</p>
              <p className="mt-1 text-[15px] text-muted">Live · Mon 12 Oct · 8:00–9:00PM Cairo time</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-6">
              <QRTile url={LINKEDIN_URL} label="Connect on LinkedIn" image={qrLinkedin.url} size={180} />
              <QRTile url={BRAINSMINGLE_URL} label="Follow on BrainsMingle" image={qrBrains.url} size={180} />
            </div>
          </section>
          <div className="flex flex-col items-center gap-3">
            {onBack ? (
              <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[13px] text-text hover:border-[var(--own)]">
                <ArrowLeft className="h-4 w-4" /> Back to the preview
              </button>
            ) : (
              <a href="/" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[13px] text-text hover:border-[var(--own)]">
                <ArrowLeft className="h-4 w-4" /> Open the preview
              </a>
            )}
            <PinForm />
          </div>
        </main>
      )}
    </div>
  );
}

/** Renders `children` only when the full deck is open; otherwise the lock screen. */
export function DeckGate({ children }: { children: () => React.ReactNode }) {
  const { status } = useGate();
  if (status !== "open") return <LockScreen />;
  return <>{children()}</>;
}
