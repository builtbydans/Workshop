"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import { getErrorMessage } from "@/lib/api-error";
import { acceptQuote, markLeadAsLost } from "@/services/lead.service";

type CustomerQuoteActionsProps = {
  leadId: string;
};

export function CustomerQuoteActions({ leadId }: CustomerQuoteActionsProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(
    null,
  );
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setSubmitting("accept");
    setError(null);

    try {
      await acceptQuote(leadId);
      setResult("accepted");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to accept this quotation"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDecline = async () => {
    setSubmitting("decline");
    setError(null);

    try {
      await markLeadAsLost(leadId);
      setResult("declined");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to decline this quotation"));
    } finally {
      setSubmitting(null);
    }
  };

  if (result === "accepted") {
    return (
      <div className="rounded-2xl border border-[color-mix(in_srgb,var(--garage-success)_45%,transparent)] bg-[color-mix(in_srgb,var(--garage-success)_16%,transparent)] p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-6 shrink-0 text-[var(--garage-success)]"
            aria-hidden
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
              Quotation accepted
            </h2>
            <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
              Thank you. Northside Motor Co. will contact you shortly about the
              next steps. A deposit has not been taken in this simulation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result === "declined") {
    return (
      <div className="rounded-2xl border border-[color-mix(in_srgb,var(--garage-danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--garage-danger)_14%,transparent)] p-6">
        <div className="flex items-start gap-3">
          <XCircle
            className="mt-0.5 size-6 shrink-0 text-[var(--garage-danger)]"
            aria-hidden
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
              Quotation declined
            </h2>
            <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
              Your response has been recorded. If you change your mind, please
              contact the workshop and we will be happy to help.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--garage-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting != null}
          onClick={handleAccept}
          type="button"
        >
          {submitting === "accept" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : null}
          Accept quotation
        </button>
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[var(--garage-line)] px-4 py-3 text-sm font-semibold text-[var(--garage-offwhite)] transition hover:border-[var(--garage-danger)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting != null}
          onClick={handleDecline}
          type="button"
        >
          {submitting === "decline" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : null}
          Decline quotation
        </button>
      </div>

      {error ? (
        <p className="text-sm text-[var(--garage-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
