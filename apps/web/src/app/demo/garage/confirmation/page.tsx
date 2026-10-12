import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type ConfirmationPageProps = {
  searchParams: Promise<{
    ref?: string;
    id?: string;
  }>;
};

export default async function DemoGarageConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const jobRef = params.ref?.trim() || null;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 garage-hero-glow opacity-70"
      />

      <div className="garage-animate-rise relative w-full max-w-lg rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_94%,white)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
        <CheckCircle2
          className="mx-auto size-12 text-[var(--garage-success)]"
          aria-hidden
        />
        <p className="garage-display mt-5 text-sm tracking-[0.18em] text-[var(--garage-accent)]">
          Enquiry received
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--garage-offwhite)] sm:text-4xl">
          Thank you — we&apos;ll be in touch.
        </h1>
        <p className="mt-4 text-[var(--garage-ink-muted)]">
          Your quotation request has been sent to the Northside Motor Co. team.
          One of our advisors will review the details and respond shortly.
        </p>

        {jobRef ? (
          <div className="mt-8 rounded-xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-steel)_70%,transparent)] px-4 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--garage-ink-muted)]">
              Job reference
            </p>
            <p className="garage-display mt-2 text-2xl font-semibold tracking-[0.08em] text-[var(--garage-offwhite)]">
              {jobRef}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center justify-center rounded-md bg-[var(--garage-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)]"
            href="/demo/garage"
          >
            Back to Northside Motor Co.
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-[var(--garage-line)] px-4 py-2.5 text-sm text-[var(--garage-offwhite)] transition hover:border-[var(--garage-accent)]"
            href="/leads"
          >
            View in Workshop
          </Link>
        </div>
      </div>
    </div>
  );
}
