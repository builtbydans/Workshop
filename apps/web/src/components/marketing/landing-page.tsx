import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Clock3,
  CommandIcon,
  MapPin,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    title: "Servicing & MOT",
    description:
      "Manufacturer-schedule servicing, MOT preparation, and health checks for everyday drivers.",
    icon: ShieldCheck,
  },
  {
    title: "Diagnostics & Repair",
    description:
      "Fault finding, brake work, suspension, clutches, and complex mechanical repairs.",
    icon: Wrench,
  },
  {
    title: "Fleet & Repeat Customers",
    description:
      "Job history, vehicle records, and workshop progress tracked from enquiry to collection.",
    icon: CarFront,
  },
];

const stats = [
  { label: "Established", value: "2018" },
  { label: "Workshop bays", value: "12" },
  { label: "Technicians", value: "4" },
  { label: "Avg. turnaround", value: "2.4 days" },
];

export function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <CommandIcon className="size-4" />
            </div>
            Northside Motor Co.
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/technician/login">Technician</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Staff login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-primary)/0.12,transparent)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-sm text-accent-foreground">
                <MapPin className="size-4 text-primary" />
                Independent garage · Manchester
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Workshop operations,{" "}
                  <span className="text-primary">built the way</span> a real
                  garage runs.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
                  Northside Motor Co. is a fictional workshop used to demo
                  Workshop — a garage management system covering enquiries,
                  quoting, job tracking, invoicing, and technician workflows.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/login">
                    Staff login
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/technician/login">Technician clock-in</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Portfolio demo application. Data and workflows are illustrative.
              </p>
            </div>

            <Card className="border-primary/15 bg-gradient-to-br from-primary/8 via-card to-accent/40 shadow-md">
              <CardHeader>
                <CardTitle>Today in the workshop</CardTitle>
                <CardDescription>
                  Sample operational snapshot from the demo dataset.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-lg border border-primary/10 bg-background/80 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-medium text-primary">
                      {stat.value}
                    </span>
                  </div>
                ))}
                <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-medium text-primary">
                    <Clock3 className="size-4" />
                    Open now
                  </div>
                  <span className="text-muted-foreground">
                    Mon–Fri 8:00–18:00 · Sat 8:30–13:00
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-primary/10 bg-accent/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="border-primary/10 bg-background shadow-sm transition-colors hover:border-primary/25"
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-accent/30 px-6 py-10 text-center sm:px-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              See the full workshop workflow
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Log in to manage customers, vehicles, jobs, quotes, invoices, and
              technician activity across the complete customer journey.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/login">Open staff dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 bg-accent/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-medium text-primary">Northside Motor Co.</span>{" "}
            · Workshop demo
          </p>
          <p>14 Foundry Lane, Manchester, M1 4AB</p>
        </div>
      </footer>
    </div>
  );
}
