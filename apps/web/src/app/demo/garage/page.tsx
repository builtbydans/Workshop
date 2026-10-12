import Link from "next/link";
import {
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { EnquiryForm } from "@/components/demo/garage/EnquiryForm";

const services = [
  {
    title: "Servicing & MOT",
    copy: "Manufacturer-schedule servicing, MOT preparation, and health checks for everyday drivers.",
    icon: ShieldCheck,
  },
  {
    title: "Diagnostics & Repair",
    copy: "Fault finding, brakes, suspension, clutches, and complex mechanical work.",
    icon: Wrench,
  },
  {
    title: "Same-week turnaround",
    copy: "Transparent quoting and progress updates from enquiry through to collection.",
    icon: Clock3,
  },
];

export default function DemoGaragePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 garage-hero-glow opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(196,92,38,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_90%_10%,rgba(154,175,192,0.12),transparent_50%)]"
      />

      <header className="relative border-b border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="garage-display text-lg font-semibold tracking-[0.08em] text-[var(--garage-offwhite)] sm:text-xl">
            Northside Motor Co.
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[var(--garage-ink-muted)] md:flex">
            <a className="hover:text-[var(--garage-offwhite)]" href="#services">
              Services
            </a>
            <a className="hover:text-[var(--garage-offwhite)]" href="#quote">
              Get a quote
            </a>
            <a className="hover:text-[var(--garage-offwhite)]" href="#visit">
              Visit us
            </a>
          </nav>
          <a
            className="rounded-md border border-[var(--garage-line)] px-3 py-1.5 text-sm text-[var(--garage-offwhite)] transition hover:border-[var(--garage-accent)] hover:text-white"
            href="#quote"
          >
            Book enquiry
          </a>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-20">
          <div className="garage-animate-rise space-y-6">
            <p className="inline-flex items-center gap-2 text-sm tracking-wide text-[var(--garage-accent)] uppercase">
              <MapPin className="size-4" aria-hidden />
              Independent garage · Manchester
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[0.95] text-[var(--garage-offwhite)] text-balance sm:text-5xl lg:text-6xl">
              Precision care for the cars that keep you moving.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-[var(--garage-ink-muted)] sm:text-lg">
              From routine servicing to complex diagnostics, Northside Motor Co.
              delivers honest quotations and workshop craftsmanship you can trust.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                className="inline-flex items-center justify-center rounded-md bg-[var(--garage-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--garage-accent-hover)]"
                href="#quote"
              >
                Request a quotation
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-md border border-[var(--garage-line)] px-4 py-2.5 text-sm text-[var(--garage-offwhite)] transition hover:border-[var(--garage-accent)]"
                href="tel:+441612345678"
              >
                <Phone className="size-4" aria-hidden />
                0161 234 5678
              </a>
            </div>
          </div>

          <aside className="garage-animate-rise-delay relative overflow-hidden rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-steel)_85%,black)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(160deg,rgba(244,246,248,0.08),transparent_45%),url('/placeholder.svg')] bg-cover bg-center opacity-30 mix-blend-luminosity"
            />
            <div className="relative space-y-4">
              <p className="garage-display text-sm tracking-[0.18em] text-[var(--garage-accent)]">
                Workshop hours
              </p>
              <dl className="space-y-2 text-sm text-[var(--garage-ink-muted)]">
                <div className="flex justify-between gap-4 border-b border-[var(--garage-line)] pb-2">
                  <dt>Mon – Fri</dt>
                  <dd className="text-[var(--garage-offwhite)]">08:00 – 18:00</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[var(--garage-line)] pb-2">
                  <dt>Saturday</dt>
                  <dd className="text-[var(--garage-offwhite)]">08:30 – 13:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Sunday</dt>
                  <dd className="text-[var(--garage-offwhite)]">Closed</dd>
                </div>
              </dl>
              <p className="pt-2 text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                Drop-offs welcome. Courtesy cars available subject to booking.
              </p>
            </div>
          </aside>
        </section>

        <section
          className="border-y border-[var(--garage-line)] bg-[var(--garage-navy)]"
          id="services"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="space-y-3">
                <service.icon
                  className="size-6 text-[var(--garage-accent)]"
                  aria-hidden
                />
                <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                  {service.title}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--garage-ink-muted)]">
                  {service.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16" id="quote">
          <div className="garage-animate-fade grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              <p className="garage-display text-sm tracking-[0.18em] text-[var(--garage-accent)]">
                Repair quotation
              </p>
              <h2 className="text-3xl font-semibold text-[var(--garage-offwhite)] sm:text-4xl">
                Tell us about the vehicle.
              </h2>
              <p className="max-w-md text-[var(--garage-ink-muted)]">
                Submit an enquiry and our advisors will prepare a quotation.
                This is a demonstration page — submissions appear in Workshop as
                new leads.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--garage-line)] bg-[color-mix(in_srgb,var(--garage-navy)_92%,white)] p-5 sm:p-7">
              <EnquiryForm />
            </div>
          </div>
        </section>

        <section
          className="border-t border-[var(--garage-line)] bg-[var(--garage-navy)]"
          id="visit"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--garage-offwhite)]">
                Visit the workshop
              </h2>
              <p className="mt-1 text-sm text-[var(--garage-ink-muted)]">
                Unit 4, Trafford Park Road · Manchester · M17 1PQ
              </p>
            </div>
            <p className="text-sm text-[var(--garage-ink-muted)]">
              Demo site for{" "}
              <Link
                className="text-[var(--garage-offwhite)] underline-offset-4 hover:underline"
                href="/"
              >
                Workshop
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
