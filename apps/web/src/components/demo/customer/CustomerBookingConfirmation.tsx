"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import {
  demoDepositBreakdown,
  money,
  readStoredDropOffSlot,
  type DemoDropOffSlot,
} from "@/components/demo/customer/demo-dropoff";

type CustomerBookingConfirmationProps = {
  leadId: string;
  jobNumber: string;
  quotedCost: number | null;
  customerFirstName: string;
  vehicleLabel: string;
  registration: string;
};

export function CustomerBookingConfirmation({
  leadId,
  jobNumber,
  quotedCost,
  customerFirstName,
  vehicleLabel,
  registration,
}: CustomerBookingConfirmationProps) {
  const [slot, setSlot] = useState<DemoDropOffSlot | null>(null);
  const { deposit } = demoDepositBreakdown(quotedCost);

  useEffect(() => {
    setSlot(readStoredDropOffSlot(leadId));
  }, [leadId]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-[var(--garage-success)]"
          aria-hidden
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
            Booking confirmed
          </h2>
          <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
            Thank you {customerFirstName}. Your quotation deposit has been
            simulated and your job is now booked with Northside Motor Co.
          </p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-xl border border-[color-mix(in_srgb,var(--garage-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--garage-success)_12%,transparent)] p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
            Reference
          </dt>
          <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
            {jobNumber}
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
            Vehicle
          </dt>
          <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
            {vehicleLabel}
          </dd>
          <dd className="mt-1 font-mono text-sm tracking-wider text-[var(--garage-ink-muted)]">
            {registration}
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
            Simulated deposit
          </dt>
          <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
            {money(deposit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
            Drop-off
          </dt>
          <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
            {slot ? slot.label : "Arranged with the workshop"}
          </dd>
          {slot ? (
            <dd className="mt-1 text-xs text-[var(--garage-ink-muted)]">
              Demo slot only — not stored on the job record.
            </dd>
          ) : (
            <dd className="mt-1 text-xs text-[var(--garage-ink-muted)]">
              This booking is confirmed in Workshop as booked.
            </dd>
          )}
        </div>
      </dl>

      <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
        A member of the team will welcome you at drop-off. Remaining balance is
        due on collection. This simulation does not create invoices or take real
        payment.
      </p>
    </div>
  );
}
