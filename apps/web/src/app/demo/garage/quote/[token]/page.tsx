import Link from "next/link";

import { CustomerQuotePanel } from "@/components/demo/garage/CustomerQuotePanel";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function CustomerQuotePage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 garage-hero-glow opacity-60"
      />

      <header className="relative border-b border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            className="garage-display text-lg font-semibold tracking-[0.08em] text-[var(--garage-offwhite)] sm:text-xl"
            href="/demo/garage"
          >
            Northside Motor Co.
          </Link>
          <p className="text-sm text-[var(--garage-ink-muted)]">
            Customer quotation
          </p>
        </div>
      </header>

      <main className="relative">
        <CustomerQuotePanel token={token} />
      </main>
    </div>
  );
}
