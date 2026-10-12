"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Wrench,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JOB_STATUS } from "@/constants/job-status";
import { cn } from "@/lib/utils";
import type { JobSummaryDto } from "@/types/job.types";
import { formatRelativeDate } from "@/utils/date";
import { formatRegistration } from "@/utils/formatRegistration";

import {
  getJobBookingAt,
  getJobsBoardCounters,
  groupJobsForBoard,
} from "./job-board-groups";

interface JobsBoardProps {
  jobs: JobSummaryDto[];
}

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: JOB_STATUS.BOOKED, label: "Booked" },
  { value: JOB_STATUS.IN_PROGRESS, label: "In Progress" },
  { value: JOB_STATUS.READY_FOR_COLLECTION, label: "Ready for collection" },
  { value: JOB_STATUS.INVOICED, label: "Invoiced" },
  { value: JOB_STATUS.COMPLETED, label: "Completed" },
] as const;

function formatBookingLabel(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function technicianName(job: JobSummaryDto) {
  if (!job.assigned_technician) return null;
  return `${job.assigned_technician.first_name} ${job.assigned_technician.last_name}`;
}

function JobRow({ job }: { job: JobSummaryDto }) {
  const bookingAt = getJobBookingAt(job);
  const technician = technicianName(job);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "grid gap-2 border-b px-3 py-2.5 transition-colors last:border-b-0",
        "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
        "sm:grid-cols-[7rem_minmax(0,1.4fr)_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-3",
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-medium tabular-nums">{job.job_number}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-semibold tracking-wide">
          {formatRegistration(job.vehicles.registration)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {job.vehicles.make} {job.vehicles.model}
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm">{job.job_type || "Workshop job"}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={job.status} />
        {job.openRaise && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3" />
            Raised
          </span>
        )}
      </div>

      <div className="min-w-0 text-sm text-muted-foreground">
        {bookingAt ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5 shrink-0" />
            <span className="truncate">{formatBookingLabel(bookingAt)}</span>
          </span>
        ) : (
          <span suppressHydrationWarning className="truncate">
            Updated {formatRelativeDate(job.updated_at)}
          </span>
        )}
      </div>

      <div className="min-w-0 text-sm text-muted-foreground sm:text-right">
        <span className="truncate">
          {technician ?? "Unassigned"}
        </span>
      </div>
    </Link>
  );
}

function SummaryCounter({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "attention";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-3",
        tone === "attention" && value > 0
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
          : "bg-card",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-2xl font-semibold tabular-nums",
          tone === "attention" && value > 0
            ? "text-amber-800 dark:text-amber-200"
            : undefined,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function JobsBoard({ jobs }: JobsBoardProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredJobs = useMemo(
    () =>
      statusFilter === "ALL"
        ? jobs
        : jobs.filter((job) => job.status === statusFilter),
    [jobs, statusFilter],
  );

  const sections = useMemo(
    () => groupJobsForBoard(filteredJobs),
    [filteredJobs],
  );

  const counters = useMemo(
    () => getJobsBoardCounters(jobs),
    [jobs],
  );

  const defaultOpen = sections
    .filter((section) => section.defaultOpen)
    .map((section) => section.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCounter label="Today's jobs" value={counters.todaysJobs} />
        <SummaryCounter label="In progress" value={counters.inProgress} />
        <SummaryCounter
          label="Needs attention"
          value={counters.needsAttention}
          tone="attention"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Accordion
        className="rounded-xl border"
        defaultValue={defaultOpen}
        type="multiple"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            className="border-b px-4 last:border-b-0"
            value={section.id}
          >
            <AccordionTrigger className="hover:no-underline">
              <span className="flex w-full items-center justify-between gap-3 pr-2">
                <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                  <span className="text-base font-semibold">{section.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {section.description}
                  </span>
                </span>
                <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums">
                  {section.jobs.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {section.jobs.length === 0 ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 text-sm text-muted-foreground">
                  <Wrench className="size-4" />
                  No jobs in this section.
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <div className="hidden border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[7rem_minmax(0,1.4fr)_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
                    <span>Job</span>
                    <span>Vehicle</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span>Booking / activity</span>
                    <span className="text-right">Technician</span>
                  </div>
                  {section.jobs.map((job) => (
                    <JobRow key={job.id} job={job} />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
