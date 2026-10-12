import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";

import { formatJobStatus } from "@/constants/job-status";
import type { LeadSummaryDto } from "@/types/lead.types";
import { formatRegistration } from "@/utils/formatRegistration";

type CustomerSimulationListProps = {
  leads: LeadSummaryDto[];
};

function money(value: number) {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}

export function CustomerSimulationList({ leads }: CustomerSimulationListProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] px-6 py-12 text-center">
        <CarFront
          className="mx-auto size-8 text-[var(--garage-accent)]"
          aria-hidden
        />
        <h2 className="mt-4 text-xl font-semibold text-[var(--garage-offwhite)]">
          No open enquiries
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--garage-ink-muted)]">
          Create a new enquiry from the garage demo, then return here to
          simulate the customer experience.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--garage-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)]"
          href="/demo/garage"
        >
          Open garage demo
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {leads.map((lead) => {
        const customer = lead.vehicles.customers;
        const vehicle = lead.vehicles;

        return (
          <li key={lead.id}>
            <Link
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] p-5 transition hover:border-[var(--garage-accent)] sm:flex-row sm:items-center sm:justify-between"
              href={`/demo/customer/${lead.id}`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-[var(--garage-offwhite)]">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <span className="rounded-md border border-[var(--garage-line)] px-2 py-0.5 text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                    {formatJobStatus(lead.status)}
                  </span>
                </div>
                <p className="text-sm text-[var(--garage-ink-muted)]">
                  {vehicle.make} {vehicle.model} ·{" "}
                  <span className="font-mono tracking-wider text-[var(--garage-offwhite)]">
                    {formatRegistration(vehicle.registration)}
                  </span>
                </p>
                <p className="text-xs text-[var(--garage-ink-muted)]">
                  Ref {lead.job_number}
                  {lead.quoted_cost != null
                    ? ` · Quoted ${money(Number(lead.quoted_cost))}`
                    : " · Awaiting quotation"}
                </p>
              </div>

              <span className="inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--garage-accent)] sm:self-center">
                View as customer
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
