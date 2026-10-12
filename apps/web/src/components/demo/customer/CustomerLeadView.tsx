import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";

import { CustomerQuoteActions } from "@/components/demo/customer/CustomerQuoteActions";
import { formatJobStatus, JOB_STATUS } from "@/constants/job-status";
import type { LeadSummaryDto } from "@/types/lead.types";
import { formatRegistration } from "@/utils/formatRegistration";

type CustomerLeadViewProps = {
  lead: LeadSummaryDto;
};

function money(value: number) {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}

export function CustomerLeadView({ lead }: CustomerLeadViewProps) {
  const customer = lead.vehicles.customers;
  const vehicle = lead.vehicles;
  const isLead = lead.status === JOB_STATUS.LEAD;
  const isQuoted = lead.status === JOB_STATUS.QUOTED;
  const isAccepted = lead.status === JOB_STATUS.AWAITING_DEPOSIT;
  const isLost = lead.status === JOB_STATUS.LOST;

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 garage-hero-glow opacity-60"
      />

      <header className="relative border-b border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link
            className="garage-display text-lg font-semibold tracking-[0.08em] text-[var(--garage-offwhite)] sm:text-xl"
            href="/demo/garage"
          >
            Northside Motor Co.
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 text-sm text-[var(--garage-ink-muted)] transition hover:text-[var(--garage-offwhite)]"
            href="/demo/customer"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Simulation portal
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl space-y-6 px-6 py-10 sm:py-14">
        <div className="garage-animate-rise space-y-3">
          <p className="garage-display text-sm tracking-[0.18em] text-[var(--garage-accent)]">
            Customer quotation
          </p>
          <h1 className="text-3xl font-semibold text-[var(--garage-offwhite)] sm:text-4xl">
            Hello {customer.first_name}
          </h1>
          <p className="max-w-xl text-[var(--garage-ink-muted)]">
            Here is the latest update on your enquiry with Northside Motor Co.
          </p>
        </div>

        <section className="garage-animate-rise-delay rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] p-5 sm:p-7">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                Customer
              </dt>
              <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
                {customer.first_name} {customer.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                Reference
              </dt>
              <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
                {lead.job_number}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                Vehicle
              </dt>
              <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
                {vehicle.make} {vehicle.model}
              </dd>
              <dd className="mt-2 inline-flex rounded-md border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-steel)_70%,black)] px-3 py-1.5 font-mono text-sm tracking-wider text-[var(--garage-offwhite)]">
                {formatRegistration(vehicle.registration)}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                Current state
              </dt>
              <dd className="mt-1 font-medium text-[var(--garage-offwhite)]">
                {formatJobStatus(lead.status)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[var(--garage-line)] pt-6">
            <p className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
              Problem description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--garage-ink)]">
              {lead.description}
            </p>
          </div>

          {lead.quoted_cost != null ? (
            <div className="mt-6 border-t border-[var(--garage-line)] pt-6">
              <p className="text-xs tracking-wide text-[var(--garage-ink-muted)] uppercase">
                Quoted amount
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--garage-offwhite)]">
                {money(Number(lead.quoted_cost))}
              </p>
              {lead.job_type ? (
                <p className="mt-1 text-sm text-[var(--garage-ink-muted)]">
                  Job type: {lead.job_type}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="garage-animate-fade rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-steel)_85%,black)] p-5 sm:p-7">
          {isLead ? (
            <div className="flex items-start gap-3">
              <Clock3
                className="mt-0.5 size-6 shrink-0 text-[var(--garage-accent)]"
                aria-hidden
              />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                  We are reviewing your enquiry
                </h2>
                <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                  Thanks for getting in touch. Our advisors are preparing a
                  quotation and have not issued one yet. You will be able to
                  accept or decline once a price is ready.
                </p>
              </div>
            </div>
          ) : null}

          {isQuoted ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                  Your quotation is ready
                </h2>
                <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                  Please review the details above and let us know whether you
                  would like to proceed. Accepting will move your enquiry to
                  awaiting deposit — no payment is taken here.
                </p>
              </div>
              <CustomerQuoteActions leadId={lead.id} />
            </div>
          ) : null}

          {isAccepted ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                Quotation accepted
              </h2>
              <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                This quotation has already been accepted and is awaiting
                deposit. No further action is needed in this simulation.
              </p>
            </div>
          ) : null}

          {isLost ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                Quotation declined
              </h2>
              <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                This enquiry was marked as lost. Contact the workshop if you
                would like a fresh quotation.
              </p>
            </div>
          ) : null}

          {!isLead && !isQuoted && !isAccepted && !isLost ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                Enquiry updated
              </h2>
              <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                This record is now in workshop status{" "}
                {formatJobStatus(lead.status)}. Return to the simulation portal
                to pick another enquiry.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
