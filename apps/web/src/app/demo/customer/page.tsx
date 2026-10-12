import Link from "next/link";

import { CustomerSimulationList } from "@/components/demo/customer/CustomerSimulationList";
import { JOB_STATUS } from "@/constants/job-status";
import { getLeads } from "@/services/lead.service.server";

export default async function CustomerSimulationPortalPage() {
  const leads = await getLeads();
  const openLeads = leads.filter(
    (lead) =>
      lead.status === JOB_STATUS.LEAD || lead.status === JOB_STATUS.QUOTED,
  );

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 garage-hero-glow opacity-50"
      />

      <header className="relative border-b border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div className="garage-display text-lg font-semibold tracking-[0.08em] text-[var(--garage-offwhite)] sm:text-xl">
            Northside Motor Co.
          </div>
          <Link
            className="text-sm text-[var(--garage-ink-muted)] transition hover:text-[var(--garage-offwhite)]"
            href="/"
          >
            Back to Workshop
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl space-y-8 px-6 py-10 sm:py-14">
        <div className="garage-animate-rise space-y-3">
          <p className="garage-display text-sm tracking-[0.18em] text-[var(--garage-accent)]">
            Staff simulation
          </p>
          <h1 className="text-3xl font-semibold text-[var(--garage-offwhite)] sm:text-4xl">
            Customer Simulation Portal
          </h1>
          <p className="max-w-xl text-[var(--garage-ink-muted)]">
            Choose an open enquiry to experience the customer quotation flow.
            This tool requires a Workshop staff session and does not create
            customer accounts.
          </p>
        </div>

        <div className="garage-animate-rise-delay">
          <CustomerSimulationList leads={openLeads} />
        </div>
      </main>
    </div>
  );
}
