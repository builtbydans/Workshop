"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
} from "lucide-react";

import {
  DEMO_DROP_OFF_TIMES,
  demoDepositBreakdown,
  formatDropOffDate,
  getSampleDropOffDates,
  money,
  toDateKey,
  writeStoredDropOffSlot,
  type DemoDropOffSlot,
} from "@/components/demo/customer/demo-dropoff";
import { getErrorMessage } from "@/lib/api-error";
import { confirmDeposit } from "@/services/lead.service";

type Step = "deposit" | "slot";

type CustomerBookingFlowProps = {
  leadId: string;
  quotedCost: number | null;
  customerFirstName: string;
};

export function CustomerBookingFlow({
  leadId,
  quotedCost,
  customerFirstName,
}: CustomerBookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("deposit");
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { total, deposit, remaining } = demoDepositBreakdown(quotedCost);
  const dates = useMemo(() => getSampleDropOffDates(5), []);

  const handleConfirmBooking = async () => {
    if (!selectedDateKey || !selectedTime) return;

    const date = dates.find((d) => toDateKey(d) === selectedDateKey);
    if (!date) return;

    const slot: DemoDropOffSlot = {
      dateKey: selectedDateKey,
      time: selectedTime,
      label: `${formatDropOffDate(date)} at ${selectedTime}`,
    };

    setSubmitting(true);
    setError(null);

    try {
      // Persist slot in session only — jobs schema has no booking datetime field.
      writeStoredDropOffSlot(leadId, slot);
      await confirmDeposit(leadId);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to confirm this booking"));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "deposit") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <CreditCard
            className="mt-0.5 size-6 shrink-0 text-[var(--garage-accent)]"
            aria-hidden
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
              Secure your booking
            </h2>
            <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
              Thanks {customerFirstName}. To hold your workshop slot we ask for
              a 20% deposit. This is a simulated payment for the interview demo
              — no card details are collected.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 rounded-xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_55%,transparent)] p-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
              Quotation total
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--garage-offwhite)]">
              {money(total)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
              Demo deposit (20%)
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--garage-accent)]">
              {money(deposit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
              Remaining balance
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--garage-offwhite)]">
              {money(remaining)}
            </dd>
          </div>
        </dl>

        <p className="rounded-md border border-dashed border-[var(--garage-line)] px-3 py-2 text-xs text-[var(--garage-ink-muted)]">
          Simulated payment only. No Stripe, card form, or payment record is
          created.
        </p>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--garage-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)] sm:w-auto"
          onClick={() => setStep("slot")}
          type="button"
        >
          Simulate Deposit Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <CalendarDays
          className="mt-0.5 size-6 shrink-0 text-[var(--garage-accent)]"
          aria-hidden
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
            Choose a drop-off slot
          </h2>
          <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
            Deposit simulated. Pick a sample weekday and time for vehicle
            drop-off. These slots are fake availability for the demo and are
            not written to the workshop calendar.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
          Sample dates
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {dates.map((date) => {
            const key = toDateKey(date);
            const selected = selectedDateKey === key;

            return (
              <button
                key={key}
                className={`rounded-md border px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "border-[var(--garage-accent)] bg-[color-mix(in_srgb,var(--garage-accent)_18%,transparent)] text-[var(--garage-offwhite)]"
                    : "border-[var(--garage-line)] text-[var(--garage-ink-muted)] hover:border-[var(--garage-accent)] hover:text-[var(--garage-offwhite)]"
                }`}
                onClick={() => setSelectedDateKey(key)}
                type="button"
              >
                {formatDropOffDate(date)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
          Drop-off times
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_DROP_OFF_TIMES.map((time) => {
            const selected = selectedTime === time;

            return (
              <button
                key={time}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-[var(--garage-accent)] bg-[color-mix(in_srgb,var(--garage-accent)_18%,transparent)] text-[var(--garage-offwhite)]"
                    : "border-[var(--garage-line)] text-[var(--garage-ink-muted)] hover:border-[var(--garage-accent)] hover:text-[var(--garage-offwhite)]"
                }`}
                onClick={() => setSelectedTime(time)}
                type="button"
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--garage-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={!selectedDateKey || !selectedTime || submitting}
        onClick={handleConfirmBooking}
        type="button"
      >
        {submitting ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : (
          <CheckCircle2 className="size-4" aria-hidden />
        )}
        Confirm Booking
      </button>

      {error ? (
        <p className="text-sm text-[var(--garage-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
