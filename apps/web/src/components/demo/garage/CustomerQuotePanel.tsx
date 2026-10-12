"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import { ApiError } from "@/lib/api-error";
import type { PublicQuoteView } from "@/types/quote.types";
import { formatRegistration } from "@/utils/formatRegistration";

type CustomerQuotePanelProps = {
  token: string;
};

function money(value: number) {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CustomerQuotePanel({ token }: CustomerQuotePanelProps) {
  const [view, setView] = useState<PublicQuoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/demo/garage/quote/${token}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success) {
          throw new ApiError(
            payload?.message || "Unable to load this quotation",
            response.status,
            payload?.code || "INTERNAL_SERVER_ERROR",
          );
        }

        if (!cancelled) {
          setView(payload.data as PublicQuoteView);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to load this quotation",
          );
          setView({ state: "INVALID", quote: null });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (action: "accept" | "decline") => {
    setSubmitting(action);
    setError(null);

    try {
      const response = await fetch(
        `/api/demo/garage/quote/${token}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:
            action === "decline"
              ? JSON.stringify({ reason: declineReason })
              : undefined,
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new ApiError(
          payload?.message || "Unable to submit your response",
          response.status,
          payload?.code || "INTERNAL_SERVER_ERROR",
        );
      }

      setView(payload.data as PublicQuoteView);
      setConfirmAccept(false);
      setConfirmDecline(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to submit your response",
      );
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="inline-flex items-center gap-2 text-[var(--garage-ink-muted)]">
          <LoaderCircle className="size-5 animate-spin" aria-hidden />
          Loading your quotation…
        </p>
      </div>
    );
  }

  if (!view || view.state === "INVALID" || !view.quote) {
    return (
      <StatusCard
        icon={<XCircle className="size-12 text-[var(--garage-danger)]" />}
        title="Link unavailable"
        body={
          error ||
          view?.message ||
          "This quotation link is invalid or no longer available."
        }
      />
    );
  }

  const quote = view.quote;

  if (view.state === "ACCEPTED") {
    return (
      <StatusCard
        icon={<CheckCircle2 className="size-12 text-[var(--garage-success)]" />}
        title="Quotation accepted"
        body="Thank you. Your repair is now awaiting a deposit to secure the booking. Northside Motor Co. will be in touch with deposit details — nothing has been charged yet."
      >
        <QuoteSummary quote={quote} />
      </StatusCard>
    );
  }

  if (view.state === "DECLINED") {
    return (
      <StatusCard
        icon={<XCircle className="size-12 text-[var(--garage-ink-muted)]" />}
        title="Quotation declined"
        body="Thank you for letting us know. Your enquiry has been closed. If you change your mind, please contact the garage and we will be happy to help."
      >
        <QuoteSummary quote={quote} />
      </StatusCard>
    );
  }

  if (view.state === "EXPIRED") {
    return (
      <StatusCard
        icon={<XCircle className="size-12 text-[var(--garage-danger)]" />}
        title="Quotation expired"
        body={
          view.message ||
          "This quotation has expired. Please contact Northside Motor Co. for an updated quote."
        }
      >
        <QuoteSummary quote={quote} />
      </StatusCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="garage-animate-rise space-y-3 border-b border-[var(--garage-line)] pb-8">
        <p className="garage-display text-sm tracking-[0.18em] text-[var(--garage-accent)]">
          Repair quotation
        </p>
        <h1 className="text-3xl font-semibold text-[var(--garage-offwhite)] sm:text-4xl">
          Hello {quote.customer_first_name}
        </h1>
        <p className="max-w-2xl text-[var(--garage-ink-muted)]">
          Please review the quotation below for your{" "}
          {quote.make} {quote.model}. You can accept to proceed toward booking,
          or decline if you would prefer not to continue.
        </p>
      </header>

      <div className="garage-animate-rise-delay mt-8 space-y-6">
        <QuoteSummary quote={quote} detailed />

        <section className="rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--garage-offwhite)]">
            After you accept
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--garage-ink-muted)]">
            <li>We will ask for a deposit to secure workshop time.</li>
            <li>No deposit is taken automatically from this page.</li>
            <li>A member of the team will confirm drop-off arrangements.</li>
          </ul>
        </section>

        {error ? (
          <p
            className="rounded-md border border-[color-mix(in_srgb,var(--garage-danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--garage-danger)_12%,transparent)] px-3 py-2 text-sm"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex flex-1 items-center justify-center rounded-md bg-[var(--garage-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)] disabled:opacity-60"
            disabled={!!submitting}
            onClick={() => setConfirmAccept(true)}
            type="button"
          >
            Accept quotation
          </button>
          <button
            className="inline-flex flex-1 items-center justify-center rounded-md border border-[var(--garage-line)] px-4 py-3 text-sm font-semibold text-[var(--garage-offwhite)] transition hover:border-[var(--garage-danger)] disabled:opacity-60"
            disabled={!!submitting}
            onClick={() => setConfirmDecline(true)}
            type="button"
          >
            Decline quotation
          </button>
        </div>
      </div>

      {confirmAccept ? (
        <Modal
          title="Confirm acceptance"
          onClose={() => !submitting && setConfirmAccept(false)}
        >
          <p className="text-sm text-[var(--garage-ink-muted)]">
            You are accepting quotation{" "}
            <span className="font-medium text-[var(--garage-offwhite)]">
              {quote.quote_reference}
            </span>{" "}
            for {money(quote.gross)} (incl. VAT) on{" "}
            {formatRegistration(quote.registration)}. The next step is a deposit
            request from the garage — nothing is charged now.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-md border border-[var(--garage-line)] px-4 py-2 text-sm"
              disabled={!!submitting}
              onClick={() => setConfirmAccept(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--garage-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={!!submitting}
              onClick={() => void submit("accept")}
              type="button"
            >
              {submitting === "accept" ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : null}
              Confirm accept
            </button>
          </div>
        </Modal>
      ) : null}

      {confirmDecline ? (
        <Modal
          title="Decline this quotation?"
          onClose={() => !submitting && setConfirmDecline(false)}
        >
          <p className="text-sm text-[var(--garage-ink-muted)]">
            This will close the enquiry. You can optionally share a reason to
            help the garage improve.
          </p>
          <label className="mt-4 block text-sm" htmlFor="decline_reason">
            Reason (optional)
          </label>
          <textarea
            className="mt-1.5 min-h-24 w-full rounded-md border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_70%,transparent)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--garage-accent)]"
            id="decline_reason"
            maxLength={500}
            onChange={(e) => setDeclineReason(e.target.value)}
            value={declineReason}
          />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-md border border-[var(--garage-line)] px-4 py-2 text-sm"
              disabled={!!submitting}
              onClick={() => setConfirmDecline(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--garage-danger)] px-4 py-2 text-sm font-semibold text-[var(--garage-offwhite)] disabled:opacity-60"
              disabled={!!submitting}
              onClick={() => void submit("decline")}
              type="button"
            >
              {submitting === "decline" ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : null}
              Confirm decline
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function QuoteSummary({
  quote,
  detailed = false,
}: {
  quote: NonNullable<PublicQuoteView["quote"]>;
  detailed?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--garage-ink-muted)]">
            Quote reference
          </p>
          <p className="garage-display mt-1 text-xl text-[var(--garage-offwhite)]">
            {quote.quote_reference}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--garage-ink-muted)]">
            Valid until
          </p>
          <p className="mt-1 text-sm text-[var(--garage-offwhite)]">
            {formatDate(quote.expires_at)}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--garage-ink-muted)]">
            Vehicle
          </dt>
          <dd className="mt-1 text-[var(--garage-offwhite)]">
            {quote.make} {quote.model}
          </dd>
          <dd className="mt-1 inline-flex rounded-md border border-[var(--garage-line)] px-2 py-1 font-mono text-sm tracking-wider">
            {formatRegistration(quote.registration)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--garage-ink-muted)]">
            Work type
          </dt>
          <dd className="mt-1 text-[var(--garage-offwhite)]">
            {quote.job_type || "Repair"}
          </dd>
        </div>
      </dl>

      {detailed ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-[var(--garage-ink-muted)]">
            Repair description
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--garage-ink-muted)]">
            {quote.description}
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-[var(--garage-line)] pt-5">
        <p className="text-xs uppercase tracking-wide text-[var(--garage-ink-muted)]">
          Pricing (VAT inclusive)
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--garage-ink-muted)]">Net</dt>
            <dd>{money(quote.net)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--garage-ink-muted)]">
              VAT ({quote.vat_rate}%)
            </dt>
            <dd>{money(quote.vat)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--garage-line)] pt-2 text-base font-semibold text-[var(--garage-offwhite)]">
            <dt>Total</dt>
            <dd>{money(quote.gross)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[var(--garage-ink-muted)]">
          Quoted amount includes VAT at {quote.vat_rate}%. Final invoice may
          adjust for approved additional work.
        </p>
      </div>
    </section>
  );
}

function StatusCard({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center">
      <div className="garage-animate-rise w-full rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_94%,white)] p-8 sm:p-10">
        <div className="flex justify-center">{icon}</div>
        <h1 className="mt-5 text-3xl font-semibold text-[var(--garage-offwhite)]">
          {title}
        </h1>
        <p className="mt-3 text-[var(--garage-ink-muted)]">{body}</p>
        {children ? <div className="mt-8 text-left">{children}</div> : null}
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--garage-line)] bg-[var(--garage-navy)] p-5 shadow-2xl sm:p-6">
        <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
